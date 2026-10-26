import assert from "node:assert/strict"
import { test } from "node:test"

import {
  DEFAULT_STREAM_PACING,
  isContinuation,
  nextRevealLength,
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
