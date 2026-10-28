"use client"

import * as React from "react"

import { GenerativeView } from "@/components/ui/generative-view"
import { normalizeView } from "@/lib/generative-view"

/**
 * A review written the way a model writes any sentence — backticks, bold, a
 * cited `file:line` or two — drawn as inline markdown rather than literal
 * punctuation, with every cited file a chip the host can open.
 */
const VIEW = normalizeView({
  type: "list",
  items: [
    {
      title: "**Major** · stale marker state",
      meta: "cleanup",
      tone: "warning",
      body: "`RunExpiry._closing` (src/agent/services/expiry.py:32,48,79,93) is written 4× but never read — dead state; remove or use it.",
    },
    {
      title: "*Minor* · regex false-match on wrapped echo",
      meta: "low",
      body: "The begin-marker regex `PIMC-B{n}(?! ;)` in `src/agent/console.py:118` can match inside the echoed command when the terminal wraps. See [the issue](https://github.com/example/repo/issues/42).",
    },
  ],
})

export function GenerativeViewInlineExample() {
  const [opened, setOpened] = React.useState<string | null>(null)
  const onFileClick = React.useCallback((path: string, line?: number) => {
    setOpened(line ? `${path} · line ${line}` : path)
  }, [])
  return (
    <div className="w-full max-w-2xl space-y-3">
      <GenerativeView view={VIEW} onFileClick={onFileClick} />
      <p className="text-[12px] text-muted-foreground">
        {opened ? `Opened ${opened}` : "Click a file chip."}
      </p>
    </div>
  )
}
