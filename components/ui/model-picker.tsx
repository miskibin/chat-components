"use client"

import { Check, ChevronDown, Cpu } from "lucide-react"
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"

export type ModelOption = {
  id: string
  name: string
  badge?: string
  description?: string
  meta?: string
  disabled?: boolean
  disabledReason?: string
}

export type ModelPickerProps = {
  value?: string
  defaultValue?: string
  onChange?: (id: string) => void
  options: ModelOption[]
  placeholder?: string
  disabled?: boolean
  /** Composer opens upward; navbar opens downward. */
  align?: "up" | "down"
  className?: string
}

export function ModelPicker({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "Model",
  disabled = false,
  align = "up",
  className,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.id ?? ""
  )
  const selectedId = value ?? internal
  const ref = useRef<HTMLDivElement | null>(null)
  const current =
    options.find((m) => m.id === selectedId) ?? options[0] ?? null

  const pick = (option: ModelOption) => {
    if (option.disabled) return
    setInternal(option.id)
    onChange?.(option.id)
    setOpen(false)
  }

  useClickOutside(
    ref,
    useCallback(() => setOpen(false), []),
    open
  )

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((o) => !o)}
        title="Change model"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "transparent",
          border: 0,
          color: "var(--muted-foreground)",
          fontFamily: "inherit",
          fontSize: 12,
        }}
        onMouseEnter={(e) => {
          if (disabled) return
          e.currentTarget.style.background = "var(--muted)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
        }}
      >
        <Cpu className="h-3.5 w-3.5" />
        <span>{current?.name ?? placeholder}</span>
        {current?.badge ? <ModelBadge>{current.badge}</ModelBadge> : null}
        <ChevronDown
          className="h-3 w-3 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && (
        <div
          className="animate-in fade-in zoom-in-95 duration-150 absolute left-0 z-30 min-w-[280px] rounded-xl p-1"
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
          <div
            className="px-3 pb-1 pt-2 uppercase"
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              letterSpacing: ".04em",
            }}
          >
            Models
          </div>
          {options.map((m) => {
            const selectable = !m.disabled
            return (
              <button
                key={m.id}
                type="button"
                disabled={!selectable}
                onClick={() => pick(m)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left"
                style={{
                  background: "transparent",
                  border: 0,
                  opacity: selectable ? 1 : 0.55,
                  cursor: selectable ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => {
                  if (!selectable) return
                  e.currentTarget.style.background = "var(--muted)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <div
                  className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <Cpu className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{
                        fontFamily: "inherit",
                        fontSize: 13,
                        color: "var(--foreground)",
                      }}
                    >
                      {m.name}
                    </span>
                    {m.badge ? <ModelBadge>{m.badge}</ModelBadge> : null}
                  </div>
                  {(m.description || m.meta) && (
                    <div
                      className="mt-0.5"
                      style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                    >
                      {[m.description, m.meta].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {m.disabledReason ? (
                    <div
                      className="mt-1"
                      style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                    >
                      {m.disabledReason}
                    </div>
                  ) : null}
                </div>
                {m.id === selectedId && selectable ? (
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--primary)" }}
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ModelBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-sm"
      style={{
        fontSize: 9.5,
        padding: "1px 5px",
        background: "color-mix(in oklab, var(--primary) 12%, var(--background))",
        color: "var(--primary)",
        fontWeight: 600,
        letterSpacing: ".02em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  )
}
