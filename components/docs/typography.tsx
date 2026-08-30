import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** Section heading with a stable anchor id, so the page rail can link to it. */
export function DocsH2({
  children,
  id,
  className,
}: {
  children: string
  id?: string
  className?: string
}) {
  return (
    <h2
      id={id ?? slugify(children)}
      className={cn(
        "scroll-mt-24 text-xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h2>
  )
}

export function DocsH3({
  children,
  id,
  className,
}: {
  children: string
  id?: string
  className?: string
}) {
  return (
    <h3
      id={id ?? slugify(children)}
      className={cn(
        "scroll-mt-24 text-[15px] font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h3>
  )
}

export function DocsP({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
        className
      )}
    >
      {children}
    </p>
  )
}

export function DocsList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <ul
      className={cn(
        "ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/50",
        className
      )}
    >
      {children}
    </ul>
  )
}

/** Inline code that matches the props table and code blocks. */
export function DocsCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[12.5px] text-foreground">
      {children}
    </code>
  )
}

/** Quiet aside for caveats — accessibility notes, gotchas. */
export function DocsCallout({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <aside
      data-slot="docs-callout"
      className={cn(
        "rounded-lg border-l-2 border-l-primary bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground",
        className
      )}
    >
      {title ? (
        <p className="mb-1 font-medium text-foreground">{title}</p>
      ) : null}
      {children}
    </aside>
  )
}
