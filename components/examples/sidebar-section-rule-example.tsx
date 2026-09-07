"use client"

import { useState } from "react"

import {
  ChatSidebarItemList,
  SidebarCollapsibleSection,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

const AGENT_UI: ChatSidebarItemData[] = [
  { id: "1", title: "Streaming markdown bugs", meta: "now", status: "streaming" },
  { id: "2", title: "Registry build script", meta: "4m" },
]

const REGISTRY: ChatSidebarItemData[] = [
  { id: "3", title: "Tailwind v4 tokens", meta: "1h" },
  { id: "4", title: "Release checklist", meta: "1d" },
]

/**
 * `rule` swaps the uppercase caption for a label, a hairline across the rest of
 * the row, and the chevron at the far end — the shape a folder list wants when
 * the sections are what the eye scans for.
 *
 * `live` puts a dot on a closed section so a folded folder still says something
 * inside it is running. It animates only while it is on screen and the tab is
 * in front, through the shared `visible-animation` observer.
 */
export function SidebarSectionRuleExample() {
  const [open, setOpen] = useState({ agentUi: false, registry: true })
  const [activeId, setActiveId] = useState("3")

  return (
    <div className="flex w-full max-w-xs flex-col gap-1 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
      <SidebarCollapsibleSection
        title="agent-ui"
        rule
        live
        open={open.agentUi}
        onToggle={() =>
          setOpen((previous) => ({ ...previous, agentUi: !previous.agentUi }))
        }
        count={AGENT_UI.length}
      >
        <ChatSidebarItemList
          items={AGENT_UI}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </SidebarCollapsibleSection>
      <SidebarCollapsibleSection
        title="chat-components"
        rule
        open={open.registry}
        onToggle={() =>
          setOpen((previous) => ({ ...previous, registry: !previous.registry }))
        }
        count={REGISTRY.length}
      >
        <ChatSidebarItemList
          items={REGISTRY}
          activeId={activeId}
          draggable={false}
          onSelect={setActiveId}
        />
      </SidebarCollapsibleSection>
    </div>
  )
}
