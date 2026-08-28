import type { ReactNode } from "react"

import { CopyInstallButton } from "@/components/copy-install-button"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { cn } from "@/lib/utils"

export function RegistryPreview({
  name,
  description,
  children,
  className,
  minHeight = "450px",
}: {
  name: string
  description: string
  children: ReactNode
  className?: string
  minHeight?: string
}) {
  return (
    <div
      className="relative flex flex-col gap-4 rounded-lg border p-4"
      style={{ minHeight }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm text-muted-foreground sm:pl-3">{description}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <CopyInstallButton name={name} />
          <OpenInV0Button name={name} className="w-fit" />
        </div>
      </div>
      <div className={cn("relative min-h-[400px]", className)}>{children}</div>
    </div>
  )
}
