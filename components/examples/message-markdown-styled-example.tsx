import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `## Registry build

The build resolves every path in \`registry.json\` before writing anything, so a
stale entry fails loudly instead of shipping a broken item.

> Run it after any component or registry edit.

1. Read \`registry.json\`
2. Inline each file
3. Write \`public/r/*.json\`
`

/**
 * The wrapper carries `message-markdown`, and everything inside is ordinary
 * HTML — so element selectors from the wrapper restyle the prose.
 */
export function MessageMarkdownStyledExample() {
  return (
    <div className="w-full max-w-2xl [&_[data-slot=message-markdown]_blockquote]:border-l-primary [&_[data-slot=message-markdown]_h2]:text-primary [&_[data-slot=message-markdown]]:text-[14px] [&_[data-slot=message-markdown]]:leading-7">
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
