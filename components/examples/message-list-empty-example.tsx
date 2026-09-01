"use client"

import { MessageSquareDashed } from "lucide-react"

import { MessageList } from "@/components/ui/message-list"

/**
 * With no messages the list renders `emptyState` and nothing else. The column
 * measure lives on the list's inner wrapper, so `[&>div]` widens it.
 */
export function MessageListEmptyExample() {
  return (
    <MessageList
      className="h-[300px] w-full px-8 [&>div]:max-w-4xl"
      messages={[]}
      emptyState={
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <MessageSquareDashed className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No messages yet</p>
          <p className="max-w-xs text-[13px] text-muted-foreground">
            Ask about a file, a failing job, or a diff you want reviewed.
          </p>
        </div>
      }
    />
  )
}
