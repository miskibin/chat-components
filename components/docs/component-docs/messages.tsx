import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { GenerationStatusExample } from "@/components/examples/generation-status-example"
import { MessageExample } from "@/components/examples/message-example"
import { MessageListExample } from "@/components/examples/message-list-example"
import { MessageMarkdownExample } from "@/components/examples/message-markdown-example"
import { MessagePartsExample } from "@/components/examples/message-parts-example"
import { MessageStyledExample } from "@/components/examples/message-styled-example"

export const messageDocs = {
  message: {
    title: "Message",
    description:
      "One conversation turn: a user bubble with inline editing, or an assistant answer that assembles reasoning, tool calls, markdown, code, and artifacts.",
    registry: "message",
    registryDependencies: ["message-parts"],
    preview: { name: "message-example", node: <MessageExample /> },
    usage: `import { Message } from "@/components/ui/message"

export function Turn() {
  return (
    <>
      <Message sender="user" content="Why does the build fail?" />
      <Message
        sender="assistant"
        content="Because \`generateStaticParams\` returns the wrong shape."
        reasoning="The stack trace points at the docs route."
        reasoningDuration={4}
      />
    </>
  )
}`,
    props: [
      {
        caption: "Message",
        rows: [
          {
            name: "content",
            type: "string",
            required: true,
            description: (
              <>
                Markdown for assistant turns, plain text for user turns. A{" "}
                <DocsCode>&lt;think&gt;</DocsCode> block is parsed out into the
                reasoning disclosure.
              </>
            ),
          },
          {
            name: "sender",
            type: '"user" | "assistant"',
            required: true,
            description:
              "Picks the layout: right-aligned bubble, or full-width answer.",
          },
          {
            name: "reasoning",
            type: "string | null",
            description: (
              <>
                Explicit reasoning shown above the answer. When set it wins over
                the <DocsCode>&lt;think&gt;</DocsCode> parse.
              </>
            ),
          },
          {
            name: "reasoningDefaultOpen",
            type: "boolean",
            default: "false",
            description: "Start the reasoning disclosure expanded.",
          },
          {
            name: "reasoningDuration",
            type: "number",
            description: 'Renders as "Thought for N seconds".',
          },
          {
            name: "tools",
            type: "MessageToolCallData[]",
            default: "[]",
            description:
              "Tool rows above the answer. Three or more collapse behind a summary.",
          },
          {
            name: "parts",
            type: "MessagePart[]",
            description:
              "Chronological text/tool segments. When set, it replaces the tools-then-content layout.",
          },
          {
            name: "codeBlocks",
            type: "MessageCodeBlockData[]",
            default: "[]",
            description:
              "Standalone snippets appended after the answer, each with its own copy button.",
          },
          {
            name: "artifacts",
            type: "MessageArtifactData[]",
            default: "[]",
            description: "Artifact cards appended after the code blocks.",
          },
          {
            name: "editable",
            type: "boolean",
            default: "false",
            description: (
              <>
                Shows the edit affordance. Needs <DocsCode>onEdit</DocsCode> to
                do anything.
              </>
            ),
          },
          {
            name: "onEdit",
            type: "(content: string) => void",
            description: "Called on save (⌘↵); Escape cancels.",
          },
          {
            name: "actionButtons",
            type: "ActionButton[]",
            default: "[]",
            description: (
              <>
                Extra hover actions —{" "}
                <DocsCode>
                  {"{ id, icon, onClick, title?, position? }"}
                </DocsCode>
                .
              </>
            ),
          },
          {
            name: "patternHandlers",
            type: "PatternHandler[]",
            default: "[]",
            description:
              "Inline replacements applied to paragraph and list text — citations, mentions, ticket links.",
          },
          {
            name: "isAnimating",
            type: "boolean",
            default: "false",
            description:
              "True while this turn is still streaming; keeps incomplete markdown from flickering.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the turn wrapper.",
          },
          {
            name: "contentClassName",
            type: "string",
            description:
              "Merged onto the bubble (user) or the answer body (assistant).",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "message",
        description: (
          <>
            Turn wrapper. Carries <DocsCode>data-sender</DocsCode> and, while
            editing, <DocsCode>data-editing</DocsCode>.
          </>
        ),
      },
      { slot: "message-content", description: "Bubble or answer body." },
      { slot: "message-actions", description: "Hover action row." },
    ],
    customization: [
      {
        title: "Recolor the bubble",
        description: (
          <>
            <DocsCode>contentClassName</DocsCode> merges last, so a single prop
            re-tints the user bubble. Anything the turn renders further down —
            tool rows, code, artifacts — is reachable by{" "}
            <DocsCode>data-slot</DocsCode> from an ancestor.
          </>
        ),
        example: { name: "message-styled-example", node: <MessageStyledExample /> },
      },
      {
        title: "Target one sender",
        description: (
          <>
            Because the wrapper stamps <DocsCode>data-sender</DocsCode>, a
            single class on the scroll container can restyle every user turn.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageList
  messages={messages}
  className="[&_[data-slot=message][data-sender=user]_[data-slot=message-content]]:rounded-lg
             [&_[data-slot=message][data-sender=user]_[data-slot=message-content]]:bg-primary/10"
/>`,
        },
      },
      {
        title: "Render citations inline",
        description: (
          <>
            <DocsCode>patternHandlers</DocsCode> run over paragraph and list
            text before rendering. Use a global regex so scanning advances.
          </>
        ),
        code: {
          lang: "tsx",
          code: `const citations: PatternHandler[] = [
  {
    pattern: /\\[(\\d+)\\]/g,
    render: (match) => (
      <sup className="ml-0.5 rounded-sm bg-primary/10 px-1 text-primary">
        {match[1]}
      </sup>
    ),
  },
]

<Message sender="assistant" content={answer} patternHandlers={citations} />`,
        },
      },
    ],
    notes: [
      {
        title: "Memoization",
        description: (
          <>
            <DocsCode>Message</DocsCode> is wrapped in{" "}
            <DocsCode>React.memo</DocsCode>, so in a streaming list only the
            turn whose props actually changed re-renders. Keep the callbacks and
            arrays you pass stable — hoist constants, wrap handlers in{" "}
            <DocsCode>useCallback</DocsCode> — or the memo does nothing.
          </>
        ),
      },
    ],
  },

  "message-list": {
    title: "Message List",
    description:
      "Scroll container with smart auto-scroll: it follows a streaming answer, and stops the moment the reader scrolls away.",
    registry: "message-list",
    registryDependencies: ["message", "generation-status"],
    preview: {
      name: "message-list-example",
      node: <MessageListExample />,
      align: "stretch",
    },
    usage: `"use client"

import { MessageList, type ChatMessageData } from "@/components/ui/message-list"

export function Conversation({ messages }: { messages: ChatMessageData[] }) {
  return <MessageList className="flex-1" messages={messages} />
}`,
    props: [
      {
        caption: "MessageList",
        rows: [
          {
            name: "messages",
            type: "ChatMessageData[]",
            required: true,
            description: (
              <>
                Each item is a <DocsCode>Message</DocsCode> plus an{" "}
                <DocsCode>id</DocsCode>.
              </>
            ),
          },
          {
            name: "isGenerating",
            type: "boolean",
            default: "false",
            description:
              "Marks the last assistant turn as streaming and shows the spinner while it is still empty.",
          },
          {
            name: "generationStage",
            type: '"thinking" | "searching" | "responding" | "idle"',
            default: '"idle"',
            description: "Label for that spinner.",
          },
          {
            name: "onEditMessage",
            type: "(id: string, content: string) => void",
            description: "Enables inline editing on user turns.",
          },
          {
            name: "renderActions",
            type: "(message: ChatMessageData) => React.ReactNode",
            description:
              "Rendered under each settled turn — copy, retry, feedback.",
          },
          {
            name: "emptyState",
            type: "React.ReactNode",
            description: "Shown instead of the list when there are no messages.",
          },
          {
            name: "patternHandlers",
            type: "PatternHandler[]",
            default: "[]",
            description: "Forwarded to every message.",
          },
          {
            name: "className",
            type: "string",
            description:
              "Merged onto the scroll container. The inner column is capped at max-w-3xl.",
          },
          {
            name: "...props",
            type: 'React.ComponentProps<"div">',
            description: (
              <>
                Everything else lands on the scroller. Your{" "}
                <DocsCode>onScroll</DocsCode> runs before the built-in handler.
              </>
            ),
          },
        ],
      },
      {
        caption: "useChatAutoScroll(messages)",
        rows: [
          {
            name: "scrollRef",
            type: "RefObject<HTMLDivElement>",
            description: "Attach to your own scroll container.",
          },
          {
            name: "handleMessageScroll",
            type: "() => void",
            description:
              "Call from onScroll. Re-arms following when the reader returns to the bottom.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "message-list", description: "The scroll container." },
      { slot: "message-list-item", description: "Wrapper around each turn." },
    ],
    customization: [
      {
        title: "Per-message actions",
        description: (
          <>
            <DocsCode>renderActions</DocsCode> is skipped while a turn is still
            streaming, so buttons only appear once the answer settles.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageList
  messages={messages}
  onEditMessage={editMessage}
  renderActions={(message) =>
    message.sender === "assistant" ? (
      <div className="mb-6 flex gap-1">
        <button onClick={() => copy(message.content)}>Copy</button>
        <button onClick={() => retry(message.id)}>Retry</button>
      </div>
    ) : null
  }
/>`,
        },
      },
      {
        title: "Wider measure and an empty state",
        code: {
          lang: "tsx",
          code: `<MessageList
  className="px-8 [&>div]:max-w-4xl"
  messages={messages}
  emptyState={
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Ask your first question.
    </div>
  }
/>`,
        },
      },
    ],
  },

  "message-parts": {
    title: "Message Parts",
    description:
      "The atoms an assistant turn is made of — reasoning, tool calls, highlighted code, and artifact cards. Use them directly when you build your own turn layout.",
    registry: "message-parts",
    registryDependencies: ["collapsible", "message-markdown"],
    preview: { name: "message-parts-example", node: <MessagePartsExample /> },
    usage: `import {
  MessageArtifact,
  MessageCode,
  MessageReasoning,
  MessageToolCalls,
} from "@/components/ui/message-parts"

export function Answer() {
  return (
    <>
      <MessageReasoning duration={7}>Checking the reducer…</MessageReasoning>
      <MessageToolCalls tools={tools} />
      <MessageCode block={{ language: "ts", code: source }} />
      <MessageArtifact artifact={{ id: "a1", title: "coverage.csv" }} />
    </>
  )
}`,
    props: [
      {
        caption: "MessageReasoning",
        rows: [
          {
            name: "children",
            type: "string",
            required: true,
            description: "Reasoning text, rendered as markdown.",
          },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "false",
            description: "Start expanded.",
          },
          {
            name: "duration",
            type: "number",
            description: 'Seconds — "Thought for N seconds".',
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
      {
        caption: "MessageToolCall / MessageToolCalls",
        rows: [
          {
            name: "tool",
            type: "MessageToolCallData",
            required: true,
            description: (
              <>
                Single row.{" "}
                <DocsCode>
                  {"{ id, name, status?, input?, output? }"}
                </DocsCode>
                . The headline is derived from the tool name and arguments.
              </>
            ),
          },
          {
            name: "tools",
            type: "MessageToolCallData[]",
            required: true,
            description: "Stack of rows (MessageToolCalls).",
          },
          {
            name: "collapseAt",
            type: "number",
            default: "3",
            description: 'Collapse behind "Used N tools" from this count up.',
          },
          {
            name: "defaultOpen",
            type: "boolean",
            description: "Overrides the automatic collapse decision.",
          },
        ],
      },
      {
        caption: "MessageCode",
        rows: [
          {
            name: "block",
            type: "MessageCodeBlockData",
            required: true,
            description: (
              <>
                <DocsCode>{"{ language?, code, title? }"}</DocsCode>. Language{" "}
                <DocsCode>mermaid</DocsCode> is handed to the markdown renderer
                instead.
              </>
            ),
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
      {
        caption: "MessageArtifact",
        rows: [
          {
            name: "artifact",
            type: "MessageArtifactData",
            required: true,
            description: (
              <>
                <DocsCode>
                  {"{ id, title, kind?, summary?, content?, onOpen? }"}
                </DocsCode>
                . Without <DocsCode>onOpen</DocsCode> the card is inert.
              </>
            ),
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
    ],
    dataSlots: [
      { slot: "message-reasoning", description: "Reasoning disclosure." },
      {
        slot: "message-tool-call",
        description: (
          <>
            One tool row. Carries <DocsCode>data-status</DocsCode> —{" "}
            <DocsCode>pending</DocsCode>, <DocsCode>running</DocsCode>,{" "}
            <DocsCode>done</DocsCode>, <DocsCode>error</DocsCode>.
          </>
        ),
      },
      { slot: "message-tool-calls", description: "The stack of rows." },
      { slot: "message-code", description: "Code card." },
      { slot: "message-artifact", description: "Artifact card." },
    ],
    customization: [
      {
        title: "Style by tool status",
        description: (
          <>
            Every row exposes its status as a data attribute, so error and
            running states can be themed without touching the component.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<div
  className="[&_[data-slot=message-tool-call][data-status=error]]:text-destructive
             [&_[data-slot=message-tool-call][data-status=running]]:opacity-70"
>
  <MessageToolCalls tools={tools} />
</div>`,
        },
      },
      {
        title: "Keep every row expanded",
        description: (
          <>
            Rows collapse by default and the stack folds at three. Both are
            props.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageToolCalls tools={tools} collapseAt={Infinity} defaultOpen />

{tools.map((tool) => (
  <MessageToolCall key={tool.id} tool={tool} defaultOpen />
))}`,
        },
      },
    ],
    notes: [
      {
        title: "Highlighting",
        description: (
          <>
            <DocsCode>MessageCode</DocsCode> loads Shiki once per page through a
            module-level singleton and caches the last 100 rendered snippets, so
            re-renders and remounts never re-run the highlighter. Unknown
            languages fall back to plain text.
          </>
        ),
      },
    ],
  },

  "message-markdown": {
    title: "Message Markdown",
    description:
      "Streamdown renderer tuned for streaming answers: GFM, Shiki code, Mermaid diagrams, and KaTeX math, with incomplete markdown parsed safely.",
    registry: "message-markdown",
    preview: {
      name: "message-markdown-example",
      node: <MessageMarkdownExample />,
    },
    usage: `import { MessageMarkdown } from "@/components/ui/message-markdown"

export function Answer({ text }: { text: string }) {
  return <MessageMarkdown isAnimating>{text}</MessageMarkdown>
}`,
    props: [
      {
        caption: "MessageMarkdown",
        rows: [
          {
            name: "children",
            type: "string",
            required: true,
            description: "The markdown source.",
          },
          {
            name: "isAnimating",
            type: "boolean",
            default: "false",
            description:
              "True while text is still streaming; unterminated emphasis, links, and fences stop flickering.",
          },
          {
            name: "patternHandlers",
            type: "MarkdownPatternHandler[]",
            default: "[]",
            description:
              "Inline replacements applied to paragraph and list-item text.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the Streamdown root.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "message-markdown", description: "Wrapper around Streamdown." },
    ],
    customization: [
      {
        title: "Mermaid and math",
        description: (
          <>
            Both plugins are wired up already: fence a diagram as{" "}
            <DocsCode>mermaid</DocsCode> and write math with{" "}
            <DocsCode>$…$</DocsCode> or <DocsCode>$$…$$</DocsCode>. The Mermaid
            theme follows the resolved next-themes value.
          </>
        ),
        code: {
          lang: "md",
          code: `\`\`\`mermaid
flowchart LR
  A[Prompt] --> B{Tool needed?}
  B -- yes --> C[Run tool]
  B -- no --> D[Answer]
\`\`\`

Inline $O(n \\log n)$ and a display block:

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$`,
        },
      },
      {
        title: "Restyle the prose",
        description: (
          <>
            Output is scoped under the <DocsCode>lc-markdown</DocsCode> class
            defined in <DocsCode>message-markdown.css</DocsCode>. Edit that file
            for global changes, or pass{" "}
            <DocsCode>className</DocsCode> for one-off overrides.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageMarkdown className="[&_pre]:rounded-xl [&_table]:text-[13px]">
  {text}
</MessageMarkdown>`,
        },
      },
    ],
    notes: [
      {
        title: "Build setup",
        description: (
          <>
            Streamdown ships utility classes inside its own dist files, so
            Tailwind v4 needs <DocsCode>@source</DocsCode> entries for them, and
            Next.js needs the packages in{" "}
            <DocsCode>transpilePackages</DocsCode>. Both snippets are on the{" "}
            <a href="/docs/installation">Installation</a> page.
          </>
        ),
      },
    ],
  },

  "generation-status": {
    title: "Generation Status",
    description:
      "Braille spinner with an optional label, for the gap between sending a message and the first token.",
    registry: "generation-status",
    preview: {
      name: "generation-status-example",
      node: <GenerationStatusExample />,
    },
    usage: `import { GenerationStatus } from "@/components/ui/generation-status"

export function Pending({ busy }: { busy: boolean }) {
  return <GenerationStatus active={busy} label="Thinking" />
}`,
    props: [
      {
        caption: "GenerationStatus",
        rows: [
          {
            name: "active",
            type: "boolean",
            description: (
              <>
                Shows the spinner. Prefer this over{" "}
                <DocsCode>stage</DocsCode>; when both are omitted nothing
                renders.
              </>
            ),
          },
          {
            name: "stage",
            type: '"thinking" | "searching" | "responding" | "idle"',
            default: '"idle"',
            description:
              "Legacy stage. Any non-idle stage shows the spinner and supplies a default label.",
          },
          {
            name: "label",
            type: "string",
            description: "Overrides the stage label. Omit for a bare spinner.",
          },
          {
            name: "size",
            type: "number",
            default: "16",
            description: "Spinner font size in pixels.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the inline wrapper.",
          },
          {
            name: "...props",
            type: 'React.ComponentProps<"span">',
            description: "Everything else lands on the wrapper.",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "generation-status",
        description: (
          <>
            Wrapper. Carries <DocsCode>data-stage</DocsCode> and is announced
            with <DocsCode>aria-live=&quot;polite&quot;</DocsCode>.
          </>
        ),
      },
      { slot: "generation-status-spinner", description: "The braille glyph." },
    ],
    customization: [
      {
        title: "Recolor and resize",
        code: {
          lang: "tsx",
          code: `<GenerationStatus
  active
  size={20}
  label="Compiling registry"
  className="text-primary [&_[data-slot=generation-status-spinner]]:text-primary"
/>`,
        },
      },
    ],
    notes: [
      {
        title: "Where it appears",
        description: (
          <>
            <DocsCode>MessageList</DocsCode> renders this for you: while{" "}
            <DocsCode>isGenerating</DocsCode> is true and the last assistant
            turn is still empty, the spinner sits where the answer will land.
            You only mount it yourself in custom layouts.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
