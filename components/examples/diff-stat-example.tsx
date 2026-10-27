import { DiffStat } from "@/components/ui/diff-stat"

const FILES = [
  { path: "lib/stream.ts", additions: 42, deletions: 7 },
  { path: "tests/stream-retry.test.ts", additions: 118, deletions: 0 },
  { path: "package-lock.json", additions: 1240, deletions: 980 },
  { path: "README.md", additions: 0, deletions: 3 },
]

/**
 * Inline drops the side that is zero; aligned keeps two fixed columns so a
 * list of files lines up — and big counts stay four characters wide.
 */
export function DiffStatExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 text-[13px]">
      <p className="text-muted-foreground">
        Changed <DiffStat additions={42} deletions={7} /> in one file.
      </p>
      <ul className="flex flex-col gap-1 rounded-lg border p-3">
        {FILES.map((file) => (
          <li key={file.path} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{file.path}</span>
            <DiffStat
              layout="aligned"
              additions={file.additions}
              deletions={file.deletions}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
