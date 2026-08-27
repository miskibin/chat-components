"use client"

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type SidebarDndDrop =
  | { action: "pin"; id: string }
  | { action: "delete"; id: string }
  | { action: "custom"; id: string; overId: string }

type SidebarDndContextValue = {
  activeDragId: string | null
  pinZoneId: string
  trashZoneId: string
}

const SidebarDndCtx = createContext<SidebarDndContextValue>({
  activeDragId: null,
  pinZoneId: "pin-zone",
  trashZoneId: "trash-zone",
})

export function useSidebarDnd() {
  return useContext(SidebarDndCtx)
}

export type ChatSidebarDndProps = {
  children: ReactNode
  renderOverlay?: (id: string) => ReactNode
  onDrop?: (drop: SidebarDndDrop) => void
  pinZoneId?: string
  trashZoneId?: string
}

export function ChatSidebarDnd({
  children,
  renderOverlay,
  onDrop,
  pinZoneId = "pin-zone",
  trashZoneId = "trash-zone",
}: ChatSidebarDndProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  const value = useMemo(
    () => ({ activeDragId, pinZoneId, trashZoneId }),
    [activeDragId, pinZoneId, trashZoneId]
  )

  const handleDragStart = (e: DragStartEvent) =>
    setActiveDragId(String(e.active.id))
  const handleDragCancel = () => setActiveDragId(null)
  const handleDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id)
    const overId = e.over?.id ? String(e.over.id) : null
    setActiveDragId(null)
    if (!overId || !onDrop) return
    if (overId === pinZoneId) onDrop({ action: "pin", id })
    else if (overId === trashZoneId) onDrop({ action: "delete", id })
    else onDrop({ action: "custom", id, overId })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SidebarDndCtx.Provider value={value}>{children}</SidebarDndCtx.Provider>
      <DragOverlay dropAnimation={null}>
        {activeDragId && renderOverlay ? renderOverlay(activeDragId) : null}
      </DragOverlay>
    </DndContext>
  )
}
