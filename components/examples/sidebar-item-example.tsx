"use client"

import { Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  ChatSidebarItemList,
  SidebarEmptyState,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const INITIAL: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming markdown bugs", status: "streaming" },
  { id: "3", title: "Retry failed tool call", status: "fault" },
  { id: "4", title: "Tailwind v4 tokens", status: "pending" },
  { id: "5", title: "Registry build script" },
]

/**
 * Rows are memoized, so the list keeps the handlers you pass stable for you.
 * Right-click a row for rename / pin / delete plus any extra `menuActions`.
 */
export function SidebarItemExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("2")

  return (
    <div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
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
        onDelete={(id) =>
          setItems((prev) => prev.filter((item) => item.id !== id))
        }
        getMenuActions={(item) => [
          {
            id: "duplicate",
            label: "Duplicate",
            icon: <Copy className="size-3.5" />,
            onSelect: () => toast.message(`Duplicated "${item.title}"`),
          },
        ]}
      />
    </div>
  )
}
