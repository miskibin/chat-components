"use client"

import { TodoPanel, type TodoItem } from "@/components/ui/todo-list"

const ITEMS: TodoItem[] = [
  { content: "Read the vendored message parts", status: "completed" },
  { content: "Add the todo list component", status: "completed" },
  { content: "Wire the panel above the composer", status: "in_progress" },
  { content: "Run lint, typecheck and build", status: "pending" },
  { content: "Refresh the screenshots", status: "pending" },
]

export function TodoListExample() {
  return <TodoPanel items={ITEMS} />
}
