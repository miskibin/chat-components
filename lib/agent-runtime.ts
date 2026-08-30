import "server-only"

import { existsSync, readdirSync } from "fs"
import path from "path"

/**
 * Where the playground gets its events from.
 *
 * The demo drives a real local `cursor-agent` CLI when one is installed. On
 * Vercel — or any machine without the binary — there is nothing to spawn, so
 * the routes fall back to the scripted agent in `lib/mock-agent.ts`. Only
 * `fs`/`path` live here; `child_process` stays in `lib/cursor-agent.ts` so the
 * mock path never has to load it.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"])

/** `MOCK_CURSOR_AGENT=1` forces the scripted agent even when the CLI exists. */
export function isMockForced(): boolean {
  return TRUTHY.has((process.env.MOCK_CURSOR_AGENT ?? "").trim().toLowerCase())
}

let binaryCache: boolean | null = null

/** True when a `cursor-agent` binary is resolvable from PATH or the env var. */
export function hasCursorAgentBinary(): boolean {
  if (binaryCache !== null) return binaryCache
  binaryCache = detectAgentBinary()
  return binaryCache
}

export function shouldUseMockAgent(): boolean {
  return isMockForced() || !hasCursorAgentBinary()
}

export function resolveAgentCommand(): { cmd: string; args: string[] } {
  if (process.env.CURSOR_AGENT_BIN) {
    return { cmd: process.env.CURSOR_AGENT_BIN, args: [] }
  }

  if (process.platform === "win32") {
    const bundled = resolveWindowsBundle(windowsBundleRoot())
    if (bundled) return bundled
  }

  return { cmd: process.platform === "win32" ? "agent.cmd" : "agent", args: [] }
}

function detectAgentBinary(): boolean {
  try {
    if (process.env.CURSOR_AGENT_BIN) {
      return existsSync(process.env.CURSOR_AGENT_BIN)
    }
    if (process.platform === "win32") {
      if (resolveWindowsBundle(windowsBundleRoot())) return true
      return existsOnPath(["agent.cmd", "agent.exe", "agent.bat"])
    }
    return existsOnPath(["agent", "cursor-agent"])
  } catch {
    return false
  }
}

function existsOnPath(names: string[]): boolean {
  const dirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean)
  return dirs.some((dir) =>
    names.some((name) => existsSync(path.join(dir, name)))
  )
}

function windowsBundleRoot() {
  return path.join(process.env.LOCALAPPDATA ?? "", "cursor-agent")
}

function resolveWindowsBundle(
  root: string
): { cmd: string; args: string[] } | null {
  const versionsRoot = path.join(root, "versions")
  if (!existsSync(versionsRoot)) return null
  const latest = readdirSync(versionsRoot)
    .filter((name) => /^\d{4}\.\d{1,2}\.\d{1,2}/.test(name))
    .sort()
    .at(-1)
  if (!latest) return null
  const cmd = path.join(versionsRoot, latest, "node.exe")
  const entry = path.join(versionsRoot, latest, "index.js")
  if (!existsSync(cmd) || !existsSync(entry)) return null
  return { cmd, args: [entry] }
}
