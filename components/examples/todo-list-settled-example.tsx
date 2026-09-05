"use client"

import { TodoPanel, type TodoItem } from "@/components/ui/todo-list"

/** The state a stopped turn usually leaves behind: a step nobody wrote off. */
const ABANDONED: TodoItem[] = [
  { content: "Read the failing test", status: "completed" },
  { content: "Patch applyPatch", status: "in_progress" },
  { content: "Re-run the suite", status: "pending" },
]

const FINISHED: TodoItem[] = ABANDONED.map((item) => ({
  ...item,
  status: "completed",
}))

export function TodoListSettledExample() {
  return (
    <div className="flex w-full flex-col gap-3">
      <TodoPanel items={ABANDONED} defaultOpen className="mx-0 px-0" />
      <TodoPanel
        items={ABANDONED}
        running={false}
        defaultOpen
        className="mx-0 px-0"
      />
      <TodoPanel
        items={FINISHED}
        running={false}
        defaultOpen
        className="mx-0 px-0"
      />
    </div>
  )
}
