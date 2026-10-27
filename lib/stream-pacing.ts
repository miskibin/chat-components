/**
 * Paces a streaming answer onto the screen.
 *
 * Text does not arrive the way it reads. A model's tokens are batched by its
 * server, then by the harness CLI, then by the app's own frame queue, and what
 * reaches the list is a lump of a dozen words, a pause, three words, a
 * paragraph. Painted as it lands, the answer lurches. `nextRevealLength`
 * spreads the backlog over time instead: a floor rate that reads as typing,
 * rising with the backlog so the screen is never more than `maxLagMs` behind
 * what has actually arrived — pacing that falls behind a fast stream is worse
 * than no pacing at all.
 *
 * Pure and framework-free, so the curve is testable under `node --test`.
 */

export type StreamPacing = {
  /** Characters per second when there is barely anything queued. */
  minCharsPerSecond: number
  /** The most the screen may trail the stream, at the current rate. */
  maxLagMs: number
  /**
   * Once the stream has ended, how quickly what is left drains. Short, so the
   * answer settles promptly; non-zero, so it does not land as one jump.
   */
  settleLagMs: number
}

export const DEFAULT_STREAM_PACING: StreamPacing = {
  minCharsPerSecond: 90,
  maxLagMs: 300,
  settleLagMs: 120,
}

/**
 * How many characters of `text` to show after `elapsedMs` more, given that
 * `shown` are on screen now. Never moves backwards, never passes the end, and
 * prefers to stop at the end of a word so a word is not drawn in two halves.
 */
export function nextRevealLength(
  text: string,
  shown: number,
  elapsedMs: number,
  streaming: boolean,
  pacing: StreamPacing = DEFAULT_STREAM_PACING
): number {
  const target = text.length
  if (shown >= target) return target
  const backlog = target - shown
  const lagMs = streaming ? pacing.maxLagMs : pacing.settleLagMs
  const rate = Math.max(pacing.minCharsPerSecond, (backlog * 1000) / lagMs)
  const step = Math.max(1, Math.round((rate * Math.max(0, elapsedMs)) / 1000))
  const raw = Math.min(target, shown + step)
  if (raw >= target) return target
  return keepPairs(text, wordBoundaryAfter(text, raw, target))
}

/** Never ends between the two halves of a surrogate pair (most emoji). */
function keepPairs(text: string, index: number) {
  const code = text.charCodeAt(index - 1)
  return code >= 0xd800 && code <= 0xdbff ? index + 1 : index
}

/**
 * The end of the word `index` falls in — or `index` itself when that word is
 * long enough that waiting for its end would stall the reveal.
 */
function wordBoundaryAfter(text: string, index: number, target: number) {
  const LOOKAHEAD = 16
  const limit = Math.min(target, index + LOOKAHEAD)
  for (let at = index; at < limit; at++) {
    if (isBreak(text.charCodeAt(at))) return at
  }
  return index
}

function isBreak(code: number) {
  // space, tab, newline, carriage return
  return code === 32 || code === 9 || code === 10 || code === 13
}

/**
 * Whether `next` continues `previous` — the only case worth pacing. Anything
 * else (an edit, a regenerate, a transcript swap) is shown as it is.
 */
export function isContinuation(previous: string, next: string) {
  return next.length >= previous.length && next.startsWith(previous)
}

/* -------------------------------------------------------------------------- */
/* Sentence by sentence                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The reveal the chat actually uses: a whole sentence (or line) at a time.
 *
 * Word-by-word pacing is smooth in the sense that nothing jumps, but it is
 * still a screen that changes thirty times a second, and a reader tracks a
 * moving edge instead of reading. A sentence is the unit people read in: it
 * lands whole, fades in (the component's job), and the screen is still until
 * the next one — the way T3 Code's answers settle a block at a time, one step
 * finer. A line counts as a sentence, so code, lists and tables arrive line by
 * line.
 *
 * Three guards keep it honest. A sentence that is still being written does not
 * hold the screen hostage: after `holdMs`, or once it is longer than
 * `tailChars`, its finished words show. A stream that outruns the cadence is
 * never left more than `maxLagChars` behind — past that, every complete
 * sentence goes at once. And once the stream has ended, what is left drains on
 * the faster `settleSentenceMs`.
 */
export type SentencePacing = {
  /** Least time between two sentences while streaming. */
  sentenceMs: number
  /** The same once the stream has ended and the rest is draining. */
  settleSentenceMs: number
  /** How far behind the arrived text the screen may fall before catching up. */
  maxLagChars: number
  /** How long an unfinished sentence holds the reveal before its words show. */
  holdMs: number
  /** An unfinished sentence this long shows its words without waiting. */
  tailChars: number
}

export const DEFAULT_SENTENCE_PACING: SentencePacing = {
  sentenceMs: 140,
  settleSentenceMs: 60,
  maxLagChars: 600,
  holdMs: 700,
  tailChars: 220,
}

/** `.`, `!`, `?`, `…` and their CJK forms end a sentence. */
function isTerminator(code: number) {
  return (
    code === 46 || // .
    code === 33 || // !
    code === 63 || // ?
    code === 0x2026 || // …
    code === 0x3002 || // 。
    code === 0xff01 || // ！
    code === 0xff1f // ？
  )
}

/**
 * Whether the terminator at `index` ends a sentence rather than a list marker
 * (`1. `) — a numbered item would otherwise show its number and nothing else.
 */
function endsSentence(text: string, index: number) {
  let at = index - 1
  while (at >= 0 && text.charCodeAt(at) >= 48 && text.charCodeAt(at) <= 57) at--
  if (at === index - 1) return true // no digits before it
  // Only digits back to the start of the line (after indentation): a marker.
  while (at >= 0 && (text[at] === " " || text[at] === "\t")) at--
  return !(at < 0 || text[at] === "\n")
}

/**
 * The end of the first sentence that finishes after `from` and before `limit`,
 * or -1. A terminator only counts once the character after it has arrived and
 * is whitespace — `3.` might still become `3.14`.
 */
export function nextSentenceEnd(text: string, from: number, limit = text.length): number {
  for (let at = from; at < limit; at++) {
    const code = text.charCodeAt(at)
    if (code === 10) return at + 1
    if (isTerminator(code) && at + 1 < limit && isBreak(text.charCodeAt(at + 1))) {
      if (endsSentence(text, at)) return at + 1
    }
  }
  return -1
}

/** The furthest complete sentence's end at or before `limit`, or -1. */
function lastSentenceEnd(text: string, from: number, limit: number): number {
  let found = -1
  let at = from
  for (;;) {
    const end = nextSentenceEnd(text, at, limit)
    if (end < 0) return found
    found = end
    at = end
  }
}

/** The end of the last whole word that has arrived after `from`, or -1. */
function lastWordEnd(text: string, from: number, limit: number): number {
  for (let at = limit - 1; at > from; at--) {
    if (isBreak(text.charCodeAt(at))) return at
  }
  return -1
}

/**
 * How much of `text` to show now, `sinceAdvanceMs` after the reveal last moved
 * forward, given `shown` on screen. Returns `shown` when it should hold still.
 */
export function nextSentenceReveal(
  text: string,
  shown: number,
  sinceAdvanceMs: number,
  streaming: boolean,
  pacing: SentencePacing = DEFAULT_SENTENCE_PACING
): number {
  const target = text.length
  if (shown >= target) return target
  const cadence = streaming ? pacing.sentenceMs : pacing.settleSentenceMs
  if (sinceAdvanceMs < cadence) return shown

  const next = nextSentenceEnd(text, shown)
  if (next > 0) {
    if (target - shown > pacing.maxLagChars) {
      // Far behind: everything complete, at once.
      return keepPairs(text, Math.max(next, lastSentenceEnd(text, next, target)))
    }
    return keepPairs(text, next)
  }
  // Nothing finished past what is shown. Once the stream is over, the rest is
  // all there is.
  if (!streaming) return target
  if (sinceAdvanceMs < pacing.holdMs && target - shown < pacing.tailChars) return shown
  const word = lastWordEnd(text, shown, target)
  return word > shown ? keepPairs(text, word) : shown
}
