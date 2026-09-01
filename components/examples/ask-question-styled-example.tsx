"use client"

import { toast } from "sonner"

import { AskQuestion, type AskQuestionItem } from "@/components/ui/ask-question"

const QUESTIONS: AskQuestionItem[] = [
  {
    id: "target",
    prompt: "Where should the fix land?",
    options: [
      { id: "registry", label: "This registry" },
      { id: "consumer", label: "The consuming app" },
    ],
  },
]

/**
 * Selected options carry `data-state="checked"`, and every part of the card has
 * its own slot — so the questionnaire can wear your accent without a fork.
 */
export function AskQuestionStyledExample() {
  return (
    <div className="w-full max-w-xl [&_[data-slot=ask-question-option][data-state=checked]]:border-primary [&_[data-slot=ask-question-option][data-state=checked]]:bg-primary/10 [&_[data-slot=ask-question-submit]]:rounded-full [&_[data-slot=ask-question]]:border-primary/30">
      <AskQuestion
        title="One quick decision"
        submitLabel="Use this"
        skipLabel="Decide later"
        questions={QUESTIONS}
        hideOther
        onSubmit={() => toast.success("Answer recorded")}
      />
    </div>
  )
}
