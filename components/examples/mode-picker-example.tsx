"use client"

import { useState } from "react"

import { ModePicker, type ChatMode } from "@/components/ui/mode-picker"

export function ModePickerExample() {
  const [mode, setMode] = useState<ChatMode>("agent")

  return (
    <div className="flex flex-col items-center gap-3">
      <ModePicker value={mode} onChange={setMode} side="bottom" />
      <p className="text-[13px] text-muted-foreground">
        Selected mode: <span className="text-foreground">{mode}</span>
      </p>
    </div>
  )
}
