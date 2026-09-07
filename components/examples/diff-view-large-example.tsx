"use client"

import * as React from "react"

import { DiffView } from "@/components/ui/diff-view"
import { DiffWorkerPoolProvider } from "@/components/ui/diff-worker-pool"

const ROWS = 4_000

/** 4,000 routes, of which every 250th changes — enough to feel the difference. */
function generate() {
  const before: string[] = ["export const routes = {"]
  const after: string[] = ["export const routes = {"]
  for (let i = 0; i < ROWS; i++) {
    const line = `  "/r/${i}": { handler: handler${i}, method: "GET" },`
    before.push(line)
    after.push(
      i % 250 === 0
        ? `  "/r/${i}": { handler: handler${i}, method: "POST", auth: true },`
        : line
    )
  }
  before.push("}")
  after.push("}")
  return { before: before.join("\n"), after: after.join("\n") }
}

export function DiffViewLargeExample() {
  const { before, after } = React.useMemo(() => generate(), [])

  return (
    <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-lg border bg-background">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-2 text-[12px] text-muted-foreground">
        <span className="font-mono">app/routes.generated.ts</span>
        <span className="ml-auto tabular-nums">
          {ROWS.toLocaleString()} lines, 16 changed
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <DiffWorkerPoolProvider>
          <DiffView
            path="app/routes.generated.ts"
            oldText={before}
            newText={after}
            mode="unified"
            wrap={false}
          />
        </DiffWorkerPoolProvider>
      </div>
    </div>
  )
}
