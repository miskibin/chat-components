"use client"

import { MessageToolCalls } from "@/components/ui/message-parts"

const TOOLS = [
  { id: "t1", name: "grep", status: "done" as const, output: "3 matches" },
  { id: "t2", name: "Read", status: "running" as const, input: "lib/reducer.ts" },
  { id: "t3", name: "shell", status: "error" as const, output: "1 failing" },
  { id: "t4", name: "Write", status: "pending" as const },
]

/**
 * Each row stamps `data-status`, so one selector on an ancestor tints failures
 * without the component knowing your palette.
 */
export function MessageToolsStatusExample() {
  return (
    <div className="w-full max-w-2xl [&_[data-slot=message-tool-call][data-status=error]]:bg-destructive/5 [&_[data-slot=message-tool-call][data-status=error]]:text-destructive [&_[data-slot=message-tool-call][data-status=running]]:text-primary">
      <MessageToolCalls tools={TOOLS} collapseAt={99} />
    </div>
  )
}
