# Chat Components

Source-owned React components for building AI agent and LLM chat interfaces. This
[shadcn/ui](https://ui.shadcn.com/) registry covers streaming messages, reasoning,
tool calls, artifacts, files, model selection, and session navigation without
coupling your UI to an AI SDK or wire protocol.

[![CI](https://github.com/miskibin/chat-components/actions/workflows/ci.yml/badge.svg)](https://github.com/miskibin/chat-components/actions/workflows/ci.yml)

[Documentation](https://chat-input-azure.vercel.app/docs) ·
[Playground](https://chat-input-azure.vercel.app/demo) ·
[Agent UI reference app](https://github.com/miskibin/agent-ui)

## What you get

- Streaming, memoized message lists with smart auto-scroll and long-thread
  offscreen rendering.
- Chronological reasoning, text, tool calls, structured questions, todos,
  artifacts, code, diffs, and file previews.
- Markdown through Streamdown with GFM, Shiki syntax highlighting, Mermaid,
  KaTeX, and safe inline images.
- A composer with attachments, drag and drop, queued prompts, skills, slash
  commands, mentions, and model/mode controls.
- A keyboard-accessible session sidebar with rename, pin, delete, status,
  sorting, and drag-and-drop zones.
- Plain props and callbacks. Bring AI SDK, SSE, WebSockets, an agent CLI, ACP,
  or your own backend.

## Install

Start in a project with shadcn/ui initialized:

```bash
npx shadcn@latest add miskibin/chat-components/chat
```

`chat` installs the starter layout and its registry dependencies. Install a
single primitive when you only need part of the kit:

```bash
npx shadcn@latest add miskibin/chat-components/message-list
npx shadcn@latest add miskibin/chat-components/chat-input
```

The files are copied into your application. There is no runtime
`chat-components` package and no required provider SDK.

## Minimal usage

```tsx
"use client"

import { useCallback, useState } from "react"
import {
  ChatInput,
  type ChatInputPayload,
} from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const send = useCallback(({ text }: ChatInputPayload) => {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), content: text, sender: "user" },
    ])
    setIsGenerating(true)
    // Start your stream, append one assistant message, then update its parts.
  }, [])
  const stop = useCallback(() => setIsGenerating(false), [])

  return (
    <main className="flex h-svh min-h-0 flex-col">
      <MessageList messages={messages} isGenerating={isGenerating} />
      <ChatInput
        isGenerating={isGenerating}
        onSend={send}
        onStop={stop}
      />
    </main>
  )
}
```

Assistant messages accept a chronological `parts` array, so text and tool calls
stay in the order emitted by the agent. See the
[message examples](https://chat-input-azure.vercel.app/docs/components/message)
for the data model and streaming patterns.

## Registry map

| Area | Registry items |
| --- | --- |
| Starter | `chat`, `prompt-suggestions` |
| Composer | `chat-input`, `model-picker`, `mode-picker`, `context-meter`, `folder-picker` |
| Transcript | `message-list`, `message`, `message-parts`, `message-markdown`, `generation-status` |
| Agent output | `ask-question`, `todo-list`, `change-summary`, `file-preview`, `file-icon` |
| Navigation | `chat-sidebar`, `sidebar-item`, `sidebar-dnd`, `sidebar-drop-zones`, `chat-navbar` |
| Utilities | `resizable`, `theme-toggle`, `use-click-outside` |

Every public component has a live example, source, props, and `data-slot`
reference in the [component docs](https://chat-input-azure.vercel.app/docs).

## Customization

Components use your shadcn semantic tokens and merge consumer classes last.
Meaningful elements expose `data-slot` and state attributes, so you can restyle
the installed source without rewriting component internals.

## Repository map

- `components/ui/` — registry primitives
- `components/chat.tsx` — starter chat block
- `components/examples/` — runnable examples
- `components/docs/component-docs/` — examples and API references
- `registry.json` — registry manifest
- `public/r/` — generated shadcn registry payloads

If you are an AI coding agent, read `AGENTS.md` before editing. Component changes
must update docs, examples, the registry build, and the vendored copy in
[Agent UI](https://github.com/miskibin/agent-ui).

## Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run registry:build
npm run build
```

Requires Node.js 20.9 or newer.

## License

MIT
