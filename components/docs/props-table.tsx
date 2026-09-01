import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type PropRow = {
  name: string
  type: string
  default?: string
  description?: ReactNode
  required?: boolean
}

/**
 * Prop / type / description. Types sit under the name rather than in their own
 * column, so the table fits the measure instead of scrolling sideways.
 */
export function PropsTable({
  rows,
  caption,
  className,
}: {
  rows: PropRow[]
  caption?: ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="docs-props-table"
      className={cn("overflow-hidden rounded-lg border", className)}
    >
      {caption ? (
        <p className="border-b bg-muted/40 px-4 py-2 font-mono text-[12.5px] text-foreground">
          {caption}
        </p>
      ) : null}
      <dl className="divide-y">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <dt className="flex flex-col gap-1">
              <span>
                <code className="font-mono text-[12.5px] font-medium text-foreground">
                  {row.name}
                </code>
                {row.required ? (
                  <span className="ml-1 text-[11px] text-destructive">*</span>
                ) : null}
              </span>
              <code className="font-mono text-[12px] break-words text-primary">
                {row.type}
                {row.default ? (
                  <span className="text-muted-foreground">
                    {" = "}
                    {row.default}
                  </span>
                ) : null}
              </code>
            </dt>
            {row.description ? (
              <dd className="text-[13.5px] leading-relaxed text-muted-foreground">
                {row.description}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </div>
  )
}
