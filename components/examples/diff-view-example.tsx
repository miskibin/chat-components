"use client"

import * as React from "react"

import { DiffView, type DiffViewMode } from "@/components/ui/diff-view"

const OLD = [
  "export function createStore(reducer: Reducer, initial: State) {",
  "  let state = initial",
  "  const listeners = new Set<() => void>()",
  "",
  "  function dispatch(event: Event) {",
  "    state = reducer(state, event)",
  "  }",
  "",
  "  return { dispatch, getState: () => state }",
  "}",
].join("\n")

const NEW = [
  "export function createStore(reducer: Reducer, initial: State) {",
  "  let state = initial",
  "  const listeners = new Set<() => void>()",
  "",
  "  function dispatch(event: Event) {",
  "    const next = reducer(state, event)",
  "    if (next === state) return",
  "    state = next",
  "    for (const listener of listeners) listener()",
  "  }",
  "",
  "  function subscribe(listener: () => void) {",
  "    listeners.add(listener)",
  "    return () => listeners.delete(listener)",
  "  }",
  "",
  "  return { dispatch, subscribe, getState: () => state }",
  "}",
].join("\n")

const toggle =
  "h-7 rounded-md px-2 text-[12px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"

export function DiffViewExample() {
  const [mode, setMode] = React.useState<DiffViewMode>("unified")
  const [wrap, setWrap] = React.useState(true)

  return (
    <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-lg border bg-background">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b px-2">
        <span className="mr-auto font-mono text-[12px] text-muted-foreground">
          lib/store/reducer.ts
        </span>
        <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
          <button
            type="button"
            aria-pressed={mode === "unified"}
            onClick={() => setMode("unified")}
            className={toggle}
          >
            Unified
          </button>
          <button
            type="button"
            aria-pressed={mode === "split"}
            onClick={() => setMode("split")}
            className={toggle}
          >
            Split
          </button>
        </div>
        <button
          type="button"
          aria-pressed={wrap}
          onClick={() => setWrap((current) => !current)}
          className={toggle}
        >
          Wrap
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <DiffView
          path="lib/store/reducer.ts"
          oldText={OLD}
          newText={NEW}
          mode={mode}
          wrap={wrap}
        />
      </div>
    </div>
  )
}
