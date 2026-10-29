import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  closePartialJson,
  formMessage,
  jsonToView,
  normalizeView,
  parseViewSpec,
  safeHref,
  toneForStatus,
  viewTextRuns,
  type ViewNode,
} from "@/lib/generative-view"

describe("parseViewSpec", () => {
  it("accepts one node or an array of them", () => {
    const one = parseViewSpec('{"type":"badge","label":"MERGED"}')
    assert.deepEqual(one, {
      ok: true,
      view: [{ type: "badge", label: "MERGED", tone: "success" }],
    })
    const many = parseViewSpec('[{"type":"divider"},"plain words"]')
    assert.equal(many.ok, true)
    assert.deepEqual(many.ok && many.view.map((node) => node.type), [
      "divider",
      "text",
    ])
  })

  it("reports invalid JSON instead of throwing", () => {
    const parsed = parseViewSpec('{"type":"card"')
    assert.equal(parsed.ok, false)
  })

  it("keeps a block it does not know as a visible marker", () => {
    const parsed = parseViewSpec('{"type":"unrecognized-block","series":[]}')
    assert.deepEqual(parsed, {
      ok: true,
      view: [{ type: "unknown", name: "unrecognized-block" }],
    })
  })

  it("normalizes a review card end to end", () => {
    const parsed = parseViewSpec(
      JSON.stringify({
        type: "card",
        title: "Fix login redirect",
        href: "https://review.example.com/c/web/+/4211",
        status: "NEW",
        children: [
          {
            type: "fields",
            items: [
              { label: "Verified", value: { type: "badge", label: "+1" } },
              { label: "Owner", value: "jan" },
            ],
          },
          {
            type: "table",
            columns: ["File", { label: "+", align: "right" }],
            rows: [["src/auth.ts", 12]],
          },
        ],
      })
    )
    assert.ok(parsed.ok)
    const card = parsed.view[0] as Extract<ViewNode, { type: "card" }>
    assert.equal(card.status?.tone, "info")
    assert.equal(card.href, "https://review.example.com/c/web/+/4211")
    const fields = card.children[0] as Extract<ViewNode, { type: "fields" }>
    assert.deepEqual(fields.items[0].value, {
      type: "badge",
      label: "+1",
      tone: "success",
    })
    const table = card.children[1] as Extract<ViewNode, { type: "table" }>
    assert.deepEqual(table.rows, [["src/auth.ts", "12"]])
    assert.equal(table.columns[1].align, "end")
  })
})

describe("safety", () => {
  it("only lets http(s) and mailto links through", () => {
    assert.equal(safeHref("https://a.example"), "https://a.example")
    assert.equal(safeHref("mailto:a@example.com"), "mailto:a@example.com")
    assert.equal(safeHref("javascript:alert(1)"), undefined)
    assert.equal(safeHref("/relative"), undefined)
  })

  it("turns a link with an unsafe href into its label", () => {
    const view = normalizeView({
      type: "link",
      label: "click",
      href: "javascript:alert(1)",
    })
    assert.deepEqual(view, [{ type: "text", text: "click", mono: false }])
  })

  it("bounds depth", () => {
    let node: Record<string, unknown> = { type: "text", text: "deep" }
    for (let i = 0; i < 20; i++) node = { type: "section", title: `${i}`, children: [node] }
    const view = normalizeView(node)
    let depth = 0
    let current: ViewNode | undefined = view[0]
    while (current && current.type === "section") {
      depth++
      current = current.children[0]
    }
    assert.ok(depth <= 9, `depth ${depth}`)
  })
})

describe("toneForStatus", () => {
  for (const [word, tone] of [
    ["MERGED", "success"],
    ["failure", "danger"],
    ["ABANDONED", "danger"],
    ["In Progress", "info"],
    ["draft", "warning"],
    ["whatever", "neutral"],
  ] as const) {
    it(word, () => assert.equal(toneForStatus(word), tone))
  }
})

describe("jsonToView", () => {
  it("ignores text and scalars", () => {
    assert.equal(jsonToView("total 3\nfoo"), undefined)
    assert.equal(jsonToView("42"), undefined)
    assert.equal(jsonToView('{"ok":true}'), undefined)
  })

  it("reads newline-delimited records and drops the stats trailer", () => {
    const lines = [
      {
        project: "web",
        number: 4211,
        subject: "Fix login redirect",
        owner: { name: "Jan Kowalski", email: "jan@example.com" },
        url: "https://review.example.com/4211",
        status: "NEW",
        lastUpdated: 1761550000,
      },
      {
        project: "web",
        number: 4198,
        subject: "Bump deps",
        owner: { name: "Ola" },
        url: "https://review.example.com/4198",
        status: "MERGED",
        lastUpdated: 1761450000,
      },
      { type: "stats", rowCount: 2, runTimeMilliseconds: 9 },
    ]
      .map((line) => JSON.stringify(line))
      .join("\n")
    const view = jsonToView(lines)
    assert.ok(view)
    const table = view[0] as Extract<ViewNode, { type: "table" }>
    assert.equal(table.type, "table")
    assert.equal(table.rows.length, 2)
    assert.deepEqual(
      table.columns.slice(0, 4).map((column) => column.label),
      ["Number", "Subject", "Status", "Owner"]
    )
    assert.deepEqual(table.rows[0][1], {
      type: "link",
      label: "Fix login redirect",
      href: "https://review.example.com/4211",
    })
    assert.deepEqual(table.rows[1][2], {
      type: "badge",
      label: "MERGED",
      tone: "success",
    })
    assert.equal(table.rows[0][3], "Jan Kowalski")
  })

  it("turns a single record into a card with its nested lists", () => {
    const view = jsonToView(
      JSON.stringify({
        key: "PROJ-12",
        summary: "Login loops",
        status: { name: "In Progress" },
        assignee: { displayName: "Ola" },
        comments: [
          { author: { displayName: "Jan" }, body: "Repro on staging" },
          { author: { displayName: "Ola" }, body: "Looking" },
        ],
      })
    )
    assert.ok(view)
    const card = view[0] as Extract<ViewNode, { type: "card" }>
    assert.equal(card.title, "PROJ-12 · Login loops")
    assert.deepEqual(card.status, {
      type: "badge",
      label: "In Progress",
      tone: "info",
    })
    assert.equal(card.children[0].type, "fields")
    assert.equal(card.children[1].type, "section")
  })

  it("unwraps a single-key wrapper", () => {
    const view = jsonToView(
      JSON.stringify({ items: [{ id: 1, name: "a" }, { id: 2, name: "b" }] })
    )
    assert.equal(view?.[0].type, "table")
  })
})

describe("closePartialJson", () => {
  const cases: [string, string | undefined][] = [
    ["", undefined],
    ["{", "{}"],
    ['{"type":"card","ti', '{"type":"card"}'],
    ['{"type":"card","title":"Fix lo', '{"type":"card","title":"Fix lo"}'],
    ['{"type":"card","title":"a","children":[{"type":"te', '{"type":"card","title":"a","children":[{"type":"te"}]}'],
    ['[{"a":1},{"b":tr', '[{"a":1},{}]'],
    ['{"a":12,', '{"a":12}'],
    ['{"a":"x\\', '{"a":"x"}'],
    ['{"a":"x\\u00', '{"a":"x"}'],
    ['{"a":[1,2', '{"a":[1]}'],
  ]
  for (const [input, expected] of cases) {
    it(JSON.stringify(input), () => {
      const closed = closePartialJson(input)
      assert.equal(closed, expected)
      if (closed) JSON.parse(closed)
    })
  }
})

describe("streaming views", () => {
  it("draws what has arrived and hides a block whose type is still typing", () => {
    const parsed = parseViewSpec(
      '[{"type":"badge","label":"MERGED"},{"type":"ca',
      { partial: true }
    )
    assert.deepEqual(parsed, {
      ok: true,
      view: [{ type: "badge", label: "MERGED", tone: "success" }],
    })
  })

  it("stays strict once the fence has closed", () => {
    assert.equal(parseViewSpec('[{"type":"badge","label":"x"}').ok, false)
  })
})

describe("actions", () => {
  it("normalizes a button, defaulting send to its label", () => {
    assert.deepEqual(normalizeView({ type: "button", label: "Approve" }), [
      { type: "button", label: "Approve", send: "Approve", tone: undefined },
    ])
  })

  it("builds the message a form sends", () => {
    const [form] = normalizeView({
      type: "form",
      submit: "Post reply",
      send: "Reply to the review comments:",
      fields: [
        { name: "vote", label: "Vote", options: ["+1", "0", "-1"] },
        { name: "msg", label: "Message", type: "textarea" },
        { name: "wip", label: "Mark WIP", type: "checkbox" },
        { name: "skip", label: "Unanswered" },
      ],
    })
    assert.equal(form.type, "form")
    if (form.type !== "form") return
    assert.equal(form.fields[0].kind, "select")
    assert.equal(
      formMessage(form, { vote: "+1", msg: "Looks good.\nShip it.", wip: false }),
      [
        "Reply to the review comments:",
        "- Vote: +1",
        "- Message:",
        "  Looks good.",
        "  Ship it.",
        "- Mark WIP: no",
      ].join("\n")
    )
  })
})

describe("viewTextRuns", () => {
  it("reads code spans, emphasis and safe links", () => {
    assert.deepEqual(viewTextRuns("run `npm test` **now**, *then* [docs](https://x.dev)"), [
      { type: "text", text: "run " },
      { type: "code", text: "npm test" },
      { type: "text", text: " " },
      { type: "strong", text: "now" },
      { type: "text", text: ", " },
      { type: "em", text: "then" },
      { type: "text", text: " " },
      { type: "link", label: "docs", href: "https://x.dev" },
    ])
  })

  it("keeps an unsafe link as its label", () => {
    assert.deepEqual(viewTextRuns("[x](javascript:alert)"), [
      { type: "text", text: "x" },
    ])
    assert.deepEqual(viewTextRuns("[x](mailto:a@b.c)"), [
      { type: "link", label: "x", href: "mailto:a@b.c" },
    ])
  })

  it("lifts cited files out of code spans and prose, first line of a list", () => {
    assert.deepEqual(
      viewTextRuns("`_closing` (src/app/expiry.py:32,48,79) see `lib/x.ts:12`."),
      [
        { type: "code", text: "_closing" },
        { type: "text", text: " (" },
        {
          type: "file",
          text: "src/app/expiry.py:32,48,79",
          path: "src/app/expiry.py",
          line: 32,
        },
        { type: "text", text: ") see " },
        { type: "file", text: "lib/x.ts:12", path: "lib/x.ts", line: 12 },
        { type: "text", text: "." },
      ]
    )
  })

  it("leaves ordinary prose and identifiers alone", () => {
    assert.deepEqual(viewTextRuns("`RunExpiry._closing`"), [
      { type: "code", text: "RunExpiry._closing" },
    ])
    for (const text of ["e.g. Node.js and/or", "snake_case_name", "a * b * c"]) {
      assert.deepEqual(viewTextRuns(text), [{ type: "text", text }])
    }
  })
})
