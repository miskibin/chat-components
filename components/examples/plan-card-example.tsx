"use client"

import * as React from "react"

import { MessageToolCall } from "@/components/ui/message-parts"

const PLAN_INPUT = JSON.stringify(
  {
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
  },
  null,
  2
)

export function PlanCardExample() {
  const [built, setBuilt] = React.useState(false)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MessageToolCall
        tool={{
          id: "plan-1",
          name: "create_plan",
          status: "done",
          input: PLAN_INPUT,
        }}
        onPlanBuild={() => setBuilt(true)}
      />
      <p className="text-[13px] text-muted-foreground">
        {built ? "Build pressed — the host sends the turn." : "Nothing sent yet."}
      </p>
    </div>
  )
}
