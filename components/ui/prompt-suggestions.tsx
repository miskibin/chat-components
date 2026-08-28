"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type PromptSuggestion = {
  id?: string
  label: string
  icon?: ReactNode
}

export type PromptSuggestionsProps = {
  items: PromptSuggestion[]
  onSelect?: (item: PromptSuggestion) => void
  className?: string
}

export function PromptSuggestions({
  items,
  onSelect,
  className,
}: PromptSuggestionsProps) {
  if (items.length === 0) return null

  return (
    <ul
      className={cn("mx-auto w-full max-w-4xl px-8 pt-3", className)}
      role="list"
    >
      {items.map((item, index) => (
        <li key={item.id ?? `${item.label}-${index}`}>
          <button
            type="button"
            onClick={() => onSelect?.(item)}
            className="group flex w-full items-start gap-2.5 py-2 text-left text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.icon ? (
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center text-muted-foreground/80 group-hover:text-foreground [&_svg]:size-4">
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
