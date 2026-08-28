"use client"

import { Pencil, Save, Undo2 } from "lucide-react"
import * as React from "react"
import { useMemo, useState } from "react"

import {
  MessageArtifact,
  MessageCode,
  MessageReasoning,
  MessageToolCall,
  MessageToolCalls,
  type MessageArtifactData,
  type MessageCodeBlockData,
  type MessageToolCallData,
} from "@/components/ui/message-parts"
import { cn } from "@/lib/utils"
import { MessageMarkdown } from "@/components/ui/message-markdown"

export type PatternHandler = {
  pattern: RegExp
  render: (match: RegExpExecArray) => React.ReactNode
}

export type ActionButton = {
  id: string
  icon: React.ReactNode
  onClick: () => void
  title?: string
  className?: string
  position?: "inside" | "outside"
}

export type MessagePart =
  | { type: "text"; id: string; text: string }
  | { type: "tool"; id: string; tool: MessageToolCallData }

export type MessageProps = {
  content: string
  sender: "user" | "assistant"
  actionButtons?: ActionButton[]
  editable?: boolean
  onEdit?: (content: string) => void
  patternHandlers?: PatternHandler[]
  className?: string
  contentClassName?: string
  /** Explicit reasoning (overrides `<think>` parse when set). */
  reasoning?: string | null
  reasoningDefaultOpen?: boolean
  /** Shown as “Thought for N seconds” when set. */
  reasoningDuration?: number
  tools?: MessageToolCallData[]
  /** Chronological text/tool segments. When set, replaces the tools-then-content layout. */
  parts?: MessagePart[]
  codeBlocks?: MessageCodeBlockData[]
  artifacts?: MessageArtifactData[]
  /** True while this assistant message is still streaming. */
  isAnimating?: boolean
}

const THINK_TAG_REGEX = /<think>([\s\S]*?)<\/think>/i
const USER_PREVIEW_MAX_WORDS = 80

function previewUserMessageText(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) {
    return { preview: text, remainder: "" }
  }
  return {
    preview: words.slice(0, maxWords).join(" ") + "…",
    remainder: words.slice(maxWords).join(" "),
  }
}

export function Message({
  content,
  sender,
  actionButtons = [],
  editable = false,
  onEdit,
  patternHandlers = [],
  className,
  contentClassName,
  reasoning: reasoningProp,
  reasoningDefaultOpen = false,
  reasoningDuration,
  tools = [],
  parts,
  codeBlocks = [],
  artifacts = [],
  isAnimating = false,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [longPromptExpanded, setLongPromptExpanded] = useState(false)

  const { reasoning, displayContent } = useMemo(() => {
    if (reasoningProp != null) {
      return { reasoning: reasoningProp || null, displayContent: content }
    }
    const match = THINK_TAG_REGEX.exec(content)
    if (!match) return { reasoning: null, displayContent: content }
    return {
      reasoning: match[1].trim(),
      displayContent: content.replace(THINK_TAG_REGEX, "").trim(),
    }
  }, [content, reasoningProp])

  React.useEffect(() => {
    setEditedContent(content)
  }, [content])

  const { insideButtons, outsideButtons } = useMemo(() => {
    const inside = actionButtons.filter((btn) => btn.position !== "outside")
    const outside = actionButtons.filter((btn) => btn.position === "outside")
    return { insideButtons: inside, outsideButtons: outside }
  }, [actionButtons])

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (onEdit && editedContent !== content) onEdit(editedContent)
  }

  if (sender === "user") {
    if (isEditing) {
      return (
        <div
          className={cn("mb-4 flex w-full justify-end", className)}
        >
          <div className="w-full max-w-[70%] rounded-2xl border border-border bg-muted px-4 py-2.5">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleSaveEdit()
                } else if (e.key === "Escape") {
                  setIsEditing(false)
                  setEditedContent(content)
                }
              }}
              rows={3}
              autoFocus
              className="w-full resize-none border-0 bg-transparent text-[15px] text-foreground outline-none"
            />
            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                title="Cancel"
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(content)
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Save"
                onClick={handleSaveEdit}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:bg-background"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    const { preview, remainder } = previewUserMessageText(
      displayContent,
      USER_PREVIEW_MAX_WORDS
    )

    return (
      <div
        className={cn(
          "group mb-4 flex min-w-0 w-full items-center justify-end gap-1",
          className
        )}
      >
        {editable && onEdit && (
          <button
            type="button"
            title="Edit message"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <div
          className={cn(
            "max-w-[70%] min-w-0 rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground",
            contentClassName
          )}
          style={{ background: "var(--muted)" }}
        >
          {remainder && !longPromptExpanded ? preview : displayContent}
          {remainder ? (
            <button
              type="button"
              className="mt-2 block w-full rounded-md py-1 text-left text-[13px] font-medium text-primary underline-offset-2 hover:underline"
              aria-expanded={longPromptExpanded}
              onClick={() => setLongPromptExpanded((v) => !v)}
            >
              {longPromptExpanded ? "Show less" : "Show more"}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("group mb-7", className)}>
      <div
        className={cn(
          "max-w-full text-[15px] leading-[1.65] text-foreground",
          contentClassName
        )}
      >
        {reasoning ? (
          <MessageReasoning
            defaultOpen={reasoningDefaultOpen}
            duration={reasoningDuration}
          >
            {reasoning}
          </MessageReasoning>
        ) : null}

        {parts && parts.length > 0 ? (
          parts.map((part) =>
            part.type === "tool" ? (
              <MessageToolCall key={part.id} tool={part.tool} />
            ) : part.text ? (
              <MessageMarkdown
                key={part.id}
                isAnimating={isAnimating}
                patternHandlers={patternHandlers}
              >
                {part.text}
              </MessageMarkdown>
            ) : null
          )
        ) : (
          <>
            {tools.length > 0 ? <MessageToolCalls tools={tools} /> : null}
            {displayContent ? (
              <MessageMarkdown
                isAnimating={isAnimating}
                patternHandlers={patternHandlers}
              >
                {displayContent}
              </MessageMarkdown>
            ) : null}
          </>
        )}

        {codeBlocks.map((block, i) => (
          <MessageCode key={`${block.language ?? "code"}-${i}`} block={block} />
        ))}

        {artifacts.map((artifact) => (
          <MessageArtifact key={artifact.id} artifact={artifact} />
        ))}

        {(insideButtons.length > 0 ||
          outsideButtons.length > 0 ||
          (editable && onEdit)) && (
          <div className="mt-2 flex flex-wrap items-center gap-1 opacity-0 transition group-hover:opacity-100">
            {[...insideButtons, ...outsideButtons].map((button) => (
              <button
                key={button.id}
                type="button"
                title={button.title}
                onClick={button.onClick}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                  button.className
                )}
              >
                {button.icon}
              </button>
            ))}
            {editable && onEdit && (
              <button
                type="button"
                title="Edit message"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type {
  MessageArtifactData,
  MessageCodeBlockData,
  MessageToolCallData,
} from "@/components/ui/message-parts"
export {
  MessageArtifact,
  MessageCode,
  MessageReasoning,
  MessageToolCall,
  MessageToolCalls,
} from "@/components/ui/message-parts"
