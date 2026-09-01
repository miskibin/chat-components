import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { ChatExample } from "@/components/examples/chat-example"
import { ChatInputCustomButtonExample } from "@/components/examples/chat-input-custom-button-example"
import { ChatInputExample } from "@/components/examples/chat-input-example"
import { ChatInputStyledExample } from "@/components/examples/chat-input-styled-example"
import { ChatInputToolsExample } from "@/components/examples/chat-input-tools-example"
import { ChatNavbarExample } from "@/components/examples/chat-navbar-example"
import { PromptSuggestionsExample } from "@/components/examples/prompt-suggestions-example"
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
          {
            name: "...props",
            type: 'React.ComponentProps<"div">',
            description: "Everything else lands on the root element.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "chat", description: "Root flex column." },
      {
        slot: "chat-greeting",
        description: "Greeting wrapper — only mounted while the chat is empty.",
      },
      {
        slot: "chat-composer",
        description: "Wraps the composer and, when empty, the suggestion list.",
      },
    ],
    customization: [
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
            description: "Merged last onto the outer wrapper.",
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
      { slot: "chat-input", description: "Outer wrapper that owns the width." },
      {
        slot: "chat-input-surface",
        description: (
          <>
            The rounded, bordered composer card. Carries{" "}
            <DocsCode>data-drag-over</DocsCode> while files hover it.
          </>
        ),
      },
      { slot: "chat-input-textarea", description: "The textarea itself." },
      { slot: "chat-input-toolbar", description: "Attach + tools + send row." },
      {
        slot: "chat-input-chips",
        description: "Attachment and skill chip strip.",
      },
      {
        slot: "chat-input-slash-menu",
        description: "Popover listing skills and commands.",
      },
    ],
    customization: [
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
                <DocsCode>mx-auto w-full max-w-4xl</DocsCode> — override it to
                match your composer width.
              </>
            ),
          },
          {
            name: "...props",
            type: 'React.ComponentProps<"ul">',
            description: "Everything else lands on the list element.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "prompt-suggestions", description: "The list element." },
      { slot: "prompt-suggestion", description: "Each row button." },
    ],
    customization: [
      {
        title: "Icons and width",
        description: (
          <>
            <DocsCode>icon</DocsCode> takes any node; unsized icons are
            normalized to <DocsCode>size-4</DocsCode> and pick up the row hover
            color. Match the composer by narrowing the list.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<PromptSuggestions
  className="max-w-2xl px-0 sm:px-0"
  items={[
    { id: "explain", label: "Explain this repository", icon: <FileText /> },
    { id: "bug", label: "Find the bug in my reducer", icon: <Bug /> },
  ]}
  onSelect={(item) => send(item.label)}
/>`,
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
          {
            name: "...props",
            type: 'React.ComponentProps<"header">',
            description: "Everything else lands on the header element.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "chat-navbar", description: "The header element." },
      { slot: "chat-navbar-left", description: "Left group, including title." },
      { slot: "chat-navbar-title", description: "Title, when it is a string." },
      { slot: "chat-navbar-right", description: "Right action group." },
    ],
    customization: [
      {
        title: "Taller, transparent bar",
        description: (
          <>
            Layout classes merge last, so height, background, and border are all
            replaceable from the call site.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ChatNavbar
  className="h-14 border-b-0 bg-transparent px-6 [&_[data-slot=chat-navbar-title]]:text-[15px]"
  title="Streaming markdown bugs"
  right={<ThemeToggle floating={false} />}
/>`,
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
          {
            name: "className",
            type: "string",
            description: (
              <>
                Merged last onto the group, which is{" "}
                <DocsCode>flex h-full w-full</DocsCode> by default.
              </>
            ),
          },
          {
            name: "...props",
            type: "GroupProps",
            description: (
              <>
                Everything <DocsCode>react-resizable-panels</DocsCode> takes —{" "}
                <DocsCode>disabled</DocsCode>, <DocsCode>groupRef</DocsCode>,{" "}
                <DocsCode>resizeTargetMinimumSize</DocsCode>.
              </>
            ),
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
          {
            name: "...props",
            type: "PanelProps",
            description: (
              <>
                <DocsCode>onResize</DocsCode>, <DocsCode>panelRef</DocsCode>{" "}
                (collapse / expand / resize imperatively), and the rest.
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
          {
            name: "className",
            type: "string",
            description:
              "Merged last. The divider is a 1px border-coloured line with a wider invisible hit area.",
          },
          {
            name: "...props",
            type: "SeparatorProps",
            description: (
              <>
                Everything the primitive separator takes, minus{" "}
                <DocsCode>role</DocsCode> and <DocsCode>tabIndex</DocsCode>,
                which it owns.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      {
        slot: "resizable-panel-group",
        description: (
          <>
            The group. Carries <DocsCode>aria-orientation</DocsCode>.
          </>
        ),
      },
      {
        slot: "resizable-panel",
        description: (
          <>
            One pane — the outer, sized element (its own{" "}
            <DocsCode>id</DocsCode>, plus <DocsCode>data-panel</DocsCode>).
          </>
        ),
      },
      {
        slot: "resizable-handle",
        description: (
          <>
            The divider. <DocsCode>data-separator</DocsCode> tracks its state —{" "}
            <DocsCode>inactive</DocsCode>, <DocsCode>hover</DocsCode>,{" "}
            <DocsCode>focus</DocsCode>, <DocsCode>active</DocsCode>,{" "}
            <DocsCode>disabled</DocsCode>.
          </>
        ),
      },
      {
        slot: "resizable-grip",
        description: (
          <>
            The grip rendered by <DocsCode>withHandle</DocsCode>.
          </>
        ),
      },
    ],
    customization: [
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
