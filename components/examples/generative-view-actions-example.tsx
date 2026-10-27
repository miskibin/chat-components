"use client"

import * as React from "react"

import { MessageMarkdown } from "@/components/ui/message-markdown"
import type { ViewAction } from "@/lib/generative-view"

const ANSWER = `Posted the review. Two comments need an answer from you before I push patch set 4.

\`\`\`ui
[
  {
    "type": "row",
    "children": [
      { "type": "button", "label": "Push patch set 4", "send": "Push patch set 4 with the fixes.", "tone": "info" },
      { "type": "button", "label": "Show the diff first", "send": "Show me the diff before pushing." }
    ]
  },
  {
    "type": "form",
    "title": "Reply to the reviewer",
    "send": "Reply to the review comments:",
    "submit": "Post reply",
    "fields": [
      { "name": "vote", "label": "Code-Review", "options": ["+1", "0", "-1"] },
      { "name": "message", "label": "Message", "type": "textarea", "placeholder": "Done — validated against the allow-list." },
      { "name": "wip", "label": "Mark as work in progress", "type": "checkbox" }
    ]
  }
]
\`\`\``

export function GenerativeViewActionsExample() {
  const [sent, setSent] = React.useState<string[]>([])
  const handleAction = React.useCallback((action: ViewAction) => {
    setSent((current) => [...current, action.text])
  }, [])
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <MessageMarkdown onViewAction={handleAction}>{ANSWER}</MessageMarkdown>
      {sent.length > 0 ? (
        <div className="space-y-1.5 rounded-md border bg-muted/30 p-2.5">
          <div className="text-[11px] font-medium text-muted-foreground">
            Sent as the next user message
          </div>
          {sent.map((text, index) => (
            <pre
              key={index}
              className="m-0 font-mono text-[12px] whitespace-pre-wrap"
            >
              {text}
            </pre>
          ))}
        </div>
      ) : null}
    </div>
  )
}
