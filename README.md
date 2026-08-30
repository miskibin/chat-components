# Chat Components

A shadcn/ui registry of chat primitives. Install one atom, or pull the whole kit. Components use standard shadcn CSS variables (`--background`, `--foreground`, `--muted`, `--border`, `--primary`, `--sidebar`, `--radius`) — no custom theme required.

[![CI](https://github.com/miskibin/chat-components/actions/workflows/ci.yml/badge.svg)](https://github.com/miskibin/chat-components/actions/workflows/ci.yml)

**[Docs](https://chat-input-azure.vercel.app/docs)** · [Playground](https://chat-input-azure.vercel.app/demo)

Every component has its own page with a live preview, the example source, an accurate props table, and customization recipes.

## Install

Requires a project with [shadcn/ui](https://ui.shadcn.com/) already initialized (`components.json`).

Full kit (composes the atoms below):

```bash
npx shadcn@latest add miskibin/chat-components/chat
```

Or install only what you need:

```bash
npx shadcn@latest add miskibin/chat-components/chat-input
npx shadcn@latest add miskibin/chat-components/prompt-suggestions
npx shadcn@latest add miskibin/chat-components/message
npx shadcn@latest add miskibin/chat-components/message-list
npx shadcn@latest add miskibin/chat-components/message-parts
npx shadcn@latest add miskibin/chat-components/message-markdown
npx shadcn@latest add miskibin/chat-components/generation-status
npx shadcn@latest add miskibin/chat-components/model-picker
npx shadcn@latest add miskibin/chat-components/mode-picker
npx shadcn@latest add miskibin/chat-components/chat-sidebar
npx shadcn@latest add miskibin/chat-components/sidebar-item
npx shadcn@latest add miskibin/chat-components/sidebar-dnd
npx shadcn@latest add miskibin/chat-components/sidebar-drop-zones
npx shadcn@latest add miskibin/chat-components/chat-navbar
npx shadcn@latest add miskibin/chat-components/theme-toggle
npx shadcn@latest add miskibin/chat-components/use-click-outside
```

`chat` is a starter block (`components/chat.tsx`) plus registry dependencies. It does **not** copy every file into one item — shadcn installs each atom separately.

## Components

| Item | What you get | Docs |
| --- | --- | --- |
| **chat** | Starter `Chat` block: empty-state composer + `PromptSuggestions`, then `MessageList` + `ChatInput`. Also installs the kit atoms. | [/docs/components/chat](https://chat-input-azure.vercel.app/docs/components/chat) |
| **chat-input** | Composer textarea with attachments, drag-and-drop, optional skills/slash menu, `tools` slot, send/stop | [chat-input](https://chat-input-azure.vercel.app/docs/components/chat-input) |
| **prompt-suggestions** | Minimal starter-prompt list for the empty chat state | [prompt-suggestions](https://chat-input-azure.vercel.app/docs/components/prompt-suggestions) |
| **message** | User bubble + assistant turn (reasoning, tools, code, artifacts, think tags, edit) | [message](https://chat-input-azure.vercel.app/docs/components/message) |
| **message-parts** | `MessageReasoning`, `MessageToolCall(s)`, `MessageCode`, `MessageArtifact` | [message-parts](https://chat-input-azure.vercel.app/docs/components/message-parts) |
| **message-markdown** | Streamdown renderer (GFM, Shiki code, Mermaid, KaTeX) + styles | [message-markdown](https://chat-input-azure.vercel.app/docs/components/message-markdown) |
| **message-list** | Scroll container with smart auto-scroll | [message-list](https://chat-input-azure.vercel.app/docs/components/message-list) |
| **generation-status** | Braille spinner | [generation-status](https://chat-input-azure.vercel.app/docs/components/generation-status) |
| **model-picker** | Dropdown model selector with badges and disabled reasons | [model-picker](https://chat-input-azure.vercel.app/docs/components/model-picker) |
| **mode-picker** | Ask / Plan / Agent switch | [mode-picker](https://chat-input-azure.vercel.app/docs/components/mode-picker) |
| **chat-sidebar** | Collapsible sidebar chrome (brand / nav / rail / sections / footer slots) and the single import surface for the family | [chat-sidebar](https://chat-input-azure.vercel.app/docs/components/chat-sidebar) |
| **sidebar-item** | Session row + sortable list (rename, pin, delete, status dots, context menu) | [sidebar-item](https://chat-input-azure.vercel.app/docs/components/sidebar-item) |
| **sidebar-dnd** | Drag-and-drop context: declarative zones + drag-to-reorder events | [sidebar-dnd](https://chat-input-azure.vercel.app/docs/components/sidebar-dnd) |
| **sidebar-drop-zones** | Edge and inline drop-zone renderers with tone variants | [sidebar-drop-zones](https://chat-input-azure.vercel.app/docs/components/sidebar-drop-zones) |
| **chat-navbar** | Thin top bar with title and left/right slots | [chat-navbar](https://chat-input-azure.vercel.app/docs/components/chat-navbar) |
| **theme-toggle** | Light/dark chip — floating by default, inline via `floating={false}` | [theme-toggle](https://chat-input-azure.vercel.app/docs/components/theme-toggle) |
| **use-click-outside** | Dismiss-on-outside-click hook for surfaces you build by hand | [use-click-outside](https://chat-input-azure.vercel.app/docs/components/use-click-outside) |

Compose with slots — no hard-wired product nav. Drop zones and menus are optional modules.

## Quick start

```tsx
"use client"

import { useState } from "react"
import { ChatInput } from "@/components/ui/chat-input"
import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="flex h-svh min-h-0 flex-col">
      <MessageList messages={messages} isGenerating={isGenerating} />
      <ChatInput
        isGenerating={isGenerating}
        onStop={() => setIsGenerating(false)}
        onSend={({ text, files, skills }) => {
          setMessages((m) => [
            ...m,
            { id: crypto.randomUUID(), content: text, sender: "user" },
          ])
          setIsGenerating(true)
          // call your API with text, files, skills
        }}
        skills={[{ name: "summarize", description: "Condense long text" }]}
        slashCommands={[{ name: "help", description: "Show commands" }]}
      />
    </div>
  )
}
```

Skills and slash menus mount only when those arrays are non-empty. Full props tables live on the [docs site](https://chat-input-azure.vercel.app/docs).

### Composer toolbar

`tools` renders next to the attach button. Pickers opened from a composer want `side="top"`; in a navbar use `side="bottom"`.

```tsx
import { ChatInput, chatInputButtonVariants } from "@/components/ui/chat-input"

<ChatInput
  tools={
    <>
      <ModePicker side="top" />
      <ModelPicker side="top" options={models} />
      {/* Custom buttons share the built-in recipe, so they line up exactly */}
      <button className={cn(chatInputButtonVariants(), "text-primary")}>
        <Globe />
        <span>Search</span>
      </button>
    </>
  }
  onSend={send}
/>
```

## Sidebar

Everything re-exports from `@/components/ui/chat-sidebar` — application code never imports `sidebar-item`, `sidebar-dnd`, or `sidebar-drop-zones` directly.

```tsx
"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { Archive } from "lucide-react"
import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SidebarCollapsibleSection,
  pinDropZone,
  trashDropZone,
  type SidebarDndDrop,
  type SidebarDropZoneDef,
} from "@/components/ui/chat-sidebar"

// Pin and trash are presets over SidebarDropZoneDef; any target is just data.
const zones: SidebarDropZoneDef[] = [
  pinDropZone(),
  trashDropZone(),
  {
    id: "archive-zone",
    label: "Archive",
    icon: <Archive className="size-3.5" />,
    tone: "muted",
    action: "archive",
  },
]

function handleDrop(drop: SidebarDndDrop) {
  // Reorder: the provider reports from/to, the consumer applies the move.
  if (drop.kind === "reorder") {
    setItems((prev) => arrayMove(prev, drop.from, drop.to))
    return
  }
  // Zone drops narrow on `action` (defaults to the zone id).
  if (drop.action === "pin") pin(drop.itemId)
  if (drop.action === "delete") remove(drop.itemId)
  if (drop.action === "archive") archive(drop.itemId)
}

<ChatSidebarDnd
  zones={zones}
  onDrop={handleDrop}
  renderOverlay={(id) => {
    const item = items.find((candidate) => candidate.id === id)
    return item ? <ChatSidebarItemGhost item={item} /> : null
  }}
>
  <ChatSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} edgeZones>
    <SidebarCollapsibleSection title="Recent" open={open} onToggle={toggle}>
      <ChatSidebarItemList listId="recent" items={items} sortable />
    </SidebarCollapsibleSection>
  </ChatSidebar>
</ChatSidebarDnd>
```

Notes:

- `zones` defaults to `DEFAULT_SIDEBAR_ZONES` (pin + trash). Pass `[]` for reorder-only.
- Zones with an `edge` are rendered by `ChatSidebar edgeZones` while a drag runs. Zones without one are rendered inline with `<SidebarDropZone visible={!!activeId} />` — read `activeId` from `useSidebarDnd()`.
- `onDrop` receives a discriminated union: `kind: "zone"` (narrow by `drop.action`), `kind: "reorder"` (`from`/`to` plus `listId`/`fromListId`), or `kind: "custom"`.
- Give each list a readable `listId` when you render more than one; `ChatSidebarItemList` registers its ids for you. For hand-rolled lists call `useSidebarDndList(listId, ids)`.
- Keyboard dragging is on: Space or Enter lifts a row, arrows move it, Space drops, Escape cancels. Keyboard drags have no pointer, so edge zones compete on distance and can be awkward to hit — always leave a non-drag path (the context menu already offers pin and delete).
- Rows hover to `bg-sidebar-accent` on purpose: the sidebar carries its own token set so it can sit on a different surface. Retheme via `--sidebar*`, not by patching classes.
- `SidebarItemStatusDot` exposes the status dot on its own (`idle`, `active`, `streaming`, `pending`, `fault`).

For the off-canvas mobile layout, wrap the sidebar in a sliding container and keep the sidebar itself unchanged — see `app/demo/page.tsx` and the recipe on the [chat-sidebar docs page](https://chat-input-azure.vercel.app/docs/components/chat-sidebar).

## Markdown (Streamdown)

`message-markdown` copies its own CSS (`message-markdown.css`) and imports `streamdown/styles.css`. After install, add Tailwind v4 sources so Streamdown utilities are generated:

```css
@source "../node_modules/streamdown/dist/*.js";
@source "../node_modules/@streamdown/code/dist/*.js";
@source "../node_modules/@streamdown/mermaid/dist/*.js";
@source "../node_modules/@streamdown/math/dist/*.js";
```

If you use Next.js, transpile the packages:

```js
transpilePackages: [
  "streamdown",
  "@streamdown/code",
  "@streamdown/mermaid",
  "@streamdown/math",
  "mermaid",
]
```

## Customizing

- **`className` merges last** through `cn()`, so your classes win: `<ChatInput className="max-w-2xl" />`, `<Message contentClassName="bg-primary/10" />`, `<ChatSidebar classNames={{ header: "border-b-0" }} />`.
- **Internals carry `data-slot`** plus state attributes, so a parent can restyle them without a fork:

  ```tsx
  <ChatInput className="[&_[data-slot=chat-input-surface]]:rounded-xl" />

  <MessageList
    className="[&_[data-slot=message][data-sender=user]_[data-slot=message-content]]:bg-primary/10"
    messages={messages}
  />

  <div className="[&_[data-slot=message-tool-call][data-status=error]]:text-destructive">
    <MessageToolCalls tools={tools} />
  </div>
  ```

- **Shared recipes are exported** — `chatInputButtonVariants` gives custom composer buttons the same height, radius, and focus ring as send and attach.

Each component page lists its slots under *API reference → Data slots*.

## Features

- Composer-style input matching modern chat UIs
- File attachments via button, paste, and drag-and-drop
- Optional in-memory skills / slash commands (no network)
- Think-tag / explicit reasoning collapsed above the answer
- Tool calls, code blocks, and optional artifacts on assistant turns
- Sidebar drag-and-drop: declarative zones, drag-to-reorder, keyboard support
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Accessible labels and focus handling
- Themed with Tailwind CSS + shadcn CSS variables

## Local development

```bash
npm install
npm run dev
```

- `/` — landing page with a live `chat` block
- `/docs` — the documentation site (Get Started + a page per component)
- `/demo` — Cursor Agent CLI proof of concept (not part of the published registry)

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run build       # next build
npm run registry:build  # regenerate public/r/*.json
```

## License

MIT
