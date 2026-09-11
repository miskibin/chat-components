"use client"

import { MessageSquarePlus } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebar,
  ChatSidebarItemList,
  SideActionRow,
  SideIconBtn,
  SidebarResizeRail,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const ITEMS: ChatSidebarItemData[] = [
  { id: "1", title: "Streaming markdown bugs", meta: "now" },
  { id: "2", title: "Registry build script", meta: "4m" },
  { id: "3", title: "Tailwind v4 tokens", meta: "1h" },
]

/**
 * The rail writes one custom property on the panel inside a
 * `requestAnimationFrame` — no React state, so nothing in the sidebar
 * re-renders while you drag. Double-click it to reset; focus it and use the
 * arrow keys (Shift for bigger steps, Home/End for the limits).
 *
 * Persistence is the consumer's: `onWidthChange` reports a settled width, and
 * `width` hydrates one back before the first paint.
 */
export function SidebarResizeExample() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeId, setActiveId] = useState("1")
  const [width, setWidth] = useState(260)

  return (
    <div className="flex h-[280px] w-full min-h-0 overflow-hidden rounded-lg border border-sidebar-border">
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        widthExpanded={260}
        brand={<span className="px-1 text-[13px] font-semibold">Chats</span>}
        nav={
          <SideActionRow>
            <SideIconBtn label="New chat">
              <MessageSquarePlus className="size-4" />
            </SideIconBtn>
          </SideActionRow>
        }
        rail={
          <SideIconBtn label="New chat">
            <MessageSquarePlus className="size-4" />
          </SideIconBtn>
        }
        overlays={
          <SidebarResizeRail
            width={width}
            defaultWidth={260}
            minWidth={220}
            maxWidth={380}
            onWidthChange={setWidth}
          />
        }
      >
        <ChatSidebarItemList
          items={ITEMS}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </ChatSidebar>
      <div className="flex min-w-0 flex-1 items-center justify-center bg-background text-xs text-muted-foreground tabular-nums">
        {Math.round(width)}px
      </div>
    </div>
  )
}
