# Chat Components

Agent-grade chat UI you own. A shadcn/ui registry of the primitives an agent app actually needs — reasoning streams, tool-call rows, artifacts, a session sidebar with drag-and-drop — installed as source into your repo and themed by your existing shadcn tokens (`--background`, `--foreground`, `--muted`, `--border`, `--primary`, `--sidebar`, `--radius`).

[![CI](https://github.com/miskibin/chat-components/actions/workflows/ci.yml/badge.svg)](https://github.com/miskibin/chat-components/actions/workflows/ci.yml)

**[Docs](https://chat-input-azure.vercel.app/docs)** · [Playground](https://chat-input-azure.vercel.app/demo)

Every component has its own page: a live preview, then a run of examples you can flip between preview and source, then a compact API reference.

## Agent UIs are not chat bubbles

A chatbot renders one text stream. An agent turn is a *transcript*: it thinks, calls tools, fails and retries, produces files, and keeps going for minutes across sessions you can come back to. Each of those needs a real surface.

| The agent does this | You render this |
| --- | --- |
| Thinks before answering | `MessageReasoning` — collapsed "Thought for N seconds", streams markdown inside. Explicit `reasoning` prop, or parsed out of `<think>` tags. |
| Calls tools | `MessageToolCall` rows with a `pending / running / done / error` lifecycle, collapsible input and output, and human headlines ("Read file `nav.ts`", "Command failed"). Many calls collapse behind "Used N tools". |
| Asks the user a structured question | `AskQuestion` — Cursor-style questionnaire (single-select, multi-select, Other…, Skip / Continue). A pending `Ask Question` tool call swaps in the card automatically. |
| Interleaves thinking, tools, and prose | `parts: MessagePart[]` — a chronological list of `text` and `tool` segments, so the transcript stays in the order it happened instead of tools-then-answer. |
| Emits files, tables, documents | `MessageArtifact` — titled card, kind + summary meta, inline preview, optional `onOpen` to hand off to your own viewer. |
| Writes code and diagrams | Streamdown markdown (GFM, Shiki highlighting, Mermaid, KaTeX) plus a standalone `MessageCode` block with copy. |
| Streams for a long time | `MessageList` with smart auto-scroll: it sticks to the bottom while streaming, and stops the moment the reader scrolls up. `GenerationStatus` covers the dead air before the first token; `ChatInput` swaps send for stop. |
| Runs under different models and modes | `ModelPicker` with cmdk search, badges, disabled reasons, and a reasoning-effort selector (Low / Medium / High / Extra High). `ModePicker` for Ask / Plan / Agent. |
| Takes context from the user | Composer with attachments (button, paste, drag-and-drop), skills, and slash commands — all in-memory, no network. |
| Accumulates sessions | `ChatSidebar` + `ChatSidebarItemList`: rename, pin, delete, status dots, multi-line rows (subtitle, meta, or a fully custom body), drag-to-reorder, declarative drop zones, keyboard dragging. |

The starter block ties it together: `Chat` opens ChatGPT-style — centered greeting with the composer and prompt suggestions in the middle — then settles into the normal conversation layout once the first message lands.

## Why not the AI SDK / AI Elements?

Vercel's AI SDK is a good stack and this is not a replacement for it. It is a different bet about where the seam should be.

- **Protocol-agnostic.** These components take plain props and callbacks. There is no `useChat`, no `UIMessage`, no required stream format — the `ai` package is not even a dependency. AI Elements is designed around the AI SDK's message parts and hooks, which means zero glue *if* your backend speaks that protocol. If it doesn't — a CLI agent, a LangGraph service, a raw SSE endpoint, your own event union — you write one small adapter and everything downstream is normal React. The playground in this repo does exactly that: it streams a custom event union (`session | text | thinking | tool | done | error`) over SSE from a mock agent, with no AI SDK anywhere.
- **Agent-first depth.** The tool-call lifecycle, reasoning disclosure, artifacts, and the session sidebar with drop zones and keyboard DnD are the core of this registry, not extras around a message bubble.
- **UI only.** The flip side: the AI SDK also gives you providers, tool calling, structured output, and the server runtime. This gives you none of that. Bring your own backend.
- **Same ownership model.** Both copy source into your repo via a shadcn registry. Nothing here upgrades behind your back, and everything themes off the shadcn variables you already have.

They are not mutually exclusive. Keep `useChat` and map its parts to props:

```tsx
"use client"

import { useChat } from "@ai-sdk/react"

import type { MessagePart } from "@/components/ui/message"
import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

// AI SDK v5 UIMessage parts -> ChatMessageData. Tool parts are named `tool-<name>`.
function toChatMessage(message: {
  id: string
  role: string
  parts: Array<Record<string, unknown> & { type: string }>
}): ChatMessageData {
  const parts: MessagePart[] = []
  let text = ""
  let reasoning = ""

  message.parts.forEach((part, i) => {
    const id = `${message.id}-${i}`
    if (part.type === "text") {
      text += part.text as string
      parts.push({ type: "text", id, text: part.text as string })
    } else if (part.type === "reasoning") {
      reasoning += part.text as string
    } else if (part.type.startsWith("tool-")) {
      const state = part.state as string
      parts.push({
        type: "tool",
        id,
        tool: {
          id: part.toolCallId as string,
          name: part.type.slice("tool-".length),
          status:
            state === "output-available"
              ? "done"
              : state === "output-error"
                ? "error"
                : "running",
          input: JSON.stringify(part.input ?? {}, null, 2),
          output:
            part.output === undefined
              ? (part.errorText as string | undefined)
              : JSON.stringify(part.output, null, 2),
        },
      })
    }
  })

  return {
    id: message.id,
    sender: message.role === "user" ? "user" : "assistant",
    content: text,
    reasoning: reasoning || null,
    parts,
  }
}

export function Chat() {
  const { messages, status } = useChat()

  return (
    <MessageList
      messages={messages.map(toChatMessage)}
      isGenerating={status === "streaming" || status === "submitted"}
    />
  )
}
```

The same shape works for anything else: whatever your agent emits, produce `ChatMessageData` and the UI follows.

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
npx shadcn@latest add miskibin/chat-components/ask-question
npx shadcn@latest add miskibin/chat-components/file-preview
npx shadcn@latest add miskibin/chat-components/file-icon
npx shadcn@latest add miskibin/chat-components/message-markdown
npx shadcn@latest add miskibin/chat-components/generation-status
npx shadcn@latest add miskibin/chat-components/model-picker
npx shadcn@latest add miskibin/chat-components/mode-picker
npx shadcn@latest add miskibin/chat-components/chat-sidebar
npx shadcn@latest add miskibin/chat-components/sidebar-item
npx shadcn@latest add miskibin/chat-components/sidebar-dnd
npx shadcn@latest add miskibin/chat-components/sidebar-drop-zones
npx shadcn@latest add miskibin/chat-components/chat-navbar
npx shadcn@latest add miskibin/chat-components/resizable
npx shadcn@latest add miskibin/chat-components/theme-toggle
npx shadcn@latest add miskibin/chat-components/use-click-outside
```

`chat` is a starter block (`components/chat.tsx`) plus registry dependencies. It does **not** copy every file into one item — shadcn installs each atom separately.

## Components

| Item | What you get | Docs |
| --- | --- | --- |
| **chat** | Starter `Chat` block: centered greeting with composer + `PromptSuggestions`, then `MessageList` + `ChatInput`. Also installs the kit atoms. | [/docs/components/chat](https://chat-input-azure.vercel.app/docs/components/chat) |
| **chat-input** | Composer textarea with attachments, drag-and-drop, optional skills/slash menu, `tools` slot, send/stop | [chat-input](https://chat-input-azure.vercel.app/docs/components/chat-input) |
| **prompt-suggestions** | Minimal starter-prompt list for the empty chat state | [prompt-suggestions](https://chat-input-azure.vercel.app/docs/components/prompt-suggestions) |
| **message** | User bubble + assistant turn (reasoning, tools, code, artifacts, think tags, interleaved `parts`, edit) — a finished turn folds its process into one “Worked for 12s” row | [message](https://chat-input-azure.vercel.app/docs/components/message) |
| **message-parts** | `MessageProcess`, `MessageReasoning`, `MessageToolCall(s)`, `MessageCode`, `MessageArtifact`; Ask Question tools render `AskQuestion` | [message-parts](https://chat-input-azure.vercel.app/docs/components/message-parts) |
| **ask-question** | Cursor-style questionnaire: radios, checkboxes, Other…, Skip / Continue | [ask-question](https://chat-input-azure.vercel.app/docs/components/ask-question) |
| **file-preview** | Side panel for an edited file: unified diff, or the whole file with the edited lines marked | [file-preview](https://chat-input-azure.vercel.app/docs/components/file-preview) |
| **file-icon** | Material Icon Theme file glyphs as inline SVG, picked by filename then extension | [file-icon](https://chat-input-azure.vercel.app/docs/components/file-icon) |
| **message-markdown** | Streamdown renderer (GFM, Shiki code, Mermaid, KaTeX) + styles | [message-markdown](https://chat-input-azure.vercel.app/docs/components/message-markdown) |
| **message-list** | Scroll container with smart auto-scroll | [message-list](https://chat-input-azure.vercel.app/docs/components/message-list) |
| **generation-status** | Pulsing-dot generation status | [generation-status](https://chat-input-azure.vercel.app/docs/components/generation-status) |
| **model-picker** | Searchable model selector with badges, disabled reasons, and a reasoning-effort selector | [model-picker](https://chat-input-azure.vercel.app/docs/components/model-picker) |
| **mode-picker** | Ask / Plan / Agent switch | [mode-picker](https://chat-input-azure.vercel.app/docs/components/mode-picker) |
| **chat-sidebar** | Collapsible sidebar chrome (brand / nav / rail / sections / footer slots) and the single import surface for the family | [chat-sidebar](https://chat-input-azure.vercel.app/docs/components/chat-sidebar) |
| **sidebar-item** | Session row + sortable list (rename, pin, delete, status dots, multi-line rows with a folder/branch badge, context menu) | [sidebar-item](https://chat-input-azure.vercel.app/docs/components/sidebar-item) |
| **sidebar-dnd** | Drag-and-drop context: declarative zones + drag-to-reorder events | [sidebar-dnd](https://chat-input-azure.vercel.app/docs/components/sidebar-dnd) |
| **sidebar-drop-zones** | Edge and inline drop-zone renderers with tone variants | [sidebar-drop-zones](https://chat-input-azure.vercel.app/docs/components/sidebar-drop-zones) |
| **chat-navbar** | Thin top bar with title and left/right slots | [chat-navbar](https://chat-input-azure.vercel.app/docs/components/chat-navbar) |
| **resizable** | Draggable, keyboard-resizable panel split — pairs with `file-preview` | [resizable](https://chat-input-azure.vercel.app/docs/components/resizable) |
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

### Streaming an agent turn

Append one assistant message, then mutate it as events arrive — `parts` keeps text and tool rows in the order the agent produced them, and `MessageList` handles the scrolling.

```tsx
setMessages((prev) =>
  prev.map((m) =>
    m.id !== assistantId
      ? m
      : {
          ...m,
          reasoning: (m.reasoning ?? "") + (event.type === "thinking" ? event.text : ""),
          parts:
            event.type === "tool"
              ? upsertTool(m.parts, event) // replace by tool id, or append
              : appendText(m.parts, event.text),
        }
  )
)
```

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

## Local development

```bash
npm install
npm run dev
```

- `/` — landing page with a live `chat` block
- `/docs` — the documentation site (Get Started + a page per component)
- `/demo` — agent playground: a scripted agent streams a full run (reasoning, tool calls, answer) over SSE, or drives a real Cursor Agent CLI when one is installed. Not part of the published registry.

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run build       # next build
npm run registry:build  # regenerate public/r/*.json
```

## License

MIT
