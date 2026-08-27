"use client"

import { Copy, Moon, Pencil, RefreshCw, Search, Sun, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  ChatInput,
  type ChatInputPayload,
} from "@/components/ui/chat-input"
import {
  ChatNavbar,
} from "@/components/ui/chat-navbar"
import {
  ChatSidebar,
  ChatSidebarItemRow,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarEmptyState,
} from "@/components/ui/chat-sidebar"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import type { GenerationStage } from "@/components/ui/generation-status"
import type { PatternHandler } from "@/components/ui/message"
import {
  ModelPicker,
  type ModelOption,
} from "@/components/ui/model-picker"

type MessageData = ChatMessageData & {
  metadata?: {
    model?: string
    responseTime?: number
    tokens?: number
  }
}

type ChatSession = {
  id: string
  title: string
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

const DEMO_MODELS: ModelOption[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    badge: "OpenAI",
    description: "Strong general reasoning",
    meta: "128k",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    badge: "Fast",
    description: "Quick replies",
    meta: "128k",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    badge: "Anthropic",
    description: "Long-context writing",
    meta: "200k",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    badge: "Google",
    description: "Multimodal",
    meta: "1M",
    disabled: true,
    disabledReason: "Coming soon",
  },
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
  const [collapsed, setCollapsed] = useState(false)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "Welcome chat" },
  ])
  const [activeId, setActiveId] = useState("1")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("idle")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTitle =
    sessions.find((s) => s.id === activeId)?.title ?? "Chat"

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

  const handleNewChat = () => {
    const id = String(Date.now())
    setSessions((prev) => [{ id, title: "New chat" }, ...prev])
    setActiveId(id)
    setMessages([])
    clearTimeouts()
    setIsGenerating(false)
    setGenerationStage("idle")
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

    if (messages.length === 0 && payload.text.trim()) {
      const title =
        payload.text.trim().slice(0, 42) +
        (payload.text.trim().length > 42 ? "…" : "")
      setSessions((prev) =>
        prev.map((s) => (s.id === activeId ? { ...s, title } : s))
      )
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content, sender: "user" },
    ])
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
Let me break down this question about AI systematically.
</think>

Artificial Intelligence (AI) is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence [1].

Machine learning, a subset of AI, uses algorithms to enable systems to learn from data [2]. Recent advancements in deep learning have improved capabilities across perception and language [3].`
          } else if (lower.includes("think") || lower.includes("reasoning")) {
            responseContent = `<think>
Demonstrate extended reasoning briefly.
</think>

When models use extended thinking, they break complex problems into smaller steps: analyze, break down, evaluate options, then synthesize a clear answer.`
          } else {
            responseContent = `I understand your question: "${payload.text}"

Could you share a bit more detail about what you'd like to explore?`
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

  useEffect(() => () => clearTimeouts(), [])

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        brand={
          <span
            className="truncate px-1 text-[15px] font-semibold tracking-tight"
            style={{ color: "var(--ink)", fontFamily: "var(--lc-body-font)" }}
          >
            Chat
          </span>
        }
        nav={
          <>
            <SideRow icon={<Pencil className="h-4 w-4" />} onClick={handleNewChat}>
              New chat
            </SideRow>
            <SideRow
              icon={<Search className="h-4 w-4" />}
              hint="⌘K"
              onClick={() => toast.message("Wire search to your app")}
            >
              Search
            </SideRow>
          </>
        }
        rail={
          <>
            <SideIconBtn label="New chat" onClick={handleNewChat}>
              <Pencil className="h-4 w-4" />
            </SideIconBtn>
            <SideIconBtn
              label="Search"
              onClick={() => toast.message("Wire search to your app")}
            >
              <Search className="h-4 w-4" />
            </SideIconBtn>
          </>
        }
      >
        <SidebarCollapsibleSection
          title="Recent chats"
          open={chatsOpen}
          onToggle={() => setChatsOpen((v) => !v)}
          count={sessions.length}
        >
          {sessions.length === 0 ? (
            <SidebarEmptyState>New chats appear here.</SidebarEmptyState>
          ) : (
            sessions.map((s) => (
              <ChatSidebarItemRow
                key={s.id}
                title={s.title}
                active={s.id === activeId}
                onClick={() => {
                  setActiveId(s.id)
                  setMessages([])
                  clearTimeouts()
                  setIsGenerating(false)
                  setGenerationStage("idle")
                }}
              />
            ))
          )}
        </SidebarCollapsibleSection>
      </ChatSidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatNavbar
          title={activeTitle}
          right={
            <>
              <ModelPicker
                value={selectedModel}
                onChange={setSelectedModel}
                options={DEMO_MODELS}
                align="down"
              />
              <ThemeToggleBtn />
            </>
          }
        />

        <MessageList
          messages={messages}
          isGenerating={isGenerating}
          generationStage={generationStage}
          patternHandlers={patternHandlers}
          onEditMessage={(id, content) =>
            setMessages((prev) =>
              prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
            )
          }
          emptyState={
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-lg font-medium text-foreground">
                Start a conversation
              </p>
              <p className="max-w-sm text-sm">
                Try asking about AI, type{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  /summarize
                </code>
                , or attach a file.
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
                  onClick={() => {
                    const idx = messages.findIndex((m) => m.id === message.id)
                    let userIdx = idx - 1
                    while (
                      userIdx >= 0 &&
                      messages[userIdx].sender !== "user"
                    ) {
                      userIdx--
                    }
                    if (userIdx < 0) return
                    setMessages((prev) =>
                      prev.filter((m) => m.id !== message.id)
                    )
                    handleSend({
                      text: messages[userIdx].content,
                      files: [],
                      skills: [],
                    })
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </ActionBtn>
                <ActionBtn
                  title="Delete"
                  onClick={() =>
                    setMessages((prev) =>
                      prev.filter((m) => m.id !== message.id)
                    )
                  }
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
            <ModelPicker
              value={selectedModel}
              onChange={setSelectedModel}
              options={DEMO_MODELS}
              align="up"
            />
          }
        />
      </div>
    </div>
  )
}

function ThemeToggleBtn() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid h-8 w-8 place-items-center rounded-md"
      style={{
        background: "transparent",
        border: 0,
        color: "var(--ink-2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hover)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
      }}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : null}
    </button>
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
