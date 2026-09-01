"use client"

import { X } from "lucide-react"
import * as React from "react"

import { FileIcon } from "@/components/ui/file-icon"
import {
  CodeLine,
  DiffStats,
  buildDiffLines,
  extractReadFile,
  extractToolDiff,
  isFileMutationTool,
  langFromPath,
  parseToolArgs,
  parseUnifiedPatch,
  useHighlightedLines,
  type MessageToolCallData,
  type ToolDiffLine,
} from "@/components/ui/message-parts"
import { cn } from "@/lib/utils"

export type FilePreviewFile = {
  path: string
  /** Falls back to the extension of `path`. */
  language?: string
  /** Full post-edit file text. Supplied by the app — it is what enables the File view. */
  content?: string
  /** Unified diff text (`@@` hunks keep their real line numbers). */
  diff?: string
  /** Before/after pair, when there is no patch to hand. */
  oldText?: string
  newText?: string
  /** Diff lines already parsed by `extractToolDiff` — wins over the fields above. */
  diffLines?: ToolDiffLine[]
  /** Stat overrides; otherwise counted off the diff. */
  added?: number
  removed?: number
  /** First line number of `content` when it is a partial read. */
  startLine?: number
}

export type FilePreviewView = "file" | "diff"

export type FilePreviewProps = Omit<React.ComponentProps<"div">, "children"> & {
  file: FilePreviewFile
  /** Defaults to `file` when there is content to show, else `diff`. */
  defaultView?: FilePreviewView
  /** Renders the close button. Escape closes the panel whenever this is set. */
  onClose?: () => void
  classNames?: {
    root?: string
    header?: string
    body?: string
  }
}

/** Past this, syntax highlighting costs more than it is worth. */
const HIGHLIGHT_MAX_CHARS = 150_000

/** Quiet square button shared by the view toggle and the close control. */
const filePreviewButton =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-[12px] text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3.5"

function splitPath(path: string) {
  const normalized = path.replace(/[\\/]+$/, "")
  const index = Math.max(
    normalized.lastIndexOf("/"),
    normalized.lastIndexOf("\\")
  )
  return index < 0
    ? { dir: "", name: normalized || path }
    : { dir: normalized.slice(0, index + 1), name: normalized.slice(index + 1) }
}

function splitLines(text: string) {
  return text.length === 0 ? [""] : text.replace(/\n$/, "").split("\n")
}

/** 1-based line number `needle` starts on inside `haystack`, or null. */
function lineOfMatch(haystack: string, needle: string) {
  if (!needle) return null
  const index = haystack.indexOf(needle)
  if (index < 0) return null
  let line = 1
  for (let i = 0; i < index; i++) if (haystack[i] === "\n") line++
  return line
}

type FilePreviewModel = {
  diffLines: ToolDiffLine[]
  fileLines: string[] | null
  added: number
  removed: number
  /** Absolute new-file line numbers the agent touched — highlighted in the File view. */
  changed: Set<number>
  /** A diff came in but nothing (or not all of it) could be parsed. */
  unparsed: boolean
}

/**
 * One pass over whatever the app handed us: parsed diff, file body, stats and
 * the set of changed lines. Tolerates a truncated or malformed patch — it
 * renders what parsed and says so, rather than throwing.
 */
function buildModel(file: FilePreviewFile): FilePreviewModel {
  let diffLines: ToolDiffLine[] = []
  let unparsed = false

  if (file.diffLines?.length) {
    diffLines = file.diffLines
  } else if (file.diff?.trim()) {
    const parsed = parseUnifiedPatch(file.diff)
    if (parsed?.length) diffLines = parsed
    else unparsed = true
  }

  if (
    diffLines.length === 0 &&
    file.oldText !== undefined &&
    file.newText !== undefined
  ) {
    diffLines = buildDiffLines(file.oldText, file.newText)
    unparsed = false
  }

  const fileLines = file.content !== undefined ? splitLines(file.content) : null
  const startLine = file.startLine ?? 1

  let added = 0
  let removed = 0
  const adds: { line: number; text: string }[] = []
  for (const line of diffLines) {
    if (line.type === "add") {
      added++
      if (line.newLine != null) adds.push({ line: line.newLine, text: line.text })
    } else if (line.type === "remove") removed++
  }

  /**
   * `@@` hunks carry real file line numbers, so their adds land as they are —
   * checked against the body rather than trusted. A diff synthesized from an
   * old/new pair numbers itself from 1 inside that snippet instead, so fall
   * back to locating the snippet. When neither lines up nothing is
   * highlighted — a wrong line is worse than none.
   */
  let changed = new Set<number>()
  if (fileLines && adds.length > 0) {
    const hits = adds.filter(
      (add) => fileLines[add.line - startLine] === add.text
    ).length
    if (hits * 2 >= adds.length) {
      changed = new Set(adds.map((add) => add.line))
    }
  }
  if (
    fileLines &&
    changed.size === 0 &&
    file.content !== undefined &&
    file.newText !== undefined
  ) {
    const at = lineOfMatch(file.content, file.newText)
    if (at != null) {
      const span = splitLines(file.newText).length
      for (let i = 0; i < span; i++) changed.add(startLine + at - 1 + i)
    }
  }

  return {
    diffLines,
    fileLines,
    added: file.added ?? added,
    removed: file.removed ?? removed,
    changed,
    unparsed,
  }
}

/**
 * Held at one identity for the lifetime of the panel, so the document-level
 * Escape listener is attached once instead of on every parent render.
 */
function useStableCallback<A extends unknown[], R>(
  callback: ((...args: A) => R) | undefined
) {
  const ref = React.useRef(callback)
  React.useEffect(() => {
    ref.current = callback
  })
  return React.useCallback((...args: A) => ref.current?.(...args), [])
}

const gutter =
  "w-11 shrink-0 select-none border-r border-border/50 pr-2 text-right text-[11px] tabular-nums text-muted-foreground/45"

/** One diff row — same colours and word chips as the inline tool diff. */
const DiffRow = React.memo(function FilePreviewDiffRow({
  line,
  tokens,
}: {
  line: ToolDiffLine
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
}) {
  const lineNo =
    line.type === "remove" ? line.oldLine : (line.newLine ?? line.oldLine)
  return (
    <div
      data-slot="file-preview-line"
      data-line-type={line.type}
      className={cn(
        "flex",
        line.type === "add" && "bg-emerald-500/10",
        line.type === "remove" && "bg-red-500/10"
      )}
    >
      <span data-slot="file-preview-gutter" className={gutter}>
        {lineNo ?? ""}
      </span>
      <span
        className={cn(
          "w-5 shrink-0 select-none text-center",
          line.type === "add" && "text-emerald-600/80 dark:text-emerald-400/80",
          line.type === "remove" && "text-red-500/80 dark:text-red-400/80",
          line.type === "context" && "text-muted-foreground/40"
        )}
      >
        {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
      </span>
      <span className="min-w-0 flex-1 break-words whitespace-pre-wrap px-1 text-foreground/90">
        {line.segments ? (
          line.segments.map((segment, index) => (
            <span
              key={index}
              className={cn(
                segment.highlight &&
                  (line.type === "add"
                    ? "rounded-[2px] bg-emerald-500/25"
                    : "rounded-[2px] bg-red-500/25")
              )}
            >
              {segment.text}
            </span>
          ))
        ) : (
          <CodeLine text={line.text} tokens={tokens} />
        )}
      </span>
    </div>
  )
})

/** One file row; changed lines carry the add tint and a `+` marker. */
const FileRow = React.memo(function FilePreviewFileRow({
  text,
  lineNumber,
  changed,
  tokens,
}: {
  text: string
  lineNumber: number
  changed: boolean
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
}) {
  return (
    <div
      data-slot="file-preview-line"
      data-line-type={changed ? "add" : "context"}
      data-line={lineNumber}
      className={cn("flex", changed && "bg-emerald-500/10")}
    >
      <span data-slot="file-preview-gutter" className={gutter}>
        {lineNumber}
      </span>
      <span
        aria-hidden
        className={cn(
          "w-5 shrink-0 select-none text-center",
          changed
            ? "text-emerald-600/80 dark:text-emerald-400/80"
            : "text-transparent"
        )}
      >
        {changed ? "+" : " "}
      </span>
      <span className="min-w-0 flex-1 break-words whitespace-pre-wrap px-1 text-foreground/90">
        <CodeLine text={text} tokens={tokens} />
      </span>
    </div>
  )
})

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      data-slot="file-preview-note"
      className="px-3 py-2 text-[12.5px] text-muted-foreground"
    >
      {children}
    </p>
  )
}

/**
 * Right-side file panel: the agent's diff, or the file itself with the edited
 * lines marked. Non-modal by design (`role="dialog"` without `aria-modal`) —
 * the conversation next to it stays live.
 */
export function FilePreview({
  file,
  defaultView,
  onClose,
  className,
  classNames,
  ...props
}: FilePreviewProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null)
  /** Parsing a whole file is the expensive bit; let a streaming prop skip frames. */
  const deferredFile = React.useDeferredValue(file)
  const model = React.useMemo(() => buildModel(deferredFile), [deferredFile])
  const language = deferredFile.language ?? langFromPath(deferredFile.path)
  const startLine = deferredFile.startLine ?? 1

  const hasFile = !!model.fileLines
  const hasDiff = model.diffLines.length > 0
  const canToggle = hasFile && hasDiff
  const preferred: FilePreviewView = defaultView ?? (hasFile ? "file" : "diff")
  const [requested, setRequested] = React.useState<FilePreviewView>(preferred)
  const [shownPath, setShownPath] = React.useState(deferredFile.path)

  // Adjust while rendering rather than in an effect: a newly opened file never
  // paints one frame in the previous file's view.
  if (shownPath !== deferredFile.path) {
    setShownPath(deferredFile.path)
    setRequested(preferred)
  }

  const view: FilePreviewView = canToggle
    ? requested
    : hasFile
      ? "file"
      : "diff"

  const source = React.useMemo(() => {
    const text =
      view === "diff"
        ? model.diffLines.map((line) => line.text).join("\n")
        : (model.fileLines?.join("\n") ?? "")
    return text.length > HIGHLIGHT_MAX_CHARS ? "" : text
  }, [model.diffLines, model.fileLines, view])
  const highlighted = useHighlightedLines(source, language)

  const { dir, name } = splitPath(deferredFile.path)
  const firstChanged = React.useMemo(() => {
    if (view === "diff") {
      return model.diffLines.findIndex((line) => line.type !== "context")
    }
    if (model.changed.size === 0) return -1
    // Iterated rather than spread into Math.min: a whole-file write marks
    // every line, and that set can be enormous.
    let first = Number.POSITIVE_INFINITY
    for (const line of model.changed) if (line < first) first = line
    return first - startLine
  }, [model.changed, model.diffLines, startLine, view])

  /**
   * Centre the first edited line in the panel's own scroller — once per file
   * and view, so a re-render never yanks the reader back. `scrollIntoView`
   * would drag the page's other scroll containers along with it.
   */
  const scrollKey = `${deferredFile.path}\0${startLine}\0${view}\0${firstChanged}`
  const scrolledRef = React.useRef("")
  React.useEffect(() => {
    const container = bodyRef.current
    if (!container || firstChanged < 0) return
    if (scrolledRef.current === scrollKey) return
    scrolledRef.current = scrollKey
    const row = container.children[firstChanged]
    if (!(row instanceof HTMLElement)) return
    container.scrollTop = Math.max(
      0,
      row.offsetTop - container.clientHeight / 2 + row.offsetHeight / 2
    )
  }, [firstChanged, scrollKey])

  const close = useStableCallback(onClose)
  React.useEffect(() => {
    if (!onClose) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [close, onClose])

  const showFile = React.useCallback(() => setRequested("file"), [])
  const showDiff = React.useCallback(() => setRequested("diff"), [])

  return (
    <div
      data-slot="file-preview"
      data-view={view}
      role="dialog"
      aria-label={deferredFile.path}
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground",
        className,
        classNames?.root
      )}
      {...props}
    >
      <div
        data-slot="file-preview-header"
        className={cn(
          "flex h-10 shrink-0 items-center gap-2 border-b px-2.5",
          classNames?.header
        )}
      >
        <FileIcon path={deferredFile.path} size={14} />
        <span
          data-slot="file-preview-path"
          title={deferredFile.path}
          className="flex min-w-0 flex-1 items-baseline gap-1 font-mono text-[12px]"
        >
          {dir ? (
            <span className="min-w-0 truncate text-muted-foreground">{dir}</span>
          ) : null}
          <span className="shrink-0 font-medium text-foreground">{name}</span>
        </span>
        <DiffStats
          data-slot="file-preview-stats"
          added={model.added}
          removed={model.removed}
        />
        {canToggle ? (
          <div
            data-slot="file-preview-view-toggle"
            role="group"
            aria-label="Preview mode"
            className="flex shrink-0 items-center gap-0.5 rounded-md bg-muted p-0.5"
          >
            <button
              type="button"
              data-active={view === "file"}
              aria-pressed={view === "file"}
              onClick={showFile}
              className={cn(
                filePreviewButton,
                "h-6 px-2 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs"
              )}
            >
              File
            </button>
            <button
              type="button"
              data-active={view === "diff"}
              aria-pressed={view === "diff"}
              onClick={showDiff}
              className={cn(
                filePreviewButton,
                "h-6 px-2 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs"
              )}
            >
              Diff
            </button>
          </div>
        ) : null}
        {onClose ? (
          <button
            type="button"
            data-slot="file-preview-close"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close file preview"
            className={cn(filePreviewButton, "size-6")}
          >
            <X />
          </button>
        ) : null}
      </div>

      <div
        ref={bodyRef}
        data-slot="file-preview-body"
        className={cn(
          "relative min-h-0 flex-1 overflow-auto font-mono text-[12.5px] leading-[1.7]",
          classNames?.body
        )}
      >
        {view === "file" && model.fileLines
          ? model.fileLines.map((text, index) => (
              <FileRow
                key={index}
                text={text}
                lineNumber={startLine + index}
                changed={model.changed.has(startLine + index)}
                tokens={highlighted?.[index]}
              />
            ))
          : null}
        {view === "diff" && hasDiff
          ? model.diffLines.map((line, index) => (
              <DiffRow key={index} line={line} tokens={highlighted?.[index]} />
            ))
          : null}
        {view === "diff" && !hasDiff && model.unparsed ? (
          <EmptyNote>
            This diff could not be parsed — it may have been truncated.
          </EmptyNote>
        ) : null}
        {!hasFile && !hasDiff && !model.unparsed ? (
          <EmptyNote>No preview available for this file.</EmptyNote>
        ) : null}
        {view === "diff" && hasDiff && model.unparsed ? (
          <EmptyNote>Part of this diff could not be parsed.</EmptyNote>
        ) : null}
      </div>
    </div>
  )
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined
}

function asRawString(value: unknown) {
  return typeof value === "string" ? value : undefined
}

/**
 * Tool row → panel input. The diff and the read body come straight from the
 * `message-parts` extractors, so the panel shows exactly what the inline row
 * shows; only the whole-file bodies an editing tool streams are read here.
 * Returns null when the tool has no file to open.
 */
export function filePreviewFromTool(
  tool: MessageToolCallData
): FilePreviewFile | null {
  const args = parseToolArgs(tool.input)
  const path =
    asString(args.path) ??
    asString(args.filePath) ??
    asString(args.target_file) ??
    asString(args.file)
  if (!path) return null

  const preview: FilePreviewFile = { path, language: langFromPath(path) }

  const diffLines = extractToolDiff(tool)
  if (diffLines?.length) preview.diffLines = diffLines

  const read = extractReadFile(tool)
  if (read) {
    preview.content = read.content
    preview.startLine = read.startLine
  } else if (isFileMutationTool(tool.name)) {
    // Cursor streams the after-file as streamContent; writeToolCall uses fileText.
    preview.content =
      asRawString(args.contents) ??
      asRawString(args.content) ??
      asRawString(args.file_text) ??
      asRawString(args.fileText) ??
      asRawString(args.streamContent)
    preview.newText =
      asRawString(args.new_string) ??
      asRawString(args.newString) ??
      asRawString(args.new_str) ??
      asRawString(args.newText)
  }

  return preview
}
