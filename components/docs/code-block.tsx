import { CopyButton } from "@/components/docs/copy-button"
import { highlightCode } from "@/components/docs/highlight"
import { cn } from "@/lib/utils"

export type CodeBlockProps = {
  code: string
  lang?: string
  /** File name shown in the header strip. */
  title?: string
  className?: string
  /** Cap the height and scroll — used for long example sources. */
  maxHeight?: string
}

/**
 * Server component: Shiki runs while the page prerenders, so a code block ships
 * as plain HTML with no client-side highlighter.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
  maxHeight,
}: CodeBlockProps) {
  const html = await highlightCode(code, lang)

  return (
    <figure
      data-slot="docs-code-block"
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/40",
        className
      )}
    >
      {title ? (
        <figcaption className="flex h-9 items-center border-b bg-muted/60 px-3 font-mono text-[12px] text-muted-foreground">
          {title}
        </figcaption>
      ) : null}
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton
          value={code}
          className="border bg-background/90 shadow-xs backdrop-blur-sm"
        />
      </div>
      <div
        className="docs-code overflow-auto"
        style={maxHeight ? { maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
