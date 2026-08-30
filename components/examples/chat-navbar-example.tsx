"use client"

import { PanelLeft, Share2 } from "lucide-react"
import { toast } from "sonner"

import { ChatNavbar } from "@/components/ui/chat-navbar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function ChatNavbarExample() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-lg border">
      <ChatNavbar
        title="Streaming markdown bugs"
        left={
          <button
            type="button"
            aria-label="Open chats"
            onClick={() => toast.message("Toggle your sidebar here")}
            className="-ml-1 inline-grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4"
          >
            <PanelLeft />
          </button>
        }
        right={
          <>
            <button
              type="button"
              aria-label="Share chat"
              onClick={() => toast.message("Shared")}
              className="inline-grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4"
            >
              <Share2 />
            </button>
            <ThemeToggle floating={false} />
          </>
        }
      />
      <div className="px-4 py-6 text-sm text-muted-foreground">
        Conversation goes here.
      </div>
    </div>
  )
}
