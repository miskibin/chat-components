"use client"

import { useState } from "react"

import { ChatInput } from "@/components/ui/chat-input"
import { ContextMeter } from "@/components/ui/context-meter"
import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  { id: "qwen3:8b", name: "qwen3:8b", meta: "32k", contextLength: 32_768 },
  { id: "gemma3:4b", name: "gemma3:4b", meta: "8k", contextLength: 8_192 },
]

/** Rough enough for a draft: four characters to a token. */
const estimate = (text: string) => Math.ceil(text.length / 4)

export function ContextMeterToolbarExample() {
  const [model, setModel] = useState(MODELS[0].id)
  const [draft, setDraft] = useState("")

  // In a real app this is what the backend reported for the last turn.
  const spent = 5_400
  const total = MODELS.find((m) => m.id === model)?.contextLength ?? 0

  return (
    <ChatInput
      onSend={() => {}}
      onTextChange={setDraft}
      placeholder="Type — the ring fills as you go"
      tools={
        <>
          <ModelPicker value={model} onChange={setModel} options={MODELS} />
          <ContextMeter used={spent + estimate(draft)} total={total} />
        </>
      }
    />
  )
}
