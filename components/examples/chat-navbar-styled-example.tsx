"use client"

import { ChatNavbar } from "@/components/ui/chat-navbar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

/** Height, border, background, and even the title type scale merge last. */
export function ChatNavbarStyledExample() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-lg border">
      <ChatNavbar
        className="h-14 border-b-0 bg-muted/40 px-6 [&_[data-slot=chat-navbar-title]]:text-[15px]"
        title="Streaming markdown bugs"
        right={<ThemeToggle floating={false} />}
      />
      <ChatNavbar
        className="h-10 border-t bg-transparent [&_[data-slot=chat-navbar-title]]:text-[12px] [&_[data-slot=chat-navbar-title]]:tracking-wide [&_[data-slot=chat-navbar-title]]:uppercase"
        title="Compact variant"
      />
    </div>
  )
}
