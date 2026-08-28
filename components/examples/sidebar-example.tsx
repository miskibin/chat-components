"use client"

import { MessageSquarePlus, Search } from "lucide-react"
import { useState } from "react"

import {
  ChatSidebar,
  SideRow,
  SidebarCollapsibleSection,
} from "@/components/ui/chat-sidebar"

export function SidebarExample() {
  const [collapsed, setCollapsed] = useState(false)
  const [recentOpen, setRecentOpen] = useState(true)

  return (
    <div className="h-[420px] overflow-hidden rounded-md border">
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        brand={<div className="px-1 text-sm font-medium">Chat</div>}
        nav={
          <>
            <SideRow icon={<MessageSquarePlus className="h-4 w-4" />}>
              New chat
            </SideRow>
            <SideRow icon={<Search className="h-4 w-4" />} hint="⌘K">
              Search
            </SideRow>
          </>
        }
      >
        <SidebarCollapsibleSection
          title="Recent"
          open={recentOpen}
          onToggle={() => setRecentOpen((v) => !v)}
          count={2}
        >
          <SideRow icon={<span className="h-1.5 w-1.5 rounded-full bg-primary" />}>
            Welcome chat
          </SideRow>
          <SideRow icon={<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}>
            Registry docs
          </SideRow>
        </SidebarCollapsibleSection>
      </ChatSidebar>
    </div>
  )
}
