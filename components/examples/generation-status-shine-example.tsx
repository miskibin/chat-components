import {
  ShineStyles,
  shineClassName,
} from "@/components/ui/generation-status"

/**
 * The shine is not tied to the status: any live label can carry it. Mount
 * `ShineStyles` once beside it — React hoists the one stylesheet — and tint
 * the sweep with two variables.
 */
export function GenerationStatusShineExample() {
  return (
    <div className="flex flex-col items-start gap-3 text-[13px]">
      <ShineStyles />
      <span className={shineClassName}>Running npm test…</span>
      <span
        className={shineClassName}
        style={
          {
            "--lc-shine-base": "var(--primary)",
            "--lc-shine-peak": "var(--foreground)",
          } as React.CSSProperties
        }
      >
        Indexing 1,204 files
      </span>
    </div>
  )
}
