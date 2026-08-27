"use client"

import { Bot, Copy, RefreshCw, Trash2 } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  ChatInput,
  type ChatInputPayload,
} from "@/components/ui/chat-input"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import type { GenerationStage } from "@/components/ui/generation-status"
import type { PatternHandler } from "@/components/ui/message"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatHeader } from "./header"

type MessageData = ChatMessageData & {
  metadata?: {
    model?: string
    responseTime?: number
    tokens?: number
  }
}

const DEMO_SKILLS = [
  { name: "summarize", description: "Condense long text into key points" },
  { name: "translate", description: "Translate text into another language" },
  { name: "explain", description: "Explain a concept simply" },
]

const DEMO_COMMANDS = [
  { name: "help", description: "Show available commands", argHint: "" },
  { name: "clear", description: "Clear the conversation", argHint: "" },
]

const sources: Record<
  string,
  { title: string; url: string; author: string; date: string }
> = {
  "1": {
    title: "Artificial Intelligence Basics",
    url: "https://example.com/ai-basics",
    author: "John Smith",
    date: "2023-05-10",
  },
  "2": {
    title: "Machine Learning Fundamentals",
    url: "https://example.com/ml-fundamentals",
    author: "Sarah Johnson",
    date: "2022-11-22",
  },
  "3": {
    title: "Deep Learning Applications",
    url: "https://example.com/deep-learning",
    author: "Michael Chen",
    date: "2024-01-15",
  },
}

export default function ChatExample() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("idle")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const patternHandlers: PatternHandler[] = [
    {
      pattern: /\[(\d+)\]/g,
      render: (match) => {
        const citationNumber = match[1]
        const source = sources[citationNumber]
        if (!source) return <span>{match[0]}</span>
        return (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-2 hover:underline"
            title={`${source.title} — ${source.author}`}
          >
            {match[0]}
          </a>
        )
      },
    },
  ]

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleSend = (payload: ChatInputPayload) => {
    const skillPrefix =
      payload.skills.length > 0
        ? `[skills: ${payload.skills.join(", ")}] `
        : ""
    const fileNote =
      payload.files.length > 0
        ? `\n\n_Attached: ${payload.files.map((f) => f.name).join(", ")}_`
        : ""
    const content = `${skillPrefix}${payload.text}${fileNote}`

    const userMessage: MessageData = {
      id: Date.now().toString(),
      content,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setIsGenerating(true)
    setGenerationStage("thinking")

    timeoutRef.current = setTimeout(() => {
      setGenerationStage("searching")
      timeoutRef.current = setTimeout(() => {
        setGenerationStage("responding")
        timeoutRef.current = setTimeout(() => {
          const lower = payload.text.toLowerCase()
          let responseContent = ""

          if (
            lower.includes("ai") ||
            lower.includes("artificial intelligence") ||
            lower.includes("machine learning")
          ) {
            responseContent = `<think>
Let me break down this question about AI systematically:

1. Understanding the query
2. Key areas to cover
3. Sources to reference
</think>

Artificial Intelligence (AI) is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence [1].

Machine learning, a subset of AI, uses algorithms to enable systems to learn from data [2]. Recent advancements in deep learning have improved capabilities in image recognition, natural language processing, and decision making [3].`
          } else if (lower.includes("think") || lower.includes("reasoning")) {
            responseContent = `<think>
The user is asking about thinking or reasoning. Demonstrate the thinking process.
</think>

When AI systems use extended thinking, they break complex problems into smaller steps: analyze, break down, evaluate options, then synthesize a clear answer.`
          } else {
            responseContent = `I understand your question: "${payload.text}"

Let me help you with that. Could you provide more details about what specific aspect you'd like to know more about?`
          }

          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              content: responseContent,
              sender: "assistant",
              metadata: {
                model: selectedModel,
                responseTime: 4.5,
                tokens: 256,
              },
            },
          ])
          setIsGenerating(false)
          setGenerationStage("idle")
          timeoutRef.current = null
        }, 900)
      }, 700)
    }, 700)
  }

  const handleStop = () => {
    clearTimeouts()
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: "Generation stopped by user.",
        sender: "assistant",
      },
    ])
    setIsGenerating(false)
    setGenerationStage("idle")
  }

  const handleEditMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    )
  }

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  const handleRegenerateMessage = (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id)
    if (messageIndex < 0) return
    let userMessageIndex = messageIndex - 1
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].sender !== "user"
    ) {
      userMessageIndex--
    }
    if (userMessageIndex < 0) return
    const userMessage = messages[userMessageIndex]
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
    handleSend({ text: userMessage.content, files: [], skills: [] })
    toast.success("Regenerating response")
  }

  useEffect(() => () => clearTimeouts(), [])

  return (
    <div className="flex h-svh flex-col bg-background">
      <ChatHeader />
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        generationStage={generationStage}
        patternHandlers={patternHandlers}
        onEditMessage={handleEditMessage}
        emptyState={
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <p className="text-lg font-medium text-foreground">
              Chat components demo
            </p>
            <p className="max-w-sm text-sm">
              Try asking about AI, type{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                /summarize
              </code>{" "}
              for skills, or attach a file.
            </p>
          </div>
        }
        renderActions={(message) => {
          if (message.sender !== "assistant") return null
          return (
            <div className="-mt-2 mb-4 flex gap-1 opacity-60 hover:opacity-100">
              <ActionBtn
                title="Copy"
                onClick={() => {
                  void navigator.clipboard.writeText(message.content)
                  toast.success("Copied")
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </ActionBtn>
              <ActionBtn
                title="Regenerate"
                onClick={() => handleRegenerateMessage(message.id)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </ActionBtn>
              <ActionBtn
                title="Delete"
                onClick={() => handleDeleteMessage(message.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </ActionBtn>
            </div>
          )
        }}
      />
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isGenerating={isGenerating}
        placeholder="Ask anything — try /summarize or mention AI"
        skills={DEMO_SKILLS}
        slashCommands={DEMO_COMMANDS}
        tools={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Model"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Bot className="h-4 w-4" />
                {selectedModel}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["gpt-4", "gpt-3.5", "claude-3", "gemini-pro", "llama-3"].map(
                (model) => (
                  <DropdownMenuItem
                    key={model}
                    onClick={() => setSelectedModel(model)}
                  >
                    {model}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </div>
  )
}

function ActionBtn({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}
