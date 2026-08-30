"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Copies the `shadcn add` command for one registry item. */
export function CopyInstallButton({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const command = `npx shadcn@latest add miskibin/chat-components/${name}`

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn("shadow-none", className)}
      onClick={() => {
        void navigator.clipboard
          .writeText(command)
          .then(() => setCopied(true))
          .catch(() => {})
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Install"}
    </Button>
  )
}
