"use client"

import { toast } from "sonner"

import {
  MessageArtifact,
  MessageCode,
  MessageReasoning,
  MessageToolCall,
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
            id: "t3",
            name: "shell",
            status: "error",
            input: '{ "command": "npm test -- reducer" }',
            output: "1 failing",
          },
        ]}
      />

      <MessageToolCall
        defaultOpen
        tool={{
          id: "t2",
          name: "Read",
          status: "done",
          input: JSON.stringify(
            { path: "lib/reducer.ts", offset: 1, limit: 40 },
            null,
            2
          ),
          output: [
            "4 lines",
            "export function applyPatch(state: State, patch: Patch): State {",
            "  return { ...state, ...patch }",
            "}",
            "",
          ].join("\n"),
        }}
      />

      <MessageToolCall
        defaultOpen
        tool={{
          id: "t4",
          name: "Edit",
          status: "done",
          input: JSON.stringify(
            {
              path: "lib/reducer.ts",
              // Cursor editToolCall shape after completion (diffString → args.diff).
              diff: [
                "--- a/lib/reducer.ts",
                "+++ b/lib/reducer.ts",
                "@@ -1,3 +1,4 @@",
                " export function applyPatch(state: State, patch: Patch): State {",
                "+  if (!patch) return state",
                "   return { ...state, ...patch }",
                " }",
              ].join("\n"),
            },
            null,
            2
          ),
          output: "+1 −0",
        }}
      />

      <MessageToolCall
        tool={{
          id: "t5",
          name: "Write",
          status: "done",
          input: JSON.stringify(
            {
              path: "lib/apply-patch.test.ts",
              // Cursor writeToolCall / edit streamContent before completion.
              streamContent:
                'import { applyPatch } from "./reducer"\n\ntest("ignores null patch", () => {\n  const state = { count: 1 }\n  expect(applyPatch(state, null)).toBe(state)\n})\n',
            },
            null,
            2
          ),
          output: "+6",
        }}
      />

      <MessageCode
        block={{
          language: "ts",
          title: "lib/reducer.ts",
          code: `export function applyPatch(state: State, patch: Patch): State {
  if (!patch) return state
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
