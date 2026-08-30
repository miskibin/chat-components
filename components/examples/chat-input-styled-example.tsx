"use client"

import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"

/**
 * `className` merges last through `cn()`, and the inner surface is reachable
 * through its `data-slot`, so the whole composer can be restyled from outside.
 */
export function ChatInputStyledExample() {
  return (
    <ChatInput
      className="max-w-md px-0 sm:px-0 [&_[data-slot=chat-input-surface]]:rounded-xl [&_[data-slot=chat-input-surface]]:border-primary/30 [&_[data-slot=chat-input-surface]]:bg-muted/40"
      placeholder="Narrow, squared-off composer"
      onSend={({ text }) => toast("Sent", { description: text })}
    />
  )
}
