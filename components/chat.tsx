"use client"

import { useState } from "react"

import { ChatInput } from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"

/**
 * Starter chat layout. Wire `onSend` to your API and append assistant
 * messages when they stream in. Sidebar, model picker, and theme toggle
 * are installed as siblings — compose them around this block.
 */
export function Chat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        emptyState={
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Send a message to start
          </div>
        }
      />
      <ChatInput
        isGenerating={isGenerating}
        onStop={() => setIsGenerating(false)}
        onSend={({ text }) => {
          if (!text.trim()) return
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), content: text, sender: "user" },
          ])
          setIsGenerating(true)
        }}
      />
    </div>
  )
}
