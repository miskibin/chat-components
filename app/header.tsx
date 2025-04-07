import { Button } from "@/components/ui/button";
import { Github, FileText } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function ChatHeader() {
  return (
    <div className="p-4 flex justify-between items-center border-b bg-background">
      <h1 className="text-lg font-semibold">Chat Example</h1>
      <div className="flex gap-2 items-center">
        {ModeToggle()}

        <Button asChild variant="outline">
          <a
            href="https://github.com/miskibin/chat-input"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} className="mr-2" />
            Repository
          </a>
        </Button>
        <Button asChild variant="outline">
          <a
            href="https://github.com/miskibin/chat-input/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} className="mr-2" />
            Docs
          </a>
        </Button>
      </div>
    </div>
  );
}
