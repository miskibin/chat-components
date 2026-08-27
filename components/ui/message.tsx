"use client"

import { Brain, ChevronDown, Pencil, Save, Undo2 } from "lucide-react"
import * as React from "react"
import { useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

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

export type MessageProps = {
  content: string
  sender: "user" | "assistant"
  actionButtons?: ActionButton[]
  editable?: boolean
  onEdit?: (content: string) => void
  patternHandlers?: PatternHandler[]
  className?: string
  contentClassName?: string
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
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [showReasoning, setShowReasoning] = useState(false)
  const [longPromptExpanded, setLongPromptExpanded] = useState(false)

  const { reasoning, displayContent } = useMemo(() => {
    const match = THINK_TAG_REGEX.exec(content)
    if (!match) return { reasoning: null, displayContent: content }
    return {
      reasoning: match[1].trim(),
      displayContent: content.replace(THINK_TAG_REGEX, "").trim(),
    }
  }, [content])

  React.useEffect(() => {
    setEditedContent(content)
  }, [content])

  const processContent = React.useCallback(
    (text: string): React.ReactNode => {
      if (!text || patternHandlers.length === 0) return text
      const segments: React.ReactNode[] = []
      let cursor = 0
      while (cursor < text.length) {
        let earliest: {
          handler: PatternHandler
          match: RegExpExecArray
          index: number
        } | null = null
        for (const handler of patternHandlers) {
          handler.pattern.lastIndex = cursor
          const match = handler.pattern.exec(text)
          if (match && (!earliest || match.index < earliest.index)) {
            earliest = { handler, match, index: match.index }
          }
        }
        if (!earliest) {
          segments.push(text.slice(cursor))
          break
        }
        if (earliest.index > cursor) {
          segments.push(text.slice(cursor, earliest.index))
        }
        let rendered: React.ReactNode
        try {
          rendered = earliest.handler.render(earliest.match) ?? earliest.match[0]
        } catch {
          rendered = earliest.match[0]
        }
        segments.push(
          <React.Fragment key={`${earliest.index}-${cursor}`}>
            {rendered}
          </React.Fragment>
        )
        cursor = earliest.index + earliest.match[0].length
      }
      return <>{segments}</>
    },
    [patternHandlers]
  )

  const markdownComponents = useMemo(() => {
    if (patternHandlers.length === 0) return undefined
    const processChildren = (children: React.ReactNode) => {
      if (Array.isArray(children)) {
        return children.map((c, index) =>
          typeof c === "string" ? (
            <React.Fragment key={index}>{processContent(c)}</React.Fragment>
          ) : (
            <React.Fragment key={index}>{c}</React.Fragment>
          )
        )
      }
      return typeof children === "string" ? processContent(children) : children
    }
    return {
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-3 last:mb-0">{processChildren(children)}</p>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li>{processChildren(children)}</li>
      ),
    }
  }, [patternHandlers, processContent])

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
          <div className="w-full max-w-[70%] rounded-[18px] border border-border bg-muted px-4 py-2.5">
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
            "max-w-[70%] min-w-0 rounded-[18px] bg-muted px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground",
            contentClassName
          )}
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
    <div className={cn("group mb-4", className)}>
      <div
        className={cn(
          "max-w-full text-[15px] leading-relaxed text-foreground",
          contentClassName
        )}
      >
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-3 prose-headings:mb-2 prose-headings:mt-4 prose-pre:rounded-lg">
          <ReactMarkdown components={markdownComponents}>
            {displayContent || ""}
          </ReactMarkdown>
        </div>

        {reasoning && (
          <Collapsible open={showReasoning} onOpenChange={setShowReasoning}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="mt-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Brain className="h-3.5 w-3.5" />
                Model reasoning
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    showReasoning && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground prose prose-sm prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown>{reasoning}</ReactMarkdown>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

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
