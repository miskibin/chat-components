"use client"

import * as React from "react"

import { FileTree, type FileTreeEntry } from "@/components/ui/file-tree"

/** Stands in for `GET /api/fs/list?dir=…`: one level, never the whole tree. */
const LEVELS: Record<string, FileTreeEntry[]> = {
  "": [
    { path: "app/" },
    { path: "components/" },
    { path: "lib/" },
    { path: "package.json" },
    { path: "README.md" },
  ],
  "app/": [
    { path: "app/hooks/" },
    { path: "app/layout.tsx" },
    { path: "app/page.tsx" },
  ],
  "app/hooks/": [
    { path: "app/hooks/use-chat-turns.ts" },
    { path: "app/hooks/use-file-panel.ts" },
    { path: "app/hooks/use-threads.ts" },
  ],
  "components/": [{ path: "components/ui/" }, { path: "components/app-header.tsx" }],
  "components/ui/": [
    { path: "components/ui/diff-view.tsx" },
    { path: "components/ui/file-preview.tsx" },
    { path: "components/ui/file-tree.tsx" },
  ],
  "lib/": [
    { path: "lib/fs-paths.ts" },
    { path: "lib/git-status.ts" },
    { path: "lib/syntax-highlighting.ts" },
  ],
}

export function FileTreeLazyExample() {
  const [log, setLog] = React.useState<string[]>(["fetched /"])
  const [selected, setSelected] = React.useState<string | null>(null)

  const loadChildren = React.useCallback(async (dir: string) => {
    // A real host awaits the network here; the delay only makes it visible.
    await new Promise((resolve) => setTimeout(resolve, 180))
    if (dir !== "") setLog((current) => [...current, `fetched /${dir}`])
    return LEVELS[dir] ?? []
  }, [])

  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-lg border bg-background">
      <div className="w-72 shrink-0 border-r">
        <FileTree
          loadChildren={loadChildren}
          initialExpansion="closed"
          selectedPath={selected}
          onSelect={setSelected}
          label="Workspace"
          searchPlaceholder="Filter loaded files"
        />
      </div>
      <div className="min-w-0 flex-1 overflow-auto p-3">
        <p className="mb-2 text-[12px] text-muted-foreground">
          Open a folder to fetch its level.
        </p>
        <ul className="space-y-0.5 font-mono text-[12px] text-muted-foreground">
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
