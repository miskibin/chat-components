import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  promptHistoryEntries,
  stepPromptHistory,
  type PromptHistoryPosition,
} from "@/lib/prompt-history"

const messages = [
  { id: "a", text: "first" },
  { id: "b", text: "  " },
  { id: "c", text: "second" },
  { id: "d", text: "second" },
  { id: "e", text: "third" },
]

describe("promptHistoryEntries", () => {
  it("drops blank sends and collapses consecutive duplicates", () => {
    assert.deepEqual(promptHistoryEntries(messages), [
      { id: "a", prompt: "first" },
      { id: "d", prompt: "second" },
      { id: "e", prompt: "third" },
    ])
  })

  it("trims what it stores", () => {
    assert.deepEqual(promptHistoryEntries([{ id: "a", text: " hi \n" }]), [
      { id: "a", prompt: "hi" },
    ])
  })
})

describe("stepPromptHistory", () => {
  const entries = promptHistoryEntries(messages)
  const back = (position: PromptHistoryPosition | null, currentPrompt: string) =>
    stepPromptHistory({ direction: "backward", entries, position, currentPrompt })
  const forward = (
    position: PromptHistoryPosition | null,
    currentPrompt: string
  ) => stepPromptHistory({ direction: "forward", entries, position, currentPrompt })

  it("starts at the newest entry from an empty composer", () => {
    assert.deepEqual(back(null, ""), {
      position: { entryId: "e", recalled: "third" },
      prompt: "third",
    })
  })

  it("refuses to start browsing over a typed draft", () => {
    assert.equal(back(null, "half a thought"), null)
  })

  it("walks back and stops at the oldest entry", () => {
    const second = back({ entryId: "e", recalled: "third" }, "third")
    assert.deepEqual(second, {
      position: { entryId: "d", recalled: "second" },
      prompt: "second",
    })
    const oldest = back({ entryId: "a", recalled: "first" }, "first")
    assert.equal(oldest, null)
  })

  it("empties the composer one step past the newest", () => {
    assert.deepEqual(forward({ entryId: "e", recalled: "third" }, "third"), {
      position: null,
      prompt: "",
    })
  })

  it("falls through forward when nothing is being recalled", () => {
    assert.equal(forward(null, ""), null)
  })

  it("resolves a retired id by its text", () => {
    assert.deepEqual(back({ entryId: "c", recalled: "second" }, "second"), {
      position: { entryId: "a", recalled: "first" },
      prompt: "first",
    })
  })

  it("ends browsing once the recalled text was edited", () => {
    assert.equal(back({ entryId: "e", recalled: "third" }, "third!"), null)
    assert.equal(forward({ entryId: "e", recalled: "third" }, "third!"), null)
  })
})
