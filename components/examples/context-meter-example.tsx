import { ContextMeter } from "@/components/ui/context-meter"

export function ContextMeterExample() {
  return (
    <div className="flex items-center gap-6">
      <ContextMeter used={6_300} total={32_768} />
      <ContextMeter used={26_000} total={32_768} />
      <ContextMeter used={31_500} total={32_768} />
      <ContextMeter used={38_000} total={32_768} />
    </div>
  )
}
