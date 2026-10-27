"use client"

import { ChevronDown, ShieldCheck } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { ChatInput, chatInputButtonVariants } from "@/components/ui/chat-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModePicker } from "@/components/ui/mode-picker"
import { ModelPicker } from "@/components/ui/model-picker"
import { cn } from "@/lib/utils"

const MODELS = [
  { id: "composer-2.5", name: "Composer 2.5" },
  { id: "claude-opus-4.6", name: "Claude Opus 4.6" },
]

const ACCESS = [
  { id: "read-only", label: "Read only" },
  { id: "edits", label: "Edit files" },
  { id: "full", label: "Full access" },
]

/**
 * Drag the width down. The row first drops every `data-composer-label` (the
 * pickers keep their icons), then hides what is marked
 * `data-composer-overflow` and offers it from "…" — `toolsMenu` — instead of
 * wrapping onto a second line.
 */
export function ChatInputFoldingExample() {
  const [width, setWidth] = React.useState(100)
  const [access, setAccess] = React.useState("edits")
  const current = ACCESS.find((option) => option.id === access)

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <label className="flex items-center gap-3 px-1 text-[12px] text-muted-foreground">
        Width
        <input
          type="range"
          min={45}
          max={100}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          className="w-40 accent-primary"
        />
        <span className="tabular-nums">{width}%</span>
      </label>
      <div style={{ width: `${width}%` }}>
        <ChatInput
          placeholder="Ask anything"
          tools={
            <>
              <ModePicker side="top" />
              <ModelPicker side="top" options={MODELS} className="min-w-0" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* The one control that may leave the row for the "…" menu. */}
                  <button
                    type="button"
                    data-composer-overflow
                    className={cn(chatInputButtonVariants(), "data-[state=open]:bg-muted")}
                  >
                    <ShieldCheck />
                    <span data-composer-label>{current?.label}</span>
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                  <AccessItems value={access} onChange={setAccess} />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          toolsMenu={
            <>
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                Access
              </DropdownMenuLabel>
              <AccessItems value={access} onChange={setAccess} />
            </>
          }
          onSend={({ text }) => toast("Sent", { description: text })}
        />
      </div>
    </div>
  )
}

function AccessItems({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
      {ACCESS.map((option) => (
        <DropdownMenuRadioItem key={option.id} value={option.id}>
          {option.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}
