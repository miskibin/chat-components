"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Streamdown, defaultRehypePlugins } from "streamdown"
import { code } from "@streamdown/code"
import { mermaid } from "@streamdown/mermaid"
import { createMathPlugin } from "@streamdown/math"
import "katex/dist/katex.min.css"
import "./message-markdown.css"

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

  const components = React.useMemo(() => {
    if (patternHandlers.length === 0) return undefined
    const process = (text: string): React.ReactNode => {
      const segments: React.ReactNode[] = []
      let cursor = 0
      while (cursor < text.length) {
        let earliest: {
          handler: MarkdownPatternHandler
          match: RegExpExecArray
          index: number
        } | null = null
        for (const handler of patternHandlers) {
          handler.pattern.lastIndex = cursor
          const match = handler.pattern.exec(text)
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
      p: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <p {...props}>{wrap(kids)}</p>
      ),
      li: ({ children: kids, ...props }: { children?: React.ReactNode }) => (
        <li {...props}>{wrap(kids)}</li>
      ),
    }
  }, [patternHandlers])

  return (
    <div data-slot="message-markdown" className="min-w-0">
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
    </div>
  )
})
