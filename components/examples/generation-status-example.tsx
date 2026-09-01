import { GenerationStatus } from "@/components/ui/generation-status"

export function GenerationStatusExample() {
  return (
    <div className="flex flex-col items-start gap-4">
      <GenerationStatus active label="Thinking" />
      <GenerationStatus stage="searching" />
      <GenerationStatus active />
      <GenerationStatus active size={20} label="Compiling registry" />
    </div>
  )
}
