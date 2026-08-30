"use client"

import { useState } from "react"

import { ModePicker, type ChatMode } from "@/components/ui/mode-picker"
import { ModelPicker } from "@/components/ui/model-picker"

const MODELS = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Fast agentic coding",
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

export function PickersExample() {
  const [model, setModel] = useState(MODELS[0].id)
  const [mode, setMode] = useState<ChatMode>("agent")

  return (
    <div className="flex min-h-[400px] flex-wrap items-center justify-center gap-2 px-4">
      <ModePicker value={mode} onChange={setMode} side="bottom" />
      <ModelPicker
        value={model}
        onChange={setModel}
        options={MODELS}
        side="bottom"
      />
    </div>
  )
}
