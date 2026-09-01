import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { AskQuestionExample } from "@/components/examples/ask-question-example"
import { AskQuestionToolExample } from "@/components/examples/ask-question-tool-example"
import { ChangeSummaryExample } from "@/components/examples/change-summary-example"
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
            <DocsCode>onEditMessage</DocsCode> and{" "}
            <DocsCode>onAskAnswer</DocsCode> — are held at one identity
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
    registryDependencies: ["collapsible", "message-markdown", "ask-question"],
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
        description: "The headline button of one row.",
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

  "change-summary": {
    title: "Change Summary",
    description:
      "The card Cursor shows after a coding turn: file count, a Review action, a few rows with +/- stats, and “Show N more”. Pair it with WorkedFor for the elapsed-time badge.",
    registry: "change-summary",
    registryDependencies: ["collapsible"],
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
            <DocsCode>data</DocsCode>, <DocsCode>text</DocsCode>.
          </>
        ),
      },
      {
        slot: "change-summary-file-icon",
        description: "The per-kind glyph on a row.",
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
            Rows ship on theme tokens so the card survives a re-themed
            light/dark pair — the kind reads from the icon. Each row still
            tags itself with <DocsCode>data-kind</DocsCode>, so opt into colour
            from the outside when you want it.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChangeSummary
  files={files}
  className="[&_[data-kind=code]_svg]:text-primary
             [&_[data-kind=style]_svg]:text-muted-foreground/70"
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
