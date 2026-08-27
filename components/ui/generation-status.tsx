"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const FRAME_MS = 80

export type GenerationStage = "thinking" | "searching" | "responding" | "idle"

export type GenerationStatusProps = {
  /** When true, shows the spinner. Prefer this over stage for simple UIs. */
  active?: boolean
  /** Optional legacy stage. Non-idle stages show the spinner. */
  stage?: GenerationStage
  /** Optional label next to the spinner. */
  label?: string
  className?: string
  size?: number
}

function BrailleSpinner({ size = 16 }: { size?: number }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      aria-label="Loading"
      role="status"
      className="font-mono text-muted-foreground"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {FRAMES[frame]}
    </span>
  )
}

export function GenerationStatus({
  active,
  stage = "idle",
  label,
  className,
  size = 16,
}: GenerationStatusProps) {
  const show = active ?? stage !== "idle"
  if (!show) return null

  const defaultLabel =
    stage === "searching"
      ? "Searching"
      : stage === "responding"
        ? "Responding"
        : stage === "thinking"
          ? "Thinking"
          : undefined

  return (
    <span
      aria-live="polite"
      aria-busy="true"
      className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
    >
      <BrailleSpinner size={size} />
      {(label ?? defaultLabel) && <span>{label ?? defaultLabel}</span>}
    </span>
  )
}
