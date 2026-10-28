"use client"

import { useState } from "react"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

/**
 * `icon` puts a mark on each row and, once picked, on the trigger. A host
 * usually resolves it from the id — `qwen/qwen3-coder` and `qwen3:8b` both
 * read as Qwen — so the mark follows the model family, not where it is served.
 */
function Mark({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const CIRCLE = "M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3Z"
const SQUARE = "M3.5 3.5h9v9h-9z"
const DIAMOND = "M8 2.5 13.5 8 8 13.5 2.5 8Z"

const MODELS: ModelOption[] = [
  { id: "openai/gpt-5.4", name: "GPT-5.4", icon: <Mark d={CIRCLE} /> },
  { id: "openai/gpt-5.4-mini", name: "GPT-5.4 mini", icon: <Mark d={CIRCLE} /> },
  { id: "qwen/qwen3-coder", name: "Qwen3 Coder", icon: <Mark d={SQUARE} /> },
  { id: "ollama/qwen3:8b", name: "qwen3:8b", meta: "5.2 GB", icon: <Mark d={SQUARE} /> },
  { id: "mistral/devstral", name: "Devstral", icon: <Mark d={DIAMOND} /> },
  // No mark: the row keeps its text where the others keep theirs.
  { id: "local/custom-ft", name: "custom-ft" },
]

export function ModelPickerIconsExample() {
  const [model, setModel] = useState(MODELS[2].id)

  return (
    <ModelPicker
      value={model}
      onChange={setModel}
      options={MODELS}
      side="bottom"
      className="border px-2.5"
    />
  )
}
