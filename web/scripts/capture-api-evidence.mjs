#!/usr/bin/env node
/* eslint-env node */
/**
 * Capture API (service layer) responses for Full System Test PDF.
 * Run after full-system-test.mjs so the created player may still exist, or run
 * against a live API and paste the IDs you want. Writes JSON to system-test-screenshots/.
 */
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_BASE = process.env.API_BASE || 'http://localhost:8000'
const OUT_DIR = join(__dirname, '..', '..', 'system-test-screenshots')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const get = (path) => fetch(`${API_BASE}${path}`).then((r) => r.json())

  try {
    const players = await get('/players?limit=50')
    await writeFile(
      join(OUT_DIR, 'api-get-all-players.json'),
      JSON.stringify(players, null, 2)
    )
    console.log('Wrote api-get-all-players.json')

    const firstId = Array.isArray(players) && players[0]?.id
    if (firstId) {
      const one = await get(`/players/${firstId}`)
      await writeFile(
        join(OUT_DIR, 'api-get-one-player.json'),
        JSON.stringify(one, null, 2)
      )
      console.log('Wrote api-get-one-player.json')
    }
  } catch (e) {
    console.error('Ensure backend is running at', API_BASE, e)
    process.exit(1)
  }
}

main()
