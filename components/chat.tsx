"use client"

import * as React from "react"

import { ChatInput } from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  { label: "What can you help me with?" },
  { label: "Summarize the last conversation" },
]

export type ChatProps = React.ComponentProps<"div">

/**
 * Starter chat layout. Wire `onSend` to your API and append assistant
 * messages when they stream in. Sidebar, navbar, and pickers are installed
 * as siblings — compose them around this block.
 */
export function Chat({ className, ...props }: ChatProps) {
  const [messages, setMessages] = React.useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const isEmpty = messages.length === 0

  const send = React.useCallback((text: string) => {
    const value = text.trim()
    if (!value) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: value, sender: "user" },
    ])
    setIsGenerating(true)
  }, [])

  const stop = React.useCallback(() => setIsGenerating(false), [])

  return (
    <div
      data-slot="chat"
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden bg-background",
        isEmpty && "justify-center",
        className
      )}
      {...props}
    >
      {isEmpty ? (
        <p className="mx-auto mb-5 w-full max-w-4xl px-4 text-center text-xl font-medium tracking-tight text-balance text-foreground sm:px-8 sm:text-2xl">
          How can I help?
        </p>
      ) : (
        <MessageList messages={messages} isGenerating={isGenerating} />
      )}

      <div className="w-full">
        <ChatInput
          className={isEmpty ? "pb-1 sm:pb-1" : undefined}
          isGenerating={isGenerating}
          onStop={stop}
          onSend={({ text }) => send(text)}
        />
        {isEmpty ? (
          <PromptSuggestions
            items={SUGGESTIONS}
            onSelect={(item) => send(item.label)}
          />
        ) : null}
      </div>
    </div>
  )
}
