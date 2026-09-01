"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ContextMeterProps = Omit<
  React.ComponentProps<"span">,
  "children"
> & {
  /** Tokens the next request would carry. */
  used: number
  /** The model's usable context window, in tokens. */
  total: number
  /** Fraction at which the ring stops being quiet. */
  warnAt?: number
  /** Fraction at which the ring turns destructive. */
  dangerAt?: number
  /** Below this fraction the meter renders nothing — an empty ring is noise. */
  showFrom?: number
  /** Hides the percentage, leaving the ring alone. */
  hideValue?: boolean
  /** Replaces the hover title. Return "" to drop it. */
  label?: (used: number, total: number) => string
  /** Ring diameter in px. */
  size?: number
}

const RADIUS = 6
const STROKE = 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Rounds to at most one decimal without trailing zeroes: 6.3k, 32k, 262k.
 * `Intl` would localize the separator, and a context window is a number you
 * compare against documentation, not a number you read aloud.
 */
export function formatTokens(tokens: number): string {
  if (!Number.isFinite(tokens)) return "?"
  const value = Math.max(0, Math.round(tokens))
  if (value < 1000) return `${value}`
  const thousands = value / 1000
  const digits = thousands < 100 && thousands % 1 >= 0.05 ? 1 : 0
  return `${thousands.toFixed(digits).replace(/\.0$/, "")}k`
}

/**
 * How much of a model's context window the next request would take.
 *
 * The ring is the whole component: no timers, no layout of its own beyond the
 * shared control height, so it drops into a composer toolbar next to the model
 * picker and lines up with everything else there.
 *
 * `used` is the caller's number to define. A backend that reports token usage
 * gives an exact one; a caller with only a transcript is expected to estimate,
 * which is why nothing here rounds the input or pretends to more precision
 * than it was handed.
 */
export function ContextMeter({
  used,
  total,
  warnAt = 0.75,
  dangerAt = 0.9,
  showFrom = 0.05,
  hideValue = false,
  label,
  size = 14,
  className,
  ...props
}: ContextMeterProps) {
  const usable = Number.isFinite(total) && total > 0
  const spent = Number.isFinite(used) ? Math.max(0, used) : 0
  const fraction = usable ? spent / total : 0

  if (!usable || fraction < showFrom) return null

  // The arc saturates; the number does not. A window blown past by half is
  // worth seeing as 150%, and a ring cannot show that.
  const arc = Math.min(1, fraction)
  const percent = Math.round(fraction * 100)
  const tone =
    fraction >= dangerAt
      ? "text-destructive"
      : fraction >= warnAt
        ? "text-foreground"
        : "text-muted-foreground"
  const title = label
    ? label(spent, total)
    : `${formatTokens(spent)} / ${formatTokens(total)} context used`

  return (
    <span
      data-slot="context-meter"
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={title || "Context used"}
      title={title || undefined}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 text-[12px] tabular-nums select-none",
        tone,
        className
      )}
      {...props}
    >
      <svg
        data-slot="context-meter-ring"
        aria-hidden
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className="shrink-0 -rotate-90"
      >
        <circle
          cx="8"
          cy="8"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="opacity-25"
        />
        <circle
          data-slot="context-meter-arc"
          cx="8"
          cy="8"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arc * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        />
      </svg>
      {hideValue ? null : (
        <span data-slot="context-meter-value">{percent}%</span>
      )}
    </span>
  )
}
