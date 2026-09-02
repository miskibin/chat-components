"use client"

import { Copy, ExternalLink, FolderOpen } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import {
  ChangeSummary,
  type ChangeSummaryFile,
  type FileActionItem,
} from "@/components/ui/change-summary"

const FILES: ChangeSummaryFile[] = [
  { path: "components/ui/change-summary.tsx", additions: 38, deletions: 6 },
  { path: "components/ui/file-preview.tsx", additions: 12, deletions: 3 },
  { path: "app/page.tsx", additions: 5 },
]

/**
 * The host decides what a right-click means; the card only shows the menu.
 * Held in a module constant so the memoized rows keep their identity.
 */
const ACTIONS: FileActionItem[] = [
  {
    id: "open",
    label: "Open in editor",
    icon: <ExternalLink />,
    onSelect: (path) => toast.message(`Open ${path} in your editor`),
  },
  {
    id: "reveal",
    label: "Reveal in Finder",
    icon: <FolderOpen />,
    onSelect: (path) => toast.message(`Reveal ${path}`),
  },
  {
    id: "copy",
    label: "Copy path",
    icon: <Copy />,
    separatorBefore: true,
    onSelect: (path) => {
      void navigator.clipboard?.writeText(path)
      toast.success("Path copied")
    },
  },
]

export function ChangeSummaryActionsExample() {
  return (
    <ChangeSummary
      files={FILES}
      fileActions={ACTIONS}
      onFileClick={(file) => toast.message(`Open ${file.path} in a panel`)}
    />
  )
}
