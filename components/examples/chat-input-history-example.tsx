"use client"

import * as React from "react"

import { ChatInput } from "@/components/ui/chat-input"

/**
 * Press ArrowUp in the empty composer to walk back through what was already
 * sent, ArrowDown to come forward again. One step past the newest empties it.
 * Type something first and the arrows move the caret, as they always did.
 */
export function ChatInputHistoryExample() {
  const [sent, setSent] = React.useState([
    { id: "m1", text: "Why is the first retry so slow?" },
    { id: "m2", text: "Show me lib/retry/backoff.ts" },
    { id: "m3", text: "Halve BASE_MS and run the tests" },
  ])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <ul className="rounded-md border bg-muted/40 p-3 text-[12.5px] text-muted-foreground">
        {sent.map((message) => (
          <li key={message.id} className="truncate">
            {message.text}
          </li>
        ))}
      </ul>
      <ChatInput
        history={sent}
        placeholder="Ask anything — ArrowUp recalls"
        onSend={({ text }) =>
          setSent((prev) => [...prev, { id: `m${prev.length + 1}`, text }])
        }
      />
    </div>
  )
}
