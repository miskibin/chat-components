import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { leadingSleepSeconds } from "@/lib/command-label"

describe("leadingSleepSeconds", () => {
  const cases: ReadonlyArray<readonly [string, number | null]> = [
    ["sleep 195", 195],
    ['sleep 195; D="C:/x"\ntail -3 "$D/status.log"', 195],
    ["sleep 30 && npm test", 30],
    ["sleep 2m", 120],
    ["sleep 1m 30s", 90],
    ["sleep 0.5", 0.5],
    ["  sleep 10\n", 10],
    ["Start-Sleep -Seconds 30; Get-Content log", 30],
    ["Start-Sleep 5", 5],
    ["start-sleep -m 1500", 1.5],
    ["sleep 5 &", null],
    ["sleep 5 | cat", null],
    ["sleep infinity", null],
    ["sleep $DELAY", null],
    ["sleep 0", null],
    ["sleep", null],
    ["npm test && sleep 30", null],
    ["sleepy 30", null],
    ["echo sleep 30", null],
  ]
  for (const [command, seconds] of cases) {
    it(JSON.stringify(command), () => {
      assert.equal(leadingSleepSeconds(command), seconds)
    })
  }
})
