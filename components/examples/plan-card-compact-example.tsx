"use client"

import * as React from "react"

import { MessageToolCall } from "@/components/ui/message-parts"
import { PlanCard, parsePlan } from "@/components/ui/plan-card"

const PLAN_INPUT = JSON.stringify({
  name: "Streaming retry",
  overview:
    "Retry a dropped stream once, then surface the failure instead of hanging.",
  plan: `## What breaks today

A dropped socket leaves the turn spinning: nothing retries and nothing errors.

## Steps

1. Wrap the reader in \`withRetry\` — one attempt, 400ms apart.
2. Emit an \`error\` event when the second attempt fails.
3. Cover both paths in \`tests/stream-retry.test.ts\`.`,
  todos: [
    { content: "Wrap the reader in withRetry", status: "completed" },
    { content: "Emit an error event on the second failure", status: "in_progress" },
    { content: "Cover both paths with tests", status: "pending" },
  ],
})

const PLAN = parsePlan(PLAN_INPUT)

/**
 * What a host with somewhere better to put the plan does: the transcript row
 * collapses to its header and hands the reader back to the panel, and the
 * plan itself — Build included — is read at a width a message column does not
 * have. Passing `onPlanOpen` to `MessageToolCall` is the whole switch.
 */
export function PlanCardCompactExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row">
      <div className="min-w-0 flex-1">
        <MessageToolCall
          tool={{ id: "plan-1", name: "create_plan", status: "done", input: PLAN_INPUT }}
          onPlanOpen={() => setOpen(true)}
        />
        <p className="mt-2 text-[13px] text-muted-foreground">
          The transcript keeps the plan&rsquo;s place in the thread, not a
          second copy of it.
        </p>
      </div>
      <div className="min-w-0 flex-1 rounded-lg border bg-muted/30 p-2">
        {open && PLAN ? (
          <PlanCard
            plan={PLAN}
            onBuild={() => setOpen(false)}
            buildLabel="Build"
            className="my-0"
          />
        ) : (
          <p className="p-3 text-[13px] text-muted-foreground">
            Panel closed — the row on the left opens it again.
          </p>
        )}
      </div>
    </div>
  )
}
