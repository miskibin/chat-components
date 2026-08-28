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
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split("\n\n")
    buffer = chunks.pop() ?? ""
    for (const chunk of chunks) {
      const line = chunk.split("\n").find((entry) => entry.startsWith("data: "))
      if (!line) continue
      const data = line.slice(6).trim()
      if (!data || data === "[DONE]") continue
      handlers.onEvent(JSON.parse(data) as AgentStreamEvent)
    }
  }
}
