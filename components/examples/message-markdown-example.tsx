"use client"

import { toast } from "sonner"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `### Retry budget

The client retries with exponential backoff, so the wait before attempt $n$ is
$t_n = t_0 \\cdot 2^{\\,n-1}$.

The policy lives in \`lib/retry/backoff.ts\`, and \`app/api/chat/route.ts:88\` is
the only caller — both render as file chips, while \`BASE_MS\` stays plain code.

| Attempt | Delay |
| --- | --- |
| 1 | 250ms |
| 2 | 500ms |
| 3 | 1s |

\`\`\`ts
const delay = (attempt: number) => BASE_MS * 2 ** (attempt - 1)
\`\`\`

- GFM tables, task lists, and footnotes
- Shiki-highlighted code with a copy button
- KaTeX for inline and block math
`

export function MessageMarkdownExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown onFileClick={(path) => toast.message(`Open ${path}`)}>
        {MARKDOWN}
      </MessageMarkdown>
    </div>
  )
}
