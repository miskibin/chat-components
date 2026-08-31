"use client"

import { Check, ChevronDown, Cpu } from "lucide-react"
import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

export type ModelEffortOption = {
  id: string
  label: string
  description?: string
}

/** Pass this to `efforts` to get the usual four-step reasoning scale. */
export const DEFAULT_MODEL_EFFORTS: ModelEffortOption[] = [
  { id: "low", label: "Low", description: "Fastest, shallowest answers." },
  { id: "medium", label: "Medium", description: "Balanced speed and depth." },
  { id: "high", label: "High", description: "Thinks longer before answering." },
  {
    id: "xhigh",
    label: "Extra High",
    description: "Maximum reasoning budget. Slowest.",
  },
]

export type ModelPickerProps = {
  options: ModelOption[]
  value?: string
  defaultValue?: string
  onChange?: (id: string) => void
  /** Reasoning-effort options. `false` (the default) hides the section. */
  efforts?: ModelEffortOption[] | false
  effort?: string
  defaultEffort?: string
  onEffortChange?: (id: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  /** Which way the popover opens. Composers open "top", navbars open "bottom". */
  side?: "top" | "bottom"
  label?: string
  effortLabel?: string
  className?: string
}

export function ModelPicker({
  options,
  value,
  defaultValue,
  onChange,
  efforts = false,
  effort,
  defaultEffort,
  onEffortChange,
  placeholder = "Model",
  searchPlaceholder = "Search models…",
  emptyMessage = "No models found.",
  disabled = false,
  side = "top",
  label = "Models",
  effortLabel = "Reasoning effort",
  className,
}: ModelPickerProps) {
  const effortOptions = efforts === false ? null : efforts

  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlighted, setHighlighted] = React.useState("")

  const [internalModel, setInternalModel] = React.useState(
    defaultValue ?? options[0]?.id ?? ""
  )
  const [internalEffort, setInternalEffort] = React.useState(
    defaultEffort ?? effortOptions?.[0]?.id ?? ""
  )

  const selectedId = value ?? internalModel
  const current = options.find((m) => m.id === selectedId) ?? options[0] ?? null

  const selectedEffortId = effort ?? internalEffort
  const currentEffort =
    effortOptions?.find((e) => e.id === selectedEffortId) ?? null

  const pickModel = React.useCallback(
    (option: ModelOption) => {
      if (option.disabled) return
      setInternalModel(option.id)
      onChange?.(option.id)
      setOpen(false)
    },
    [onChange]
  )

  const pickEffort = React.useCallback(
    (option: ModelEffortOption) => {
      setInternalEffort(option.id)
      onEffortChange?.(option.id)
    },
    [onEffortChange]
  )

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) {
        setSearch("")
        setHighlighted(current?.name ?? "")
      }
    },
    [current?.name]
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
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
          {currentEffort ? (
            <span className="shrink-0 text-muted-foreground">
              · {currentEffort.label}
            </span>
          ) : null}
          <ChevronDown className="size-3 opacity-60 transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="model-picker-content"
        side={side}
        align="start"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        <Command
          loop
          value={highlighted}
          onValueChange={setHighlighted}
          className="bg-transparent"
        >
          <CommandInput
            data-slot="model-picker-search"
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
            className="text-[13px]"
          />
          <CommandList
            data-slot="model-picker-list"
            className="max-h-[min(18rem,50vh)]"
          >
            <CommandEmpty className="py-6 text-center text-[12px] text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup heading={label}>
              {options.map((model) => (
                <CommandItem
                  key={model.id}
                  data-slot="model-picker-item"
                  value={model.name}
                  keywords={[model.badge, model.description, model.meta].filter(
                    (k): k is string => Boolean(k)
                  )}
                  disabled={model.disabled}
                  onSelect={() => pickModel(model)}
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
                        {[model.description, model.meta]
                          .filter(Boolean)
                          .join(" · ")}
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {effortOptions && effortOptions.length > 0 ? (
          <div
            data-slot="model-picker-effort"
            role="group"
            aria-label={effortLabel}
            className="border-t p-1.5"
          >
            <span className="block px-1 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {effortLabel}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {effortOptions.map((option) => {
                const active = option.id === selectedEffortId
                return (
                  <button
                    key={option.id}
                    type="button"
                    data-slot="model-picker-effort-item"
                    data-state={active ? "on" : "off"}
                    aria-pressed={active}
                    title={option.description}
                    onClick={() => pickEffort(option)}
                    className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[11px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-muted data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0"
                  >
                    {active ? (
                      <Check className="size-3 !text-primary" />
                    ) : null}
                    {option.label}
                  </button>
                )
              })}
            </div>
            {currentEffort?.description ? (
              <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                {currentEffort.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
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
