"use client"

import { useState } from "react"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor" },
  { id: "gpt-5.4", name: "GPT-5.4", badge: "OpenAI" },
]

/** `efforts` is plain data, so the scale is whatever your backend accepts. */
export function ModelPickerEffortsExample() {
  const [effort, setEffort] = useState("think")

  return (
    <ModelPicker
      options={MODELS}
      side="bottom"
      efforts={[
        { id: "fast", label: "Fast", description: "No thinking budget" },
        { id: "think", label: "Think", description: "Reasons before answering" },
        { id: "deep", label: "Deep", description: "Plans, then verifies" },
      ]}
      effort={effort}
      onEffortChange={setEffort}
      effortLabel="Budget"
    />
  )
}
