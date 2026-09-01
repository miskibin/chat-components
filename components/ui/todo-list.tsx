"use client"

import { Check, ChevronDown, Circle, ListTodo, Loader2 } from "lucide-react"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type TodoStatus = "pending" | "in_progress" | "completed"

export type TodoItem = {
  id?: string
  /** The task itself, as the agent worded it. */
  content: string
  status: TodoStatus
}

/**
 * Every spelling of a status seen in the wild — Claude Code's `TodoWrite`,
 * ACP `plan` entries, and the harnesses in between — folded onto the three
 * states a checklist can actually draw. Anything unrecognized is `pending`,
 * which is the only guess that cannot claim work is finished when it isn't.
 */
export function normalizeTodoStatus(value: unknown): TodoStatus {
  const key = String(value ?? "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
  if (
    key === "in_progress" ||
    key === "inprogress" ||
    key === "active" ||
    key === "running" ||
    key === "started" ||
    key === "doing" ||
    key === "current"
  ) {
    return "in_progress"
  }
  if (
    key === "completed" ||
    key === "complete" ||
    key === "done" ||
    key === "finished" ||
    key === "success"
  ) {
    return "completed"
  }
  return "pending"
}

/** Tool names that carry a todo list rather than a file or a command. */
export function isTodoToolName(name: string) {
  const kind = name.replace(/[\s_-]+/g, "").toLowerCase()
  return (
    kind.includes("todo") ||
    kind === "plan" ||
    kind === "updateplan" ||
    kind === "setplan" ||
    kind === "planupdate"
  )
}

const LIST_KEYS = ["todos", "items", "tasks", "plan", "entries", "steps"]
const CONTENT_KEYS = [
  "content",
  "text",
  "title",
  "task",
  "label",
  "description",
  "step",
  "name",
]

function itemContent(item: Record<string, unknown>): string | undefined {
  for (const key of CONTENT_KEYS) {
    const value = item[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return undefined
}

function toItems(value: unknown): TodoItem[] | null {
  if (!Array.isArray(value)) return null
  const items: TodoItem[] = []
  for (const entry of value) {
    if (typeof entry === "string") {
      if (entry.trim()) items.push({ content: entry.trim(), status: "pending" })
      continue
    }
    if (!entry || typeof entry !== "object") continue
    const record = entry as Record<string, unknown>
    const content = itemContent(record)
    if (!content) continue
    items.push({
      id: typeof record.id === "string" ? record.id : undefined,
      content,
      status: normalizeTodoStatus(record.status ?? record.state),
    })
  }
  return items.length ? items : null
}

/**
 * The todo list inside a tool call's arguments. Accepts a bare array, or an
 * object keyed by any of the names the harnesses use, so a new backend does
 * not need a new parser — only the same shape under a different word.
 */
export function parseTodoItems(input?: string | null): TodoItem[] | null {
  if (!input?.trim()) return null
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    return null
  }
  const direct = toItems(value)
  if (direct) return direct
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  for (const key of LIST_KEYS) {
    const items = toItems(record[key])
    if (items) return items
  }
  return null
}

export function todoProgress(items: TodoItem[]) {
  const completed = items.filter((item) => item.status === "completed").length
  const active = items.find((item) => item.status === "in_progress")
  return {
    completed,
    total: items.length,
    active,
    /** The task worth naming in one line: the live one, else the next one. */
    current: active ?? items.find((item) => item.status !== "completed"),
    done: items.length > 0 && completed === items.length,
  }
}

function TodoMark({ status }: { status: TodoStatus }) {
  if (status === "completed") {
    return <Check className="size-3.5 shrink-0 text-muted-foreground" />
  }
  if (status === "in_progress") {
    return <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
  }
  return <Circle className="size-3.5 shrink-0 opacity-30" />
}

export type TodoListProps = React.ComponentProps<"ol"> & {
  items: TodoItem[]
}

/**
 * The checklist on its own — no chrome, no disclosure. Use it wherever a plan
 * is already framed by something else; `TodoPanel` is the framed version.
 */
export const TodoList = React.memo(function TodoList({
  items,
  className,
  ...props
}: TodoListProps) {
  if (items.length === 0) return null

  return (
    <ol
      data-slot="todo-list"
      className={cn("flex flex-col gap-1 text-[13px]", className)}
      {...props}
    >
      {items.map((item, index) => (
        <li
          key={item.id ?? `${index}-${item.content}`}
          data-slot="todo-item"
          data-status={item.status}
          className="flex items-start gap-2 leading-snug"
        >
          <span className="mt-[1px] flex size-4 items-center justify-center">
            <TodoMark status={item.status} />
          </span>
          <span
            className={cn(
              "min-w-0",
              item.status === "completed"
                ? "text-muted-foreground line-through decoration-muted-foreground/40"
                : item.status === "in_progress"
                  ? "text-foreground"
                  : "text-muted-foreground"
            )}
          >
            {item.content}
          </span>
        </li>
      ))}
    </ol>
  )
})

export type TodoPanelProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: TodoItem[]
  /** Uncontrolled open state; the panel is a one-line status bar by default. */
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Replaces the collapsed headline, which is otherwise the live task. */
  label?: React.ReactNode
}

/**
 * The agent's plan, as a single line above the composer.
 *
 * Collapsed it is the task being worked on plus a count; open it is the whole
 * checklist. It renders whatever list it is handed and keeps no state about
 * the run, so the owner is free to derive `items` from the last todo tool call
 * in a thread — which is what makes it survive a reload.
 */
export function TodoPanel({
  items,
  defaultOpen = false,
  open,
  onOpenChange,
  label,
  className,
  ...props
}: TodoPanelProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const setOpen = React.useCallback(
    (next: boolean) => {
      setUncontrolled(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  const progress = React.useMemo(() => todoProgress(items), [items])

  if (items.length === 0) return null

  const headline =
    label ?? progress.current?.content ?? (progress.done ? "Plan done" : "Plan")

  return (
    <div
      data-slot="todo-panel"
      /* Same measure and gutters as ChatInput, so the bar and the composer
         read as one stack rather than two controls that happen to be near. */
      className={cn("mx-auto w-full max-w-3xl px-3 pb-2 sm:px-4", className)}
      {...props}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setOpen}
        data-slot="todo-panel-root"
        data-state-done={progress.done ? "" : undefined}
        className="group rounded-lg border animate-in fade-in duration-150"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            data-slot="todo-panel-trigger"
            aria-label={`Plan — ${progress.completed} of ${progress.total} done`}
            className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          >
            {progress.active ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <ListTodo className="size-3.5 opacity-70" />
            )}
            <span
              data-slot="todo-panel-headline"
              className="min-w-0 truncate text-foreground/90"
              title={typeof headline === "string" ? headline : undefined}
            >
              {headline}
            </span>
            <span
              data-slot="todo-panel-count"
              className="ml-auto shrink-0 tabular-nums"
            >
              {progress.completed}/{progress.total}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 opacity-0 transition-[opacity,transform] duration-150 group-hover:opacity-40",
                isOpen && "rotate-180 opacity-40",
                // The glyph is hover-revealed; keyboard focus has to show it too.
                "group-focus-within:opacity-40"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <TodoList
            items={items}
            className="border-t px-2.5 py-2"
            data-slot="todo-panel-list"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
