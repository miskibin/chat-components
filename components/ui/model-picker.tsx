"use client"

import { Check, ChevronDown, Cpu } from "lucide-react"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  /** Which way the menu opens. Composers open "top", navbars open "bottom". */
  side?: "top" | "bottom"
  label?: string
  className?: string
}

export function ModelPicker({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "Model",
  disabled = false,
  side = "top",
  label = "Models",
  className,
}: ModelPickerProps) {
  const [internal, setInternal] = React.useState(
    defaultValue ?? options[0]?.id ?? ""
  )
  const selectedId = value ?? internal
  const current = options.find((m) => m.id === selectedId) ?? options[0] ?? null

  const pick = React.useCallback(
    (option: ModelOption) => {
      if (option.disabled) return
      setInternal(option.id)
      onChange?.(option.id)
    },
    [onChange]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="model-picker-trigger"
          disabled={disabled || options.length === 0}
          title="Change model"
          className={cn(
            "group inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md px-2 text-[12px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted data-[state=open]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
            className
          )}
        >
          <Cpu className="size-3.5" />
          <span className="truncate">{current?.name ?? placeholder}</span>
          {current?.badge ? <ModelBadge>{current.badge}</ModelBadge> : null}
          <ChevronDown className="size-3 opacity-60 transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="model-picker-content"
        side={side}
        align="start"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(20rem,calc(100vw-1.5rem))]"
      >
        <DropdownMenuLabel className="px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </DropdownMenuLabel>
        {options.map((model) => (
          <DropdownMenuItem
            key={model.id}
            data-slot="model-picker-item"
            disabled={model.disabled}
            onSelect={() => pick(model)}
            className="items-start gap-2.5 py-2"
          >
            <span className="mt-px grid size-6 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground">
              <Cpu className="size-3" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[13px] text-foreground">
                  {model.name}
                </span>
                {model.badge ? <ModelBadge>{model.badge}</ModelBadge> : null}
              </span>
              {model.description || model.meta ? (
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {[model.description, model.meta].filter(Boolean).join(" · ")}
                </span>
              ) : null}
              {model.disabledReason ? (
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {model.disabledReason}
                </span>
              ) : null}
            </span>
            {model.id === selectedId && !model.disabled ? (
              <Check className="mt-1 size-3.5 shrink-0 !text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ModelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="model-picker-badge"
      className="shrink-0 rounded-sm bg-primary/10 px-1 py-px text-[9.5px] font-semibold tracking-wide text-primary uppercase"
    >
      {children}
    </span>
  )
}
