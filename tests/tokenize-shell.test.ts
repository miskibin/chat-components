import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { tokenizeShell } from "@/lib/command-label"

const kinds = (command: string) =>
  tokenizeShell(command)
    .filter((token) => token.text.trim())
    .map((token) => `${token.kind}:${token.text.trim()}`)

describe("tokenizeShell", () => {
  it("round-trips every input", () => {
    for (const command of [
      'sleep 195; D="C:/x"\ntail -3 "$D/status.log"',
      "grep -E 'a|b' file | sed 's/^\\[[^]]*\\] //' | tail -15",
      "echo \"unterminated",
      "FOO=1 BAR=${X:-y} npm test -- --watch 2>&1 >> log &",
      "# just a comment\nls",
      "a\\ b $(git rev-parse HEAD) `date`",
      "",
    ]) {
      assert.equal(tokenizeShell(command).map((t) => t.text).join(""), command)
    }
  })
  it("names programs, flags, strings and operators", () => {
    assert.deepEqual(kinds('sleep 195; tail -3 "$D/status.log"'), [
      "program:sleep",
      "text:195",
      "operator:;",
      "program:tail",
      "flag:-3",
      'string:"$D/status.log"',
    ])
    assert.deepEqual(kinds("FOO=1 npm test 2>&1 | grep -v x # done"), [
      "variable:FOO=1",
      "program:npm",
      "text:test",
      "operator:2>&1",
      "operator:|",
      "program:grep",
      "flag:-v",
      "text:x",
      "comment:# done",
    ])
  })
  it("starts a new command after a newline", () => {
    assert.deepEqual(kinds("cd x\nnpm ci"), [
      "program:cd",
      "text:x",
      "program:npm",
      "text:ci",
    ])
  })
  it("does not treat a hyphen inside a word as a flag", () => {
    assert.deepEqual(kinds("rm a-b"), ["program:rm", "text:a-b"])
  })
  it("gives up on huge input", () => {
    assert.equal(tokenizeShell("x".repeat(9000)).length, 1)
  })
})
