import type { ReactNode } from "react"

import type { PropRow } from "@/components/docs/props-table"

export type DocExample = {
  /** File name inside `components/examples`, without the extension. */
  name: string
  /** The rendered example. */
  node: ReactNode
  align?: "center" | "stretch"
}

/** One example block: a heading, a line of prose, then a demo or a snippet. */
export type DocSection = {
  title: string
  description?: ReactNode
  example?: DocExample
  code?: { code: string; lang?: string; title?: string }
}

export type PropsGroup = {
  caption: string
  rows: PropRow[]
}

export type ComponentDoc = {
  title: string
  description: string
  /** Registry item name used by the install command. */
  registry: string
  /** Other registry items shadcn pulls in alongside this one. */
  registryDependencies?: string[]
  preview?: DocExample
  usage: string
  usageLang?: string
  /**
   * The body of the page. Prefer a live `example` over a `code` snippet —
   * a customization you can see beats one you have to imagine.
   */
  examples?: DocSection[]
  /** Short prose blocks — keyboard maps, gotchas — rendered as callouts. */
  notes?: { title: string; description: ReactNode }[]
  props: PropsGroup[]
  /** `data-slot` values the component stamps, for external styling. */
  dataSlots?: string[]
}
