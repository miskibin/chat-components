"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import { ChatInput, type ChatInputHandle } from "@/components/ui/chat-input"

const controlClass =
  "inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"

/**
 * `ref` exposes `focus`, `getDraft`, `setDraft` and `insertText`, which is
 * what a host needs to quote a selection, prefill a template, or stash a
 * half-written message and bring it back later (⌘S does the same).
 */
export function ChatInputHandleExample() {
  const composer = useRef<ChatInputHandle>(null)
  const [stashed, setStashed] = useState<string[]>([])

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          className={controlClass}
          onClick={() => composer.current?.insertText("> quoted line\n")}
        >
          Insert quote
        </button>
        <button
          type="button"
          className={controlClass}
          onClick={() =>
            composer.current?.setDraft({
              text: "Review the diff and list the risky changes.",
              skills: ["review"],
            })
          }
        >
          Prefill template
        </button>
        <button
          type="button"
          className={controlClass}
          onClick={() => {
            const draft = composer.current?.getDraft()
            if (!draft?.text.trim()) {
              toast.message("Nothing to stash")
              return
            }
            setStashed((prev) => [...prev, draft.text])
            composer.current?.setDraft({ text: "", files: [], skills: [] })
          }}
        >
          Stash draft
        </button>
      </div>

      <ChatInput
        ref={composer}
        defaultValue="Draft me."
        skills={[{ name: "review", description: "Review a diff" }]}
        placeholder="⌘S stashes, the buttons drive the handle"
        onStash={({ text }) => setStashed((prev) => [...prev, text])}
        onSend={({ text }) => toast("Sent", { description: text })}
      />

      {stashed.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {stashed.map((text, i) => (
            <li key={`${text}-${i}`}>
              <button
                type="button"
                title="Restore into the composer"
                onClick={() => {
                  setStashed((prev) => prev.filter((_, idx) => idx !== i))
                  composer.current?.setDraft({ text })
                  composer.current?.focus()
                }}
                className="w-full truncate rounded-md border bg-muted/40 px-2 py-1 text-left text-[12px] text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
