"use client"

import * as React from "react"

import {
  NOTE_PENDING_LANGUAGE,
  NoteEditor,
  type NoteEditorAnchor,
  type NoteEditorAsk,
} from "@/components/ui/note-editor"

const NOTE = `# Login service

Select a sentence, press ⌘E (or the sparkles button in the toolbar) and ask for a change.

The client posts credentials to the gateway, which checks them against the user store and returns a session token.

Tokens expire after an hour and are refreshed silently.
`

const DIAGRAM = `\`\`\`mermaid
sequenceDiagram
  Client->>Gateway: POST /login
  Gateway->>User store: verify
  User store-->>Gateway: ok
  Gateway-->>Client: session token
\`\`\``

/** Inserts `block` after the paragraph that holds `text`, or at the end. */
function insertAfter(markdown: string, text: string, block: string) {
  const blocks = markdown.split(/\n{2,}/)
  const needle = text.split("\n")[0].trim()
  const index = blocks.findIndex((part) => part.includes(needle))
  blocks.splice(index < 0 ? blocks.length : index + 1, 0, block)
  return blocks.join("\n\n")
}

/**
 * A scripted agent: the ask becomes a thread on the selected words, a pending
 * block lands where the answer will go, and a moment later the block is
 * replaced — every step is just a new `value`.
 */
export function NoteEditorAgentExample() {
  const [markdown, setMarkdown] = React.useState(NOTE)
  const [anchors, setAnchors] = React.useState<NoteEditorAnchor[]>([])
  const [log, setLog] = React.useState<string[]>([])
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const onAsk = (ask: NoteEditorAsk) => {
    const id = `t${Date.now()}`
    const pending = `\`\`\`${NOTE_PENDING_LANGUAGE}\nDrawing: ${ask.instruction}\n\`\`\``
    setAnchors((prev) => [...prev, { id, text: ask.text, state: "running" }])
    setLog((prev) => [`“${ask.instruction}” — working…`, ...prev])
    setMarkdown((prev) => insertAfter(prev, ask.text, pending))
    timers.current.push(
      setTimeout(() => {
        setMarkdown((prev) => prev.replace(pending, DIAGRAM))
        setAnchors((prev) => prev.map((a) => (a.id === id ? { ...a, state: "done" } : a)))
        setLog((prev) => ["Added a sequence diagram below the paragraph.", ...prev])
      }, 1800)
    )
  }

  return (
    <div className="grid h-[460px] w-full grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-[1fr_200px]">
      <div className="min-h-0 overflow-y-auto">
        <NoteEditor
          value={markdown}
          onChange={setMarkdown}
          anchors={anchors}
          onAsk={onAsk}
          onAnchorClick={(id) => setLog((prev) => [`Opened thread ${id}`, ...prev])}
        />
      </div>
      <ol className="text-muted-foreground hidden min-h-0 space-y-2 overflow-y-auto border-l p-3 text-[12px] sm:block">
        {log.length === 0 ? <li>Agent activity shows here.</li> : null}
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
    </div>
  )
}
