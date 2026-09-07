"use client"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `> [!NOTE]
> The retry budget is per request, not per session.

> [!TIP]
> Set \`RETRY_BASE_MS\` to shorten the first wait while you are debugging.

> [!IMPORTANT]
> Cached tokens still count against the context window.

> [!WARNING]
> Raising \`maxDuration\` above 60 breaks every production deploy.

> [!CAUTION]
> \`git checkout --\` discards the file's uncommitted changes.

> An ordinary quote, with \`[!NOTE] aside\` on one line — which GitHub does not
> read as an alert either.
`

export function MessageMarkdownAlertsExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
