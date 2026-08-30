import { NextResponse } from "next/server"

import { runCursorAgent, type AgentStreamEvent } from "@/lib/cursor-agent"

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
        for await (const event of runCursorAgent({
          prompt,
          model,
          sessionId: body.sessionId,
          workspace: process.cwd(),
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
