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

  React.useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    },
    []
  )

  return { scrollRef, handleMessageScroll }
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
    />
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
  renderActions,
  emptyState,
  className,
  children,
  onScroll,
  ...props
}: MessageListProps) {
  const { scrollRef, handleMessageScroll } = useChatAutoScroll(messages)
  const lastIndex = messages.length - 1

  const stableEdit = useStableCallback(onEditMessage)
  const stableAskAnswer = useStableCallback(onAskAnswer)

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
      <div className="mx-auto flex min-h-full w-full max-w-3xl min-w-0 flex-col">
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
                <div key={message.id} data-slot="message-list-item">
                  <MessageListRow
                    message={message}
                    isStreaming={isStreaming}
                    openAsk={openAsk}
                    patternHandlers={patternHandlers}
                    onEditMessage={onEditMessage ? stableEdit : undefined}
                    onAskAnswer={onAskAnswer ? stableAskAnswer : undefined}
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
            })}
        {children}
      </div>
    </div>
  )
}
