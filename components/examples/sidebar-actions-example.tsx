"use client"

import { BellOff, Check } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebarItemList,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const INITIAL: ChatSidebarItemData[] = [
  {
    id: "1",
    title: "Retry the failed tool call",
    meta: "2m",
    status: "pending",
  },
  {
    id: "2",
    title: "Streaming markdown bugs",
    meta: "now",
    status: "streaming",
    recede: true,
  },
  {
    id: "3",
    title: "Registry build script",
    meta: "1h",
    status: "streaming",
    recede: true,
  },
  { id: "4", title: "Release checklist", meta: "1d" },
]

const ACTION_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"

/**
 * `renderActions` fills the same slot the meta label sits in: the timestamp at
 * rest, the controls on hover or keyboard focus. Tab through the list to reach
 * them without a pointer — the cluster reveals itself on `focus-visible`.
 *
 * The two streaming rows carry `recede`: background work dims until you hover
 * it, so the row that is actually waiting on an answer is the one that reads.
 */
export function SidebarActionsExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("1")
  const [log, setLog] = useState("Hover a row, or Tab into the list")

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        <ChatSidebarItemList
          items={items}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
          renderActions={(item) => (
            <>
              <button
                type="button"
                className={ACTION_CLASS}
                aria-label={`Mute ${item.title}`}
                onClick={() => setLog(`Muted “${item.title}”`)}
              >
                <BellOff className="size-3.5" />
              </button>
              <button
                type="button"
                className={ACTION_CLASS}
                onClick={() => {
                  setLog(`Settled “${item.title}”`)
                  setItems((previous) =>
                    previous.filter((candidate) => candidate.id !== item.id)
                  )
                }}
              >
                <Check className="size-3.5" />
                Settle
              </button>
            </>
          )}
        />
      </div>
      <p className="px-1 text-[11px] text-muted-foreground">{log}</p>
    </div>
  )
}
