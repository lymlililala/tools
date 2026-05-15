/**
 * Seed script: creates the tools_articles table and uploads all articles to Supabase.
 *
 * Usage:
 *   # Upload only (if table already exists):
 *   node scripts/seed-articles.mjs
 *
 *   # Create table + upload (requires database password):
 *   DATABASE_URL="postgresql://postgres:[DB_PASSWORD]@db.tixgzezefjjsyuzgdhcd.supabase.co:5432/postgres" \
 *   node scripts/seed-articles.mjs
 *
 * Get DB_PASSWORD: Supabase Dashboard → Settings → Database → Connection string
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://tixgzezefjjsyuzgdhcd.supabase.co'
const SUPABASE_SERVICE_KEY
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS tools_articles (
    id           BIGSERIAL    PRIMARY KEY,
    slug         TEXT         NOT NULL UNIQUE,
    tool_path    TEXT         NOT NULL,
    title        TEXT         NOT NULL,
    description  TEXT         NOT NULL,
    keywords     TEXT[]       NOT NULL DEFAULT '{}',
    category     TEXT         NOT NULL,
    published_at DATE         NOT NULL,
    content      TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_tools_articles_slug     ON tools_articles (slug);
  CREATE INDEX IF NOT EXISTS idx_tools_articles_category ON tools_articles (category);
  ALTER TABLE tools_articles ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'tools_articles' AND policyname = 'tools_articles_public_read'
    ) THEN
      CREATE POLICY tools_articles_public_read ON tools_articles
        FOR SELECT TO anon USING (true);
    END IF;
  END $$;
`

// ─── Step 1: Create table ─────────────────────────────────────────────────────
async function ensureTable() {
  console.log('📦 Ensuring tools_articles table exists...')

  // First check if the table already exists
  const { error: checkError } = await supabase.from('tools_articles').select('id').limit(1)
  if (!checkError) {
    console.log('  ✅ Table already exists.')
    return true
  }

  // Table doesn't exist — try to create via pg direct connection
  const DATABASE_URL = process.env.DATABASE_URL
  if (DATABASE_URL) {
    console.log('  🔗 Connecting directly to PostgreSQL to create table...')
    try {
      const { default: pkg } = await import('pg')
      const { Client } = pkg
      const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
      await client.connect()
      await client.query(CREATE_TABLE_SQL)
      await client.end()
      console.log('  ✅ Table created successfully via direct connection!')
      return true
    }
    catch (pgErr) {
      console.error('  ❌ Direct connection failed:', pgErr.message)
    }
  }

  // No DATABASE_URL provided — show manual instructions
  console.log('\n' + '─'.repeat(70))
  console.log('⚠️  TABLE NOT FOUND: tools_articles')
  console.log('─'.repeat(70))
  console.log('\nTo create the table, choose one of these options:\n')
  console.log('Option 1: Run with database password (from Supabase Dashboard → Settings → Database)')
  console.log('  DATABASE_URL="postgresql://postgres:[DB_PASSWORD]@db.tixgzezefjjsyuzgdhcd.supabase.co:5432/postgres" \\')
  console.log('  node scripts/seed-articles.mjs\n')
  console.log('Option 2: Run this SQL in Supabase Dashboard (supabase.com/dashboard → SQL Editor):')
  console.log('  See: scripts/create-tools-articles-table.sql\n')
  console.log('─'.repeat(70))
  return false
}

// ─── Step 2: Article data ─────────────────────────────────────────────────────
// We inline the data here so the script is self-contained and runnable with
// plain `node` without needing ts-node / vite / etc.
const articles = [
  // ─── Crypto ───────────────────────────────────────────────────────────────
  {
    slug: 'what-is-token-generator',
    toolPath: '/token-generator',
    title: 'What Is a Random Token Generator and Why Do You Need One?',
    description: 'Learn how to generate cryptographically secure random tokens for API keys, session IDs, CSRF tokens, and more.',
    keywords: ['token generator', 'random token', 'API key generator', 'secure token', 'csrf token'],
    category: 'Crypto',
    publishedAt: '2025-06-01',
    content: `## What Is a Random Token Generator?\n\nA **random token generator** creates unpredictable strings used to authenticate users, protect APIs, and prevent attacks like CSRF.\n\n## Common Use Cases\n\n- **API Keys** – Authenticate third-party services without exposing passwords.\n- **Session Tokens** – Track logged-in users securely.\n- **CSRF Tokens** – Prevent cross-site request forgery attacks in web forms.\n- **Password Reset Links** – Create one-time-use secure URLs sent via email.\n\n## How Does This Tool Work?\n\nMyUtl's token generator uses the browser's built-in **Web Crypto API** (\`crypto.getRandomValues()\`), which provides cryptographically secure random numbers.\n\n## How Long Should a Token Be?\n\n| Use Case | Recommended Length |\n|---|---|\n| CSRF token | 32+ characters |\n| API key | 32–64 characters |\n| Session ID | 64+ characters |\n\n## Best Practices\n\n- Never reuse tokens across different services.\n- Store tokens hashed (e.g., SHA-256) — never in plain text.\n- Rotate tokens regularly, especially after a security incident.\n\n→ Try the [Token Generator](/token-generator)`,
  },
  {
    slug: 'how-to-hash-text-online',
    toolPath: '/hash-text',
    title: 'How to Hash Text Online: MD5, SHA-1, SHA-256, and More',
    description: 'Understand hashing algorithms and use our free tool to hash any text with MD5, SHA-256, SHA-512, and more.',
    keywords: ['hash text', 'SHA-256 online', 'MD5 hash', 'SHA-512', 'hash calculator'],
    category: 'Crypto',
    publishedAt: '2025-06-02',
    content: `## What Is Hashing?\n\nHashing converts any input into a fixed-length string called a **digest**. Unlike encryption, hashing is a **one-way function** — you cannot reverse it.\n\n## Popular Hash Algorithms\n\n| Algorithm | Output | Status |\n|---|---|---|\n| MD5 | 128 bits | Deprecated for security |\n| SHA-1 | 160 bits | Deprecated for security |\n| SHA-256 | 256 bits | Widely used, recommended |\n| SHA-512 | 512 bits | Strong, slower |\n\n## Example: SHA-256 of "hello"\n\n\`\`\`\nInput:  hello\nSHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\n\`\`\`\n\n→ Try the [Hash Text Tool](/hash-text)`,
  },
  {
    slug: 'bcrypt-password-hashing-guide',
    toolPath: '/bcrypt',
    title: "Bcrypt Password Hashing: Why It's the Gold Standard",
    description: 'Learn why bcrypt is the recommended algorithm for password storage, how the cost factor works, and how to verify passwords.',
    keywords: ['bcrypt', 'password hashing', 'bcrypt cost factor', 'password storage', 'hash password'],
    category: 'Crypto',
    publishedAt: '2025-06-03',
    content: `## Why Bcrypt for Password Storage?\n\nBcrypt is a **password-hashing function** designed to be slow and computationally expensive — making brute-force attacks impractical.\n\n## The Cost Factor\n\n| Cost | Time per Hash | Recommendation |\n|---|---|---|\n| 10 | ~100ms | Minimum recommended |\n| 12 | ~400ms | Recommended default |\n| 14 | ~1.5s | High-security |\n\n## Verify a Password\n\n\`\`\`javascript\nconst bcrypt = require('bcrypt');\nconst match = await bcrypt.compare(plainPassword, storedHash);\n\`\`\`\n\n→ Try the [Bcrypt Tool](/bcrypt)`,
  },
  {
    slug: 'uuid-vs-ulid',
    toolPath: '/uuid-generator',
    title: 'UUID vs ULID: Which Unique ID Should You Use?',
    description: 'Compare UUID and ULID for unique identifier generation. Learn when to use each and how they differ in sortability and database performance.',
    keywords: ['UUID generator', 'ULID generator', 'unique ID', 'UUID vs ULID', 'sortable ID'],
    category: 'Crypto',
    publishedAt: '2025-06-04',
    content: `## UUID vs ULID Comparison\n\n| Feature | UUID v4 | ULID |\n|---|---|---|\n| Length | 36 chars | 26 chars |\n| Sortable | ❌ | ✅ Time-ordered |\n| Database index | B-tree fragmentation | Better locality |\n| Standard | RFC 4122 | Community spec |\n\n**UUID** — Use for maximum compatibility.\n\n**ULID** — Use when you need sortable IDs (event streams, logs).\n\n→ Try [UUID Generator](/uuid-generator) or [ULID Generator](/ulid-generator)`,
  },
  {
    slug: 'jwt-explained',
    toolPath: '/jwt-parser',
    title: 'JWT Explained: How to Read and Validate JSON Web Tokens',
    description: 'Decode and inspect any JWT token. Learn about header, payload, signature, expiry, and common security mistakes.',
    keywords: ['JWT parser', 'decode JWT', 'JSON web token', 'JWT security', 'JWT expiry'],
    category: 'Crypto',
    publishedAt: '2025-06-05',
    content: `## JWT Structure\n\n\`\`\`\nheader.payload.signature\n\`\`\`\n\n**Header:** \`{ "alg": "HS256", "typ": "JWT" }\`\n\n**Payload:** \`{ "sub": "1234", "name": "John", "exp": 1716000000 }\`\n\n**Signature:** HMAC of header.payload using a secret key.\n\n## Security Checklist\n\n- ✅ Always verify signature server-side\n- ✅ Check \`exp\` to reject expired tokens\n- ❌ Never trust client-side JWT validation alone\n- ❌ Never put sensitive data in payload\n\n→ Try the [JWT Parser](/jwt-parser)`,
  },
  {
    slug: 'password-strength-guide',
    toolPath: '/password-strength-analyser',
    title: 'Password Strength: What Makes a Password Secure?',
    description: 'Learn what makes passwords strong or weak. Understand entropy, crack time estimates, and best practices for password security.',
    keywords: ['password strength', 'password security', 'strong password', 'password entropy', 'crack time'],
    category: 'Crypto',
    publishedAt: '2025-06-06',
    content: `## What Makes a Password Strong?\n\n**Length + variety + unpredictability = entropy.**\n\n| Password | Crack Time |\n|---|---|\n| \`password\` | Instant |\n| \`P@ssw0rd\` | Seconds |\n| \`Correct-Horse-Battery\` | Centuries |\n| \`X7#kLm$9pQr@2vN\` | Billions of years |\n\n## Tips\n\n- Use a **password manager** to generate and store unique passwords.\n- Enable **2FA** wherever possible.\n- 4+ random words are both memorable and secure.\n\n→ Try the [Password Strength Analyser](/password-strength-analyser)`,
  },
  {
    slug: 'rsa-key-pair-explained',
    toolPath: '/rsa-key-pair-generator',
    title: 'RSA Key Pairs: How They Work and How to Generate Them',
    description: 'Understand RSA public/private key cryptography. Learn key sizes, use cases, and generate key pairs in your browser.',
    keywords: ['RSA key pair', 'RSA generator', 'public private key', 'asymmetric encryption', 'SSH key'],
    category: 'Crypto',
    publishedAt: '2025-06-07',
    content: `## How RSA Works\n\nRSA is an **asymmetric encryption** algorithm: you have a **public key** (share freely) and a **private key** (keep secret).\n\n## Key Sizes\n\n| Size | Security | Use Case |\n|---|---|---|\n| 1024 bit | Weak (deprecated) | Legacy only |\n| 2048 bit | Good | Minimum recommended |\n| 4096 bit | Strong | High-security systems |\n\n## Common Uses\n\n- **SSH authentication** – Replace password login with key-based auth\n- **HTTPS / TLS** – Secure web connections\n- **Code signing** – Verify software authenticity\n\n→ Try the [RSA Key Pair Generator](/rsa-key-pair-generator)`,
  },
  {
    slug: 'hmac-generator-guide',
    toolPath: '/hmac-generator',
    title: 'HMAC Explained: Message Authentication with a Secret Key',
    description: 'Learn what HMAC is, how it differs from regular hashing, and when to use it for API authentication and data integrity.',
    keywords: ['HMAC generator', 'HMAC SHA256', 'message authentication', 'API signature', 'HMAC vs hash'],
    category: 'Crypto',
    publishedAt: '2025-06-08',
    content: `## What Is HMAC?\n\n**HMAC** combines a cryptographic hash function with a secret key to verify both the **integrity** and **authenticity** of a message.\n\n## HMAC vs Plain Hash\n\n| | Plain Hash | HMAC |\n|---|---|---|\n| Key required | ❌ | ✅ |\n| Verifies sender | ❌ | ✅ |\n\n## Common Uses\n\n- **Webhook signatures** – GitHub, Stripe send HMAC signatures to verify payloads.\n- **API authentication** – AWS Signature Version 4 uses HMAC-SHA256.\n- **JWT (HS256)** – Signs tokens with a shared secret.\n\n→ Try the [HMAC Generator](/hmac-generator)`,
  },
  {
    slug: 'encryption-tool-guide',
    toolPath: '/encryption',
    title: 'Text Encryption Online: AES, DES, and Symmetric Encryption Explained',
    description: 'Encrypt and decrypt text using AES, DES, and other algorithms. Learn how symmetric encryption works and when to use it.',
    keywords: ['text encryption', 'AES encryption', 'encrypt online', 'symmetric encryption', 'decrypt text'],
    category: 'Crypto',
    publishedAt: '2025-06-09',
    content: `## Symmetric Encryption\n\nSymmetric encryption uses the **same key** to encrypt and decrypt.\n\n## Common Algorithms\n\n| Algorithm | Key Size | Status |\n|---|---|---|\n| DES | 56 bit | Deprecated |\n| AES-128 | 128 bit | Good |\n| AES-256 | 256 bit | Recommended |\n\n## AES Modes\n\n- **CBC** – Good for files.\n- **GCM** – Authenticated encryption; detects tampering. Best choice.\n- **ECB** – Never use.\n\n→ Try the [Encryption Tool](/encryption)`,
  },
  {
    slug: 'otp-authenticator-guide',
    toolPath: '/otp-generator',
    title: 'OTP / TOTP Explained: How Two-Factor Authentication Works',
    description: 'Learn how Time-based One-Time Passwords (TOTP) work. Generate and validate OTP codes for 2FA systems.',
    keywords: ['OTP generator', 'TOTP', 'two-factor authentication', '2FA code', 'authenticator app'],
    category: 'Web',
    publishedAt: '2025-06-10',
    content: `## What Is TOTP?\n\n**TOTP** generates a 6-digit code that changes every 30 seconds. Used in Google Authenticator, Authy, and Microsoft Authenticator.\n\n## How It Works\n\n1. Server and user share a **secret key** (shown as QR code during setup).\n2. Both compute: \`TOTP = HOTP(secret, floor(currentTime / 30))\`\n3. User types the 6-digit code; server verifies it matches.\n\n## RFC Standards\n\n- **HOTP**: RFC 4226\n- **TOTP**: RFC 6238\n\n→ Try the [OTP Generator](/otp-generator)`,
  },
  {
    slug: 'bip39-mnemonic-guide',
    toolPath: '/bip39-generator',
    title: 'BIP39 Mnemonic Phrases: How Crypto Wallets Are Backed Up',
    description: 'Understand BIP39 mnemonic seed phrases used in cryptocurrency wallets. Learn how 12-24 words store your entire wallet.',
    keywords: ['BIP39 generator', 'mnemonic phrase', 'seed phrase', 'crypto wallet backup', 'BIP39 wordlist'],
    category: 'Crypto',
    publishedAt: '2025-06-11',
    content: `## What Is BIP39?\n\n**BIP39** defines a standard for generating mnemonic seed phrases — 12, 18, or 24 words that represent wallet entropy.\n\n## Security\n\n- 12 words = 128 bits of entropy (practically unbreakable).\n- 24 words = 256 bits of entropy.\n\n## Best Practices\n\n- **Write it on paper** — never digitally.\n- **Never share with anyone** — whoever has the phrase controls all assets.\n- This tool runs entirely in your browser; nothing is sent to servers.\n\n→ Try the [BIP39 Generator](/bip39-generator)`,
  },
  // ─── Converter ──────────────────────────────────────────────────────────────
  {
    slug: 'base64-string-guide',
    toolPath: '/base64-string-converter',
    title: 'Base64 Encoding Explained: What It Is and When to Use It',
    description: 'Learn what Base64 encoding is, how it works, and common use cases in web development.',
    keywords: ['base64 encode', 'base64 decode', 'base64 online', 'base64 string converter', 'encoding'],
    category: 'Converter',
    publishedAt: '2025-06-15',
    content: `## What Is Base64?\n\nBase64 encodes binary data using 64 printable ASCII characters.\n\n**Example:** \`Hello\` → \`SGVsbG8=\`\n\n## Common Uses\n\n- **HTTP Basic Auth** — \`username:password\` encoded as Base64 in headers.\n- **Data URIs** — Embed images directly in HTML.\n- **JWT tokens** — Header and payload are base64url encoded.\n\n## Base64 Is NOT Encryption\n\nAnyone can decode it instantly. **Never use Base64 to hide sensitive data.**\n\n→ Try the [Base64 String Converter](/base64-string-converter)`,
  },
  {
    slug: 'json-to-yaml-guide',
    toolPath: '/json-to-yaml-converter',
    title: 'JSON to YAML Converter: When and Why to Use YAML',
    description: 'Convert JSON to YAML and understand the differences. Learn when YAML is better than JSON for configuration files.',
    keywords: ['JSON to YAML', 'convert JSON YAML', 'YAML vs JSON', 'YAML formatter', 'JSON converter'],
    category: 'Converter',
    publishedAt: '2025-06-16',
    content: `## JSON vs YAML\n\n| Feature | JSON | YAML |\n|---|---|---|\n| Comments | ❌ | ✅ |\n| Readability | Machine-friendly | Human-friendly |\n| Common use | APIs | Config files |\n\n## Common Gotchas\n\n- \`yes\`, \`no\`, \`true\`, \`false\` have special YAML meanings — quote them if they're strings.\n- Tabs are illegal in YAML — use spaces only.\n\n→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`,
  },
  {
    slug: 'css-unit-converter-guide',
    toolPath: '/css-unit-converter',
    title: 'CSS Units Explained: px, rem, em, vw, vh and When to Use Each',
    description: 'Master CSS units with our converter. Learn the difference between px, rem, em, vw, and vh for responsive design.',
    keywords: ['CSS units', 'px to rem', 'em to px', 'CSS unit converter', 'rem vs em', 'viewport units'],
    category: 'Converter',
    publishedAt: '2025-06-17',
    content: `## CSS Unit Types\n\n- **px** — Absolute pixels.\n- **rem** — Relative to root font size (default 16px).\n- **em** — Relative to the current element's font size.\n- **vw / vh** — 1% of viewport width / height.\n\n## Quick Reference (root = 16px)\n\n| px | rem |\n|---|---|\n| 12px | 0.75rem |\n| 16px | 1rem |\n| 24px | 1.5rem |\n| 32px | 2rem |\n\n→ Try the [CSS Unit Converter](/css-unit-converter)`,
  },
  {
    slug: 'color-converter-guide',
    toolPath: '/color-converter',
    title: 'Color Formats Explained: HEX, RGB, HSL, and How to Convert Between Them',
    description: 'Learn about web color formats: HEX, RGB, RGBA, HSL, HSLA. Convert between them instantly.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color formats', 'CSS colors'],
    category: 'Converter',
    publishedAt: '2025-06-18',
    content: `## Web Color Formats\n\n**HEX:** \`#FF5733\` — Most common in CSS.\n\n**RGB:** \`rgb(255, 87, 51)\` — Explicit red, green, blue channels.\n\n**HSL:** \`hsl(14, 100%, 60%)\` — Hue, Saturation, Lightness.\n\n## Which to Use?\n\n| Scenario | Format |\n|---|---|\n| Design handoff | HEX |\n| Programmatic manipulation | HSL |\n| With transparency | RGBA or HSLA |\n\n→ Try the [Color Converter](/color-converter)`,
  },
  {
    slug: 'markdown-to-html-guide',
    toolPath: '/markdown-to-html',
    title: 'Markdown to HTML: A Practical Guide for Developers and Writers',
    description: 'Convert Markdown to clean HTML instantly. Learn Markdown syntax, flavors, and best practices.',
    keywords: ['markdown to html', 'markdown converter', 'markdown syntax', 'convert markdown', 'markdown online'],
    category: 'Converter',
    publishedAt: '2025-06-19',
    content: `## Markdown Syntax Quick Reference\n\n\`\`\`markdown\n# H1  ## H2  ### H3\n**bold**   *italic*   ~~strikethrough~~\n[Link](url)   ![Image](src)\n- unordered list\n1. ordered list\n> blockquote\n\`\`\`\n\n## Flavors\n\n- **CommonMark** — Standardized spec\n- **GFM (GitHub Flavored)** — Adds tables, task lists\n- **MDX** — Markdown + React JSX\n\n→ Try the [Markdown to HTML Converter](/markdown-to-html)`,
  },
  {
    slug: 'unix-timestamp-guide',
    toolPath: '/unix-timestamp',
    title: 'Unix Timestamps Explained: Epoch Time, Y2K38, and Conversions',
    description: 'Learn what Unix timestamps are, how to convert them, and about the Y2K38 problem.',
    keywords: ['unix timestamp', 'epoch time', 'timestamp converter', 'unix time', 'epoch to date'],
    category: 'Converter',
    publishedAt: '2025-06-20',
    content: `## What Is a Unix Timestamp?\n\nThe number of **seconds** elapsed since January 1, 1970, 00:00:00 UTC. Timezone-agnostic and universally supported.\n\n## Code Examples\n\n\`\`\`javascript\n// Current timestamp\nMath.floor(Date.now() / 1000)\n\n// Timestamp to Date\nnew Date(1716000000 * 1000).toISOString()\n\`\`\`\n\n## Y2K38 Problem\n\n32-bit integers overflow January 19, 2038. Modern systems use 64-bit integers.\n\n→ Try the [Unix Timestamp Converter](/unix-timestamp)`,
  },
  {
    slug: 'date-time-converter-guide',
    toolPath: '/date-converter',
    title: 'Date and Time Conversion: Timezones, Formats, and Common Pitfalls',
    description: 'Convert dates between formats and timezones. Learn about ISO 8601, UTC, and how to avoid timezone bugs.',
    keywords: ['date converter', 'time zone converter', 'ISO 8601', 'date format', 'UTC converter'],
    category: 'Converter',
    publishedAt: '2025-06-21',
    content: `## Common Date Formats\n\n| Format | Example |\n|---|---|\n| ISO 8601 | \`2024-05-18T08:00:00Z\` |\n| RFC 2822 | \`Sat, 18 May 2024 08:00:00 +0000\` |\n\n## Timezone Best Practices\n\n- **Store in UTC** always — convert to local time only for display.\n- Daylight Saving Time (DST) causes clocks to change.\n\n→ Try the [Date Converter](/date-converter)`,
  },
  {
    slug: 'temperature-converter-guide',
    toolPath: '/temperature-converter',
    title: 'Temperature Conversion: Celsius, Fahrenheit, Kelvin Explained',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin. Learn the formulas and understand when each scale is used.',
    keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'kelvin converter', 'temperature conversion'],
    category: 'Converter',
    publishedAt: '2025-06-22',
    content: `## Conversion Formulas\n\n\`\`\`\n°F = (°C × 9/5) + 32\n°C = (°F − 32) × 5/9\nK  = °C + 273.15\n\`\`\`\n\n## Key Reference Points\n\n| Description | °C | °F | K |\n|---|---|---|---|\n| Water freezes | 0 | 32 | 273.15 |\n| Body temp | 37 | 98.6 | 310.15 |\n| Water boils | 100 | 212 | 373.15 |\n\n→ Try the [Temperature Converter](/temperature-converter)`,
  },
  {
    slug: 'case-converter-guide',
    toolPath: '/case-converter',
    title: 'String Case Converter: camelCase, snake_case, PascalCase and More',
    description: 'Convert text between camelCase, snake_case, PascalCase, kebab-case, and other naming conventions instantly.',
    keywords: ['case converter', 'camelCase converter', 'snake_case', 'PascalCase', 'kebab-case'],
    category: 'Converter',
    publishedAt: '2025-06-23',
    content: `## Naming Conventions\n\n| Case | Example | Common Use |\n|---|---|---|\n| camelCase | \`myVariableName\` | JavaScript variables |\n| PascalCase | \`MyClassName\` | Classes, React components |\n| snake_case | \`my_variable_name\` | Python, database columns |\n| kebab-case | \`my-component-name\` | URLs, CSS classes |\n| SCREAMING_SNAKE | \`MY_CONSTANT\` | Constants |\n\n→ Try the [Case Converter](/case-converter)`,
  },
  {
    slug: 'roman-numeral-converter-guide',
    toolPath: '/roman-numeral-converter',
    title: 'Roman Numeral Converter: How to Read and Write Roman Numerals',
    description: 'Convert between decimal numbers and Roman numerals. Learn the rules, symbols, and history.',
    keywords: ['roman numeral converter', 'roman numerals', 'convert roman numerals', 'roman number calculator'],
    category: 'Converter',
    publishedAt: '2025-06-24',
    content: `## Roman Numeral Symbols\n\n| Symbol | Value |\n|---|---|\n| I | 1 |\n| V | 5 |\n| X | 10 |\n| L | 50 |\n| C | 100 |\n| D | 500 |\n| M | 1000 |\n\n## Examples\n\n\`\`\`\nXIV = 10 + 4 = 14\nMCMXCIX = 1999\nMMXXV = 2025\n\`\`\`\n\n→ Try the [Roman Numeral Converter](/roman-numeral-converter)`,
  },
  {
    slug: 'integer-base-converter-guide',
    toolPath: '/base-converter',
    title: 'Number Base Conversion: Binary, Octal, Decimal, Hex Explained',
    description: 'Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16).',
    keywords: ['base converter', 'binary to decimal', 'hex to decimal', 'octal converter', 'number base conversion'],
    category: 'Converter',
    publishedAt: '2025-06-25',
    content: `## Common Number Bases\n\n| Base | Name | Digits |\n|---|---|---|\n| 2 | Binary | 0, 1 |\n| 8 | Octal | 0–7 |\n| 10 | Decimal | 0–9 |\n| 16 | Hexadecimal | 0–9, A–F |\n\n## 255 in different bases:\n- Binary: \`11111111\`\n- Octal: \`377\`\n- Hex: \`FF\`\n\n→ Try the [Base Converter](/base-converter)`,
  },
  {
    slug: 'text-to-binary-guide',
    toolPath: '/text-to-binary',
    title: 'Text to Binary Converter: Encode Text as Binary (and Back)',
    description: 'Convert text to binary representation and back. Learn how computers represent characters as bits.',
    keywords: ['text to binary', 'binary converter', 'ASCII binary', 'text binary encoding', 'binary to text'],
    category: 'Converter',
    publishedAt: '2025-09-07',
    content: `## How Text Is Stored as Binary\n\n| Char | ASCII | Binary |\n|---|---|---|\n| A | 65 | 01000001 |\n| B | 66 | 01000010 |\n| a | 97 | 01100001 |\n\n**Text:** \`Hi\` → **Binary:** \`01001000 01101001\`\n\n## Encoding Standards\n\n- **ASCII** — 7 bits, 128 characters\n- **UTF-8** — Variable width, covers all Unicode\n\n→ Try the [Text to Binary Converter](/text-to-binary)`,
  },
  {
    slug: 'text-to-nato-guide',
    toolPath: '/text-to-nato-alphabet',
    title: 'NATO Phonetic Alphabet: Spell Words Clearly Over Radio and Phone',
    description: "Convert any word to NATO phonetic alphabet (Alpha, Bravo, Charlie...). Learn why it's used and how it works.",
    keywords: ['NATO phonetic alphabet', 'phonetic spelling', 'Alpha Bravo Charlie', 'military alphabet', 'ICAO alphabet'],
    category: 'Converter',
    publishedAt: '2025-09-08',
    content: `## NATO Phonetic Alphabet\n\n| Letter | NATO Word |\n|---|---|\n| A | Alpha |\n| B | Bravo |\n| C | Charlie |\n| D | Delta |\n| E | Echo |\n| F | Foxtrot |\n\n## Why It Exists\n\nCertain letters sound similar and are easily confused in noisy environments. NATO phonetics eliminate ambiguity.\n\n→ Try the [Text to NATO Alphabet](/text-to-nato-alphabet)`,
  },
  {
    slug: 'text-to-unicode-guide',
    toolPath: '/text-to-unicode',
    title: 'Unicode Explained: Characters, Code Points, and Encoding',
    description: 'Convert text to Unicode code points. Learn about Unicode, UTF-8, and how modern software handles international text.',
    keywords: ['unicode converter', 'text to unicode', 'unicode code points', 'UTF-8 encoding', 'unicode characters'],
    category: 'Converter',
    publishedAt: '2025-09-09',
    content: `## What Is Unicode?\n\nUnicode assigns a unique code point to every character in every language.\n\n- \`U+0041\` = A\n- \`U+4E2D\` = 中\n- \`U+1F600\` = 😀\n\n## UTF-8 Encoding\n\n| Range | Bytes |\n|---|---|\n| U+0000–U+007F | 1 byte |\n| U+0080–U+07FF | 2 bytes |\n| U+0800–U+FFFF | 3 bytes |\n| U+10000–U+10FFFF | 4 bytes |\n\n→ Try the [Text to Unicode Converter](/text-to-unicode)`,
  },
  {
    slug: 'yaml-to-json-guide',
    toolPath: '/yaml-to-json-converter',
    title: 'YAML to JSON Converter: When and How to Convert Configuration Files',
    description: 'Convert YAML to JSON with our free online tool. Learn when to use each format and common conversion pitfalls.',
    keywords: ['YAML to JSON', 'convert YAML JSON', 'YAML converter', 'JSON from YAML', 'configuration converter'],
    category: 'Converter',
    publishedAt: '2025-09-10',
    content: `## When to Convert YAML to JSON\n\n- **API requests** — Most APIs expect JSON, not YAML\n- **JavaScript parsing** — \`JSON.parse()\` built-in; no YAML parser needed\n- **Debugging** — JSON tools are more widely available\n\n→ Try the [YAML to JSON Converter](/yaml-to-json-converter)`,
  },
  {
    slug: 'toml-to-json-guide',
    toolPath: '/toml-to-json',
    title: 'TOML to JSON: What Is TOML and When Should You Use It?',
    description: 'Convert TOML to JSON. Learn about TOML configuration format, its advantages over YAML, and common use cases.',
    keywords: ['TOML to JSON', 'TOML format', 'TOML converter', 'TOML vs YAML', 'configuration format'],
    category: 'Converter',
    publishedAt: '2025-09-11',
    content: `## What Is TOML?\n\n**TOML** is a configuration file format with unambiguous semantics. Used by Rust (Cargo.toml), Python (pyproject.toml), and Hugo.\n\n## TOML vs YAML vs JSON\n\n| | TOML | YAML | JSON |\n|---|---|---|---|\n| Comments | ✅ | ✅ | ❌ |\n| Typed values | ✅ Explicit | ❌ Auto-typing | Partial |\n| Ambiguity | Low | High | Low |\n\n→ Try the [TOML to JSON Converter](/toml-to-json)`,
  },
  {
    slug: 'base64-file-converter-guide',
    toolPath: '/base64-file-converter',
    title: 'Base64 File Converter: Encode Any File to Base64 String',
    description: 'Convert any file to Base64 string and back. Learn when to use Base64 for file embedding and data URIs.',
    keywords: ['base64 file converter', 'file to base64', 'base64 encode file', 'data URI', 'embed file base64'],
    category: 'Converter',
    publishedAt: '2025-09-13',
    content: `## File to Base64 Use Cases\n\n- **Data URIs** — Embed small images directly in HTML/CSS\n- **Email attachments** — MIME encoding\n- **API transmission** — Send binary files in JSON payloads\n\n## Size Impact\n\nBase64 increases file size by ~33%. Only use for small files (<50KB).\n\n→ Try the [Base64 File Converter](/base64-file-converter)`,
  },
  {
    slug: 'xml-to-json-guide',
    toolPath: '/xml-to-json',
    title: 'XML to JSON Converter: Migrate from Legacy XML APIs',
    description: 'Convert XML to JSON for modern applications. Learn about the structural differences and common conversion patterns.',
    keywords: ['XML to JSON', 'convert XML JSON', 'XML converter', 'XML API to JSON', 'XML parser'],
    category: 'Converter',
    publishedAt: '2025-09-18',
    content: `## XML vs JSON for APIs\n\nMost modern APIs use JSON, but many legacy systems still use XML. Converting to JSON makes them easier to work with in JavaScript.\n\n→ Try the [XML to JSON Converter](/xml-to-json)`,
  },
  // ─── Web ────────────────────────────────────────────────────────────────────
  {
    slug: 'url-encoder-guide',
    toolPath: '/url-encoder',
    title: 'URL Encoding Explained: Why Special Characters Must Be Escaped',
    description: 'Learn why URLs need encoding, what percent-encoding is, and how to encode/decode URLs correctly.',
    keywords: ['URL encoding', 'percent encoding', 'URL encode decode', 'encodeURIComponent', 'URL special characters'],
    category: 'Web',
    publishedAt: '2025-06-28',
    content: `## Why URLs Need Encoding\n\nURLs only support ASCII. Characters like spaces, \`&\`, \`=\`, \`#\` must be percent-encoded.\n\n| Character | Encoded |\n|---|---|\n| space | \`%20\` |\n| \`&\` | \`%26\` |\n| Chinese 中 | \`%E4%B8%AD\` |\n\n## encodeURI vs encodeURIComponent\n\n\`\`\`javascript\n// Use for individual query parameter values\nencodeURIComponent('hello world & more')\n// → 'hello%20world%20%26%20more'\n\`\`\`\n\n→ Try the [URL Encoder/Decoder](/url-encoder)`,
  },
  {
    slug: 'http-status-codes-guide',
    toolPath: '/http-status-codes',
    title: 'HTTP Status Codes: The Complete Developer Reference',
    description: 'A comprehensive guide to all HTTP status codes: 1xx, 2xx, 3xx, 4xx, 5xx with real-world examples.',
    keywords: ['HTTP status codes', '404 not found', '500 server error', 'HTTP 301 redirect', 'status code reference'],
    category: 'Web',
    publishedAt: '2025-06-29',
    content: `## Status Code Categories\n\n| Range | Meaning |\n|---|---|\n| 2xx | Success |\n| 3xx | Redirect |\n| 4xx | Client error |\n| 5xx | Server error |\n\n## Most Important Codes\n\n- **200** OK, **201** Created, **204** No Content\n- **301** Moved Permanently, **400** Bad Request\n- **401** Unauthorized, **403** Forbidden, **404** Not Found\n- **429** Too Many Requests, **500** Internal Server Error\n\n→ Try the [HTTP Status Codes Reference](/http-status-codes)`,
  },
  {
    slug: 'crontab-generator-guide',
    toolPath: '/crontab-generator',
    title: 'Crontab Syntax Explained: Schedule Cron Jobs Like a Pro',
    description: 'Master crontab scheduling syntax with our visual generator. Learn how to write cron expressions for any schedule.',
    keywords: ['crontab generator', 'cron syntax', 'cron job', 'cron expression', 'schedule task linux'],
    category: 'Web',
    publishedAt: '2025-06-30',
    content: `## Crontab Syntax\n\n\`\`\`\n* * * * * command\n│ │ │ │ └── day of week\n│ │ │ └──── month\n│ │ └────── day of month\n│ └──────── hour\n└────────── minute\n\`\`\`\n\n## Common Schedules\n\n| Expression | When |\n|---|---|\n| \`* * * * *\` | Every minute |\n| \`0 0 * * *\` | Daily at midnight |\n| \`*/15 * * * *\` | Every 15 minutes |\n| \`0 9 * * 1-5\` | Weekdays at 9am |\n\n→ Try the [Crontab Generator](/crontab-generator)`,
  },
  {
    slug: 'regex-tester-guide',
    toolPath: '/regex-tester',
    title: 'Regular Expressions Guide: Write, Test, and Debug Regex Online',
    description: 'Learn regex syntax from basics to advanced. Test your expressions instantly and avoid common pitfalls.',
    keywords: ['regex tester', 'regular expressions', 'regex online', 'regex patterns', 'regex tutorial'],
    category: 'Web',
    publishedAt: '2025-07-01',
    content: `## Essential Regex Syntax\n\n| Pattern | Matches |\n|---|---|\n| \`.\` | Any character |\n| \`\\d\` | Digit (0–9) |\n| \`\\w\` | Word character |\n| \`^\` | Start of string |\n| \`$\` | End of string |\n| \`*\` | 0 or more |\n| \`+\` | 1 or more |\n\n## Flags: \`g\` (global), \`i\` (case-insensitive), \`m\` (multiline)\n\n→ Try the [Regex Tester](/regex-tester)`,
  },
  {
    slug: 'jwt-parser-web-guide',
    toolPath: '/jwt-parser',
    title: 'How to Parse and Debug JWT Tokens',
    description: 'Use our online JWT parser to decode, inspect, and debug JSON Web Tokens without any server-side code.',
    keywords: ['JWT debug', 'parse JWT online', 'inspect JWT', 'JWT decode', 'JWT claims viewer'],
    category: 'Web',
    publishedAt: '2025-07-02',
    content: `## Quickly Decode Any JWT\n\nPaste any JWT token and instantly see:\n- **Header** — Algorithm and token type\n- **Payload** — All claims with human-readable timestamps\n- **Expiry status** — Whether the token is still valid\n\nAll decoding is done in your browser — tokens never leave your device.\n\n→ Try the [JWT Parser](/jwt-parser)`,
  },
  {
    slug: 'url-parser-guide',
    toolPath: '/url-parser',
    title: 'URL Structure Explained: Parse and Understand Any URL',
    description: 'Learn the anatomy of a URL: protocol, host, port, path, query string, and fragment. Parse any URL instantly.',
    keywords: ['URL parser', 'URL structure', 'parse URL', 'URL anatomy', 'query string'],
    category: 'Web',
    publishedAt: '2025-07-03',
    content: `## URL Anatomy\n\n\`\`\`\nhttps://user:pass@example.com:8080/path?key=val#section\n\`\`\`\n\n## Query String Parsing\n\n\`\`\`javascript\nconst url = new URL('https://example.com/search?q=hello&lang=en')\nurl.searchParams.get('q')    // "hello"\nurl.searchParams.get('lang') // "en"\n\`\`\`\n\n→ Try the [URL Parser](/url-parser)`,
  },
  {
    slug: 'meta-tag-generator-guide',
    toolPath: '/og-meta-generator',
    title: 'Open Graph Meta Tags: How to Control Social Media Previews',
    description: 'Generate Open Graph and Twitter Card meta tags to control how your page appears when shared on social media.',
    keywords: ['Open Graph meta tags', 'og:image', 'meta tag generator', 'social media preview', 'Twitter card'],
    category: 'Web',
    publishedAt: '2025-07-04',
    content: `## Essential OG Tags\n\n\`\`\`html\n<meta property="og:title" content="Page Title" />\n<meta property="og:description" content="Page description" />\n<meta property="og:image" content="https://example.com/preview.jpg" />\n<meta property="og:url" content="https://example.com/page" />\n<meta property="og:type" content="website" />\n\`\`\`\n\n## Best Practices\n\n- **og:image** should be 1200×630px\n- Keep og:description under 160 characters\n\n→ Try the [Meta Tag Generator](/og-meta-generator)`,
  },
  {
    slug: 'device-information-guide',
    toolPath: '/device-information',
    title: 'Device Information: What Your Browser Reveals About You',
    description: 'See what information your browser exposes: screen size, OS, browser version, language, timezone, and more.',
    keywords: ['device information', 'browser fingerprint', 'user agent', 'screen resolution', 'browser info'],
    category: 'Web',
    publishedAt: '2025-08-19',
    content: `## What Browsers Expose\n\n| Data | Example |\n|---|---|\n| User Agent | Mozilla/5.0 (Macintosh...) |\n| Screen size | 1920×1080, 2x pixel ratio |\n| Language | en-US |\n| Timezone | America/New_York |\n\n## Browser Fingerprinting\n\nCombining these data points creates a unique "fingerprint" that can track users without cookies.\n\n→ Try the [Device Information Tool](/device-information)`,
  },
  {
    slug: 'mime-types-guide',
    toolPath: '/mime-types',
    title: 'MIME Types: What They Are and How to Use Them',
    description: 'Learn about MIME types (media types), how they work in HTTP headers, and find the right type for any file extension.',
    keywords: ['MIME types', 'media type', 'content type', 'HTTP header', 'file extension MIME'],
    category: 'Web',
    publishedAt: '2025-08-20',
    content: `## Common MIME Types\n\n| Extension | MIME Type |\n|---|---|\n| .html | \`text/html\` |\n| .css | \`text/css\` |\n| .js | \`application/javascript\` |\n| .json | \`application/json\` |\n| .png | \`image/png\` |\n| .pdf | \`application/pdf\` |\n\n## Why It Matters\n\nBrowsers use MIME types (not file extensions) to decide how to handle content.\n\n→ Try the [MIME Types Reference](/mime-types)`,
  },
  {
    slug: 'user-agent-parser-guide',
    toolPath: '/user-agent-parser',
    title: 'User Agent Parser: Detect Browser, OS, and Device from User Agent Strings',
    description: 'Parse and understand User Agent strings. Learn browser detection, OS identification, and device type detection.',
    keywords: ['user agent parser', 'user agent string', 'browser detection', 'OS detection', 'device detection'],
    category: 'Web',
    publishedAt: '2025-08-21',
    content: `## User Agent String Format\n\n\`\`\`\nMozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\n(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\n\`\`\`\n\nAll browsers include \`Mozilla/5.0\` for historical compatibility reasons.\n\n## Warning: UA Spoofing\n\nUser agents can be easily spoofed. Use feature detection for browser compatibility.\n\n→ Try the [User Agent Parser](/user-agent-parser)`,
  },
  {
    slug: 'keycode-info-guide',
    toolPath: '/keycode-info',
    title: 'JavaScript Key Codes: Every Keyboard Key and Its Event Properties',
    description: 'Find the keyCode, key, and code for any keyboard key. Learn the difference between keyCode, which, key, and code.',
    keywords: ['keycode', 'JavaScript key event', 'key code reference', 'event.key', 'keyboard codes'],
    category: 'Web',
    publishedAt: '2025-08-22',
    content: `## Key Event Properties\n\n\`\`\`javascript\ndocument.addEventListener('keydown', (e) => {\n  e.key     // "a", "Enter", "ArrowLeft" (semantic value)\n  e.code    // "KeyA", "Enter", "ArrowLeft" (physical key)\n  e.keyCode // 65, 13, 37 (deprecated)\n});\n\`\`\`\n\n## Common Key Codes\n\n| Key | e.keyCode |\n|---|---|\n| Enter | 13 |\n| Space | 32 |\n| Escape | 27 |\n| A | 65 |\n\n→ Try the [Keycode Info Tool](/keycode-info)`,
  },
  {
    slug: 'slugify-string-guide',
    toolPath: '/slugify-string',
    title: 'URL Slugs Explained: How to Create SEO-Friendly URLs',
    description: 'Convert any text into a URL-friendly slug. Learn best practices for SEO-friendly URL structure.',
    keywords: ['slugify', 'URL slug', 'SEO URL', 'create slug', 'URL friendly string'],
    category: 'Web',
    publishedAt: '2025-08-23',
    content: `## Slugification Rules\n\n1. Convert to lowercase\n2. Replace spaces and special chars with hyphens\n3. Remove non-ASCII characters\n4. Remove duplicate hyphens\n5. Trim leading/trailing hyphens\n\n**Example:** "Hello, World! How Are You?" → \`hello-world-how-are-you\`\n\n## SEO Best Practices for URLs\n\n- Keep slugs short and descriptive (3–5 words)\n- Include the main keyword\n- Use hyphens (not underscores)\n\n→ Try the [Slugify String Tool](/slugify-string)`,
  },
  {
    slug: 'html-entities-guide',
    toolPath: '/html-entities',
    title: 'HTML Entities: Encode Special Characters for Safe Web Display',
    description: 'Learn which HTML characters need encoding, common entity names, and how to prevent XSS with proper encoding.',
    keywords: ['HTML entities', 'HTML encode', 'HTML escape', 'special characters HTML', 'XSS prevention'],
    category: 'Web',
    publishedAt: '2025-08-24',
    content: `## Essential HTML Entities\n\n| Character | Entity Name |\n|---|---|\n| \`<\` | \`&lt;\` |\n| \`>\` | \`&gt;\` |\n| \`&\` | \`&amp;\` |\n| \`"\` | \`&quot;\` |\n\n## XSS Prevention\n\n\`\`\`javascript\n// CORRECT - safe encoding\nelement.textContent = userInput;\n// Never: element.innerHTML = userInput;\n\`\`\`\n\n→ Try the [HTML Entities Tool](/html-entities)`,
  },
  {
    slug: 'basic-auth-generator-guide',
    toolPath: '/basic-auth-generator',
    title: 'HTTP Basic Authentication: How It Works and How to Generate Headers',
    description: 'Understand HTTP Basic Auth, generate Base64-encoded credentials, and learn when to use (and not use) Basic Auth.',
    keywords: ['basic auth generator', 'HTTP basic auth', 'authorization header', 'basic authentication', 'base64 credentials'],
    category: 'Web',
    publishedAt: '2025-08-25',
    content: `## How Basic Auth Works\n\nHTTP Basic Authentication encodes \`username:password\` in Base64 and sends it in the \`Authorization\` header:\n\n\`\`\`http\nAuthorization: Basic dXNlcjpwYXNzd29yZA==\n\`\`\`\n\n## Curl Example\n\n\`\`\`bash\ncurl -u username:password https://api.example.com/data\n\`\`\`\n\n→ Try the [Basic Auth Generator](/basic-auth-generator)`,
  },
  {
    slug: 'safelink-decoder-guide',
    toolPath: '/safelink-decoder',
    title: 'Safelink Decoder: Unwrap Redirected URLs from Email Security Tools',
    description: 'Decode "safe links" wrapped by email security tools (Microsoft ATP, Proofpoint) to see the original URL.',
    keywords: ['safelink decoder', 'Microsoft safelinks', 'Proofpoint URL', 'unwrap URL', 'email redirect decoder'],
    category: 'Web',
    publishedAt: '2025-08-26',
    content: `## What Are Safelinks?\n\nEmail security gateways rewrite URLs in emails to proxy them through their scanning service.\n\n**Original URL:** \`https://example.com/resource\`\n\n**After wrapping:** \`https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2F...\`\n\n## Privacy Note\n\nAll decoding is done locally in your browser — no URLs are sent to any server.\n\n→ Try the [Safelink Decoder](/safelink-decoder)`,
  },
  {
    slug: 'html-wysiwyg-editor-guide',
    toolPath: '/html-wysiwyg-editor',
    title: 'WYSIWYG HTML Editor: Edit and Export Clean HTML Online',
    description: 'Use our browser-based WYSIWYG editor to create formatted HTML content without writing code.',
    keywords: ['HTML WYSIWYG editor', 'online HTML editor', 'rich text editor', 'HTML generator', 'visual HTML editor'],
    category: 'Web',
    publishedAt: '2025-09-06',
    content: `## What Is WYSIWYG?\n\n**WYSIWYG** (What You See Is What You Get) editors let you format text visually while the editor generates the underlying HTML.\n\n## Use Cases\n\n- Drafting email newsletter content\n- Creating blog post HTML\n- Non-technical content editing\n\n→ Try the [HTML WYSIWYG Editor](/html-wysiwyg-editor)`,
  },
  // ─── Development ────────────────────────────────────────────────────────────
  {
    slug: 'json-formatter-guide',
    toolPath: '/json-prettify',
    title: "How to Format and Validate JSON: A Developer's Guide",
    description: 'Learn to format, validate, and debug JSON. Understand common JSON errors and best practices.',
    keywords: ['JSON formatter', 'JSON validator', 'format JSON online', 'JSON pretty print', 'JSON syntax error'],
    category: 'Development',
    publishedAt: '2025-07-08',
    content: `## Common JSON Errors\n\n| Error | Wrong | Correct |\n|---|---|---|\n| Trailing comma | \`{"a":1,}\` | \`{"a":1}\` |\n| Single quotes | \`{'key': 'val'}\` | \`{"key": "val"}\` |\n| Comments | \`// not allowed\` | Remove comments |\n\n→ Try the [JSON Formatter](/json-prettify)`,
  },
  {
    slug: 'chmod-calculator-guide',
    toolPath: '/chmod-calculator',
    title: 'Linux File Permissions Explained: chmod Calculator and Reference',
    description: 'Master Unix file permissions. Learn rwx notation, octal values, and use our chmod calculator.',
    keywords: ['chmod calculator', 'linux permissions', 'chmod octal', 'file permissions unix', 'rwx permissions'],
    category: 'Development',
    publishedAt: '2025-07-09',
    content: `## Permission Structure\n\n\`\`\`\n-rwxr-xr--\n └┬┘└┬┘└┬┘\n  │  │  └── Others: r-- = 4\n  │  └───── Group: r-x = 5\n  └──────── Owner: rwx = 7\n\`\`\`\n\nr=4, w=2, x=1.\n\n| Octal | Meaning |\n|---|---|\n| 755 | Standard for executables |\n| 644 | Standard for text files |\n| 600 | Private files (SSH keys) |\n\n→ Try the [chmod Calculator](/chmod-calculator)`,
  },
  {
    slug: 'docker-compose-converter-guide',
    toolPath: '/docker-run-to-docker-compose-converter',
    title: 'Convert docker run to docker-compose: A Practical Guide',
    description: 'Convert docker run commands to docker-compose.yml. Understand volumes, ports, environment variables.',
    keywords: ['docker run to compose', 'docker-compose converter', 'docker compose yml', 'docker migration'],
    category: 'Development',
    publishedAt: '2025-07-10',
    content: `## docker run → docker-compose\n\n**docker run:**\n\`\`\`bash\ndocker run -d --name app -p 8080:80 -e KEY=val nginx:alpine\n\`\`\`\n\n**docker-compose.yml:**\n\`\`\`yaml\nservices:\n  app:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n    environment:\n      - KEY=val\n\`\`\`\n\n→ Try the [Docker Run → Compose Converter](/docker-run-to-docker-compose-converter)`,
  },
  {
    slug: 'sql-formatter-guide',
    toolPath: '/sql-prettify',
    title: 'How to Format SQL Queries for Better Readability',
    description: 'Learn SQL formatting best practices and use our formatter to clean up messy queries.',
    keywords: ['SQL formatter', 'SQL prettify', 'format SQL online', 'SQL beautifier'],
    category: 'Development',
    publishedAt: '2025-07-11',
    content: `## Best Practices\n\n1. Uppercase SQL keywords\n2. One clause per line\n3. Indent selected columns\n4. Explicit JOIN types (INNER, LEFT, RIGHT)\n\n→ Try the [SQL Formatter](/sql-prettify)`,
  },
  {
    slug: 'git-cheat-sheet',
    toolPath: '/git-memo',
    title: 'Git Command Cheat Sheet: The Most Useful Commands Explained',
    description: 'A comprehensive Git reference covering everyday commands, branching, undo operations, and advanced workflows.',
    keywords: ['git cheat sheet', 'git commands', 'git memo', 'git reference', 'git workflow'],
    category: 'Development',
    publishedAt: '2025-07-12',
    content: `## Daily Git Workflow\n\n\`\`\`bash\ngit status\ngit add .\ngit commit -m "message"\ngit push origin main\ngit pull\n\`\`\`\n\n## Undoing Changes\n\n\`\`\`bash\ngit restore <file>          # Discard working changes\ngit commit --amend          # Edit last commit\ngit revert <commit>         # Safe undo\ngit reset --soft HEAD~1     # Undo commit, keep changes\n\`\`\`\n\n→ Try the [Git Memo](/git-memo)`,
  },
  {
    slug: 'json-diff-guide',
    toolPath: '/json-diff',
    title: 'JSON Diff: How to Compare Two JSON Objects',
    description: 'Compare two JSON objects and highlight differences. Learn how JSON diff tools work and when to use them.',
    keywords: ['JSON diff', 'compare JSON', 'JSON comparison', 'JSON difference', 'JSON merge'],
    category: 'Development',
    publishedAt: '2025-07-13',
    content: `## Types of Differences\n\n- **Added** — Key exists in new but not old\n- **Removed** — Key exists in old but not new\n- **Modified** — Same key, different value\n\n→ Try the [JSON Diff Tool](/json-diff)`,
  },
  {
    slug: 'xml-formatter-guide',
    toolPath: '/xml-formatter',
    title: 'XML Formatter: How to Pretty-Print and Validate XML',
    description: 'Format and validate XML documents. Learn XML structure, namespaces, and common parsing errors.',
    keywords: ['XML formatter', 'XML validator', 'pretty print XML', 'XML online', 'XML beautifier'],
    category: 'Development',
    publishedAt: '2025-07-14',
    content: `## Common XML Errors\n\n- **Unclosed tags** — Every opening tag needs a closing tag.\n- **Case sensitivity** — \`<Tag>\` and \`<tag>\` are different.\n- **Special characters** — Use \`&amp;\`, \`&lt;\`, \`&gt;\` instead of &, <, >.\n- **Single root** — XML must have exactly one root element.\n\n→ Try the [XML Formatter](/xml-formatter)`,
  },
  {
    slug: 'yaml-viewer-guide',
    toolPath: '/yaml-prettify',
    title: 'YAML Viewer and Formatter: Validate and Pretty-Print YAML',
    description: 'Format and validate YAML files. Learn YAML syntax, common errors, and best practices.',
    keywords: ['YAML formatter', 'YAML validator', 'YAML viewer', 'pretty print YAML', 'YAML syntax'],
    category: 'Development',
    publishedAt: '2025-07-15',
    content: `## Common YAML Mistakes\n\n- **Tabs are illegal** — Only spaces for indentation.\n- **Auto-typing** — \`true\`, \`false\`, \`yes\`, \`no\`, \`null\` are special values.\n\n## YAML in DevOps\n\n- **Docker Compose**, **Kubernetes**, **GitHub Actions**, **Ansible**\n\n→ Try the [YAML Formatter](/yaml-prettify)`,
  },
  {
    slug: 'json-to-csv-guide',
    toolPath: '/json-to-csv',
    title: 'JSON to CSV Converter: Export Data for Spreadsheets',
    description: 'Convert JSON arrays to CSV format for use in Excel, Google Sheets, and data analysis tools.',
    keywords: ['JSON to CSV', 'convert JSON CSV', 'JSON export', 'JSON spreadsheet', 'CSV converter'],
    category: 'Development',
    publishedAt: '2025-08-17',
    content: `## JSON to CSV Use Cases\n\n- Export API data to Excel / Google Sheets\n- Data migration between systems\n- Prepare data for analysis tools (pandas, R, Tableau)\n\n## CSV Format Rules\n\n- Values with commas must be quoted: \`"New York, NY"\`\n- Values with quotes escape as double-quote: \`"He said ""hello"""\`\n\n→ Try the [JSON to CSV Converter](/json-to-csv)`,
  },
  {
    slug: 'email-normalizer-guide',
    toolPath: '/email-normalizer',
    title: 'Email Normalizer: Clean and Standardize Email Addresses',
    description: 'Normalize email addresses to prevent duplicate accounts. Learn about Gmail dots, plus-addressing, and provider-specific rules.',
    keywords: ['email normalizer', 'email validation', 'email deduplication', 'Gmail aliases', 'email cleaning'],
    category: 'Development',
    publishedAt: '2025-09-05',
    content: `## Email Normalization Rules\n\n### Gmail\n- Dots are ignored: \`john.doe@gmail.com\` = \`johndoe@gmail.com\`\n- Plus-addressing: \`john+anything@gmail.com\` → same inbox\n- Case-insensitive\n\n## Why Normalize?\n\n- Prevent duplicate accounts\n- Consistent storage in databases\n- Email deduplication in mailing lists\n\n→ Try the [Email Normalizer](/email-normalizer)`,
  },
  {
    slug: 'json-minify-guide',
    toolPath: '/json-minify',
    title: 'JSON Minification: Reduce JSON File Size for Production',
    description: 'Minify JSON by removing whitespace. Learn when to minify and how much size reduction to expect.',
    keywords: ['JSON minify', 'minify JSON', 'compress JSON', 'JSON optimize', 'JSON size reduction'],
    category: 'Development',
    publishedAt: '2025-09-12',
    content: `## What Is JSON Minification?\n\nMinification removes all unnecessary whitespace, reducing file size without changing the data.\n\n**Formatted (89 bytes)** → **Minified (37 bytes)** = **58% savings**\n\n## When to Minify\n\n- **API responses** — Reduce bandwidth\n- **Static config files** — Smaller download size\n\n→ Try the [JSON Minify Tool](/json-minify)`,
  },
  {
    slug: 'random-port-generator-guide',
    toolPath: '/random-port-generator',
    title: 'Network Ports Explained: Reserved, Registered, and Dynamic Ranges',
    description: 'Generate random available network ports. Learn about port ranges, well-known ports, and how to avoid conflicts.',
    keywords: ['random port generator', 'port number', 'network port', 'available port', 'port ranges'],
    category: 'Development',
    publishedAt: '2025-09-16',
    content: `## Port Number Ranges\n\n| Range | Type | Examples |\n|---|---|---|\n| 0 – 1023 | Well-known | 80 HTTP, 443 HTTPS, 22 SSH |\n| 1024 – 49151 | Registered | 3000 Node.js, 5432 PostgreSQL |\n| 49152 – 65535 | Dynamic | OS-assigned temporary ports |\n\n→ Try the [Random Port Generator](/random-port-generator)`,
  },
  {
    slug: 'json-viewer-guide',
    toolPath: '/json-viewer',
    title: 'JSON Viewer: Navigate and Explore Complex JSON Structures',
    description: 'Explore large JSON files with a collapsible tree viewer. Navigate nested objects and arrays with ease.',
    keywords: ['JSON viewer', 'JSON tree view', 'explore JSON', 'JSON explorer', 'JSON browser'],
    category: 'Development',
    publishedAt: '2025-09-17',
    content: `## Why Use a JSON Tree Viewer?\n\nLarge JSON responses can be thousands of lines deep. A tree viewer lets you:\n\n- Expand/collapse nodes to focus on relevant data\n- See the data hierarchy visually\n- Click to copy specific values\n\n→ Try the [JSON Viewer](/json-viewer)`,
  },
  // ─── Network ────────────────────────────────────────────────────────────────
  {
    slug: 'ipv4-subnet-calculator-guide',
    toolPath: '/ipv4-subnet-calculator',
    title: 'IPv4 Subnetting Explained: CIDR, Subnet Masks, and Network Ranges',
    description: 'Master IPv4 subnetting. Learn CIDR notation, calculate network ranges, hosts, and broadcast addresses.',
    keywords: ['subnet calculator', 'CIDR notation', 'IPv4 subnetting', 'subnet mask', 'network range'],
    category: 'Network',
    publishedAt: '2025-07-20',
    content: `## CIDR Notation\n\n\`192.168.1.0/24\` — 24-bit subnet mask, 254 usable hosts.\n\n## Subnet Reference\n\n| CIDR | Hosts |\n|---|---|\n| /24 | 254 |\n| /25 | 126 |\n| /26 | 62 |\n| /28 | 14 |\n\n## Private IP Ranges\n\n| CIDR | Range |\n|---|---|\n| 10.0.0.0/8 | 10.0.0.0 – 10.255.255.255 |\n| 192.168.0.0/16 | 192.168.0.0 – 192.168.255.255 |\n\n→ Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)`,
  },
  {
    slug: 'mac-address-guide',
    toolPath: '/mac-address-generator',
    title: 'MAC Address Explained: Format, OUI, and How to Generate One',
    description: 'Learn about MAC addresses, their format, OUI lookup, and how to generate random or vendor-specific MAC addresses.',
    keywords: ['MAC address generator', 'MAC address lookup', 'OUI lookup', 'MAC address format', 'network hardware'],
    category: 'Network',
    publishedAt: '2025-07-21',
    content: `## What Is a MAC Address?\n\nA **MAC address** is a unique hardware identifier: \`AA:BB:CC:DD:EE:FF\`\n\n- **First 3 bytes (OUI)** — Manufacturer\n- **Last 3 bytes** — Device identifier\n\n→ Try the [MAC Address Generator](/mac-address-generator) or [Lookup](/mac-address-lookup)`,
  },
  {
    slug: 'ipv4-range-expander-guide',
    toolPath: '/ipv4-range-expander',
    title: 'IPv4 Range Expander: List All IPs in a CIDR Range',
    description: 'Expand a CIDR range or IP range into a complete list of individual IP addresses.',
    keywords: ['IPv4 range', 'CIDR expander', 'list IP addresses', 'IP range calculator', 'subnet to IP list'],
    category: 'Network',
    publishedAt: '2025-09-01',
    content: `## When Do You Need to Expand IP Ranges?\n\n- Firewall rules that require individual IPs\n- Network inventory and auditing\n- Security scanning of specific subnets\n\n## Example\n\n\`192.168.1.0/30\` → 192.168.1.0, 192.168.1.1, 192.168.1.2, 192.168.1.3\n\n→ Try the [IPv4 Range Expander](/ipv4-range-expander)`,
  },
  {
    slug: 'ipv4-address-converter-guide',
    toolPath: '/ipv4-address-converter',
    title: 'IPv4 Address Converter: Decimal, Binary, Hex, and Integer',
    description: 'Convert IPv4 addresses between dotted decimal, binary, hexadecimal, and 32-bit integer representations.',
    keywords: ['IPv4 converter', 'IP address binary', 'IP to hex', 'IP address integer', 'IP address format'],
    category: 'Network',
    publishedAt: '2025-09-02',
    content: `## IPv4 Representation Formats\n\n**192.168.1.1** in different formats:\n\n| Format | Value |\n|---|---|\n| Dotted decimal | 192.168.1.1 |\n| Binary | 11000000.10101000.00000001.00000001 |\n| Hex | 0xC0A80101 |\n| 32-bit integer | 3232235777 |\n\n→ Try the [IPv4 Address Converter](/ipv4-address-converter)`,
  },
  {
    slug: 'ipv6-ula-generator-guide',
    toolPath: '/ipv6-ula-generator',
    title: 'IPv6 ULA Generator: Create Unique Local Addresses for Private Networks',
    description: 'Generate IPv6 Unique Local Addresses (ULA) for private networks. Understand the fd00::/8 address space.',
    keywords: ['IPv6 ULA', 'unique local address', 'IPv6 private', 'fd00 range', 'IPv6 generator'],
    category: 'Network',
    publishedAt: '2025-09-03',
    content: `## What Is IPv6 ULA?\n\n**Unique Local Addresses (ULA)** are IPv6 addresses for private networks (analogous to IPv4's 192.168.x.x). They start with \`fd\` (RFC 4193).\n\n**ULA vs Link-Local:**\n\n| | ULA (fd::/8) | Link-Local (fe80::/10) |\n|---|---|---|\n| Routable | Within org | Same link only |\n\n→ Try the [IPv6 ULA Generator](/ipv6-ula-generator)`,
  },
  {
    slug: 'mac-address-lookup-guide',
    toolPath: '/mac-address-lookup',
    title: 'MAC Address Lookup: Find the Manufacturer from Any MAC Address',
    description: 'Look up the vendor/manufacturer of any network device using its MAC address OUI prefix.',
    keywords: ['MAC address lookup', 'OUI lookup', 'MAC vendor lookup', 'network manufacturer', 'MAC address vendor'],
    category: 'Network',
    publishedAt: '2025-09-04',
    content: `## How MAC Lookup Works\n\nThe first 3 bytes of a MAC address are the **OUI**, assigned by IEEE to device manufacturers.\n\n| OUI | Manufacturer |\n|---|---|\n| 00:1A:2B | Cisco |\n| 3C:22:FB | Apple |\n| 00:50:56 | VMware |\n\n→ Try the [MAC Address Lookup](/mac-address-lookup)`,
  },
  // ─── Math ───────────────────────────────────────────────────────────────────
  {
    slug: 'percentage-calculator-guide',
    toolPath: '/percentage-calculator',
    title: 'Percentage Calculations: Formulas, Examples, and a Free Calculator',
    description: 'Learn all types of percentage calculations: X% of Y, percentage change, what percent X is of Y.',
    keywords: ['percentage calculator', 'how to calculate percentage', 'percentage change', 'percent of number'],
    category: 'Math',
    publishedAt: '2025-07-25',
    content: `## Percentage Formulas\n\n**X% of Y:** \`result = Y × (X / 100)\` → 20% of 150 = **30**\n\n**% Change:** \`(New - Old) / |Old| × 100\` → 80→100 = **+25%**\n\n## Quick Mental Math\n\n- 10% = divide by 10\n- 25% = divide by 4\n- 1% = divide by 100\n\n→ Try the [Percentage Calculator](/percentage-calculator)`,
  },
  {
    slug: 'bmi-calculator-guide',
    toolPath: '/bmi-calculator',
    title: 'BMI Calculator: What Your Body Mass Index Means',
    description: 'Calculate your BMI and understand health categories. Learn about BMI limitations and better health metrics.',
    keywords: ['BMI calculator', 'body mass index', 'healthy weight', 'BMI chart', 'overweight BMI'],
    category: 'Math',
    publishedAt: '2025-07-26',
    content: `## BMI Formula\n\n\`BMI = weight(kg) / height(m)²\`\n\n## Categories\n\n| BMI | Category |\n|---|---|\n| < 18.5 | Underweight |\n| 18.5–24.9 | Normal weight |\n| 25–29.9 | Overweight |\n| 30+ | Obese |\n\n→ Try the [BMI Calculator](/bmi-calculator)`,
  },
  {
    slug: 'math-evaluator-guide',
    toolPath: '/math-evaluator',
    title: 'Math Expression Evaluator: Calculate Complex Formulas Online',
    description: 'Evaluate mathematical expressions, use variables, and compute scientific functions in your browser.',
    keywords: ['math evaluator', 'math calculator', 'expression calculator', 'scientific calculator online', 'formula evaluator'],
    category: 'Math',
    publishedAt: '2025-07-28',
    content: `## Supported Operations\n\n- Basic: \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, \`^\` (power)\n- Functions: \`sqrt()\`, \`abs()\`, \`log()\`, \`sin()\`, \`cos()\`\n- Constants: \`pi\`, \`e\`\n\n\`\`\`\n2^10 → 1024\nsqrt(144) → 12\nsin(pi/2) → 1\n\`\`\`\n\n→ Try the [Math Evaluator](/math-evaluator)`,
  },
  {
    slug: 'eta-calculator-guide',
    toolPath: '/eta-calculator',
    title: 'ETA Calculator: Estimate Completion Time for Any Task',
    description: 'Calculate estimated time of arrival or completion based on progress rate.',
    keywords: ['ETA calculator', 'estimated time', 'completion time calculator', 'time remaining', 'progress calculator'],
    category: 'Math',
    publishedAt: '2025-07-29',
    content: `## Formula\n\n\`\`\`\nRemaining = Total - Completed\nRate = Completed / Elapsed time\nETA = Remaining / Rate\n\`\`\`\n\n## Common Use Cases\n\n- **File downloads** — "3.2 GB of 10 GB downloaded"\n- **Data processing** — Estimate batch job completion\n- **Project planning** — Based on velocity\n\n→ Try the [ETA Calculator](/eta-calculator)`,
  },
  {
    slug: 'income-tax-calculator-guide',
    toolPath: '/income-tax-calculator',
    title: 'China Income Tax Calculator: How to Calculate Your Take-Home Pay',
    description: 'Calculate your after-tax income in China. Understand the progressive tax brackets, social insurance, and special deductions.',
    keywords: ['China income tax', 'personal income tax calculator', '个人所得税', 'tax bracket China', 'social insurance'],
    category: 'Math',
    publishedAt: '2025-09-15',
    content: `## China Personal Income Tax (2024)\n\n| Monthly Taxable Income | Tax Rate |\n|---|---|\n| 0 – 3,000 | 3% |\n| 3,001 – 12,000 | 10% |\n| 12,001 – 25,000 | 20% |\n| 25,001 – 35,000 | 25% |\n| Over 80,000 | 45% |\n\n## Special Additional Deductions\n\n- Children's education: ¥2,000/month\n- Housing loan interest: ¥1,000/month\n\n→ Try the [Income Tax Calculator](/income-tax-calculator)`,
  },
  {
    slug: 'number-formatter-guide',
    toolPath: '/number-formatter',
    title: 'Number Formatting: Thousands Separators, Decimals, and Locale Formats',
    description: 'Format numbers with thousands separators, decimal points, and currency symbols for different locales.',
    keywords: ['number formatter', 'number format', 'thousands separator', 'decimal format', 'locale number'],
    category: 'Math',
    publishedAt: '2025-08-18',
    content: `## Number Formats by Locale\n\n| Locale | 1 million |\n|---|---|\n| US (en-US) | 1,000,000 |\n| Germany (de-DE) | 1.000.000 |\n| India (en-IN) | 10,00,000 |\n\n## JavaScript Intl API\n\n\`\`\`javascript\nnew Intl.NumberFormat('en-US').format(1234567.89)\n// → "1,234,567.89"\n\`\`\`\n\n→ Try the [Number Formatter](/number-formatter)`,
  },
  // ─── Text ───────────────────────────────────────────────────────────────────
  {
    slug: 'lorem-ipsum-guide',
    toolPath: '/lorem-ipsum-generator',
    title: 'Lorem Ipsum: History, Uses, and How to Generate the Right Amount',
    description: 'Learn about Lorem Ipsum placeholder text — its history, when to use it, and how to generate words, sentences, or paragraphs.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'lorem ipsum online', 'filler text'],
    category: 'Text',
    publishedAt: '2025-07-30',
    content: `## What Is Lorem Ipsum?\n\nPlaceholder text derived from Cicero's philosophical work (45 BC). Used in design to fill space before real content is available.\n\n## When to Use It\n\n✅ Wireframes and mockups\n✅ Testing typography and layout\n\n❌ Presenting to clients (they may think it's final)\n❌ In code going to production\n\n→ Try the [Lorem Ipsum Generator](/lorem-ipsum-generator)`,
  },
  {
    slug: 'text-diff-guide',
    toolPath: '/text-diff',
    title: 'Text Diff Tool: How to Compare Two Texts and Find Differences',
    description: 'Compare two texts side-by-side and highlight every difference. Learn about diff algorithms and practical applications.',
    keywords: ['text diff', 'compare text', 'text comparison', 'find differences', 'diff tool online'],
    category: 'Text',
    publishedAt: '2025-07-31',
    content: `## How Diff Works\n\nDiff algorithms find the **Longest Common Subsequence (LCS)** of two texts, then show what was added, removed, or unchanged.\n\n## Output Conventions\n\n- 🟢 **Green / +** — Added lines\n- 🔴 **Red / −** — Removed lines\n- ⬜ **White** — Unchanged lines\n\n→ Try the [Text Diff Tool](/text-diff)`,
  },
  {
    slug: 'emoji-picker-guide',
    toolPath: '/emoji-picker',
    title: 'Emoji Picker: Find and Copy Any Emoji Instantly',
    description: 'Browse, search, and copy emojis from all Unicode categories. Learn emoji Unicode codes and how to use them in code.',
    keywords: ['emoji picker', 'emoji search', 'copy emoji', 'emoji unicode', 'emoji keyboard'],
    category: 'Text',
    publishedAt: '2025-08-01',
    content: `## Emoji in Different Contexts\n\n| Context | Usage |\n|---|---|\n| HTML | \`&#128512;\` |\n| JavaScript | \`"\\u{1F600}"\` |\n| Python | \`"\\U0001F600"\` |\n\n## Tips\n\n- ZWJ sequences combine emojis: 👨‍💻 = 👨 + ZWJ + 💻.\n\n→ Try the [Emoji Picker](/emoji-picker)`,
  },
  {
    slug: 'string-obfuscator-guide',
    toolPath: '/string-obfuscator',
    title: 'String Obfuscation: What It Is and When to Use It',
    description: 'Obfuscate strings to hide sensitive data in UI, emails, or code. Learn the difference between obfuscation and encryption.',
    keywords: ['string obfuscator', 'obfuscate text', 'hide string', 'text obfuscation', 'data masking'],
    category: 'Text',
    publishedAt: '2025-08-02',
    content: `## Obfuscation vs Encryption\n\n| | Obfuscation | Encryption |\n|---|---|---|\n| Security | Low | High |\n| Use case | Cosmetic hiding | Real security |\n\n## Common Techniques\n\n- **Asterisk masking**: \`hello\` → \`***lo\`\n- **ROT13**: letter rotation by 13 positions\n\n→ Try the [String Obfuscator](/string-obfuscator)`,
  },
  {
    slug: 'text-statistics-guide',
    toolPath: '/text-statistics',
    title: 'Text Statistics: Count Words, Characters, Sentences, and Reading Time',
    description: 'Analyze any text with our statistics tool. Count words, characters, sentences, paragraphs, and estimate reading time.',
    keywords: ['word counter', 'character counter', 'text statistics', 'reading time estimator', 'text analysis'],
    category: 'Text',
    publishedAt: '2025-08-03',
    content: `## Writing Guidelines\n\n- **Blog post**: 300–1500 words for SEO\n- **Tweet**: 280 characters max\n- **Meta description**: 150–160 characters\n- **Email subject**: Under 60 characters\n\n→ Try the [Text Statistics Tool](/text-statistics)`,
  },
  {
    slug: 'ascii-art-generator-guide',
    toolPath: '/ascii-text-drawer',
    title: 'ASCII Art Text Generator: Create Text Art for Terminals and READMEs',
    description: 'Convert text to ASCII art using FIGlet fonts. Perfect for terminal banners, README headers, and retro designs.',
    keywords: ['ASCII art generator', 'ASCII text', 'FIGlet', 'text art', 'terminal banner'],
    category: 'Text',
    publishedAt: '2025-08-29',
    content: `## What Is ASCII Art?\n\nASCII art uses text characters to create visual designs, often used in:\n\n- Terminal program banners\n- README headers\n- Code comment separators\n\n## FIGlet\n\n**FIGlet** is the most popular ASCII art text generator, supporting hundreds of fonts.\n\n→ Try the [ASCII Text Drawer](/ascii-text-drawer)`,
  },
  {
    slug: 'numeronym-generator-guide',
    toolPath: '/numeronym-generator',
    title: "Numeronyms Explained: i18n, a11y, k8s and How They're Created",
    description: "Learn what numeronyms are, why they exist in tech culture, and generate numeronyms for any word.",
    keywords: ['numeronym generator', 'i18n meaning', 'a11y meaning', 'k8s meaning', 'numeronym'],
    category: 'Text',
    publishedAt: '2025-08-30',
    content: `## Famous Tech Numeronyms\n\n| Numeronym | Full Word |\n|---|---|\n| i18n | internationalization |\n| a11y | accessibility |\n| k8s | Kubernetes |\n| l10n | localization |\n| o11y | observability |\n\n→ Try the [Numeronym Generator](/numeronym-generator)`,
  },
  // ─── Images ────────────────────────────────────────────────────────────────
  {
    slug: 'qr-code-generator-guide',
    toolPath: '/qrcode-generator',
    title: 'QR Code Generator: Everything You Need to Know',
    description: 'Generate QR codes for URLs, text, contact info. Learn about error correction, sizes, and best practices.',
    keywords: ['QR code generator', 'generate QR code', 'QR code online', 'free QR code', 'QR code for URL'],
    category: 'Images and videos',
    publishedAt: '2025-08-10',
    content: `## Error Correction Levels\n\n| Level | Recovery | Use Case |\n|---|---|---|\n| L | 7% | Clean environments |\n| M | 15% | Default |\n| Q | 25% | Industrial |\n| H | 30% | With logo overlay |\n\n## Best Practices\n\n- Minimum size: **2cm × 2cm**\n- Dark on light background\n- Test with multiple devices before printing\n\n→ Try the [QR Code Generator](/qrcode-generator)`,
  },
  {
    slug: 'svg-placeholder-guide',
    toolPath: '/svg-placeholder-generator',
    title: 'SVG Placeholder Images: Generate Customizable Placeholders',
    description: 'Create SVG placeholder images with custom sizes, colors, and text for mockups, wireframes, and development.',
    keywords: ['SVG placeholder', 'placeholder image generator', 'dummy image', 'placeholder image online', 'image placeholder'],
    category: 'Images and videos',
    publishedAt: '2025-08-11',
    content: `## Why SVG Placeholders?\n\n- **Infinitely scalable** — Look perfect at any resolution\n- **Tiny file size** — Just text, no pixels\n- **Customizable** — Change size, color, text inline\n\n## Use Cases\n\n- UI mockups and wireframes\n- Testing image layouts before assets are ready\n\n→ Try the [SVG Placeholder Generator](/svg-placeholder-generator)`,
  },
  {
    slug: 'wifi-qr-code-guide',
    toolPath: '/wifi-qrcode-generator',
    title: 'WiFi QR Code Generator: Share Network Credentials Instantly',
    description: 'Generate a QR code for your WiFi network. Guests scan it to connect without typing the password.',
    keywords: ['wifi QR code', 'WiFi QR generator', 'share WiFi password', 'WiFi QR code generator'],
    category: 'Images and videos',
    publishedAt: '2025-08-27',
    content: `## WiFi QR Code Format\n\n\`\`\`\nWIFI:T:WPA;S:MyNetwork;P:MyPassword;;\n\`\`\`\n\nWhere: T=security type, S=SSID, P=password.\n\n## Privacy Note\n\nThe QR code is generated entirely in your browser. Your WiFi password is never sent to any server.\n\n→ Try the [WiFi QR Code Generator](/wifi-qrcode-generator)`,
  },
  {
    slug: 'camera-recorder-guide',
    toolPath: '/camera-recorder',
    title: 'Browser Camera Recorder: Record Video Directly from Your Browser',
    description: 'Record video from your webcam directly in the browser. No software installation required.',
    keywords: ['browser camera recorder', 'webcam recorder online', 'record video browser', 'MediaRecorder API'],
    category: 'Images and videos',
    publishedAt: '2025-08-28',
    content: `## How It Works\n\nThe browser's **MediaRecorder API** allows recording from webcam, screen capture, or microphone.\n\nAll recording happens locally — video stays on your device.\n\n## Browser Support\n\nMediaRecorder is supported in all modern browsers (Chrome, Firefox, Safari 14+, Edge).\n\n→ Try the [Camera Recorder](/camera-recorder)`,
  },
  // ─── Measurement ────────────────────────────────────────────────────────────
  {
    slug: 'chronometer-guide',
    toolPath: '/chronometer',
    title: 'Online Chronometer: How to Time Events and Record Laps',
    description: 'Use our online stopwatch/chronometer to time tasks, record lap times, and track elapsed time precisely.',
    keywords: ['chronometer online', 'stopwatch online', 'lap timer', 'online timer', 'elapsed time'],
    category: 'Measurement',
    publishedAt: '2025-08-05',
    content: `## Chronometer vs Stopwatch vs Timer\n\n- **Chronometer** — Measures elapsed time from start to stop.\n- **Timer** — Counts down from a set time to zero.\n\n## Use Cases\n\n- **Exercise timing** — Lap times, interval training\n- **Productivity** — Pomodoro technique (25-min work sessions)\n\n→ Try the [Chronometer](/chronometer)`,
  },
  {
    slug: 'benchmark-builder-guide',
    toolPath: '/benchmark-builder',
    title: 'JavaScript Benchmark Builder: Test and Compare Code Performance',
    description: 'Build and run JavaScript performance benchmarks in your browser. Compare multiple code snippets with ops/sec measurements.',
    keywords: ['benchmark builder', 'JavaScript performance', 'code benchmark', 'performance testing', 'ops per second'],
    category: 'Measurement',
    publishedAt: '2025-08-06',
    content: `## Why Benchmark Code?\n\n- Compare algorithm implementations\n- Choose between library functions\n- Verify optimization improvements\n\n## Important Caveats\n\n- JIT compilers may optimize benchmarks unrealistically.\n- Results vary by browser engine (V8, SpiderMonkey, JavaScriptCore).\n\n→ Try the [Benchmark Builder](/benchmark-builder)`,
  },
  // ─── Data ──────────────────────────────────────────────────────────────────
  {
    slug: 'phone-formatter-guide',
    toolPath: '/phone-parser-and-formatter',
    title: 'Phone Number Formatting: Parse, Format, and Validate International Numbers',
    description: 'Parse and format international phone numbers. Learn about E.164 format, country codes, and validation.',
    keywords: ['phone number formatter', 'E.164 format', 'international phone number', 'phone validator', 'country code'],
    category: 'Data',
    publishedAt: '2025-08-15',
    content: `## Phone Number Formats\n\n| Format | Example |\n|---|---|\n| E.164 (international) | \`+14155552671\` |\n| National (US) | \`(415) 555-2671\` |\n\n## Best Practices\n\n- Always store in E.164 format in databases.\n- Validate with a library (libphonenumber) — regex alone is unreliable.\n\n→ Try the [Phone Parser & Formatter](/phone-parser-and-formatter)`,
  },
  {
    slug: 'iban-validator-guide',
    toolPath: '/iban-validator-and-parser',
    title: 'IBAN Validator: How to Verify International Bank Account Numbers',
    description: 'Validate and parse IBAN numbers. Learn the IBAN structure, country formats, and how checksum validation works.',
    keywords: ['IBAN validator', 'IBAN checker', 'international bank account', 'IBAN format', 'IBAN checksum'],
    category: 'Data',
    publishedAt: '2025-08-16',
    content: `## What Is an IBAN?\n\n**IBAN** (International Bank Account Number) enables unambiguous cross-border payment routing.\n\n## IBAN Structure\n\n\`\`\`\nGB82 WEST 1234 5698 7654 32\n│   │    │\n│   │    └── BBAN\n│   └──────── 2-digit check digits\n└──────────── 2-letter country code\n\`\`\`\n\n→ Try the [IBAN Validator](/iban-validator-and-parser)`,
  },
  // ─── Security ──────────────────────────────────────────────────────────────
  {
    slug: 'pdf-signature-checker-guide',
    toolPath: '/pdf-signature-checker',
    title: 'PDF Digital Signatures: How to Verify Document Authenticity',
    description: 'Check digital signatures in PDF files. Learn how PDF signatures work and how to verify document authenticity.',
    keywords: ['PDF signature checker', 'digital signature', 'PDF verify', 'document authenticity', 'PDF certificate'],
    category: 'Crypto',
    publishedAt: '2025-09-14',
    content: `## What Is a PDF Digital Signature?\n\nA digital signature in a PDF proves that:\n1. The document was signed by the claimed signer (authenticity)\n2. The document hasn't been modified since signing (integrity)\n\n## What "Valid Signature" Means\n\n- ✅ Signature mathematically valid\n- ✅ Certificate not expired\n- ✅ Document not modified after signing\n\n→ Try the [PDF Signature Checker](/pdf-signature-checker)`,
  },
]

// ─── Step 3: Upsert articles ──────────────────────────────────────────────────
async function seedArticles() {
  console.log(`\n📝 Uploading ${articles.length} articles...`)

  const rows = articles.map(a => ({
    slug: a.slug,
    tool_path: a.toolPath,
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    category: a.category,
    published_at: a.publishedAt,
    content: a.content,
    updated_at: new Date().toISOString(),
  }))

  // Upsert in batches of 20 to avoid request size limits
  const BATCH = 20
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('tools_articles')
      .upsert(batch, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errorCount += batch.length
    }
    else {
      console.log(`  ✅ Batch ${Math.floor(i / BATCH) + 1}: uploaded ${batch.length} articles`)
      successCount += batch.length
    }
  }

  console.log(`\n🎉 Done! ${successCount} uploaded, ${errorCount} failed.`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Supabase seed for tools_articles...\n')
  const tableReady = await ensureTable()
  if (!tableReady) {
    console.log('\n⏸  Seed aborted. Create the table first, then re-run this script.')
    process.exit(1)
  }
  await seedArticles()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
