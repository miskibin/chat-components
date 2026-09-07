"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { useState } from "react"

import {
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const INITIAL: ChatSidebarItemData[] = [
  { id: "1", title: "Streaming markdown bugs", meta: "now" },
  { id: "2", title: "Registry build script", meta: "4m" },
  { id: "3", title: "Tailwind v4 tokens", meta: "1h" },
  { id: "4", title: "Release checklist", meta: "1d" },
]

const BUTTON_CLASS =
  "cursor-pointer rounded-md border border-sidebar-border px-2 py-1 text-[11px] font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"

let nextId = 5

/**
 * `motion` animates rows between their layout positions — a new chat arriving,
 * one being deleted, a filter changing, a drag being released. Transform and
 * opacity only, 150ms, and it steps aside entirely under
 * `prefers-reduced-motion`.
 */
export function SidebarMotionExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("1")

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() =>
            setItems((previous) => [
              {
                id: String(nextId++),
                title: "Untitled chat",
                meta: "now",
                status: "streaming" as const,
              },
              ...previous,
            ])
          }
        >
          Add
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => setItems((previous) => previous.slice(1))}
          disabled={items.length === 0}
        >
          Remove first
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() =>
            setItems((previous) =>
              previous.length > 1
                ? arrayMove(previous, 0, previous.length - 1)
                : previous
            )
          }
        >
          Send to bottom
        </button>
      </div>
      <ChatSidebarDnd
        zones={[]}
        onReorder={({ from, to }) =>
          setItems((previous) => arrayMove(previous, from, to))
        }
        renderOverlay={(id) => {
          const item = items.find((candidate) => candidate.id === id)
          return item ? <ChatSidebarItemGhost item={item} /> : null
        }}
      >
        <div className="rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
          <ChatSidebarItemList
            listId="recent"
            items={items}
            activeId={activeId}
            sortable
            motion
            onSelect={setActiveId}
            onDelete={(id) =>
              setItems((previous) =>
                previous.filter((candidate) => candidate.id !== id)
              )
            }
            emptyState={
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                Nothing left. Add a row.
              </p>
            }
          />
        </div>
      </ChatSidebarDnd>
    </div>
  )
}
