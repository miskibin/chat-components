"use client"

import { X } from "lucide-react"
import * as React from "react"

import {
  DiffView,
  type DiffLineCommentRange,
} from "@/components/ui/diff-view"

const BEFORE = [
  "export async function commit(cwd: string, message: string) {",
  "  const staged = await run(['add', '-A'], cwd)",
  "  if (!staged.ok) return { ok: false, error: staged.stderr }",
  "",
  "  const result = await run(['commit', '-m', message], cwd)",
  "  return { ok: result.ok, sha: result.stdout.trim() }",
  "}",
].join("\n")

const AFTER = [
  "export async function commit(cwd: string, message: string) {",
  "  const branch = await currentBranch(cwd)",
  "  if (isDefaultBranch(branch)) return { ok: false, needsConfirmation: true }",
  "",
  "  const staged = await run(['add', '-A'], cwd)",
  "  if (!staged.ok) return { ok: false, error: staged.stderr }",
  "",
  "  const result = await run(['commit', '-m', message], cwd)",
  "  return { ok: result.ok, sha: result.stdout.trim() }",
  "}",
].join("\n")

type PendingComment = DiffLineCommentRange & { id: number }

/** `12`, or `12-18`. */
function label(comment: PendingComment) {
  return comment.startLine === comment.endLine
    ? `${comment.startLine}`
    : `${comment.startLine}-${comment.endLine}`
}

export function DiffViewCommentsExample() {
  const [comments, setComments] = React.useState<PendingComment[]>([])
  const nextId = React.useRef(0)

  const add = React.useCallback((range: DiffLineCommentRange) => {
    setComments((current) => [...current, { ...range, id: ++nextId.current }])
  }, [])

  const remove = React.useCallback((id: number) => {
    setComments((current) => current.filter((comment) => comment.id !== id))
  }, [])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-[320px] w-full overflow-hidden rounded-lg border">
        <DiffView
          path="lib/git-commit.ts"
          oldText={BEFORE}
          newText={AFTER}
          onLineComment={add}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Drag down the gutter to pick lines — the affordance appears over the
        selection, and what it hands back carries the text of those lines, so
        the quote survives leaving the viewer.
      </p>
      {comments.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex items-start gap-2 rounded-md border bg-muted/40 p-2"
            >
              <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground">
                {comment.path}:{label(comment)}
              </span>
              <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[11.5px] whitespace-pre">
                {comment.excerpt}
              </pre>
              <button
                type="button"
                aria-label={`Remove the comment on ${label(comment)}`}
                onClick={() => remove(comment.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
