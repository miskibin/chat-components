"use client"

import {
  useDraggable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cva, type VariantProps } from "class-variance-authority"
import { Folder, GitBranch, Pencil, Pin, PinOff, Trash2, X } from "lucide-react"
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useSidebarDndList } from "@/components/ui/sidebar-dnd"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Data
 * -----------------------------------------------------------------------------------------------*/

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
  /**
   * Second line under the title — a model name, a branch, a snippet. Muted and
   * truncating; its presence is what turns the row into a two-line thread row.
   */
  subtitle?: ReactNode
  /**
   * Trailing node on the title line — a relative time, a message count. Never
   * shrinks; the title truncates around it.
   */
  meta?: ReactNode
  pinned?: boolean
  status?: SidebarItemStatus
  /** Leading node rendered instead of the status dot. */
  leading?: ReactNode
}

export type SidebarItemRenderContext = {
  active: boolean
  pinned: boolean
  selected: boolean
}

/**
 * Computes the next selected-id set for a click. Plain click replaces the
 * selection; Shift extends from the anchor; Ctrl/Cmd toggles one id.
 */
export function nextSidebarSelection({
  ids,
  selectedIds,
  anchorId,
  clickedId,
  shiftKey,
  toggleKey,
}: {
  ids: readonly string[]
  selectedIds: readonly string[]
  anchorId: string | null
  clickedId: string
  shiftKey: boolean
  toggleKey: boolean
}): { selectedIds: string[]; anchorId: string } {
  if (shiftKey && anchorId) {
    const from = ids.indexOf(anchorId)
    const to = ids.indexOf(clickedId)
    if (from !== -1 && to !== -1) {
      const start = Math.min(from, to)
      const end = Math.max(from, to)
      return { selectedIds: ids.slice(start, end + 1), anchorId }
    }
  }
  if (toggleKey) {
    const has = selectedIds.includes(clickedId)
    return {
      selectedIds: has
        ? selectedIds.filter((id) => id !== clickedId)
        : [...selectedIds, clickedId],
      anchorId: clickedId,
    }
  }
  return { selectedIds: [clickedId], anchorId: clickedId }
}

/**
 * Replaces the default row body (leading dot, title, subtitle, meta) while the
 * component keeps the button shell, drag listeners, context menu and renaming.
 * Return `undefined` to fall back to the default body for that row.
 */
export type SidebarItemRenderContent = (
  item: ChatSidebarItemData,
  ctx: SidebarItemRenderContext
) => ReactNode

/* -------------------------------------------------------------------------------------------------
 * Status dot
 * -----------------------------------------------------------------------------------------------*/

const statusDotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    status: {
      idle: "bg-muted-foreground/50",
      active: "bg-primary",
      streaming: "bg-primary animate-pulse",
      pending: "bg-amber-500",
      fault: "bg-destructive",
    },
  },
  defaultVariants: { status: "idle" },
})

export type SidebarItemStatusDotProps = VariantProps<
  typeof statusDotVariants
> & { className?: string }

export function SidebarItemStatusDot({
  status,
  className,
}: SidebarItemStatusDotProps) {
  return (
    <span
      aria-hidden
      data-slot="sidebar-item-status"
      data-status={status ?? "idle"}
      className={cn(statusDotVariants({ status }), className)}
    />
  )
}

function resolveStatus(
  active: boolean | undefined,
  status: SidebarItemStatus | undefined
): SidebarItemStatus {
  return status ?? (active ? "active" : "idle")
}

/* -------------------------------------------------------------------------------------------------
 * Folder / branch badge
 * -----------------------------------------------------------------------------------------------*/

export type SidebarItemBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  /** Working folder. Only its last segment shows, unless `fullPath`. */
  folder?: string
  /** Branch name, rendered as given. */
  branch?: string
  /** Show the whole folder path instead of its last segment. */
  fullPath?: boolean
}

function lastSegment(path: string) {
  const trimmed = path.replace(/[\\/]+$/, "")
  return trimmed.split(/[\\/]/).pop() || trimmed
}

/**
 * Where a session lives, in one muted line: folder, then branch. Purely
 * presentational — it reads no repository and derives no state, so pass
 * whatever your app already knows and drop the prop you do not have.
 *
 * Made for the `subtitle` slot of a row, but it stands alone anywhere.
 */
export function SidebarItemBadge({
  folder,
  branch,
  fullPath = false,
  className,
  ...props
}: SidebarItemBadgeProps) {
  if (!folder && !branch) return null

  return (
    <span
      data-slot="sidebar-item-badge"
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-[11px] leading-4 font-normal text-muted-foreground",
        className
      )}
      {...props}
    >
      {folder ? (
        <span
          data-slot="sidebar-item-badge-folder"
          title={folder}
          className="inline-flex min-w-0 items-center gap-1"
        >
          <Folder aria-hidden className="size-3 shrink-0 opacity-70" />
          <span className="truncate">
            {fullPath ? folder : lastSegment(folder)}
          </span>
        </span>
      ) : null}
      {folder && branch ? (
        <span aria-hidden className="shrink-0 opacity-40">
          ·
        </span>
      ) : null}
      {branch ? (
        <span
          data-slot="sidebar-item-badge-branch"
          title={branch}
          className="inline-flex min-w-0 items-center gap-1"
        >
          <GitBranch aria-hidden className="size-3 shrink-0 opacity-70" />
          <span className="truncate">{branch}</span>
        </span>
      ) : null}
    </span>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Default row body — shared by the row and the drag ghost
 * -----------------------------------------------------------------------------------------------*/

/** A subtitle is what makes a row two lines; meta alone stays compact. */
function isMultiline(item: ChatSidebarItemData) {
  return item.subtitle != null
}

function SidebarItemBody({
  item,
  active = false,
  pinned,
  showStatusDot = true,
}: {
  item: ChatSidebarItemData
  active?: boolean
  pinned: boolean
  showStatusDot?: boolean
}) {
  const leading =
    item.leading ??
    (showStatusDot && !pinned ? (
      <SidebarItemStatusDot status={resolveStatus(active, item.status)} />
    ) : null)
  const title = item.title || "Untitled"

  return (
    <>
      {pinned || leading ? (
        // h-5 matches the first line box, so the dot keeps aligning with the
        // title once a subtitle stretches the row.
        <span className="inline-flex h-5 shrink-0 items-center gap-2">
          {pinned ? (
            <Pin className="size-3 shrink-0 text-primary" aria-hidden />
          ) : null}
          {leading}
        </span>
      ) : null}
      {item.subtitle != null || item.meta != null ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{title}</span>
            {item.meta != null ? (
              <span
                data-slot="sidebar-item-meta"
                className="shrink-0 text-[11px] font-normal text-muted-foreground"
              >
                {item.meta}
              </span>
            ) : null}
          </span>
          {item.subtitle != null ? (
            <span
              data-slot="sidebar-item-subtitle"
              className="block min-w-0 truncate text-[11px] leading-4 font-normal text-muted-foreground"
            >
              {item.subtitle}
            </span>
          ) : null}
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{title}</span>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Row
 * -----------------------------------------------------------------------------------------------*/

type SidebarItemDragBinding = {
  setNodeRef?: (element: HTMLElement | null) => void
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  attributes?: DraggableAttributes
  listeners?: DraggableSyntheticListeners
  /** dnd-kit transform/transition — genuinely dynamic, so it stays inline. */
  style?: CSSProperties
  dragging?: boolean
  enabled?: boolean
}

export type SidebarItemBulkSelection = {
  count: number
  allPinned: boolean
}

export type ChatSidebarItemProps = {
  item: ChatSidebarItemData
  active?: boolean
  /** Range-selected (Shift/Ctrl-click). Independent of `active`. */
  selected?: boolean
  /**
   * When this row is part of a multi-selection, the context menu pin/delete
   * entries apply to every selected row and rename is hidden.
   */
  bulk?: SidebarItemBulkSelection
  /** Enable pointer/keyboard dragging (needs a `ChatSidebarDnd` ancestor). */
  draggable?: boolean
  /** Enable drag-to-reorder (needs a `ChatSidebarItemList sortable` ancestor). */
  sortable?: boolean
  /** Separator above the row — used between pinned and unpinned groups. */
  showDivider?: boolean
  showStatusDot?: boolean
  /**
   * Replace the row body entirely. The shell — button, drag listeners, context
   * menu, double-click renaming and the editing input — stays.
   */
  renderContent?: SidebarItemRenderContent
  className?: string
  /**
   * Opens the inline rename input from the outside. Bump the number (0 = idle)
   * to request it — for a command palette's "Rename current chat", a keyboard
   * shortcut, or any affordance that lives outside the row.
   */
  renameToken?: number
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void
  onRename?: (title: string) => void
  onTogglePin?: () => void
  onDelete?: () => void
  menuActions?: SidebarItemMenuAction[]
}

type SidebarItemRowProps = Omit<ChatSidebarItemProps, "draggable" | "sortable"> & {
  editing: boolean
  onEditingChange: (editing: boolean) => void
  drag?: SidebarItemDragBinding
}

function isModifierClick(event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) {
  return event.shiftKey || event.metaKey || event.ctrlKey
}

/** Cmd on Apple, Ctrl on other platforms. Ctrl+click on Mac is a context menu. */
function isToggleClick(event: { metaKey: boolean; ctrlKey: boolean }) {
  if (event.metaKey) return true
  if (!event.ctrlKey) return false
  if (typeof navigator === "undefined") return true
  return !/Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

function SidebarItemRow({
  item,
  active = false,
  selected = false,
  bulk,
  showDivider = false,
  showStatusDot = true,
  renderContent,
  className,
  editing,
  onEditingChange,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  menuActions,
  drag,
}: SidebarItemRowProps) {
  const [draft, setDraft] = useState(item.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const pinned = !!item.pinned
  const multi = (bulk?.count ?? 0) > 1

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const startEdit = useCallback(() => {
    setDraft(item.title)
    onEditingChange(true)
  }, [item.title, onEditingChange])

  const commit = useCallback(() => {
    onEditingChange(false)
    const next = draft.trim()
    if (next && next !== item.title) onRename?.(next)
  }, [draft, item.title, onEditingChange, onRename])

  const cancel = useCallback(() => {
    onEditingChange(false)
    setDraft(item.title)
  }, [item.title, onEditingChange])

  const custom = renderContent?.(item, { active, pinned, selected })
  const multiline = custom === undefined && isMultiline(item)

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      // Modifier clicks are for range/toggle select — do not start a drag.
      if (isModifierClick(event)) return
      const handler = drag?.listeners?.onPointerDown
      if (typeof handler === "function") handler(event)
    },
    [drag?.listeners]
  )

  const shell = (
    <div
      ref={drag?.setNodeRef}
      data-slot="sidebar-item"
      data-active={active}
      data-selected={selected}
      data-pinned={pinned}
      data-dragging={drag?.dragging ? true : undefined}
      style={drag?.style}
      className={cn(
        "group/sidebar-item relative",
        showDivider && "mt-1.5 border-t border-sidebar-border pt-1.5",
        drag?.dragging && "opacity-40",
        className
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          data-slot="sidebar-item-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commit()
            } else if (event.key === "Escape") {
              event.preventDefault()
              cancel()
            }
          }}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[13px] text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      ) : (
        <button
          type="button"
          ref={drag?.setActivatorNodeRef}
          data-slot="sidebar-item-button"
          data-active={active}
          data-selected={selected}
          title={item.title || "Untitled"}
          onClick={onSelect}
          onDoubleClick={onRename && !multi ? startEdit : undefined}
          {...(drag?.attributes ?? {})}
          {...(drag?.listeners ?? {})}
          onPointerDown={onPointerDown}
          className={cn(
            "flex w-full select-none gap-2 rounded-md px-2 text-left text-[13px] leading-5",
            multiline ? "items-start py-2" : "items-center py-1.5",
            "text-sidebar-foreground outline-none transition-colors touch-manipulation",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
            "data-[selected=true]:bg-sidebar-accent data-[selected=true]:text-sidebar-accent-foreground",
            drag?.enabled && "cursor-grab active:cursor-grabbing"
          )}
        >
          {custom === undefined ? (
            <SidebarItemBody
              item={item}
              active={active}
              pinned={pinned}
              showStatusDot={showStatusDot}
            />
          ) : (
            custom
          )}
        </button>
      )}
    </div>
  )

  const actions = useItemMenuActions({
    pinned,
    bulk,
    menuActions: multi ? undefined : menuActions,
    onRename: onRename && !multi ? startEdit : undefined,
    onTogglePin,
    onDelete,
  })

  if (editing || actions.length === 0) return shell

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{shell}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-40">
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

function useItemMenuActions({
  pinned,
  bulk,
  menuActions,
  onRename,
  onTogglePin,
  onDelete,
}: {
  pinned: boolean
  bulk?: SidebarItemBulkSelection
  menuActions?: SidebarItemMenuAction[]
  onRename?: () => void
  onTogglePin?: () => void
  onDelete?: () => void
}) {
  return useMemo(() => {
    const count = bulk?.count ?? 0
    const multi = count > 1
    const builtIn: SidebarItemMenuAction[] = []
    if (onRename) {
      builtIn.push({
        id: "rename",
        label: "Rename",
        icon: <Pencil className="size-3.5" />,
        onSelect: onRename,
      })
    }
    if (onTogglePin) {
      const unpin = multi ? !!bulk?.allPinned : pinned
      builtIn.push({
        id: "pin",
        label: multi
          ? unpin
            ? `Unpin ${count} chats`
            : `Pin ${count} chats`
          : pinned
            ? "Unpin"
            : "Pin",
        icon: unpin ? (
          <PinOff className="size-3.5" />
        ) : (
          <Pin className="size-3.5" />
        ),
        onSelect: onTogglePin,
      })
    }
    if (onDelete) {
      builtIn.push({
        id: "delete",
        label: multi ? `Delete ${count} chats` : "Delete",
        icon: <Trash2 className="size-3.5" />,
        onSelect: onDelete,
        destructive: true,
        separatorBefore: builtIn.length > 0 || !!menuActions?.length,
      })
    }
    return [...(menuActions ?? []), ...builtIn]
  }, [bulk, menuActions, onDelete, onRename, onTogglePin, pinned])
}

/* -------------------------------------------------------------------------------------------------
 * Drag flavours
 * -----------------------------------------------------------------------------------------------*/

type FlavourProps = Omit<SidebarItemRowProps, "drag">

function StaticSidebarItem(props: FlavourProps) {
  return <SidebarItemRow {...props} />
}

function DraggableSidebarItem(props: FlavourProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({ id: props.item.id, disabled: props.editing })

  return (
    <SidebarItemRow
      {...props}
      drag={{
        enabled: true,
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners,
        dragging: isDragging,
      }}
    />
  )
}

function SortableSidebarItem(props: FlavourProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.item.id, disabled: props.editing })

  return (
    <SidebarItemRow
      {...props}
      drag={{
        enabled: true,
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners,
        dragging: isDragging,
        style: {
          transform: CSS.Translate.toString(transform),
          transition,
        },
      }}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Item
 * -----------------------------------------------------------------------------------------------*/

export const ChatSidebarItem = memo(function ChatSidebarItem({
  draggable = false,
  sortable = false,
  renameToken = 0,
  ...props
}: ChatSidebarItemProps) {
  const [editing, setEditing] = useState(false)
  const seenToken = useRef(renameToken)

  useEffect(() => {
    if (!renameToken || renameToken === seenToken.current) {
      seenToken.current = renameToken
      return
    }
    seenToken.current = renameToken
    // Deferred so the effect body itself stays setState-free.
    queueMicrotask(() => setEditing(true))
  }, [renameToken])

  const shared = { ...props, editing, onEditingChange: setEditing }

  if (!draggable && !sortable) return <StaticSidebarItem {...shared} />
  if (sortable) return <SortableSidebarItem {...shared} />
  return <DraggableSidebarItem {...shared} />
})

/* -------------------------------------------------------------------------------------------------
 * List
 * -----------------------------------------------------------------------------------------------*/

/** Keeps a callback identity stable so memoized rows survive parent re-renders. */
function useStableCallback<A extends unknown[], R>(
  callback: ((...args: A) => R) | undefined
) {
  const ref = useRef(callback)
  useEffect(() => {
    ref.current = callback
  })
  return useCallback((...args: A) => ref.current?.(...args), [])
}

type ListRowProps = {
  item: ChatSidebarItemData
  active: boolean
  selected: boolean
  bulk?: SidebarItemBulkSelection
  draggable: boolean
  sortable: boolean
  showDivider: boolean
  showStatusDot: boolean
  renameToken: number
  itemClassName?: string
  renderContent?: SidebarItemRenderContent
  onSelect?: (id: string, event: MouseEvent<HTMLButtonElement>) => void
  onRename?: (id: string, title: string) => void
  onTogglePin?: (id: string, pinned: boolean) => void
  onDelete?: (id: string) => void
  onTogglePinSelected?: () => void
  onDeleteSelected?: () => void
  getMenuActions?: (
    item: ChatSidebarItemData
  ) => SidebarItemMenuAction[] | undefined
}

const SidebarListRow = memo(function SidebarListRow({
  item,
  active,
  selected,
  bulk,
  draggable,
  sortable,
  showDivider,
  showStatusDot,
  renameToken,
  itemClassName,
  renderContent,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  onTogglePinSelected,
  onDeleteSelected,
  getMenuActions,
}: ListRowProps) {
  const id = item.id
  const pinned = !!item.pinned
  const multi = selected && (bulk?.count ?? 0) > 1

  const handleSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => onSelect?.(id, event),
    [onSelect, id]
  )
  const handleRename = useCallback(
    (title: string) => onRename?.(id, title),
    [onRename, id]
  )
  const handleTogglePin = useCallback(
    () => onTogglePin?.(id, !pinned),
    [onTogglePin, id, pinned]
  )
  const handleDelete = useCallback(() => onDelete?.(id), [onDelete, id])
  const menuActions = useMemo(
    () => (multi ? undefined : getMenuActions?.(item)),
    [getMenuActions, item, multi]
  )

  return (
    <ChatSidebarItem
      item={item}
      active={active}
      selected={selected}
      bulk={multi ? bulk : undefined}
      draggable={draggable}
      sortable={sortable}
      showDivider={showDivider}
      showStatusDot={showStatusDot}
      renameToken={renameRequestToken(renameToken, multi)}
      renderContent={renderContent}
      className={itemClassName}
      menuActions={menuActions}
      onSelect={onSelect ? handleSelect : undefined}
      onRename={onRename && !multi ? handleRename : undefined}
      onTogglePin={
        onTogglePin
          ? multi
            ? onTogglePinSelected
            : handleTogglePin
          : undefined
      }
      onDelete={
        onDelete ? (multi ? onDeleteSelected : handleDelete) : undefined
      }
    />
  )
})

function renameRequestToken(token: number, multi: boolean) {
  return multi ? 0 : token
}

export type ChatSidebarItemListProps = {
  items: ChatSidebarItemData[]
  activeId?: string
  /**
   * Identifies this list in reorder events. Defaults to a generated id — pass a
   * readable one ("pinned", "recent") when you render more than one list.
   */
  listId?: string
  /** Drag items onto drop zones. */
  draggable?: boolean
  /** Drag items onto each other to reorder (implies `draggable`). */
  sortable?: boolean
  showStatusDot?: boolean
  /** Draw a separator between the pinned group and the rest. */
  groupPinned?: boolean
  /**
   * Opens the inline rename input for one row from the outside — bump `token`
   * (a command palette action, a keyboard shortcut) to request it.
   */
  renameRequest?: { id: string; token: number }
  className?: string
  itemClassName?: string
  emptyState?: ReactNode
  /**
   * Replace the body of every row. Return `undefined` for a row to keep the
   * default title / subtitle / meta body. Identity is stabilised internally, so
   * an inline callback still leaves rows memoized.
   */
  renderContent?: SidebarItemRenderContent
  onSelect?: (id: string) => void
  onRename?: (id: string, title: string) => void
  onTogglePin?: (id: string, pinned: boolean) => void
  onDelete?: (id: string) => void
  /**
   * Fired instead of looping `onDelete` when two or more rows are deleted at
   * once (the selection bar, Delete/Backspace, or the bulk context-menu entry).
   */
  onDeleteMany?: (ids: string[]) => void
  /**
   * Fired instead of looping `onTogglePin` when two or more rows are pinned or
   * unpinned together.
   */
  onTogglePinMany?: (ids: string[], pinned: boolean) => void
  /** Reports the current range/toggle selection. Not needed for the built-in bar. */
  onSelectedIdsChange?: (ids: string[]) => void
  getMenuActions?: (item: ChatSidebarItemData) => SidebarItemMenuAction[]
}

function SidebarSelectionBar({
  count,
  allPinned,
  onPin,
  onDelete,
  onClear,
}: {
  count: number
  allPinned: boolean
  onPin?: () => void
  onDelete?: () => void
  onClear: () => void
}) {
  return (
    <div
      data-slot="sidebar-item-selection"
      className={cn(
        "sticky bottom-0 z-10 mt-1 flex items-center gap-1 rounded-md border border-sidebar-border",
        "bg-sidebar/95 px-2 py-1 text-[12px] text-sidebar-foreground backdrop-blur-sm"
      )}
    >
      <span
        aria-live="polite"
        className="min-w-0 flex-1 truncate tabular-nums text-muted-foreground"
      >
        {count} selected
      </span>
      {onPin ? (
        <button
          type="button"
          data-slot="sidebar-item-selection-action"
          onClick={onPin}
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-medium outline-none transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
          )}
        >
          {allPinned ? "Unpin" : "Pin"}
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          data-slot="sidebar-item-selection-action"
          onClick={onDelete}
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-medium text-destructive outline-none transition-colors",
            "hover:bg-destructive/10",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
          )}
        >
          Delete
        </button>
      ) : null}
      <button
        type="button"
        data-slot="sidebar-item-selection-clear"
        aria-label="Clear selection"
        onClick={onClear}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-md",
          "text-muted-foreground outline-none transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
        )}
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ChatSidebarItemList({
  items,
  activeId,
  listId,
  draggable = true,
  sortable = false,
  showStatusDot = true,
  groupPinned = true,
  renameRequest,
  className,
  itemClassName,
  emptyState,
  renderContent,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  onDeleteMany,
  onTogglePinMany,
  onSelectedIdsChange,
  getMenuActions,
}: ChatSidebarItemListProps) {
  const generatedId = useId()
  const resolvedListId = listId ?? generatedId
  const ids = useMemo(() => items.map((item) => item.id), [items])

  useSidebarDndList(resolvedListId, ids)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedIdsRef = useRef(selectedIds)
  const idsRef = useRef(ids)
  const itemsRef = useRef(items)
  const anchorIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedIdsRef.current = selectedIds
  }, [selectedIds])
  useEffect(() => {
    idsRef.current = ids
  }, [ids])
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const stableSelect = useStableCallback(onSelect)
  const stableRename = useStableCallback(onRename)
  const stableTogglePin = useStableCallback(onTogglePin)
  const stableDelete = useStableCallback(onDelete)
  const stableDeleteMany = useStableCallback(onDeleteMany)
  const stableTogglePinMany = useStableCallback(onTogglePinMany)
  const stableSelectionChange = useStableCallback(onSelectedIdsChange)
  const stableMenuActions = useStableCallback(getMenuActions)
  const stableRenderContent = useStableCallback(renderContent)

  const applySelection = useCallback(
    (next: string[], nextAnchor?: string | null) => {
      selectedIdsRef.current = next
      if (nextAnchor !== undefined) anchorIdRef.current = nextAnchor
      setSelectedIds(next)
      stableSelectionChange(next)
    },
    [stableSelectionChange]
  )

  const handleItemClick = useCallback(
    (id: string, event: MouseEvent<HTMLButtonElement>) => {
      const toggleKey = isToggleClick(event)
      const next = nextSidebarSelection({
        ids: idsRef.current,
        selectedIds: selectedIdsRef.current,
        anchorId: anchorIdRef.current,
        clickedId: id,
        shiftKey: event.shiftKey,
        toggleKey,
      })
      applySelection(next.selectedIds, next.anchorId)
      if (!event.shiftKey && !toggleKey) stableSelect(id)
    },
    [applySelection, stableSelect]
  )

  const clearSelection = useCallback(() => {
    applySelection([], anchorIdRef.current)
  }, [applySelection])

  const hasDelete = !!onDelete
  const hasDeleteMany = !!onDeleteMany
  const hasPin = !!onTogglePin
  const hasPinMany = !!onTogglePinMany

  const deleteOne = useCallback(
    (id: string) => {
      if (hasDelete) stableDelete(id)
      else stableDeleteMany([id])
    },
    [hasDelete, stableDelete, stableDeleteMany]
  )

  const deleteSelected = useCallback(() => {
    const idSet = new Set(idsRef.current)
    const toDelete = selectedIdsRef.current.filter((id) => idSet.has(id))
    applySelection([], anchorIdRef.current)
    if (toDelete.length === 0) return
    if (toDelete.length > 1 && hasDeleteMany) {
      stableDeleteMany(toDelete)
      return
    }
    for (const id of toDelete) deleteOne(id)
  }, [applySelection, deleteOne, hasDeleteMany, stableDeleteMany])

  const togglePinSelected = useCallback(() => {
    const selected = new Set(selectedIdsRef.current)
    const chosen = itemsRef.current.filter((item) => selected.has(item.id))
    if (chosen.length === 0) return
    const nextPinned = !chosen.every((item) => item.pinned)
    const idsToToggle = chosen
      .filter((item) => !!item.pinned !== nextPinned)
      .map((item) => item.id)
    if (idsToToggle.length === 0) return
    if (idsToToggle.length > 1 && hasPinMany) {
      stableTogglePinMany(idsToToggle, nextPinned)
      return
    }
    for (const id of idsToToggle) stableTogglePin(id, nextPinned)
  }, [hasPinMany, stableTogglePin, stableTogglePinMany])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const visibleSelected = useMemo(
    () => items.filter((item) => selectedSet.has(item.id)),
    [items, selectedSet]
  )
  const selectedCount = visibleSelected.length
  const allPinned =
    selectedCount > 0 && visibleSelected.every((item) => item.pinned)
  const bulk = useMemo<SidebarItemBulkSelection | undefined>(
    () =>
      selectedCount > 1 ? { count: selectedCount, allPinned } : undefined,
    [allPinned, selectedCount]
  )
  const showBar = selectedCount > 1

  useEffect(() => {
    if (!showBar) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        applySelection([], anchorIdRef.current)
        return
      }
      if (event.key !== "Delete" && event.key !== "Backspace") return
      if (!hasDelete && !hasDeleteMany) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable=true]")) return
      event.preventDefault()
      deleteSelected()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [applySelection, deleteSelected, hasDelete, hasDeleteMany, showBar])

  const rows = items.map((item, index) => (
    <SidebarListRow
      key={item.id}
      item={item}
      active={item.id === activeId}
      selected={selectedSet.has(item.id)}
      bulk={selectedSet.has(item.id) ? bulk : undefined}
      draggable={draggable || sortable}
      sortable={sortable}
      showStatusDot={showStatusDot}
      renameToken={renameRequest?.id === item.id ? renameRequest.token : 0}
      itemClassName={itemClassName}
      renderContent={renderContent ? stableRenderContent : undefined}
      showDivider={
        groupPinned && index > 0 && !!items[index - 1].pinned && !item.pinned
      }
      onSelect={handleItemClick}
      onRename={onRename ? stableRename : undefined}
      onTogglePin={hasPin || hasPinMany ? stableTogglePin : undefined}
      onDelete={hasDelete || hasDeleteMany ? deleteOne : undefined}
      onTogglePinSelected={hasPin || hasPinMany ? togglePinSelected : undefined}
      onDeleteSelected={hasDelete || hasDeleteMany ? deleteSelected : undefined}
      getMenuActions={getMenuActions ? stableMenuActions : undefined}
    />
  ))

  return (
    <div
      data-slot="sidebar-item-list"
      data-list-id={resolvedListId}
      data-selection-count={selectedCount || undefined}
      className={cn("flex flex-col gap-px", className)}
    >
      {items.length === 0 ? (
        emptyState
      ) : sortable ? (
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {rows}
        </SortableContext>
      ) : (
        rows
      )}
      {showBar ? (
        <SidebarSelectionBar
          count={selectedCount}
          allPinned={allPinned}
          onPin={hasPin || hasPinMany ? togglePinSelected : undefined}
          onDelete={hasDelete || hasDeleteMany ? deleteSelected : undefined}
          onClear={clearSelection}
        />
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Drag overlay ghost
 * -----------------------------------------------------------------------------------------------*/

export function ChatSidebarItemGhost({
  item,
  active,
  renderContent,
  className,
}: {
  item: ChatSidebarItemData
  active?: boolean
  /** Pass the list's `renderContent` so the preview matches the row. */
  renderContent?: SidebarItemRenderContent
  className?: string
}) {
  const pinned = !!item.pinned
  const custom = renderContent?.(item, { active: !!active, pinned, selected: false })
  const multiline = custom === undefined && isMultiline(item)

  return (
    <div
      data-slot="sidebar-item-ghost"
      className={cn(
        "flex w-64 max-w-[80vw] cursor-grabbing gap-2 rounded-md border border-primary/60",
        "bg-popover px-2 text-[13px] leading-5 text-popover-foreground shadow-lg",
        multiline ? "items-start py-2" : "items-center py-1.5",
        className
      )}
    >
      {custom === undefined ? (
        <SidebarItemBody item={item} active={active} pinned={pinned} />
      ) : (
        custom
      )}
    </div>
  )
}
