"use client"

import { Bookmark, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { Message, type ActionButton } from "@/components/ui/message"

/**
 * `actionButtons` fill the row that fades in under a turn on hover or focus.
 * Icons are normalised to the built-in size; `position: "outside"` sorts a
 * button after the rest of the group.
 */
const ACTIONS: ActionButton[] = [
  {
    id: "retry",
    icon: <RotateCcw />,
    title: "Regenerate",
    onClick: () => toast.message("Regenerating"),
  },
  {
    id: "up",
    icon: <ThumbsUp />,
    title: "Good answer",
    onClick: () => toast.success("Thanks"),
  },
  {
    id: "down",
    icon: <ThumbsDown />,
    title: "Bad answer",
    onClick: () => toast.error("Noted"),
  },
  {
    id: "save",
    icon: <Bookmark />,
    title: "Save",
    position: "outside",
    onClick: () => toast.message("Saved"),
  },
]

export function MessageActionsExample() {
  return (
    <div className="w-full max-w-2xl">
      <Message
        sender="assistant"
        actionButtons={ACTIONS}
        content="Hover this answer — the action row sits under it."
      />
    </div>
  )
}
