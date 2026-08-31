import Link from "next/link"

import { Chat } from "@/components/chat"
import { CommandBlock } from "@/components/docs/command-block"
import { installCommand } from "@/components/docs/nav"
import { SiteHeader } from "@/components/docs/site-header"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16 md:px-8 md:py-20">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Agent-grade chat UI you own
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            A shadcn/ui registry built for agents: reasoning streams, tool-call
            rows, artifacts, streaming markdown, and a session sidebar with
            drag-and-drop. Plain props and callbacks — bring any backend. The
            code is copied into your repo, themed with your tokens.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/docs">Get started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/demo">Open the playground</Link>
            </Button>
          </div>
          <CommandBlock
            command={`npx ${installCommand("chat")}`}
            className="w-full max-w-xl"
          />
        </div>

        <div className="h-[560px] overflow-hidden rounded-xl border bg-background shadow-xs">
          <Chat />
        </div>
      </main>
    </div>
  )
}
