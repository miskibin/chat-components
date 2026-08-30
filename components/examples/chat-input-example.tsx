"use client"

import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"

export function ChatInputExample() {
  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        placeholder="Ask anything — type / for skills and commands"
        skills={[
          { name: "summarize", description: "Condense long text" },
          { name: "translate", description: "Translate into another language" },
        ]}
        slashCommands={[
          { name: "help", description: "Show available commands" },
          { name: "clear", description: "Clear the conversation" },
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
