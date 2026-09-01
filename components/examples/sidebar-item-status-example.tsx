"use client"

import { Circle, FolderGit2 } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebarItemList,
  SidebarItemStatusDot,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const ITEMS: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming markdown bugs", status: "streaming" },
  { id: "3", title: "Retry failed tool call", status: "fault" },
  { id: "4", title: "Tailwind v4 tokens", status: "pending" },
  {
    id: "5",
    title: "Monorepo migration",
    leading: <FolderGit2 className="size-3.5 text-muted-foreground" />,
  },
]

/**
 * `status` covers the common agent states; `leading` replaces the dot outright
 * when a row needs a glyph or an avatar. The dot is exported on its own, so a
 * legend renders from the same component the rows use.
 */
export function SidebarItemStatusExample() {
  const [activeId, setActiveId] = useState("2")

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
      <ChatSidebarItemList
        items={ITEMS}
        activeId={activeId}
        draggable={false}
        onSelect={setActiveId}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-sidebar-border px-2 pt-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <SidebarItemStatusDot status="streaming" /> streaming
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SidebarItemStatusDot status="fault" /> fault
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SidebarItemStatusDot status="pending" /> pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Circle className="size-1.5" /> idle
        </span>
      </div>
    </div>
  )
}
