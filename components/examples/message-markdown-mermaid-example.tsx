import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `A turn either answers straight away or takes a detour through a tool:

\`\`\`mermaid
flowchart LR
  A[Prompt] --> B{Tool needed?}
  B -- yes --> C[Run tool]
  C --> D[Answer]
  B -- no --> D
\`\`\`

Sorting the candidates costs $O(n \\log n)$, and the running total is

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$
`

/**
 * Both plugins are wired up already: fence a diagram as \`mermaid\`, write math
 * with \`$…$\` or \`$$…$$\`. The diagram theme follows the resolved next-themes
 * value, so it flips with the page.
 */
export function MessageMarkdownMermaidExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
