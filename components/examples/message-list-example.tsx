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

/** The turn a local backend leaves empty while it loads weights. */
const WAITING: ChatMessageData = {
  id: "3",
  sender: "assistant",
  content: "",
}

export function MessageListExample() {
  const [messages, setMessages] = useState(INITIAL)
  const waiting = messages.at(-1)?.id === WAITING.id

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() =>
          setMessages((prev) =>
            prev.at(-1)?.id === WAITING.id ? INITIAL : [...prev, WAITING]
          )
        }
        className="self-start rounded-md border px-2.5 py-1 text-[12px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {waiting ? "Reset" : "Simulate a slow first token"}
      </button>
      <MessageList
        className="h-[420px] w-full"
        messages={messages}
        isGenerating={waiting}
        /* Whatever the backend last said it was doing beats "Thinking" — a
           model being pulled into memory is not thinking about anything. */
        generationLabel={waiting ? "Loading qwen3:8b into memory" : undefined}
        onEditMessage={(id, content) =>
          setMessages((prev) =>
            prev.map((message) =>
              message.id === id ? { ...message, content } : message
            )
          )
        }
      />
    </div>
  )
}
