"use client"

import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"
import { ModePicker } from "@/components/ui/mode-picker"
import { ModelPicker } from "@/components/ui/model-picker"

const MODELS = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Fast agentic coding",
  },
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    badge: "Anthropic",
    description: "Deep analysis",
  },
]

/**
 * `tools` lands next to the attach button. Pickers opened from a composer
 * want `side="top"` so the menu never covers the textarea.
 */
export function ChatInputToolsExample() {
  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        placeholder="Ask anything"
        tools={
          <>
            <ModePicker side="top" />
            <ModelPicker side="top" options={MODELS} />
          </>
        }
        onSend={({ text }) => toast("Sent", { description: text })}
      />
    </div>
  )
}
