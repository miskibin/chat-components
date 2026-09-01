import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { FolderPickerEmptyExample } from "@/components/examples/folder-picker-empty-example"
import { FolderPickerExample } from "@/components/examples/folder-picker-example"
import { ModePickerExample } from "@/components/examples/mode-picker-example"
import { ModePickerStyledExample } from "@/components/examples/mode-picker-styled-example"
import { ModelPickerDisabledExample } from "@/components/examples/model-picker-disabled-example"
import { ModelPickerEffortsExample } from "@/components/examples/model-picker-efforts-example"
import { ModelPickerExample } from "@/components/examples/model-picker-example"
import { ModelPickerSearchExample } from "@/components/examples/model-picker-search-example"
import { ModelPickerStyledExample } from "@/components/examples/model-picker-styled-example"
import { ThemeToggleExample } from "@/components/examples/theme-toggle-example"
import { ThemeToggleStyledExample } from "@/components/examples/theme-toggle-styled-example"

export const controlDocs = {
  "folder-picker": {
    title: "Folder Picker",
    description:
      "Searchable recent-folder menu with an app-provided action for opening the operating system's native folder chooser.",
    registry: "folder-picker",
    registryDependencies: ["popover", "command"],
    preview: { name: "folder-picker-example", node: <FolderPickerExample /> },
    usage: `"use client"

import { useState } from "react"
import { FolderPicker } from "@/components/ui/folder-picker"

const RECENTS = ["D:\\\\agent-ui", "D:\\\\chat-components"]

export function Picker() {
  const [folder, setFolder] = useState(RECENTS[0])

  return (
    <FolderPicker
      value={folder}
      recents={RECENTS}
      onChange={setFolder}
      onOpenFolder={() => openNativeFolderDialog()}
    />
  )
}`,
    props: [
      {
        caption: "FolderPicker",
        rows: [
          {
            name: "recents",
            type: "string[]",
            required: true,
            description:
              "Absolute paths in most-recently-used order. These are the only folders shown in the default list.",
          },
          {
            name: "value",
            type: "string",
            description: "The selected absolute path.",
          },
          {
            name: "onChange",
            type: "(path: string) => void",
            description: "Fired when a recent folder is selected; the menu closes.",
          },
          {
            name: "onOpenFolder",
            type: "() => void | Promise<void>",
            description:
              "Connect this to the host's native folder dialog. The action is disabled when omitted.",
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description:
              "Notifies the host when the menu opens or closes, useful for refreshing the MRU list.",
          },
          {
            name: "detail",
            type: "ReactNode",
            description:
              "Quiet trigger suffix for related context such as a Git branch.",
          },
          {
            name: "variant",
            type: '"chip" | "inline"',
            default: '"chip"',
            description:
              "The inline variant adds a subtle border for a standalone composer control.",
          },
          {
            name: "side",
            type: '"top" | "bottom"',
            default: '"bottom"',
            description: "Which way the recent-folder menu opens.",
          },
          {
            name: "classNames",
            type: "FolderPickerClassNames",
            description:
              "Per-part overrides for the content, search, list, group, item, path, and action.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the trigger.",
          },
        ],
      },
    ],
    dataSlots: [
      "folder-picker-trigger",
      "folder-picker-label",
      "folder-picker-detail",
      "folder-picker-content",
      "folder-picker-search",
      "folder-picker-list",
      "folder-picker-group",
      "folder-picker-item",
      "folder-picker-path",
      "folder-picker-check",
      "folder-picker-action",
    ],
    examples: [
      {
        title: "Start with no history",
        description: (
          <>
            An empty <DocsCode>recents</DocsCode> array leaves one clear way
            forward: the native <em>Open Folder</em> action. Once the host
            remembers that selection, pass the updated list back on the next
            open.
          </>
        ),
        example: {
          name: "folder-picker-empty-example",
          node: <FolderPickerEmptyExample />,
        },
      },
    ],
    notes: [
      {
        title: "Native dialog stays app-owned",
        description: (
          <>
            Browser code cannot recover an absolute local path. Desktop hosts
            should connect <DocsCode>onOpenFolder</DocsCode> to Tauri, Electron,
            or another native bridge and update <DocsCode>value</DocsCode> after
            the user chooses a directory.
          </>
        ),
      },
    ],
  },

  "model-picker": {
    title: "Model Picker",
    description:
      "Compact model switcher on the shadcn dropdown menu: one row per thing that can change, each showing its current value, with the choices in a submenu.",
    registry: "model-picker",
    registryDependencies: ["dropdown-menu", "command"],
    preview: { name: "model-picker-example", node: <ModelPickerExample /> },
    usage: `"use client"

import { useState } from "react"
import {
  DEFAULT_MODEL_EFFORTS,
  ModelPicker,
  type ModelOption,
} from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor" },
  { id: "gpt-5.4", name: "GPT-5.4", badge: "OpenAI" },
]

export function Picker() {
  const [model, setModel] = useState(MODELS[0].id)
  const [effort, setEffort] = useState("medium")

  return (
    <ModelPicker
      value={model}
      onChange={setModel}
      options={MODELS}
      efforts={DEFAULT_MODEL_EFFORTS}
      effort={effort}
      onEffortChange={setEffort}
    />
  )
}`,
    props: [
      {
        caption: "ModelPicker",
        rows: [
          {
            name: "options",
            type: "ModelOption[]",
            required: true,
            description: (
              <>
                The list contents. An empty array disables the trigger. Past{" "}
                <DocsCode>searchThreshold</DocsCode> the list grows a search
                field that matches <DocsCode>name</DocsCode>,{" "}
                <DocsCode>badge</DocsCode>, <DocsCode>description</DocsCode> and{" "}
                <DocsCode>meta</DocsCode>.
              </>
            ),
          },
          {
            name: "value",
            type: "string",
            description: "Controlled selection. Omit to let it manage its own.",
          },
          {
            name: "defaultValue",
            type: "string",
            default: "options[0]?.id",
            description: "Initial selection when uncontrolled.",
          },
          {
            name: "onChange",
            type: "(id: string) => void",
            description:
              "Fired on pick, then the menu closes. Disabled options never fire it.",
          },
          {
            name: "efforts",
            type: "ModelEffortOption[] | false",
            default: "false",
            description: (
              <>
                Reasoning-effort options. <DocsCode>false</DocsCode> drops the
                row entirely and the menu becomes the model list itself; pass{" "}
                <DocsCode>DEFAULT_MODEL_EFFORTS</DocsCode> or your own list to
                show it.
              </>
            ),
          },
          {
            name: "effort",
            type: "string",
            description: "Controlled effort id.",
          },
          {
            name: "defaultEffort",
            type: "string",
            default: "efforts[0]?.id",
            description: "Initial effort when uncontrolled.",
          },
          {
            name: "onEffortChange",
            type: "(id: string) => void",
            description: "Fired on effort pick, then the menu closes.",
          },
          {
            name: "side",
            type: '"top" | "bottom"',
            default: '"top"',
            description:
              "Which way the menu opens. Composers open top, navbars open bottom. Submenus pick their own side.",
          },
          {
            name: "searchThreshold",
            type: "number",
            default: "8",
            description: (
              <>
                Model counts above this get a search field; at or below it, a
                plain list the menu&rsquo;s own typeahead can walk.
              </>
            ),
          },
          {
            name: "placeholder",
            type: "string",
            default: '"Model"',
            description: "Trigger label when nothing is selected.",
          },
          {
            name: "searchPlaceholder",
            type: "string",
            default: '"Search models…"',
            description: "Placeholder inside the search field.",
          },
          {
            name: "emptyMessage",
            type: "string",
            default: '"No models found."',
            description: "Shown when the search matches nothing.",
          },
          {
            name: "label",
            type: "string",
            default: '"Model"',
            description: "Label on the row that opens the model submenu.",
          },
          {
            name: "effortLabel",
            type: "string",
            default: '"Effort"',
            description: "Label on the row that opens the effort submenu.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the trigger.",
          },
        ],
      },
      {
        caption: "ModelEffortOption",
        rows: [
          {
            name: "id",
            type: "string",
            required: true,
            description: (
              <>
                Stable key, reported by <DocsCode>onEffortChange</DocsCode>.
              </>
            ),
          },
          {
            name: "label",
            type: "string",
            required: true,
            description:
              "Shown in the row, in the submenu, and as the trigger suffix.",
          },
          {
            name: "description",
            type: "string",
            description: "Tooltip on the submenu row.",
          },
        ],
      },
      {
        caption: "ModelOption",
        rows: [
          { name: "id", type: "string", required: true, description: "Stable key." },
          {
            name: "name",
            type: "string",
            required: true,
            description: "Shown in the trigger and the row.",
          },
          {
            name: "badge",
            type: "string",
            description: "Short tag after the name — the provider, usually.",
          },
          {
            name: "description",
            type: "string",
            description: "Row tooltip, and a search keyword.",
          },
          {
            name: "meta",
            type: "string",
            description:
              "Trailing detail on the row, e.g. a size or a context length.",
          },
          {
            name: "disabled",
            type: "boolean",
            description: "Row stays visible but cannot be picked.",
          },
          {
            name: "disabledReason",
            type: "string",
            description: "Why it is unavailable, joined into the row tooltip.",
          },
        ],
      },
    ],
    dataSlots: [
      "model-picker-trigger",
      "model-picker-trigger-effort",
      "model-picker-content",
      "model-picker-section",
      "model-picker-section-value",
      "model-picker-list",
      "model-picker-search",
      "model-picker-item",
      "model-picker-badge",
      "model-picker-meta",
      "model-picker-effort",
      "model-picker-effort-item",
    ],
    examples: [
      {
        title: "Just the models",
        description: (
          <>
            Without <DocsCode>efforts</DocsCode> there is only one thing to
            change, so the menu is the model list — no row to hover through
            first. Disabled options stay listed and carry their{" "}
            <DocsCode>disabledReason</DocsCode> as the row tooltip, which
            answers &ldquo;where did it go?&rdquo; before it gets asked.
          </>
        ),
        example: {
          name: "model-picker-disabled-example",
          node: <ModelPickerDisabledExample />,
        },
      },
      {
        title: "Long lists get a search field",
        description: (
          <>
            Under <DocsCode>searchThreshold</DocsCode> models the submenu is
            plain rows and the menu&rsquo;s typeahead is enough. Over it, cmdk
            takes the list over — it owns focus and the arrow keys, so typing
            filters instead of jumping.
          </>
        ),
        example: {
          name: "model-picker-search-example",
          node: <ModelPickerSearchExample />,
        },
      },
      {
        title: "Name your own effort steps",
        description: (
          <>
            <DocsCode>efforts</DocsCode> is plain data, so the scale is yours —
            two steps or six, whatever your backend accepts. Ship{" "}
            <DocsCode>DEFAULT_MODEL_EFFORTS</DocsCode> for the usual
            low/medium/high/xhigh ladder, or write your own;{" "}
            <DocsCode>effortLabel</DocsCode> renames the row.
          </>
        ),
        example: {
          name: "model-picker-efforts-example",
          node: <ModelPickerEffortsExample />,
        },
      },
      {
        title: "Restyle the trigger",
        description: (
          <>
            The trigger is a plain button: <DocsCode>className</DocsCode> merges
            last, and <DocsCode>data-state=&quot;open&quot;</DocsCode> covers
            the open state. The effort suffix has its own slot, so it can be
            dimmed, recoloured, or hidden without touching the name.
          </>
        ),
        example: {
          name: "model-picker-styled-example",
          node: <ModelPickerStyledExample />,
        },
      },
    ],
    notes: [
      {
        title: "Inside a composer",
        description: (
          <>
            Drop it into the <DocsCode>tools</DocsCode> slot of{" "}
            <DocsCode>ChatInput</DocsCode> with{" "}
            <DocsCode>side=&quot;top&quot;</DocsCode>; the trigger already
            matches the toolbar height, and carries no icon of its own so it
            sits flush next to the other tool buttons.
          </>
        ),
      },
      {
        title: "One row per decision",
        description: (
          <>
            Every row states its current value next to its label, so the whole
            configuration reads at a glance without opening anything. Picking
            from a submenu — model or effort — closes the menu; nothing is a
            two-step commit.
          </>
        ),
      },
    ],
  },

  "mode-picker": {
    title: "Mode Picker",
    description:
      "Ask / Plan / Agent switch built on the shadcn dropdown menu, with a short description under each mode.",
    registry: "mode-picker",
    registryDependencies: ["dropdown-menu"],
    preview: { name: "mode-picker-example", node: <ModePickerExample /> },
    usage: `"use client"

import { useState } from "react"
import { ModePicker, type ChatMode } from "@/components/ui/mode-picker"

export function Picker() {
  const [mode, setMode] = useState<ChatMode>("agent")
  return <ModePicker value={mode} onChange={setMode} />
}`,
    props: [
      {
        caption: "ModePicker",
        rows: [
          {
            name: "value",
            type: "ChatMode",
            description: "Controlled selection.",
          },
          {
            name: "defaultValue",
            type: "ChatMode",
            default: '"agent"',
            description: "Initial selection when uncontrolled.",
          },
          {
            name: "onChange",
            type: "(mode: ChatMode) => void",
            description: "Fired on pick.",
          },
          {
            name: "side",
            type: '"top" | "bottom"',
            default: '"top"',
            description: "Which way the menu opens.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the trigger.",
          },
        ],
      },
    ],
    dataSlots: [
      "mode-picker-trigger",
      "mode-picker-content",
      "mode-picker-item",
    ],
    examples: [
      {
        title: "Rename the modes",
        description: (
          <>
            Modes are a plain exported array rather than a prop — the component
            is copied into your repo, so edit{" "}
            <DocsCode>CHAT_MODES</DocsCode> directly.
          </>
        ),
        code: {
          lang: "tsx",
          code: `export const CHAT_MODES = [
  { id: "ask", name: "Chat", description: "Answers only", icon: MessageCircle },
  { id: "plan", name: "Review", description: "Proposes a diff", icon: ListTodo },
  { id: "agent", name: "Build", description: "Edits your repo", icon: Bot },
]`,
        },
      },
      {
        title: "Restyle the trigger, flip the side",
        description: (
          <>
            <DocsCode>className</DocsCode> merges onto the trigger and{" "}
            <DocsCode>side</DocsCode> decides which way the menu opens —{" "}
            <DocsCode>top</DocsCode> for a composer, <DocsCode>bottom</DocsCode>{" "}
            for a navbar. All three below share one selection.
          </>
        ),
        example: {
          name: "mode-picker-styled-example",
          node: <ModePickerStyledExample />,
        },
      },
    ],
  },

  "theme-toggle": {
    title: "Theme Toggle",
    description:
      "Circular light/dark switch on next-themes. Floats in the page corner by default, or inlines into any bar.",
    registry: "theme-toggle",
    preview: { name: "theme-toggle-example", node: <ThemeToggleExample /> },
    usage: `import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  return <ThemeToggle floating={false} />
}`,
    props: [
      {
        caption: "ThemeToggle",
        rows: [
          {
            name: "floating",
            type: "boolean",
            default: "true",
            description: (
              <>
                Fixed chip at <DocsCode>top-3 right-3</DocsCode>. Pass{" "}
                <DocsCode>false</DocsCode> to place it inline.
              </>
            ),
          },
          {
            name: "className",
            type: "string",
            description: "Merged last — size, radius, and colors are all yours.",
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler",
            description: (
              <>
                Runs before the theme flips. Call{" "}
                <DocsCode>preventDefault()</DocsCode> to keep the theme
                unchanged.
              </>
            ),
          },
        ],
      },
    ],
    dataSlots: [
      "theme-toggle",
    ],
    examples: [
      {
        title: "Square it off, tint it, watch the switch",
        description: (
          <>
            Size, radius, and color are all <DocsCode>className</DocsCode>. The
            icon only renders after hydration, so the server HTML and the first
            client paint always agree — the button reserves its size either way.{" "}
            <DocsCode>onClick</DocsCode> runs before the flip, so{" "}
            <DocsCode>preventDefault()</DocsCode> in it keeps the theme where it
            is.
          </>
        ),
        example: {
          name: "theme-toggle-styled-example",
          node: <ThemeToggleStyledExample />,
        },
      },
    ],
    notes: [
      {
        title: "Requires a provider",
        description: (
          <>
            Wrap your app in the next-themes provider with{" "}
            <DocsCode>attribute=&quot;class&quot;</DocsCode> — see{" "}
            <a href="/docs/theming">Theming</a>.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
