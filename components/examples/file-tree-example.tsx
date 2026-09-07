"use client"

import { Copy, ExternalLink, Undo2 } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import type { FileActionItem } from "@/components/ui/change-summary"
import { FileTree, type FileTreeEntry } from "@/components/ui/file-tree"

/** The shape `git status --porcelain` plus `--numstat` already gives you. */
const ENTRIES: FileTreeEntry[] = [
  { path: "app/page.tsx", status: "modified", additions: 42, deletions: 12 },
  { path: "app/hooks/use-file-panel.ts", status: "modified", additions: 8, deletions: 3 },
  { path: "app/hooks/use-chat-turns.ts", status: "modified", additions: 2, deletions: 2 },
  { path: "components/ui/diff-view.tsx", status: "added", additions: 318 },
  { path: "components/ui/file-tree.tsx", status: "added", additions: 264 },
  { path: "components/ui/file-preview.tsx", status: "modified", additions: 61, deletions: 210 },
  { path: "lib/syntax-highlighting.ts", status: "added", additions: 44 },
  { path: "lib/diff-lines.ts", status: "deleted", deletions: 96 },
  { path: "docs/diffing.md", status: "untracked", additions: 30 },
  { path: "package.json", status: "modified", additions: 3, deletions: 1 },
]

export function FileTreeExample() {
  const [selected, setSelected] = React.useState<string | null>(
    "components/ui/diff-view.tsx"
  )

  const actions = React.useMemo<FileActionItem[]>(
    () => [
      {
        id: "open",
        label: "Open in editor",
        icon: <ExternalLink />,
        onSelect: (path) => toast.message(`Open ${path}`),
      },
      {
        id: "copy",
        label: "Copy path",
        icon: <Copy />,
        onSelect: (path) => toast.message(`Copied ${path}`),
      },
      {
        id: "revert",
        label: "Revert changes",
        icon: <Undo2 />,
        destructive: true,
        separatorBefore: true,
        onSelect: (path) => toast.message(`Revert ${path}`),
      },
    ],
    []
  )

  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-lg border bg-background">
      <div className="w-72 shrink-0 border-r">
        <FileTree
          entries={ENTRIES}
          selectedPath={selected}
          onSelect={setSelected}
          fileActions={actions}
          label="Changed files"
          header={
            <>
              <span className="px-1 font-medium text-foreground">Files</span>
              <span className="ml-auto tabular-nums">{ENTRIES.length}</span>
            </>
          }
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center p-4">
        <p className="font-mono text-[12.5px] text-muted-foreground">
          {selected ?? "Pick a file"}
        </p>
      </div>
    </div>
  )
}
