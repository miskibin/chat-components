"use client"

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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  tools?: React.ReactNode
  skills?: ChatSkill[]
  slashCommands?: ChatSlashCommand[]
  className?: string
  disabled?: boolean
}

type SlashMenuItem =
  | { kind: "skill"; name: string; description: string }
  | { kind: "command"; name: string; description: string; argHint?: string }

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
  skills = [],
  slashCommands = [],
  className,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("")
  const [pending, setPending] = useState<File[]>([])
  const [forcedSkills, setForcedSkills] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [slashIndex, setSlashIndex] = useState(0)
  const [slashDismissedText, setSlashDismissedText] = useState<string | null>(
    null
  )
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const slashEnabled = skills.length > 0 || slashCommands.length > 0
  const slashQuery = slashEnabled ? parseSlashQuery(text) : null
  const slashVisible =
    slashQuery !== null && slashDismissedText !== text && slashEnabled

  const slashMatches = useMemo(() => {
    if (!slashVisible || slashQuery === null) return [] as SlashMenuItem[]
    const q = slashQuery.toLowerCase()
    const skillItems: SlashMenuItem[] = skills
      .filter(
        (s) =>
          s.name.toLowerCase().startsWith(q) ||
          (s.description?.toLowerCase().includes(q) ?? false)
      )
      .map((s) => ({
        kind: "skill" as const,
        name: s.name,
        description: s.description ?? "",
      }))
    const commandItems: SlashMenuItem[] = slashCommands
      .filter(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          (c.description?.toLowerCase().includes(q) ?? false)
      )
      .map((c) => ({
        kind: "command" as const,
        name: c.name,
        description: c.description ?? "",
        argHint: c.argHint,
      }))
    return [...skillItems, ...commandItems]
  }, [skills, slashCommands, slashQuery, slashVisible])

  const slashOpen = slashVisible && slashMatches.length > 0

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    const capped = ta.scrollHeight > 200
    ta.style.height = `${capped ? 200 : ta.scrollHeight}px`
    ta.style.overflowY = capped ? "auto" : "hidden"
  }, [text])

  useEffect(() => {
    if (slashDismissedText !== null && slashDismissedText !== text) {
      setSlashDismissedText(null)
    }
  }, [slashDismissedText, text])

  const addFiles = useCallback((files: FileList | File[] | null) => {
    if (!files) return
    const list = Array.from(files)
    if (list.length === 0) return
    setPending((prev) => [...prev, ...list])
  }, [])

  const submit = useCallback(() => {
    const t = text.trim()
    if ((!t && pending.length === 0) || isGenerating || disabled) return
    onSend({ text: t, files: pending, skills: forcedSkills })
    setText("")
    setPending([])
    setForcedSkills([])
  }, [disabled, forcedSkills, isGenerating, onSend, pending, text])

  const selectSlashItem = useCallback((item: SlashMenuItem) => {
    if (item.kind === "command") {
      setText(`/${item.name} `)
    } else {
      setForcedSkills((prev) => {
        if (prev.includes(item.name)) return prev
        if (prev.length >= 5) return prev
        return [...prev, item.name]
      })
      setText("")
    }
    setSlashIndex(0)
    setSlashDismissedText(null)
    requestAnimationFrame(() => taRef.current?.focus())
  }, [])

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSlashIndex((i) => (i + 1) % slashMatches.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSlashIndex(
          (i) => (i - 1 + slashMatches.length) % slashMatches.length
        )
        return
      }
      if (e.key === "Tab") {
        e.preventDefault()
        const item = slashMatches[slashIndex]
        if (item) selectSlashItem(item)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSlashIndex(0)
        setSlashDismissedText(text)
        return
      }
      if (e.key === "Enter" && !e.shiftKey) {
        const item = slashMatches[slashIndex]
        if (item && text.trim() === `/${slashQuery ?? ""}`) {
          e.preventDefault()
          selectSlashItem(item)
          return
        }
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend =
    (text.trim().length > 0 || pending.length > 0) &&
    !isGenerating &&
    !disabled

  const busy = isGenerating || disabled

  return (
    <div className={cn("relative mx-auto w-full max-w-4xl px-4 pb-4 pt-1", className)}>
      {slashOpen && (
        <SlashMenu
          matches={slashMatches}
          selectedIndex={slashIndex}
          onHover={setSlashIndex}
          onSelect={selectSlashItem}
        />
      )}
      <div
        className={cn(
          "rounded-3xl border bg-background px-3.5 pb-2 pt-2.5 shadow-xs transition",
          dragOver
            ? "border-primary ring-2 ring-primary/20"
            : "border-border"
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
        {(pending.length > 0 || forcedSkills.length > 0) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {forcedSkills.map((name) => (
              <Chip
                key={`skill-${name}`}
                icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
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
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  )
                }
                label={file.name}
                onRemove={() =>
                  setPending((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </div>
        )}

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onPaste={(e) => {
            if (!e.clipboardData?.files?.length) return
            e.preventDefault()
            addFiles(e.clipboardData.files)
          }}
          placeholder={placeholder}
          aria-label="Message"
          disabled={busy}
          className="w-full resize-none border-0 bg-transparent py-1.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          style={{ minHeight: 24 }}
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

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            <ToolbarBtn
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              <Paperclip className="h-4 w-4" />
            </ToolbarBtn>
            {tools}
          </div>
          <div className="flex items-center gap-1">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop"
                className="inline-flex h-7 min-w-11 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-primary-foreground transition hover:opacity-90"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                <span className="text-[11px]">stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                title="Send (Enter)"
                className={cn(
                  "inline-flex h-7 min-w-11 items-center justify-center gap-1.5 rounded-md px-2.5 transition",
                  canSend
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "cursor-not-allowed bg-primary/15 text-primary/70"
                )}
              >
                <span className="text-[13px]">↵</span>
                <span className="text-[11px]">send</span>
              </button>
            )}
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
    <div
      className={cn(
        "inline-flex max-w-[260px] items-center gap-2 rounded-md border px-2 py-1 text-[12px]",
        accent
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-muted"
      )}
      title={label}
    >
      {icon}
      <span className="flex-1 truncate text-foreground">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        title="Remove"
        className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

function ToolbarBtn({
  title,
  children,
  onClick,
  disabled = false,
}: {
  title: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground",
        disabled && "cursor-not-allowed opacity-45"
      )}
    >
      {children}
    </button>
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
  const listRef = useRef<HTMLDivElement>(null)
  const skills = matches.filter((m) => m.kind === "skill")
  const commands = matches.filter((m) => m.kind === "command")

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-slash-option="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex, matches.length])

  return (
    <div
      className="absolute bottom-full left-3 right-3 z-30 mb-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
      role="listbox"
      aria-label="Slash commands"
    >
      <div
        ref={listRef}
        className="max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain"
      >
        <SlashGroup
          title="Skills"
          icon={<Sparkles className="h-3 w-3" />}
          items={skills}
          selectedIndex={selectedIndex}
          offset={0}
          onHover={onHover}
          onSelect={onSelect}
        />
        <SlashGroup
          title="Commands"
          icon={<Terminal className="h-3 w-3" />}
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
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-popover px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-[max-content_minmax(0,1fr)] px-3 pb-1">
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
                "col-span-full grid w-full grid-cols-subgrid items-start py-2 text-left transition",
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
              <span className="min-w-0 pl-2 text-[11px] text-muted-foreground">
                {item.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
