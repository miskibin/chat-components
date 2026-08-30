import type { ReactNode } from "react"

import type { PropRow } from "@/components/docs/props-table"

export type DocExample = {
  /** File name inside `components/examples`, without the extension. */
  name: string
  /** The rendered example. */
  node: ReactNode
  align?: "center" | "stretch"
}

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
  props: PropsGroup[]
  /** `data-slot` values the component stamps, for external styling. */
  dataSlots?: { slot: string; description: ReactNode }[]
  customization?: DocSection[]
  /** Extra prose rendered after the customization sections. */
  notes?: DocSection[]
}
