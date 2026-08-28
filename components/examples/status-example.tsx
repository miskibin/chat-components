"use client"

import { GenerationStatus } from "@/components/ui/generation-status"

export function StatusExample() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <GenerationStatus active label="Thinking" />
    </div>
  )
}
