"use client"

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import {
  GenerationStatus,
  type GenerationStage,
} from "@/components/ui/generation-status"
import {
  Message,
  type MessageArtifactData,
  type MessageCodeBlockData,
  type MessageToolCallData,
  type PatternHandler,
} from "@/components/ui/message"

const BOTTOM_SCROLL_THRESHOLD_PX = 48

export type ChatMessageData = {
  id: string
  content: string
  sender: "user" | "assistant"
  reasoning?: string | null
  tools?: MessageToolCallData[]
  codeBlocks?: MessageCodeBlockData[]
  artifacts?: MessageArtifactData[]
}

export type MessageListProps = {
  messages: ChatMessageData[]
  isGenerating?: boolean
  generationStage?: GenerationStage
  patternHandlers?: PatternHandler[]
  onEditMessage?: (id: string, content: string) => void
  renderActions?: (message: ChatMessageData) => ReactNode
  emptyState?: ReactNode
  className?: string
  children?: ReactNode
}

export function useChatAutoScroll(messages: ReadonlyArray<unknown>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)
  const programmaticScrollUntilRef = useRef(0)
  const prevMessageCountRef = useRef(0)

  const isScrolledNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <=
    BOTTOM_SCROLL_THRESHOLD_PX

  const handleMessageScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (isScrolledNearBottom(el)) {
      autoScrollRef.current = true
      return
    }
    if (Date.now() > programmaticScrollUntilRef.current) {
      autoScrollRef.current = false
    }
  }

  useEffect(() => {
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

export function MessageList({
  messages,
  isGenerating = false,
  generationStage = "idle",
  patternHandlers = [],
  onEditMessage,
  renderActions,
  emptyState,
  className,
  children,
}: MessageListProps) {
  const { scrollRef, handleMessageScroll } = useChatAutoScroll(messages)

  return (
    <div
      ref={scrollRef}
      onScroll={handleMessageScroll}
      className={cn("flex-1 overflow-y-auto px-4 py-4", className)}
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
        {messages.length === 0 ? (
          emptyState ?? <div className="flex flex-1 items-center justify-center" />
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <Message
                content={message.content}
                sender={message.sender}
                reasoning={message.reasoning}
                tools={message.tools}
                codeBlocks={message.codeBlocks}
                artifacts={message.artifacts}
                patternHandlers={patternHandlers}
                editable={message.sender === "user" && !!onEditMessage}
                onEdit={
                  onEditMessage
                    ? (content) => onEditMessage(message.id, content)
                    : undefined
                }
              />
              {renderActions?.(message)}
            </div>
          ))
        )}
        {(isGenerating || generationStage !== "idle") && (
          <div className="mb-4">
            <GenerationStatus
              active={isGenerating || generationStage !== "idle"}
              stage={generationStage}
            />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
