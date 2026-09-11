import { Scale } from "lucide-react"

import { ChatEmptyState } from "@/components/ui/chat-empty-state"

export function ChatEmptyStateExample() {
  return (
    <ChatEmptyState
      icon={<Scale />}
      title="Start a conversation"
      description="Ask a focused question, add useful context, and keep the decision with you."
    >
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-[13px] text-muted-foreground">
        Your host can place suggestions or other quiet actions here.
      </div>
    </ChatEmptyState>
  )
}
