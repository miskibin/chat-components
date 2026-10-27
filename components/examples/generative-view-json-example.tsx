"use client"

import { MessageToolCall } from "@/components/ui/message-parts"

/** What `gh pr list --json …` printed — no renderer was written for it. */
const OUTPUT = JSON.stringify([
  {
    number: 318,
    title: "Retry dropped streams once",
    state: "OPEN",
    author: { login: "ola" },
    updatedAt: "2026-10-26T09:14:00Z",
    url: "https://github.com/example/app/pull/318",
  },
  {
    number: 315,
    title: "Pin ESLint to 9.x",
    state: "MERGED",
    author: { login: "jan" },
    updatedAt: "2026-10-24T16:02:00Z",
    url: "https://github.com/example/app/pull/315",
  },
  {
    number: 309,
    title: "Draft: theme contrast levels",
    state: "CLOSED",
    author: { login: "ola" },
    updatedAt: "2026-10-20T11:40:00Z",
    url: "https://github.com/example/app/pull/309",
  },
])

export function GenerativeViewJsonExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageToolCall
        defaultOpen
        tool={{
          id: "gh-1",
          name: "Bash",
          status: "done",
          input: JSON.stringify({
            command: "gh pr list --state all --json number,title,state,author,updatedAt,url",
          }),
          output: OUTPUT,
        }}
      />
    </div>
  )
}
