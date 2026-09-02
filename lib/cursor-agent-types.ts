/**
 * Coarse phase of a run, for the status line above the answer. `connecting`
 * and `loading` are the two the UI cannot guess on its own: a local model
 * being pulled into memory looks exactly like a model that is thinking, and
 * "Thinking" for ninety seconds is the wrong thing to say.
 */
export type AgentStatusStage =
  | "connecting"
  | "loading"
  | "thinking"
  | "searching"
  | "responding"

/** What the backend reported about the turn's token spend, when it reports it. */
export type AgentTokenUsage = {
  input?: number
  output?: number
  /** Tokens per second over the generated text, when the backend measures it. */
  tokensPerSecond?: number
}

export type AgentStreamEvent =
  | { type: "session"; sessionId: string }
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  /**
   * A line of progress that is *not* part of the answer: "Loading qwen3:8b
   * into memory", "Waiting for the first token". Carries no message content —
   * consumers show the latest one while the turn is still empty and drop it
   * the moment real output arrives.
   */
  | { type: "status"; text: string; stage?: AgentStatusStage }
  | {
      type: "tool"
      id: string
      name: string
      status: "running" | "done" | "error"
      input?: string
      output?: string
      /**
       * Process exit code, for the harnesses whose shell tool reports one.
       * `status` already says whether the call succeeded; this is the extra
       * detail a consumer needs to tell "the tests ran and failed" from "the
       * tool itself broke". Only set when the backend actually publishes it —
       * absent is not zero.
       */
      exitCode?: number
    }
  | {
      type: "done"
      sessionId?: string
      durationMs?: number
      usage?: AgentTokenUsage
    }
  | { type: "error"; message: string }
