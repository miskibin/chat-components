"use client"

import { MessageSquarePlus, Search } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebar,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const ITEMS: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", subtitle: "claude-opus · 2h" },
  {
    id: "2",
    title: "Streaming markdown bugs",
    subtitle: "gpt-5 · now",
    status: "streaming",
  },
  { id: "3", title: "Registry build script", subtitle: "claude-opus · 1d" },
]

function Panel({ dividers }: { dividers: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeId, setActiveId] = useState("2")

  return (
    <ChatSidebar
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      dividers={dividers}
      widthExpanded={260}
      brand={
        <span className="px-1 text-[13px] font-semibold">
          {dividers ? "dividers" : "default"}
        </span>
      }
      nav={
        <>
          <SideRow icon={<MessageSquarePlus className="size-4" />}>
            New chat
          </SideRow>
          <SideRow icon={<Search className="size-4" />} hint="⌘K">
            Search chats
          </SideRow>
        </>
      }
      rail={
        <SideIconBtn label="New chat">
          <MessageSquarePlus className="size-4" />
        </SideIconBtn>
      }
      footer={
        <p className="px-1 py-1 text-[11px] text-muted-foreground">Settings</p>
      }
    >
      <SidebarCollapsibleSection title="Recent" open onToggle={() => {}} count={3}>
        <ChatSidebarItemList
          items={ITEMS}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </SidebarCollapsibleSection>
    </ChatSidebar>
  )
}

/**
 * The same panel with and without `dividers`. The default drops the rules
 * under the header and above the footer; the second column turns them back on.
 */
export function SidebarDividersExample() {
  return (
    <div className="flex h-[320px] w-full min-h-0 gap-4">
      <Panel dividers={false} />
      <Panel dividers />
    </div>
  )
}
