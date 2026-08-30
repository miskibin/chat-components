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
      "Collision-aware model selector with badges, descriptions, and disabled options that explain themselves.",
    registry: "model-picker",
    registryDependencies: ["dropdown-menu"],
    preview: { name: "model-picker-example", node: <ModelPickerExample /> },
    usage: `"use client"

import { useState } from "react"
import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor" },
  { id: "gpt-5.4", name: "GPT-5.4", badge: "OpenAI" },
]

export function Picker() {
  const [model, setModel] = useState(MODELS[0].id)
  return <ModelPicker value={model} onChange={setModel} options={MODELS} />
}`,
    props: [
      {
        caption: "ModelPicker",
        rows: [
          {
            name: "options",
            type: "ModelOption[]",
            required: true,
            description:
              "The menu contents. An empty array disables the trigger.",
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
            description: "Fired on pick. Disabled options never fire it.",
          },
          {
            name: "side",
            type: '"top" | "bottom"',
            default: '"top"',
            description:
              "Which way the menu opens. Composers open top, navbars open bottom.",
          },
          {
            name: "placeholder",
            type: "string",
            default: '"Model"',
            description: "Trigger label when nothing is selected.",
          },
          {
            name: "label",
            type: "string",
            default: '"Models"',
            description: "Heading above the option list.",
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
    ],
    dataSlots: [
      { slot: "model-picker-trigger", description: "The trigger button." },
      { slot: "model-picker-content", description: "The dropdown panel." },
      { slot: "model-picker-item", description: "Each option row." },
      { slot: "model-picker-badge", description: "The uppercase provider tag." },
    ],
    customization: [
      {
        title: "Explain unavailable models",
        description: (
          <>
            Keeping a model listed with a <DocsCode>disabledReason</DocsCode>{" "}
            answers &ldquo;where did it go?&rdquo; before it gets asked.
          </>
        ),
        example: {
          name: "model-picker-disabled-example",
          node: <ModelPickerDisabledExample />,
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
