import type { ComponentDoc } from "@/components/docs/component-doc"
import { DocsCode } from "@/components/docs/typography"

export const hookDocs = {
  "use-click-outside": {
    title: "useClickOutside",
    description:
      "Close a popover, menu, or inline editor when the pointer lands outside its root.",
    registry: "use-click-outside",
    usage: `"use client"

import { useRef, useState } from "react"
import { useClickOutside } from "@/hooks/use-click-outside"

export function Palette() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((value) => !value)}>Search</button>
      {open ? <div role="dialog">…</div> : null}
    </div>
  )
}`,
    props: [
      {
        caption: "useClickOutside(ref, handler, enabled?)",
        rows: [
          {
            name: "ref",
            type: "RefObject<T | null>",
            required: true,
            description:
              "The root to watch. Anything inside it counts as inside.",
          },
          {
            name: "handler",
            type: "() => void",
            required: true,
            description: (
              <>
                Called on a <DocsCode>mousedown</DocsCode> outside the root —
                before focus moves, so a click straight onto another control
                still works.
              </>
            ),
          },
          {
            name: "enabled",
            type: "boolean",
            default: "true",
            description:
              "Pass your open state so the listener only exists while it matters.",
          },
        ],
      },
    ],
    customization: [
      {
        title: "Keep the handler stable",
        description: (
          <>
            The effect re-subscribes whenever <DocsCode>handler</DocsCode>{" "}
            changes identity. An inline arrow is fine for a small component; in
            a hot path wrap it in <DocsCode>useCallback</DocsCode>.
          </>
        ),
        code: {
          lang: "tsx",
          code: `const close = React.useCallback(() => setOpen(false), [])
useClickOutside(ref, close, open)`,
        },
      },
      {
        title: "Pair it with Escape",
        description: (
          <>
            Pointer dismissal alone is not enough — give keyboard users the same
            exit.
          </>
        ),
        code: {
          lang: "tsx",
          code: `useClickOutside(ref, close, open)

React.useEffect(() => {
  if (!open) return
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") close()
  }
  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [open, close])`,
        },
      },
    ],
    notes: [
      {
        title: "Not needed for the pickers",
        description: (
          <>
            <DocsCode>ModePicker</DocsCode> and{" "}
            <DocsCode>ModelPicker</DocsCode> are built on the Radix dropdown
            menu, which handles outside dismissal itself. This hook is for
            surfaces you build by hand.
          </>
        ),
      },
    ],
  },
} satisfies Record<string, ComponentDoc>
