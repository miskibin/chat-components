"use client"

import * as React from "react"

import { ChatInput } from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import {
  PromptSuggestions,
  type PromptSuggestion,
} from "@/components/ui/prompt-suggestions"
import { cn } from "@/lib/utils"

const DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
  { id: "explain", label: "Explain what this project does" },
  { id: "debug", label: "Help me track down a failing test" },
  { id: "draft", label: "Draft release notes from my last commits" },
]

export type ChatProps = React.ComponentProps<"div"> & {
  /** Headline above the composer while the conversation is empty. */
  greeting?: React.ReactNode
  /** Starter prompts listed under the centered composer. `[]` hides them. */
  suggestions?: PromptSuggestion[]
}

/**
 * Starter chat layout. Wire `onSend` to your API and append assistant
 * messages when they stream in. Sidebar, navbar, and pickers are installed
 * as siblings — compose them around this block.
 *
 * Empty conversations open centered — greeting, composer, then suggestions.
 * The first send swaps the greeting for the message list and the same
 * composer settles at the bottom; only the layout changes, so the textarea
 * keeps its focus and any half-typed draft.
 */
export function Chat({
  greeting = "How can I help?",
  suggestions = DEFAULT_SUGGESTIONS,
  className,
  ...props
}: ChatProps) {
  const [messages, setMessages] = React.useState<ChatMessageData[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const isEmpty = messages.length === 0

  const send = React.useCallback((text: string) => {
    const value = text.trim()
    if (!value) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: value, sender: "user" },
    ])
    setIsGenerating(true)
  }, [])

  const stop = React.useCallback(() => setIsGenerating(false), [])

  return (
    <div
      data-slot="chat"
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden bg-background",
        isEmpty && "justify-center",
        className
      )}
      {...props}
    >
      {isEmpty ? (
        <div
          data-slot="chat-greeting"
          className="mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6"
        >
          <h2 className="text-center text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            {greeting}
          </h2>
        </div>
      ) : (
        <MessageList messages={messages} isGenerating={isGenerating} />
      )}

      <div data-slot="chat-composer" className="w-full">
        {/* Same element in both states: only its box changes, so the swap
            eases instead of jumping and the composer is never remounted. */}
        <ChatInput
          className={cn(
            "transition-[max-width,padding] duration-300 ease-out",
            isEmpty && "max-w-3xl pb-0 sm:pb-0"
          )}
          isGenerating={isGenerating}
          onStop={stop}
          onSend={({ text }) => send(text)}
        />
        {isEmpty ? (
          <PromptSuggestions
            items={suggestions}
            onSelect={(item) => send(item.label)}
            className="max-w-3xl px-3 pt-2 sm:px-4"
          />
        ) : null}
      </div>
    </div>
  )
}
