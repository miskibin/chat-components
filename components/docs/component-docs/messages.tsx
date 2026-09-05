import Link from "next/link"

import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { AskQuestionExample } from "@/components/examples/ask-question-example"
import { AskQuestionToolExample } from "@/components/examples/ask-question-tool-example"
import { AskQuestionStyledExample } from "@/components/examples/ask-question-styled-example"
import { ChangeSummaryActionsExample } from "@/components/examples/change-summary-actions-example"
import { ChangeSummaryExample } from "@/components/examples/change-summary-example"
import { ChangeSummaryStyledExample } from "@/components/examples/change-summary-styled-example"
import { FileIconExample } from "@/components/examples/file-icon-example"
import { FilePreviewActionsExample } from "@/components/examples/file-preview-actions-example"
import { FilePreviewExample } from "@/components/examples/file-preview-example"
import { FilePreviewFocusExample } from "@/components/examples/file-preview-focus-example"
import { FilePreviewImageExample } from "@/components/examples/file-preview-image-example"
import { FilePreviewSplitExample } from "@/components/examples/file-preview-split-example"
import { GenerationStatusExample } from "@/components/examples/generation-status-example"
import { GenerationStatusStyledExample } from "@/components/examples/generation-status-styled-example"
import { MessageActionsExample } from "@/components/examples/message-actions-example"
import { MessageCitationsExample } from "@/components/examples/message-citations-example"
import { MessageExample } from "@/components/examples/message-example"
import { MessageFileActionsExample } from "@/components/examples/message-file-actions-example"
import { MessageListActionsExample } from "@/components/examples/message-list-actions-example"
import { MessageListConversationsExample } from "@/components/examples/message-list-conversations-example"
import { MessageListEmptyExample } from "@/components/examples/message-list-empty-example"
import { MessageListExample } from "@/components/examples/message-list-example"
import { MessageListJumpExample } from "@/components/examples/message-list-jump-example"
import { MessageListStreamingExample } from "@/components/examples/message-list-streaming-example"
import { MessageMarkdownExample } from "@/components/examples/message-markdown-example"
import { MessageMarkdownImagesExample } from "@/components/examples/message-markdown-images-example"
import { MessageMarkdownMermaidExample } from "@/components/examples/message-markdown-mermaid-example"
import { MessageMarkdownStyledExample } from "@/components/examples/message-markdown-styled-example"
import { MessagePartsExample } from "@/components/examples/message-parts-example"
import { MessagePartsOutputExample } from "@/components/examples/message-parts-output-example"
import { MessageProcessExample } from "@/components/examples/message-process-example"
import { PlanCardExample } from "@/components/examples/plan-card-example"
import { MessageQuoteExample } from "@/components/examples/message-quote-example"
import { MessageSenderExample } from "@/components/examples/message-sender-example"
import { MessageStyledExample } from "@/components/examples/message-styled-example"
import { MessageToolImageExample } from "@/components/examples/message-tool-image-example"
import { MessageToolsCollapsedExample } from "@/components/examples/message-tools-collapsed-example"
import { MessageToolsCommandsExample } from "@/components/examples/message-tools-commands-example"
import { MessageToolsStatusExample } from "@/components/examples/message-tools-status-example"
import { MessageToolsTodoExample } from "@/components/examples/message-tools-todo-example"

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
            name: "attachments",
            type: "MessageAttachmentData[]",
            default: "[]",
            description: (
              <>
                Files attached to a user turn —{" "}
                <DocsCode>{"{ id, name, mimeType, url }"}</DocsCode>. Images
                render as thumbnails above the bubble, opening full-size in a
                new tab; other mime types fall back to a named chip. Ignored
                on assistant turns.
              </>
            ),
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
              'Elapsed seconds. Labels the “Worked for 12s” row the thinking and tool parts collapse into once the turn settles.',
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
            type: "(path: string, line?: number) => void",
            description: (
              <>
                Makes the file references inside the answer&apos;s markdown
                clickable — every <DocsCode>MessageMarkdown</DocsCode> in the
                turn gets it. The path arrives without its{" "}
                <DocsCode>:line</DocsCode> suffix, and the line it named
                arrives beside it.
              </>
            ),
          },
          {
            name: "fileActions",
            type: "FileActionItem[]",
            description: (
              <>
                Right-click menu for every file this turn names — the change
                card, the tool rows, the path chips and the images in the
                answer. Keep the array stable; see{" "}
                <DocsCode>ChangeSummary</DocsCode>.
              </>
            ),
          },
          {
            name: "onQuote",
            type: "(text: string) => void",
            description: (
              <>
                Offers a “Quote” pill over a selection inside an assistant
                answer, for dropping the selected text into a composer.
                Assistant turns only.
              </>
            ),
          },
          {
            name: "resolveFileUrl",
            type: "(path: string) => string | undefined",
            description: (
              <>
                Turns a path a tool names into a URL this page can load. Only
                the host knows how the machine&apos;s files reach the browser,
                so this is how a tool row shows an image the agent wrote or
                read instead of its bytes.
              </>
            ),
          },
          {
            name: "resolveFileUrl",
            type: "(path: string) => string | undefined",
            description: (
              <>
                Turns a path a tool names into a URL this page can load. Only
                the host knows how a file on the machine reaches the browser, so
                without it an image an agent wrote or read renders as the
                stand-in line its harness returned. Return{" "}
                <DocsCode>undefined</DocsCode> for anything you cannot serve.
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
            name: "contentClassName",
            type: "string",
            description:
              "Merged onto the bubble (user) or the answer body (assistant).",
          },
        ],
      },
    ],
    dataSlots: [
      "message",
      "message-content",
      "message-quote",
      "message-attachments",
      "message-attachment",
      "message-actions",
      "message-process",
      "message-turn-summary",
    ],
    examples: [
      {
        title: "Right-click any file, click any line",
        description: (
          <>
            One <DocsCode>fileActions</DocsCode> array reaches the change card,
            the tool rows, the path chips and the images — the host decides
            what “open” means and gets the path back. A chip such as{" "}
            <DocsCode>app/page.tsx:42</DocsCode> reports its line through{" "}
            <DocsCode>onFileReferenceClick</DocsCode>, ready for{" "}
            <DocsCode>FilePreview</DocsCode>&apos;s <DocsCode>focusLine</DocsCode>.
          </>
        ),
        example: {
          name: "message-file-actions-example",
          node: <MessageFileActionsExample />,
        },
      },
      {
        title: "Quote a selection",
        description: (
          <>
            Select text inside an assistant answer and a “Quote” pill appears
            over it; <DocsCode>onQuote</DocsCode> receives the selection, for
            a composer to turn into a blockquote.
          </>
        ),
        example: {
          name: "message-quote-example",
          node: <MessageQuoteExample />,
        },
      },
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
            The wrapper stamps <DocsCode>data-sender</DocsCode>, so a single
            selector on an ancestor restyles every user turn and leaves
            assistant answers alone.
          </>
        ),
        example: {
          name: "message-sender-example",
          node: <MessageSenderExample />,
        },
      },
      {
        title: "Attach images to a user turn",
        description: (
          <>
            <DocsCode>url</DocsCode> can be a <DocsCode>data:</DocsCode> URL —
            handy when the composer reads a file with{" "}
            <DocsCode>FileReader</DocsCode> and never needs to upload it
            anywhere just to show a thumbnail.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<Message
  sender="user"
  content="What's wrong with this chart?"
  attachments={[
    { id: "a1", name: "chart.png", mimeType: "image/png", url: dataUrl },
  ]}
/>`,
        },
      },
      {
        title: "Render citations inline",
        description: (
          <>
            <DocsCode>patternHandlers</DocsCode> run over paragraph and list
            text after markdown parsing, so an agent can emit a plain token and
            the UI decides what it becomes — a footnote, a link, a button that
            opens the source. Use a global regex so scanning advances.
          </>
        ),
        example: {
          name: "message-citations-example",
          node: <MessageCitationsExample />,
        },
      },
      {
        title: "Add your own hover actions",
        description: (
          <>
            <DocsCode>actionButtons</DocsCode> fill the row that fades in under
            a turn on hover or focus — retry, feedback, share. Icons inherit the
            built-in size and focus ring, so a custom action is
            indistinguishable from the shipped ones.
          </>
        ),
        example: {
          name: "message-actions-example",
          node: <MessageActionsExample />,
        },
      },
    ],
    notes: [
      {
        title: "How a turn settles",
        description: (
          <>
            While <DocsCode>isAnimating</DocsCode> is true the parts render live
            and flat, in order. When it flips to false everything up to the last
            thinking or tool part folds into one{" "}
            <DocsCode>Worked for 12s</DocsCode> disclosure above the answer —{" "}
            <DocsCode>workedFor</DocsCode> supplies the label, and expanding it
            replays the whole chronological stack. Turns that only produced text
            get no group at all, and an Ask Question nobody has answered yet
            holds the group open so the form stays reachable. The legacy{" "}
            <DocsCode>reasoning</DocsCode> prop and{" "}
            <DocsCode>tools</DocsCode> array land in the same group, so both
            shapes read alike.
          </>
        ),
      },
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
              "Marks the last assistant turn as streaming and shows the generation status while it is still empty.",
          },
          {
            name: "generationStage",
            type: '"thinking" | "searching" | "responding" | "idle"',
            default: '"idle"',
            description: "Label for that status.",
          },
          {
            name: "generationLabel",
            type: "string",
            description: (
              <>
                Replaces the stage word while the turn is still empty — for a
                backend that can say something more useful than “Thinking”
                (“Loading qwen3:8b into memory”). Drop it as soon as real
                output arrives.
              </>
            ),
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
            type: "(messageId: string, path: string, line?: number) => void",
            description: (
              <>
                Fired when a file chip inside an answer&apos;s markdown is
                clicked, with the line the chip named — see{" "}
                <DocsCode>MessageMarkdown</DocsCode>.
              </>
            ),
          },
          {
            name: "fileActions",
            type: "FileActionItem[]",
            description: (
              <>
                Right-click menu for every file the transcript names — change
                cards, tool rows, path chips and images. Handed to the memoized
                rows by reference, so keep the array stable.
              </>
            ),
          },
          {
            name: "onQuote",
            type: "(messageId: string, text: string) => void",
            description:
              "A selection quoted out of an assistant answer, for the composer. Stabilized like the other callbacks.",
          },
          {
            name: "resolveFileUrl",
            type: "(path: string) => string | undefined",
            description: (
              <>
                Turns a path a tool names into a URL the page can load —
                forwarded to every row so an image the agent wrote or read
                renders as a picture. Stabilized internally.
              </>
            ),
          },
          {
            name: "resolveFileUrl",
            type: "(path: string) => string | undefined",
            description: (
              <>
                Turns a path a tool names into a URL this page can load. Only
                the host knows how a file on the machine reaches the browser, so
                without it an image an agent wrote or read renders as the
                stand-in line its harness returned. Return{" "}
                <DocsCode>undefined</DocsCode> for anything you cannot serve.
              </>
            ),
          },
          {
            name: "renderActions",
            type: "(message: ChatMessageData) => React.ReactNode",
            description: (
              <>
                Rendered under each settled turn — copy, retry, feedback. It
                runs outside the memoized row, so the buttons always carry what
                the caller knows on this render rather than the closure the row
                last froze.
              </>
            ),
          },
          {
            name: "conversationKey",
            type: "string",
            description: (
              <>
                Identifies the conversation on screen. Pass it whenever one
                mounted list shows several transcripts in turn: on a change the
                list stops following the chat that was left and jumps to the end
                of the one just opened.
              </>
            ),
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
        ],
      },
      {
        caption: "useChatAutoScroll(messages, conversationKey?)",
        rows: [
          {
            name: "conversationKey",
            type: "string",
            description:
              "Optional argument, not a returned value: the conversation these messages belong to. On a change the hook forgets the reader's scroll position — it was formed in the chat they just left — and follows the new transcript from its end.",
          },
          {
            name: "scrollRef",
            type: "RefObject<HTMLDivElement>",
            description: "Attach to your own scroll container.",
          },
          {
            name: "contentRef",
            type: "RefObject<HTMLDivElement>",
            description:
              "Attach to the box inside it that actually holds the messages. Height that arrives after the last message — a mermaid diagram mounting, Shiki replacing a plain block, an image loading — re-pins a reader who is still following, which a message-keyed effect alone cannot see.",
          },
          {
            name: "handleMessageScroll",
            type: "() => void",
            description:
              "Call from onScroll. Re-arms following when the reader returns to the bottom.",
          },
          {
            name: "atBottom",
            type: "boolean",
            description:
              "Whether the reader is at (or within a few pixels of) the bottom — what shows and hides the jump button.",
          },
          {
            name: "scrollToBottom",
            type: "() => void",
            description:
              "Smooth-scrolls to the end and re-arms following.",
          },
        ],
      },
    ],
    dataSlots: [
      "message-list",
      "message-list-item",
      "message-list-jump",
    ],
    notes: [
      {
        title: "Streaming cost",
        description: (
          <>
            Turn rows are memoized — the message and everything under it —
            and the callbacks you pass —{" "}
            <DocsCode>onEditMessage</DocsCode>,{" "}
            <DocsCode>onAskAnswer</DocsCode>, <DocsCode>onOpenFile</DocsCode>,{" "}
            <DocsCode>onChangeFileClick</DocsCode>,{" "}
            <DocsCode>onFileReferenceClick</DocsCode> and{" "}
            <DocsCode>onReviewChanges</DocsCode> — are held at one identity
            internally, so a parent that re-renders on each streamed token only
            reaches the row whose message object actually changed. Distant
            rows also use <DocsCode>content-visibility</DocsCode>, so the browser
            can skip their layout and paint work. Keep the
            message objects themselves stable (patch the streaming turn, map the
            rest through) and the list stays flat as it grows.{" "}
            <DocsCode>renderActions</DocsCode> is the deliberate exception: it
            is rendered beside each row rather than inside the memo, so keep it
            cheap — the actions of every settled turn re-render with their
            caller, which is also what keeps them from firing a stale closure.
          </>
        ),
      },
      {
        title: "Auto-scroll",
        description: (
          <>
            Following is coalesced into one animation frame, so a burst of
            tokens schedules one scroll rather than dozens. Growing text tracks
            the bottom instantly; a whole new message animates. Follow state
            belongs to one conversation, so a list that swaps transcripts
            without remounting should pass <DocsCode>conversationKey</DocsCode>.
          </>
        ),
      },
    ],
    examples: [
      {
        title: "Jump back to the bottom",
        description: (
          <>
            Scroll up and a round button appears over the end of the list —
            while a turn streams too, which is the point. Clicking it scrolls
            down and re-arms following. It carries{" "}
            <DocsCode>data-slot=&quot;message-list-jump&quot;</DocsCode> and{" "}
            <DocsCode>data-visible</DocsCode>.
          </>
        ),
        example: {
          name: "message-list-jump-example",
          node: <MessageListJumpExample />,
          align: "stretch",
        },
      },
      {
        title: "Per-message actions",
        description: (
          <>
            <DocsCode>renderActions</DocsCode> is skipped while a turn is
            still streaming or has an open question, and rendered outside the
            memoized row — so a button clicked on a settled turn runs the
            handler the caller has now, not the one that row first saw.
          </>
        ),
        example: {
          name: "message-list-actions-example",
          node: <MessageListActionsExample />,
        },
      },
      {
        title: "Switching conversations",
        description: (
          <>
            One mounted list, two transcripts. <DocsCode>conversationKey</DocsCode>{" "}
            is what tells it they are different conversations: scroll up in one,
            switch, and the other opens at its newest turn instead of inheriting
            a scroll position that was never its own.
          </>
        ),
        example: {
          name: "message-list-conversations-example",
          node: <MessageListConversationsExample />,
          align: "stretch",
        },
      },
      {
        title: "Streaming a turn in",
        description: (
          <>
            Pass <DocsCode>isGenerating</DocsCode> and grow the last
            message&apos;s <DocsCode>content</DocsCode>. Until the first token
            lands the list shows the generation dot where the answer will
            appear, and it keeps itself pinned to the bottom unless the reader
            scrolls away.
          </>
        ),
        example: {
          name: "message-list-streaming-example",
          node: <MessageListStreamingExample />,
        },
      },
      {
        title: "Wider measure and an empty state",
        description: (
          <>
            <DocsCode>emptyState</DocsCode> replaces the whole column while
            there are no messages. The measure lives on the list&apos;s inner
            wrapper, so <DocsCode>[&amp;&gt;div]</DocsCode> widens it past the
            default <DocsCode>max-w-3xl</DocsCode>.
          </>
        ),
        example: {
          name: "message-list-empty-example",
          node: <MessageListEmptyExample />,
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
      "change-summary",
      "file-icon",
      "todo-list",
    ],
    preview: { name: "message-parts-example", node: <MessagePartsExample /> },
    usage: `import {
  MessageArtifact,
  MessageCode,
  MessageProcess,
  MessageReasoning,
  MessageToolCalls,
} from "@/components/ui/message-parts"

export function Answer() {
  return (
    <>
      <MessageProcess seconds={12}>
        <MessageReasoning duration={7}>Checking the reducer…</MessageReasoning>
        <MessageToolCalls tools={tools} />
      </MessageProcess>
      <MessageCode block={{ language: "ts", code: source }} />
      <MessageArtifact artifact={{ id: "a1", title: "coverage.csv" }} />
    </>
  )
}`,
    props: [
      {
        caption: "MessageProcess",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description:
              "The turn's chronological thinking and tool stack, in render order.",
          },
          {
            name: "seconds",
            type: "number",
            description: 'Elapsed time — becomes the “Worked for 12s” label.',
          },
          {
            name: "label",
            type: "React.ReactNode",
            description: (
              <>
                Overrides the derived label. Without either prop the row reads
                &ldquo;Worked for a while&rdquo;.
              </>
            ),
          },
          {
            name: "streaming",
            type: "boolean",
            default: "false",
            description:
              "True while the turn is still arriving: the stack stays open and the trigger is withheld, so live parts read as a flat list. When it flips to false the group folds into the labelled row.",
          },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "false",
            description:
              "Keep the stack expanded once the turn settles, instead of collapsing it.",
          },
        ],
      },
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
            name: "fileActions",
            type: "FileActionItem[]",
            description:
              "Right-click menu on a row that names a file — same actions as the change-summary card. MessageToolCalls forwards it to every row.",
          },
          {
            name: "resolveFileUrl",
            type: "(path: string) => string | undefined",
            description: (
              <>
                Turns a path a tool names into a URL this page can load. Only
                the host knows how a file on the machine reaches the browser, so
                without it an image an agent wrote or read renders as the
                stand-in line its harness returned. Return{" "}
                <DocsCode>undefined</DocsCode> for anything you cannot serve.
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
        caption: "Helpers",
        rows: [
          {
            name: "summarizeCommand",
            type: "(command: string) => { display: string; label: string }",
            description: (
              <>
                What a shell row&apos;s headline says.{" "}
                <DocsCode>display</DocsCode> is the command with the
                harness&apos;s wrapper peeled off —{" "}
                <DocsCode>/bin/zsh -lc &apos;cd /repo &amp;&amp; npm test&apos;</DocsCode>{" "}
                reads <DocsCode>npm test</DocsCode> — and{" "}
                <DocsCode>label</DocsCode> is how it is named (“Ran npm test”).
                The full command stays in the expanded body and the title.
              </>
            ),
          },
          {
            name: "isImagePath",
            type: "(path?: string) => boolean",
            description:
              "True for a file whose bytes are a picture — png, jpeg, gif, webp, avif, bmp, ico, svg.",
          },
          {
            name: "imageDimensions",
            type: "(output?: string) => string | null",
            description: (
              <>
                <DocsCode>1531×889</DocsCode> out of the stand-in text a Read
                tool returns for an image.
              </>
            ),
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
        ],
      },
      {
        caption: "MessageAttachments",
        rows: [
          {
            name: "attachments",
            type: "MessageAttachmentData[]",
            required: true,
            description: (
              <>
                <DocsCode>{"{ id, name, mimeType, url }"}</DocsCode> per file.
                Images render as a thumbnail linking to the full-size{" "}
                <DocsCode>url</DocsCode>; anything else is a named chip.
              </>
            ),
          },
          { name: "className", type: "string", description: "Merged last." },
        ],
      },
      {
        caption: "Image helpers",
        rows: [
          {
            name: "isImagePath(path)",
            type: "(path?: string) => boolean",
            description:
              "True for the extensions a browser can paint — png, jpg, jpeg, gif, webp, avif, bmp, ico, svg. It is what a tool row and a file panel agree on, so both decide the same way about the same file.",
          },
          {
            name: "imageDimensions(output)",
            type: "(output?: string) => string | null",
            description: (
              <>
                Pulls <DocsCode>1531x889 px</DocsCode> out of the stand-in text
                a Read of an image returns, as{" "}
                <DocsCode>1531×889</DocsCode>, for the row&apos;s meta line.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "message-process",
      "message-process-trigger",
      "message-process-content",
      "message-reasoning",
      "message-reasoning-trigger",
      "message-reasoning-content",
      "message-tool-call",
      "message-tool-call-trigger",
      "message-tool-call-header",
      "message-tool-call-chevron",
      "message-tool-call-body",
      "message-tool-calls",
      "message-tool-calls-trigger",
      "message-tool-list",
      "message-tool-stats",
      "file-icon",
      "ask-question",
      "message-tool-diff",
      "message-tool-diff-line",
      "message-tool-file",
      "message-tool-file-line",
      "message-tool-image",
      "message-tool-image-error",
      "message-tool-show-all",
      "message-code",
      "message-code-header",
      "message-code-copy",
      "message-artifact",
      "message-artifact-trigger",
      "message-artifact-content",
      "message-attachments",
      "message-attachment",
    ],
    examples: [
      {
        title: "Shell rows say what ran",
        description: (
          <>
            A harness wraps commands in its own shell — the row unwraps them
            and drops a leading <DocsCode>cd</DocsCode>, so the headline reads
            “Ran npm test” rather than <DocsCode>/bin/zsh -lc …</DocsCode>.
            Expand a row for the untouched command.
          </>
        ),
        example: {
          name: "message-tools-commands-example",
          node: <MessageToolsCommandsExample />,
        },
      },
      {
        title: "An image the agent touched",
        description: (
          <>
            A harness hands back a line about the bytes when it reads a picture
            — <DocsCode>image/png image, 420x180 px</DocsCode> — which is all
            the row can show on its own. Give it{" "}
            <DocsCode>resolveFileUrl</DocsCode> and it shows the picture
            instead, with those dimensions moved up to the meta line;{" "}
            <DocsCode>FilePreview</DocsCode> does the same from{" "}
            <DocsCode>imageSrc</DocsCode>. Both are URLs rather than paths on
            purpose: how a file on the machine reaches the browser is the one
            thing only your app knows. A URL that fails to load falls back to a
            line of text, never a broken frame.
          </>
        ),
        example: {
          name: "message-tool-image-example",
          node: <MessageToolImageExample />,
          align: "stretch" as const,
        },
      },
      {
        title: "Collapse a finished turn",
        description: (
          <>
            <DocsCode>MessageProcess</DocsCode> is the shape a settled turn
            takes: everything it did before answering behind one{" "}
            <DocsCode>Worked for 12s</DocsCode> row.{" "}
            <DocsCode>streaming</DocsCode> is the whole state machine — true
            while the run is live (open, unlabelled, reading as a flat stack),
            false once it settles (collapsed, labelled).{" "}
            <DocsCode>Message</DocsCode> wires this for you from{" "}
            <DocsCode>isAnimating</DocsCode> and{" "}
            <DocsCode>workedFor</DocsCode>; mount it yourself only in a custom
            turn layout.
          </>
        ),
        example: {
          name: "message-process-example",
          node: <MessageProcessExample />,
        },
      },
      {
        title: "Style by tool status",
        description: (
          <>
            Every row stamps <DocsCode>data-status</DocsCode>, so failures and
            running states are themed from an ancestor without the component
            knowing your palette.
          </>
        ),
        example: {
          name: "message-tools-status-example",
          node: <MessageToolsStatusExample />,
        },
      },
      {
        title: "The useful half of a tool call",
        description: (
          <>
            An expanded row shows what the tool was asked and what it said —
            never the raw argument blob. The command loses its{" "}
            <DocsCode>/bin/zsh -lc</DocsCode> wrapper and gets its own block,
            the arguments left over are listed as pairs (the model&rsquo;s own{" "}
            <DocsCode>description</DocsCode> is not one of them), and the output
            is stripped of{" "}
            <DocsCode>&lt;system-reminder&gt;</DocsCode> blocks and terminal
            colour, pretty-printed when it is JSON, and capped with a{" "}
            &ldquo;show all&rdquo; break. An{" "}
            <DocsCode>mcp__server__tool</DocsCode> name reads as{" "}
            <DocsCode>server · tool</DocsCode>.
          </>
        ),
        example: {
          name: "message-parts-output-example",
          node: <MessagePartsOutputExample />,
        },
      },
      {
        title: "Plans, not payloads",
        description: (
          <>
            A tool whose name says todo or plan is read as a checklist:{" "}
            <DocsCode>todo_write</DocsCode>, <DocsCode>TodoWrite</DocsCode>,{" "}
            <DocsCode>write_todos</DocsCode>, <DocsCode>update_plan</DocsCode>.
            The headline counts the plan instead of guessing a file was
            written, and the body renders{" "}
            <DocsCode>TodoList</DocsCode> rather than the raw arguments. For the
            same plan as a live bar above the composer, see{" "}
            <DocsCode>TodoPanel</DocsCode>.
          </>
        ),
        example: {
          name: "message-tools-todo-example",
          node: <MessageToolsTodoExample />,
        },
      },
      {
        title: "Collapse thresholds",
        description: (
          <>
            A stack folds behind one summary line once it reaches{" "}
            <DocsCode>collapseAt</DocsCode> rows (three by default), and{" "}
            <DocsCode>defaultOpen</DocsCode> decides how it starts. Both stacks
            below hold the same six calls.
          </>
        ),
        example: {
          name: "message-tools-collapsed-example",
          node: <MessageToolsCollapsedExample />,
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
        ],
      },
    ],
    dataSlots: [
      "ask-question",
      "ask-question-trigger",
      "ask-question-form",
      "ask-question-item",
      "ask-question-prompt",
      "ask-question-group",
      "ask-question-option",
      "ask-question-indicator",
      "ask-question-other",
      "ask-question-actions",
      "ask-question-skip",
      "ask-question-submit",
      "ask-question-summary",
    ],
    examples: [
      {
        title: "Restyle the selected option",
        description: (
          <>
            Selected options carry{" "}
            <DocsCode>data-state=&quot;checked&quot;</DocsCode>, and the card,
            the submit button, and every fieldset have their own slots — so the
            questionnaire wears your accent without a fork.{" "}
            <DocsCode>hideOther</DocsCode> drops the free-text field,{" "}
            <DocsCode>skipLabel</DocsCode> and{" "}
            <DocsCode>submitLabel</DocsCode> rename the buttons.
          </>
        ),
        example: {
          name: "ask-question-styled-example",
          node: <AskQuestionStyledExample />,
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

  "plan-card": {
    title: "Plan Card",
    description:
      "The plan a harness wrote before it started work — its markdown, its checklist, and the one Build button that moves the conversation on.",
    registry: "plan-card",
    registryDependencies: ["message-markdown", "todo-list"],
    preview: { name: "plan-card-example", node: <PlanCardExample /> },
    usage: `"use client"

import { MessageList } from "@/components/ui/message-list"

export function Thread() {
  return (
    <MessageList
      messages={messages}
      // Only the newest plan gets the button; the list handles that.
      onPlanBuild={(messageId, toolId) => build(messageId, toolId)}
    />
  )
}`,
    props: [
      {
        caption: "PlanCard",
        rows: [
          {
            name: "plan",
            type: "PlanData",
            required: true,
            description: (
              <>
                <DocsCode>{"{ title?, overview?, body, todos? }"}</DocsCode>.{" "}
                <DocsCode>body</DocsCode> is markdown;{" "}
                <DocsCode>parsePlan</DocsCode> builds one from a tool
                call&rsquo;s arguments.
              </>
            ),
          },
          {
            name: "onBuild",
            type: "() => void",
            description:
              "Renders the Build button. Omit it and the card is a plain record of what was proposed — which is what every plan but the newest one is.",
          },
          {
            name: "buildLabel",
            type: "string",
            default: '"Build"',
            description: "Label on the action.",
          },
          {
            name: "busy",
            type: "boolean",
            default: "false",
            description:
              "Locks the action while the turn that carries the plan out is starting.",
          },
        ],
      },
      {
        caption: "Helpers",
        rows: [
          {
            name: "parsePlan",
            type: "(input?: string | null) => PlanData | null",
            description:
              "The plan inside a tool call's arguments — null for anything else, and for a half-streamed blob, so a row only becomes a card once the whole plan has landed.",
          },
          {
            name: "isPlanToolName",
            type: "(name: string) => boolean",
            description:
              "A tool name carrying the word plan — ExitPlanMode, create_plan, update_plan.",
          },
          {
            name: "hasWrittenPlan",
            type: "(tool: { name, input? }) => boolean",
            description:
              "Both of the above at once. Message uses it to keep a plan out of the collapsed process stack.",
          },
        ],
      },
    ],
    dataSlots: [
      "plan-card",
      "plan-card-header",
      "plan-card-title",
      "plan-card-count",
      "plan-card-body",
      "plan-card-overview",
      "plan-card-todos",
      "plan-card-actions",
      "plan-card-build",
    ],
    examples: [
      {
        title: "It is the answer, not the process",
        description: (
          <>
            A <DocsCode>MessageToolCall</DocsCode> whose arguments parse as a
            plan renders this card instead of a disclosure row, and{" "}
            <DocsCode>Message</DocsCode> keeps a trailing plan out of the
            &ldquo;Worked for 12s&rdquo; group — a proposal folded away is a
            proposal nobody acts on. Press Build here to see what the host is
            handed.
          </>
        ),
        example: { name: "plan-card-example", node: <PlanCardExample /> },
      },
    ],
  },

  "message-markdown": {
    title: "Message Markdown",
    description:
      "Streamdown renderer tuned for streaming answers: GFM, Shiki code, Mermaid diagrams, and KaTeX math, with incomplete markdown parsed safely.",
    registry: "message-markdown",
    registryDependencies: ["file-icon", "change-summary"],
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
            type: "(path: string, line?: number) => void",
            description: (
              <>
                Makes every detected file chip a button. The path arrives with
                any <DocsCode>:line:col</DocsCode> suffix stripped, and the line
                beside it. Keep the handler stable — it is read through context
                so the inline renderer stays memoized while text streams.
              </>
            ),
          },
          {
            name: "fileActions",
            type: "FileActionItem[]",
            description: (
              <>
                Right-click menu on the file chips and on the images the answer
                renders (a <DocsCode>data:</DocsCode> image gets none — it is
                not a file). Read through the same context; keep it stable.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "message-markdown",
      "message-file-ref",
      "message-markdown-image",
      "file-context-menu",
      "file-icon",
    ],
    examples: [
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
          code: `<MessageMarkdown onFileClick={(path, line) => setPreviewFile({ path, focusLine: line })}>
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
            theme follows the resolved next-themes value, so a diagram flips
            with the page.
          </>
        ),
        example: {
          name: "message-markdown-mermaid-example",
          node: <MessageMarkdownMermaidExample />,
        },
      },
      {
        title: "Inline images",
        description: (
          <>
            Images render from <DocsCode>http</DocsCode>,{" "}
            <DocsCode>https</DocsCode> and <DocsCode>data:</DocsCode> sources, so
            a screenshot or chart an agent hands back as base64 shows up in the
            answer instead of vanishing. The hardening pass still narrows{" "}
            <DocsCode>data:</DocsCode> to <DocsCode>data:image/*</DocsCode>, and{" "}
            <DocsCode>message-markdown.css</DocsCode> keeps every image inside
            the message column.
          </>
        ),
        example: {
          name: "message-markdown-images-example",
          node: <MessageMarkdownImagesExample />,
        },
      },
      {
        title: "Restyle the prose",
        description: (
          <>
            The wrapper carries <DocsCode>data-slot=&quot;message-markdown&quot;</DocsCode>{" "}
            and everything inside it is ordinary HTML, so element selectors from
            an ancestor retune the measure, the headings, and the quotes.
          </>
        ),
        example: {
          name: "message-markdown-styled-example",
          node: <MessageMarkdownStyledExample />,
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
    registryDependencies: ["collapsible", "context-menu", "file-icon"],
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
            name: "fileActions",
            type: "FileActionItem[]",
            description: (
              <>
                Right-click menu on every row — open in an editor, reveal in
                the file manager, copy the path. Each action gets the row&apos;s
                path back. Keep the array stable: the rows are memoized.
              </>
            ),
          },
          {
            name: "previewCount",
            type: "number",
            default: "4",
            description: "How many rows to show before “Show N more”.",
          },
        ],
      },
      {
        caption: "FileActionItem",
        rows: [
          {
            name: "id / label / icon",
            type: "string / string / React.ReactNode",
            description: "One menu entry.",
          },
          {
            name: "onSelect",
            type: "(path: string) => void",
            required: true,
            description: "Called with the path of the file the menu was opened on.",
          },
          {
            name: "destructive / separatorBefore",
            type: "boolean",
            description: "Red text for the entry; a rule above it.",
          },
        ],
      },
      {
        caption: "FileContextMenu",
        rows: [
          {
            name: "path",
            type: "string",
            required: true,
            description: (
              <>
                Wraps any trigger in the same menu the rows use —{" "}
                <DocsCode>FilePreview</DocsCode> and{" "}
                <DocsCode>MessageMarkdown</DocsCode> share it. With no{" "}
                <DocsCode>actions</DocsCode> the child renders untouched.
              </>
            ),
          },
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
        ],
      },
    ],
    dataSlots: [
      "change-summary",
      "change-summary-header",
      "change-summary-action",
      "change-summary-list",
      "change-summary-rest",
      "change-summary-file",
      "change-summary-file-icon",
      "change-summary-stats",
      "change-summary-more",
      "file-context-menu",
      "worked-for",
    ],
    examples: [
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
        title: "Right-click a row",
        description: (
          <>
            <DocsCode>fileActions</DocsCode> puts a context menu on every row.
            The card only shows the menu; what “open” or “reveal” means on this
            machine is the host&apos;s call, which is why each action is handed the
            path and nothing else.
          </>
        ),
        example: {
          name: "change-summary-actions-example",
          node: <ChangeSummaryActionsExample />,
        },
      },
      {
        title: "Preview count and styling",
        description: (
          <>
            <DocsCode>previewCount</DocsCode> decides how many rows show before
            the &ldquo;Show N more&rdquo; toggle, <DocsCode>onAction</DocsCode>{" "}
            turns the header label into a button, and{" "}
            <DocsCode>onFileClick</DocsCode> turns every row into one. Rows,
            stats, and the header each have a slot, so the card can go monospace
            or take a tint without a fork; the glyph is a{" "}
            <DocsCode>FileIcon</DocsCode>, whose brand colours are fixed on
            purpose, while each row also tags itself with{" "}
            <DocsCode>data-kind</DocsCode> — <DocsCode>code</DocsCode>,{" "}
            <DocsCode>style</DocsCode>, <DocsCode>data</DocsCode>,{" "}
            <DocsCode>text</DocsCode> — so opt into colour from the outside when
            you want it.
          </>
        ),
        example: {
          name: "change-summary-styled-example",
          node: <ChangeSummaryStyledExample />,
        },
      },
    ],
    notes: [
      {
        title: "Where it appears",
        description: (
          <>
            After a turn finishes, <DocsCode>Message</DocsCode> renders this
            card under the answer. The elapsed time goes the other way:{" "}
            <DocsCode>workedFor</DocsCode> labels the process disclosure above
            the answer (see <DocsCode>MessageProcess</DocsCode>), and{" "}
            <DocsCode>WorkedFor</DocsCode> stays exported for the badge on its
            own — a turn header, a run list, your own layout.
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
    registryDependencies: ["message-parts", "file-icon", "change-summary", "dropdown-menu"],
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
                <DocsCode>diff</DocsCode>. The default is settled when the body
                actually arrives, so a host that shows the diff first and
                fetches the text after still lands in the File view. The toggle
                only appears when both views are possible.
              </>
            ),
          },
          {
            name: "diffLayout / defaultDiffLayout / onDiffLayoutChange",
            type: '"unified" | "split"',
            default: '"unified"',
            description: (
              <>
                Side-by-side or one column, controlled or not. The header shows
                the toggle only in the diff view; a run of removed lines
                followed by added ones pairs up row by row on the two sides.
              </>
            ),
          },
          {
            name: "wrap / defaultWrap / onWrapChange",
            type: "boolean",
            default: "true",
            description:
              "Soft-wrap long lines. Off, the body scrolls sideways instead — in both views and both layouts.",
          },
          {
            name: "actions",
            type: "FileActionItem[]",
            description: (
              <>
                Right-click menu on the header, and the same items behind a
                kebab button — open in an editor, reveal, copy the path. The
                type lives in <DocsCode>change-summary</DocsCode>; keep the
                array stable.
              </>
            ),
          },
          {
            name: "onCopyPath",
            type: "(path: string) => void",
            description: (
              <>
                Clicking the path in the header copies it. Set this to copy
                something else — an absolute path — instead of the built-in
                clipboard write; the “Copied” state shows either way.
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
            name: "imageSrc",
            type: "string",
            description: (
              <>
                A URL this page can load the file&apos;s picture from. Set it
                and the panel shows the image instead of a text body — the
                bytes of a <DocsCode>.png</DocsCode> have nothing to show in a
                line-numbered view. Only the host knows how a path on the
                machine reaches the browser, which is why this is a URL and not
                a path.
              </>
            ),
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
          {
            name: "focusLine",
            type: "number",
            description: (
              <>
                1-based line of the File view to centre and mark — where a{" "}
                <DocsCode>file.ts:42</DocsCode> reference pointed. Outranks the
                first changed line, and opens the File view as soon as there is
                content — including when the content lands after the path. A
                line past the render cap reveals the whole file.
              </>
            ),
          },
          {
            name: "focusNonce",
            type: "number",
            description: (
              <>
                Bump it to ask for the same <DocsCode>focusLine</DocsCode>{" "}
                again. Centring happens once per request, so clicking one{" "}
                <DocsCode>file.ts:42</DocsCode> chip a second time after
                scrolling away only re-centres if the host says it is a new
                request — this is how it says so.
              </>
            ),
          },
          {
            name: "imageSrc",
            type: "string",
            description: (
              <>
                A URL the page can load this file&apos;s picture from. Set it
                for an image and the panel shows the picture instead of a text
                body — only the host knows how a path on the machine reaches
                the browser. <DocsCode>filePreviewFromTool</DocsCode> leaves an
                image&apos;s stand-in text out so the host can fill this in.
              </>
            ),
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
      "file-preview",
      "file-preview-header",
      "file-preview-path",
      "file-preview-stats",
      "file-preview-view-toggle",
      "file-preview-prefs",
      "file-preview-layout-toggle",
      "file-preview-wrap-toggle",
      "file-preview-actions",
      "file-preview-close",
      "file-preview-body",
      "file-preview-image",
      "file-preview-line",
      "file-preview-side",
      "file-preview-gutter",
      "file-preview-note",
      "file-preview-show-all",
      "file-icon",
    ],
    examples: [
      {
        title: "Split view and wrapping",
        description: (
          <>
            The two preferences in the header — side-by-side against unified,
            and soft-wrap against a sideways scroll — are controlled here so
            the host can remember them. Removed and added runs pair up row by
            row; a longer side leaves the other cell empty.
          </>
        ),
        example: {
          name: "file-preview-split-example",
          node: <FilePreviewSplitExample />,
          align: "stretch",
        },
      },
      {
        title: "Actions, copy path, focus line",
        description: (
          <>
            <DocsCode>actions</DocsCode> puts a menu on the header — right-click
            it, or use the kebab — and clicking the path copies it.{" "}
            <DocsCode>focusLine</DocsCode> centres and marks a line the host
            wants you to see, ahead of the first edit.
          </>
        ),
        example: {
          name: "file-preview-actions-example",
          node: <FilePreviewActionsExample />,
          align: "stretch",
        },
      },
      {
        title: "A line to land on, in a file too long to render",
        description: (
          <>
            An app that opens the panel from a <DocsCode>file.ts:412</DocsCode>{" "}
            reference has the path before it has the body, so the view a{" "}
            <DocsCode>focusLine</DocsCode> asks for is settled when the text
            actually lands. Long files render 300 rows behind{" "}
            <DocsCode>Show all N lines</DocsCode> — except when the line to
            centre on lies past that, which reveals the rest. Bump{" "}
            <DocsCode>focusNonce</DocsCode> to ask for the same line twice.
          </>
        ),
        example: {
          name: "file-preview-focus-example",
          node: <FilePreviewFocusExample />,
          align: "stretch",
        },
      },
      {
        title: "An image instead of text",
        description: (
          <>
            A chart the agent rendered has no text to show. Hand the panel an{" "}
            <DocsCode>imageSrc</DocsCode> — a route on your origin that serves
            the file, a data URL — and it shows the picture, letterboxed in the
            body.
          </>
        ),
        example: {
          name: "file-preview-image-example",
          node: <FilePreviewImageExample />,
          align: "stretch",
        },
      },
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
            intact. The File view also stops at 300 rows behind a{" "}
            <DocsCode>Show all N lines</DocsCode> button — a whole file can be
            a megabyte of them — and opens uncapped when the line it has been
            asked to centre on lies past that.
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
    dataSlots: ["file-icon"],
    examples: [
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
    ],
    notes: [
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
      "A single breathing dot with an optional label, for the gap between sending a message and the first token.",
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
                Shows the indicator. Prefer this over{" "}
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
              "Legacy stage. Any non-idle stage shows the indicator and supplies a default label.",
          },
          {
            name: "label",
            type: "string",
            description: "Overrides the stage label. Omit for a bare dot.",
          },
          {
            name: "size",
            type: "number",
            default: "16",
            description:
              "Indicator box size in pixels; the dot fills half of it.",
          },
        ],
      },
    ],
    dataSlots: [
      "generation-status",
      "generation-status-spinner",
      "generation-status-label",
    ],
    examples: [
      {
        title: "Recolor, resize, hold it still",
        description: (
          <>
            <DocsCode>size</DocsCode> scales the box and the dot together, and
            the wrapper and the dot each carry a slot. The pulse is a CSS
            animation behind <DocsCode>motion-safe</DocsCode>, so it is already
            off for readers who asked for less motion — no timer, no frame
            state; drop it for everyone by overriding the animation.
          </>
        ),
        example: {
          name: "generation-status-styled-example",
          node: <GenerationStatusStyledExample />,
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
            turn is still empty, the dot sits where the answer will land. You
            only mount it yourself in custom layouts.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
