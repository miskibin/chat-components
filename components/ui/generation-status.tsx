"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const FRAME_MS = 80

export type GenerationStage = "thinking" | "searching" | "responding" | "idle"

export type GenerationStatusProps = React.ComponentProps<"span"> & {
  /** When true, shows the spinner. Prefer this over stage for simple UIs. */
  active?: boolean
  /** Optional legacy stage. Non-idle stages show the spinner. */
  stage?: GenerationStage
  /** Optional label next to the spinner. */
  label?: string
  /** Spinner font size in px. */
  size?: number
}

const STAGE_LABELS: Record<GenerationStage, string | undefined> = {
  thinking: "Thinking",
  searching: "Searching",
  responding: "Responding",
  idle: undefined,
}

function BrailleSpinner({ size = 16 }: { size?: number }) {
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      data-slot="generation-status-spinner"
      aria-label="Loading"
      role="status"
      className="font-mono leading-none text-muted-foreground"
      style={{ fontSize: size }}
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
  ...props
}: GenerationStatusProps) {
  const show = active ?? stage !== "idle"
  if (!show) return null

  const text = label ?? STAGE_LABELS[stage]

  return (
    <span
      data-slot="generation-status"
      data-stage={stage}
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "inline-flex items-center gap-2 text-[13px] text-muted-foreground",
        className
      )}
      {...props}
    >
      <BrailleSpinner size={size} />
      {text ? <span className="truncate">{text}</span> : null}
    </span>
  )
}
