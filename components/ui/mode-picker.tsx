"use client"

import { Bot, ChevronDown, ListTodo, MessageCircle } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"

export type ChatMode = "ask" | "plan" | "agent"

const MODES: {
  id: ChatMode
  name: string
  description: string
  icon: typeof Bot
}[] = [
  {
    id: "ask",
    name: "Ask",
    description: "Read-only answers, no edits",
    icon: MessageCircle,
  },
  {
    id: "plan",
    name: "Plan",
    description: "Analyze and propose a plan",
    icon: ListTodo,
  },
  {
    id: "agent",
    name: "Agent",
    description: "Edit files and run commands",
    icon: Bot,
  },
]

export type ModePickerProps = {
  value?: ChatMode
  defaultValue?: ChatMode
  onChange?: (mode: ChatMode) => void
  disabled?: boolean
  align?: "up" | "down"
  className?: string
}

export function ModePicker({
  value,
  defaultValue = "agent",
  onChange,
  disabled = false,
  align = "up",
  className,
}: ModePickerProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(defaultValue)
  const selectedId = value ?? internal
  const ref = useRef<HTMLDivElement | null>(null)
  const current = MODES.find((m) => m.id === selectedId) ?? MODES[2]
  const Icon = current.icon

  useClickOutside(
    ref,
    useCallback(() => setOpen(false), []),
    open
  )

  const pick = (mode: ChatMode) => {
    setInternal(mode)
    onChange?.(mode)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        title="Change mode"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[12px]">{current.name}</span>
        <ChevronDown
          className="h-3 w-3 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open ? (
        <div
          className="animate-in fade-in zoom-in-95 duration-150 absolute left-0 z-30 min-w-[220px] rounded-xl p-1"
          style={{
            ...(align === "up"
              ? { bottom: "calc(100% + 8px)" }
              : { top: "calc(100% + 8px)" }),
            background: "var(--popover)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 12px 32px -8px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.04)",
          }}
        >
          <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Mode
          </div>
          {MODES.map((mode) => {
            const ModeIcon = mode.icon
            const selected = mode.id === selectedId
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => pick(mode.id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-muted"
              >
                <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border border-border bg-muted">
                  <ModeIcon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-foreground">{mode.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {mode.description}
                  </div>
                </div>
                {selected ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
