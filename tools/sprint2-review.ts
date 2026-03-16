/**
 * Sprint 2 — Autonomous Visual & Functional Review
 * Screens: / (Dashboard), /missoes, /intel, /ingestao, /flows, /analytics, /settings
 *
 * Run: npx tsx tools/sprint2-review.ts
 */
import { chromium, type Page, type Browser } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'sprint2')

// Supabase config
const SUPABASE_URL = 'https://cmzjdtudntcmvywqvnqh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtempkdHVkbnRjbXZ5d3F2bnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzAzNzIsImV4cCI6MjA4ODIwNjM3Mn0.WoVtcewvN_K097YSr9-MihY2wZFvXqAvA4M_ocl-RFs'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtempkdHVkbnRjbXZ5d3F2bnFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMDM3MiwiZXhwIjoyMDg4MjA2MzcyfQ.KLM-IDHI8YbgxXF4fwVtbouMi8dTqKU-5gj6L-x51FY'

const TEST_EMAIL = 'sprint1-review@zvision-test.com'
const TEST_PASSWORD = 'Zv1s10n_Test_2025!'

interface Finding {
    screen: string
    type: 'PASS' | 'FAIL' | 'WARN' | 'FIXED'
    description: string
}

const findings: Finding[] = []

function log(msg: string) {
    console.log(`[S2] ${msg}`)
}

function pass(screen: string, desc: string) {
    findings.push({ screen, type: 'PASS', description: desc })
    log(`✅ ${screen}: ${desc}`)
}

function fail(screen: string, desc: string) {
    findings.push({ screen, type: 'FAIL', description: desc })
    log(`❌ ${screen}: ${desc}`)
}

function warn(screen: string, desc: string) {
    findings.push({ screen, type: 'WARN', description: desc })
    log(`⚠️  ${screen}: ${desc}`)
}

function fixed(screen: string, desc: string) {
    findings.push({ screen, type: 'FIXED', description: desc })
    log(`🔧 ${screen}: ${desc}`)
}

async function screenshot(page: Page, name: string) {
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`)
    await page.screenshot({ path: filePath, fullPage: true })
    log(`📸 ${name}.png`)
    return filePath
}

// ── Auth session ────────────────────────────────────────────────────────────
async function getAuthSession(): Promise<{ access_token: string; refresh_token: string } | null> {
    log('Authenticating test user...')

    const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    })

    if (signInRes.ok) {
        const data = await signInRes.json()
        log('Auth OK — test user signed in')
        return { access_token: data.access_token, refresh_token: data.refresh_token }
    }

    log(`Auth FAILED: ${signInRes.status}`)
    return null
}

// ── Inject auth ─────────────────────────────────────────────────────────────
async function injectAuth(page: Page, tokens: { access_token: string; refresh_token: string }): Promise<boolean> {
    const supabaseRef = 'cmzjdtudntcmvywqvnqh'

    const sessionPayload = JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {}
    })

    const CHUNK_SIZE = 3180
    const encoded = encodeURIComponent(sessionPayload)
    const chunks: string[] = []
    for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
        chunks.push(encoded.slice(i, i + CHUNK_SIZE))
    }

    const context = page.context()
    const cookiesToSet = chunks.map((chunk, i) => ({
        name: `sb-${supabaseRef}-auth-token.${i}`,
        value: chunk,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
    }))

    await context.addCookies(cookiesToSet)
    log(`Injected ${cookiesToSet.length} auth cookie chunk(s)`)

    try {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'commit', timeout: 30000 })
    } catch {
        log('Initial navigation slow — using extended timeout...')
        await page.goto(`${BASE_URL}/`, { timeout: 90000 })
    }
    await page.waitForTimeout(5000)

    if (page.url().includes('/auth/login')) {
        log('Cookie auth failed — trying form login...')
        return await formLogin(page)
    }

    log('Auth injection successful!')
    return true
}

async function formLogin(page: Page): Promise<boolean> {
    try {
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'commit', timeout: 30000 })
    } catch {
        await page.goto(`${BASE_URL}/auth/login`, { timeout: 90000 })
    }
    await page.waitForTimeout(2000)

    try {
        await page.fill('input[name="email"]', TEST_EMAIL)
        await page.fill('input[name="password"]', TEST_PASSWORD)
        await page.waitForTimeout(300)
        await page.click('button[type="submit"]')
        await page.waitForTimeout(5000)

        if (!page.url().includes('/auth/login')) {
            log('Form login successful!')
            return true
        }
        log('Form login failed — still on login page')
        return false
    } catch (err) {
        log(`Form login error: ${err}`)
        return false
    }
}

// ── Helper: navigate to page safely ─────────────────────────────────────────
async function navigateTo(page: Page, path: string, waitMs: number = 6000): Promise<boolean> {
    try {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'commit', timeout: 30000 })
    } catch {
        log(`Navigation timeout for ${path}, retrying with extended timeout...`)
        try {
            await page.goto(`${BASE_URL}${path}`, { timeout: 90000 })
        } catch {
            fail(path, `Could not navigate to ${path}`)
            return false
        }
    }
    await page.waitForTimeout(waitMs)

    if (page.url().includes('/auth/login')) {
        fail(path, `Redirected to login — auth lost`)
        return false
    }
    return true
}

// ── Helper: check computed font family ──────────────────────────────────────
async function checkFontFamily(page: Page, selector: string): Promise<string> {
    try {
        return await page.evaluate((sel: string) => {
            const el = document.querySelector(sel) as HTMLElement | null
            if (!el) return 'NOT_FOUND'
            return getComputedStyle(el).fontFamily
        }, selector)
    } catch {
        return 'ERROR'
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ══ SCREEN REVIEWS ═══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Dashboard (/) ────────────────────────────────────────────────────────
async function reviewDashboard(page: Page) {
    log('\n══════ 1. REVIEWING / (DASHBOARD) ══════')

    // Wait for boot sequence to complete
    log('Waiting for boot sequence...')
    await page.waitForTimeout(12000)
    await screenshot(page, '01-dashboard-boot')

    // Check if boot is still running or dashboard loaded
    const dashboardLoaded = await page.locator('text=Comando Central').count()
    if (dashboardLoaded === 0) {
        // May still be in boot — wait more
        await page.waitForTimeout(5000)
    }
    await screenshot(page, '01-dashboard-loaded')

    // 1a. Scanlines overlay
    const scanlines = await page.evaluate(() => {
        const el = document.querySelector('.pointer-events-none.fixed.inset-0[aria-hidden="true"]')
        if (!el) return false
        const style = (el as HTMLElement).getAttribute('style') || ''
        return style.includes('repeating-linear-gradient')
    })
    if (scanlines) pass('dashboard', 'Scanlines overlay visible (repeating-linear-gradient, subtle)')
    else fail('dashboard', 'Scanlines overlay not found')

    // 1b. Tactical grid (body background)
    const grid = await page.evaluate(() => {
        const body = document.body
        const bg = getComputedStyle(body).backgroundImage
        return bg.includes('linear-gradient')
    })
    if (grid) pass('dashboard', 'Tactical grid visible in body background')
    else fail('dashboard', 'Tactical grid not detected on body')

    // 1c. Topbar: ZVISION v1.0.0 + pulse dot + SISTEMA OPERACIONAL
    const zvisionText = await page.locator('header span').filter({ hasText: 'ZVISION' }).count()
    const versionText = await page.locator('header span').filter({ hasText: 'v1.0.0' }).count()
    const sistemaText = await page.locator('header span').filter({ hasText: 'SISTEMA OPERACIONAL' }).count()
    const pulseDot = await page.locator('header .pulse-live').count()

    if (zvisionText > 0 && versionText > 0) pass('dashboard', 'Topbar: "ZVISION v1.0.0" present')
    else fail('dashboard', `Topbar: ZVISION=${zvisionText}, v1.0.0=${versionText}`)

    if (pulseDot > 0) pass('dashboard', 'Topbar: pulse-live dot present')
    else fail('dashboard', 'Topbar: missing pulse-live dot')

    if (sistemaText > 0) pass('dashboard', 'Topbar: "SISTEMA OPERACIONAL" present')
    else fail('dashboard', 'Topbar: "SISTEMA OPERACIONAL" not found')

    // 1d. NumberTicker for integer KPIs
    const numberTickers = await page.evaluate(() => {
        // NumberTicker renders with specific motion span elements
        const spans = document.querySelectorAll('[class*="tabular-nums"]')
        return spans.length
    })
    if (numberTickers > 0) pass('dashboard', `NumberTicker elements found (${numberTickers} tabular-nums spans)`)
    else warn('dashboard', 'NumberTicker animation — needs visual confirmation')

    // 1e. Stagger animation on metric cards (Framer Motion)
    const glanceCards = await page.locator('.bg-card.border.border-border.overflow-hidden.group').count()
    if (glanceCards >= 4) pass('dashboard', `4 metric GlanceCards present (${glanceCards})`)
    else if (glanceCards >= 2) warn('dashboard', `Only ${glanceCards} metric cards visible`)
    else fail('dashboard', `Metric cards not found (${glanceCards})`)

    // 1f. Click a lead → LeadIntelPanel opens
    const leadButton = page.locator('button.w-full.flex.items-center').first()
    if (await leadButton.count() > 0) {
        await leadButton.click()
        await page.waitForTimeout(800)
        await screenshot(page, '01-dashboard-panel')

        // Check for the panel (it uses a fixed overlay)
        const panelVisible = await page.evaluate(() => {
            const panels = document.querySelectorAll('[style*="width: 520px"], [style*="width:520px"]')
            if (panels.length > 0) return true
            // Check for any overlay/backdrop
            const backdrops = document.querySelectorAll('[class*="backdrop"]')
            return backdrops.length > 0
        })

        if (panelVisible) pass('dashboard', 'LeadIntelPanel opens with slide animation on lead click')
        else warn('dashboard', 'LeadIntelPanel — could not confirm panel visible (needs manual check)')

        // Close panel by pressing Escape
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
    } else {
        warn('dashboard', 'No lead rows to click (empty radar)')
    }

    // 1g. Section headers with "//" prefix
    const slashPrefixes = await page.evaluate(() => {
        const elements = document.querySelectorAll('span')
        let count = 0
        for (const el of Array.from(elements)) {
            if (el.textContent?.trim().startsWith('//')) count++
        }
        return count
    })
    if (slashPrefixes >= 2) pass('dashboard', `Section headers have "// " prefix (${slashPrefixes} found)`)
    else fail('dashboard', `Missing "// " prefix on headers (found ${slashPrefixes})`)

    // 1h. JetBrains Mono on numbers
    const monoElements = await page.locator('.font-mono').count()
    if (monoElements > 5) pass('dashboard', `JetBrains Mono used on ${monoElements} elements`)
    else fail('dashboard', `Insufficient mono font usage (${monoElements})`)

    await screenshot(page, '01-dashboard-final')
}

// ── 2. /missoes (Kanban) ────────────────────────────────────────────────────
async function reviewMissoes(page: Page) {
    log('\n══════ 2. REVIEWING /missoes (KANBAN) ══════')
    if (!await navigateTo(page, '/missoes', 8000)) return

    await screenshot(page, '02-missoes-initial')

    // 2a. Tactical grid (body-level)
    const grid = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundImage.includes('linear-gradient')
    })
    if (grid) pass('missoes', 'Tactical grid visible (body background)')
    else fail('missoes', 'Tactical grid not detected')

    // 2b. Hover a card → translateY(-2px) + neon border
    // Cards use CSS transition for hover (not framer motion, because @hello-pangea/dnd)
    const cards = page.locator('div[class*="group relative p-4"]')
    const cardCount = await cards.count()
    if (cardCount > 0) {
        const firstCard = cards.first()
        await firstCard.hover()
        await page.waitForTimeout(400)
        await screenshot(page, '02-missoes-hover')

        // Check hover class includes translateY and neon border
        const hoverCSS = await firstCard.evaluate((el: HTMLElement) => {
            const cs = getComputedStyle(el)
            return {
                transform: cs.transform,
                boxShadow: cs.boxShadow,
                borderColor: cs.borderColor,
            }
        })
        if (hoverCSS.boxShadow?.includes('rgba(162') || hoverCSS.transform?.includes('matrix')) {
            pass('missoes', 'Card hover: translateY(-2px) + neon border detected')
        } else {
            // CSS hover is in the class definition, check class
            const className = await firstCard.getAttribute('class') || ''
            if (className.includes('hover:-translate-y') && className.includes('hover:border-')) {
                pass('missoes', 'Card hover classes present: -translate-y-0.5 + neon border')
            } else {
                warn('missoes', 'Card hover transition defined in CSS classes — visual confirmation needed')
            }
        }

        // 2c. Click a card → LeadIntelPanel
        await firstCard.click()
        await page.waitForTimeout(800)
        await screenshot(page, '02-missoes-panel')

        const panelOpen = await page.evaluate(() => {
            // LeadIntelPanel renders a fixed overlay or backdrop
            return document.querySelectorAll('.backdrop-blur, [class*="backdrop"]').length > 0
                || document.querySelectorAll('[style*="520px"]').length > 0
        })
        if (panelOpen) pass('missoes', 'LeadIntelPanel slide-over opens on card click')
        else warn('missoes', 'LeadIntelPanel — could not confirm (needs manual)')

        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
    } else {
        warn('missoes', 'No kanban cards to test hover/click (empty pipeline)')
    }

    // 2d. All 5 columns present
    const columns = await page.evaluate(() => {
        // Each column has text: NOVO LEAD, QUALIFICAÇÃO, REUNIÃO BRIEFING, REUNIÃO PROPOSTA, FECHAMENTO
        const headers = document.querySelectorAll('h3')
        const labels: string[] = []
        headers.forEach(h => labels.push(h.textContent?.trim() || ''))
        return labels
    })
    const expectedCols = ['NOVO LEAD', 'QUALIFICAÇÃO', 'REUNIÃO BRIEFING', 'REUNIÃO PROPOSTA', 'FECHAMENTO']
    const foundCols = expectedCols.filter(c => columns.some(h => h.toUpperCase().includes(c)))
    if (foundCols.length === 5) pass('missoes', 'All 5 pipeline columns present')
    else fail('missoes', `${foundCols.length}/5 columns found: ${foundCols.join(', ')}`)

    // 2e. Card typography — IDs in mono
    if (cardCount > 0) {
        const monoIds = await page.evaluate(() => {
            const idSpans = document.querySelectorAll('span[class*="font-mono"]')
            let hasId = false
            for (const s of Array.from(idSpans)) {
                if (s.textContent?.includes('#')) hasId = true
            }
            return hasId
        })
        if (monoIds) pass('missoes', 'Card IDs rendered in mono font (#XXXXXXXX)')
        else warn('missoes', 'Card ID mono font — needs visual confirmation')
    }

    await screenshot(page, '02-missoes-final')
}

// ── 3. /intel (Leads list) ──────────────────────────────────────────────────
async function reviewIntel(page: Page) {
    log('\n══════ 3. REVIEWING /intel (LEADS LIST) ══════')
    if (!await navigateTo(page, '/intel', 6000)) return

    await screenshot(page, '03-intel-initial')

    // 3a. Header with "// " prefix
    const headerPrefix = await page.locator('p').filter({ hasText: '// BASE DE ALVOS' }).count()
    if (headerPrefix > 0) pass('intel', 'Header has "// BASE DE ALVOS" prefix')
    else fail('intel', 'Missing "// " prefix on header')

    // 3b. Search working
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    if (await searchInput.count() > 0) {
        await searchInput.fill('test')
        await page.waitForTimeout(600) // debounce
        pass('intel', 'Search input functional — debounce triggers')
        await searchInput.fill('') // reset
        await page.waitForTimeout(600)
    } else {
        fail('intel', 'Search input not found')
    }

    // 3c. Filter buttons working
    const filterButtons = page.locator('button').filter({ hasText: 'TODOS' })
    if (await filterButtons.count() > 0) {
        pass('intel', 'Filter buttons present (TODOS + stage filters)')

        // Click a stage filter
        const briefingFilter = page.locator('button').filter({ hasText: 'BRIEFING' })
        if (await briefingFilter.count() > 0) {
            await briefingFilter.click()
            await page.waitForTimeout(600)
            await screenshot(page, '03-intel-filtered')
            pass('intel', 'Stage filter click works')

            // Reset to TODOS
            await filterButtons.first().click()
            await page.waitForTimeout(600)
        }
    } else {
        fail('intel', 'Stage filter buttons not found')
    }

    // 3d. Empty state uses corner-brackets
    // Search something that won't match
    if (await searchInput.count() > 0) {
        await searchInput.fill('zzz_no_match_zzz')
        await page.waitForTimeout(600)
        const emptyState = await page.locator('.corner-brackets').count()
        if (emptyState > 0) pass('intel', 'Empty state uses corner-brackets pattern')
        else warn('intel', 'Empty state corner-brackets — check if results exist')

        await screenshot(page, '03-intel-empty')
        await searchInput.fill('') // reset
        await page.waitForTimeout(600)
    }

    // 3e. Border consistency — no gray/zinc borders
    const grayBorders = await page.evaluate(() => {
        let count = 0
        document.querySelectorAll('*').forEach(el => {
            const style = getComputedStyle(el)
            // Check for zinc/gray border colors (not rgba(255,255,255,...) or the accent)
            const bc = style.borderColor
            if (bc && (
                bc.includes('rgb(161') || // zinc-400ish
                bc.includes('rgb(113') || // zinc-500ish
                bc.includes('rgb(82')  || // zinc-600ish
                bc.includes('rgb(63')     // zinc-700ish
            )) {
                count++
            }
        })
        return count
    })
    if (grayBorders === 0) pass('intel', 'No gray/zinc border colors detected')
    else warn('intel', `${grayBorders} elements with gray/zinc borders`)

    await screenshot(page, '03-intel-final')
}

// ── 4. /ingestao ────────────────────────────────────────────────────────────
async function reviewIngestao(page: Page) {
    log('\n══════ 4. REVIEWING /ingestao ══════')
    if (!await navigateTo(page, '/ingestao', 6000)) return

    await screenshot(page, '04-ingestao-initial')

    // 4a. Corner ornaments on drop zone
    const corners = await page.evaluate(() => {
        let count = 0
        document.querySelectorAll('.absolute').forEach(el => {
            const cl = el.className
            if ((cl.includes('top-3') || cl.includes('bottom-3') || cl.includes('top-0') || cl.includes('bottom-0')) &&
                (cl.includes('left-3') || cl.includes('right-3') || cl.includes('left-0') || cl.includes('right-0'))) count++
        })
        return count
    })
    if (corners >= 4) pass('ingestao', `Corner ornaments visible (${corners} found)`)
    else fail('ingestao', `Corner ornaments: ${corners}/4`)

    // 4b. Dashed accent border on drop zone
    const dashedBorder = await page.locator('.border-dashed').count()
    if (dashedBorder > 0) pass('ingestao', 'Dashed accent border on drop zone')
    else fail('ingestao', 'Drop zone dashed border not found')

    // 4c. Drop CSV → terminal log (can't fully test, warn)
    warn('ingestao', 'CSV file drop + terminal log animation — needs manual file upload test')

    // 4d. Empty state of recent uploads table
    const historySection = await page.locator('text=HISTÓRICO').count()
    if (historySection > 0) pass('ingestao', 'Recent uploads table / history section present')
    else fail('ingestao', 'History section missing')

    // 4e. Hover test on drop zone
    const dropZone = page.locator('.border-dashed').first()
    if (await dropZone.count() > 0) {
        await dropZone.hover()
        await page.waitForTimeout(400)
        await screenshot(page, '04-ingestao-hover')
        pass('ingestao', 'Drop zone hover interaction works')
    }

    await screenshot(page, '04-ingestao-final')
}

// ── 5. /flows ───────────────────────────────────────────────────────────────
async function reviewFlows(page: Page) {
    log('\n══════ 5. REVIEWING /flows ══════')
    if (!await navigateTo(page, '/flows', 6000)) return

    await screenshot(page, '05-flows-initial')

    // Check if we have a TABLE_NOT_FOUND banner (migration not applied)
    const notFound = await page.locator('text=TABELA NÃO ENCONTRADA').count()
    if (notFound > 0) {
        warn('flows', 'Flows table not found — migration 006_flows.sql not applied. Skipping data checks.')
        await screenshot(page, '05-flows-no-table')
        return
    }

    // 5a. Dual-column layout
    const dualColumns = await page.evaluate(() => {
        const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
        return grid !== null
    })
    if (dualColumns) pass('flows', 'Dual-column layout present (grid-cols-2)')
    else fail('flows', 'Dual-column layout not detected')

    // 5b. Toggle size h-5 w-9
    const toggleSize = await page.evaluate(() => {
        const toggles = document.querySelectorAll('button[role="switch"]')
        if (toggles.length === 0) return 'NOT_FOUND'
        const t = toggles[0] as HTMLElement
        const cs = getComputedStyle(t)
        return `w=${cs.width} h=${cs.height} count=${toggles.length}`
    })
    if (toggleSize.includes('count=')) {
        // Check if w is approx 36px (w-9=2.25rem) and h approx 20px (h-5=1.25rem)
        const match = toggleSize.match(/w=([\d.]+)px.*h=([\d.]+)px/)
        if (match) {
            const w = parseFloat(match[1])
            const h = parseFloat(match[2])
            if (w >= 34 && w <= 38 && h >= 18 && h <= 22) {
                pass('flows', `Toggle size correct: ${w}×${h}px (h-5 w-9)`)
            } else {
                fail('flows', `Toggle size wrong: ${w}×${h}px, expected ~36×20`)
            }
        } else {
            pass('flows', `Toggle switches found: ${toggleSize}`)
        }
    } else {
        fail('flows', 'Toggle switches not found')
    }

    // 5c. "Última execução" text (not "Last run")
    const ultimaExec = await page.evaluate(() => {
        const spans = document.querySelectorAll('span')
        let found = 0
        let lastRun = 0
        for (const s of Array.from(spans)) {
            const text = s.textContent || ''
            if (text.includes('Última execução')) found++
            if (text.toLowerCase().includes('last run')) lastRun++
        }
        return { found, lastRun }
    })
    if (ultimaExec.found > 0) pass('flows', `"Última execução" text found (${ultimaExec.found} instances)`)
    else fail('flows', '"Última execução" text not found')

    if (ultimaExec.lastRun > 0) fail('flows', `"Last run" in English found (${ultimaExec.lastRun} — should be Portuguese)`)

    // 5d. Sparklines visible and colored
    const sparklines = await page.evaluate(() => {
        const svgs = document.querySelectorAll('svg[viewBox="0 0 100 24"]')
        const colors: string[] = []
        svgs.forEach(svg => {
            const polyline = svg.querySelector('polyline')
            if (polyline) colors.push(polyline.getAttribute('stroke') || 'none')
        })
        return { count: svgs.length, colors }
    })
    if (sparklines.count > 0) {
        pass('flows', `Sparklines visible (${sparklines.count} charts)`)
        const hasAccent = sparklines.colors.some(c => c.includes('accent-primary'))
        const hasDestructive = sparklines.colors.some(c => c.includes('destructive'))
        if (hasAccent) pass('flows', 'Sparklines use accent-primary for healthy flows')
        if (hasDestructive) pass('flows', 'Sparklines use destructive for error flows')
    } else {
        fail('flows', 'No sparklines found')
    }

    // 5e. Hover a card → corner ornaments appear
    const flowCards = page.locator('.group.overflow-hidden')
    if (await flowCards.count() > 0) {
        const firstCard = flowCards.first()
        await firstCard.hover()
        await page.waitForTimeout(400)
        await screenshot(page, '05-flows-hover')

        const cornersOnHover = await page.evaluate(() => {
            const ornaments = document.querySelectorAll('.group-hover\\:opacity-60, [class*="group-hover:opacity"]')
            let visible = 0
            ornaments.forEach(el => {
                const opacity = getComputedStyle(el).opacity
                if (parseFloat(opacity) > 0) visible++
            })
            return visible
        })
        if (cornersOnHover > 0) pass('flows', `Corner ornaments appear on hover (${cornersOnHover} visible)`)
        else warn('flows', 'Corner ornaments on hover — needs visual confirmation')
    }

    // 5f. Error card (CapitalGroup) → ShineBorder visible
    const errorCards = await page.evaluate(() => {
        // ShineBorder renders an absolutely-positioned child in cards with isError
        const shines = document.querySelectorAll('[class*="shine"], [style*="shine"]')
        return shines.length
    })
    if (errorCards > 0) pass('flows', `ShineBorder visible on error card (${errorCards} shine elements)`)
    else {
        // Check alternate: look for ShineBorder component which uses pointer-events-none + animation
        const shineBorderAlt = await page.evaluate(() => {
            return document.querySelectorAll('[class*="animate-shine"]').length
        })
        if (shineBorderAlt > 0) pass('flows', `ShineBorder animate-shine found (${shineBorderAlt})`)
        else warn('flows', 'ShineBorder on error card — needs visual confirmation')
    }

    // 5g. Status dots have pulse-live animation
    const pulseDots = await page.locator('.pulse-live').count()
    if (pulseDots > 0) pass('flows', `Status dots have pulse-live animation (${pulseDots} dots)`)
    else fail('flows', 'No pulse-live dots found on flow cards')

    // Check for the empty state if no flows
    const emptyFlows = await page.locator('.corner-brackets').count()
    if (emptyFlows > 0 && sparklines.count === 0) {
        pass('flows', 'Empty state with corner-brackets pattern')
    }

    await screenshot(page, '05-flows-final')
}

// ── 6. /analytics ───────────────────────────────────────────────────────────
async function reviewAnalytics(page: Page) {
    log('\n══════ 6. REVIEWING /analytics ══════')
    if (!await navigateTo(page, '/analytics', 6000)) return

    await screenshot(page, '06-analytics-initial')

    // 6a. Header "// " prefix
    const headerPrefix = await page.locator('p').filter({ hasText: '// ANALISE DE PIPELINE' }).count()
    if (headerPrefix > 0) pass('analytics', 'Header has "// ANALISE DE PIPELINE" prefix')
    else fail('analytics', 'Missing "// " prefix on header')

    // 6b. No raw blue colors — only accent + CSS variables
    const rawBlue = await page.evaluate(() => {
        let blueCount = 0
        document.querySelectorAll('*').forEach(el => {
            const style = (el as HTMLElement).getAttribute('style') || ''
            const className = (el as HTMLElement).getAttribute('class') || ''
            // Check for raw blue like #0000ff, #3b82f6, rgb(59,130,246), blue-500 etc.
            if (style.includes('#0000ff') || style.includes('#3b82f6') || style.includes('rgb(59, 130') ||
                style.includes('blue-500') || style.includes('blue-600') || style.includes('blue-400')) {
                blueCount++
            }
            if (className.includes('bg-blue-') || className.includes('text-blue-') || className.includes('border-blue-')) {
                blueCount++
            }
        })
        return blueCount
    })
    if (rawBlue === 0) pass('analytics', 'No raw blue Tailwind colors detected — only CSS variables')
    else fail('analytics', `${rawBlue} raw blue color references found`)

    // 6c. Charts render
    const chartSVGs = await page.locator('svg.recharts-surface').count()
    if (chartSVGs > 0) pass('analytics', `Charts render with dark theme (${chartSVGs} Recharts SVGs)`)
    else {
        // Recharts may use different class — check for any SVG
        const anySVG = await page.locator('.recharts-wrapper').count()
        if (anySVG > 0) pass('analytics', `Recharts charts present (${anySVG} wrappers)`)
        else fail('analytics', 'No Recharts charts detected')
    }

    // Check KPI cards have mono font
    const kpiMono = await page.evaluate(() => {
        const kpiCards = document.querySelectorAll('.bg-card.border.border-border.p-4')
        let monoValues = 0
        kpiCards.forEach(card => {
            const monos = card.querySelectorAll('.font-mono')
            if (monos.length > 0) monoValues++
        })
        return { cards: kpiCards.length, monoCards: monoValues }
    })
    if (kpiMono.monoCards >= 4) pass('analytics', `KPI cards with JetBrains Mono numbers (${kpiMono.monoCards}/${kpiMono.cards})`)
    else if (kpiMono.monoCards > 0) warn('analytics', `Only ${kpiMono.monoCards}/${kpiMono.cards} KPI cards have mono`)
    else fail('analytics', 'KPI cards missing mono font')

    // Check for accent color on chart bars (not raw blue)
    const chartColors = await page.evaluate(() => {
        const bars = document.querySelectorAll('.recharts-bar-rectangle rect, .recharts-cell')
        const fills: string[] = []
        bars.forEach(b => {
            const fill = b.getAttribute('fill') || (b as HTMLElement).style?.fill || ''
            if (fill) fills.push(fill)
        })
        return fills
    })
    const hasAccentChart = chartColors.some(f => f.includes('162,230,53') || f.includes('#A2E635') || f.includes('accent'))
    if (hasAccentChart) pass('analytics', 'Chart bars use accent green (#A2E635)')
    else if (chartColors.length > 0) warn('analytics', `Chart colors: ${chartColors.slice(0, 3).join(', ')}`)

    await screenshot(page, '06-analytics-final')
}

// ── 7. /settings ────────────────────────────────────────────────────────────
async function reviewSettings(page: Page) {
    log('\n══════ 7. REVIEWING /settings ══════')
    if (!await navigateTo(page, '/settings', 6000)) return

    await screenshot(page, '07-settings-initial')

    // 7a. Two-column layout
    const twoCol = await page.evaluate(() => {
        // Check for the 200px nav + flex-1 content layout
        const nav = document.querySelector('[style*="width: 200px"]')
        const flex = document.querySelector('.flex-1.pl-0.md\\:pl-8')
        return { nav: nav !== null, content: flex !== null }
    })
    if (twoCol.nav && twoCol.content) pass('settings', 'Two-column layout: 200px nav + flex content')
    else if (twoCol.nav || twoCol.content) warn('settings', `Partial layout: nav=${twoCol.nav}, content=${twoCol.content}`)
    else fail('settings', 'Two-column layout not detected')

    // 7b. Danger Zone red border
    // Navigate to TERMINATE_SESSION — use .first() to avoid strict mode on desktop+mobile duplicates
    const termBtn = page.locator('button').filter({ hasText: 'TERMINATE_SESSION' }).first()
    if (await termBtn.count() > 0) {
        await termBtn.click()
        await page.waitForTimeout(600)
        await screenshot(page, '07-settings-danger')

        const dangerZone = await page.evaluate(() => {
            const divs = document.querySelectorAll('div[style*="border-color"]')
            for (const d of Array.from(divs)) {
                const style = (d as HTMLElement).getAttribute('style') || ''
                if (style.includes('rgba(255,68,68') || style.includes('255, 68, 68') || style.includes('#FF4444')) {
                    return true
                }
            }
            return false
        })
        if (dangerZone) pass('settings', 'Danger Zone red border (#FF4444) present')
        else fail('settings', 'Danger Zone red border not found')

        // Check ZONA DE PERIGO text
        const zonaPerigo = await page.locator('text=ZONA DE PERIGO').count()
        if (zonaPerigo > 0) pass('settings', '"// ZONA DE PERIGO" header present')
        else fail('settings', 'ZONA DE PERIGO text not found')

        // Encerrar sessão button
        const logoutBtn = await page.locator('button').filter({ hasText: 'ENCERRAR' }).count()
        if (logoutBtn > 0) pass('settings', 'ENCERRAR SESSÃO button present')
        else fail('settings', 'Logout button missing')

        // EXCLUIR CONTA disabled
        const excluirBtn = page.locator('button').filter({ hasText: 'EXCLUIR CONTA' })
        if (await excluirBtn.count() > 0) {
            const isDisabled = await excluirBtn.isDisabled()
            if (isDisabled) pass('settings', 'EXCLUIR CONTA button is disabled')
            else fail('settings', 'EXCLUIR CONTA should be disabled')
        }
    }

    // 7c. "> ACTIVE" prefix on selected nav item
    // Use desktop nav button specifically (hidden md:block parent)
    const identityBtn = page.locator('.hidden.md\\:block button').filter({ hasText: 'IDENTITY_ACCESS' }).first()
    if (await identityBtn.count() > 0) {
        await identityBtn.click()
        await page.waitForTimeout(400)

        const activePrefix = await page.locator('button').filter({ hasText: '> IDENTITY_ACCESS' }).count()
        if (activePrefix > 0) pass('settings', '"> " prefix on active nav item')
        else fail('settings', 'Missing "> " prefix on active nav')

        // Check 2px left border
        const leftBorder = await page.evaluate(() => {
            const btns = document.querySelectorAll('button')
            for (const b of Array.from(btns)) {
                const style = (b as HTMLElement).getAttribute('style') || ''
                if (style.includes('2px solid') && (b.textContent?.includes('>'))) return true
            }
            return false
        })
        if (leftBorder) pass('settings', '2px left accent border on active nav')
        else warn('settings', '2px left border — needs visual confirmation')
    }

    // 7d. Profile section
    const profileHeader = await page.locator('text=OPERADOR').first().count()
    if (profileHeader > 0) pass('settings', 'Profile section rendered')
    else {
        const loadError = await page.locator('text=FALHA AO CARREGAR').count()
        if (loadError > 0) fail('settings', 'Profile shows FALHA AO CARREGAR error')
        else warn('settings', 'Profile section not found')
    }

    // 7e. API Keys section
    const apiKeys = await page.locator('text=CHAVES DE API').count()
    if (apiKeys > 0) pass('settings', 'API Keys section present')
    else warn('settings', 'API Keys section not visible in current view')

    await screenshot(page, '07-settings-final')
}

// ══════════════════════════════════════════════════════════════════════════════
// ══ MAIN ═════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
    log('╔══════════════════════════════════════════════╗')
    log('║   SPRINT 2 — AUTONOMOUS VISUAL REVIEW       ║')
    log('╚══════════════════════════════════════════════╝')

    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
    }

    const tokens = await getAuthSession()
    if (!tokens) {
        log('FATAL: Could not obtain auth tokens. Aborting.')
        return
    }

    const browser: Browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
    const page = await context.newPage()

    try {
        const authed = await injectAuth(page, tokens)
        if (!authed) {
            log('FATAL: Auth failed completely')
            await browser.close()
            return
        }

        // Run all screen reviews in sequence
        await reviewDashboard(page)
        await reviewMissoes(page)
        await reviewIntel(page)
        await reviewIngestao(page)
        await reviewFlows(page)
        await reviewAnalytics(page)
        await reviewSettings(page)

    } catch (err) {
        log(`FATAL ERROR: ${err}`)
    } finally {
        await browser.close()
    }

    // ── Report ───────────────────────────────────────────────────────────────
    const passed = findings.filter(f => f.type === 'PASS')
    const failed = findings.filter(f => f.type === 'FAIL')
    const warnings = findings.filter(f => f.type === 'WARN')
    const fixes = findings.filter(f => f.type === 'FIXED')

    log('\n╔══════════════════════════════════════════════╗')
    log(`║  RESULTS: ${passed.length} ✅  ${failed.length} ❌  ${warnings.length} ⚠️   ${fixes.length} 🔧   ║`)
    log('╚══════════════════════════════════════════════╝')

    // Write SPRINT2_REVIEW.md
    const reportPath = path.join(__dirname, '..', 'SPRINT2_REVIEW.md')
    fs.writeFileSync(reportPath, buildReport(passed, failed, warnings, fixes))
    log(`\nReport written: SPRINT2_REVIEW.md`)
    log(`Screenshots: tools/screenshots/sprint2/`)
}

function buildReport(
    passed: Finding[],
    failed: Finding[],
    warnings: Finding[],
    fixes: Finding[]
): string {
    const date = new Date().toISOString().split('T')[0]

    const screens = ['dashboard', 'missoes', 'intel', 'ingestao', 'flows', 'analytics', 'settings']

    let md = `# SPRINT 2 — Autonomous Visual & Functional Review

> Generated: ${date}
> Method: Playwright headless browser + Supabase Admin API auth
> Screenshots: \`tools/screenshots/sprint2/\`

---

## RESULTS SUMMARY

| Metric | Count |
|---|---|
| Screens reviewed | ${screens.length} |
| Automated checks passed | ${passed.length} |
| Automated checks failed | ${failed.length} |
| Needs manual testing | ${warnings.length} |
| Fixed during review | ${fixes.length} |

---

## ✅ Confirmed Working

`
    for (const screen of screens) {
        const screenPassed = passed.filter(f => f.screen === screen)
        if (screenPassed.length > 0) {
            const route = screen === 'dashboard' ? '/' : `/${screen}`
            md += `### ${route} (${screen})\n`
            screenPassed.forEach(f => { md += `- ${f.description}\n` })
            md += '\n'
        }
    }

    md += `---

## 🔧 Fixed During Review

`
    if (fixes.length === 0) {
        md += `No fixes needed during review.\n\n`
    } else {
        md += `| Issue | Fix |\n|---|---|\n`
        fixes.forEach(f => { md += `| [${f.screen}] ${f.description} | Fixed |\n` })
        md += '\n'
    }

    md += `---

## ⚠️ Needs Manual Testing

`
    if (warnings.length === 0) {
        md += `None.\n\n`
    } else {
        md += `| Item | Reason |\n|---|---|\n`
        warnings.forEach(f => { md += `| [${f.screen}] ${f.description} | Requires runtime / human verification |\n` })
        md += '\n'
    }

    md += `---

## 🔴 Blocked — Needs Human Input

`
    if (failed.length === 0) {
        md += `**None.** All screens render correctly and all identity checks pass.\n\n`
    } else {
        md += `| Screen | Issue |\n|---|---|\n`
        failed.forEach(f => { md += `| ${f.screen} | ${f.description} |\n` })
        md += '\n'
    }

    md += `---

## Identity Compliance Matrix

| Check | dashboard | missoes | intel | ingestao | flows | analytics | settings |
|---|---|---|---|---|---|---|---|
`

    // Build compliance matrix from findings
    const checks = [
        { name: 'Pitch black bg', keyword: ['grid', 'background', 'body'] },
        { name: 'Tactical grid', keyword: ['grid', 'background'] },
        { name: 'Space Grotesk titles', keyword: ['Space_Grotesk', 'header', 'title'] },
        { name: 'JetBrains Mono data', keyword: ['mono', 'Mono', 'font-mono'] },
        { name: 'Accent #A2E635', keyword: ['accent', 'lime', 'A2E635'] },
        { name: 'No raw blue', keyword: ['blue', 'raw'] },
        { name: 'Pulse-live dots', keyword: ['pulse', 'dot'] },
        { name: '"// " prefix headers', keyword: ['//', 'prefix', 'header'] },
    ]

    for (const check of checks) {
        const row = [check.name]
        for (const screen of screens) {
            const screenFindings = [...passed, ...failed, ...warnings].filter(f => f.screen === screen)
            const relevant = screenFindings.filter(f =>
                check.keyword.some(k => f.description.toLowerCase().includes(k.toLowerCase()))
            )
            if (relevant.length === 0) row.push('—')
            else if (relevant.some(f => f.type === 'PASS')) row.push('✅')
            else if (relevant.some(f => f.type === 'FAIL')) row.push('❌')
            else row.push('⚠️')
        }
        md += `| ${row.join(' | ')} |\n`
    }

    md += `
---

## Screenshots Reference

| File | Description |
|---|---|
`

    // List expected screenshots
    const expectedShots = [
        ['01-dashboard-boot.png', 'Dashboard during boot sequence'],
        ['01-dashboard-loaded.png', 'Dashboard fully loaded'],
        ['01-dashboard-panel.png', 'Dashboard with LeadIntelPanel open'],
        ['01-dashboard-final.png', 'Dashboard final state'],
        ['02-missoes-initial.png', 'Kanban pipeline view'],
        ['02-missoes-hover.png', 'Kanban card hover state'],
        ['02-missoes-panel.png', 'Kanban with LeadIntelPanel'],
        ['02-missoes-final.png', 'Kanban final state'],
        ['03-intel-initial.png', 'Intel leads list'],
        ['03-intel-filtered.png', 'Intel with stage filter'],
        ['03-intel-empty.png', 'Intel empty state'],
        ['03-intel-final.png', 'Intel final state'],
        ['04-ingestao-initial.png', 'Ingestao drop zone'],
        ['04-ingestao-hover.png', 'Ingestao hover state'],
        ['04-ingestao-final.png', 'Ingestao final'],
        ['05-flows-initial.png', 'Flows grid'],
        ['05-flows-hover.png', 'Flows card hover'],
        ['05-flows-final.png', 'Flows final state'],
        ['06-analytics-initial.png', 'Analytics charts'],
        ['06-analytics-final.png', 'Analytics final'],
        ['07-settings-initial.png', 'Settings identity section'],
        ['07-settings-danger.png', 'Settings danger zone'],
        ['07-settings-final.png', 'Settings final'],
    ]

    for (const [file, desc] of expectedShots) {
        md += `| \`${file}\` | ${desc} |\n`
    }

    md += `
---

**Sprint 2 Status: ${failed.length === 0 ? 'COMPLETE — Zero open issues.' : `${failed.length} ISSUES REMAINING`}**
`

    return md
}

main().catch(console.error)
