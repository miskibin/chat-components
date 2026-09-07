"use client"

import { toast } from "sonner"

import { MessageMarkdown } from "@/components/ui/message-markdown"

const MARKDOWN = `Retries back off exponentially. The policy lives in
[the backoff helper](lib/retry/backoff.ts), [./docs/retries.md](./docs/retries.md)
writes it up, and [the only caller](app/api/chat/route.ts#L88) is the chat route —
every one of those is a path in the workspace, so it opens where the answer meant
it to. The algorithm itself is plain
[exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), and that
one is a real link.
`

/**
 * A relative markdown link names a file, not a page on the site the transcript
 * is rendered on — so it renders as the same chip an inline-code path does and
 * reaches `onFileClick`. Absolute links keep opening in a new tab.
 */
export function MessageMarkdownLinksExample() {
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
