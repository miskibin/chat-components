"use client"

import { MessagesSquare } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebarItemList,
  SidebarItemBadge,
  SidebarItemStatusDot,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const THREADS: ChatSidebarItemData[] = [
  {
    id: "release",
    title: "Release checklist for the registry",
    pinned: true,
    subtitle: (
      <SidebarItemBadge folder="~/code/chat-components" branch="main" />
    ),
    meta: "2h ago",
  },
  {
    id: "streaming",
    title: "Streaming markdown bugs",
    status: "streaming",
    subtitle: (
      <SidebarItemBadge
        folder="~/code/agent-ui"
        branch="fix/streaming-flicker"
      />
    ),
    meta: (
      <>
        <MessagesSquare className="mr-1 inline size-3 align-[-2px]" />
        24
      </>
    ),
  },
  {
    id: "tokens",
    title: "Tailwind v4 token audit",
    subtitle: <SidebarItemBadge folder="~/code/agent-ui/packages/theme" />,
    meta: "yesterday",
  },
  {
    id: "scratch",
    title: "Scratch thread",
    subtitle: "Haiku 4.5 · 3 files attached",
  },
  { id: "indexing", title: "Indexing the docs site" },
]

/**
 * Two-line thread rows: `subtitle` adds the muted second line — here
 * `SidebarItemBadge`, the folder + branch pair a coding agent needs — and
 * `meta` sits at the end of the title line. `renderContent` takes a row over
 * completely; return `undefined` to keep the default body, as the others do.
 */
export function SidebarRichExample() {
  const [items, setItems] = useState(THREADS)
  const [activeId, setActiveId] = useState("streaming")

  return (
    <div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
      <ChatSidebarItemList
        items={items}
        activeId={activeId}
        draggable={false}
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
        renderContent={(item) =>
          item.id === "indexing" ? (
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="flex min-w-0 items-center gap-2">
                <SidebarItemStatusDot status="pending" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                  68%
                </span>
              </span>
              <span className="block h-1 w-full overflow-hidden rounded-full bg-sidebar-border">
                <span className="block h-full w-2/3 rounded-full bg-primary" />
              </span>
            </span>
          ) : undefined
        }
      />
    </div>
  )
}
