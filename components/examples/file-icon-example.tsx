"use client"

import { FileIcon } from "@/components/ui/file-icon"

const PATHS = [
  "components/ui/message-list.tsx",
  "lib/agent-runtime.ts",
  "scripts/build.mjs",
  "app/globals.css",
  "styles/theme.scss",
  "package.json",
  "docs/README.md",
  "server/main.py",
  "crates/agent/src/lib.rs",
  "cmd/server/main.go",
  ".github/workflows/ci.yml",
  "Dockerfile",
  ".gitignore",
  ".env.local",
  "scripts/release.sh",
  "public/logo.svg",
  "db/schema.sql",
  "next.config.ts",
]

export function FileIconExample() {
  return (
    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
      {PATHS.map((path) => (
        <div
          key={path}
          className="flex min-w-0 items-center gap-2 text-[13px] text-foreground"
        >
          <FileIcon path={path} size={15} />
          <span className="min-w-0 truncate font-mono text-[12px]" title={path}>
            {path.split("/").pop()}
          </span>
        </div>
      ))}
    </div>
  )
}
