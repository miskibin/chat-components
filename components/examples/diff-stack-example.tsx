"use client"

import { DiffStack } from "@/components/ui/diff-view"

const FILES = [
  {
    path: "lib/artifact-store.ts",
    patch: `diff --git a/lib/artifact-store.ts b/lib/artifact-store.ts
--- a/lib/artifact-store.ts
+++ b/lib/artifact-store.ts
@@ -12,6 +12,11 @@ export async function deleteArtifact(id: string) {
   await db.artifacts.delete(id)
 }
 
+/** The rows went; the bytes did not. */
+export async function deleteArtifactFiles(id: string) {
+  await rm(join(STORE, id), { recursive: true, force: true })
+}
+
 export async function readArtifact(id: string) {
   return db.artifacts.get(id)
 }`,
  },
  {
    path: "lib/runs.ts",
    patch: `diff --git a/lib/runs.ts b/lib/runs.ts
--- a/lib/runs.ts
+++ b/lib/runs.ts
@@ -1,4 +1,5 @@
-import { deleteArtifact } from "./artifact-store"
+import { deleteArtifact, deleteArtifactFiles } from "./artifact-store"
 
 export async function settle(run: Run) {
   await deleteArtifact(run.artifactId)
+  await deleteArtifactFiles(run.artifactId)
 }`,
  },
  {
    path: "tests/artifact-store.test.ts",
    patch: `diff --git a/tests/artifact-store.test.ts b/tests/artifact-store.test.ts
--- /dev/null
+++ b/tests/artifact-store.test.ts
@@ -0,0 +1,8 @@
+import assert from "node:assert/strict"
+import { test } from "node:test"
+
+test("settling a run takes its files with it", async () => {
+  const run = await seedRun()
+  await settle(run)
+  assert.equal(existsSync(artifactPath(run.artifactId)), false)
+})`,
  },
]

/**
 * A review is one column with one scrollbar. Every file is an item in a single
 * virtualized viewer, so the wheel never stops at a boundary halfway down.
 */
export function DiffStackExample() {
  return (
    <div className="h-96 w-full overflow-hidden rounded-lg border">
      <DiffStack files={FILES} />
    </div>
  )
}
