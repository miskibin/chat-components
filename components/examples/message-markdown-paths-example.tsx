"use client"

import { toast } from "sonner"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `Chips, because each one names a file:
\`src/app/page.tsx\`, \`Messages.tsx\`, \`../shared/util.ts\`, \`Makefile\`,
\`.gitignore\`, \`C:\\repo\\app\\globals.css\`, \`/etc/hosts\`,
\`app/api/chat/route.ts:88\` and \`main.pl:42\` — the \`:42\` is what makes that
last one a Perl file rather than a Polish domain.

Plain code, because none of them do: \`example.com\`, \`main.pl\`,
\`/chat/settings\`, \`and/or\`, \`Next.js\`, \`Array.prototype.at\`.

A link works the same way: [the retry policy](lib/retry/backoff.ts:12) opens the
file, while [the docs](https://example.com/retry) stays a link.
`

export function MessageMarkdownPathsExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown
        onFileClick={(path, line) =>
          toast.message(`Open ${path}${line ? `:${line}` : ""}`)
        }
      >
        {MARKDOWN}
      </MessageMarkdown>
    </div>
  )
}
