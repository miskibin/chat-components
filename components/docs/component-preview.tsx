import type { ReactNode } from "react"

import { CodeBlock } from "@/components/docs/code-block"
import { readExampleSource } from "@/components/docs/example-source"
import { PreviewTabs } from "@/components/docs/preview-tabs"
import { cn } from "@/lib/utils"

export type ComponentPreviewProps = {
  /** File name (without extension) inside `components/examples`. */
  name: string
  /** The live example. */
  children: ReactNode
  /**
   * `center` pads and centers small controls, `stretch` hands the whole panel
   * to the example (chat surfaces, sidebars).
   */
  align?: "center" | "stretch"
  actions?: ReactNode
  /** Shorter frame for the examples under a page's hero preview. */
  compact?: boolean
  className?: string
}

/**
 * Preview / Code pair. The source is read off disk and highlighted while the
 * page prerenders, so the code tab is static HTML.
 */
export async function ComponentPreview({
  name,
  children,
  align = "center",
  actions,
  compact = false,
  className,
}: ComponentPreviewProps) {
  const source = await readExampleSource(name)

  return (
    <PreviewTabs
      className={className}
      actions={actions}
      preview={
        <div
          data-slot="docs-preview-panel"
          className={cn(
            "overflow-hidden rounded-lg border bg-background",
            align === "center" &&
              "flex items-center justify-center p-6 sm:p-10",
            align === "center" && (compact ? "min-h-[220px]" : "min-h-[320px]")
          )}
        >
          {children}
        </div>
      }
      code={
        <CodeBlock
          code={source}
          title={`components/examples/${name}.tsx`}
          maxHeight="30rem"
        />
      }
    />
  )
}
