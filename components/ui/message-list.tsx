"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  GenerationStatus,
  type GenerationStage,
} from "@/components/ui/generation-status"
import {
  Message,
  type MessageArtifactData,
  type MessageCodeBlockData,
  type MessagePart,
  type MessageToolCallData,
  type PatternHandler,
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
}

export type MessageListProps = React.ComponentProps<"div"> & {
  messages: ChatMessageData[]
  isGenerating?: boolean
  generationStage?: GenerationStage
  patternHandlers?: PatternHandler[]
  onEditMessage?: (id: string, content: string) => void
  renderActions?: (message: ChatMessageData) => React.ReactNode
  emptyState?: React.ReactNode
}

export function useChatAutoScroll(messages: ReadonlyArray<unknown>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const autoScrollRef = React.useRef(true)
  const programmaticScrollUntilRef = React.useRef(0)
  const prevMessageCountRef = React.useRef(0)

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

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const prev = prevMessageCountRef.current
    const curr = messages.length
    prevMessageCountRef.current = curr
    const isInitialOrJump = prev === 0 || curr - prev > 1
    if (!autoScrollRef.current && !isInitialOrJump) return
    programmaticScrollUntilRef.current = Date.now() + 500
    el.scrollTo({
      top: el.scrollHeight,
      behavior: isInitialOrJump ? "auto" : "smooth",
    })
  }, [messages])

  return { scrollRef, handleMessageScroll }
}

/**
 * Per-message edit callbacks that keep a stable identity, so `Message`
 * (memoized) only re-renders when the message itself changes.
 */
function useStableEditHandlers(
  onEditMessage?: (id: string, content: string) => void
) {
  const latest = React.useRef(onEditMessage)
  latest.current = onEditMessage
  const cache = React.useRef(new Map<string, (content: string) => void>())

  return React.useCallback(
    (id: string) => {
      if (!onEditMessage) return undefined
      const existing = cache.current.get(id)
      if (existing) return existing
      const handler = (content: string) => latest.current?.(id, content)
      cache.current.set(id, handler)
      return handler
    },
    [onEditMessage]
  )
}

export function MessageList({
  messages,
  isGenerating = false,
  generationStage = "idle",
  patternHandlers = EMPTY_PATTERNS,
  onEditMessage,
  renderActions,
  emptyState,
  className,
  children,
  onScroll,
  ...props
}: MessageListProps) {
  const { scrollRef, handleMessageScroll } = useChatAutoScroll(messages)
  const getEditHandler = useStableEditHandlers(onEditMessage)
  const lastIndex = messages.length - 1

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
              const isStreaming =
                (isGenerating || generationStage !== "idle") &&
                index === lastIndex &&
                message.sender === "assistant"
              const waiting =
                isStreaming &&
                !message.reasoning &&
                !message.content?.trim() &&
                !message.tools?.length &&
                !message.parts?.length

              return (
                <div key={message.id} data-slot="message-list-item">
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
                    patternHandlers={patternHandlers}
                    isAnimating={isStreaming}
                    editable={message.sender === "user" && !!onEditMessage}
                    onEdit={getEditHandler(message.id)}
                  />
                  {waiting ? (
                    <div className="mb-4">
                      <GenerationStatus active stage={generationStage} />
                    </div>
                  ) : isStreaming ? null : (
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
