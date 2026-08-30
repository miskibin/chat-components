"use client"

import { useState } from "react"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Fast agentic coding",
    meta: "200k context",
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    badge: "OpenAI",
    description: "General reasoning",
  },
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    badge: "Anthropic",
    description: "Deep analysis",
  },
]

export function ModelPickerExample() {
  const [model, setModel] = useState(MODELS[0].id)

  return (
    <ModelPicker
      value={model}
      onChange={setModel}
      options={MODELS}
      side="bottom"
    />
  )
}
