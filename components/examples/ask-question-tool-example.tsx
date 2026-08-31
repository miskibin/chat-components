"use client"

import { MessageToolCall } from "@/components/ui/message-parts"

const ASK_INPUT = JSON.stringify(
  {
    title: "A couple of questions",
    questions: [
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
        allow_multiple: true,
        options: [
          { id: "layout", label: "Layout" },
          { id: "keyboard", label: "Keyboard" },
          { id: "multi", label: "Multi-select" },
        ],
      },
    ],
  },
  null,
  2
)

export function AskQuestionToolExample() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <MessageToolCall
        tool={{
          id: "ask-running",
          name: "Ask Question",
          status: "running",
          input: ASK_INPUT,
        }}
      />
      <MessageToolCall
        defaultOpen
        tool={{
          id: "ask-done",
          name: "Ask Question",
          status: "done",
          input: ASK_INPUT,
          output: "Questions skipped",
        }}
      />
    </div>
  )
}
