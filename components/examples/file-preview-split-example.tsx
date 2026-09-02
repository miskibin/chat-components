"use client"

import * as React from "react"

import {
  FilePreview,
  type FilePreviewDiffLayout,
  type FilePreviewFile,
} from "@/components/ui/file-preview"

const DIFF = [
  "@@ -3,7 +3,8 @@",
  " export function createStore(reducer: Reducer, initial: State) {",
  "   let state = initial",
  "-  const listeners = new Set<() => void>()",
  "+  const listeners = new Set<(state: State) => void>()",
  "+  let dispatching = false",
  " ",
  "   function dispatch(event: Event) {",
  "     const next = reducer(state, event)",
  "@@ -12,9 +13,11 @@",
  "     state = next",
  "-    for (const listener of listeners) listener()",
  "+    dispatching = true",
  "+    for (const listener of listeners) listener(state)",
  "+    dispatching = false",
  "   }",
  " ",
  "-  return { dispatch, getState: () => state }",
  "+  return { dispatch, getState: () => state, isDispatching: () => dispatching }",
  " }",
  "@@ -30,4 +33,5 @@",
  " export function subscribe(store: Store, listener: Listener) {",
  "   store.listeners.add(listener)",
  "-  return () => store.listeners.delete(listener)",
  "+  // Unsubscribing during a dispatch must not disturb the running iteration — copy first.",
  "+  return () => void queueMicrotask(() => store.listeners.delete(listener))",
  " }",
].join("\n")

const FILE: FilePreviewFile = {
  path: "lib/store/create-store.ts",
  diff: DIFF,
}

export function FilePreviewSplitExample() {
  const [layout, setLayout] = React.useState<FilePreviewDiffLayout>("split")
  const [wrap, setWrap] = React.useState(true)

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-[360px] w-full overflow-hidden rounded-lg border">
        <FilePreview
          file={FILE}
          diffLayout={layout}
          onDiffLayoutChange={setLayout}
          wrap={wrap}
          onWrapChange={setWrap}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Layout: <span className="font-mono">{layout}</span> · wrapping:{" "}
        <span className="font-mono">{String(wrap)}</span> — both toggles live in
        the header.
      </p>
    </div>
  )
}
