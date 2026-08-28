"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyInstallButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  const command = `npx shadcn@latest add miskibin/chat-components/${name}`

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="shadow-none"
      onClick={async () => {
        await navigator.clipboard.writeText(command)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Install"}
    </Button>
  )
}
