"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type PreviewTabsProps = {
  preview: ReactNode
  code: ReactNode
  /** Rendered on the tab row, opposite the tabs. */
  actions?: ReactNode
  className?: string
}

export function PreviewTabs({
  preview,
  code,
  actions,
  className,
}: PreviewTabsProps) {
  return (
    <Tabs
      defaultValue="preview"
      data-slot="docs-preview"
      className={cn("gap-3", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="preview" className="px-3">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="px-3">
            Code
          </TabsTrigger>
        </TabsList>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
