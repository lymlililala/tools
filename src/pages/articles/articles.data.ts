export interface Article {
  slug: string
  toolPath: string
  title: string
  description: string
  keywords: string[]
  category: string
  publishedAt: string
  content: string
}

export const articles: Article[] = [
  // ─── Crypto ───────────────────────────────────────────────────
  {
    slug: 'what-is-token-generator',
    toolPath: '/token-generator',
    title: 'What Is a Random Token Generator and Why Do You Need One?',
    description: 'Learn how to generate cryptographically secure random tokens for API keys, session IDs, CSRF tokens, and more.',
    keywords: ['token generator', 'random token', 'API key generator', 'secure token', 'csrf token'],
    category: 'Crypto',
    publishedAt: '2025-06-01',
    content: `## What Is a Random Token Generator?

A **random token generator** creates unpredictable strings used to authenticate users, protect APIs, and prevent attacks like CSRF. Unlike passwords typed by humans, tokens are machine-generated and designed to be unique, long, and impossible to guess.

## Common Use Cases

- **API Keys** – Authenticate third-party services without exposing passwords.
- **Session Tokens** – Track logged-in users securely.
- **CSRF Tokens** – Prevent cross-site request forgery attacks in web forms.
- **Password Reset Links** – Create one-time-use secure URLs sent via email.
- **Webhook Secrets** – Sign and verify payloads between services.

## How Does This Tool Work?

MyUtl's token generator uses the browser's built-in **Web Crypto API** (\`crypto.getRandomValues()\`), which provides cryptographically secure random numbers — the same standard used in professional security systems.

You can choose character sets (uppercase, lowercase, numbers, symbols) and set the length from 1 to 512 characters.

## How Long Should a Token Be?

| Use Case | Recommended Length |
|---|---|
| CSRF token | 32+ characters |
| API key | 32–64 characters |
| Session ID | 64+ characters |

## Best Practices

- Never reuse tokens across different services.
- Store tokens hashed (e.g., SHA-256) — never in plain text.
- Rotate tokens regularly, especially after a security incident.
- Use HTTPS to prevent tokens from being intercepted in transit.

→ Try the [Token Generator](/token-generator)`,
  },
  {
    slug: 'how-to-hash-text-online',
    toolPath: '/hash-text',
    title: 'How to Hash Text Online: MD5, SHA-1, SHA-256, and More',
    description: 'Understand hashing algorithms and use our free tool to hash any text with MD5, SHA-256, SHA-512, and more.',
    keywords: ['hash text', 'SHA-256 online', 'MD5 hash', 'SHA-512', 'hash calculator'],
    category: 'Crypto',
    publishedAt: '2025-06-02',
    content: `## What Is Hashing?

Hashing converts any input into a fixed-length string called a **digest**. Unlike encryption, hashing is a **one-way function** — you cannot reverse it.

## Popular Hash Algorithms

| Algorithm | Output | Status |
|---|---|---|
| MD5 | 128 bits | Deprecated for security |
| SHA-1 | 160 bits | Deprecated for security |
| SHA-256 | 256 bits | Widely used, recommended |
| SHA-512 | 512 bits | Strong, slower |

## Common Uses

1. **Verify file integrity** – Compare hash before and after download.
2. **Store passwords** – Always hash passwords before saving to a database.
3. **Generate cache keys** – Hash request parameters for unique identifiers.
4. **Digital signatures** – Hash documents before signing with a private key.

## Example: SHA-256 of "hello"

\`\`\`
Input:  hello
SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
\`\`\`

→ Try the [Hash Text Tool](/hash-text)`,
  },
  {
    slug: 'bcrypt-password-hashing-guide',
    toolPath: '/bcrypt',
    title: 'Bcrypt Password Hashing: The Complete Developer Guide',
    description: 'Learn why bcrypt is the gold standard for password storage, how cost factors work, and how to verify passwords safely.',
    keywords: ['bcrypt', 'password hashing', 'bcrypt online', 'password storage', 'salt rounds'],
    category: 'Crypto',
    publishedAt: '2025-06-03',
    content: `## Why Bcrypt for Password Storage?

Bcrypt is a **password-hashing function** designed to be slow and computationally expensive — making brute-force attacks impractical.

## The Cost Factor

| Cost | Time per Hash | Recommendation |
|---|---|---|
| 10 | ~100ms | Minimum recommended |
| 12 | ~400ms | Recommended default |
| 14 | ~1.5s | High-security systems |

## How a Bcrypt Hash Looks

\`\`\`
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
 │   │  │                    │
 │   │  └── 22-char random salt
 │   └── cost factor (12)
 └── version
\`\`\`

## Verify a Password

\`\`\`javascript
const bcrypt = require('bcrypt');
const match = await bcrypt.compare(plainPassword, storedHash);
\`\`\`

→ Try the [Bcrypt Tool](/bcrypt)`,
  },
  {
    slug: 'uuid-vs-ulid-which-to-use',
    toolPath: '/uuid-generator',
    title: 'UUID vs ULID: Which Unique ID Should You Use?',
    description: 'Compare UUID and ULID formats for database primary keys. Learn when to use each and generate them instantly.',
    keywords: ['UUID generator', 'UUID v4', 'ULID vs UUID', 'unique ID', 'database primary key'],
    category: 'Crypto',
    publishedAt: '2025-06-04',
    content: `## UUID vs ULID Comparison

| Feature | UUID v4 | ULID |
|---|---|---|
| Length | 36 chars | 26 chars |
| Sortable | ❌ | ✅ Time-ordered |
| Database index | B-tree fragmentation | Better locality |
| Standard | RFC 4122 | Community spec |

**UUID** (\`550e8400-e29b-41d4-a716-446655440000\`) — Use for maximum compatibility.

**ULID** (\`01ARZ3NDEKTSV4RRFFQ69G5FAV\`) — Use when you need sortable IDs (event streams, logs).

→ Try [UUID Generator](/uuid-generator) or [ULID Generator](/ulid-generator)`,
  },
  {
    slug: 'jwt-parser-explained',
    toolPath: '/jwt-parser',
    title: 'JWT Explained: How to Read and Validate JSON Web Tokens',
    description: 'Decode and inspect any JWT token. Learn about header, payload, signature, expiry, and common security mistakes.',
    keywords: ['JWT parser', 'decode JWT', 'JSON web token', 'JWT security', 'JWT expiry'],
    category: 'Crypto',
    publishedAt: '2025-06-05',
    content: `## JWT Structure

\`\`\`
header.payload.signature
\`\`\`

**Header:** \`{ "alg": "HS256", "typ": "JWT" }\`

**Payload:**
\`\`\`json
{ "sub": "1234", "name": "John", "exp": 1716000000 }
\`\`\`

**Signature:** HMAC of header.payload using a secret key.

## Common Claims

| Claim | Meaning |
|---|---|
| \`sub\` | Subject (user ID) |
| \`exp\` | Expiration (Unix timestamp) |
| \`iat\` | Issued at |
| \`iss\` | Issuer |

## Security Checklist

- ✅ Always verify signature server-side
- ✅ Check \`exp\` to reject expired tokens
- ❌ Never trust client-side JWT validation alone
- ❌ Never put sensitive data in payload (it's only base64, not encrypted)

→ Try the [JWT Parser](/jwt-parser)`,
  },
  {
    slug: 'password-strength-guide',
    toolPath: '/password-strength-analyser',
    title: 'How Strong Is Your Password? A Complete Guide to Password Security',
    description: 'Analyze your password strength instantly. Learn what makes a password secure and how attackers crack weak ones.',
    keywords: ['password strength', 'password checker', 'strong password', 'password security', 'crack time'],
    category: 'Crypto',
    publishedAt: '2025-06-06',
    content: `## What Makes a Password Strong?

**Length + variety + unpredictability = entropy.**

| Password | Crack Time |
|---|---|
| \`password\` | Instant |
| \`P@ssw0rd\` | Seconds |
| \`Correct-Horse-Battery\` | Centuries |
| \`X7#kLm$9pQr@2vN\` | Billions of years |

## Tips

- Use a **password manager** to generate and store unique passwords.
- Enable **2FA** wherever possible.
- 4+ random words ("correct horse battery staple") are both memorable and secure.

→ Try the [Password Strength Analyser](/password-strength-analyser)`,
  },
  {
    slug: 'rsa-key-pair-explained',
    toolPath: '/rsa-key-pair-generator',
    title: 'RSA Key Pairs: How They Work and How to Generate Them',
    description: 'Understand RSA public/private key cryptography. Learn key sizes, use cases, and generate key pairs in your browser.',
    keywords: ['RSA key pair', 'RSA generator', 'public private key', 'asymmetric encryption', 'SSH key'],
    category: 'Crypto',
    publishedAt: '2025-06-07',
    content: `## How RSA Works

RSA is an **asymmetric encryption** algorithm: you have a **public key** (share freely) and a **private key** (keep secret).

- Encrypt with public key → only private key can decrypt
- Sign with private key → anyone with public key can verify

## Key Sizes

| Size | Security | Use Case |
|---|---|---|
| 1024 bit | Weak (deprecated) | Legacy only |
| 2048 bit | Good | Minimum recommended |
| 4096 bit | Strong | High-security systems |

## Common Uses

- **SSH authentication** – Replace password login with key-based auth
- **HTTPS / TLS** – Secure web connections
- **Code signing** – Verify software authenticity
- **JWT signing** – RS256 algorithm

→ Try the [RSA Key Pair Generator](/rsa-key-pair-generator)`,
  },
  {
    slug: 'hmac-generator-guide',
    toolPath: '/hmac-generator',
    title: 'HMAC Explained: Message Authentication with a Secret Key',
    description: 'Learn what HMAC is, how it differs from regular hashing, and when to use it for API authentication and data integrity.',
    keywords: ['HMAC generator', 'HMAC SHA256', 'message authentication', 'API signature', 'HMAC vs hash'],
    category: 'Crypto',
    publishedAt: '2025-06-08',
    content: `## What Is HMAC?

**HMAC** (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret key to verify both the **integrity** and **authenticity** of a message.

\`\`\`
HMAC(key, message) = Hash(key + Hash(key + message))
\`\`\`

## HMAC vs Plain Hash

| | Plain Hash | HMAC |
|---|---|---|
| Key required | ❌ | ✅ |
| Verifies integrity | ✅ | ✅ |
| Verifies sender | ❌ | ✅ |
| Forgeable without key | ✅ | ❌ |

## Common Uses

- **Webhook signatures** – GitHub, Stripe, and other services send HMAC signatures to verify payloads.
- **API authentication** – AWS Signature Version 4 uses HMAC-SHA256.
- **JWT (HS256)** – Signs tokens with a shared secret.

→ Try the [HMAC Generator](/hmac-generator)`,
  },
  {
    slug: 'encryption-tool-guide',
    toolPath: '/encryption',
    title: 'Text Encryption Online: AES, DES, and Symmetric Encryption Explained',
    description: 'Encrypt and decrypt text using AES, DES, and other algorithms. Learn how symmetric encryption works and when to use it.',
    keywords: ['text encryption', 'AES encryption', 'encrypt online', 'symmetric encryption', 'decrypt text'],
    category: 'Crypto',
    publishedAt: '2025-06-09',
    content: `## Symmetric Encryption

Symmetric encryption uses the **same key** to encrypt and decrypt. Fast and suitable for large data, but the key must be shared securely.

## Common Algorithms

| Algorithm | Key Size | Status |
|---|---|---|
| DES | 56 bit | Deprecated (too weak) |
| 3DES | 168 bit | Being phased out |
| AES-128 | 128 bit | Good |
| AES-256 | 256 bit | Recommended |

## AES Modes

- **CBC** – Each block depends on previous; requires IV. Good for files.
- **GCM** – Authenticated encryption; detects tampering. Best choice.
- **ECB** – Never use (identical plaintext → identical ciphertext).

## Practical Uses

- Encrypting local files or sensitive config data
- Storing secrets in a database (encrypt with AES, protect key separately)
- End-to-end encrypted messaging

→ Try the [Encryption Tool](/encryption)`,
  },
  {
    slug: 'otp-authenticator-guide',
    toolPath: '/otp-generator',
    title: 'OTP / TOTP Explained: How Two-Factor Authentication Works',
    description: 'Learn how Time-based One-Time Passwords (TOTP) work. Generate and validate OTP codes for 2FA systems.',
    keywords: ['OTP generator', 'TOTP', 'two-factor authentication', '2FA code', 'authenticator app'],
    category: 'Web',
    publishedAt: '2025-06-10',
    content: `## What Is TOTP?

**TOTP** (Time-based One-Time Password) generates a 6-digit code that changes every 30 seconds. It's used in apps like Google Authenticator, Authy, and Microsoft Authenticator.

## How TOTP Works

1. Server and user share a **secret key** (usually shown as QR code during setup).
2. Both compute: \`TOTP = HOTP(secret, floor(currentTime / 30))\`
3. User types the 6-digit code; server verifies it matches.

Because the code depends on the current time, it's only valid for ~30 seconds.

## Security Advantages

- Even if a password is phished, attacker also needs the time-based code.
- Codes can't be reused — each is valid once per 30-second window.

## RFC Standards

- **HOTP** (HMAC-based OTP): RFC 4226
- **TOTP** (Time-based OTP): RFC 6238

→ Try the [OTP Generator](/otp-generator)`,
  },
  {
    slug: 'bip39-mnemonic-guide',
    toolPath: '/bip39-generator',
    title: 'BIP39 Mnemonic Phrases: How Crypto Wallets Are Backed Up',
    description: 'Understand BIP39 mnemonic seed phrases used in cryptocurrency wallets. Learn how 12-24 words store your entire wallet.',
    keywords: ['BIP39 generator', 'mnemonic phrase', 'seed phrase', 'crypto wallet backup', 'BIP39 wordlist'],
    category: 'Crypto',
    publishedAt: '2025-06-11',
    content: `## What Is BIP39?

**BIP39** (Bitcoin Improvement Proposal 39) defines a standard for generating mnemonic seed phrases — a sequence of 12, 18, or 24 common English words that represent the entropy used to derive cryptocurrency wallet keys.

## How It Works

1. Generate 128–256 bits of random entropy.
2. Add a checksum (first bits of SHA-256 hash).
3. Split into 11-bit groups, map each to one of 2048 words.

## Security

- 12 words = 128 bits of entropy = \`2^128\` possible combinations (practically unbreakable).
- 24 words = 256 bits of entropy.

## Best Practices

- **Write it on paper** (or metal) — never digitally.
- **Store in multiple secure locations**.
- **Never share with anyone** — whoever has the phrase controls all assets.
- This tool runs entirely in your browser; nothing is sent to servers.

→ Try the [BIP39 Generator](/bip39-generator)`,
  },

  // ─── Converter ────────────────────────────────────────────────
  {
    slug: 'base64-encoding-explained',
    toolPath: '/base64-string-converter',
    title: 'Base64 Encoding Explained: What It Is and When to Use It',
    description: 'Learn what Base64 encoding is, how to encode and decode strings, and when (and when not) to use it.',
    keywords: ['base64 encode', 'base64 decode', 'base64 online', 'base64 string converter', 'encoding'],
    category: 'Converter',
    publishedAt: '2025-06-15',
    content: `## What Is Base64?

Base64 is a binary-to-text encoding using 64 printable ASCII characters (A–Z, a–z, 0–9, +, /). It safely transmits binary data over text channels.

**Example:**
\`\`\`
Input:  Hello
Base64: SGVsbG8=
\`\`\`

## Common Uses

- **HTTP Basic Auth** — \`username:password\` encoded as Base64 in headers.
- **Data URIs** — Embed images directly in HTML: \`data:image/png;base64,...\`
- **JWT tokens** — Header and payload are base64url encoded.
- **Email attachments** — MIME encoding.

## Base64 Is NOT Encryption

Anyone can decode it instantly. **Never use Base64 to hide sensitive data.**

## Base64 vs Base64URL

Standard Base64 uses \`+\` and \`/\`; Base64URL replaces them with \`-\` and \`_\` for URL safety.

→ Try the [Base64 String Converter](/base64-string-converter)`,
  },
  {
    slug: 'json-to-yaml-complete-guide',
    toolPath: '/json-to-yaml-converter',
    title: 'JSON to YAML: Complete Conversion Guide with Examples',
    description: 'Convert JSON to YAML instantly. Understand the differences, when to use each format, and common gotchas.',
    keywords: ['JSON to YAML', 'convert JSON YAML', 'YAML vs JSON', 'YAML formatter', 'JSON converter'],
    category: 'Converter',
    publishedAt: '2025-06-16',
    content: `## JSON vs YAML

| Feature | JSON | YAML |
|---|---|---|
| Comments | ❌ | ✅ |
| Readability | Machine-friendly | Human-friendly |
| Common use | APIs | Config files |

## Example

**JSON:** \`{"name":"John","age":30,"hobbies":["reading","coding"]}\`

**YAML:**
\`\`\`yaml
name: John
age: 30
hobbies:
  - reading
  - coding
\`\`\`

## Common Gotchas

- \`yes\`, \`no\`, \`true\`, \`false\` have special YAML meanings — quote them if they're strings.
- Tabs are illegal in YAML — use spaces only.
- Numeric strings like zip codes must be quoted: \`zip: '10001'\`

→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`,
  },
  {
    slug: 'css-unit-converter-guide',
    toolPath: '/css-unit-converter',
    title: 'CSS Units Explained: px, rem, em, vw, vh — When to Use Each',
    description: 'Master CSS units with our complete guide. Convert between px, rem, em, vw, vh and understand when each unit is appropriate.',
    keywords: ['CSS units', 'px to rem', 'em to px', 'CSS unit converter', 'rem vs em', 'viewport units'],
    category: 'Converter',
    publishedAt: '2025-06-17',
    content: `## CSS Unit Types

- **px** — Absolute pixels.
- **rem** — Relative to root (\`html\`) font size (default 16px).
- **em** — Relative to the current element's font size (can cascade).
- **vw / vh** — 1% of viewport width / height.
- **%** — Relative to parent element.

## rem vs px: Use rem for Font Sizes

Users can change their browser's base font size for accessibility. \`rem\` respects that; \`px\` ignores it.

## Conversion Formulas

\`\`\`
rem = px / root-font-size     (e.g. 24px / 16 = 1.5rem)
vw  = px / viewport-width × 100
\`\`\`

## Quick Reference (root = 16px)

| px | rem | em |
|---|---|---|
| 12px | 0.75rem | 0.75em |
| 16px | 1rem | 1em |
| 24px | 1.5rem | 1.5em |
| 32px | 2rem | 2em |

→ Try the [CSS Unit Converter](/css-unit-converter)`,
  },
  {
    slug: 'color-converter-hex-rgb-hsl',
    toolPath: '/color-converter',
    title: 'Color Formats Explained: HEX, RGB, HSL, and How to Convert Between Them',
    description: 'Learn about web color formats: HEX, RGB, RGBA, HSL, HSLA. Convert between them instantly.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color formats', 'CSS colors'],
    category: 'Converter',
    publishedAt: '2025-06-18',
    content: `## Web Color Formats

**HEX:** \`#FF5733\` — Most common in CSS.

**RGB:** \`rgb(255, 87, 51)\` — Explicit red, green, blue channels.

**HSL:** \`hsl(14, 100%, 60%)\` — Hue, Saturation, Lightness — most intuitive for design.

## Which to Use?

| Scenario | Format |
|---|---|
| Design handoff | HEX |
| Programmatic manipulation | HSL |
| With transparency | RGBA or HSLA |

→ Try the [Color Converter](/color-converter)`,
  },
  {
    slug: 'markdown-to-html-guide',
    toolPath: '/markdown-to-html',
    title: 'Markdown to HTML: A Practical Guide for Developers and Writers',
    description: 'Convert Markdown to clean HTML instantly. Learn Markdown syntax, flavors, and best practices.',
    keywords: ['markdown to html', 'markdown converter', 'markdown syntax', 'convert markdown', 'markdown online'],
    category: 'Converter',
    publishedAt: '2025-06-19',
    content: `## Markdown Syntax Quick Reference

\`\`\`markdown
# H1  ## H2  ### H3
**bold**   *italic*   ~~strikethrough~~
[Link](url)   ![Image](src)
- unordered list
1. ordered list
> blockquote
\`inline code\`
| Table | Header |
|-------|--------|
\`\`\`

## Flavors

- **CommonMark** — Standardized spec
- **GFM (GitHub Flavored)** — Adds tables, task lists
- **MDX** — Markdown + React JSX

## When to Convert to HTML

- Publishing to a CMS
- Sending HTML emails
- Rendering in non-Markdown environments

→ Try the [Markdown to HTML Converter](/markdown-to-html)`,
  },
  {
    slug: 'unix-timestamp-guide',
    toolPath: '/unix-timestamp',
    title: 'Unix Timestamp Guide: What It Is, How to Convert, and Why It Matters',
    description: 'Understand Unix timestamps, convert between timestamps and human-readable dates, and learn about timezone pitfalls.',
    keywords: ['unix timestamp', 'epoch time', 'timestamp converter', 'unix time', 'epoch to date'],
    category: 'Converter',
    publishedAt: '2025-06-20',
    content: `## What Is a Unix Timestamp?

The number of **seconds** elapsed since January 1, 1970, 00:00:00 UTC. Timezone-agnostic and universally supported.

## Conversions

| Format | Example |
|---|---|
| Unix (seconds) | 1716000000 |
| Unix (ms) | 1716000000000 |
| ISO 8601 | 2024-05-18T08:00:00Z |

## Code Examples

\`\`\`javascript
// Current timestamp
Math.floor(Date.now() / 1000)

// Timestamp to Date
new Date(1716000000 * 1000).toISOString()
\`\`\`

## Y2K38 Problem

32-bit integers overflow January 19, 2038. Modern systems use 64-bit integers, extending the range by billions of years.

→ Try the [Unix Timestamp Converter](/unix-timestamp)`,
  },
  {
    slug: 'date-time-converter-guide',
    toolPath: '/date-converter',
    title: 'Date and Time Conversion: Timezones, Formats, and Common Pitfalls',
    description: 'Convert dates between formats and timezones. Learn about ISO 8601, UTC, and how to avoid timezone bugs.',
    keywords: ['date converter', 'time zone converter', 'ISO 8601', 'date format', 'UTC converter'],
    category: 'Converter',
    publishedAt: '2025-06-21',
    content: `## Common Date Formats

| Format | Example |
|---|---|
| ISO 8601 | \`2024-05-18T08:00:00Z\` |
| RFC 2822 | \`Sat, 18 May 2024 08:00:00 +0000\` |
| US | \`05/18/2024\` |
| EU | \`18/05/2024\` |

## Timezone Best Practices

- **Store in UTC** always — convert to local time only for display.
- **Use ISO 8601 with timezone offset** for unambiguous timestamps.
- Daylight Saving Time (DST) causes clocks to change — never assume an hour = 3600 seconds in local time.

## Code Tips

\`\`\`javascript
// Always use UTC internally
new Date().toISOString() // "2024-05-18T08:00:00.000Z"

// Display in user's timezone
new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).format(new Date())
\`\`\`

→ Try the [Date Converter](/date-converter)`,
  },
  {
    slug: 'temperature-converter-guide',
    toolPath: '/temperature-converter',
    title: 'Temperature Conversion: Celsius, Fahrenheit, Kelvin Explained',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin. Learn the formulas and understand when each scale is used.',
    keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'kelvin converter', 'temperature conversion'],
    category: 'Converter',
    publishedAt: '2025-06-22',
    content: `## Temperature Scale Overview

- **Celsius (°C)** — Water freezes at 0°, boils at 100°. Used worldwide.
- **Fahrenheit (°F)** — Water freezes at 32°, boils at 212°. Used in the US.
- **Kelvin (K)** — Absolute scale. 0K = absolute zero (−273.15°C). Used in science.

## Conversion Formulas

\`\`\`
°F = (°C × 9/5) + 32
°C = (°F − 32) × 5/9
K  = °C + 273.15
\`\`\`

## Key Reference Points

| Description | °C | °F | K |
|---|---|---|---|
| Absolute zero | −273.15 | −459.67 | 0 |
| Water freezes | 0 | 32 | 273.15 |
| Body temp | 37 | 98.6 | 310.15 |
| Water boils | 100 | 212 | 373.15 |

→ Try the [Temperature Converter](/temperature-converter)`,
  },
  {
    slug: 'case-converter-guide',
    toolPath: '/case-converter',
    title: 'String Case Converter: camelCase, snake_case, PascalCase and More',
    description: 'Convert text between camelCase, snake_case, PascalCase, kebab-case, and other naming conventions instantly.',
    keywords: ['case converter', 'camelCase converter', 'snake_case', 'PascalCase', 'kebab-case'],
    category: 'Converter',
    publishedAt: '2025-06-23',
    content: `## Naming Conventions

| Case | Example | Common Use |
|---|---|---|
| camelCase | \`myVariableName\` | JavaScript variables, JSON keys |
| PascalCase | \`MyClassName\` | Classes, React components |
| snake_case | \`my_variable_name\` | Python, Ruby, database columns |
| kebab-case | \`my-component-name\` | URLs, CSS classes, HTML attributes |
| SCREAMING_SNAKE | \`MY_CONSTANT\` | Constants, environment variables |
| Title Case | \`My Variable Name\` | UI labels, headings |

## When to Use Each

- **APIs** often use camelCase (JavaScript) or snake_case (Python/Ruby)
- **File names** use kebab-case on Linux/Mac (avoid spaces)
- **Database columns** use snake_case by convention
- **CSS classes** use kebab-case (BEM: \`block__element--modifier\`)

→ Try the [Case Converter](/case-converter)`,
  },
  {
    slug: 'roman-numeral-converter-guide',
    toolPath: '/roman-numeral-converter',
    title: 'Roman Numeral Converter: How to Read and Write Roman Numerals',
    description: 'Convert between decimal numbers and Roman numerals. Learn the rules, symbols, and history.',
    keywords: ['roman numeral converter', 'roman numerals', 'convert roman numerals', 'roman number calculator'],
    category: 'Converter',
    publishedAt: '2025-06-24',
    content: `## Roman Numeral Symbols

| Symbol | Value |
|---|---|
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1000 |

## Rules

- Symbols are generally written largest to smallest, left to right.
- **Subtractive notation:** A smaller symbol before a larger one means subtraction: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.
- A symbol may not be repeated more than 3 times consecutively.

## Examples

\`\`\`
XIV = 10 + 4 = 14
XLII = 40 + 2 = 42
MCMXCIX = 1000 + 900 + 90 + 9 = 1999
MMXXV = 2025
\`\`\`

→ Try the [Roman Numeral Converter](/roman-numeral-converter)`,
  },
  {
    slug: 'integer-base-converter-guide',
    toolPath: '/base-converter',
    title: 'Number Base Conversion: Binary, Octal, Decimal, Hex Explained',
    description: 'Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16).',
    keywords: ['base converter', 'binary to decimal', 'hex to decimal', 'octal converter', 'number base conversion'],
    category: 'Converter',
    publishedAt: '2025-06-25',
    content: `## Common Number Bases

| Base | Name | Digits | Used For |
|---|---|---|---|
| 2 | Binary | 0, 1 | Computer hardware, bitwise ops |
| 8 | Octal | 0–7 | Unix permissions, legacy systems |
| 10 | Decimal | 0–9 | Everyday use |
| 16 | Hexadecimal | 0–9, A–F | Colors, memory addresses, encoding |

## Quick Conversions

**255 in different bases:**
- Binary: \`11111111\`
- Octal: \`377\`
- Decimal: \`255\`
- Hex: \`FF\`

## Hex in CSS / Web

Colors in CSS use hex: \`#FF5733\` = Red: 255, Green: 87, Blue: 51

## Code Examples

\`\`\`javascript
(255).toString(2)   // "11111111" (decimal → binary)
(255).toString(16)  // "ff" (decimal → hex)
parseInt("FF", 16)  // 255 (hex → decimal)
parseInt("11111111", 2) // 255 (binary → decimal)
\`\`\`

→ Try the [Base Converter](/base-converter)`,
  },

  // ─── Web ──────────────────────────────────────────────────────
  {
    slug: 'url-encoding-explained',
    toolPath: '/url-encoder',
    title: 'URL Encoding Explained: Why Special Characters Must Be Escaped',
    description: 'Learn why URLs need encoding, what percent-encoding is, and how to encode/decode URLs correctly.',
    keywords: ['URL encoding', 'percent encoding', 'URL encode decode', 'encodeURIComponent', 'URL special characters'],
    category: 'Web',
    publishedAt: '2025-06-28',
    content: `## Why URLs Need Encoding

URLs only support ASCII. Characters like spaces, Chinese text, \`&\`, \`=\`, \`#\` must be percent-encoded.

## Percent-Encoding Examples

| Character | Encoded |
|---|---|
| space | \`%20\` |
| \`&\` | \`%26\` |
| \`=\` | \`%3D\` |
| Chinese 中 | \`%E4%B8%AD\` |

## encodeURI vs encodeURIComponent

\`\`\`javascript
// Use for full URLs (keeps :, /, ?, &, =)
encodeURI('https://example.com/path?q=hello world')

// Use for individual query parameter values (encodes everything)
encodeURIComponent('hello world & more')
// → 'hello%20world%20%26%20more'
\`\`\`

→ Try the [URL Encoder/Decoder](/url-encoder)`,
  },
  {
    slug: 'http-status-codes-complete-guide',
    toolPath: '/http-status-codes',
    title: 'HTTP Status Codes: The Complete Developer Reference',
    description: 'A comprehensive guide to all HTTP status codes: 1xx, 2xx, 3xx, 4xx, 5xx with real-world examples.',
    keywords: ['HTTP status codes', '404 not found', '500 server error', 'HTTP 301 redirect', 'status code reference'],
    category: 'Web',
    publishedAt: '2025-06-29',
    content: `## Status Code Categories

| Range | Meaning |
|---|---|
| 2xx | Success |
| 3xx | Redirect |
| 4xx | Client error |
| 5xx | Server error |

## Most Important Codes

- **200** OK — Standard success
- **201** Created — After POST
- **204** No Content — After DELETE
- **301** Moved Permanently — SEO-friendly redirect
- **400** Bad Request — Malformed input
- **401** Unauthorized — Login required
- **403** Forbidden — Logged in but not allowed
- **404** Not Found
- **422** Unprocessable Entity — Validation errors
- **429** Too Many Requests — Rate limited
- **500** Internal Server Error
- **503** Service Unavailable

→ Try the [HTTP Status Codes Reference](/http-status-codes)`,
  },
  {
    slug: 'crontab-generator-guide',
    toolPath: '/crontab-generator',
    title: 'Crontab Syntax Explained: Schedule Cron Jobs Like a Pro',
    description: 'Master crontab scheduling syntax with our visual generator. Learn how to write cron expressions for any schedule.',
    keywords: ['crontab generator', 'cron syntax', 'cron job', 'cron expression', 'schedule task linux'],
    category: 'Web',
    publishedAt: '2025-06-30',
    content: `## Crontab Syntax

\`\`\`
┌── minute (0–59)
│ ┌── hour (0–23)
│ │ ┌── day of month (1–31)
│ │ │ ┌── month (1–12)
│ │ │ │ ┌── day of week (0–6, Sun=0)
* * * * * command
\`\`\`

## Common Schedules

| Expression | When |
|---|---|
| \`* * * * *\` | Every minute |
| \`0 * * * *\` | Every hour |
| \`0 0 * * *\` | Daily at midnight |
| \`*/15 * * * *\` | Every 15 minutes |
| \`0 9 * * 1-5\` | Weekdays at 9am |
| \`0 0 1 * *\` | First day of each month |

→ Try the [Crontab Generator](/crontab-generator)`,
  },
  {
    slug: 'regex-tester-guide',
    toolPath: '/regex-tester',
    title: 'Regular Expressions Guide: Write, Test, and Debug Regex Online',
    description: 'Learn regex syntax from basics to advanced. Test your expressions instantly and avoid common pitfalls.',
    keywords: ['regex tester', 'regular expressions', 'regex online', 'regex patterns', 'regex tutorial'],
    category: 'Web',
    publishedAt: '2025-07-01',
    content: `## Essential Regex Syntax

| Pattern | Matches |
|---|---|
| \`.\` | Any character |
| \`\\d\` | Digit (0–9) |
| \`\\w\` | Word character |
| \`^\` | Start of string |
| \`$\` | End of string |
| \`*\` | 0 or more |
| \`+\` | 1 or more |
| \`?\` | 0 or 1 |
| \`{n,m}\` | n to m times |

## Common Patterns

\`\`\`regex
# Email
^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$

# URL
https?:\\/\\/[\\w.-]+(\\/[\\w./?%&=-]*)?

# IPv4
\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:...){3}\\b
\`\`\`

## Flags: \`g\` (global), \`i\` (case-insensitive), \`m\` (multiline)

→ Try the [Regex Tester](/regex-tester)`,
  },
  {
    slug: 'jwt-parser-web-guide',
    toolPath: '/jwt-parser',
    title: 'How to Parse and Debug JWT Tokens',
    description: 'Use our online JWT parser to decode, inspect, and debug JSON Web Tokens without any server-side code.',
    keywords: ['JWT debug', 'parse JWT online', 'inspect JWT', 'JWT decode', 'JWT claims viewer'],
    category: 'Web',
    publishedAt: '2025-07-02',
    content: `## Quickly Decode Any JWT

Paste any JWT token and instantly see:
- **Header** — Algorithm and token type
- **Payload** — All claims with human-readable timestamps
- **Expiry status** — Whether the token is still valid
- **Signature info** — Algorithm used

## Common Debugging Scenarios

1. **Token expired** — Check the \`exp\` claim (Unix timestamp).
2. **Wrong audience** — Check the \`aud\` claim matches your service.
3. **Unexpected claims** — Inspect payload to see what the auth server actually sent.

All decoding is done in your browser — tokens never leave your device.

→ Try the [JWT Parser](/jwt-parser)`,
  },
  {
    slug: 'url-parser-guide',
    toolPath: '/url-parser',
    title: 'URL Structure Explained: Parse and Understand Any URL',
    description: 'Learn the anatomy of a URL: protocol, host, port, path, query string, and fragment. Parse any URL instantly.',
    keywords: ['URL parser', 'URL structure', 'parse URL', 'URL anatomy', 'query string'],
    category: 'Web',
    publishedAt: '2025-07-03',
    content: `## URL Anatomy

\`\`\`
https://user:pass@example.com:8080/path?key=val#section
│       │         │           │    │    │        │
│       │         │           │    │    │        └── Fragment
│       │         │           │    │    └────────── Query string
│       │         │           │    └─────────────── Path
│       │         │           └──────────────────── Port
│       │         └──────────────────────────────── Host
│       └────────────────────────────────────────── Auth (userinfo)
└────────────────────────────────────────────────── Protocol (scheme)
\`\`\`

## Query String Parsing

\`\`\`javascript
const url = new URL('https://example.com/search?q=hello&lang=en')
url.searchParams.get('q')    // "hello"
url.searchParams.get('lang') // "en"
\`\`\`

→ Try the [URL Parser](/url-parser)`,
  },
  {
    slug: 'meta-tag-generator-guide',
    toolPath: '/og-meta-generator',
    title: 'Open Graph Meta Tags: How to Control Social Media Previews',
    description: 'Generate Open Graph and Twitter Card meta tags to control how your page appears when shared on social media.',
    keywords: ['Open Graph meta tags', 'og:image', 'meta tag generator', 'social media preview', 'Twitter card'],
    category: 'Web',
    publishedAt: '2025-07-04',
    content: `## What Are Open Graph Tags?

Open Graph meta tags control how your page looks when shared on Facebook, LinkedIn, Slack, and other platforms.

## Essential OG Tags

\`\`\`html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://example.com/preview.jpg" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:type" content="website" />
\`\`\`

## Twitter Card Tags

\`\`\`html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:image" content="https://example.com/preview.jpg" />
\`\`\`

## Best Practices

- **og:image** should be 1200×630px (1.91:1 ratio)
- Keep og:description under 160 characters
- Use absolute URLs for all image links

→ Try the [Meta Tag Generator](/og-meta-generator)`,
  },

  // ─── Development ──────────────────────────────────────────────
  {
    slug: 'json-prettify-and-validate',
    toolPath: '/json-prettify',
    title: 'How to Format and Validate JSON: A Developer\'s Guide',
    description: 'Learn to format, validate, and debug JSON. Understand common JSON errors and best practices.',
    keywords: ['JSON formatter', 'JSON validator', 'format JSON online', 'JSON pretty print', 'JSON syntax error'],
    category: 'Development',
    publishedAt: '2025-07-08',
    content: `## Why Format JSON?

Raw API responses are often minified. Pretty-printing makes the structure readable.

## Common JSON Errors

| Error | Wrong | Correct |
|---|---|---|
| Trailing comma | \`{"a": 1,}\` | \`{"a": 1}\` |
| Single quotes | \`{'key': 'val'}\` | \`{"key": "val"}\` |
| Unquoted keys | \`{key: "val"}\` | \`{"key": "val"}\` |
| Comments | \`// not allowed\` | Remove comments |

## JSON Data Types

\`\`\`json
{
  "string": "hello",
  "number": 42,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": { "nested": "value" }
}
\`\`\`

→ Try the [JSON Formatter](/json-prettify)`,
  },
  {
    slug: 'chmod-calculator-guide',
    toolPath: '/chmod-calculator',
    title: 'Linux File Permissions Explained: chmod Calculator and Reference',
    description: 'Master Unix file permissions. Learn rwx notation, octal values, and use our chmod calculator.',
    keywords: ['chmod calculator', 'linux permissions', 'chmod octal', 'file permissions unix', 'rwx permissions'],
    category: 'Development',
    publishedAt: '2025-07-09',
    content: `## Permission Structure

\`\`\`
-rwxr-xr--
 └┬┘└┬┘└┬┘
  │  │  └── Others: r-- = 4
  │  └───── Group: r-x = 5
  └──────── Owner: rwx = 7
\`\`\`

r=4, w=2, x=1. Add values for each group.

## Common Values

| Octal | Meaning |
|---|---|
| 755 | Standard for executables/dirs |
| 644 | Standard for text files |
| 600 | Private files (SSH keys) |
| 777 | Full access for everyone (avoid!) |

## chmod Examples

\`\`\`bash
chmod 755 script.sh
chmod +x script.sh         # Add execute
chmod -R 755 /var/www      # Recursive
\`\`\`

→ Try the [chmod Calculator](/chmod-calculator)`,
  },
  {
    slug: 'docker-compose-from-run-command',
    toolPath: '/docker-run-to-docker-compose-converter',
    title: 'Convert docker run to docker-compose: A Practical Guide',
    description: 'Convert docker run commands to docker-compose.yml. Understand volumes, ports, environment variables.',
    keywords: ['docker run to compose', 'docker-compose converter', 'docker compose yml', 'docker migration'],
    category: 'Development',
    publishedAt: '2025-07-10',
    content: `## docker run → docker-compose

**docker run:**
\`\`\`bash
docker run -d --name app -p 8080:80 -e KEY=val nginx:alpine
\`\`\`

**docker-compose.yml:**
\`\`\`yaml
services:
  app:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      - KEY=val
\`\`\`

## Options Mapping

| docker run | docker-compose |
|---|---|
| \`--name\` | service name |
| \`-p\` | \`ports:\` |
| \`-v\` | \`volumes:\` |
| \`-e\` | \`environment:\` |
| \`--restart\` | \`restart:\` |

→ Try the [Docker Run → Compose Converter](/docker-run-to-docker-compose-converter)`,
  },
  {
    slug: 'sql-prettify-guide',
    toolPath: '/sql-prettify',
    title: 'How to Format SQL Queries for Better Readability',
    description: 'Learn SQL formatting best practices and use our formatter to clean up messy queries.',
    keywords: ['SQL formatter', 'SQL prettify', 'format SQL online', 'SQL beautifier'],
    category: 'Development',
    publishedAt: '2025-07-11',
    content: `## Formatted vs Unformatted SQL

**Unformatted:**
\`\`\`sql
select u.id,u.name from users u inner join orders o on u.id=o.user_id where o.total>100
\`\`\`

**Formatted:**
\`\`\`sql
SELECT
  u.id,
  u.name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
\`\`\`

## Best Practices

1. Uppercase SQL keywords
2. One clause per line
3. Indent selected columns
4. Explicit JOIN types (INNER, LEFT, RIGHT)
5. Comment complex conditions

→ Try the [SQL Formatter](/sql-prettify)`,
  },
  {
    slug: 'git-memo-common-commands',
    toolPath: '/git-memo',
    title: 'Git Command Cheat Sheet: The Most Useful Commands Explained',
    description: 'A comprehensive Git reference covering everyday commands, branching, undo operations, and advanced workflows.',
    keywords: ['git cheat sheet', 'git commands', 'git memo', 'git reference', 'git workflow'],
    category: 'Development',
    publishedAt: '2025-07-12',
    content: `## Daily Git Workflow

\`\`\`bash
git status                  # Check changes
git add .                   # Stage all
git commit -m "message"     # Commit
git push origin main        # Push
git pull                    # Fetch + merge
\`\`\`

## Branching

\`\`\`bash
git checkout -b feature-x   # Create and switch
git merge feature-x         # Merge into current
git branch -d feature-x     # Delete merged branch
\`\`\`

## Undoing Changes

\`\`\`bash
git restore <file>          # Discard working changes
git commit --amend          # Edit last commit
git revert <commit>         # Safe undo (creates new commit)
git reset --soft HEAD~1     # Undo commit, keep changes
\`\`\`

→ Try the [Git Memo](/git-memo)`,
  },
  {
    slug: 'json-diff-guide',
    toolPath: '/json-diff',
    title: 'JSON Diff: How to Compare Two JSON Objects',
    description: 'Compare two JSON objects and highlight differences. Learn how JSON diff tools work and when to use them.',
    keywords: ['JSON diff', 'compare JSON', 'JSON comparison', 'JSON difference', 'JSON merge'],
    category: 'Development',
    publishedAt: '2025-07-13',
    content: `## When Do You Need JSON Diff?

- Comparing API responses across versions
- Debugging configuration changes
- Reviewing data migrations
- Comparing test fixtures

## Types of Differences

- **Added** — Key exists in new but not old
- **Removed** — Key exists in old but not new
- **Modified** — Same key, different value
- **Type changed** — Value changed from one type to another

## Example

**Old:**
\`\`\`json
{"name": "John", "age": 30, "city": "NYC"}
\`\`\`

**New:**
\`\`\`json
{"name": "John", "age": 31, "country": "US"}
\`\`\`

**Diff:** \`age\` modified (30→31), \`city\` removed, \`country\` added.

→ Try the [JSON Diff Tool](/json-diff)`,
  },
  {
    slug: 'xml-formatter-guide',
    toolPath: '/xml-formatter',
    title: 'XML Formatter: How to Pretty-Print and Validate XML',
    description: 'Format and validate XML documents. Learn XML structure, namespaces, and common parsing errors.',
    keywords: ['XML formatter', 'XML validator', 'pretty print XML', 'XML online', 'XML beautifier'],
    category: 'Development',
    publishedAt: '2025-07-14',
    content: `## XML Structure Basics

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element attribute="value">
    <child>Text content</child>
  </element>
</root>
\`\`\`

## Common XML Errors

- **Unclosed tags** — Every opening tag needs a closing tag.
- **Case sensitivity** — \`<Tag>\` and \`<tag>\` are different elements.
- **Special characters** — Use \`&amp;\`, \`&lt;\`, \`&gt;\`, \`&quot;\` instead of &, <, >, ".
- **Single root** — XML must have exactly one root element.

## XML vs HTML

| Feature | XML | HTML |
|---|---|---|
| Self-closing tags | Required | Optional |
| Case sensitive | ✅ | ❌ |
| Custom tags | ✅ | ❌ |

→ Try the [XML Formatter](/xml-formatter)`,
  },
  {
    slug: 'yaml-viewer-guide',
    toolPath: '/yaml-prettify',
    title: 'YAML Viewer and Formatter: Validate and Pretty-Print YAML',
    description: 'Format and validate YAML files. Learn YAML syntax, common errors, and best practices.',
    keywords: ['YAML formatter', 'YAML validator', 'YAML viewer', 'pretty print YAML', 'YAML syntax'],
    category: 'Development',
    publishedAt: '2025-07-15',
    content: `## YAML Basics

\`\`\`yaml
# Comments are supported
name: John Doe
age: 30
hobbies:
  - reading
  - coding
address:
  city: New York
  zip: "10001"   # Quote strings that look like numbers
\`\`\`

## Common YAML Mistakes

- **Tabs are illegal** — Only spaces for indentation.
- **Auto-typing** — \`true\`, \`false\`, \`yes\`, \`no\`, \`null\` are special values.
- **Inconsistent indentation** — Must be consistent throughout the file.

## YAML in DevOps

YAML is the standard format for:
- **Docker Compose** (\`docker-compose.yml\`)
- **Kubernetes** manifests
- **GitHub Actions** workflows
- **Ansible** playbooks

→ Try the [YAML Formatter](/yaml-prettify)`,
  },

  // ─── Network ──────────────────────────────────────────────────
  {
    slug: 'ipv4-subnet-calculator-guide',
    toolPath: '/ipv4-subnet-calculator',
    title: 'IPv4 Subnetting Explained: CIDR, Subnet Masks, and Network Ranges',
    description: 'Master IPv4 subnetting. Learn CIDR notation, calculate network ranges, hosts, and broadcast addresses.',
    keywords: ['subnet calculator', 'CIDR notation', 'IPv4 subnetting', 'subnet mask', 'network range'],
    category: 'Network',
    publishedAt: '2025-07-20',
    content: `## CIDR Notation

\`192.168.1.0/24\` — Network with 24-bit subnet mask (255.255.255.0), 254 usable hosts.

## Subnet Reference

| CIDR | Hosts | Subnet Mask |
|---|---|---|
| /24 | 254 | 255.255.255.0 |
| /25 | 126 | 255.255.255.128 |
| /26 | 62 | 255.255.255.192 |
| /28 | 14 | 255.255.255.240 |
| /30 | 2 | 255.255.255.252 |

## Private IP Ranges

| CIDR | Range |
|---|---|
| 10.0.0.0/8 | 10.0.0.0 – 10.255.255.255 |
| 172.16.0.0/12 | 172.16.0.0 – 172.31.255.255 |
| 192.168.0.0/16 | 192.168.0.0 – 192.168.255.255 |

→ Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)`,
  },
  {
    slug: 'mac-address-guide',
    toolPath: '/mac-address-generator',
    title: 'MAC Address Explained: Format, OUI, and How to Generate One',
    description: 'Learn about MAC addresses, their format, OUI lookup, and how to generate random or vendor-specific MAC addresses.',
    keywords: ['MAC address generator', 'MAC address lookup', 'OUI lookup', 'MAC address format', 'network hardware'],
    category: 'Network',
    publishedAt: '2025-07-21',
    content: `## What Is a MAC Address?

A **MAC (Media Access Control) address** is a unique hardware identifier assigned to every network interface. It's a 48-bit (6-byte) number, typically written as:

\`\`\`
AA:BB:CC:DD:EE:FF
\`\`\`

## Structure

- **First 3 bytes (OUI)** — Organizationally Unique Identifier, assigned to manufacturer (e.g., \`00:1A:2B\` = Cisco)
- **Last 3 bytes** — Unique device identifier assigned by manufacturer

## Locally Administered vs Universally Administered

- **UAA (Universally Administered)** — Factory-assigned (bit 1 of first byte = 0)
- **LAA (Locally Administered)** — Manually assigned or virtual (bit 1 = 1)

## Common Use Cases

- **VM / Container networking** — Assign unique MACs to virtual interfaces
- **Network testing** — Generate test MAC addresses
- **Firewall rules** — Filter by MAC within a local network

→ Try the [MAC Address Generator](/mac-address-generator) or [Lookup](/mac-address-lookup)`,
  },

  // ─── Math ─────────────────────────────────────────────────────
  {
    slug: 'percentage-calculator-guide',
    toolPath: '/percentage-calculator',
    title: 'Percentage Calculations: Formulas, Examples, and a Free Calculator',
    description: 'Learn all types of percentage calculations: X% of Y, percentage change, what percent X is of Y.',
    keywords: ['percentage calculator', 'how to calculate percentage', 'percentage change', 'percent of number'],
    category: 'Math',
    publishedAt: '2025-07-25',
    content: `## Percentage Formulas

**X% of Y:** \`result = Y × (X / 100)\` → 20% of 150 = **30**

**X is what % of Y:** \`(X / Y) × 100\` → 30 of 150 = **20%**

**% Change:** \`(New - Old) / |Old| × 100\` → 80→100 = **+25%**

**Increase by X%:** \`original × (1 + X/100)\` → 200 × 1.15 = **230**

## Quick Mental Math

- 10% = divide by 10
- 5% = (divide by 10) ÷ 2
- 25% = divide by 4
- 1% = divide by 100

→ Try the [Percentage Calculator](/percentage-calculator)`,
  },
  {
    slug: 'bmi-calculator-guide',
    toolPath: '/bmi-calculator',
    title: 'BMI Calculator: What Your Body Mass Index Means',
    description: 'Calculate your BMI and understand health categories. Learn about BMI limitations and better health metrics.',
    keywords: ['BMI calculator', 'body mass index', 'healthy weight', 'BMI chart', 'overweight BMI'],
    category: 'Math',
    publishedAt: '2025-07-26',
    content: `## BMI Formula

\`BMI = weight(kg) / height(m)²\`

## Categories

| BMI | Category |
|---|---|
| < 18.5 | Underweight |
| 18.5–24.9 | Normal weight |
| 25–29.9 | Overweight |
| 30+ | Obese |

## BMI Limitations

- Doesn't distinguish muscle from fat (athletes score high)
- Doesn't account for fat distribution
- Age and ethnicity affect risk at the same BMI

## Better Alternatives

- **Waist circumference** — Risk increases above 94cm (men) / 80cm (women)
- **Waist-to-height ratio** — Should be < 0.5

→ Try the [BMI Calculator](/bmi-calculator)`,
  },
  {
    slug: 'mortgage-calculator-guide',
    toolPath: '/mortgage-calculator',
    title: 'Mortgage Calculator: Monthly Payments and Amortization Explained',
    description: 'Calculate mortgage payments and see your full amortization schedule. Understand how mortgage math works.',
    keywords: ['mortgage calculator', 'monthly payment calculator', 'amortization schedule', 'home loan calculator'],
    category: 'Math',
    publishedAt: '2025-07-27',
    content: `## Monthly Payment Formula

\`M = P × [r(1+r)^n] / [(1+r)^n - 1]\`

Where P = principal, r = monthly rate, n = total payments.

## Example: $400,000 at 6.5% for 30 years

- Monthly payment: **$2,528**
- Total interest paid: **$510,080** (127% of loan amount!)

## Key Insights

1. **Interest rate matters** — 1% higher rate adds ~$230/month on $400K.
2. **Extra payments** — $200 extra/month can save $80K+ in interest.
3. **20% down payment** — Avoids PMI insurance (saves 0.5–1%/year).

→ Try the [Mortgage Calculator](/mortgage-calculator)`,
  },
  {
    slug: 'math-evaluator-guide',
    toolPath: '/math-evaluator',
    title: 'Math Expression Evaluator: Calculate Complex Formulas Online',
    description: 'Evaluate mathematical expressions, use variables, and compute scientific functions in your browser.',
    keywords: ['math evaluator', 'math calculator', 'expression calculator', 'scientific calculator online', 'formula evaluator'],
    category: 'Math',
    publishedAt: '2025-07-28',
    content: `## Supported Operations

- Basic: \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, \`^\` (power)
- Functions: \`sqrt()\`, \`abs()\`, \`log()\`, \`sin()\`, \`cos()\`, \`tan()\`
- Constants: \`pi\`, \`e\`

## Examples

\`\`\`
2^10         → 1024
sqrt(144)    → 12
sin(pi/2)    → 1
log(1000)    → 3
\`\`\`

## Use Cases

- Quick engineering calculations
- Checking formula results
- Teaching/learning math concepts
- Financial calculations (compound interest, etc.)

→ Try the [Math Evaluator](/math-evaluator)`,
  },
  {
    slug: 'eta-calculator-guide',
    toolPath: '/eta-calculator',
    title: 'ETA Calculator: Estimate Completion Time for Any Task',
    description: 'Calculate estimated time of arrival or completion based on progress rate. Perfect for downloads, processes, and projects.',
    keywords: ['ETA calculator', 'estimated time', 'completion time calculator', 'time remaining', 'progress calculator'],
    category: 'Math',
    publishedAt: '2025-07-29',
    content: `## What Is ETA?

**ETA (Estimated Time of Arrival/Completion)** predicts when a task will finish based on current progress rate.

## Formula

\`\`\`
Remaining = Total - Completed
Rate = Completed / Elapsed time
ETA = Remaining / Rate
\`\`\`

## Common Use Cases

- **File downloads** — "3.2 GB of 10 GB downloaded, 45 min remaining"
- **Data processing** — Estimate batch job completion
- **Project planning** — Based on velocity
- **Fitness goals** — At current rate, when will you reach your goal?

→ Try the [ETA Calculator](/eta-calculator)`,
  },

  // ─── Text ─────────────────────────────────────────────────────
  {
    slug: 'lorem-ipsum-guide',
    toolPath: '/lorem-ipsum-generator',
    title: 'Lorem Ipsum: History, Uses, and How to Generate the Right Amount',
    description: 'Learn about Lorem Ipsum placeholder text — its history, when to use it, and how to generate words, sentences, or paragraphs.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'lorem ipsum online', 'filler text'],
    category: 'Text',
    publishedAt: '2025-07-30',
    content: `## What Is Lorem Ipsum?

Placeholder text derived from Cicero's philosophical work (45 BC). Used in design to fill space before real content is available.

## When to Use It

✅ Wireframes and mockups
✅ Testing typography and layout
✅ Demonstrating UI components

❌ When presenting to clients (they may think it's final)
❌ In code going to production

## Alternatives

- **Real content** — Best if available early
- **Meaningful placeholders** — "User Name", "Product Title"
- **Hipster Ipsum / Cupcake Ipsum** — Thematic placeholders

→ Try the [Lorem Ipsum Generator](/lorem-ipsum-generator)`,
  },
  {
    slug: 'text-diff-guide',
    toolPath: '/text-diff',
    title: 'Text Diff Tool: How to Compare Two Texts and Find Differences',
    description: 'Compare two texts side-by-side and highlight every difference. Learn about diff algorithms and practical applications.',
    keywords: ['text diff', 'compare text', 'text comparison', 'find differences', 'diff tool online'],
    category: 'Text',
    publishedAt: '2025-07-31',
    content: `## How Diff Works

Diff algorithms find the **Longest Common Subsequence (LCS)** of two texts, then show what was added, removed, or unchanged.

## Output Conventions

- 🟢 **Green / +** — Added lines
- 🔴 **Red / −** — Removed lines
- ⬜ **White** — Unchanged lines

## Common Use Cases

- Compare code versions without git
- Review document edits
- Validate data transformations
- Check translation consistency

## Diff Modes

- **Line diff** — Compare entire lines
- **Word diff** — Highlight word-level changes within lines
- **Character diff** — Most granular, shows every character change

→ Try the [Text Diff Tool](/text-diff)`,
  },
  {
    slug: 'emoji-picker-guide',
    toolPath: '/emoji-picker',
    title: 'Emoji Picker: Find and Copy Any Emoji Instantly',
    description: 'Browse, search, and copy emojis from all Unicode categories. Learn emoji Unicode codes and how to use them in code.',
    keywords: ['emoji picker', 'emoji search', 'copy emoji', 'emoji unicode', 'emoji keyboard'],
    category: 'Text',
    publishedAt: '2025-08-01',
    content: `## Emoji in Different Contexts

| Context | Usage |
|---|---|
| HTML | \`&#128512;\` or \`&#x1F600;\` |
| CSS | \`content: "\\1F600";\` |
| JavaScript | \`"\\u{1F600}"\` |
| Python | \`"\\U0001F600"\` |
| Markdown | \`:smile:\` (platform-dependent) |

## Unicode Categories

- 😀 Smileys & People
- 🐶 Animals & Nature
- 🍕 Food & Drink
- ✈️ Travel & Places
- ⚽ Activities
- 💡 Objects
- ❤️ Symbols

## Tips

- Some emojis have multiple skin tone variants (type + modifier).
- ZWJ sequences combine emojis: 👨‍💻 = 👨 + ZWJ + 💻.

→ Try the [Emoji Picker](/emoji-picker)`,
  },
  {
    slug: 'string-obfuscator-guide',
    toolPath: '/string-obfuscator',
    title: 'String Obfuscation: What It Is and When to Use It',
    description: 'Obfuscate strings to hide sensitive data in UI, emails, or code. Learn the difference between obfuscation and encryption.',
    keywords: ['string obfuscator', 'obfuscate text', 'hide string', 'text obfuscation', 'data masking'],
    category: 'Text',
    publishedAt: '2025-08-02',
    content: `## What Is String Obfuscation?

Obfuscation makes text hard to read without completely hiding it. It's weaker than encryption but useful for:

- Displaying partial data (credit card: \`**** **** **** 1234\`)
- Masking email in HTML to reduce spam scraping
- Hiding API keys in screenshots or logs

## Obfuscation vs Encryption

| | Obfuscation | Encryption |
|---|---|---|
| Reversible | Sometimes | ✅ With key |
| Security | Low | High |
| Use case | Cosmetic hiding | Real security |

## Common Techniques

- **Asterisk masking**: \`hello\` → \`***lo\`
- **ROT13**: letter rotation by 13 positions
- **Zero-width characters**: invisible Unicode separators

→ Try the [String Obfuscator](/string-obfuscator)`,
  },
  {
    slug: 'text-statistics-guide',
    toolPath: '/text-statistics',
    title: 'Text Statistics: Count Words, Characters, Sentences, and Reading Time',
    description: 'Analyze any text with our statistics tool. Count words, characters, sentences, paragraphs, and estimate reading time.',
    keywords: ['word counter', 'character counter', 'text statistics', 'reading time estimator', 'text analysis'],
    category: 'Text',
    publishedAt: '2025-08-03',
    content: `## Common Text Metrics

| Metric | How Calculated |
|---|---|
| Words | Whitespace-delimited tokens |
| Characters | Total Unicode code points |
| Characters (no spaces) | Characters minus whitespace |
| Sentences | Ended by . ! ? |
| Paragraphs | Double line breaks |
| Reading time | Words / 200 (average adult reading speed) |

## Writing Guidelines

- **Blog post**: 300–1500 words for SEO
- **Tweet**: 280 characters max
- **Meta description**: 150–160 characters
- **Email subject**: Under 60 characters
- **LinkedIn post**: Under 1300 characters before "see more"

→ Try the [Text Statistics Tool](/text-statistics)`,
  },

  // ─── Measurement ──────────────────────────────────────────────
  {
    slug: 'chronometer-guide',
    toolPath: '/chronometer',
    title: 'Online Chronometer: How to Time Events and Record Laps',
    description: 'Use our online stopwatch/chronometer to time tasks, record lap times, and track elapsed time precisely.',
    keywords: ['chronometer online', 'stopwatch online', 'lap timer', 'online timer', 'elapsed time'],
    category: 'Measurement',
    publishedAt: '2025-08-05',
    content: `## Chronometer vs Stopwatch vs Timer

- **Chronometer** — Measures elapsed time from start to stop (forward).
- **Timer** — Counts down from a set time to zero.
- **Alarm** — Triggers at a specific clock time.

## Use Cases

- **Exercise timing** — Lap times, interval training
- **Productivity** — Pomodoro technique (25-min work sessions)
- **Testing** — Measure response times
- **Presentations** — Track speaking time

## Tips

- Click **Lap** to record a split time without stopping the main timer.
- The overall time keeps running while laps are recorded.

→ Try the [Chronometer](/chronometer)`,
  },
  {
    slug: 'benchmark-builder-guide',
    toolPath: '/benchmark-builder',
    title: 'JavaScript Benchmark Builder: Test and Compare Code Performance',
    description: 'Build and run JavaScript performance benchmarks in your browser. Compare multiple code snippets with ops/sec measurements.',
    keywords: ['benchmark builder', 'JavaScript performance', 'code benchmark', 'performance testing', 'ops per second'],
    category: 'Measurement',
    publishedAt: '2025-08-06',
    content: `## Why Benchmark Code?

Micro-benchmarks help you:
- Compare algorithm implementations
- Choose between library functions
- Verify optimization improvements
- Understand performance tradeoffs

## What to Measure

\`\`\`javascript
// Snippet A: Array.indexOf
arr.indexOf(target) !== -1

// Snippet B: Set.has
set.has(target)

// Result: Set.has is typically 3–10x faster for large collections
\`\`\`

## Important Caveats

- JIT compilers may optimize benchmarks unrealistically.
- Warm-up iterations are needed for accurate results.
- Results vary by browser engine (V8, SpiderMonkey, JavaScriptCore).
- Always benchmark in the actual environment (Node.js vs browser).

→ Try the [Benchmark Builder](/benchmark-builder)`,
  },

  // ─── Images ───────────────────────────────────────────────────
  {
    slug: 'qr-code-generator-guide',
    toolPath: '/qrcode-generator',
    title: 'QR Code Generator: Everything You Need to Know',
    description: 'Generate QR codes for URLs, text, contact info. Learn about error correction, sizes, and best practices.',
    keywords: ['QR code generator', 'generate QR code', 'QR code online', 'free QR code', 'QR code for URL'],
    category: 'Images and videos',
    publishedAt: '2025-08-10',
    content: `## Error Correction Levels

| Level | Recovery | Use Case |
|---|---|---|
| L | 7% | Clean environments |
| M | 15% | Default |
| Q | 25% | Industrial |
| H | 30% | With logo overlay |

## Best Practices

- Minimum size: **2cm × 2cm** for reliable scanning
- Use dark on light background
- Test with multiple devices before printing
- Short URLs = simpler, more reliable QR codes
- Add a "Scan me" call-to-action

## What You Can Encode

- Website URLs
- WiFi credentials
- vCard contact info
- Plain text
- App Store links

→ Try the [QR Code Generator](/qrcode-generator)`,
  },
  {
    slug: 'svg-placeholder-guide',
    toolPath: '/svg-placeholder-generator',
    title: 'SVG Placeholder Images: Generate Customizable Placeholders',
    description: 'Create SVG placeholder images with custom sizes, colors, and text for mockups, wireframes, and development.',
    keywords: ['SVG placeholder', 'placeholder image generator', 'dummy image', 'placeholder image online', 'image placeholder'],
    category: 'Images and videos',
    publishedAt: '2025-08-11',
    content: `## Why SVG Placeholders?

SVG placeholders are:
- **Infinitely scalable** — Look perfect at any resolution
- **Tiny file size** — Just text, no pixels
- **Customizable** — Change size, color, text inline

## Example SVG Placeholder

\`\`\`html
<img src="https://via.placeholder.com/400x300" alt="400x300 placeholder" />

<!-- Or inline SVG -->
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#e0e0e0"/>
  <text x="50%" y="50%" text-anchor="middle" fill="#666">400 × 300</text>
</svg>
\`\`\`

## Use Cases

- UI mockups and wireframes
- Testing image layouts before assets are ready
- Documentation and README images
- Email template testing

→ Try the [SVG Placeholder Generator](/svg-placeholder-generator)`,
  },
  {
    slug: 'color-palette-generator-guide',
    toolPath: '/color-palette-generator',
    title: 'Color Palette Generator: Create Beautiful Color Schemes',
    description: 'Generate harmonious color palettes for design projects. Learn color theory: complementary, analogous, and triadic schemes.',
    keywords: ['color palette generator', 'color scheme generator', 'color theory', 'complementary colors', 'design colors'],
    category: 'Images and videos',
    publishedAt: '2025-08-12',
    content: `## Color Harmony Types

**Complementary** — Opposite colors on the wheel. High contrast, vibrant.

**Analogous** — Adjacent colors. Harmonious, pleasing.

**Triadic** — Three evenly-spaced colors. Balanced, colorful.

**Monochromatic** — Shades of a single hue. Elegant, cohesive.

## The 60-30-10 Rule

A classic design principle:
- **60%** — Dominant color (background/neutral)
- **30%** — Secondary color (cards, sections)
- **10%** — Accent color (CTA buttons, highlights)

## CSS Custom Properties

\`\`\`css
:root {
  --color-primary: #6366f1;
  --color-secondary: #a78bfa;
  --color-accent: #f59e0b;
}
\`\`\`

→ Try the [Color Palette Generator](/color-palette-generator)`,
  },

  // ─── Data ─────────────────────────────────────────────────────
  {
    slug: 'phone-formatter-guide',
    toolPath: '/phone-parser-and-formatter',
    title: 'Phone Number Formatting: Parse, Format, and Validate International Numbers',
    description: 'Parse and format international phone numbers. Learn about E.164 format, country codes, and validation.',
    keywords: ['phone number formatter', 'E.164 format', 'international phone number', 'phone validator', 'country code'],
    category: 'Data',
    publishedAt: '2025-08-15',
    content: `## Phone Number Formats

| Format | Example |
|---|---|
| E.164 (international) | \`+14155552671\` |
| National (US) | \`(415) 555-2671\` |
| International | \`+1 415-555-2671\` |
| RFC 3966 | \`tel:+14155552671\` |

## E.164 Format

The standard for storing phone numbers:
- Starts with \`+\`
- Country code (1–3 digits)
- Subscriber number
- No spaces, dashes, or parentheses
- Maximum 15 digits total

## Best Practices

- Always store in E.164 format in databases.
- Validate with a library (libphonenumber) — regex alone is unreliable.
- Display in local format based on user's country.

→ Try the [Phone Parser & Formatter](/phone-parser-and-formatter)`,
  },
  {
    slug: 'iban-validator-guide',
    toolPath: '/iban-validator-and-parser',
    title: 'IBAN Validator: How to Verify International Bank Account Numbers',
    description: 'Validate and parse IBAN numbers. Learn the IBAN structure, country formats, and how checksum validation works.',
    keywords: ['IBAN validator', 'IBAN checker', 'international bank account', 'IBAN format', 'IBAN checksum'],
    category: 'Data',
    publishedAt: '2025-08-16',
    content: `## What Is an IBAN?

**IBAN** (International Bank Account Number) is a standardized format for bank account numbers, used in Europe and many other countries. It enables unambiguous cross-border payment routing.

## IBAN Structure

\`\`\`
GB82 WEST 1234 5698 7654 32
│   │    │
│   │    └── BBAN (Basic Bank Account Number) — country specific
│   └──────── 2-digit check digits
└──────────── 2-letter country code
\`\`\`

## Length by Country

| Country | Length | Example |
|---|---|---|
| Germany (DE) | 22 | DE89370400440532013000 |
| UK (GB) | 22 | GB82WEST12345698765432 |
| France (FR) | 27 | FR7614508013000405823000126 |

## Checksum Validation

IBAN uses MOD-97-10 checksum: move country code to end, replace letters with numbers, compute mod 97 — valid if result = 1.

→ Try the [IBAN Validator](/iban-validator-and-parser)`,
  },
  {
    slug: 'json-to-csv-guide',
    toolPath: '/json-to-csv',
    title: 'JSON to CSV Converter: Export Data for Spreadsheets',
    description: 'Convert JSON arrays to CSV format for use in Excel, Google Sheets, and data analysis tools.',
    keywords: ['JSON to CSV', 'convert JSON CSV', 'JSON export', 'JSON spreadsheet', 'CSV converter'],
    category: 'Development',
    publishedAt: '2025-08-17',
    content: `## JSON to CSV Use Cases

- Export API data to Excel / Google Sheets
- Data migration between systems
- Prepare data for analysis tools (pandas, R, Tableau)
- Generate reports from JSON APIs

## Example

**JSON:**
\`\`\`json
[
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "LA"}
]
\`\`\`

**CSV:**
\`\`\`
name,age,city
Alice,30,NYC
Bob,25,LA
\`\`\`

## CSV Format Rules

- Values with commas must be quoted: \`"New York, NY"\`
- Values with quotes escape as double-quote: \`"He said ""hello"""\`
- Line endings: CRLF (\\r\\n) or LF (\\n)

→ Try the [JSON to CSV Converter](/json-to-csv)`,
  },
  {
    slug: 'number-formatter-guide',
    toolPath: '/number-formatter',
    title: 'Number Formatting: Thousands Separators, Decimals, and Locale Formats',
    description: 'Format numbers with thousands separators, decimal points, and currency symbols for different locales.',
    keywords: ['number formatter', 'number format', 'thousands separator', 'decimal format', 'locale number'],
    category: 'Math',
    publishedAt: '2025-08-18',
    content: `## Number Formats by Locale

| Locale | 1 million | 3.14 |
|---|---|---|
| US (en-US) | 1,000,000 | 3.14 |
| Germany (de-DE) | 1.000.000 | 3,14 |
| Switzerland (de-CH) | 1'000'000 | 3.14 |
| India (en-IN) | 10,00,000 | 3.14 |

## JavaScript Intl API

\`\`\`javascript
// Format a number for display
new Intl.NumberFormat('en-US').format(1234567.89)
// → "1,234,567.89"

// Currency format
new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(1234.5)
// → "$1,234.50"
\`\`\`

## Best Practices

- Store numbers as plain numbers (not formatted strings) in databases.
- Format only at display time.
- Use Intl.NumberFormat for locale-aware formatting.

→ Try the [Number Formatter](/number-formatter)`,
  },
  {
    slug: 'device-information-guide',
    toolPath: '/device-information',
    title: 'Device Information: What Your Browser Reveals About You',
    description: 'See what information your browser exposes: screen size, OS, browser version, language, timezone, and more.',
    keywords: ['device information', 'browser fingerprint', 'user agent', 'screen resolution', 'browser info'],
    category: 'Web',
    publishedAt: '2025-08-19',
    content: `## What Browsers Expose

Every time you visit a website, your browser shares:

| Data | Example |
|---|---|
| User Agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) |
| Screen size | 1920×1080, 2x pixel ratio |
| Language | en-US, zh-CN |
| Timezone | America/New_York (UTC-5) |
| Color depth | 24-bit |
| Platform | MacIntel |
| Touch support | No |

## Browser Fingerprinting

Combining these (and more) data points creates a unique "fingerprint" that can track users without cookies. Studies show 90%+ of browsers have unique fingerprints.

## Privacy Tips

- Use **Tor Browser** or **Brave** to reduce fingerprinting.
- A **VPN** hides your IP but not your browser fingerprint.
- **Private/Incognito mode** does NOT prevent fingerprinting.

→ Try the [Device Information Tool](/device-information)`,
  },
  {
    slug: 'mime-types-guide',
    toolPath: '/mime-types',
    title: 'MIME Types: What They Are and How to Use Them',
    description: 'Learn about MIME types (media types), how they work in HTTP headers, and find the right type for any file extension.',
    keywords: ['MIME types', 'media type', 'content type', 'HTTP header', 'file extension MIME'],
    category: 'Web',
    publishedAt: '2025-08-20',
    content: `## What Is a MIME Type?

A MIME type (Multipurpose Internet Mail Extensions type) tells browsers and servers what kind of content a file contains. Format: \`type/subtype\`

## Common MIME Types

| Extension | MIME Type |
|---|---|
| .html | \`text/html\` |
| .css | \`text/css\` |
| .js | \`application/javascript\` |
| .json | \`application/json\` |
| .png | \`image/png\` |
| .pdf | \`application/pdf\` |
| .zip | \`application/zip\` |
| .mp4 | \`video/mp4\` |

## In HTTP Headers

\`\`\`http
Content-Type: application/json; charset=utf-8
Accept: text/html, application/json
\`\`\`

## Why It Matters

Browsers use MIME types (not file extensions) to decide how to handle content. Serving a JavaScript file as \`text/plain\` will prevent it from executing.

→ Try the [MIME Types Reference](/mime-types)`,
  },
  {
    slug: 'user-agent-parser-guide',
    toolPath: '/user-agent-parser',
    title: 'User Agent Parser: Detect Browser, OS, and Device from User Agent Strings',
    description: 'Parse and understand User Agent strings. Learn browser detection, OS identification, and device type detection.',
    keywords: ['user agent parser', 'user agent string', 'browser detection', 'OS detection', 'device detection'],
    category: 'Web',
    publishedAt: '2025-08-21',
    content: `## User Agent String Format

\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 
(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
\`\`\`

All browsers include \`Mozilla/5.0\` for historical compatibility reasons.

## What to Extract

| Field | Example |
|---|---|
| Browser | Chrome 120.0 |
| OS | Windows 10 |
| Device type | Desktop |
| Engine | WebKit 537.36 |

## Server-Side Detection (Node.js)

\`\`\`javascript
const ua = require('ua-parser-js');
const result = ua(req.headers['user-agent']);
// { browser: {name: 'Chrome', version: '120'}, os: {name: 'Windows'} }
\`\`\`

## Warning: UA Spoofing

User agents can be easily spoofed. Use feature detection (not UA detection) for browser compatibility decisions.

→ Try the [User Agent Parser](/user-agent-parser)`,
  },
  {
    slug: 'keycode-info-guide',
    toolPath: '/keycode-info',
    title: 'JavaScript Key Codes: Every Keyboard Key and Its Event Properties',
    description: 'Find the keyCode, key, and code for any keyboard key. Learn the difference between keyCode, which, key, and code.',
    keywords: ['keycode', 'JavaScript key event', 'key code reference', 'event.key', 'keyboard codes'],
    category: 'Web',
    publishedAt: '2025-08-22',
    content: `## Key Event Properties

\`\`\`javascript
document.addEventListener('keydown', (e) => {
  e.key     // "a", "Enter", "ArrowLeft" (semantic value)
  e.code    // "KeyA", "Enter", "ArrowLeft" (physical key)
  e.keyCode // 65, 13, 37 (deprecated but still widely used)
  e.which   // Same as keyCode (deprecated)
});
\`\`\`

## key vs code

- **\`e.key\`** — What the key means (respects keyboard layout, caps lock, shift)
- **\`e.code\`** — Physical key position (layout-independent, e.g., "KeyA" always = A key regardless of layout)

## Common Key Codes

| Key | e.key | e.code | e.keyCode |
|---|---|---|---|
| Enter | "Enter" | "Enter" | 13 |
| Space | " " | "Space" | 32 |
| Escape | "Escape" | "Escape" | 27 |
| Left Arrow | "ArrowLeft" | "ArrowLeft" | 37 |
| A | "a"/"A" | "KeyA" | 65 |

→ Try the [Keycode Info Tool](/keycode-info)`,
  },
  {
    slug: 'slugify-string-guide',
    toolPath: '/slugify-string',
    title: 'URL Slugs Explained: How to Create SEO-Friendly URLs',
    description: 'Convert any text into a URL-friendly slug. Learn best practices for SEO-friendly URL structure.',
    keywords: ['slugify', 'URL slug', 'SEO URL', 'create slug', 'URL friendly string'],
    category: 'Web',
    publishedAt: '2025-08-23',
    content: `## What Is a URL Slug?

A slug is the human-readable, URL-friendly part of a URL:

\`\`\`
https://example.com/blog/how-to-create-seo-friendly-urls
                         ↑
                    this is the slug
\`\`\`

## Slugification Rules

1. Convert to lowercase
2. Replace spaces and special chars with hyphens
3. Remove non-ASCII characters (or transliterate: é → e)
4. Remove duplicate hyphens
5. Trim leading/trailing hyphens

**Example:** "Hello, World! How Are You?" → \`hello-world-how-are-you\`

## SEO Best Practices for URLs

- Keep slugs short and descriptive (3–5 words)
- Include the main keyword
- Use hyphens (not underscores — Google treats underscores as word joiners)
- Avoid stop words (a, the, in, of) unless needed for readability

→ Try the [Slugify String Tool](/slugify-string)`,
  },
  {
    slug: 'html-entities-guide',
    toolPath: '/html-entities',
    title: 'HTML Entities: Encode Special Characters for Safe Web Display',
    description: 'Learn which HTML characters need encoding, common entity names, and how to prevent XSS with proper encoding.',
    keywords: ['HTML entities', 'HTML encode', 'HTML escape', 'special characters HTML', 'XSS prevention'],
    category: 'Web',
    publishedAt: '2025-08-24',
    content: `## Why HTML Encoding Matters

Unencoded special characters break HTML structure and enable **XSS (Cross-Site Scripting)** attacks.

## Essential HTML Entities

| Character | Entity Name | Entity Number |
|---|---|---|
| \`<\` | \`&lt;\` | \`&#60;\` |
| \`>\` | \`&gt;\` | \`&#62;\` |
| \`&\` | \`&amp;\` | \`&#38;\` |
| \`"\` | \`&quot;\` | \`&#34;\` |
| \`'\` | \`&apos;\` | \`&#39;\` |

## XSS Prevention

\`\`\`javascript
// WRONG - XSS vulnerability!
element.innerHTML = userInput;

// CORRECT - safe encoding
element.textContent = userInput;
// or encode first:
element.innerHTML = userInput
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
\`\`\`

→ Try the [HTML Entities Tool](/html-entities)`,
  },
  {
    slug: 'basic-auth-generator-guide',
    toolPath: '/basic-auth-generator',
    title: 'HTTP Basic Authentication: How It Works and How to Generate Headers',
    description: 'Understand HTTP Basic Auth, generate Base64-encoded credentials, and learn when to use (and not use) Basic Auth.',
    keywords: ['basic auth generator', 'HTTP basic auth', 'authorization header', 'basic authentication', 'base64 credentials'],
    category: 'Web',
    publishedAt: '2025-08-25',
    content: `## How Basic Auth Works

HTTP Basic Authentication encodes \`username:password\` in Base64 and sends it in the \`Authorization\` header:

\`\`\`http
Authorization: Basic dXNlcjpwYXNzd29yZA==
\`\`\`

Where \`dXNlcjpwYXNzd29yZA==\` = \`base64("user:password")\`

## When to Use Basic Auth

✅ **Internal APIs** protected by TLS
✅ **Development/testing** environments
✅ **Simple machine-to-machine** authentication

❌ **Public-facing user authentication** — use OAuth/JWT instead
❌ **Without HTTPS** — credentials are easily intercepted

## Curl Example

\`\`\`bash
curl -u username:password https://api.example.com/data
# Equivalent to:
curl -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" https://api.example.com/data
\`\`\`

→ Try the [Basic Auth Generator](/basic-auth-generator)`,
  },
  {
    slug: 'safelink-decoder-guide',
    toolPath: '/safelink-decoder',
    title: 'Safelink Decoder: Unwrap Redirected URLs from Email Security Tools',
    description: 'Decode "safe links" wrapped by email security tools (Microsoft ATP, Proofpoint) to see the original URL.',
    keywords: ['safelink decoder', 'Microsoft safelinks', 'Proofpoint URL', 'unwrap URL', 'email redirect decoder'],
    category: 'Web',
    publishedAt: '2025-08-26',
    content: `## What Are Safelinks?

Email security gateways (Microsoft Defender ATP, Proofpoint, Mimecast) rewrite URLs in emails to proxy them through their scanning service.

**Original URL:** \`https://example.com/resource\`

**After wrapping:**
\`\`\`
https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fresource&...
\`\`\`

## Why Decode Them?

- Check where a link actually goes before clicking
- Share the clean original URL
- Debug email automation and link tracking

## Privacy Note

All decoding is done locally in your browser — no URLs are sent to any server.

→ Try the [Safelink Decoder](/safelink-decoder)`,
  },

  // ─── Remaining tools ──────────────────────────────────────────
  {
    slug: 'wifi-qr-code-guide',
    toolPath: '/wifi-qrcode-generator',
    title: 'WiFi QR Code Generator: Share Network Credentials Instantly',
    description: 'Generate a QR code for your WiFi network. Guests scan it to connect without typing the password.',
    keywords: ['wifi QR code', 'WiFi QR generator', 'share WiFi password', 'WiFi QR code generator'],
    category: 'Images and videos',
    publishedAt: '2025-08-27',
    content: `## WiFi QR Code Format

\`\`\`
WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
\`\`\`

Where: T=security type, S=SSID, P=password.

## Supported Security Types

- **WPA/WPA2/WPA3** — Most common
- **WEP** — Legacy, insecure
- **nopass** — Open network

## Use Cases

- Guest networks in homes, offices, cafés
- Hotel room cards
- Conference room displays
- Event signage

## Privacy Note

The QR code is generated entirely in your browser. Your WiFi password is never sent to any server.

→ Try the [WiFi QR Code Generator](/wifi-qrcode-generator)`,
  },
  {
    slug: 'camera-recorder-guide',
    toolPath: '/camera-recorder',
    title: 'Browser Camera Recorder: Record Video Directly from Your Browser',
    description: 'Record video from your webcam directly in the browser. No software installation required.',
    keywords: ['browser camera recorder', 'webcam recorder online', 'record video browser', 'MediaRecorder API'],
    category: 'Images and videos',
    publishedAt: '2025-08-28',
    content: `## How It Works

The browser's **MediaRecorder API** (part of WebRTC) allows recording from:
- Webcam / camera
- Screen capture
- Microphone

All recording happens locally — video stays on your device.

## Common Use Cases

- Quick screen recordings for bug reports
- Recording video messages
- Testing webcam before a call
- Capturing demonstrations

## Browser Support

MediaRecorder is supported in all modern browsers (Chrome, Firefox, Safari 14+, Edge).

→ Try the [Camera Recorder](/camera-recorder)`,
  },
  {
    slug: 'ascii-art-generator-guide',
    toolPath: '/ascii-text-drawer',
    title: 'ASCII Art Text Generator: Create Text Art for Terminals and READMEs',
    description: 'Convert text to ASCII art using FIGlet fonts. Perfect for terminal banners, README headers, and retro designs.',
    keywords: ['ASCII art generator', 'ASCII text', 'FIGlet', 'text art', 'terminal banner'],
    category: 'Text',
    publishedAt: '2025-08-29',
    content: `## What Is ASCII Art?

ASCII art uses text characters to create visual designs. Large text art uses characters to form big letters, often used in:

- Terminal program banners
- README headers
- Code comment separators
- Retro-style designs

## FIGlet

**FIGlet** (Frank, Ian and Glenn's Letters) is the most popular ASCII art text generator, supporting hundreds of fonts.

## Example (Standard font)

\`\`\`
 _   _      _ _       
| | | | ___| | | ___  
| |_| |/ _ \\ | |/ _ \\ 
|  _  |  __/ | | (_) |
|_| |_|\\___|_|_|\\___/ 
\`\`\`

## Popular Uses

- \`cat /etc/motd\` banners on Linux servers
- README.md decorative headers
- Code comment section dividers

→ Try the [ASCII Text Drawer](/ascii-text-drawer)`,
  },
  {
    slug: 'numeronym-generator-guide',
    toolPath: '/numeronym-generator',
    title: 'Numeronyms Explained: i18n, a11y, k8s and How They\'re Created',
    description: 'Learn what numeronyms are, why they exist in tech culture, and generate numeronyms for any word.',
    keywords: ['numeronym generator', 'i18n meaning', 'a11y meaning', 'k8s meaning', 'numeronym'],
    category: 'Text',
    publishedAt: '2025-08-30',
    content: `## What Is a Numeronym?

A **numeronym** is an abbreviation where a number represents the count of omitted letters between the first and last letter.

**Formula:** first_letter + count_of_middle_letters + last_letter

## Famous Tech Numeronyms

| Numeronym | Full Word |
|---|---|
| i18n | internationalization (i + 18 letters + n) |
| a11y | accessibility (a + 11 letters + y) |
| k8s | Kubernetes (k + 8 letters + s) |
| l10n | localization |
| o11y | observability |

## Why They Exist

Long technical words are used constantly in tech discussions. Numeronyms save typing while remaining recognizable to those who know them.

→ Try the [Numeronym Generator](/numeronym-generator)`,
  },
  {
    slug: 'random-decision-picker-guide',
    toolPath: '/random-decision-picker',
    title: 'Random Decision Picker: How to Make Unbiased Random Choices',
    description: 'Pick a random item from a list. Use it for team assignments, choosing restaurants, or any fair random selection.',
    keywords: ['random decision picker', 'random choice', 'random picker', 'random selector', 'pick random'],
    category: 'Text',
    publishedAt: '2025-08-31',
    content: `## Uses for Random Picking

- **Team assignments** — Randomly assign tasks to team members
- **Code reviews** — Pick a random reviewer
- **Choosing** — Restaurant, movie, vacation destination
- **Games** — Random participant selection
- **Giveaways** — Fair winner selection

## Fair Randomness

This tool uses \`crypto.getRandomValues()\` — the same cryptographically secure random source as security tools — ensuring fair, unbiased picks.

## Tips

- List each option once for equal probability.
- If you want weighted choices, list an option multiple times.

→ Try the [Random Decision Picker](/random-decision-picker)`,
  },
  {
    slug: 'ipv4-range-expander-guide',
    toolPath: '/ipv4-range-expander',
    title: 'IPv4 Range Expander: List All IPs in a CIDR Range',
    description: 'Expand a CIDR range or IP range into a complete list of individual IP addresses.',
    keywords: ['IPv4 range', 'CIDR expander', 'list IP addresses', 'IP range calculator', 'subnet to IP list'],
    category: 'Network',
    publishedAt: '2025-09-01',
    content: `## When Do You Need to Expand IP Ranges?

- Firewall rules that require individual IPs
- Checking if a specific IP falls in a range
- Network inventory and auditing
- Security scanning of specific subnets

## CIDR to IP List

\`192.168.1.0/30\` expands to:
\`\`\`
192.168.1.0  (network address)
192.168.1.1
192.168.1.2
192.168.1.3  (broadcast address)
\`\`\`

## Warning: Large Ranges

A /8 subnet has 16,777,216 addresses. Only expand small subnets (/24 or smaller) when you need individual IPs.

→ Try the [IPv4 Range Expander](/ipv4-range-expander)`,
  },
  {
    slug: 'ipv4-address-converter-guide',
    toolPath: '/ipv4-address-converter',
    title: 'IPv4 Address Converter: Decimal, Binary, Hex, and Integer',
    description: 'Convert IPv4 addresses between dotted decimal, binary, hexadecimal, and 32-bit integer representations.',
    keywords: ['IPv4 converter', 'IP address binary', 'IP to hex', 'IP address integer', 'IP address format'],
    category: 'Network',
    publishedAt: '2025-09-02',
    content: `## IPv4 Representation Formats

**192.168.1.1** in different formats:

| Format | Value |
|---|---|
| Dotted decimal | 192.168.1.1 |
| Binary | 11000000.10101000.00000001.00000001 |
| Hexadecimal | 0xC0A80101 |
| 32-bit integer | 3232235777 |

## Why Convert?

- **Database storage** — Store IPs as 32-bit integers for faster range queries.
- **Networking tools** — Some accept hex or integer format.
- **Debugging** — Verify your understanding of IP math.

→ Try the [IPv4 Address Converter](/ipv4-address-converter)`,
  },
  {
    slug: 'ipv6-ula-generator-guide',
    toolPath: '/ipv6-ula-generator',
    title: 'IPv6 ULA Generator: Create Unique Local Addresses for Private Networks',
    description: 'Generate IPv6 Unique Local Addresses (ULA) for private networks. Understand the fd00::/8 address space.',
    keywords: ['IPv6 ULA', 'unique local address', 'IPv6 private', 'fd00 range', 'IPv6 generator'],
    category: 'Network',
    publishedAt: '2025-09-03',
    content: `## What Is IPv6 ULA?

**Unique Local Addresses (ULA)** are IPv6 addresses for private networks, analogous to IPv4's 192.168.x.x / 10.x.x.x ranges. They start with \`fd\` (RFC 4193).

## ULA Format

\`\`\`
fd + 40-bit random Global ID + 16-bit Subnet ID + 64-bit Interface ID
\`\`\`

Example: \`fd12:3456:789a:1::/64\`

## Why Use ULA?

- Private network communications that don't need to reach the internet
- Stable addresses that don't change when ISP assignment changes
- Routable within your organization

## ULA vs Link-Local

| | ULA (fd::/8) | Link-Local (fe80::/10) |
|---|---|---|
| Routable | Within org | Same link only |
| Stable | ✅ | Changes per interface |

→ Try the [IPv6 ULA Generator](/ipv6-ula-generator)`,
  },
  {
    slug: 'mac-address-lookup-guide',
    toolPath: '/mac-address-lookup',
    title: 'MAC Address Lookup: Find the Manufacturer from Any MAC Address',
    description: 'Look up the vendor/manufacturer of any network device using its MAC address OUI prefix.',
    keywords: ['MAC address lookup', 'OUI lookup', 'MAC vendor lookup', 'network manufacturer', 'MAC address vendor'],
    category: 'Network',
    publishedAt: '2025-09-04',
    content: `## How MAC Lookup Works

The first 3 bytes (6 hex characters) of a MAC address are the **OUI (Organizationally Unique Identifier)**, assigned by IEEE to device manufacturers.

\`\`\`
AA:BB:CC:DD:EE:FF
└──┬──┘
   OUI = Manufacturer
\`\`\`

## Example OUIs

| OUI | Manufacturer |
|---|---|
| 00:1A:2B | Cisco |
| 3C:22:FB | Apple |
| 00:50:56 | VMware |
| 08:00:27 | VirtualBox |

## Use Cases

- **Network auditing** — Identify unknown devices on your network
- **Security** — Detect spoofed or unusual devices
- **Inventory** — Catalog all devices by manufacturer

→ Try the [MAC Address Lookup](/mac-address-lookup)`,
  },
  {
    slug: 'email-normalizer-guide',
    toolPath: '/email-normalizer',
    title: 'Email Normalizer: Clean and Standardize Email Addresses',
    description: 'Normalize email addresses to prevent duplicate accounts. Learn about Gmail dots, plus-addressing, and provider-specific rules.',
    keywords: ['email normalizer', 'email validation', 'email deduplication', 'Gmail aliases', 'email cleaning'],
    category: 'Development',
    publishedAt: '2025-09-05',
    content: `## Email Normalization Rules

Different email providers have quirks that allow multiple addresses to reach the same inbox:

### Gmail
- Dots are ignored: \`john.doe@gmail.com\` = \`johndoe@gmail.com\`
- Plus-addressing: \`john+anything@gmail.com\` → same inbox as \`john@gmail.com\`
- Case-insensitive: \`John@gmail.com\` = \`john@gmail.com\`

### Outlook/Hotmail
- Plus-addressing supported: \`user+tag@outlook.com\`

### General Rules
- Always lowercase the domain
- Most providers are case-insensitive in the local part

## Why Normalize?

- Prevent duplicate accounts (one user registers with different email variants)
- Consistent storage in databases
- Email deduplication in mailing lists

→ Try the [Email Normalizer](/email-normalizer)`,
  },
  {
    slug: 'html-wysiwyg-editor-guide',
    toolPath: '/html-wysiwyg-editor',
    title: 'WYSIWYG HTML Editor: Edit and Export Clean HTML Online',
    description: 'Use our browser-based WYSIWYG editor to create formatted HTML content without writing code.',
    keywords: ['HTML WYSIWYG editor', 'online HTML editor', 'rich text editor', 'HTML generator', 'visual HTML editor'],
    category: 'Web',
    publishedAt: '2025-09-06',
    content: `## What Is WYSIWYG?

**WYSIWYG** (What You See Is What You Get) editors let you format text visually — bold, italic, lists, headings — while the editor generates the underlying HTML.

## Use Cases

- Drafting email newsletter content
- Creating blog post HTML
- Prototyping rich text UI
- Non-technical content editing

## Generated HTML Example

Typing bold text and a list in the editor produces:
\`\`\`html
<p><strong>Important note:</strong></p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
\`\`\`

→ Try the [HTML WYSIWYG Editor](/html-wysiwyg-editor)`,
  },
  {
    slug: 'text-to-binary-guide',
    toolPath: '/text-to-binary',
    title: 'Text to Binary Converter: Encode Text as Binary (and Back)',
    description: 'Convert text to binary representation and back. Learn how computers represent characters as bits.',
    keywords: ['text to binary', 'binary converter', 'ASCII binary', 'text binary encoding', 'binary to text'],
    category: 'Converter',
    publishedAt: '2025-09-07',
    content: `## How Text Is Stored as Binary

Every character has a numeric code (ASCII or Unicode), stored as binary:

| Char | ASCII | Binary |
|---|---|---|
| A | 65 | 01000001 |
| B | 66 | 01000010 |
| a | 97 | 01100001 |
| space | 32 | 00100000 |

## Example

**Text:** \`Hi\`
**Binary:** \`01001000 01101001\`

## Encoding Standards

- **ASCII** — 7 bits, 128 characters (English only)
- **Latin-1** — 8 bits, 256 characters
- **UTF-8** — Variable width, covers all Unicode (most common for web)
- **UTF-16** — Fixed 2–4 bytes, used by Windows internally

→ Try the [Text to Binary Converter](/text-to-binary)`,
  },
  {
    slug: 'text-to-nato-guide',
    toolPath: '/text-to-nato-alphabet',
    title: 'NATO Phonetic Alphabet: Spell Words Clearly Over Radio and Phone',
    description: 'Convert any word to NATO phonetic alphabet (Alpha, Bravo, Charlie...). Learn why it\'s used and how it works.',
    keywords: ['NATO phonetic alphabet', 'phonetic spelling', 'Alpha Bravo Charlie', 'military alphabet', 'ICAO alphabet'],
    category: 'Converter',
    publishedAt: '2025-09-08',
    content: `## NATO Phonetic Alphabet

| Letter | NATO Word | Pronunciation |
|---|---|---|
| A | Alpha | AL-fah |
| B | Bravo | BRAH-voh |
| C | Charlie | CHAR-lee |
| D | Delta | DELL-tah |
| E | Echo | EK-oh |
| F | Foxtrot | FOKS-trot |
| G | Golf | GOLF |
| H | Hotel | HOH-tel |
| I | India | IN-dee-ah |
| J | Juliet | JEW-lee-ett |
| K | Kilo | KEY-loh |
| L | Lima | LEE-mah |
| M | Mike | MIKE |

## Why It Exists

Certain letters sound similar and are easily confused in noisy environments or over radio: B/P/D/T, M/N, F/S. NATO phonetics eliminate ambiguity.

## Common Use

Aviation, military, emergency services, customer support (spelling out order numbers, addresses).

→ Try the [Text to NATO Alphabet](/text-to-nato-alphabet)`,
  },
  {
    slug: 'text-to-unicode-guide',
    toolPath: '/text-to-unicode',
    title: 'Unicode Explained: Characters, Code Points, and Encoding',
    description: 'Convert text to Unicode code points. Learn about Unicode, UTF-8, and how modern software handles international text.',
    keywords: ['unicode converter', 'text to unicode', 'unicode code points', 'UTF-8 encoding', 'unicode characters'],
    category: 'Converter',
    publishedAt: '2025-09-09',
    content: `## What Is Unicode?

Unicode is a universal character encoding standard that assigns a unique code point (number) to every character in every language.

- Total code points: 1,114,112 (U+0000 to U+10FFFF)
- Currently assigned: ~150,000 characters

## Code Point Notation

\`U+0041\` = A (Latin letter A)
\`U+4E2D\` = 中 (Chinese character)
\`U+1F600\` = 😀 (Emoji)

## UTF-8 Encoding

UTF-8 is the most common encoding (97% of websites). It uses 1–4 bytes per character:

| Range | Bytes | Example |
|---|---|---|
| U+0000–U+007F | 1 byte | ASCII chars |
| U+0080–U+07FF | 2 bytes | Latin extended |
| U+0800–U+FFFF | 3 bytes | CJK characters |
| U+10000–U+10FFFF | 4 bytes | Emoji, rare scripts |

→ Try the [Text to Unicode Converter](/text-to-unicode)`,
  },
  {
    slug: 'yaml-to-json-guide',
    toolPath: '/yaml-to-json-converter',
    title: 'YAML to JSON Converter: When and How to Convert Configuration Files',
    description: 'Convert YAML to JSON with our free online tool. Learn when to use each format and common conversion pitfalls.',
    keywords: ['YAML to JSON', 'convert YAML JSON', 'YAML converter', 'JSON from YAML', 'configuration converter'],
    category: 'Converter',
    publishedAt: '2025-09-10',
    content: `## When to Convert YAML to JSON

- **API requests** — Most APIs expect JSON, not YAML
- **JavaScript parsing** — \`JSON.parse()\` built-in; no YAML parser needed
- **Debugging** — JSON tools are more widely available
- **Data exchange** — JSON is the lingua franca of web APIs

## Example

**YAML:**
\`\`\`yaml
server:
  port: 8080
  debug: true
  hosts:
    - api.example.com
    - web.example.com
\`\`\`

**JSON:**
\`\`\`json
{
  "server": {
    "port": 8080,
    "debug": true,
    "hosts": ["api.example.com", "web.example.com"]
  }
}
\`\`\`

→ Try the [YAML to JSON Converter](/yaml-to-json-converter)`,
  },
  {
    slug: 'toml-to-json-guide',
    toolPath: '/toml-to-json',
    title: 'TOML to JSON: What Is TOML and When Should You Use It?',
    description: 'Convert TOML to JSON. Learn about TOML configuration format, its advantages over YAML, and common use cases.',
    keywords: ['TOML to JSON', 'TOML format', 'TOML converter', 'TOML vs YAML', 'configuration format'],
    category: 'Converter',
    publishedAt: '2025-09-11',
    content: `## What Is TOML?

**TOML** (Tom's Obvious, Minimal Language) is a configuration file format designed to be easy to read with unambiguous semantics. Used by Rust (Cargo.toml), Python (pyproject.toml), and Hugo.

## TOML vs YAML vs JSON

| | TOML | YAML | JSON |
|---|---|---|---|
| Human readable | ✅ | ✅ | Medium |
| Comments | ✅ | ✅ | ❌ |
| Typed values | ✅ Explicit | ❌ Auto-typing | Partial |
| Ambiguity | Low | High | Low |

## TOML Example

\`\`\`toml
[server]
host = "localhost"
port = 8080
debug = true

[[users]]
name = "Alice"
role = "admin"
\`\`\`

→ Try the [TOML to JSON Converter](/toml-to-json)`,
  },
  {
    slug: 'json-minify-guide',
    toolPath: '/json-minify',
    title: 'JSON Minification: Reduce JSON File Size for Production',
    description: 'Minify JSON by removing whitespace. Learn when to minify and how much size reduction to expect.',
    keywords: ['JSON minify', 'minify JSON', 'compress JSON', 'JSON optimize', 'JSON size reduction'],
    category: 'Development',
    publishedAt: '2025-09-12',
    content: `## What Is JSON Minification?

Minification removes all unnecessary whitespace (spaces, tabs, newlines) from JSON, reducing file size without changing the data.

## Example

**Formatted (89 bytes):**
\`\`\`json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
\`\`\`

**Minified (37 bytes):**
\`\`\`json
{"name":"John","age":30,"city":"New York"}
\`\`\`

**Savings: 58%**

## When to Minify

- **API responses** — Reduce bandwidth
- **Static config files** — Smaller download size
- **Embedded in HTML/JS** — Reduce page weight

## When NOT to Minify

- **Config files humans edit** — Keep readable
- **Log files** — Readability matters for debugging

→ Try the [JSON Minify Tool](/json-minify)`,
  },
  {
    slug: 'base64-file-converter-guide',
    toolPath: '/base64-file-converter',
    title: 'Base64 File Converter: Encode Any File to Base64 String',
    description: 'Convert any file to Base64 string and back. Learn when to use Base64 for file embedding and data URIs.',
    keywords: ['base64 file converter', 'file to base64', 'base64 encode file', 'data URI', 'embed file base64'],
    category: 'Converter',
    publishedAt: '2025-09-13',
    content: `## File to Base64 Use Cases

- **Data URIs** — Embed small images directly in HTML/CSS (no separate HTTP request)
- **Email attachments** — MIME encoding for file attachments
- **API transmission** — Send binary files in JSON payloads
- **CSS backgrounds** — Inline small images

## Data URI Format

\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgo..."/>
\`\`\`

## Size Impact

Base64 encoding increases file size by ~33% (3 bytes → 4 characters). Only use for small files (<50KB) where HTTP request overhead outweighs the size increase.

## Supported in All Browsers

Data URIs are universally supported. Just be aware they increase HTML/CSS file size.

→ Try the [Base64 File Converter](/base64-file-converter)`,
  },
  {
    slug: 'pdf-signature-checker-guide',
    toolPath: '/pdf-signature-checker',
    title: 'PDF Digital Signatures: How to Verify Document Authenticity',
    description: 'Check digital signatures in PDF files. Learn how PDF signatures work and how to verify document authenticity.',
    keywords: ['PDF signature checker', 'digital signature', 'PDF verify', 'document authenticity', 'PDF certificate'],
    category: 'Crypto',
    publishedAt: '2025-09-14',
    content: `## What Is a PDF Digital Signature?

A digital signature in a PDF proves that:
1. The document was signed by the claimed signer (authenticity)
2. The document hasn't been modified since signing (integrity)

## How It Works

1. The signer's software computes a hash of the PDF content.
2. The hash is encrypted with the signer's **private key**.
3. The encrypted hash + certificate are embedded in the PDF.
4. Verification decrypts the hash with the **public key** and compares.

## Certificate Chains

Valid PDF signatures are backed by a certificate from a trusted Certificate Authority (CA). The trust chain:
\`\`\`
Root CA → Intermediate CA → Signer's Certificate
\`\`\`

## What "Valid Signature" Means

- ✅ Signature mathematically valid
- ✅ Certificate not expired
- ✅ Certificate not revoked (OCSP check)
- ✅ Document not modified after signing

→ Try the [PDF Signature Checker](/pdf-signature-checker)`,
  },
  {
    slug: 'income-tax-calculator-guide',
    toolPath: '/income-tax-calculator',
    title: 'China Income Tax Calculator: How to Calculate Your Take-Home Pay',
    description: 'Calculate your after-tax income in China. Understand the progressive tax brackets, social insurance, and special deductions.',
    keywords: ['China income tax', 'personal income tax calculator', '个人所得税', 'tax bracket China', 'social insurance'],
    category: 'Math',
    publishedAt: '2025-09-15',
    content: `## China Personal Income Tax (2024)

China uses a **7-bracket progressive tax system** for employment income:

| Monthly Taxable Income | Tax Rate | Quick Deduction |
|---|---|---|
| 0 – 3,000 | 3% | 0 |
| 3,001 – 12,000 | 10% | 210 |
| 12,001 – 25,000 | 20% | 1,410 |
| 25,001 – 35,000 | 25% | 2,660 |
| 35,001 – 55,000 | 30% | 4,410 |
| 55,001 – 80,000 | 35% | 7,160 |
| Over 80,000 | 45% | 15,160 |

## Tax Calculation Formula

\`\`\`
Taxable = Gross - Social Insurance - 5,000 (basic deduction) - Special deductions
Tax = Taxable × Rate - Quick Deduction
\`\`\`

## Special Additional Deductions

- Children's education: ¥2,000/month per child
- Continuing education: ¥400–800/month
- Housing loan interest: ¥1,000/month
- Housing rent: ¥800–1,500/month (by city)
- Elderly care: up to ¥3,000/month

→ Try the [Income Tax Calculator](/income-tax-calculator)`,
  },
  {
    slug: 'random-port-generator-guide',
    toolPath: '/random-port-generator',
    title: 'Network Ports Explained: Reserved, Registered, and Dynamic Ranges',
    description: 'Generate random available network ports. Learn about port ranges, well-known ports, and how to avoid conflicts.',
    keywords: ['random port generator', 'port number', 'network port', 'available port', 'port ranges'],
    category: 'Development',
    publishedAt: '2025-09-16',
    content: `## Port Number Ranges

| Range | Type | Examples |
|---|---|---|
| 0 – 1023 | Well-known (system) | 80 HTTP, 443 HTTPS, 22 SSH, 3306 MySQL |
| 1024 – 49151 | Registered | 3000 Node.js dev, 5432 PostgreSQL |
| 49152 – 65535 | Dynamic / ephemeral | OS-assigned temporary ports |

## Common Port Numbers

| Port | Service |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 27017 | MongoDB |
| 8080 | HTTP alt / dev servers |

## When You Need a Random Port

Starting a development server, proxy, or service and want to avoid conflicts with existing services.

→ Try the [Random Port Generator](/random-port-generator)`,
  },
  {
    slug: 'json-viewer-guide',
    toolPath: '/json-viewer',
    title: 'JSON Viewer: Navigate and Explore Complex JSON Structures',
    description: 'Explore large JSON files with a collapsible tree viewer. Navigate nested objects and arrays with ease.',
    keywords: ['JSON viewer', 'JSON tree view', 'explore JSON', 'JSON explorer', 'JSON browser'],
    category: 'Development',
    publishedAt: '2025-09-17',
    content: `## Why Use a JSON Tree Viewer?

Large JSON responses from APIs can be thousands of lines deep. A tree viewer lets you:

- Expand/collapse nodes to focus on relevant data
- See the data hierarchy visually
- Click to copy specific values
- Navigate complex nested structures

## Example: API Response Structure

\`\`\`json
{
  "user": {
    "id": 1234,
    "profile": {
      "name": "Alice",
      "settings": { "theme": "dark" }
    },
    "orders": [ ... 50 items ... ]
  }
}
\`\`\`

With a tree viewer, you can collapse \`orders\` and focus on \`profile\` instantly.

→ Try the [JSON Viewer](/json-viewer)`,
  },
  {
    slug: 'xml-to-json-guide',
    toolPath: '/xml-to-json',
    title: 'XML to JSON Converter: Migrate from Legacy XML APIs',
    description: 'Convert XML to JSON for modern applications. Learn about the structural differences and common conversion patterns.',
    keywords: ['XML to JSON', 'convert XML JSON', 'XML converter', 'XML API to JSON', 'XML parser'],
    category: 'Converter',
    publishedAt: '2025-09-18',
    content: `## XML vs JSON for APIs

Most modern APIs use JSON, but many legacy systems (SOAP, RSS, ATOM, government APIs) still use XML. Converting to JSON makes them easier to work with in JavaScript.

## Example Conversion

**XML:**
\`\`\`xml
<person>
  <name>Alice</name>
  <age>30</age>
  <hobbies>
    <hobby>reading</hobby>
    <hobby>coding</hobby>
  </hobbies>
</person>
\`\`\`

**JSON:**
\`\`\`json
{
  "person": {
    "name": "Alice",
    "age": "30",
    "hobbies": {
      "hobby": ["reading", "coding"]
    }
  }
}
\`\`\`

→ Try the [XML to JSON Converter](/xml-to-json)`,
  },
];
