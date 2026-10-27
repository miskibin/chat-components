"use client"

import { PlanCard, type PlanData } from "@/components/ui/plan-card"

const STEPS = [
  "Read the current reader loop in `lib/stream.ts`",
  "Extract the socket handling into `openStream`",
  "Wrap `openStream` in `withRetry` — one attempt, 400ms apart",
  "Emit an `error` event when the second attempt fails",
  "Thread the abort signal through both attempts",
  "Drop the stale `retrying` flag from the store",
  "Show the failure as a toast instead of a hung spinner",
  "Log the attempt count on the `done` event",
  "Cover the happy path in `tests/stream-retry.test.ts`",
  "Cover the double failure in the same file",
  "Cover an abort during the backoff",
  "Update the README's troubleshooting section",
]

const PLAN: PlanData = {
  title: "Streaming retry, end to end",
  overview: "Twelve steps — long enough that the card folds to its first screen.",
  body: `## Steps\n\n${STEPS.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\n## Out of scope\n\nReconnecting a stream that already produced tokens: the transcript would need to be rewound, which is a separate change.`,
}

/**
 * A plan past ~20 lines or 900 characters folds behind "Expand plan", so a
 * long proposal does not push the turn after it a page out of sight.
 */
export function PlanCardLongExample() {
  return (
    <div className="w-full max-w-xl">
      <PlanCard plan={PLAN} onBuild={() => {}} />
    </div>
  )
}
