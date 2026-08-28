"use client"

import {
  Brain,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Loader2,
  Table2,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { MessageMarkdown } from "@/components/ui/message-markdown"

export type MessageToolCallData = {
  id: string
  name: string
  status?: "pending" | "running" | "done" | "error"
  input?: string
  output?: string
}

export type MessageCodeBlockData = {
  language?: string
  code: string
  title?: string
}

export type MessageArtifactData = {
  id: string
  title: string
  kind?: "file" | "table" | "chart" | "text" | string
  summary?: string
  content?: string
  onOpen?: () => void
}

export function MessageReasoning({
  children,
  defaultOpen = false,
  duration,
  className,
}: {
  children: string
  defaultOpen?: boolean
  duration?: number
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const label =
    duration == null
      ? "Thought for a few seconds"
      : `Thought for ${duration} seconds`

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("animate-in fade-in duration-150 mb-2", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-full items-center gap-1 py-0.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Brain className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="mt-2 border-l pl-3 text-[13px] leading-relaxed text-muted-foreground"
          style={{ borderColor: "var(--border)" }}
        >
          <MessageMarkdown>{children}</MessageMarkdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function parseToolArgs(input?: string): Record<string, unknown> {
  if (!input?.trim()) return {}
  try {
    const value = JSON.parse(input) as unknown
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  } catch {
    /* raw string */
  }
  return {}
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined
}

function fileName(path: string) {
  const trimmed = path.replace(/[\\/]+$/, "")
  return trimmed.split(/[\\/]/).pop() || path
}

function clip(text: string, max = 48) {
  const oneLine = text.replace(/\s+/g, " ").trim()
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1)}…`
}

function toolHeadline(tool: MessageToolCallData) {
  const args = parseToolArgs(tool.input)
  const kind = tool.name.replace(/\s+/g, "").toLowerCase()
  const running = tool.status === "running" || tool.status === "pending"
  const failed = tool.status === "error"
  const path =
    asString(args.path) ??
    asString(args.filePath) ??
    asString(args.target_file) ??
    asString(args.file)
  const command =
    asString(args.command) ?? asString(args.cmd) ?? asString(args.script)
  const query =
    asString(args.query) ??
    asString(args.pattern) ??
    asString(args.glob) ??
    asString(args.search)

  if (kind.includes("shell") || kind === "bash" || kind === "command") {
    return {
      label: failed
        ? "Command failed"
        : running
          ? "Running command"
          : "Ran command",
      detail: command ? clip(command) : undefined,
    }
  }
  if (kind.includes("read")) {
    return {
      label: failed ? "Couldn’t read" : running ? "Reading file" : "Read file",
      detail: path ? fileName(path) : undefined,
    }
  }
  if (kind.includes("write") || kind.includes("createfile")) {
    return {
      label: failed ? "Couldn’t write" : running ? "Writing file" : "Wrote file",
      detail: path ? fileName(path) : undefined,
    }
  }
  if (
    kind.includes("edit") ||
    kind.includes("applypatch") ||
    kind.includes("searchreplace")
  ) {
    return {
      label: failed ? "Couldn’t edit" : running ? "Editing file" : "Edited file",
      detail: path ? fileName(path) : undefined,
    }
  }
  if (kind.includes("grep") || kind.includes("search") || kind.includes("glob")) {
    return {
      label: failed
        ? "Search failed"
        : running
          ? "Searching files"
          : "Searched files",
      detail: query ? clip(query, 40) : path ? fileName(path) : undefined,
    }
  }
  if (kind.includes("delete") || kind.includes("remove")) {
    return {
      label: failed ? "Couldn’t delete" : running ? "Deleting" : "Deleted",
      detail: path ? fileName(path) : undefined,
    }
  }
  if (kind.includes("list") || kind === "ls" || kind.includes("dir")) {
    return {
      label: failed
        ? "Couldn’t list files"
        : running
          ? "Listing files"
          : "Listed files",
      detail: path ? fileName(path) : undefined,
    }
  }
  return {
    label: failed ? "Failed" : running ? "Working" : "Done",
    detail: tool.name,
  }
}

/** Single Cursor-style tool row — no card chrome. */
export function MessageToolCall({
  tool,
  defaultOpen = false,
  className,
}: {
  tool: MessageToolCallData
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const status = tool.status ?? "done"
  const running = status === "running" || status === "pending"
  const errored = status === "error"
  const hasBody = !!(tool.input || tool.output)

  const headline = toolHeadline(tool)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("animate-in fade-in duration-150 group", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          disabled={!hasBody}
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 py-[3px] text-left text-[13px] leading-snug",
            hasBody
              ? "cursor-pointer text-muted-foreground hover:text-foreground"
              : "cursor-default text-muted-foreground"
          )}
        >
          {running ? (
            <Loader2 className="h-3 w-3 shrink-0 animate-spin opacity-70" />
          ) : errored ? (
            <TriangleAlert className="h-3 w-3 shrink-0 text-destructive" />
          ) : null}
          <span className="shrink-0">{headline.label}</span>
          {headline.detail ? (
            <span
              className="min-w-0 truncate font-medium"
              style={{
                color: errored ? "var(--destructive)" : "var(--foreground)",
                opacity: 0.88,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              title={headline.detail}
            >
              {headline.detail}
            </span>
          ) : null}
          {!open &&
          tool.output &&
          tool.output.length < 28 &&
          !tool.output.includes("\n") ? (
            <span
              className="shrink-0 text-[12px]"
              style={{
                color: tool.output.startsWith("+")
                  ? "oklch(0.62 0.15 155)"
                  : "var(--muted-foreground)",
              }}
            >
              {tool.output}
            </span>
          ) : null}
          {hasBody ? (
            <ChevronDown
              className={cn(
                "h-3 w-3 shrink-0 opacity-0 transition group-hover:opacity-40",
                open && "rotate-180 opacity-40"
              )}
            />
          ) : null}
        </button>
      </CollapsibleTrigger>
      {hasBody ? (
        <CollapsibleContent>
          <div className="mb-1.5 ml-0.5 space-y-1.5 border-l pl-3" style={{ borderColor: "var(--border)" }}>
            {tool.input ? (
              <pre
                className="m-0 overflow-x-auto py-1 text-[12px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {tool.input}
              </pre>
            ) : null}
            {tool.output ? (
              <pre
                className="m-0 overflow-x-auto py-1 text-[12px] leading-relaxed whitespace-pre-wrap break-words"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted-foreground)",
                }}
              >
                {tool.output}
              </pre>
            ) : null}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}

/** Stack of minimal tool rows; collapses behind “Used N tools” when many. */
export function MessageToolCalls({
  tools,
  className,
  collapseAt = 3,
  defaultOpen,
}: {
  tools: MessageToolCallData[]
  className?: string
  /** Collapse the list behind a summary when tool count ≥ this. */
  collapseAt?: number
  defaultOpen?: boolean
}) {
  const many = tools.length >= collapseAt
  const [open, setOpen] = useState(defaultOpen ?? !many)

  if (tools.length === 0) return null

  const list = (
    <div className="flex flex-col">
      {tools.map((tool) => (
        <MessageToolCall key={tool.id} tool={tool} />
      ))}
    </div>
  )

  if (!many) {
    return <div className={cn("mb-3", className)}>{list}</div>
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("animate-in fade-in duration-150 mb-3", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 py-0.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>
            Used {tools.length} tool{tools.length === 1 ? "" : "s"}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>{list}</CollapsibleContent>
    </Collapsible>
  )
}

const SHIKI_LANGS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "typescript",
  "javascript",
  "json",
  "python",
  "py",
  "bash",
  "shell",
  "sh",
  "css",
  "html",
  "md",
  "markdown",
  "sql",
  "yaml",
  "yml",
  "toml",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "text",
  "plaintext",
])

function normalizeLang(lang?: string) {
  if (!lang) return "text"
  const l = lang.toLowerCase().trim()
  if (l === "typescript") return "ts"
  if (l === "javascript") return "js"
  if (l === "python") return "py"
  if (l === "shell" || l === "zsh") return "bash"
  return SHIKI_LANGS.has(l) ? l : "text"
}

function HighlightedCode({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState<string | null>(null)
  const lang = normalizeLang(language)

  useEffect(() => {
    let cancelled = false
    const theme = resolvedTheme === "dark" ? "github-dark" : "github-light"
    void codeToHtml(code, { lang, theme })
      .then((out) => {
        if (!cancelled) setHtml(out)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang, resolvedTheme])

  if (!html) {
    return (
      <pre
        className="m-0 overflow-x-auto px-3.5 py-3 text-[12.5px] leading-[1.55]"
        style={{
          background: "var(--muted)",
          color: "var(--foreground)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="lc-code-shiki overflow-x-auto text-[12.5px] leading-[1.55] [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:px-3.5 [&_pre]:py-3 [&_code]:font-mono"
      style={{ background: "var(--muted)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function MessageCode({
  block,
  className,
}: {
  block: MessageCodeBlockData
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }
  const langLabel = (block.language ?? "text").toLowerCase()
  if (langLabel === "mermaid") {
    return (
      <div className={cn("my-3", className)}>
        <MessageMarkdown>{`\`\`\`mermaid\n${block.code}\n\`\`\``}</MessageMarkdown>
      </div>
    )
  }

  return (
    <div
      className={cn("animate-in fade-in duration-150 my-3 overflow-hidden rounded-lg", className)}
      style={{
        border: "1px solid var(--border)",
        background: "var(--muted)",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--muted)",
        }}
      >
        <span
          className="rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
          style={{
            color: "var(--muted-foreground)",
            background: "var(--muted)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {langLabel}
        </span>
        {block.title ? (
          <span
            className="min-w-0 flex-1 truncate text-[12px]"
            style={{
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {block.title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <HighlightedCode code={block.code} language={block.language} />
    </div>
  )
}

function artifactIcon(kind?: string) {
  if (kind === "table") return <Table2 className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

export function MessageArtifact({
  artifact,
  className,
}: {
  artifact: MessageArtifactData
  className?: string
}) {
  const meta = [artifact.kind, artifact.summary].filter(Boolean).join(" · ")

  return (
    <div
      className={cn("animate-in fade-in duration-150 my-3 overflow-hidden rounded-xl", className)}
      style={{
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <button
        type="button"
        onClick={artifact.onOpen}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:opacity-90"
        style={{
          background: "var(--muted)",
          borderBottom: artifact.content ? "1px solid var(--border)" : undefined,
          cursor: artifact.onOpen ? "pointer" : "default",
        }}
      >
        <span
          className="inline-flex shrink-0"
          style={{ color: "var(--primary)" }}
        >
          {artifactIcon(artifact.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[13px] font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {artifact.title}
          </div>
          {meta ? (
            <div
              className="mt-0.5 truncate text-[11.5px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {meta}
            </div>
          ) : null}
        </div>
      </button>
      {artifact.content ? (
        <div
          className="max-h-[min(14rem,40vh)] overflow-auto px-3.5 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-wrap break-words"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {artifact.content}
        </div>
      ) : null}
    </div>
  )
}
