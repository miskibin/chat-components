"use client"

import { ClipboardList, Hammer, Loader2 } from "lucide-react"
import * as React from "react"

import { MessageMarkdown } from "@/components/ui/message-markdown"
import {
  TodoList,
  parseTodoItems,
  todoProgress,
  type TodoItem,
} from "@/components/ui/todo-list"
import { cn } from "@/lib/utils"

/**
 * A plan a harness wrote before it started work: a markdown body, and — where
 * the harness split it out — a name, a one-line overview and the checklist it
 * intends to walk.
 */
export type PlanData = {
  title?: string
  overview?: string
  /** The plan itself, as markdown. */
  body: string
  todos?: TodoItem[]
}

/** Where the plan's markdown lives, in the order the harnesses name it. */
const BODY_KEYS = ["plan", "markdown", "body", "details", "content"]
const TITLE_KEYS = ["name", "title"]
const OVERVIEW_KEYS = ["overview", "summary", "subtitle"]

/**
 * Tool names that carry a written plan — `ExitPlanMode`, `create_plan`,
 * `update_plan`. Matching on the word rather than a fixed list keeps a new
 * harness from needing a new branch; `parsePlan` is what decides whether the
 * arguments really hold one, so a plan-ish name with a todo array in it still
 * renders as the checklist it is.
 */
export function isPlanToolName(name: string) {
  return name.replace(/[\s_-]+/g, "").toLowerCase().includes("plan")
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return undefined
}

/**
 * The plan inside a tool call's arguments, or null when there is none — which
 * is also what a half-streamed argument blob gives, so a row only becomes a
 * card once the whole plan has arrived.
 */
export function parsePlan(input?: string | null): PlanData | null {
  if (!input?.trim()) return null
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    return null
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const body = firstString(record, BODY_KEYS)
  if (!body) return null
  return {
    title: firstString(record, TITLE_KEYS),
    overview: firstString(record, OVERVIEW_KEYS),
    body,
    // The same arguments, read for the checklist half: `todos` wins over the
    // markdown `plan`, which is a string and no list at all.
    todos: parseTodoItems(input) ?? undefined,
  }
}

/**
 * True when a tool call carries a plan worth drawing as a card. Lets a turn
 * layout keep the plan out of the collapsed “Worked for 12s” stack, where a
 * proposal nobody can see is a proposal nobody can act on.
 */
export function hasWrittenPlan(tool: { name: string; input?: string }) {
  return isPlanToolName(tool.name) && !!parsePlan(tool.input)
}

export type PlanCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  plan: PlanData
  /**
   * Offered as a Build button under the plan. Omit it and the card is a plain
   * record of what the agent proposed — which is what every plan but the
   * newest one is.
   */
  onBuild?: () => void
  buildLabel?: string
  /** Locks the action while the turn that would carry it out is starting. */
  busy?: boolean
}

/**
 * A written plan, shown as the turn's answer rather than buried in its tool
 * stack: the markdown the agent wrote, its checklist, and the one action that
 * moves the conversation on.
 */
export const PlanCard = React.memo(function PlanCard({
  plan,
  onBuild,
  buildLabel = "Build",
  busy = false,
  className,
  ...props
}: PlanCardProps) {
  const progress = plan.todos?.length ? todoProgress(plan.todos) : null

  return (
    <div
      data-slot="plan-card"
      className={cn(
        "my-2 overflow-hidden rounded-lg border bg-card text-card-foreground animate-in fade-in duration-150",
        className
      )}
      {...props}
    >
      <div
        data-slot="plan-card-header"
        className="flex items-center gap-2 border-b px-3.5 py-2.5 text-[13px] [&_svg]:pointer-events-none [&_svg]:shrink-0"
      >
        <ClipboardList className="size-3.5 opacity-70" />
        <span
          data-slot="plan-card-title"
          className="min-w-0 flex-1 truncate font-medium text-foreground"
        >
          {plan.title || "Plan"}
        </span>
        {progress ? (
          <span
            data-slot="plan-card-count"
            className="shrink-0 tabular-nums text-muted-foreground"
          >
            {progress.completed}/{progress.total}
          </span>
        ) : null}
      </div>
      <div data-slot="plan-card-body" className="px-3.5 py-3">
        {plan.overview ? (
          <p
            data-slot="plan-card-overview"
            className="mb-2.5 text-[13px] leading-snug text-muted-foreground"
          >
            {plan.overview}
          </p>
        ) : null}
        <MessageMarkdown className="text-[13.5px]!">{plan.body}</MessageMarkdown>
        {plan.todos?.length ? (
          <TodoList
            items={plan.todos}
            running={busy}
            data-slot="plan-card-todos"
            className="mt-3 border-t pt-3"
          />
        ) : null}
      </div>
      {onBuild ? (
        <div
          data-slot="plan-card-actions"
          className="flex justify-end border-t px-3.5 py-2.5"
        >
          <button
            type="button"
            data-slot="plan-card-build"
            onClick={onBuild}
            disabled={busy}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
          >
            {busy ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Hammer />
            )}
            {buildLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
})
