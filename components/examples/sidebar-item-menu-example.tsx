"use client"

import { Copy, Download, Share2 } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import {
  ChatSidebarItemList,
  type ChatSidebarItemData,
  type SidebarItemMenuAction,
} from "@/components/ui/chat-sidebar"

const INITIAL: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming markdown bugs" },
  { id: "3", title: "Registry build script" },
]

/**
 * `getMenuActions` entries render above the built-in rename / pin / delete
 * group; `separatorBefore` starts a new group. Right-click any row.
 */
export function SidebarItemMenuExample() {
  const [items, setItems] = useState(INITIAL)
  const [activeId, setActiveId] = useState("2")

  const getMenuActions = useCallback(
    (item: ChatSidebarItemData): SidebarItemMenuAction[] => [
      {
        id: "duplicate",
        label: "Duplicate",
        icon: <Copy className="size-3.5" />,
        onSelect: () => toast.message(`Duplicated “${item.title}”`),
      },
      {
        id: "share",
        label: "Copy share link",
        icon: <Share2 className="size-3.5" />,
        onSelect: () => toast.success("Link copied"),
      },
      {
        id: "export",
        label: "Export as JSON",
        icon: <Download className="size-3.5" />,
        separatorBefore: true,
        onSelect: () => toast.message(`Exported ${item.id}.json`),
      },
    ],
    []
  )

  return (
    <div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
      <ChatSidebarItemList
        items={items}
        activeId={activeId}
        draggable={false}
        onSelect={setActiveId}
        onDelete={(id) =>
          setItems((prev) => prev.filter((item) => item.id !== id))
        }
        getMenuActions={getMenuActions}
      />
    </div>
  )
}
