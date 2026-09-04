import type { AgentStreamEvent } from "@/lib/cursor-agent-types"

export async function streamCursorChat(
  body: { prompt: string; model: string; sessionId?: string },
  handlers: {
    onEvent: (event: AgentStreamEvent) => void
    signal: AbortSignal
  }
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: handlers.signal,
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Cursor agent request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let pending: string[] = []
  let eventLines: string[] = []

  const consume = (text: string) => {
    const pieces = text.split("\n")
    if (pieces.length === 1) {
      if (text) pending.push(text)
      return
    }
    const lines = [pending.join("") + pieces[0], ...pieces.slice(1, -1)]
    const tail = pieces.at(-1) ?? ""
    pending = tail ? [tail] : []
    for (const raw of lines) {
      const line = raw.replace(/\r$/, "")
      if (line) {
        eventLines.push(line)
        continue
      }
      const data = eventLines
        .filter((entry) => entry.startsWith("data:"))
        .map((entry) => entry.slice(5).trimStart())
        .join("\n")
        .trim()
      eventLines = []
      if (!data || data === "[DONE]") continue
      // A frame the route never finished writing is not worth the rest of the
      // turn: skip it and keep reading. A handler that throws still escapes —
      // that is the caller's bug, and the `finally` below releases the body.
      let event: AgentStreamEvent
      try {
        event = JSON.parse(data) as AgentStreamEvent
      } catch {
        continue
      }
      handlers.onEvent(event)
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      consume(decoder.decode(value, { stream: true }))
    }
    consume(decoder.decode())
  } finally {
    // Whatever ended the loop — the stream, an abort, a throwing handler — the
    // reader stays locked to the body until it is cancelled.
    reader.cancel().catch(() => {})
  }
}
