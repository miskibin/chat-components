"use client"

import {
  useDraggable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core"
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export type SidebarItemStatus =
  | "idle"
  | "active"
  | "streaming"
  | "pending"
  | "fault"

export type SidebarItemMenuAction = {
  id: string
  label: string
  icon?: ReactNode
  onSelect: () => void
  destructive?: boolean
  separatorBefore?: boolean
}

export type ChatSidebarItemData = {
  id: string
  title: string
  pinned?: boolean
  status?: SidebarItemStatus
  /** Leading icon overrides status dot. */
  leading?: ReactNode
}

function statusChrome(
  active: boolean,
  status: SidebarItemStatus | undefined
): { variant: string; dotStyle: CSSProperties; iconColor: string } {
  const baseDot: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 9999,
    flexShrink: 0,
  }
  const resolved = status ?? (active ? "active" : "idle")
  if (resolved === "fault") {
    const fill = "color-mix(in oklab, var(--destructive) 82%, var(--sidebar))"
    return {
      variant: "fault",
      dotStyle: { ...baseDot, background: fill },
      iconColor: fill,
    }
  }
  if (resolved === "streaming") {
    return {
      variant: "streaming",
      dotStyle: { ...baseDot, background: "var(--primary)" },
      iconColor: "var(--primary)",
    }
  }
  if (resolved === "pending") {
    return {
      variant: "pending",
      dotStyle: { ...baseDot, background: "#ca8a04" },
      iconColor: "#ca8a04",
    }
  }
  if (resolved === "active" || active) {
    const fill = "color-mix(in oklab, var(--muted-foreground) 58%, var(--sidebar))"
    return {
      variant: "active",
      dotStyle: { ...baseDot, background: fill },
      iconColor: fill,
    }
  }
  const fill = "color-mix(in oklab, var(--muted-foreground) 88%, var(--sidebar))"
  return {
    variant: "idle",
    dotStyle: { ...baseDot, background: fill },
    iconColor: fill,
  }
}

type ItemRowProps = {
  item: ChatSidebarItemData
  active?: boolean
  editing: boolean
  setEditing: (v: boolean) => void
  onSelect?: () => void
  onRename?: (title: string) => void
  onTogglePin?: () => void
  onDelete?: () => void
  menuActions?: SidebarItemMenuAction[]
  dragAttrs?: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
  dragNodeRef?: (el: HTMLDivElement | null) => void
  isBeingDragged?: boolean
  showDivider?: boolean
  showStatusDot?: boolean
}

function ItemRow({
  item,
  active = false,
  editing,
  setEditing,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  menuActions = [],
  dragAttrs,
  dragListeners,
  dragNodeRef,
  isBeingDragged,
  showDivider,
  showStatusDot = true,
}: ItemRowProps) {
  const [draft, setDraft] = useState(item.title || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const isPinned = !!item.pinned
  const chrome = statusChrome(active, item.status)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(item.title || "")
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const next = draft.trim()
    if (next && next !== (item.title || "")) onRename?.(next)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(item.title || "")
  }

  const rowStyle: CSSProperties = {
    opacity: isBeingDragged ? 0.4 : 1,
    touchAction: dragListeners ? "none" : undefined,
    ...(showDivider
      ? {
          marginTop: 6,
          paddingTop: 6,
          borderTop: "1px solid var(--border)",
        }
      : {}),
  }

  const shellProps = {
    ref: dragNodeRef,
    ...(dragAttrs ?? {}),
    ...(!editing && dragListeners ? dragListeners : {}),
    className: "group/row relative",
    style: rowStyle,
  }

  if (editing) {
    return (
      <div {...shellProps}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              cancel()
            }
          }}
          className="mb-px block w-full truncate py-1.5 pr-2.5 pl-2.5 text-left outline-none"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            border: 0,
            borderLeft: "2px solid var(--primary)",
            fontSize: 13.5,
          }}
        />
      </div>
    )
  }

  const builtIn: SidebarItemMenuAction[] = []
  if (onRename) {
    builtIn.push({
      id: "rename",
      label: "Rename",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onSelect: startEdit,
    })
  }
  if (onTogglePin) {
    builtIn.push({
      id: "pin",
      label: isPinned ? "Unpin" : "Pin",
      icon: isPinned ? (
        <PinOff className="h-3.5 w-3.5" />
      ) : (
        <Pin className="h-3.5 w-3.5" />
      ),
      onSelect: onTogglePin,
    })
  }
  if (onDelete) {
    builtIn.push({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onSelect: onDelete,
      destructive: true,
      separatorBefore: builtIn.length > 0 || menuActions.length > 0,
    })
  }

  const actions = [...menuActions, ...builtIn]
  const rowButton = (
    <div {...shellProps}>
      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onRename ? startEdit : undefined}
        title={item.title || "Untitled"}
        className="mb-px flex w-full items-center gap-1.5 truncate py-1.5 pr-2.5 pl-2.5 text-left"
        style={{
          background: "transparent",
          color: "var(--foreground)",
          border: 0,
          borderLeft: active
            ? "2px solid var(--primary)"
            : "2px solid transparent",
          fontSize: 13.5,
          fontWeight: active ? 500 : 400,
          cursor: dragListeners ? "grab" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "var(--muted)"
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent"
        }}
      >
        {isPinned && (
          <Pin
            className="h-3 w-3 flex-shrink-0"
            style={{ color: "var(--primary)" }}
          />
        )}
        {item.leading ? (
          <span className="inline-flex flex-shrink-0">{item.leading}</span>
        ) : showStatusDot && !isPinned ? (
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            data-sidebar-item-dot={chrome.variant}
            style={chrome.dotStyle}
            aria-hidden
          />
        ) : null}
        <span className="flex-1 truncate">{item.title || "Untitled"}</span>
      </button>
    </div>
  )

  if (actions.length === 0) return rowButton

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{rowButton}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        {actions.map((action) => (
          <div key={action.id}>
            {action.separatorBefore ? <ContextMenuSeparator /> : null}
            <ContextMenuItem
              onSelect={() => action.onSelect()}
              variant={action.destructive ? "destructive" : "default"}
            >
              {action.icon}
              <span>{action.label}</span>
            </ContextMenuItem>
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export type ChatSidebarItemProps = {
  item: ChatSidebarItemData
  active?: boolean
  onSelect?: () => void
  onRename?: (title: string) => void
  onTogglePin?: () => void
  onDelete?: () => void
  menuActions?: SidebarItemMenuAction[]
  draggable?: boolean
  isBeingDragged?: boolean
  showDivider?: boolean
  showStatusDot?: boolean
}

export function ChatSidebarItem({
  item,
  active,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  menuActions,
  draggable = false,
  isBeingDragged = false,
  showDivider,
  showStatusDot,
}: ChatSidebarItemProps) {
  const [editing, setEditing] = useState(false)
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    disabled: !draggable || editing,
  })

  return (
    <ItemRow
      item={item}
      active={active}
      editing={editing}
      setEditing={setEditing}
      onSelect={onSelect}
      onRename={onRename}
      onTogglePin={onTogglePin}
      onDelete={onDelete}
      menuActions={menuActions}
      dragAttrs={draggable ? attributes : undefined}
      dragListeners={draggable ? listeners : undefined}
      dragNodeRef={draggable ? setNodeRef : undefined}
      isBeingDragged={isBeingDragged}
      showDivider={showDivider}
      showStatusDot={showStatusDot}
    />
  )
}

export function ChatSidebarItemList({
  items,
  activeId,
  activeDragId,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  getMenuActions,
  draggable = true,
}: {
  items: ChatSidebarItemData[]
  activeId?: string
  activeDragId?: string | null
  onSelect?: (id: string) => void
  onRename?: (id: string, title: string) => void
  onTogglePin?: (id: string, pinned: boolean) => void
  onDelete?: (id: string) => void
  getMenuActions?: (item: ChatSidebarItemData) => SidebarItemMenuAction[]
  draggable?: boolean
}) {
  return (
    <>
      {items.map((item, i) => {
        const showDivider =
          i > 0 && !!items[i - 1].pinned && !item.pinned
        return (
          <ChatSidebarItem
            key={item.id}
            item={item}
            active={item.id === activeId}
            isBeingDragged={activeDragId === item.id}
            showDivider={showDivider}
            draggable={draggable}
            onSelect={onSelect ? () => onSelect(item.id) : undefined}
            onRename={
              onRename ? (title) => onRename(item.id, title) : undefined
            }
            onTogglePin={
              onTogglePin
                ? () => onTogglePin(item.id, !item.pinned)
                : undefined
            }
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
            menuActions={getMenuActions?.(item)}
          />
        )
      })}
    </>
  )
}

export function ChatSidebarItemGhost({
  item,
  active,
}: {
  item: ChatSidebarItemData
  active?: boolean
}) {
  const chrome = statusChrome(!!active, item.status)
  return (
    <div
      className="flex items-center gap-1.5 truncate rounded-md py-1.5 pr-3 pl-2.5"
      style={{
        background: "var(--sidebar)",
        color: "var(--foreground)",
        border: "1px solid var(--primary)",
        boxShadow: "0 8px 18px -8px rgba(0,0,0,.35)",
        fontSize: 13.5,
        width: 264,
        cursor: "grabbing",
      }}
    >
      {item.pinned && (
        <Pin
          className="h-3 w-3 flex-shrink-0"
          style={{ color: "var(--primary)" }}
        />
      )}
      {!item.pinned && !item.leading ? (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={chrome.dotStyle}
          aria-hidden
        />
      ) : null}
      {item.leading}
      <span className="flex-1 truncate">{item.title || "Untitled"}</span>
    </div>
  )
}
