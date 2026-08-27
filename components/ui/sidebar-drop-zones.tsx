"use client"

import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"

export function SidebarEdgeDropZone({
  id,
  edge,
  icon,
  label,
  tone,
}: {
  id: string
  edge: "top" | "bottom"
  icon: ReactNode
  label: string
  tone: "accent" | "danger"
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const color = tone === "danger" ? "var(--destructive)" : "var(--primary)"
  const tint =
    tone === "danger"
      ? "color-mix(in oklab, var(--bg-sidebar) 72%, var(--destructive))"
      : "color-mix(in oklab, var(--bg-sidebar) 72%, var(--primary))"
  const positionClass =
    edge === "top"
      ? "top-0 right-0 left-0 min-h-[92px] h-[16%]"
      : "right-0 bottom-0 left-0 min-h-[92px] h-[16%]"

  return (
    <div
      ref={setNodeRef}
      className={`pointer-events-auto absolute z-[35] flex items-center justify-center px-3 py-4 ${positionClass}`}
      style={{
        background: isOver ? color : tint,
        border: `1px dashed ${color}`,
        transition: "background 120ms ease, color 120ms ease",
      }}
    >
      <div
        className="flex max-w-full items-center justify-center gap-1.5"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isOver ? "var(--primary-foreground)" : color,
        }}
      >
        {icon}
        <span className="truncate">{label}</span>
      </div>
    </div>
  )
}

export function SidebarDropZone({
  id,
  icon,
  label,
  tone,
  visible,
}: {
  id: string
  icon: ReactNode
  label: string
  tone: "accent" | "danger"
  visible: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const color = tone === "danger" ? "var(--destructive)" : "var(--primary)"

  return (
    <div
      ref={setNodeRef}
      aria-hidden={!visible}
      className="overflow-hidden"
      style={{
        maxHeight: visible ? 38 : 0,
        marginTop: visible ? 4 : 0,
        marginBottom: visible ? 4 : 0,
        opacity: visible ? 1 : 0,
        transition:
          "max-height 160ms ease, opacity 160ms ease, margin 160ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="mx-1 flex items-center justify-center gap-1.5 rounded-md py-1.5"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: isOver ? "var(--primary-foreground)" : color,
          background: isOver ? color : "transparent",
          border: `1px dashed ${color}`,
          transition: "background 120ms ease, color 120ms ease",
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
    </div>
  )
}
