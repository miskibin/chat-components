"use client"

import { useState } from "react"

import {
  ChatSidebarItemList,
  SidebarEmptyState,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const INITIAL: ChatSidebarItemData[] = [
  { id: "1", title: "Walk me through the markdown renderer" },
  { id: "2", title: "Use the ask tool so I can try the UI" },
  { id: "3", title: "Streaming markdown bugs", status: "streaming" },
  { id: "4", title: "Retry failed tool call", status: "fault" },
  { id: "5", title: "Tailwind v4 tokens", status: "pending" },
  { id: "6", title: "Registry build script" },
]

/**
 * Shift-click a range, Ctrl/Cmd-click to toggle. A bar appears once two or
 * more rows are selected — Pin, Delete, or Escape to clear.
 */
export function SidebarSelectionExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("2")
  const [log, setLog] = useState("Shift-click a range, then Delete or Pin.")

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
        <ChatSidebarItemList
          items={items}
          activeId={activeId}
          draggable={false}
          emptyState={<SidebarEmptyState>No chats yet.</SidebarEmptyState>}
          onSelect={setActiveId}
          onRename={(id, title) =>
            setItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, title } : item))
            )
          }
          onTogglePin={(id, pinned) =>
            setItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, pinned } : item))
            )
          }
          onDelete={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id))
            setLog("Deleted 1 chat")
          }}
          onDeleteMany={(ids) => {
            const remove = new Set(ids)
            setItems((prev) => prev.filter((item) => !remove.has(item.id)))
            setLog(`Deleted ${ids.length} chats`)
          }}
        />
      </div>
      <p className="px-1 text-[11px] text-muted-foreground">{log}</p>
    </div>
  )
}
