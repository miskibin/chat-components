"use client"

import * as React from "react"

import {
  MessageProcess,
  MessageReasoning,
  MessageToolCall,
} from "@/components/ui/message-parts"

const REPLAY_MS = 2600

/**
 * A turn folds its thinking and tool calls into one “Worked for 12s” row the
 * moment it stops streaming. Replay it to watch the live stack collapse —
 * `streaming` is the only thing driving that.
 */
export function MessageProcessExample() {
  const [streaming, setStreaming] = React.useState(false)

  React.useEffect(() => {
    if (!streaming) return
    const id = window.setTimeout(() => setStreaming(false), REPLAY_MS)
    return () => window.clearTimeout(id)
  }, [streaming])

  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setStreaming(true)}
        disabled={streaming}
        className="inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {streaming ? "Working…" : "Replay the turn"}
      </button>

      <div className="w-full">
        <MessageProcess streaming={streaming} seconds={12}>
          <MessageReasoning streaming={streaming} duration={4}>
            {"The failing test only touches the reducer, so `applyPatch` is the first thing to read."}
          </MessageReasoning>
          <MessageToolCall
            tool={{
              id: "grep-1",
              name: "grep",
              status: "done",
              input: '{ "pattern": "applyPatch" }',
              output: "3 matches",
            }}
          />
          <MessageToolCall
            tool={{
              id: "edit-1",
              name: "Edit",
              status: "done",
              input: JSON.stringify({
                path: "lib/reducer.ts",
                old_string: "  return { ...state, ...patch }",
                new_string:
                  "  if (!patch) return state\n  return { ...state, ...patch }",
              }),
              output: "+1 −0",
            }}
          />
        </MessageProcess>

        <p className="text-[15px] leading-[1.65]">
          applyPatch spread a null patch straight onto the state. It now returns
          the state untouched, and the reducer test passes.
        </p>
      </div>
    </div>
  )
}
