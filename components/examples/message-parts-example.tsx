"use client"

import { toast } from "sonner"

import {
  MessageArtifact,
  MessageCode,
  MessageReasoning,
  MessageToolCalls,
} from "@/components/ui/message-parts"

export function MessagePartsExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col">
      <MessageReasoning duration={7} defaultOpen>
        {"The failing test only touches the reducer, so the regression is most likely in `applyPatch`."}
      </MessageReasoning>

      <MessageToolCalls
        tools={[
          {
            id: "t1",
            name: "grep",
            status: "done",
            input: '{ "pattern": "applyPatch" }',
            output: "3 matches",
          },
          {
            id: "t2",
            name: "read",
            status: "done",
            input: '{ "path": "lib/reducer.ts" }',
          },
          {
            id: "t3",
            name: "shell",
            status: "error",
            input: '{ "command": "npm test -- reducer" }',
            output: "1 failing",
          },
        ]}
      />

      <MessageCode
        block={{
          language: "ts",
          title: "lib/reducer.ts",
          code: `export function applyPatch(state: State, patch: Patch): State {
  return { ...state, ...patch }
}`,
        }}
      />

      <MessageArtifact
        artifact={{
          id: "a1",
          title: "coverage.csv",
          kind: "table",
          summary: "42 rows",
          content: "file,statements\nlib/reducer.ts,91%\nlib/store.ts,78%",
          onOpen: () => toast.message("Open the artifact in your own viewer"),
        }}
      />
    </div>
  )
}
