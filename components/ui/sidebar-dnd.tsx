"use client"

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DndContextProps,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Pin, Trash2 } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

/* -------------------------------------------------------------------------------------------------
 * Zone definitions
 * -----------------------------------------------------------------------------------------------*/

export type SidebarZoneTone = "accent" | "danger" | "muted"
export type SidebarZoneEdge = "top" | "bottom"

/**
 * Declarative description of a drop target. Anything a consumer can drag an item
 * onto — pin, trash, archive, "move to project", … — is just one of these.
 */
export type SidebarDropZoneDef = {
  /** Droppable id. Must be unique within the DnD context. */
  id: string
  /** Text rendered inside the zone while dragging. */
  label: string
  icon?: ReactNode
  tone?: SidebarZoneTone
  /** Render the zone pinned to an edge of the sidebar panel (via `ChatSidebar edgeZones`). */
  edge?: SidebarZoneEdge
  /** Semantic name delivered on `onDrop`. Defaults to the zone id. */
  action?: string
  disabled?: boolean
}

export const SIDEBAR_PIN_ZONE_ID = "sidebar-pin-zone"
export const SIDEBAR_TRASH_ZONE_ID = "sidebar-trash-zone"

/** Prebuilt "drop to pin" zone. Override any field. */
export function pinDropZone(
  overrides: Partial<SidebarDropZoneDef> = {}
): SidebarDropZoneDef {
  return {
    id: SIDEBAR_PIN_ZONE_ID,
    label: "Drop here to pin",
    icon: <Pin className="size-3.5" />,
    tone: "accent",
    edge: "top",
    action: "pin",
    ...overrides,
  }
}

/** Prebuilt "drop to delete" zone. Override any field. */
export function trashDropZone(
  overrides: Partial<SidebarDropZoneDef> = {}
): SidebarDropZoneDef {
  return {
    id: SIDEBAR_TRASH_ZONE_ID,
    label: "Drop here to delete",
    icon: <Trash2 className="size-3.5" />,
    tone: "danger",
    edge: "bottom",
    action: "delete",
    ...overrides,
  }
}

export const DEFAULT_SIDEBAR_ZONES: SidebarDropZoneDef[] = [
  pinDropZone(),
  trashDropZone(),
]

/* -------------------------------------------------------------------------------------------------
 * Drop events
 * -----------------------------------------------------------------------------------------------*/

/** An item was dropped on a zone. `action` is `zone.action ?? zone.id` — e.g. "pin", "delete", "archive". */
export type SidebarZoneDrop = {
  kind: "zone"
  action: string
  itemId: string
  zoneId: string
  zone: SidebarDropZoneDef
}

/** An item was dropped on another item — a reorder inside (or between) registered lists. */
export type SidebarReorderDrop = {
  kind: "reorder"
  action: "reorder"
  itemId: string
  /** List the item was dropped into. */
  listId: string
  /** List the item came from (equal to `listId` for same-list reorders). */
  fromListId: string
  /** Index of the item inside `fromListId`. */
  from: number
  /** Target index inside `listId`. */
  to: number
  /** Id of the item that was dropped on. */
  overId: string
}

/** An item was dropped on a droppable that is neither a zone nor a registered list item. */
export type SidebarCustomDrop = {
  kind: "custom"
  action: "custom"
  itemId: string
  overId: string
}

export type SidebarDndDrop =
  | SidebarZoneDrop
  | SidebarReorderDrop
  | SidebarCustomDrop

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type SidebarDndContextValue = {
  /** Id of the item currently being dragged, or null. */
  activeId: string | null
  /** All zones declared on the provider. */
  zones: SidebarDropZoneDef[]
  /** Zones that asked to be rendered on a sidebar edge. */
  edgeZones: SidebarDropZoneDef[]
  registerList: (listId: string, ids: string[]) => void
  unregisterList: (listId: string) => void
}

const noop = () => {}

const SidebarDndCtx = createContext<SidebarDndContextValue>({
  activeId: null,
  zones: [],
  edgeZones: [],
  registerList: noop,
  unregisterList: noop,
})

export function useSidebarDnd() {
  return useContext(SidebarDndCtx)
}

/**
 * Registers an ordered list of item ids so the provider can translate an
 * item-on-item drop into `{ action: "reorder", from, to }`. No-op outside a provider.
 */
export function useSidebarDndList(listId: string, itemIds: string[]) {
  const { registerList, unregisterList } = useSidebarDnd()

  // Writing to the ref-backed Map is cheap and never re-renders, so keep it
  // fresh on every commit rather than diffing the id array.
  useEffect(() => {
    registerList(listId, itemIds)
  })

  useEffect(() => () => unregisterList(listId), [listId, unregisterList])
}

/* -------------------------------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------------------------*/

export type ChatSidebarDndProps = {
  children: ReactNode
  /** Drop zones available while dragging. Defaults to the pin + trash pair. */
  zones?: SidebarDropZoneDef[]
  /** Fires for every resolved drop (zone, reorder, or custom). */
  onDrop?: (drop: SidebarDndDrop) => void
  /** Convenience hook fired in addition to `onDrop` for reorder drops. */
  onReorder?: (drop: SidebarReorderDrop) => void
  onDragStart?: (itemId: string) => void
  onDragCancel?: () => void
  /** Rendered inside the dnd-kit `DragOverlay` while dragging. */
  renderOverlay?: (itemId: string) => ReactNode
  /** Pixels the mouse must travel before a drag starts — keeps clicks working. */
  activationDistance?: number
  /** Long-press duration (ms) before a touch drag starts — keeps the list scrollable. */
  touchDelay?: number
  modifiers?: Modifier[]
  /** Replace the default mouse + touch + keyboard sensors entirely. */
  sensors?: DndContextProps["sensors"]
}

export function ChatSidebarDnd({
  children,
  zones = DEFAULT_SIDEBAR_ZONES,
  onDrop,
  onReorder,
  onDragStart,
  onDragCancel,
  renderOverlay,
  activationDistance = 6,
  touchDelay = 220,
  modifiers,
  sensors,
}: ChatSidebarDndProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Mouse drags start after a few px; touch drags after a short press, so the
  // sidebar keeps scrolling normally on small screens.
  const defaultSensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: activationDistance },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: touchDelay, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Lists register their ordered ids in a ref: reordering must not re-render the tree.
  const listsRef = useRef<Map<string, string[]>>(new Map())
  const registerList = useCallback((listId: string, ids: string[]) => {
    listsRef.current.set(listId, ids)
  }, [])
  const unregisterList = useCallback((listId: string) => {
    listsRef.current.delete(listId)
  }, [])

  const activeZones = useMemo(
    () => zones.filter((zone) => !zone.disabled),
    [zones]
  )
  const zoneIds = useMemo(
    () => new Set(activeZones.map((zone) => zone.id)),
    [activeZones]
  )
  const edgeZones = useMemo(
    () => activeZones.filter((zone) => zone.edge),
    [activeZones]
  )

  const value = useMemo<SidebarDndContextValue>(
    () => ({
      activeId,
      zones: activeZones,
      edgeZones,
      registerList,
      unregisterList,
    }),
    [activeId, activeZones, edgeZones, registerList, unregisterList]
  )

  /** Zones win whenever the pointer is inside one; items fall back to closest-center. */
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      if (zoneIds.size === 0) return closestCenter(args)

      // Keyboard dragging has no pointer: let zones compete on distance instead.
      if (!args.pointerCoordinates) return closestCenter(args)

      const zoneHits = pointerWithin(args).filter((hit) =>
        zoneIds.has(String(hit.id))
      )
      if (zoneHits.length > 0) return zoneHits

      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => !zoneIds.has(String(container.id))
        ),
      })
    },
    [zoneIds]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id)
      setActiveId(id)
      onDragStart?.(id)
    },
    [onDragStart]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    onDragCancel?.()
  }, [onDragCancel])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)

      const itemId = String(event.active.id)
      const overId = event.over ? String(event.over.id) : null
      if (!overId) return

      const zone = activeZones.find((candidate) => candidate.id === overId)
      if (zone) {
        onDrop?.({
          kind: "zone",
          action: zone.action ?? zone.id,
          itemId,
          zoneId: zone.id,
          zone,
        })
        return
      }

      if (overId === itemId) return

      let fromListId: string | null = null
      let toListId: string | null = null
      let from = -1
      let to = -1
      for (const [listId, ids] of listsRef.current) {
        const fromIndex = ids.indexOf(itemId)
        if (fromIndex !== -1) {
          fromListId = listId
          from = fromIndex
        }
        const toIndex = ids.indexOf(overId)
        if (toIndex !== -1) {
          toListId = listId
          to = toIndex
        }
      }

      if (fromListId !== null && toListId !== null) {
        const drop: SidebarReorderDrop = {
          kind: "reorder",
          action: "reorder",
          itemId,
          listId: toListId,
          fromListId,
          from,
          to,
          overId,
        }
        onReorder?.(drop)
        onDrop?.(drop)
        return
      }

      onDrop?.({ kind: "custom", action: "custom", itemId, overId })
    },
    [activeZones, onDrop, onReorder]
  )

  return (
    <DndContext
      sensors={sensors ?? defaultSensors}
      modifiers={modifiers}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SidebarDndCtx.Provider value={value}>{children}</SidebarDndCtx.Provider>
      <DragOverlay dropAnimation={null}>
        {activeId && renderOverlay ? renderOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  )
}
