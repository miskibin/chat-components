"use client"

import * as React from "react"

import {
  FilePreview,
  type FilePreviewFile,
} from "@/components/ui/file-preview"

const TOTAL = 900
const FOCUS_LINE = 412

/** Long enough to meet the render cap, boring enough to scroll past. */
const CONTENT = Array.from({ length: TOTAL }, (_, index) => {
  const line = index + 1
  return line === FOCUS_LINE
    ? `  handlers.set("route-${line}", (ctx) => ctx.fail("session not found"))`
    : `  handlers.set("route-${line}", (ctx) => ctx.reply(${line}))`
}).join("\n")

const DIFF = `@@ -411,3 +411,3 @@
   handlers.set("route-411", (ctx) => ctx.reply(411))
-  handlers.set("route-412", (ctx) => ctx.reply(412))
+  handlers.set("route-412", (ctx) => ctx.fail("session not found"))
   handlers.set("route-413", (ctx) => ctx.reply(413))`

const button =
  "rounded-md border px-2 py-1 text-[12.5px] outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function FilePreviewFocusExample() {
  const [content, setContent] = React.useState<string | undefined>(undefined)
  const [focus, setFocus] = React.useState({ line: 0, nonce: 0 })

  // Stands in for the app's own read: the panel opens on the diff a transcript
  // already carries, and the file body lands a moment later.
  React.useEffect(() => {
    const timer = setTimeout(() => setContent(CONTENT), 900)
    return () => clearTimeout(timer)
  }, [])

  const file = React.useMemo<FilePreviewFile>(
    () => ({
      path: "lib/router/handlers.ts",
      diff: DIFF,
      content,
      focusLine: focus.line || undefined,
      focusNonce: focus.nonce,
    }),
    [content, focus]
  )

  // A second click on the same reference is a second request, so the nonce
  // moves even though the line does not.
  const jump = React.useCallback(
    () => setFocus((prev) => ({ line: FOCUS_LINE, nonce: prev.nonce + 1 })),
    []
  )

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-[360px] w-full overflow-hidden rounded-lg border">
        <FilePreview file={file} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={jump} className={button}>
          Open handlers.ts:{FOCUS_LINE}
        </button>
        <p className="min-w-0 flex-1 text-[12.5px] text-muted-foreground">
          The body arrives after the path, and the File view is what a focus
          request asks for — so the panel switches to it when the text lands,
          not before. {TOTAL.toLocaleString()} lines render behind a cap;
          scroll away and click again to be brought back.
        </p>
      </div>
    </div>
  )
}
