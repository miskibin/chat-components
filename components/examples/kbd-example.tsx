import { Command, CornerDownLeft } from "lucide-react"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

/** Single keys, a chord, and keys inline in a hint. */
export function KbdExample() {
  return (
    <div className="flex flex-col items-start gap-3 text-[13px] text-muted-foreground">
      <div className="flex items-center gap-2">
        <Kbd>Esc</Kbd>
        <Kbd>
          <CornerDownLeft />
        </Kbd>
        <KbdGroup>
          <Kbd>
            <Command />
          </Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </div>
      <p>
        Press{" "}
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>{" "}
        to stash the draft, <Kbd>↑</Kbd> to recall the last prompt.
      </p>
    </div>
  )
}
