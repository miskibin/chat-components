"use client"

import { toast } from "sonner"

import { Message, type PatternHandler } from "@/components/ui/message"

/**
 * `patternHandlers` rewrite inline text after markdown parsing, so an agent can
 * emit a plain `[cite:id]` token and the UI renders whatever you want for it.
 */
const CITATIONS: PatternHandler[] = [
  {
    pattern: /\[cite:(\w+)\]/g,
    render: (match) => (
      <button
        type="button"
        onClick={() => toast.message(`Source ${match[1]}`)}
        className="mx-0.5 rounded-sm bg-primary/10 px-1 font-mono text-[11px] text-primary hover:bg-primary/20"
      >
        {match[1]}
      </button>
    ),
  },
]

export function MessageCitationsExample() {
  return (
    <div className="w-full max-w-2xl">
      <Message
        sender="assistant"
        patternHandlers={CITATIONS}
        content={
          "The registry build reads every file listed in `registry.json` [cite:r1] " +
          "and writes one JSON payload per item [cite:r2]. Nothing else is copied."
        }
      />
    </div>
  )
}
