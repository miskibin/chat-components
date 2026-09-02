"use client"

import { useCallback, useState } from "react"

import { Message } from "@/components/ui/message"

const ANSWER = `The retry budget is per turn, not per tool call: a turn that spends it on
a flaky \`fetch\` has nothing left for the write that follows.

Two things follow from that. The budget resets when the turn does, and a tool
that fails twice is dropped rather than retried a third time — which is why a
slow provider shows up as a shorter turn instead of a longer one.`

/**
 * Select any part of the answer: a Quote pill appears over the selection, and
 * clicking it hands the text to `onQuote` — where a real app would prefill the
 * composer with it.
 */
export function MessageQuoteExample() {
  const [draft, setDraft] = useState("")

  const quote = useCallback((text: string) => {
    setDraft((current) =>
      `${current}${current ? "\n\n" : ""}> ${text.replace(/\n/g, "\n> ")}\n\n`
    )
  }, [])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Message sender="assistant" content={ANSWER} onQuote={quote} />
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        aria-label="Composer"
        placeholder="Quoted text lands here…"
        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-[13px] leading-relaxed outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  )
}
