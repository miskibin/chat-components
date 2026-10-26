"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type GenerationStage = "thinking" | "searching" | "responding" | "idle"

export type GenerationStatusProps = React.ComponentProps<"span"> & {
  /** When true, shows the indicator. Prefer this over stage for simple UIs. */
  active?: boolean
  /** Optional legacy stage. Non-idle stages show the indicator. */
  stage?: GenerationStage
  /** Optional label next to the indicator. */
  label?: string
  /** Indicator box size in px; the dot fills half of it. */
  size?: number
  /**
   * When the work started (epoch ms). Shows a ticking "12s" / "1m 05s" after
   * the label — written straight to the DOM once a second, so a long turn
   * costs no React renders at all.
   */
  startedAt?: number
}

const STAGE_LABELS: Record<GenerationStage, string | undefined> = {
  thinking: "Thinking",
  searching: "Searching",
  responding: "Responding",
  idle: undefined,
}

/**
 * One dot, breathing. No timers and no frame state: the browser owns the
 * animation, and `motion-safe` drops it entirely for readers who asked for
 * less motion — the dot simply sits there instead.
 */
function PulseDot({ size = 16 }: { size?: number }) {
  return (
    <span
      data-slot="generation-status-spinner"
      aria-label="Loading"
      role="status"
      className="inline-grid shrink-0 place-items-center text-muted-foreground"
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        style={{ width: size / 2, height: size / 2 }}
        className="rounded-full bg-current motion-safe:animate-pulse"
      />
    </span>
  )
}

/** "4s", "1m 05s", "1h 02m". */
export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  if (total < 60) return `${total}s`
  const minutes = Math.floor(total / 60)
  if (minutes < 60) return `${minutes}m ${String(total % 60).padStart(2, "0")}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`
}

function Elapsed({ startedAt }: { startedAt: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const tick = () => {
      node.textContent = formatElapsed(Date.now() - startedAt)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [startedAt])
  return (
    <span
      ref={ref}
      data-slot="generation-status-elapsed"
      // The first paint has no clock to read; the effect fills it in.
      suppressHydrationWarning
      className="shrink-0 tabular-nums text-muted-foreground/70"
    />
  )
}

export function GenerationStatus({
  active,
  stage = "idle",
  label,
  className,
  size = 16,
  startedAt,
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
        "inline-flex items-center gap-1.5 text-[13px] text-muted-foreground",
        className
      )}
      {...props}
    >
      <PulseDot size={size} />
      {text ? (
        <span
          data-slot="generation-status-label"
          className="truncate motion-safe:animate-pulse"
        >
          {text}
        </span>
      ) : null}
      {startedAt != null ? <Elapsed startedAt={startedAt} /> : null}
    </span>
  )
}
