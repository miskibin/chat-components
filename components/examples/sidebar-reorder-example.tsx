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
  { id: "1", title: "Streaming markdown bugs" },
  { id: "2", title: "Registry build script" },
  { id: "3", title: "Tailwind v4 tokens" },
  { id: "4", title: "Release checklist" },
]

/**
 * Reorder only: no zones, one sortable list. The provider hands you `from` and
 * `to`; applying them stays your call — here with dnd-kit's `arrayMove`.
 */
export function SidebarReorderExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("1")

  return (
    <ChatSidebarDnd
      zones={[]}
      onReorder={({ from, to }) =>
        setItems((prev) => arrayMove(prev, from, to))
      }
      renderOverlay={(id) => {
        const item = items.find((candidate) => candidate.id === id)
        return item ? <ChatSidebarItemGhost item={item} /> : null
      }}
    >
      <div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        <ChatSidebarItemList
          listId="recent"
          items={items}
          activeId={activeId}
          sortable
          onSelect={setActiveId}
        />
      </div>
    </ChatSidebarDnd>
  )
}
