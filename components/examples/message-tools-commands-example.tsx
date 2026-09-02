"use client"

import { MessageToolCalls } from "@/components/ui/message-parts"

const COMMANDS = [
  "/bin/zsh -lc 'cd /repo && npm test'",
  'bash -lc "cd packages/web && git status --short"',
  "sh -c 'cargo build --release'",
  "/usr/bin/env bash -c 'cd services/api; python3 -m pytest tests/'",
  "cmd /c dir",
]

const TOOLS = COMMANDS.map((command, index) => ({
  id: `cmd-${index}`,
  name: "shell",
  status: (index === 3 ? "error" : "done") as "done" | "error",
  input: JSON.stringify({ command }),
  output: index === 3 ? "2 failed, 41 passed" : "ok",
}))

/**
 * The headline names the command, not the shell the harness wrapped it in:
 * `/bin/zsh -lc 'cd /repo && npm test'` reads as “Ran npm test”. Expand a row
 * — or hover the summary — for the line as it was actually run.
 */
export function MessageToolsCommandsExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageToolCalls tools={TOOLS} collapseAt={99} />
    </div>
  )
}
