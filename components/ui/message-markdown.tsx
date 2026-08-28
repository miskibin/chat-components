"use client"

import { useMemo, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { Streamdown } from "streamdown"
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

export type MarkdownPatternHandler = {
  pattern: RegExp
  render: (match: RegExpExecArray) => ReactNode
}

export function MessageMarkdown({
  children,
  className,
  isAnimating = false,
  patternHandlers = [],
}: {
  children: string
  className?: string
  isAnimating?: boolean
  patternHandlers?: MarkdownPatternHandler[]
}) {
  const { resolvedTheme } = useTheme()
  const mermaidTheme = resolvedTheme === "dark" ? "dark" : "neutral"

  const components = useMemo(() => {
    if (patternHandlers.length === 0) return undefined
    const process = (text: string): ReactNode => {
      const segments: ReactNode[] = []
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
        let rendered: ReactNode
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
    const wrap = (node: ReactNode): ReactNode => {
      if (Array.isArray(node)) {
        return node.map((child, index) => (
          <span key={index}>{typeof child === "string" ? process(child) : child}</span>
        ))
      }
      return typeof node === "string" ? process(node) : node
    }
    return {
      p: ({ children: kids, ...props }: { children?: ReactNode }) => (
        <p {...props}>{wrap(kids)}</p>
      ),
      li: ({ children: kids, ...props }: { children?: ReactNode }) => (
        <li {...props}>{wrap(kids)}</li>
      ),
    }
  }, [patternHandlers])

  return (
    <Streamdown
      className={cn("lc-markdown max-w-none", className)}
      plugins={plugins}
      shikiTheme={["github-light", "github-dark"]}
      mermaid={{ config: { theme: mermaidTheme } }}
      isAnimating={isAnimating}
      parseIncompleteMarkdown
      codeBlockMaxHeight={Infinity}
      tableMaxHeight={Infinity}
      components={components}
    >
      {children}
    </Streamdown>
  )
}
