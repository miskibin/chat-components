"use client"

import { toast } from "sonner"

import { ChatInput, type ChatInputMentionItem } from "@/components/ui/chat-input"

const FILES: ChatInputMentionItem[] = [
  { id: "1", label: "app/page.tsx", description: "Playground route" },
  { id: "2", label: "app/layout.tsx", description: "Root layout" },
  { id: "3", label: "components/ui/chat-input.tsx", description: "Composer" },
  { id: "4", label: "components/ui/message-list.tsx", description: "Transcript" },
  { id: "5", label: "components/ui/sidebar-item.tsx", description: "Session row" },
  { id: "6", label: "lib/cursor-agent.ts", description: "CLI bridge" },
  { id: "7", label: "lib/mock-agent.ts", description: "Scripted fallback" },
  { id: "8", label: "lib/utils.ts", description: "cn() helper" },
  { id: "9", label: "package.json", description: "Scripts and deps" },
  { id: "10", label: "registry.json", description: "Registry manifest" },
  { id: "11", label: "README.md", description: "Docs entry point" },
  { id: "12", label: "tsconfig.json", description: "TypeScript config" },
]

/**
 * `mentions` resolves the `@`-token at the caret. It may be async — a real
 * host hits a file index here — and stale answers are dropped, so a fast
 * typist never sees an older query's results.
 */
export function ChatInputMentionsExample() {
  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        placeholder="Type @ to reference a file"
        mentions={async (query) => {
          // Stand-in for a request: the debounce and stale-drop are the point.
          await new Promise((resolve) => setTimeout(resolve, 120))
          const q = query.toLowerCase()
          return FILES.filter((file) => file.label.toLowerCase().includes(q))
        }}
        onSend={({ text }) => toast("Sent", { description: text })}
      />
    </div>
  )
}
