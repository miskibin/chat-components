import { readFile } from "node:fs/promises"
import path from "node:path"

/**
 * Directory is a literal so the bundler can trace it as a whole; only the file
 * name varies. Reads happen while the docs pages prerender, never at runtime.
 */
const EXAMPLES_DIR = path.join(process.cwd(), "components/examples")

const cache = new Map<string, string>()

/** Source of `components/examples/<name>.tsx`, verbatim. */
export async function readExampleSource(name: string) {
  const cached = cache.get(name)
  if (cached !== undefined) return cached
  const source = await readFile(path.join(EXAMPLES_DIR, `${name}.tsx`), "utf8")
  const trimmed = source.trimEnd()
  cache.set(name, trimmed)
  return trimmed
}
