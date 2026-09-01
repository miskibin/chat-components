"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"

/**
 * While `isGenerating` is set, send becomes stop and the textarea locks. Wire
 * `onStop` to whatever aborts your request.
 */
export function ChatInputGeneratingExample() {
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        isGenerating={isGenerating}
        placeholder="Send, then hit stop"
        onSend={({ text }) => {
          setIsGenerating(true)
          toast("Streaming", { description: text })
        }}
        onStop={() => {
          setIsGenerating(false)
          toast.message("Aborted")
        }}
      />
    </div>
  )
}
