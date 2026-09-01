"use client"

import { useCallback } from "react"
import { Share2, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

const MESSAGES: ChatMessageData[] = [
  { id: "1", sender: "user", content: "Summarise the failing job." },
  {
    id: "2",
    sender: "assistant",
    content:
      "The `typecheck` job fails on `docs/component-doc.ts` — a slug was added to the nav without a page.",
  },
]

const actionButton =
  "inline-grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-3.5"

/**
 * `renderActions` runs per turn, so feedback controls can differ by sender or
 * by state. Keep it wrapped in `useCallback` — the rows are memoized, and a
 * fresh closure each render defeats that.
 */
export function MessageListActionsExample() {
  const renderActions = useCallback((message: ChatMessageData) => {
    if (message.sender !== "assistant") return null
    return (
      <div className="mb-6 flex items-center gap-1">
        <button
          type="button"
          title="Good answer"
          className={actionButton}
          onClick={() => toast.success("Thanks")}
        >
          <ThumbsUp />
        </button>
        <button
          type="button"
          title="Bad answer"
          className={actionButton}
          onClick={() => toast.error("Noted")}
        >
          <ThumbsDown />
        </button>
        <button
          type="button"
          title="Share"
          className={actionButton}
          onClick={() => toast.message(`Shared message ${message.id}`)}
        >
          <Share2 />
        </button>
      </div>
    )
  }, [])

  return (
    <MessageList
      className="h-[300px] w-full"
      messages={MESSAGES}
      renderActions={renderActions}
    />
  )
}
