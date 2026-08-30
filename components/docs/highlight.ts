import type { BundledLanguage, Highlighter } from "shiki"

const THEMES = { light: "github-light", dark: "github-dark" } as const

const LANGS = [
  "tsx",
  "ts",
  "jsx",
  "js",
  "json",
  "css",
  "bash",
  "diff",
] as const satisfies readonly BundledLanguage[]

export type DocsLang = (typeof LANGS)[number]

/**
 * One highlighter per build process. Every docs page renders at build time, so
 * the WASM engine is loaded once and every snippet reuses it.
 */
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighterPromise ??= import("shiki").then(({ createHighlighter }) =>
    createHighlighter({ themes: [THEMES.light, THEMES.dark], langs: [...LANGS] })
  )
  return highlighterPromise
}

function normalizeLang(lang: string): DocsLang {
  const value = lang.toLowerCase().trim()
  if (value === "typescript") return "ts"
  if (value === "javascript") return "js"
  if (value === "shell" || value === "sh" || value === "zsh") return "bash"
  return (LANGS as readonly string[]).includes(value)
    ? (value as DocsLang)
    : "tsx"
}

/**
 * Dual-theme HTML: light colors are inline, dark colors ride along in a
 * `--shiki-dark` custom property that `.dark` swaps in (see `globals.css`).
 */
export async function highlightCode(code: string, lang = "tsx") {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code.trimEnd(), {
    lang: normalizeLang(lang),
    themes: THEMES,
    defaultColor: "light",
  })
}
