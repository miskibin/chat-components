"use client"

import { useState } from "react"

import {
  ModelPicker,
  type ModelOption,
  type ModelPickerGroup,
} from "@/components/ui/model-picker"

/**
 * `groups` sections the list without changing what an option is: each model
 * names its group by id, and the group order is the section order. A group
 * heading takes an optional icon — a brand mark, usually.
 */
const GROUPS: ModelPickerGroup[] = [
  {
    id: "cloud",
    label: "Cloud",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5" fill="currentColor" />
      </svg>
    ),
  },
  { id: "open", label: "Open weights" },
  { id: "local", label: "On this machine" },
]

const MODELS: ModelOption[] = [
  { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor", group: "cloud" },
  { id: "gpt-5.4", name: "GPT-5.4", badge: "OpenAI", group: "cloud" },
  { id: "grok-code", name: "Grok Code", badge: "xAI", group: "cloud" },
  { id: "llama3.1:70b", name: "Llama 3.1 70B", badge: "Meta", group: "open" },
  { id: "qwen2.5:32b", name: "Qwen 2.5 32B", badge: "Qwen", group: "open" },
  { id: "mixtral:8x7b", name: "Mixtral 8x7B", badge: "Mistral", group: "open" },
  { id: "llama3.2:3b", name: "llama3.2:3b", meta: "2.0 GB", group: "local" },
  { id: "qwen2.5-coder:7b", name: "qwen2.5-coder:7b", meta: "4.7 GB", group: "local" },
  { id: "phi3.5:3.8b", name: "phi3.5:3.8b", meta: "2.2 GB", group: "local" },
]

export function ModelPickerGroupsExample() {
  const [model, setModel] = useState(MODELS[0].id)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Plain list: the headings sit between runs of menu items. */}
      <ModelPicker
        value={model}
        onChange={setModel}
        options={MODELS}
        groups={GROUPS}
        side="bottom"
        searchThreshold={12}
        className="border px-2.5"
      />
      {/* Past the threshold the same sections become cmdk groups, and the
          search field matches the group label too — try "machine". */}
      <ModelPicker
        value={model}
        onChange={setModel}
        options={MODELS}
        groups={GROUPS}
        side="bottom"
        searchPlaceholder="Search models…"
        className="border px-2.5"
      />
    </div>
  )
}
