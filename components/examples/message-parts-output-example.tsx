"use client"

import { MessageToolCall } from "@/components/ui/message-parts"

/** What a harness actually hands back, reminder and terminal colour included. */
const SHELL_OUTPUT = [
  "\u001B[32mPASS\u001B[0m tests/reducer.test.ts",
  "\u001B[31mFAIL\u001B[0m tests/stream.test.ts",
  "  ● stream › retries once",
  "",
  "Tests: 1 failed, 24 passed",
  "<system-reminder>The user has not seen this output. Do not assume it is correct.</system-reminder>",
].join("\n")

export function MessagePartsOutputExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col">
      <MessageToolCall
        defaultOpen
        tool={{
          id: "shell-1",
          name: "shell",
          status: "error",
          input: JSON.stringify(
            {
              command: "/bin/zsh -lc 'cd packages/core && npm test -- stream'",
              description: "Run the stream tests to see the failure",
              timeout: 120_000,
            },
            null,
            2
          ),
          output: SHELL_OUTPUT,
        }}
      />
      <MessageToolCall
        defaultOpen
        tool={{
          id: "mcp-1",
          name: "mcp__github__list_issues",
          status: "done",
          input: JSON.stringify({ owner: "miskibin", repo: "agent-ui", state: "open" }),
          output: '[{"number":12,"title":"Plan card is unreadable","state":"open"}]',
        }}
      />
    </div>
  )
}
