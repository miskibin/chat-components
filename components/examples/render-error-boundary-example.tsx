"use client"

import * as React from "react"

import { RenderErrorBoundary } from "@/components/ui/render-error-boundary"

function Diagram({ source }: { source: string }) {
  if (source.includes("!")) throw new Error("cannot draw that")
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-6 text-center text-[13px] text-muted-foreground">
      Drew: {source}
    </div>
  )
}

/**
 * The renderer throws on anything with a `!` in it. Inside a boundary that is
 * one block falling back to its own source — everything around it, including
 * this control, keeps its render. Fix the input and the boundary retries,
 * because the text is one of its `resetKeys`.
 */
export function RenderErrorBoundaryExample() {
  const [source, setSource] = React.useState("graph TD; A-->B")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <input
        value={source}
        onChange={(event) => setSource(event.target.value)}
        aria-label="Diagram source"
        className="h-8 rounded-md border bg-background px-2 font-mono text-[12.5px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      <RenderErrorBoundary
        resetKeys={[source]}
        fallback={
          <pre className="m-0 overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-[12.5px] whitespace-pre-wrap text-foreground">
            {source}
          </pre>
        }
      >
        <Diagram source={source} />
      </RenderErrorBoundary>
      <p className="text-[12px] text-muted-foreground">
        Add a <code className="font-mono">!</code> to break the render.
      </p>
    </div>
  )
}
