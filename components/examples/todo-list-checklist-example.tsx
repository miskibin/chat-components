"use client"

import { TodoList, type TodoItem } from "@/components/ui/todo-list"

const ITEMS: TodoItem[] = [
  { content: "Reproduce the failing turn", status: "completed" },
  { content: "Bisect the reducer", status: "in_progress" },
  { content: "Add a regression test", status: "pending" },
]

export function TodoListChecklistExample() {
  return <TodoList items={ITEMS} />
}
