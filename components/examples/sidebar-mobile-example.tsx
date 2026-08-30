"use client"

import { PanelLeft, Pencil, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { ChatNavbar } from "@/components/ui/chat-navbar"
import {
  ChatSidebar,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"
import { cn } from "@/lib/utils"

const ITEMS: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming markdown bugs", status: "streaming" },
  { id: "3", title: "Registry build script" },
]

/**
 * Off-canvas recipe: the sidebar itself never changes — a wrapper slides it
 * over the conversation and a backdrop closes it. Swap the `absolute`
 * positioning for `fixed` and the `md:` guards from `app/demo/page.tsx` when
 * the layout owns the whole viewport.
 */
export function SidebarMobileExample() {
  const [open, setOpen] = useState(false)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [activeId, setActiveId] = useState("2")

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="relative flex h-[420px] w-full overflow-hidden bg-background">
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 z-40 bg-foreground/20 backdrop-blur-[1px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-50 shadow-xl transition-transform duration-200",
          !open && "-translate-x-full"
        )}
      >
        <ChatSidebar
          collapsed={false}
          onCollapsedChange={() => setOpen(false)}
          widthExpanded={240}
          brand={<span className="px-1 text-sm font-medium">Chats</span>}
          collapseLabel="Close chats"
          nav={
            <>
              <SideRow icon={<Pencil className="size-4" />}>New chat</SideRow>
              <SideRow icon={<Search className="size-4" />} hint="⌘K">
                Search
              </SideRow>
            </>
          }
        >
          <SidebarCollapsibleSection
            title="Recent"
            open={chatsOpen}
            onToggle={() => setChatsOpen((value) => !value)}
            count={ITEMS.length}
          >
            <ChatSidebarItemList
              items={ITEMS}
              activeId={activeId}
              draggable={false}
              onSelect={(id) => {
                setActiveId(id)
                setOpen(false)
              }}
            />
          </SidebarCollapsibleSection>
        </ChatSidebar>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatNavbar
          title={ITEMS.find((item) => item.id === activeId)?.title ?? "Chat"}
          left={
            <SideIconBtn label="Open chats" onClick={() => setOpen(true)}>
              <PanelLeft className="size-4" />
            </SideIconBtn>
          }
        />
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Tap the panel icon to slide the sidebar in.
        </div>
      </div>
    </div>
  )
}
