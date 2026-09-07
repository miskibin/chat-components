import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  inlineCodeFileReference,
  parseMarkdownFileLink,
  splitFilePathPosition,
} from "@/lib/markdown-file-paths"

function eachPath(
  title: string,
  cases: ReadonlyArray<readonly [string, string | null]>
) {
  describe(title, () => {
    for (const [text, path] of cases) {
      it(JSON.stringify(text), () => {
        assert.equal(inlineCodeFileReference(text)?.path ?? null, path)
      })
    }
  })
}

eachPath("takes the paths an answer writes as inline code", [
  ["src/app/page.tsx", "src/app/page.tsx"],
  ["Messages.tsx", "Messages.tsx"],
  ["./scripts/build.mjs", "./scripts/build.mjs"],
  ["~/notes.txt", "~/notes.txt"],
  ["../shared/util.ts", "../shared/util.ts"],
  [".gitignore", ".gitignore"],
  ["Makefile", "Makefile"],
  ["Dockerfile", "Dockerfile"],
  ["CODEOWNERS", "CODEOWNERS"],
  ["packages/web/src", "packages/web/src"],
])

eachPath("reads Windows paths and backslashes", [
  ["C:\\repo\\app\\globals.css", "C:\\repo\\app\\globals.css"],
  ["C:\\repo\\app\\page.tsx:42", "C:\\repo\\app\\page.tsx"],
  ["\\\\share\\team\\notes.md", "\\\\share\\team\\notes.md"],
  ["app\\components\\Row.tsx", "app/components/Row.tsx"],
  ["/c:/repo/app.ts", "c:/repo/app.ts"],
])

eachPath("admits any extension behind a :line suffix", [
  ["src/main.pl:42", "src/main.pl"],
  ["main.pl:42", "main.pl"],
  ["notes.pt:3:9", "notes.pt"],
  ["build.gradle:120", "build.gradle"],
  ["scripts/deploy:12", "scripts/deploy"],
])

eachPath("refuses hostnames", [
  ["example.com", null],
  ["example.com/pricing", null],
  ["cdn.example.co/app.js", null],
  ["localhost/health", null],
  ["127.0.0.1", null],
  ["main.pl", null],
  ["example.pl/index", null],
])

eachPath("refuses routes, prose and URLs", [
  ["/app/settings", null],
  ["/chat/new", null],
  ["and/or", null],
  ["Next.js", null],
  ["https://example.com/a.ts", null],
  ["mailto:someone@example.com", null],
  ["", null],
  ["two words.ts", null],
])

eachPath("keeps POSIX roots that name a filesystem", [
  ["/Users/ada/dev/app.ts", "/Users/ada/dev/app.ts"],
  ["/etc/hosts", "/etc/hosts"],
  ["/var/log/app.log", "/var/log/app.log"],
  ["/app/settings.json", "/app/settings.json"],
  ["/chat/route.ts:12", "/chat/route.ts"],
])

describe("file: URLs", () => {
  it("reads a plain file URL", () => {
    assert.deepEqual(inlineCodeFileReference("file:///Users/ada/app.ts"), {
      path: "/Users/ada/app.ts",
    })
  })

  it("reads a UNC file URL", () => {
    assert.equal(
      inlineCodeFileReference("file://share/team/notes.md")?.path,
      "\\\\share\\team\\notes.md"
    )
  })

  it("carries the line out of a file URL anchor", () => {
    assert.deepEqual(inlineCodeFileReference("file:///tmp/app.ts#L12C3"), {
      path: "/tmp/app.ts",
      line: 12,
      column: 3,
    })
  })
})

describe("splitFilePathPosition", () => {
  it("splits a line and a column", () => {
    assert.deepEqual(splitFilePathPosition("a/b.ts:42:7"), {
      path: "a/b.ts",
      line: 42,
      column: 7,
    })
  })

  it("leaves a path with no position alone", () => {
    assert.deepEqual(splitFilePathPosition("a/b.ts"), { path: "a/b.ts" })
  })

  it("reads a #L anchor when the path carries no suffix", () => {
    assert.deepEqual(splitFilePathPosition("a/b.ts", "#L9"), {
      path: "a/b.ts",
      line: 9,
    })
  })

  it("drops a zero line", () => {
    assert.deepEqual(splitFilePathPosition("a/b.ts:0"), { path: "a/b.ts" })
  })
})

describe("parseMarkdownFileLink", () => {
  it("takes a relative destination with a position", () => {
    assert.deepEqual(parseMarkdownFileLink("src/app.ts:42"), {
      path: "src/app.ts",
      line: 42,
    })
  })

  it("refuses an http destination", () => {
    assert.equal(parseMarkdownFileLink("https://example.com/a.ts"), null)
  })

  it("refuses a bare anchor", () => {
    assert.equal(parseMarkdownFileLink("#section"), null)
  })

  it("refuses an SPA route", () => {
    assert.equal(parseMarkdownFileLink("/chat/settings"), null)
  })

  it("never lets a #L anchor alone make a route a file", () => {
    assert.equal(parseMarkdownFileLink("/chat/settings#L12"), null)
  })

  it("unwraps an angle-bracketed destination", () => {
    assert.deepEqual(parseMarkdownFileLink("<./notes.md>"), { path: "./notes.md" })
  })

  it("decodes a percent-encoded drive colon", () => {
    assert.deepEqual(parseMarkdownFileLink("/c%3A/repo/app.ts"), {
      path: "c:/repo/app.ts",
    })
  })

  it("drops a query string", () => {
    assert.deepEqual(parseMarkdownFileLink("src/app.ts?raw=1"), {
      path: "src/app.ts",
    })
  })
})
