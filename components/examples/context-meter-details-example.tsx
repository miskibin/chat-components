"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ContextMeter, formatTokens } from "@/components/ui/context-meter"

const USED = 6_300
const TOTAL = 32_768

export function ContextMeterDetailsExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ContextMeter interactive used={USED} total={TOTAL} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 text-[12px]">
        <p className="mb-2 font-medium">Context window</p>
        <dl className="grid grid-cols-[1fr_auto] gap-y-1 tabular-nums">
          <dt className="text-muted-foreground">Used</dt>
          <dd>{formatTokens(USED)}</dd>
          <dt className="text-muted-foreground">Free</dt>
          <dd>{formatTokens(TOTAL - USED)}</dd>
          <dt className="text-muted-foreground">Window</dt>
          <dd>{formatTokens(TOTAL)}</dd>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
