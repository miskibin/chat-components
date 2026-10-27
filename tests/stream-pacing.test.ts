import assert from "node:assert/strict"
import { test } from "node:test"

import {
  DEFAULT_SENTENCE_PACING,
  DEFAULT_STREAM_PACING,
  isContinuation,
  nextRevealLength,
  nextSentenceEnd,
  nextSentenceReveal,
} from "@/lib/stream-pacing"

const words = (count: number) =>
  Array.from({ length: count }, (_, i) => `word${i}`).join(" ")

test("a small backlog reveals at the floor rate, ending on a word", () => {
  const text = words(40)
  const shown = text.length - 24
  const next = nextRevealLength(text, shown, 100, true)
  // 24 chars queued is under the floor: 90 chars/s for 100ms is 9 chars, then
  // on to the end of the word it lands in.
  assert.ok(next >= shown + 9 && next <= shown + 9 + 16, `got ${next - shown}`)
  assert.ok(next === text.length || text[next] === " ", `ends mid-word at ${next}`)
})

test("a large backlog is never left more than maxLag behind", () => {
  const text = "x ".repeat(5000)
  let shown = 0
  // One frame at the catch-up rate covers 32ms of a 300ms lag budget.
  shown = nextRevealLength(text, shown, 32, true)
  const expected = Math.round((text.length * 1000) / DEFAULT_STREAM_PACING.maxLagMs * 0.032)
  assert.ok(Math.abs(shown - expected) <= 16, `got ${shown}, expected ~${expected}`)
  // ~300ms of frames drains the whole backlog.
  for (let t = 0; t < 12 && shown < text.length; t++) shown = nextRevealLength(text, shown, 32, true)
  assert.ok(text.length - shown < text.length * 0.35, `still ${text.length - shown} behind`)
})

test("after the stream ends the remainder drains faster", () => {
  const text = words(200)
  const live = nextRevealLength(text, 0, 32, true)
  const settling = nextRevealLength(text, 0, 32, false)
  assert.ok(settling > live)
})

test("never moves backwards, never passes the end", () => {
  const text = "hello world"
  assert.equal(nextRevealLength(text, text.length, 1000, true), text.length)
  assert.equal(nextRevealLength(text, 5, 0, true) >= 5, true)
  assert.equal(nextRevealLength(text, 3, 10_000, false), text.length)
})

test("a very long word is not waited on", () => {
  const text = "a" + "b".repeat(2000)
  const next = nextRevealLength(text, 0, 32, true)
  const step = Math.round(((text.length * 1000) / DEFAULT_STREAM_PACING.maxLagMs) * 0.032)
  assert.equal(next, step)
})

test("does not split a surrogate pair", () => {
  const text = "😀".repeat(40)
  for (let shown = 0; shown < text.length; ) {
    shown = nextRevealLength(text, shown, 16, true)
    const code = text.charCodeAt(shown - 1)
    assert.ok(!(code >= 0xd800 && code <= 0xdbff), `cut a pair at ${shown}`)
  }
})

test("continuation is growth from the same prefix only", () => {
  assert.equal(isContinuation("abc", "abcd"), true)
  assert.equal(isContinuation("abc", "abc"), true)
  assert.equal(isContinuation("abc", "abX"), false)
  assert.equal(isContinuation("abc", "ab"), false)
})

const P = DEFAULT_SENTENCE_PACING

test("sentences: reveals one whole sentence per step, at the cadence", () => {
  const text = "First one here. Second one! Third? Tail being writ"
  assert.equal(nextSentenceReveal(text, 0, P.sentenceMs - 1, true), 0)
  const one = nextSentenceReveal(text, 0, P.sentenceMs, true)
  assert.equal(text.slice(0, one), "First one here.")
  const two = nextSentenceReveal(text, one, P.sentenceMs, true)
  assert.equal(text.slice(0, two), "First one here. Second one!")
  const three = nextSentenceReveal(text, two, P.sentenceMs, true)
  assert.equal(text.slice(0, three), "First one here. Second one! Third?")
  // The unfinished tail waits…
  assert.equal(nextSentenceReveal(text, three, P.sentenceMs, true), three)
  // …until it has held long enough, then its finished words show.
  const words = nextSentenceReveal(text, three, P.holdMs, true)
  assert.equal(text.slice(0, words), "First one here. Second one! Third? Tail being")
})

test("sentences: a line is a sentence — code and lists arrive line by line", () => {
  const text = "```ts\nconst a = 1\nconst b = 2\n"
  const one = nextSentenceReveal(text, 0, P.sentenceMs, true)
  assert.equal(text.slice(0, one), "```ts\n")
  assert.equal(text.slice(0, nextSentenceReveal(text, one, P.sentenceMs, true)), "```ts\nconst a = 1\n")
})

test("sentences: a terminator counts only once what follows has arrived", () => {
  assert.equal(nextSentenceEnd("Pi is 3.", 0), -1)
  assert.equal(nextSentenceEnd("Pi is 3.14 ok. Next", 0), "Pi is 3.14 ok.".length)
})

test("sentences: a numbered list marker is not a sentence", () => {
  const text = "1. Install it. 2. Run"
  assert.equal(text.slice(0, nextSentenceEnd(text, 0)), "1. Install it.")
  assert.equal(nextSentenceEnd("  12. item text", 0), -1)
})

test("sentences: far behind, every complete sentence goes at once", () => {
  const text = "Short sentence here. ".repeat(60) + "tail"
  const next = nextSentenceReveal(text, 0, P.sentenceMs, true)
  assert.equal(next, text.length - "tail".length - 1)
})

test("sentences: a long unfinished sentence does not stall the screen", () => {
  const text = "word ".repeat(80)
  const next = nextSentenceReveal(text.trimEnd() + "x", 0, P.sentenceMs, true)
  assert.ok(next > 0 && next < text.length)
})

test("sentences: once the stream ends the rest drains, faster", () => {
  const text = "One. Two. Three"
  assert.equal(nextSentenceReveal(text, 0, P.settleSentenceMs, true), 0)
  const one = nextSentenceReveal(text, 0, P.settleSentenceMs, false)
  assert.equal(text.slice(0, one), "One.")
  assert.equal(nextSentenceReveal(text, "One. Two.".length, P.settleSentenceMs, false), text.length)
})

test("sentences: never moves backwards or past the end", () => {
  const text = "Done."
  assert.equal(nextSentenceReveal(text, text.length, 10_000, true), text.length)
  assert.equal(nextSentenceReveal(text, 2, 0, false), 2)
})
