"use client"

import { MessageToolCalls } from "@/components/ui/message-parts"

const TOOLS = Array.from({ length: 6 }, (_, index) => ({
  id: `t${index}`,
  name: index % 2 ? "Read" : "grep",
  status: "done" as const,
  input: `{ "path": "lib/step-${index}.ts" }`,
  output: `${index + 1} matches`,
}))

/**
 * Past `collapseAt` rows the stack folds behind one summary line. Lower it to
 * keep long agent turns quiet, or push it up to keep everything on screen.
 */
export function MessageToolsCollapsedExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <MessageToolCalls tools={TOOLS} collapseAt={2} />
      <MessageToolCalls tools={TOOLS} collapseAt={2} defaultOpen />
    </div>
  )
}
