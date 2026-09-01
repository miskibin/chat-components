"use client"

import { MessageToolCall } from "@/components/ui/message-parts"

const PLAN = JSON.stringify({
  todos: [
    { content: "Rewrite the line chart cleanly", status: "completed" },
    { content: "Create the salary data module", status: "in_progress" },
    { content: "Run lint, typecheck and build", status: "pending" },
  ],
})

/**
 * A todo tool call renders as the checklist it is — no raw JSON — and the
 * headline counts the plan instead of claiming a file was written.
 */
export function MessageToolsTodoExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageToolCall
        tool={{ id: "t1", name: "todo_write", status: "done", input: PLAN }}
        defaultOpen
      />
    </div>
  )
}
