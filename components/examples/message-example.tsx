"use client"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

const messages: ChatMessageData[] = [
  {
    id: "1",
    sender: "user",
    content: "Show me a table and a TypeScript snippet.",
  },
  {
    id: "2",
    sender: "assistant",
    content: `Here's a quick comparison:

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

export function MessageExample() {
  return (
    <MessageList
      className="h-[400px] rounded-md"
      messages={messages}
    />
  )
}
