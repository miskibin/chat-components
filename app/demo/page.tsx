"use client"

import { arrayMove } from "@dnd-kit/sortable"
import {
  Copy,
  HelpCircle,
  Palette,
  PanelLeft,
  Paperclip,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react"
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
  type ChatSidebarItemData,
} from "@/components/ui/chat-sidebar"
import {
  MessageList,
  type ChatMessageData,
} from "@/components/ui/message-list"
import type { GenerationStage } from "@/components/ui/generation-status"
import type { MessagePart, MessageToolCallData } from "@/components/ui/message"
import {
  formatAskQuestionOutput,
  isOpenAskTool,
  type AskQuestionResult,
} from "@/components/ui/ask-question"
import {
  DEFAULT_MODEL_EFFORTS,
  ModelPicker,
  type ModelOption,
} from "@/components/ui/model-picker"
import {
  PromptSuggestions,
  type PromptSuggestion,
} from "@/components/ui/prompt-suggestions"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { AgentStreamEvent } from "@/lib/cursor-agent-types"
import { runLayoutTransition } from "@/lib/layout-transition"
import { streamCursorChat } from "@/lib/cursor-stream"
import { cn } from "@/lib/utils"

const DESKTOP_QUERY = "(min-width: 768px)"

/** Pinning floats a chat to the top; drag-to-reorder owns the order after that. */
function pinToTop(sessions: ChatSession[], id: string) {
  const index = sessions.findIndex((s) => s.id === id)
  if (index < 0) return sessions
  const next = [...sessions]
  const [item] = next.splice(index, 1)
  return [{ ...item, pinned: true }, ...next]
}

/** Wall clock read, hoisted out of the component so render stays pure. */
function nowMs() {
  return Date.now()
}

/** Compact sidebar timestamp — "now", "2m", "3h", "5d". */
function relativeTime(from: number, now: number) {
  const seconds = Math.max(0, Math.round((now - from) / 1000))
  if (seconds < 60) return "now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

/** Elapsed wall time for a live Working label — "12s", "1m 04s". */
function formatElapsed(from: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - from) / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  return `${minutes}m ${String(rem).padStart(2, "0")}s`
}

const STAGE_SUBTITLES: Record<Exclude<GenerationStage, "idle">, string> = {
  thinking: "Thinking",
  searching: "Searching",
  responding: "Responding",
}

/** Second sidebar line: stage while generating, else model / empty hint. */
function sessionSubtitle(session: ChatSession, models: ModelOption[]) {
  if (session.run && session.run.stage !== "idle") {
    return STAGE_SUBTITLES[session.run.stage]
  }
  if (!session.model || !session.messages?.length) return "New chat"
  return models.find((m) => m.id === session.model)?.name ?? session.model
}

/** Trailing meta: Working / Failed label, or the relative timestamp. */
function sessionMeta(
  session: ChatSession,
  now: number,
  isActive: boolean
): ReactNode {
  if (session.run) {
    return (
      <span
        className={cn("font-medium text-primary", !isActive && "opacity-75")}
      >
        Working · {formatElapsed(session.run.startedAt, now)}
      </span>
    )
  }
  if (session.lastError) {
    return <span className="font-medium text-destructive">Failed</span>
  }
  return relativeTime(session.updatedAt, now)
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

type SessionRun = {
  startedAt: number
  stage: GenerationStage
}

type ChatSession = ChatSidebarItemData & {
  messages?: MessageData[]
  cursorSessionId?: string
  /** Last time the thread changed — drives the sidebar `meta` timestamp. */
  updatedAt: number
  /** Model used for the last turn — drives the sidebar `subtitle`. */
  model?: string
  /** Live generation for this thread; absent / null when idle. */
  run?: SessionRun | null
  /** Last turn ended in error — drives the Failed meta until the next send. */
  lastError?: boolean
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

/**
 * Each label is a trigger phrase for one of `lib/mock-agent.ts`'s scripted
 * scenarios, so the simulated run stays rich: reasoning, tool calls that fail
 * and recover, then streamed markdown with code, tables, math and mermaid.
 */
const DEMO_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: "streaming",
    label: "How does streaming work?",
    icon: <Waves />,
  },
  {
    id: "theming",
    label: "How do theme tokens work in dark mode?",
    icon: <Palette />,
  },
  {
    id: "composer",
    label: "What does the composer send when I attach a file?",
    icon: <Paperclip />,
  },
  {
    id: "markdown",
    label: "Walk me through the markdown, math and mermaid rendering",
    icon: <Sparkles />,
  },
  {
    id: "ask",
    label: "Use the ask tool so I can try the UI",
    icon: <HelpCircle />,
  },
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
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    { id: "1", title: "Welcome chat", pinned: true, updatedAt: nowMs() },
  ])
  const [activeId, setActiveId] = useState("1")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(FALLBACK_MODELS)
  const [selectedModel, setSelectedModel] = useState("composer-2.5")
  // Effort is UI-only here — the mock agent ignores it.
  const [effort, setEffort] = useState("high")
  // Set by /api/models when no local `agent` binary is available.
  const [isMock, setIsMock] = useState(false)
  // One clock for every sidebar timestamp / Working elapsed label.
  const [clock, setClock] = useState(() => nowMs())
  const abortBySessionRef = useRef(new Map<string, AbortController>())
  const activeIdRef = useRef(activeId)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  const activeSession = sessions.find((s) => s.id === activeId)
  const isGenerating = !!activeSession?.run
  const generationStage = activeSession?.run?.stage ?? "idle"
  const anyRunning = sessions.some((session) => !!session.run)

  // Tick every second while something is Working so elapsed labels stay fresh;
  // otherwise age "now" into "2m" on a slower cadence.
  useEffect(() => {
    const timer = setInterval(() => setClock(nowMs()), anyRunning ? 1_000 : 30_000)
    return () => clearInterval(timer)
  }, [anyRunning])

  const isEmptyChat = messages.length === 0
  const pendingAsk = findPendingAsk(messages)
  // The drawer only exists below md; derive it so a resize can't strand it open.
  const drawerOpen = mobileNavOpen && !isDesktop

  // Rich rows are derived at render — never stored, so they can't drift.
  const sessionItems: ChatSidebarItemData[] = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    pinned: session.pinned,
    status: session.run
      ? "streaming"
      : session.lastError
        ? "fault"
        : undefined,
    subtitle: sessionSubtitle(session, modelOptions),
    meta: sessionMeta(session, clock, session.id === activeId),
  }))

  useEffect(() => {
    let cancelled = false
    fetch("/api/models")
      .then((res) => res.json())
      .then((data: { models?: ModelOption[]; error?: string; mock?: boolean }) => {
        if (cancelled || !data.models?.length) return
        setIsMock(Boolean(data.mock))
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

  const abortSession = (sessionId: string) => {
    abortBySessionRef.current.get(sessionId)?.abort()
    abortBySessionRef.current.delete(sessionId)
  }

  const stopSession = (sessionId: string) => {
    abortSession(sessionId)
    persistSession(sessionId, (session) => ({ ...session, run: null }))
  }

  const handleNewChat = () => {
    // Leave other sessions' streams running — the sidebar shows their Working state.
    setMobileNavOpen(false)
    const id = String(nowMs())
    setSessions((prev) => [
      { id, title: "New chat", pinned: false, messages: [], updatedAt: nowMs() },
      ...prev,
    ])
    setActiveId(id)
    if (messages.length > 0) runLayoutTransition(() => setMessages([]))
    else setMessages([])
  }

  const selectSession = (id: string) => {
    // Do not abort — background chats keep streaming and stay labeled Working.
    setMobileNavOpen(false)
    const session = sessions.find((s) => s.id === id)
    setActiveId(id)
    const next = session?.messages ?? []
    const crossing = (messages.length === 0) !== (next.length === 0)
    if (crossing) runLayoutTransition(() => setMessages(next))
    else setMessages(next)
  }

  const removeSession = (id: string) => {
    abortSession(id)
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (activeId === id) {
        setActiveId(next[0]?.id ?? "")
        setMessages(next[0]?.messages ?? [])
      }
      return next
    })
  }

  const runPrompt = async (
    prompt: string,
    sessionId: string,
    priorMessages: MessageData[],
    cursorSessionId?: string,
    animateOpening = false
  ) => {
    const assistantId = crypto.randomUUID()
    const started = nowMs()
    const model = selectedModel
    abortSession(sessionId)
    const controller = new AbortController()
    abortBySessionRef.current.set(sessionId, controller)

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
        model,
        updatedAt: nowMs(),
        cursorSessionId: nextSessionId ?? session.cursorSessionId,
        lastError: false,
        run: { startedAt: started, stage: "thinking" },
      }))
      if (activeIdRef.current === sessionId) setMessages(next)
    }

    const paint = () => applyMessages([...priorMessages, seedAssistant])
    if (animateOpening) runLayoutTransition(paint)
    else paint()

    const setRunStage = (stage: GenerationStage) => {
      persistSession(sessionId, (session) =>
        session.run
          ? { ...session, run: { ...session.run, stage } }
          : session
      )
    }

    const patchAssistant = (
      updater: (message: MessageData) => MessageData,
      nextCursorSessionId?: string
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
          cursorSessionId: nextCursorSessionId ?? session.cursorSessionId,
        }
      })
    }

    const markFailed = () => {
      persistSession(sessionId, (session) => ({
        ...session,
        lastError: true,
        run: null,
        updatedAt: nowMs(),
      }))
    }

    const onEvent = (event: AgentStreamEvent) => {
      if (controller.signal.aborted) return
      if (event.type === "session") {
        persistSession(sessionId, (session) => ({
          ...session,
          cursorSessionId: event.sessionId,
        }))
        return
      }
      if (event.type === "thinking") {
        setRunStage("thinking")
        patchAssistant((message) => {
          const parts = appendThinkingPart(message.parts ?? [], event.text)
          return {
            ...message,
            parts,
            content: textFromParts(parts),
            tools: toolsFromParts(parts),
          }
        })
        return
      }
      if (event.type === "text") {
        setRunStage("responding")
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
        setRunStage("searching")
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
        markFailed()
        return
      }
      if (event.type === "done") {
        patchAssistant(
          (message) => ({
            ...message,
            workedFor: (nowMs() - started) / 1000,
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
        markFailed()
      }
    } finally {
      if (abortBySessionRef.current.get(sessionId) === controller) {
        abortBySessionRef.current.delete(sessionId)
      }
      persistSession(sessionId, (session) =>
        session.run?.startedAt === started
          ? { ...session, run: null, updatedAt: nowMs() }
          : session
      )
    }
  }

  const handleSend = (payload: ChatInputPayload) => {
    if (payload.text.trim() === "/clear") {
      stopSession(activeId)
      persistSession(activeId, (session) => ({
        ...session,
        messages: [],
        model: undefined,
        updatedAt: nowMs(),
        cursorSessionId: undefined,
        lastError: false,
        run: null,
      }))
      runLayoutTransition(() => setMessages([]))
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
    const pending = findPendingAsk(messages)
    const prior = pending
      ? completeAsk(messages, pending.messageId, pending.toolId, {
          skipped: true,
          answers: {},
        })
      : messages
    const next = [...prior, userMessage]
    persistSession(sessionId, (session) => ({
      ...session,
      messages: next,
      model: selectedModel,
      updatedAt: nowMs(),
      lastError: false,
    }))
    void runPrompt(
      content,
      sessionId,
      next,
      activeSession?.cursorSessionId,
      messages.length === 0
    )
  }

  const handleStop = () => {
    stopSession(activeId)
  }

  const handleAskAnswer = (
    messageId: string,
    toolId: string,
    result: AskQuestionResult
  ) => {
    const next = completeAsk(messages, messageId, toolId, result)
    persistSession(activeId, (session) => ({
      ...session,
      messages: next,
      updatedAt: nowMs(),
    }))
    setMessages(next)
    void runPrompt(
      result.skipped
        ? "AskQuestion result: skipped"
        : `AskQuestion result: ${JSON.stringify(result.answers)}`,
      activeId,
      next,
      activeSession?.cursorSessionId
    )
  }

  /**
   * Same composer in both layouts so the first send can slide it from the
   * centered opening down to the docked conversation.
   */
  const composer = (
    <ChatInput
      onSend={handleSend}
      onStop={handleStop}
      isGenerating={isGenerating}
      placeholder={
        pendingAsk
          ? "Add more optional details…"
          : isMock
            ? "Ask the simulated agent — try “use the ask tool”"
            : "Ask Cursor Agent — try listing files in this repo"
      }
      skills={DEMO_SKILLS}
      slashCommands={DEMO_COMMANDS}
      className={cn(
        "transition-[max-width,padding] duration-300 ease-out",
        isEmptyChat && "max-w-3xl pb-0 sm:pb-0"
      )}
      tools={
        <ModelPicker
          value={selectedModel}
          onChange={setSelectedModel}
          options={modelOptions}
          efforts={DEFAULT_MODEL_EFFORTS}
          effort={effort}
          onEffortChange={setEffort}
          side="top"
          className="min-w-0"
        />
      }
    />
  )

  useEffect(
    () => () => {
      for (const controller of abortBySessionRef.current.values()) {
        controller.abort()
      }
      abortBySessionRef.current.clear()
    },
    []
  )

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen])

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
            if (drop.kind === "reorder") {
              setSessions((prev) => arrayMove(prev, drop.from, drop.to))
            } else if (drop.action === "pin") {
              setSessions((prev) => pinToTop(prev, drop.itemId))
            } else if (drop.action === "delete") {
              removeSession(drop.itemId)
              toast.message("Chat deleted")
            }
          }}
          renderOverlay={(id) => {
            const item = sessionItems.find((s) => s.id === id)
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
                  icon={<Pencil className="size-4" />}
                  onClick={handleNewChat}
                >
                  New chat
                </SideRow>
                <SideRow
                  icon={<Search className="size-4" />}
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
                  <Pencil className="size-4" />
                </SideIconBtn>
                <SideIconBtn
                  label="Search"
                  onClick={() => toast.message("Wire search to your app")}
                >
                  <Search className="size-4" />
                </SideIconBtn>
              </>
            }
          >
            <SidebarSessionSection
              open={chatsOpen}
              onToggle={() => setChatsOpen((v) => !v)}
              sessions={sessionItems}
              activeId={activeId}
              onSelect={selectSession}
              onRename={(id, title) =>
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === id ? { ...s, title, updatedAt: nowMs() } : s
                  )
                )
              }
              onTogglePin={(id, pinned) =>
                setSessions((prev) =>
                  pinned
                    ? pinToTop(prev, id)
                    : prev.map((s) => (s.id === id ? { ...s, pinned } : s))
                )
              }
              onDelete={removeSession}
            />
          </ChatSidebar>
        </ChatSidebarDnd>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          aria-label="Open chats"
          onClick={() => setMobileNavOpen(true)}
          className="fixed top-3 left-3 z-50 inline-grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden [&_svg]:size-4"
        >
          <PanelLeft />
        </button>
        <ThemeToggle />

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-hidden",
            isEmptyChat && "justify-center"
          )}
        >
          {isEmptyChat ? (
            <div
              data-slot="demo-opening"
              className="mx-auto w-full max-w-3xl px-3 pb-5 sm:px-4"
            >
              <h2 className="text-center text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
                How can I help?
              </h2>
            </div>
          ) : (
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
              onAskAnswer={handleAskAnswer}
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
                      <Copy />
                    </ActionBtn>
                    <ActionBtn
                      title="Regenerate"
                      onClick={() => {
                        const idx = messages.findIndex(
                          (m) => m.id === message.id
                        )
                        let userIdx = idx - 1
                        while (
                          userIdx >= 0 &&
                          messages[userIdx].sender !== "user"
                        ) {
                          userIdx--
                        }
                        if (userIdx < 0) return
                        const prompt = messages[userIdx].content
                        const next = messages.filter(
                          (m) => m.id !== message.id
                        )
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
                      <RefreshCw />
                    </ActionBtn>
                    <ActionBtn
                      title="Delete"
                      onClick={() => {
                        const next = messages.filter(
                          (m) => m.id !== message.id
                        )
                        persistSession(activeId, (session) => ({
                          ...session,
                          messages: next,
                        }))
                        setMessages(next)
                      }}
                    >
                      <Trash2 />
                    </ActionBtn>
                  </div>
                )
              }}
            />
          )}

          <div data-slot="chat-composer" className="w-full shrink-0">
            {composer}
            {isEmptyChat ? (
              <PromptSuggestions
                items={DEMO_SUGGESTIONS}
                onSelect={(item) =>
                  handleSend({ text: item.label, files: [], skills: [] })
                }
                className="max-w-3xl px-3 pt-2 sm:px-4"
              />
            ) : null}
          </div>
        </div>
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
        sortable
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

function appendThinkingPart(parts: MessagePart[], text: string): MessagePart[] {
  const last = parts.at(-1)
  if (last?.type === "thinking") {
    return [...parts.slice(0, -1), { ...last, text: last.text + text }]
  }
  return [...parts, { type: "thinking", id: crypto.randomUUID(), text }]
}

function findPendingAsk(messages: MessageData[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    const tools = message.tools?.length
      ? message.tools
      : toolsFromParts(message.parts ?? [])
    const tool = tools.find(isOpenAskTool)
    if (tool) return { messageId: message.id, toolId: tool.id }
  }
  return null
}

function completeAsk(
  messages: MessageData[],
  messageId: string,
  toolId: string,
  result: AskQuestionResult
): MessageData[] {
  const output = formatAskQuestionOutput(result)
  return messages.map((message) => {
    if (message.id !== messageId) return message
    const patchTool = (tool: MessageToolCallData) =>
      tool.id === toolId ? { ...tool, status: "done" as const, output } : tool
    return {
      ...message,
      tools: message.tools?.map(patchTool),
      parts: message.parts?.map((part) =>
        part.type === "tool" && part.tool.id === toolId
          ? { ...part, tool: patchTool(part.tool) }
          : part
      ),
    }
  })
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
