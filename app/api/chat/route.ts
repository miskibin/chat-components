import { NextResponse } from "next/server"

import { shouldUseMockAgent } from "@/lib/agent-runtime"
import type { AgentStreamEvent } from "@/lib/cursor-agent-types"
import { isAskDemoPrompt, runMockAgent } from "@/lib/mock-agent"

export const runtime = "nodejs"
// Vercel hobby plan caps serverless maxDuration at 60s
export const maxDuration = 60
export const dynamic = "force-dynamic"

type ChatBody = {
  prompt?: string
  model?: string
  sessionId?: string
}

export async function POST(req: Request) {
  let body: ChatBody
  try {
    body = (await req.json()) as ChatBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }

  const model = body.model?.trim() || "composer-2.5"
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
      try {
        for await (const event of agentStream({
          prompt,
          model,
          sessionId: body.sessionId,
          signal: req.signal,
        })) {
          send(event)
        }
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Cursor agent failed",
        })
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

/**
 * Real CLI when one is installed, scripted agent otherwise. `lib/cursor-agent`
 * is imported lazily so the mock path never pulls in `child_process`.
 */
async function* agentStream(options: {
  prompt: string
  model: string
  sessionId?: string
  signal: AbortSignal
}): AsyncGenerator<AgentStreamEvent> {
  if (shouldUseMockAgent() || isAskDemoPrompt(options.prompt)) {
    yield* runMockAgent(options)
    return
  }

  const { runCursorAgent } = await import("@/lib/cursor-agent")
  yield* runCursorAgent({ ...options, workspace: process.cwd() })
}
