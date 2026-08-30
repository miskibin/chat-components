"use client"

import { useState } from "react"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

const INITIAL: ChatMessageData[] = [
  {
    id: "1",
    sender: "user",
    content: "Show me a table and a TypeScript snippet.",
  },
  {
    id: "2",
    sender: "assistant",
    content: `Here is a quick comparison:

| Model | Speed |
| --- | --- |
| Composer | Fast |
| Opus | Slow |

\`\`\`ts
export function greet(name: string) {
  return \`Hello, \${name}\`
}
\`\`\`
`,
  },
]

export function MessageListExample() {
  const [messages, setMessages] = useState(INITIAL)

  return (
    <MessageList
      className="h-[420px] w-full"
      messages={messages}
      onEditMessage={(id, content) =>
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id ? { ...message, content } : message
          )
        )
      }
    />
  )
}
