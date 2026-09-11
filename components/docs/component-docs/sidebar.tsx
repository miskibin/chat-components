import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { SidebarActionsExample } from "@/components/examples/sidebar-actions-example"
import { SidebarDividersExample } from "@/components/examples/sidebar-dividers-example"
import { SidebarDropVerbExample } from "@/components/examples/sidebar-drop-verb-example"
import { SidebarExample } from "@/components/examples/sidebar-example"
import { SidebarItemExample } from "@/components/examples/sidebar-item-example"
import { SidebarItemMenuExample } from "@/components/examples/sidebar-item-menu-example"
import { SidebarItemStatusExample } from "@/components/examples/sidebar-item-status-example"
import { SidebarMobileExample } from "@/components/examples/sidebar-mobile-example"
import { SidebarMotionExample } from "@/components/examples/sidebar-motion-example"
import { SidebarReorderExample } from "@/components/examples/sidebar-reorder-example"
import { SidebarResizeExample } from "@/components/examples/sidebar-resize-example"
import { SidebarRichExample } from "@/components/examples/sidebar-rich-example"
import { SidebarSectionRuleExample } from "@/components/examples/sidebar-section-rule-example"
import { SidebarSelectionExample } from "@/components/examples/sidebar-selection-example"
import { SidebarStyledExample } from "@/components/examples/sidebar-styled-example"
import { SidebarZonesExample } from "@/components/examples/sidebar-zones-example"

export const sidebarDocs = {
  "chat-sidebar": {
    title: "Chat Sidebar",
    description:
      "Collapsible sidebar chrome composed from slots — brand, nav, sections, rail, footer — with icon quick actions that pop on click, and the single import surface for the whole sidebar family.",
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
  SideActionRow,
  SideIconBtn,
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
        nav={
          <SideActionRow>
            <SideIconBtn label="New chat">
              <Pencil className="size-4" />
            </SideIconBtn>
          </SideActionRow>
        }
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
              "Quick actions under the header — new chat, search. Usually SideActionRow of SideIconBtn.",
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
            name: "dividers",
            type: "boolean",
            default: "false",
            description:
              "Rules under the header and above the footer. Off by default — the panel already reads as one column, and a line every few rows is what makes a chat sidebar look busy.",
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
            name: "width",
            type: "number | string",
            description: (
              <>
                Expanded width, overriding <DocsCode>widthExpanded</DocsCode>. A
                number is pixels, a string is used verbatim. Left alone the
                panel reads{" "}
                <DocsCode>var(--chat-sidebar-width, widthExpanded)</DocsCode>,
                which is how <DocsCode>SidebarResizeRail</DocsCode> drives it
                without a React render per frame.
              </>
            ),
          },
          {
            name: "animateWidth",
            type: "boolean",
            default: "true",
            description:
              "Eases the collapse over 300ms and fades the inactive view so the swap is visible. Pass false to snap — width is a layout property, and the transition reflows everything beside the sidebar.",
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
        ],
      },
      {
        caption: "SideRow / SideActionRow / SideIconBtn / SidebarCollapsibleSection",
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
                Square icon button for quick actions, the rail and the header.{" "}
                <DocsCode>label</DocsCode> becomes the title and aria-label. A
                click pops the glyph — no extra icon library.
              </>
            ),
          },
          {
            name: "SideActionRow",
            type: 'ComponentProps<"div">',
            description:
              "Horizontal cluster of SideIconBtn — New chat, Search, and the like.",
          },
          {
            name: "SidebarCollapsibleSection",
            type: "{ title, open, onToggle, count?, description?, action?, rule?, live?, className?, children }",
            description:
              "Uppercase section header with a rotating chevron, an optional count, and a slot for a header action.",
          },
          {
            name: "rule",
            type: "boolean",
            default: "false",
            description: (
              <>
                On <DocsCode>SidebarCollapsibleSection</DocsCode>: label, a
                hairline across the rest of the row, chevron at the far end —
                the shape a per-folder list wants. With{" "}
                <DocsCode>action</DocsCode> set, the chips move onto a second
                row so a long label can truncate instead of colliding with them.
              </>
            ),
          },
          {
            name: "action",
            type: "ReactNode",
            description: (
              <>
                Extra header content on{" "}
                <DocsCode>SidebarCollapsibleSection</DocsCode> — a branch, git
                chips, a port. With <DocsCode>rule</DocsCode> it sits on a
                second row; otherwise at the right edge, before the count.
              </>
            ),
          },
          {
            name: "live",
            type: "boolean",
            default: "false",
            description: (
              <>
                On <DocsCode>SidebarCollapsibleSection</DocsCode>: a dot on the
                header while the section is closed, so a folded folder still
                says something inside it is running. Animates only while it is
                on screen and the tab is in front.
              </>
            ),
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
      "chat-sidebar",
      "chat-sidebar-rail",
      "chat-sidebar-panel",
      "chat-sidebar-header",
      "chat-sidebar-nav",
      "chat-sidebar-content",
      "chat-sidebar-footer",
      "sidebar-row",
      "sidebar-icon-button",
      "sidebar-action-row",
      "sidebar-section",
      "sidebar-section-trigger",
      "sidebar-section-rule",
      "sidebar-section-live",
      "sidebar-section-action",
    ],
    examples: [
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
  SideActionRow,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarDropZone,
  SidebarEdgeDropZone,
  SidebarEmptyState,
  SidebarItemStatusDot,
  SidebarResizeRail,
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
        title: "Dividers are opt-in",
        description: (
          <>
            The panel paints no rules by default — one column of rows reads as
            one column without them, and a line every few rows is what makes a
            chat sidebar look busy. <DocsCode>dividers</DocsCode> puts them back
            under the header and above the footer when the footer carries enough
            weight to want separating.
          </>
        ),
        example: {
          name: "sidebar-dividers-example",
          node: <SidebarDividersExample />,
          align: "stretch" as const,
        },
      },
      {
        title: "Widths and per-region classes",
        description: (
          <>
            Widths are numbers, so the collapsed rail and the expanded panel
            are both yours to size; <DocsCode>animateWidth</DocsCode> eases
            between them (on by default).{" "}
            <DocsCode>classNames</DocsCode> reaches each region — rail, panel,
            header, nav, content, footer — without a single descendant selector.
            Collapse it below to see both widths.
          </>
        ),
        example: {
          name: "sidebar-styled-example",
          node: <SidebarStyledExample />,
          align: "stretch" as const,
        },
      },
      {
        title: "Section headers as rules",
        description: (
          <>
            <DocsCode>rule</DocsCode> turns a section header into a label, a
            hairline and a chevron — one line per working folder instead of a
            stack of captions. Pass <DocsCode>action</DocsCode> and the chips
            drop onto a second row so they cannot paint over a long name.{" "}
            <DocsCode>live</DocsCode> adds the dot that keeps
            a closed section honest while a chat inside it streams; it animates
            only while it is on screen and the tab is in front, so a folded
            sidebar full of them costs nothing. Toggle either section below.
          </>
        ),
        example: {
          name: "sidebar-section-rule-example",
          node: <SidebarSectionRuleExample />,
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
        title: "One observer for every looping animation",
        description: (
          <>
            The live dot does not simply loop. <DocsCode>live</DocsCode> is
            wired to <DocsCode>lib/visible-animation.ts</DocsCode>, which shares
            a single <DocsCode>IntersectionObserver</DocsCode>, one{" "}
            <DocsCode>visibilitychange</DocsCode> listener and one
            reduced-motion query across the whole page, and writes{" "}
            <DocsCode>--visible-animation-state</DocsCode> and{" "}
            <DocsCode>--visible-animation-will-change</DocsCode> on each
            element. Any animation can read them —{" "}
            <DocsCode>
              animation-play-state: var(--visible-animation-state, running)
            </DocsCode>{" "}
            — and stop when it is scrolled away or the tab goes to the
            background. The fallback is <DocsCode>running</DocsCode>, so
            forgetting the ref degrades to an ordinary animation rather than a
            frozen one. <DocsCode>observeVisibleAnimation(element)</DocsCode> is
            the imperative form and returns its own unsubscribe;{" "}
            <DocsCode>useVisibleAnimation()</DocsCode> is a ref callback.
          </>
        ),
      },
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
      "The session row and its list: one line or two, rename in place, pin, delete, Shift-click range select with bulk pin/delete, status dots, a context menu, drag-to-reorder, and a full render escape hatch.",
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
            name: "motion",
            type: "boolean",
            default: "false",
            description: (
              <>
                Animate rows between their layout positions — a chat arriving, a
                deletion, a filter, a drag release. Transform and opacity only,
                150ms, and it stands down entirely under{" "}
                <DocsCode>prefers-reduced-motion</DocsCode> or when a single
                update would fade more than forty rows.
              </>
            ),
          },
          {
            name: "contentVisibility",
            type: "boolean",
            default: "true",
            description: (
              <>
                Rows scrolled out of the sidebar skip layout and paint (
                <DocsCode>content-visibility: auto</DocsCode>), reserving their
                own height so the scrollbar stays honest. Turn it off for a list
                short enough that the reserved size costs more than the skipped
                work saves.
              </>
            ),
          },
          {
            name: "renderActions",
            type: "(item, ctx) => React.ReactNode",
            description: (
              <>
                Row controls that take the meta slot on hover or keyboard focus.
                Identity is stabilized internally, so an inline callback still
                leaves rows memoized.
              </>
            ),
          },
          {
            name: "renameRequest",
            type: "{ id: string; token: number }",
            description: (
              <>
                Opens one row&apos;s inline rename input from outside the
                sidebar. Bump <DocsCode>token</DocsCode> (0 is idle) to request
                it — for a command palette&apos;s &ldquo;Rename current
                chat&rdquo; or a keyboard shortcut. The row itself owns the
                editing state, so nothing else has to, and the input is seeded
                with the title the row is showing right now — a title the app
                regenerated in the meantime included.
              </>
            ),
          },
          {
            name: "emptyState",
            type: "React.ReactNode",
            description: "Rendered instead of the rows when items is empty.",
          },
          {
            name: "onSelect",
            type: "(id: string) => void",
            description:
              "Plain click opens the row. Shift-click and Ctrl/Cmd-click change the selection instead.",
          },
          {
            name: "onRename",
            type: "(id: string, title: string) => void",
            description:
              "Enables double-click and context-menu renaming. Fires only on a real change. Hidden while several rows are selected.",
          },
          {
            name: "onTogglePin",
            type: "(id: string, pinned: boolean) => void",
            description:
              "Enables pin in the context menu and on the selection bar.",
          },
          {
            name: "onTogglePinMany",
            type: "(ids: string[], pinned: boolean) => void",
            description:
              "Fired instead of looping onTogglePin when two or more rows are pinned or unpinned together.",
          },
          {
            name: "onDelete",
            type: "(id: string) => void",
            description:
              "Enables delete in the context menu and on the selection bar.",
          },
          {
            name: "onDeleteMany",
            type: "(ids: string[]) => void",
            description:
              "Fired instead of looping onDelete when two or more rows are deleted at once.",
          },
          {
            name: "onSelectedIdsChange",
            type: "(ids: string[]) => void",
            description:
              "Reports the current range/toggle selection. The list owns the selection; this is only a notification.",
          },
          {
            name: "getMenuActions",
            type: "(item) => SidebarItemMenuAction[]",
            description: "Extra context-menu entries, prepended to the built-ins.",
          },
          {
            name: "renderContent",
            type: "(item, ctx: { active, pinned, selected }) => React.ReactNode",
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
            name: "subtitle",
            type: "React.ReactNode",
            description: (
              <>
                Second line under the title — model name, snippet, or a{" "}
                <DocsCode>SidebarItemBadge</DocsCode> folder + branch pair.
                Muted, ~11px, truncating; its presence is what makes the row two
                lines.
              </>
            ),
          },
          {
            name: "meta",
            type: "React.ReactNode",
            description:
              "Trailing node on the title line — a relative time, a message count. Never shrinks; the title truncates around it.",
          },
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
          {
            name: "recede",
            type: "boolean",
            description:
              "Dims the row until it is hovered, active or selected. Background work should not compete with things awaiting you: a row that is merely busy recedes, a row that needs an answer does not.",
          },
        ],
      },
      {
        caption: "Other exports",
        rows: [
          {
            name: "ChatSidebarItem",
            type: "{ item, active?, selected?, bulk?, draggable?, sortable?, showDivider?, showStatusDot?, renameToken?, renderContent?, menuActions?, on… }",
            description:
              "The single row, for lists you assemble yourself. The list component is the usual entry point.",
          },
          {
            name: "ChatSidebarItemGhost",
            type: "{ item, active?, renderContent?, className? }",
            description: (
              <>
                The drag preview — it renders subtitle, meta and custom content
                exactly like the row. Return it from{" "}
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
            name: "SidebarItemBadge",
            type: "{ folder?, branch?, fullPath?, className? }",
            description: (
              <>
                Muted 11px folder + branch line for the{" "}
                <DocsCode>subtitle</DocsCode> slot — a Folder glyph with the
                path&apos;s last segment (<DocsCode>fullPath</DocsCode> keeps
                all of it) and a GitBranch glyph with the branch, both
                truncating. Purely presentational: it reads nothing and derives
                nothing, so pass what your app already knows and omit the half
                you do not have.
              </>
            ),
          },
          {
            name: "isTrailingDoubleClick",
            type: "(detail: number) => boolean",
            description: (
              <>
                A double-click dispatches two clicks before{" "}
                <DocsCode>dblclick</DocsCode>. The row swallows the second one
                so double-click-to-rename does not also select; exported for a
                custom row that wires both on the same element.
              </>
            ),
          },
          {
            name: "nextSidebarSelection",
            type: "(args) => { selectedIds, anchorId }",
            description:
              "Pure helper the list uses for click / Shift / Ctrl/Cmd. Exported so a custom list can reuse the same range-select rules.",
          },
          {
            name: "SidebarItemMenuAction",
            type: "{ id, label, icon?, onSelect, destructive?, separatorBefore? }",
            description: "Shape of a custom context-menu entry.",
          },
          {
            name: "SidebarItemRenderContent",
            type: "(item: ChatSidebarItemData, ctx: SidebarItemRenderContext) => React.ReactNode",
            description: (
              <>
                Type of <DocsCode>renderContent</DocsCode>;{" "}
                <DocsCode>SidebarItemRenderContext</DocsCode> is{" "}
                <DocsCode>
                  {"{ active: boolean; pinned: boolean; selected: boolean }"}
                </DocsCode>.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "sidebar-item",
      "sidebar-item-button",
      "sidebar-item-input",
      "sidebar-item-subtitle",
      "sidebar-item-meta",
      "sidebar-item-badge",
      "sidebar-item-status",
      "sidebar-item-actions",
      "sidebar-item-drop-verb",
      "sidebar-item-list",
      "sidebar-item-selection",
    ],
    examples: [
      {
        title: "Shift-click to select a range",
        description: (
          <>
            The list owns a second selection, independent of{" "}
            <DocsCode>activeId</DocsCode>: click opens a chat,{" "}
            <DocsCode>Shift</DocsCode>-click selects the range from the last
            click, and <DocsCode>Ctrl</DocsCode>/<DocsCode>⌘</DocsCode>-click
            toggles one row. Two or more selected rows raise a sticky bar
            (Pin, Delete, clear) and the context menu switches to bulk labels.
            Escape clears; Delete/Backspace deletes the set.
          </>
        ),
        example: {
          name: "sidebar-selection-example",
          node: <SidebarSelectionExample />,
        },
      },
      {
        title: "Extra context-menu entries",
        description: (
          <>
            <DocsCode>getMenuActions</DocsCode> entries render above the
            built-in rename / pin / delete group, and{" "}
            <DocsCode>separatorBefore</DocsCode> starts a new one. Right-click
            any row.
          </>
        ),
        example: {
          name: "sidebar-item-menu-example",
          node: <SidebarItemMenuExample />,
        },
      },
      {
        title: "Status dots and custom leading nodes",
        description: (
          <>
            <DocsCode>status</DocsCode> covers the common agent states;{" "}
            <DocsCode>leading</DocsCode> replaces the dot outright when a row
            needs an avatar or a project glyph.{" "}
            <DocsCode>SidebarItemStatusDot</DocsCode> is exported on its own, so
            a legend renders from the same component the rows use.
          </>
        ),
        example: {
          name: "sidebar-item-status-example",
          node: <SidebarItemStatusExample />,
        },
      },
      {
        title: "Folder and branch on a row",
        description: (
          <>
            A coding agent&apos;s sessions are usually identified by where they
            run, so <DocsCode>SidebarItemBadge</DocsCode> ships that line:
            folder, branch, 11px, muted, truncating. Drop it into{" "}
            <DocsCode>subtitle</DocsCode> — it holds no git logic, so it works
            the same against a real repository or a remembered string.
          </>
        ),
        code: {
          lang: "tsx",
          code: `import { SidebarItemBadge } from "@/components/ui/chat-sidebar"

const items = sessions.map((session) => ({
  id: session.id,
  title: session.title,
  subtitle: (
    <SidebarItemBadge folder={session.cwd} branch={session.branch} />
  ),
  meta: relativeTime(session.updatedAt),
}))`,
        },
      },
      {
        title: "Actions where the timestamp was",
        description: (
          <>
            <DocsCode>renderActions</DocsCode> fills the slot the meta label
            sits in: the timestamp at rest, the controls on hover — or on{" "}
            <DocsCode>focus-visible</DocsCode>, so the keyboard reaches every
            one of them. They render beside the row button rather than inside
            it, because a button inside a button is not a button. Rows marked{" "}
            <DocsCode>recede</DocsCode> dim until you hover them: background
            work should not compete with the row that is waiting on you.
          </>
        ),
        example: {
          name: "sidebar-actions-example",
          node: <SidebarActionsExample />,
        },
      },
      {
        title: "Rows that move",
        description: (
          <>
            <DocsCode>motion</DocsCode> animates the list between layouts with
            the Web Animations API: displaced rows translate, arrivals and
            departures fade, and a removed row is replaced by an{" "}
            <DocsCode>inert</DocsCode> clone for the length of its fade so React
            keeps owning the real one. An interrupted animation resumes from its
            own computed progress instead of snapping.
          </>
        ),
        example: {
          name: "sidebar-motion-example",
          node: <SidebarMotionExample />,
        },
      },
      {
        title: "Rich rows",
        description: (
          <>
            <DocsCode>subtitle</DocsCode> adds a muted second line — a folder
            and branch, a model name, the last message — and the row grows to the roomier
            two-line padding on its own; <DocsCode>meta</DocsCode> pins a
            timestamp or a message count to the end of the title line and never
            shrinks, so the title truncates around it. Rows without a subtitle
            render exactly as before. When the shape itself has to change,{" "}
            <DocsCode>renderContent</DocsCode> replaces the whole body while the
            row keeps its button shell, drag listeners, context menu and
            rename-on-double-click; return <DocsCode>undefined</DocsCode> to let
            that row fall back to the default body.
          </>
        ),
        example: {
          name: "sidebar-rich-example",
          node: <SidebarRichExample />,
        },
      },
    ],
    notes: [
      {
        title: "Status dots do not loop",
        description: (
          <>
            A streaming row paints a saturated dot and pings once when the
            status changes, rather than pulsing for as long as the answer takes:
            a looping animation per row repaints the sidebar continuously, and a
            state that has not changed has nothing left to announce. The ping is
            hidden under <DocsCode>prefers-reduced-motion</DocsCode>, and the
            built-in palette stays at three colors — primary for this app&apos;s
            own work, amber for something waiting on the user, destructive for a
            failure.
          </>
        ),
      },
      {
        title: "Stable callbacks",
        description: (
          <>
            Rows are memoized and the list keeps your handler identities stable
            internally — including{" "}
            <DocsCode>renderContent</DocsCode> and{" "}
            <DocsCode>getMenuActions</DocsCode> — so a parent re-render does not
            re-render every row, and an inline arrow function costs nothing.
            Pass handlers directly; there is no need to memoize them yourself.
            Rows still re-render when their own <DocsCode>item</DocsCode> object
            changes, so keep item identities stable across renders.
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
            name: "canDrop",
            type: "(itemId: string, overId: string) => boolean",
            description: (
              <>
                Rejects a target while it is only hovered. A rejected target
                falls back to the <em>source</em>, never to the next-nearest
                droppable, so sliding past a forbidden row cannot drop the item
                two rows further down. Answers are cached per target for the
                length of one drag.
              </>
            ),
          },
          {
            name: "resolveDropVerb",
            type: "(fromListId, toListId) => { label, icon? } | null",
            description: (
              <>
                Names what a drop that crosses lists would do. The lifted row
                renders it as a badge in place of its meta label; return{" "}
                <DocsCode>null</DocsCode> for a move that needs no explaining. A
                reorder inside one list never asks.
              </>
            ),
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
          {
            name: "SidebarDropVerb",
            type: "{ label: string; icon?: React.ReactNode }",
            description: (
              <>
                What <DocsCode>resolveDropVerb</DocsCode> returns, and what the
                badge on the lifted row renders.
              </>
            ),
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
            name: "useSidebarDropVerb()",
            type: "SidebarDropVerb | null",
            description: (
              <>
                The verb for the drag in progress. Its own context, so only the
                badge on the lifted row re-renders as the pointer crosses lists;{" "}
                <DocsCode>ChatSidebarItem</DocsCode> already reads it.
              </>
            ),
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
    examples: [
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
        title: "Say what the drop will do",
        description: (
          <>
            A drag that crosses lists is not a reorder — it pins, archives, or
            moves. <DocsCode>resolveDropVerb</DocsCode> names the one that
            applies and the lifted row wears it, while{" "}
            <DocsCode>canDrop</DocsCode> refuses the drops that make no sense:
            the archived row below cannot be dragged anywhere, and rejecting it
            falls back to the source instead of quietly choosing a neighbour.
          </>
        ),
        example: {
          name: "sidebar-drop-verb-example",
          node: <SidebarDropVerbExample />,
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
      "sidebar-drop-zone",
      "sidebar-edge-drop-zone",
    ],
    examples: [
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

  "sidebar-resize-rail": {
    title: "Sidebar Resize Rail",
    description:
              "A drag handle for the sidebar's width that never re-renders React: one CSS variable, written once per frame, with keyboard resizing and a veto. The line sits on the seam and is transparent until hover, so titles are not covered.",
    registry: "sidebar-resize-rail",
    registryDependencies: ["chat-sidebar"],
    preview: {
      name: "sidebar-resize-example",
      node: <SidebarResizeExample />,
      align: "stretch",
    },
    usage: `"use client"

import {
  ChatSidebar,
  SidebarResizeRail,
} from "@/components/ui/chat-sidebar"

export function Nav() {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(() => readStoredWidth())

  return (
    <ChatSidebar
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      overlays={
        <SidebarResizeRail
          width={width}
          minWidth={240}
          maxWidth={420}
          onWidthChange={(next) => {
            setWidth(next)
            localStorage.setItem("sidebar-width", String(next))
          }}
        />
      }
    >
      {children}
    </ChatSidebar>
  )
}`,
    props: [
      {
        caption: "SidebarResizeRail",
        rows: [
          {
            name: "width",
            type: "number",
            description: (
              <>
                Width to hydrate before the first paint — a persisted one,
                usually. The rail reads no storage itself; it is written in a
                layout effect, so a restored sidebar never flashes at the
                default width first.
              </>
            ),
          },
          {
            name: "onWidthChange",
            type: "(width: number) => void",
            description:
              "Fired on release, on the double-click reset and on every keyboard step — never per frame. Persist here.",
          },
          {
            name: "defaultWidth",
            type: "number",
            default: "290",
            description: "Double-click (or Enter) resets to this.",
          },
          {
            name: "minWidth / maxWidth",
            type: "number",
            default: "208 / 480",
            description: "Hard limits on the drag.",
          },
          {
            name: "contentMinWidth",
            type: "number",
            default: "420",
            description:
              "Room the rest of the layout keeps: on a narrow viewport the maximum shrinks to leave it, and minWidth still wins over that.",
          },
          {
            name: "targetRef",
            type: "RefObject<HTMLElement | null>",
            description: (
              <>
                Element the variable is written on. Defaults to the closest{" "}
                <DocsCode>[data-slot=&quot;chat-sidebar&quot;]</DocsCode>, then
                to the rail&apos;s own parent.
              </>
            ),
          },
          {
            name: "cssVar",
            type: "string",
            default: '"--chat-sidebar-width"',
            description: (
              <>
                Custom property to drive. Match it with the sidebar&apos;s{" "}
                <DocsCode>width</DocsCode> if you change it.
              </>
            ),
          },
          {
            name: "shouldAcceptWidth",
            type: "(info) => boolean",
            description: (
              <>
                Veto a width mid-drag — the pointer keeps moving, the panel does
                not. <DocsCode>info</DocsCode> is{" "}
                <DocsCode>{"{ currentWidth, nextWidth, target, side }"}</DocsCode>
                .
              </>
            ),
          },
          {
            name: "side",
            type: '"left" | "right"',
            default: '"left"',
            description:
              "Which side of the panel the rail sits on; it flips the drag direction and the keyboard keys.",
          },
          {
            name: "step",
            type: "number",
            default: "16",
            description: "Keyboard increment. Shift multiplies it by four.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Makes the rail inert — a collapsed sidebar, usually.",
          },
        ],
      },
      {
        caption: "Width math (pure)",
        rows: [
          {
            name: "resolveSidebarWidthBounds(viewportWidth, options?)",
            type: "{ min, max }",
            description:
              "The pair the rail clamps to. The viewport caps the maximum so the conversation keeps contentMin; min still wins over that.",
          },
          {
            name: "clampSidebarWidth(width, bounds)",
            type: "number",
            description: "Clamps one width into those bounds.",
          },
          {
            name: "resolveInitialSidebarWidth(stored, viewportWidth, defaultWidth, options?)",
            type: "number",
            description:
              "First-paint width: the stored value when there is one, the default otherwise, clamped into what this viewport allows.",
          },
          {
            name: "SIDEBAR_WIDTH_VAR",
            type: '"--chat-sidebar-width"',
            description: (
              <>
                The variable the rail writes and{" "}
                <DocsCode>ChatSidebar</DocsCode> reads.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: ["sidebar-rail"],
    examples: [
      {
        title: "Why a CSS variable",
        description: (
          <>
            A width in React state re-renders the sidebar — and every memoized
            row in it — on every pointer move. The rail writes one custom
            property inside a <DocsCode>requestAnimationFrame</DocsCode>{" "}
            instead, so a drag costs a style recalculation and nothing else, and
            forces the target&apos;s transitions to{" "}
            <DocsCode>0ms</DocsCode> while the pointer is down: an animated
            width would trail the cursor by a whole easing curve. React hears
            about it once, on release.
          </>
        ),
        code: {
          lang: "tsx",
          code: `// The panel already reads the variable:
//   width: var(--chat-sidebar-width, 290px)
// so the rail only has to write it.

<ChatSidebar
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  widthExpanded={290}
  overlays={<SidebarResizeRail onWidthChange={persist} />}
>
  {children}
</ChatSidebar>`,
        },
      },
      {
        title: "Refuse a width",
        description: (
          <>
            <DocsCode>shouldAcceptWidth</DocsCode> runs inside the same frame,
            before the write. Return <DocsCode>false</DocsCode> and the panel
            simply stays where it is — useful when something else on the page
            (a file panel, a table) has a width of its own to defend.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<SidebarResizeRail
  onWidthChange={persist}
  shouldAcceptWidth={({ nextWidth }) =>
    window.innerWidth - nextWidth >= 640
  }
/>`,
        },
      },
    ],
    notes: [
      {
        title: "Keyboard resizing",
        description: (
          <>
            The rail is a <DocsCode>separator</DocsCode> in the tab order:
            arrow keys resize by <DocsCode>step</DocsCode> (Shift for four
            times as much), Home and End jump to the limits, Enter resets to{" "}
            <DocsCode>defaultWidth</DocsCode> — the same thing a double-click
            does. <DocsCode>aria-valuenow</DocsCode> is kept up to date on the
            element itself rather than through state, for the same reason the
            width is. The painted line sits on the seam and starts at opacity
            0, so chat titles are never under an opaque bar.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
