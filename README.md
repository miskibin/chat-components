# Chat Components

A collection of customizable, accessible chat UI components for React, built on the shadcn/ui design system.

[Demo](https://chat-input-azure.vercel.app/)

## Install

One command installs everything:

```bash
npx shadcn@latest add miskibin/chat-components/chat
```

Or install pieces individually:

```bash
npx shadcn@latest add miskibin/chat-components/chat-input
npx shadcn@latest add miskibin/chat-components/message
npx shadcn@latest add miskibin/chat-components/generation-status
npx shadcn@latest add miskibin/chat-components/message-list
```

Requires a project with [shadcn/ui](https://ui.shadcn.com/) already initialized (`components.json`).

## Components

- **ChatInput** — Composer-style textarea with attachments, drag-and-drop, optional skills/slash menu, tools slot, send/stop
- **Message** — User bubble + assistant markdown; collapsed reasoning, tool calls, code blocks, artifacts; think tags; edit; pattern handlers
- **MessageParts** — `MessageReasoning`, `MessageToolCall`, `MessageCode`, `MessageArtifact` (also re-exported from `message`)
- **GenerationStatus** — Braille spinner for generation state
- **MessageList** — Scroll container with smart auto-scroll (passes reasoning / tools / code / artifacts through)
- **ModelPicker** — Dropdown model selector (badge, description, disabled options)
- **ChatSidebar** — Collapsible sidebar chrome (brand / nav / sections / footer slots) with optional DnD pin/trash edge zones
- **ChatSidebarItem** — Polished session row (rename, pin, delete, status dots, context menu, drag)
- **ChatNavbar** — Optional thin top bar (demo uses floating ThemeToggle instead)
- **ThemeToggle** — Floating circular light/dark chip

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
    <div className="flex h-svh flex-col">
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

## License

MIT
