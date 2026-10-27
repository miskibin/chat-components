"use client"

import { Minimize2, Repeat, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { MessageDivider } from "@/components/ui/message-parts"

/**
 * What the app did between two turns — not a message anyone wrote. A neutral
 * line, one with an action, and one for something that went wrong.
 */
export function MessageDividerExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col">
      <MessageDivider
        icon={<Minimize2 />}
        label="Context compacted"
        detail="182k → 24k tokens"
      />
      <MessageDivider
        icon={<Repeat />}
        label="Switched to Opus"
        detail="from Sonnet"
        onAction={() => toast("Switched back to Sonnet")}
        actionLabel="Switch back to Sonnet"
      />
      <MessageDivider
        tone="danger"
        icon={<TriangleAlert />}
        label="Session lost"
        detail="the CLI exited with code 137"
      />
    </div>
  )
}
