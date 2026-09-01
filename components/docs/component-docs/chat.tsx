import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { ChatExample } from "@/components/examples/chat-example"
import { ChatInputCustomButtonExample } from "@/components/examples/chat-input-custom-button-example"
import { ChatInputExample } from "@/components/examples/chat-input-example"
import { ChatInputStyledExample } from "@/components/examples/chat-input-styled-example"
import { ChatInputToolsExample } from "@/components/examples/chat-input-tools-example"
import { ChatInputGeneratingExample } from "@/components/examples/chat-input-generating-example"
import { ChatNavbarExample } from "@/components/examples/chat-navbar-example"
import { ChatNavbarStyledExample } from "@/components/examples/chat-navbar-styled-example"
import { PromptSuggestionsExample } from "@/components/examples/prompt-suggestions-example"
import { PromptSuggestionsStyledExample } from "@/components/examples/prompt-suggestions-styled-example"

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
      "Composer with auto-growing textarea, attachments (button, paste, drag-and-drop), an optional slash menu for skills and commands, and Enter-to-send.",
    registry: "chat-input",
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
            description: "Textarea placeholder.",
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
        ],
      },
    ],
    dataSlots: [
      "chat-input",
      "chat-input-surface",
      "chat-input-textarea",
      "chat-input-toolbar",
      "chat-input-chips",
      "chat-input-slash-menu",
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
} satisfies Record<string, ComponentDoc>
