"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  FilePreview,
  filePreviewFromTool,
  type FilePreviewFile,
} from "@/components/ui/file-preview"
import {
  MessageToolCall,
  type MessageToolCallData,
} from "@/components/ui/message-parts"

const FILE = [
  "export type Reducer = (state: State, event: Event) => State",
  "",
  "export function createStore(reducer: Reducer, initial: State) {",
  "  let state = initial",
  "  const listeners = new Set<() => void>()",
  "",
  "  function dispatch(event: Event) {",
  "    const next = reducer(state, event)",
  "    if (next === state) return",
  "    state = next",
  "    for (const listener of listeners) listener()",
  "  }",
  "",
  "  return { dispatch, getState: () => state }",
  "}",
].join("\n")

const EDIT: MessageToolCallData = {
  id: "edit-1",
  name: "Edit",
  status: "done",
  input: JSON.stringify({
    path: "lib/store/reducer.ts",
    diff: [
      "@@ -7,3 +7,5 @@",
      "   function dispatch(event: Event) {",
      "     const next = reducer(state, event)",
      "+    if (next === state) return",
      "     state = next",
      "+    for (const listener of listeners) listener()",
      "   }",
    ].join("\n"),
    streamContent: FILE,
  }),
  output: "+2 −0",
}

const READ: MessageToolCallData = {
  id: "read-1",
  name: "Read",
  status: "done",
  input: JSON.stringify({ path: "lib/store/reducer.ts", offset: 1 }),
  output: `15 lines\n${FILE}`,
}

export function FilePreviewExample() {
  const [file, setFile] = React.useState<FilePreviewFile | null>(() =>
    filePreviewFromTool(EDIT)
  )

  const openFile = React.useCallback((tool: MessageToolCallData) => {
    setFile(filePreviewFromTool(tool))
  }, [])

  const close = React.useCallback(() => {
    setFile(null)
    toast.message("Panel closed — press a tool row to reopen it")
  }, [])

  return (
    <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-lg border bg-background">
      <div className="shrink-0 border-b px-3 py-2">
        <MessageToolCall tool={EDIT} onOpenFile={openFile} />
        <MessageToolCall tool={READ} onOpenFile={openFile} />
      </div>
      <div className="min-h-0 flex-1">
        {file ? (
          <FilePreview file={file} onClose={close} />
        ) : (
          <p className="px-3 py-2 text-[13px] text-muted-foreground">
            Click a tool headline to open its file.
          </p>
        )}
      </div>
    </div>
  )
}
