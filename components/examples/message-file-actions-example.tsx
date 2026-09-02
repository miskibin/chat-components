"use client"

import { useCallback } from "react"
import { Copy, ExternalLink, FolderOpen } from "lucide-react"
import { toast } from "sonner"

import { Message } from "@/components/ui/message"
import type {
  ChangeSummaryFile,
  FileActionItem,
} from "@/components/ui/change-summary"

const CHART = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120">
    <rect width="320" height="120" fill="#f4f4f5" />
    <rect x="16" y="70" width="40" height="34" fill="#71717a" />
    <rect x="72" y="46" width="40" height="58" fill="#71717a" />
    <rect x="128" y="28" width="40" height="76" fill="#52525b" />
    <rect x="184" y="58" width="40" height="46" fill="#71717a" />
    <rect x="240" y="18" width="40" height="86" fill="#52525b" />
  </svg>`
)}`

const ANSWER = `The quote pill lives in \`components/ui/message.tsx:42\`, and the list wires it
through \`components/ui/message-list.tsx\`. Turn latency over the last five runs:

![Turn latency](${CHART})

Right-click either chip — or the chart — for the same menu the change card shows.`

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
