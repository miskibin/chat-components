"use client"

import { useState } from "react"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

/** Long enough that each conversation has a scroll position of its own. */
function transcript(id: string, topic: string): ChatMessageData[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${id}-${i}`,
    sender: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
    content:
      i % 2 === 0
        ? `${topic} — question ${i / 2 + 1}?`
        : `${topic} — answer ${Math.ceil(i / 2)}. Step ${i} of the trail that makes this list scroll.`,
  }))
}

const CONVERSATIONS = [
  { id: "flaky-tests", label: "Flaky tests", messages: transcript("a", "Flaky tests") },
  { id: "slow-build", label: "Slow build", messages: transcript("b", "Slow build") },
]

/**
 * One mounted list, two transcripts. `conversationKey` is what tells it they
 * are different conversations: scroll up in one, switch, and the other opens
 * at its newest turn instead of inheriting a position that was never its own.
 */
export function MessageListConversationsExample() {
  const [openId, setOpenId] = useState(CONVERSATIONS[0].id)
  const open = CONVERSATIONS.find((c) => c.id === openId) ?? CONVERSATIONS[0]

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
        {CONVERSATIONS.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            data-active={conversation.id === openId}
            onClick={() => setOpenId(conversation.id)}
            className="rounded-md border px-2 py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-muted data-[active=true]:text-foreground"
          >
            {conversation.label}
          </button>
        ))}
      </div>
      <MessageList
        className="h-[300px] w-full"
        messages={open.messages}
        conversationKey={open.id}
      />
    </div>
  )
}
