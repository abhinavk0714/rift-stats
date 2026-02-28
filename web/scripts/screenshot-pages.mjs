#!/usr/bin/env node
/* eslint-env node */
/**
 * Capture screenshots of main GET views (dashboard, list, single, subset).
 * Run with frontend + backend up: npm run screenshots
 * Screenshots go to web/screenshots/
 */
import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const OUT_DIR = join(__dirname, '..', 'screenshots')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  const goto = (path) => page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
  const shot = (name) => page.screenshot({ path: join(OUT_DIR, `${name}.png`), fullPage: true })

  try {
    // Dashboard
    await goto('/')
    await page.waitForSelector('text=Dashboard', { timeout: 10000 })
    await shot('01-dashboard')

    // Players: list
    await goto('/players')
    await page.waitForSelector('table, [role="table"]', { timeout: 10000 })
    await shot('02-players-list')

    // Players: single (id 1)
    await goto('/players/1')
    await page.waitForSelector('text=Back', { timeout: 8000 })
    await shot('03-player-single')

    // Players: subset (filter by first role if present)
    await goto('/players')
    await page.waitForSelector('select[aria-label="Filter by role"]', { timeout: 8000 })
    const roleOpts = await page.locator('select[aria-label="Filter by role"] option').allTextContents()
    if (roleOpts.length > 1) {
      await page.selectOption('select[aria-label="Filter by role"]', { index: 1 })
      await new Promise((r) => setTimeout(r, 500))
      await shot('04-players-subset')
    }

    // Teams: list
    await goto('/teams')
    await page.waitForSelector('table, [role="table"]', { timeout: 10000 })
    await shot('05-teams-list')

    // Teams: single
    await goto('/teams/1')
    await page.waitForSelector('text=Back', { timeout: 8000 })
    await shot('06-team-single')

    // Matches: list
    await goto('/matches')
    await page.waitForSelector('table, [role="table"]', { timeout: 10000 })
    await shot('07-matches-list')

    // Matches: single
    await goto('/matches/1')
    await page.waitForSelector('text=Back', { timeout: 8000 })
    await shot('08-match-single')

    // Matches: subset (first team in filter if present)
    await goto('/matches')
    await page.waitForSelector('select[aria-label="Filter by team"]', { timeout: 8000 })
    const teamOpts = await page.locator('select[aria-label="Filter by team"] option').allTextContents()
    if (teamOpts.length > 1) {
      await page.selectOption('select[aria-label="Filter by team"]', { index: 1 })
      await new Promise((r) => setTimeout(r, 500))
      await shot('09-matches-subset')
    }

    // Roster: list (select first team)
    await goto('/roster')
    await page.waitForSelector('select[aria-label="Select team"]', { timeout: 8000 })
    await page.selectOption('select[aria-label="Select team"]', { index: 1 })
    await new Promise((r) => setTimeout(r, 800))
    await shot('10-roster-list')

    // Roster: single (id 1)
    await goto('/roster/1')
    await page.waitForSelector('text=Back', { timeout: 8000 })
    await shot('11-roster-single')

    // Match stats: list (select first match)
    await goto('/match-stats')
    await page.waitForSelector('select[aria-label="Select match"]', { timeout: 8000 })
    await page.selectOption('select[aria-label="Select match"]', { index: 1 })
    await new Promise((r) => setTimeout(r, 800))
    await shot('12-match-stats-list')

    // Match stats: single
    await goto('/match-stats/1')
    await page.waitForSelector('text=Back', { timeout: 8000 })
    await shot('13-match-stats-single')

    console.log(`Screenshots saved to ${OUT_DIR}`)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
