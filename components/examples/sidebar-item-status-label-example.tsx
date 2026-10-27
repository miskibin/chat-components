"use client"

import { useState } from "react"

import {
  ChatSidebar,
  ChatSidebarItemList,
  SidebarItemStatusLabel,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

/**
 * The state said in words, in the `meta` slot. The streaming row shines and
 * times itself; hold ⌘ (Ctrl off Apple) for a moment to see the jump hints
 * `showJumpHints` reveals.
 */
export function SidebarItemStatusLabelExample() {
  const [activeId, setActiveId] = useState("1")
  // Pretend the first chat started working 83 seconds ago.
  const [startedAt] = useState(() => Date.now() - 83_000)

  const items: ChatSidebarItemData[] = [
    {
      id: "1",
      title: "Streaming retry",
      status: "streaming",
      jumpLabel: "⌘1",
      meta: (
        <SidebarItemStatusLabel
          status="streaming"
          label="Working"
          startedAt={startedAt}
        />
      ),
    },
    {
      id: "2",
      title: "Pick a package manager",
      status: "pending",
      jumpLabel: "⌘2",
      meta: <SidebarItemStatusLabel status="pending" label="Awaiting input" />,
    },
    {
      id: "3",
      title: "Flaky e2e on CI",
      status: "fault",
      jumpLabel: "⌘3",
      meta: <SidebarItemStatusLabel status="fault" label="Failed" />,
    },
    { id: "4", title: "Tailwind v4 tokens", jumpLabel: "⌘4", meta: "2h" },
  ]

  return (
    <div className="h-64 w-full max-w-xs overflow-hidden rounded-lg border border-sidebar-border">
      <ChatSidebar
        collapsed={false}
        onCollapsedChange={() => {}}
        showJumpHints
        animateWidth={false}
        width="100%"
        className="border-r-0"
      >
        <ChatSidebarItemList
          items={items}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </ChatSidebar>
    </div>
  )
}
