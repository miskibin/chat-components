import type { AgentStreamEvent } from "@/lib/cursor-agent-types"

/**
 * A scripted stand-in for the `cursor-agent` CLI.
 *
 * It emits exactly the `AgentStreamEvent` protocol `lib/cursor-agent.ts`
 * produces, so `/demo` renders a mocked run with the same code path as a real
 * one: a streamed reasoning phase, tool calls that move from `running` to
 * `done`/`error`, then a streamed markdown answer that exercises Shiki, KaTeX
 * and Mermaid. Deliberately free of Node built-ins so the serverless bundle
 * never has to load `child_process` on this path.
 */

export type MockAgentOptions = {
  prompt: string
  model?: string
  sessionId?: string
  signal?: AbortSignal
}

/** Shown by the ModelPicker when no real CLI is around to list models. */
export const MOCK_MODELS = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Simulated agent — scripted run",
  },
  {
    id: "auto",
    name: "Auto",
    badge: "Router",
    description: "Simulated agent — scripted run",
  },
  {
    id: "claude-opus-5-thinking-high",
    name: "Claude Opus 5 Thinking",
    badge: "Anthropic",
    description: "Simulated agent — scripted run",
  },
  {
    id: "gpt-5.6-sol-high",
    name: "GPT-5.6 Sol",
    badge: "OpenAI",
    description: "Simulated agent — scripted run",
  },
  {
    id: "gemini-3.7-flash-high",
    name: "Gemini 3.7 Flash",
    badge: "Google",
    description: "Simulated agent — scripted run",
  },
]

type MockStep =
  | { kind: "thinking"; text: string }
  | { kind: "text"; text: string }
  | { kind: "pause"; ms: number }
  | {
      kind: "tool"
      name: string
      input: Record<string, unknown>
      status: "done" | "error"
      output: string
      runMs?: number
    }
  | { kind: "ask"; input: Record<string, unknown> }

type Scenario = (topic: string) => MockStep[]

const MOCK_NOTE = [
  "> Simulated run — no `agent` binary was found, so the playground replayed a",
  "> scripted session to exercise every component in the registry.",
].join("\n")

const scenarios: Scenario[] = [
  streamingScenario,
  themingScenario,
  composerScenario,
]

/**
 * The after-file for the Edit below, the way `cursor-agent` streams it as
 * `streamContent`. It is what lets the demo's file panel offer a File view —
 * whole body, edited lines marked — next to the unified diff.
 */
const EDITED_FILE = [
  '"use client"',
  "",
  'import * as React from "react"',
  "",
  'import { extractToolDiff } from "@/lib/tool-diff"',
  'import { cn } from "@/lib/utils"',
  "",
  "export type ToolCall = {",
  "  id: string",
  "  name: string",
  "  input?: string",
  "  output?: string",
  "}",
  "",
  "/** One tool row: a headline, then the body it can expand into. */",
  "export function ToolRow({ tool }: { tool: ToolCall }) {",
  "  const [open, setOpen] = React.useState(false)",
  "  const diff = extractToolDiff(tool)",
  "  const showDiff = !!diff?.length",
  "  const hasBody = showDiff || !!(tool.input || tool.output)",
  "",
  "  return (",
  '    <div data-slot="tool-row" data-open={open}>',
  "      <button",
  '        type="button"',
  "        onClick={() => setOpen((value) => !value)}",
  "        disabled={!hasBody}",
  '        className={cn("flex w-full items-center gap-2", !hasBody && "opacity-60")}',
  "      >",
  '        <span className="truncate">{tool.name}</span>',
  "      </button>",
  "      {open && hasBody ? (",
  '        <div className="border-l pl-3">',
  "          {showDiff ? <ToolDiff lines={diff} /> : <pre>{tool.output}</pre>}",
  "        </div>",
  "      ) : null}",
  "    </div>",
  "  )",
  "}",
].join("\n")

export async function* runMockAgent(
  options: MockAgentOptions
): AsyncGenerator<AgentStreamEvent> {
  const { signal } = options
  const startedAt = Date.now()
  const sessionId = options.sessionId ?? newSessionId()

  yield { type: "session", sessionId }

  /* Two beats of setup before anything is generated. A real local backend
     spends this phase loading weights, which is exactly where "Thinking" is
     the wrong word — so the mock sends the same `status` events it does. */
  yield { type: "status", stage: "connecting", text: "Starting the agent" }
  await sleep(randomInt(220, 420), signal)
  if (signal?.aborted) return
  yield {
    type: "status",
    stage: "loading",
    text: `Loading ${options.model ?? "the model"} into memory`,
  }
  await sleep(randomInt(500, 900), signal)
  if (signal?.aborted) return
  yield { type: "status", stage: "thinking", text: "Waiting for the first token" }

  const topic = extractTopic(options.prompt)
  const steps = pickScenario(options.prompt)(topic)
  let toolSeq = 0
  /* Rough stand-in for a token count — the mock has no tokenizer, and the
     metadata surfaces downstream only need a plausible order of magnitude. */
  let producedChars = 0

  for (const step of steps) {
    if (signal?.aborted) return

    if (step.kind === "pause") {
      await sleep(step.ms, signal)
      continue
    }

    if (step.kind === "thinking" || step.kind === "text") {
      for (const chunk of chunkText(step.text)) {
        if (signal?.aborted) return
        producedChars += chunk.length
        yield step.kind === "thinking"
          ? { type: "thinking", text: chunk }
          : { type: "text", text: chunk }
        await sleep(randomInt(40, 115), signal)
      }
      continue
    }

    if (step.kind === "ask") {
      const id = `${sessionId}-tool-${++toolSeq}`
      const input = JSON.stringify(step.input, null, 2)
      await sleep(randomInt(120, 320), signal)
      if (signal?.aborted) return
      yield { type: "tool", id, name: "Ask Question", status: "running", input }
      continue
    }

    const id = `${sessionId}-tool-${++toolSeq}`
    const input = JSON.stringify(step.input, null, 2)

    await sleep(randomInt(120, 320), signal)
    if (signal?.aborted) return
    yield { type: "tool", id, name: step.name, status: "running", input }

    await sleep(step.runMs ?? randomInt(450, 1000), signal)
    if (signal?.aborted) return
    yield {
      type: "tool",
      id,
      name: step.name,
      status: step.status,
      input,
      output: step.output,
    }
  }

  if (signal?.aborted) return
  const durationMs = Date.now() - startedAt
  const output = Math.round(producedChars / 4)
  yield {
    type: "done",
    sessionId,
    durationMs,
    usage: {
      input: Math.round(options.prompt.length / 4) + 220,
      output,
      tokensPerSecond: durationMs > 0 ? (output / durationMs) * 1000 : undefined,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Scenarios                                                                   */
/* -------------------------------------------------------------------------- */

function streamingScenario(topic: string): MockStep[] {
  return [
    {
      kind: "thinking",
      text: [
        `The user is asking about ${topic}.`,
        "Before I answer I want to see how the message pipeline is actually wired,",
        "so: read components/ui/message.tsx, grep for the tool-call type to find",
        "every consumer, then confirm the demo page appends parts in order.",
        "If the plumbing is already there this is a docs answer plus a tiny patch.",
      ].join(" "),
    },
    { kind: "text", text: "Let me look at how a message is assembled first.\n\n" },
    {
      kind: "tool",
      name: "Read",
      input: { path: "components/ui/message.tsx", offset: 1, limit: 140 },
      status: "done",
      output: [
        "412 lines",
        'export const Message = React.memo(function Message({',
        "  content,",
        "  parts,",
        "  reasoning: reasoningProp,",
        "  reasoningDefaultOpen = false,",
        "}: MessageProps) {",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Grep",
      input: { pattern: "MessageToolCallData", path: "components", "-n": true },
      status: "done",
      output: [
        "3 files · 7 matches",
        "components/ui/message-parts.tsx:24",
        "components/ui/message.tsx:31",
        "components/ui/message-list.tsx:44",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Shell",
      input: { command: "npm run test --silent", cwd: "." },
      status: "error",
      runMs: 700,
      output: [
        'npm error Missing script: "test"',
        "npm error",
        "npm error Did you mean one of these?",
        "npm error   npm run lint",
      ].join("\n"),
    },
    { kind: "text", text: "No test script here — falling back to a type check.\n\n" },
    {
      kind: "tool",
      name: "Edit",
      input: {
        path: "components/ui/message-parts.tsx",
        // Matches cursor-agent after it folds result.success.diffString → args.diff.
        diff: [
          "--- a/components/ui/message-parts.tsx",
          "+++ b/components/ui/message-parts.tsx",
          "@@ -16,4 +16,6 @@",
          " export function ToolRow({ tool }: { tool: ToolCall }) {",
          "   const [open, setOpen] = React.useState(false)",
          "-  const hasBody = !!(tool.input || tool.output)",
          "+  const diff = extractToolDiff(tool)",
          "+  const showDiff = !!diff?.length",
          "+  const hasBody = showDiff || !!(tool.input || tool.output)",
          " ",
          "   return (",
        ].join("\n"),
        streamContent: EDITED_FILE,
      },
      status: "done",
      output: "+3 −1",
    },
    { kind: "pause", ms: 240 },
    {
      kind: "thinking",
      text: [
        "The edit landed. Ordered parts are what keep a later thought from",
        "gluing onto the first reasoning block — thinking, tool, thinking stay",
        "as three spans. I'll write that up next.",
      ].join(" "),
    },
    {
      kind: "text",
      text: [
        `\n## ${sentenceCase(topic)}\n`,
        "",
        "`MessageList` owns the scroll container and hands every entry to `Message`,",
        "which splits the payload into **ordered parts** — text, tool calls and",
        "reasoning. A streaming run can therefore interleave them without",
        "re-rendering the whole thread.",
        "",
        "The row itself lives in `components/ui/message-parts.tsx`, and the script",
        "that fakes this answer is `lib/mock-agent.ts:42` — both are inline code, so",
        "they render as file chips you can click.",
        "",
        "### The part that matters",
        "",
        "```ts",
        "type MessagePart =",
        '  | { type: "thinking"; id: string; text: string }',
        '  | { type: "text"; id: string; text: string }',
        '  | { type: "tool"; id: string; tool: MessageToolCallData }',
        "",
        "export function appendTextPart(",
        "  parts: MessagePart[],",
        "  text: string",
        "): MessagePart[] {",
        "  const last = parts.at(-1)",
        '  if (last?.type === "text") {',
        "    return [...parts.slice(0, -1), { ...last, text: last.text + text }]",
        "  }",
        '  return [...parts, { type: "text", id: crypto.randomUUID(), text }]',
        "}",
        "```",
        "",
        "| Event | Renders as | Notes |",
        "| --- | --- | --- |",
        "| `thinking` | reasoning block | Collapsible, opens while streaming |",
        "| `tool` | `MessageToolCall` | `running` → `done` / `error` |",
        "| `text` | `MessageMarkdown` | Shiki, KaTeX and Mermaid |",
        "| `done` | `GenerationStatus` | Spinner returns to `idle` |",
        "",
        "Appending to the tail part keeps each chunk $O(1)$ instead of $O(n)$, which",
        "is what stops long answers from stuttering near the end of a run.",
        "",
        "```mermaid",
        "flowchart LR",
        "  A[POST /api/chat] --> B[Agent stream]",
        "  B --> C{Event}",
        "  C -->|thinking| D[Reasoning]",
        "  C -->|tool| E[Tool call]",
        "  C -->|text| F[Markdown]",
        "```",
        "",
        MOCK_NOTE,
        "",
      ].join("\n"),
    },
  ]
}

function themingScenario(topic: string): MockStep[] {
  return [
    {
      kind: "thinking",
      text: [
        `${sentenceCase(topic)} — this one is about tokens rather than components.`,
        "Everything is Tailwind v4, so the palette lives in app/globals.css behind",
        "`@theme inline`. Let me confirm the variable names before I quote them,",
        "check the registry entry, and make sure dark mode is a class and not a",
        "media query.",
      ].join(" "),
    },
    {
      kind: "tool",
      name: "Read",
      input: { path: "app/globals.css", offset: 1, limit: 80 },
      status: "done",
      output: [
        "268 lines",
        "@import \"tailwindcss\";",
        "@custom-variant dark (&:is(.dark *));",
        "@theme inline {",
        "  --color-background: var(--background);",
        "  --color-foreground: var(--foreground);",
        "}",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Grep",
      input: { pattern: "--muted-foreground", path: "app/globals.css" },
      status: "done",
      output: "2 matches\napp/globals.css:41\napp/globals.css:96",
    },
    { kind: "text", text: "Tokens check out. Verifying the registry entry too.\n\n" },
    {
      kind: "tool",
      name: "Read",
      input: { path: "registry.json", offset: 1, limit: 20 },
      status: "error",
      runMs: 520,
      output: "ENOENT: no such file or directory, open 'registry.jsonc'",
    },
    {
      kind: "tool",
      name: "Shell",
      input: { command: "npx shadcn@latest build", cwd: "." },
      status: "done",
      output: "Building registry…\n✔ 21 items written to public/r",
    },
    { kind: "pause", ms: 240 },
    {
      kind: "text",
      text: [
        `\n## ${sentenceCase(topic)}\n`,
        "",
        "Every component reads **semantic tokens**, never raw colors. Override the",
        "variables and the whole chat surface follows — including the markdown,",
        "tool rows and the sidebar.",
        "",
        "```ts",
        "export const chatTheme = {",
        '  background: "var(--background)",',
        '  foreground: "var(--foreground)",',
        '  muted: "var(--muted-foreground)",',
        "} satisfies Record<string, `var(--${string})`>",
        "",
        "export function withAlpha(token: string, alpha: number) {",
        "  return `color-mix(in oklch, ${token} ${alpha * 100}%, transparent)`",
        "}",
        "```",
        "",
        "| Token | Used by | Dark mode |",
        "| --- | --- | --- |",
        "| `--background` | page + composer | swapped on `.dark` |",
        "| `--muted-foreground` | tool rows, metadata | swapped on `.dark` |",
        "| `--ring` | focus rings | swapped on `.dark` |",
        "",
        "Contrast stays above the $4.5{:}1$ threshold in both themes because the",
        "lightness steps are picked in OKLCH rather than sRGB.",
        "",
        MOCK_NOTE,
        "",
      ].join("\n"),
    },
  ]
}

function composerScenario(topic: string): MockStep[] {
  return [
    {
      kind: "thinking",
      text: [
        `Question is about ${topic}.`,
        "The composer is a controlled textarea with a payload shape covering text,",
        "skills and attachments. I should re-read the props before describing them,",
        "look for the send handler in the demo page, and double check the stop",
        "button really aborts the fetch rather than just hiding the spinner.",
      ].join(" "),
    },
    { kind: "text", text: "Checking the composer contract.\n\n" },
    {
      kind: "tool",
      name: "Read",
      input: { path: "components/ui/chat-input.tsx", offset: 1, limit: 120 },
      status: "done",
      output: [
        "596 lines",
        "export type ChatInputPayload = {",
        "  text: string",
        "  files: File[]",
        "  skills: string[]",
        "}",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Grep",
      input: { pattern: "abortRef", path: "app/demo/page.tsx" },
      status: "done",
      output: [
        "5 matches",
        "app/demo/page.tsx:125  const abortRef = useRef<AbortController | null>(null)",
        "app/demo/page.tsx:159  abortRef.current?.abort()",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Shell",
      input: { command: "npm run typecheck" },
      status: "error",
      runMs: 780,
      output: [
        "app/demo/page.tsx(214,7): error TS2353: Object literal may only specify",
        "known properties, and 'attachments' does not exist in type 'MessageData'.",
        "",
        "1 error — reverting the speculative edit.",
      ].join("\n"),
    },
    {
      kind: "tool",
      name: "Edit",
      input: {
        path: "app/demo/page.tsx",
        diff: [
          "--- a/app/demo/page.tsx",
          "+++ b/app/demo/page.tsx",
          "@@ -1,1 +1,1 @@",
          "-attachments: payload.files,",
          "+// Files ride along in the prompt note instead.",
        ].join("\n"),
      },
      status: "done",
      output: "+1 −1",
    },
    { kind: "pause", ms: 240 },
    {
      kind: "text",
      text: [
        `\n## ${sentenceCase(topic)}\n`,
        "",
        "`ChatInput` hands you one payload per send. Skills and attachments ride",
        "along with the text, so the transport layer stays a single call.",
        "",
        "```ts",
        "export type ChatInputPayload = {",
        "  text: string",
        "  files: File[]",
        "  skills: string[]",
        "}",
        "",
        "function handleSend(payload: ChatInputPayload) {",
        "  const controller = new AbortController()",
        "  abortRef.current = controller",
        "  return streamCursorChat(",
        "    { prompt: payload.text, model },",
        "    { onEvent, signal: controller.signal }",
        "  )",
        "}",
        "```",
        "",
        "| Prop | Type | Purpose |",
        "| --- | --- | --- |",
        "| `onSend` | `(p: ChatInputPayload) => void` | One call per submit |",
        "| `onStop` | `() => void` | Aborts the in-flight stream |",
        "| `isGenerating` | `boolean` | Swaps send for stop |",
        "| `skills` | `Skill[]` | Backs the `@` menu |",
        "",
        "Stopping aborts the `fetch`, so the server sees the disconnect and the run",
        "ends within one chunk — worst case $\\Delta t < 400\\,\\text{ms}$.",
        "",
        MOCK_NOTE,
        "",
      ].join("\n"),
    },
  ]
}

function askScenario(): MockStep[] {
  return [
    {
      kind: "thinking",
      text: [
        "The user is testing the UI and wants to use the ask tool.",
        "I'll use the AskQuestion tool to demonstrate the Ask UI component.",
      ].join(" "),
    },
    { kind: "text", text: "Using the ask tool so you can try the UI.\n\n" },
    {
      kind: "ask",
      input: {
        title: "A couple of questions",
        questions: [
          {
            id: "next",
            prompt: "What would you like to test next?",
            options: [
              { id: "options", label: "Different options (Recommended)" },
              { id: "one", label: "One question only" },
              { id: "prompt", label: "A specific prompt" },
            ],
          },
          {
            id: "focus",
            prompt: "Which areas should we focus on?",
            allow_multiple: true,
            options: [
              { id: "layout", label: "Layout" },
              { id: "keyboard", label: "Keyboard" },
              { id: "multi", label: "Multi-select" },
            ],
          },
        ],
      },
    },
  ]
}

function askFollowUpScenario(topic: string): MockStep[] {
  const skipped = /skipped/i.test(topic)
  let recap = topic
  if (!skipped) {
    try {
      recap = JSON.stringify(JSON.parse(topic), null, 2)
    } catch {
      /* keep raw */
    }
  }
  return [
    {
      kind: "thinking",
      text: skipped
        ? [
            "The user skipped the questions.",
            "I'll let them know they can ask me to fire the ask tool again with different prompts whenever they want to keep testing.",
          ].join(" ")
        : [
            "The user answered the questions.",
            "I'll recap what they picked and offer to run the questionnaire again.",
          ].join(" "),
    },
    {
      kind: "text",
      text: skipped
        ? [
            "The ask tool ran with two questions (single-select **What would you like to test next?** and multi-select **Which areas should we focus on?**). You skipped it, so nothing was selected.",
            "",
            "If you want to keep testing the UI, say what you'd like — e.g. different options, one question only, or a specific prompt — and I'll trigger it again.",
            "",
            MOCK_NOTE,
            "",
          ].join("\n")
        : [
            "Got it — I recorded your answers from the questionnaire.",
            "",
            "```json",
            recap,
            "```",
            "",
            "Say the word if you want another round with different prompts.",
            "",
            MOCK_NOTE,
            "",
          ].join("\n"),
    },
  ]
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export function isAskDemoPrompt(prompt: string) {
  const trimmed = prompt.trim()
  if (/^askquestion result:/i.test(trimmed)) return true
  return /\bask\s+tool\b|askquestion|questions panel/i.test(trimmed)
}

function pickScenario(prompt: string): Scenario {
  if (isAskDemoPrompt(prompt)) {
    return /^askquestion result:/i.test(prompt.trim())
      ? askFollowUpScenario
      : askScenario
  }
  const lower = prompt.toLowerCase()
  if (/(theme|color|token|dark mode|css|style|registry)/.test(lower)) {
    return themingScenario
  }
  if (/(input|composer|attach|upload|skill|slash|stop|abort)/.test(lower)) {
    return composerScenario
  }
  if (/(stream|message|markdown|tool|reason)/.test(lower)) {
    return streamingScenario
  }
  return scenarios[hash(prompt) % scenarios.length]
}

/** A short, human-readable stand-in for what the user asked about. */
function extractTopic(prompt: string): string {
  const cleaned = prompt
    .replace(/\[skills:[^\]]*\]/gi, " ")
    .replace(/\n\nAttached:[\s\S]*$/i, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned) return "this codebase"
  const askResult = cleaned.match(/^AskQuestion result:\s*([\s\S]+)$/i)
  if (askResult) return askResult[1].trim() || "skipped"
  const firstSentence = cleaned.split(/[.?!]\s/)[0] ?? cleaned
  const trimmed = firstSentence.replace(/[.?!]+$/, "")
  return trimmed.length > 72 ? `${trimmed.slice(0, 71)}…` : trimmed
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function hash(value: string) {
  let acc = 0
  for (let i = 0; i < value.length; i++) {
    acc = (acc * 31 + value.charCodeAt(i)) >>> 0
  }
  return acc
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** Splits on whitespace so chunks never cut a word or a markdown fence apart. */
function chunkText(text: string, min = 2, max = 6): string[] {
  const tokens = text.split(/(\s+)/).filter(Boolean)
  const chunks: string[] = []
  let index = 0
  while (index < tokens.length) {
    const size = randomInt(min, max) * 2
    chunks.push(tokens.slice(index, index + size).join(""))
    index += size
  }
  return chunks
}

/** Resolves early when the request is aborted so a stopped run exits at once. */
function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }
    const finish = () => {
      clearTimeout(timer)
      signal?.removeEventListener("abort", finish)
      resolve()
    }
    const timer = setTimeout(finish, ms)
    signal?.addEventListener("abort", finish, { once: true })
  })
}

function newSessionId() {
  const rand = Math.random().toString(36).slice(2, 8)
  return `mock-${Date.now().toString(36)}-${rand}`
}
