"use client"

import * as React from "react"

import {
  FilePreview,
  type FilePreviewFile,
} from "@/components/ui/file-preview"
import {
  MessageToolCall,
  type MessageToolCallData,
} from "@/components/ui/message-parts"

/**
 * Stands in for the picture an agent just wrote. A real host returns a URL its
 * own server can stream the file from; the shape of the prop is the same
 * either way. Mid-tone fills only, so it reads on both themes.
 */
const CHART = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="180" viewBox="0 0 420 180">
     <g fill="#6366f1">
       <rect x="24" y="104" width="46" height="56" rx="4"/>
       <rect x="88" y="72" width="46" height="88" rx="4"/>
       <rect x="152" y="40" width="46" height="120" rx="4"/>
       <rect x="216" y="88" width="46" height="72" rx="4"/>
       <rect x="280" y="24" width="46" height="136" rx="4"/>
       <rect x="344" y="60" width="46" height="100" rx="4"/>
     </g>
     <rect x="16" y="164" width="388" height="2" rx="1" fill="#94a3b8"/>
   </svg>`
)}`

const READ_IMAGE: MessageToolCallData = {
  id: "read-png",
  name: "Read",
  status: "done",
  input: JSON.stringify({ path: "reports/latency.png" }),
  // What a harness actually hands back for an image: a line about the bytes.
  output: "image/png image, 420x180 px",
}

/** Only the host knows how a path on the machine reaches the browser. */
function resolveFileUrl(path: string) {
  return path.endsWith(".png") ? CHART : undefined
}

const PREVIEW: FilePreviewFile = {
  path: "reports/latency.png",
  imageSrc: CHART,
}

export function MessageToolImageExample() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            Without a resolver
          </p>
          <div className="rounded-lg border bg-background px-3 py-2">
            <MessageToolCall tool={READ_IMAGE} defaultOpen />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            With <code>resolveFileUrl</code>
          </p>
          <div className="rounded-lg border bg-background px-3 py-2">
            <MessageToolCall
              tool={READ_IMAGE}
              defaultOpen
              resolveFileUrl={resolveFileUrl}
            />
          </div>
        </div>
      </div>

      <div className="h-[260px] overflow-hidden rounded-lg border bg-background">
        <FilePreview file={PREVIEW} />
      </div>
    </div>
  )
}
