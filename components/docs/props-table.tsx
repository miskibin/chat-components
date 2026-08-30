import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type PropRow = {
  name: string
  type: string
  default?: string
  description: ReactNode
  required?: boolean
}

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
      className={cn("overflow-x-auto rounded-lg border", className)}
    >
      <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
        {caption ? (
          <caption className="border-b bg-muted/40 px-4 py-2 text-left text-[13px] font-medium text-foreground">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b bg-muted/40 text-[12px] tracking-wide text-muted-foreground uppercase">
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b last:border-0 align-top">
              <td className="px-4 py-2.5 whitespace-nowrap">
                <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[12.5px] text-foreground">
                  {row.name}
                </code>
                {row.required ? (
                  <span className="ml-1.5 text-[11px] text-destructive">*</span>
                ) : null}
              </td>
              <td className="px-4 py-2.5">
                <code className="font-mono text-[12.5px] break-words text-primary">
                  {row.type}
                </code>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {row.default ? (
                  <code className="font-mono text-[12.5px] text-muted-foreground">
                    {row.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
