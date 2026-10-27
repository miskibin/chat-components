"use client"

import { GenerativeView } from "@/components/ui/generative-view"
import { normalizeView } from "@/lib/generative-view"

/**
 * What an agent might compose after posting a code review — any review tool,
 * any tracker: the blocks know nothing about the service.
 */
const VIEW = normalizeView({
  type: "card",
  title: "4211 · Fix login redirect after SSO timeout",
  subtitle: "web/frontend · main · patch set 3",
  href: "https://review.example.com/c/web/+/4211",
  status: "NEW",
  children: [
    {
      type: "row",
      children: [
        {
          type: "fields",
          items: [
            { label: "Owner", value: "Jan Kowalski" },
            { label: "Code-Review", value: { type: "badge", label: "-1", tone: "danger" } },
            { label: "Verified", value: { type: "badge", label: "+1", tone: "success" } },
          ],
        },
        {
          type: "stats",
          items: [
            { label: "Comments", value: 3, hint: "2 unresolved", tone: "warning" },
            { label: "Files", value: 4 },
          ],
        },
      ],
    },
    {
      type: "table",
      columns: ["File", "Comment"],
      rows: [
        ["src/auth/redirect.ts:42", "Redirect target is not validated against the allow-list."],
        ["src/auth/session.ts:118", "Timeout read twice; take it once from config."],
        ["tests/auth.test.ts", "Cover the expired-session path."],
      ],
    },
    {
      type: "section",
      title: "History",
      collapsed: true,
      children: [
        {
          type: "timeline",
          items: [
            { title: "Patch set 3 uploaded", meta: "10:42" },
            { title: "CI passed", meta: "10:51", tone: "success" },
            { title: "Review posted: -1", meta: "11:05", tone: "danger", body: "3 comments" },
          ],
        },
      ],
    },
  ],
})

export function GenerativeViewExample() {
  return <GenerativeView view={VIEW} className="w-full max-w-2xl" />
}
