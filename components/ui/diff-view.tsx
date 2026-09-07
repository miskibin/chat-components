"use client"

// Adapted from T3 Code (github.com/pingdotgg/t3code), MIT License, (c) 2026 T3 Tools Inc.
import {
  getSingularPatch,
  parseDiffFromFile,
  type CodeViewItem,
  type DiffsThemeNames,
  type FileDiffMetadata,
  type SupportedLanguages,
  type ThemesType,
} from "@pierre/diffs"
import {
  CodeView,
  type CodeViewHandle,
  type CodeViewReactOptions,
} from "@pierre/diffs/react"
import { useTheme } from "next-themes"
import * as React from "react"

import { cn } from "@/lib/utils"
import { PREFERRED_HIGHLIGHTER, DIFF_THEMES } from "@/lib/syntax-highlighting"

export type DiffViewMode = "unified" | "split"

/**
 * Every option `DiffView` owns is removed: passing one here would be silently
 * overwritten, which is worse than not compiling.
 */
export type DiffViewOptions = Omit<
  CodeViewReactOptions<undefined, undefined>,
  | "theme"
  | "themeType"
  | "overflow"
  | "diffStyle"
  | "disableLineNumbers"
  | "disableFileHeader"
  | "unsafeCSS"
  | "preferredHighlighter"
  | "itemMetrics"
  | "layout"
>

export type DiffViewProps = Omit<
  React.ComponentProps<"div">,
  "children" | "content"
> & {
  /** Names the file in the header and picks the language when none is given. */
  path: string
  /** Overrides the language inferred from `path`. */
  language?: string
  /** Unified patch text. Outranks `oldText`/`newText`. */
  patch?: string
  /** Before/after pair, when there is no patch to hand. */
  oldText?: string
  newText?: string
  /** No diff at all: the file itself, highlighted and virtualized. */
  content?: string
  /** First line number of `content`, for a partial read. */
  startLine?: number
  /** Side by side or one column. Ignored without a diff. */
  mode?: DiffViewMode
  /** Soft-wrap long lines; off, the code scrolls sideways. */
  wrap?: boolean
  /** Gutter line numbers. */
  lineNumbers?: boolean
  /** Pierre's own per-file header — off by default, since the host usually has one. */
  fileHeader?: boolean
  /**
   * Lines to tint, in the file's own numbering — the lines an agent touched,
   * a search's hits. Beyond 400 the tint is dropped rather than emitting a
   * stylesheet that costs more than it says.
   */
  highlightLines?: Iterable<number>
  /** 1-based line to centre, in the file's own numbering. */
  focusLine?: number
  /** Bump it to ask for the same `focusLine` again. */
  focusNonce?: number
  /** Shiki theme, or a light/dark pair. Defaults to Pierre's own two. */
  theme?: DiffsThemeNames | ThemesType
  /** Appended inside the viewer's shadow root, after the token bindings. */
  unsafeCSS?: string
  /** Everything `DiffView` does not own, forwarded to `CodeView`. */
  options?: DiffViewOptions
  /** Shown when there is nothing to render. */
  emptyLabel?: React.ReactNode
  classNames?: { root?: string; surface?: string; note?: string }
}

/**
 * A controlled `CodeView` reconciles an item by its `version` alone — same
 * version, same record, whatever the payload says. So every model this builds
 * carries a fresh one: it never has to equal anything, only differ from the
 * number the viewer is holding.
 */
let nextItemVersion = 0

/** Past this the per-line stylesheet costs more than the tint is worth. */
const HIGHLIGHT_LINE_CAP = 400

/**
 * Binds every surface `@pierre/diffs` paints to the shadcn tokens. Custom
 * properties cross the shadow boundary, so `var(--background)` inside the
 * viewer is the page's own background and a theme swap needs no re-render.
 *
 * Additions and deletions have no semantic token to borrow — the registry's
 * dark-safe green and red are the defaults, and `--chat-diff-added` /
 * `--chat-diff-removed` set anywhere above the viewer replace them.
 */
const TOKEN_CSS = `
:host,
[data-diffs-header],
[data-diff],
[data-file],
[data-error-wrapper],
[data-virtualizer-buffer] {
  --diff-add: var(--chat-diff-added, oklch(0.696 0.17 162.48));
  --diff-del: var(--chat-diff-removed, oklch(0.637 0.237 25.331));

  --diffs-header-font-family: var(--font-sans) !important;
  --diffs-font-family: var(--font-mono) !important;
  --diffs-bg: var(--background) !important;
  --diffs-light-bg: var(--background) !important;
  --diffs-dark-bg: var(--background) !important;
  --diffs-token-light-bg: transparent;
  --diffs-token-dark-bg: transparent;

  /* Gutter, context and row tints all mix from the surface the code sits on,
     so a theme that separates the canvas from the panel keeps both. */
  --diffs-bg-context-override: color-mix(in srgb, var(--background) 97%, var(--foreground));
  --diffs-bg-context-gutter-override: color-mix(in srgb, var(--background) 95%, var(--foreground));
  --diffs-bg-hover-override: color-mix(in srgb, var(--background) 94%, var(--foreground));
  --diffs-bg-separator-override: color-mix(in srgb, var(--background) 95%, var(--foreground));
  --diffs-bg-buffer-override: color-mix(in srgb, var(--background) 90%, var(--foreground));
  --diffs-fg-number-override: color-mix(in srgb, var(--muted-foreground) 80%, transparent);

  --diffs-bg-addition-override: light-dark(
    color-mix(in srgb, var(--background) 88%, var(--diff-add)),
    color-mix(in srgb, var(--background) 84%, var(--diff-add))
  );
  --diffs-bg-addition-number-override: light-dark(
    color-mix(in srgb, var(--background) 78%, var(--diff-add)),
    color-mix(in srgb, var(--background) 74%, var(--diff-add))
  );
  --diffs-bg-addition-emphasis-override: color-mix(in srgb, var(--background) 66%, var(--diff-add));

  --diffs-bg-deletion-override: light-dark(
    color-mix(in srgb, var(--background) 88%, var(--diff-del)),
    color-mix(in srgb, var(--background) 84%, var(--diff-del))
  );
  --diffs-bg-deletion-number-override: light-dark(
    color-mix(in srgb, var(--background) 78%, var(--diff-del)),
    color-mix(in srgb, var(--background) 74%, var(--diff-del))
  );
  --diffs-bg-deletion-emphasis-override: color-mix(in srgb, var(--background) 66%, var(--diff-del));

  --diffs-addition-color-override: var(--diff-add);
  --diffs-deletion-color-override: var(--diff-del);

  background-color: var(--diffs-bg) !important;
  color: var(--foreground) !important;
}

[data-diffs-header],
[data-file-info] {
  background-color: var(--background) !important;
  border-block-color: var(--border) !important;
  color: var(--foreground) !important;
  font-family: var(--font-sans) !important;
  font-size: 12px !important;
}

:is([data-separator="line-info"], [data-separator="line-info-basic"]) [data-separator-content] {
  color: var(--muted-foreground) !important;
  font-family: var(--font-sans) !important;
  font-size: 11px !important;
}
`

/**
 * Rows the host asked us to mark. `data-line` carries the file's own number on
 * every rendered row, so one rule per line is all the tint takes — and it lands
 * on a virtualized row the moment it mounts.
 */
function highlightCSS(lines: readonly number[]) {
  if (lines.length === 0) return ""
  const selector = lines.map((line) => `[data-line="${line}"]`).join(",\n")
  return `\n${selector} {\n  --diffs-line-bg: color-mix(in srgb, var(--background) 86%, var(--diff-add)) !important;\n}\n`
}

/**
 * A patch carries only the lines around each change, but Pierre's parser keeps
 * every hunk's render start in *source file* coordinates — so a hunk at line
 * 400 reserves 400 rows of virtualized height that are never drawn, and the
 * end of the file sits past the reachable scroll range. The virtualizer walks a
 * partial patch as compact rows, so the starts have to be compact too;
 * `collapsedBefore` is left alone, because that is what draws the
 * "N unmodified lines" separator.
 */
function compactPartialHunks(file: FileDiffMetadata): FileDiffMetadata {
  if (!file.isPartial) return file

  let splitLineStart = 0
  let unifiedLineStart = 0
  const hunks = file.hunks.map((hunk) => {
    const compacted = { ...hunk, splitLineStart, unifiedLineStart }
    splitLineStart += hunk.splitLineCount
    unifiedLineStart += hunk.unifiedLineCount
    return compacted
  })

  return {
    ...file,
    hunks,
    splitLineCount: splitLineStart,
    unifiedLineCount: unifiedLineStart,
    ...(file.cacheKey ? { cacheKey: `${file.cacheKey}:compact-partial` } : {}),
  }
}

/** `content` with a trailing newline trimmed, split into rows. */
function splitLines(text: string) {
  return text.length === 0 ? [""] : text.replace(/\n$/, "").split("\n")
}

/**
 * A partial read as a context-only patch. A file item always numbers from 1,
 * and a `Read` that started at line 400 has to say 400 — a diff item numbers
 * from its hunk header, which is the one place the real numbers survive.
 */
function contextPatch(path: string, content: string, startLine: number) {
  const lines = splitLines(content)
  const span = `${startLine},${lines.length}`
  // No `a/`/`b/` prefixes: Pierre reads them as two different names and calls
  // an unchanged excerpt a rename.
  return [
    `--- ${path}`,
    `+++ ${path}`,
    `@@ -${span} +${span} @@`,
    ...lines.map((line) => ` ${line}`),
    "",
  ].join("\n")
}

type DiffModel =
  | { kind: "none" }
  | { kind: "item"; item: CodeViewItem<undefined>; diff: boolean }
  /** A patch we could not parse — shown as its own text rather than thrown away. */
  | { kind: "raw"; item: CodeViewItem<undefined>; note: string }

/**
 * One pass over whatever the host handed us. A patch wins, then a before/after
 * pair, then the plain body. Nothing here throws: an unparseable patch renders
 * as text with a note, because a reader would rather see the patch than a
 * blank panel.
 */
function buildModel(
  path: string,
  lang: SupportedLanguages | undefined,
  patch: string | undefined,
  oldText: string | undefined,
  newText: string | undefined,
  content: string | undefined,
  startLine: number
): DiffModel {
  const id = path || "file"
  const version = ++nextItemVersion

  if (patch?.trim()) {
    try {
      const fileDiff = compactPartialHunks(getSingularPatch(patch))
      return {
        kind: "item",
        diff: true,
        item: { id, type: "diff", fileDiff, version },
      }
    } catch {
      return {
        kind: "raw",
        note: "This diff could not be parsed — it may have been truncated.",
        item: {
          id,
          type: "file",
          version,
          file: { name: `${path}.diff`, contents: patch },
        },
      }
    }
  }

  if (oldText !== undefined && newText !== undefined && oldText !== newText) {
    const fileDiff = parseDiffFromFile(
      { name: path, contents: oldText, ...(lang ? { lang } : {}) },
      { name: path, contents: newText, ...(lang ? { lang } : {}) }
    )
    return {
      kind: "item",
      diff: true,
      item: { id, type: "diff", fileDiff, version },
    }
  }

  const body = content ?? newText
  if (body === undefined) return { kind: "none" }

  if (startLine > 1) {
    try {
      const fileDiff = compactPartialHunks(
        getSingularPatch(contextPatch(path, body, startLine))
      )
      return {
        kind: "item",
        diff: false,
        item: { id, type: "diff", fileDiff, version },
      }
    } catch {
      // Fall through to the plain file: numbering from 1 beats no body.
    }
  }

  return {
    kind: "item",
    diff: false,
    item: {
      id,
      type: "file",
      version,
      file: { name: path, contents: body, ...(lang ? { lang } : {}) },
    },
  }
}

/**
 * A file or a diff, highlighted and virtualized by `@pierre/diffs`, themed with
 * the app's own tokens. A megabyte renders as cheaply as a page: only the rows
 * on screen exist, and with a `DiffWorkerPoolProvider` above it the
 * highlighting happens off the main thread.
 *
 * The viewer owns its scroll container, so give it a height.
 */
export function DiffView({
  path,
  language,
  patch,
  oldText,
  newText,
  content,
  startLine = 1,
  mode = "unified",
  wrap = true,
  lineNumbers = true,
  fileHeader = false,
  highlightLines,
  focusLine,
  focusNonce,
  theme,
  unsafeCSS,
  options,
  emptyLabel = "No preview available for this file.",
  className,
  classNames,
  style,
  ...props
}: DiffViewProps) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  const lang = language as SupportedLanguages | undefined
  const model = React.useMemo(
    () => buildModel(path, lang, patch, oldText, newText, content, startLine),
    [path, lang, patch, oldText, newText, content, startLine]
  )

  const marked = React.useMemo(() => {
    if (!highlightLines) return ""
    const lines: number[] = []
    for (const line of highlightLines) {
      if (lines.length > HIGHLIGHT_LINE_CAP) return ""
      lines.push(line)
    }
    return highlightCSS(lines)
  }, [highlightLines])

  const css = React.useMemo(
    () => `${TOKEN_CSS}${marked}${unsafeCSS ? `\n${unsafeCSS}` : ""}`,
    [marked, unsafeCSS]
  )

  const viewerOptions = React.useMemo<CodeViewReactOptions<undefined, undefined>>(
    () => ({
      ...options,
      theme: theme ?? DIFF_THEMES,
      themeType: dark ? "dark" : "light",
      overflow: wrap ? "wrap" : "scroll",
      diffStyle: mode === "split" ? "split" : "unified",
      disableLineNumbers: !lineNumbers,
      disableFileHeader: !fileHeader,
      preferredHighlighter: PREFERRED_HIGHLIGHTER,
      unsafeCSS: css,
      itemMetrics: {
        diffHeaderHeight: fileHeader ? 32 : 0,
        hunkSeparatorHeight: 24,
        spacing: 0,
        paddingTop: 0,
        // The 8px under a file's last line is painted unconditionally by
        // Pierre's stylesheet, so the metric has to count it or the end of the
        // list sits past the reachable scroll range.
        paddingBottom: 8,
      },
      layout: { paddingTop: 0, paddingBottom: 0, gap: 0 },
    }),
    [options, theme, dark, wrap, mode, lineNumbers, fileHeader, css]
  )

  // State rather than a ref: the reveal effect below has to run again once the
  // viewer exists, and assigning a ref does not schedule that.
  const [handle, setHandle] = React.useState<CodeViewHandle<
    undefined,
    undefined
  > | null>(null)

  const item = model.kind === "none" ? undefined : model.item
  const itemId = item?.id
  const isDiffItem = item?.type === "diff"
  const isDiff = model.kind === "item" && model.diff
  const items = React.useMemo(() => (item ? [item] : []), [item])

  /**
   * Centre the requested line once per request. The line *and* the host's
   * nonce make the request: the same line asked for twice is two requests, and
   * only the host can tell them apart.
   */
  const revealKey =
    focusLine == null || itemId == null
      ? null
      : `${itemId}\0${focusLine}\0${focusNonce ?? ""}`
  const revealedRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (revealKey === null || itemId == null || focusLine == null) return
    if (revealedRef.current === revealKey) return
    if (!handle?.getInstance()) return
    revealedRef.current = revealKey
    handle.scrollTo({
      type: "line",
      id: itemId,
      lineNumber: focusLine,
      ...(isDiffItem ? { side: "additions" as const } : {}),
      align: "center",
    })
  }, [focusLine, handle, isDiffItem, itemId, revealKey])

  return (
    <div
      data-slot="diff-view"
      data-mode={isDiff ? mode : "file"}
      data-wrap={wrap ? "true" : "false"}
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground",
        className,
        classNames?.root
      )}
      style={{ colorScheme: dark ? "dark" : "light", ...style }}
      {...props}
    >
      {model.kind === "raw" ? (
        <p
          data-slot="diff-view-note"
          className={cn(
            "shrink-0 border-b px-3 py-1.5 text-[12px] text-muted-foreground",
            classNames?.note
          )}
        >
          {model.note}
        </p>
      ) : null}
      {model.kind === "none" ? (
        <p
          data-slot="diff-view-empty"
          className={cn(
            "px-3 py-2 text-[12.5px] text-muted-foreground",
            classNames?.note
          )}
        >
          {emptyLabel}
        </p>
      ) : (
        <div
          data-slot="diff-view-surface"
          className={cn("min-h-0 flex-1", classNames?.surface)}
        >
          <CodeView<undefined, undefined>
            ref={setHandle}
            items={items}
            options={viewerOptions}
            className="h-full font-mono text-[12.5px] outline-none"
          />
        </div>
      )}
    </div>
  )
}
