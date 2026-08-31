"use client"

import { toast } from "sonner"

import {
  ChangeSummary,
  WorkedFor,
  type ChangeSummaryFile,
} from "@/components/ui/change-summary"

const FILES: ChangeSummaryFile[] = [
  { path: "components/ui/message-parts.tsx", additions: 4, deletions: 2 },
  { path: "components/ui/message-markdown.css", additions: 11 },
  { path: "components/ui/message.tsx", additions: 25, deletions: 7 },
  { path: "app/demo/page.tsx", additions: 19, deletions: 5 },
  { path: "lib/mock-agent.ts", additions: 8, deletions: 1 },
  { path: "registry.json", additions: 14 },
  { path: "components/docs/component-docs/messages.tsx", additions: 6 },
]

export function ChangeSummaryExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <WorkedFor seconds={72} />
      <ChangeSummary
        files={FILES}
        onAction={() => toast.message("Open the diff in your own review UI")}
      />
    </div>
  )
}
