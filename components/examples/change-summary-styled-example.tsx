"use client"

import { toast } from "sonner"

import {
  ChangeSummary,
  type ChangeSummaryFile,
} from "@/components/ui/change-summary"

const FILES: ChangeSummaryFile[] = [
  { path: "components/ui/message.tsx", additions: 25, deletions: 7 },
  { path: "components/ui/message-markdown.css", additions: 11 },
  { path: "registry.json", additions: 14 },
  { path: "public/r/message.json", additions: 40, deletions: 40 },
]

/**
 * `previewCount` decides how many rows show before the “Show N more” toggle,
 * `onFileClick` turns each row into a button, and the card's slots cover the
 * header, the rows, and the +/- counts.
 */
export function ChangeSummaryStyledExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ChangeSummary
        files={FILES}
        previewCount={2}
        title="Proposed edits"
        actionLabel="Open diff"
        onAction={() => toast.message("Open the diff in your own review UI")}
      />
      <ChangeSummary
        files={FILES}
        previewCount={4}
        onFileClick={(file) => toast.message(`Open ${file.path}`)}
        className="rounded-xl border-primary/30 bg-primary/5 [&_[data-slot=change-summary-file]]:font-mono [&_[data-slot=change-summary-file]]:text-[12px]"
      />
    </div>
  )
}
