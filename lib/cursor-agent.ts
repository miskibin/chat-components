import "server-only"

import { spawn, type ChildProcess } from "child_process"
import { createHash, type Hash } from "crypto"
import { createInterface } from "readline"

import { resolveAgentCommand } from "@/lib/agent-runtime"
import type { AgentStreamEvent } from "@/lib/cursor-agent-types"

export type { AgentStreamEvent }

export type AgentRunOptions = {
  prompt: string
  model: string
  sessionId?: string
  workspace?: string
  signal?: AbortSignal
}

type CliEvent = {
  type?: string
  subtype?: string
  session_id?: string
  call_id?: string
  timestamp_ms?: number
  model_call_id?: string
  duration_ms?: number
  result?: unknown
  is_error?: boolean
  message?: {
    content?: Array<{ type?: string; text?: string }>
  }
  tool_call?: Record<string, unknown>
  text?: string
}

const MAX_FIELD = 50_000
const STDERR_TAIL_MAX = 64 * 1024

export async function* runCursorAgent(
  options: AgentRunOptions
): AsyncGenerator<AgentStreamEvent> {
  const workspace = options.workspace ?? process.cwd()
  const { cmd, args: prefix } = resolveAgentCommand()
  const args = [
    ...prefix,
    "-p",
    "--output-format",
    "stream-json",
    "--stream-partial-output",
    "--trust",
    "--force",
    "--approve-mcps",
    "--workspace",
    workspace,
    "--model",
    options.model,
  ]

  if (process.platform !== "win32") {
    args.splice(args.indexOf("--approve-mcps"), 0, "--sandbox", "enabled")
  }

  if (options.sessionId) {
    args.push("--resume", options.sessionId)
  }

  args.push("--", options.prompt)

  // The binary is resolved at runtime from PATH / CURSOR_AGENT_BIN, so there is
  // nothing for the bundler to trace. Without this hint Turbopack gives up on
  // static analysis and pulls the entire project into the serverless output.
  const child = spawn(/*turbopackIgnore: true*/ cmd, args, {
    cwd: workspace,
    env: process.env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  })

  let stderrTail = ""
  child.stderr?.on("data", (chunk: Buffer | string) => {
    stderrTail = (stderrTail + String(chunk)).slice(-STDERR_TAIL_MAX)
  })

  const onAbort = () => killAgent(child)
  options.signal?.addEventListener("abort", onAbort)

  try {
    if (!child.stdout) {
      yield { type: "error", message: "Cursor agent produced no stdout" }
      return
    }

    const rl = createInterface({ input: child.stdout })
    let emittedSession = false
    let sawStreamingDelta = false
    let gotText = false
    let gotResult = false
    // Everything that has already gone out, so a closing full-text message
    // repeating the whole turn is dropped instead of printed twice.
    const emittedHash = createHash("sha256")
    let emittedLength = 0

    for await (const line of rl) {
      if (options.signal?.aborted) break
      const trimmed = line.trim()
      if (!trimmed.startsWith("{")) continue

      let event: CliEvent
      try {
        event = JSON.parse(trimmed) as CliEvent
      } catch {
        continue
      }

      if (event.session_id && !emittedSession) {
        emittedSession = true
        yield { type: "session", sessionId: event.session_id }
      }

      if (event.type === "thinking" && typeof event.text === "string") {
        yield { type: "thinking", text: event.text }
        continue
      }

      if (event.type === "assistant") {
        const text = assistantText(event, sawStreamingDelta)
        if (typeof event.timestamp_ms === "number" && !event.model_call_id) {
          sawStreamingDelta = true
        }
        if (text && !repeatsWholeTurn(emittedHash, emittedLength, text)) {
          gotText = true
          emittedHash.update(text)
          emittedLength += text.length
          yield { type: "text", text }
        }
        continue
      }

      if (event.type === "tool_call" && event.call_id) {
        yield mapToolEvent(event)
        continue
      }

      if (event.type === "result") {
        gotResult = true
        if (event.is_error) {
          yield {
            type: "error",
            message: stringifyField(event.result) || "Cursor agent failed",
          }
        } else if (
          !gotText &&
          typeof event.result === "string" &&
          event.result
        ) {
          emittedHash.update(event.result)
          emittedLength += event.result.length
          yield { type: "text", text: event.result }
        }
        yield {
          type: "done",
          sessionId:
            typeof event.session_id === "string" ? event.session_id : undefined,
          durationMs:
            typeof event.duration_ms === "number" ? event.duration_ms : undefined,
        }
      }
    }

    const exitCode: number = await new Promise((resolve) => {
      if (child.exitCode != null) {
        resolve(child.exitCode)
        return
      }
      child.once("close", (code) => resolve(code ?? 1))
    })

    if (options.signal?.aborted) return

    if (exitCode !== 0 && !gotResult) {
      const err =
        cleanStderr(stderrTail) ||
        `agent exited with code ${exitCode}`
      yield { type: "error", message: err.slice(0, MAX_FIELD) }
    }
  } finally {
    options.signal?.removeEventListener("abort", onAbort)
    killAgent(child)
  }
}

export async function listCursorModels(): Promise<
  { id: string; name: string }[]
> {
  const { cmd, args: prefix } = resolveAgentCommand()
  // See the note in runCursorAgent(): keep this out of Turbopack's tracing.
  const child = spawn(/*turbopackIgnore: true*/ cmd, [...prefix, "models"], {
    cwd: process.cwd(),
    env: process.env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  })

  let stdout = ""
  let stderr = ""
  child.stdout?.on("data", (chunk: Buffer | string) => {
    stdout += String(chunk)
  })
  child.stderr?.on("data", (chunk: Buffer | string) => {
    stderr += String(chunk)
  })

  const code: number = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      killAgent(child)
      reject(new Error("Timed out listing Cursor models"))
    }, 20000)
    child.once("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.once("close", (exit) => {
      clearTimeout(timer)
      resolve(exit ?? 1)
    })
  })

  if (code !== 0) {
    throw new Error(stderr.trim() || `agent models failed (${code})`)
  }

  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(/^(\S+)\s+-\s+(.+)$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ id: m[1], name: m[2] }))
}

/**
 * The CLI is not consistent about how it marks the closing full-text message
 * of a streamed turn, so `assistantText`'s timestamp heuristic can let one
 * through and the UI prints the answer twice. Shape does not settle it, but
 * content does: only that closing message restates the entire turn.
 *
 * The test is whole-turn equality, never a suffix match — a delta that merely
 * ends the emitted text (a lone `"\n"`, a closing `")"`) is real output.
 */
function repeatsWholeTurn(hash: Hash, length: number, text: string) {
  if (length === 0 || text.length !== length) return false
  const candidate = createHash("sha256").update(text).digest("hex")
  return candidate === hash.copy().digest("hex")
}

function assistantText(event: CliEvent, sawStreamingDelta: boolean): string {
  const hasTimestamp = typeof event.timestamp_ms === "number"
  const hasCallId = Boolean(event.model_call_id)
  if (hasCallId) return ""
  if (sawStreamingDelta && !hasTimestamp) return ""
  return (
    event.message?.content
      ?.filter((block) => block.type === "text" && block.text)
      .map((block) => block.text as string)
      .join("") ?? ""
  )
}

function mapToolEvent(event: CliEvent): AgentStreamEvent {
  const parsed = parseToolPayload(event.tool_call)
  const running = event.subtype === "started"
  const failed = !running && isToolFailure(parsed.result)
  return {
    type: "tool",
    id: event.call_id as string,
    name: parsed.name,
    status: running ? "running" : failed ? "error" : "done",
    input: stringifyField(enrichToolArgs(parsed.args, parsed.result)),
    output: running ? undefined : formatToolResult(parsed.result),
  }
}

/**
 * Cursor's editToolCall streams `{ path, streamContent }` and only puts the
 * real unified diff on `result.success.diffString` when the call completes.
 * Fold that into args so the UI can render a diff without a wider protocol.
 */
function enrichToolArgs(args: unknown, result: unknown): unknown {
  if (!args || typeof args !== "object" || Array.isArray(args)) return args
  const record = { ...(args as Record<string, unknown>) }

  if (result && typeof result === "object") {
    const success = (result as Record<string, unknown>).success
    if (success && typeof success === "object") {
      const s = success as Record<string, unknown>
      if (typeof s.diffString === "string" && s.diffString.trim()) {
        record.diff = s.diffString
        delete record.streamContent
      }
    }
  }

  return record
}

function parseToolPayload(toolCall: Record<string, unknown> | undefined): {
  name: string
  args?: unknown
  result?: unknown
} {
  if (!toolCall || typeof toolCall !== "object") return { name: "tool" }

  const fn = toolCall.function
  if (fn && typeof fn === "object") {
    const record = fn as {
      name?: string
      arguments?: unknown
      result?: unknown
    }
    return {
      name: record.name || "function",
      args: parseMaybeJson(record.arguments),
      result: record.result,
    }
  }

  const key = Object.keys(toolCall)[0]
  if (!key) return { name: "tool" }
  const payload = toolCall[key] as { args?: unknown; result?: unknown } | undefined
  return {
    name: humanizeToolKey(key),
    args: payload?.args,
    result: payload?.result,
  }
}

function humanizeToolKey(key: string) {
  const base = key.replace(/ToolCall$/, "")
  return base
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function isToolFailure(result: unknown) {
  if (!result || typeof result !== "object") return false
  const record = result as Record<string, unknown>
  if ("success" in record) return false
  return "failure" in record || "error" in record
}

function formatToolResult(result: unknown): string | undefined {
  if (result == null) return undefined
  if (typeof result !== "object") return String(result).slice(0, MAX_FIELD)
  const record = result as Record<string, unknown>
  const success = record.success
  if (success && typeof success === "object") {
    const s = success as Record<string, unknown>
    if (typeof s.totalLines === "number") {
      const body =
        typeof s.content === "string"
          ? s.content.slice(0, MAX_FIELD - 64)
          : ""
      return body ? `${s.totalLines} lines\n${body}` : `${s.totalLines} lines`
    }
    if (typeof s.linesAdded === "number" || typeof s.linesRemoved === "number") {
      const added = typeof s.linesAdded === "number" ? s.linesAdded : 0
      const removed = typeof s.linesRemoved === "number" ? s.linesRemoved : 0
      const parts: string[] = []
      if (added > 0) parts.push(`+${added}`)
      if (removed > 0) parts.push(`−${removed}`)
      if (parts.length > 0) return parts.join(" ")
    }
    if (typeof s.linesCreated === "number") return `+${s.linesCreated}`
    if (typeof s.path === "string") {
      const size = typeof s.fileSize === "number" ? ` · ${s.fileSize} B` : ""
      return `${s.path}${size}`
    }
  }
  return stringifyField(result)
}

function cleanStderr(raw: string) {
  return raw
    .split(/\r?\n/)
    .filter((line) => !/cursor-retrieval:\s*tracing/i.test(line))
    .join("\n")
    .trim()
}

function stringifyField(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === "string") return value.slice(0, MAX_FIELD)
  try {
    return JSON.stringify(capLargeToolFields(value), null, 2).slice(
      0,
      MAX_FIELD
    )
  } catch {
    return String(value).slice(0, MAX_FIELD)
  }
}

/** Keep JSON parseable when a streamed file body would blow the field budget. */
function capLargeToolFields(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const record = { ...(value as Record<string, unknown>) }
  for (const key of [
    "streamContent",
    "fileText",
    "contents",
    "content",
    "file_text",
    "diff",
    "diffString",
    "patch",
  ]) {
    const field = record[key]
    if (typeof field === "string" && field.length > MAX_FIELD - 500) {
      record[key] = `${field.slice(0, MAX_FIELD - 500)}\n…`
    }
  }
  return record
}

function killAgent(child: ChildProcess) {
  if (child.killed || child.exitCode != null) return
  try {
    child.kill()
  } catch {
    /* already gone */
  }
}
