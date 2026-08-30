"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsNav } from "@/components/docs/nav"
import { cn } from "@/lib/utils"

export function DocsSidebarNav({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav
      data-slot="docs-nav"
      aria-label="Docs"
      className={cn("flex flex-col gap-6 text-sm", className)}
    >
      {docsNav.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {section.title}
          </p>
          {section.items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13.5px] leading-5 text-muted-foreground outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded-sm bg-primary/10 px-1 py-px text-[9.5px] font-semibold tracking-wide text-primary uppercase">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
