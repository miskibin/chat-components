import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"
import { ModePickerExample } from "@/components/examples/mode-picker-example"
import { ModelPickerDisabledExample } from "@/components/examples/model-picker-disabled-example"
import { ModelPickerExample } from "@/components/examples/model-picker-example"
import { ThemeToggleExample } from "@/components/examples/theme-toggle-example"

export const controlDocs = {
  "model-picker": {
    title: "Model Picker",
    description:
      "Searchable model selector on Popover + cmdk, with badges, descriptions, disabled options that explain themselves, and an optional reasoning-effort row.",
    registry: "model-picker",
    registryDependencies: ["popover", "command"],
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
                The list contents. cmdk filters them on{" "}
                <DocsCode>name</DocsCode>, with <DocsCode>badge</DocsCode>,{" "}
                <DocsCode>description</DocsCode>, and <DocsCode>meta</DocsCode>{" "}
                as keywords. An empty array disables the trigger.
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
              "Fired on pick, then the popover closes. Disabled options never fire it.",
          },
          {
            name: "efforts",
            type: "ModelEffortOption[] | false",
            default: "false",
            description: (
              <>
                Reasoning-effort options under a divider.{" "}
                <DocsCode>false</DocsCode> hides the section; pass{" "}
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
            description:
              "Fired on effort pick. The popover stays open so both choices happen in one visit.",
          },
          {
            name: "side",
            type: '"top" | "bottom"',
            default: '"top"',
            description:
              "Which way the popover opens. Composers open top, navbars open bottom.",
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
            default: '"Models"',
            description: "Heading above the option list.",
          },
          {
            name: "effortLabel",
            type: "string",
            default: '"Reasoning effort"',
            description: "Heading above the effort row.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the trigger.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the trigger button.",
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
              "Shown on the chip and as the trigger suffix, e.g. “· High”.",
          },
          {
            name: "description",
            type: "string",
            description:
              "Tooltip on the chip, and the line under the row while it is active.",
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
            description: "Short uppercase tag — the provider, usually.",
          },
          {
            name: "description",
            type: "string",
            description: "One line under the name.",
          },
          {
            name: "meta",
            type: "string",
            description: "Appended to the description after a separator.",
          },
          {
            name: "disabled",
            type: "boolean",
            description: "Row stays visible but cannot be picked.",
          },
          {
            name: "disabledReason",
            type: "string",
            description: "Why it is unavailable, rendered under the row.",
          },
        ],
      },
      {
        caption: "Exports",
        rows: [
          {
            name: "DEFAULT_MODEL_EFFORTS",
            type: "ModelEffortOption[]",
            description:
              "low / medium / high / xhigh — “Low”, “Medium”, “High”, “Extra High”. Pass it to efforts, or copy it and rename the steps.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "model-picker-trigger", description: "The trigger button." },
      { slot: "model-picker-content", description: "The popover panel." },
      { slot: "model-picker-search", description: "The search input." },
      { slot: "model-picker-list", description: "The scrolling result list." },
      { slot: "model-picker-item", description: "Each model row." },
      { slot: "model-picker-badge", description: "The uppercase provider tag." },
      {
        slot: "model-picker-effort",
        description: "The effort section under the divider.",
      },
      {
        slot: "model-picker-effort-item",
        description: (
          <>
            Each effort chip. Carries{" "}
            <DocsCode>data-state=&quot;on&quot;</DocsCode> when active.
          </>
        ),
      },
    ],
    customization: [
      {
        title: "Explain unavailable models",
        description: (
          <>
            Keeping a model listed with a <DocsCode>disabledReason</DocsCode>{" "}
            answers &ldquo;where did it go?&rdquo; before it gets asked — and it
            still turns up in search, it just cannot be picked.
          </>
        ),
        example: {
          name: "model-picker-disabled-example",
          node: <ModelPickerDisabledExample />,
        },
      },
      {
        title: "Name your own effort steps",
        description: (
          <>
            <DocsCode>efforts</DocsCode> is plain data, so the scale is yours —
            two steps or six, whatever your backend accepts. The row sits
            outside the filtered list, so typing in the search box never hides
            it.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ModelPicker
  options={MODELS}
  efforts={[
    { id: "fast", label: "Fast", description: "No thinking budget" },
    { id: "think", label: "Think", description: "Reasons before answering" },
  ]}
  defaultEffort="think"
  onEffortChange={(id) => setEffort(id)}
/>`,
        },
      },
      {
        title: "Restyle the trigger",
        description: (
          <>
            The trigger is a plain button; <DocsCode>className</DocsCode> merges
            last, and its data attributes cover the open state.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ModelPicker
  options={MODELS}
  className="h-8 rounded-full border px-3 text-foreground data-[state=open]:border-ring"
/>`,
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
            matches the toolbar height.
          </>
        ),
      },
      {
        title: "Picking, and picking again",
        description: (
          <>
            Choosing a model closes the popover; choosing an effort does not, so
            a model plus its effort is one visit. The search box takes focus on
            open, and clears every time.
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
          {
            name: "className",
            type: "string",
            description: "Merged onto the trigger button.",
          },
        ],
      },
      {
        caption: "Exports",
        rows: [
          {
            name: "ChatMode",
            type: '"ask" | "plan" | "agent"',
            description: "The mode union.",
          },
          {
            name: "CHAT_MODES",
            type: "{ id, name, description, icon }[]",
            description:
              "The three modes as data. Edit this array to rename them or change the copy.",
          },
        ],
      },
    ],
    dataSlots: [
      { slot: "mode-picker-trigger", description: "The trigger button." },
      { slot: "mode-picker-content", description: "The dropdown panel." },
      { slot: "mode-picker-item", description: "Each mode row." },
    ],
    customization: [
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
          {
            name: "...props",
            type: 'React.ComponentProps<"button">',
            description: "Everything else lands on the button.",
          },
        ],
      },
    ],
    dataSlots: [{ slot: "theme-toggle", description: "The button." }],
    customization: [
      {
        title: "Square it off, tint it",
        description: (
          <>
            The icon only renders after hydration, so the server HTML and the
            first client paint always agree — the button reserves its size
            either way.
          </>
        ),
        code: {
          lang: "tsx",
          code: `<ThemeToggle
  floating={false}
  className="size-9 rounded-md border-primary/40 bg-primary/10 text-primary
             hover:bg-primary/15 hover:text-primary"
/>`,
        },
      },
      {
        title: "React to the switch",
        code: {
          lang: "tsx",
          code: `<ThemeToggle
  floating={false}
  onClick={() => analytics.track("theme_toggled")}
/>`,
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
