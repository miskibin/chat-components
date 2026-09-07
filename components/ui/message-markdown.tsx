"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Block,
  Streamdown,
  defaultRehypePlugins,
  type BlockProps,
} from "streamdown"
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
import { RenderErrorBoundary } from "@/components/ui/render-error-boundary"
import { markdownClipboardPayload } from "@/lib/markdown-clipboard"
import {
  inlineCodeFileReference,
  parseMarkdownFileLink,
  type FilePathPosition,
} from "@/lib/markdown-file-paths"
import { remarkGithubAlerts } from "@/lib/markdown-github-alerts"
import { remarkNormalizeListItemIndentation } from "@/lib/markdown-list-indentation"
import { cn } from "@/lib/utils"

const math = createMathPlugin({
  singleDollarTextMath: true,
})

const plugins = { code, mermaid, math }

type RehypePlugins = React.ComponentProps<typeof Streamdown>["rehypePlugins"]
type SanitizeSchema = {
  protocols?: Record<string, string[]>
  attributes?: Record<string, unknown[]>
}

/**
 * Two holes in Streamdown's sanitizer, both of which cost a whole feature.
 *
 * It only lets `http` and `https` through on `src`, so an answer that inlines
 * an image as a `data:` URI — how an agent hands back a screenshot or a
 * rendered chart — loses the `<img>` entirely. Putting that one protocol back
 * is safe: the `harden` pass that runs straight after already narrows `data:`
 * down to `data:image/*`, so nothing but a picture can ride in on it.
 *
 * And it drops every `data-` attribute, which would take `data-alert` off the
 * blockquotes `remarkGithubAlerts` marks before the CSS ever sees them. Only
 * that one attribute, only on a blockquote, and its value is one of five words
 * the plugin itself writes.
 */
function messageRehypePlugins(): RehypePlugins {
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
        attributes: {
          ...schema.attributes,
          blockquote: [
            ...(schema.attributes?.blockquote ?? []),
            "dataAlert",
          ],
        },
      },
    ],
    harden,
  ]
}

const rehypePlugins = messageRehypePlugins()

type RemarkPlugins = React.ComponentProps<typeof Streamdown>["remarkPlugins"]

/**
 * Two things GFM does not do on its own. `remarkGithubAlerts` lifts a
 * `> [!NOTE]` marker onto the blockquote as `data-alert`, which
 * `message-markdown.css` styles as a callout; `remarkNormalizeListItemIndentation`
 * undoes the CommonMark rule that turns `-       aligned text` into a code
 * block, which an agent's own alignment hits constantly.
 */
const remarkPlugins = [
  remarkGithubAlerts,
  remarkNormalizeListItemIndentation,
] as unknown as RemarkPlugins

/**
 * One block, isolated. A malformed fence, an unbalanced KaTeX brace or a
 * half-streamed mermaid diagram throws during render, and without a boundary
 * that throw unmounts the whole message — the answer, the tool rows, the turn.
 * Here it costs one block, which falls back to its own source as plain text.
 *
 * Module scope on purpose: `BlockComponent` reaches a memoized renderer, and a
 * component redefined per render would remount every block on every token.
 */
function IsolatedBlock(props: BlockProps) {
  return (
    <RenderErrorBoundary
      resetKeys={[props.content]}
      fallback={
        <pre
          data-slot="message-markdown-block-fallback"
          className="my-2 overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-foreground"
        >
          {props.content}
        </pre>
      }
    >
      <Block {...props} />
    </RenderErrorBoundary>
  )
}
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
  /**
   * Copying a selection out of the answer writes markdown rather than the
   * flattened text the browser would put on the clipboard — links, emphasis,
   * lists, fences and tables all survive the round trip, and a rich-paste
   * target gets a sanitized copy of the rendered HTML beside it.
   *
   * @default true
   */
  copyAsMarkdown?: boolean
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
  const reference = inlineCodeFileReference(text)

  if (!reference) {
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
  const { path, line } = reference
  const label = (
    <>
      <FileIcon path={path} size={13} aria-hidden />
      {children}
    </>
  )
  /* Copying a selection that crosses this chip must yield the code span the
     answer wrote, not the empty string a <button> serializes to. */
  const copyAs = `\`${text}\``

  /* A chip with no click handler is still a right-click target, so it has to
     be reachable: focused, Shift+F10 and the Menu key open the same menu. */
  const menuOnly = !!fileActions?.length
  const chip = !onFileClick ? (
    <span
      data-slot="message-file-ref"
      data-path={path}
      data-markdown-copy={copyAs}
      tabIndex={menuOnly ? 0 : undefined}
      className={cn(
        fileRefChip,
        menuOnly &&
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {label}
    </span>
  ) : (
    <button
      type="button"
      data-slot="message-file-ref"
      data-path={path}
      data-markdown-copy={copyAs}
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
  // Same as the chip: an image that carries a menu is focusable, so the
  // keyboard can open it.
  const menuable = !!path && !!fileActions?.length
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- data: URLs and arbitrary remote hosts, not a next/image-friendly asset
    <img
      data-slot="message-markdown-image"
      data-streamdown="image"
      src={src}
      alt={alt ?? ""}
      tabIndex={menuable ? 0 : undefined}
      className={cn(
        "max-w-full rounded-lg",
        menuable &&
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
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
 * A markdown link whose destination is a path on this machine — `[the
 * route](app/page.tsx:12)`, or a `file://` URL a harness pasted. Rendered as
 * the same chip an inline-code path gets, so both open the same panel at the
 * same line. Anything that is not a file stays an ordinary link.
 */
function MarkdownLink({
  node,
  className,
  href,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "ref"> & { node?: unknown }) {
  void node
  const { onFileClick, fileActions } = React.useContext(FileRefContext)
  const reference: FilePathPosition | null =
    typeof href === "string" ? parseMarkdownFileLink(href) : null

  if (!reference || !onFileClick) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    )
  }

  const { path, line } = reference
  return (
    <FileContextMenu path={path} actions={fileActions}>
      <button
        type="button"
        data-slot="message-file-ref"
        data-path={path}
        data-markdown-copy={`[${textOf(children)}](${href})`}
        data-interactive="true"
        title={path}
        onClick={() => onFileClick(path, line)}
        className={cn(
          fileRefChip,
          "cursor-pointer outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className
        )}
      >
        <FileIcon path={path} size={13} aria-hidden />
        {children}
      </button>
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
  copyAsMarkdown = true,
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

  /* Overriding `a` is only worth its own renderer where a file link has
     somewhere to go — otherwise Streamdown's own anchor stays in place. */
  const linksToFiles = !!onFileClick

  const components = React.useMemo(() => {
    const image = menuOnImages ? { img: MarkdownImage } : null
    const link = linksToFiles ? { a: MarkdownLink } : null
    // `inlineCode` is the same function every time — Streamdown compares the
    // map key by key, by reference, so rebuilding the object costs nothing.
    if (patternHandlers.length === 0) {
      return { inlineCode: InlineCode, ...image, ...link }
    }
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
      ...link,
      p: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <p {...props}>{wrap(kids)}</p>
      ),
      li: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <li {...props}>{wrap(kids)}</li>
      ),
    }
  }, [linksToFiles, patternHandlers, menuOnImages])

  /* Either the stable callback or null — one identity each, so the provider
     never invalidates the blocks below it mid-stream. */
  const stableFileClick = useStableCallback(onFileClick)
  const fileClick = onFileClick ? stableFileClick : null
  const fileRefs = React.useMemo(
    () => ({ onFileClick: fileClick, fileActions }),
    [fileClick, fileActions]
  )

  /**
   * Serializing the selection back to markdown, on the way to the clipboard.
   * One stable handler on the wrapper: the work happens only when someone
   * actually copies, and nothing below it re-renders because of it.
   */
  const handleCopy = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) return
      const payload = markdownClipboardPayload(selection)
      if (!payload) return
      event.clipboardData.setData("text/plain", payload.text)
      event.clipboardData.setData("text/html", payload.html)
      event.preventDefault()
    },
    []
  )

  return (
    <div
      data-slot="message-markdown"
      className="min-w-0"
      onCopy={copyAsMarkdown ? handleCopy : undefined}
    >
      <FileRefContext.Provider value={fileRefs}>
        <Streamdown
          className={cn("lc-markdown max-w-none", className)}
          plugins={plugins}
          rehypePlugins={rehypePlugins}
          remarkPlugins={remarkPlugins}
          BlockComponent={IsolatedBlock}
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
