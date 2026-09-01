"use client"

import { ChatInput } from "@/components/ui/chat-input"
import { TodoPanel, parseTodoItems } from "@/components/ui/todo-list"

/** Verbatim arguments of a `todo_write` call, as a harness streams them. */
const TOOL_INPUT = JSON.stringify({
  todos: [
    { content: "Find where the plan is stored", status: "completed" },
    { content: "Derive the panel from the last tool call", status: "in_progress" },
    { content: "Keep it collapsed until it is clicked", status: "pending" },
  ],
})

export function TodoListComposerExample() {
  const items = parseTodoItems(TOOL_INPUT) ?? []

  return (
    <div className="w-full">
      <TodoPanel items={items} />
      <ChatInput onSend={() => {}} placeholder="Ask anything…" />
    </div>
  )
}
