"use client"

import * as React from "react"

import { NoteEditor } from "@/components/ui/note-editor"

const NOTE = `# Release checklist

Everything the 0.4 release needs before the tag goes out.

- [x] Bump the version in \`package.json\`
- [ ] Regenerate the registry
- [ ] Write the changelog

## How a release flows

\`\`\`mermaid
flowchart LR
  A[Merge to main] --> B[CI green]
  B --> C[Tag v*]
  C --> D[Installers built]
  D --> E[Update published]
\`\`\`

The bundle budget is $s \\le 60\\,\\text{MB}$, measured with \`du -sh\`.
`

export function NoteEditorExample() {
  const [markdown, setMarkdown] = React.useState(NOTE)
  return (
    <div className="flex h-[460px] w-full flex-col overflow-hidden rounded-lg border">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NoteEditor value={markdown} onChange={setMarkdown} />
      </div>
      <p className="text-muted-foreground border-t px-3 py-1.5 text-[11.5px]">
        {markdown.split(/\s+/).filter(Boolean).length} words · saved as markdown
      </p>
    </div>
  )
}
