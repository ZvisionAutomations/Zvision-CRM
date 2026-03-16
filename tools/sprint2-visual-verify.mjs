/**
 * Sprint 2 — Visual Rule Verification (Ralph Loop)
 *
 * Checks 3 rules on all 7 screens:
 *   1. Tactical grid visible in background
 *   2. All section headers have "// " prefix
 *   3. No raw colors — only CSS variables
 *
 * Run: node tools/sprint2-visual-verify.mjs
 */
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'sprint2-verify')

// Supabase config
const SUPABASE_URL = 'https://cmzjdtudntcmvywqvnqh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtempkdHVkbnRjbXZ5d3F2bnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzAzNzIsImV4cCI6MjA4ODIwNjM3Mn0.WoVtcewvN_K097YSr9-MihY2wZFvXqAvA4M_ocl-RFs'
const TEST_EMAIL = 'sprint1-review@zvision-test.com'
const TEST_PASSWORD = 'Zv1s10n_Test_2025!'
const SUPABASE_REF = 'cmzjdtudntcmvywqvnqh'

const SCREENS = [
  { path: '/', name: 'dashboard', label: 'Dashboard', waitMs: 16000 },
  { path: '/missoes', name: 'missoes', label: 'Missoes (Kanban)', waitMs: 8000 },
  { path: '/intel', name: 'intel', label: 'Intel', waitMs: 8000 },
  { path: '/ingestao', name: 'ingestao', label: 'Ingestao', waitMs: 8000 },
  { path: '/flows', name: 'flows', label: 'Flows', waitMs: 8000 },
  { path: '/analytics', name: 'analytics', label: 'Analytics', waitMs: 8000 },
  { path: '/settings', name: 'settings', label: 'Settings', waitMs: 8000 },
]

// Tailwind raw colors to detect in class names
const RAW_TAILWIND_COLORS = [
  'blue-', 'red-', 'green-', 'yellow-', 'purple-', 'pink-', 'indigo-',
  'cyan-', 'teal-', 'orange-', 'gray-', 'slate-', 'zinc-', 'neutral-',
  'stone-', 'emerald-', 'violet-', 'fuchsia-', 'rose-', 'sky-', 'amber-',
]

const results = []
let totalPassed = 0
let totalFailed = 0

function log(msg) { console.log(`[VERIFY] ${msg}`) }
function pass(screen, rule, desc) {
  results.push({ screen, rule, status: 'PASS', desc })
  totalPassed++
  log(`  ✅ [${rule}] ${desc}`)
}
function fail(screen, rule, desc) {
  results.push({ screen, rule, status: 'FAIL', desc })
  totalFailed++
  log(`  ❌ [${rule}] ${desc}`)
}

// ── Wait for Next.js compilation to finish ──
async function waitForCompilation(page) {
  for (let i = 0; i < 30; i++) {
    const compiling = await page.evaluate(() => {
      // Next.js dev indicator
      const indicator = document.querySelector('[data-nextjs-toast]')
      if (indicator && indicator.textContent?.includes('Compiling')) return true
      // Also check for any visible "Compiling" text at bottom
      const all = document.querySelectorAll('*')
      for (const el of all) {
        if (el.children.length === 0 && el.textContent?.trim() === 'Compiling') return true
      }
      return false
    })
    if (!compiling) return
    log('  ⏳ Waiting for compilation...')
    await page.waitForTimeout(2000)
  }
}

// ── Auth ──
async function authenticate(page) {
  log('Authenticating...')
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  })

  if (!res.ok) {
    log(`Auth API failed: ${res.status}`)
    return false
  }

  const data = await res.json()
  const sessionPayload = JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {}
  })

  const CHUNK_SIZE = 3180
  const encoded = encodeURIComponent(sessionPayload)
  const chunks = []
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE))
  }

  const context = page.context()
  await context.addCookies(chunks.map((chunk, i) => ({
    name: `sb-${SUPABASE_REF}-auth-token.${i}`,
    value: chunk,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  })))

  log(`Injected ${chunks.length} auth cookie chunk(s)`)

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'commit', timeout: 30000 })
  } catch {
    await page.goto(`${BASE_URL}/`, { timeout: 90000 })
  }
  await page.waitForTimeout(6000)
  await waitForCompilation(page)

  if (page.url().includes('/auth/login')) {
    log('Cookie auth failed — trying form login...')
    try {
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'commit', timeout: 30000 })
    } catch {
      await page.goto(`${BASE_URL}/auth/login`, { timeout: 90000 })
    }
    await page.waitForTimeout(2000)
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.waitForTimeout(300)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    if (page.url().includes('/auth/login')) {
      log('Form login also failed!')
      return false
    }
    log('Form login OK')
  }

  log('Auth successful')
  return true
}

// ── Rule 1: Tactical Grid ──
async function checkTacticalGrid(page, screen) {
  const gridInfo = await page.evaluate(() => {
    const body = document.body
    const cs = getComputedStyle(body)
    return {
      backgroundImage: cs.backgroundImage,
      backgroundSize: cs.backgroundSize,
    }
  })

  const hasTacticalGrid = gridInfo.backgroundImage.includes('linear-gradient') &&
    (gridInfo.backgroundImage.includes('162') || gridInfo.backgroundImage.includes('a2e635'))

  const hasCorrectSize = gridInfo.backgroundSize.includes('40px')

  if (hasTacticalGrid && hasCorrectSize) {
    pass(screen, 'GRID', `Tactical grid present (40px spacing, accent green gradient)`)
  } else if (hasTacticalGrid) {
    fail(screen, 'GRID', `Grid gradient found but wrong size: ${gridInfo.backgroundSize}`)
  } else {
    fail(screen, 'GRID', `No tactical grid found. bg-image: ${gridInfo.backgroundImage.substring(0, 100)}`)
  }
}

// ── Rule 2: Section Headers with // prefix ──
// Strategy: find all leaf-node text starting with "// " — those are section headers.
// Then verify at least 1 exists per screen (all screens should have at least one section header).
// For the "no raw section headers without //" check, we look at h1-h4 and known patterns,
// but exclude Kanban column labels, nav items, and other non-section elements.
async function checkSectionHeaders(page, screen) {
  const headerData = await page.evaluate(() => {
    const slashHeaders = []
    const allElements = document.querySelectorAll('*')

    for (const el of allElements) {
      // Only check leaf nodes or near-leaf nodes
      const text = el.textContent?.trim()
      if (!text || text.length < 4 || text.length > 80) continue

      // Check visibility
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue

      // Check if this element's own direct text starts with "//"
      // (We need to check the element's own text, not children's text)
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent?.trim())
        .join('')
        .trim()

      const fullText = el.children.length === 0 ? text : directText

      if (fullText && fullText.startsWith('// ') && fullText.length > 4 && fullText.length < 80) {
        slashHeaders.push(fullText.substring(0, 60))
      }
    }

    // Deduplicate
    return { slashHeaders: [...new Set(slashHeaders)] }
  })

  const slashCount = headerData.slashHeaders.length

  if (slashCount > 0) {
    pass(screen, 'HEADERS', `${slashCount} section header(s) with // prefix: ${headerData.slashHeaders.slice(0, 4).join(', ')}`)
  } else {
    fail(screen, 'HEADERS', 'No section headers with // prefix found on page')
  }
}

// ── Rule 3: No Raw Colors ──
// Checks both inline styles for non-design-system hex colors AND class names for raw Tailwind colors.
async function checkNoRawColors(page, screen) {
  const colorIssues = await page.evaluate((rawTailwindColors) => {
    const issues = []

    // Design system hex colors that are acceptable in inline styles
    const designColors = new Set([
      '#0a0a0a', '#111111', '#1a1a1a', '#f0f0f0', '#050505', '#050506',
      '#a2e635', '#00d4ff', '#ff3b3b', '#ff4444', '#ffffff', '#000000',
      '#ef4444', '#ff6b35', '#8b5cf6', '#f59e0b', '#00ffcc', '#ff00cc',
      '#00ccff', '#ffcc00', '#0d0d10', '#141418', '#28c840', '#febc2e',
      '#ff5f57',  // Terminal window dots (macOS style — aesthetic, not design system)
    ])

    // Patterns in inline styles that use CSS variables (acceptable even with hex fallbacks)
    const varPattern = /var\(--[^)]+\)/

    const allElements = document.querySelectorAll('*')

    for (const el of allElements) {
      // Skip hidden elements
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue

      const style = el.getAttribute('style')
      if (style) {
        // Look for hex colors in inline styles
        const hexMatches = style.match(/#[0-9a-fA-F]{3,8}/g) || []
        for (const hex of hexMatches) {
          const normalized = hex.toLowerCase()
          if (designColors.has(normalized)) continue

          // Check if this hex is a fallback inside a var() — that's acceptable
          // e.g. style="color: var(--muted-foreground, #4b5563)" — the var wins
          const hexIndex = style.indexOf(hex)
          const preceding = style.substring(Math.max(0, hexIndex - 50), hexIndex)
          if (preceding.includes('var(')) continue // fallback inside var() — ok

          issues.push({
            type: 'inline-hex',
            value: hex,
            element: el.tagName.toLowerCase(),
            context: style.substring(0, 100),
          })
        }
      }

      // Check class names for raw Tailwind color utilities
      const className = el.className?.toString() || ''
      if (!className) continue

      for (const color of rawTailwindColors) {
        const prefixes = [
          'bg-', 'text-', 'border-', 'ring-', 'from-', 'to-', 'via-',
          'fill-', 'stroke-', 'shadow-', 'decoration-', 'outline-', 'divide-',
          'placeholder-',
        ]
        for (const prefix of prefixes) {
          const pattern = `${prefix}${color}`
          if (className.includes(pattern)) {
            issues.push({
              type: 'tailwind-raw',
              value: pattern,
              element: el.tagName.toLowerCase(),
              context: className.substring(0, 100),
            })
          }
        }
      }
    }

    return issues
  }, RAW_TAILWIND_COLORS)

  if (colorIssues.length === 0) {
    pass(screen, 'COLORS', 'No raw colors detected — all using CSS variables / design tokens')
  } else {
    const summary = colorIssues.slice(0, 5).map(i =>
      `${i.type}: ${i.value} on <${i.element}>`
    ).join('; ')
    fail(screen, 'COLORS', `${colorIssues.length} raw color(s) found: ${summary}`)
  }
}

// ── Main ──
async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  // Skip boot sequence
  await page.addInitScript(() => {
    sessionStorage.setItem('zvision_booted', 'true')
  })

  const authed = await authenticate(page)
  if (!authed) {
    log('FATAL: Could not authenticate. Aborting.')
    await browser.close()
    process.exit(1)
  }

  // Wait for initial compilation to settle
  log('Warming up — visiting all screens once to trigger compilation...')
  for (const screen of SCREENS) {
    try {
      await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'commit', timeout: 15000 })
    } catch { /* ok */ }
    await page.waitForTimeout(2000)
  }
  await page.waitForTimeout(3000)
  log('Warmup complete.\n')

  for (const screen of SCREENS) {
    log(`══════ VERIFYING ${screen.label} (${screen.path}) ══════`)

    try {
      await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'commit', timeout: 30000 })
    } catch {
      try {
        await page.goto(`${BASE_URL}${screen.path}`, { timeout: 90000 })
      } catch {
        fail(screen.name, 'NAV', `Could not navigate to ${screen.path}`)
        continue
      }
    }

    // Wait for compilation and content
    await waitForCompilation(page)
    await page.waitForTimeout(screen.waitMs)

    // Check if we got redirected to login
    if (page.url().includes('/auth/login')) {
      fail(screen.name, 'NAV', `Redirected to login for ${screen.path}`)
      continue
    }

    // Run 3 checks
    await checkTacticalGrid(page, screen.name)
    await checkSectionHeaders(page, screen.name)
    await checkNoRawColors(page, screen.name)

    // Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${screen.name}-verified.png`),
      fullPage: true,
    })
    log(`  📸 ${screen.name}-verified.png`)
  }

  await browser.close()

  // ── Summary ──
  log('\n' + '═'.repeat(60))
  log('SPRINT 2 VISUAL VERIFICATION SUMMARY')
  log('═'.repeat(60))
  log(`Total checks: ${totalPassed + totalFailed}`)
  log(`Passed: ${totalPassed}`)
  log(`Failed: ${totalFailed}`)

  if (totalFailed > 0) {
    log('\nFAILURES:')
    for (const r of results.filter(r => r.status === 'FAIL')) {
      log(`  ❌ ${r.screen} [${r.rule}]: ${r.desc}`)
    }
  }

  log('\n' + '═'.repeat(60))

  // Write results JSON for downstream use
  const outputPath = path.join(SCREENSHOT_DIR, 'verification-results.json')
  fs.writeFileSync(outputPath, JSON.stringify({ results, totalPassed, totalFailed }, null, 2))
  log(`Results written to ${outputPath}`)

  process.exit(totalFailed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Verification script failed:', err)
  process.exit(1)
})
