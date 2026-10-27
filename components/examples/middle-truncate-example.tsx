"use client"

import * as React from "react"

import { MiddleTruncate } from "@/components/ui/middle-truncate"

const VALUES = [
  "src/components/ui/sidebar-item.tsx",
  "claude/dazzling-galileo-ddlwvj",
  "feature/streaming-retry-with-backoff",
  "README.md",
]

/**
 * Drag the width: the head shrinks, the end that tells two values apart
 * stays, and the ellipsis sits flush against it.
 */
export function MiddleTruncateExample() {
  const [width, setWidth] = React.useState(180)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <label className="flex items-center gap-3 text-[12px] text-muted-foreground">
        Width
        <input
          type="range"
          min={90}
          max={360}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          className="w-40 accent-primary"
        />
        <span className="tabular-nums">{width}px</span>
      </label>
      <div
        className="flex flex-col gap-1.5 rounded-lg border p-3 text-[13px]"
        style={{ width }}
      >
        {VALUES.map((value) => (
          <MiddleTruncate key={value} value={value} className="font-mono text-[12px]" />
        ))}
      </div>
      <div
        className="flex flex-col gap-1.5 rounded-lg border p-3 text-[13px]"
        style={{ width }}
      >
        {VALUES.map((value) => (
          <span key={value} className="truncate font-mono text-[12px] text-muted-foreground">
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}
