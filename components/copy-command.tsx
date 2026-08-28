"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm",
        className
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto text-foreground">
        {command}
      </code>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="shrink-0"
        onClick={async () => {
          await navigator.clipboard.writeText(command)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        <span className="sr-only">Copy</span>
      </Button>
    </div>
  )
}
