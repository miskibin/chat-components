"use client"

import { MessageToolCalls } from "@/components/ui/message-parts"

/**
 * Six calls, three kinds of work. The folded row says what the turn actually
 * did — “Read 2 files, ran 2 commands, and changed 1 file” — and the two edits
 * to the same file count once, because one file changed.
 */
const TOOLS = [
  {
    id: "t1",
    name: "read_file",
    status: "done" as const,
    input: JSON.stringify({ path: "app/api/chat/route.ts" }),
    output: "…",
  },
  {
    id: "t2",
    name: "read_file",
    status: "done" as const,
    input: JSON.stringify({ path: "lib/retry/backoff.ts" }),
    output: "…",
  },
  {
    id: "t3",
    name: "edit_file",
    status: "done" as const,
    input: JSON.stringify({
      path: "lib/retry/backoff.ts",
      oldString: "const BASE_MS = 250",
      newString: "const BASE_MS = 500",
    }),
  },
  {
    id: "t4",
    name: "edit_file",
    status: "done" as const,
    input: JSON.stringify({
      path: "lib/retry/backoff.ts",
      oldString: "attempt - 1",
      newString: "attempt",
    }),
  },
  {
    id: "t5",
    name: "shell",
    status: "done" as const,
    input: JSON.stringify({ command: "npm test -- backoff" }),
    output: "42 passed",
  },
  {
    id: "t6",
    name: "shell",
    status: "done" as const,
    input: JSON.stringify({
      command: "sudo -u ci env CI=1 bash -lc 'npm run lint | tee lint.log'",
    }),
    output: "ok",
  },
]

const READS = TOOLS.slice(0, 2)

export function MessageToolsSummaryExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <MessageToolCalls tools={TOOLS} collapseAt={3} defaultOpen={false} />
      {/* One kind of work: the summary and the glyph both narrow to it. */}
      <MessageToolCalls tools={READS} collapseAt={2} defaultOpen={false} />
    </div>
  )
}
