import type { ReactNode } from "react"

export function DocsPageHeader({
  title,
  description,
  children,
}: {
  title: string
  description: ReactNode
  children?: ReactNode
}) {
  return (
    <div data-slot="docs-page-header" className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-balance text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  )
}
