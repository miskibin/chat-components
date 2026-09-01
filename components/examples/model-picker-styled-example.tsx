"use client"

import { ModelPicker, type ModelOption } from "@/components/ui/model-picker"

const MODELS: ModelOption[] = [
  { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor" },
  { id: "gpt-5.4", name: "GPT-5.4", badge: "OpenAI" },
  { id: "grok-code", name: "Grok Code", badge: "xAI" },
]

/**
 * The trigger is a plain button, so `className` merges last — and the popover
 * is reachable through the `model-picker-content` slot.
 */
export function ModelPickerStyledExample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ModelPicker
        options={MODELS}
        side="bottom"
        className="h-8 rounded-full border px-3 text-foreground data-[state=open]:border-ring"
      />
      <ModelPicker
        options={MODELS}
        side="bottom"
        placeholder="Pick a model"
        className="h-8 rounded-md bg-primary/10 px-3 text-primary hover:bg-primary/15 hover:text-primary [&_[data-slot=model-picker-badge]]:text-primary/70"
      />
    </div>
  )
}
