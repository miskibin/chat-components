"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ChatNavbarProps = {
  title?: ReactNode
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export function ChatNavbar({
  title,
  left,
  right,
  className,
}: ChatNavbarProps) {
  return (
    <div
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {left}
        {title ? (
          typeof title === "string" ? (
            <h1 className="truncate text-[14px] font-medium text-foreground">
              {title}
            </h1>
          ) : (
            title
          )
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </div>
  )
}
