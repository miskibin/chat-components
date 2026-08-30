import { NextResponse } from "next/server"

import { shouldUseMockAgent } from "@/lib/agent-runtime"
import { MOCK_MODELS } from "@/lib/mock-agent"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const HEADLINE_IDS = [
  "auto",
  "composer-2.5",
  "cursor-grok-4.6-high",
  "gpt-5.6-sol-high",
  "claude-opus-5-thinking-high",
  "claude-sonnet-5-thinking-high",
  "gemini-3.7-flash-high",
  "gpt-5.5-high",
]

let cache: { at: number; models: { id: string; name: string; badge?: string }[] } | null =
  null
const CACHE_MS = 5 * 60 * 1000

export async function GET() {
  // No CLI to ask (Vercel, a fresh clone, or MOCK_CURSOR_AGENT=1): serve the
  // static list so the ModelPicker still renders, and tell the demo it is
  // talking to the scripted agent.
  if (shouldUseMockAgent()) {
    return NextResponse.json({ models: MOCK_MODELS, mock: true })
  }

  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json({ models: cache.models })
    }

    const { listCursorModels } = await import("@/lib/cursor-agent")
    const listed = await listCursorModels()
    const byId = new Map(listed.map((m) => [m.id, m]))
    const headline = HEADLINE_IDS.filter((id) => byId.has(id)).map((id) => {
      const item = byId.get(id)!
      return {
        id: item.id,
        name: item.name.replace(/\s*\(.*?\)\s*/g, "").trim() || item.name,
        badge: badgeFor(item.id),
      }
    })

    const models =
      headline.length > 0
        ? headline
        : listed.slice(0, 10).map((item) => ({
            id: item.id,
            name: item.name,
            badge: badgeFor(item.id),
          }))

    cache = { at: Date.now(), models }
    return NextResponse.json({ models })
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to list models",
        models: [
          { id: "composer-2.5", name: "Composer 2.5", badge: "Cursor" },
          { id: "auto", name: "Auto", badge: "Router" },
        ],
      },
      { status: 200 }
    )
  }
}

function badgeFor(id: string) {
  if (id === "auto") return "Router"
  if (id.startsWith("composer")) return "Cursor"
  if (id.startsWith("cursor-grok") || id.includes("grok")) return "Grok"
  if (id.startsWith("claude")) return "Anthropic"
  if (id.startsWith("gpt") || id.startsWith("codex")) return "OpenAI"
  if (id.startsWith("gemini")) return "Google"
  return undefined
}
