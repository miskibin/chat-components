"use client"

import * as React from "react"
import { ArrowUp, Sparkles, X } from "lucide-react"

import {
  NOTE_PENDING_LANGUAGE,
  NoteEditor,
  type NoteEditorAnchor,
  type NoteEditorHandle,
  type NoteEditorSelection,
} from "@/components/ui/note-editor"

const NOTE = `# Login service

Select a sentence — it lands in the prompt below — and ask for a change.

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
  const index = needle ? blocks.findIndex((part) => part.includes(needle)) : -1
  blocks.splice(index < 0 ? blocks.length : index + 1, 0, block)
  return blocks.join("\n\n")
}

/**
 * A scripted agent behind a one-line composer: the selection follows the
 * editor into the prompt, the ask becomes a highlight on those words, a
 * pending block lands where the answer goes, and a moment later it is
 * replaced — every step is just a new `value`.
 */
export function NoteEditorAgentExample() {
  const [markdown, setMarkdown] = React.useState(NOTE)
  const [anchors, setAnchors] = React.useState<NoteEditorAnchor[]>([])
  const [selection, setSelection] = React.useState<NoteEditorSelection | null>(null)
  const [prompt, setPrompt] = React.useState("")
  const editor = React.useRef<NoteEditorHandle>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const send = () => {
    const instruction = prompt.trim()
    if (!instruction) return
    const id = `t${Date.now()}`
    const words = selection?.text ?? ""
    const pending = `\`\`\`${NOTE_PENDING_LANGUAGE}\nDrawing: ${instruction}\n\`\`\``
    if (words) setAnchors((prev) => [...prev, { id, text: words, state: "running" }])
    setMarkdown((prev) => insertAfter(prev, words, pending))
    setPrompt("")
    editor.current?.clearSelection()
    timers.current.push(
      setTimeout(() => {
        setMarkdown((prev) => prev.replace(pending, DIAGRAM))
        setAnchors((prev) => prev.map((a) => (a.id === id ? { ...a, state: "done" } : a)))
      }, 1800)
    )
  }

  return (
    <div className="flex h-[480px] w-full flex-col overflow-hidden rounded-lg border">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NoteEditor
          ref={editor}
          value={markdown}
          onChange={setMarkdown}
          anchors={anchors}
          onSelectionChange={setSelection}
          actions={[
            {
              id: "ask",
              label: "Ask the agent",
              icon: <Sparkles />,
              needsSelection: true,
              movesFocus: true,
              onSelect: () => input.current?.focus(),
            },
          ]}
        />
      </div>
      <form
        className="bg-background m-2 flex flex-col gap-1 rounded-xl border px-2.5 py-1.5"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {selection ? (
          <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-[11.5px]">
            <span className="bg-primary/60 h-3 w-0.5 shrink-0 rounded-full" />
            <span className="truncate">{selection.text}</span>
            <button
              type="button"
              aria-label="Drop the selection"
              onClick={() => editor.current?.clearSelection()}
              className="hover:text-foreground focus-visible:ring-ring/50 rounded outline-none focus-visible:ring-[3px]"
            >
              <X className="size-3" />
            </button>
          </span>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            ref={input}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={selection ? "Ask about the selection…" : "Ask the agent…"}
            className="placeholder:text-muted-foreground h-7 min-w-0 flex-1 bg-transparent text-[13px] outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!prompt.trim()}
            className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-grid size-6 place-items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-40"
          >
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
