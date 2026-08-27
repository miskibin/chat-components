"use client"

import { Copy, Pencil, RefreshCw, Search, Trash2 } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  ChatInput,
  type ChatInputPayload,
} from "@/components/ui/chat-input"
import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarEmptyState,
  useSidebarDnd,
  type ChatSidebarItemData,
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
import { ThemeToggle } from "@/components/ui/theme-toggle"

type MessageData = ChatMessageData & {
  metadata?: {
    model?: string
    responseTime?: number
    tokens?: number
  }
}

type ChatSession = ChatSidebarItemData & {
  messages?: MessageData[]
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

function buildDemoAssistantReply(
  userText: string,
  modelId: string
): Omit<MessageData, "id"> {
  const lower = userText.toLowerCase()
  const topic =
    lower.includes("ai") ||
    lower.includes("artificial intelligence") ||
    lower.includes("machine learning")
      ? "ai"
      : lower.includes("think") || lower.includes("reasoning")
        ? "think"
        : "default"

  const reasoningByTopic: Record<string, string> = {
    ai: "User asked about AI. Pull a short definition, cite sources, then show a tiny code sample and a summary artifact.",
    think: "User wants to see extended thinking. Keep the chain short, then illustrate with a tool call and a code snippet.",
    default: `Parse the question (“${userText.slice(0, 80)}”), gather context via a tool, then answer with a code example and optional artifact.`,
  }

  const contentByTopic: Record<string, string> = {
    ai: `Artificial Intelligence (AI) is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence [1].

Machine learning, a subset of AI, uses algorithms to enable systems to learn from data [2]. Recent advancements in deep learning have improved capabilities across perception and language [3].`,
    think: `When models use extended thinking, they break complex problems into smaller steps: analyze, break down, evaluate options, then synthesize a clear answer.`,
    default: `I understand your question: “${userText}”

Here is a concise take, plus the tooling trail and a small code sample below.`,
  }

  const codeByTopic: Record<string, { language: string; title: string; code: string }> = {
    ai: {
      language: "python",
      title: "train_step.py",
      code: `def train_step(model, batch, optimizer):
    optimizer.zero_grad()
    loss = model(batch).loss
    loss.backward()
    optimizer.step()
    return float(loss)`,
    },
    think: {
      language: "typescript",
      title: "reason.ts",
      code: `async function reason(prompt: string) {
  const plan = await planSteps(prompt)
  const results = []
  for (const step of plan) {
    results.push(await runStep(step))
  }
  return synthesize(results)
}`,
    },
    default: {
      language: "tsx",
      title: "Reply.tsx",
      code: `export function Reply({ text }: { text: string }) {
  return <p className="text-sm leading-relaxed">{text}</p>
}`,
    },
  }

  const code = codeByTopic[topic]

  return {
    content: contentByTopic[topic],
    sender: "assistant",
    reasoning: reasoningByTopic[topic],
    tools: [
      {
        id: "tool-search",
        name: "web_search",
        status: "done",
        input: JSON.stringify({ query: userText.slice(0, 60) }, null, 2),
        output: JSON.stringify(
          {
            hits: 3,
            top: topic === "ai" ? "AI basics overview" : "Relevant docs",
          },
          null,
          2
        ),
      },
      {
        id: "tool-read",
        name: "read_file",
        status: "done",
        input: JSON.stringify({ path: code.title }, null, 2),
        output: "OK · 24 lines",
      },
    ],
    codeBlocks: [code],
    artifacts: [
      {
        id: "artifact-1",
        title:
          topic === "ai"
            ? "AI overview notes"
            : topic === "think"
              ? "Reasoning trace"
              : "Reply summary",
        kind: topic === "ai" ? "table" : topic === "think" ? "text" : "file",
        summary: "Generated for this turn",
        content:
          topic === "ai"
            ? "term,definition\nAI,Systems that perform human-like tasks\nML,Learning from data without explicit rules\n"
            : topic === "think"
              ? "1. Analyze\n2. Break down\n3. Evaluate\n4. Synthesize\n"
              : `# Summary\n\nQuestion: ${userText.slice(0, 120)}\nModel: ${modelId}\n`,
        onOpen: () => toast.message("Open artifact in your app"),
      },
    ],
    metadata: {
      model: modelId,
      responseTime: 4.5,
      tokens: 256,
    },
  }
}

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
    { id: "1", title: "Welcome chat", pinned: true },
    { id: "2", title: "Ask about AI", status: "idle" },
    { id: "3", title: "Draft notes", status: "idle" },
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
    setSessions((prev) => [{ id, title: "New chat", pinned: false }, ...prev])
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
          const reply = buildDemoAssistantReply(payload.text, selectedModel)
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              ...reply,
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
        ...buildDemoAssistantReply("Generation stopped by user.", selectedModel),
        content: "Generation stopped by user.",
        reasoning:
          "User hit stop. Surface a short acknowledgement with the usual demo parts so the UI still shows the full message shape.",
      },
    ])
    setIsGenerating(false)
    setGenerationStage("idle")
  }

  useEffect(() => () => clearTimeouts(), [])

  const orderedSessions = [
    ...sessions.filter((s) => s.pinned),
    ...sessions.filter((s) => !s.pinned),
  ]

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <ChatSidebarDnd
        onDrop={(drop) => {
          if (drop.action === "pin") {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === drop.id ? { ...s, pinned: true } : s
              )
            )
          } else if (drop.action === "delete") {
            setSessions((prev) => {
              const next = prev.filter((s) => s.id !== drop.id)
              if (activeId === drop.id) {
                setActiveId(next[0]?.id ?? "")
                setMessages([])
              }
              return next
            })
            toast.message("Chat deleted")
          }
        }}
        renderOverlay={(id) => {
          const item = sessions.find((s) => s.id === id)
          if (!item) return null
          return (
            <ChatSidebarItemGhost
              item={item}
              active={item.id === activeId}
            />
          )
        }}
      >
        <ChatSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          edgeZones
          brand={
            <span
              className="truncate px-1 text-[15px] font-semibold tracking-tight"
              style={{
                color: "var(--ink)",
                fontFamily: "var(--lc-body-font)",
              }}
            >
              Chat
            </span>
          }
          nav={
            <>
              <SideRow
                icon={<Pencil className="h-4 w-4" />}
                onClick={handleNewChat}
              >
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
          <SidebarSessionSection
            open={chatsOpen}
            onToggle={() => setChatsOpen((v) => !v)}
            sessions={orderedSessions}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id)
              setMessages([])
              clearTimeouts()
              setIsGenerating(false)
              setGenerationStage("idle")
            }}
            onRename={(id, title) =>
              setSessions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, title } : s))
              )
            }
            onTogglePin={(id, pinned) =>
              setSessions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, pinned } : s))
              )
            }
            onDelete={(id) =>
              setSessions((prev) => {
                const next = prev.filter((s) => s.id !== id)
                if (activeId === id) {
                  setActiveId(next[0]?.id ?? "")
                  setMessages([])
                }
                return next
              })
            }
          />
        </ChatSidebar>
      </ChatSidebarDnd>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <ThemeToggle />

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
              <p
                className="text-lg font-medium text-foreground"
                style={{ fontFamily: "var(--lc-body-font)" }}
              >
                {activeTitle === "Welcome chat" || !activeTitle
                  ? "Start a conversation"
                  : activeTitle}
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

function SidebarSessionSection({
  open,
  onToggle,
  sessions,
  activeId,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
}: {
  open: boolean
  onToggle: () => void
  sessions: ChatSidebarItemData[]
  activeId: string
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onTogglePin: (id: string, pinned: boolean) => void
  onDelete: (id: string) => void
}) {
  const { activeDragId } = useSidebarDnd()
  return (
    <SidebarCollapsibleSection
      title="Recent chats"
      open={open}
      onToggle={onToggle}
      count={sessions.length}
    >
      {sessions.length === 0 ? (
        <SidebarEmptyState>New chats appear here.</SidebarEmptyState>
      ) : (
        <ChatSidebarItemList
          items={sessions}
          activeId={activeId}
          activeDragId={activeDragId}
          onSelect={onSelect}
          onRename={onRename}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      )}
    </SidebarCollapsibleSection>
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
