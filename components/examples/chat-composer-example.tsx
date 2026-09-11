"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ChatComposer } from "@/components/ui/chat-composer"

export function ChatComposerExample() {
  const [value, setValue] = useState("")

  return (
    <div className="w-full max-w-xl">
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSend={() => {
          toast(value)
          setValue("")
        }}
        placeholder="Ask a question…"
        footer="Enter to send · Shift+Enter for a new line"
      />
    </div>
  )
}
