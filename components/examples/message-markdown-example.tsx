import { MessageMarkdown } from "@/components/ui/message-markdown"

/** A 96×32 gradient, inlined the way an agent hands back a screenshot. */
const INLINE_PNG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAIAAABiouoDAAABS0lEQVR42u3QA1YEABQF0FaQbdu2m6Zpsm3btm1bS/toF62jc95dwrUoM1BpIZUYyVxEZhMVF5PJTKYSKiolYxkZy6mwggyVZKiigmrKr6H8Wsqro9x6ym2gnEbKbqKsZspqocxWzmjjjHZO7+C0Tk7r4tRuTunhlF5O7uOkfk4a4MRBThjihGGOH+G4UY4d49hxjpng6EmOnuKoaY6c4chZiZiT8HkJX5CwRQldktBlCVmR4FUJXpOgdQnckIBNCdgS/23x2xG/XfHdE5998TkQ70PxOhKvY/E8EY9T9ThT93N1u1C3S3W9Updrdb5R51t1ulPHe3V8UIdHtX9S+2e1e1HbV7V9U5t3tf5Q60+1+lLLb7X8+bVAEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQgv5v0B8k63mP6qmfKgAAAABJRU5ErkJggg==`

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
- Images, including ones inlined as \`data:\` URIs

![Latency band](${INLINE_PNG})
`

export function MessageMarkdownExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
