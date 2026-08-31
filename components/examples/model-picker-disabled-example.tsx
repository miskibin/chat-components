"use client"

import { useState } from "react"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

/**
 * A disabled option stays visible and explains itself through
 * `disabledReason`, instead of quietly disappearing from the list.
 * Search still matches it — it just cannot be picked.
 */
const MODELS: ModelOption[] = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Fast agentic coding",
  },
  {
    id: "opus-max",
    name: "Opus Max",
    badge: "Pro",
    description: "Long-horizon reasoning",
    disabled: true,
    disabledReason: "Available on the Pro plan",
  },
  {
    id: "local-8b",
    name: "Local 8B",
    description: "Runs on this machine",
    disabled: true,
    disabledReason: "No local runtime detected",
  },
]

export function ModelPickerDisabledExample() {
  const [model, setModel] = useState("composer-2.5")

  return (
    <ModelPicker
      value={model}
      onChange={setModel}
      options={MODELS}
      label="Available models"
      side="bottom"
      className="border px-2.5"
    />
  )
}
