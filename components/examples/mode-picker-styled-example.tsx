"use client"

import { useState } from "react"

import { ModePicker, type ChatMode } from "@/components/ui/mode-picker"

/** The trigger takes `className` last, and opens either way through `side`. */
export function ModePickerStyledExample() {
  const [mode, setMode] = useState<ChatMode>("plan")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ModePicker value={mode} onChange={setMode} side="bottom" />
      <ModePicker
        value={mode}
        onChange={setMode}
        side="bottom"
        className="h-8 rounded-full border border-primary/30 bg-primary/10 px-3 text-primary hover:bg-primary/15 hover:text-primary"
      />
      <ModePicker value={mode} onChange={setMode} side="bottom" disabled />
    </div>
  )
}
