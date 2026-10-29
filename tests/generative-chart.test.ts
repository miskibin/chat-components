import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  normalizeView,
  parseViewSpec,
  VIEW_SPEC_PROMPT,
  type ViewChart
} from "@/lib/generative-view"

const chart = (value: Record<string, unknown>) =>
  normalizeView({ type: "chart", ...value })[0] as ViewChart

describe("generative charts", () => {
  it("parses every supported kind, x keys and multiple labelled series", () => {
    for (const kind of ["line", "area", "bar", "donut"]) {
      const result = chart({
        kind,
        xKey: "day",
        series: [{ key: "a", label: "Alpha" }, "b"],
        data: [{ day: "Mon", a: 12, b: "8" }]
      })
      assert.equal(result.kind, kind)
      assert.deepEqual(result.series, [
        { key: "a", label: "Alpha" },
        { key: "b", label: "b" }
      ])
      assert.deepEqual(result.data, [{ label: "Mon", values: [12, 8] }])
    }
    assert.ok(VIEW_SPEC_PROMPT.includes("chart{kind:line|area|bar|donut"))
  })

  it("preserves missing values as gaps and never converts invalid values to zero", () => {
    const result = chart({
      series: ["v"],
      data: [
        { v: null },
        {},
        { v: "oops" },
        { v: Infinity },
        { v: 1e200 },
        { v: -4 },
        { v: 0 }
      ]
    })
    assert.deepEqual(
      result.data.map((row) => row.values[0]),
      [null, null, null, null, null, -4, 0]
    )
    assert.deepEqual(
      chart({
        kind: "donut",
        data: [{ value: -5 }, { value: 0 }, { value: 2 }]
      }).data.map((row) => row.values[0]),
      [null, 0, 2]
    )
  })

  it("caps rows and series and discards code, colors, callbacks and nested data", () => {
    const result = chart({
      kind: "javascript",
      series: ["a", "a", ...Array.from({ length: 20 }, (_, i) => `s${i}`)],
      data: Array.from({ length: 300 }, () => ({
        a: { code: "alert(1)" },
        s0: 4
      })),
      color: "red",
      onClick: "alert(1)"
    })
    assert.equal(result.kind, "line")
    assert.equal(result.series.length, 5)
    assert.equal(result.data.length, 200)
    assert.equal(result.data[0].values[0], null)
    assert.equal("color" in result, false)
    assert.equal("onClick" in result, false)
  })

  it("tolerates empty and partial streamed charts without throwing", () => {
    assert.deepEqual(chart({}).data, [])
    assert.ok(
      parseViewSpec('{"type":"chart","kind":"bar","data":[]}', {
        partial: true
      }).ok
    )
  })
})
