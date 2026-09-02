"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Streamdown, defaultRehypePlugins } from "streamdown"
import { code } from "@streamdown/code"
import { mermaid } from "@streamdown/mermaid"
import { createMathPlugin } from "@streamdown/math"
import "katex/dist/katex.min.css"
import "./message-markdown.css"

import {
  FileContextMenu,
  type FileActionItem,
} from "@/components/ui/change-summary"
import { FileIcon } from "@/components/ui/file-icon"
import { cn } from "@/lib/utils"

const math = createMathPlugin({
  singleDollarTextMath: true,
})

const plugins = { code, mermaid, math }

type RehypePlugins = React.ComponentProps<typeof Streamdown>["rehypePlugins"]
type SanitizeSchema = { protocols?: Record<string, string[]> }

/**
 * Streamdown's sanitizer only lets `http` and `https` through on `src`, so an
 * answer that inlines an image as a `data:` URI — how an agent hands back a
 * screenshot or a rendered chart — loses the `<img>` entirely.
 *
 * Putting that one protocol back is the whole change: the `harden` pass that
 * runs straight after the sanitizer already narrows `data:` down to
 * `data:image/*`, so nothing but a picture can ride in on it.
 */
function withDataImages(): RehypePlugins {
  const { raw, sanitize, harden } = defaultRehypePlugins
  if (!Array.isArray(sanitize)) return Object.values(defaultRehypePlugins)
  const [plugin, schema] = sanitize as [typeof sanitize[0], SanitizeSchema]
  return [
    raw,
    [
      plugin,
      {
        ...schema,
        protocols: {
          ...schema.protocols,
          src: [...(schema.protocols?.src ?? []), "data"],
        },
      },
    ],
    harden,
  ]
}

const rehypePlugins = withDataImages()
const shikiTheme: ["github-light", "github-dark"] = [
  "github-light",
  "github-dark",
]
const EMPTY_HANDLERS: MarkdownPatternHandler[] = []

export type MarkdownPatternHandler = {
  pattern: RegExp
  render: (match: RegExpExecArray) => React.ReactNode
}

export type MessageMarkdownProps = {
  children: string
  className?: string
  /** True while the text is still streaming in. */
  isAnimating?: boolean
  /** Inline replacements applied to paragraph and list-item text. */
  patternHandlers?: MarkdownPatternHandler[]
  /**
   * Makes an inline-code file reference a button — the path arrives without
   * its `:line` suffix, and the line it named arrives beside it, ready to
   * hand to a file panel.
   */
  onFileClick?: (path: string, line?: number) => void
  /**
   * Right-click menu for every file the answer names — the path chips and the
   * images it renders. Keep the array stable: it reaches memoized blocks.
   */
  fileActions?: FileActionItem[]
}

type FileRefContextValue = {
  onFileClick: ((path: string, line?: number) => void) | null
  fileActions?: FileActionItem[]
}

const NO_FILE_REFS: FileRefContextValue = { onFileClick: null }

/**
 * What a file reference can do reaches the renderers through context rather
 * than through a closure, so they can stay module-scope: Streamdown memoizes
 * each block against `components` key by key, by reference, and a fresh
 * function per render would re-render every block on every token.
 */
const FileRefContext = React.createContext<FileRefContextValue>(NO_FILE_REFS)

const LINE_SUFFIX_RE = /:\d+(?::\d+)?$/
const URL_SCHEME_RE = /^[a-zA-Z][\w+.-]*:\/\//
/** `a/b/c.ts`, `./x.ts`, `~/notes.txt`, `.gitignore` — one path, no spaces. */
const PATH_SHAPE_RE = /^(?:~|\.{1,2})?\/?(?:[\w@.-]+\/)*[\w@.-]+$/
const FILE_EXTENSION_RE =
  /\.(tsx?|jsx?|mjs|cjs|json[c5]?|ya?ml|toml|mdx?|css|s[ac]ss|less|py|rs|go|java|kt|rb|php|c|h|cc|cpp|cxx|hpp|sh|bash|zsh|sql|graphql|proto|prisma|vue|svelte|html?|xml|svg|txt|csv|tsv|env|lock|log|ini|cfg|conf)$/i
/**
 * Extension-less names that are still unmistakably files. Dot-files are
 * enumerated rather than matched as “starts with a dot”, so a `.length` in an
 * answer stays code.
 */
const KNOWN_FILENAME_RE =
  /^(dockerfile|makefile|gemfile|procfile|readme|licen[cs]e|\.(env|gitignore|gitattributes|gitmodules|npmrc|nvmrc|editorconfig|dockerignore|babelrc|prettierrc|eslintrc)[\w.-]*)$/i
/** `Next.js` and friends are prose about a library, not a JavaScript file. */
const LIBRARY_DOT_JS_RE =
  /^(next|node|nuxt|vue|react|three|d3|socket|express|nest|jquery|chart|video)\.js$/i

/**
 * The path inside an inline-code span, or null when it reads as ordinary code.
 * Deliberately conservative: a recognized extension (or a well-known
 * extension-less filename) carries a reference on its own, while a bare
 * slashed string has to be at least three segments deep — otherwise every
 * `and/or` in an answer would turn into a file chip.
 */
function fileReferencePath(raw: string): string | null {
  const text = raw.trim()
  if (!text || text.length > 120 || /\s/.test(text)) return null
  if (URL_SCHEME_RE.test(text)) return null
  const path = text.replace(LINE_SUFFIX_RE, "")
  if (!PATH_SHAPE_RE.test(path)) return null
  const segments = path.split("/").filter(Boolean)
  const base = segments.at(-1) ?? path
  if (FILE_EXTENSION_RE.test(base) && !LIBRARY_DOT_JS_RE.test(base)) return path
  if (KNOWN_FILENAME_RE.test(base)) return path
  return segments.length >= 3 ? path : null
}

/** The `:12` (or `:12:5`) a reference trails — the line, never the column. */
function fileReferenceLine(raw: string): number | undefined {
  const match = LINE_SUFFIX_RE.exec(raw.trim())
  if (!match) return undefined
  const line = Number(match[0].slice(1).split(":")[0])
  return Number.isFinite(line) ? line : undefined
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  return ""
}

const fileRefChip =
  "inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0 align-baseline font-mono text-[12px] text-foreground/90"

/**
 * Streamdown routes bare inline spans here and leaves fenced blocks (and
 * mermaid / math) on their own renderer, so this only ever sees `` `code` ``.
 * Anything that is not a file reference renders as Streamdown's own inline
 * code, untouched.
 */
function InlineCode({
  node,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"code">, "ref"> & { node?: unknown }) {
  // `node` is Streamdown's hast element — destructured out so it never reaches
  // the DOM, and of no use to a chip that reads its own text.
  void node
  const { onFileClick, fileActions } = React.useContext(FileRefContext)
  const text = textOf(children)
  const path = fileReferencePath(text)

  if (!path) {
    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
          className
        )}
        data-streamdown="inline-code"
        {...props}
      >
        {children}
      </code>
    )
  }

  // The chip keeps saying `file.ts:42`; only the handler is told the number.
  const line = fileReferenceLine(text)
  const label = (
    <>
      <FileIcon path={path} size={13} aria-hidden />
      {children}
    </>
  )

  // A chip is only a control where the host can act on the click.
  const chip = !onFileClick ? (
    <span
      data-slot="message-file-ref"
      data-path={path}
      className={cn(fileRefChip, className)}
      {...props}
    >
      {label}
    </span>
  ) : (
    <button
      type="button"
      data-slot="message-file-ref"
      data-path={path}
      data-interactive="true"
      title={path}
      onClick={() => onFileClick(path, line)}
      className={cn(
        fileRefChip,
        "cursor-pointer outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {label}
    </button>
  )

  return (
    <FileContextMenu path={path} actions={fileActions}>
      {chip}
    </FileContextMenu>
  )
}

/**
 * Only used when the host offered file actions — Streamdown's own renderer,
 * with its hover download control, stays in place otherwise.
 *
 * A `data:` image is its own bytes rather than a file on the machine, so it
 * gets no menu. Anything else is handed over as written: a host that rewrote a
 * local path into `/api/files?path=…` gets that URL back and decodes it.
 */
function MarkdownImage({
  node,
  className,
  src,
  alt,
  ...props
}: Omit<React.ComponentProps<"img">, "ref"> & { node?: unknown }) {
  void node
  const { fileActions } = React.useContext(FileRefContext)
  const path = typeof src === "string" && !src.startsWith("data:") ? src : null
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- data: URLs and arbitrary remote hosts, not a next/image-friendly asset
    <img
      data-slot="message-markdown-image"
      data-streamdown="image"
      src={src}
      alt={alt ?? ""}
      className={cn("max-w-full rounded-lg", className)}
      {...props}
    />
  )
  if (!path) return image
  return (
    <FileContextMenu path={path} actions={fileActions}>
      {image}
    </FileContextMenu>
  )
}

/**
 * Holds a callback prop at one identity, so a parent that re-renders on every
 * streamed token does not invalidate what depends on it.
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

/**
 * Memoized so a streaming message list only re-renders the message that
 * actually changed.
 */
export const MessageMarkdown = React.memo(function MessageMarkdown({
  children,
  className,
  isAnimating = false,
  patternHandlers = EMPTY_HANDLERS,
  onFileClick,
  fileActions,
}: MessageMarkdownProps) {
  const { resolvedTheme } = useTheme()
  const mermaidConfig = React.useMemo(
    () => ({
      config: {
        theme: resolvedTheme === "dark" ? ("dark" as const) : ("neutral" as const),
      },
    }),
    [resolvedTheme]
  )

  /* Overriding `img` costs Streamdown's own download control, so it is only
     swapped in where the host actually has something to offer on a picture. */
  const menuOnImages = !!fileActions?.length

  const components = React.useMemo(() => {
    const image = menuOnImages ? { img: MarkdownImage } : null
    // `inlineCode` is the same function every time — Streamdown compares the
    // map key by key, by reference, so rebuilding the object costs nothing.
    if (patternHandlers.length === 0) return { inlineCode: InlineCode, ...image }
    /**
     * Scanning from an offset needs `lastIndex`, which is state on the regex —
     * so each handler gets a private copy, always global. The caller's own
     * RegExp is never written to (rendering must not mutate props), and a
     * pattern handed in without the `g` flag now advances instead of matching
     * its first hit forever.
     */
    const compiled = patternHandlers.map((handler) => ({
      handler,
      pattern: new RegExp(
        handler.pattern.source,
        handler.pattern.flags.includes("g")
          ? handler.pattern.flags
          : handler.pattern.flags + "g"
      ),
    }))
    const process = (text: string): React.ReactNode => {
      const segments: React.ReactNode[] = []
      let cursor = 0
      while (cursor < text.length) {
        let earliest: {
          handler: MarkdownPatternHandler
          match: RegExpExecArray
          index: number
        } | null = null
        for (const { handler, pattern } of compiled) {
          pattern.lastIndex = cursor
          const match = pattern.exec(text)
          if (match && (!earliest || match.index < earliest.index)) {
            earliest = { handler, match, index: match.index }
          }
        }
        if (!earliest) {
          segments.push(text.slice(cursor))
          break
        }
        if (earliest.index > cursor) {
          segments.push(text.slice(cursor, earliest.index))
        }
        let rendered: React.ReactNode
        try {
          rendered = earliest.handler.render(earliest.match) ?? earliest.match[0]
        } catch {
          rendered = earliest.match[0]
        }
        segments.push(rendered)
        cursor = earliest.index + earliest.match[0].length
      }
      return segments
    }
    const wrap = (node: React.ReactNode): React.ReactNode => {
      if (Array.isArray(node)) {
        return node.map((child, index) => (
          <span key={index}>
            {typeof child === "string" ? process(child) : child}
          </span>
        ))
      }
      return typeof node === "string" ? process(node) : node
    }
    return {
      inlineCode: InlineCode,
      ...image,
      p: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <p {...props}>{wrap(kids)}</p>
      ),
      li: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <li {...props}>{wrap(kids)}</li>
      ),
    }
  }, [patternHandlers, menuOnImages])

  /* Either the stable callback or null — one identity each, so the provider
     never invalidates the blocks below it mid-stream. */
  const stableFileClick = useStableCallback(onFileClick)
  const fileClick = onFileClick ? stableFileClick : null
  const fileRefs = React.useMemo(
    () => ({ onFileClick: fileClick, fileActions }),
    [fileClick, fileActions]
  )

  return (
    <div data-slot="message-markdown" className="min-w-0">
      <FileRefContext.Provider value={fileRefs}>
        <Streamdown
          className={cn("lc-markdown max-w-none", className)}
          plugins={plugins}
          rehypePlugins={rehypePlugins}
          shikiTheme={shikiTheme}
          mermaid={mermaidConfig}
          isAnimating={isAnimating}
          parseIncompleteMarkdown
          codeBlockMaxHeight={Infinity}
          tableMaxHeight={Infinity}
          components={components}
        >
          {children}
        </Streamdown>
      </FileRefContext.Provider>
    </div>
  )
})
