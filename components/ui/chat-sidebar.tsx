"use client"

import { ChevronRight, PanelLeft } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"

import { useSidebarDnd } from "@/components/ui/sidebar-dnd"
import { SidebarEdgeDropZone } from "@/components/ui/sidebar-drop-zones"
import { cn } from "@/lib/utils"

export const SIDEBAR_WIDTH_EXPANDED = 290
export const SIDEBAR_WIDTH_COLLAPSED = 60

/* -------------------------------------------------------------------------------------------------
 * Buttons
 * -----------------------------------------------------------------------------------------------*/

export type SideRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  hint?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

/** Full-width navigation row (new chat, search, …). */
export function SideRow({
  icon,
  hint,
  children,
  className,
  ...props
}: SideRowProps) {
  return (
    <button
      type="button"
      data-slot="sidebar-row"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] leading-5",
        "text-sidebar-foreground outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="inline-flex shrink-0 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </button>
  )
}

export type SideIconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  ref?: Ref<HTMLButtonElement>
}

/** Square icon button used by the collapsed rail and the header. */
export function SideIconBtn({
  label,
  children,
  className,
  ...props
}: SideIconBtnProps) {
  return (
    <button
      type="button"
      data-slot="sidebar-icon-button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
        "text-muted-foreground outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Sections
 * -----------------------------------------------------------------------------------------------*/

export type SidebarCollapsibleSectionProps = {
  title: ReactNode
  open: boolean
  onToggle: () => void
  count?: number
  description?: ReactNode
  /** Rendered at the right edge of the header, before the count. */
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function SidebarCollapsibleSection({
  title,
  open,
  onToggle,
  count,
  description,
  action,
  className,
  children,
}: SidebarCollapsibleSectionProps) {
  return (
    <div
      data-slot="sidebar-section"
      data-state={open ? "open" : "closed"}
      className={cn("min-w-0", className)}
    >
      <button
        type="button"
        data-slot="sidebar-section-trigger"
        data-state={open ? "open" : "closed"}
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "group/section flex w-full items-center gap-1.5 rounded-md px-2 py-1",
          "text-[11px] font-medium tracking-wide uppercase text-muted-foreground",
          "outline-none transition-colors hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
        )}
      >
        <ChevronRight className="size-3 shrink-0 transition-transform duration-200 group-data-[state=open]/section:rotate-90" />
        <span className="min-w-0 flex-1 truncate text-left">{title}</span>
        {action}
        {typeof count === "number" ? (
          <span className="shrink-0 font-normal tabular-nums">{count}</span>
        ) : null}
      </button>
      {open ? (
        <>
          {description ? (
            <p
              data-slot="sidebar-section-description"
              className="px-2 pb-1.5 text-xs text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
          {children}
        </>
      ) : null}
    </div>
  )
}

export function SidebarEmptyState({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      data-slot="sidebar-empty"
      className={cn("px-2 py-2 text-xs text-muted-foreground", className)}
    >
      {children}
    </p>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Sidebar
 * -----------------------------------------------------------------------------------------------*/

export type ChatSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  /** Header content of the expanded panel. */
  brand?: ReactNode
  /** Sticky rows under the header (new chat, search, …). */
  nav?: ReactNode
  /** Content of the collapsed rail. */
  rail?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /** Extra absolutely-positioned overlays inside the expanded panel. */
  overlays?: ReactNode
  /**
   * Render the edge drop zones declared on the surrounding `ChatSidebarDnd`
   * while a drag is in progress.
   */
  edgeZones?: boolean
  widthExpanded?: number
  widthCollapsed?: number
  className?: string
  classNames?: {
    rail?: string
    panel?: string
    header?: string
    nav?: string
    content?: string
    footer?: string
  }
  collapseLabel?: string
  expandLabel?: string
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
  widthExpanded = SIDEBAR_WIDTH_EXPANDED,
  widthCollapsed = SIDEBAR_WIDTH_COLLAPSED,
  className,
  classNames,
  collapseLabel = "Collapse sidebar",
  expandLabel = "Open sidebar",
}: ChatSidebarProps) {
  const { activeId, edgeZones: zones } = useSidebarDnd()
  const showZones = edgeZones && !!activeId && zones.length > 0

  return (
    <div
      data-slot="chat-sidebar"
      data-collapsed={collapsed}
      style={{ width: collapsed ? widthCollapsed : widthExpanded }}
      className={cn(
        "relative flex h-full max-w-full min-h-0 min-w-0 shrink-0 overflow-hidden",
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-300 ease-in-out",
        className
      )}
    >
      <div
        data-slot="chat-sidebar-rail"
        hidden={!collapsed}
        style={{ width: widthCollapsed }}
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex flex-col items-center gap-1.5 py-3",
          classNames?.rail
        )}
      >
        <SideIconBtn label={expandLabel} onClick={() => onCollapsedChange(false)}>
          <PanelLeft className="size-4" />
        </SideIconBtn>
        {rail}
        <div className="flex-1" />
        {footer}
      </div>

      <div
        data-slot="chat-sidebar-panel"
        hidden={collapsed}
        style={{ width: widthExpanded, maxWidth: "100%" }}
        className={cn(
          "relative flex h-full min-h-0 flex-col",
          classNames?.panel
        )}
      >
        <div
          data-slot="chat-sidebar-header"
          className={cn(
            "flex items-center justify-between gap-2 border-b border-sidebar-border px-2.5 pt-3 pb-2",
            classNames?.header
          )}
        >
          <div className="min-w-0 flex-1">{brand}</div>
          <SideIconBtn
            label={collapseLabel}
            onClick={() => onCollapsedChange(true)}
          >
            <PanelLeft className="size-4" />
          </SideIconBtn>
        </div>

        {nav ? (
          <div
            data-slot="chat-sidebar-nav"
            className={cn("flex flex-col gap-px px-2 pt-2 pb-0.5", classNames?.nav)}
          >
            {nav}
          </div>
        ) : null}

        <div
          data-slot="chat-sidebar-content"
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto px-2 pt-3 pb-2 [scrollbar-width:thin]",
            classNames?.content
          )}
        >
          {children}
        </div>

        {footer ? (
          <div
            data-slot="chat-sidebar-footer"
            className={cn(
              "border-t border-sidebar-border px-2 py-2",
              classNames?.footer
            )}
          >
            {footer}
          </div>
        ) : null}

        {overlays}

        {showZones
          ? zones.map((zone) => (
              <SidebarEdgeDropZone
                key={zone.id}
                id={zone.id}
                label={zone.label}
                icon={zone.icon}
                tone={zone.tone}
                edge={zone.edge}
              />
            ))
          : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Family re-exports — `chat-sidebar` is the single import surface for the family.
 * -----------------------------------------------------------------------------------------------*/

export {
  ChatSidebarItem,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SidebarItemBadge,
  SidebarItemStatusDot,
} from "@/components/ui/sidebar-item"
export type {
  ChatSidebarItemData,
  ChatSidebarItemListProps,
  ChatSidebarItemProps,
  SidebarItemBadgeProps,
  SidebarItemMenuAction,
  SidebarItemRenderContent,
  SidebarItemRenderContext,
  SidebarItemStatus,
} from "@/components/ui/sidebar-item"
export {
  ChatSidebarDnd,
  DEFAULT_SIDEBAR_ZONES,
  SIDEBAR_PIN_ZONE_ID,
  SIDEBAR_TRASH_ZONE_ID,
  pinDropZone,
  trashDropZone,
  useSidebarDnd,
  useSidebarDndList,
} from "@/components/ui/sidebar-dnd"
export type {
  ChatSidebarDndProps,
  SidebarCustomDrop,
  SidebarDndDrop,
  SidebarDropZoneDef,
  SidebarReorderDrop,
  SidebarZoneDrop,
  SidebarZoneEdge,
  SidebarZoneTone,
} from "@/components/ui/sidebar-dnd"
export {
  SidebarDropZone,
  SidebarEdgeDropZone,
} from "@/components/ui/sidebar-drop-zones"
