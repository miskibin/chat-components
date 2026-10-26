"use client"

import * as React from "react"

import { GenerationStatus } from "@/components/ui/generation-status"

export function GenerationStatusElapsedExample() {
  // Pretend the turn started 72 seconds ago, so the clock reads past a minute.
  const [startedAt] = React.useState(() => Date.now() - 72_000)
  return <GenerationStatus active label="Working" startedAt={startedAt} />
}
