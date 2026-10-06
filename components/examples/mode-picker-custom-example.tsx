"use client"

import { useState } from "react"
import { ModePicker, type ChatMode, type ChatModeOption } from "@/components/ui/mode-picker"

const MODES: ChatModeOption[] = [
  { id: "ask", name: "Pytanie", description: "Odpowiedź z faktami i źródłami" },
  { id: "plan", name: "Plan", description: "Plan analizy lub kolejnych kroków" },
  { id: "agent", name: "Asystent", description: "Wyszukuje dane i przygotowuje dokumenty" },
]

export function ModePickerCustomExample() {
  const [mode, setMode] = useState<ChatMode>("agent")
  return <ModePicker modes={MODES} value={mode} onChange={setMode} label="Tryb" triggerLabel="Zmień tryb" side="bottom" />
}
