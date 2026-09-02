"use client"

import { Check, Columns2, MoreHorizontal, Rows3, WrapText, X } from "lucide-react"
import * as React from "react"

import {
  FileContextMenu,
  type FileActionItem,
} from "@/components/ui/change-summary"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileIcon } from "@/components/ui/file-icon"
import {
  CodeLine,
  DiffStats,
  buildDiffLines,
  extractReadFile,
  extractToolDiff,
  isFileMutationTool,
  isImagePath,
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
  /**
   * 1-based line of the File view to centre and mark — "the app wants you
   * here" (a search hit, a stack frame). Outranks the first changed line.
   */
  focusLine?: number
  /**
   * A URL the page can load this file's picture from. Set it for an image and
   * the panel shows the picture instead of a text body — only the host knows
   * how a path on the machine reaches the browser.
   */
  imageSrc?: string
}

export type FilePreviewView = "file" | "diff"

export type FilePreviewDiffLayout = "unified" | "split"

export type FilePreviewProps = Omit<React.ComponentProps<"div">, "children"> & {
  file: FilePreviewFile
  /** Defaults to `file` when there is content to show, else `diff`. */
  defaultView?: FilePreviewView
  /** Side-by-side or one column. Controlled. */
  diffLayout?: FilePreviewDiffLayout
  /** Uncontrolled initial layout; defaults to `unified`. */
  defaultDiffLayout?: FilePreviewDiffLayout
  onDiffLayoutChange?: (layout: FilePreviewDiffLayout) => void
  /** Soft-wrap long lines. Controlled. */
  wrap?: boolean
  /** Uncontrolled initial wrapping; defaults to `true`. */
  defaultWrap?: boolean
  onWrapChange?: (wrap: boolean) => void
  /** Right-click menu on the header, and the same items behind the kebab. */
  actions?: FileActionItem[]
  /** Replaces the built-in clipboard write — the host may copy an absolute path. */
  onCopyPath?: (path: string) => void
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

/** How long the header says "Copied" before falling back to the path. */
const COPIED_MS = 1200

/** Quiet square button shared by every header control. */
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

/** One side of a split row: the diff line plus its index in `diffLines`. */
type SplitSide = { line: ToolDiffLine; index: number }
type SplitPair = { left?: SplitSide; right?: SplitSide }

/**
 * Unified lines → side-by-side rows. A run of removes followed by a run of
 * adds is the shape of a replacement, so those pair up index by index; the
 * longer side leaves the other cell empty. Context shows on both sides.
 */
function pairDiffLines(lines: ToolDiffLine[]): SplitPair[] {
  const rows: SplitPair[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.type === "context") {
      rows.push({ left: { line, index: i }, right: { line, index: i } })
      i++
      continue
    }
    const removes: SplitSide[] = []
    while (i < lines.length && lines[i].type === "remove") {
      removes.push({ line: lines[i], index: i })
      i++
    }
    const adds: SplitSide[] = []
    while (i < lines.length && lines[i].type === "add") {
      adds.push({ line: lines[i], index: i })
      i++
    }
    const span = Math.max(removes.length, adds.length)
    for (let j = 0; j < span; j++) rows.push({ left: removes[j], right: adds[j] })
  }
  return rows
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
  "shrink-0 select-none border-r border-border/50 pr-2 text-right text-[11px] tabular-nums text-muted-foreground/45"

/**
 * Unwrapped rows grow past the panel and let the body scroll sideways as one
 * block; wrapped rows stay inside it. Both keep the gutter column fixed.
 */
function rowClass(wrap: boolean) {
  return wrap ? "flex" : "flex w-max min-w-full"
}

function codeClass(wrap: boolean) {
  return wrap
    ? "min-w-0 flex-1 break-words whitespace-pre-wrap"
    : "shrink-0 whitespace-pre"
}

/** Word chips when the differ produced them, highlighted source otherwise. */
function DiffText({
  line,
  tokens,
}: {
  line: ToolDiffLine
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
}) {
  if (!line.segments) return <CodeLine text={line.text} tokens={tokens} />
  return (
    <>
      {line.segments.map((segment, index) => (
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
      ))}
    </>
  )
}

/** One diff row — same colours and word chips as the inline tool diff. */
const DiffRow = React.memo(function FilePreviewDiffRow({
  line,
  tokens,
  wrap,
}: {
  line: ToolDiffLine
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
  wrap: boolean
}) {
  const lineNo =
    line.type === "remove" ? line.oldLine : (line.newLine ?? line.oldLine)
  return (
    <div
      data-slot="file-preview-line"
      data-line-type={line.type}
      className={cn(
        rowClass(wrap),
        line.type === "add" && "bg-emerald-500/10",
        line.type === "remove" && "bg-red-500/10"
      )}
    >
      <span data-slot="file-preview-gutter" className={cn(gutter, "w-11")}>
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
      <span className={cn(codeClass(wrap), "px-1 text-foreground/90")}>
        <DiffText line={line} tokens={tokens} />
      </span>
    </div>
  )
})

/**
 * One half of a split row. An unwrapped cell scrolls on its own rather than
 * widening the row — the other column must not be pushed off the panel.
 */
function SplitCell({
  side,
  entry,
  tokens,
  wrap,
}: {
  side: "old" | "new"
  entry?: SplitSide
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
  wrap: boolean
}) {
  const line = entry?.line
  const lineNo = side === "old" ? line?.oldLine : line?.newLine
  return (
    <div
      data-slot="file-preview-side"
      data-side={side}
      data-line-type={line?.type ?? "empty"}
      className={cn(
        "flex min-w-0 flex-1 basis-1/2",
        !line && "bg-muted/40",
        side === "old" && line?.type === "remove" && "bg-red-500/10",
        side === "new" && line?.type === "add" && "bg-emerald-500/10"
      )}
    >
      <span data-slot="file-preview-gutter" className={cn(gutter, "w-9")}>
        {lineNo ?? ""}
      </span>
      <span
        className={cn(
          "px-1 text-foreground/90",
          wrap
            ? "min-w-0 flex-1 break-words whitespace-pre-wrap"
            : "min-w-0 flex-1 overflow-x-auto whitespace-pre"
        )}
      >
        {line ? <DiffText line={line} tokens={tokens} /> : " "}
      </span>
    </div>
  )
}

const SplitRow = React.memo(function FilePreviewSplitRow({
  row,
  leftTokens,
  rightTokens,
  wrap,
}: {
  row: SplitPair
  leftTokens?: React.ComponentProps<typeof CodeLine>["tokens"]
  rightTokens?: React.ComponentProps<typeof CodeLine>["tokens"]
  wrap: boolean
}) {
  const type =
    row.left?.line.type === "context"
      ? "context"
      : row.left && row.right
        ? "replace"
        : row.right
          ? "add"
          : "remove"
  return (
    <div data-slot="file-preview-line" data-line-type={type} className="flex">
      <SplitCell side="old" entry={row.left} tokens={leftTokens} wrap={wrap} />
      <div aria-hidden className="w-px shrink-0 bg-border/60" />
      <SplitCell side="new" entry={row.right} tokens={rightTokens} wrap={wrap} />
    </div>
  )
})

/** One file row; changed lines carry the add tint, the focused line its own. */
const FileRow = React.memo(function FilePreviewFileRow({
  text,
  lineNumber,
  changed,
  focused,
  tokens,
  wrap,
}: {
  text: string
  lineNumber: number
  changed: boolean
  focused: boolean
  tokens?: React.ComponentProps<typeof CodeLine>["tokens"]
  wrap: boolean
}) {
  return (
    <div
      data-slot="file-preview-line"
      data-line-type={changed ? "add" : "context"}
      data-line={lineNumber}
      data-focused={focused || undefined}
      className={cn(
        rowClass(wrap),
        changed && "bg-emerald-500/10",
        focused && "bg-primary/10"
      )}
    >
      <span data-slot="file-preview-gutter" className={cn(gutter, "w-11")}>
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
      <span className={cn(codeClass(wrap), "px-1 text-foreground/90")}>
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
  diffLayout,
  defaultDiffLayout = "unified",
  onDiffLayoutChange,
  wrap,
  defaultWrap = true,
  onWrapChange,
  actions,
  onCopyPath,
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
  const focusLine = deferredFile.focusLine

  const image = deferredFile.imageSrc
  const hasFile = !image && !!model.fileLines
  const hasDiff = !image && model.diffLines.length > 0
  const canToggle = hasFile && hasDiff
  // A focus request is about the file body, so it decides the opening view.
  const preferred: FilePreviewView =
    focusLine != null && hasFile
      ? "file"
      : (defaultView ?? (hasFile ? "file" : "diff"))
  const [requested, setRequested] = React.useState<FilePreviewView>(preferred)
  const [shownPath, setShownPath] = React.useState(deferredFile.path)
  const [copied, setCopied] = React.useState(false)

  // Adjust while rendering rather than in an effect: a newly opened file never
  // paints one frame in the previous file's view.
  if (shownPath !== deferredFile.path) {
    setShownPath(deferredFile.path)
    setRequested(preferred)
    setCopied(false)
  }

  const view: FilePreviewView = canToggle
    ? requested
    : hasFile
      ? "file"
      : "diff"

  const [internalLayout, setInternalLayout] =
    React.useState<FilePreviewDiffLayout>(defaultDiffLayout)
  const layout = diffLayout ?? internalLayout
  const [internalWrap, setInternalWrap] = React.useState(defaultWrap)
  const wrapped = wrap ?? internalWrap

  const source = React.useMemo(() => {
    const text =
      view === "diff"
        ? model.diffLines.map((line) => line.text).join("\n")
        : (model.fileLines?.join("\n") ?? "")
    return text.length > HIGHLIGHT_MAX_CHARS ? "" : text
  }, [model.diffLines, model.fileLines, view])
  const highlighted = useHighlightedLines(source, language)

  const splitRows = React.useMemo(
    () =>
      view === "diff" && layout === "split" && hasDiff
        ? pairDiffLines(model.diffLines)
        : null,
    [hasDiff, layout, model.diffLines, view]
  )

  const { dir, name } = splitPath(deferredFile.path)

  /** Row index to centre — the focus request first, else the first change. */
  const scrollTarget = React.useMemo(() => {
    if (view === "diff") {
      if (splitRows) {
        return splitRows.findIndex(
          (row) =>
            row.left?.line.type === "remove" || row.right?.line.type === "add"
        )
      }
      return model.diffLines.findIndex((line) => line.type !== "context")
    }
    if (focusLine != null) return focusLine - startLine
    if (model.changed.size === 0) return -1
    // Iterated rather than spread into Math.min: a whole-file write marks
    // every line, and that set can be enormous.
    let first = Number.POSITIVE_INFINITY
    for (const line of model.changed) if (line < first) first = line
    return first - startLine
  }, [
    focusLine,
    model.changed,
    model.diffLines,
    splitRows,
    startLine,
    view,
  ])

  /**
   * Centre the target line in the panel's own scroller — once per file, view
   * and request, so a re-render never yanks the reader back. `scrollIntoView`
   * would drag the page's other scroll containers along with it.
   */
  const scrollKey = `${deferredFile.path}\0${startLine}\0${view}\0${layout}\0${focusLine ?? ""}\0${scrollTarget}`
  const scrolledRef = React.useRef("")
  React.useEffect(() => {
    const container = bodyRef.current
    if (!container || scrollTarget < 0) return
    if (scrolledRef.current === scrollKey) return
    scrolledRef.current = scrollKey
    const row = container.children[scrollTarget]
    if (!(row instanceof HTMLElement)) return
    container.scrollTop = Math.max(
      0,
      row.offsetTop - container.clientHeight / 2 + row.offsetHeight / 2
    )
  }, [scrollKey, scrollTarget])

  const close = useStableCallback(onClose)
  React.useEffect(() => {
    if (!onClose) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [close, onClose])

  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    []
  )

  const copy = useStableCallback(onCopyPath)
  const hasCopyHandler = !!onCopyPath
  const path = deferredFile.path
  const copyPath = React.useCallback(() => {
    if (hasCopyHandler) copy(path)
    else void navigator.clipboard?.writeText(path).catch(() => {})
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }, [copy, hasCopyHandler, path])

  const showFile = React.useCallback(() => setRequested("file"), [])
  const showDiff = React.useCallback(() => setRequested("diff"), [])

  const layoutChanged = useStableCallback(onDiffLayoutChange)
  const toggleLayout = React.useCallback(() => {
    const next: FilePreviewDiffLayout = layout === "split" ? "unified" : "split"
    setInternalLayout(next)
    layoutChanged(next)
  }, [layout, layoutChanged])

  const wrapChanged = useStableCallback(onWrapChange)
  const toggleWrap = React.useCallback(() => {
    setInternalWrap(!wrapped)
    wrapChanged(!wrapped)
  }, [wrapChanged, wrapped])

  const header = (
    <div
      data-slot="file-preview-header"
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 border-b px-2.5",
        classNames?.header
      )}
    >
      <FileIcon path={deferredFile.path} size={14} />
      <button
        type="button"
        data-slot="file-preview-path"
        data-copied={copied || undefined}
        title="Copy path"
        onClick={copyPath}
        className="flex min-w-0 flex-1 items-baseline gap-1 rounded-md text-left font-mono text-[12px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {dir ? (
          <span className="min-w-0 truncate text-muted-foreground">{dir}</span>
        ) : null}
        <span className="shrink-0 font-medium text-foreground">{name}</span>
        {copied ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground">
            <Check className="size-3" />
            Copied
          </span>
        ) : null}
      </button>
      <DiffStats
        data-slot="file-preview-stats"
        added={model.added}
        removed={model.removed}
      />
      <div
        data-slot="file-preview-prefs"
        role="group"
        aria-label="View preferences"
        className="flex shrink-0 items-center"
      >
        <button
          type="button"
          data-slot="file-preview-wrap-toggle"
          aria-pressed={wrapped}
          onClick={toggleWrap}
          title={wrapped ? "Don't wrap" : "Wrap lines"}
          className={cn(
            filePreviewButton,
            "size-6 aria-pressed:text-foreground"
          )}
        >
          <WrapText />
        </button>
        {view === "diff" ? (
          <button
            type="button"
            data-slot="file-preview-layout-toggle"
            aria-pressed={layout === "split"}
            onClick={toggleLayout}
            title={layout === "split" ? "Unified view" : "Split view"}
            className={cn(
              filePreviewButton,
              "size-6 aria-pressed:text-foreground"
            )}
          >
            {layout === "split" ? <Rows3 /> : <Columns2 />}
          </button>
        ) : null}
      </div>
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
      {actions?.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-slot="file-preview-actions"
              aria-label="File actions"
              className={cn(filePreviewButton, "size-6")}
            >
              <MoreHorizontal />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {actions.map((action) => (
              <React.Fragment key={action.id}>
                {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  data-action={action.id}
                  variant={action.destructive ? "destructive" : "default"}
                  onSelect={() => action.onSelect(deferredFile.path)}
                  className="text-[12.5px]"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
  )

  return (
    <div
      data-slot="file-preview"
      data-view={view}
      data-layout={layout}
      data-wrap={wrapped ? "true" : "false"}
      role="dialog"
      aria-label={deferredFile.path}
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground",
        className,
        classNames?.root
      )}
      {...props}
    >
      <FileContextMenu path={deferredFile.path} actions={actions}>
        {header}
      </FileContextMenu>

      <div
        ref={bodyRef}
        data-slot="file-preview-body"
        className={cn(
          "relative min-h-0 flex-1 overflow-auto font-mono text-[12.5px] leading-[1.7]",
          classNames?.body
        )}
      >
        {image ? (
          <div
            data-slot="file-preview-image"
            className="flex min-h-full items-center justify-center p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a local file served by the host, not an optimizable asset */}
            <img
              src={image}
              alt={name}
              decoding="async"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : null}
        {!image && view === "file" && model.fileLines
          ? model.fileLines.map((text, index) => (
              <FileRow
                key={index}
                text={text}
                lineNumber={startLine + index}
                changed={model.changed.has(startLine + index)}
                focused={focusLine === startLine + index}
                tokens={highlighted?.[index]}
                wrap={wrapped}
              />
            ))
          : null}
        {view === "diff" && splitRows
          ? splitRows.map((row, index) => (
              <SplitRow
                key={index}
                row={row}
                leftTokens={
                  row.left ? highlighted?.[row.left.index] : undefined
                }
                rightTokens={
                  row.right ? highlighted?.[row.right.index] : undefined
                }
                wrap={wrapped}
              />
            ))
          : null}
        {!image && view === "diff" && hasDiff && !splitRows
          ? model.diffLines.map((line, index) => (
              <DiffRow
                key={index}
                line={line}
                tokens={highlighted?.[index]}
                wrap={wrapped}
              />
            ))
          : null}
        {!image && view === "diff" && !hasDiff && model.unparsed ? (
          <EmptyNote>
            This diff could not be parsed — it may have been truncated.
          </EmptyNote>
        ) : null}
        {!image && !hasFile && !hasDiff && !model.unparsed ? (
          <EmptyNote>No preview available for this file.</EmptyNote>
        ) : null}
        {!image && view === "diff" && hasDiff && model.unparsed ? (
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

  // An image's "content" is a stand-in line about the bytes; the host supplies
  // an `imageSrc` for it instead, and the panel shows the picture.
  if (isImagePath(path)) return preview

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
