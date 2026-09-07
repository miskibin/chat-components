"use client"

import { toast } from "sonner"

import { ChatInput, type ChatSkill } from "@/components/ui/chat-input"

/**
 * What a host would have read off the machine — a project's own skills beside
 * the ones the user keeps in their home directory.
 */
const SKILLS: ChatSkill[] = [
  {
    name: "changelog",
    description: "Write release notes from the commits since the last tag",
    scope: "project",
  },
  {
    name: "code-review",
    description: "Review the working tree for bugs and dead code",
    scope: "project",
  },
  {
    name: "migrate-database",
    description: "Draft and run a schema migration",
    scope: "project",
  },
  {
    name: "commit",
    description: "Stage the change and write the message",
    scope: "user",
  },
  {
    name: "security-review",
    description: "Look for injection, secrets and unsafe defaults",
    scope: "user",
  },
  {
    // Reserved for the agent: it never appears under `$` or `/`.
    name: "internal-index",
    description: "Rebuild the embedding index",
    scope: "user",
    userInvocable: false,
  },
]

/**
 * `$` names a skill anywhere in the sentence; `/` still opens the same list
 * above the commands. The provider's own commands carry
 * `mustStartMessage`, so they leave the menu as soon as the `/` is not the
 * first character — which is exactly when the CLI would treat them as prose.
 */
export function ChatInputSkillsExample() {
  return (
    <div className="w-full max-w-2xl">
      <ChatInput
        placeholder="Type $ for a skill, / for a command — $20 stays money"
        skills={SKILLS}
        slashCommands={[
          { name: "clear", description: "Clear this conversation" },
          {
            name: "compact",
            description: "Summarize the conversation so far",
            mustStartMessage: true,
          },
          {
            name: "cost",
            description: "Show what this session has cost",
            mustStartMessage: true,
          },
        ]}
        onSend={({ text, skills }) => {
          toast("Sent", {
            description: skills.length
              ? `${text} · skills: ${skills.join(", ")}`
              : text,
          })
        }}
      />
    </div>
  )
}
