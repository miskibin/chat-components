"use client"

import { ChatInput } from "@/components/ui/chat-input"
import { toast } from "sonner"

export function ChatInputExample() {
  return (
    <div className="flex min-h-[400px] items-end">
      <ChatInput
        className="w-full px-0 pb-0"
        placeholder="Ask anything"
        skills={[
          { name: "summarize", description: "Condense long text" },
          { name: "translate", description: "Translate into another language" },
        ]}
        slashCommands={[
          { name: "help", description: "Show commands" },
        ]}
        onSend={({ text, files, skills }) => {
          toast("Sent", {
            description: [
              text,
              files.length ? `${files.length} file(s)` : "",
              skills.length ? skills.join(", ") : "",
            ]
              .filter(Boolean)
              .join(" · "),
          })
        }}
      />
    </div>
  )
}
