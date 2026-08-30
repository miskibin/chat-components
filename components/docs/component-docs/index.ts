import type { ComponentDoc } from "@/components/docs/component-doc"
import { chatDocs } from "@/components/docs/component-docs/chat"
import { controlDocs } from "@/components/docs/component-docs/controls"
import { hookDocs } from "@/components/docs/component-docs/hooks"
import { messageDocs } from "@/components/docs/component-docs/messages"
import { sidebarDocs } from "@/components/docs/component-docs/sidebar"
import type { ComponentSlug } from "@/components/docs/nav"

/**
 * Typed as `Record<ComponentSlug, …>`, so a slug added to the nav without a
 * page — or a page without a nav entry — fails type checking rather than
 * shipping a dead link.
 */
export const componentDocs: Record<ComponentSlug, ComponentDoc> = {
  ...chatDocs,
  ...messageDocs,
  ...controlDocs,
  ...sidebarDocs,
  ...hookDocs,
}
