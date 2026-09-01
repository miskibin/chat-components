"use client"

import { useState } from "react"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

/**
 * Past `searchThreshold` the list grows a search field — the case a local
 * runtime's whole model directory lands in the picker.
 */
const MODELS: ModelOption[] = [
  { id: "llama3.2:3b", name: "llama3.2:3b", badge: "llama", meta: "2.0 GB" },
  { id: "llama3.1:8b", name: "llama3.1:8b", badge: "llama", meta: "4.7 GB" },
  { id: "llama3.1:70b", name: "llama3.1:70b", badge: "llama", meta: "40 GB" },
  { id: "qwen2.5:7b", name: "qwen2.5:7b", badge: "qwen2", meta: "4.4 GB" },
  { id: "qwen2.5-coder:14b", name: "qwen2.5-coder:14b", badge: "qwen2", meta: "9.0 GB" },
  { id: "mistral:7b", name: "mistral:7b", badge: "llama", meta: "4.1 GB" },
  { id: "mixtral:8x7b", name: "mixtral:8x7b", badge: "llama", meta: "26 GB" },
  { id: "gemma2:9b", name: "gemma2:9b", badge: "gemma2", meta: "5.4 GB" },
  { id: "phi3.5:3.8b", name: "phi3.5:3.8b", badge: "phi3", meta: "2.2 GB" },
  { id: "deepseek-r1:14b", name: "deepseek-r1:14b", badge: "qwen2", meta: "9.0 GB" },
]

export function ModelPickerSearchExample() {
  const [model, setModel] = useState(MODELS[0].id)

  return (
    <ModelPicker
      value={model}
      onChange={setModel}
      options={MODELS}
      side="bottom"
      searchPlaceholder="Search installed models…"
    />
  )
}
