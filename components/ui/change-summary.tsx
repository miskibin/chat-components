"use client"

import {
  FileCode,
  FileJson,
  FileText,
  Hash,
  MoreHorizontal,
} from "lucide-react"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type ChangeSummaryFile = {
  path: string
  additions?: number
  deletions?: number
}

export type ChangeSummaryTool = {
  name: string
  status?: "pending" | "running" | "done" | "error"
  input?: string
  output?: string
}

export type ChangeSummaryProps = {
  files: ChangeSummaryFile[]
  /** Defaults to “N Files Changed”. */
  title?: string
  actionLabel?: string
  onAction?: () => void
  /** How many files to show before “Show N more”. */
  previewCount?: number
  className?: string
}

export type WorkedForProps = React.ComponentProps<"span"> & {
  /** Elapsed seconds for the finished turn. */
  seconds: number
}

function fileName(path: string) {
  const trimmed = path.replace(/[\\/]+$/, "")
  return trimmed.split(/[\\/]/).pop() || path
}

function FileGlyph({ path }: { path: string }) {
  const ext = fileName(path).split(".").pop()?.toLowerCase()
  if (ext === "css" || ext === "scss" || ext === "less") {
    return <Hash className="size-3.5 text-violet-500" />
  }
  if (ext === "json" || ext === "jsonc") {
    return <FileJson className="size-3.5 text-amber-500" />
  }
  if (
    ext === "ts" ||
    ext === "tsx" ||
    ext === "js" ||
    ext === "jsx" ||
    ext === "mts" ||
    ext === "cts"
  ) {
    return <FileCode className="size-3.5 text-sky-500" />
  }
  return <FileText className="size-3.5 text-muted-foreground" />
}

function DiffStats({
  additions = 0,
  deletions = 0,
}: {
  additions?: number
  deletions?: number
}) {
  if (additions === 0 && deletions === 0) return null
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] tabular-nums">
      {additions > 0 ? (
        <span className="text-emerald-600 dark:text-emerald-400">
          +{additions}
        </span>
      ) : null}
      {deletions > 0 ? (
        <span className="text-red-500 dark:text-red-400">-{deletions}</span>
      ) : null}
    </span>
  )
}

function FileRow({ file }: { file: ChangeSummaryFile }) {
  return (
    <div
      data-slot="change-summary-file"
      className="flex min-w-0 items-center gap-2 py-[3px] text-[13px] leading-snug"
    >
      <span className="inline-flex shrink-0">
        <FileGlyph path={file.path} />
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground" title={file.path}>
        {fileName(file.path)}
      </span>
      <DiffStats additions={file.additions} deletions={file.deletions} />
    </div>
  )
}

/** Compact “Worked for 12s” label shown after a turn finishes. */
export function WorkedFor({ seconds, className, ...props }: WorkedForProps) {
  return (
    <span
      data-slot="worked-for"
      className={cn("text-[12px] text-muted-foreground", className)}
      {...props}
    >
      {formatWorkedFor(seconds)}
    </span>
  )
}

export function formatWorkedFor(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  if (total < 1) return "Worked for a moment"
  if (total < 60) return `Worked for ${total}s`
  const minutes = Math.floor(total / 60)
  const rem = total % 60
  if (total < 3600) {
    return rem > 0 ? `Worked for ${minutes}m ${rem}s` : `Worked for ${minutes}m`
  }
  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  return mins > 0 ? `Worked for ${hours}h ${mins}m` : `Worked for ${hours}h`
}

/**
 * Collapsed review card: file count, optional Review action, a few rows, then
 * “Show N more”.
 */
export function ChangeSummary({
  files,
  title,
  actionLabel = "Review",
  onAction,
  previewCount = 4,
  className,
}: ChangeSummaryProps) {
  const [expanded, setExpanded] = React.useState(false)
  const count = files.length
  if (count === 0) return null

  const heading =
    title ?? `${count} ${count === 1 ? "File" : "Files"} Changed`
  const preview = files.slice(0, previewCount)
  const rest = files.slice(previewCount)
  const hidden = rest.length

  return (
    <div
      data-slot="change-summary"
      className={cn(
        "w-full max-w-md rounded-xl border bg-card px-3.5 py-3 text-card-foreground",
        className
      )}
    >
      <div
        data-slot="change-summary-header"
        className="mb-1.5 flex items-baseline justify-between gap-3"
      >
        <span className="text-[13px] font-medium tracking-tight">{heading}</span>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 rounded-sm text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {actionLabel}
          </button>
        ) : (
          <span className="shrink-0 text-[13px] text-muted-foreground">
            {actionLabel}
          </span>
        )}
      </div>

      <div data-slot="change-summary-list" className="flex flex-col">
        {preview.map((file) => (
          <FileRow key={file.path} file={file} />
        ))}
      </div>

      {hidden > 0 ? (
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleContent>
            <div className="flex flex-col">
              {rest.map((file) => (
                <FileRow key={file.path} file={file} />
              ))}
            </div>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              data-slot="change-summary-more"
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-sm py-0.5 text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <MoreHorizontal className="size-3.5 opacity-70" />
              {expanded ? "Show less" : `Show ${hidden} more`}
            </button>
          </CollapsibleTrigger>
        </Collapsible>
      ) : null}
    </div>
  )
}

function parseArgs(input?: string): Record<string, unknown> {
  if (!input?.trim()) return {}
  try {
    const value = JSON.parse(input) as unknown
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  } catch {
    /* raw */
  }
  return {}
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined
}

function isFileMutationTool(name: string) {
  const kind = name.replace(/\s+/g, "").toLowerCase()
  return (
    kind.includes("write") ||
    kind.includes("createfile") ||
    kind.includes("edit") ||
    kind.includes("applypatch") ||
    kind.includes("searchreplace") ||
    kind.includes("strreplace")
  )
}

function parseOutputStats(output?: string) {
  if (!output) return { additions: 0, deletions: 0 }
  const added = output.match(/\+(\d+)/)
  const removed = output.match(/[-−](\d+)/)
  return {
    additions: added ? Number(added[1]) : 0,
    deletions: removed ? Number(removed[1]) : 0,
  }
}

function countUnifiedDiff(patch?: string) {
  if (!patch) return { additions: 0, deletions: 0 }
  let additions = 0
  let deletions = 0
  for (const line of patch.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue
    if (line.startsWith("+")) additions++
    else if (line.startsWith("-")) deletions++
  }
  return { additions, deletions }
}

/** Pull Edit / Write / ApplyPatch tools into the card’s file list. */
export function fileChangesFromTools(
  tools: ChangeSummaryTool[]
): ChangeSummaryFile[] {
  const byPath = new Map<string, ChangeSummaryFile>()

  for (const tool of tools) {
    if (tool.status && tool.status !== "done") continue
    if (!isFileMutationTool(tool.name)) continue
    const args = parseArgs(tool.input)
    const path =
      asString(args.path) ??
      asString(args.filePath) ??
      asString(args.target_file) ??
      asString(args.file)
    if (!path) continue

    const fromOutput = parseOutputStats(tool.output)
    const fromDiff = countUnifiedDiff(
      asString(args.diff) ?? asString(args.patch) ?? asString(args.diffString)
    )
    const additions = fromOutput.additions || fromDiff.additions
    const deletions = fromOutput.deletions || fromDiff.deletions
    const existing = byPath.get(path)
    if (existing) {
      existing.additions = (existing.additions ?? 0) + additions
      existing.deletions = (existing.deletions ?? 0) + deletions
    } else {
      byPath.set(path, { path, additions, deletions })
    }
  }

  return [...byPath.values()]
}
