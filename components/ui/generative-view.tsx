"use client"

import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DiffStat } from "@/components/ui/diff-stat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  parseViewSpec,
  type ViewInline,
  type ViewItem,
  type ViewNode,
  type ViewSpec,
  type ViewTone,
} from "@/lib/generative-view"
import { cn } from "@/lib/utils"

export type GenerativeViewSlot =
  | "root"
  | "card"
  | "section"
  | "table"
  | "fields"
  | "list"
  | "timeline"
  | "stats"
  | "badge"

/**
 * Tones are the one raw-palette exception, the same one the diff counts and
 * the status dots make: no theme token means "passed" or "needs attention".
 * Info and danger stay on `primary` and `destructive`; both others ship a
 * dark variant.
 */
const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 text-[11px] leading-none font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        info: "border-primary/20 bg-primary/10 text-primary",
        success:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning:
          "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        danger: "border-destructive/25 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

const TONE_TEXT: Record<ViewTone, string> = {
  neutral: "text-muted-foreground",
  info: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
}

const TONE_FILL: Record<ViewTone, string> = {
  neutral: "bg-muted-foreground/50",
  info: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
}

const linkClassName =
  "rounded-sm text-primary underline-offset-2 transition-colors hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"

type ClassNames = Partial<Record<GenerativeViewSlot, string>>

/**
 * Per-part class overrides reach nested blocks through context rather than
 * being threaded through every level of the tree.
 */
const ClassNamesContext = React.createContext<ClassNames>({})

function useSlotClass(slot: GenerativeViewSlot) {
  return React.useContext(ClassNamesContext)[slot]
}

/* ------------------------------------------------------------- inlines -- */

function ViewBadge({ label, tone }: { label: string; tone: ViewTone }) {
  return (
    <span
      data-slot="generative-view-badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), useSlotClass("badge"))}
    >
      {label}
    </span>
  )
}

function ViewLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      data-slot="generative-view-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      className={linkClassName}
    >
      {label}
    </a>
  )
}

function Inline({ value }: { value: ViewInline }) {
  if (typeof value === "string") return <>{value}</>
  if (value.type === "badge") return <ViewBadge label={value.label} tone={value.tone} />
  return <ViewLink label={value.label} href={value.href} />
}

function ItemTitle({ item }: { item: ViewItem }) {
  return item.href ? (
    <ViewLink label={item.title} href={item.href} />
  ) : (
    <span>{item.title}</span>
  )
}

/* -------------------------------------------------------------- blocks -- */

function Card({ node }: { node: Extract<ViewNode, { type: "card" }> }) {
  const slotClass = useSlotClass("card")
  const hasHeader = !!(node.title || node.subtitle || node.status)
  return (
    <section
      data-slot="generative-view-card"
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground",
        slotClass
      )}
    >
      {hasHeader ? (
        <header
          data-slot="generative-view-card-header"
          className={cn(
            "flex items-start gap-2 px-3 py-2",
            node.children.length > 0 && "border-b"
          )}
        >
          <div className="min-w-0 flex-1">
            {node.title ? (
              <div className="text-[13px] leading-snug font-medium break-words">
                {node.href ? (
                  <ViewLink label={node.title} href={node.href} />
                ) : (
                  node.title
                )}
              </div>
            ) : null}
            {node.subtitle ? (
              <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                {node.subtitle}
              </div>
            ) : null}
          </div>
          {node.status ? (
            <ViewBadge label={node.status.label} tone={node.status.tone} />
          ) : null}
        </header>
      ) : null}
      {node.children.length > 0 ? (
        <div data-slot="generative-view-card-body" className="space-y-2.5 px-3 py-2.5">
          <Nodes nodes={node.children} />
        </div>
      ) : null}
    </section>
  )
}

function Section({ node }: { node: Extract<ViewNode, { type: "section" }> }) {
  const slotClass = useSlotClass("section")
  const [open, setOpen] = React.useState(!node.collapsed)
  if (!node.title) {
    return (
      <div data-slot="generative-view-section" className={cn("space-y-2", slotClass)}>
        <Nodes nodes={node.children} />
      </div>
    )
  }
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="generative-view-section"
      data-state={open ? "open" : "closed"}
      className={cn("min-w-0", slotClass)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          data-slot="generative-view-section-trigger"
          className="-mx-1 flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-150",
              !open && "-rotate-90"
            )}
          />
          {node.title}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-1.5">
        <Nodes nodes={node.children} />
      </CollapsibleContent>
    </Collapsible>
  )
}

function ViewTabs({ node }: { node: Extract<ViewNode, { type: "tabs" }> }) {
  return (
    <Tabs
      defaultValue="0"
      data-slot="generative-view-tabs"
      className="min-w-0 gap-2"
    >
      <TabsList className="h-7 max-w-full overflow-x-auto">
        {node.items.map((item, index) => (
          <TabsTrigger
            key={index}
            value={String(index)}
            className="px-2 py-0.5 text-[12px]"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {node.items.map((item, index) => (
        <TabsContent key={index} value={String(index)} className="space-y-2">
          <Nodes nodes={item.children} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function Fields({ node }: { node: Extract<ViewNode, { type: "fields" }> }) {
  return (
    <dl
      data-slot="generative-view-fields"
      className={cn(
        "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-[12.5px] leading-relaxed",
        useSlotClass("fields")
      )}
    >
      {node.items.map((item, index) => (
        <React.Fragment key={index}>
          <dt className="truncate text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 break-words">
            <Inline value={item.value} />
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

/** Rows shown before "Show all" — a long query result should not bury the answer. */
const TABLE_PREVIEW_ROWS = 15

function Table({ node }: { node: Extract<ViewNode, { type: "table" }> }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasHeader = node.columns.some((column) => column.label)
  const capped = !expanded && node.rows.length > TABLE_PREVIEW_ROWS
  const rows = capped ? node.rows.slice(0, TABLE_PREVIEW_ROWS) : node.rows
  return (
    <div
      data-slot="generative-view-table"
      className={cn(
        "min-w-0 overflow-hidden rounded-md border",
        useSlotClass("table")
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          {hasHeader ? (
            <thead className="bg-muted/40 text-[11.5px] text-muted-foreground">
              <tr>
                {node.columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      "px-2 py-1 font-medium whitespace-nowrap",
                      column.align === "end" ? "text-right" : "text-left"
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn((hasHeader || rowIndex > 0) && "border-t")}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-2 py-1 align-top",
                      node.columns[cellIndex]?.align === "end"
                        ? "text-right tabular-nums"
                        : "text-left",
                      cellIndex === 0 && "max-w-[28rem]"
                    )}
                  >
                    <Inline value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {capped ? (
        <button
          type="button"
          data-slot="generative-view-table-more"
          onClick={() => setExpanded(true)}
          className="w-full cursor-pointer border-t px-2 py-1 text-left text-[11.5px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
        >
          Show all {node.rows.length} rows
        </button>
      ) : null}
    </div>
  )
}

function List({ node }: { node: Extract<ViewNode, { type: "list" }> }) {
  return (
    <ul
      data-slot="generative-view-list"
      className={cn("space-y-1 text-[12.5px] leading-relaxed", useSlotClass("list"))}
    >
      {node.items.map((item, index) => (
        <li
          key={index}
          data-tone={item.tone}
          className="flex min-w-0 items-start gap-2"
        >
          <span
            aria-hidden
            className={cn(
              "mt-[0.55em] size-1.5 shrink-0 rounded-full",
              TONE_FILL[item.tone ?? "neutral"]
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="min-w-0 flex-1 break-words">
                <ItemTitle item={item} />
              </span>
              {item.meta ? (
                <span className="shrink-0 text-[11.5px] text-muted-foreground">
                  {item.meta}
                </span>
              ) : null}
            </div>
            {item.body ? (
              <p className="text-[12px] whitespace-pre-wrap text-muted-foreground">
                {item.body}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function Timeline({ node }: { node: Extract<ViewNode, { type: "timeline" }> }) {
  return (
    <ol
      data-slot="generative-view-timeline"
      className={cn(
        "relative ml-1 space-y-2.5 border-l pl-4 text-[12.5px] leading-relaxed",
        useSlotClass("timeline")
      )}
    >
      {node.items.map((item, index) => (
        <li key={index} data-tone={item.tone} className="relative min-w-0">
          <span
            aria-hidden
            className={cn(
              "absolute top-[0.45em] -left-[calc(1rem+4.5px)] size-2 rounded-full ring-2 ring-card",
              TONE_FILL[item.tone ?? "neutral"]
            )}
          />
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 flex-1 font-medium break-words">
              <ItemTitle item={item} />
            </span>
            {item.meta ? (
              <span className="shrink-0 text-[11.5px] text-muted-foreground">
                {item.meta}
              </span>
            ) : null}
          </div>
          {item.body ? (
            <p className="mt-0.5 text-[12px] whitespace-pre-wrap text-muted-foreground">
              {item.body}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

function Stats({ node }: { node: Extract<ViewNode, { type: "stats" }> }) {
  return (
    <div
      data-slot="generative-view-stats"
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2",
        useSlotClass("stats")
      )}
    >
      {node.items.map((item, index) => (
        <div
          key={index}
          data-slot="generative-view-stat"
          data-tone={item.tone}
          className="min-w-0 rounded-md border px-2.5 py-1.5"
        >
          <div className="truncate text-[11px] text-muted-foreground">
            {item.label}
          </div>
          <div
            className={cn(
              "truncate text-[13.5px] font-semibold tabular-nums",
              item.tone && item.tone !== "neutral" && TONE_TEXT[item.tone]
            )}
          >
            {item.value}
          </div>
          {item.hint ? (
            <div className="truncate text-[11px] text-muted-foreground">
              {item.hint}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function Progress({ node }: { node: Extract<ViewNode, { type: "progress" }> }) {
  const percent = Math.round((node.value / node.max) * 100)
  return (
    <div data-slot="generative-view-progress" data-tone={node.tone} className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[12px]">
        <span className="truncate text-muted-foreground">{node.label}</span>
        <span className="shrink-0 tabular-nums">
          {node.max === 100 ? `${percent}%` : `${node.value} / ${node.max}`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={node.label}
        aria-valuemin={0}
        aria-valuemax={node.max}
        aria-valuenow={node.value}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full", TONE_FILL[node.tone ?? "info"])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function Block({ node }: { node: ViewNode }) {
  switch (node.type) {
    case "card":
      return <Card node={node} />
    case "section":
      return <Section node={node} />
    case "row":
      return (
        <div
          data-slot="generative-view-row"
          className="flex min-w-0 flex-wrap gap-2 *:min-w-[10rem] *:flex-1"
        >
          <Nodes nodes={node.children} />
        </div>
      )
    case "tabs":
      return <ViewTabs node={node} />
    case "text":
      return (
        <p
          data-slot="generative-view-text"
          data-tone={node.tone}
          className={cn(
            "text-[13px] leading-relaxed break-words whitespace-pre-wrap",
            node.mono && "font-mono text-[12px]",
            node.tone && TONE_TEXT[node.tone]
          )}
        >
          {node.text}
        </p>
      )
    case "badge":
      return (
        <div>
          <ViewBadge label={node.label} tone={node.tone} />
        </div>
      )
    case "link":
      return (
        <div className="text-[13px]">
          <ViewLink label={node.label} href={node.href} />
        </div>
      )
    case "divider":
      return <hr data-slot="generative-view-divider" className="border-border" />
    case "fields":
      return <Fields node={node} />
    case "table":
      return <Table node={node} />
    case "list":
      return <List node={node} />
    case "timeline":
      return <Timeline node={node} />
    case "stats":
      return <Stats node={node} />
    case "progress":
      return <Progress node={node} />
    case "code":
      return (
        <pre
          data-slot="generative-view-code"
          data-lang={node.lang}
          className="m-0 max-h-80 overflow-auto rounded-md border bg-muted/30 px-2 py-1.5 font-mono text-[12px] leading-relaxed whitespace-pre"
        >
          {node.code}
        </pre>
      )
    case "diffstat":
      return (
        <div>
          <DiffStat additions={node.added} deletions={node.removed} />
        </div>
      )
    case "unknown":
      return (
        <div
          data-slot="generative-view-unknown"
          className="rounded-md border border-dashed px-2 py-1 text-[11.5px] text-muted-foreground"
        >
          Unsupported block “{node.name}”
        </div>
      )
  }
}

function Nodes({ nodes }: { nodes: ViewNode[] }) {
  return nodes.map((node, index) => <Block key={index} node={node} />)
}

/* ---------------------------------------------------------------- public -- */

export type GenerativeViewProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Normalized blocks — from `parseViewSpec`, `normalizeView` or `jsonToView`. */
  view: ViewSpec
  /** Per-part overrides, applied to every block of that kind in the tree. */
  classNames?: ClassNames
}

/**
 * Draws a view: a closed vocabulary of display blocks (cards, fields, tables,
 * lists, timelines, stats, progress, tabs…) that an agent composed, or that
 * `jsonToView` read off a tool's JSON. The spec is data — there is nothing in
 * it that can run — so it is safe to render straight from a model's answer.
 *
 * Memoized on `view`: keep the array stable and a streaming list never
 * re-renders it.
 */
export const GenerativeView = React.memo(function GenerativeView({
  view,
  classNames,
  className,
  ...props
}: GenerativeViewProps) {
  const context = React.useMemo(() => classNames ?? {}, [classNames])
  return (
    <ClassNamesContext.Provider value={context}>
      <div
        data-slot="generative-view"
        className={cn(
          "min-w-0 space-y-2.5 text-foreground",
          classNames?.root,
          className
        )}
        {...props}
      >
        <Nodes nodes={view} />
      </div>
    </ClassNamesContext.Provider>
  )
})

export type GenerativeViewBlockProps = {
  /** The fence's body: JSON for one node or an array of them. */
  code: string
  /** The fence is still streaming in. */
  isIncomplete?: boolean
  className?: string
}

/**
 * A view written into an answer as a ` ```ui ` fence. While the fence is
 * still arriving its JSON is unfinished, so the block holds a placeholder
 * rather than flashing a parse error on every token; once it closes, JSON that
 * still does not parse shows the reason above its own source.
 */
export const GenerativeViewBlock = React.memo(function GenerativeViewBlock({
  code,
  isIncomplete = false,
  className,
}: GenerativeViewBlockProps) {
  const parsed = React.useMemo(() => parseViewSpec(code), [code])
  if (parsed.ok) {
    return (
      <GenerativeView
        view={parsed.view}
        data-state={isIncomplete ? "streaming" : "done"}
        className={cn("my-3", className)}
      />
    )
  }
  if (isIncomplete) {
    return (
      <div
        data-slot="generative-view-pending"
        role="status"
        className={cn(
          "my-3 rounded-lg border border-dashed px-3 py-2 text-[12px] text-muted-foreground motion-safe:animate-pulse",
          className
        )}
      >
        Building view…
      </div>
    )
  }
  return (
    <div
      data-slot="generative-view-error"
      className={cn("my-3 overflow-hidden rounded-md border", className)}
    >
      <div className="border-b bg-muted/40 px-2 py-1 text-[11.5px] text-muted-foreground">
        Couldn’t draw this view: {parsed.error}
      </div>
      <pre className="m-0 max-h-60 overflow-auto px-2 py-1.5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
})
