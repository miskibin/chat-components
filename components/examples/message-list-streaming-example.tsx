"use client"

import { useEffect, useState } from "react"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

const ANSWER =
  "Streaming is the default path: pass `isGenerating` and grow the last message's `content`. Until the first token lands, the list shows the generation dot where the answer will appear."

const BASE: ChatMessageData[] = [
  { id: "1", sender: "user", content: "Explain how streaming renders." },
]

/**
 * `isGenerating` drives the pending indicator and the streaming markdown path;
 * the list keeps itself pinned to the bottom unless the reader scrolls away.
 */
export function MessageListStreamingExample() {
  const [chars, setChars] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setChars((value) => (value >= ANSWER.length + 20 ? 0 : value + 2)),
      40
    )
    return () => clearInterval(timer)
  }, [])

  const streamed = ANSWER.slice(0, chars)
  const messages: ChatMessageData[] = streamed
    ? [...BASE, { id: "2", sender: "assistant", content: streamed }]
    : BASE

  return (
    <MessageList
      className="h-[300px] w-full"
      messages={messages}
      isGenerating={chars < ANSWER.length}
      generationStage="thinking"
    />
  )
}
