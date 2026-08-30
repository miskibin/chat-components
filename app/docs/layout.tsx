import type { Metadata } from "next"

import { DocsMobileNav } from "@/components/docs/docs-mobile-nav"
import { DocsSidebarNav } from "@/components/docs/docs-sidebar-nav"
import { SiteHeader } from "@/components/docs/site-header"

export const metadata: Metadata = {
  title: {
    default: "Docs",
    template: "%s — Chat Components",
  },
  description:
    "Documentation for the chat-components shadcn registry: install, compose, and customize chat UI primitives.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader mobileNav={<DocsMobileNav />} />
      <div className="mx-auto flex w-full max-w-7xl gap-10 px-4 md:px-8">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 [scrollbar-width:thin] md:block">
          <DocsSidebarNav />
        </aside>
        <main className="min-w-0 flex-1 py-10 md:py-12">
          <div className="mx-auto w-full min-w-0 max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
