"use client"

import { toast } from "sonner"

import { ThemeToggle } from "@/components/ui/theme-toggle"

/**
 * Size, radius, and color are all `className`; `onClick` runs before the flip,
 * and `preventDefault()` in it keeps the theme where it is.
 */
export function ThemeToggleStyledExample() {
  return (
    <div className="flex items-center gap-3">
      <ThemeToggle floating={false} />
      <ThemeToggle
        floating={false}
        className="size-9 rounded-md border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      />
      <ThemeToggle
        floating={false}
        className="h-7 rounded-sm px-3 hover:bg-muted"
        onClick={() => toast.message("theme_toggled")}
      />
    </div>
  )
}
