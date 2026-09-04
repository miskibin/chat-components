"use client"

import { useCallback, useState } from "react"
import { RotateCw, Share2, ThumbsUp } from "lucide-react"
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

const MODELS = ["sonnet-4.5", "gpt-5"]

const actionButton =
  "inline-grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-3.5"

/**
 * `renderActions` runs per turn, and outside the memoized row — so it may
 * close over whatever the host knows right now. Switch the model here and
 * retry the settled answer: it runs on the model that is picked at the click,
 * not the one that was picked when the turn ended.
 */
export function MessageListActionsExample() {
  const [model, setModel] = useState(MODELS[0])

  const renderActions = useCallback(
    (message: ChatMessageData) => {
      if (message.sender !== "assistant") return null
      return (
        <div className="mb-6 flex items-center gap-1">
          <button
            type="button"
            title={`Retry on ${model}`}
            className={actionButton}
            onClick={() => toast.message(`Retrying on ${model}`)}
          >
            <RotateCw />
          </button>
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
            title="Share"
            className={actionButton}
            onClick={() => toast.message(`Shared message ${message.id}`)}
          >
            <Share2 />
          </button>
        </div>
      )
    },
    [model]
  )

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
        <span>Model</span>
        {MODELS.map((name) => (
          <button
            key={name}
            type="button"
            data-active={name === model}
            onClick={() => setModel(name)}
            className="rounded-md border px-2 py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-muted data-[active=true]:text-foreground"
          >
            {name}
          </button>
        ))}
      </div>
      <MessageList
        className="h-[300px] w-full"
        messages={MESSAGES}
        renderActions={renderActions}
      />
    </div>
  )
}
