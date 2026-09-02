"use client"

import { cva } from "class-variance-authority"
import {
  ClipboardPaste,
  FileText,
  ImageIcon,
  Paperclip,
  Sparkles,
  Square,
  Terminal,
  X,
} from "lucide-react"
import * as React from "react"

import { FileIcon } from "@/components/ui/file-icon"
import { cn } from "@/lib/utils"

export type ChatSkill = {
  name: string
  description?: string
}

export type ChatSlashCommand = {
  name: string
  description?: string
  argHint?: string
}

export type ChatInputPayload = {
  text: string
  files: File[]
  skills: string[]
}

/** What the composer holds right now — the text already expanded (see `onPaste`). */
export type ChatInputDraft = {
  text: string
  files: File[]
  skills: string[]
}

/** Imperative access for a host that drives the composer from outside. */
export type ChatInputHandle = {
  focus: () => void
  getDraft: () => ChatInputDraft
  setDraft: (draft: Partial<ChatInputDraft>) => void
  /** Inserts at the caret (replacing a selection) and leaves it after the text. */
  insertText: (text: string) => void
}

export type ChatInputMentionItem = {
  id: string
  label: string
  description?: string
  /** Text written into the draft. @default `@${label}` */
  insert?: string
}

export type ChatInputQueuedMessage = {
  id: string
  text: string
  fileCount?: number
}

export type ChatInputProps = {
  onSend: (payload: ChatInputPayload) => void
  onStop?: () => void
  isGenerating?: boolean
  placeholder?: string
  /** Rendered next to the attach button — model/mode pickers belong here. */
  tools?: React.ReactNode
  /**
   * Fires on every change to the draft, the clear after a send and the text a
   * slash command inserts included. The composer keeps owning the value; this
   * is for a host that has to react to it, such as a context meter.
   */
  onTextChange?: (text: string) => void
  skills?: ChatSkill[]
  slashCommands?: ChatSlashCommand[]
  className?: string
  disabled?: boolean
  /** Max textarea height in px before it scrolls. */
  maxHeight?: number
  ref?: React.Ref<ChatInputHandle>
  /** Initial draft text. The composer owns the value from then on. */
  defaultValue?: string
  /**
   * Set it to let the user keep typing while a turn streams: Enter queues the
   * message instead of locking the textarea. The host owns the queue.
   */
  onQueue?: (payload: ChatInputPayload) => void
  queue?: ChatInputQueuedMessage[]
  onQueueRemove?: (id: string) => void
  /** Asked to put a queued message back into the composer — host calls `setDraft`. */
  onQueueEdit?: (id: string) => void
  /** Resolves the `@`-token at the caret. May be async; stale answers are dropped. */
  mentions?: (
    query: string
  ) => Promise<ChatInputMentionItem[]> | ChatInputMentionItem[]
  /** ⌘S / Ctrl+S hands the draft over and clears the composer. */
  onStash?: (payload: ChatInputPayload) => void
}

type SlashMenuItem =
  | { kind: "skill"; name: string; description: string }
  | { kind: "command"; name: string; description: string; argHint?: string }

/** A pasted block held out of the textarea, represented there by `token`. */
type PasteEntry = { id: string; n: number; token: string; text: string }

const MAX_FORCED_SKILLS = 5
const EMPTY_SKILLS: ChatSkill[] = []
const EMPTY_COMMANDS: ChatSlashCommand[] = []
const EMPTY_QUEUE: ChatInputQueuedMessage[] = []
const EMPTY_MENTIONS: ChatInputMentionItem[] = []
const EMPTY_FILES: File[] = []
const EMPTY_STRINGS: string[] = []
const EMPTY_PASTES: PasteEntry[] = []

/** Long enough that a chip beats a wall of text in a one-line composer. */
const PASTE_MAX_CHARS = 800
const PASTE_MAX_LINES = 3
const MENTION_DEBOUNCE_MS = 120

/**
 * Every control in the composer row shares one height and radius, so the
 * toolbar stays aligned no matter what you drop into `tools`.
 */
export const chatInputButtonVariants = cva(
  "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md text-[12px] whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        ghost: "px-2 text-muted-foreground hover:bg-muted hover:text-foreground",
        primary:
          "min-w-11 bg-primary px-2.5 text-primary-foreground hover:bg-primary/90 disabled:bg-primary/15 disabled:text-primary/70 disabled:opacity-100",
      },
    },
    defaultVariants: { variant: "ghost" },
  }
)

/** Shared popover shell for the slash and mention menus. */
const menuSurfaceClass =
  "absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-in fade-in slide-in-from-bottom-1 duration-150"

const menuListClass = "max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain"

const menuOptionClass =
  "col-span-full grid w-full grid-cols-subgrid items-start rounded-md px-1 py-2 text-left transition-colors"

function parseSlashQuery(text: string): string | null {
  if (!text.startsWith("/")) return null
  if (text.includes("\n") || text.includes(" ")) return null
  return text.slice(1)
}

/** The `@token` the caret sits in, if any. */
function findMentionToken(text: string, caret: number) {
  const before = text.slice(0, Math.max(0, Math.min(caret, text.length)))
  const match = /(^|\s)@([^\s@]*)$/.exec(before)
  if (!match) return null
  const start = match.index + match[1].length
  return { query: match[2], start, end: before.length }
}

function pasteTokenFor(n: number, lines: number) {
  return `[Pasted text #${n} +${lines} lines]`
}

/** Puts every still-present placeholder back to the block it stands for. */
function expandPastes(text: string, pastes: PasteEntry[]) {
  return pastes.reduce(
    (acc, paste) => acc.split(paste.token).join(paste.text),
    text
  )
}

function looksLikePath(label: string) {
  return label.includes("/") || label.includes(".")
}

export function ChatInput({
  onSend,
  onStop,
  isGenerating = false,
  placeholder,
  tools,
  onTextChange,
  skills = EMPTY_SKILLS,
  slashCommands = EMPTY_COMMANDS,
  className,
  disabled = false,
  maxHeight = 200,
  ref,
  defaultValue = "",
  onQueue,
  queue = EMPTY_QUEUE,
  onQueueRemove,
  onQueueEdit,
  mentions,
  onStash,
}: ChatInputProps) {
  const [text, setText] = React.useState(defaultValue)
  const [pending, setPending] = React.useState<File[]>(EMPTY_FILES)
  const [forcedSkills, setForcedSkills] = React.useState<string[]>(EMPTY_STRINGS)
  const [pastes, setPastes] = React.useState<PasteEntry[]>(EMPTY_PASTES)
  const [dragOver, setDragOver] = React.useState(false)
  const [caret, setCaret] = React.useState(defaultValue.length)
  const [slashIndex, setSlashIndex] = React.useState(0)
  const [slashDismissedText, setSlashDismissedText] = React.useState<
    string | null
  >(null)
  // Both keyed by the token they belong to, so a new token starts fresh
  // without an effect resetting them.
  const [mentionSelection, setMentionSelection] = React.useState<{
    key: string
    index: number
  } | null>(null)
  const [mentionDismissed, setMentionDismissed] = React.useState<string | null>(
    null
  )
  const [mentionResult, setMentionResult] = React.useState<{
    query: string
    items: ChatInputMentionItem[]
  } | null>(null)
  const taRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const pasteIdRef = React.useRef(0)
  const mentionSeqRef = React.useRef(0)

  /**
   * Read through a ref so `changeText` — and the callbacks that close over it
   * — stay stable across renders. A host that rebuilds the handler on every
   * keystroke must not be able to rebuild this composer's memoized ones too.
   */
  const notifyText = React.useRef(onTextChange)
  React.useEffect(() => {
    notifyText.current = onTextChange
  }, [onTextChange])

  const mentionProvider = React.useRef(mentions)
  React.useEffect(() => {
    mentionProvider.current = mentions
  }, [mentions])

  const changeText = React.useCallback((value: string) => {
    setText(value)
    notifyText.current?.(value)
  }, [])

  /** Focus after a menu pick or an insert, once React has written the value. */
  const focusCaret = React.useCallback((position: number) => {
    requestAnimationFrame(() => {
      const ta = taRef.current
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(position, position)
    })
  }, [])

  const slashEnabled = skills.length > 0 || slashCommands.length > 0
  const slashQuery = slashEnabled ? parseSlashQuery(text) : null
  const slashVisible =
    slashQuery !== null && slashDismissedText !== text && slashEnabled

  const slashMatches = React.useMemo(() => {
    if (!slashVisible || slashQuery === null) return [] as SlashMenuItem[]
    const q = slashQuery.toLowerCase()
    const matches = (name: string, description?: string) =>
      name.toLowerCase().startsWith(q) ||
      (description?.toLowerCase().includes(q) ?? false)
    return [
      ...skills
        .filter((s) => matches(s.name, s.description))
        .map<SlashMenuItem>((s) => ({
          kind: "skill",
          name: s.name,
          description: s.description ?? "",
        })),
      ...slashCommands
        .filter((c) => matches(c.name, c.description))
        .map<SlashMenuItem>((c) => ({
          kind: "command",
          name: c.name,
          description: c.description ?? "",
          argHint: c.argHint,
        })),
    ]
  }, [skills, slashCommands, slashQuery, slashVisible])

  const slashOpen = slashVisible && slashMatches.length > 0

  const mentionsEnabled = !!mentions
  const mentionToken = React.useMemo(
    () => (mentionsEnabled ? findMentionToken(text, caret) : null),
    [caret, mentionsEnabled, text]
  )
  const mentionQuery = mentionToken?.query ?? null
  const mentionKey =
    mentionToken === null ? null : `${mentionToken.start}:${mentionToken.query}`

  // Debounced, sequence-guarded lookup. The provider is read through a ref so
  // an inline arrow from the host cannot restart the debounce every render.
  React.useEffect(() => {
    if (!mentionsEnabled || mentionQuery === null) return
    const seq = ++mentionSeqRef.current
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        let items: ChatInputMentionItem[] = EMPTY_MENTIONS
        try {
          items = (await mentionProvider.current?.(mentionQuery)) ?? EMPTY_MENTIONS
        } catch {
          items = EMPTY_MENTIONS
        }
        if (cancelled || seq !== mentionSeqRef.current) return
        setMentionResult({ query: mentionQuery, items })
      })()
    }, MENTION_DEBOUNCE_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [mentionQuery, mentionsEnabled])

  const mentionMatches =
    mentionQuery !== null && mentionResult?.query === mentionQuery
      ? mentionResult.items
      : EMPTY_MENTIONS
  const mentionOpen =
    !slashOpen &&
    mentionMatches.length > 0 &&
    mentionKey !== null &&
    mentionDismissed !== mentionKey
  const mentionIndex =
    mentionSelection && mentionSelection.key === mentionKey
      ? Math.min(mentionSelection.index, mentionMatches.length - 1)
      : 0

  const moveMention = React.useCallback(
    (delta: number) => {
      if (mentionKey === null || mentionMatches.length === 0) return
      const next =
        (mentionIndex + delta + mentionMatches.length) % mentionMatches.length
      setMentionSelection({ key: mentionKey, index: next })
    },
    [mentionIndex, mentionKey, mentionMatches.length]
  )

  // Auto-resize the textarea, capped at `maxHeight`.
  React.useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    const capped = ta.scrollHeight > maxHeight
    ta.style.height = `${capped ? maxHeight : ta.scrollHeight}px`
    ta.style.overflowY = capped ? "auto" : "hidden"
  }, [text, maxHeight])

  const addFiles = React.useCallback((files: FileList | File[] | null) => {
    if (!files) return
    const list = Array.from(files)
    if (list.length === 0) return
    setPending((prev) => [...prev, ...list])
  }, [])

  const clearDraft = React.useCallback(() => {
    changeText("")
    setPending(EMPTY_FILES)
    setForcedSkills(EMPTY_STRINGS)
    setPastes(EMPTY_PASTES)
    setCaret(0)
  }, [changeText])

  /** Queueing is on only when the host said what to do with a queued message. */
  const queueing = isGenerating && !!onQueue

  const submit = React.useCallback(() => {
    if (disabled) return
    const value = expandPastes(text, pastes).trim()
    if (!value && pending.length === 0) return
    const payload: ChatInputPayload = {
      text: value,
      files: pending,
      skills: forcedSkills,
    }
    if (isGenerating) {
      if (!onQueue) return
      onQueue(payload)
    } else {
      onSend(payload)
    }
    clearDraft()
  }, [
    clearDraft,
    disabled,
    forcedSkills,
    isGenerating,
    onQueue,
    onSend,
    pastes,
    pending,
    text,
  ])

  const stash = React.useCallback(() => {
    if (disabled || !onStash) return
    const value = expandPastes(text, pastes).trim()
    if (!value && pending.length === 0) return
    onStash({ text: value, files: pending, skills: forcedSkills })
    clearDraft()
  }, [clearDraft, disabled, forcedSkills, onStash, pastes, pending, text])

  /**
   * What the handle reads. Mirrored into a ref so the handle keeps one
   * identity for the composer's lifetime: a host holds it across renders — an
   * effect cleanup that parks the draft when the chat changes, say — and a
   * handle rebuilt per keystroke would hand that cleanup the text the
   * composer had when the reference was taken.
   */
  const draftRef = React.useRef({
    text: "",
    pastes: EMPTY_PASTES,
    files: EMPTY_FILES,
    skills: EMPTY_STRINGS,
  })
  React.useEffect(() => {
    draftRef.current = { text, pastes, files: pending, skills: forcedSkills }
  })

  const insertAtCaret = React.useCallback(
    (value: string) => {
      const current = draftRef.current.text
      const ta = taRef.current
      const start = ta ? ta.selectionStart : current.length
      const end = ta ? ta.selectionEnd : start
      const next = current.slice(0, start) + value + current.slice(end)
      const position = start + value.length
      changeText(next)
      setCaret(position)
      focusCaret(position)
    },
    [changeText, focusCaret]
  )

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => taRef.current?.focus(),
      getDraft: () => {
        const { text: raw, pastes: held, files, skills } = draftRef.current
        return { text: expandPastes(raw, held), files, skills }
      },
      setDraft: (draft) => {
        if (draft.text !== undefined) {
          // The text arrives expanded, so the chips it may have carried are gone.
          changeText(draft.text)
          setPastes(EMPTY_PASTES)
          setCaret(draft.text.length)
        }
        if (draft.files !== undefined) setPending(draft.files)
        if (draft.skills !== undefined) setForcedSkills(draft.skills)
      },
      insertText: insertAtCaret,
    }),
    [changeText, insertAtCaret]
  )

  const selectSlashItem = React.useCallback(
    (item: SlashMenuItem) => {
      if (item.kind === "command") {
        changeText(`/${item.name} `)
        setCaret(item.name.length + 2)
      } else {
        setForcedSkills((prev) =>
          prev.includes(item.name) || prev.length >= MAX_FORCED_SKILLS
            ? prev
            : [...prev, item.name]
        )
        changeText("")
        setCaret(0)
      }
      setSlashIndex(0)
      setSlashDismissedText(null)
      requestAnimationFrame(() => taRef.current?.focus())
    },
    [changeText]
  )

  const selectMentionItem = React.useCallback(
    (item: ChatInputMentionItem) => {
      if (!mentionToken) return
      const insert = `${item.insert ?? `@${item.label}`} `
      const next =
        text.slice(0, mentionToken.start) + insert + text.slice(mentionToken.end)
      const position = mentionToken.start + insert.length
      changeText(next)
      setCaret(position)
      setMentionSelection(null)
      setMentionDismissed(null)
      focusCaret(position)
    },
    [changeText, focusCaret, mentionToken, text]
  )

  const removePaste = React.useCallback(
    (paste: PasteEntry) => {
      setPastes((prev) => prev.filter((p) => p.id !== paste.id))
      // The placeholder must go with the chip, or a send would keep the token.
      changeText(text.split(paste.token).join(""))
    },
    [changeText, text]
  )

  const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboard = event.clipboardData
    if (!clipboard) return
    if (clipboard.files?.length) {
      event.preventDefault()
      addFiles(clipboard.files)
      return
    }
    const raw = clipboard.getData("text/plain")
    if (!raw) return
    const lines = raw.split("\n").length
    if (raw.length <= PASTE_MAX_CHARS && lines <= PASTE_MAX_LINES) return

    event.preventDefault()
    const ta = event.currentTarget
    const start = ta.selectionStart
    const end = ta.selectionEnd
    // Numbers are reused once a chip is gone, so two live tokens never collide.
    const n = pastes.reduce((max, p) => Math.max(max, p.n), 0) + 1
    const token = pasteTokenFor(n, lines)
    pasteIdRef.current += 1
    setPastes((prev) => [
      ...prev,
      { id: `paste-${pasteIdRef.current}`, n, token, text: raw },
    ])
    const position = start + token.length
    changeText(text.slice(0, start) + token + text.slice(end))
    setCaret(position)
    focusCaret(position)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Never steal keys from an IME candidate window.
    if (event.nativeEvent.isComposing) return

    if (onStash && (event.metaKey || event.ctrlKey) && event.key === "s") {
      // Always swallow it: a composer must never open the browser's save dialog.
      event.preventDefault()
      stash()
      return
    }

    if (slashOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setSlashIndex((i) => (i + 1) % slashMatches.length)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setSlashIndex(
          (i) => (i - 1 + slashMatches.length) % slashMatches.length
        )
        return
      }
      if (event.key === "Tab") {
        event.preventDefault()
        const item = slashMatches[slashIndex]
        if (item) selectSlashItem(item)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setSlashIndex(0)
        setSlashDismissedText(text)
        return
      }
      if (event.key === "Enter" && !event.shiftKey) {
        const item = slashMatches[slashIndex]
        if (item && text.trim() === `/${slashQuery ?? ""}`) {
          event.preventDefault()
          selectSlashItem(item)
          return
        }
      }
    }

    if (mentionOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        moveMention(1)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        moveMention(-1)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setMentionDismissed(mentionKey)
        return
      }
      if (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey)) {
        const item = mentionMatches[mentionIndex]
        if (item) {
          event.preventDefault()
          selectMentionItem(item)
          return
        }
      }
    }

    // Enter sends (or queues), Shift+Enter inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const syncCaret = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCaret(event.currentTarget.selectionStart)
  }

  const hasDraft = text.trim().length > 0 || pending.length > 0
  const canSend = hasDraft && !disabled && (!isGenerating || queueing)
  // While queueing the textarea stays live — only a plain generating turn locks it.
  const inputLocked = disabled || (isGenerating && !queueing)
  const hasAttachments =
    pending.length > 0 || forcedSkills.length > 0 || pastes.length > 0
  const resolvedPlaceholder =
    placeholder ?? (queueing ? "Queue a message… (Enter)" : "Ask anything")

  return (
    <div
      data-slot="chat-input"
      className={cn(
        "mx-auto w-full max-w-3xl px-3 pt-1 pb-3 sm:px-4 sm:pb-4",
        className
      )}
    >
      <div className="relative">
        {slashOpen ? (
          <SlashMenu
            matches={slashMatches}
            selectedIndex={slashIndex}
            onHover={setSlashIndex}
            onSelect={selectSlashItem}
          />
        ) : null}
        {mentionOpen ? (
          <MentionMenu
            items={mentionMatches}
            selectedIndex={mentionIndex}
            onHover={(index) =>
              setMentionSelection(
                mentionKey === null ? null : { key: mentionKey, index }
              )
            }
            onSelect={selectMentionItem}
          />
        ) : null}

        {queue.length > 0 ? (
          <div data-slot="chat-input-queue" className="mb-2 flex flex-col gap-1">
            <div className="px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Queued · {queue.length}
            </div>
            {queue.map((item) => (
              <div
                key={item.id}
                data-slot="chat-input-queue-item"
                className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-[12px]"
              >
                {onQueueEdit ? (
                  <button
                    type="button"
                    title="Edit this message"
                    onClick={() => onQueueEdit(item.id)}
                    className="min-w-0 flex-1 truncate rounded-sm text-left text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {item.text}
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {item.text}
                  </span>
                )}
                {item.fileCount ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                    <Paperclip className="size-3" />
                    {item.fileCount}
                  </span>
                ) : null}
                {onQueueRemove ? (
                  <button
                    type="button"
                    title="Remove"
                    aria-label={`Remove queued message: ${item.text}`}
                    onClick={() => onQueueRemove(item.id)}
                    className="inline-grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div
          data-slot="chat-input-surface"
          data-drag-over={dragOver || undefined}
          data-state={queueing ? "queueing" : undefined}
          className={cn(
            /* A hairline card, not a pill: the focus state is a border-color
               shift rather than a ring, so a 700px-wide surface never lights
               up like a text field. */
            "rounded-2xl border bg-background px-3 pt-2.5 pb-2 shadow-xs transition-colors has-[textarea:focus]:border-ring sm:px-3.5",
            dragOver && "border-primary ring-1 ring-primary/20"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            if (e.dataTransfer?.types?.includes("Files")) setDragOver(true)
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            setDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
          }}
        >
          {hasAttachments ? (
            <div
              data-slot="chat-input-chips"
              className="mb-2 flex flex-wrap gap-1.5"
            >
              {forcedSkills.map((name) => (
                <Chip
                  key={`skill-${name}`}
                  icon={<Sparkles className="size-3.5 text-primary" />}
                  label={name}
                  accent
                  onRemove={() =>
                    setForcedSkills((prev) => prev.filter((s) => s !== name))
                  }
                />
              ))}
              {pastes.map((paste) => (
                <Chip
                  key={paste.id}
                  icon={<ClipboardPaste className="size-3.5 text-primary" />}
                  label={paste.token}
                  title={paste.text.slice(0, 200)}
                  onRemove={() => removePaste(paste)}
                />
              ))}
              {pending.map((file, i) => (
                <Chip
                  key={`${file.name}-${i}`}
                  icon={
                    file.type.startsWith("image/") ? (
                      <ImageIcon className="size-3.5 text-primary" />
                    ) : (
                      <FileText className="size-3.5 text-primary" />
                    )
                  }
                  label={file.name}
                  onRemove={() =>
                    setPending((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          ) : null}

          <textarea
            ref={taRef}
            data-slot="chat-input-textarea"
            rows={1}
            value={text}
            onChange={(e) => {
              changeText(e.target.value)
              setCaret(e.target.selectionStart)
            }}
            onKeyDown={onKeyDown}
            onSelect={syncCaret}
            onClick={syncCaret}
            onPaste={onPaste}
            placeholder={resolvedPlaceholder}
            aria-label="Message"
            disabled={inputLocked}
            /* text-base on mobile keeps iOS from zooming the viewport on focus. */
            className="min-h-6 w-full resize-none border-0 bg-transparent py-1.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60 sm:text-[15px]"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ""
            }}
          />

          <div
            data-slot="chat-input-toolbar"
            className="mt-1 flex items-center justify-between gap-2"
          >
            <div className="flex min-w-0 items-center gap-0.5">
              <button
                type="button"
                title="Attach file"
                aria-label="Attach file"
                onClick={() => fileInputRef.current?.click()}
                disabled={inputLocked}
                className={cn(chatInputButtonVariants(), "px-1.5")}
              >
                <Paperclip />
              </button>
              {tools}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  title="Stop generating"
                  className={cn(
                    chatInputButtonVariants({
                      /* Queueing keeps both actions on screen — only one of
                         them can be the primary one. */
                      variant: queueing ? "ghost" : "primary",
                    }),
                    queueing && "border"
                  )}
                >
                  <Square className="size-2.5 fill-current" />
                  <span className="text-[11px]">stop</span>
                </button>
              ) : null}
              {isGenerating && !queueing ? null : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  title={queueing ? "Queue (Enter)" : "Send (Enter)"}
                  className={cn(chatInputButtonVariants({ variant: "primary" }))}
                >
                  <span className="text-[13px] leading-none">↵</span>
                  <span className="text-[11px]">
                    {queueing ? "queue" : "send"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({
  icon,
  label,
  title,
  onRemove,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  /** Hover text when the label itself is not the full story. @default label */
  title?: string
  onRemove: () => void
  accent?: boolean
}) {
  return (
    <span
      data-slot="chat-input-chip"
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-[12px] sm:max-w-[260px]",
        accent ? "border-primary/30 bg-primary/10" : "bg-muted"
      )}
      title={title ?? label}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-foreground">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        title="Remove"
        aria-label={`Remove ${label}`}
        className="inline-grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

function SlashMenu({
  matches,
  selectedIndex,
  onHover,
  onSelect,
}: {
  matches: SlashMenuItem[]
  selectedIndex: number
  onHover: (index: number) => void
  onSelect: (item: SlashMenuItem) => void
}) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const skills = matches.filter((m) => m.kind === "skill")
  const commands = matches.filter((m) => m.kind === "command")

  React.useEffect(() => {
    listRef.current
      ?.querySelector(`[data-slash-option="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex, matches.length])

  return (
    <div
      data-slot="chat-input-slash-menu"
      className={menuSurfaceClass}
      role="listbox"
      aria-label="Slash commands"
    >
      <div ref={listRef} className={menuListClass}>
        <SlashGroup
          title="Skills"
          icon={<Sparkles className="size-3" />}
          items={skills}
          selectedIndex={selectedIndex}
          offset={0}
          onHover={onHover}
          onSelect={onSelect}
        />
        <SlashGroup
          title="Commands"
          icon={<Terminal className="size-3" />}
          items={commands}
          selectedIndex={selectedIndex}
          offset={skills.length}
          onHover={onHover}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}

function SlashGroup({
  title,
  icon,
  items,
  selectedIndex,
  offset,
  onHover,
  onSelect,
}: {
  title: string
  icon: React.ReactNode
  items: SlashMenuItem[]
  selectedIndex: number
  offset: number
  onHover: (index: number) => void
  onSelect: (item: SlashMenuItem) => void
}) {
  if (items.length === 0) return null

  return (
    <div data-slot="chat-input-slash-group">
      <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-popover px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-[max-content_minmax(0,1fr)] px-2 pb-1">
        {items.map((item, localIndex) => {
          const index = offset + localIndex
          const selected = index === selectedIndex
          return (
            <button
              key={`${item.kind}:${item.name}`}
              type="button"
              role="option"
              aria-selected={selected}
              data-slash-option={index}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(item)
              }}
              className={cn(
                menuOptionClass,
                selected ? "bg-muted" : "bg-transparent"
              )}
            >
              <span
                className={cn(
                  "whitespace-nowrap text-[12px]",
                  item.kind === "skill" ? "text-primary" : "text-foreground"
                )}
              >
                /{item.name}
                {item.kind === "command" && item.argHint ? (
                  <span className="text-[11px] text-muted-foreground">
                    {" "}
                    {item.argHint}
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 truncate pl-2 text-[11px] text-muted-foreground">
                {item.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MentionMenu({
  items,
  selectedIndex,
  onHover,
  onSelect,
}: {
  items: ChatInputMentionItem[]
  selectedIndex: number
  onHover: (index: number) => void
  onSelect: (item: ChatInputMentionItem) => void
}) {
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    listRef.current
      ?.querySelector(`[data-mention-option="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex, items.length])

  return (
    <div
      data-slot="chat-input-mention-menu"
      className={menuSurfaceClass}
      role="listbox"
      aria-label="Mentions"
    >
      <div ref={listRef} className={menuListClass}>
        <div className="grid grid-cols-[max-content_minmax(0,1fr)] px-2 py-1">
          {items.map((item, index) => {
            const selected = index === selectedIndex
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                data-mention-option={index}
                onMouseEnter={() => onHover(index)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(item)
                }}
                className={cn(
                  menuOptionClass,
                  selected ? "bg-muted" : "bg-transparent"
                )}
              >
                <span className="flex items-center gap-1.5 font-mono text-[12px] whitespace-nowrap text-foreground">
                  {looksLikePath(item.label) ? (
                    <FileIcon path={item.label} size={13} />
                  ) : null}
                  {item.label}
                </span>
                <span className="min-w-0 truncate pl-2 text-[11px] text-muted-foreground">
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
