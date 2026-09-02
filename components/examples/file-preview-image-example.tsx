"use client"

import { FilePreview } from "@/components/ui/file-preview"

/** A chart the agent "wrote", handed to the panel as a URL the page can load. */
const CHART = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect width="320" height="180" rx="12" fill="#f4f4f5"/>
    <g fill="#6366f1">
      <rect x="30" y="90" width="40" height="70"/>
      <rect x="90" y="50" width="40" height="110"/>
      <rect x="150" y="70" width="40" height="90"/>
      <rect x="210" y="20" width="40" height="140"/>
    </g>
    <text x="160" y="175" font-size="11" text-anchor="middle" fill="#71717a">out/chart.svg</text>
  </svg>`
)}`

export function FilePreviewImageExample() {
  return (
    <div className="h-72 w-full overflow-hidden rounded-lg border">
      <FilePreview
        file={{ path: "out/chart.svg", imageSrc: CHART }}
        onClose={() => {}}
      />
    </div>
  )
}
