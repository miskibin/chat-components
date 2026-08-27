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
import { useState } from "react"
import ReactMarkdown from "react-markdown"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

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
  /** Seconds of thinking to show in the trigger label. */
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
      className={cn("lc-reveal mb-3", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Brain className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1">{label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="mt-3 border-l-2 pl-3 text-[13.5px] leading-relaxed text-muted-foreground prose prose-sm prose-neutral dark:prose-invert max-w-none"
          style={{ borderColor: "var(--border)" }}
        >
          <ReactMarkdown>{children}</ReactMarkdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function toolFrameColor(status: NonNullable<MessageToolCallData["status"]>) {
  if (status === "error") return "var(--destructive)"
  if (status === "running" || status === "pending") return "var(--primary)"
  return "var(--primary)"
}

function toolStatusVerb(status: NonNullable<MessageToolCallData["status"]>) {
  if (status === "running" || status === "pending") return "Calling"
  if (status === "error") return "Failed"
  return "Called"
}

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
  const frame = toolFrameColor(status)
  const running = status === "running" || status === "pending"
  const errored = status === "error"

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("lc-reveal my-1 mb-2 overflow-hidden rounded-lg", className)}
      style={{
        border: `1px solid ${frame}`,
        background: "transparent",
      }}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left"
          style={{
            background: "transparent",
            border: 0,
            borderBottom: open ? `1px solid ${frame}` : 0,
            color: "var(--ink)",
          }}
        >
          <span
            className="inline-flex shrink-0"
            style={{
              color: errored
                ? "var(--destructive)"
                : running
                  ? "var(--primary)"
                  : "var(--accent-ink)",
            }}
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : errored ? (
              <TriangleAlert className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </span>
          <span className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            {toolStatusVerb(status)}
          </span>
          <code
            className="font-medium"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              color: errored ? "var(--destructive)" : "var(--accent-ink)",
            }}
          >
            {tool.name}
          </code>
          <ChevronDown
            className={cn(
              "ml-auto h-3.5 w-3.5 shrink-0 transition-transform",
              open && "rotate-180"
            )}
            style={{ color: "var(--ink-3)" }}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div style={{ background: "var(--surface)" }}>
          {tool.input ? (
            <div className="px-2.5 pt-2 pb-2">
              <div
                className="mb-1.5 uppercase"
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: ".04em",
                }}
              >
                Arguments
              </div>
              <pre
                className="m-0 overflow-x-auto rounded-lg px-2.5 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap break-words"
                style={{
                  background: "var(--bg-soft)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--border)",
                }}
              >
                {tool.input}
              </pre>
            </div>
          ) : null}
          {tool.output ? (
            <div className="px-2.5 pt-2 pb-2.5">
              <div
                className="mb-1.5 uppercase"
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: ".04em",
                }}
              >
                Result
              </div>
              <pre
                className="m-0 overflow-x-auto rounded-lg px-2.5 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap break-words"
                style={{
                  background: "var(--bg-soft)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--border)",
                }}
              >
                {tool.output}
              </pre>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
  const label = block.title ?? block.language ?? "code"

  return (
    <div
      className={cn("lc-reveal my-3 overflow-hidden rounded-xl", className)}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3.5 py-1.5"
        style={{
          background: "var(--bg-soft)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="truncate text-[12.5px] font-medium"
          style={{
            color: "var(--ink-2)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] transition"
          style={{
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto px-3.5 py-3 text-[12.5px] leading-relaxed"
        style={{
          background: "var(--code-bg)",
          color: "var(--code-ink)",
          fontFamily: "var(--font-mono)",
          margin: 0,
        }}
      >
        <code>{block.code}</code>
      </pre>
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
      className={cn("lc-reveal my-3 overflow-hidden rounded-xl", className)}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <button
        type="button"
        onClick={artifact.onOpen}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:opacity-90"
        style={{
          background: "var(--bg-soft)",
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
            style={{ color: "var(--ink)" }}
          >
            {artifact.title}
          </div>
          {meta ? (
            <div
              className="mt-0.5 truncate text-[11.5px]"
              style={{ color: "var(--ink-3)" }}
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
            background: "var(--code-bg)",
            color: "var(--code-ink)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {artifact.content}
        </div>
      ) : null}
    </div>
  )
}
