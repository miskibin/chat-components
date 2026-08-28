import { Chat } from "@/components/chat"
import { CopyCommand } from "@/components/copy-command"
import { ChatInputExample } from "@/components/examples/chat-input-example"
import { MessageExample } from "@/components/examples/message-example"
import { PickersExample } from "@/components/examples/pickers-example"
import { SidebarExample } from "@/components/examples/sidebar-example"
import { StatusExample } from "@/components/examples/status-example"
import { ModeToggle } from "@/app/mode-toggle"
import { RegistryPreview } from "@/components/registry-preview"
import { Button } from "@/components/ui/button"
import { ChatNavbar } from "@/components/ui/chat-navbar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Chat Components</h1>
            <p className="text-muted-foreground">
              A custom registry for distributing chat UI with shadcn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">Cursor PoC</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
        <CopyCommand command="npx shadcn@latest add miskibin/chat-components/chat" />
      </header>

      <main className="flex flex-1 flex-col gap-8">
        <RegistryPreview
          name="chat"
          description="Starter chat block: empty state, prompt suggestions, then messages + input."
        >
          <div className="h-[480px] overflow-hidden rounded-md border">
            <Chat />
          </div>
        </RegistryPreview>

        <RegistryPreview
          name="chat-input"
          description="Composer-style input with attachments, skills, and slash commands."
        >
          <ChatInputExample />
        </RegistryPreview>

        <RegistryPreview
          name="message-list"
          description="Message list with user bubbles and assistant markdown."
        >
          <MessageExample />
        </RegistryPreview>

        <RegistryPreview
          name="model-picker"
          description="Ask / Plan / Agent mode and a model picker."
        >
          <PickersExample />
        </RegistryPreview>

        <RegistryPreview
          name="chat-sidebar"
          description="Collapsible sidebar chrome with slots."
        >
          <SidebarExample />
        </RegistryPreview>

        <RegistryPreview
          name="generation-status"
          description="Braille spinner for generation state."
          minHeight="280px"
        >
          <StatusExample />
        </RegistryPreview>

        <RegistryPreview
          name="chat-navbar"
          description="Thin top bar with title and action slots."
          minHeight="280px"
        >
          <div className="overflow-hidden rounded-md border">
            <ChatNavbar title="Chat" right={<ThemeToggle floating={false} />} />
          </div>
        </RegistryPreview>
      </main>
    </div>
  )
}
