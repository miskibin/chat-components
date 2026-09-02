"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  GenerationStatus,
  type GenerationStage,
} from "@/components/ui/generation-status"
import {
  Message,
  isOpenAskTool,
  isPendingAskTool,
  type ChangeSummaryFile,
  type MessageArtifactData,
  type MessageAttachmentData,
  type MessageCodeBlockData,
  type MessagePart,
  type MessageToolCallData,
  type PatternHandler,
  type AskQuestionResult,
} from "@/components/ui/message"

const BOTTOM_SCROLL_THRESHOLD_PX = 48
const EMPTY_PATTERNS: PatternHandler[] = []
const OFFSCREEN_ITEM_STYLE: React.CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "auto 160px",
}

export type ChatMessageData = {
  id: string
  content: string
  sender: "user" | "assistant"
  reasoning?: string | null
  reasoningDuration?: number
  reasoningDefaultOpen?: boolean
  tools?: MessageToolCallData[]
  parts?: MessagePart[]
  codeBlocks?: MessageCodeBlockData[]
  artifacts?: MessageArtifactData[]
  attachments?: MessageAttachmentData[]
  workedFor?: number
  changes?: ChangeSummaryFile[]
}

export type MessageListProps = React.ComponentProps<"div"> & {
  messages: ChatMessageData[]
  isGenerating?: boolean
  generationStage?: GenerationStage
  /**
   * Overrides the stage's own word in the waiting indicator — for a backend
   * that can say something more useful than "Thinking" ("Loading qwen3:8b into
   * memory", "Waiting for the first token").
   */
  generationLabel?: string
  patternHandlers?: PatternHandler[]
  onEditMessage?: (id: string, content: string) => void
  onAskAnswer?: (
    messageId: string,
    toolId: string,
    result: AskQuestionResult
  ) => void
  /** Makes the Review label on a turn's change card a button. */
  onReviewChanges?: (messageId: string) => void
  /** Clicking an Edit / Write / Read headline — open it in a file panel. */
  onOpenFile?: (messageId: string, tool: MessageToolCallData) => void
  /** Clicking a row of a turn's change-summary card. */
  onChangeFileClick?: (messageId: string, file: ChangeSummaryFile) => void
  /** Clicking a file reference inside an answer's markdown. */
  onFileReferenceClick?: (messageId: string, path: string) => void
  /**
   * Turns a path a tool names into a URL the page can load — forwarded to
   * every row so an image the agent wrote or read renders as a picture.
   */
  resolveFileUrl?: (path: string) => string | undefined
  renderActions?: (message: ChatMessageData) => React.ReactNode
  emptyState?: React.ReactNode
}

/**
 * Keeps a callback prop at one identity for the lifetime of the list, so a
 * parent that re-renders on every streamed token does not invalidate the
 * memoized rows underneath it.
 */
function useStableCallback<A extends unknown[], R>(
  callback: ((...args: A) => R) | undefined
) {
  const ref = React.useRef(callback)
  React.useEffect(() => {
    ref.current = callback
  })
  return React.useCallback((...args: A) => ref.current?.(...args), [])
}

export function useChatAutoScroll(messages: ReadonlyArray<unknown>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const autoScrollRef = React.useRef(true)
  const programmaticScrollUntilRef = React.useRef(0)
  const prevMessageCountRef = React.useRef(0)
  const frameRef = React.useRef(0)

  const handleMessageScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <=
      BOTTOM_SCROLL_THRESHOLD_PX
    if (nearBottom) {
      autoScrollRef.current = true
      return
    }
    if (Date.now() > programmaticScrollUntilRef.current) {
      autoScrollRef.current = false
    }
  }, [])

  /**
   * Streaming turns re-run this every token. Coalescing to one frame — and
   * jumping rather than smooth-scrolling while text is still arriving — keeps
   * the browser from queueing a fresh animated scroll per chunk.
   */
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const prev = prevMessageCountRef.current
    const curr = messages.length
    prevMessageCountRef.current = curr
    const isInitialOrJump = prev === 0 || curr - prev > 1
    if (!autoScrollRef.current && !isInitialOrJump) return
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const node = scrollRef.current
      if (!node) return
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight
      if (distance <= 1) return
      programmaticScrollUntilRef.current = Date.now() + 500
      node.scrollTo({
        top: node.scrollHeight,
        // Smooth only when a single new message arrives. The first paint and
        // multi-message jumps stay instant — animating the height of a whole
        // transcript outruns the 500ms window above and reads as the user
        // scrolling away, which switches following off.
        behavior: isInitialOrJump || curr === prev ? "auto" : "smooth",
      })
    })
  }, [messages])

  /**
   * The effect above fires on new *messages*. Plenty of height arrives after
   * the last one: a mermaid diagram mounting, Shiki replacing a plain block, an
   * image loading, a font swapping in. Each of those leaves a follower parked a
   * screenful short of the bottom — visibly so under a floating composer, where
   * the shortfall reads as the last turn hiding behind it.
   *
   * So the content box is watched too, and while the reader is still following
   * the run, a growth spurt re-pins them. Instantly, never smoothly: this is a
   * layout correction, not a navigation, and animating it would outlast the
   * window below that tells a programmatic scroll from the reader's own.
   */
  React.useEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      if (!autoScrollRef.current) return
      const node = scrollRef.current
      if (!node) return
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight
      if (distance <= 1) return
      programmaticScrollUntilRef.current = Date.now() + 500
      node.scrollTo({ top: node.scrollHeight, behavior: "auto" })
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  React.useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    },
    []
  )

  return { scrollRef, contentRef, handleMessageScroll }
}

function hasAskTool(
  message: ChatMessageData,
  match: (tool: MessageToolCallData) => boolean
) {
  return Boolean(
    message.tools?.some(match) ||
      message.parts?.some((part) => part.type === "tool" && match(part.tool))
  )
}

/**
 * Memoized: the per-row closures live inside this boundary, so a re-render of
 * the list only reaches the rows whose message object actually changed. Every
 * prop here is safe to freeze — `renderActions` is a render prop and stays
 * outside, in the list, where it re-runs with the caller's current closure.
 */
const MessageListRow = React.memo(function MessageListRow({
  message,
  isStreaming,
  openAsk,
  patternHandlers,
  onEditMessage,
  onAskAnswer,
  onReviewChanges,
  onOpenFile,
  onChangeFileClick,
  onFileReferenceClick,
  resolveFileUrl,
}: {
  message: ChatMessageData
  isStreaming: boolean
  openAsk: boolean
  patternHandlers: PatternHandler[]
  onEditMessage?: (id: string, content: string) => void
  onAskAnswer?: (
    messageId: string,
    toolId: string,
    result: AskQuestionResult
  ) => void
  onReviewChanges?: (messageId: string) => void
  onOpenFile?: (messageId: string, tool: MessageToolCallData) => void
  onChangeFileClick?: (messageId: string, file: ChangeSummaryFile) => void
  onFileReferenceClick?: (messageId: string, path: string) => void
  resolveFileUrl?: (path: string) => string | undefined
}) {
  const isUser = message.sender === "user"

  const handleEdit = React.useCallback(
    (content: string) => onEditMessage?.(message.id, content),
    [message.id, onEditMessage]
  )
  const handleAskAnswer = React.useCallback(
    (toolId: string, result: AskQuestionResult) =>
      onAskAnswer?.(message.id, toolId, result),
    [message.id, onAskAnswer]
  )
  const handleReviewChanges = React.useCallback(
    () => onReviewChanges?.(message.id),
    [message.id, onReviewChanges]
  )
  const handleOpenFile = React.useCallback(
    (tool: MessageToolCallData) => onOpenFile?.(message.id, tool),
    [message.id, onOpenFile]
  )
  const handleChangeFileClick = React.useCallback(
    (file: ChangeSummaryFile) => onChangeFileClick?.(message.id, file),
    [message.id, onChangeFileClick]
  )
  const handleFileReferenceClick = React.useCallback(
    (path: string) => onFileReferenceClick?.(message.id, path),
    [message.id, onFileReferenceClick]
  )

  return (
    <Message
      content={message.content}
      sender={message.sender}
      reasoning={message.reasoning}
      reasoningDuration={message.reasoningDuration}
      reasoningDefaultOpen={message.reasoningDefaultOpen}
      tools={message.tools}
      parts={message.parts}
      codeBlocks={message.codeBlocks}
      artifacts={message.artifacts}
      attachments={message.attachments}
      workedFor={message.workedFor}
      changes={message.changes}
      patternHandlers={patternHandlers}
      isAnimating={isStreaming}
      editable={isUser && !!onEditMessage}
      onEdit={isUser && onEditMessage ? handleEdit : undefined}
      /* Only the row that is actually asking takes a callback, so every other
         memoized Message keeps its render while the turn streams. */
      onAskAnswer={openAsk && onAskAnswer ? handleAskAnswer : undefined}
      onReviewChanges={onReviewChanges ? handleReviewChanges : undefined}
      onOpenFile={onOpenFile ? handleOpenFile : undefined}
      onChangeFileClick={onChangeFileClick ? handleChangeFileClick : undefined}
      onFileReferenceClick={
        onFileReferenceClick ? handleFileReferenceClick : undefined
      }
      resolveFileUrl={resolveFileUrl}
    />
  )
})

/**
 * Owns the whole turn, including caller-provided actions. Keeping that work
 * inside the memo boundary matters on long transcripts: a streamed token only
 * rebuilds the live turn instead of recreating actions under every settled row.
 */
const MessageListItem = React.memo(function MessageListItem({
  message,
  isStreaming,
  openAsk,
  waiting,
  generationStage,
  generationLabel,
  patternHandlers,
  onEditMessage,
  onAskAnswer,
  onReviewChanges,
  onOpenFile,
  onChangeFileClick,
  onFileReferenceClick,
  resolveFileUrl,
  renderActions,
}: {
  message: ChatMessageData
  isStreaming: boolean
  openAsk: boolean
  waiting: boolean
  generationStage: GenerationStage
  generationLabel?: string
  patternHandlers: PatternHandler[]
  onEditMessage?: (id: string, content: string) => void
  onAskAnswer?: (
    messageId: string,
    toolId: string,
    result: AskQuestionResult
  ) => void
  onReviewChanges?: (messageId: string) => void
  onOpenFile?: (messageId: string, tool: MessageToolCallData) => void
  onChangeFileClick?: (messageId: string, file: ChangeSummaryFile) => void
  onFileReferenceClick?: (messageId: string, path: string) => void
  resolveFileUrl?: (path: string) => string | undefined
  renderActions?: (message: ChatMessageData) => React.ReactNode
}) {
  return (
    <div
      data-slot="message-list-item"
      // Find-in-page and accessibility retain the DOM, while the browser can
      // skip layout and paint work for distant transcript rows.
      style={OFFSCREEN_ITEM_STYLE}
    >
      <MessageListRow
        message={message}
        isStreaming={isStreaming}
        openAsk={openAsk}
        patternHandlers={patternHandlers}
        onEditMessage={onEditMessage}
        onAskAnswer={onAskAnswer}
        onReviewChanges={onReviewChanges}
        onOpenFile={onOpenFile}
        onChangeFileClick={onChangeFileClick}
        onFileReferenceClick={onFileReferenceClick}
        resolveFileUrl={resolveFileUrl}
      />
      {waiting ? (
        <div className="mb-4">
          <GenerationStatus
            active
            stage={generationStage}
            label={generationLabel}
          />
        </div>
      ) : isStreaming || openAsk ? null : (
        renderActions?.(message)
      )}
    </div>
  )
})

export function MessageList({
  messages,
  isGenerating = false,
  generationStage = "idle",
  generationLabel,
  patternHandlers = EMPTY_PATTERNS,
  onEditMessage,
  onAskAnswer,
  onReviewChanges,
  onOpenFile,
  onChangeFileClick,
  onFileReferenceClick,
  resolveFileUrl,
  renderActions,
  emptyState,
  className,
  children,
  onScroll,
  ...props
}: MessageListProps) {
  const { scrollRef, contentRef, handleMessageScroll } = useChatAutoScroll(messages)
  const lastIndex = messages.length - 1

  const stableEdit = useStableCallback(onEditMessage)
  const stableAskAnswer = useStableCallback(onAskAnswer)
  const stableRenderActions = useStableCallback(renderActions)
  const stableReviewChanges = useStableCallback(onReviewChanges)
  const stableOpenFile = useStableCallback(onOpenFile)
  const stableChangeFileClick = useStableCallback(onChangeFileClick)
  const stableFileReferenceClick = useStableCallback(onFileReferenceClick)
  // Rows are memoized: a host that builds this resolver inline would otherwise
  // re-render every row on every streamed token.
  const stableResolveFileUrl = useStableCallback(resolveFileUrl)

  return (
    <div
      ref={scrollRef}
      data-slot="message-list"
      onScroll={(event) => {
        onScroll?.(event)
        handleMessageScroll()
      }}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div
        ref={contentRef}
        className="mx-auto flex min-h-full w-full max-w-3xl min-w-0 flex-col"
      >
        {messages.length === 0
          ? (emptyState ?? <div className="flex flex-1 items-center justify-center" />)
          : messages.map((message, index) => {
              const isLast = index === lastIndex
              const isStreaming =
                (isGenerating || generationStage !== "idle") &&
                isLast &&
                message.sender === "assistant"
              /* An ask in flight is always live. One the agent closed without
                 answers is the user's to pick up only on the latest turn —
                 further back it is history, not a prompt. */
              const openAsk =
                hasAskTool(message, isPendingAskTool) ||
                (isLast && hasAskTool(message, isOpenAskTool))
              const waiting =
                isStreaming &&
                !message.reasoning &&
                !message.content?.trim() &&
                !message.tools?.length &&
                !message.parts?.length

              return (
                <MessageListItem
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming}
                  openAsk={openAsk}
                  waiting={waiting}
                  generationStage={generationStage}
                  generationLabel={generationLabel}
                  patternHandlers={patternHandlers}
                  onEditMessage={onEditMessage ? stableEdit : undefined}
                  onAskAnswer={onAskAnswer ? stableAskAnswer : undefined}
                  onReviewChanges={
                    onReviewChanges ? stableReviewChanges : undefined
                  }
                  onOpenFile={onOpenFile ? stableOpenFile : undefined}
                  onChangeFileClick={
                    onChangeFileClick ? stableChangeFileClick : undefined
                  }
                  onFileReferenceClick={
                    onFileReferenceClick ? stableFileReferenceClick : undefined
                  }
                  resolveFileUrl={resolveFileUrl ? stableResolveFileUrl : undefined}
                  renderActions={renderActions ? stableRenderActions : undefined}
                />
              )
            })}
        {children}
      </div>
    </div>
  )
}
