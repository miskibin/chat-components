"use client"

import * as React from "react"

import { CopyButton } from "@/components/docs/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const RUNNERS = [
  { id: "npm", prefix: "npx" },
  { id: "pnpm", prefix: "pnpm dlx" },
  { id: "bun", prefix: "bunx --bun" },
] as const

function Surface({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return (
    <div
      data-slot="docs-command"
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 py-2 pr-2 pl-3",
        className
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre text-foreground [scrollbar-width:none]">
        {command}
      </code>
      <CopyButton value={command} label="Copy command" />
    </div>
  )
}

/** A single shell line with a copy button. */
export function CommandBlock({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return <Surface command={command} className={className} />
}

/**
 * The same `shadcn` command, one tab per package runner. `command` is the bare
 * command without its runner prefix, e.g. `shadcn@latest add …`.
 */
export function InstallCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return (
    <Tabs defaultValue="npm" className={cn("gap-2", className)}>
      <TabsList>
        {RUNNERS.map((runner) => (
          <TabsTrigger key={runner.id} value={runner.id} className="px-3">
            {runner.id}
          </TabsTrigger>
        ))}
      </TabsList>
      {RUNNERS.map((runner) => (
        <TabsContent key={runner.id} value={runner.id}>
          <Surface command={`${runner.prefix} ${command}`} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
