import { chromium } from "playwright"

const BASE = "http://localhost:3000"

async function run() {
  const browser = await chromium.launch()

  // --- Screenshot 1: Boot mid-trace ---
  console.log(">> Capturing boot mid-trace...")
  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page1 = await ctx1.newPage()
  await page1.addInitScript(() => sessionStorage.removeItem("zvision_booted"))
  await page1.goto(BASE, { waitUntil: "domcontentloaded" })
  // Logo trace starts at 300ms and runs 800ms. Capture at 900ms = ~75% traced
  await page1.waitForTimeout(900)
  await page1.screenshot({ path: "tests/screenshots/boot-mid-trace.png", fullPage: true })
  await ctx1.close()
  console.log("   saved: tests/screenshots/boot-mid-trace.png")

  // --- Screenshot 2: Boot complete with glow ---
  console.log(">> Capturing boot complete...")
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page2 = await ctx2.newPage()
  await page2.addInitScript(() => sessionStorage.removeItem("zvision_booted"))
  await page2.goto(BASE, { waitUntil: "domcontentloaded" })
  // ~2500ms: everything visible — logo filled + glow + text + progress bar running
  await page2.waitForTimeout(2500)
  await page2.screenshot({ path: "tests/screenshots/boot-complete.png", fullPage: true })
  await ctx2.close()
  console.log("   saved: tests/screenshots/boot-complete.png")

  // --- Screenshot 3: Sidebar with new logo ---
  console.log(">> Capturing sidebar...")
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page3 = await ctx3.newPage()
  await page3.addInitScript(() => sessionStorage.setItem("zvision_booted", "true"))
  await page3.goto(BASE, { waitUntil: "networkidle" })
  await page3.waitForTimeout(2000)
  // Full page screenshot to see sidebar in context
  await page3.screenshot({
    path: "tests/screenshots/sidebar-logo.png",
    fullPage: true,
  })
  await ctx3.close()
  console.log("   saved: tests/screenshots/sidebar-logo.png")

  await browser.close()
  console.log(">> All screenshots captured!")
}

run().catch((err) => {
  console.error("Screenshot script failed:", err)
  process.exit(1)
})
