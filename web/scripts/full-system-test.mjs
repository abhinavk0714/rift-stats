#!/usr/bin/env node
/* eslint-env node */
/**
 * Full system test: create → get all → get one → update → delete for
 * Players, Teams, Matches, Roster, and Match Stats. Each step produces
 * a clearly distinct screenshot (create form, list, detail, edit form, detail after update, list after delete).
 * Run with backend + frontend up: npm run full-system-test
 * Screenshots go to repo root: system-test-screenshots/
 */
import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const OUT_DIR = join(__dirname, '..', '..', 'system-test-screenshots')

const ts = Date.now()

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  const shot = (name) =>
    page.screenshot({ path: join(OUT_DIR, `${name}.png`), fullPage: true })

  const wait = (ms = 600) => page.waitForTimeout(ms)

  try {
    // ========== PLAYERS ==========
    const playerName = `SysTest-P-${ts}`
    await page.goto(`${CLIENT_URL}/players`, { waitUntil: 'networkidle' })
    await page.waitForSelector('input[placeholder="Name"]', { timeout: 10000 })
    const playerForm = page.locator('form').first()
    await playerForm.locator('input[placeholder="Name"]').fill(playerName)
    await playerForm.locator('input[placeholder="Gamer tag"]').fill(`tag-${ts}`)
    await playerForm.locator('input[placeholder*="Role"]').fill('MID')
    await shot('players-01-create-form-filled')
    await playerForm.locator('button[aria-label="Create player"]').click()
    await wait(1500)
    await shot('players-02-list-after-create')
    await page.getByPlaceholder('Search by name, tag, nationality…').fill(playerName)
    await wait(800)
    await page.locator('tbody tr').first().click()
    await page.waitForURL(/\/players\/\d+/, { timeout: 5000 })
    await wait(500)
    await shot('players-03-detail-get-one')
    await page.click('button:has-text("Edit")')
    await page.waitForSelector('label:has-text("Nationality") input', { timeout: 3000 })
    await page.locator('label:has-text("Nationality") input').fill('Test Nation')
    await shot('players-04-edit-form-update')
    await page.click('button[aria-label="Save player"]')
    await wait(1000)
    await shot('players-05-detail-after-update')
    page.once('dialog', (d) => d.accept())
    await page.click('button[aria-label="Delete player"]')
    await page.waitForURL(/\/players$/, { timeout: 5000 })
    await wait(500)
    await shot('players-06-list-after-delete')

    // ========== TEAMS ==========
    const teamName = `SysTest-T-${ts}`
    await page.goto(`${CLIENT_URL}/teams`, { waitUntil: 'networkidle' })
    await page.waitForSelector('input[placeholder="Name"]', { timeout: 10000 })
    const teamForm = page.locator('form').first()
    await teamForm.locator('input[placeholder="Name"]').fill(teamName)
    await teamForm.locator('input[placeholder="Short name"]').fill('ST')
    await teamForm.locator('input[placeholder="Region"]').fill('LCS')
    await shot('teams-01-create-form-filled')
    await teamForm.locator('button[aria-label="Create team"]').click()
    await wait(1500)
    await shot('teams-02-list-after-create')
    await page.getByPlaceholder('Search by name or region…').fill(teamName)
    await wait(800)
    await page.locator('tbody tr').first().click()
    await page.waitForURL(/\/teams\/\d+/, { timeout: 5000 })
    await wait(500)
    await shot('teams-03-detail-get-one')
    await page.click('button:has-text("Edit")')
    await page.waitForSelector('label:has-text("Region") input', { timeout: 3000 })
    await page.locator('label:has-text("Region") input').fill('SysTest Region')
    await shot('teams-04-edit-form-update')
    await page.click('button[aria-label="Save team"]')
    await wait(1000)
    await shot('teams-05-detail-after-update')
    page.once('dialog', (d) => d.accept())
    await page.click('button[aria-label="Delete team"]')
    await page.waitForURL(/\/teams$/, { timeout: 5000 })
    await wait(500)
    await shot('teams-06-list-after-delete')

    // ========== MATCHES ==========
    await page.goto(`${CLIENT_URL}/matches`, { waitUntil: 'networkidle' })
    await page.waitForSelector('select[aria-label="Team A"]', { timeout: 10000 })
    const matchForm = page.locator('form').first()
    await matchForm.locator('select[aria-label="Team A"]').selectOption({ index: 1 })
    await matchForm.locator('select[aria-label="Team B"]').selectOption({ index: 2 })
    await shot('matches-01-create-form-filled')
    await matchForm.locator('button[aria-label="Create match"]').click()
    await wait(1500)
    await shot('matches-02-list-after-create')
    await page.locator('tbody tr').first().click()
    await page.waitForURL(/\/matches\/\d+/, { timeout: 5000 })
    await wait(500)
    await shot('matches-03-detail-get-one')
    await page.click('button:has-text("Edit")')
    await page.waitForSelector('label:has-text("Notes") textarea', { timeout: 3000 })
    await page.locator('label:has-text("Notes") textarea').fill('SysTest match notes')
    await shot('matches-04-edit-form-update')
    await page.click('button[aria-label="Save match"]')
    await wait(1000)
    await shot('matches-05-detail-after-update')
    page.once('dialog', (d) => d.accept())
    await page.click('button[aria-label="Delete match"]')
    await page.waitForURL(/\/matches$/, { timeout: 5000 })
    await wait(500)
    await shot('matches-06-list-after-delete')

    // ========== ROSTER ==========
    await page.goto(`${CLIENT_URL}/roster`, { waitUntil: 'networkidle' })
    await page.waitForSelector('select[aria-label="Select team"]', { timeout: 10000 })
    await page.locator('select[aria-label="Select team"]').selectOption({ index: 1 })
    await wait(1200)
    await page.waitForSelector('select[aria-label="Player"]', { timeout: 5000 })
    const rosterForm = page.locator('form').first()
    await rosterForm.locator('select[aria-label="Player"]').selectOption({ index: 1 })
    await rosterForm.locator('input[aria-label="Start date"]').fill('2024-01-01')
    await rosterForm.locator('input[aria-label="Role at team"]').fill('SysTest Role')
    await shot('roster-01-create-form-filled')
    await rosterForm.locator('button[aria-label="Add roster entry"]').click()
    await wait(1500)
    await shot('roster-02-list-after-create')
    await page.locator('tbody tr:has-text("SysTest Role")').first().click()
    await page.waitForURL(/\/roster\/\d+/, { timeout: 5000 })
    await wait(500)
    await shot('roster-03-detail-get-one')
    await page.click('button:has-text("Edit")')
    await page.waitForSelector('label:has-text("Role at team") input', { timeout: 3000 })
    await page.locator('label:has-text("Role at team") input').fill('SysTest Role Updated')
    await shot('roster-04-edit-form-update')
    await page.click('button[aria-label="Save roster entry"]')
    await wait(1000)
    await shot('roster-05-detail-after-update')
    page.once('dialog', (d) => d.accept())
    await page.click('button[aria-label="Delete roster entry"]')
    await page.waitForURL(/\/roster/, { timeout: 5000 })
    await wait(500)
    await shot('roster-06-list-after-delete')

    // ========== MATCH STATS ==========
    await page.goto(`${CLIENT_URL}/match-stats`, { waitUntil: 'networkidle' })
    await page.waitForSelector('select[aria-label="Select match"]', { timeout: 10000 })
    await page.locator('select[aria-label="Select match"]').selectOption({ index: 1 })
    await wait(1200)
    await page.waitForSelector('select[aria-label="Stat team"]', { timeout: 5000 })
    const statForm = page.locator('form').first()
    await statForm.locator('select[aria-label="Stat team"]').selectOption({ index: 1 })
    await statForm.locator('input[aria-label="Kills"]').fill('10')
    await statForm.locator('input[aria-label="Deaths"]').fill('2')
    await statForm.locator('input[aria-label="Assists"]').fill('5')
    await statForm.locator('input[aria-label="Win"]').check()
    await shot('match-stats-01-create-form-filled')
    await statForm.locator('button[aria-label="Add match stat"]').click()
    await wait(1500)
    await shot('match-stats-02-list-after-create')
    await page.locator('tbody tr').first().click()
    await page.waitForURL(/\/match-stats\/\d+/, { timeout: 5000 })
    await wait(500)
    await shot('match-stats-03-detail-get-one')
    await page.click('button:has-text("Edit")')
    await page.waitForSelector('label:has-text("Kills") input', { timeout: 3000 })
    await page.locator('label:has-text("Kills") input').fill('15')
    await shot('match-stats-04-edit-form-update')
    await page.click('button[aria-label="Save match stat"]')
    await wait(1000)
    await shot('match-stats-05-detail-after-update')
    page.once('dialog', (d) => d.accept())
    await page.click('button[aria-label="Delete match stat"]')
    await page.waitForURL(/\/match-stats/, { timeout: 5000 })
    await wait(500)
    await shot('match-stats-06-list-after-delete')

    console.log(`Screenshots saved to ${OUT_DIR}`)
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
