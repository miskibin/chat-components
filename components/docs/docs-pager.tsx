"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsNav, type DocsNavItem } from "@/components/docs/nav"
import { cn } from "@/lib/utils"

const flat: DocsNavItem[] = docsNav.flatMap((section) => section.items)

const pagerLink =
  "flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13.5px] text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"

/** Previous / next links in reading order, matching the sidebar. */
export function DocsPager({ className }: { className?: string }) {
  const pathname = usePathname()
  const index = flat.findIndex((item) => item.href === pathname)
  if (index === -1) return null

  const prev = index > 0 ? flat[index - 1] : null
  const next = index < flat.length - 1 ? flat[index + 1] : null
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Pagination"
      data-slot="docs-pager"
      className={cn("flex items-center justify-between gap-3", className)}
    >
      {prev ? (
        <Link href={prev.href} className={pagerLink}>
          <ChevronLeft />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className={cn(pagerLink, "ml-auto")}>
          <span className="truncate">{next.title}</span>
          <ChevronRight />
        </Link>
      ) : null}
    </nav>
  )
}
