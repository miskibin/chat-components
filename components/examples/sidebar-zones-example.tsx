"use client"

import { Archive } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SidebarDropZone,
  pinDropZone,
  trashDropZone,
  useSidebarDnd,
  type ChatSidebarItemData,
  type SidebarDndDrop,
  type SidebarDropZoneDef,
} from "@/components/ui/chat-sidebar"

/** Pin and trash are presets; `archive` shows that a zone is just data. */
const ZONES: SidebarDropZoneDef[] = [
  pinDropZone(),
  {
    id: "archive-zone",
    label: "Drop here to archive",
    icon: <Archive className="size-3.5" />,
    tone: "muted",
    action: "archive",
  },
  trashDropZone(),
]

const INITIAL: ChatSidebarItemData[] = [
  { id: "1", title: "Streaming markdown bugs" },
  { id: "2", title: "Registry build script" },
  { id: "3", title: "Tailwind v4 tokens" },
]

/** Renders every declared zone inline, opening them only while a drag runs. */
function InlineZones() {
  const { zones, activeId } = useSidebarDnd()

  return (
    <div className="flex flex-col">
      {zones.map((zone) => (
        <SidebarDropZone
          key={zone.id}
          id={zone.id}
          label={zone.label}
          icon={zone.icon}
          tone={zone.tone}
          visible={!!activeId}
        />
      ))}
    </div>
  )
}

export function SidebarZonesExample() {
  const [items, setItems] = useState(INITIAL)
  const [log, setLog] = useState("Drag a chat onto one of the zones.")

  const handleDrop = (drop: SidebarDndDrop) => {
    if (drop.kind !== "zone") return
    const title =
      items.find((item) => item.id === drop.itemId)?.title ?? drop.itemId

    if (drop.action === "pin") {
      setItems((prev) =>
        prev.map((item) =>
          item.id === drop.itemId ? { ...item, pinned: true } : item
        )
      )
      setLog(`Pinned "${title}"`)
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== drop.itemId))
    setLog(
      drop.action === "archive" ? `Archived "${title}"` : `Deleted "${title}"`
    )
  }

  return (
    <ChatSidebarDnd
      zones={ZONES}
      onDrop={handleDrop}
      renderOverlay={(id) => {
        const item = items.find((candidate) => candidate.id === id)
        return item ? <ChatSidebarItemGhost item={item} /> : null
      }}
    >
      <div className="flex w-full max-w-xs flex-col gap-2 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        <ChatSidebarItemList listId="recent" items={items} draggable />
        <InlineZones />
        <p className="px-2 text-xs text-muted-foreground">{log}</p>
      </div>
    </ChatSidebarDnd>
  )
}
