"use client"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const ANSWER = `Searched the tracker for open bugs on the login flow — two are blocking the release.

\`\`\`ui
[
  {
    "type": "stats",
    "items": [
      { "label": "Open", "value": 7 },
      { "label": "Blockers", "value": 2, "tone": "danger" },
      { "label": "Done this week", "value": 5, "tone": "success" }
    ]
  },
  {
    "type": "list",
    "items": [
      { "title": "PROJ-412 Login loops after SSO timeout", "meta": "Blocker", "tone": "danger", "href": "https://tracker.example.com/PROJ-412" },
      { "title": "PROJ-398 Session cookie not renewed", "meta": "Blocker", "tone": "danger" },
      { "title": "PROJ-377 Remember-me checkbox ignored", "meta": "Minor", "body": "Reproduces only in Safari 18." }
    ]
  },
  { "type": "progress", "label": "Release 4.2 readiness", "value": 68 }
]
\`\`\`

PROJ-412 is the one the review above fixes.`

export function GenerativeViewMarkdownExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown>{ANSWER}</MessageMarkdown>
    </div>
  )
}
