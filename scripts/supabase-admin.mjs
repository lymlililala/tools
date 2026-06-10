/**
 * supabase-admin.mjs
 * Shared admin Supabase client for maintenance scripts.
 *
 * The secret key is read from the SUPABASE_SECRET_KEY environment variable.
 * It is NEVER hardcoded here and must NOT be committed to git.
 *
 * Provide it either by exporting it in your shell:
 *   SUPABASE_SECRET_KEY=sb_secret_xxx node scripts/<script>.mjs
 * or by placing it in a gitignored `.env` file at the repo root (auto-loaded):
 *   SUPABASE_SECRET_KEY=sb_secret_xxx
 *
 * Get / rotate the secret key in:
 *   Supabase Dashboard → Project Settings → API Keys → Secret keys
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ─── Load .env (gitignored) without external deps ──────────────────────────────
function loadDotEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // Strip optional surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    // Shell-exported vars take precedence over the .env file
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotEnv()

export const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://tixgzezefjjsyuzgdhcd.supabase.co'

// Accept the new SUPABASE_SECRET_KEY; fall back to the legacy name for compat.
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SECRET_KEY) {
  console.error(`
❌ Missing SUPABASE_SECRET_KEY environment variable.

Add it to a gitignored .env file at the repo root:
  SUPABASE_SECRET_KEY=sb_secret_xxx

…or export it inline:
  SUPABASE_SECRET_KEY=sb_secret_xxx node scripts/<script>.mjs

Get it from: Supabase Dashboard → Project Settings → API Keys → Secret keys
`)
  process.exit(1)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})
