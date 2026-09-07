import { register } from "node:module"

/**
 * Teaches `node --test` the one thing this repo's source assumes and Node
 * does not: the `@/…` path alias from tsconfig. Node ≥ 22.18 strips the types
 * itself, so the suite needs no compiler, no bundler and no dependency of its
 * own — which is why only the framework-free `lib/` modules are testable here.
 */
register("./alias-hook.mjs", import.meta.url)
