"use client"

import { Globe } from "lucide-react"
import { useState } from "react"

import { ChatInput, chatInputButtonVariants } from "@/components/ui/chat-input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * `chatInputButtonVariants` is the same recipe the built-in attach and send
 * buttons use, so a custom control lines up with the toolbar automatically.
 */
export function ChatInputCustomButtonExample() {
  const [search, setSearch] = useState(false)

  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        placeholder="Ask anything"
        tools={
          <button
            type="button"
            title="Toggle web search"
            aria-pressed={search}
            onClick={() => setSearch((value) => !value)}
            className={cn(
              chatInputButtonVariants(),
              search && "bg-primary/10 text-primary hover:bg-primary/15"
            )}
          >
            <Globe />
            <span>Search</span>
          </button>
        }
        onSend={({ text }) =>
          toast("Sent", {
            description: search ? `${text} (web search on)` : text,
          })
        }
      />
    </div>
  )
}
