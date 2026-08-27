import { Button } from "@/components/ui/button"
import { FileText, Github } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background p-4">
      <h1 className="text-lg font-semibold text-foreground">Chat Components</h1>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button asChild variant="outline" size="sm">
          <a
            href="https://github.com/miskibin/chat-components"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} className="mr-2" />
            Repository
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a
            href="https://github.com/miskibin/chat-components#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} className="mr-2" />
            Docs
          </a>
        </Button>
      </div>
    </div>
  )
}
