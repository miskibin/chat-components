"use client"

import * as React from "react"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const ANSWER = `The retry loop backs off **exponentially**, so a flaky upstream gets room
to recover instead of a stampede.

1. The first retry waits 250ms.
2. Each one after that doubles, up to a ceiling of 8s.
3. A jitter of ±20% keeps clients from retrying in lockstep.

The policy lives in \`lib/retry/backoff.ts\`, and the tests pin every step of
the curve.`

/**
 * Text the way a harness actually delivers it: a few words, a pause, a lump of
 * a dozen, another pause.
 */
function burstsOf(text: string) {
  const words = text.split(/(?<=\s)/)
  const bursts: string[] = []
  for (let index = 0; index < words.length; ) {
    const size = index % 3 === 0 ? 12 : 3
    bursts.push(words.slice(index, index + size).join(""))
    index += size
  }
  return bursts
}

function useBurstyStream(run: number) {
  const [text, setText] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  React.useEffect(() => {
    const bursts = burstsOf(ANSWER)
    const timers: ReturnType<typeof setTimeout>[] = []
    let at = 0
    timers.push(setTimeout(() => {
      setText("")
      setStreaming(true)
    }, 0))
    bursts.forEach((_, index) => {
      at += index % 2 === 0 ? 420 : 140
      timers.push(
        setTimeout(() => setText(bursts.slice(0, index + 1).join("")), at)
      )
    })
    timers.push(setTimeout(() => setStreaming(false), at + 50))
    return () => timers.forEach(clearTimeout)
  }, [run])
  return { text, streaming }
}

export function MessageMarkdownStreamingExample() {
  const [run, setRun] = React.useState(0)
  const { text, streaming } = useBurstyStream(run)
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {(["paced", "instant"] as const).map((mode) => (
          <div key={mode} className="min-h-56 rounded-lg border p-3">
            <div className="mb-2 text-[11px] font-medium text-muted-foreground">
              streaming=&quot;{mode}&quot;
            </div>
            <MessageMarkdown
              isAnimating={streaming}
              streaming={mode}
              caret={mode === "paced" ? "circle" : undefined}
            >
              {text}
            </MessageMarkdown>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="self-start rounded-md border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
      >
        Replay
      </button>
    </div>
  )
}
