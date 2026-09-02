"use client"

import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"

const LOG = Array.from(
  { length: 40 },
  (_, i) =>
    `2025-04-0${(i % 9) + 1} 11:${String(i).padStart(2, "0")}:07  worker#${i % 4} ` +
    `GET /api/chat 200 ${120 + i * 7}ms`
).join("\n")

/**
 * A paste over 800 characters or 3 lines collapses to a chip and leaves a
 * `[Pasted text #1 +40 lines]` placeholder behind (a one-line paste counts
 * characters instead), so the composer stays one line tall. On send the
 * placeholder is swapped back for the full block — edit or delete the
 * placeholder and that paste drops, chip and all.
 */
export function ChatInputPasteExample() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              .writeText(LOG)
              .then(() => toast("Copied 40 lines", { description: "Now paste into the composer." }))
              .catch(() => toast.error("Clipboard blocked — copy some long text by hand."))
          }}
          className="inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Copy a 40-line log
        </button>
        <span className="text-[11px] text-muted-foreground">
          then paste it below
        </span>
      </div>
      <ChatInput
        placeholder="Paste something long"
        onSend={({ text }) =>
          toast(`Sent ${text.split("\n").length} line(s)`, {
            description: `${text.length} characters reached onSend`,
          })
        }
      />
    </div>
  )
}
