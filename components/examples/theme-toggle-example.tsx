import { ThemeToggle } from "@/components/ui/theme-toggle"

/**
 * `floating` is on by default (a fixed chip in the page corner). Inline it with
 * `floating={false}` whenever it lives inside a navbar or toolbar.
 */
export function ThemeToggleExample() {
  return (
    <div className="flex items-center gap-4">
      <ThemeToggle floating={false} />
      <ThemeToggle floating={false} className="size-9 rounded-md" />
      <ThemeToggle
        floating={false}
        className="size-9 border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      />
    </div>
  )
}
