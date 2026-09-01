"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { Archive, MessageSquarePlus, Search } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarDropZone,
  SidebarEmptyState,
  pinDropZone,
  trashDropZone,
  useSidebarDnd,
  type ChatSidebarItemData,
  type SidebarDndDrop,
  type SidebarDropZoneDef,
} from "@/components/ui/chat-sidebar"

const PINNED_LIST = "pinned"
const RECENT_LIST = "recent"

const INITIAL_ITEMS: ChatSidebarItemData[] = [
  { id: "p1", title: "Design system audit", pinned: true },
  { id: "p2", title: "Release checklist", pinned: true },
  { id: "r1", title: "Streaming markdown bugs", status: "streaming" },
  { id: "r2", title: "Registry build script" },
  { id: "r3", title: "Retry failed tool call", status: "fault" },
  { id: "r4", title: "Tailwind v4 tokens", status: "pending" },
]

/** Inline zones live in the scroll flow and open up while a drag is active. */
function InlineDropZone({ zone }: { zone: SidebarDropZoneDef }) {
  const { activeId } = useSidebarDnd()
  return (
    <SidebarDropZone
      id={zone.id}
      label={zone.label}
      icon={zone.icon}
      tone={zone.tone}
      visible={!!activeId}
    />
  )
}

/** Items are stored pinned-first, so the two rendered lists are plain filters. */
function split(items: ChatSidebarItemData[]) {
  return {
    pinned: items.filter((item) => item.pinned),
    recent: items.filter((item) => !item.pinned),
  }
}

export function SidebarExample() {
  const [collapsed, setCollapsed] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(true)
  const [recentOpen, setRecentOpen] = useState(true)
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [activeId, setActiveId] = useState("r1")
  const [log, setLog] = useState(
    "Drag a chat onto an edge zone, or onto another chat to reorder."
  )

  const zones = useMemo(
    () => [
      pinDropZone(),
      trashDropZone(),
      // A third, entirely custom zone — pin and trash are just presets.
      {
        id: "archive-zone",
        label: "Archive",
        icon: <Archive className="size-3.5" />,
        tone: "muted" as const,
        action: "archive",
      },
    ],
    []
  )

  const { pinned, recent } = useMemo(() => split(items), [items])
  const find = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  )

  const setItemPinned = useCallback((id: string, next: boolean) => {
    setItems((prev) => {
      const item = prev.find((candidate) => candidate.id === id)
      if (!item) return prev
      const rest = split(prev.filter((candidate) => candidate.id !== id))
      const moved = { ...item, pinned: next }
      return next
        ? [moved, ...rest.pinned, ...rest.recent]
        : [...rest.pinned, moved, ...rest.recent]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const renameItem = useCallback((id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    )
  }, [])

  const handleDrop = useCallback(
    (drop: SidebarDndDrop) => {
      const title = find(drop.itemId)?.title ?? drop.itemId

      if (drop.kind === "reorder") {
        const { fromListId, listId, from, to } = drop
        setItems((prev) => {
          const groups = split(prev)
          const intoPinned = listId === PINNED_LIST

          if (fromListId === listId) {
            const moved = arrayMove(
              intoPinned ? groups.pinned : groups.recent,
              from,
              to
            )
            return intoPinned
              ? [...moved, ...groups.recent]
              : [...groups.pinned, ...moved]
          }

          const source = intoPinned ? groups.recent : groups.pinned
          const target = intoPinned ? groups.pinned : groups.recent
          const moved = source[from]
          if (!moved) return prev
          const nextSource = source.filter((item) => item.id !== moved.id)
          const nextTarget = [...target]
          nextTarget.splice(Math.min(to, nextTarget.length), 0, {
            ...moved,
            pinned: intoPinned,
          })
          return intoPinned
            ? [...nextTarget, ...nextSource]
            : [...nextSource, ...nextTarget]
        })
        setLog(
          fromListId === listId
            ? `Reordered "${title}" (${from} → ${to} in ${listId})`
            : `Moved "${title}" from ${fromListId} to ${listId}`
        )
        return
      }

      if (drop.action === "pin") {
        setItemPinned(drop.itemId, true)
        setLog(`Pinned "${title}"`)
        return
      }
      if (drop.action === "delete") {
        removeItem(drop.itemId)
        setLog(`Deleted "${title}"`)
        return
      }
      if (drop.action === "archive") {
        removeItem(drop.itemId)
        setLog(`Archived "${title}" via the custom zone`)
      }
    },
    [find, removeItem, setItemPinned]
  )

  return (
    <div className="flex h-[440px] w-full overflow-hidden">
      <ChatSidebarDnd
        zones={zones}
        onDrop={handleDrop}
        renderOverlay={(id) => {
          const item = find(id)
          return item ? (
            <ChatSidebarItemGhost item={item} active={item.id === activeId} />
          ) : null
        }}
      >
        <ChatSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          edgeZones
          widthExpanded={252}
          brand={<span className="px-1 text-sm font-medium">Chats</span>}
          nav={
            <>
              <SideRow icon={<MessageSquarePlus className="size-4" />}>
                New chat
              </SideRow>
              <SideRow icon={<Search className="size-4" />} hint="⌘K">
                Search
              </SideRow>
            </>
          }
          rail={
            <>
              <SideIconBtn label="New chat">
                <MessageSquarePlus className="size-4" />
              </SideIconBtn>
              <SideIconBtn label="Search">
                <Search className="size-4" />
              </SideIconBtn>
            </>
          }
        >
          <SidebarCollapsibleSection
            title="Pinned"
            open={pinnedOpen}
            onToggle={() => setPinnedOpen((open) => !open)}
            count={pinned.length}
            className="mb-2"
          >
            <ChatSidebarItemList
              listId={PINNED_LIST}
              items={pinned}
              activeId={activeId}
              sortable
              showStatusDot={false}
              emptyState={
                <SidebarEmptyState>
                  Drag a chat to the top edge.
                </SidebarEmptyState>
              }
              onSelect={setActiveId}
              onRename={renameItem}
              onTogglePin={setItemPinned}
              onDelete={removeItem}
            />
          </SidebarCollapsibleSection>

          <InlineDropZone zone={zones[2]} />

          <SidebarCollapsibleSection
            title="Recent"
            open={recentOpen}
            onToggle={() => setRecentOpen((open) => !open)}
            count={recent.length}
          >
            <ChatSidebarItemList
              listId={RECENT_LIST}
              items={recent}
              activeId={activeId}
              sortable
              emptyState={<SidebarEmptyState>No chats yet.</SidebarEmptyState>}
              onSelect={setActiveId}
              onRename={renameItem}
              onTogglePin={setItemPinned}
              onDelete={removeItem}
            />
          </SidebarCollapsibleSection>
        </ChatSidebar>
      </ChatSidebarDnd>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-medium">
          {find(activeId)?.title ?? "No chat selected"}
        </p>
        <p className="text-xs text-muted-foreground">{log}</p>
        <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
          <li>Drag a row onto another row to reorder it.</li>
          <li>Drag to the top edge to pin, to the bottom edge to delete.</li>
          <li>Drag across sections to pin or unpin at a chosen position.</li>
          <li>Right-click a row to rename, pin, or delete it.</li>
          <li>
            Shift-click a range, or Ctrl/⌘-click to toggle. Pin or delete from
            the bar — or from the context menu, which becomes &ldquo;Delete N
            chats&rdquo;.
          </li>
          <li>The dashed &ldquo;Archive&rdquo; strip is a custom inline zone.</li>
        </ul>
      </div>
    </div>
  )
}
