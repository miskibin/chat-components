import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { ChatExample } from "@/components/examples/chat-example"
import { ChatInputCustomButtonExample } from "@/components/examples/chat-input-custom-button-example"
import { ChatInputExample } from "@/components/examples/chat-input-example"
import { ChatInputStyledExample } from "@/components/examples/chat-input-styled-example"
import { ChatInputToolsExample } from "@/components/examples/chat-input-tools-example"
import { ChatInputGeneratingExample } from "@/components/examples/chat-input-generating-example"
import { ChatInputHandleExample } from "@/components/examples/chat-input-handle-example"
import { ChatInputMentionsExample } from "@/components/examples/chat-input-mentions-example"
import { ChatInputPasteExample } from "@/components/examples/chat-input-paste-example"
import { ChatInputQueueExample } from "@/components/examples/chat-input-queue-example"
import { ChatNavbarExample } from "@/components/examples/chat-navbar-example"
import { ChatNavbarStyledExample } from "@/components/examples/chat-navbar-styled-example"
import { PromptSuggestionsExample } from "@/components/examples/prompt-suggestions-example"
import { PromptSuggestionsStyledExample } from "@/components/examples/prompt-suggestions-styled-example"
import { TodoListChecklistExample } from "@/components/examples/todo-list-checklist-example"
import { TodoListComposerExample } from "@/components/examples/todo-list-composer-example"
import { TodoListSettledExample } from "@/components/examples/todo-list-settled-example"
import { TodoListExample } from "@/components/examples/todo-list-example"
import { ResizableExample } from "@/components/examples/resizable-example"

export const chatDocs = {
  chat: {
    title: "Chat",
    description:
      "Starter block that opens centered — greeting, composer, suggestions — and settles into the message list once the first message is sent.",
    registry: "chat",
    registryDependencies: [
      "chat-input",
      "prompt-suggestions",
      "message-list",
      "model-picker",
      "mode-picker",
      "chat-sidebar",
      "chat-navbar",
      "theme-toggle",
    ],
    preview: { name: "chat-example", node: <ChatExample />, align: "stretch" },
    usage: `import { Chat } from "@/components/chat"

export default function Page() {
  return (
    <div className="h-svh">
      <Chat />
    </div>
  )
}`,
    props: [
      {
        caption: "Chat",
        rows: [
          {
            name: "greeting",
            type: "React.ReactNode",
            default: '"How can I help?"',
            description:
              "Headline above the centered composer while the conversation is empty. It disappears with the first message.",
          },
          {
            name: "suggestions",
            type: "PromptSuggestion[]",
            description: (
              <>
                Starter prompts listed under the centered composer; picking one
                sends it. Defaults to three generic starters, and{" "}
                <DocsCode>[]</DocsCode> hides the list.
              </>
            ),
          },
          {
            name: "className",
            type: "string",
            description:
              "Merged last onto the flex column. The block fills its parent, so give that parent a height.",
          },
        ],
      },
    ],
    dataSlots: [
      "chat",
      "chat-greeting",
      "chat-composer",
    ],
    examples: [
      {
        title: "Own the opening",
        description: (
          <>
            An empty chat centers the greeting, the composer, and the starter
            prompts. Both halves are props, so the block opens in your
            product&apos;s voice — and the same{" "}
            <DocsCode>ChatInput</DocsCode> element stays mounted when the first
            message drops it to the bottom, so nothing jumps.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<Chat
  greeting="Where should we start?"
  suggestions={[
    { id: "audit", label: "Audit this file for dead code", icon: <Trash2 /> },
    { id: "tests", label: "Write tests for the reducer", icon: <FlaskConical /> },
  ]}
/>`,
        },
      },
      {
        title: "Own the state",
        description: (
          <>
            The block keeps messages in local state so it renders standalone.
            Copy <DocsCode>components/chat.tsx</DocsCode> into your app and
            replace <DocsCode>send</DocsCode> with your API call — everything it
            composes (<DocsCode>MessageList</DocsCode>,{" "}
            <DocsCode>ChatInput</DocsCode>,{" "}
            <DocsCode>PromptSuggestions</DocsCode>) is installed as a sibling
            you can rewire.
          </>
        ),
        code: {
          lang: "tsx",
          code: `const send = React.useCallback(async (text: string) => {
  setMessages((prev) => [
    ...prev,
    { id: crypto.randomUUID(), content: text, sender: "user" },
  ])
  setIsGenerating(true)

  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ text }),
  })
  // append assistant chunks as they stream in …
}, [])`,
        },
      },
      {
        title: "Compose the full app shell",
        description: (
          <>
            <DocsCode>Chat</DocsCode> is only the conversation column. Wrap it
            with the sidebar and navbar to get a complete layout.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<div className="flex h-svh min-h-0">
  <ChatSidebarDnd onDrop={handleDrop}>
    <ChatSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} edgeZones>
      <ChatSidebarItemList items={chats} activeId={activeId} sortable />
    </ChatSidebar>
  </ChatSidebarDnd>

  <div className="flex min-w-0 flex-1 flex-col">
    <ChatNavbar title={title} right={<ThemeToggle floating={false} />} />
    <Chat className="flex-1" />
  </div>
</div>`,
        },
      },
    ],
  },

  "chat-input": {
    title: "Chat Input",
    description:
      "Composer with auto-growing textarea, attachments (button, paste, drag-and-drop), a slash menu for skills and commands, @-mentions, a queue for messages typed mid-turn, and Enter-to-send.",
    registry: "chat-input",
    registryDependencies: ["file-icon"],
    preview: { name: "chat-input-example", node: <ChatInputExample /> },
    usage: `"use client"

import { ChatInput } from "@/components/ui/chat-input"

export function Composer() {
  return (
    <ChatInput
      placeholder="Ask anything"
      skills={[{ name: "summarize", description: "Condense long text" }]}
      slashCommands={[{ name: "help", description: "Show commands" }]}
      onSend={({ text, files, skills }) => {
        // send to your API
      }}
    />
  )
}`,
    props: [
      {
        caption: "ChatInput",
        rows: [
          {
            name: "onSend",
            type: "(payload: ChatInputPayload) => void",
            required: true,
            description: (
              <>
                Fired on Enter or the send button with{" "}
                <DocsCode>
                  {"{ text, files, skills }"}
                </DocsCode>
                . The composer clears itself afterwards.
              </>
            ),
          },
          {
            name: "onTextChange",
            type: "(text: string) => void",
            description: (
              <>
                Fired as the draft changes, including the clear after a send.
                The composer keeps owning the text — this is a read-only tap for
                things that track the draft, such as sizing a{" "}
                <DocsCode>ContextMeter</DocsCode>. It is held in a ref, so
                passing an unstable closure does not re-render the composer.
              </>
            ),
          },
          {
            name: "onStop",
            type: "() => void",
            description: "Called by the stop button while generating.",
          },
          {
            name: "isGenerating",
            type: "boolean",
            default: "false",
            description:
              "Swaps send for stop and disables the textarea while a response streams.",
          },
          {
            name: "placeholder",
            type: "string",
            default: '"Ask anything"',
            description: (
              <>
                Textarea placeholder. While a turn streams and{" "}
                <DocsCode>onQueue</DocsCode> is set it reads “Queue a message…”
                instead, unless you pass your own.
              </>
            ),
          },
          {
            name: "ref",
            type: "React.Ref<ChatInputHandle>",
            description: (
              <>
                Imperative access — <DocsCode>focus</DocsCode>,{" "}
                <DocsCode>getDraft</DocsCode>, <DocsCode>setDraft</DocsCode>,{" "}
                <DocsCode>insertText</DocsCode> — for a host that drives the
                composer from outside: quoting a selection into it, restoring a
                saved draft, putting a queued message back. Every change made
                through it fires <DocsCode>onTextChange</DocsCode>.
              </>
            ),
          },
          {
            name: "defaultValue",
            type: "string",
            default: '""',
            description: "Initial draft text. The composer owns the value from then on.",
          },
          {
            name: "onQueue",
            type: "(payload: ChatInputPayload) => void",
            description: (
              <>
                Lets the user keep typing while a turn streams: Enter (and the
                send button, now labelled “queue”) hands the message to the
                host instead of locking the textarea. The host owns the queue
                and sends the next entry when the turn ends.
              </>
            ),
          },
          {
            name: "queue",
            type: "ChatInputQueuedMessage[]",
            default: "[]",
            description: (
              <>
                Queued messages, listed above the surface with a remove
                button; <DocsCode>onQueueRemove(id)</DocsCode> drops one, and{" "}
                <DocsCode>onQueueEdit(id)</DocsCode> asks the host to put it
                back into the composer (via <DocsCode>setDraft</DocsCode>).
              </>
            ),
          },
          {
            name: "mentions",
            type: "(query: string) => Promise<ChatInputMentionItem[]> | ChatInputMentionItem[]",
            description: (
              <>
                Resolves the <DocsCode>@</DocsCode> token at the caret into a
                menu — files, people, whatever the host can name. Debounced,
                stale answers dropped; picking an item writes{" "}
                <DocsCode>insert</DocsCode> (default <DocsCode>@label</DocsCode>)
                into the draft.
              </>
            ),
          },
          {
            name: "onStash",
            type: "(payload: ChatInputPayload) => void",
            description: (
              <>
                ⌘S / Ctrl+S in the textarea hands the draft — text, files,
                skills — to the host and clears the composer, so a half-written
                prompt can be parked and restored later through the handle.
              </>
            ),
          },
          {
            name: "tools",
            type: "React.ReactNode",
            description:
              "Rendered in the toolbar next to the attach button — model and mode pickers belong here.",
          },
          {
            name: "skills",
            type: "ChatSkill[]",
            default: "[]",
            description: (
              <>
                Entries in the <DocsCode>/</DocsCode> menu. Picking one adds a
                chip and reports it back in{" "}
                <DocsCode>payload.skills</DocsCode> (max 5).
              </>
            ),
          },
          {
            name: "slashCommands",
            type: "ChatSlashCommand[]",
            default: "[]",
            description: (
              <>
                Commands in the same menu. Picking one writes{" "}
                <DocsCode>/name</DocsCode> into the textarea.
              </>
            ),
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the textarea and every toolbar control.",
          },
          {
            name: "maxHeight",
            type: "number",
            default: "200",
            description:
              "Textarea height cap in pixels; past it the textarea scrolls.",
          },
          {
            name: "className",
            type: "string",
            description: (
              <>
                Merged last onto the outer wrapper. It is capped at{" "}
                <DocsCode>max-w-3xl</DocsCode> — the same measure as the message
                column — so the composer and the conversation share one edge.
              </>
            ),
          },
        ],
      },
      {
        caption: "Types",
        rows: [
          {
            name: "ChatInputPayload",
            type: "{ text: string; files: File[]; skills: string[] }",
            description: "What onSend receives.",
          },
          {
            name: "ChatSkill",
            type: "{ name: string; description?: string }",
            description: "Slash-menu skill.",
          },
          {
            name: "ChatSlashCommand",
            type: "{ name: string; description?: string; argHint?: string }",
            description: "Slash-menu command.",
          },
          {
            name: "ChatInputHandle",
            type: "{ focus(); getDraft(): ChatInputDraft; setDraft(draft: Partial<ChatInputDraft>); insertText(text) }",
            description: (
              <>
                What <DocsCode>ref</DocsCode> resolves to.{" "}
                <DocsCode>getDraft().text</DocsCode> is the expanded text —
                pasted blocks put back in place of their placeholders.
              </>
            ),
          },
          {
            name: "ChatInputDraft",
            type: "{ text: string; files: File[]; skills: string[] }",
            description: "What the composer holds right now.",
          },
          {
            name: "ChatInputMentionItem",
            type: "{ id: string; label: string; description?: string; insert?: string }",
            description: "One row of the @ menu.",
          },
          {
            name: "ChatInputQueuedMessage",
            type: "{ id: string; text: string; fileCount?: number }",
            description: "One row of the host-owned queue.",
          },
        ],
      },
    ],
    dataSlots: [
      "chat-input",
      "chat-input-surface",
      "chat-input-textarea",
      "chat-input-toolbar",
      "chat-input-chips",
      "chat-input-chip",
      "chat-input-slash-menu",
      "chat-input-mention-menu",
      "chat-input-queue",
      "chat-input-queue-item",
    ],
    examples: [
      {
        title: "Stop a streaming answer",
        description: (
          <>
            <DocsCode>isGenerating</DocsCode> swaps send for stop and locks the
            textarea; <DocsCode>onStop</DocsCode> is where you abort the
            request. Send something below, then hit stop.
          </>
        ),
        example: {
          name: "chat-input-generating-example",
          node: <ChatInputGeneratingExample />,
        },
      },
      {
        title: "Queue while a turn streams",
        description: (
          <>
            With <DocsCode>onQueue</DocsCode> the textarea stays live during a
            turn: Enter queues the message, the list above the surface shows
            what is waiting, and the host sends the next entry when the turn
            settles. Click a queued row to edit it.
          </>
        ),
        example: {
          name: "chat-input-queue-example",
          node: <ChatInputQueueExample />,
        },
      },
      {
        title: "@-mention files",
        description: (
          <>
            Type <DocsCode>@</DocsCode> and a few letters. The{" "}
            <DocsCode>mentions</DocsCode> provider answers with whatever the
            host can name — here a static list of paths behind a short delay —
            and the pick replaces the token in place.
          </>
        ),
        example: {
          name: "chat-input-mentions-example",
          node: <ChatInputMentionsExample />,
        },
      },
      {
        title: "Long pastes collapse to a chip",
        description: (
          <>
            A paste over 800 characters or three lines is held out of the
            textarea as <DocsCode>[Pasted text #1 +40 lines]</DocsCode> and
            shown as a chip. Delete the chip or the token to drop it; sending
            expands every token still present.
          </>
        ),
        example: {
          name: "chat-input-paste-example",
          node: <ChatInputPasteExample />,
        },
      },
      {
        title: "Drive it from outside",
        description: (
          <>
            The <DocsCode>ref</DocsCode> handle inserts at the caret, replaces
            the draft, and reads it back — enough for “quote this into the
            composer”, a per-chat draft store, or a stash you park with ⌘S
            (<DocsCode>onStash</DocsCode>) and restore later.
          </>
        ),
        example: {
          name: "chat-input-handle-example",
          node: <ChatInputHandleExample />,
        },
      },
      {
        title: "Add pickers to the toolbar",
        description: (
          <>
            The <DocsCode>tools</DocsCode> slot sits next to the attach button.
            Pass <DocsCode>side=&quot;top&quot;</DocsCode> so the menus open
            away from the composer.
          </>
        ),
        example: {
          name: "chat-input-tools-example",
          node: <ChatInputToolsExample />,
        },
      },
      {
        title: "Custom composer buttons",
        description: (
          <>
            <DocsCode>chatInputButtonVariants</DocsCode> is exported so your own
            controls inherit the exact height, radius, and focus ring of the
            built-in attach and send buttons.
          </>
        ),
        example: {
          name: "chat-input-custom-button-example",
          node: <ChatInputCustomButtonExample />,
        },
      },
      {
        title: "Restyle the surface",
        description: (
          <>
            <DocsCode>className</DocsCode> merges last through{" "}
            <DocsCode>cn()</DocsCode>, and the inner card is reachable through
            its <DocsCode>data-slot</DocsCode> — so width, radius, and colors
            are all editable without forking the file.
          </>
        ),
        example: {
          name: "chat-input-styled-example",
          node: <ChatInputStyledExample />,
        },
      },
    ],
    notes: [
      {
        title: "Keyboard",
        description: (
          <>
            Enter sends and Shift+Enter inserts a newline. While the slash menu
            is open, arrows move the selection, Tab or Enter picks, and Escape
            dismisses it for the current text. IME composition is never
            interrupted.
          </>
        ),
      },
    ],
  },

  "prompt-suggestions": {
    title: "Prompt Suggestions",
    description:
      "Quiet starter-prompt list for the empty chat state — text rows with optional icons.",
    registry: "prompt-suggestions",
    preview: {
      name: "prompt-suggestions-example",
      node: <PromptSuggestionsExample />,
    },
    usage: `"use client"

import { PromptSuggestions } from "@/components/ui/prompt-suggestions"

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <PromptSuggestions
      items={[
        { id: "explain", label: "Explain this repository" },
        { id: "bug", label: "Find the bug in my reducer" },
      ]}
      onSelect={(item) => onPick(item.label)}
    />
  )
}`,
    props: [
      {
        caption: "PromptSuggestions",
        rows: [
          {
            name: "items",
            type: "PromptSuggestion[]",
            required: true,
            description: (
              <>
                <DocsCode>{"{ id?, label, icon? }"}</DocsCode>. An empty array
                renders nothing at all.
              </>
            ),
          },
          {
            name: "onSelect",
            type: "(item: PromptSuggestion) => void",
            description: "Fired when a row is clicked.",
          },
          {
            name: "className",
            type: "string",
            description: (
              <>
                Merged last. The default is{" "}
                <DocsCode>mx-auto w-full max-w-3xl px-3 sm:px-4</DocsCode> — the
                composer&apos;s own measure and gutters, so the rows line up
                under it with no override.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "prompt-suggestions",
      "prompt-suggestion",
    ],
    examples: [
      {
        title: "Icons, width, and chips",
        description: (
          <>
            <DocsCode>icon</DocsCode> takes any node; unsized icons are
            normalized to <DocsCode>size-4</DocsCode> and pick up the row hover
            color. The list is a plain <DocsCode>ul</DocsCode>, so narrowing it
            to the composer&apos;s measure — or turning the rows into a chip row
            — is one <DocsCode>className</DocsCode>.
          </>
        ),
        example: {
          name: "prompt-suggestions-styled-example",
          node: <PromptSuggestionsStyledExample />,
        },
      },
    ],
    notes: [
      {
        title: "Accessibility",
        description: (
          <>
            The list renders as <DocsCode>role=&quot;list&quot;</DocsCode>{" "}
            labelled &ldquo;Suggested prompts&rdquo;. Pass your own{" "}
            <DocsCode>aria-label</DocsCode> to rename it — it merges through{" "}
            <DocsCode>...props</DocsCode>.
          </>
        ),
      },
    ],
  },

  "todo-list": {
    title: "Todo List",
    description:
      "The agent's plan as one line above the composer: the live task and a count, opening into the whole checklist.",
    registry: "todo-list",
    registryDependencies: ["collapsible"],
    preview: { name: "todo-list-example", node: <TodoListExample /> },
    usage: `"use client"

import { TodoPanel, parseTodoItems } from "@/components/ui/todo-list"

export function Plan({ toolInput }: { toolInput?: string }) {
  const items = parseTodoItems(toolInput) ?? []

  return <TodoPanel items={items} />
}`,
    examples: [
      {
        title: "Above the composer",
        description: (
          <>
            The panel carries the same <DocsCode>max-w-3xl</DocsCode> measure as{" "}
            <DocsCode>ChatInput</DocsCode>, so the two stack without a call-site
            override. <DocsCode>parseTodoItems</DocsCode> turns a todo tool
            call&apos;s arguments straight into the list.
          </>
        ),
        example: {
          name: "todo-list-composer-example",
          node: <TodoListComposerExample />,
          align: "stretch",
        },
      },
      {
        title: "When the turn is over",
        description: (
          <>
            <DocsCode>running</DocsCode> is what tells the bar the turn behind
            it has settled. An agent that stops without writing its last step
            off is the common case, and a spinner that outlives the run reads
            as work still happening — so an unfinished step goes quiet, and a
            plan whose steps are all done says <em>Plan done</em>. Live,
            abandoned, and finished, in that order.
          </>
        ),
        example: {
          name: "todo-list-settled-example",
          node: <TodoListSettledExample />,
          align: "stretch",
        },
      },
      {
        title: "The checklist alone",
        description: (
          <>
            <DocsCode>TodoList</DocsCode> is the list with no chrome — for a
            plan that is already framed by something else, like a tool row or a
            sidebar section.
          </>
        ),
        example: {
          name: "todo-list-checklist-example",
          node: <TodoListChecklistExample />,
        },
      },
    ],
    notes: [
      {
        title: "One list, whoever wrote it",
        description: (
          <>
            <DocsCode>parseTodoItems</DocsCode> accepts a bare array or an
            object keyed <DocsCode>todos</DocsCode>,{" "}
            <DocsCode>items</DocsCode>, <DocsCode>tasks</DocsCode>,{" "}
            <DocsCode>plan</DocsCode>, <DocsCode>entries</DocsCode> or{" "}
            <DocsCode>steps</DocsCode>, and reads the task from{" "}
            <DocsCode>content</DocsCode>, <DocsCode>text</DocsCode>,{" "}
            <DocsCode>title</DocsCode>, <DocsCode>task</DocsCode> and friends.
            Statuses fold onto three states through{" "}
            <DocsCode>normalizeTodoStatus</DocsCode>; anything unrecognized is{" "}
            <DocsCode>pending</DocsCode>, never <DocsCode>completed</DocsCode>.
          </>
        ),
      },
      {
        title: "State belongs to the host",
        description: (
          <>
            The panel keeps nothing about the run. Derive{" "}
            <DocsCode>items</DocsCode> from the last todo tool call in the
            thread and a reloaded conversation shows the same plan the live one
            did. <DocsCode>isTodoToolName</DocsCode> is the matcher, and{" "}
            <DocsCode>todoProgress</DocsCode> gives the counts if you want to
            label the bar yourself.
          </>
        ),
      },
    ],
    props: [
      {
        caption: "TodoPanel",
        rows: [
          {
            name: "items",
            type: "TodoItem[]",
            required: true,
            description:
              "The plan, in order. An empty array renders nothing at all.",
          },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "false",
            description:
              "Start expanded. Collapsed, the panel is a single status line.",
          },
          {
            name: "open",
            type: "boolean",
            description: "Controlled open state; pair with onOpenChange.",
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "Fired when the disclosure is toggled.",
          },
          {
            name: "label",
            type: "ReactNode",
            description:
              "Replaces the collapsed headline, which is otherwise the in-progress task (or the next unfinished one).",
          },
          {
            name: "running",
            type: "boolean",
            default: "true",
            description:
              "False once the turn behind the plan has settled: nothing spins, and a plan with every step done reads as done.",
          },
        ],
      },
      {
        caption: "TodoList",
        rows: [
          {
            name: "items",
            type: "TodoItem[]",
            required: true,
            description: "The same list, rendered as a bare ordered list.",
          },
          {
            name: "running",
            type: "boolean",
            default: "true",
            description:
              "False draws an unfinished step as the step nobody got to, instead of one still being worked on.",
          },
        ],
      },
      {
        caption: "Helpers",
        rows: [
          {
            name: "parseTodoItems",
            type: "(input?: string | null) => TodoItem[] | null",
            description:
              "Parses a todo tool call's JSON arguments into items. Null when the payload holds no list.",
          },
          {
            name: "isTodoToolName",
            type: "(name: string) => boolean",
            description:
              "True for todo_write, TodoWrite, write_todos, update_plan and the like.",
          },
          {
            name: "todoProgress",
            type: "(items: TodoItem[]) => { completed, total, active, current, done }",
            description:
              "Counts plus the in-progress item and the one worth naming in a single line.",
          },
          {
            name: "normalizeTodoStatus",
            type: "(value: unknown) => TodoStatus",
            description:
              "Folds any spelling onto pending | in_progress | completed.",
          },
        ],
      },
    ],
    dataSlots: [
      "todo-panel",
      "todo-panel-root",
      "todo-panel-trigger",
      "todo-panel-headline",
      "todo-panel-count",
      "todo-panel-list",
      "todo-list",
      "todo-item",
    ],
  },

  "chat-navbar": {
    title: "Chat Navbar",
    description:
      "Thin top bar with a truncating title and left/right slots for whatever your app needs there.",
    registry: "chat-navbar",
    preview: { name: "chat-navbar-example", node: <ChatNavbarExample /> },
    usage: `import { ChatNavbar } from "@/components/ui/chat-navbar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header({ title }: { title: string }) {
  return <ChatNavbar title={title} right={<ThemeToggle floating={false} />} />
}`,
    props: [
      {
        caption: "ChatNavbar",
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            description:
              "A string is wrapped in a truncating h1; any other node renders as-is.",
          },
          {
            name: "left",
            type: "React.ReactNode",
            description:
              "Before the title — a sidebar toggle on small screens, usually.",
          },
          {
            name: "right",
            type: "React.ReactNode",
            description: "Actions pinned to the right edge.",
          },
          {
            name: "className",
            type: "string",
            description: (
              <>
                Merged last. The bar is <DocsCode>h-12</DocsCode> with a bottom
                border by default.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "chat-navbar",
      "chat-navbar-left",
      "chat-navbar-title",
      "chat-navbar-right",
    ],
    examples: [
      {
        title: "Taller, quieter, or compact",
        description: (
          <>
            Layout classes merge last, so height, background, and border are all
            replaceable from the call site — and the title has its own slot when
            you need a different type scale.
          </>
        ),
        example: {
          name: "chat-navbar-styled-example",
          node: <ChatNavbarStyledExample />,
        },
      },
    ],
  },

  resizable: {
    title: "Resizable",
    description:
      "Panels split by a draggable divider — the shadcn/ui resizable, on react-resizable-panels. Pairs with File Preview: the conversation and the file panel share one group, so the reader picks the split.",
    registry: "resizable",
    preview: {
      name: "resizable-example",
      node: <ResizableExample />,
      align: "stretch",
    },
    usage: `"use client"

import { FilePreview } from "@/components/ui/file-preview"
import { MessageList } from "@/components/ui/message-list"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function Workspace({ messages, file, onClose }: WorkspaceProps) {
  // The remembered width rides in on defaultSize; see "Remember the split".
  const [previewSize, setPreviewSize] = useState(35)

  return (
    <ResizablePanelGroup
      id="workspace"
      orientation="horizontal"
      onLayoutChanged={(layout) => save(layout.preview)}
      className="min-w-0 flex-1"
    >
      <ResizablePanel id="chat" defaultSize={\`\${100 - previewSize}%\`} minSize="40%">
        <MessageList messages={messages} />
      </ResizablePanel>
      {file ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="preview"
            defaultSize={\`\${previewSize}%\`}
            minSize="20%"
            maxSize="60%"
          >
            <FilePreview file={file} onClose={onClose} className="border-l" />
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  )
}`,
    props: [
      {
        caption: "ResizablePanelGroup",
        rows: [
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: (
              <>
                Resize direction. Vertical groups stack — the class list flips
                them with <DocsCode>aria-[orientation=vertical]:flex-col</DocsCode>
                .
              </>
            ),
          },
          {
            name: "id",
            type: "string | number",
            description:
              "Identifies the group; required if you persist its layout. Falls back to useId.",
          },
          {
            name: "defaultLayout",
            type: "Layout",
            description: (
              <>
                Starting split, as a map of panel id to percentage — adopted
                only when it names exactly the panels the group mounted with.
                Feed it from <DocsCode>useDefaultLayout</DocsCode> to restore a
                saved one.
              </>
            ),
          },
          {
            name: "onLayoutChanged",
            type: "(layout, meta) => void",
            description:
              "Fires once the drag ends — where you save the layout. onLayoutChange fires on every pointer move instead.",
          },
        ],
      },
      {
        caption: "ResizablePanel",
        rows: [
          {
            name: "id",
            type: "string | number",
            description:
              "Identifies the pane inside the group — this is what makes a conditionally mounted panel keep its size, and what a saved layout is keyed by.",
          },
          {
            name: "defaultSize",
            type: "number | string",
            description:
              'Bare numbers are pixels; strings are percentages ("35" and "35%" are both 35% of the group). Other CSS units work too — "20rem", "40vh".',
          },
          {
            name: "minSize / maxSize",
            type: "number | string",
            description: "Resize bounds, in the same units as defaultSize.",
          },
          {
            name: "collapsible / collapsedSize",
            type: "boolean / number | string",
            description:
              "Snap the pane shut once it is dragged under minSize, down to collapsedSize (0 by default).",
          },
          {
            name: "className",
            type: "string",
            description: (
              <>
                Lands on the pane&apos;s inner content wrapper — the outer
                element belongs to the layout engine. Style the pane itself
                through <DocsCode>[data-slot=resizable-panel]</DocsCode>.
              </>
            ),
          },
        ],
      },
      {
        caption: "ResizableHandle",
        rows: [
          {
            name: "withHandle",
            type: "boolean",
            description:
              "Renders the centred grip, so the divider reads as draggable. Rotated automatically in a vertical group.",
          },
          {
            name: "disabled",
            type: "boolean",
            description: "Freezes this divider; the panels can still be resized by others.",
          },
        ],
      },
    ],
    dataSlots: [
      "resizable-panel-group",
      "resizable-panel",
      "resizable-handle",
      "resizable-grip",
    ],
    examples: [
      {
        title: "Remember the split",
        description: (
          <>
            <DocsCode>onLayoutChanged</DocsCode> fires once a drag ends, with
            the layout as a map of panel id to percentage — save the number you
            care about and feed it back through{" "}
            <DocsCode>defaultSize</DocsCode>. Do it this way whenever a panel is
            conditionally mounted: a group adopts{" "}
            <DocsCode>defaultLayout</DocsCode> only for the panels it mounted
            with, so a layout naming a panel that is not on screen yet is
            ignored. For a group whose panels are always there,{" "}
            <DocsCode>useDefaultLayout</DocsCode> (from{" "}
            <DocsCode>react-resizable-panels</DocsCode>) does the whole
            round-trip for you.
          </>
        ),
        code: {
          lang: "tsx",
          code: `// Read after mount: localStorage does not exist while the page prerenders.
const [previewSize, setPreviewSize] = useState(35)
useEffect(() => {
  const saved = Number(localStorage.getItem("workspace:preview-size"))
  if (saved >= 20 && saved <= 60) queueMicrotask(() => setPreviewSize(saved))
}, [])

<ResizablePanelGroup
  id="workspace"
  onLayoutChanged={(layout) => {
    if (layout.preview != null) {
      localStorage.setItem("workspace:preview-size", String(layout.preview))
    }
  }}
>`,
        },
      },
      {
        title: "Restyle the divider",
        description: (
          <>
            The state lives on <DocsCode>data-separator</DocsCode>, so a wider,
            louder handle is a class list away.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ResizableHandle
  withHandle
  className="w-0.5 data-[separator=hover]:bg-primary data-[separator=active]:bg-primary
             [&_[data-slot=resizable-grip]]:h-6"
/>`,
        },
      },
    ],
    notes: [
      {
        title: "Desktop only, by design",
        description: (
          <>
            A drag handle is a pointer affordance, so the demo mounts the group
            on <DocsCode>md</DocsCode> and up and keeps the phone layout an
            overlay panel with a scrim. Mount the second{" "}
            <DocsCode>ResizablePanel</DocsCode> and its handle only while the
            panel is open — the panel <DocsCode>id</DocsCode> is what brings its
            previous width back when it reopens in the same session.
          </>
        ),
      },
      {
        title: "Keyboard",
        description: (
          <>
            The divider is in the tab order and reports itself as a{" "}
            <DocsCode>separator</DocsCode> with live{" "}
            <DocsCode>aria-valuenow</DocsCode>. Arrow keys move it, Home and End
            jump to the bounds, Enter toggles a collapsible panel, and
            double-click restores the default sizes.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
