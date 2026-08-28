"use client"

import { useState } from "react"

import { ChatInput } from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import { cn } from "@/lib/utils"

/**
 * Starter chat layout. Wire `onSend` to your API and append assistant
 * messages when they stream in. Sidebar, model picker, and theme toggle
 * are installed as siblings — compose them around this block.
 */
export function Chat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const isEmpty = messages.length === 0

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: text, sender: "user" },
    ])
    setIsGenerating(true)
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-background",
        isEmpty && "items-center justify-center"
      )}
    >
      {!isEmpty && (
        <MessageList messages={messages} isGenerating={isGenerating} />
      )}
      {isEmpty && (
        <p className="mb-5 text-2xl font-medium tracking-tight text-foreground">
          How can I help?
        </p>
      )}
      <div className="w-full">
        <ChatInput
          className={isEmpty ? "pb-1" : undefined}
          isGenerating={isGenerating}
          onStop={() => setIsGenerating(false)}
          onSend={({ text }) => send(text)}
        />
        {isEmpty && (
          <PromptSuggestions
            items={[
              { label: "What can you help me with?" },
              { label: "Summarize the last conversation" },
            ]}
            onSelect={(item) => send(item.label)}
          />
        )}
      </div>
    </div>
  )
}
