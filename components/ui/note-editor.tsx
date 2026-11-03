"use client"

import * as React from "react"
import { ArrowUp, Sparkles } from "lucide-react"
import type { Crepe } from "@milkdown/crepe"
import type { Ctx } from "@milkdown/kit/ctx"
import type { Node as ProseNode } from "@milkdown/kit/prose/model"
import type { Plugin, PluginKey } from "@milkdown/kit/prose/state"
import type { DecorationSet, EditorView } from "@milkdown/kit/prose/view"
import "@milkdown/crepe/theme/common/style.css"
import "katex/dist/katex.min.css"
import "./note-editor.css"

import { cn } from "@/lib/utils"

/**
 * The fence language of a placeholder an agent plants where its answer will
 * land (` ```agent-pending ` with the intent as its body). The editor draws it
 * as a shimmering line rather than code, so a reader sees the plan in place
 * before the words arrive.
 */
export const NOTE_PENDING_LANGUAGE = "agent-pending"

/** A thread hung on words in the note — drawn as a highlight over them. */
export type NoteEditorAnchor = {
  id: string
  /** The words the thread hangs on, as they read in the note. */
  text: string
  /** `running` while an agent works on it; drives `data-state`. */
  state?: "open" | "running" | "done" | "error"
}

/** What the ask bubble hands back: the selected words and the instruction. */
export type NoteEditorAsk = {
  text: string
  instruction: string
}

export type NoteEditorHandle = {
  focus(): void
  /** The note as markdown, as the editor would save it now. */
  getMarkdown(): string | undefined
  /** Opens the ask bubble on the current selection; false when it is empty. */
  ask(): boolean
}

export type NoteEditorClassNames = {
  root?: string
  editor?: string
  ask?: string
  askInput?: string
  askQuote?: string
}

export type NoteEditorProps = {
  /** Markdown. A new value is applied as the smallest block-level change. */
  value: string
  /** Called with the markdown after the user edits, debounced. */
  onChange?: (markdown: string) => void
  readOnly?: boolean
  placeholder?: string
  /** Threads to highlight; clicking one calls `onAnchorClick`. */
  anchors?: NoteEditorAnchor[]
  activeAnchorId?: string
  onAnchorClick?: (id: string) => void
  /**
   * Turns on the ask bubble — a toolbar button on any selection and
   * ⌘E / Ctrl+E — and receives what was asked. Read once, when the editor
   * mounts.
   */
  onAsk?: (ask: NoteEditorAsk) => void
  askPlaceholder?: string
  /** Stores a pasted or dropped image and resolves to the URL to write. */
  uploadImage?: (file: File) => Promise<string>
  /** Maps an image URL in the markdown to one the browser can load. */
  resolveImageUrl?: (url: string) => string
  /** Milliseconds between the last keystroke and `onChange`. */
  changeDelay?: number
  className?: string
  classNames?: NoteEditorClassNames
  ref?: React.Ref<NoteEditorHandle>
}

type Modules = Awaited<ReturnType<typeof loadModules>>

/** Loaded on mount: Milkdown touches `document` and weighs what a chat should not. */
async function loadModules() {
  const [crepe, core, utils, state, view] = await Promise.all([
    import("@milkdown/crepe"),
    import("@milkdown/kit/core"),
    import("@milkdown/kit/utils"),
    import("@milkdown/kit/prose/state"),
    import("@milkdown/kit/prose/view"),
  ])
  return { crepe, core, utils, state, view }
}

type MarkState = {
  anchors: NoteEditorAnchor[]
  activeId?: string
  asking?: { from: number; to: number }
  decorations: DecorationSet
}

type MarkMeta = {
  anchors?: NoteEditorAnchor[]
  activeId?: string
  asking?: MarkState["asking"] | null
}

/** A tag on transactions that carry a value from outside, so they are not echoed. */
const EXTERNAL = "note-editor-external"

const SPARKLES_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>'

/**
 * The words a highlight is searched for: the first line of the anchor,
 * whitespace collapsed. A thread on a selection that ran across blocks is
 * still drawn, over the start of it.
 */
export function noteAnchorNeedle(text: string) {
  const first = text
    .split(/\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .find(Boolean)
  return (first ?? "").slice(0, 240)
}

function findTextRange(doc: ProseNode, text: string) {
  const needle = noteAnchorNeedle(text)
  if (!needle) return undefined
  let found: { from: number; to: number } | undefined
  doc.descendants((node, pos) => {
    if (found) return false
    if (!node.isTextblock || node.type.spec.code) return !node.isTextblock
    let haystack = ""
    const at: number[] = []
    let space = false
    node.forEach((child, offset) => {
      const start = pos + 1 + offset
      const chars = child.isText ? (child.text ?? "") : "￼"
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        if (/\s/.test(char)) {
          if (space) continue
          space = true
          haystack += " "
        } else {
          space = false
          haystack += char
        }
        at.push(start + (child.isText ? i : 0))
      }
    })
    const index = haystack.indexOf(needle)
    if (index >= 0) {
      found = { from: at[index], to: at[index + needle.length - 1] + 1 }
    }
    return false
  })
  return found
}

function buildDecorations(modules: Modules, doc: ProseNode, state: Omit<MarkState, "decorations">) {
  const { Decoration, DecorationSet } = modules.view
  const decorations = []
  for (const anchor of state.anchors) {
    const range = findTextRange(doc, anchor.text)
    if (!range) continue
    decorations.push(
      Decoration.inline(range.from, range.to, {
        class: "note-editor-anchor",
        "data-slot": "note-editor-anchor",
        "data-anchor-id": anchor.id,
        "data-state": anchor.state ?? "open",
        ...(anchor.id === state.activeId ? { "data-active": "true" } : null),
      })
    )
  }
  const asking = state.asking
  if (asking && asking.from < asking.to && asking.to <= doc.content.size) {
    decorations.push(
      Decoration.inline(asking.from, asking.to, {
        class: "note-editor-asking",
        "data-slot": "note-editor-asking",
      })
    )
  }
  return DecorationSet.create(doc, decorations)
}

function markPlugin(modules: Modules, key: PluginKey<MarkState>): Plugin<MarkState> {
  return new modules.state.Plugin<MarkState>({
    key,
    state: {
      init: (_, state) => {
        const base = { anchors: [] as NoteEditorAnchor[] }
        return { ...base, decorations: buildDecorations(modules, state.doc, base) }
      },
      apply: (tr, prev) => {
        const meta = tr.getMeta(key) as MarkMeta | undefined
        if (!meta && !tr.docChanged) return prev
        let asking = prev.asking
        if (asking && tr.docChanged) {
          asking = { from: tr.mapping.map(asking.from), to: tr.mapping.map(asking.to) }
        }
        if (meta && "asking" in meta) asking = meta.asking ?? undefined
        const next = {
          anchors: meta?.anchors ?? prev.anchors,
          activeId: meta && "activeId" in meta ? meta.activeId : prev.activeId,
          asking,
        }
        return { ...next, decorations: buildDecorations(modules, tr.doc, next) }
      },
    },
    props: {
      decorations: (state) => key.getState(state)?.decorations,
    },
  })
}

/**
 * A block's identity for diffing. Crepe stamps ids on headings that change
 * from one parse to the next, so they are left out; everything else — the
 * checked state of a task, a heading's level — is part of the block.
 */
function fingerprint(node: ProseNode) {
  return JSON.stringify(node.toJSON(), (key, value) => (key === "id" ? undefined : value))
}

/**
 * The smallest top-level replacement that turns `current` into `next`: the
 * blocks both share at the start and the end stay, so the caret, the undo
 * history and every block nobody touched survive an outside edit.
 */
function blockDiff(current: ProseNode, next: ProseNode) {
  const a = Array.from({ length: current.childCount }, (_, i) => fingerprint(current.child(i)))
  const b = Array.from({ length: next.childCount }, (_, i) => fingerprint(next.child(i)))
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }
  if (start === endA && start === endB) return undefined
  let from = 0
  for (let i = 0; i < start; i++) from += current.child(i).nodeSize
  let to = from
  for (let i = start; i < endA; i++) to += current.child(i).nodeSize
  const nodes: ProseNode[] = []
  for (let i = start; i < endB; i++) nodes.push(next.child(i))
  return { from, to, nodes }
}

/** The longest common subsequence of two key lists, as a map from a's index to b's. */
function lcsMap(a: string[], b: string[]) {
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const map = new Map<number, number>()
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      map.set(i, j)
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) i++
    else j++
  }
  return map
}

function children(node: ProseNode) {
  return Array.from({ length: node.childCount }, (_, i) => node.child(i))
}

function sameRun(a: string[], b: string[]) {
  return a.length === b.length && a.every((key, i) => key === b[i])
}

/** Where each of `small`'s keys sits in `big`, in order — or null when it is not a subsequence. */
function subsequence(small: string[], big: string[]) {
  const at: number[] = []
  let j = 0
  for (const key of small) {
    while (j < big.length && big[j] !== key) j++
    if (j === big.length) return null
    at.push(j++)
  }
  return at
}

type MergePick = ["ours" | "theirs", number]

/**
 * A run both sides changed. When one side only *added* blocks around the
 * base's, its additions are kept in place around the other side's version of
 * those blocks — the common case of an agent inserting a diagram next to a
 * paragraph the user is retyping. Otherwise ours comes first, then whatever
 * of theirs ours does not already hold.
 */
function resolveConflict(base: string[], ours: string[], theirs: string[]): MergePick[] {
  const interleave = (added: string[], kept: string[], addedSide: MergePick[0], keptSide: MergePick[0], at: number[]) => {
    const out: MergePick[] = []
    let next = 0
    for (let j = 0; j < added.length; j++) {
      if (next < base.length && at[next] === j) {
        if (kept.length === base.length) out.push([keptSide, next])
        else if (next === 0) kept.forEach((_, i) => out.push([keptSide, i]))
        next++
      } else {
        out.push([addedSide, j])
      }
    }
    return out
  }
  if (base.length) {
    const inTheirs = subsequence(base, theirs)
    if (inTheirs) return interleave(theirs, ours, "theirs", "ours", inTheirs)
    const inOurs = subsequence(base, ours)
    if (inOurs) return interleave(ours, theirs, "ours", "theirs", inOurs)
  }
  const held = new Set(ours)
  return [
    ...ours.map((_, i): MergePick => ["ours", i]),
    ...theirs.flatMap((key, i): MergePick[] => (held.has(key) ? [] : [["theirs", i]])),
  ]
}

/**
 * Folds an outside value into words the user has typed but not yet handed
 * out: a block-level three-way merge of `ours` (the editor now) and `theirs`
 * (the new value), both descended from `base` (the last value the editor
 * held). Each block takes the side that changed it; where both changed the
 * same blocks, the user's come first and the outside ones follow, so nothing
 * is lost.
 */
function mergeDocs(base: ProseNode, ours: ProseNode, theirs: ProseNode) {
  const b = children(base)
  const o = children(ours)
  const t = children(theirs)
  const bk = b.map(fingerprint)
  const ok = o.map(fingerprint)
  const tk = t.map(fingerprint)
  const toOurs = lcsMap(bk, ok)
  const toTheirs = lcsMap(bk, tk)
  const out: ProseNode[] = []
  let bi = 0
  let oi = 0
  let ti = 0
  while (true) {
    let anchor = bi
    while (anchor < b.length && !(toOurs.has(anchor) && toTheirs.has(anchor))) anchor++
    const oEnd = anchor < b.length ? toOurs.get(anchor)! : o.length
    const tEnd = anchor < b.length ? toTheirs.get(anchor)! : t.length
    const baseRun = bk.slice(bi, anchor)
    const oursRun = ok.slice(oi, oEnd)
    const theirsRun = tk.slice(ti, tEnd)
    if (sameRun(oursRun, baseRun)) out.push(...t.slice(ti, tEnd))
    else if (sameRun(theirsRun, baseRun) || sameRun(oursRun, theirsRun)) out.push(...o.slice(oi, oEnd))
    else {
      for (const [side, i] of resolveConflict(baseRun, oursRun, theirsRun)) {
        out.push(side === "ours" ? o[oi + i] : t[ti + i])
      }
    }
    if (anchor >= b.length) break
    out.push(o[oEnd])
    bi = anchor + 1
    oi = oEnd + 1
    ti = tEnd + 1
  }
  return ours.type.create(ours.attrs, out)
}

function pendingPreview(intent: string) {
  const root = document.createElement("div")
  root.className = "note-editor-pending"
  root.dataset.slot = "note-editor-pending"
  const dot = document.createElement("span")
  dot.className = "note-editor-pending-dot"
  dot.setAttribute("aria-hidden", "true")
  const label = document.createElement("span")
  label.className = "note-editor-pending-label"
  label.textContent = intent.trim() || "Writing…"
  root.append(dot, label)
  return root
}

let mermaidCount = 0

async function renderMermaid(source: string) {
  const { default: mermaid } = await import("mermaid")
  const dark = document.documentElement.classList.contains("dark")
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: dark ? "dark" : "default",
    fontFamily: "inherit",
  })
  const host = document.createElement("div")
  host.className = "note-editor-mermaid"
  host.dataset.slot = "note-editor-mermaid"
  try {
    const { svg } = await mermaid.render(`note-editor-mermaid-${++mermaidCount}`, source)
    host.innerHTML = svg
  } catch (err) {
    host.dataset.state = "error"
    host.textContent = err instanceof Error ? err.message : "Could not draw this diagram."
  }
  return host
}

function useStableCallback<A extends unknown[], R>(callback: ((...args: A) => R) | undefined) {
  const ref = React.useRef(callback)
  React.useEffect(() => {
    ref.current = callback
  })
  return React.useCallback((...args: A) => ref.current?.(...args), [])
}

type AskState = { text: string; top: number; left: number }

/**
 * A WYSIWYG markdown note built on Milkdown Crepe — headings, lists, tasks,
 * tables, images, KaTeX, code with Mermaid drawn in place — that an agent can
 * work in beside the person writing it: its edits arrive as a new `value` and
 * land as the smallest block change, threads hang on words as highlights, and
 * a selection can be handed to the agent with an instruction.
 */
export function NoteEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Write, or select text and ask the agent…",
  anchors,
  activeAnchorId,
  onAnchorClick,
  onAsk,
  askPlaceholder = "Ask the agent to change this…",
  uploadImage,
  resolveImageUrl,
  changeDelay = 300,
  className,
  classNames,
  ref,
}: NoteEditorProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const viewRef = React.useRef<EditorView | null>(null)
  const ctxRef = React.useRef<Ctx | null>(null)
  const crepeRef = React.useRef<Crepe | null>(null)
  const modulesRef = React.useRef<Modules | null>(null)
  const markKeyRef = React.useRef<PluginKey<MarkState> | null>(null)
  /** The doc as of the last value applied or emitted — what "unsaved" is measured from. */
  const syncedDocRef = React.useRef<ProseNode | null>(null)
  const lastValueRef = React.useRef(value)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  /** Set while an outside value is being dispatched, so it is not echoed. */
  const applyingRef = React.useRef(false)
  const [ready, setReady] = React.useState(false)
  const [ask, setAsk] = React.useState<AskState | null>(null)
  const [instruction, setInstruction] = React.useState("")

  const emitChange = useStableCallback(onChange)
  const emitAsk = useStableCallback(onAsk)
  const emitAnchorClick = useStableCallback(onAnchorClick)
  const upload = useStableCallback(uploadImage)
  const resolveUrl = useStableCallback(resolveImageUrl)
  const askEnabled = React.useRef(!!onAsk).current
  const hasUpload = React.useRef(!!uploadImage).current
  const hasResolver = React.useRef(!!resolveImageUrl).current
  const delayRef = React.useRef(changeDelay)
  React.useEffect(() => {
    delayRef.current = changeDelay
  }, [changeDelay])

  const serialize = React.useCallback((doc?: ProseNode) => {
    const ctx = ctxRef.current
    const view = viewRef.current
    const modules = modulesRef.current
    if (!ctx || !view || !modules) return undefined
    return ctx.get(modules.core.serializerCtx)(doc ?? view.state.doc)
  }, [])

  /** Emits what the user wrote now, skipping the debounce. */
  const flush = React.useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = undefined
    const view = viewRef.current
    if (!view || view.state.doc === syncedDocRef.current) return
    const markdown = serialize()
    if (markdown === undefined) return
    syncedDocRef.current = view.state.doc
    lastValueRef.current = markdown
    emitChange(markdown)
  }, [emitChange, serialize])

  const openAsk = React.useCallback(() => {
    const view = viewRef.current
    const root = rootRef.current
    const key = markKeyRef.current
    if (!view || !root || !key || !askEnabled) return false
    const { from, to } = view.state.selection
    if (from === to) return false
    const text = view.state.doc.textBetween(from, to, "\n\n", (leaf) => leaf.textContent || "")
    if (!text.trim()) return false
    const caret = view.coordsAtPos(to)
    const box = root.getBoundingClientRect()
    const width = Math.min(360, box.width - 16)
    setAsk({
      text,
      top: caret.bottom - box.top + 8,
      left: Math.max(8, Math.min(caret.left - box.left - 24, box.width - width - 8)),
    })
    setInstruction("")
    view.dispatch(view.state.tr.setMeta(key, { asking: { from, to } } satisfies MarkMeta))
    return true
  }, [askEnabled])

  const closeAsk = React.useCallback((refocus: boolean) => {
    setAsk(null)
    const view = viewRef.current
    const key = markKeyRef.current
    if (view && key) view.dispatch(view.state.tr.setMeta(key, { asking: null } satisfies MarkMeta))
    if (refocus) view?.focus()
  }, [])

  const flushRef = React.useRef(flush)
  React.useEffect(() => {
    flushRef.current = flush
  }, [flush])

  const openAskRef = React.useRef(openAsk)
  React.useEffect(() => {
    openAskRef.current = openAsk
  }, [openAsk])

  // Mount once: Crepe owns the DOM under `host` from here on.
  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    void (async () => {
      const modules = await loadModules()
      if (cancelled) return
      modulesRef.current = modules
      const { Crepe } = modules.crepe
      const key = new modules.state.PluginKey<MarkState>("note-editor-marks")
      markKeyRef.current = key
      const crepe = new Crepe({
        root: host,
        defaultValue: lastValueRef.current,
        featureConfigs: {
          [Crepe.Feature.Placeholder]: { text: placeholder, mode: "doc" },
          [Crepe.Feature.CodeMirror]: {
            previewOnlyByDefault: true,
            renderPreview: (language, content, apply) => {
              const lang = language.toLowerCase()
              if (lang === NOTE_PENDING_LANGUAGE) return pendingPreview(content)
              if (lang === "mermaid" && content.trim()) {
                void renderMermaid(content).then(apply)
                return undefined
              }
              return null
            },
          },
          [Crepe.Feature.ImageBlock]: {
            ...(hasUpload
              ? {
                  onUpload: (file: File) => upload(file) as Promise<string>,
                  inlineOnUpload: (file: File) => upload(file) as Promise<string>,
                  blockOnUpload: (file: File) => upload(file) as Promise<string>,
                }
              : null),
            ...(hasResolver ? { proxyDomURL: (url: string) => resolveUrl(url) ?? url } : null),
          },
          ...(askEnabled
            ? {
                [Crepe.Feature.Toolbar]: {
                  buildToolbar: (builder) => {
                    builder.addGroup("agent", "Agent").addItem("ask-agent", {
                      icon: SPARKLES_SVG,
                      label: "Ask the agent",
                      shortcut: "⌘E",
                      active: () => false,
                      onRun: () => {
                        openAskRef.current()
                      },
                    })
                  },
                },
              }
            : null),
        },
      })
      crepe.editor.use(modules.utils.$prose(() => markPlugin(modules, key)))
      crepe.editor.use(
        modules.utils.$prose(
          () =>
            new modules.state.Plugin({
              view: () => ({
                update(view, previous) {
                  if (applyingRef.current || view.state.doc.eq(previous.doc)) return
                  if (view.state.doc === syncedDocRef.current) return
                  clearTimeout(timerRef.current)
                  timerRef.current = setTimeout(flushRef.current, delayRef.current)
                },
              }),
            })
        )
      )
      await crepe.create()
      if (cancelled) {
        crepe.destroy()
        return
      }
      crepeRef.current = crepe
      crepe.editor.action((ctx) => {
        ctxRef.current = ctx
        viewRef.current = ctx.get(modules.core.editorViewCtx)
        syncedDocRef.current = viewRef.current.state.doc
      })
      setReady(true)
    })()
    return () => {
      cancelled = true
      flushRef.current()
      clearTimeout(timerRef.current)
      // Only a created editor is destroyed here; one still being created is
      // destroyed by the mount itself once `create()` settles.
      const created = crepeRef.current
      viewRef.current = null
      ctxRef.current = null
      crepeRef.current = null
      if (created) void created.destroy()
    }
    // Mounted once on purpose; later prop changes reach it through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // An outside value: applied as the smallest block change. Words the user
  // typed since the last `onChange` are merged with it rather than replaced,
  // and go out in the next `onChange`.
  React.useEffect(() => {
    const view = viewRef.current
    const ctx = ctxRef.current
    const modules = modulesRef.current
    if (!ready || !view || !ctx || !modules) return
    if (value === lastValueRef.current) return
    const parse = ctx.get(modules.core.parserCtx)
    const theirs = parse(value)
    if (!theirs) return
    const current = view.state.doc
    const dirty = current !== syncedDocRef.current
    const base = dirty ? parse(lastValueRef.current) : undefined
    const target = base ? mergeDocs(base, current, theirs) : theirs
    lastValueRef.current = value
    const change = blockDiff(current, target)
    if (change) {
      const tr = view.state.tr.replaceWith(change.from, change.to, change.nodes)
      tr.setMeta(EXTERNAL, true)
      applyingRef.current = true
      try {
        view.dispatch(tr)
      } finally {
        applyingRef.current = false
      }
    }
    if (dirty) {
      syncedDocRef.current = null
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flushRef.current, delayRef.current)
    } else {
      syncedDocRef.current = view.state.doc
    }
  }, [value, ready])

  React.useEffect(() => {
    if (ready) crepeRef.current?.setReadonly(readOnly)
  }, [ready, readOnly])

  React.useEffect(() => {
    const view = viewRef.current
    const key = markKeyRef.current
    if (!ready || !view || !key) return
    view.dispatch(
      view.state.tr.setMeta(key, { anchors: anchors ?? [], activeId: activeAnchorId } satisfies MarkMeta)
    )
  }, [ready, anchors, activeAnchorId])

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => viewRef.current?.focus(),
      getMarkdown: () => serialize(),
      ask: () => openAskRef.current(),
    }),
    [serialize]
  )

  // Captured before ProseMirror sees it: ⌘E is also Milkdown's inline-code
  // toggle, and with the ask bubble on it means "ask" alone.
  const onKeyDownCapture = (event: React.KeyboardEvent) => {
    if (!askEnabled || readOnly) return
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "e") {
      if (!(event.target as HTMLElement | null)?.closest(".ProseMirror")) return
      event.preventDefault()
      event.stopPropagation()
      openAsk()
    }
  }

  const onClick = (event: React.MouseEvent) => {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-anchor-id]")
    const id = anchor?.dataset.anchorId
    if (id) emitAnchorClick(id)
  }

  // The keyboard path to a thread: moving the caret into its words opens it,
  // the way a click on them does.
  const caretAnchorRef = React.useRef<string | undefined>(undefined)
  const onKeyUp = (event: React.KeyboardEvent) => {
    if (!(event.target as HTMLElement | null)?.closest(".ProseMirror")) return
    const node = window.getSelection()?.focusNode
    const element = node instanceof Element ? node : node?.parentElement
    const id = element?.closest<HTMLElement>("[data-anchor-id]")?.dataset.anchorId
    if (id && id !== caretAnchorRef.current) emitAnchorClick(id)
    caretAnchorRef.current = id
  }

  const submitAsk = () => {
    const text = instruction.trim()
    if (!ask || !text) return
    emitAsk({ text: ask.text, instruction: text })
    closeAsk(true)
    // The words are handed over; drop the selection so the formatting
    // toolbar stops covering the note while the agent works.
    const view = viewRef.current
    const modules = modulesRef.current
    if (view && modules) {
      const { TextSelection } = modules.state
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, view.state.selection.to)))
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="note-editor"
      data-ready={ready ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      className={cn("relative", classNames?.root, className)}
      onKeyDownCapture={onKeyDownCapture}
      onKeyUp={onKeyUp}
      onClick={onClick}
    >
      <div ref={hostRef} data-slot="note-editor-content" className={cn("note-editor", classNames?.editor)} />
      {ask ? (
        <div
          data-slot="note-editor-ask"
          role="dialog"
          aria-label="Ask the agent"
          className={cn(
            "bg-popover text-popover-foreground absolute z-20 flex w-[min(360px,calc(100%-16px))] flex-col gap-1.5 rounded-lg border p-2 shadow-md",
            classNames?.ask
          )}
          style={{ top: ask.top, left: ask.left }}
        >
          <p
            data-slot="note-editor-ask-quote"
            className={cn(
              "text-muted-foreground line-clamp-2 border-l-2 pl-2 text-[11.5px] leading-snug",
              classNames?.askQuote
            )}
          >
            {ask.text}
          </p>
          <div className="flex items-end gap-1.5">
            <Sparkles className="text-muted-foreground mb-1.5 size-3.5 shrink-0" aria-hidden />
            <textarea
              data-slot="note-editor-ask-input"
              autoFocus
              rows={1}
              value={instruction}
              placeholder={askPlaceholder}
              onChange={(event) => setInstruction(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation()
                if (event.key === "Escape") {
                  event.preventDefault()
                  closeAsk(true)
                } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  submitAsk()
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.closest("[data-slot=note-editor-ask]")?.contains(event.relatedTarget)) {
                  closeAsk(false)
                }
              }}
              className={cn(
                "placeholder:text-muted-foreground field-sizing-content max-h-32 min-h-7 flex-1 resize-none bg-transparent py-1 text-[13px] leading-snug outline-none",
                classNames?.askInput
              )}
            />
            <button
              type="button"
              data-slot="note-editor-ask-submit"
              aria-label="Send to the agent"
              disabled={!instruction.trim()}
              onClick={submitAsk}
              className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-40"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
