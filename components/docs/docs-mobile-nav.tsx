"use client"

import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import { DocsSidebarNav } from "@/components/docs/docs-sidebar-nav"
import { cn } from "@/lib/utils"

/**
 * Off-canvas nav for small screens. It mounts under the sticky header, so the
 * header controls stay reachable while the drawer is open.
 */
export function DocsMobileNav() {
  const pathname = usePathname()
  // The drawer is open *for one route*, so any navigation — link, back, or
  // forward — closes it without an effect.
  const [openPath, setOpenPath] = React.useState<string | null>(null)
  const open = openPath === pathname
  const setOpen = React.useCallback(
    (next: boolean) => setOpenPath(next ? pathname : null),
    [pathname]
  )

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="-ml-1 inline-grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden [&_svg]:size-4"
      >
        {open ? <X /> : <Menu />}
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-x-0 top-14 bottom-0 z-40 bg-foreground/20 backdrop-blur-[1px] transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        data-slot="docs-mobile-nav"
        hidden={!open}
        className={cn(
          "fixed inset-x-0 top-14 z-40 max-h-[calc(100svh-3.5rem)] overflow-y-auto border-b bg-background px-4 py-6 shadow-lg md:hidden",
          "animate-in fade-in slide-in-from-top-2 duration-200"
        )}
      >
        <DocsSidebarNav onNavigate={() => setOpen(false)} />
      </div>
    </>
  )
}
