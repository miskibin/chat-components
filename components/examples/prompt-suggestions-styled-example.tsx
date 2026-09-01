"use client"

import { Bug, FileText, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { PromptSuggestions } from "@/components/ui/prompt-suggestions"

/**
 * The list is a plain `ul`: narrow it, drop the gutters, or turn the rows into
 * chips — every override lands through `className`.
 */
export function PromptSuggestionsStyledExample() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <PromptSuggestions
        className="max-w-sm px-0 sm:px-0"
        items={[
          { id: "explain", label: "Explain this repository", icon: <FileText /> },
          { id: "bug", label: "Find the bug in my reducer", icon: <Bug /> },
        ]}
        onSelect={(item) => toast(item.label)}
      />
      <PromptSuggestions
        aria-label="Quick starts"
        className="flex max-w-none flex-row flex-wrap gap-2 px-0 sm:px-0 [&_[data-slot=prompt-suggestion]]:rounded-full [&_[data-slot=prompt-suggestion]]:border [&_[data-slot=prompt-suggestion]]:px-3 [&_[data-slot=prompt-suggestion]]:py-1.5"
        items={[
          { id: "audit", label: "Audit dead code", icon: <Sparkles /> },
          { id: "tests", label: "Write tests" },
          { id: "docs", label: "Draft a changelog" },
        ]}
        onSelect={(item) => toast(item.label)}
      />
    </div>
  )
}
