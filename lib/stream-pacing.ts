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
