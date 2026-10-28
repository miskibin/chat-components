// Run against a local demo with MOCK_CURSOR_AGENT=1 and Playwright installed.
import assert from "node:assert/strict"
import { pathToFileURL } from "node:url"

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH })
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await page.goto(process.env.DEMO_URL || "http://localhost:3289/demo")
  const input = page.locator('[data-slot="chat-input-textarea"]')
  await input.fill("/help")
  await input.press("Escape")
  await input.press("Enter")
  await page.getByText("Try the suggestions to explore streaming", { exact: false }).waitFor()
  await page.locator('[data-slot="chat-sidebar-panel"]').getByRole("button", { name: "New chat", exact: true }).click()
  await page.getByText("Show streaming and an interactive view").click()
  await page.locator('[data-slot="generative-view-card"]').filter({ hasText: "Stream pipeline" }).waitFor({ timeout: 30000 })
  await page.getByRole("button", { name: "Welcome chat" }).click()
  assert.equal(await page.getByText("Try the suggestions to explore streaming", { exact: false }).count(), 1)
  await page.locator('[data-slot="chat-sidebar-panel"]').getByRole("button", { name: "Search", exact: true }).click()
  await page.getByRole("textbox", { name: "Search chats" }).fill("Welcome")
  assert.equal(await page.locator('[data-slot="sidebar-item-button"]').count(), 1)
  await page.locator('[data-slot="sidebar-item-button"]').first().click({ button: "right" })
  await page.getByRole("menuitem", { name: /delete/i }).click()
  await page.getByRole("textbox", { name: "Search chats" }).clear()
  assert.equal(await page.locator('[data-slot="sidebar-item-button"]').count(), 1)
  await page.locator('[data-slot="sidebar-item-button"]').first().click({ button: "right" })
  await page.getByRole("menuitem", { name: /delete/i }).click()
  await input.fill("/help")
  await input.press("Escape")
  await input.press("Enter")
  await page.getByText("Try the suggestions to explore streaming", { exact: false }).waitFor()
  console.log("Demo smoke passed")
} finally {
  await browser.close()
}
