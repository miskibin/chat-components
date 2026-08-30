import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `### Retry budget

The client retries with exponential backoff, so the wait before attempt $n$ is
$t_n = t_0 \\cdot 2^{\\,n-1}$.

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
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
