"use client"

import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  Table2,
  Wrench,
  XCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { useState, type ReactNode } from "react"
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
  className,
}: {
  children: string
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("mb-3", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-md"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--border)",
            }}
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                open && "rotate-180"
              )}
            />
          </span>
          Reasoning
          <span className="text-[11px] text-muted-foreground">
            {open ? "Hide" : "Show"}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="mt-2 rounded-lg p-3 text-[13px] leading-relaxed text-muted-foreground prose prose-sm prose-neutral dark:prose-invert max-w-none"
          style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
          }}
        >
          <ReactMarkdown>{children}</ReactMarkdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const toolStatusIcon: Record<
  NonNullable<MessageToolCallData["status"]>,
  ReactNode
> = {
  pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  running: <Clock className="h-3.5 w-3.5 animate-pulse text-primary" />,
  done: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  error: <XCircle className="h-3.5 w-3.5 text-destructive" />,
}

const toolStatusLabel: Record<
  NonNullable<MessageToolCallData["status"]>,
  string
> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  error: "Error",
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

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("mb-2 overflow-hidden rounded-lg", className)}
      style={{ border: "1px solid var(--border)" }}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px]"
          style={{ background: "var(--bg-soft)", color: "var(--ink)" }}
        >
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate font-medium">{tool.name}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            {toolStatusIcon[status]}
            {toolStatusLabel[status]}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 border-t border-border px-3 py-2">
          {tool.input ? (
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Input
              </div>
              <pre
                className="overflow-x-auto rounded-md p-2 text-[12px] leading-relaxed"
                style={{
                  background: "var(--muted)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tool.input}
              </pre>
            </div>
          ) : null}
          {tool.output ? (
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Output
              </div>
              <pre
                className="overflow-x-auto rounded-md p-2 text-[12px] leading-relaxed"
                style={{
                  background: "var(--muted)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
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

  return (
    <div
      className={cn("my-3 overflow-hidden rounded-lg", className)}
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5"
        style={{ background: "var(--bg-soft)" }}
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {block.title ?? block.language ?? "code"}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
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
        className="overflow-x-auto p-3 text-[13px] leading-relaxed"
        style={{
          background: "var(--muted)",
          color: "var(--ink)",
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
  return (
    <button
      type="button"
      onClick={artifact.onOpen}
      className={cn(
        "my-3 flex w-full items-start gap-3 rounded-xl p-3 text-left transition",
        className
      )}
      style={{
        background: "var(--bg-soft)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)"
      }}
    >
      <div
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg"
        style={{
          background: "var(--accent-soft)",
          color: "var(--primary)",
          border: "1px solid var(--border)",
        }}
      >
        {artifactIcon(artifact.kind)}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[13.5px] font-medium"
          style={{ color: "var(--ink)" }}
        >
          {artifact.title}
        </div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">
          {[artifact.kind, artifact.summary].filter(Boolean).join(" · ")}
        </div>
        {artifact.content ? (
          <pre
            className="mt-2 max-h-28 overflow-auto rounded-md p-2 text-[11px] leading-relaxed"
            style={{
              background: "var(--muted)",
              color: "var(--ink-2)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {artifact.content}
          </pre>
        ) : null}
      </div>
    </button>
  )
}
