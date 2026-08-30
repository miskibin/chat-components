import Link from "next/link"
import type { ReactNode } from "react"

import { REPO_URL } from "@/components/docs/nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

/** GitHub mark — lucide ships no brand icons. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

const headerLink =
  "rounded-md px-2 py-1 text-[13.5px] text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function SiteHeader({
  mobileNav,
  className,
}: {
  mobileNav?: ReactNode
  className?: string
}) {
  return (
    <header
      data-slot="site-header"
      className={cn(
        "sticky top-0 z-50 h-14 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-4 md:px-8">
        {mobileNav}
        <Link
          href="/"
          className="mr-2 rounded-md text-[14px] font-semibold tracking-tight text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Chat Components
        </Link>
        <nav className="flex items-center gap-0.5">
          <Link href="/docs" className={headerLink}>
            Docs
          </Link>
          <Link href="/demo" className={cn(headerLink, "max-sm:hidden")}>
            Playground
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-1">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="inline-grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <GitHubMark />
          </a>
          <ThemeToggle floating={false} />
        </div>
      </div>
    </header>
  )
}
