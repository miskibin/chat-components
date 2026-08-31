import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { SidebarExample } from "@/components/examples/sidebar-example"
import { SidebarItemExample } from "@/components/examples/sidebar-item-example"
import { SidebarMobileExample } from "@/components/examples/sidebar-mobile-example"
import { SidebarReorderExample } from "@/components/examples/sidebar-reorder-example"
import { SidebarRichExample } from "@/components/examples/sidebar-rich-example"
import { SidebarZonesExample } from "@/components/examples/sidebar-zones-example"

export const sidebarDocs = {
  "chat-sidebar": {
    title: "Chat Sidebar",
    description:
      "Collapsible sidebar chrome composed from slots — brand, nav, sections, rail, footer — and the single import surface for the whole sidebar family.",
    registry: "chat-sidebar",
    registryDependencies: ["sidebar-item", "sidebar-dnd", "sidebar-drop-zones"],
    preview: {
      name: "sidebar-example",
      node: <SidebarExample />,
      align: "stretch",
    },
    usage: `"use client"

import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItemList,
  SideRow,
  SidebarCollapsibleSection,
} from "@/components/ui/chat-sidebar"

export function Nav() {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(true)

  return (
    <ChatSidebarDnd onDrop={handleDrop}>
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        edgeZones
        brand={<span className="px-1 text-sm font-medium">Chats</span>}
        nav={<SideRow icon={<Pencil className="size-4" />}>New chat</SideRow>}
      >
        <SidebarCollapsibleSection
          title="Recent"
          open={open}
          onToggle={() => setOpen((value) => !value)}
          count={chats.length}
        >
          <ChatSidebarItemList listId="recent" items={chats} sortable />
        </SidebarCollapsibleSection>
      </ChatSidebar>
    </ChatSidebarDnd>
  )
}`,
    props: [
      {
        caption: "ChatSidebar",
        rows: [
          {
            name: "collapsed",
            type: "boolean",
            required: true,
            description:
              "Controlled. Collapsed swaps the panel for the icon rail.",
          },
          {
            name: "onCollapsedChange",
            type: "(collapsed: boolean) => void",
            required: true,
            description: "Fired by the header and rail toggles.",
          },
          {
            name: "brand",
            type: "React.ReactNode",
            description: "Header content of the expanded panel.",
          },
          {
            name: "nav",
            type: "React.ReactNode",
            description:
              "Sticky rows under the header — new chat, search. Usually SideRow.",
          },
          {
            name: "rail",
            type: "React.ReactNode",
            description:
              "Content of the collapsed rail. Usually SideIconBtn mirrors of nav.",
          },
          {
            name: "children",
            type: "React.ReactNode",
            description: "The scrollable body: sections and item lists.",
          },
          {
            name: "footer",
            type: "React.ReactNode",
            description: "Rendered in both the panel footer and the rail.",
          },
          {
            name: "overlays",
            type: "React.ReactNode",
            description:
              "Absolutely positioned extras inside the panel — a search palette, for instance.",
          },
          {
            name: "edgeZones",
            type: "boolean",
            default: "false",
            description: (
              <>
                Render the edge drop zones declared on the surrounding{" "}
                <DocsCode>ChatSidebarDnd</DocsCode> while a drag is in progress.
              </>
            ),
          },
          {
            name: "widthExpanded",
            type: "number",
            default: "290",
            description: "Panel width in pixels.",
          },
          {
            name: "widthCollapsed",
            type: "number",
            default: "60",
            description: "Rail width in pixels.",
          },
          {
            name: "classNames",
            type: "{ rail?, panel?, header?, nav?, content?, footer? }",
            description: "Per-region class overrides.",
          },
          {
            name: "collapseLabel",
            type: "string",
            default: '"Collapse sidebar"',
            description: "Accessible label for the collapse button.",
          },
          {
            name: "expandLabel",
            type: "string",
            default: '"Open sidebar"',
            description: "Accessible label for the rail button.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the root element.",
          },
        ],
      },
      {
        caption: "SideRow / SideIconBtn / SidebarCollapsibleSection",
        rows: [
          {
            name: "SideRow",
            type: '{ icon?, hint? } & ComponentProps<"button">',
            description:
              "Full-width nav row with a leading icon and a trailing hint (a shortcut, usually).",
          },
          {
            name: "SideIconBtn",
            type: '{ label: string } & ComponentProps<"button">',
            description: (
              <>
                Square icon button for the rail and header.{" "}
                <DocsCode>label</DocsCode> becomes the title and aria-label.
              </>
            ),
          },
          {
            name: "SidebarCollapsibleSection",
            type: "{ title, open, onToggle, count?, description?, action?, className?, children }",
            description:
              "Uppercase section header with a rotating chevron, an optional count, and a slot for a header action.",
          },
          {
            name: "SidebarEmptyState",
            type: "{ children, className? }",
            description: (
              <>
                Muted placeholder for an empty list — pass it as{" "}
                <DocsCode>emptyState</DocsCode>.
              </>
            ),
          },
        ],
      },
      {
        caption: "Constants",
        rows: [
          {
            name: "SIDEBAR_WIDTH_EXPANDED",
            type: "290",
            description: "Default panel width.",
          },
          {
            name: "SIDEBAR_WIDTH_COLLAPSED",
            type: "60",
            description: "Default rail width.",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "chat-sidebar",
        description: (
          <>
            Root. Carries <DocsCode>data-collapsed</DocsCode>.
          </>
        ),
      },
      { slot: "chat-sidebar-rail", description: "Collapsed icon rail." },
      { slot: "chat-sidebar-panel", description: "Expanded panel." },
      { slot: "chat-sidebar-header", description: "Brand row." },
      { slot: "chat-sidebar-nav", description: "Sticky nav rows." },
      { slot: "chat-sidebar-content", description: "Scrollable body." },
      { slot: "chat-sidebar-footer", description: "Footer region." },
      {
        slot: "sidebar-section",
        description: (
          <>
            Collapsible section. Carries <DocsCode>data-state</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "One import surface",
        description: (
          <>
            <DocsCode>chat-sidebar</DocsCode> re-exports the whole family — the
            item list, the DnD provider, the zone helpers, and every type — so
            application code never reaches into{" "}
            <DocsCode>sidebar-item</DocsCode>,{" "}
            <DocsCode>sidebar-dnd</DocsCode>, or{" "}
            <DocsCode>sidebar-drop-zones</DocsCode> directly.
          </>
        ),
        code: {
          lang: "tsx",
          code: `import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItem,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  DEFAULT_SIDEBAR_ZONES,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarDropZone,
  SidebarEdgeDropZone,
  SidebarEmptyState,
  SidebarItemStatusDot,
  pinDropZone,
  trashDropZone,
  useSidebarDnd,
  useSidebarDndList,
  type ChatSidebarItemData,
  type SidebarDndDrop,
  type SidebarDropZoneDef,
} from "@/components/ui/chat-sidebar"`,
        },
      },
      {
        title: "Widths and per-region classes",
        description: (
          <>
            Widths are numbers because the root animates{" "}
            <DocsCode>width</DocsCode> between them.{" "}
            <DocsCode>classNames</DocsCode> reaches each region without
            selectors.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChatSidebar
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  widthExpanded={320}
  widthCollapsed={52}
  className="border-r-0 bg-background"
  classNames={{
    header: "border-b-0 pt-4",
    content: "px-3",
    footer: "bg-muted/40",
  }}
/>`,
        },
      },
      {
        title: "Off-canvas on mobile",
        description: (
          <>
            The sidebar itself never changes shape — a wrapper slides it over
            the conversation and a backdrop closes it. Below,{" "}
            <DocsCode>absolute</DocsCode> keeps the demo inside its frame; in a
            real layout use <DocsCode>fixed</DocsCode> with{" "}
            <DocsCode>max-md:</DocsCode> guards, exactly as{" "}
            <DocsCode>app/demo/page.tsx</DocsCode> does.
          </>
        ),
        example: {
          name: "sidebar-mobile-example",
          node: <SidebarMobileExample />,
          align: "stretch" as const,
        },
      },
    ],
    notes: [
      {
        title: "Hover color",
        description: (
          <>
            Rows hover to <DocsCode>bg-sidebar-accent</DocsCode> rather than{" "}
            <DocsCode>bg-accent</DocsCode> on purpose: the sidebar has its own
            token set so it can sit on a different surface from the
            conversation. Retheme it by redefining{" "}
            <DocsCode>--sidebar</DocsCode> and friends, not by patching classes.
          </>
        ),
      },
    ],
  },

  "sidebar-item": {
    title: "Sidebar Item",
    description:
      "The session row and its list: one line or two, rename in place, pin, delete, status dots, a context menu, drag-to-reorder, and a full render escape hatch.",
    registry: "sidebar-item",
    registryDependencies: ["context-menu", "sidebar-dnd"],
    preview: { name: "sidebar-item-example", node: <SidebarItemExample /> },
    usage: `"use client"

import {
  ChatSidebarItemList,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"

export function Chats({ items }: { items: ChatSidebarItemData[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id)

  return (
    <ChatSidebarItemList
      listId="recent"
      items={items}
      activeId={activeId}
      sortable
      onSelect={setActiveId}
      onRename={rename}
      onTogglePin={togglePin}
      onDelete={remove}
    />
  )
}`,
    props: [
      {
        caption: "ChatSidebarItemList",
        rows: [
          {
            name: "items",
            type: "ChatSidebarItemData[]",
            required: true,
            description: "Rows, in render order.",
          },
          {
            name: "activeId",
            type: "string",
            description: "Highlights one row.",
          },
          {
            name: "listId",
            type: "string",
            default: "useId()",
            description: (
              <>
                Identifies this list in reorder events. Pass a readable one
                (&ldquo;pinned&rdquo;, &ldquo;recent&rdquo;) whenever you render
                more than one list.
              </>
            ),
          },
          {
            name: "draggable",
            type: "boolean",
            default: "true",
            description: "Rows can be dragged onto drop zones.",
          },
          {
            name: "sortable",
            type: "boolean",
            default: "false",
            description: (
              <>
                Rows can also be dragged onto each other to reorder. Implies{" "}
                <DocsCode>draggable</DocsCode>.
              </>
            ),
          },
          {
            name: "groupPinned",
            type: "boolean",
            default: "true",
            description:
              "Draws a separator where the pinned group ends. Assumes pinned rows come first.",
          },
          {
            name: "showStatusDot",
            type: "boolean",
            default: "true",
            description: "Leading status dot on unpinned rows.",
          },
          {
            name: "emptyState",
            type: "React.ReactNode",
            description: "Rendered instead of the rows when items is empty.",
          },
          {
            name: "onSelect",
            type: "(id: string) => void",
            description: "Row click.",
          },
          {
            name: "onRename",
            type: "(id: string, title: string) => void",
            description:
              "Enables double-click and context-menu renaming. Fires only on a real change.",
          },
          {
            name: "onTogglePin",
            type: "(id: string, pinned: boolean) => void",
            description: "Enables the pin entry in the context menu.",
          },
          {
            name: "onDelete",
            type: "(id: string) => void",
            description: "Enables the destructive delete entry.",
          },
          {
            name: "getMenuActions",
            type: "(item) => SidebarItemMenuAction[]",
            description: "Extra context-menu entries, prepended to the built-ins.",
          },
          {
            name: "renderContent",
            type: "(item, ctx: { active, pinned }) => React.ReactNode",
            description: (
              <>
                Replaces the body of every row — the shell, drag listeners,
                context menu and renaming stay. Return{" "}
                <DocsCode>undefined</DocsCode> for a row to keep the default
                body. Its identity is stabilized internally, so an inline
                callback still leaves rows memoized.
              </>
            ),
          },
          {
            name: "className / itemClassName",
            type: "string",
            description: "Merged onto the list, and onto every row.",
          },
        ],
      },
      {
        caption: "ChatSidebarItemData",
        rows: [
          { name: "id", type: "string", required: true, description: "Stable key and drag id." },
          { name: "title", type: "string", required: true, description: 'Falls back to "Untitled".' },
          {
            name: "pinned",
            type: "boolean",
            description: "Swaps the status dot for a pin icon.",
          },
          {
            name: "status",
            type: '"idle" | "active" | "streaming" | "pending" | "fault"',
            description:
              "Dot color. Defaults to active when the row is the active one.",
          },
          {
            name: "leading",
            type: "React.ReactNode",
            description: "Custom leading node, rendered instead of the dot.",
          },
        ],
      },
      {
        caption: "Other exports",
        rows: [
          {
            name: "ChatSidebarItem",
            type: "{ item, active?, draggable?, sortable?, showDivider?, showStatusDot?, menuActions?, on… }",
            description:
              "The single row, for lists you assemble yourself. The list component is the usual entry point.",
          },
          {
            name: "ChatSidebarItemGhost",
            type: "{ item, active?, className? }",
            description: (
              <>
                The drag preview. Return it from{" "}
                <DocsCode>renderOverlay</DocsCode>.
              </>
            ),
          },
          {
            name: "SidebarItemStatusDot",
            type: "{ status?, className? }",
            description:
              "The dot on its own, for legends or custom leading nodes.",
          },
          {
            name: "SidebarItemMenuAction",
            type: "{ id, label, icon?, onSelect, destructive?, separatorBefore? }",
            description: "Shape of a custom context-menu entry.",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "sidebar-item",
        description: (
          <>
            Row wrapper. Carries <DocsCode>data-active</DocsCode>,{" "}
            <DocsCode>data-pinned</DocsCode>, and{" "}
            <DocsCode>data-dragging</DocsCode>.
          </>
        ),
      },
      { slot: "sidebar-item-button", description: "The clickable row." },
      { slot: "sidebar-item-input", description: "The rename input." },
      {
        slot: "sidebar-item-status",
        description: (
          <>
            Status dot. Carries <DocsCode>data-status</DocsCode>.
          </>
        ),
      },
      {
        slot: "sidebar-item-list",
        description: (
          <>
            The list. Carries <DocsCode>data-list-id</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "Extra context-menu entries",
        description: (
          <>
            <DocsCode>getMenuActions</DocsCode> entries render above the
            built-in rename / pin / delete group.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChatSidebarItemList
  items={items}
  onDelete={remove}
  getMenuActions={(item) => [
    {
      id: "duplicate",
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: () => duplicate(item.id),
    },
    {
      id: "export",
      label: "Export as JSON",
      icon: <Download className="size-3.5" />,
      onSelect: () => exportChat(item.id),
      separatorBefore: true,
    },
  ]}
/>`,
        },
      },
      {
        title: "Status dots and custom leading nodes",
        description: (
          <>
            <DocsCode>status</DocsCode> covers the common states;{" "}
            <DocsCode>leading</DocsCode> replaces the dot entirely when you need
            an avatar or a project glyph.
          </>
        ),
        code: {
          lang: "tsx",
          code: `const items: ChatSidebarItemData[] = [
  { id: "1", title: "Release checklist", pinned: true },
  { id: "2", title: "Streaming bugs", status: "streaming" },
  { id: "3", title: "Retry tool call", status: "fault" },
  { id: "4", title: "Design review", leading: <Avatar className="size-3.5" /> },
]

// The dot on its own, e.g. in a legend:
<SidebarItemStatusDot status="fault" className="size-1.5" />`,
        },
      },
    ],
    notes: [
      {
        title: "Stable callbacks",
        description: (
          <>
            Rows are memoized and the list keeps your handler identities stable
            internally, so a parent re-render does not re-render every row. Pass
            handlers directly; there is no need to memoize them yourself.
          </>
        ),
      },
    ],
  },

  "sidebar-dnd": {
    title: "Sidebar DnD",
    description:
      "The drag-and-drop context: declarative drop zones, drag-to-reorder across lists, and one discriminated union describing every drop.",
    registry: "sidebar-dnd",
    preview: {
      name: "sidebar-reorder-example",
      node: <SidebarReorderExample />,
    },
    usage: `"use client"

import { arrayMove } from "@dnd-kit/sortable"
import {
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  type SidebarDndDrop,
} from "@/components/ui/chat-sidebar"

function handleDrop(drop: SidebarDndDrop) {
  if (drop.kind === "reorder") {
    setItems((prev) => arrayMove(prev, drop.from, drop.to))
    return
  }
  if (drop.action === "pin") pin(drop.itemId)
  if (drop.action === "delete") remove(drop.itemId)
}

export function Nav() {
  return (
    <ChatSidebarDnd
      onDrop={handleDrop}
      renderOverlay={(id) => {
        const item = items.find((candidate) => candidate.id === id)
        return item ? <ChatSidebarItemGhost item={item} /> : null
      }}
    >
      <ChatSidebarItemList listId="recent" items={items} sortable />
    </ChatSidebarDnd>
  )
}`,
    props: [
      {
        caption: "ChatSidebarDnd",
        rows: [
          {
            name: "zones",
            type: "SidebarDropZoneDef[]",
            default: "DEFAULT_SIDEBAR_ZONES",
            description: (
              <>
                Drop targets available while dragging. Defaults to the pin +
                trash pair; pass <DocsCode>[]</DocsCode> for reorder-only.
              </>
            ),
          },
          {
            name: "onDrop",
            type: "(drop: SidebarDndDrop) => void",
            description: "Fires for every resolved drop — zone, reorder, custom.",
          },
          {
            name: "onReorder",
            type: "(drop: SidebarReorderDrop) => void",
            description: (
              <>
                Convenience hook fired <em>in addition to</em>{" "}
                <DocsCode>onDrop</DocsCode> for reorder drops.
              </>
            ),
          },
          {
            name: "renderOverlay",
            type: "(itemId: string) => React.ReactNode",
            description: (
              <>
                Rendered in the dnd-kit drag overlay. Usually{" "}
                <DocsCode>ChatSidebarItemGhost</DocsCode>.
              </>
            ),
          },
          {
            name: "onDragStart / onDragCancel",
            type: "(itemId: string) => void / () => void",
            description: "Drag lifecycle hooks.",
          },
          {
            name: "activationDistance",
            type: "number",
            default: "6",
            description:
              "Pixels the mouse must travel before a drag starts, so plain clicks keep working.",
          },
          {
            name: "touchDelay",
            type: "number",
            default: "220",
            description:
              "Long-press duration before a touch drag starts, so the list stays scrollable.",
          },
          {
            name: "modifiers / sensors",
            type: "Modifier[] / SensorDescriptor[]",
            description:
              "Passed through to dnd-kit. Providing sensors replaces the mouse + touch + keyboard defaults entirely.",
          },
        ],
      },
      {
        caption: "SidebarDropZoneDef",
        rows: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Droppable id, unique within the context.",
          },
          {
            name: "label",
            type: "string",
            required: true,
            description: "Text shown inside the zone while dragging.",
          },
          { name: "icon", type: "React.ReactNode", description: "Leading icon." },
          {
            name: "tone",
            type: '"accent" | "danger" | "muted"',
            default: '"accent"',
            description: "Color treatment, including the drag-over state.",
          },
          {
            name: "edge",
            type: '"top" | "bottom"',
            description: (
              <>
                Pin the zone to that edge of the sidebar panel. Needs{" "}
                <DocsCode>edgeZones</DocsCode> on{" "}
                <DocsCode>ChatSidebar</DocsCode>.
              </>
            ),
          },
          {
            name: "action",
            type: "string",
            default: "zone.id",
            description: (
              <>
                Semantic name delivered on <DocsCode>onDrop</DocsCode> — this is
                what you switch on.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            description: "Filtered out of the active zone set.",
          },
        ],
      },
      {
        caption: "SidebarDndDrop",
        rows: [
          {
            name: 'kind: "zone"',
            type: "{ action, itemId, zoneId, zone }",
            description: (
              <>
                An item landed on a zone. Narrow with{" "}
                <DocsCode>drop.action</DocsCode>.
              </>
            ),
          },
          {
            name: 'kind: "reorder"',
            type: "{ itemId, listId, fromListId, from, to, overId }",
            description: (
              <>
                An item landed on another item.{" "}
                <DocsCode>fromListId !== listId</DocsCode> means it crossed
                lists.
              </>
            ),
          },
          {
            name: 'kind: "custom"',
            type: "{ itemId, overId }",
            description:
              "Landed on a droppable that is neither a zone nor a registered list item.",
          },
        ],
      },
      {
        caption: "Helpers",
        rows: [
          {
            name: "pinDropZone(overrides?)",
            type: "SidebarDropZoneDef",
            description: (
              <>
                Preset: top edge, accent tone,{" "}
                <DocsCode>action: &quot;pin&quot;</DocsCode>. Every field is
                overridable.
              </>
            ),
          },
          {
            name: "trashDropZone(overrides?)",
            type: "SidebarDropZoneDef",
            description: (
              <>
                Preset: bottom edge, danger tone,{" "}
                <DocsCode>action: &quot;delete&quot;</DocsCode>.
              </>
            ),
          },
          {
            name: "DEFAULT_SIDEBAR_ZONES",
            type: "SidebarDropZoneDef[]",
            description: "The pin + trash pair, used when zones is omitted.",
          },
          {
            name: "useSidebarDnd()",
            type: "{ activeId, zones, edgeZones, … }",
            description:
              "Read the drag state — mount inline zones only while activeId is set.",
          },
          {
            name: "useSidebarDndList(listId, itemIds)",
            type: "void",
            description: (
              <>
                Registers an ordered id list so item-on-item drops resolve to{" "}
                <DocsCode>from</DocsCode>/<DocsCode>to</DocsCode>. Called for you
                by <DocsCode>ChatSidebarItemList</DocsCode>; call it yourself
                only for custom lists. No-op outside a provider.
              </>
            ),
          },
        ],
      },
    ],
    customization: [
      {
        title: "Narrow the drop union",
        description: (
          <>
            Zone drops and reorders arrive through the same callback. Check{" "}
            <DocsCode>drop.kind</DocsCode> first, then{" "}
            <DocsCode>drop.action</DocsCode> — the provider never mutates your
            data, it only reports what happened.
          </>
        ),
        code: {
          lang: "tsx",
          code: `function handleDrop(drop: SidebarDndDrop) {
  if (drop.kind === "reorder") {
    const { fromListId, listId, from, to } = drop
    if (fromListId === listId) {
      setItems((prev) => arrayMove(prev, from, to))
    } else {
      moveBetweenLists(drop.itemId, fromListId, listId, to)
    }
    return
  }

  if (drop.kind === "zone") {
    switch (drop.action) {
      case "pin":
        return pin(drop.itemId)
      case "delete":
        return remove(drop.itemId)
      case "archive":
        return archive(drop.itemId)
    }
  }
}`,
        },
      },
      {
        title: "Custom zones",
        description: (
          <>
            Pin and trash are just presets over{" "}
            <DocsCode>SidebarDropZoneDef</DocsCode>. Anything you can drag onto
            — archive, &ldquo;move to project&rdquo;, a per-folder target — is
            one more entry in the array.
          </>
        ),
        example: { name: "sidebar-zones-example", node: <SidebarZonesExample /> },
      },
      {
        title: "Register your own list",
        description: (
          <>
            If you render rows without{" "}
            <DocsCode>ChatSidebarItemList</DocsCode>, register their ids so
            item-on-item drops still resolve to indices.
          </>
        ),
        code: {
          lang: "tsx",
          code: `function ProjectList({ projects }: { projects: Project[] }) {
  useSidebarDndList(
    "projects",
    React.useMemo(() => projects.map((project) => project.id), [projects])
  )

  return (
    <SortableContext
      items={projects.map((project) => project.id)}
      strategy={verticalListSortingStrategy}
    >
      {projects.map((project) => (
        <ChatSidebarItem key={project.id} item={project} sortable />
      ))}
    </SortableContext>
  )
}`,
        },
      },
    ],
    notes: [
      {
        title: "Keyboard dragging",
        description: (
          <>
            The keyboard sensor is on by default: focus a row, press Space or
            Enter to lift it, move with the arrow keys, Space to drop, Escape to
            cancel. Keyboard dragging has no pointer, so zones compete on
            distance rather than containment — an edge zone can therefore be
            hard to reach by keyboard alone. Always leave a non-drag path to the
            same action (the context menu already offers pin and delete).
          </>
        ),
      },
    ],
  },

  "sidebar-drop-zones": {
    title: "Sidebar Drop Zones",
    description:
      "The two renderers behind a zone definition: a full-height strip pinned to an edge of the panel, and an inline strip that opens in the scroll flow.",
    registry: "sidebar-drop-zones",
    registryDependencies: ["sidebar-dnd"],
    preview: { name: "sidebar-zones-example", node: <SidebarZonesExample /> },
    usage: `"use client"

import {
  SidebarDropZone,
  useSidebarDnd,
} from "@/components/ui/chat-sidebar"

export function ArchiveZone() {
  const { activeId } = useSidebarDnd()

  return (
    <SidebarDropZone
      id="archive-zone"
      label="Drop here to archive"
      icon={<Archive className="size-3.5" />}
      tone="muted"
      visible={!!activeId}
    />
  )
}`,
    props: [
      {
        caption: "SidebarDropZone (inline)",
        rows: [
          {
            name: "id",
            type: "string",
            required: true,
            description: (
              <>
                Must match the <DocsCode>id</DocsCode> of a zone declared on the
                provider, or the drop resolves as{" "}
                <DocsCode>kind: &quot;custom&quot;</DocsCode>.
              </>
            ),
          },
          {
            name: "visible",
            type: "boolean",
            required: true,
            description:
              "Collapses to zero height when false. Drive it from useSidebarDnd().activeId.",
          },
          { name: "label", type: "React.ReactNode", required: true, description: "Zone text." },
          { name: "icon", type: "React.ReactNode", description: "Leading icon." },
          {
            name: "tone",
            type: '"accent" | "danger" | "muted"',
            default: '"accent"',
            description: "Color treatment, including drag-over.",
          },
          {
            name: "className / surfaceClassName",
            type: "string",
            description: "Merged onto the wrapper, and onto the dashed surface.",
          },
        ],
      },
      {
        caption: "SidebarEdgeDropZone",
        rows: [
          {
            name: "edge",
            type: '"top" | "bottom"',
            default: '"top"',
            description: "Which edge of the sidebar panel it anchors to.",
          },
          {
            name: "id / label / icon / tone",
            type: "same as above",
            description: (
              <>
                Mount it only while a drag is active — it animates itself in.{" "}
                <DocsCode>ChatSidebar edgeZones</DocsCode> does this for you.
              </>
            ),
          },
        ],
      },
      {
        caption: "Helper",
        rows: [
          {
            name: "dropZoneProps(zone)",
            type: "{ id, label, icon, tone }",
            description:
              "Turns a zone definition into the props both components take.",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "sidebar-drop-zone",
        description: (
          <>
            Inline zone. Carries <DocsCode>data-over</DocsCode> and{" "}
            <DocsCode>data-visible</DocsCode>.
          </>
        ),
      },
      {
        slot: "sidebar-edge-drop-zone",
        description: (
          <>
            Edge zone. Carries <DocsCode>data-over</DocsCode> and{" "}
            <DocsCode>data-edge</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "Edge zones without lifting a finger",
        description: (
          <>
            Declare zones with an <DocsCode>edge</DocsCode> and let{" "}
            <DocsCode>ChatSidebar</DocsCode> mount and unmount them around the
            drag.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChatSidebarDnd
  zones={[
    pinDropZone(),
    trashDropZone({ label: "Move to trash" }),
  ]}
  onDrop={handleDrop}
>
  <ChatSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} edgeZones>
    …
  </ChatSidebar>
</ChatSidebarDnd>`,
        },
      },
      {
        title: "Restyle a zone",
        description: (
          <>
            <DocsCode>tone</DocsCode> covers the three standard treatments;{" "}
            <DocsCode>surfaceClassName</DocsCode> reaches the dashed surface
            itself for anything else.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<SidebarDropZone
  id="archive-zone"
  label="Archive"
  tone="muted"
  visible={!!activeId}
  surfaceClassName="rounded-full border-solid py-2 text-[11px] uppercase tracking-wide"
/>`,
        },
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
