"use client"

import * as React from "react"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `### Backoff

The wait doubles per attempt, and the policy lives in \`lib/retry/backoff.ts\`.

1. Read [the RFC](https://example.com/rfc) first.
2. Then change **BASE_MS** and re-run \`npm test\`.

| Attempt | Delay |
| --- | --- |
| 1 | 250ms |
| 2 | 500ms |

\`\`\`ts
const delay = (attempt: number) => BASE_MS * 2 ** (attempt - 1)
\`\`\`
`

/**
 * Select any of the answer and copy it. The clipboard gets markdown — the
 * heading, the ordered list, the link, the table and the fence all survive —
 * rather than the flattened text the browser would otherwise put there.
 */
export function MessageMarkdownCopyExample() {
  const [copied, setCopied] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div
        onCopyCapture={(event) => {
          // The component has already written the payload by the time this
          // runs — read it back only to show what landed on the clipboard.
          setCopied(event.clipboardData.getData("text/plain"))
        }}
      >
        <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
      </div>
      <div className="rounded-md border bg-muted/40 p-3">
        <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">
          What the clipboard got
        </p>
        <pre className="m-0 max-h-40 overflow-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-foreground/80">
          {copied ?? "Select part of the answer above and copy it."}
        </pre>
      </div>
    </div>
  )
}
