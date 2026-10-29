"use client"

import * as React from "react"
import { Message, type MessagePart } from "@/components/ui/message"

const tool = (id: string, command: string, running = false): MessagePart => ({
  type: "tool",
  id,
  tool: {
    id,
    name: "exec_command",
    status: running ? "running" : "done",
    input: JSON.stringify({ command }),
    output: running ? undefined : "Passed"
  }
})
const commentary: MessagePart = {
  type: "text",
  id: "update",
  text: "The tests pass. I am checking the remaining changes."
}

/** Commentary stays between live blocks, then folds with the finished process. */
export function MessageProcessExample() {
  const [phase, setPhase] = React.useState(0)
  React.useEffect(() => {
    if (phase === 0 || phase >= 6) return
    const timer = window.setTimeout(() => setPhase((value) => value + 1), 1400)
    return () => window.clearTimeout(timer)
  }, [phase])
  const complete = phase === 0 || phase >= 6
  const parts: MessagePart[] = [
    { type: "thinking", id: "thought", text: "Checking the failing test." },
    ...(phase >= 2 || complete ? [tool("test", "npm test", phase === 2)] : []),
    ...(phase >= 3 || complete ? [commentary] : []),
    ...(phase >= 4 || complete ? [tool("wait", "sleep 5", phase === 4)] : []),
    ...(phase >= 5 || complete
      ? [tool("diff", "git diff --check", phase === 5)]
      : []),
    ...(complete
      ? [
          {
            type: "text" as const,
            id: "final",
            text: "The fix is ready. Tests and diff checks pass."
          }
        ]
      : [])
  ]
  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setPhase(1)}
        disabled={phase > 0 && phase < 6}
        className="inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {phase > 0 && phase < 6 ? "Working…" : "Replay the turn"}
      </button>
      <Message
        sender="assistant"
        content=""
        parts={parts}
        isAnimating={phase > 0 && phase < 6}
        workedFor={12}
      />
    </div>
  )
}
