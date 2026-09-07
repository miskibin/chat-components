// Adapted from T3 Code (github.com/pingdotgg/t3code), MIT License, (c) 2026 T3 Tools Inc.

/**
 * Cursor sometimes answers a turn with its own transport diagnostic where the
 * answer should be — `Error: ConnectError: [unavailable] …`, a `RetriableError`
 * dump, or the bare "Something went wrong communicating with the server."
 * sentence, each optionally followed by an indented stack. The CLI still exits
 * cleanly, so without this the failure is stored as the assistant's reply and
 * the turn is remembered as a success.
 *
 * The hard part is that an *explanation* can quote the same text: an answer
 * about retry handling may print `Error: RetriableError: …` inside a code
 * sample. So only a reply consisting of nothing *but* the dump counts, and one
 * line of anything else disqualifies the whole reply for good.
 *
 * It is fed the streamed chunks as they arrive and keeps only the current line
 * plus two booleans, so a long answer is never retained here.
 */

/** Past this, a "line" is prose that happens to lack a newline, not a dump. */
const MAX_LINE_LENGTH = 4096

const TRANSPORT_ERROR =
  /^Error: (?:RetriableError: .+|ConnectError: \[(?:unavailable|aborted|deadline_exceeded)\].*)$/

const SERVER_ERROR =
  "Something went wrong communicating with the server. Please try again."

type ReplyState = { disqualified: boolean; failure: string | undefined }

function consumeLine(state: ReplyState, line: string) {
  if (state.disqualified) return
  const text = line.trimEnd()
  if (TRANSPORT_ERROR.test(text) || text === SERVER_ERROR) {
    state.failure = text
  } else if (text.trim() !== "" && !(state.failure && /^\s+at\s/.test(text))) {
    // Blank lines are ignored, and an indented `at …` frame belongs to the
    // diagnostic above it. Anything else is real output.
    state.disqualified = true
    state.failure = undefined
  }
}

/** Tracks a standalone Cursor diagnostic without retaining an entire streamed answer. */
export class CursorTransportFailure {
  private state: ReplyState = { disqualified: false, failure: undefined }
  private line = ""

  push(text: string) {
    for (const [index, part] of text.split("\n").entries()) {
      if (this.state.disqualified) return
      if (index > 0) {
        consumeLine(this.state, this.line)
        this.line = ""
      }
      if (this.line.length + part.length > MAX_LINE_LENGTH) {
        this.state.disqualified = true
        this.state.failure = undefined
        this.line = ""
        return
      }
      this.line += part
    }
  }

  /**
   * The unfinished last line is only ever consumed into a copy: a chunk that
   * splits `Error: Conn` from `ectError: …` must not be judged half-read.
   */
  private trial(): ReplyState {
    const state = { ...this.state }
    consumeLine(state, this.line)
    return state
  }

  /** The diagnostic, when the reply so far is nothing else. */
  get failure(): string | undefined {
    return this.trial().failure
  }

  /**
   * Whether the reply could still turn out to be only a diagnostic. A consumer
   * that wants to withhold the text rather than print it holds while this is
   * true and flushes the moment it goes false — which, for an ordinary answer,
   * is its very first chunk.
   */
  get candidate(): boolean {
    return !this.trial().disqualified
  }
}
