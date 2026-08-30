"use client"

import { cva } from "class-variance-authority"
import {
  FileText,
  ImageIcon,
  Paperclip,
  Sparkles,
  Square,
  Terminal,
  X,
} from "lucide-react"
import * as React from "react"

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

export type ChatInputProps = {
  onSend: (payload: ChatInputPayload) => void
  onStop?: () => void
  isGenerating?: boolean
  placeholder?: string
  /** Rendered next to the attach button — model/mode pickers belong here. */
  tools?: React.ReactNode
  skills?: ChatSkill[]
  slashCommands?: ChatSlashCommand[]
  className?: string
  disabled?: boolean
  /** Max textarea height in px before it scrolls. */
  maxHeight?: number
}

type SlashMenuItem =
  | { kind: "skill"; name: string; description: string }
  | { kind: "command"; name: string; description: string; argHint?: string }

const MAX_FORCED_SKILLS = 5
const EMPTY_SKILLS: ChatSkill[] = []
const EMPTY_COMMANDS: ChatSlashCommand[] = []

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

function parseSlashQuery(text: string): string | null {
  if (!text.startsWith("/")) return null
  if (text.includes("\n") || text.includes(" ")) return null
  return text.slice(1)
}

export function ChatInput({
  onSend,
  onStop,
  isGenerating = false,
  placeholder = "Ask anything",
  tools,
  skills = EMPTY_SKILLS,
  slashCommands = EMPTY_COMMANDS,
  className,
  disabled = false,
  maxHeight = 200,
}: ChatInputProps) {
  const [text, setText] = React.useState("")
  const [pending, setPending] = React.useState<File[]>([])
  const [forcedSkills, setForcedSkills] = React.useState<string[]>([])
  const [dragOver, setDragOver] = React.useState(false)
  const [slashIndex, setSlashIndex] = React.useState(0)
  const [slashDismissedText, setSlashDismissedText] = React.useState<
    string | null
  >(null)
  const taRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const submit = React.useCallback(() => {
    const value = text.trim()
    if ((!value && pending.length === 0) || isGenerating || disabled) return
    onSend({ text: value, files: pending, skills: forcedSkills })
    setText("")
    setPending([])
    setForcedSkills([])
  }, [disabled, forcedSkills, isGenerating, onSend, pending, text])

  const selectSlashItem = React.useCallback((item: SlashMenuItem) => {
    if (item.kind === "command") {
      setText(`/${item.name} `)
    } else {
      setForcedSkills((prev) =>
        prev.includes(item.name) || prev.length >= MAX_FORCED_SKILLS
          ? prev
          : [...prev, item.name]
      )
      setText("")
    }
    setSlashIndex(0)
    setSlashDismissedText(null)
    requestAnimationFrame(() => taRef.current?.focus())
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Never steal keys from an IME candidate window.
    if (event.nativeEvent.isComposing) return

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
    // Enter sends, Shift+Enter inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const canSend =
    (text.trim().length > 0 || pending.length > 0) && !isGenerating && !disabled
  const busy = isGenerating || disabled
  const hasAttachments = pending.length > 0 || forcedSkills.length > 0

  return (
    <div
      data-slot="chat-input"
      className={cn(
        "mx-auto w-full max-w-4xl px-3 pt-1 pb-3 sm:px-4 sm:pb-4",
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
        <div
          data-slot="chat-input-surface"
          data-drag-over={dragOver || undefined}
          className={cn(
            "rounded-3xl border bg-background px-3 pt-2.5 pb-2 shadow-xs transition-colors has-[textarea:focus]:border-ring has-[textarea:focus]:ring-[3px] has-[textarea:focus]:ring-ring/50 sm:px-3.5",
            dragOver && "border-primary ring-[3px] ring-primary/20"
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
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={(e) => {
              if (!e.clipboardData?.files?.length) return
              e.preventDefault()
              addFiles(e.clipboardData.files)
            }}
            placeholder={placeholder}
            aria-label="Message"
            disabled={busy}
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
                disabled={busy}
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
                  className={cn(chatInputButtonVariants({ variant: "primary" }))}
                >
                  <Square className="size-2.5 fill-current" />
                  <span className="text-[11px]">stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  title="Send (Enter)"
                  className={cn(chatInputButtonVariants({ variant: "primary" }))}
                >
                  <span className="text-[13px] leading-none">↵</span>
                  <span className="text-[11px]">send</span>
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
  onRemove,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
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
      title={label}
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
      className="absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-in fade-in slide-in-from-bottom-1 duration-150"
      role="listbox"
      aria-label="Slash commands"
    >
      <div
        ref={listRef}
        className="max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain"
      >
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
                "col-span-full grid w-full grid-cols-subgrid items-start rounded-md px-1 py-2 text-left transition-colors",
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
