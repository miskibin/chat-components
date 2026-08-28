export type AgentStreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  | {
      type: "tool"
      id: string
      name: string
      status: "running" | "done" | "error"
      input?: string
      output?: string
    }
  | { type: "done"; sessionId?: string; durationMs?: number }
  | { type: "error"; message: string }
