"use client"

import { Copy, PanelLeft, Pencil, RefreshCw, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  ChatInput,
  type ChatInputPayload,
} from "@/components/ui/chat-input"
import { ChatNavbar } from "@/components/ui/chat-navbar"
import {
  ChatSidebar,
  ChatSidebarDnd,
  ChatSidebarItemGhost,
  ChatSidebarItemList,
  SideIconBtn,
  SideRow,
  SidebarCollapsibleSection,
  SidebarEmptyState,
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import type { GenerationStage } from "@/components/ui/generation-status"
import type { MessagePart, MessageToolCallData } from "@/components/ui/message"
import {
  ModelPicker,
  type ModelOption,
} from "@/components/ui/model-picker"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { AgentStreamEvent } from "@/lib/cursor-agent-types"
import { streamCursorChat } from "@/lib/cursor-stream"
import { cn } from "@/lib/utils"

const DESKTOP_QUERY = "(min-width: 768px)"

/** Wall clock read, hoisted out of the component so render stays pure. */
function nowMs() {
  return Date.now()
}

/** Desktop-first so SSR and the first paint agree on the wide layout. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setIsDesktop(mql.matches)
    sync()
    mql.addEventListener("change", sync)
    return () => mql.removeEventListener("change", sync)
  }, [])

  return isDesktop
}

type MessageData = ChatMessageData & {
  metadata?: {
    model?: string
    responseTime?: number
    tokens?: number
  }
}

type ChatSession = ChatSidebarItemData & {
  messages?: MessageData[]
  cursorSessionId?: string
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

const FALLBACK_MODELS: ModelOption[] = [
  {
    id: "composer-2.5",
    name: "Composer 2.5",
    badge: "Cursor",
    description: "Default Cursor agent",
  },
  {
    id: "auto",
    name: "Auto",
    badge: "Router",
    description: "Lets Cursor pick a model",
  },
]

export default function ChatExample() {
  const isDesktop = useIsDesktop()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "Welcome chat", pinned: true },
  ])
  const [activeId, setActiveId] = useState("1")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("idle")
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(FALLBACK_MODELS)
  const [selectedModel, setSelectedModel] = useState("composer-2.5")
  const abortRef = useRef<AbortController | null>(null)
  const activeIdRef = useRef(activeId)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  const activeSession = sessions.find((s) => s.id === activeId)
  const activeTitle = activeSession?.title ?? "Chat"
  // The drawer only exists below md; derive it so a resize can't strand it open.
  const drawerOpen = mobileNavOpen && !isDesktop

  useEffect(() => {
    let cancelled = false
    fetch("/api/models")
      .then((res) => res.json())
      .then((data: { models?: ModelOption[]; error?: string }) => {
        if (cancelled || !data.models?.length) return
        setModelOptions(data.models)
        setSelectedModel((current) =>
          data.models!.some((m) => m.id === current)
            ? current
            : data.models![0].id
        )
      })
      .catch(() => {
        toast.error("Could not load Cursor models. Is `agent` logged in?")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stopGeneration = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsGenerating(false)
    setGenerationStage("idle")
  }

  const persistSession = (
    sessionId: string,
    patch: (session: ChatSession) => ChatSession
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? patch(session) : session
      )
    )
  }

  const handleNewChat = () => {
    stopGeneration()
    setMobileNavOpen(false)
    const id = String(nowMs())
    setSessions((prev) => [
      { id, title: "New chat", pinned: false, messages: [] },
      ...prev,
    ])
    setActiveId(id)
    setMessages([])
  }

  const selectSession = (id: string) => {
    stopGeneration()
    setMobileNavOpen(false)
    const session = sessions.find((s) => s.id === id)
    setActiveId(id)
    setMessages(session?.messages ?? [])
  }

  const runPrompt = async (
    prompt: string,
    sessionId: string,
    priorMessages: MessageData[],
    cursorSessionId?: string
  ) => {
    const assistantId = crypto.randomUUID()
    const started = nowMs()
    const model = selectedModel
    const controller = new AbortController()
    abortRef.current = controller

    const seedAssistant: MessageData = {
      id: assistantId,
      content: "",
      sender: "assistant",
      tools: [],
      parts: [],
    }

    const applyMessages = (next: MessageData[], nextSessionId?: string) => {
      persistSession(sessionId, (session) => ({
        ...session,
        messages: next,
        cursorSessionId: nextSessionId ?? session.cursorSessionId,
      }))
      if (activeIdRef.current === sessionId) setMessages(next)
    }

    applyMessages([...priorMessages, seedAssistant])

    setIsGenerating(true)
    setGenerationStage("thinking")

    const patchAssistant = (
      updater: (message: MessageData) => MessageData,
      cursorSessionId?: string
    ) => {
      persistSession(sessionId, (session) => {
        const current = session.messages ?? []
        const next = current.map((message) =>
          message.id === assistantId ? updater(message) : message
        )
        if (activeIdRef.current === sessionId) setMessages(next)
        return {
          ...session,
          messages: next,
          cursorSessionId: cursorSessionId ?? session.cursorSessionId,
        }
      })
    }

    const onEvent = (event: AgentStreamEvent) => {
      if (event.type === "session") {
        persistSession(sessionId, (session) => ({
          ...session,
          cursorSessionId: event.sessionId,
        }))
        return
      }
      if (event.type === "thinking") {
        setGenerationStage("thinking")
        patchAssistant((message) => ({
          ...message,
          reasoning: `${message.reasoning ?? ""}${event.text}`,
          reasoningDefaultOpen: true,
        }))
        return
      }
      if (event.type === "text") {
        setGenerationStage("responding")
        patchAssistant((message) => {
          const parts = appendTextPart(message.parts ?? [], event.text)
          return {
            ...message,
            parts,
            content: textFromParts(parts),
            tools: toolsFromParts(parts),
          }
        })
        return
      }
      if (event.type === "tool") {
        setGenerationStage("searching")
        patchAssistant((message) => {
          const nextTool: MessageToolCallData = {
            id: event.id,
            name: event.name,
            status: event.status,
            input: event.input,
            output: event.output,
          }
          const parts = upsertToolPart(message.parts ?? [], nextTool)
          return {
            ...message,
            parts,
            content: textFromParts(parts),
            tools: toolsFromParts(parts),
          }
        })
        return
      }
      if (event.type === "error") {
        patchAssistant((message) => ({
          ...message,
          content:
            message.content.trim() ||
            `Cursor agent error: ${event.message}`,
        }))
        toast.error(event.message)
        return
      }
      if (event.type === "done") {
        patchAssistant(
          (message) => ({
            ...message,
            metadata: {
              model,
              responseTime: (nowMs() - started) / 1000,
            },
          }),
          event.sessionId
        )
      }
    }

    try {
      await streamCursorChat(
        {
          prompt,
          model,
          sessionId: cursorSessionId,
        },
        { onEvent, signal: controller.signal }
      )
    } catch (err) {
      if (!controller.signal.aborted) {
        const message =
          err instanceof Error ? err.message : "Cursor agent failed"
        toast.error(message)
        patchAssistant((item) => ({
          ...item,
          content: item.content.trim() || `Cursor agent error: ${message}`,
        }))
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setIsGenerating(false)
      setGenerationStage("idle")
    }
  }

  const handleSend = (payload: ChatInputPayload) => {
    if (payload.text.trim() === "/clear") {
      persistSession(activeId, (session) => ({
        ...session,
        messages: [],
        cursorSessionId: undefined,
      }))
      setMessages([])
      return
    }

    const skillPrefix =
      payload.skills.length > 0
        ? `[skills: ${payload.skills.join(", ")}] `
        : ""
    const fileNote =
      payload.files.length > 0
        ? `\n\nAttached: ${payload.files.map((f) => f.name).join(", ")}`
        : ""
    const content = `${skillPrefix}${payload.text}${fileNote}`
    const sessionId = activeId

    if (messages.length === 0 && payload.text.trim()) {
      const title =
        payload.text.trim().slice(0, 42) +
        (payload.text.trim().length > 42 ? "…" : "")
      persistSession(sessionId, (session) => ({ ...session, title }))
    }

    const userMessage: MessageData = {
      id: crypto.randomUUID(),
      content,
      sender: "user",
    }
    const next = [...messages, userMessage]
    persistSession(sessionId, (session) => ({ ...session, messages: next }))
    setMessages(next)
    void runPrompt(content, sessionId, next, activeSession?.cursorSessionId)
  }

  const handleStop = () => {
    stopGeneration()
  }

  useEffect(() => () => abortRef.current?.abort(), [])

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen])

  const orderedSessions = [
    ...sessions.filter((s) => s.pinned),
    ...sessions.filter((s) => !s.pinned),
  ]

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden bg-background">
      {/* Mobile: the sidebar slides over the conversation instead of squeezing it. */}
      <div
        aria-hidden={!drawerOpen}
        onClick={() => setMobileNavOpen(false)}
        className={cn(
          "absolute inset-0 z-40 bg-foreground/20 backdrop-blur-[1px] transition-opacity duration-200 md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        className={cn(
          "z-50 h-full shrink-0 max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-xl max-md:transition-transform max-md:duration-200 md:relative",
          !drawerOpen && "max-md:-translate-x-full"
        )}
      >
      <ChatSidebarDnd
        onDrop={(drop) => {
          if (drop.action === "pin") {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === drop.itemId ? { ...s, pinned: true } : s
              )
            )
          } else if (drop.action === "delete") {
            stopGeneration()
            setSessions((prev) => {
              const next = prev.filter((s) => s.id !== drop.itemId)
              if (activeId === drop.itemId) {
                setActiveId(next[0]?.id ?? "")
                setMessages(next[0]?.messages ?? [])
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
          collapsed={isDesktop ? collapsed : false}
          onCollapsedChange={(next) =>
            isDesktop ? setCollapsed(next) : setMobileNavOpen(false)
          }
          edgeZones
          brand={
            <span className="truncate px-1 text-[15px] font-semibold tracking-tight text-foreground">
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
            onSelect={selectSession}
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
            onDelete={(id) => {
              if (id === activeId) stopGeneration()
              setSessions((prev) => {
                const next = prev.filter((s) => s.id !== id)
                if (activeId === id) {
                  setActiveId(next[0]?.id ?? "")
                  setMessages(next[0]?.messages ?? [])
                }
                return next
              })
            }}
          />
        </ChatSidebar>
      </ChatSidebarDnd>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatNavbar
          title={activeTitle}
          left={
            <button
              type="button"
              aria-label="Open chats"
              onClick={() => setMobileNavOpen(true)}
              className="-ml-1 inline-grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden [&_svg]:size-4"
            >
              <PanelLeft />
            </button>
          }
          right={
            <>
              <Link
                href="/"
                className="rounded-md px-2 py-1 text-[13px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Docs
              </Link>
              <ThemeToggle floating={false} />
            </>
          }
        />

        <MessageList
          messages={messages}
          isGenerating={isGenerating}
          generationStage={generationStage}
          onEditMessage={(id, content) =>
            setMessages((prev) => {
              const next = prev.map((msg) =>
                msg.id === id ? { ...msg, content } : msg
              )
              persistSession(activeId, (session) => ({
                ...session,
                messages: next,
              }))
              return next
            })
          }
          emptyState={
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 text-center text-muted-foreground">
              <p className="text-balance text-lg font-medium text-foreground">
                {activeTitle === "Welcome chat" || !activeTitle
                  ? "Talk to Cursor Agent"
                  : activeTitle}
              </p>
              <p className="max-w-sm text-balance text-[13.5px]">
                Real LLM + tool calls via the local{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
                  agent
                </code>{" "}
                CLI. Try “what files are in this repo?”
              </p>
            </div>
          }
          renderActions={(message) => {
            if (message.sender !== "assistant") return null
            return (
              <div className="-mt-2 mb-4 flex gap-1 opacity-60 transition-opacity focus-within:opacity-100 hover:opacity-100">
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
                    const prompt = messages[userIdx].content
                    const next = messages.filter((m) => m.id !== message.id)
                    persistSession(activeId, (session) => ({
                      ...session,
                      messages: next,
                    }))
                    setMessages(next)
                    void runPrompt(
                      prompt,
                      activeId,
                      next,
                      activeSession?.cursorSessionId
                    )
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </ActionBtn>
                <ActionBtn
                  title="Delete"
                  onClick={() => {
                    const next = messages.filter((m) => m.id !== message.id)
                    persistSession(activeId, (session) => ({
                      ...session,
                      messages: next,
                    }))
                    setMessages(next)
                  }}
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
          placeholder="Ask Cursor Agent — try listing files in this repo"
          skills={DEMO_SKILLS}
          slashCommands={DEMO_COMMANDS}
          tools={
            <ModelPicker
              value={selectedModel}
              onChange={setSelectedModel}
              options={modelOptions}
              side="top"
              className="min-w-0"
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
  return (
    <SidebarCollapsibleSection
      title="Recent chats"
      open={open}
      onToggle={onToggle}
      count={sessions.length}
    >
      <ChatSidebarItemList
        items={sessions}
        activeId={activeId}
        listId="recent"
        draggable
        emptyState={
          <SidebarEmptyState>New chats appear here.</SidebarEmptyState>
        }
        onSelect={onSelect}
        onRename={onRename}
        onTogglePin={onTogglePin}
        onDelete={onDelete}
      />
    </SidebarCollapsibleSection>
  )
}

function textFromParts(parts: MessagePart[]) {
  return parts
    .filter(
      (part): part is Extract<MessagePart, { type: "text" }> =>
        part.type === "text"
    )
    .map((part) => part.text)
    .join("")
}

function toolsFromParts(parts: MessagePart[]) {
  return parts
    .filter(
      (part): part is Extract<MessagePart, { type: "tool" }> =>
        part.type === "tool"
    )
    .map((part) => part.tool)
}

function appendTextPart(parts: MessagePart[], text: string): MessagePart[] {
  const last = parts.at(-1)
  if (last?.type === "text") {
    return [...parts.slice(0, -1), { ...last, text: last.text + text }]
  }
  return [...parts, { type: "text", id: crypto.randomUUID(), text }]
}

function upsertToolPart(
  parts: MessagePart[],
  tool: MessageToolCallData
): MessagePart[] {
  const index = parts.findIndex(
    (part) => part.type === "tool" && part.tool.id === tool.id
  )
  if (index >= 0) {
    const next = [...parts]
    const existing = next[index]
    if (existing.type === "tool") {
      next[index] = {
        type: "tool",
        id: existing.id,
        tool: {
          ...existing.tool,
          ...tool,
          input: tool.input ?? existing.tool.input,
          output: tool.output ?? existing.tool.output,
        },
      }
    }
    return next
  }
  return [...parts, { type: "tool", id: tool.id, tool }]
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
      aria-label={title}
      onClick={onClick}
      className="inline-grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-3.5"
    >
      {children}
    </button>
  )
}
