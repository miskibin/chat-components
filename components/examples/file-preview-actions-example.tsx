"use client"

import { Copy, FolderOpen, SquarePen } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { type FileActionItem } from "@/components/ui/change-summary"
import {
  FilePreview,
  type FilePreviewFile,
} from "@/components/ui/file-preview"

const CONTENT = [
  "import { z } from 'zod'",
  "",
  "export const settingsSchema = z.object({",
  "  provider: z.enum(['mock', 'cursor', 'ollama']),",
  "  model: z.string().min(1),",
  "  temperature: z.number().min(0).max(2).default(0.7),",
  "  memory: z",
  "    .object({",
  "      enabled: z.boolean().default(false),",
  "      maxChars: z.number().int().positive().default(4000),",
  "    })",
  "    .default({}),",
  "})",
  "",
  "export type Settings = z.infer<typeof settingsSchema>",
  "",
  "export function parseSettings(raw: unknown): Settings {",
  "  const result = settingsSchema.safeParse(raw)",
  "  if (result.success) return result.data",
  "  // An old settings file must never block startup — fall back to defaults.",
  "  return settingsSchema.parse({})",
  "}",
].join("\n")

const FILE: FilePreviewFile = {
  path: "lib/settings/schema.ts",
  content: CONTENT,
  // The host points the reader at the line it was asked about.
  focusLine: 18,
}

const ACTIONS: FileActionItem[] = [
  {
    id: "open",
    label: "Open in editor",
    icon: <SquarePen />,
    onSelect: (path) => toast.message(`Open ${path} in your editor`),
  },
  {
    id: "reveal",
    label: "Reveal in Finder",
    icon: <FolderOpen />,
    onSelect: (path) => toast.message(`Reveal ${path} in the file manager`),
  },
  {
    id: "copy",
    label: "Copy path",
    icon: <Copy />,
    separatorBefore: true,
    onSelect: (path) => toast.message(`Copied ${path}`),
  },
]

export function FilePreviewActionsExample() {
  const copyPath = React.useCallback((path: string) => {
    toast.message(`Copied /Users/you/agent-ui/${path}`)
  }, [])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-[360px] w-full overflow-hidden rounded-lg border">
        <FilePreview file={FILE} actions={ACTIONS} onCopyPath={copyPath} />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Right-click the header (or use the kebab) for the actions; clicking the
        path copies it. Line 18 is focused and centred.
      </p>
    </div>
  )
}
