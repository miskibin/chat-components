"use client"

import { Bug, FileText, GitPullRequest, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { PromptSuggestions } from "@/components/ui/prompt-suggestions"

const SUGGESTIONS = [
  { id: "explain", label: "Explain this repository", icon: <FileText /> },
  { id: "bug", label: "Find the bug in my reducer", icon: <Bug /> },
  { id: "review", label: "Review my open pull request", icon: <GitPullRequest /> },
  { id: "ideas", label: "Suggest three refactors", icon: <Sparkles /> },
]

export function PromptSuggestionsExample() {
  return (
    <div className="w-full max-w-lg">
      <PromptSuggestions
        items={SUGGESTIONS}
        onSelect={(item) => toast(item.label)}
      />
    </div>
  )
}
