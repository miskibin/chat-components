import { GenerationStatus } from "@/components/ui/generation-status"

/**
 * `size` scales the box and the dot together; the wrapper and the dot each
 * carry a slot, so color and animation are both overridable from outside.
 */
export function GenerationStatusStyledExample() {
  return (
    <div className="flex flex-col items-start gap-4">
      <GenerationStatus
        active
        size={20}
        label="Compiling registry"
        className="text-primary [&_[data-slot=generation-status-spinner]]:text-primary"
      />
      <GenerationStatus
        active
        label="Held still"
        className="[&_*]:animate-none"
      />
      <GenerationStatus
        active
        label="Searching"
        className="rounded-full border bg-muted/50 px-2.5 py-1 [&_[data-slot=generation-status-label]]:text-[12px]"
      />
    </div>
  )
}
