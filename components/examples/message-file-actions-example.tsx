"use client"

import { useCallback } from "react"
import { Copy, ExternalLink, FolderOpen } from "lucide-react"
import { toast } from "sonner"

import { Message } from "@/components/ui/message"
import type {
  ChangeSummaryFile,
  FileActionItem,
} from "@/components/ui/change-summary"

/**
 * Served from the app's own origin, the way a host serves a file the agent
 * wrote (`/api/files?path=…`). A `data:` image is its own bytes rather than a
 * file on the machine, and deliberately gets no menu — so an inline one would
 * not demonstrate this at all.
 */
const CHART = "/examples/chart.svg"

const ANSWER = `The quote pill lives in \`components/ui/message.tsx:42\`, and the list wires it
through \`components/ui/message-list.tsx\`. Turn latency over the last five runs:

![Turn latency](${CHART})

Right-click either chip — or the chart — for the same menu the change card
shows. The image is a real file behind a URL, so it carries the menu too; an
inline \`data:\` image would not.`

const CHANGES: ChangeSummaryFile[] = [
  { path: "components/ui/message.tsx", additions: 48, deletions: 3 },
  { path: "components/ui/message-list.tsx", additions: 26, deletions: 4 },
  { path: "components/ui/message-markdown.tsx", additions: 31, deletions: 9 },
]

/**
 * One array of actions covers every file the turn names — the change-summary
 * rows, the path chips in the answer and the image it rendered. Define it
 * outside the render (or memoize it): the rows holding it are memoized.
 */
const FILE_ACTIONS: FileActionItem[] = [
  {
    id: "open",
    label: "Open in editor",
    icon: <ExternalLink />,
    onSelect: (path) => toast.message(`Open ${path}`),
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
    onSelect: (path) => toast.message(`Copied ${path}`),
  },
]

export function MessageFileActionsExample() {
  const openReference = useCallback((path: string, line?: number) => {
    toast.message(line ? `${path} at line ${line}` : path)
  }, [])

  return (
    <div className="w-full max-w-2xl">
      <Message
        sender="assistant"
        content={ANSWER}
        changes={CHANGES}
        fileActions={FILE_ACTIONS}
        onFileReferenceClick={openReference}
        onReviewChanges={() => toast.message("Review the diff")}
      />
    </div>
  )
}
