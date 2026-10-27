"use client"

import * as React from "react"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const ANSWER = `CI finished on all three pipelines.

\`\`\`ui
{
  "type": "card",
  "title": "Pipeline #8812 · main",
  "status": "failed",
  "children": [
    { "type": "progress", "label": "Jobs passed", "value": 11, "max": 12, "tone": "warning" },
    {
      "type": "timeline",
      "items": [
        { "title": "lint", "meta": "0:42", "tone": "success" },
        { "title": "typecheck", "meta": "1:10", "tone": "success" },
        { "title": "e2e / chromium", "meta": "6:31", "tone": "danger", "body": "file-panel.test.mjs: expected 900 lines, got 40" }
      ]
    }
  ]
}
\`\`\`

The e2e failure is the read-window regression; I can fix it next.`

/** Small chunks, the way a model streams JSON. */
function useChunkedStream(run: number) {
  const [text, setText] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(
      setTimeout(() => {
        setText("")
        setStreaming(true)
      }, 0)
    )
    let at = 0
    for (let end = 8; end < ANSWER.length + 8; end += 8) {
      at += 28
      const slice = ANSWER.slice(0, end)
      timers.push(setTimeout(() => setText(slice), at))
    }
    timers.push(setTimeout(() => setStreaming(false), at + 50))
    return () => timers.forEach(clearTimeout)
  }, [run])
  return { text, streaming }
}

export function GenerativeViewStreamingExample() {
  const [run, setRun] = React.useState(0)
  const { text, streaming } = useChunkedStream(run)
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="min-h-80">
        <MessageMarkdown isAnimating={streaming} streaming="instant">
          {text}
        </MessageMarkdown>
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="self-start rounded-md border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Replay
      </button>
    </div>
  )
}
