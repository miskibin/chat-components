import Link from "next/link"

import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { AskQuestionExample } from "@/components/examples/ask-question-example"
import { AskQuestionToolExample } from "@/components/examples/ask-question-tool-example"
import { ChangeSummaryExample } from "@/components/examples/change-summary-example"
import { FileIconExample } from "@/components/examples/file-icon-example"
import { FilePreviewExample } from "@/components/examples/file-preview-example"
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
    registryDependencies: ["message-parts", "change-summary"],
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
            description: "Start the reasoning disclosure expanded. The latest thought still opens while it streams, then collapses when the turn finishes.",
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
              "Chronological thinking, text, and tool segments. When set, it replaces the tools-then-content layout. Consecutive thinking chunks merge; a tool or text in between starts a new thinking span.",
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
            name: "onAskAnswer",
            type: "(toolId: string, result: AskQuestionResult) => void",
            description:
              "Fired when an Ask Question tool on this turn is submitted or skipped.",
          },
          {
            name: "workedFor",
            type: "number",
            description:
              'Elapsed seconds. After the turn settles, rendered as “Worked for 12s”.',
          },
          {
            name: "changes",
            type: "ChangeSummaryFile[]",
            description:
              "File-change card. When omitted, Edit / Write / ApplyPatch tools are summarised automatically.",
          },
          {
            name: "onReviewChanges",
            type: "() => void",
            description: "Makes the Review label on the change card a button.",
          },
          {
            name: "onOpenFile",
            type: "(tool: MessageToolCallData) => void",
            description: (
              <>
                Forwarded to every tool row: Edit / Write / Read headlines that
                name a file become buttons that open it — pair it with{" "}
                <DocsCode>FilePreview</DocsCode>.
              </>
            ),
          },
          {
            name: "onChangeFileClick",
            type: "(file: ChangeSummaryFile) => void",
            description:
              "Makes each row of the turn's change-summary card clickable.",
          },
          {
            name: "onFileReferenceClick",
            type: "(path: string) => void",
            description: (
              <>
                Makes the file references inside the answer&apos;s markdown
                clickable — every <DocsCode>MessageMarkdown</DocsCode> in the
                turn gets it. The path arrives without its{" "}
                <DocsCode>:line</DocsCode> suffix.
              </>
            ),
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
      {
        slot: "message-turn-summary",
        description: "Worked-for badge and file-change card after a settled turn.",
      },
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
            name: "onAskAnswer",
            type: "(messageId: string, toolId: string, result: AskQuestionResult) => void",
            description:
              "Fired when an Ask Question tool is submitted or skipped. Hide the composer send-as-skip yourself if you want Cursor's extra-details behavior.",
          },
          {
            name: "onReviewChanges",
            type: "(messageId: string) => void",
            description:
              "Makes the Review label on a turn's change card a button.",
          },
          {
            name: "onOpenFile",
            type: "(messageId: string, tool: MessageToolCallData) => void",
            description: (
              <>
                Fired when an Edit / Write / Read headline is clicked. Pair it
                with <DocsCode>filePreviewFromTool</DocsCode> and{" "}
                <DocsCode>FilePreview</DocsCode>.
              </>
            ),
          },
          {
            name: "onChangeFileClick",
            type: "(messageId: string, file: ChangeSummaryFile) => void",
            description:
              "Fired when a row of a turn's change-summary card is clicked.",
          },
          {
            name: "onFileReferenceClick",
            type: "(messageId: string, path: string) => void",
            description: (
              <>
                Fired when a file chip inside an answer&apos;s markdown is
                clicked — see <DocsCode>MessageMarkdown</DocsCode>.
              </>
            ),
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
    notes: [
      {
        title: "Streaming cost",
        description: (
          <>
            Rows are memoized and the event callbacks you pass —{" "}
            <DocsCode>onEditMessage</DocsCode>,{" "}
            <DocsCode>onAskAnswer</DocsCode>, <DocsCode>onOpenFile</DocsCode>,{" "}
            <DocsCode>onChangeFileClick</DocsCode>,{" "}
            <DocsCode>onFileReferenceClick</DocsCode> and{" "}
            <DocsCode>onReviewChanges</DocsCode> — are held at one identity
            internally, so a parent that re-renders on each streamed token only
            reaches the row whose message object actually changed. Keep the
            message objects themselves stable (patch the streaming turn, map the
            rest through) and the list stays flat as it grows.{" "}
            <DocsCode>renderActions</DocsCode> is a render prop, not a callback:
            it runs on every render with your current closure, outside the
            memoized row, so the buttons it returns never go stale.
          </>
        ),
      },
      {
        title: "Auto-scroll",
        description: (
          <>
            Following is coalesced into one animation frame, so a burst of
            tokens schedules one scroll rather than dozens. Growing text tracks
            the bottom instantly; a whole new message animates.
          </>
        ),
      },
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
      "The atoms an assistant turn is made of — reasoning, tool calls, ask questions, highlighted code, and artifact cards. Use them directly when you build your own turn layout.",
    registry: "message-parts",
    registryDependencies: [
      "collapsible",
      "message-markdown",
      "ask-question",
      "file-icon",
    ],
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
            description: "Start expanded. Ignored while `streaming` is driving the open state.",
          },
          {
            name: "streaming",
            type: "boolean",
            default: "false",
            description:
              "Keep the body open while this thought is still arriving. When it flips to false the disclosure collapses — same as Cursor after a turn finishes.",
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
                . The headline is derived from the tool name and arguments. Edit
                / Write rows expand into a unified diff when{" "}
                <DocsCode>input</DocsCode> carries Cursor{" "}
                <DocsCode>diff</DocsCode>/<DocsCode>streamContent</DocsCode>/
                <DocsCode>fileText</DocsCode>, or classic{" "}
                <DocsCode>old_string</DocsCode>/<DocsCode>new_string</DocsCode>.
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
            name: "onAskAnswer",
            type: "(toolId: string, result: AskQuestionResult) => void",
            description:
              "Ask Question tools only. Continue and Skip both fire this — check result.skipped. The row reports its own id, so one handler can serve a whole turn without breaking memoization.",
          },
          {
            name: "onOpenFile",
            type: "(tool: MessageToolCallData) => void",
            description: (
              <>
                Opt in to a clickable headline: an Edit / Write / Read row that
                names a file splits into an open-file button plus a separate
                chevron for the inline body. Without it the header stays one
                disclosure, exactly as before.
              </>
            ),
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
        slot: "message-reasoning-trigger",
        description: '"Thought for N seconds" row.',
      },
      {
        slot: "message-reasoning-content",
        description: "The thought body.",
      },
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
      {
        slot: "message-tool-call-trigger",
        description: (
          <>
            The headline button of one row. With{" "}
            <DocsCode>onOpenFile</DocsCode> it opens the file instead of the
            body and carries <DocsCode>data-action=&quot;open-file&quot;</DocsCode>.
          </>
        ),
      },
      {
        slot: "file-icon",
        description: (
          <>
            The <DocsCode>FileIcon</DocsCode> in front of a headline that names
            a file. Rows whose detail is a command or a search pattern have
            none.
          </>
        ),
      },
      {
        slot: "message-tool-call-header",
        description:
          "Wrapper around the headline and the chevron — only rendered for a clickable row.",
      },
      {
        slot: "message-tool-call-chevron",
        description:
          "The separate expand/collapse button of a clickable row.",
      },
      {
        slot: "message-tool-call-body",
        description: "Expanded body — diff, file, summary, or raw payload.",
      },
      { slot: "message-tool-calls", description: "The stack of rows." },
      {
        slot: "message-tool-calls-trigger",
        description: '"Used N tools" summary row.',
      },
      { slot: "message-tool-list", description: "The rows inside the stack." },
      {
        slot: "message-tool-stats",
        description: "The +/- counts on an Edit / Write headline.",
      },
      {
        slot: "ask-question",
        description:
          "Questionnaire card rendered in place of an unanswered Ask Question tool row.",
      },
      {
        slot: "message-tool-diff",
        description:
          "Unified diff body inside an Edit / Write / ApplyPatch row.",
      },
      {
        slot: "message-tool-diff-line",
        description: (
          <>
            One diff line, tagged <DocsCode>data-type</DocsCode> —{" "}
            <DocsCode>add</DocsCode>, <DocsCode>remove</DocsCode>,{" "}
            <DocsCode>context</DocsCode>.
          </>
        ),
      },
      {
        slot: "message-tool-file",
        description:
          "Read-file body — line gutter and syntax highlight, same chrome as the diff.",
      },
      { slot: "message-tool-file-line", description: "One read-file line." },
      {
        slot: "message-tool-show-all",
        description:
          "Reveals the rest of a diff or file body past the 300-line preview cap.",
      },
      { slot: "message-code", description: "Code card." },
      { slot: "message-code-header", description: "Language chip + copy row." },
      {
        slot: "message-code-copy",
        description: (
          <>
            Copy button. Flips <DocsCode>data-state</DocsCode> to{" "}
            <DocsCode>copied</DocsCode> for a moment.
          </>
        ),
      },
      { slot: "message-artifact", description: "Artifact card." },
      {
        slot: "message-artifact-trigger",
        description: "Artifact header button.",
      },
      {
        slot: "message-artifact-content",
        description: "Inline artifact preview.",
      },
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
            module-level singleton and caches what it renders, so re-renders and
            remounts never re-run the highlighter. Diff and read-file bodies are
            tokenized one block at a time rather than one line at a time — a
            500-line file is a single Shiki pass, not 500 — and both cap the
            preview at 300 lines behind a Show all button. Unknown languages fall
            back to plain text.
          </>
        ),
      },
      {
        title: "Ask Question tools",
        description: (
          <>
            A tool named <DocsCode>Ask Question</DocsCode> (or{" "}
            <DocsCode>ask</DocsCode>) whose <DocsCode>input</DocsCode> is
            Cursor&apos;s <DocsCode>{`{ title?, questions }`}</DocsCode> payload
            renders the questionnaire for as long as it is unanswered — while it
            is <DocsCode>pending</DocsCode>/<DocsCode>running</DocsCode>, and
            also when the agent closed it with nothing selected — then collapses
            to the usual &ldquo;Done Ask Question&rdquo; row once the user picks
            or skips.
          </>
        ),
      },
      {
        title: "Tool call diffs",
        description: (
          <>
            File mutation tools render a compact unified diff (via{" "}
            <DocsCode>diff</DocsCode>) instead of dumping JSON. Read tools use
            the same chrome for the file body (line numbers + Shiki). Word-level
            highlights mark changed tokens inside paired diff lines.
          </>
        ),
      },
    ],
  },

  "ask-question": {
    title: "Ask Question",
    description:
      "Cursor-style questionnaire the agent can drop into a turn: single-select radios, multi-select checkboxes, an Other… field, Skip, and Continue.",
    registry: "ask-question",
    registryDependencies: ["collapsible"],
    preview: { name: "ask-question-example", node: <AskQuestionExample /> },
    usage: `"use client"

import { AskQuestion } from "@/components/ui/ask-question"

export function Clarify() {
  return (
    <AskQuestion
      title="A couple of questions"
      questions={[
        {
          id: "next",
          prompt: "What would you like to test next?",
          options: [
            { id: "options", label: "Different options (Recommended)" },
            { id: "one", label: "One question only" },
          ],
        },
      ]}
      onSubmit={(result) => {
        if (result.skipped) return
        save(result.answers)
      }}
    />
  )
}`,
    props: [
      {
        caption: "AskQuestion",
        rows: [
          {
            name: "questions",
            type: "AskQuestionItem[]",
            required: true,
            description: (
              <>
                Each item is{" "}
                <DocsCode>
                  {"{ id, prompt, options: [{ id, label }], allowMultiple? }"}
                </DocsCode>
                . Append{" "}
                <DocsCode>(Recommended)</DocsCode> to a label to badge it.
                Other… is added automatically unless{" "}
                <DocsCode>hideOther</DocsCode>.
              </>
            ),
          },
          {
            name: "title",
            type: "string",
            description: 'Header label. Defaults to "Questions".',
          },
          {
            name: "value",
            type: "Record<string, AskQuestionSelection>",
            description: "Controlled selections keyed by question id.",
          },
          {
            name: "defaultValue",
            type: "Record<string, AskQuestionSelection>",
            description: "Initial selections when uncontrolled.",
          },
          {
            name: "onChange",
            type: "(value: Record<string, AskQuestionSelection>) => void",
            description: "Fired on every option or Other… edit.",
          },
          {
            name: "onSubmit",
            type: "(result: AskQuestionResult) => void",
            description:
              "Continue. If onSkip is omitted, Skip also fires this with skipped: true.",
          },
          {
            name: "onSkip",
            type: "() => void",
            description: "Skip. Continue stays disabled until every question has a selection.",
          },
          {
            name: "hideOther",
            type: "boolean",
            default: "false",
            description: "Do not append the Other… option.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Locks the form after a parent has recorded the answer.",
          },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "true",
            description: "Start the panel expanded. Collapse it to read the turn behind it.",
          },
          {
            name: "skipLabel",
            type: "string",
            default: '"Skip"',
            description: "Label on the secondary action.",
          },
          {
            name: "submitLabel",
            type: "string",
            default: '"Continue"',
            description: "Label on the primary action.",
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
      {
        caption: "AskQuestionSummary",
        rows: [
          {
            name: "questions",
            type: "AskQuestionItem[]",
            required: true,
            description: "The same questions the answer was collected for.",
          },
          {
            name: "result",
            type: "AskQuestionResult",
            required: true,
            description:
              "Settled answer. skipped: true renders the one-line skipped note instead.",
          },
          {
            name: "hideOther",
            type: "boolean",
            default: "false",
            description: "Match the AskQuestion setting so labels resolve.",
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
    ],
    dataSlots: [
      { slot: "ask-question", description: "The questionnaire card." },
      { slot: "ask-question-trigger", description: "Collapsible header row." },
      { slot: "ask-question-form", description: "The form body." },
      { slot: "ask-question-item", description: "One question fieldset." },
      { slot: "ask-question-prompt", description: "The question legend." },
      {
        slot: "ask-question-group",
        description: (
          <>
            The <DocsCode>radiogroup</DocsCode> (or checkbox{" "}
            <DocsCode>group</DocsCode>) wrapping one question&apos;s options.
          </>
        ),
      },
      {
        slot: "ask-question-option",
        description: (
          <>
            One option button. Carries <DocsCode>data-selected</DocsCode> and{" "}
            <DocsCode>data-state</DocsCode> —{" "}
            <DocsCode>checked</DocsCode>/<DocsCode>unchecked</DocsCode>.
          </>
        ),
      },
      {
        slot: "ask-question-indicator",
        description: "The radio dot or checkbox tick.",
      },
      { slot: "ask-question-other", description: "The Other… text field." },
      { slot: "ask-question-actions", description: "The button row." },
      { slot: "ask-question-skip", description: "Skip button." },
      { slot: "ask-question-submit", description: "Continue button." },
      {
        slot: "ask-question-summary",
        description: (
          <>
            Read-only recap after Skip or Continue.{" "}
            <DocsCode>data-state</DocsCode> is{" "}
            <DocsCode>answered</DocsCode> or <DocsCode>skipped</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "Restyle the selected option",
        description: (
          <>
            Every option stamps its own state, so a wrapper can theme selection
            without forking the component.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<div
  className="[&_[data-slot=ask-question-option][data-selected=true]]:bg-primary/10
             [&_[data-slot=ask-question-submit]]:rounded-full"
>
  <AskQuestion questions={questions} onSubmit={save} />
</div>`,
        },
      },
      {
        title: "Render it from a tool call",
        description: (
          <>
            <DocsCode>MessageToolCall</DocsCode> swaps in this card whenever{" "}
            <DocsCode>isOpenAskTool</DocsCode> holds: the tool name is Ask
            Question and it is either still running or already closed by the
            agent with nothing selected. After the user hits Skip or Continue it
            becomes the usual &ldquo;Done Ask Question&rdquo; row.
          </>
        ),
        example: {
          name: "ask-question-tool-example",
          node: <AskQuestionToolExample />,
        },
      },
    ],
    notes: [
      {
        title: "Tool payload",
        description: (
          <>
            <DocsCode>parseAskQuestionInput</DocsCode> reads Cursor&apos;s{" "}
            <DocsCode>{`{ title?, questions: [{ id, prompt, options, allow_multiple? }] }`}</DocsCode>{" "}
            JSON. <DocsCode>allow_multiple</DocsCode> and{" "}
            <DocsCode>allowMultiple</DocsCode> both work. Continue stays disabled
            until every question has at least one option.
          </>
        ),
      },
      {
        title: "Who closed the questions",
        description: (
          <>
            Headless backends answer their own ask tool — a CLI running
            non-interactively skips it the moment it is emitted — which used to
            make the card flash past and land as an unanswerable &ldquo;No
            selection&rdquo; summary. <DocsCode>isOpenAskTool</DocsCode> treats
            an ask closed with no answers as still open, so the user can pick —
            on the latest turn only, so an ask from an earlier turn stays
            history rather than reopening on every reload.{" "}
            <DocsCode>formatAskQuestionOutput</DocsCode> stamps{" "}
            <DocsCode>{`source: "user"`}</DocsCode> on what the card produces,
            and <DocsCode>parseAskQuestionResult</DocsCode> reads it back, so a
            deliberate Skip stays skipped across a reload.
          </>
        ),
      },
      {
        title: "Keyboard",
        description: (
          <>
            A single-select question is a real{" "}
            <DocsCode>radiogroup</DocsCode>: one tab stop, arrow keys move and
            select. Multi-select questions are{" "}
            <DocsCode>checkbox</DocsCode> buttons and each is its own tab stop.
            Picking Other… with the pointer focuses its text field; arrowing
            onto it does not, so the group stays navigable.
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
    registryDependencies: ["file-icon"],
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
            name: "onFileClick",
            type: "(path: string) => void",
            description: (
              <>
                Makes every detected file chip a button. The path arrives with
                any <DocsCode>:line:col</DocsCode> suffix stripped. Keep the
                handler stable — it is read through context so the inline
                renderer stays memoized while text streams.
              </>
            ),
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
      {
        slot: "message-file-ref",
        description: (
          <>
            A file chip found in inline code — a{" "}
            <DocsCode>&lt;button&gt;</DocsCode> with{" "}
            <DocsCode>data-interactive</DocsCode> when{" "}
            <DocsCode>onFileClick</DocsCode> is set, otherwise a{" "}
            <DocsCode>&lt;span&gt;</DocsCode>. Both carry{" "}
            <DocsCode>data-path</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "File references become chips",
        description: (
          <>
            Inline code that reads as a file path renders as a chip with its{" "}
            <DocsCode>FileIcon</DocsCode> — <DocsCode>`lib/store.ts`</DocsCode>,{" "}
            <DocsCode>`app/page.tsx:42`</DocsCode>,{" "}
            <DocsCode>`package.json`</DocsCode>,{" "}
            <DocsCode>`Dockerfile`</DocsCode>. Detection is deliberately
            conservative: a recognized extension or a well-known extension-less
            filename qualifies on its own, a slashed string needs three
            segments (so <DocsCode>`and/or`</DocsCode> stays code), and URLs,
            anything with whitespace, and library names like{" "}
            <DocsCode>`Next.js`</DocsCode> never match. Fenced blocks, mermaid
            and math are untouched — Streamdown routes them to their own
            renderers. Everything else renders as ordinary inline code.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageMarkdown onFileClick={(path) => setPreviewFile({ path })}>
  {"Renamed \`lib/store/reducer.ts\`; the call site is \`app/page.tsx:120\`."}
</MessageMarkdown>

// Restyle them from the outside:
<MessageMarkdown className="[&_[data-slot=message-file-ref]]:border-primary/40">
  {text}
</MessageMarkdown>`,
        },
      },
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

  "change-summary": {
    title: "Change Summary",
    description:
      "The card Cursor shows after a coding turn: file count, a Review action, a few rows with +/- stats, and “Show N more”. Pair it with WorkedFor for the elapsed-time badge.",
    registry: "change-summary",
    registryDependencies: ["collapsible", "file-icon"],
    preview: {
      name: "change-summary-example",
      node: <ChangeSummaryExample />,
    },
    usage: `import {
  ChangeSummary,
  WorkedFor,
} from "@/components/ui/change-summary"

export function AfterTurn() {
  return (
    <>
      <WorkedFor seconds={72} />
      <ChangeSummary
        files={[
          { path: "lib/reducer.ts", additions: 4, deletions: 2 },
          { path: "lib/reducer.test.ts", additions: 11 },
        ]}
        onAction={() => openReview()}
      />
    </>
  )
}`,
    props: [
      {
        caption: "ChangeSummary",
        rows: [
          {
            name: "files",
            type: "ChangeSummaryFile[]",
            required: true,
            description: (
              <>
                Each item is{" "}
                <DocsCode>{"{ path, additions?, deletions? }"}</DocsCode>. The
                filename is derived from the path.
              </>
            ),
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: 'Defaults to “N Files Changed”.',
          },
          {
            name: "actionLabel",
            type: "React.ReactNode",
            default: '"Review"',
            description: "Right-aligned header label.",
          },
          {
            name: "onAction",
            type: "() => void",
            description:
              "Makes the header label a button. Omit it to keep Review as plain text.",
          },
          {
            name: "onFileClick",
            type: "(file: ChangeSummaryFile) => void",
            description: (
              <>
                Turns every row into a button — open the file in a{" "}
                <DocsCode>FilePreview</DocsCode> panel. Rows stay plain text
                without it.
              </>
            ),
          },
          {
            name: "previewCount",
            type: "number",
            default: "4",
            description: "How many rows to show before “Show N more”.",
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
      {
        caption: "WorkedFor",
        rows: [
          {
            name: "seconds",
            type: "number",
            required: true,
            description: "Elapsed time for the finished turn.",
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "change-summary",
        description: (
          <>
            The card. <DocsCode>data-state</DocsCode> is{" "}
            <DocsCode>collapsed</DocsCode> while rows are still hidden.
          </>
        ),
      },
      { slot: "change-summary-header", description: "Title + Review." },
      {
        slot: "change-summary-action",
        description: "The Review button, or its plain-text stand-in.",
      },
      { slot: "change-summary-list", description: "Visible file rows." },
      {
        slot: "change-summary-rest",
        description: "Rows revealed by “Show N more”.",
      },
      {
        slot: "change-summary-file",
        description: (
          <>
            One file row, tagged <DocsCode>data-kind</DocsCode> —{" "}
            <DocsCode>code</DocsCode>, <DocsCode>style</DocsCode>,{" "}
            <DocsCode>data</DocsCode>, <DocsCode>text</DocsCode>. With{" "}
            <DocsCode>onFileClick</DocsCode> it is a button and carries{" "}
            <DocsCode>data-interactive</DocsCode>.
          </>
        ),
      },
      {
        slot: "change-summary-file-icon",
        description: (
          <>
            The row&apos;s <DocsCode>FileIcon</DocsCode>, picked from the path.
          </>
        ),
      },
      { slot: "change-summary-stats", description: "The +/- counts on a row." },
      { slot: "change-summary-more", description: "Show N more / Show less." },
      { slot: "worked-for", description: "The elapsed-time badge." },
    ],
    customization: [
      {
        title: "Derive files from tools",
        description: (
          <>
            <DocsCode>fileChangesFromTools</DocsCode> reads Edit / Write /
            ApplyPatch rows (path + output stats or a unified diff) so you do
            not have to assemble the list by hand.{" "}
            <DocsCode>Message</DocsCode> already does this when{" "}
            <DocsCode>changes</DocsCode> is omitted.
          </>
        ),
        code: {
          lang: "tsx",
          code: `import { fileChangesFromTools } from "@/components/ui/change-summary"

<ChangeSummary files={fileChangesFromTools(tools)} />`,
        },
      },
      {
        title: "Colour the file kinds",
        description: (
          <>
            Text and chrome ship on theme tokens so the card survives a
            re-themed light/dark pair; the glyph is a{" "}
            <DocsCode>FileIcon</DocsCode>, whose brand colours are fixed on
            purpose. Each row still tags itself with{" "}
            <DocsCode>data-kind</DocsCode> — <DocsCode>code</DocsCode>,{" "}
            <DocsCode>style</DocsCode>, <DocsCode>data</DocsCode>,{" "}
            <DocsCode>text</DocsCode> — so opt into colour from the outside
            when you want it.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChangeSummary
  files={files}
  className="[&_[data-kind=code]]:text-primary
             [&_[data-kind=style]]:text-muted-foreground/70"
/>`,
        },
      },
    ],
    notes: [
      {
        title: "Where it appears",
        description: (
          <>
            After a turn finishes, <DocsCode>Message</DocsCode> renders{" "}
            <DocsCode>WorkedFor</DocsCode> (when <DocsCode>workedFor</DocsCode>{" "}
            is set) and this card under the answer. Thinking stays collapsed
            unless the reader opens it.
          </>
        ),
      },
    ],
  },

  "file-preview": {
    title: "File Preview",
    description:
      "The right-hand panel Cursor opens when you click an edited file: the agent's diff, or the whole file with the edited lines marked and scrolled into view.",
    registry: "file-preview",
    registryDependencies: ["message-parts", "file-icon"],
    preview: {
      name: "file-preview-example",
      node: <FilePreviewExample />,
      align: "stretch",
    },
    usage: `"use client"

import {
  FilePreview,
  filePreviewFromTool,
  type FilePreviewFile,
} from "@/components/ui/file-preview"
import { MessageList } from "@/components/ui/message-list"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function Workspace({ messages }: { messages: ChatMessageData[] }) {
  const [file, setFile] = useState<FilePreviewFile | null>(null)

  // The panel fills whatever it is put in; a resizable group lets the reader
  // set the split. The handle and the panel mount together.
  return (
    <ResizablePanelGroup id="workspace" className="h-full min-h-0">
      <ResizablePanel id="chat" defaultSize="65%" minSize="40%">
        <MessageList
          messages={messages}
          onOpenFile={(_messageId, tool) => setFile(filePreviewFromTool(tool))}
        />
      </ResizablePanel>
      {file ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel id="preview" defaultSize="35%" minSize="20%" maxSize="60%">
            <FilePreview
              file={{ ...file, content: readFromDisk(file.path) }}
              onClose={() => setFile(null)}
              className="border-l"
            />
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  )
}`,
    props: [
      {
        caption: "FilePreview",
        rows: [
          {
            name: "file",
            type: "FilePreviewFile",
            required: true,
            description: "What to show — see the table below.",
          },
          {
            name: "defaultView",
            type: '"file" | "diff"',
            description: (
              <>
                Defaults to <DocsCode>file</DocsCode> when{" "}
                <DocsCode>content</DocsCode> is set, otherwise{" "}
                <DocsCode>diff</DocsCode>. The toggle only appears when both
                views are possible.
              </>
            ),
          },
          {
            name: "onClose",
            type: "() => void",
            description:
              "Renders the close button. While it is set, Escape closes the panel too.",
          },
          {
            name: "classNames",
            type: "{ root?, header?, body? }",
            description: "Per-part overrides, merged after the defaults.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the panel root.",
          },
          {
            name: "...props",
            type: 'React.ComponentProps<"div">',
            description: "Everything else lands on the root.",
          },
        ],
      },
      {
        caption: "FilePreviewFile",
        rows: [
          {
            name: "path",
            type: "string",
            required: true,
            description:
              "Shown in the header — directory muted, basename emphasized — and used as the panel's accessible name.",
          },
          {
            name: "content",
            type: "string",
            description: (
              <>
                Full post-edit file text. <strong>Your app supplies this</strong>{" "}
                — a transcript rarely carries the whole file. Without it the
                panel is diff-only.
              </>
            ),
          },
          {
            name: "diff",
            type: "string",
            description: (
              <>
                Unified diff. <DocsCode>@@</DocsCode> hunks keep their real line
                numbers, which is what places the highlight in the File view.
              </>
            ),
          },
          {
            name: "oldText / newText",
            type: "string",
            description:
              "Before/after pair, used when there is no patch. The changed range is located inside content by matching newText.",
          },
          {
            name: "diffLines",
            type: "ToolDiffLine[]",
            description: (
              <>
                Already-parsed diff lines (what{" "}
                <DocsCode>extractToolDiff</DocsCode> returns). Wins over the
                three fields above — <DocsCode>filePreviewFromTool</DocsCode>{" "}
                fills it in.
              </>
            ),
          },
          {
            name: "added / removed",
            type: "number",
            description: "Stat overrides; otherwise counted off the diff.",
          },
          {
            name: "language",
            type: "string",
            description: "Falls back to the extension of the path.",
          },
          {
            name: "startLine",
            type: "number",
            default: "1",
            description: "First line number of content, for a partial read.",
          },
        ],
      },
      {
        caption: "filePreviewFromTool(tool)",
        rows: [
          {
            name: "tool",
            type: "MessageToolCallData",
            required: true,
            description: (
              <>
                Returns a <DocsCode>FilePreviewFile</DocsCode>, or{" "}
                <DocsCode>null</DocsCode> when the tool names no file. Diff and
                read body come from the same extractors the inline tool row
                uses, so the panel shows exactly what the row showed.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "file-preview",
        description: (
          <>
            The panel. Carries <DocsCode>data-view</DocsCode> —{" "}
            <DocsCode>file</DocsCode> or <DocsCode>diff</DocsCode>.
          </>
        ),
      },
      {
        slot: "file-preview-header",
        description: (
          <>
            <DocsCode>FileIcon</DocsCode>, path, stats, toggle, close.
          </>
        ),
      },
      { slot: "file-preview-path", description: "Directory + basename." },
      { slot: "file-preview-stats", description: "The +/- counts." },
      { slot: "file-preview-view-toggle", description: "File / Diff switch." },
      { slot: "file-preview-close", description: "The × button." },
      { slot: "file-preview-body", description: "The scroller — full height." },
      {
        slot: "file-preview-line",
        description: (
          <>
            One rendered line, tagged <DocsCode>data-line-type</DocsCode> —{" "}
            <DocsCode>add</DocsCode>, <DocsCode>remove</DocsCode>,{" "}
            <DocsCode>context</DocsCode>. File rows also carry{" "}
            <DocsCode>data-line</DocsCode>.
          </>
        ),
      },
      { slot: "file-preview-gutter", description: "The line-number column." },
      {
        slot: "file-preview-note",
        description: "Muted message for an empty or unparsable payload.",
      },
    ],
    customization: [
      {
        title: "Open it from a message list",
        description: (
          <>
            <DocsCode>MessageList</DocsCode> takes{" "}
            <DocsCode>onOpenFile</DocsCode> and{" "}
            <DocsCode>onChangeFileClick</DocsCode>: the first fires from an
            Edit / Write / Read headline, the second from a row of the
            change-summary card. Both are bound to the message id for you.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<MessageList
  messages={messages}
  onOpenFile={(_messageId, tool) => setFile(filePreviewFromTool(tool))}
  onChangeFileClick={(_messageId, change) => setFile({ path: change.path })}
/>`,
        },
      },
      {
        title: "Dock it beside the conversation",
        description: (
          <>
            The panel fills its parent, so the layout is yours. On desktop, put
            it in a <Link href="/docs/components/resizable">Resizable</Link> group next
            to the conversation and let the reader drag the split; below{" "}
            <DocsCode>md</DocsCode>, mirror the sidebar — an overlay with a
            scrim. Derive which of the two mounts, so only one panel exists at a
            time.
          </>
        ),
        code: {
          lang: "tsx",
          code: `{/* Desktop: a pane in the workspace group. */}
<ResizablePanel id="preview" defaultSize="35%" minSize="20%" maxSize="60%">
  <FilePreview file={file} onClose={close} className="border-l" />
</ResizablePanel>

{/* Below md: an overlay that slides in over the conversation. */}
<div
  className={cn(
    "absolute inset-y-0 right-0 z-50 w-[min(30rem,100%)] overflow-hidden",
    "bg-background shadow-xl transition-transform duration-300 md:hidden",
    !file && "translate-x-full"
  )}
>
  {file ? <FilePreview file={file} onClose={close} className="border-l" /> : null}
</div>`,
        },
      },
    ],
    notes: [
      {
        title: "Sizing",
        description: (
          <>
            Nothing here is fixed-width: the panel is{" "}
            <DocsCode>h-full w-full</DocsCode> and takes its size from whatever
            holds it. That is why it drops straight into a{" "}
            <Link href="/docs/components/resizable">Resizable</Link> pane — give the
            pane an <DocsCode>id</DocsCode> and the width the reader dragged
            comes back the next time the file opens.
          </>
        ),
      },
      {
        title: "Where the content comes from",
        description: (
          <>
            A transcript carries the diff, not the file — so the{" "}
            <DocsCode>File</DocsCode> view only appears once your app puts the
            post-edit body on <DocsCode>content</DocsCode> (read it from disk,
            or from whatever the agent streamed as{" "}
            <DocsCode>streamContent</DocsCode>/<DocsCode>fileText</DocsCode>,
            which <DocsCode>filePreviewFromTool</DocsCode> picks up). Changed
            lines are verified against that body before they are highlighted: a
            diff that does not line up highlights nothing rather than the wrong
            line.
          </>
        ),
      },
      {
        title: "Truncated diffs",
        description: (
          <>
            Agents cut long patches off mid-hunk. Whatever parses is rendered,
            with a muted note underneath; a patch that yields nothing at all
            leaves the note alone. Nothing here throws on a malformed payload.
          </>
        ),
      },
      {
        title: "Cost",
        description: (
          <>
            One Shiki pass per rendered block (never one per line), rows are
            memoized, and the parse runs behind{" "}
            <DocsCode>useDeferredValue</DocsCode> so a streaming file does not
            re-diff on every chunk. Bodies over ~150k characters skip
            highlighting and render as plain lines, gutter and highlights
            intact.
          </>
        ),
      },
    ],
  },

  "file-icon": {
    title: "File Icon",
    description:
      "Material Icon Theme file glyphs, inlined as SVG: a curated subset resolved by filename, then by extension, with a generic document fallback.",
    registry: "file-icon",
    preview: {
      name: "file-icon-example",
      node: <FileIconExample />,
      align: "stretch",
    },
    usage: `import { FileIcon } from "@/components/ui/file-icon"

export function FileRow({ path }: { path: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[12px]">
      <FileIcon path={path} size={14} />
      {path}
    </span>
  )
}`,
    props: [
      {
        caption: "FileIcon",
        rows: [
          {
            name: "path",
            type: "string",
            required: true,
            description:
              "Full path or bare filename. Only the basename is inspected.",
          },
          {
            name: "size",
            type: "number",
            default: "16",
            description: "Rendered width and height, in px.",
          },
          {
            name: "className",
            type: "string",
            description: (
              <>
                Merged last, after the built-in <DocsCode>shrink-0</DocsCode>.
              </>
            ),
          },
          {
            name: "…props",
            type: "SVGProps<SVGSVGElement>",
            description: (
              <>
                Spread onto the <DocsCode>&lt;svg&gt;</DocsCode>, after{" "}
                <DocsCode>data-slot</DocsCode> — so a host can stamp its own
                slot name or an <DocsCode>aria-label</DocsCode>.
              </>
            ),
          },
        ],
      },
      {
        caption: "Helpers",
        rows: [
          {
            name: "fileIconId",
            type: "(path: string) => FileIconId",
            description: (
              <>
                The icon id a path resolves to — exact filename (
                <DocsCode>package.json</DocsCode>,{" "}
                <DocsCode>Dockerfile</DocsCode>), then filename pattern (
                <DocsCode>.env.local</DocsCode>), then extension, then{" "}
                <DocsCode>&quot;document&quot;</DocsCode>.
              </>
            ),
          },
          {
            name: "ICONS",
            type: "Record<FileIconId, FC<IconProps>>",
            description:
              "Every icon, keyed by id — render one directly when you already know the type.",
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "file-icon",
        description: (
          <>
            The <DocsCode>&lt;svg&gt;</DocsCode> itself. It is{" "}
            <DocsCode>aria-hidden</DocsCode>: the file name beside it is the
            accessible label.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "Add an icon",
        description: (
          <>
            The set is curated, not exhaustive — registry components are copied
            into your app, so growing it is a local edit: drop the SVG path data
            into <DocsCode>ICONS</DocsCode>, then point a filename or extension
            at the new id. Anything unmapped falls back to the document glyph.
          </>
        ),
        code: {
          lang: "tsx",
          code: `const kotlin = makeIcon("0 0 24 24", [["#c087f7", "M3 3h18L3 21z"]])

const ICONS = { ...  , kotlin }

const EXTENSION_MAP: Record<string, FileIconId> = {
  ...  ,
  kt: "kotlin",
  kts: "kotlin",
}`,
        },
      },
      {
        title: "Where it shows up already",
        description: (
          <>
            <DocsCode>MessageToolCall</DocsCode> puts one in front of an
            Edit / Write / Read file name, <DocsCode>ChangeSummary</DocsCode>{" "}
            uses it for every row, <DocsCode>FilePreview</DocsCode> heads the
            panel with it, and <DocsCode>MessageMarkdown</DocsCode> puts it
            inside the file chips it detects in inline code. Install any of
            those and this comes with them.
          </>
        ),
      },
    ],
    notes: [
      {
        title: "Colours are deliberate",
        description: (
          <>
            The brand colours are baked into the path data rather than taken
            from theme tokens: they identify the technology, not the host UI,
            so an icon reads the same in light and dark. Size with{" "}
            <DocsCode>size</DocsCode>; leave the fills alone.
          </>
        ),
      },
      {
        title: "Licensing",
        description: (
          <>
            The SVG path data is copied from{" "}
            <a
              href="https://github.com/PKief/vscode-material-icon-theme"
              target="_blank"
              rel="noreferrer"
            >
              PKief/vscode-material-icon-theme
            </a>
            , MIT licensed (© Material Extensions). The attribution lives in the
            file header — keep it there when you copy the component.
          </>
        ),
      },
      {
        title: "No runtime cost",
        description:
          "Icons are inline SVG in one module: no icon font, no sprite sheet, no network request, and no dependency beyond React and cn().",
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
