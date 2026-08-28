# Chat Components

A shadcn/ui registry of chat primitives. Install one atom, or pull the whole kit. Components use standard shadcn CSS variables (`--background`, `--foreground`, `--muted`, `--border`, `--primary`, `--sidebar`, `--radius`) — no custom theme required.

[Demo](https://chat-input-azure.vercel.app/)

## Install

Requires a project with [shadcn/ui](https://ui.shadcn.com/) already initialized (`components.json`).

Full kit (composes the atoms below):

```bash
npx shadcn@latest add miskibin/chat-components/chat
```

Or install only what you need:

```bash
npx shadcn@latest add miskibin/chat-components/chat-input
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

| Item | What you get |
| --- | --- |
| **chat** | Starter `Chat` block: `MessageList` + `ChatInput`. Also installs the kit atoms. |
| **chat-input** | Composer textarea with attachments, drag-and-drop, optional skills/slash menu, tools slot, send/stop |
| **message** | User bubble + assistant turn (reasoning, tools, code, artifacts, think tags, edit) |
| **message-parts** | `MessageReasoning`, `MessageToolCall`, `MessageCode`, `MessageArtifact` |
| **message-markdown** | Streamdown renderer (GFM, Shiki code, Mermaid, KaTeX) + styles |
| **generation-status** | Braille spinner |
| **message-list** | Scroll container with smart auto-scroll |
| **model-picker** | Dropdown model selector |
| **mode-picker** | Ask / Plan / Agent switch |
| **chat-sidebar** | Collapsible sidebar chrome (brand / nav / sections / footer slots) |
| **sidebar-item** | Session row (rename, pin, delete, status, context menu, drag) |
| **sidebar-dnd** | DnD context for pin/trash |
| **sidebar-drop-zones** | Pin and trash edge zones |
| **chat-navbar** | Optional thin top bar |
| **theme-toggle** | Floating circular light/dark chip |
| **use-click-outside** | Hook used by the pickers |

Compose with slots — no hard-wired product nav. Drop zones and menus are optional modules.

## Quick start

```tsx
"use client"

import { useState } from "react"
import { ChatInput } from "@/components/ui/chat-input"
import { MessageList } from "@/components/ui/message-list"

export function Chat() {
  const [messages, setMessages] = useState<
    { id: string; content: string; sender: "user" | "assistant" }[]
  >([])
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
        skills={[
          { name: "summarize", description: "Condense long text" },
        ]}
        slashCommands={[
          { name: "help", description: "Show commands" },
        ]}
      />
    </div>
  )
}
```

### ChatInput props

| Prop | Type | Description |
| --- | --- | --- |
| `onSend` | `(payload: { text, files, skills }) => void` | Called on submit |
| `onStop` | `() => void` | Stop generation |
| `isGenerating` | `boolean` | Shows stop button |
| `tools` | `ReactNode` | Extra left-toolbar controls |
| `skills` | `{ name, description? }[]` | Optional `/` skill menu |
| `slashCommands` | `{ name, description?, argHint? }[]` | Optional `/` commands |
| `placeholder` | `string` | Textarea placeholder |

Skills and slash menus mount only when those arrays are non-empty.

### Message props

| Prop | Type | Description |
| --- | --- | --- |
| `content` | `string` | Message text (markdown for assistant; supports `<think>` tags) |
| `sender` | `"user" \| "assistant"` | Alignment and styling |
| `reasoning` | `string \| null` | Explicit reasoning above the answer (overrides `<think>` parse) |
| `reasoningDefaultOpen` | `boolean` | Open reasoning by default (default `false`) |
| `tools` | `MessageToolCallData[]` | Collapsible tool call cards |
| `codeBlocks` | `MessageCodeBlockData[]` | Dedicated code snippets with copy |
| `artifacts` | `MessageArtifactData[]` | Clickable artifact cards |
| `editable` | `boolean` | Enable edit for user messages |
| `onEdit` | `(content: string) => void` | Edit callback |
| `actionButtons` | `ActionButton[]` | Custom actions |
| `patternHandlers` | `PatternHandler[]` | Inline pattern rendering (e.g. citations) |

### GenerationStatus props

| Prop | Type | Description |
| --- | --- | --- |
| `active` | `boolean` | Show spinner |
| `stage` | `"thinking" \| "searching" \| "responding" \| "idle"` | Optional stage |
| `label` | `string` | Optional label next to spinner |

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

## Features

- Composer-style input matching modern chat UIs
- File attachments via button, paste, and drag-and-drop
- Optional in-memory skills / slash commands (no network)
- Think-tag / explicit reasoning collapsed above the answer
- Tool calls, code blocks, and optional artifacts on assistant turns
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Accessible labels and focus handling
- Themed with Tailwind CSS + shadcn CSS variables

## Local demo

```bash
npm install
npm run dev
```

The demo app on `/` is wired to a local Cursor Agent CLI. That backend is **not** part of the registry — you only get the UI.

## License

MIT
