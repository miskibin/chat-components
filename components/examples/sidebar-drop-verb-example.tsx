"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { Archive, Pin } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SidebarCollapsibleSection,
  type ChatSidebarItemData,
  type SidebarDndDrop,
} from "@/components/ui/chat-sidebar"

const INITIAL: Record<"pinned" | "recent" | "archive", ChatSidebarItemData[]> = {
  pinned: [{ id: "1", title: "Release checklist", pinned: true }],
  recent: [
    { id: "2", title: "Streaming markdown bugs" },
    { id: "3", title: "Registry build script" },
  ],
  archive: [{ id: "4", title: "Old migration notes", recede: true }],
}

type ListId = keyof typeof INITIAL

/**
 * Dragging a row into another list says what the drop would *do*: the lifted
 * row carries the verb the provider resolved. Archived rows are frozen —
 * `canDrop` rejects them, and a rejected target falls back to the source rather
 * than to the next-nearest row, so nothing lands somewhere you did not aim at.
 */
export function SidebarDropVerbExample() {
  const [lists, setLists] = useState(INITIAL)

  const listOf = (id: string) =>
    (Object.keys(lists) as ListId[]).find((listId) =>
      lists[listId].some((item) => item.id === id)
    )

  function handleDrop(drop: SidebarDndDrop) {
    if (drop.kind !== "reorder") return
    const from = drop.fromListId as ListId
    const to = drop.listId as ListId
    setLists((previous) => {
      if (from === to) {
        return { ...previous, [to]: arrayMove(previous[to], drop.from, drop.to) }
      }
      const moved = previous[from].find((item) => item.id === drop.itemId)
      if (!moved) return previous
      const next = [...previous[to]]
      next.splice(drop.to, 0, {
        ...moved,
        pinned: to === "pinned",
        recede: to === "archive",
      })
      return {
        ...previous,
        [from]: previous[from].filter((item) => item.id !== drop.itemId),
        [to]: next,
      }
    })
  }

  return (
    <ChatSidebarDnd
      zones={[]}
      onDrop={handleDrop}
      canDrop={(itemId) => listOf(itemId) !== "archive"}
      resolveDropVerb={(_fromListId, toListId) =>
        toListId === "pinned"
          ? { label: "Pin", icon: <Pin aria-hidden className="size-3" /> }
          : toListId === "archive"
            ? {
                label: "Archive",
                icon: <Archive aria-hidden className="size-3" />,
              }
            : { label: "Move" }
      }
      renderOverlay={(id) => {
        const item = Object.values(lists)
          .flat()
          .find((candidate) => candidate.id === id)
        return item ? <ChatSidebarItemGhost item={item} /> : null
      }}
    >
      <div className="flex w-full max-w-xs flex-col gap-1 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        {(["pinned", "recent", "archive"] as const).map((listId) => (
          <SidebarCollapsibleSection
            key={listId}
            title={listId}
            rule
            open
            onToggle={() => {}}
            count={lists[listId].length}
          >
            <ChatSidebarItemList
              listId={listId}
              items={lists[listId]}
              sortable
              motion
              groupPinned={false}
              emptyState={
                <p className="px-2 py-2 text-[11px] text-muted-foreground">
                  Drop a chat here
                </p>
              }
            />
          </SidebarCollapsibleSection>
        ))}
      </div>
    </ChatSidebarDnd>
  )
}
