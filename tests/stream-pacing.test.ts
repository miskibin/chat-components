import assert from "node:assert/strict"
import { test } from "node:test"

import {
  DEFAULT_PHRASE_PACING,
  DEFAULT_STREAM_PACING,
  isContinuation,
  nextRevealLength,
  nextPhraseEnd,
  nextPhraseReveal,
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

const P = DEFAULT_PHRASE_PACING

test("phrases: a few words at a time, cut where the text pauses", () => {
  const text = "The retry loop backs off exponentially, so a flaky upstream gets room to recover. Then "
  assert.equal(nextPhraseReveal(text, 0, P.phraseMs - 1, true), 0)
  const one = nextPhraseReveal(text, 0, P.phraseMs, true)
  // The comma is a pause.
  assert.equal(text.slice(0, one), "The retry loop backs off exponentially,")
  const two = nextPhraseReveal(text, one, P.phraseMs, true)
  // Seven words with no pause among them: the cap.
  assert.equal(text.slice(one, two), " so a flaky upstream gets room to")
})

test("phrases: a pause ends a phrase once it has two words", () => {
  const text = "Yes, it works, mostly. And then more words follow here"
  const one = nextPhraseReveal(text, 0, P.phraseMs, true)
  assert.equal(text.slice(0, one), "Yes, it works,")
})

test("phrases: a line is a phrase — code and lists arrive line by line", () => {
  const text = "```ts\nconst a = 1\nconst b = 2\n"
  const one = nextPhraseReveal(text, 0, P.phraseMs, true)
  assert.equal(text.slice(0, one), "```ts\n")
  assert.equal(text.slice(0, nextPhraseReveal(text, one, P.phraseMs, true)), "```ts\nconst a = 1\n")
})

test("phrases: a word counts only once the space after it has arrived", () => {
  assert.equal(nextPhraseEnd("Implement", 0), -1)
  assert.equal(nextPhraseEnd("Hello there, wor", 0), "Hello there,".length)
})

test("phrases: an unfinished phrase holds, then shows its whole words", () => {
  const text = "Thinking about it"
  assert.equal(nextPhraseReveal(text, 0, P.phraseMs, true), 0)
  assert.equal(text.slice(0, nextPhraseReveal(text, 0, P.holdMs, true)), "Thinking about")
})

test("phrases: far behind, several phrases go at once", () => {
  const text = "one two three four five six seven ".repeat(30)
  const next = nextPhraseReveal(text, 0, P.phraseMs, true)
  assert.ok(text.length - next <= P.maxLagChars, `still ${text.length - next} behind`)
  assert.ok(next < text.length)
})

test("phrases: once the stream ends the rest drains, faster", () => {
  const text = "One two, three four. Five"
  assert.equal(nextPhraseReveal(text, 0, P.settleMs, true), 0)
  const one = nextPhraseReveal(text, 0, P.settleMs, false)
  assert.equal(text.slice(0, one), "One two,")
  assert.equal(nextPhraseReveal(text, "One two, three four.".length, P.settleMs, false), text.length)
})

test("phrases: never moves backwards or past the end", () => {
  const text = "Done."
  assert.equal(nextPhraseReveal(text, text.length, 10_000, true), text.length)
  assert.equal(nextPhraseReveal(text, 2, 0, false), 2)
})
