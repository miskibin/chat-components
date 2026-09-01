"use client"

import { Pencil, Save, Undo2 } from "lucide-react"
import * as React from "react"

import {
  MessageArtifact,
  MessageAttachments,
  MessageCode,
  MessageProcess,
  MessageReasoning,
  MessageToolCall,
  MessageToolCalls,
  type MessageArtifactData,
  type MessageAttachmentData,
  type MessageCodeBlockData,
  type MessageToolCallData,
} from "@/components/ui/message-parts"
import {
  isOpenAskTool,
  isPendingAskTool,
  type AskQuestionResult,
} from "@/components/ui/ask-question"
import {
  ChangeSummary,
  fileChangesFromTools,
  type ChangeSummaryFile,
} from "@/components/ui/change-summary"
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
  | { type: "thinking"; id: string; text: string }
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
  /** Chronological thinking / text / tool segments. When set, replaces the tools-then-content layout. */
  parts?: MessagePart[]
  codeBlocks?: MessageCodeBlockData[]
  artifacts?: MessageArtifactData[]
  /** Files attached to a user turn — images render as thumbnails. */
  attachments?: MessageAttachmentData[]
  /** True while this assistant message is still streaming. */
  isAnimating?: boolean
  /** Called when an Ask Question tool on this turn is submitted or skipped. */
  onAskAnswer?: (toolId: string, result: AskQuestionResult) => void
  /**
   * Elapsed seconds — labels the “Worked for 12s” row the thinking and tool
   * parts collapse into once the turn settles.
   */
  workedFor?: number
  /** Explicit file-change card. When omitted, Edit / Write tools are summarised. */
  changes?: ChangeSummaryFile[]
  onReviewChanges?: () => void
  /**
   * Opt in to clickable Edit / Write / Read headlines — the row reports the
   * whole tool so the owner can open it in a file panel.
   */
  onOpenFile?: (tool: MessageToolCallData) => void
  /** Makes each row of the change-summary card clickable. */
  onChangeFileClick?: (file: ChangeSummaryFile) => void
  /**
   * Makes the file references inside the answer's markdown clickable — the
   * path arrives without its `:line` suffix. Keep it stable: an unstable
   * handler re-renders every markdown block on every streamed token.
   */
  onFileReferenceClick?: (path: string) => void
}

const THINK_TAG_REGEX = /<think>([\s\S]*?)<\/think>/i
const USER_PREVIEW_MAX_WORDS = 80

const EMPTY_ACTIONS: ActionButton[] = []
const EMPTY_TOOLS: MessageToolCallData[] = []
const EMPTY_CODE_BLOCKS: MessageCodeBlockData[] = []
const EMPTY_ARTIFACTS: MessageArtifactData[] = []
const EMPTY_ATTACHMENTS: MessageAttachmentData[] = []
const EMPTY_PATTERNS: PatternHandler[] = []
const EMPTY_CHANGES: ChangeSummaryFile[] = []

/** Small square icon button used for edit / save / custom message actions. */
const messageActionButton =
  "inline-grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5"

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

/**
 * Memoized: in a streaming list only the message whose props actually change
 * re-renders. Keep the callbacks you pass in stable to benefit from it.
 */
export const Message = React.memo(function Message({
  content,
  sender,
  actionButtons = EMPTY_ACTIONS,
  editable = false,
  onEdit,
  patternHandlers = EMPTY_PATTERNS,
  className,
  contentClassName,
  reasoning: reasoningProp,
  reasoningDefaultOpen = false,
  reasoningDuration,
  tools = EMPTY_TOOLS,
  parts,
  codeBlocks = EMPTY_CODE_BLOCKS,
  artifacts = EMPTY_ARTIFACTS,
  attachments = EMPTY_ATTACHMENTS,
  isAnimating = false,
  onAskAnswer,
  workedFor,
  changes,
  onReviewChanges,
  onOpenFile,
  onChangeFileClick,
  onFileReferenceClick,
}: MessageProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedContent, setEditedContent] = React.useState(content)
  const [longPromptExpanded, setLongPromptExpanded] = React.useState(false)

  const { reasoning, displayContent } = React.useMemo(() => {
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

  const { insideButtons, outsideButtons } = React.useMemo(
    () => ({
      insideButtons: actionButtons.filter((btn) => btn.position !== "outside"),
      outsideButtons: actionButtons.filter((btn) => btn.position === "outside"),
    }),
    [actionButtons]
  )

  const cancelEdit = React.useCallback(() => {
    setIsEditing(false)
    setEditedContent(content)
  }, [content])

  const saveEdit = React.useCallback(() => {
    setIsEditing(false)
    if (onEdit && editedContent !== content) onEdit(editedContent)
  }, [content, editedContent, onEdit])

  /** Scanned once per render instead of once per thinking part. */
  const lastThinkingIndex = React.useMemo(
    () => parts?.findLastIndex((part) => part.type === "thinking") ?? -1,
    [parts]
  )

  /**
   * Everything up to and including the last thinking / tool part is the
   * turn's process; whatever trails it is the answer. One scan, so a turn
   * that streams a hundred parts still costs one pass per render.
   */
  const processEnd = React.useMemo(
    () =>
      parts?.findLastIndex(
        (part) => part.type === "tool" || part.type === "thinking"
      ) ?? -1,
    [parts]
  )

  const hasProcess = React.useMemo(() => {
    if (!parts) return tools.length > 0
    return parts
      .slice(0, processEnd + 1)
      .some(
        (part) =>
          part.type === "tool" || (part.type === "thinking" && !!part.text)
      )
  }, [parts, processEnd, tools])

  /**
   * An ask nobody has answered yet must stay reachable, so the group is held
   * open — collapsing the turn would hide the form the user is meant to fill.
   */
  const hasOpenAsk = React.useMemo(() => {
    const list =
      parts
        ?.filter(
          (part): part is Extract<MessagePart, { type: "tool" }> =>
            part.type === "tool"
        )
        .map((part) => part.tool) ?? tools
    return list.some(
      (tool) =>
        isPendingAskTool(tool) || (!!onAskAnswer && isOpenAskTool(tool))
    )
  }, [onAskAnswer, parts, tools])

  const derivedChanges = React.useMemo(() => {
    if (changes) return changes
    // Only rendered once the turn settles, so parsing every streamed diff on
    // the way there is pure waste.
    if (isAnimating) return EMPTY_CHANGES
    const fromParts =
      parts
        ?.filter(
          (part): part is Extract<MessagePart, { type: "tool" }> =>
            part.type === "tool"
        )
        .map((part) => part.tool) ?? []
    return fileChangesFromTools(fromParts.length > 0 ? fromParts : tools)
  }, [changes, isAnimating, parts, tools])

  if (sender === "user") {
    if (isEditing) {
      return (
        <div
          data-slot="message"
          data-sender="user"
          data-editing="true"
          className={cn("mb-4 flex w-full justify-end", className)}
        >
          <div className="w-full max-w-[85%] rounded-xl border bg-muted px-3.5 py-2.5 transition-colors focus-within:border-ring sm:max-w-[70%] sm:px-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  saveEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelEdit()
                }
              }}
              rows={3}
              autoFocus
              aria-label="Edit message"
              className="w-full resize-none border-0 bg-transparent text-base leading-relaxed text-foreground outline-none sm:text-[15px]"
            />
            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                title="Cancel (Esc)"
                onClick={cancelEdit}
                className={cn(messageActionButton, "hover:bg-background")}
              >
                <Undo2 />
              </button>
              <button
                type="button"
                title="Save (⌘↵)"
                onClick={saveEdit}
                className={cn(
                  messageActionButton,
                  "text-primary hover:bg-background hover:text-primary"
                )}
              >
                <Save />
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
        data-slot="message"
        data-sender="user"
        className={cn(
          "group mb-4 flex w-full min-w-0 flex-col items-end gap-1",
          className
        )}
      >
        {attachments.length > 0 ? (
          <MessageAttachments attachments={attachments} />
        ) : null}
        <div className="flex w-full min-w-0 items-center justify-end gap-1">
          {editable && onEdit && (
            <button
              type="button"
              title="Edit message"
              onClick={() => setIsEditing(true)}
              className={cn(
                messageActionButton,
                "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
              )}
            >
              <Pencil />
            </button>
          )}
          {displayContent ? (
            <div
              data-slot="message-content"
              className={cn(
                "max-w-[85%] min-w-0 rounded-xl bg-muted px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground sm:max-w-[70%] sm:px-4",
                contentClassName
              )}
            >
              {remainder && !longPromptExpanded ? preview : displayContent}
              {remainder ? (
                <button
                  type="button"
                  className="mt-2 block rounded-sm py-0.5 text-left text-[13px] font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-expanded={longPromptExpanded}
                  onClick={() => setLongPromptExpanded((v) => !v)}
                >
                  {longPromptExpanded ? "Show less" : "Show more"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const legacyReasoning =
    reasoning && !parts?.some((part) => part.type === "thinking") ? (
      <MessageReasoning
        key="reasoning"
        defaultOpen={reasoningDefaultOpen}
        duration={reasoningDuration}
        streaming={isAnimating}
      >
        {reasoning}
      </MessageReasoning>
    ) : null

  const partNodes = parts?.map((part, index) => {
    if (part.type === "tool") {
      // onAskAnswer is forwarded as-is: MessageToolCall reports its
      // own id, so a stable handler keeps every row memoized.
      return (
        <MessageToolCall
          key={part.id}
          tool={part.tool}
          onAskAnswer={onAskAnswer}
          onOpenFile={onOpenFile}
        />
      )
    }
    if (part.type === "thinking") {
      if (!part.text) return null
      const isLatestThinking = index === lastThinkingIndex
      return (
        <MessageReasoning
          key={part.id}
          defaultOpen={reasoningDefaultOpen}
          streaming={isAnimating && isLatestThinking}
        >
          {part.text}
        </MessageReasoning>
      )
    }
    return part.text ? (
      <MessageMarkdown
        key={part.id}
        isAnimating={isAnimating}
        patternHandlers={patternHandlers}
        onFileClick={onFileReferenceClick}
      >
        {part.text}
      </MessageMarkdown>
    ) : null
  })

  /* Same shape either way: the process above, the answer below. The legacy
     `tools` array is one stack, already expanded — the group around it is
     the collapse. */
  const process = partNodes
    ? partNodes.slice(0, processEnd + 1)
    : tools.length > 0
      ? [
          <MessageToolCalls
            key="tools"
            tools={tools}
            defaultOpen
            onAskAnswer={onAskAnswer}
            onOpenFile={onOpenFile}
          />,
        ]
      : []
  const answer = partNodes
    ? partNodes.slice(processEnd + 1)
    : displayContent
      ? [
          <MessageMarkdown
            key="content"
            isAnimating={isAnimating}
            patternHandlers={patternHandlers}
            onFileClick={onFileReferenceClick}
          >
            {displayContent}
          </MessageMarkdown>,
        ]
      : []

  return (
    <div
      data-slot="message"
      data-sender="assistant"
      className={cn("group mb-7", className)}
    >
      <div
        data-slot="message-content"
        className={cn(
          "min-w-0 max-w-full text-[15px] leading-[1.65] text-foreground",
          contentClassName
        )}
      >
        {hasProcess || legacyReasoning ? (
          <MessageProcess
            streaming={isAnimating || hasOpenAsk}
            seconds={workedFor}
          >
            {legacyReasoning}
            {process}
          </MessageProcess>
        ) : null}
        {answer}

        {codeBlocks.map((block, i) => (
          <MessageCode key={`${block.language ?? "code"}-${i}`} block={block} />
        ))}

        {artifacts.map((artifact) => (
          <MessageArtifact key={artifact.id} artifact={artifact} />
        ))}

        {!isAnimating && derivedChanges.length > 0 ? (
          <div
            data-slot="message-turn-summary"
            className="mt-3 flex flex-col items-start gap-2.5"
          >
            <ChangeSummary
              files={derivedChanges}
              onAction={onReviewChanges}
              onFileClick={onChangeFileClick}
            />
          </div>
        ) : null}

        {insideButtons.length > 0 ||
        outsideButtons.length > 0 ||
        (editable && onEdit) ? (
          <div
            data-slot="message-actions"
            className="mt-2 flex flex-wrap items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
          >
            {[...insideButtons, ...outsideButtons].map((button) => (
              <button
                key={button.id}
                type="button"
                title={button.title}
                onClick={button.onClick}
                className={cn(messageActionButton, button.className)}
              >
                {button.icon}
              </button>
            ))}
            {editable && onEdit && (
              <button
                type="button"
                title="Edit message"
                onClick={() => setIsEditing(true)}
                className={messageActionButton}
              >
                <Pencil />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
})

export type {
  MessageArtifactData,
  MessageAttachmentData,
  MessageCodeBlockData,
  MessageToolCallData,
} from "@/components/ui/message-parts"
export type { ChangeSummaryFile } from "@/components/ui/change-summary"
export type { AskQuestionResult } from "@/components/ui/ask-question"
export { ChangeSummary, WorkedFor } from "@/components/ui/change-summary"
export {
  MessageArtifact,
  MessageAttachments,
  MessageCode,
  MessageProcess,
  MessageReasoning,
  MessageToolCall,
  MessageToolCalls,
} from "@/components/ui/message-parts"
export {
  AskQuestion,
  isAskToolName,
  isOpenAskTool,
  isPendingAskTool,
  parseAskQuestionInput,
} from "@/components/ui/ask-question"
