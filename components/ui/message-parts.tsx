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
import * as React from "react"

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

/** Shared look for the quiet, text-only disclosure rows. */
const disclosureTrigger =
  "inline-flex max-w-full items-center gap-1.5 rounded-sm py-0.5 text-left text-[13px] leading-snug text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0"

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
  const [open, setOpen] = React.useState(defaultOpen)
  const label =
    duration == null
      ? "Thought for a few seconds"
      : `Thought for ${duration} seconds`

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="message-reasoning"
      className={cn("mb-2 animate-in fade-in duration-150", className)}
    >
      <CollapsibleTrigger asChild>
        <button type="button" className={disclosureTrigger}>
          <Brain className="size-3.5 opacity-70" />
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 opacity-50 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 border-l pl-3 text-[13px] leading-relaxed text-muted-foreground">
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
  if (
    kind.includes("grep") ||
    kind.includes("search") ||
    kind.includes("glob")
  ) {
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
export const MessageToolCall = React.memo(function MessageToolCall({
  tool,
  defaultOpen = false,
  className,
}: {
  tool: MessageToolCallData
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const status = tool.status ?? "done"
  const running = status === "running" || status === "pending"
  const errored = status === "error"
  const hasBody = !!(tool.input || tool.output)
  const headline = toolHeadline(tool)
  const inlineOutput =
    !open &&
    tool.output &&
    tool.output.length < 28 &&
    !tool.output.includes("\n")
      ? tool.output
      : null

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="message-tool-call"
      data-status={status}
      className={cn("group animate-in fade-in duration-150", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          disabled={!hasBody}
          className={cn(
            disclosureTrigger,
            "py-[3px]",
            hasBody ? "cursor-pointer" : "cursor-default hover:text-muted-foreground"
          )}
        >
          {running ? (
            <Loader2 className="size-3 animate-spin opacity-70" />
          ) : errored ? (
            <TriangleAlert className="size-3 text-destructive" />
          ) : null}
          <span className="shrink-0">{headline.label}</span>
          {headline.detail ? (
            <span
              className={cn(
                "min-w-0 truncate font-mono text-[12px] font-medium",
                errored ? "text-destructive" : "text-foreground/90"
              )}
              title={headline.detail}
            >
              {headline.detail}
            </span>
          ) : null}
          {inlineOutput ? (
            <span
              className={cn(
                "shrink-0 text-[12px]",
                inlineOutput.startsWith("+")
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              {inlineOutput}
            </span>
          ) : null}
          {hasBody ? (
            <ChevronDown
              className={cn(
                "size-3 opacity-0 transition-[opacity,transform] duration-150 group-hover:opacity-40",
                open && "rotate-180 opacity-40"
              )}
            />
          ) : null}
        </button>
      </CollapsibleTrigger>
      {hasBody ? (
        <CollapsibleContent>
          <div className="mb-1.5 ml-0.5 space-y-1.5 border-l pl-3">
            {tool.input ? (
              <pre className="m-0 overflow-x-auto py-1 font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground">
                {tool.input}
              </pre>
            ) : null}
            {tool.output ? (
              <pre className="m-0 overflow-x-auto py-1 font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground">
                {tool.output}
              </pre>
            ) : null}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
})

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
  const [open, setOpen] = React.useState(defaultOpen ?? !many)

  if (tools.length === 0) return null

  const list = (
    <div className="flex flex-col">
      {tools.map((tool) => (
        <MessageToolCall key={tool.id} tool={tool} />
      ))}
    </div>
  )

  if (!many) {
    return (
      <div data-slot="message-tool-calls" className={cn("mb-3", className)}>
        {list}
      </div>
    )
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="message-tool-calls"
      className={cn("mb-3 animate-in fade-in duration-150", className)}
    >
      <CollapsibleTrigger asChild>
        <button type="button" className={cn(disclosureTrigger, "w-full")}>
          <span>
            Used {tools.length} tool{tools.length === 1 ? "" : "s"}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 opacity-50 transition-transform duration-150",
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

/**
 * Shiki is loaded once per page (module-level singleton) and every rendered
 * snippet is cached, so re-renders and remounts never re-run the highlighter.
 */
let shikiModule: Promise<typeof import("shiki")> | null = null
const highlightCache = new Map<string, string>()
const HIGHLIGHT_CACHE_MAX = 100

function loadShiki() {
  shikiModule ??= import("shiki")
  return shikiModule
}

async function highlight(code: string, lang: string, theme: string) {
  const key = `${theme} ${lang} ${code}`
  const cached = highlightCache.get(key)
  if (cached !== undefined) return cached
  const { codeToHtml } = await loadShiki()
  const html = await codeToHtml(code, { lang, theme })
  if (highlightCache.size >= HIGHLIGHT_CACHE_MAX) {
    const oldest = highlightCache.keys().next().value
    if (oldest !== undefined) highlightCache.delete(oldest)
  }
  highlightCache.set(key, html)
  return html
}

function HighlightedCode({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  const { resolvedTheme } = useTheme()
  const lang = normalizeLang(language)
  const theme = resolvedTheme === "dark" ? "github-dark" : "github-light"
  // Paint straight from cache when we have it — no flash of unhighlighted code.
  const [html, setHtml] = React.useState<string | null>(
    () => highlightCache.get(`${theme} ${lang} ${code}`) ?? null
  )

  React.useEffect(() => {
    let cancelled = false
    highlight(code, lang, theme)
      .then((out) => {
        if (!cancelled) setHtml(out)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang, theme])

  if (!html) {
    return (
      <pre className="m-0 overflow-x-auto bg-muted px-3.5 py-3 font-mono text-[12.5px] leading-[1.55] text-foreground">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="lc-code-shiki overflow-x-auto bg-muted text-[12.5px] leading-[1.55] [&_code]:font-mono [&_pre]:m-0 [&_pre]:px-3.5 [&_pre]:py-3 [&_pre]:!bg-transparent"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export const MessageCode = React.memo(function MessageCode({
  block,
  className,
}: {
  block: MessageCodeBlockData
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const copy = React.useCallback(() => {
    void navigator.clipboard
      .writeText(block.code)
      .then(() => setCopied(true))
      .catch(() => {})
  }, [block.code])

  React.useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1200)
    return () => window.clearTimeout(id)
  }, [copied])

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
      data-slot="message-code"
      className={cn(
        "my-3 overflow-hidden rounded-lg border bg-muted animate-in fade-in duration-150",
        className
      )}
    >
      <div className="flex h-8 items-center gap-2 border-b px-2.5">
        <span className="rounded-sm border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {langLabel}
        </span>
        {block.title ? (
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-muted-foreground">
            {block.title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={copy}
          title={copied ? "Copied" : "Copy"}
          aria-label={copied ? "Copied" : "Copy code"}
          className="inline-grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3.5"
        >
          {copied ? <Check /> : <Copy />}
        </button>
      </div>
      <HighlightedCode code={block.code} language={block.language} />
    </div>
  )
})

function ArtifactIcon({ kind }: { kind?: string }) {
  return kind === "table" ? (
    <Table2 className="size-4" />
  ) : (
    <FileText className="size-4" />
  )
}

export const MessageArtifact = React.memo(function MessageArtifact({
  artifact,
  className,
}: {
  artifact: MessageArtifactData
  className?: string
}) {
  const meta = [artifact.kind, artifact.summary].filter(Boolean).join(" · ")
  const interactive = !!artifact.onOpen

  return (
    <div
      data-slot="message-artifact"
      className={cn(
        "my-3 overflow-hidden rounded-lg border bg-card animate-in fade-in duration-150",
        className
      )}
    >
      <button
        type="button"
        onClick={artifact.onOpen}
        disabled={!interactive}
        className={cn(
          "flex w-full items-center gap-2.5 bg-muted px-3.5 py-2 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
          interactive ? "cursor-pointer hover:bg-accent" : "cursor-default",
          artifact.content && "border-b"
        )}
      >
        <span className="inline-flex shrink-0 text-primary">
          <ArtifactIcon kind={artifact.kind} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {artifact.title}
          </span>
          {meta ? (
            <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
              {meta}
            </span>
          ) : null}
        </span>
      </button>
      {artifact.content ? (
        <div className="max-h-[min(14rem,40vh)] overflow-auto bg-muted px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed break-words whitespace-pre-wrap text-foreground">
          {artifact.content}
        </div>
      ) : null}
    </div>
  )
})
