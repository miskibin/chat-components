"use client"

import { toast } from "sonner"

import { AskQuestion, type AskQuestionItem } from "@/components/ui/ask-question"

const QUESTIONS: AskQuestionItem[] = [
  {
    id: "next",
    prompt: "What would you like to test next?",
    options: [
      { id: "options", label: "Different options (Recommended)" },
      { id: "one", label: "One question only" },
      { id: "prompt", label: "A specific prompt" },
    ],
  },
  {
    id: "focus",
    prompt: "Which areas should we focus on?",
    allowMultiple: true,
    options: [
      { id: "layout", label: "Layout" },
      { id: "keyboard", label: "Keyboard" },
      { id: "multi", label: "Multi-select" },
    ],
  },
]

export function AskQuestionExample() {
  return (
    <div className="w-full max-w-xl">
      <AskQuestion
        title="A couple of questions"
        questions={QUESTIONS}
        onSubmit={(result) => {
          if (result.skipped) {
            toast.message("Skipped — nothing was selected")
            return
          }
          toast.success("Answers submitted")
        }}
      />
    </div>
  )
}
