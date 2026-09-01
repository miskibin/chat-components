"use client"

import { MessageSquarePlus } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebar,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const ITEMS: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming markdown bugs", status: "streaming" },
  { id: "3", title: "Registry build script" },
]

/**
 * Widths are numbers because the root animates `width` between them, and
 * `classNames` reaches each region — rail, panel, header, nav, content,
 * footer — without a single descendant selector.
 */
export function SidebarStyledExample() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeId, setActiveId] = useState("2")

  return (
    <div className="flex h-[340px] w-full min-h-0">
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        widthExpanded={320}
        widthCollapsed={52}
        className="border-r-0"
        classNames={{
          panel: "bg-muted/40",
          header: "border-b-0 pt-4",
          content: "px-3",
          footer: "bg-muted/60",
        }}
        brand={<span className="text-[13px] font-semibold">Threads</span>}
        nav={
          <SideRow icon={<MessageSquarePlus className="size-4" />}>
            New chat
          </SideRow>
        }
        rail={
          <SideIconBtn label="New chat">
            <MessageSquarePlus className="size-4" />
          </SideIconBtn>
        }
        footer={
          <p className="px-1 py-1 text-[11px] text-muted-foreground">
            3 conversations
          </p>
        }
      >
        <ChatSidebarItemList
          items={ITEMS}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </ChatSidebar>
      <div className="min-w-0 flex-1 border-l p-4 text-sm text-muted-foreground">
        Conversation goes here.
      </div>
    </div>
  )
}
