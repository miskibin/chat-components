import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = new URL("../", import.meta.url)

/** Resolves `@/lib/command-label` the way the bundler does: alias to the repo
 *  root, then the extension the specifier leaves off. */
export function resolve(specifier, context, nextResolve) {
  const target = specifier.startsWith("@/")
    ? new URL(specifier.slice(2), root)
    : specifier.startsWith(".") && context.parentURL
      ? new URL(specifier, context.parentURL)
      : null
  if (!target) return nextResolve(specifier, context)

  for (const candidate of [target.href, `${target.href}.ts`, `${target.href}/index.ts`]) {
    if (existsSync(fileURLToPath(candidate))) {
      return nextResolve(candidate, context)
    }
  }
  return nextResolve(specifier, context)
}
