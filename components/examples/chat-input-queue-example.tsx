"use client"

import { useEffect, useRef, useState } from "react"

import {
  ChatInput,
  type ChatInputHandle,
  type ChatInputQueuedMessage,
} from "@/components/ui/chat-input"

let nextId = 0

/**
 * With `onQueue` set, a streaming turn no longer locks the composer: Enter
 * files the message under the surface and the host drains the queue when the
 * turn ends. Editing hands a row back to the composer through the handle.
 */
export function ChatInputQueueExample() {
  const [turn, setTurn] = useState<{ id: number; text: string } | null>(null)
  const [queue, setQueue] = useState<ChatInputQueuedMessage[]>([])
  const composer = useRef<ChatInputHandle>(null)
  // The drain reads the queue as it is when the turn ends, not as it was when
  // the turn started.
  const queueRef = useRef(queue)
  useEffect(() => {
    queueRef.current = queue
  })

  useEffect(() => {
    if (!turn) return
    const timer = window.setTimeout(() => {
      const [next, ...rest] = queueRef.current
      setQueue(rest)
      setTurn(next ? { id: ++nextId, text: next.text } : null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [turn])

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 min-h-8 rounded-md border bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
        {turn ? `Answering “${turn.text}” — 4s…` : "Idle. Send something."}
      </div>
      <ChatInput
        ref={composer}
        isGenerating={!!turn}
        queue={queue}
        onSend={({ text }) => setTurn({ id: ++nextId, text })}
        onQueue={({ text, files }) =>
          setQueue((prev) => [
            ...prev,
            { id: `q-${++nextId}`, text, fileCount: files.length || undefined },
          ])
        }
        onQueueRemove={(id) =>
          setQueue((prev) => prev.filter((item) => item.id !== id))
        }
        onQueueEdit={(id) => {
          const item = queue.find((entry) => entry.id === id)
          if (!item) return
          setQueue((prev) => prev.filter((entry) => entry.id !== id))
          composer.current?.setDraft({ text: item.text })
          composer.current?.focus()
        }}
        onStop={() => setTurn(null)}
      />
    </div>
  )
}
