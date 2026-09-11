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
 * the sections are what the eye scans for. `action` (branch, dirty count, a
 * port) sits on a second row so those chips cannot overlap a long name.
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
        title={
          <span className="flex min-w-0 items-center gap-1.5 normal-case tracking-normal">
            <span className="grid size-4 shrink-0 place-items-center rounded-[3px] bg-primary/15 text-[8px] font-semibold text-primary">
              AU
            </span>
            <span className="min-w-0 truncate">agent-ui</span>
          </span>
        }
        rule
        live
        action={
          <span className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <span>main</span>
            <span className="text-amber-600 dark:text-amber-400">12</span>
            <span className="text-sky-600 dark:text-sky-400">3000</span>
          </span>
        }
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
