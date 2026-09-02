"use client"

import { useCallback, useState } from "react"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

const TOPICS = [
  "the registry build",
  "the docs nav",
  "the streaming path",
  "the sidebar groups",
  "the file panel",
  "the change card",
]

const TRANSCRIPT: ChatMessageData[] = TOPICS.flatMap((topic, index) => [
  {
    id: `u${index}`,
    sender: "user" as const,
    content: `What changed in ${topic}?`,
  },
  {
    id: `a${index}`,
    sender: "assistant" as const,
    content: `Nothing in ${topic} moved this week — the only edit was a comment,
so the diff is one line. Scroll on: there are more turns below this one.`,
  },
])

/**
 * Scroll up in the transcript and the round jump button fades in over the
 * bottom edge. Appending a turn while you are up there leaves it in place —
 * that is the case it exists for.
 */
export function MessageListJumpExample() {
  const [extra, setExtra] = useState<ChatMessageData[]>([])

  const append = useCallback(() => {
    setExtra((current) => [
      ...current,
      {
        id: `new-${current.length}`,
        sender: current.length % 2 === 0 ? "user" : "assistant",
        content:
          current.length % 2 === 0
            ? "One more question while I read back."
            : "Answered — and the list stays where you left it.",
      },
    ])
  }, [])

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={append}
        className="self-start rounded-md border px-2.5 py-1 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Append a message
      </button>
      <MessageList
        className="h-[320px] w-full rounded-lg border"
        messages={[...TRANSCRIPT, ...extra]}
      />
    </div>
  )
}
