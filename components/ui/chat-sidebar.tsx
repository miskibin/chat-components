"use client"

import { ChevronRight, PanelLeft, Pin, Trash2 } from "lucide-react"
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react"

import { useSidebarDnd } from "@/components/ui/sidebar-dnd"
import { SidebarEdgeDropZone } from "@/components/ui/sidebar-drop-zones"
import { cn } from "@/lib/utils"

export const SIDEBAR_WIDTH_EXPANDED = 290
export const SIDEBAR_WIDTH_COLLAPSED = 60

type SideRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  children: ReactNode
  hint?: ReactNode
}

export const SideRow = forwardRef<HTMLButtonElement, SideRowProps>(
  function SideRow({ icon, children, hint, onClick, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={
          className ??
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13.5px]"
        }
        style={{
          background: "transparent",
          border: 0,
          color: "var(--ink)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
        }}
        {...rest}
      >
        <span className="inline-flex" style={{ color: "var(--ink-2)" }}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
        {hint ? (
          <span
            className="shrink-0 text-[11px]"
            style={{ color: "var(--ink-3)" }}
          >
            {hint}
          </span>
        ) : null}
      </button>
    )
  }
)

type SideIconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
}

export const SideIconBtn = forwardRef<HTMLButtonElement, SideIconBtnProps>(
  function SideIconBtn(
    { label, onClick, children, className, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={className ?? "rounded-md p-2"}
        style={{ background: "transparent", border: 0, color: "var(--ink-2)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
        }}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

export function SidebarCollapsibleSection({
  title,
  open,
  onToggle,
  count,
  description,
  className,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  count: number
  description?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-2.5 pb-1 pt-1 uppercase"
        style={{
          background: "transparent",
          border: 0,
          color: "var(--ink-3)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: ".04em",
        }}
      >
        <span
          className="inline-flex transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          <ChevronRight className="h-3 w-3" />
        </span>
        <span>{title}</span>
        <span className="ml-auto" style={{ fontWeight: 400 }}>
          {count}
        </span>
      </button>
      {open && description ? (
        <div
          className="px-2.5 pb-1.5"
          style={{ fontSize: 12, color: "var(--ink-3)" }}
        >
          {description}
        </div>
      ) : null}
      {open ? children : null}
    </div>
  )
}

export function SidebarEmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-2.5 py-2"
      style={{ fontSize: 12, color: "var(--ink-3)" }}
    >
      {children}
    </div>
  )
}

export type ChatSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  brand?: ReactNode
  nav?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /** Extra absolute overlays inside the expanded panel (custom drop zones). */
  overlays?: ReactNode
  /** When inside ChatSidebarDnd, show pin/trash edge zones while dragging. */
  edgeZones?: boolean
  pinLabel?: string
  trashLabel?: string
  widthExpanded?: number
  widthCollapsed?: number
  className?: string
}

export function ChatSidebar({
  collapsed,
  onCollapsedChange,
  brand,
  nav,
  rail,
  children,
  footer,
  overlays,
  edgeZones = false,
  pinLabel = "Drop here to pin",
  trashLabel = "Drop here to delete",
  widthExpanded = SIDEBAR_WIDTH_EXPANDED,
  widthCollapsed = SIDEBAR_WIDTH_COLLAPSED,
  className,
}: ChatSidebarProps) {
  const { activeDragId, pinZoneId, trashZoneId } = useSidebarDnd()

  return (
    <div
      className={cn(
        "lc-sidebar-wrap relative flex h-full min-h-0 min-w-0 flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
        className
      )}
      style={{
        width: collapsed ? widthCollapsed : widthExpanded,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div
        hidden={!collapsed}
        className="absolute inset-y-0 left-0 z-20 flex flex-col items-center gap-1.5 py-3"
        style={{ width: widthCollapsed }}
      >
        <SideIconBtn
          label="Open sidebar"
          onClick={() => onCollapsedChange(false)}
        >
          <PanelLeft className="h-4 w-4" />
        </SideIconBtn>
        {rail}
        <div className="flex-1" />
        {footer}
      </div>

      <div
        hidden={collapsed}
        className="relative flex h-full min-h-0 flex-col"
        style={{ width: widthExpanded, minWidth: widthExpanded }}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 pb-2 pt-3"
          style={{
            background: "var(--bg-sidebar)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="min-w-0 flex-1">{brand}</div>
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            title="Collapse sidebar"
            className="inline-flex items-center justify-center rounded-md p-1.5"
            style={{
              background: "transparent",
              border: 0,
              color: "var(--ink-2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-soft)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            <PanelLeft className="h-[17px] w-[17px]" />
          </button>
        </div>

        {nav ? <div className="px-2 pb-0.5 pt-2">{nav}</div> : null}

        <div className="lc-scroll flex-1 overflow-y-auto px-2 pb-2 pt-3">
          {children}
        </div>

        {footer ? (
          <div
            className="border-t px-2 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            {footer}
          </div>
        ) : null}

        {overlays}
        {edgeZones && activeDragId ? (
          <>
            <SidebarEdgeDropZone
              id={pinZoneId}
              edge="top"
              icon={<Pin className="h-3.5 w-3.5" />}
              label={pinLabel}
              tone="accent"
            />
            <SidebarEdgeDropZone
              id={trashZoneId}
              edge="bottom"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label={trashLabel}
              tone="danger"
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

/** @deprecated Prefer ChatSidebarItem from sidebar-item. */
export function ChatSidebarItemRow({
  title,
  active,
  onClick,
}: {
  title: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px]"
      style={{
        background: active ? "var(--hover)" : "transparent",
        border: 0,
        color: "var(--ink)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--hover)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active
          ? "var(--hover)"
          : "transparent"
      }}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </button>
  )
}

export type { ChatSidebarItemData } from "@/components/ui/sidebar-item"
export {
  ChatSidebarItem,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
} from "@/components/ui/sidebar-item"
export { ChatSidebarDnd, useSidebarDnd } from "@/components/ui/sidebar-dnd"
export {
  SidebarDropZone,
  SidebarEdgeDropZone,
} from "@/components/ui/sidebar-drop-zones"
