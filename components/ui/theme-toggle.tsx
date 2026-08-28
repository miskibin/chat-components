"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export type ThemeToggleProps = {
  className?: string
  /** Fixed floating chip (default) or inline. */
  floating?: boolean
}

export function ThemeToggle({
  className,
  floating = true,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-border bg-muted text-muted-foreground transition hover:opacity-80",
        floating && "fixed top-3 right-3 z-50",
        className
      )}
    >
      {mounted ? isDark ? <Sun size={16} /> : <Moon size={16} /> : null}
    </button>
  )
}
