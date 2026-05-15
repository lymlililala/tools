#!/usr/bin/env node
/**
 * patch-articles.mjs
 * Surgically replaces short article content in articles.data.ts with expanded versions.
 * 
 * Strategy: 
 * - New content is stored as regular JS strings (no TS template string conflicts)
 * - When writing back to TS file, backticks are auto-escaped to \`
 * - Dollar signs followed by { are escaped to \${
 * 
 * Run: node scripts/patch-articles.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'src/pages/articles/articles.data.ts');

// Escape content for TypeScript template literals
function escapeForTS(content) {
  return content
    .replace(/\\/g, '\\\\')   // escape backslashes first
    .replace(/`/g, '\\`')     // escape backticks
    .replace(/\$\{/g, '\\${'); // escape template expressions
}

// Replace an article's content in the file
function replaceContent(fileContent, slug, newContent) {
  const escaped = escapeForTS(newContent);
  
  // Find the article block by slug
  // Pattern: slug: 'SLUG',\n...content: `...`
  const slugPattern = new RegExp(
    `(\\{[^\\{]*?slug: '${slug}'[^\\}]*?content: \`)([\\s\\S]*?)(\`[^\\}]*?\\},)`,
    'g'
  );
  
  let replaced = false;
  const result = fileContent.replace(slugPattern, (match, before, oldContent, after) => {
    replaced = true;
    return before + escaped + after;
  });
  
  if (!replaced) {
    console.warn(`⚠️  Could not find article: ${slug}`);
    return fileContent;
  }
  
  return result;
}

// ─── Article Contents ─────────────────────────────────────────────────────────
// Using regular template strings here (for JS, not TS).
// The escapeForTS() function handles the TS-specific escaping.

const ARTICLES = new Map();

// ══════════════════════════════════════════════════════
// CRYPTO CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('what-is-token-generator', `## What Is a Random Token Generator?

A **random token generator** creates unpredictable strings used to authenticate users, secure APIs, and prevent attacks. Every time you log into a website, reset a password, or call an API, tokens are silently working behind the scenes.

Unlike human-chosen passwords, tokens are machine-generated with high **entropy** — they are statistically impossible to guess even with powerful computers.

## Why You Need Cryptographically Secure Randomness

Standard \`random()\` functions use a **Pseudo-Random Number Generator (PRNG)** — deterministic algorithms that can be predicted if an attacker knows the seed. For security tokens, you need a **CSPRNG** that draws entropy from hardware events like mouse movements, thermal noise, and disk I/O.

| Source | Predictable? | Best For |
|---|---|---|
| Math.random() | ⚠️ Potentially | Games, UI, simulations |
| crypto.getRandomValues() | ❌ No | Security tokens |
| OS /dev/urandom | ❌ No | Server-side secrets |

## 5 Essential Use Cases

### 1. API Keys
Every developer key for Stripe, GitHub, or Twilio is a random token. It authenticates your application without exposing a password.

\`\`\`http
Authorization: Bearer your_api_key_here
\`\`\`

Best practice: use 32–64 URL-safe characters. Store only a hashed version server-side.

### 2. Session Tokens
After login, the server issues a session token stored in an HttpOnly cookie.

\`\`\`http
Set-Cookie: session=f3a9c2e1b4d7f9a2; HttpOnly; Secure; SameSite=Strict
\`\`\`

### 3. CSRF Tokens
CSRF attacks trick authenticated users into submitting malicious requests. Embedding a per-session secret in forms prevents this:

\`\`\`html
<form method="POST" action="/transfer">
  <input type="hidden" name="_csrf" value="8f3c2e1b4d7fa2c5e8b1d4">
</form>
\`\`\`

### 4. Password Reset Links
A single-use token is generated, hashed server-side, and sent in the reset email link. Expires in 15–60 minutes.

### 5. Webhook Secrets
Services like GitHub and Stripe compute HMAC-SHA256 signatures using a shared secret token to verify payload authenticity.

## Token Length and Entropy

| Character Set | Size | 32-char entropy | 64-char entropy |
|---|---|---|---|
| Hex (0-9, a-f) | 16 | 128 bits | 256 bits |
| Alphanumeric | 62 | ~190 bits | ~380 bits |
| Base64URL | 64 | 192 bits | 384 bits |

With 128 bits of entropy, brute-forcing at 1 billion guesses/second would take longer than the age of the universe.

**Practical minimums:**

| Use Case | Minimum | Recommended |
|---|---|---|
| CSRF token | 16 chars | 32 chars |
| API key | 24 chars | 48 chars |
| Session ID | 32 chars | 64 chars |

## Code Examples

### JavaScript
\`\`\`javascript
// Browser — Web Crypto API
const array = new Uint8Array(32);
crypto.getRandomValues(array);
const token = Array.from(array, b => b.toString(16).padStart(2,'0')).join('');

// Node.js
const { randomBytes } = require('crypto');
const token = randomBytes(32).toString('hex');        // 64-char hex
const urlSafe = randomBytes(32).toString('base64url'); // 43-char
\`\`\`

### Python
\`\`\`python
import secrets
token = secrets.token_hex(32)          # 64-char hex
url_token = secrets.token_urlsafe(32)  # 43-char url-safe
\`\`\`

## Security Best Practices

1. **Hash tokens before storing** — Store SHA-256(token), compare hashes. A DB breach won't expose active tokens.
2. **Always set expiry** — Password resets: 15 min; Sessions: hours; API keys: 90-day rotation
3. **HTTPS only** — Tokens in plaintext HTTP can be intercepted
4. **Constant-time comparison** — Use \`crypto.timingSafeEqual()\` to prevent timing attacks
5. **One token, one purpose** — Never reuse a token across different use cases

## Common Mistakes

- ❌ Using Math.random() for security tokens — easily predicted by attackers
- ❌ Storing tokens in plaintext — one breach exposes all active tokens
- ❌ No expiry — stolen tokens remain valid forever
- ❌ Logging tokens — log files are often less protected than databases
- ❌ Sending tokens over HTTP — interceptable by network attackers

→ Try the [Token Generator](/token-generator)`);

ARTICLES.set('how-to-hash-text-online', `## What Is Hashing?

A **hash function** takes any input and produces a fixed-length output called a **digest** or **hash**. Unlike encryption, hashing is a **one-way function** — you cannot reverse it to recover the original input.

Core properties of a cryptographic hash function:
- **Deterministic** — Same input always produces the same output
- **Fixed-length output** — SHA-256 always outputs 256 bits regardless of input size
- **Avalanche effect** — Changing one bit in input completely changes the output
- **Pre-image resistance** — Cannot compute input from output
- **Collision resistance** — Practically impossible to find two inputs with the same hash

## Algorithm Comparison

| Algorithm | Output | Speed | Security Status |
|---|---|---|---|
| MD5 | 128 bits | Very fast | ❌ Broken (collisions found 2004) |
| SHA-1 | 160 bits | Fast | ❌ Broken (SHAttered attack 2017) |
| SHA-256 | 256 bits | Fast | ✅ Recommended for most uses |
| SHA-512 | 512 bits | Moderate | ✅ Strong security margin |
| SHA-3 (Keccak) | Configurable | Moderate | ✅ Modern standard |
| BLAKE3 | 256 bits | Very fast | ✅ Best modern performance |

In 2017, Google demonstrated the **SHAttered attack** — two different PDF files with the same SHA-1 hash. Never use MD5 or SHA-1 for security-sensitive purposes.

## Common Use Cases

### File Integrity Verification
\`\`\`bash
# Download a file, then verify its hash
sha256sum filename.tar.gz
# Compare output with the checksum published on the project's website
\`\`\`

### Password Storage — Use bcrypt Instead
Plain SHA-256 is dangerously fast for passwords:

\`\`\`javascript
// ❌ Wrong — GPU can compute 10 billion SHA-256/sec
const hash = crypto.createHash('sha256').update(password).digest('hex');

// ✅ Correct — bcrypt is intentionally slow
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
\`\`\`

### Digital Signatures
Sign the hash (not the full document) for efficiency:

\`\`\`javascript
const { createSign } = require('crypto');
const sign = createSign('SHA256');
sign.update(documentBuffer);
const signature = sign.sign(privateKey, 'hex');
\`\`\`

### Cache Keys
\`\`\`javascript
function getCacheKey(params) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .slice(0, 16);
}
\`\`\`

## Rainbow Tables and Salting

A **rainbow table** precomputes hash→input mappings for common passwords:
\`\`\`
5f4dcc3b5aa765d61d8327deb882cf99 → "password"
e10adc3949ba59abbe56e057f20f883e → "123456"
\`\`\`

**Salting** defeats rainbow tables by adding a unique random value per input:
\`\`\`javascript
const salt = crypto.randomBytes(16).toString('hex');
const saltedHash = crypto.createHash('sha256')
  .update(salt + userInput)
  .digest('hex');
// Store: salt + ':' + saltedHash
\`\`\`

## Hashing vs Encryption

| | Hashing | Encryption |
|---|---|---|
| Reversible? | ❌ No | ✅ Yes (with key) |
| Key required? | ❌ No | ✅ Yes |
| Use for passwords? | Only with bcrypt | ❌ No |
| Use for file integrity? | ✅ Yes | Not typical |

## Choosing the Right Algorithm

| Scenario | Recommended |
|---|---|
| Password storage | bcrypt / Argon2id / scrypt |
| File integrity check | SHA-256 or SHA-3 |
| Digital signatures (RSA/ECDSA) | SHA-256 |
| HMAC / API authentication | HMAC-SHA256 |
| Non-adversarial checksum | MD5 or CRC32 (fast) |
| New high-performance systems | BLAKE3 |

→ Try the [Hash Text Tool](/hash-text)`);

ARTICLES.set('bcrypt-password-hashing-guide', `## Why Password Hashing Matters

Storing plaintext passwords is a catastrophic mistake. One database breach exposes every user's credentials across every service where they reuse that password.

Even "encrypting" passwords is wrong — if the encryption key leaks, all passwords are instantly recoverable.

**Correct approach: one-way hashing with a slow, salted algorithm.** Bcrypt was designed specifically for this in 1999 and remains the industry standard.

## What Makes Bcrypt Special?

Plain SHA-256 hashes a password in microseconds. A GPU cluster can compute **10 billion hashes per second** — cracking a 10-character password in hours.

Bcrypt is deliberately **slow**. Each hash takes 100ms–1s depending on the cost factor. An attacker attempting a billion guesses needs thousands of years.

| Algorithm | Speed (GPU) | Time to crack "P@ssw0rd" |
|---|---|---|
| MD5 | ~100 billion/sec | < 1 second |
| SHA-256 | ~10 billion/sec | ~2 seconds |
| bcrypt (cost=10) | ~100,000/sec | ~3 hours |
| bcrypt (cost=12) | ~25,000/sec | ~50 hours |

## The Cost Factor

The cost factor is an exponent: bcrypt runs 2^cost internal iterations. Each +1 doubles computation time.

| Cost | Approx. Time | Use When |
|---|---|---|
| 10 | ~100ms | Minimum (2025) |
| 12 | ~400ms | General applications |
| 13 | ~800ms | Sensitive applications |
| 14 | ~1.5s | Banking, healthcare |

Aim for 100–300ms on your production server.

## Anatomy of a Bcrypt Hash

\`\`\`
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
│  │  └── 22-char base64 salt (randomly generated)
│  └───── cost factor (12)
└──────── version ($2b)
\`\`\`

The hash embeds its own salt — you don't need to store the salt separately!

## Implementation

### Node.js
\`\`\`javascript
const bcrypt = require('bcrypt');

// Hash during registration
const hash = await bcrypt.hash(plaintext, 12);
// Store 'hash' in database

// Verify during login
const match = await bcrypt.compare(plaintext, storedHash);
// true = correct password
\`\`\`

### Python
\`\`\`python
import bcrypt

# Hash
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# Verify
is_valid = bcrypt.checkpw(password.encode(), hashed)
\`\`\`

### PHP
\`\`\`php
// Hash
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Verify
$valid = password_verify($password, $hash);

// Check if rehash needed (after increasing cost)
if (password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => 12])) {
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}
\`\`\`

## Bcrypt vs Modern Alternatives

| Algorithm | Memory-Hard? | PHC Winner | Recommendation |
|---|---|---|---|
| bcrypt | ❌ No | N/A | ✅ Safe, battle-tested |
| scrypt | ✅ Yes | N/A | ✅ Good alternative |
| Argon2id | ✅ Yes | ✅ 2015 | ✅ Best for new projects |

For new systems, prefer Argon2id. For existing bcrypt systems, stay with bcrypt — it's still secure.

## Common Mistakes

### Cost Factor Too Low
\`\`\`javascript
// ❌ Cost 8 is too fast in 2025
const hash = await bcrypt.hash(password, 8);

// ✅ Cost 12 or higher
const hash = await bcrypt.hash(password, 12);
\`\`\`

### The 72-Character Limit
Bcrypt silently truncates passwords to 72 bytes. Workaround:
\`\`\`javascript
// Pre-hash long passwords
const preHash = crypto.createHash('sha256').update(password).digest('base64');
const bcryptHash = await bcrypt.hash(preHash, 12);
\`\`\`

### Using === for Comparison
\`\`\`javascript
// ❌ Vulnerable to timing attacks
if (storedHash === computedHash) { ... }

// ✅ Always use bcrypt.compare()
const match = await bcrypt.compare(plaintext, storedHash);
\`\`\`

## Lazy Migration from Legacy Hashes

Migrate from MD5/SHA-1 to bcrypt without forcing a password reset:
\`\`\`javascript
async function loginAndUpgrade(username, plaintext) {
  const user = await db.getUser(username);
  
  if (isLegacyHash(user.passwordHash)) {
    if (md5(plaintext) !== user.passwordHash) return null;
    user.passwordHash = await bcrypt.hash(plaintext, 12);
    await db.updateUser(username, { passwordHash: user.passwordHash });
    return user;
  }
  
  return await bcrypt.compare(plaintext, user.passwordHash) ? user : null;
}
\`\`\`

→ Try the [Bcrypt Tool](/bcrypt)`);

ARTICLES.set('uuid-vs-ulid-which-to-use', `## What Is a UUID?

A **UUID (Universally Unique Identifier)** is a 128-bit identifier standardized in RFC 4122. The text format is 32 hexadecimal characters in 5 groups:

\`\`\`
550e8400-e29b-41d4-a716-446655440000
\`\`\`

Any computer can generate a UUID without coordination — the collision probability is astronomically low (1 in 2^122 for UUID v4).

## UUID Versions

| Version | Method | Use Case |
|---|---|---|
| v1 | Time + MAC address | Time-ordered but exposes hardware address |
| v3 | MD5(name + namespace) | Deterministic from name |
| v4 | Random | General purpose, most widely used |
| v5 | SHA-1(name + namespace) | Deterministic from name |
| v7 | Timestamp + random | Time-ordered, modern (RFC 9562, 2024) |

## What Is ULID?

**ULID (Universally Unique Lexicographically Sortable Identifier)** combines a 48-bit millisecond timestamp with 80 bits of randomness in a 26-character Crockford Base32 string:

\`\`\`
01ARZ3NDEKTSV4RRFFQ69G5FAV
└──────────┘└─────────────┘
  timestamp    randomness
\`\`\`

## Comparison

| Feature | UUID v4 | ULID | UUID v7 |
|---|---|---|---|
| Length | 36 chars | 26 chars | 36 chars |
| Sortable by time | ❌ | ✅ ms precision | ✅ ms precision |
| RFC Standard | ✅ RFC 4122 | Community spec | ✅ RFC 9562 |
| DB index efficiency | ⚠️ Fragmented | ✅ Sequential | ✅ Sequential |

## The B-Tree Index Problem

UUID v4's random order fragments database B-tree indexes:
1. New rows insert at random positions — not at the end
2. Database splits and rebalances index pages constantly
3. Write performance degrades, index bloat grows
4. Cache hit rate drops (random pages loaded constantly)

ULID and UUID v7 generate time-ordered IDs that insert at the end of the B-tree — exactly like an auto-increment integer.

## Code Examples

### JavaScript
\`\`\`javascript
// UUID v4 (built-in, Node 15+)
const uuid = crypto.randomUUID();

// ULID
import { ulid } from 'ulid';
const id = ulid();

// UUID v7
import { v7 as uuidv7 } from 'uuid';
const id7 = uuidv7();
\`\`\`

### Python
\`\`\`python
import uuid
uid4 = str(uuid.uuid4())  # UUID v4

from ulid import ULID
uid = str(ULID())          # ULID
\`\`\`

### PostgreSQL
\`\`\`sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

## When to Use Each

**UUID v4:** Maximum RFC 4122 compatibility, small datasets where index performance doesn't matter.

**ULID:** Time-ordered IDs with efficient DB inserts, event streams, logs, time-series data.

**UUID v7:** Like ULID benefits but in strict UUID format for systems requiring UUID.

**Snowflake IDs:** Distributed generation at massive scale (Twitter, Discord scale).

## FAQ

**Are ULIDs truly globally unique?**
Within a single millisecond, 80 bits of randomness = ~1.2 × 10^24 possibilities. Practically impossible to collide.

**Should I migrate existing UUID v4 PKs?**
Not worth the disruption. Use ULID/UUIDv7 for new tables going forward.

→ Try the [UUID Generator](/uuid-generator) or [ULID Generator](/ulid-generator)`);

ARTICLES.set('jwt-parser-explained', `## What Is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe format for securely transmitting claims as a JSON object. Most commonly used for authentication — the server issues a JWT after login, and the client includes it in subsequent requests.

Key advantage: JWTs are **stateless**. No server-side session storage needed — all information is encoded inside the token.

## Three-Part Structure

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.SflKxwRJSMeKKF2QT4fw
└──────────────── Header ──────────────┘└── Payload ───────┘└─── Signature ────────┘
\`\`\`

### Header
\`\`\`json
{ "alg": "HS256", "typ": "JWT" }
\`\`\`

### Payload (Claims)
\`\`\`json
{
  "sub": "user-1234",
  "name": "Alice",
  "role": "admin",
  "iat": 1716000000,
  "exp": 1716086400
}
\`\`\`

### Signature
\`\`\`
HMACSHA256(base64url(header) + "." + base64url(payload), secret)
\`\`\`

## Standard Claims

| Claim | Name | Description |
|---|---|---|
| sub | Subject | User/entity identifier |
| iss | Issuer | Who created the token |
| aud | Audience | Intended recipients |
| exp | Expiration | Unix timestamp for expiry |
| iat | Issued At | When token was created |
| nbf | Not Before | Valid only after this time |
| jti | JWT ID | Unique ID to prevent replay |

## Signing: HS256 vs RS256

### HS256 (Shared Secret)
\`\`\`javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: '1234', role: 'admin' }, 'secret', {
  algorithm: 'HS256', expiresIn: '1h'
});
const payload = jwt.verify(token, 'secret', { algorithms: ['HS256'] });
\`\`\`

### RS256 (Public/Private Key)
\`\`\`javascript
// Auth server signs with private key
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

// Any service verifies with public key
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
\`\`\`

## Refresh Token Pattern

Access tokens should be short-lived (15 min–1 hour). Use refresh tokens for long sessions:
\`\`\`json
{
  "access_token": "eyJ...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expires_in": 3600
}
\`\`\`

Store refresh tokens server-side so they can be revoked.

## Critical Security Issues

### The alg:none Attack
\`\`\`javascript
// ❌ Vulnerable
jwt.verify(token, secret);

// ✅ Always specify algorithms
jwt.verify(token, secret, { algorithms: ['HS256'] });
\`\`\`

### Sensitive Data in Payload
The payload is only Base64URL-encoded — **anyone can decode it**:
\`\`\`javascript
atob('eyJzdWIiOiIxMjM0IiwicGFzc3dvcmQiOiJzZWNyZXQifQ==')
// {"sub":"1234","password":"secret"}  ← EXPOSED!
\`\`\`

Never put passwords, payment info, or sensitive PII in JWT payloads.

### Not Checking Expiry
\`\`\`javascript
try {
  const decoded = jwt.verify(token, secret); // throws TokenExpiredError
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
}
\`\`\`

## JWT vs Sessions

| | JWT (Stateless) | Server Sessions |
|---|---|---|
| Storage | Client-side | Server-side |
| Horizontal scaling | ✅ Easy | ⚠️ Needs shared store |
| Revocation | ❌ Hard | ✅ Instant |
| Best for | APIs, microservices | Traditional web apps |

→ Try the [JWT Parser](/jwt-parser)`);

ARTICLES.set('password-strength-guide', `## What Makes a Password Strong?

Password strength = **entropy** — the amount of unpredictability. High entropy makes brute-force attacks computationally infeasible.

Formula: E = L × log₂(N), where L = length, N = alphabet size.

| Password | Entropy | Crack Time (10B/sec) |
|---|---|---|
| password | 37.6 bits | < 1 second |
| P@ssw0rd | 48.9 bits | ~3 minutes |
| Qx7#mK2$ | 52.6 bits | ~17 minutes |
| correct horse battery staple | 44+ bits | hours-days |
| Xq9#mP2@vN5! | 79+ bits | ~8,000 years |

## How Attackers Crack Passwords

### Dictionary Attacks
The \`rockyou.txt\` wordlist has 14 million real passwords from breaches. Any dictionary password — no matter how "complex" — falls instantly.

### Rule-Based Mangling
Hashcat applies transformation rules:
- \`password\` → \`Password\`, \`password1\`, \`p@ssw0rd\`

These patterns are well-known and crack in seconds.

### Credential Stuffing
Passwords leaked from one breach are tried on hundreds of other services. Unique passwords for every account are essential.

### Brute Force Speed

| Algorithm | Speed (GPU) | Status |
|---|---|---|
| MD5 | 100 billion/sec | Never store passwords with MD5 |
| SHA-256 | 10 billion/sec | Too fast for passwords |
| bcrypt (cost=12) | 25,000/sec | Designed to be slow |

## The Passphrase Advantage

Four random common words beat a complex-looking predictable password:
\`\`\`
"correct horse battery staple"  → 44+ bits
"Tr0ub4dor&3"                   → 28 bits (predictable pattern)
\`\`\`

The Diceware method uses physical dice to generate truly random word selections.

## NIST 2024 Guidelines

**✅ Now recommended:**
- Minimum 8 characters; encourage 15+
- Check against breached password databases
- Support up to 64+ characters
- No mandatory periodic rotation

**❌ No longer recommended:**
- Mandatory complexity rules (uppercase + symbols + numbers)
- Forced regular password changes
- Password hints or security questions

## Checking for Leaked Passwords

HaveIBeenPwned's k-anonymity API (your password never leaves your device):

\`\`\`javascript
async function isPasswordLeaked(password) {
  const hash = await crypto.subtle.digest('SHA-1',
    new TextEncoder().encode(password));
  const hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();

  const prefix = hex.slice(0, 5);
  const suffix = hex.slice(5);

  const res = await fetch(\`https://api.pwnedpasswords.com/range/\${prefix}\`);
  const text = await res.text();
  return text.split('\\r\\n').some(line => line.startsWith(suffix));
}
\`\`\`

Only the first 5 hash characters are sent. Your actual password never leaves your browser.

## Password Managers

The only practical solution for strong, unique passwords everywhere:

| Manager | Open Source | Price |
|---|---|---|
| Bitwarden | ✅ | Free / $10/yr |
| 1Password | ❌ | $36/yr |
| KeePassXC | ✅ | Free (local) |
| Proton Pass | ✅ | Free |

## Two-Factor Authentication

Even perfect passwords can be phished. 2FA adds a second layer:

| Type | Security | Phishing-Resistant |
|---|---|---|
| SMS OTP | ⚠️ Low | ❌ |
| TOTP App | ✅ Good | ❌ |
| YubiKey | ✅ Excellent | ✅ |
| Passkeys | ✅ Excellent | ✅ |

Passkeys (WebAuthn/FIDO2) are replacing passwords entirely — biometric auth with device-stored private keys.

→ Try the [Password Strength Analyser](/password-strength-analyser)`);

ARTICLES.set('rsa-key-pair-explained', `## What Is RSA?

**RSA (Rivest–Shamir–Adleman)** is the world's most widely deployed asymmetric cryptography algorithm, published in 1977. It remains the foundation of HTTPS, SSH, code signing, and email encryption.

The mathematical basis: multiplying two large primes p and q to get n = p×q is trivial. Factoring n back into p and q is computationally infeasible for large keys.

## Public Key vs Private Key

| Key | Distribution | Used For |
|---|---|---|
| Public key | Share freely | Encrypt data, verify signatures |
| Private key | Keep secret | Decrypt data, create signatures |

### Encryption Flow
\`\`\`
Alice encrypts with BOB'S PUBLIC KEY → Only Bob can decrypt with his PRIVATE KEY
\`\`\`

### Digital Signature Flow
\`\`\`
Bob signs hash with PRIVATE KEY → Anyone verifies with Bob's PUBLIC KEY
\`\`\`

## Key Sizes

| Key Size | Security Level | Status |
|---|---|---|
| 512 bit | Broken | ❌ Never use |
| 1024 bit | Broken | ❌ Deprecated |
| 2048 bit | ~112-bit | ✅ Current minimum |
| 3072 bit | ~128-bit | ✅ Recommended |
| 4096 bit | ~140-bit | ✅ Long-lived keys |

## Generating RSA Keys

### OpenSSL
\`\`\`bash
# Generate 4096-bit private key
openssl genrsa -out private.pem 4096

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem

# View key info
openssl rsa -in private.pem -text -noout
\`\`\`

### Node.js
\`\`\`javascript
const { generateKeyPairSync } = require('crypto');
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
\`\`\`

### Python
\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

private_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)
\`\`\`

## SSH Authentication

\`\`\`bash
# Generate key pair (modern: use Ed25519)
ssh-keygen -t ed25519 -C "your@email.com"

# Or RSA for legacy compatibility
ssh-keygen -t rsa -b 4096 -C "your@email.com"

# Copy public key to server
ssh-copy-id user@server.example.com
\`\`\`

Ed25519 is preferred over RSA for SSH: same security with much smaller keys.

## RSA vs Modern Alternatives

| Algorithm | Key Size | Speed | Best For |
|---|---|---|---|
| RSA-2048 | 2048 bit | ⚠️ Slow | Legacy compatibility |
| RSA-4096 | 4096 bit | ❌ Slow | Long-lived certificates |
| ECDSA P-256 | 256 bit | ✅ Fast | TLS certificates |
| Ed25519 | 255 bit | ✅ Fastest | SSH keys, signing |

## Common Use Cases

1. **HTTPS/TLS** — Server certificates use RSA or ECDSA key pairs
2. **SSH authentication** — Public key on server, private key on your machine
3. **Code signing** — Developers sign releases with their private key
4. **JWT RS256** — Sign tokens with private key, verify with public key
5. **PGP/GPG email** — Encrypt emails or prove authorship

→ Try the [RSA Key Pair Generator](/rsa-key-pair-generator)`);

ARTICLES.set('hmac-generator-guide', `## What Is HMAC?

**HMAC (Hash-based Message Authentication Code)** combines a hash function with a secret key to verify both **integrity** (data wasn't modified) and **authenticity** (data came from someone with the key).

\`\`\`
HMAC(K, M) = H((K ⊕ opad) || H((K ⊕ ipad) || M))
\`\`\`

The double-hashing defeats **length extension attacks** that affect plain hash functions.

## Why Not Just Hash?

| | Plain Hash | HMAC |
|---|---|---|
| Verifies integrity | ✅ | ✅ |
| Verifies authenticity | ❌ | ✅ |
| Requires secret key | ❌ | ✅ |
| Length extension attack | ⚠️ Vulnerable | ✅ Safe |

Anyone can compute SHA256("my message") — no secret needed. HMAC requires knowing the key.

## Real-World Use Cases

### GitHub Webhooks
\`\`\`javascript
const crypto = require('crypto');

function verifyGitHubWebhook(req, secret) {
  const sig = req.headers['x-hub-signature-256'];
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(req.body)  // raw body Buffer
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(sig), Buffer.from(expected)
  );
}
\`\`\`

### JWT HS256 Signing
JWT HS256 = HMAC-SHA256 of base64url(header) + "." + base64url(payload).

### AWS Signature v4
AWS uses chained HMAC-SHA256 to derive region/service-specific signing keys.

## Computing HMAC

### Node.js
\`\`\`javascript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', 'secret-key')
  .update('Message to authenticate')
  .digest('hex');
\`\`\`

### Python
\`\`\`python
import hmac, hashlib
mac = hmac.new(b'secret-key', b'Message to authenticate', hashlib.sha256).hexdigest()
\`\`\`

### Bash
\`\`\`bash
echo -n "Message" | openssl dgst -sha256 -hmac "secret-key"
\`\`\`

## Choosing Hash Function

| Algorithm | Output | Recommendation |
|---|---|---|
| HMAC-MD5 | 128 bits | ❌ Avoid |
| HMAC-SHA1 | 160 bits | ⚠️ Legacy only |
| HMAC-SHA256 | 256 bits | ✅ Standard choice |
| HMAC-SHA512 | 512 bits | ✅ Extra margin |

## Critical: Timing-Safe Comparison

\`\`\`javascript
// ❌ Vulnerable to timing attacks
if (computedHmac === receivedHmac) { ... }

// ✅ Timing-safe (prevents byte-by-byte leakage)
const a = Buffer.from(computedHmac, 'hex');
const b = Buffer.from(receivedHmac, 'hex');
if (a.length === b.length && crypto.timingSafeEqual(a, b)) { ... }
\`\`\`

## Key Management

- Minimum 32 bytes (256 bits) for HMAC-SHA256
- Store in environment variables or secrets managers
- Use separate keys for each use case
- Rotate periodically and after any suspected compromise
- Never hardcode in source code

→ Try the [HMAC Generator](/hmac-generator)`);

ARTICLES.set('encryption-tool-guide', `## Symmetric vs Asymmetric Encryption

**Symmetric encryption** uses one key to encrypt and decrypt. Fast enough for GB/sec throughput.

**Asymmetric encryption** (RSA, ECDH) uses a public/private key pair. Slower but solves key distribution. In practice, both are combined: asymmetric handles key exchange, symmetric handles bulk data.

| | Symmetric | Asymmetric |
|---|---|---|
| Keys | 1 shared secret | Public + private pair |
| Speed | ✅ GB/sec | ❌ KB/sec |
| Key exchange | ⚠️ Needs secure channel | ✅ Built-in |
| Examples | AES, ChaCha20 | RSA, ECDH |

## AES: The Global Standard

**AES (Advanced Encryption Standard)** selected by NIST in 2001 after international competition. Used in HTTPS, BitLocker, WPA2/3, and more.

| Variant | Key | Rounds | Status |
|---|---|---|---|
| AES-128 | 128 bit | 10 | ✅ Secure |
| AES-192 | 192 bit | 12 | ✅ Secure |
| AES-256 | 256 bit | 14 | ✅ Maximum |

## Modes of Operation

### ❌ ECB — Never Use
Identical plaintext blocks → identical ciphertext. Patterns leak. The "ECB penguin" demonstrates that even encrypted images retain visual patterns with ECB.

### ✅ AES-GCM — Recommended
Authenticated Encryption: provides both confidentiality and integrity. Decryption fails if data was tampered with.

### ⚠️ CBC
Better than ECB but vulnerable to padding oracle attacks if not carefully implemented.

## Implementing AES-256-GCM

### Node.js
\`\`\`javascript
const crypto = require('crypto');

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const nonce = crypto.randomBytes(12);  // Always random

  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();  // 16-byte auth tag

  // Package: salt(16) + nonce(12) + tag(16) + ciphertext
  return Buffer.concat([salt, nonce, authTag, encrypted]).toString('base64');
}

function decrypt(ciphertext, password) {
  const data = Buffer.from(ciphertext, 'base64');
  const [salt, nonce, authTag, payload] = [
    data.slice(0, 16), data.slice(16, 28),
    data.slice(28, 44), data.slice(44)
  ];
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(payload), decipher.final()]).toString('utf8');
}
\`\`\`

### Python
\`\`\`python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os, base64

def encrypt(plaintext: str, password: str) -> str:
    salt = os.urandom(16)
    key = PBKDF2HMAC(hashes.SHA256(), 32, salt, 100000).derive(password.encode())
    nonce = os.urandom(12)
    ct = AESGCM(key).encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(salt + nonce + ct).decode()
\`\`\`

## Critical Mistakes

### ❌ Reusing Nonce
With AES-GCM, nonce reuse with the same key = catastrophic. Reveals XOR of plaintexts AND allows forging authentication tags.

\`\`\`javascript
// ❌ NEVER use a static nonce
const nonce = Buffer.alloc(12, 0);  // All zeros

// ✅ Always random
const nonce = crypto.randomBytes(12);
\`\`\`

### ❌ Password as Key Directly
\`\`\`javascript
// ❌ Wrong — weak entropy, wrong length
const key = Buffer.from(password).slice(0, 32);

// ✅ Right — use PBKDF2 or Argon2
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
\`\`\`

### ❌ ECB Mode
Always use GCM, CTR, or CBC+HMAC. Never ECB.

## ChaCha20-Poly1305 Alternative

Preferred for mobile/IoT (faster without AES hardware acceleration):
\`\`\`javascript
const cipher = crypto.createCipheriv('chacha20-poly1305', key, nonce,
  { authTagLength: 16 });
\`\`\`

→ Try the [Encryption Tool](/encryption)`);

ARTICLES.set('otp-authenticator-guide', `## What Is a One-Time Password?

A **One-Time Password (OTP)** is a code valid for only one login session or time window. Even if intercepted, it's worthless by the time an attacker tries to use it.

OTPs form the foundation of **Two-Factor Authentication (2FA)** — the second factor after "something you know" (password).

## HOTP vs TOTP

**HOTP** (RFC 4226) — Counter-based:
\`\`\`
HOTP(key, counter) = Truncate(HMAC-SHA1(key, counter))
\`\`\`
Problem: client/server counter drift breaks authentication.

**TOTP** (RFC 6238) — Time-based:
\`\`\`
TOTP(key) = HOTP(key, floor(unixTime / 30))
\`\`\`
Both sides independently compute the same 6-digit code every 30 seconds using the current Unix time. Used by Google Authenticator, Authy, Microsoft Authenticator.

## How TOTP Works

1. Server generates a random 20-byte secret, stores it encrypted per user
2. User scans QR code containing the secret in \`otpauth://\` URI format
3. App and server both compute: HMAC-SHA1(secret, floor(now/30))
4. Both truncate to 6 digits
5. Server verifies with ±1 window tolerance for clock drift

## Implementation

### Node.js
\`\`\`javascript
const { authenticator } = require('otplib');

// Enrollment: generate and store secret
const secret = authenticator.generateSecret();
// Store encrypted in database

// Generate QR code URI
const uri = authenticator.keyuri(email, 'MyApp', secret);

// Verify user's input
const isValid = authenticator.verify({ token: userInput, secret });
\`\`\`

### Python
\`\`\`python
import pyotp, qrcode

secret = pyotp.random_base32()
totp = pyotp.TOTP(secret)

otp = totp.now()               # Current 6-digit code
valid = totp.verify(user_input) # Verify with ±1 window

# QR code URI
uri = totp.provisioning_uri(name='user@example.com', issuer_name='MyApp')
\`\`\`

## Backup Codes

Always provide recovery codes for lost authenticator devices:

\`\`\`javascript
function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase()
  );
  // Store hashed (bcrypt) — show plaintext ONCE to user
}
\`\`\`

## Security Considerations

**Prevent replay attacks:**
\`\`\`javascript
async function verifyTOTP(userId, code) {
  const valid = authenticator.verify({ token: code, secret });
  if (!valid) return false;

  // Reject if already used in this 30-second window
  const windowKey = \`otp:\${userId}:\${Math.floor(Date.now() / 30000)}\`;
  if (await redis.get(windowKey)) return false;
  await redis.setex(windowKey, 60, '1');
  return true;
}
\`\`\`

## TOTP vs Other 2FA Methods

| Method | Security | Phishing-Resistant |
|---|---|---|
| SMS OTP | ⚠️ Low (SIM swap) | ❌ |
| Email OTP | ⚠️ Low | ❌ |
| TOTP App | ✅ Good | ❌ |
| Hardware Key (YubiKey) | ✅ Excellent | ✅ |
| Passkeys (WebAuthn) | ✅ Excellent | ✅ |

→ Try the [OTP Generator and Validator](/otp-code-generator-and-validator)`);

ARTICLES.set('bip39-mnemonic-guide', `## What Is BIP39?

**BIP39** defines a standard for generating **mnemonic phrases** — sequences of 12 or 24 common English words that encode a cryptographic seed for HD (hierarchical deterministic) cryptocurrency wallets.

Instead of backing up a raw private key like \`3a7bd3e2360a3d29eea436fcfb7e44c735d117c4\`, you write down 12–24 words:

\`\`\`
abandon ability able about above absent absorb abstract absurd abuse access accident
\`\`\`

These words recover your entire wallet.

## How BIP39 Works

### Step 1: Generate Entropy
128 bits (12 words) or 256 bits (24 words) of CSPRNG random data.

### Step 2: Add Checksum
Append first ENT/32 bits of SHA256(entropy):
- 128 bits + 4-bit checksum = 132 bits → 12 words
- 256 bits + 8-bit checksum = 264 bits → 24 words

### Step 3: Map to Words
Each 11-bit group (0–2047) maps to one word from the 2048-word BIP39 English wordlist.

### Step 4: Derive Seed (PBKDF2)
\`\`\`
seed = PBKDF2(mnemonic, "mnemonic" + passphrase, 2048, SHA512, 64 bytes)
\`\`\`

### Step 5: BIP32 HD Wallet
The 512-bit seed generates a master key for a hierarchical wallet:
\`\`\`
m/44'/0'/0'/0/0   → First Bitcoin address
m/44'/60'/0'/0/0  → First Ethereum address
\`\`\`

One seed → unlimited addresses on unlimited blockchains.

## Security Analysis

**Entropy:** 2048^12 ≈ 2^132 possible phrases. Brute-force is computationally infeasible — forever.

**Optional passphrase (25th word):** Even if someone finds your written phrase, they cannot access funds without the passphrase. Great for plausible deniability.

## Implementation

### JavaScript
\`\`\`javascript
import * as bip39 from 'bip39';

// Generate 24-word mnemonic
const mnemonic = bip39.generateMnemonic(256);

// Validate
const isValid = bip39.validateMnemonic(mnemonic);

// Convert to 64-byte seed
const seed = await bip39.mnemonicToSeed(mnemonic, 'optional-passphrase');
\`\`\`

### Python
\`\`\`python
from mnemonic import Mnemonic

mnemo = Mnemonic("english")
words = mnemo.generate(strength=256)  # 24 words

assert mnemo.check(words)

seed = mnemo.to_seed(words, passphrase="optional")
\`\`\`

## Safe Storage

| Method | Security | Durability |
|---|---|---|
| Metal plate (Cryptosteel) | ✅ Air-gapped | ✅ Fire/water proof |
| Paper in fireproof safe | ✅ Air-gapped | ⚠️ Paper degrades |
| Hardware wallet | ✅ Encrypted chip | ✅ Good |
| Password manager | ⚠️ Online risk | ✅ Convenient |
| Cloud notes / email | ❌ Easily breached | — |
| Screenshot / photo | ❌ Cloud sync | — |

## Critical Rules

- **Never** type your seed phrase into any website
- **Never** screenshot it — cloud sync will upload it
- **Always** test recovery before storing real funds
- **Always** keep backups in two separate secure locations
- **Never** share it — legitimate support teams never ask for it

→ Try the [BIP39 Generator](/bip39-generator)`);

// ══════════════════════════════════════════════════════
// CONVERTER CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('base64-encoding-explained', `## What Is Base64?

**Base64** is an encoding scheme that represents binary data using 64 printable ASCII characters. It's not encryption — it's purely a format for safely transmitting binary data through text-based systems.

Characters used: A–Z (26), a–z (26), 0–9 (10), + (1), / (1) = 64, with = for padding.
**Base64URL** variant: replaces + with - and / with _ (used in JWTs and URLs).

## Why Base64 Exists

Many systems were designed for text, not arbitrary binary data:
- **Email (SMTP/MIME)** — Attachments use Base64
- **JSON** — Can't embed binary; use Base64 for images/files
- **HTML data URIs** — Embed images in HTML without extra HTTP requests
- **HTTP Basic Auth** — Encodes credentials as Base64
- **JWT** — Header, payload, and signature are all Base64URL-encoded

## How It Works

Base64 converts every 3 bytes into 4 ASCII characters:

\`\`\`
Input: 01001101 01100001 01101110
6-bit groups: 010011 010110 000101 101110
Base64 chars:    T       W       F       u
\`\`\`

Size overhead: **+33%** (4 output chars per 3 input bytes).

Padding with = when input isn't divisible by 3:
\`\`\`
1 byte  → "TQ==" (2 padding)
2 bytes → "TWE=" (1 padding)
3 bytes → "TWFu" (no padding)
\`\`\`

## Encoding and Decoding

### JavaScript
\`\`\`javascript
// Browser
btoa('Hello, World!')           // "SGVsbG8sIFdvcmxkIQ=="
atob('SGVsbG8sIFdvcmxkIQ==')   // "Hello, World!"

// Node.js (binary data)
Buffer.from('Hello').toString('base64')         // "SGVsbG8="
Buffer.from('SGVsbG8=', 'base64').toString()    // "Hello"

// URL-safe (no padding, no + or /)
Buffer.from(data).toString('base64url');
\`\`\`

### Python
\`\`\`python
import base64

encoded = base64.b64encode(b'Hello, World!').decode()
# "SGVsbG8sIFdvcmxkIQ=="

decoded = base64.b64decode('SGVsbG8sIFdvcmxkIQ==')
# b'Hello, World!'

# URL-safe variant
url_safe = base64.urlsafe_b64encode(b'binary+data/here').decode()
\`\`\`

## Common Applications

### HTML Data URIs
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." alt="icon">
\`\`\`
Good for small icons. Bad for large images (no browser caching, inflates HTML by 33%).

### JWT Structure
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← base64url({"alg":"HS256","typ":"JWT"})
.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkFsaWNlIn0  ← base64url({"sub":"1234",...})
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← signature
\`\`\`

### HTTP Basic Auth
\`\`\`http
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`
Decodes to \`username:password\`. This is encoding, NOT encryption. Always use HTTPS.

## Base64 vs Base64URL

| Feature | Base64 | Base64URL |
|---|---|---|
| Characters | A-Za-z0-9+/ | A-Za-z0-9-_ |
| Padding | = | Optional |
| URL-safe | ❌ | ✅ |
| Used in | MIME, email | JWT, OAuth, URLs |

## Security Warning

Base64 provides **zero security**:
\`\`\`javascript
atob('dXNlcjpzZWNyZXRwYXNzd29yZA==')
// "user:secretpassword"  ← instantly readable
\`\`\`

Use proper encryption (AES-256-GCM) for confidentiality. Use bcrypt/Argon2 for passwords.

→ Try the [Base64 String Converter](/base64-string-converter) or [Base64 File Converter](/base64-file-converter)`);

ARTICLES.set('json-to-yaml-complete-guide', `## JSON vs YAML

Both JSON and YAML represent structured hierarchical data, but with different priorities:
- **JSON**: Machine parsing first — strict, unambiguous, minimal
- **YAML**: Human readability first — flexible, comments, less punctuation

## Side-by-Side Comparison

**JSON (verbose but strict):**
\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true,
    "tags": ["web", "api"],
    "database": {
      "url": "postgres://localhost/mydb",
      "pool_size": 10
    }
  }
}
\`\`\`

**Equivalent YAML (shorter, supports comments):**
\`\`\`yaml
# Server configuration
server:
  host: localhost
  port: 8080
  debug: true
  tags:
    - web
    - api
  database:
    url: postgres://localhost/mydb
    pool_size: 10
\`\`\`

## YAML Syntax

\`\`\`yaml
# Strings
name: John Doe
quoted: "Hello, World!"
multiline: |
  Line 1
  Line 2
folded: >
  This long line gets folded
  into one sentence.

# Numbers and booleans
port: 8080
ratio: 3.14
active: true
disabled: false
empty: null

# Arrays (block and flow)
fruits:
  - apple
  - banana
fruits_inline: [apple, banana]

# Objects (flow)
point: {x: 1, y: 2}
\`\`\`

## YAML Gotchas

### The Norway Problem (YAML 1.1)
\`\`\`yaml
country: NO   # Parsed as false in YAML 1.1!
switch: ON    # Parsed as true!
zip: 08080    # Parsed as octal!
\`\`\`
Fix: Quote strings that could be misinterpreted. Use YAML 1.2 where possible.

### Tabs Not Allowed
YAML strictly prohibits tabs. Always indent with spaces.

### yaml.load() is Dangerous
\`\`\`python
# ❌ Executes arbitrary Python!
data = yaml.load(untrusted_input)

# ✅ Always use safe_load
data = yaml.safe_load(untrusted_input)
\`\`\`

## Common Use Cases

### Docker Compose
\`\`\`yaml
version: '3.8'
services:
  web:
    image: nginx:1.25
    ports:
      - "80:80"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
\`\`\`

### Kubernetes Deployment
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: my-api:1.2.0
          ports:
            - containerPort: 3000
\`\`\`

### GitHub Actions
\`\`\`yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
\`\`\`

## Converting JSON ↔ YAML

### Node.js
\`\`\`javascript
const yaml = require('js-yaml');
const fs = require('fs');

// JSON → YAML
const data = JSON.parse(fs.readFileSync('config.json', 'utf8'));
fs.writeFileSync('config.yaml', yaml.dump(data, { indent: 2 }));

// YAML → JSON
const parsed = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
fs.writeFileSync('config.json', JSON.stringify(parsed, null, 2));
\`\`\`

### Python
\`\`\`python
import json, yaml

with open('config.json') as f:
    data = json.load(f)

with open('config.yaml', 'w') as f:
    yaml.dump(data, f, default_flow_style=False, indent=2)

# YAML → JSON (safe_load!)
with open('config.yaml') as f:
    data = yaml.safe_load(f)
\`\`\`

## When to Use Which

| Use JSON for | Use YAML for |
|---|---|
| REST API responses | Configuration files |
| Language interop | Docker, Kubernetes |
| Strict schema validation | CI/CD pipelines |
| Browser JavaScript | Human-edited files |

→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`);

ARTICLES.set('css-unit-converter-guide', `## CSS Units Overview

CSS units are divided into **absolute** (fixed physical sizes) and **relative** (context-dependent). Choosing correctly impacts accessibility, responsiveness, and maintainability.

## Absolute Units

| Unit | Definition | Use When |
|---|---|---|
| px | 1/96th of 1 inch | Borders, shadows, media queries |
| pt | 1/72nd of 1 inch | Print stylesheets |
| cm/mm/in | Physical | Print layouts |

On high-DPI displays: 1 CSS pixel ≠ 1 physical pixel. On a 2× Retina display, 1 CSS px = 4 physical pixels. The browser handles this mapping.

## Relative Units: Font-Based

| Unit | Relative To | Use When |
|---|---|---|
| rem | Root (html) font-size | Typography, spacing |
| em | Parent font-size | Padding/margin relative to component |
| ch | Width of "0" character | Text input sizing |

## Relative Units: Viewport-Based

| Unit | Equals | Notes |
|---|---|---|
| vw | 1% viewport width | Responsive widths |
| vh | 1% viewport height | Full-height sections |
| svh | Small viewport height | Mobile (excludes browser chrome) |
| dvh | Dynamic viewport height | Mobile (updates when chrome hides) |

Use dvh/svh instead of vh for mobile — it handles the browser chrome appearance/disappearance.

## px vs rem vs em: Key Differences

### rem Respects Browser Preferences
\`\`\`css
/* ❌ Ignores user's font size preference */
html { font-size: 16px; }
h1 { font-size: 32px; }

/* ✅ Respects user's settings */
html { font-size: 100%; }  /* = user's default */
h1 { font-size: 2rem; }    /* = 2× user's default */
\`\`\`

### em Compounds, rem Doesn't
\`\`\`css
.parent { font-size: 1.25em; }     /* 20px */
.child  { font-size: 1.25em; }     /* 25px! (1.25 × 20px) */
.grandchild { font-size: 1.25em; } /* 31.25px! Compounds */

/* rem is always relative to root */
.parent     { font-size: 1.25rem; } /* 20px */
.child      { font-size: 1.25rem; } /* 20px */
\`\`\`

**Rule:** Use rem for font sizes, em for component-relative spacing.

## Conversion Reference (base 16px)

| px | rem | % |
|---|---|---|
| 8 | 0.5 | 50% |
| 12 | 0.75 | 75% |
| 14 | 0.875 | 87.5% |
| 16 | 1 | 100% |
| 18 | 1.125 | 112.5% |
| 20 | 1.25 | 125% |
| 24 | 1.5 | 150% |
| 32 | 2 | 200% |
| 48 | 3 | 300% |

## Fluid Typography with clamp()

\`\`\`css
h1 {
  /* Min 1.5rem, preferred 5vw, max 3rem */
  font-size: clamp(1.5rem, 5vw, 3rem);
}
\`\`\`

Scales smoothly between viewport sizes without breakpoints.

## Best Practices

\`\`\`css
/* Typography — use rem */
html { font-size: 100%; }
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
body { font-size: 1rem; line-height: 1.6; }

/* Component spacing — use em (scales with component) */
.button { padding: 0.5em 1em; }

/* Layout — use %, vw, or CSS Grid */
.container { max-width: 1200px; width: min(90%, 1200px); }

/* Fine details — use px */
.border { border: 1px solid #ccc; }
.shadow { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* Mobile hero — use dvh */
.hero { min-height: 100dvh; }
\`\`\`

→ Try the [CSS Unit Converter](/css-unit-converter)`);

ARTICLES.set('color-converter-hex-rgb-hsl', `## Color Models in Web Development

Different color models serve different purposes. Understanding each helps you pick the right one for the task.

## RGB: Screen Colors

**RGB (Red, Green, Blue)** additively mixes light. Each channel is 0–255.

\`\`\`css
color: rgb(255, 87, 51);
color: rgba(255, 87, 51, 0.8);  /* With opacity */
\`\`\`

- rgb(0,0,0) = Black | rgb(255,255,255) = White
- rgb(255,0,0) = Red | rgb(0,255,0) = Green | rgb(0,0,255) = Blue

## HEX: Compact RGB

Hex encodes each RGB channel as 2 hexadecimal digits:
\`\`\`
#FF5733
 └┘└┘└┘
  R  G  B
  
FF = 255 | 57 = 87 | 33 = 51
\`\`\`

Shorthand: #F53 = #FF5533
With alpha: #FF5733CC (CC ≈ 80% opacity)

## HSL: Human-Intuitive

**HSL (Hue, Saturation, Lightness)** maps to how humans think about color:

\`\`\`css
color: hsl(11, 100%, 60%);
       │    │      │
       │    │      └── Lightness: 0% = black, 50% = normal, 100% = white
       │    └───────── Saturation: 0% = gray, 100% = vivid
       └────────────── Hue: 0–360° color wheel
\`\`\`

Hue: 0°/360° = Red | 60° = Yellow | 120° = Green | 180° = Cyan | 240° = Blue | 300° = Magenta

HSL is perfect for design variations:
\`\`\`css
--primary:       hsl(220, 70%, 50%);
--primary-light: hsl(220, 70%, 70%);  /* just change lightness */
--primary-dark:  hsl(220, 70%, 30%);
--primary-muted: hsl(220, 20%, 50%);  /* reduce saturation */
\`\`\`

## Conversion Functions

### HEX ↔ RGB
\`\`\`javascript
function hexToRgb(hex) {
  const m = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(c => Math.round(c).toString(16).padStart(2,'0')).join('');
}
\`\`\`

### RGB ↔ HSL
\`\`\`javascript
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g-b)/d + (g<b?6:0)) / 6; break;
      case g: h = ((b-r)/d + 2) / 6; break;
      case b: h = ((r-g)/d + 4) / 6; break;
    }
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}
\`\`\`

## Modern CSS Color Spaces

CSS Color Level 4 adds perceptually uniform spaces for better gradients:

\`\`\`css
/* oklch: lightness, chroma, hue */
color: oklch(65% 0.15 210);

/* display-p3: wider gamut for modern screens */
color: color(display-p3 0.5 0.8 0.3);

/* Better gradient (oklch produces no gray middle) */
background: linear-gradient(oklch(70% 0.2 0), oklch(70% 0.2 120));
\`\`\`

## Design System Palette

\`\`\`css
:root {
  --hue: 220;
  --sat: 70%;
  --brand-100: hsl(var(--hue), var(--sat), 95%);
  --brand-300: hsl(var(--hue), var(--sat), 75%);
  --brand-500: hsl(var(--hue), var(--sat), 55%); /* base */
  --brand-700: hsl(var(--hue), var(--sat), 35%);
  --brand-900: hsl(var(--hue), var(--sat), 15%);
}
\`\`\`

→ Try the [Color Converter](/color-converter)`);

ARTICLES.set('markdown-to-html-guide', `## What Is Markdown?

**Markdown** is a lightweight markup language created by John Gruber in 2004. It lets you write formatted text using simple plain-text syntax. The design goal: a raw Markdown file should be readable even without rendering.

## Syntax Reference

### Headings
\`\`\`markdown
# H1  ## H2  ### H3  #### H4
\`\`\`

### Text Formatting
\`\`\`markdown
**Bold**  *Italic*  ~~Strikethrough~~  \`inline code\`
[Link](https://example.com)  ![Image](photo.jpg)
> Blockquote
\`\`\`

### Lists
\`\`\`markdown
- Unordered item
  - Nested

1. Ordered item
   1. Nested ordered

- [x] Completed task
- [ ] Pending task
\`\`\`

### Code Blocks
\`\`\`\`markdown
\`\`\`javascript
const greeting = "Hello!";
\`\`\`
\`\`\`\`

### Tables (GFM)
\`\`\`markdown
| Col 1 | Col 2 | Col 3 |
|-------|:-----:|------:|
| Left  | Center| Right |
\`\`\`

## Markdown Flavors

| Flavor | Used By | Notable Features |
|---|---|---|
| CommonMark | Base standard | Strict, unambiguous |
| GFM (GitHub) | GitHub, GitLab | Tables, task lists, footnotes |
| MDX | Next.js, Astro | JSX inside Markdown |
| kramdown | Jekyll | Math, TOC, attributes |

## Converting to HTML

### Node.js (marked)
\`\`\`javascript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const rawHtml = marked.parse(markdownContent);
// CRITICAL: sanitize before DOM insertion
const safeHtml = DOMPurify.sanitize(rawHtml);
document.getElementById('output').innerHTML = safeHtml;
\`\`\`

### Python
\`\`\`python
import markdown

html = markdown.Markdown(
    extensions=['tables', 'fenced_code', 'codehilite', 'toc']
).convert(markdown_text)
\`\`\`

### Pandoc (Most Powerful)
\`\`\`bash
pandoc input.md -o output.html --standalone
pandoc input.md -o output.pdf
pandoc input.md -o output.docx
\`\`\`

## Security: XSS in Markdown

Markdown can include raw HTML that creates XSS vulnerabilities:
\`\`\`markdown
<script>alert('XSS!')</script>
[Click me](javascript:alert('XSS'))
\`\`\`

**Always sanitize output:**
\`\`\`javascript
// ❌ Dangerous
element.innerHTML = marked.parse(userContent);

// ✅ Safe
element.innerHTML = DOMPurify.sanitize(marked.parse(userContent));
\`\`\`

## Popular Platforms Using Markdown

| Platform | Flavor | Usage |
|---|---|---|
| GitHub | GFM | READMEs, Issues, PRs |
| Stack Overflow | CommonMark | Q&A |
| Discord | Simplified | Chat messages |
| Obsidian | GFM + plugins | Knowledge base |
| Notion | Custom | Documents |

→ Try the [Markdown to HTML Converter](/markdown-to-html)`);

ARTICLES.set('unix-timestamp-guide', `## What Is a Unix Timestamp?

A **Unix timestamp** is the number of seconds elapsed since **January 1, 1970, 00:00:00 UTC** — the Unix Epoch.

It's universal because it's:
- A single integer — trivially stored and compared
- Timezone-independent — always UTC
- Universal — every language and database supports it

## Reference Points

| Timestamp | Human Date (UTC) |
|---|---|
| 0 | 1970-01-01 00:00:00 |
| 1000000000 | 2001-09-09 01:46:40 |
| 1700000000 | 2023-11-14 22:13:20 |
| 2147483647 | 2038-01-19 03:14:07 ← Year 2038 Problem |
| 2000000000 | 2033-05-18 03:33:20 |

## The Year 2038 Problem

32-bit signed integers max out at **2,147,483,647** = January 19, 2038. Systems still using 32-bit timestamps will overflow on that date. Most modern systems use 64-bit timestamps (safe for billions of years), but embedded and legacy systems may still be vulnerable.

## Getting the Current Timestamp

### JavaScript
\`\`\`javascript
const ts = Math.floor(Date.now() / 1000);   // seconds
const ms = Date.now();                       // milliseconds (JS native)

// Specific date → timestamp
Math.floor(new Date('2025-06-01T00:00:00Z').getTime() / 1000)
\`\`\`

### Python
\`\`\`python
import time
ts = int(time.time())

from datetime import datetime, timezone
ts = int(datetime(2025, 6, 1, tzinfo=timezone.utc).timestamp())
\`\`\`

### Bash / SQL
\`\`\`bash
date +%s                    # Current Unix timestamp
\`\`\`
\`\`\`sql
SELECT EXTRACT(EPOCH FROM NOW())::bigint;   -- PostgreSQL
SELECT UNIX_TIMESTAMP();                     -- MySQL
\`\`\`

## Converting Timestamp → Human Date

### JavaScript
\`\`\`javascript
const ts = 1748793000;

// ISO 8601 UTC
new Date(ts * 1000).toISOString()
// "2025-06-01T14:30:00.000Z"

// Locale display
new Date(ts * 1000).toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full', timeStyle: 'short'
})
\`\`\`

### Python
\`\`\`python
from datetime import datetime, timezone
dt = datetime.fromtimestamp(1748793000, tz=timezone.utc)
print(dt.isoformat())  # "2025-06-01T14:30:00+00:00"
\`\`\`

## ms vs Seconds

JavaScript's Date.now() returns **milliseconds**. If timestamp > 10^10, it's likely milliseconds.

\`\`\`javascript
const toSeconds = ts => ts > 1e10 ? Math.floor(ts / 1000) : ts;
const toMs = ts => ts > 1e10 ? ts : ts * 1000;
\`\`\`

## Common Operations

\`\`\`javascript
const now = Math.floor(Date.now() / 1000);

const inOneHour  = now + 3600;
const inOneDay   = now + 86400;
const inOneWeek  = now + 7 * 86400;

const isExpired = expiresAt => Math.floor(Date.now() / 1000) > expiresAt;

function timeAgo(ts) {
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60)    return \`\${s}s ago\`;
  if (s < 3600)  return \`\${Math.floor(s/60)}m ago\`;
  if (s < 86400) return \`\${Math.floor(s/3600)}h ago\`;
  return \`\${Math.floor(s/86400)}d ago\`;
}
\`\`\`

→ Try the [Unix Timestamp Converter](/unix-timestamp)`);

ARTICLES.set('date-time-converter-guide', `## The Date Format Problem

"01/02/03" means three different things:
- 🇺🇸 USA: January 2, 2003 (MM/DD/YY)
- 🇬🇧 UK: February 1, 2003 (DD/MM/YY)
- 🇯🇵 Japan: 2001-02-03 (YY/MM/DD)

This ambiguity has caused real disasters: aviation incidents, medical dosing errors, financial failures.

## ISO 8601: The Universal Standard

\`\`\`
2025-06-01T14:30:00Z           ← UTC (Z = Zulu)
2025-06-01T14:30:00+05:30      ← India (IST)
2025-06-01T14:30:00-07:00      ← US Pacific Daylight
\`\`\`

Ordered from largest to smallest unit — unambiguous, internationally understood. **Always use ISO 8601 in databases and APIs.**

## Timezone Best Practice: Store UTC, Display Local

\`\`\`javascript
// Store as UTC ISO string
const stored = new Date().toISOString();
// "2025-06-01T14:30:00.000Z"

// Display in user's timezone
const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// "America/New_York"

const displayed = new Date(stored).toLocaleString('en-US', {
  timeZone: userTz,
  dateStyle: 'full',
  timeStyle: 'short'
});
\`\`\`

## Conversion Examples

\`\`\`javascript
// Epoch → ISO 8601
new Date(1748793000 * 1000).toISOString()
// "2025-06-01T14:30:00.000Z"

// ISO 8601 → Epoch
Math.floor(new Date('2025-06-01T00:00:00Z').getTime() / 1000)

// Relative time
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
rtf.format(-1, 'day')   // "yesterday"
rtf.format(3, 'day')    // "in 3 days"
rtf.format(-2, 'hour')  // "2 hours ago"
\`\`\`

## Date Arithmetic

\`\`\`javascript
// Add days correctly (handles DST)
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);  // Use setDate, not +ms
  return d;
}

// Difference in days
const diffDays = (a, b) => Math.round((b - a) / 86400000);

// Start/end of month
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
\`\`\`

## DST Pitfall

\`\`\`javascript
// ❌ Wrong: adding 24h ≠ adding 1 calendar day on DST change days
const tomorrow = new Date(now.getTime() + 86400000);  // ±1h error on DST day

// ✅ Right
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
\`\`\`

## Leap Years

\`\`\`javascript
const isLeapYear = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) => new Date(y, m, 0).getDate(); // m: 1-12

isLeapYear(2024)     // true
isLeapYear(1900)     // false (divisible by 100, not 400)
daysInMonth(2024, 2) // 29
\`\`\`

## Recommended Libraries

| Library | Size | Best For |
|---|---|---|
| date-fns | Modular | Functional, tree-shakeable |
| dayjs | ~2KB | Moment.js drop-in replacement |
| luxon | ~70KB | Complex timezone operations |
| Temporal API | Native (Stage 3) | Future standard |

→ Try the [Date/Time Converter](/date-time-converter)`);

ARTICLES.set('temperature-converter-guide', `## The Four Temperature Scales

| Scale | Symbol | Absolute Zero | Water Freezes | Body Temp | Water Boils |
|---|---|---|---|---|---|
| Celsius | °C | -273.15 | 0 | 37 | 100 |
| Fahrenheit | °F | -459.67 | 32 | 98.6 | 212 |
| Kelvin | K | 0 | 273.15 | 310.15 | 373.15 |
| Rankine | °R | 0 | 491.67 | 558.87 | 671.67 |

## Conversion Formulas

**Celsius ↔ Fahrenheit:**
\`\`\`
°F = (°C × 9/5) + 32
°C = (°F − 32) × 5/9
\`\`\`

**Celsius ↔ Kelvin:**
\`\`\`
K = °C + 273.15
°C = K − 273.15
\`\`\`

**Fahrenheit ↔ Kelvin:**
\`\`\`
K = (°F + 459.67) × 5/9
°F = K × 9/5 − 459.67
\`\`\`

## Quick Mental Math

Fahrenheit to Celsius shortcut: subtract 30, divide by 2 (within ~2°C):
\`\`\`
50°F → (50-30)/2 = 10°C  (exact: 10°C ✓)
80°F → (80-30)/2 = 25°C  (exact: 26.7°C ≈)
\`\`\`

## Key Temperature Reference Points

| °C | °F | Context |
|---|---|---|
| -273.15 | -459.67 | Absolute zero |
| -195.8 | -320.4 | Liquid nitrogen boils |
| -78.5 | -109.3 | Dry ice sublimates |
| 0 | 32 | Water freezes |
| 20–22 | 68–72 | Comfortable room |
| 37 | 98.6 | Human body |
| 100 | 212 | Water boils (sea level) |
| 180 | 356 | Oven: moderate baking |
| 1370 | 2500 | Steel melts |

## Why Kelvin Has No Degree Symbol

Kelvin is an **absolute thermodynamic scale** — 0 K is absolute zero where all molecular motion stops. Unlike Celsius and Fahrenheit, it's not relative to an arbitrary reference point. You say "300 kelvin" not "300 degrees kelvin."

## Scientific Applications

### Ideal Gas Law Requires Kelvin
\`\`\`python
# PV = nRT  — T MUST be in Kelvin
def ideal_gas_pressure(n_moles, volume_L, temp_celsius):
    R = 0.0821  # L·atm/(mol·K)
    T_K = temp_celsius + 273.15  # CRITICAL
    return (n_moles * R * T_K) / volume_L

ideal_gas_pressure(1, 22.4, 0)  # ≈ 1.00 atm at STP
\`\`\`

## Code Implementation

### JavaScript
\`\`\`javascript
const temp = {
  cToF: c => c * 9/5 + 32,
  fToC: f => (f - 32) * 5/9,
  cToK: c => c + 273.15,
  kToC: k => k - 273.15,
  fToK: f => (f + 459.67) * 5/9,
  kToF: k => k * 9/5 - 459.67,
};

temp.cToF(100)  // 212
temp.fToC(32)   // 0
temp.cToK(0)    // 273.15
\`\`\`

### Python
\`\`\`python
celsius_to_fahrenheit = lambda c: c * 9/5 + 32
fahrenheit_to_celsius = lambda f: (f - 32) * 5/9
celsius_to_kelvin = lambda c: c + 273.15
\`\`\`

→ Try the [Temperature Converter](/temperature-converter)`);

ARTICLES.set('case-converter-guide', `## What Is Text Case Conversion?

**Case conversion** transforms text from one naming convention to another — essential for programming, URL generation, and data normalization.

## Naming Conventions

| Style | Example | Used In |
|---|---|---|
| camelCase | helloWorld | JS/TS variables, Java methods |
| PascalCase | HelloWorld | Classes, React components |
| snake_case | hello_world | Python, Ruby, SQL, Rust |
| SCREAMING_SNAKE | HELLO_WORLD | Constants, env variables |
| kebab-case | hello-world | CSS, HTML, URLs, slugs |
| Title Case | Hello World | Headings, article titles |
| dot.case | hello.world | Config keys, Java packages |
| Train-Case | Hello-World | HTTP headers |

## Language Conventions

| Language | Variables | Classes | Constants | Files |
|---|---|---|---|---|
| JavaScript | camelCase | PascalCase | SCREAMING_SNAKE | kebab-case |
| TypeScript | camelCase | PascalCase | SCREAMING_SNAKE | kebab-case |
| Python | snake_case | PascalCase | SCREAMING_SNAKE | snake_case |
| Java | camelCase | PascalCase | SCREAMING_SNAKE | PascalCase |
| Go | camelCase | PascalCase | PascalCase | snake_case |
| Rust | snake_case | PascalCase | SCREAMING_SNAKE | snake_case |
| CSS | kebab-case | N/A | N/A | kebab-case |

## Implementation

### JavaScript
\`\`\`javascript
// Universal word splitter (handles all input conventions)
function splitWords(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase → split
    .replace(/[-_]+/g, ' ')                // snake/kebab → spaces
    .toLowerCase()
    .split(/\\s+/)
    .filter(Boolean);
}

const toCamelCase = s => {
  const w = splitWords(s);
  return w[0] + w.slice(1).map(v => v[0].toUpperCase() + v.slice(1)).join('');
};
const toPascalCase = s => splitWords(s).map(w => w[0].toUpperCase() + w.slice(1)).join('');
const toSnakeCase = s => splitWords(s).join('_');
const toKebabCase = s => splitWords(s).join('-');
const toScreaming = s => toSnakeCase(s).toUpperCase();

// Test
toCamelCase('hello-world')        // "helloWorld"
toPascalCase('hello_world')       // "HelloWorld"
toSnakeCase('helloWorld')          // "hello_world"
toKebabCase('HelloWorldToday')     // "hello-world-today"
toScreaming('apiEndpointUrl')      // "API_ENDPOINT_URL"
\`\`\`

### Python
\`\`\`python
import re

def to_snake_case(s):
    s = re.sub('([A-Z]+)([A-Z][a-z])', r'\\1_\\2', s)
    s = re.sub('([a-z\\d])([A-Z])', r'\\1_\\2', s)
    return s.lower().replace('-', '_')

def to_camel_case(s):
    parts = re.split(r'[_\\-\\s]+', s.lower())
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])
\`\`\`

## API Key Translation

APIs often return snake_case (Python/Ruby), but frontend expects camelCase (JavaScript):

\`\`\`javascript
function camelizeKeys(obj) {
  if (Array.isArray(obj)) return obj.map(camelizeKeys);
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toCamelCase(k), camelizeKeys(v)])
  );
}

// {"user_first_name": "Alice"} → {"userFirstName": "Alice"}
const data = camelizeKeys(await fetch('/api/user').then(r => r.json()));
\`\`\`

## URL Slug Generation

\`\`\`javascript
function toSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')                        // Decompose accents
    .replace(/[\\u0300-\\u036f]/g, '')        // Remove accent marks
    .replace(/[^a-z0-9\\s-]/g, '')           // Remove special chars
    .trim()
    .replace(/[\\s_]+/g, '-')                // Spaces → hyphens
    .replace(/-+/g, '-');                    // Collapse multiple hyphens
}

toSlug('Hello, Wörld! (Test)')  // "hello-world-test"
toSlug('Café au Lait')          // "cafe-au-lait"
\`\`\`

→ Try the [Case Converter](/case-converter)`);

ARTICLES.set('roman-numeral-converter-guide', `## What Are Roman Numerals?

**Roman numerals** use Latin letters to represent values. They're still used today for clock faces, movie sequels, Super Bowl numbers, and formal events.

| Symbol | Value |
|---|---|
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1000 |

## Additive and Subtractive Rules

**Additive:** Write from largest to smallest:
\`\`\`
VIII = 5+1+1+1 = 8
MDCCLXXVI = 1776 (the year on the US dollar bill)
\`\`\`

**Subtractive:** A smaller numeral before a larger one means subtract:
\`\`\`
IV  = 5-1  = 4   (not IIII)
IX  = 10-1 = 9   (not VIIII)
XL  = 50-10 = 40
XC  = 100-10 = 90
CD  = 500-100 = 400
CM  = 1000-100 = 900
\`\`\`

Only 6 subtractive combinations are valid: IV, IX, XL, XC, CD, CM.

## Common Conversions

| Arabic | Roman | Arabic | Roman |
|---|---|---|---|
| 4 | IV | 50 | L |
| 9 | IX | 90 | XC |
| 14 | XIV | 100 | C |
| 19 | XIX | 400 | CD |
| 40 | XL | 900 | CM |
| 49 | XLIX | 1999 | MCMXCIX |
| 50 | L | 2024 | MMXXIV |

## Implementation

### JavaScript
\`\`\`javascript
function toRoman(num) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

function fromRoman(str) {
  const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const curr = map[str[i]], next = map[str[i+1]];
    result += next > curr ? -curr : curr;
  }
  return result;
}

toRoman(2024)         // "MMXXIV"
fromRoman('MMXXIV')   // 2024
toRoman(1999)         // "MCMXCIX"
\`\`\`

### Python
\`\`\`python
def to_roman(num):
    vals = [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),
            (90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]
    result = ''
    for v, s in vals:
        while num >= v:
            result += s; num -= v
    return result

def from_roman(s):
    m = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    return sum(-m[s[i]] if i+1 < len(s) and m[s[i+1]] > m[s[i]] else m[s[i]]
               for i in range(len(s)))
\`\`\`

## Real-World Uses Today

- **Film sequels:** Rocky II, Star Wars Episode IV, Fast X
- **Super Bowl:** LIX (59), LVIII (58)
- **Monarchs:** King Charles III, Queen Elizabeth II
- **Decades in film credits:** Still common in closing credits
- **Clocks:** Most analog clock faces use Roman numerals
- **Legal documents:** Chapter/section numbering

## Historical Context

Romans had no zero — their system starts at I. Large numbers used M bars (vinculum): V̄ = 5,000, X̄ = 10,000. The system fell out of mathematical use when Hindu-Arabic numerals arrived in medieval Europe, but persists in ceremonial contexts.

→ Try the [Roman Numeral Converter](/roman-numeral-converter)`);

ARTICLES.set('integer-base-converter-guide', `## What Is a Number Base?

A **number base** (radix) defines how many digits are used to represent numbers. Each digit's value depends on its position (powers of the base).

| Base | Name | Digits | Prefix |
|---|---|---|---|
| 2 | Binary | 0, 1 | 0b |
| 8 | Octal | 0–7 | 0o |
| 10 | Decimal | 0–9 | (none) |
| 16 | Hexadecimal | 0–9, A–F | 0x |

## Why Different Bases in Computing?

### Binary (Base 2)
Everything in a computer is binary — circuits are either on (1) or off (0).

\`\`\`
Decimal 42 in binary:
42 = 32+8+2 = 2^5 + 2^3 + 2^1 = 101010₂
\`\`\`

Used for:
- Network masks: 255.255.255.0 = 11111111.11111111.11111111.00000000
- File permissions: chmod 755 = 111 101 101 (rwxr-xr-x)
- Bit flags, boolean operations

### Hexadecimal (Base 16)
Each hex digit = exactly 4 bits (1 nibble):

\`\`\`
Binary:  1010 1111 1100 1101
Hex:       A    F    C    D
= 0xAFCD
\`\`\`

Used for:
- Memory addresses: 0x7fff5fbff8e0
- Colors: #FF5733
- SHA-256 hashes (64 hex chars = 256 bits)
- Byte values in debuggers

### Octal (Base 8)
Each octal digit = 3 bits:

\`\`\`
chmod 755:
7 = 111 (rwx) → owner
5 = 101 (r-x) → group
5 = 101 (r-x) → others
\`\`\`

## Conversion Formulas

### Any Base → Decimal
Multiply each digit by base^position and sum:
\`\`\`
0x1F = 1×16¹ + 15×16⁰ = 16 + 15 = 31
0b1101 = 1×8 + 1×4 + 0×2 + 1×1 = 13
\`\`\`

### Decimal → Any Base
Divide by target base, collect remainders:
\`\`\`
255 → hex:
255 ÷ 16 = 15 r 15 (F)
 15 ÷ 16 = 0  r 15 (F)
Read bottom-up: FF
255₁₀ = 0xFF
\`\`\`

## JavaScript Conversion

\`\`\`javascript
// Decimal → other bases
(255).toString(2)    // "11111111" (binary)
(255).toString(8)    // "377" (octal)
(255).toString(16)   // "ff" (hex)
(255).toString(36)   // "73" (base36)

// Any base → decimal
parseInt('11111111', 2)  // 255
parseInt('377', 8)       // 255
parseInt('ff', 16)       // 255

// Hex colors
const hex = '#FF5733';
const r = parseInt(hex.slice(1,3), 16); // 255
const g = parseInt(hex.slice(3,5), 16); // 87
const b = parseInt(hex.slice(5,7), 16); // 51
\`\`\`

## Python Conversion

\`\`\`python
bin(255)   # '0b11111111'
oct(255)   # '0o377'
hex(255)   # '0xff'

int('ff', 16)       # 255
int('11111111', 2)  # 255

def to_base(n, base):
    digits = '0123456789ABCDEF'
    return (to_base(n // base, base) + digits[n % base]) if n > 0 else ''
\`\`\`

## Bitwise Operations

\`\`\`javascript
// Masking with hex (clearer than binary)
0xFF & 0x0F    // 0x0F = 15 (keep lower nibble)

// Feature flags with named constants
const READ    = 0b0001;  // 1
const WRITE   = 0b0010;  // 2
const EXECUTE = 0b0100;  // 4

let perms = READ | WRITE;         // 0b0011 = 3
const canRead    = (perms & READ) !== 0;    // true
const canExecute = (perms & EXECUTE) !== 0; // false

// Grant/revoke permissions
perms |= EXECUTE;   // Grant execute
perms &= ~WRITE;    // Revoke write
\`\`\`

→ Try the [Integer Base Converter](/integer-base-converter)`);

// ══════════════════════════════════════════════════════
// DEVELOPMENT CATEGORY (already-long ones skipped)
// ══════════════════════════════════════════════════════

ARTICLES.set('json-prettify-and-validate', `## What Is JSON?

**JSON (JavaScript Object Notation)** is the universal format for data exchange — used by virtually every REST API, configuration system, and database export. Despite its name, it's language-agnostic.

JSON was formalized in RFC 7159 and ECMA-404.

## JSON Syntax Rules

\`\`\`json
{
  "string": "must use double quotes",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "nullValue": null,
  "array": [1, "two", true, null],
  "object": { "nested": "works" }
}
\`\`\`

### What JSON Does NOT Support
- ❌ Single-quoted strings: \`'hello'\`
- ❌ Trailing commas: \`[1, 2, 3,]\`
- ❌ Comments: \`// comment\` or \`/* */\`
- ❌ Undefined, functions, Date objects
- ❌ NaN or Infinity (use null instead)

## Common Parse Errors

### Trailing Comma
\`\`\`json
{ "name": "Alice", "age": 30, }  ← invalid (trailing comma)
{ "name": "Alice", "age": 30 }   ← valid
\`\`\`

### Unquoted Keys
\`\`\`json
{ name: "Alice" }    ← invalid (JS syntax, not JSON)
{ "name": "Alice" }  ← valid
\`\`\`

### Single Quotes
\`\`\`json
{ "name": 'Alice' }  ← invalid
{ "name": "Alice" }  ← valid
\`\`\`

## Parsing and Stringifying

### JavaScript
\`\`\`javascript
// Parse: string → object
try {
  const obj = JSON.parse(jsonString);
} catch (e) {
  console.error('Invalid JSON:', e.message);
}

// Stringify: object → string
const compact = JSON.stringify(obj);
const pretty = JSON.stringify(obj, null, 2);  // 2-space indent

// Custom replacer (filter/transform)
JSON.stringify(obj, ['name', 'age']);           // Only these keys
JSON.stringify(obj, (k, v) => typeof v === 'number' ? v * 2 : v); // Transform
\`\`\`

### Parsing Dates
\`\`\`javascript
// Reviver function restores Date objects
const data = JSON.parse(jsonStr, (key, value) => {
  if (typeof value === 'string' && /^\\d{4}-\\d{2}-\\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
\`\`\`

## JSON Schema Validation

\`\`\`javascript
import Ajv from 'ajv';
const ajv = new Ajv();

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'integer', minimum: 0, maximum: 150 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'age'],
  additionalProperties: false
};

const validate = ajv.compile(schema);
const valid = validate({ name: 'Alice', age: 30 });
if (!valid) console.log(validate.errors);
\`\`\`

## Minification vs Prettification

\`\`\`javascript
const obj = { "user": { "name": "Alice", "age": 30 } };

// Minified (for APIs, storage)
JSON.stringify(obj)           // '{"user":{"name":"Alice","age":30}}'

// Pretty (for humans, config files)
JSON.stringify(obj, null, 2)
// {
//   "user": {
//     "name": "Alice",
//     "age": 30
//   }
// }
\`\`\`

Minified JSON saves bandwidth in API responses (can be 20–40% smaller for typical data).

## JSON vs JSONC vs JSON5

| Format | Comments | Trailing Commas | Use Case |
|---|---|---|---|
| JSON | ❌ | ❌ | APIs, data interchange |
| JSONC | ✅ | ❌ | VS Code settings |
| JSON5 | ✅ | ✅ | Human-edited configs |
| JSON Lines | N/A | N/A | Streaming, log files |

\`\`\`json5
// JSON5 example
{
  name: 'Alice',  // unquoted keys allowed
  age: 30,        // trailing comma allowed
  /* comments allowed */
}
\`\`\`

→ Try the [JSON Viewer/Prettifier](/json-viewer)`);

ARTICLES.set('chmod-calculator-guide', `## What Is chmod?

\`chmod\` (change mode) is a Unix/Linux command that controls file permissions. Every file and directory has permissions for three types of users: **owner**, **group**, and **others (everyone)**.

## Permission Basics

Each user type has three permissions:
- **r** (read) = can view file contents / list directory
- **w** (write) = can modify file / create files in directory
- **x** (execute) = can run file / enter directory

## Octal vs Symbolic Notation

### Octal (Numeric) — e.g., chmod 755
Each digit is a 3-bit binary number representing r, w, x:

| Octal | Binary | Permissions |
|---|---|---|
| 0 | 000 | --- |
| 1 | 001 | --x |
| 2 | 010 | -w- |
| 3 | 011 | -wx |
| 4 | 100 | r-- |
| 5 | 101 | r-x |
| 6 | 110 | rw- |
| 7 | 111 | rwx |

\`\`\`
chmod 755 = 7(rwx) 5(r-x) 5(r-x)
             owner  group  others
= rwxr-xr-x
\`\`\`

### Symbolic — e.g., chmod u+x
\`\`\`bash
chmod u+x file    # Add execute for owner
chmod g-w file    # Remove write for group
chmod o=r file    # Set others to read only
chmod a+x file    # Add execute for all (a = all)
chmod u=rwx,go=rx file  # Multiple assignments
\`\`\`

## Common Permission Sets

| Octal | Symbolic | Meaning | Use When |
|---|---|---|---|
| 400 | r-------- | Owner read only | Sensitive files (private keys) |
| 600 | rw------- | Owner read/write | Private config, SSH keys |
| 644 | rw-r--r-- | Owner rw, others read | Web content, public files |
| 664 | rw-rw-r-- | Owner+group rw | Collaborative projects |
| 700 | rwx------ | Owner full, others none | Private scripts |
| 755 | rwxr-xr-x | Owner full, others r+x | Scripts, executables, directories |
| 777 | rwxrwxrwx | Everyone full | ❌ Almost never appropriate |

## Viewing Permissions

\`\`\`bash
ls -la
# -rw-r--r-- 1 alice staff  1234 Jun 1 14:30 config.json
# drwxr-xr-x 5 alice staff   160 Jun 1 14:30 scripts/
# └┘└─────┘└─────┘└─────┘
#  type owner  group  others
\`\`\`

Read the ls output:
- First character: \`-\` = file, \`d\` = directory, \`l\` = symlink
- Characters 2–4: owner permissions (rwx)
- Characters 5–7: group permissions (rwx)
- Characters 8–10: others permissions (rwx)

## Security Best Practices

\`\`\`bash
# SSH private keys — MUST be 600 or 400 (SSH will refuse to use them otherwise)
chmod 600 ~/.ssh/id_rsa

# SSH directory
chmod 700 ~/.ssh

# Web server files
chmod 644 /var/www/html/*.html
chmod 755 /var/www/html/

# Scripts that should be executable
chmod 755 deploy.sh

# Config files with passwords
chmod 600 .env
chmod 600 config/database.yml

# Never use 777
chmod 777 uploads/  # ❌ Anyone can execute scripts uploaded here!
\`\`\`

## Special Permission Bits

| Bit | Octal | Effect |
|---|---|---|
| setuid | 4000 | File runs with owner's privileges |
| setgid | 2000 | File runs with group's privileges |
| sticky | 1000 | Only owner can delete files in directory |

\`\`\`bash
chmod 4755 /usr/bin/sudo   # setuid — sudo runs as root
chmod 1777 /tmp            # sticky — users can't delete each other's temp files
\`\`\`

## Recursive chmod

\`\`\`bash
# Change all files and directories recursively
chmod -R 755 /var/www/html/

# Better: different permissions for files vs directories
find /var/www/html/ -type f -exec chmod 644 {} \\;
find /var/www/html/ -type d -exec chmod 755 {} \\;
\`\`\`

→ Try the [chmod Calculator](/chmod-calculator)`);

ARTICLES.set('docker-compose-from-run-command', `## From docker run to docker-compose.yml

Running containers with \`docker run\` is fine for one-off testing, but production environments need **Docker Compose** for:
- Multi-container orchestration
- Environment variable management
- Volume and network configuration
- Reproducible, version-controlled setup

This guide shows how to translate any \`docker run\` command into a \`docker-compose.yml\`.

## Translation Reference

### Simple Example
\`\`\`bash
# docker run command
docker run -d \\
  --name my-nginx \\
  -p 80:80 \\
  -v /home/user/html:/usr/share/nginx/html \\
  nginx:1.25
\`\`\`

\`\`\`yaml
# Equivalent docker-compose.yml
version: '3.8'
services:
  my-nginx:
    image: nginx:1.25
    ports:
      - "80:80"
    volumes:
      - /home/user/html:/usr/share/nginx/html
    restart: unless-stopped
\`\`\`

### With Environment Variables
\`\`\`bash
docker run -d \\
  -e POSTGRES_DB=mydb \\
  -e POSTGRES_USER=admin \\
  -e POSTGRES_PASSWORD=secret \\
  -p 5432:5432 \\
  postgres:16
\`\`\`

\`\`\`yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\`

## Full Multi-Container Example

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .                       # Build from local Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy  # Wait for health check
      cache:
        condition: service_started
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
\`\`\`

## Command Comparison Reference

| docker run flag | docker-compose.yml key |
|---|---|
| --name | services key name |
| -p 8080:80 | ports: ["8080:80"] |
| -e KEY=VALUE | environment: KEY: VALUE |
| -v /host:/cont | volumes: ["/host:/cont"] |
| --network net | networks section |
| --restart unless-stopped | restart: unless-stopped |
| --memory 512m | deploy.resources.limits.memory |
| -d | (implied — compose runs detached) |
| --link other | depends_on: [other] |
| --env-file .env | env_file: .env |

## Environment Variable Best Practices

\`\`\`yaml
# Option 1: .env file (git-ignored)
services:
  app:
    env_file:
      - .env          # Loads DB_URL, API_KEY, etc.
      - .env.local    # Local overrides

# Option 2: From shell environment
services:
  app:
    environment:
      - DATABASE_URL  # Reads from shell environment
\`\`\`

\`\`\`bash
# .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
API_SECRET=your-secret-here
NODE_ENV=production
\`\`\`

## Useful Commands

\`\`\`bash
docker compose up -d          # Start all services (detached)
docker compose down           # Stop and remove containers
docker compose logs -f web    # Stream logs from 'web' service
docker compose exec web bash  # Shell into running container
docker compose ps             # Show service status
docker compose build          # Rebuild images
docker compose restart web    # Restart a specific service
\`\`\`

→ Try the [Docker Run to Docker Compose Converter](/docker-run-to-docker-compose-converter)`);

ARTICLES.set('sql-prettify-guide', `## Why SQL Formatting Matters

Unformatted SQL is hard to read, review, and debug. Well-formatted SQL is:
- Easier to understand at a glance
- Easier to review in pull requests
- Easier to spot logical errors
- Consistent across a team

## SQL Formatting Conventions

### Basic SELECT
\`\`\`sql
-- ❌ Unformatted
SELECT u.id,u.name,u.email,o.total FROM users u JOIN orders o ON u.id=o.user_id WHERE u.active=true AND o.created_at>'2025-01-01' ORDER BY o.total DESC LIMIT 10;

-- ✅ Formatted
SELECT
  u.id,
  u.name,
  u.email,
  o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.active = true
  AND o.created_at > '2025-01-01'
ORDER BY o.total DESC
LIMIT 10;
\`\`\`

### Complex Query with CTEs
\`\`\`sql
WITH monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(amount) AS revenue,
    COUNT(*) AS order_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1
),
growth_calc AS (
  SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    ROUND(
      (revenue - LAG(revenue) OVER (ORDER BY month))
      / NULLIF(LAG(revenue) OVER (ORDER BY month), 0)
      * 100, 2
    ) AS growth_pct
  FROM monthly_revenue
)
SELECT *
FROM growth_calc
ORDER BY month DESC;
\`\`\`

## SQL Style Guidelines

### Capitalization
\`\`\`sql
-- Keywords uppercase, identifiers lowercase
SELECT id, name, email
FROM users
WHERE active = true
  AND created_at > NOW() - INTERVAL '30 days';

-- OR all lowercase (pick one style, stay consistent)
select id, name, email
from users
where active = true;
\`\`\`

### Aliasing
\`\`\`sql
-- Explicit AS keyword (more readable)
SELECT
  u.id AS user_id,
  u.name AS user_name,
  COUNT(o.id) AS order_count
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name;
\`\`\`

### JOIN Formatting
\`\`\`sql
SELECT
  a.id,
  b.name,
  c.total
FROM table_a AS a
INNER JOIN table_b AS b ON b.id = a.b_id
LEFT JOIN table_c AS c
  ON c.id = a.c_id
  AND c.active = true
WHERE a.status = 'active';
\`\`\`

## SQL Prettifying Tools

### Node.js (sql-formatter)
\`\`\`javascript
import { format } from 'sql-formatter';

const pretty = format(uglySQL, {
  language: 'postgresql',
  tabWidth: 2,
  keywordCase: 'upper',
  identifierCase: 'lower',
  linesBetweenQueries: 2
});
console.log(pretty);
\`\`\`

### Python (sqlparse)
\`\`\`python
import sqlparse

pretty = sqlparse.format(
    ugly_sql,
    reindent=True,
    keyword_case='upper',
    identifier_case='lower',
    indent_width=2
)
print(pretty)
\`\`\`

## SQL Performance Formatting Tips

### Explicit vs Implicit JOINs
\`\`\`sql
-- ❌ Implicit JOIN (old syntax, hard to read)
SELECT *
FROM orders, users
WHERE orders.user_id = users.id;

-- ✅ Explicit JOIN (clear, easier to convert to LEFT JOIN)
SELECT *
FROM orders
INNER JOIN users ON users.id = orders.user_id;
\`\`\`

### Using EXPLAIN
\`\`\`sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY order_count DESC;
\`\`\`

→ Try the [SQL Prettify Tool](/sql-prettify)`);

// ══════════════════════════════════════════════════════
// DEVELOPMENT CATEGORY (continued)
// ══════════════════════════════════════════════════════

ARTICLES.set('git-memo-common-commands', `## Git: The Essential Reference

Git is the world's most widely used version control system, powering collaboration for millions of developers. Whether you're a solo developer or working on a team of 500, understanding Git is non-negotiable.

## Core Workflow

\`\`\`bash
# Check current status
git status

# Stage changes
git add .                    # Stage all changes
git add src/components/      # Stage directory
git add -p                   # Interactive staging (review chunks)

# Commit
git commit -m "feat: add login form"
git commit --amend           # Fix last commit message

# Push & pull
git push origin main
git pull --rebase origin main
\`\`\`

## Branching

\`\`\`bash
# Create and switch
git branch feature/auth
git checkout feature/auth
git checkout -b feature/auth  # Create + switch in one step

# List branches
git branch -a                # All (local + remote)

# Rename
git branch -m old-name new-name

# Delete
git branch -d feature/merged   # Safe delete
git branch -D feature/forced   # Force delete
git push origin --delete feature/old  # Delete remote
\`\`\`

## Merging vs Rebasing

\`\`\`bash
# Merge (preserves history)
git checkout main
git merge feature/auth

# Rebase (linear history)
git checkout feature/auth
git rebase main

# Interactive rebase (squash, reword commits)
git rebase -i HEAD~3
\`\`\`

| Approach | Pros | Cons |
|---|---|---|
| Merge | Preserves full history | Creates merge commits |
| Rebase | Clean linear history | Rewrites commit hashes |
| Squash | Tidy single commit | Loses granular history |

## Undoing Changes

\`\`\`bash
# Discard working directory changes
git checkout -- src/file.ts
git restore src/file.ts         # Modern syntax

# Unstage (keep changes)
git reset HEAD src/file.ts
git restore --staged src/file.ts

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a specific commit (safe for shared branches)
git revert abc1234

# Stash uncommitted work
git stash push -m "WIP: auth feature"
git stash list
git stash pop                   # Apply most recent
git stash apply stash@{2}       # Apply specific
\`\`\`

## Remote Operations

\`\`\`bash
# View remotes
git remote -v

# Add remote
git remote add upstream https://github.com/original/repo.git

# Fetch without merging
git fetch origin
git fetch --all

# Track remote branch
git branch --set-upstream-to=origin/main main

# Cherry-pick a commit from another branch
git cherry-pick abc1234
\`\`\`

## Git Log & Search

\`\`\`bash
# Compact log
git log --oneline --graph --all

# Show changes in commit
git show abc1234

# Search commit messages
git log --grep="fix: login"

# Search code changes
git log -S "passwordHash" --all

# Who changed this line?
git blame src/auth.ts

# Find when a bug was introduced
git bisect start
git bisect bad                  # Current commit is broken
git bisect good v1.2.0          # Last known good tag
\`\`\`

## Tags

\`\`\`bash
# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin v1.0.0
git push origin --tags

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
\`\`\`

## Useful Aliases

Add to \`~/.gitconfig\`:

\`\`\`ini
[alias]
  st = status
  co = checkout
  br = branch
  lg = log --oneline --graph --all --decorate
  undo = reset --soft HEAD~1
  unstage = restore --staged
\`\`\`

## Git Hooks

Hooks automate quality checks. Located in \`.git/hooks/\`:

\`\`\`bash
# Pre-commit: run linter
cat .git/hooks/pre-commit
#!/bin/sh
npm run lint --silent
\`\`\`

Use [husky](https://typicode.github.io/husky/) for team-shared hooks.

→ Try the [Git Memo Tool](/git-memo)`);

ARTICLES.set('json-diff-guide', `## What Is JSON Diff?

JSON Diff compares two JSON documents and highlights their differences — added keys, removed keys, and changed values. It's an essential tool when debugging API responses, tracking configuration changes, or reviewing data migrations.

## Why Standard Text Diff Falls Short

Standard \`diff\` treats JSON as plain text. A simple value change might appear as dozens of different lines if the JSON was re-formatted or key order changed.

**Text diff (fragile):**
\`\`\`
- {"name":"Alice","age":30}
+ {"age":31,"name":"Alice"}
\`\`\`
Even though only \`age\` changed, text diff shows both lines as different because key order changed.

**Semantic JSON diff (accurate):**
\`\`\`
~ age: 30 → 31
\`\`\`
Only the actual change is shown.

## Types of Differences

| Type | Symbol | Meaning |
|---|---|---|
| Added | + | Key exists in right, not left |
| Removed | - | Key exists in left, not right |
| Modified | ~ | Same key, different value |
| Unchanged | = | Identical in both |

## Common Use Cases

### 1. API Response Debugging
Compare the response you expected vs. what the server returned:
\`\`\`json
// Expected
{ "status": "active", "role": "admin" }

// Got
{ "status": "inactive", "role": "user" }
\`\`\`

### 2. Configuration Management
Track what changed between two versions of a config file.

### 3. Database Migration Validation
Verify that migrated records match source data exactly.

### 4. CI/CD Pipeline Checks
Automatically catch unexpected changes to API contracts.

## Programmatic JSON Diff

### JavaScript
\`\`\`javascript
import { diff } from 'deep-diff';

const left = { name: 'Alice', age: 30, roles: ['user'] };
const right = { name: 'Alice', age: 31, roles: ['user', 'admin'] };

const differences = diff(left, right);
// [
//   { kind: 'E', path: ['age'], lhs: 30, rhs: 31 },
//   { kind: 'A', path: ['roles'], index: 1, item: { kind: 'N', rhs: 'admin' } }
// ]
\`\`\`

### Python
\`\`\`python
import json
from deepdiff import DeepDiff

left = {"name": "Alice", "age": 30}
right = {"name": "Alice", "age": 31}

diff = DeepDiff(left, right, ignore_order=True)
# {'values_changed': {"root['age']": {'new_value': 31, 'old_value': 30}}}
\`\`\`

## JSON Merge vs JSON Patch

**JSON Merge Patch (RFC 7396)** — simpler:
\`\`\`json
PATCH /user/1
{ "age": 31 }
\`\`\`

**JSON Patch (RFC 6902)** — more precise:
\`\`\`json
PATCH /user/1
[
  { "op": "replace", "path": "/age", "value": 31 }
]
\`\`\`

JSON Patch captures the exact same operations that a JSON diff produces.

## Best Practices

1. **Normalize before diffing** — sort keys, format consistently
2. **Use semantic diff** — not text diff — for JSON
3. **Ignore volatile fields** — timestamps, request IDs, nonces
4. **Store diffs** — cheaper than storing full snapshots for audit logs

→ Try the [JSON Diff Tool](/json-diff)`);

ARTICLES.set('xml-formatter-guide', `## What Is XML Formatting?

XML (eXtensible Markup Language) is a text-based format for structured data. While JSON has replaced it in many modern APIs, XML remains dominant in enterprise systems, SOAP web services, configuration files (Maven, Android manifests), and document standards like DocBook and EPUB.

Formatted XML is dramatically easier to read. Compare:

**Minified:**
\`\`\`xml
<root><user id="1"><name>Alice</name><email>alice@example.com</email><roles><role>admin</role><role>user</role></roles></user></root>
\`\`\`

**Formatted:**
\`\`\`xml
<root>
  <user id="1">
    <name>Alice</name>
    <email>alice@example.com</email>
    <roles>
      <role>admin</role>
      <role>user</role>
    </roles>
  </user>
</root>
\`\`\`

## XML Structure

XML documents have strict structure rules:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Declaration above is recommended -->
<root>                          <!-- Single root element required -->
  <element attribute="value">  <!-- Attributes go inside the opening tag -->
    <child>text content</child> <!-- Text content inside tags -->
    <empty />                   <!-- Self-closing for empty elements -->
  </element>
</root>
\`\`\`

## Common XML Namespaces

\`\`\`xml
<!-- SOAP envelope -->
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <GetUser>
      <UserId>42</UserId>
    </GetUser>
  </soap:Body>
</soap:Envelope>
\`\`\`

## Validating XML

XML can be validated against a schema:

**XSD (XML Schema Definition):**
\`\`\`xml
<xs:element name="user">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="age" type="xs:integer" minOccurs="0"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:integer" use="required"/>
  </xs:complexType>
</xs:element>
\`\`\`

## Programmatic XML Formatting

### JavaScript (DOMParser)
\`\`\`javascript
function formatXML(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const serializer = new XMLSerializer();
  // Add indentation using XSLT or a formatting library
  return vkbeautify.xml(xml, 2);
}
\`\`\`

### Python
\`\`\`python
import xml.dom.minidom

def format_xml(xml_string):
    dom = xml.dom.minidom.parseString(xml_string)
    return dom.toprettyxml(indent="  ")
\`\`\`

### Command line (xmllint)
\`\`\`bash
xmllint --format input.xml > output.xml
\`\`\`

## XPATH — Querying XML

\`\`\`xpath
/root/user[@id='1']/name    → "Alice"
//role                       → All role elements anywhere
/root/user[last()]           → Last user element
count(//role)                → Number of role elements
\`\`\`

## XML vs JSON Comparison

| Feature | XML | JSON |
|---|---|---|
| Comments | ✅ Yes | ❌ No |
| Attributes | ✅ Yes | ❌ No (use keys) |
| Schema validation | ✅ XSD, DTD | ✅ JSON Schema |
| Namespaces | ✅ Yes | ❌ No |
| Size | Larger | Smaller |
| Readability | Moderate | Better |

→ Try the [XML Formatter Tool](/xml-formatter)`);

ARTICLES.set('yaml-viewer-guide', `## What Is YAML?

YAML (YAML Ain't Markup Language) is a human-friendly data serialization format. It's the dominant format for configuration files — used by Docker Compose, Kubernetes, GitHub Actions, Ansible, and countless other tools.

\`\`\`yaml
# A typical Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
\`\`\`

## YAML Syntax Quick Reference

### Scalars
\`\`\`yaml
string: Hello World
quoted: "Has: colon"
integer: 42
float: 3.14
boolean: true          # or false, yes, no, on, off
null_value: ~          # or null
multiline: |           # Literal block (preserves newlines)
  Line 1
  Line 2
folded: >              # Folded block (newlines become spaces)
  This is a long
  sentence on one line
\`\`\`

### Sequences (Arrays)
\`\`\`yaml
# Block style
fruits:
  - apple
  - banana
  - cherry

# Flow style
fruits: [apple, banana, cherry]
\`\`\`

### Mappings (Objects)
\`\`\`yaml
# Block style
user:
  name: Alice
  age: 30

# Flow style
user: {name: Alice, age: 30}
\`\`\`

### Anchors & Aliases (DRY YAML)
\`\`\`yaml
defaults: &defaults
  image: ubuntu:22.04
  timeout: 30

dev:
  <<: *defaults          # Merge defaults
  environment: development

prod:
  <<: *defaults
  environment: production
  timeout: 60            # Override
\`\`\`

## Common YAML Gotchas

| Problem | Example | Fix |
|---|---|---|
| Unquoted special chars | \`value: yes\` parsed as boolean | Quote: \`value: "yes"\` |
| Tabs not allowed | Using tab indentation | Use spaces only |
| Trailing spaces | \`key: value  \` | Remove trailing whitespace |
| Norway problem | \`NO\` parsed as false | Quote country codes |
| Octal numbers | \`0755\` parsed as octal | Quote: \`"0755"\` |

## YAML in CI/CD

### GitHub Actions
\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
\`\`\`

## Converting YAML Programmatically

### JavaScript
\`\`\`javascript
import yaml from 'js-yaml';

const obj = yaml.load(yamlString);
const back = yaml.dump(obj, { indent: 2, lineWidth: 80 });
\`\`\`

### Python
\`\`\`python
import yaml

obj = yaml.safe_load(yaml_string)
back = yaml.dump(obj, default_flow_style=False, indent=2)
\`\`\`

→ Try the [YAML Viewer Tool](/yaml-viewer)`);

// ══════════════════════════════════════════════════════
// WEB CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('url-encoding-explained', `## What Is URL Encoding?

URL encoding (also called percent-encoding) converts characters that are unsafe or reserved in URLs into a \`%XX\` format where XX is the hexadecimal ASCII code. This ensures URLs are valid across all systems and browsers.

\`\`\`
Original:  Hello World & more=stuff/here?
Encoded:   Hello%20World%20%26%20more%3Dstuff%2Fhere%3F
\`\`\`

## Why URL Encoding Is Necessary

URLs can only contain a limited set of ASCII characters. Characters outside this set — including spaces, non-English letters, and special symbols — must be encoded to avoid ambiguity.

**Reserved characters have special meaning in URLs:**
| Character | URL Meaning | Encoded |
|---|---|---|
| \`?\` | Start of query string | \`%3F\` |
| \`&\` | Parameter separator | \`%26\` |
| \`=\` | Key-value separator | \`%3D\` |
| \`#\` | Fragment identifier | \`%23\` |
| \`/\` | Path separator | \`%2F\` |
| \`+\` | Space (form encoding) | \`%2B\` |

**Unreserved characters never need encoding:**
Letters (A-Z, a-z), digits (0-9), and \`-_.~\`

## application/x-www-form-urlencoded vs Percent-Encoding

There are two slightly different URL encoding schemes:

**Percent-encoding (RFC 3986):** used in URL paths
- Space → \`%20\`

**Form encoding (HTML forms):** used in form submissions
- Space → \`+\`
- Otherwise same as percent-encoding

\`\`\`javascript
encodeURIComponent('hello world')  // "hello%20world"
encodeURI('https://example.com/path with spaces')  // encodes only unsafe chars
\`\`\`

## JavaScript URL Encoding

\`\`\`javascript
// Encode a value (encodes everything except unreserved chars)
const encoded = encodeURIComponent('name=John & age=30');
// "name%3DJohn%20%26%20age%3D30"

// Decode
const decoded = decodeURIComponent('name%3DJohn%20%26%20age%3D30');
// "name=John & age=30"

// Build query strings safely
const params = new URLSearchParams({
  name: 'John Doe',
  city: 'New York',
  query: 'hello & goodbye'
});
const url = \`https://api.example.com/search?\${params}\`;
\`\`\`

## Common Encoding Mistakes

### 1. Double Encoding
\`\`\`javascript
// Wrong: encodes an already-encoded string
encodeURIComponent('hello%20world')  // "hello%2520world" ❌

// Right: decode first if already encoded
decodeURIComponent('hello%20world')  // "hello world"
encodeURIComponent('hello world')    // "hello%20world" ✅
\`\`\`

### 2. Using encodeURI Instead of encodeURIComponent
\`\`\`javascript
// encodeURI skips /?#& — NOT safe for values
encodeURI('a=1&b=2')           // "a=1&b=2" (unchanged!) ❌

// encodeURIComponent encodes everything — safe for values
encodeURIComponent('a=1&b=2')  // "a%3D1%26b%3D2" ✅
\`\`\`

## Python URL Encoding

\`\`\`python
from urllib.parse import quote, urlencode, urljoin

# Encode a path segment
quote('hello world/path')          # 'hello%20world%2Fpath'

# Build query string
urlencode({'name': 'John Doe', 'age': 30})  # 'name=John+Doe&age=30'

# Safe for building complete URLs
urljoin('https://api.example.com', '/users')
\`\`\`

## Security Considerations

- **Path traversal**: Attackers may use \`%2F\` or \`%2E%2E\` to traverse directories. Always decode and normalize paths before security checks.
- **SQL injection**: URL decoding happens before your code receives parameters. Always use parameterized queries.
- **Double decoding**: Never decode twice; decode once and validate.

→ Try the [URL Encoder Tool](/url-encoder)`);

ARTICLES.set('http-status-codes-complete-guide', `## HTTP Status Codes: The Complete Reference

Every HTTP response carries a 3-digit status code that tells the client what happened. Understanding these codes is essential for debugging, building APIs, and interpreting server behavior.

## Status Code Categories

| Range | Category | Meaning |
|---|---|---|
| 1xx | Informational | Request received, processing continues |
| 2xx | Success | Request successfully processed |
| 3xx | Redirection | Further action required |
| 4xx | Client Error | Bad request from client |
| 5xx | Server Error | Server failed to fulfill valid request |

## 2xx Success

| Code | Name | When to Use |
|---|---|---|
| 200 | OK | Standard success response |
| 201 | Created | Resource created (POST/PUT) |
| 202 | Accepted | Async processing started |
| 204 | No Content | Success with no response body |
| 206 | Partial Content | Range request (video streaming) |

\`\`\`http
HTTP/1.1 201 Created
Location: /api/users/42
Content-Type: application/json

{"id": 42, "name": "Alice"}
\`\`\`

## 3xx Redirection

| Code | Name | When to Use |
|---|---|---|
| 301 | Moved Permanently | URL permanently changed (SEO-safe) |
| 302 | Found | Temporary redirect |
| 303 | See Other | POST → GET redirect after form submit |
| 304 | Not Modified | Cached response still valid |
| 307 | Temporary Redirect | Temporary, preserves HTTP method |
| 308 | Permanent Redirect | Permanent, preserves HTTP method |

**301 vs 302 for SEO:**
- 301: Search engines transfer link equity to new URL
- 302: Search engines keep the old URL indexed

## 4xx Client Errors

| Code | Name | Common Cause |
|---|---|---|
| 400 | Bad Request | Malformed JSON, missing required field |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | DELETE on a read-only endpoint |
| 409 | Conflict | Duplicate email, version conflict |
| 410 | Gone | Resource permanently deleted |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |

**401 vs 403:**
\`\`\`
401: "Who are you?" → Send credentials
403: "I know who you are, but no." → Elevate permissions
\`\`\`

## 5xx Server Errors

| Code | Name | Common Cause |
|---|---|---|
| 500 | Internal Server Error | Unhandled exception |
| 501 | Not Implemented | Feature not yet built |
| 502 | Bad Gateway | Upstream server returned invalid response |
| 503 | Service Unavailable | Server overloaded or down for maintenance |
| 504 | Gateway Timeout | Upstream didn't respond in time |

## REST API Design Guidelines

\`\`\`
GET /users       → 200 OK (list)
POST /users      → 201 Created (new user)
GET /users/99    → 404 Not Found (missing)
PUT /users/1     → 200 OK (updated)
DELETE /users/1  → 204 No Content (deleted)
\`\`\`

## Implementing Proper Status Codes

### Express.js
\`\`\`javascript
app.post('/users', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const exists = await db.findByEmail(email);
  if (exists) return res.status(409).json({ error: 'Email taken' });
  
  const user = await db.createUser(req.body);
  res.status(201).json(user);
});
\`\`\`

### Handling Errors on the Client
\`\`\`javascript
const response = await fetch('/api/users/1');
if (response.status === 404) {
  showNotFound();
} else if (response.status === 401) {
  redirectToLogin();
} else if (!response.ok) {
  showGenericError(response.status);
}
\`\`\`

→ Try the [HTTP Status Codes Tool](/http-status-codes)`);

ARTICLES.set('crontab-generator-guide', `## What Is Cron?

Cron is the Unix task scheduler. It runs commands on a recurring schedule, defined in a crontab (cron table) file. From database backups to report generation, cron powers the automation backbone of millions of servers.

## Cron Expression Syntax

\`\`\`
┌─────────── minute (0-59)
│ ┌───────── hour (0-23)
│ │ ┌─────── day of month (1-31)
│ │ │ ┌───── month (1-12 or JAN-DEC)
│ │ │ │ ┌─── day of week (0-7 or SUN-SAT, 0 and 7 are Sunday)
│ │ │ │ │
* * * * *  command to execute
\`\`\`

## Common Patterns

| Expression | Meaning |
|---|---|
| \`* * * * *\` | Every minute |
| \`0 * * * *\` | Every hour |
| \`0 0 * * *\` | Daily at midnight |
| \`0 9 * * 1-5\` | Weekdays at 9am |
| \`0 0 * * 0\` | Weekly on Sunday |
| \`0 0 1 * *\` | Monthly on the 1st |
| \`0 0 1 1 *\` | Annually on Jan 1st |
| \`*/5 * * * *\` | Every 5 minutes |
| \`0 9-17 * * 1-5\` | Every hour 9am-5pm on weekdays |

## Special Strings

Most cron implementations support shortcuts:

\`\`\`
@yearly    →  0 0 1 1 *
@monthly   →  0 0 1 * *
@weekly    →  0 0 * * 0
@daily     →  0 0 * * *
@hourly    →  0 * * * *
@reboot    →  runs once at system startup
\`\`\`

## Managing Crontabs

\`\`\`bash
# Edit current user's crontab
crontab -e

# List crontabs
crontab -l

# Delete crontab
crontab -r

# Edit another user's crontab (root)
crontab -u www-data -e

# System-wide cron files
cat /etc/crontab           # System crontab (has username field)
ls /etc/cron.d/            # Drop-in cron files
ls /etc/cron.daily/        # Daily scripts
\`\`\`

## Example Crontab

\`\`\`bash
# Backup database every day at 2am
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1

# Clear temp files every Sunday at 3am
0 3 * * 0 find /tmp -mtime +7 -delete

# Send daily report at 9am Mon-Fri
0 9 * * 1-5 /opt/scripts/daily-report.py

# Health check every 5 minutes
*/5 * * * * curl -f https://mysite.com/health || notify-admin.sh

# First day of every month: generate invoice
0 0 1 * * /opt/billing/generate-invoices.sh
\`\`\`

## Debugging Cron Jobs

\`\`\`bash
# Check cron service
systemctl status cron    # Debian/Ubuntu
systemctl status crond   # CentOS/RHEL

# View cron logs
grep CRON /var/log/syslog        # Ubuntu
grep CRON /var/log/cron          # CentOS

# Test script manually (same env as cron)
env -i HOME=/root SHELL=/bin/bash PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin /usr/local/bin/my-script.sh
\`\`\`

## Common Cron Pitfalls

1. **Environment**: Cron runs with minimal PATH. Use absolute paths: \`/usr/bin/python3\` not \`python3\`
2. **Percent signs**: \`%\` means newline in crontab. Escape as \`\\%\`
3. **No output capture**: Jobs run silently by default. Redirect output: \`>> /var/log/job.log 2>&1\`
4. **Timezone**: Cron uses the system timezone. Check with \`timedatectl\`
5. **File permissions**: Script must be executable: \`chmod +x script.sh\`

## Modern Alternatives

| Tool | Use Case |
|---|---|
| Systemd timers | Modern Linux (more reliable than cron) |
| Kubernetes CronJob | Container-based scheduled tasks |
| GitHub Actions schedule | CI/CD with \`on: schedule\` |
| AWS EventBridge | Cloud-native scheduling |

→ Try the [Crontab Generator Tool](/crontab-generator)`);

ARTICLES.set('regex-tester-guide', `## What Is a Regular Expression?

A regular expression (regex) is a sequence of characters that defines a search pattern. Regex lets you match, extract, replace, and validate text with surgical precision.

\`\`\`javascript
// Find all email addresses in text
const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);
\`\`\`

## Regex Syntax Fundamentals

### Character Classes
\`\`\`
[abc]       Match a, b, or c
[a-z]       Match any lowercase letter
[0-9]       Match any digit
[^abc]      Match anything except a, b, c
.           Match any character except newline
\`\`\`

### Shorthand Classes
\`\`\`
\\d          Digit [0-9]
\\D          Non-digit
\\w          Word char [a-zA-Z0-9_]
\\W          Non-word char
\\s          Whitespace (space, tab, newline)
\\S          Non-whitespace
\`\`\`

### Quantifiers
\`\`\`
*           0 or more
+           1 or more
?           0 or 1 (optional)
{3}         Exactly 3
{2,5}       Between 2 and 5
{2,}        2 or more
*?          Lazy (non-greedy) version
\`\`\`

### Anchors & Boundaries
\`\`\`
^           Start of string (or line with m flag)
$           End of string (or line with m flag)
\\b          Word boundary
\\B          Non-word boundary
(?=...)     Lookahead
(?!...)     Negative lookahead
(?<=...)    Lookbehind
(?<!...)    Negative lookbehind
\`\`\`

### Groups & Alternation
\`\`\`
(abc)       Capture group
(?:abc)     Non-capturing group
(?<name>)   Named capture group
a|b         Match a or b
\`\`\`

## Practical Regex Patterns

### Email Validation
\`\`\`regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
\`\`\`

### URL Matching
\`\`\`regex
https?://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?
\`\`\`

### IPv4 Address
\`\`\`regex
^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$
\`\`\`

### Date (YYYY-MM-DD)
\`\`\`regex
^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$
\`\`\`

### Strong Password
\`\`\`regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$
\`\`\`

## Using Regex in Code

### JavaScript
\`\`\`javascript
const re = /^\\d{4}-\\d{2}-\\d{2}$/;

// Test
re.test('2024-01-15')  // true

// Match
'2024-01-15'.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/)
// ["2024-01-15", "2024", "01", "15"]

// Named groups
const { groups: { year, month } } = '2024-01-15'.match(
  /^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/
);

// Replace
'Hello World'.replace(/World/, 'Regex')  // "Hello Regex"

// Split
'one,two,,four'.split(/,+/)  // ["one", "two", "four"]
\`\`\`

### Python
\`\`\`python
import re

pattern = r'^(\\d{4})-(\\d{2})-(\\d{2})$'

# Match
m = re.match(pattern, '2024-01-15')
year, month, day = m.groups()

# Find all
emails = re.findall(r'[\\w.+-]+@[\\w-]+\\.[\\w.]+', text)

# Replace
clean = re.sub(r'\\s+', ' ', messy_text)
\`\`\`

## Regex Flags

| Flag | JS | Python | Meaning |
|---|---|---|---|
| Case insensitive | \`/i\` | \`re.I\` | Match regardless of case |
| Multiline | \`/m\` | \`re.M\` | ^ and $ match line boundaries |
| Dotall | \`/s\` | \`re.S\` | . matches newlines |
| Global | \`/g\` | (findall) | Find all matches |

→ Try the [Regex Tester Tool](/regex-tester)`);

ARTICLES.set('url-parser-guide', `## What Does a URL Parser Do?

A URL parser breaks down a URL into its individual components, making it easy to extract and manipulate specific parts. Understanding URL structure is fundamental for web development, API integration, and security analysis.

## URL Anatomy

\`\`\`
https://user:pass@www.example.com:8080/path/to/page?key=value&q=hello#section2
  │      │    │    │               │    │             │                 │
scheme  user pass  hostname       port  path          query            fragment
\`\`\`

| Component | Example | Description |
|---|---|---|
| Protocol/Scheme | \`https\` | Communication protocol |
| Username | \`user\` | Optional HTTP auth |
| Password | \`pass\` | Optional HTTP auth |
| Hostname | \`www.example.com\` | Domain or IP |
| Port | \`8080\` | Default: 80/443 |
| Path | \`/path/to/page\` | Resource location |
| Query string | \`?key=value\` | Parameters |
| Fragment | \`#section2\` | Client-side anchor |

## Parsing URLs in JavaScript

The built-in \`URL\` class is the modern standard:

\`\`\`javascript
const url = new URL('https://example.com:8080/path?q=hello&page=2#top');

url.protocol   // "https:"
url.hostname   // "example.com"
url.port       // "8080"
url.pathname   // "/path"
url.search     // "?q=hello&page=2"
url.hash       // "#top"

// Working with query params
url.searchParams.get('q')       // "hello"
url.searchParams.get('page')    // "2"
url.searchParams.set('page', 3)
url.searchParams.append('sort', 'asc')
url.toString()   // Updated URL string
\`\`\`

## Parsing URLs in Python

\`\`\`python
from urllib.parse import urlparse, parse_qs, urlencode

url = 'https://example.com:8080/path?q=hello&page=2#top'
parts = urlparse(url)

parts.scheme    # 'https'
parts.netloc    # 'example.com:8080'
parts.hostname  # 'example.com'
parts.port      # 8080
parts.path      # '/path'
parts.query     # 'q=hello&page=2'
parts.fragment  # 'top'

# Parse query string
params = parse_qs(parts.query)
# {'q': ['hello'], 'page': ['2']}

# Rebuild URL
from urllib.parse import urlunparse
new_url = urlunparse(parts._replace(fragment=''))
\`\`\`

## Common URL Patterns

### REST API URLs
\`\`\`
GET    /api/users              → List users
GET    /api/users/42           → Get user 42
POST   /api/users              → Create user
PUT    /api/users/42           → Replace user 42
PATCH  /api/users/42           → Update user 42
DELETE /api/users/42           → Delete user 42
GET    /api/users/42/orders    → User's orders
\`\`\`

### URL Normalization
\`\`\`javascript
function normalizeUrl(urlStr) {
  const url = new URL(urlStr);
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\\/+$/, '') || '/';
  url.searchParams.sort();
  return url.toString();
}

normalizeUrl('HTTPS://Example.COM/path/?b=2&a=1#')
// "https://example.com/path?a=1&b=2"
\`\`\`

## Security Considerations

### Open Redirect Prevention
\`\`\`javascript
function isSafeRedirect(url, allowedOrigins) {
  try {
    const parsed = new URL(url, window.location.origin);
    return allowedOrigins.includes(parsed.origin);
  } catch {
    return false;  // Invalid URL
  }
}
\`\`\`

### SSRF Prevention (Server-Side)
\`\`\`javascript
function isPublicUrl(urlStr) {
  const url = new URL(urlStr);
  const privateRanges = ['localhost', '127.', '10.', '192.168.', '169.254.'];
  return !privateRanges.some(range => url.hostname.startsWith(range));
}
\`\`\`

→ Try the [URL Parser Tool](/url-parser)`);

ARTICLES.set('meta-tag-generator-guide', `## What Are Meta Tags?

Meta tags are HTML elements that provide metadata about your web page — information consumed by search engines, social platforms, and browsers rather than displayed to visitors. Getting meta tags right is one of the most impactful quick wins in SEO.

\`\`\`html
<head>
  <title>Best Coffee in Seattle | Morning Grind Café</title>
  <meta name="description" content="Visit Morning Grind Café for artisan espresso...">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="Best Coffee in Seattle">
  <meta property="og:image" content="https://example.com/coffee.jpg">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
</head>
\`\`\`

## The Most Important Meta Tags for SEO

### Title Tag
The most important on-page SEO element:
- **Length**: 50–60 characters
- **Format**: Primary Keyword | Brand Name
- Appears as the clickable headline in search results

\`\`\`html
<title>CSS Grid Layout Tutorial | CSS-Tricks</title>
\`\`\`

### Meta Description
The snippet under your title in search results:
- **Length**: 150–160 characters
- Include a call-to-action
- Not a direct ranking factor, but affects click-through rate

\`\`\`html
<meta name="description" content="Learn CSS Grid layout from scratch. Includes
interactive examples, browser support tables, and real-world project templates.">
\`\`\`

### Robots Meta Tag
Controls crawling and indexing:
\`\`\`html
<meta name="robots" content="index, follow">       <!-- Default -->
<meta name="robots" content="noindex, nofollow">   <!-- Exclude from search -->
<meta name="robots" content="noindex, follow">     <!-- Follow links but don't index -->
<meta name="robots" content="index, noarchive">    <!-- No cached version -->
\`\`\`

## Open Graph Protocol

Open Graph makes your links look great when shared on Facebook, LinkedIn, Slack, etc.

\`\`\`html
<meta property="og:type" content="article">
<meta property="og:url" content="https://example.com/blog/post">
<meta property="og:title" content="10 CSS Tips You Should Know">
<meta property="og:description" content="Practical CSS techniques...">
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="My Dev Blog">
\`\`\`

**Recommended OG image size**: 1200×630px

## Twitter Cards

\`\`\`html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourtwitterhandle">
<meta name="twitter:title" content="10 CSS Tips">
<meta name="twitter:description" content="Practical CSS techniques...">
<meta name="twitter:image" content="https://example.com/twitter-card.jpg">
\`\`\`

Card types: \`summary\`, \`summary_large_image\`, \`app\`, \`player\`

## Technical Meta Tags

\`\`\`html
<!-- Viewport for mobile responsiveness -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Character encoding -->
<meta charset="UTF-8">

<!-- Language -->
<meta property="og:locale" content="en_US">
<link rel="alternate" hreflang="fr" href="https://fr.example.com/">

<!-- Canonical URL (prevent duplicate content) -->
<link rel="canonical" href="https://example.com/blog/post/">

<!-- Theme color for mobile browsers -->
<meta name="theme-color" content="#3B82F6">
\`\`\`

## Verification Meta Tags

\`\`\`html
<!-- Google Search Console -->
<meta name="google-site-verification" content="abc123...">

<!-- Bing Webmaster Tools -->
<meta name="msvalidate.01" content="abc123...">
\`\`\`

## Testing Your Meta Tags

1. **Google Search Console** — Preview snippets in search results
2. **Facebook Sharing Debugger** — [developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
3. **Twitter Card Validator** — [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
4. **LinkedIn Post Inspector** — [linkedin.com/post-inspector/](https://www.linkedin.com/post-inspector/)

→ Try the [Meta Tag Generator Tool](/meta-tag-generator)`);

// ══════════════════════════════════════════════════════
// NETWORK CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('ipv4-subnet-calculator-guide', `## What Is IPv4 Subnetting?

Subnetting divides a large IP network into smaller, more manageable sub-networks (subnets). It improves performance, security, and address efficiency. Every network engineer and DevOps professional needs to understand subnetting.

## IP Address Basics

An IPv4 address is 32 bits, written in dotted-decimal:
\`\`\`
192.168.1.100
│   │   │ │
│   │   │ └── Host part (varies)
│   │   └──── Network part (varies)
└───┴──────── Depends on subnet mask
\`\`\`

## Subnet Masks and CIDR Notation

A subnet mask separates the network and host portions:

| CIDR | Subnet Mask | Hosts per Subnet |
|---|---|---|
| /8 | 255.0.0.0 | 16,777,214 |
| /16 | 255.255.0.0 | 65,534 |
| /24 | 255.255.255.0 | 254 |
| /25 | 255.255.255.128 | 126 |
| /26 | 255.255.255.192 | 62 |
| /27 | 255.255.255.224 | 30 |
| /28 | 255.255.255.240 | 14 |
| /30 | 255.255.255.252 | 2 |

Formula: **Hosts = 2^(32-prefix) - 2**  
(subtract 2 for network address and broadcast address)

## Calculating a Subnet

For **192.168.1.0/26**:

\`\`\`
IP:      192.168.1.0   = 11000000.10101000.00000001.00000000
Mask:    /26           = 11111111.11111111.11111111.11000000

Network address:       192.168.1.0
First usable host:     192.168.1.1
Last usable host:      192.168.1.62
Broadcast address:     192.168.1.63
Usable hosts:          62
\`\`\`

## Subnetting a Network

Divide **192.168.10.0/24** into 4 equal subnets:

\`\`\`
New prefix: /26 (borrows 2 bits, 2² = 4 subnets)

Subnet 1:  192.168.10.0/26    (hosts: .1 – .62)
Subnet 2:  192.168.10.64/26   (hosts: .65 – .126)
Subnet 3:  192.168.10.128/26  (hosts: .129 – .190)
Subnet 4:  192.168.10.192/26  (hosts: .193 – .254)
\`\`\`

## Private Address Ranges (RFC 1918)

| Range | CIDR | Common Use |
|---|---|---|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Large enterprise |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Medium networks |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Home/small office |

## Special Addresses

\`\`\`
127.0.0.0/8         Loopback (localhost)
169.254.0.0/16      Link-local (APIPA)
0.0.0.0/0           Default route
255.255.255.255     Limited broadcast
\`\`\`

## Practical Subnetting

### AWS VPC Example
\`\`\`
VPC:               10.0.0.0/16
Public Subnet 1:   10.0.1.0/24   (us-east-1a)
Public Subnet 2:   10.0.2.0/24   (us-east-1b)
Private Subnet 1:  10.0.10.0/24  (us-east-1a)
Private Subnet 2:  10.0.11.0/24  (us-east-1b)
Database Subnet:   10.0.20.0/24  (isolated)
\`\`\`

→ Try the [IPv4 Subnet Calculator Tool](/ipv4-subnet-calculator)`);

ARTICLES.set('mac-address-guide', `## What Is a MAC Address?

A MAC (Media Access Control) address is a unique identifier assigned to a network interface card (NIC). It operates at Layer 2 (Data Link) of the OSI model and is used for communication within a local network segment.

\`\`\`
Format:  AA:BB:CC:DD:EE:FF
         │           │
         └── OUI     └── NIC specific
         (Organizationally Unique Identifier)
\`\`\`

## MAC Address Structure

A MAC address is 48 bits (6 bytes), written as six pairs of hexadecimal digits:

- **First 3 bytes (OUI)**: Assigned to manufacturers by the IEEE. Identifies the vendor.
- **Last 3 bytes**: Assigned by the manufacturer to individual devices.

\`\`\`
00:1A:2B:3C:4D:5E
│  └─ OUI ─┘ └────── Device ID ─────┘
└── Special bits (bit 0: multicast, bit 1: locally administered)
\`\`\`

## Notation Variants

| Format | Example | Used By |
|---|---|---|
| Colon-separated | \`00:1A:2B:3C:4D:5E\` | Linux, macOS |
| Dash-separated | \`00-1A-2B-3C-4D-5E\` | Windows |
| Dot-separated | \`001A.2B3C.4D5E\` | Cisco IOS |
| No separator | \`001A2B3C4D5E\` | Some databases |

## Special MAC Addresses

| Address | Meaning |
|---|---|
| \`FF:FF:FF:FF:FF:FF\` | Broadcast (all devices) |
| \`01:00:5E:xx:xx:xx\` | IPv4 multicast |
| \`33:33:xx:xx:xx:xx\` | IPv6 multicast |
| Second bit = 1 | Locally administered (random/spoofed) |
| First bit = 1 | Multicast address |

## Finding Your MAC Address

\`\`\`bash
# Linux
ip link show
ip addr show eth0 | grep ether

# macOS
ifconfig en0 | grep ether
networksetup -getmacaddress Wi-Fi

# Windows
ipconfig /all
getmac /v
\`\`\`

## MAC Address Lookup (OUI)

The OUI database maps vendor prefixes to manufacturer names:

\`\`\`
00:1A:2B → Intel Corporation
DC:A6:32 → Raspberry Pi Foundation
F8:FF:C2 → Apple, Inc.
00:50:56 → VMware, Inc.
\`\`\`

## ARP — How MAC Addresses Are Used

When your computer wants to communicate with 192.168.1.5:

1. Broadcasts ARP request: "Who has 192.168.1.5? Tell 192.168.1.1"
2. Device 192.168.1.5 replies with its MAC address
3. Sender caches the MAC → IP mapping
4. Subsequent packets go directly to that MAC

\`\`\`bash
# View ARP cache
arp -a       # macOS/Linux
arp -g       # Windows

# Clear ARP cache (Linux)
ip neigh flush all
\`\`\`

## MAC Address Randomization

Modern devices randomize MAC addresses for privacy. iOS 14+, Android 10+, and Windows 10+ use random MACs for Wi-Fi scanning and can optionally use them for connections.

This prevents tracking across networks but can affect:
- Network access control (NAC) systems
- DHCP reservations based on MAC
- Parental controls and firewall rules

→ Try the [MAC Address Generator Tool](/mac-address-generator) | [MAC Address Lookup Tool](/mac-address-lookup)`);

ARTICLES.set('ipv4-range-expander-guide', `## What Is an IPv4 Range?

An IPv4 range defines a consecutive block of IP addresses. Network engineers use ranges to configure firewalls, define ACLs, allocate DHCP pools, and plan network topology.

## CIDR vs Range Notation

Two common ways to express IP address blocks:

**CIDR (Classless Inter-Domain Routing):**
\`\`\`
192.168.1.0/24    → 192.168.1.0 to 192.168.1.255
10.0.0.0/8        → 10.0.0.0 to 10.255.255.255
\`\`\`

**Range notation:**
\`\`\`
192.168.1.1 - 192.168.1.100
\`\`\`

The IPv4 Range Expander converts between these formats, and lists all individual IPs in a range.

## Converting Range to CIDR

Not all IP ranges map cleanly to a single CIDR block. For example:
\`\`\`
192.168.1.0 - 192.168.1.100
→ Requires multiple CIDR blocks:
  192.168.1.0/25    (0-127)   covers 0-100 partly
  Actually: 192.168.1.0/26   + 192.168.1.64/27 + 192.168.1.96/30
\`\`\`

Tools like this calculator find the minimal CIDR representation.

## Firewall Rule Examples

### AWS Security Group
\`\`\`json
{
  "IpPermissions": [{
    "IpProtocol": "tcp",
    "FromPort": 443,
    "ToPort": 443,
    "IpRanges": [
      {"CidrIp": "203.0.113.0/24", "Description": "Office network"},
      {"CidrIp": "198.51.100.0/26", "Description": "Partner VPN"}
    ]
  }]
}
\`\`\`

### nginx allow/deny
\`\`\`nginx
location /admin {
  allow 10.0.0.0/8;       # Private network
  allow 203.0.113.42/32;  # Specific IP
  deny all;
}
\`\`\`

## Calculating Range Size

\`\`\`python
import ipaddress

# Count IPs in a range
start = ipaddress.IPv4Address('192.168.1.0')
end = ipaddress.IPv4Address('192.168.1.255')
count = int(end) - int(start) + 1  # 256

# Expand CIDR
network = ipaddress.IPv4Network('192.168.1.0/28')
list(network.hosts())  # All 14 usable hosts

# Summarize range as CIDR blocks
list(ipaddress.summarize_address_range(start, end))
# [IPv4Network('192.168.1.0/24')]
\`\`\`

→ Try the [IPv4 Range Expander Tool](/ipv4-range-expander)`);

ARTICLES.set('ipv4-address-converter-guide', `## IPv4 Address Formats

An IPv4 address can be represented in multiple formats. While humans read dotted-decimal, computers work with binary or integer representations. Understanding these conversions is useful for networking, database storage, and low-level programming.

## The Four Representations

\`\`\`
Dotted-decimal:  192.168.1.100
Binary:          11000000.10101000.00000001.01100100
Hexadecimal:     C0.A8.01.64  or  0xC0A80164
Integer:         3232235876
\`\`\`

## Converting Between Formats

### Dotted-Decimal → Integer
\`\`\`
192.168.1.100

192 × 16777216 = 3221225472
168 × 65536    =   11010048
  1 × 256      =        256
100 × 1        =        100
─────────────────────────────
Total          = 3232235876
\`\`\`

### Integer → Dotted-Decimal
\`\`\`
3232235876 in binary = 11000000 10101000 00000001 01100100
Split into 4 bytes:    192      168       1       100
\`\`\`

## Code Examples

### JavaScript
\`\`\`javascript
// Dotted-decimal to integer
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet), 0) >>> 0;
}

// Integer to dotted-decimal
function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

ipToInt('192.168.1.100')   // 3232235876
intToIp(3232235876)        // "192.168.1.100"
\`\`\`

### Python
\`\`\`python
import ipaddress

ip = ipaddress.IPv4Address('192.168.1.100')
int(ip)                # 3232235876
hex(int(ip))           # '0xc0a80164'
bin(int(ip))           # '0b11000000...'

# Back to dotted-decimal
str(ipaddress.IPv4Address(3232235876))  # '192.168.1.100'
\`\`\`

## Why Store IPs as Integers?

- **Database efficiency**: 4 bytes integer vs 15 bytes string
- **Range queries**: Easily check if IP is in a range using \`BETWEEN\`
- **Sorting**: Integer sort is natural order

\`\`\`sql
-- Find all IPs in subnet 192.168.1.0/24
SELECT * FROM access_log
WHERE ip_int BETWEEN 3232235776 AND 3232236031;
\`\`\`

→ Try the [IPv4 Address Converter Tool](/ipv4-address-converter)`);

ARTICLES.set('ipv6-ula-generator-guide', `## What Is IPv6 ULA?

A Unique Local Address (ULA) is the IPv6 equivalent of private IPv4 addresses (10.x.x.x, 192.168.x.x). ULAs are used for local communications within a site or organization and are not routable on the public internet.

## ULA Address Format

\`\`\`
fd00::/8 (ULA range)

fd00:abcd:1234:5678::/64
│   │              │
│   └── 40-bit     └── 64-bit interface identifier
│       Global ID
└── fd prefix (locally assigned ULA)
\`\`\`

ULAs always begin with \`fd\` (binary: 11111101).

## ULA vs GUA vs Link-Local

| Type | Prefix | Scope | Routable |
|---|---|---|---|
| Link-local | fe80::/10 | Single link | No |
| ULA | fc00::/7 (fd00::/8) | Organization | No |
| GUA | 2000::/3 | Global | Yes |

## Why Use ULA?

1. **Stable internal addressing** — Unlike SLAAC addresses that may change, ULAs are predictable
2. **No ISP dependency** — Works even if you change internet providers
3. **Privacy** — Internal services not accidentally exposed
4. **Always available** — No internet connection required

## Generating a ULA Prefix

ULA Global IDs should be pseudo-random (per RFC 4193):

1. Take current timestamp in NTP format
2. Concatenate with EUI-64 system identifier
3. Compute SHA-1 of the above
4. Use the last 40 bits as the Global ID

\`\`\`bash
# Generate random ULA (OpenBSD/Linux)
python3 -c "
import os, struct
random_bytes = os.urandom(5)
ula = 'fd{:02x}{:02x}:{:02x}{:02x}:{:02x}00::/48'.format(*random_bytes)
print(ula)
"
# Example output: fd3a:7c9b:e102::/48
\`\`\`

## Configuring ULA on Linux

\`\`\`bash
# Add ULA address
ip addr add fd3a:7c9b:e102::1/48 dev eth0

# Add to /etc/network/interfaces (persistent)
iface eth0 inet6 static
  address fd3a:7c9b:e102::1
  netmask 48
\`\`\`

## ULA in Docker/Kubernetes

\`\`\`yaml
# Docker network with ULA
networks:
  internal:
    driver: bridge
    enable_ipv6: true
    ipam:
      config:
        - subnet: fd00:dead:beef::/48
\`\`\`

→ Try the [IPv6 ULA Generator Tool](/ipv6-ula-generator)`);

ARTICLES.set('mac-address-lookup-guide', `## How Does MAC Address Lookup Work?

MAC address lookup queries the IEEE OUI (Organizationally Unique Identifier) database to identify the manufacturer of a network device based on the first three bytes of its MAC address.

## The OUI Registry

The IEEE assigns 24-bit OUI blocks to organizations. The first 3 octets of every MAC address identify the manufacturer:

\`\`\`
MAC:  DC:A6:32:AB:CD:EF
       ┌────┘
       DC:A6:32 → Raspberry Pi Foundation
\`\`\`

## Common Vendor Prefixes

| OUI | Vendor |
|---|---|
| 00:50:56 | VMware |
| 08:00:27 | VirtualBox |
| DC:A6:32 | Raspberry Pi Foundation |
| B8:27:EB | Raspberry Pi (older) |
| 00:0C:29 | VMware (another range) |
| F8:FF:C2 | Apple |
| 00:1A:2B | Intel |
| 44:38:39 | Cumulus Networks |

## Use Cases

### Network Security
Identify unauthorized devices on your network:
\`\`\`bash
# Scan local network for MAC addresses
nmap -sn 192.168.1.0/24 -oX scan.xml
# Then look up each MAC in OUI database
\`\`\`

### Asset Inventory
Automatically categorize devices by type:
- \`DC:A6:32\` → Raspberry Pi (IoT)
- \`00:50:56\` → Virtual machine
- \`F8:FF:C2\` → Apple device

### Forensics & Incident Response
Determine what type of device made a network connection.

## Programmatic OUI Lookup

\`\`\`javascript
async function lookupMAC(mac) {
  const oui = mac.replace(/[:-]/g, '').substring(0, 6).toUpperCase();
  const response = await fetch(\`https://api.macvendors.com/\${mac}\`);
  return response.text();
}

lookupMAC('DC:A6:32:AB:CD:EF')  // "Raspberry Pi Foundation"
\`\`\`

### Local Database Lookup (Python)
\`\`\`python
from manuf import manuf

p = manuf.MacParser()
p.get_manuf('DC:A6:32:AB:CD:EF')  # 'RaspberryPi'
p.get_comment('DC:A6:32:AB:CD:EF') # 'Raspberry Pi Foundation'
\`\`\`

## Limitations

- OUI lookup only identifies the **network card manufacturer**, not the device brand
- Virtual machines, containers, and randomized MACs don't reflect real hardware
- Some large vendors own hundreds of OUI blocks

→ Try the [MAC Address Lookup Tool](/mac-address-lookup)`);

ARTICLES.set('email-normalizer-guide', `## What Is Email Normalization?

Email normalization standardizes email addresses to a canonical form for consistent storage, deduplication, and comparison. The same person might register as "John.Doe@Gmail.Com", "johndoe+newsletter@gmail.com", and "johndoe@googlemail.com" — all referring to the same inbox.

## Gmail Normalization Rules

Gmail has specific rules for address aliasing:

\`\`\`
john.doe@gmail.com     ← Same as:
johndoe@gmail.com      ← Dots are ignored
john.doe+tag@gmail.com ← Plus addressing (tag ignored)
JOHNDOE@GMAIL.COM      ← Case insensitive
johndoe@googlemail.com ← googlemail.com = gmail.com
\`\`\`

**Normalization steps for Gmail:**
1. Lowercase everything
2. Remove dots from local part
3. Remove \`+...\` suffix from local part
4. Normalize googlemail.com → gmail.com

\`\`\`javascript
function normalizeGmail(email) {
  const [local, domain] = email.toLowerCase().split('@');
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
    return email.toLowerCase();
  }
  const cleanLocal = local
    .split('+')[0]   // Remove plus tag
    .replace(/\\./g, '');  // Remove dots
  return \`\${cleanLocal}@gmail.com\`;
}
\`\`\`

## Other Provider Rules

| Provider | Dots | Plus | Case |
|---|---|---|---|
| Gmail | Ignored | Ignored | Insensitive |
| Outlook/Hotmail | Significant | Ignored | Insensitive |
| Yahoo | Significant | Supported (\`-\`) | Insensitive |
| Apple iCloud | Significant | Not supported | Insensitive |

## General Normalization

For providers without special rules:

\`\`\`javascript
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}
\`\`\`

## Why Normalize Emails?

### Preventing Duplicate Accounts
\`\`\`sql
-- Without normalization, same user registers twice
INSERT INTO users (email) VALUES ('John@Gmail.com');    -- OK
INSERT INTO users (email) VALUES ('john@gmail.com');    -- Duplicate? Not detected!
INSERT INTO users (email) VALUES ('j.o.h.n@gmail.com'); -- Also same user!
\`\`\`

### Safe Deduplication
\`\`\`javascript
const emails = [
  'John.Doe@Gmail.com',
  'johndoe+work@gmail.com',
  'JOHNDOE@gmail.com'
];

const unique = [...new Set(emails.map(normalizeGmail))];
// ['johndoe@gmail.com'] - correctly identified as duplicates
\`\`\`

### Preventing Fraud
Fraudsters use Gmail dot tricks and plus addresses to create multiple accounts and bypass single-use restrictions.

## RFC 5321 Compliance

Per RFC 5321, email local parts are technically case-sensitive. However, in practice:
- All major providers treat them case-insensitively
- Always normalize to lowercase for storage
- Keep original form for display

→ Try the [Email Normalizer Tool](/email-normalizer)`);

// ══════════════════════════════════════════════════════
// MATH / CALCULATOR CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('percentage-calculator-guide', `## Percentage Calculations Made Simple

Percentages are everywhere — discounts, tax rates, grades, statistics. Understanding how to calculate them quickly is an everyday skill.

## The Three Basic Percentage Problems

### 1. What is X% of Y?
**Formula:** Result = (X / 100) × Y

\`\`\`
What is 15% of 80?
= (15 / 100) × 80
= 0.15 × 80
= 12
\`\`\`

### 2. X is what percent of Y?
**Formula:** Percent = (X / Y) × 100

\`\`\`
40 is what percent of 200?
= (40 / 200) × 100
= 0.2 × 100
= 20%
\`\`\`

### 3. X is P% of what?
**Formula:** Whole = X / (P / 100)

\`\`\`
25 is 20% of what?
= 25 / (20 / 100)
= 25 / 0.2
= 125
\`\`\`

## Percentage Change

### Increase / Decrease
**Formula:** Change% = ((New - Old) / Old) × 100

\`\`\`
Price went from $80 to $100:
= ((100 - 80) / 80) × 100
= (20 / 80) × 100
= 25% increase

Price went from $100 to $80:
= ((80 - 100) / 100) × 100
= (-20 / 100) × 100
= -20% (decrease)
\`\`\`

## Tip Calculator

\`\`\`
Bill: $85.50
15% tip: 85.50 × 0.15 = $12.83
20% tip: 85.50 × 0.20 = $17.10
Total with 20% tip: 85.50 + 17.10 = $102.60
\`\`\`

## Sales Tax & Discount

\`\`\`
Original price: $120
Discount: 25% off
After discount: 120 × (1 - 0.25) = $90

Add 8% tax: 90 × 1.08 = $97.20
\`\`\`

## Compound Percentage Changes

When applying multiple percentage changes:

\`\`\`
Price: $100
Apply 10% increase: $110
Apply 10% decrease: $99

Note: 10% up then 10% down ≠ back to original!
The decrease applies to the higher amount.
\`\`\`

## Programming Percentage Calculations

\`\`\`javascript
const percentOf = (percent, total) => (percent / 100) * total;
const percentChange = (from, to) => ((to - from) / from) * 100;
const whatPercent = (part, whole) => (part / whole) * 100;

percentOf(15, 80)          // 12
percentChange(80, 100)     // 25 (25% increase)
whatPercent(40, 200)       // 20
\`\`\`

→ Try the [Percentage Calculator Tool](/percentage-calculator)`);

ARTICLES.set('bmi-calculator-guide', `## What Is BMI?

Body Mass Index (BMI) is a numerical value derived from a person's weight and height. Developed in the 1830s by Belgian mathematician Adolphe Quetelet, it's widely used as a screening tool for weight-related health issues.

## BMI Formula

**Metric:**
\`\`\`
BMI = weight (kg) / height² (m)

Example: 70 kg, 1.75 m
BMI = 70 / (1.75 × 1.75)
    = 70 / 3.0625
    = 22.86
\`\`\`

**Imperial:**
\`\`\`
BMI = (weight (lbs) × 703) / height² (inches)

Example: 154 lbs, 5'9" (69 inches)
BMI = (154 × 703) / (69 × 69)
    = 108,262 / 4761
    = 22.74
\`\`\`

## BMI Categories (WHO)

| BMI Range | Category |
|---|---|
| Below 18.5 | Underweight |
| 18.5 – 24.9 | Normal weight |
| 25.0 – 29.9 | Overweight |
| 30.0 – 34.9 | Obese (Class I) |
| 35.0 – 39.9 | Obese (Class II) |
| 40.0 and above | Obese (Class III) |

## Limitations of BMI

BMI is a population-level screening tool, not a diagnostic measure. Significant limitations include:

1. **Doesn't measure body fat** — Athletes with high muscle mass may have elevated BMI
2. **Doesn't account for distribution** — Abdominal fat is more dangerous than hip fat
3. **Age differences** — Normal BMI ranges differ for children and elderly
4. **Ethnic variations** — Asian populations face health risks at lower BMIs

### Alternative Measures

| Measure | Formula | Healthier Range |
|---|---|---|
| Waist-to-Hip Ratio | Waist / Hip | <0.85 (F), <0.90 (M) |
| Waist-to-Height Ratio | Waist / Height | <0.5 |
| Body Fat % | DEXA scan | 20-32% (F), 8-20% (M) |

## BMI for Different Populations

**Children and teens** use BMI-for-age percentiles:
- Underweight: < 5th percentile
- Healthy weight: 5th–85th percentile
- Overweight: 85th–95th percentile
- Obese: ≥ 95th percentile

**Asian populations**: WHO suggests lower thresholds — overweight at BMI ≥ 23, obese at BMI ≥ 27.5

## Code Implementation

\`\`\`javascript
function calculateBMI(weightKg, heightM) {
  const bmi = weightKg / (heightM * heightM);
  const category = bmi < 18.5 ? 'Underweight'
    : bmi < 25 ? 'Normal weight'
    : bmi < 30 ? 'Overweight'
    : 'Obese';
  return { bmi: bmi.toFixed(1), category };
}

calculateBMI(70, 1.75)  // { bmi: '22.9', category: 'Normal weight' }
\`\`\`

→ Try the [BMI Calculator Tool](/bmi-calculator)`);

ARTICLES.set('mortgage-calculator-guide', `## Understanding Mortgage Calculations

A mortgage is a secured loan used to purchase real estate. Understanding how mortgage payments are calculated helps you compare loan offers, budget effectively, and make informed financial decisions.

## The Mortgage Payment Formula

\`\`\`
M = P × [r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Principal loan amount
r = Monthly interest rate (annual rate / 12)
n = Total number of payments (years × 12)
\`\`\`

## Example Calculation

\`\`\`
Home price:        $400,000
Down payment:       $80,000 (20%)
Loan principal:    $320,000
Annual rate:         6.5%
Term:               30 years

Monthly rate: 6.5% / 12 = 0.5417% = 0.005417
n = 30 × 12 = 360 payments

M = 320,000 × [0.005417 × (1.005417)^360] / [(1.005417)^360 - 1]
M = 320,000 × [0.005417 × 6.848] / [6.848 - 1]
M = 320,000 × 0.03709 / 5.848
M ≈ $2,023/month
\`\`\`

## Amortization: How Payments Split Over Time

Early payments are mostly interest; later payments are mostly principal:

| Month | Payment | Principal | Interest | Balance |
|---|---|---|---|---|
| 1 | $2,023 | $290 | $1,733 | $319,710 |
| 60 | $2,023 | $367 | $1,656 | $305,600 |
| 120 | $2,023 | $464 | $1,559 | $289,000 |
| 240 | $2,023 | $740 | $1,283 | $236,400 |
| 360 | $2,023 | $2,012 | $11 | $0 |

**Total interest paid**: ~$408,280 on a $320,000 loan at 6.5%

## Impact of Rate and Term

| Rate | 15-Year Payment | 30-Year Payment | Total Interest (30yr) |
|---|---|---|---|
| 5.0% | $2,530 | $1,718 | $298,480 |
| 6.0% | $2,702 | $1,919 | $370,840 |
| 7.0% | $2,879 | $2,129 | $446,440 |
| 8.0% | $3,058 | $2,348 | $525,280 |

## Strategies to Reduce Total Interest

1. **Make extra principal payments** — Even $200/month extra can save years
2. **Biweekly payments** — 26 half-payments = 13 full payments per year
3. **Refinance when rates drop** — Saves significantly if rate drops 1%+
4. **Larger down payment** — Avoids PMI and reduces principal

\`\`\`javascript
function mortgagePayment(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
\`\`\`

→ Try the [Mortgage Calculator Tool](/mortgage-calculator)`);

ARTICLES.set('math-evaluator-guide', `## What Is a Math Expression Evaluator?

A math expression evaluator parses and computes mathematical expressions written in natural notation. Instead of programming a sequence of operations, you write expressions like \`(3 + 4) * 2 - sqrt(9)\` and get the result instantly.

## Supported Operations

### Arithmetic
\`\`\`
2 + 3      → 5
10 - 4     → 6
3 * 7      → 21
15 / 4     → 3.75
2 ^ 10     → 1024  (exponentiation)
17 % 5     → 2     (modulo)
\`\`\`

### Functions
\`\`\`
sqrt(16)   → 4
abs(-5)    → 5
ceil(4.2)  → 5
floor(4.8) → 4
round(4.5) → 5
log(100)   → 2      (base 10)
ln(e)      → 1      (natural log)
sin(PI/2)  → 1
cos(0)     → 1
\`\`\`

### Constants
\`\`\`
PI    → 3.14159265...
E     → 2.71828182...
\`\`\`

## Order of Operations (PEMDAS)

\`\`\`
P - Parentheses:    (2 + 3) * 4 = 20
E - Exponents:      2 ^ 3 * 4 = 32  (not 2^12)
M - Multiplication: Left to right
D - Division:       Left to right
A - Addition:       Left to right
S - Subtraction:    Left to right
\`\`\`

## Practical Examples

### Financial Calculations
\`\`\`
Monthly payment:
P * (r * (1+r)^n) / ((1+r)^n - 1)

Where P=300000, r=0.005417, n=360:
300000 * (0.005417 * (1+0.005417)^360) / ((1+0.005417)^360 - 1)
\`\`\`

### Engineering
\`\`\`
Ohm's law: V = I * R
Power:     P = V * I = I^2 * R

Decibels:  20 * log(V2/V1)
Frequency: 1 / (2 * PI * sqrt(L * C))
\`\`\`

### Statistics
\`\`\`
Mean of [2, 4, 6, 8, 10]:
(2 + 4 + 6 + 8 + 10) / 5 = 6

Standard deviation step (variance):
((2-6)^2 + (4-6)^2 + (6-6)^2 + (8-6)^2 + (10-6)^2) / 5
= (16 + 4 + 0 + 4 + 16) / 5 = 8

SD = sqrt(8) ≈ 2.83
\`\`\`

## Building Your Own Evaluator

### JavaScript (using Function constructor — caution: avoid for untrusted input)
\`\`\`javascript
// Safe evaluator using math.js
import { evaluate } from 'mathjs';

evaluate('sqrt(3^2 + 4^2)')  // 5
evaluate('2 inches to cm')    // 5.08 cm  (unit conversion!)
\`\`\`

### Python (ast-based safe eval)
\`\`\`python
import ast
import operator

OPERATORS = {
    ast.Add: operator.add, ast.Sub: operator.sub,
    ast.Mult: operator.mul, ast.Div: operator.truediv,
    ast.Pow: operator.pow, ast.USub: operator.neg,
}

def safe_eval(expr):
    tree = ast.parse(expr, mode='eval')
    return eval_node(tree.body)
\`\`\`

→ Try the [Math Evaluator Tool](/math-evaluator)`);

ARTICLES.set('eta-calculator-guide', `## What Is an ETA Calculator?

An ETA (Estimated Time of Arrival) calculator determines when you'll finish based on progress made so far. It's useful for file transfers, data processing, construction projects, or any task where you can measure completion rate.

## The Core Formula

\`\`\`
ETA = Current Time + (Remaining Work / Current Rate)

Remaining Work = Total - Completed
Rate = Completed / Time Elapsed
\`\`\`

## Example Calculations

### File Download
\`\`\`
File size:     1,000 MB
Downloaded:      350 MB  (35%)
Time elapsed:    45 sec

Rate = 350 MB / 45 sec = 7.78 MB/sec
Remaining = 1000 - 350 = 650 MB
ETA = 650 / 7.78 = 83.5 seconds = 1 min 23 sec
\`\`\`

### Project Progress
\`\`\`
Total tasks:     120
Completed:        45  (37.5%)
Days elapsed:      8

Rate = 45 / 8 = 5.625 tasks/day
Remaining = 120 - 45 = 75 tasks
ETA = 75 / 5.625 = 13.3 days
\`\`\`

### Data Processing
\`\`\`
Total records:  1,000,000
Processed:        250,000  (25%)
Time elapsed:      2 hours

Rate = 250,000 / 2 = 125,000 records/hour
Remaining = 750,000 records
ETA = 750,000 / 125,000 = 6 hours
\`\`\`

## Rate Smoothing

Instantaneous rates fluctuate. Use a rolling average for stable estimates:

\`\`\`javascript
class ETACalculator {
  constructor(total, windowSize = 5) {
    this.total = total;
    this.history = [];
    this.windowSize = windowSize;
  }

  update(completed, timestamp = Date.now()) {
    this.history.push({ completed, timestamp });
    if (this.history.length > this.windowSize + 1) {
      this.history.shift();
    }
  }

  getETA() {
    if (this.history.length < 2) return null;
    
    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    const rate = (last.completed - first.completed) / (last.timestamp - first.timestamp);
    
    const remaining = this.total - last.completed;
    const msLeft = remaining / rate;
    
    return new Date(Date.now() + msLeft);
  }
}
\`\`\`

## Displaying Progress

\`\`\`javascript
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return \`\${s}s\`;
  const m = Math.floor(s / 60);
  if (m < 60) return \`\${m}m \${s % 60}s\`;
  const h = Math.floor(m / 60);
  return \`\${h}h \${m % 60}m\`;
}

// Progress bar
function progressBar(completed, total, width = 40) {
  const pct = completed / total;
  const filled = Math.round(pct * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + '] ' + 
         (pct * 100).toFixed(1) + '%';
}
\`\`\`

→ Try the [ETA Calculator Tool](/eta-calculator)`);

ARTICLES.set('income-tax-calculator-guide', `## How Income Tax Is Calculated

Income tax is calculated using a **progressive bracket system** — different portions of your income are taxed at different rates. Understanding how brackets work can help you plan deductions and estimate your tax liability.

## How Tax Brackets Work

A common misconception: "Being in the 32% tax bracket means paying 32% on all income."

**Reality**: You pay the bracket rate only on income **within** that bracket.

### US 2024 Tax Brackets (Single Filer)
| Bracket | Rate | On Income |
|---|---|---|
| 1 | 10% | $0 – $11,600 |
| 2 | 12% | $11,601 – $47,150 |
| 3 | 22% | $47,151 – $100,525 |
| 4 | 24% | $100,526 – $191,950 |
| 5 | 32% | $191,951 – $243,725 |
| 6 | 35% | $243,726 – $609,350 |
| 7 | 37% | Over $609,350 |

### Example: $85,000 Salary
\`\`\`
First $11,600   × 10% = $1,160
Next $35,550    × 12% = $4,266  ($47,150 - $11,600)
Remaining $37,850 × 22% = $8,327  ($85,000 - $47,150)

Total tax:        $13,753
Effective rate:   16.2%  ($13,753 / $85,000)
Marginal rate:    22%    (rate on last dollar earned)
\`\`\`

## Standard vs Itemized Deductions

Your taxable income = Gross Income - Deductions

**Standard Deduction (2024):**
- Single: $14,600
- Married Filing Jointly: $29,200
- Head of Household: $21,900

\`\`\`
Gross income:       $85,000
Standard deduction: -$14,600
Taxable income:     $70,400

Tax on $70,400:
  $11,600 × 10% = $1,160
  $35,550 × 12% = $4,266
  $23,250 × 22% = $5,115
  Total:          $10,541
  Effective rate:  12.4%
\`\`\`

## FICA Taxes (US)

In addition to income tax:
- **Social Security**: 6.2% on up to $168,600 (2024)
- **Medicare**: 1.45% (no income limit)
- **Additional Medicare**: 0.9% on income over $200,000

## Tax Planning Strategies

1. **Maximize 401(k)**: Reduces taxable income (2024 limit: $23,000)
2. **HSA contributions**: Triple tax advantage
3. **Harvest tax losses**: Offset capital gains
4. **Roth conversion**: Pay taxes now, withdraw tax-free later
5. **Charitable deductions**: Donate appreciated assets

\`\`\`javascript
function calculateTax(income, brackets) {
  let tax = 0;
  let remaining = income;
  
  for (const [rate, min, max] of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, (max || Infinity) - min);
    tax += taxable * rate;
    remaining -= taxable;
  }
  
  return { tax, effectiveRate: (tax / income) * 100 };
}
\`\`\`

→ Try the [Income Tax Calculator Tool](/income-tax-calculator)`);

// ══════════════════════════════════════════════════════
// TEXT CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('lorem-ipsum-guide', `## What Is Lorem Ipsum?

Lorem Ipsum is placeholder text used in graphic design and publishing to fill space before final content is available. It allows designers to focus on visual design without being distracted by readable text.

## The Origin

Lorem Ipsum traces back to **"de Finibus Bonorum et Malorum"** (On the Ends of Good and Evil) by Cicero, written in 45 BC. The standard passage is scrambled and altered Latin:

> *"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."*

The original unaltered text: *"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet..."* ("Nor is there anyone who loves grief itself since it is grief and thus wants to obtain it.")

## Why Lorem Ipsum Instead of Random Text?

Lorem Ipsum has a near-normal distribution of letters and word lengths, giving designs a more realistic appearance than "abcde fghijk lmnop" or repeated text.

| Approach | Problem |
|---|---|
| "XXXXXXXX" | Doesn't simulate letter spacing |
| Repeated "content" | Eye notices patterns |
| Actual text | Distracts reviewers from design |
| Lorem Ipsum | Natural-looking, meaningless |

## Generating Lorem Ipsum

### Standard Passage
\`\`\`
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
\`\`\`

### Generating Programmatically
\`\`\`javascript
import { LoremIpsum } from 'lorem-ipsum';

const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 8, min: 4 },
  wordsPerSentence: { max: 16, min: 4 }
});

lorem.generateWords(5)        // "Lorem ipsum dolor sit amet"
lorem.generateSentences(3)    // 3 sentences
lorem.generateParagraphs(2)   // 2 paragraphs
\`\`\`

### Python
\`\`\`python
from faker import Faker

fake = Faker()
fake.paragraph(nb_sentences=5)  # Random paragraph
fake.text(max_nb_chars=200)      # ~200 character text
\`\`\`

## Alternatives to Lorem Ipsum

| Generator | Best For |
|---|---|
| Bacon Ipsum | Humorous presentations |
| Cat Ipsum | Fun, cat-themed |
| Samuel L. Ipsum | Emphatic copy testing |
| Corporate Ipsum | Satirizing business jargon |
| Hipster Ipsum | Creative agency mockups |

## When to NOT Use Lorem Ipsum

- **UX research** — Use realistic content to test scannability
- **Presentations to clients** — They may approve lorem ipsum accidentally
- **Form validation testing** — Lorem ipsum is always valid text
- **Character limit testing** — Use strings near the actual limit

## Responsive Design Testing

Use Lorem Ipsum at different lengths to test layout resilience:

\`\`\`html
<!-- Test short content -->
<p>Lorem ipsum</p>

<!-- Test medium content -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

<!-- Test long content that might break layout -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>
\`\`\`

→ Try the [Lorem Ipsum Generator Tool](/lorem-ipsum-generator)`);

ARTICLES.set('text-diff-guide', `## What Is Text Diff?

Text diff (short for "difference") compares two text files or strings and highlights what changed between them. It's the core technology behind version control, code review, document comparison, and change tracking.

## How Diff Algorithms Work

### Myers Algorithm (Used by Git)

Git's \`diff\` command uses the Myers algorithm, which finds the shortest edit script — the minimum number of insertions and deletions to transform one text into another.

\`\`\`diff
- Line 1: Original text here
+ Line 1: Modified text here
  Line 2: Unchanged line
- Line 3: This line was deleted
+ Line 3: This is a new line
+ Line 4: Another new line
\`\`\`

### Unified Diff Format

\`\`\`diff
--- a/file.txt   2024-01-15 10:00:00
+++ b/file.txt   2024-01-15 10:05:00
@@ -1,5 +1,6 @@
 Context line (unchanged)
-Removed line
+Added line
 Another context line
+Newly added line
\`\`\`

The \`@@ -1,5 +1,6 @@\` header means: starting at line 1, show 5 original lines → 6 new lines.

## Line-Level vs Character-Level Diff

**Line-level diff** (git default):
\`\`\`diff
-The quick brown fox jumps over the lazy dog
+The quick brown cat jumps over the lazy dog
\`\`\`

**Character/word-level diff** (git diff --word-diff):
\`\`\`diff
The quick brown [-fox-]{+cat+} jumps over the lazy dog
\`\`\`

## Programmatic Diff

### JavaScript
\`\`\`javascript
import { diffLines, diffWords, createPatch } from 'diff';

const oldText = 'Hello\\nWorld\\nFoo';
const newText = 'Hello\\nEarth\\nFoo\\nBar';

diffLines(oldText, newText).forEach(part => {
  const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
  process.stdout.write(part.value);
});
\`\`\`

### Python
\`\`\`python
import difflib

old = ['Hello\\n', 'World\\n', 'Foo\\n']
new = ['Hello\\n', 'Earth\\n', 'Foo\\n', 'Bar\\n']

diff = list(difflib.unified_diff(old, new, fromfile='before', tofile='after'))
print(''.join(diff))

# HTML diff
differ = difflib.HtmlDiff()
html = differ.make_file(old, new)
\`\`\`

## Three-Way Merge

When two people edit the same file:

\`\`\`
Base: "The cat sat on the mat"
Ours: "The dog sat on the mat"  (changed cat → dog)
Theirs: "The cat sat on the rug"  (changed mat → rug)
Result: "The dog sat on the rug"  (both changes apply cleanly)
\`\`\`

**Merge conflict** occurs when both sides change the same region:
\`\`\`
<<<<<<< HEAD
The dog sat on the mat
=======
The elephant sat on the mat
>>>>>>> feature-branch
\`\`\`

→ Try the [Text Diff Tool](/text-diff)`);

ARTICLES.set('string-obfuscator-guide', `## What Is String Obfuscation?

String obfuscation transforms readable text into an unreadable but reversible format. It's not encryption (no key required to reverse), but makes text non-trivially readable to casual observers.

## Common Obfuscation Techniques

### Base64 Encoding
\`\`\`
Input:   Hello, World!
Output:  SGVsbG8sIFdvcmxkIQ==
\`\`\`

### ROT13 (Letter Rotation)
\`\`\`
Input:   Hello World
Output:  Uryyb Jbeyq

Alphabet: A↔N, B↔O, C↔P, ... Z↔M
ROT13 applied twice returns the original.
\`\`\`

### XOR with Key
\`\`\`javascript
function xorObfuscate(str, key) {
  return [...str]
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

const obfuscated = xorObfuscate('Hello', 'key');
const restored = xorObfuscate(obfuscated, 'key'); // "Hello"
\`\`\`

### Reverse String
\`\`\`
Input:   Hello World
Output:  dlroW olleH
\`\`\`

### Unicode Escape
\`\`\`
Input:   Hello
Output:  \\u0048\\u0065\\u006C\\u006C\\u006F
\`\`\`

## JavaScript Code Obfuscation

JavaScript obfuscation is used to protect client-side code:

\`\`\`javascript
// Original
function greet(name) {
  return 'Hello, ' + name + '!';
}

// Obfuscated (uglified + renamed + string encoded)
function a(b){return '\\x48\\x65\\x6c\\x6c\\x6f\\x2c\\x20'+b+'\\x21'}
\`\`\`

## When to Use String Obfuscation

| Use Case | Recommended? |
|---|---|
| Hiding sensitive keys in client code | ❌ No — use server-side or env vars |
| Protecting API responses from casual reading | ✅ Reasonable |
| License keys in software | ⚠️ Weak protection only |
| Anti-spam email addresses | ✅ Helps against scrapers |
| Preventing accidental reading of test data | ✅ Good use |

## What Obfuscation Is NOT

- **Not encryption**: No secret key, easily reversible
- **Not security**: Determined attackers can always reverse it
- **Not compression**: Usually makes text longer

**Security principle**: Never store passwords, API keys, or sensitive data using only obfuscation. Use proper encryption with secret keys stored server-side.

→ Try the [String Obfuscator Tool](/string-obfuscator)`);

ARTICLES.set('text-statistics-guide', `## What Is Text Statistics Analysis?

Text statistics analysis extracts quantitative metrics from a piece of text: word count, character count, sentence count, reading time, and readability scores. These metrics help writers, editors, and developers understand and improve their content.

## Common Text Metrics

| Metric | How Calculated | Use Case |
|---|---|---|
| Character count | Count all characters | Tweet/SMS limits |
| Word count | Split on whitespace | Article length targets |
| Sentence count | Split on .!? | Readability |
| Paragraph count | Split on double newline | Structure |
| Reading time | Words / 200 (avg WPM) | Blog posts |
| Unique words | Count distinct words | Vocabulary richness |

## Readability Scores

### Flesch Reading Ease
\`\`\`
Score = 206.835 - 1.015(words/sentences) - 84.6(syllables/words)

Score interpretation:
90-100:  Very easy (5th grade)
70-80:   Easy (6th grade)
60-70:   Standard (7th-8th grade)
30-50:   Difficult (college level)
0-30:    Very confusing (professional)
\`\`\`

### Flesch-Kincaid Grade Level
\`\`\`
Grade = 0.39(words/sentences) + 11.8(syllables/words) - 15.59
\`\`\`

## Implementing Text Statistics

\`\`\`javascript
function analyzeText(text) {
  const words = text.trim().split(/\\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\\n\\n+/).filter(p => p.trim().length > 0);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\\s/g, '').length;
  
  // Estimate reading time (200 WPM average)
  const readingTimeMin = words.length / 200;
  
  // Unique words
  const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  
  return {
    characters: chars,
    charactersNoSpaces: charsNoSpaces,
    words: words.length,
    uniqueWords: unique.size,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordsPerSentence: (words.length / sentences.length).toFixed(1),
    readingTime: \`\${Math.ceil(readingTimeMin)} min read\`
  };
}
\`\`\`

## Character Frequency Analysis

\`\`\`javascript
function charFrequency(text) {
  const freq = {};
  for (const char of text.toLowerCase()) {
    if (/[a-z]/.test(char)) {
      freq[char] = (freq[char] || 0) + 1;
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

// Expected top letters in English: e, t, a, o, i, n, s, h, r
\`\`\`

## Writing Style Guidelines

| Metric | Blog Post | Academic | Marketing |
|---|---|---|---|
| Avg sentence length | 15-20 words | 20-25 words | 10-15 words |
| Reading ease score | 60-70 | 30-50 | 70-80 |
| Words per article | 1000-2500 | 3000-8000 | 300-600 |

→ Try the [Text Statistics Tool](/text-statistics)`);

ARTICLES.set('emoji-picker-guide', `## What Are Emoji?

Emoji (絵文字, Japanese for "picture character") are standardized pictographs used in digital communication. Introduced in Japan in 1999, they became a global standard through Unicode and are now supported across all major platforms.

## Unicode and Emoji

Each emoji is assigned a Unicode code point. Modern emoji often use multiple code points combined:

\`\`\`
😀  U+1F600  GRINNING FACE
👋  U+1F44B  WAVING HAND
❤️  U+2764 + U+FE0F  HEAVY BLACK HEART + VARIATION SELECTOR
👨‍💻  U+1F468 + U+200D + U+1F4BB  MAN + ZWJ + LAPTOP (sequence)
🏳️‍🌈  Multiple code points + ZWJ  RAINBOW FLAG
\`\`\`

## Emoji Categories

| Category | Examples | Count |
|---|---|---|
| Smileys & Emotion | 😀😂🥰😎 | ~150 |
| People & Body | 👋👏🤝💪 | ~200 |
| Animals & Nature | 🐶🌸🌍🦁 | ~150 |
| Food & Drink | 🍕☕🍎🍣 | ~130 |
| Activities | ⚽🎮🎸🏊 | ~80 |
| Travel & Places | 🚀✈️🏖️🗺️ | ~100 |
| Objects | 💡📱⌨️🔑 | ~200 |
| Symbols | ❤️✅⚠️♻️ | ~250 |
| Flags | 🏳️🇺🇸🇯🇵 | ~250 |

## Using Emoji in Code

### HTML
\`\`\`html
<!-- Direct Unicode -->
<span>😀</span>

<!-- HTML entity (decimal) -->
<span>&#128512;</span>

<!-- HTML entity (hex) -->
<span>&#x1F600;</span>
\`\`\`

### JavaScript
\`\`\`javascript
// Emoji string
const wave = '👋';
wave.length         // 2 (surrogate pairs!)
[...wave].length    // 1 (spread handles it correctly)

// Code point
wave.codePointAt(0).toString(16)  // "1f44b"
String.fromCodePoint(0x1F44B)     // '👋'

// Emoji regex (ES2018+)
const emojiRegex = /\\p{Emoji}/gu;
'Hello 😀 World 🌍'.match(emojiRegex)  // ['😀', '🌍']
\`\`\`

### Python
\`\`\`python
import emoji

# Encode/decode
emoji.emojize(':waving_hand:')   # '👋'
emoji.demojize('👋')              # ':waving_hand:'

# Extract emoji from text
emoji.emoji_list('Hello 😀 World')
# [{'match_start': 6, 'match_end': 7, 'emoji': '😀'}]
\`\`\`

## Emoji in SEO and Social Media

- Twitter counts emoji as 2 characters in some cases
- Instagram allows up to 30 hashtags and unlimited emoji
- Google Search displays emoji in page titles and descriptions
- Emoji in subject lines can increase email open rates (A/B test first!)

## Skin Tone Modifiers

Emoji support skin tone variations using Fitzpatrick scale modifiers:
\`\`\`
👋  Base (yellow)
👋🏻  Type 1-2 (light)
👋🏼  Type 3 (medium-light)
👋🏽  Type 4 (medium)
👋🏾  Type 5 (medium-dark)
👋🏿  Type 6 (dark)
\`\`\`

→ Try the [Emoji Picker Tool](/emoji-picker)`);

ARTICLES.set('html-wysiwyg-editor-guide', `## What Is a WYSIWYG Editor?

WYSIWYG (What You See Is What You Get) editors let users format text visually without writing HTML. The text looks like the final output — bold text appears bold, headings appear larger. This makes rich text editing accessible to non-technical users.

## How WYSIWYG Editors Work

Modern browsers support the \`contenteditable\` attribute, which makes any DOM element editable:

\`\`\`html
<div contenteditable="true">
  Click here and start typing...
</div>
\`\`\`

The \`document.execCommand()\` API (now deprecated but still widely supported) enabled programmatic formatting:

\`\`\`javascript
// Bold selected text
document.execCommand('bold');

// Insert HTML at cursor
document.execCommand('insertHTML', false, '<strong>bold text</strong>');
\`\`\`

## Modern WYSIWYG Libraries

### Tiptap (Vue/React)
\`\`\`javascript
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  content: '<p>Hello World</p>',
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    const json = editor.getJSON();
  }
});
\`\`\`

### Quill
\`\`\`javascript
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: ['bold', 'italic', 'underline', 'link',
              { header: [1, 2, 3, false] },
              { list: 'ordered' }, { list: 'bullet' }]
  }
});

quill.on('text-change', () => {
  const html = quill.root.innerHTML;
  const delta = quill.getContents(); // Quill's Delta format
});
\`\`\`

### ProseMirror
The foundation of Tiptap. Low-level, highly customizable:
\`\`\`javascript
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from 'prosemirror-schema-basic';

const state = EditorState.create({ schema });
const view = new EditorView(document.body, { state });
\`\`\`

## Sanitizing HTML Output

**Critical security note**: Always sanitize HTML before storing or rendering:

\`\`\`javascript
import DOMPurify from 'dompurify';

const userInput = editor.getHTML();
const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 
                 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel']
});
\`\`\`

Without sanitization, users can inject \`<script>\` tags or event handlers.

## Storing Rich Text

Options for storing editor content:

| Format | Pros | Cons |
|---|---|---|
| HTML string | Easy to render | XSS risk if unsanitized |
| JSON (Delta/Tiptap) | Editor-agnostic, version control friendly | Requires conversion to render |
| Markdown | Human-readable, universal | Limited formatting |

→ Try the [HTML WYSIWYG Editor Tool](/html-wysiwyg-editor)`);

// ══════════════════════════════════════════════════════
// DATA CONVERSION CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('text-to-binary-guide', `## What Is Binary Representation of Text?

Binary is the base-2 number system using only 0s and 1s. Every piece of digital data — text, images, audio — is ultimately stored as binary. Converting text to binary shows the fundamental level at which computers process information.

## How Text Becomes Binary

1. Each character has an ASCII or Unicode code point
2. That number is converted to binary

\`\`\`
'A' → ASCII 65 → binary 01000001
'B' → ASCII 66 → binary 01000010
'a' → ASCII 97 → binary 01100001
'!' → ASCII 33 → binary 00100001
\`\`\`

### Full Example: "Hi!"

\`\`\`
H → 72  → 01001000
i → 105 → 01101001
! → 33  → 00100001

"Hi!" in binary: 01001000 01101001 00100001
\`\`\`

## ASCII vs Unicode

**ASCII** (7-bit): 128 characters (English alphabet, digits, basic punctuation)

**Unicode** (variable-width): Over 1 million code points, all languages, emoji

**UTF-8** encoding:
\`\`\`
'A' (U+0041)      → 1 byte:  01000001
'€' (U+20AC)      → 3 bytes: 11100010 10000010 10101100
'😀' (U+1F600)    → 4 bytes: 11110000 10011111 10011000 10000000
\`\`\`

## Converting in Code

### JavaScript
\`\`\`javascript
// Text to binary
function textToBinary(text) {
  return [...text]
    .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

// Binary to text
function binaryToText(binary) {
  return binary.split(' ')
    .map(b => String.fromCharCode(parseInt(b, 2)))
    .join('');
}

textToBinary('Hi!')  // "01001000 01101001 00100001"
binaryToText('01001000 01101001 00100001')  // "Hi!"
\`\`\`

### Python
\`\`\`python
def text_to_binary(text):
    return ' '.join(format(ord(c), '08b') for c in text)

def binary_to_text(binary):
    return ''.join(chr(int(b, 2)) for b in binary.split())

text_to_binary('Hi!')   # '01001000 01101001 00100001'
binary_to_text('01001000 01101001 00100001')  # 'Hi!'
\`\`\`

## Real-World Applications

- **File signatures**: PNG files start with bytes \`89 50 4E 47\` (\`\\x89PNG\`)
- **Network protocols**: Understanding TCP/IP headers requires binary reading
- **Bit manipulation**: Flags, permissions, and masks use binary operations
- **Cryptography**: Hash functions and ciphers operate at the bit level

→ Try the [Text to Binary Tool](/text-to-binary)`);

ARTICLES.set('text-to-nato-guide', `## What Is the NATO Phonetic Alphabet?

The NATO phonetic alphabet (officially the International Radiotelephony Spelling Alphabet) assigns a unique word to each letter of the alphabet. It ensures clear communication when spelling words over radio, phone, or in noisy environments where letters can sound similar.

## The Complete NATO Phonetic Alphabet

| Letter | Word | Pronunciation |
|---|---|---|
| A | Alpha | AL-fah |
| B | Bravo | BRAH-voh |
| C | Charlie | CHAR-lee |
| D | Delta | DEL-tah |
| E | Echo | EK-oh |
| F | Foxtrot | FOKS-trot |
| G | Golf | Golf |
| H | Hotel | hoh-TEL |
| I | India | IN-dee-ah |
| J | Juliet | JEW-lee-et |
| K | Kilo | KEY-loh |
| L | Lima | LEE-mah |
| M | Mike | Mike |
| N | November | no-VEM-ber |
| O | Oscar | OSS-kar |
| P | Papa | pah-PAH |
| Q | Quebec | keh-BEK |
| R | Romeo | ROW-mee-oh |
| S | Sierra | see-AIR-ah |
| T | Tango | TANG-go |
| U | Uniform | YOU-nee-form |
| V | Victor | VIK-tah |
| W | Whiskey | WISS-key |
| X | X-ray | ECKS-ray |
| Y | Yankee | YANG-key |
| Z | Zulu | ZOO-loh |

## Digits and Special Characters

\`\`\`
0 = Zero        5 = Fife (not "five", to avoid confusion)
1 = One         6 = Six
2 = Two         7 = Seven
3 = Tree        8 = Ait
4 = Fower       9 = Niner
. = Decimal     / = Stroke
\`\`\`

## Real-World Usage

**Aviation**: "Cessna N123AB" → "November One Two Tree Alpha Bravo"

**Military**: Call signs and coordinates
\`\`\`
Grid: "Alpha Bravo Seven Niner"
Unit: "Tango Foxtrot Kilo One"
\`\`\`

**Customer Service**: Spelling names/email addresses
\`\`\`
"smith@example.com"
→ Sierra Mike India Tango Hotel at Echo X-ray Alpha Mike Papa Lima Echo dot Charlie Oscar Mike
\`\`\`

## Programming

\`\`\`javascript
const NATO = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu'
};

function toNATO(text) {
  return text.toUpperCase()
    .split('')
    .map(c => NATO[c] || c)
    .join(' ');
}

toNATO('SOS')  // "Sierra Oscar Sierra"
\`\`\`

→ Try the [Text to NATO Alphabet Tool](/text-to-nato-alphabet)`);

ARTICLES.set('text-to-unicode-guide', `## What Is Unicode?

Unicode is the universal character encoding standard that assigns a unique number (code point) to every character in every writing system — from Latin and Arabic to Chinese, emoji, and ancient scripts. It solved the "character encoding chaos" of the early internet.

## Unicode vs ASCII vs UTF-8

| Standard | Characters | Bits | Notes |
|---|---|---|---|
| ASCII | 128 | 7-bit | English only |
| Latin-1 (ISO 8859-1) | 256 | 8-bit | Western European |
| Unicode | 1,114,112 | Variable | All human writing |
| UTF-8 | All Unicode | 1-4 bytes | Most common encoding |
| UTF-16 | All Unicode | 2-4 bytes | Used by Windows, Java |
| UTF-32 | All Unicode | 4 bytes | Fixed-width |

## Unicode Code Points

Every character has a code point in the format \`U+XXXX\`:

\`\`\`
U+0041  →  A  (Latin capital letter A)
U+00E9  →  é  (Latin small letter E with acute)
U+4E2D  →  中 (Chinese character "middle")
U+1F600 →  😀 (Grinning face)
U+200D  →  ZWJ (Zero-width joiner, used in emoji sequences)
\`\`\`

## UTF-8 Encoding Details

UTF-8 uses 1-4 bytes depending on the code point:

\`\`\`
Code point range        Byte count  Byte pattern
U+0000 – U+007F         1 byte      0xxxxxxx
U+0080 – U+07FF         2 bytes     110xxxxx 10xxxxxx
U+0800 – U+FFFF         3 bytes     1110xxxx 10xxxxxx 10xxxxxx
U+10000 – U+10FFFF      4 bytes     11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

Example: 'é' (U+00E9)
Binary: 11101001
Encoded: 11000011 10101001 (0xC3 0xA9)
\`\`\`

## JavaScript Unicode Handling

\`\`\`javascript
// Code points
'A'.charCodeAt(0)         // 65
'😀'.codePointAt(0)       // 128512 (0x1F600)

// From code point
String.fromCharCode(65)   // 'A'
String.fromCodePoint(128512)  // '😀'

// Unicode escapes
'\\u0041'    // 'A'
'\\u{1F600}' // '😀' (ES6+ syntax for code points > U+FFFF)

// String length gotcha
'😀'.length         // 2 (counts UTF-16 code units!)
[...'😀'].length    // 1 (correct)

// Normalize composed vs decomposed
'é' === '\\u00E9'          // true (precomposed)
'é' === 'e\\u0301'         // false (decomposed 'e' + combining accent)
'é'.normalize('NFC') === '\\u00E9'  // true
\`\`\`

## Python Unicode

\`\`\`python
# Python 3 strings are Unicode by default
ord('A')        # 65
ord('😀')       # 128512
chr(65)         # 'A'
chr(128512)     # '😀'

# Unicode name
import unicodedata
unicodedata.name('😀')  # 'GRINNING FACE'
unicodedata.name('中')  # 'CJK UNIFIED IDEOGRAPH-4E2D'

# Encoding to bytes
'hello'.encode('utf-8')   # b'hello'
'中'.encode('utf-8')       # b'\\xe4\\xb8\\xad'
\`\`\`

→ Try the [Text to Unicode Tool](/text-to-unicode)`);

ARTICLES.set('numeronym-generator-guide', `## What Is a Numeronym?

A numeronym is an abbreviation that replaces middle letters with the count of omitted letters. The word "numeronym" itself is a numeronym: **n7m** (n-umerony-m, 7 letters between n and m).

## Famous Numeronyms

| Numeronym | Full Word | Origin |
|---|---|---|
| i18n | internationalization | 18 letters between i and n |
| l10n | localization | 10 letters between l and n |
| a11y | accessibility | 11 letters between a and y |
| k8s | Kubernetes | 8 letters between K and s |
| o11y | observability | 11 letters between o and y |
| p13n | personalization | 13 letters between p and n |
| g11n | globalization | 11 letters between g and n |

## Why Numeronyms Exist

Tech numeronyms emerged because:
1. Long technical terms are tedious to type repeatedly
2. They fit better in code comments, variable names, and tweets
3. The tech community values brevity

## How Numeronyms Are Formed

Standard format: **First letter** + **count** + **Last letter**

\`\`\`
"internationalization"
 i + 18 + n = i18n

"accessibility"  
 a + 11 + y = a11y

"Kubernetes"
 K + 8 + s = k8s
\`\`\`

## Generating Numeronyms in Code

\`\`\`javascript
function numeronym(word) {
  if (word.length <= 3) return word;
  const first = word[0];
  const last = word[word.length - 1];
  const middle = word.length - 2;
  return \`\${first}\${middle}\${last}\`;
}

numeronym('internationalization')  // "i18n"
numeronym('accessibility')         // "a11y"
numeronym('Kubernetes')            // "K8s"
\`\`\`

\`\`\`python
def numeronym(word):
    if len(word) <= 3:
        return word
    return f"{word[0]}{len(word)-2}{word[-1]}"

numeronym("internationalization")  # "i18n"
numeronym("accessibility")         # "a11y"
\`\`\`

## Common i18n & l10n Terms

**Internationalization (i18n)**: Designing software to support multiple locales
- Extracting hard-coded strings
- Supporting RTL text (Arabic, Hebrew)
- Date/number format abstraction

**Localization (l10n)**: Adapting software for a specific locale
- Translating strings
- Adjusting date formats (MM/DD/YYYY vs DD/MM/YYYY)
- Currency symbols and number separators

**Accessibility (a11y)**: Making software usable by people with disabilities
- Screen reader support (ARIA attributes)
- Keyboard navigation
- Color contrast ratios

→ Try the [Numeronym Generator Tool](/numeronym-generator)`);

ARTICLES.set('random-decision-picker-guide', `## Making Decisions with Randomness

Sometimes the best way to break a deadlock is to let chance decide. A random decision picker selects one option from a list using a random number generator, ensuring fair and unbiased selection.

## Use Cases

- **Team decisions**: Which framework to use? Which restaurant to try?
- **Task assignment**: Who handles the next on-call shift?
- **A/B testing**: Which variant to show this user?
- **Games**: Who goes first? Shuffle a playlist.
- **Sampling**: Select a random subset of items for review.

## Fair Randomness vs True Randomness

### Pseudo-Random (Math.random)
\`\`\`javascript
// Simple but not cryptographically secure
const items = ['Option A', 'Option B', 'Option C'];
const pick = items[Math.floor(Math.random() * items.length)];
\`\`\`

### Cryptographically Secure Random
\`\`\`javascript
// Unbiased, cryptographically secure selection
function secureRandom(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;  // Note: slight modulo bias for non-power-of-2 max
}

const items = ['Alice', 'Bob', 'Charlie'];
const winner = items[secureRandom(items.length)];
\`\`\`

## Fair Shuffle (Fisher-Yates Algorithm)

To shuffle all items fairly:

\`\`\`javascript
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

shuffle(['A', 'B', 'C', 'D'])  // Random permutation
\`\`\`

## Weighted Random Selection

When options don't have equal probability:

\`\`\`javascript
function weightedRandom(options, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  
  for (let i = 0; i < options.length; i++) {
    random -= weights[i];
    if (random < 0) return options[i];
  }
}

// 50% pizza, 30% sushi, 20% burgers
weightedRandom(['pizza', 'sushi', 'burgers'], [50, 30, 20]);
\`\`\`

## Provably Fair Randomness

For high-stakes decisions, use a **commitment scheme**:

1. Server generates random seed and publishes its hash: \`hash(seed)\`
2. User makes their choice
3. Server reveals the seed
4. Anyone can verify: \`hash(revealed_seed) === published_hash\`

This prevents the server from changing the result after seeing user input.

→ Try the [Random Decision Picker Tool](/random-decision-picker)`);

// ══════════════════════════════════════════════════════
// IMAGES / MEDIA CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('qr-code-generator-guide', `## What Is a QR Code?

A QR (Quick Response) code is a two-dimensional barcode invented by Denso Wave in 1994. Unlike traditional barcodes that store data horizontally, QR codes store data in both dimensions, allowing them to hold significantly more information.

## QR Code Structure

\`\`\`
┌─────────────────────────────┐
│ ██  ██ ░ ░ ██  ██ ░ ██  ██ │  ← Finder patterns (3 corners)
│ ██  ██ ░ ░ ██  ██ ░ ██  ██ │
│ ░░░░░░ ░ ░ ░░░░░░ ░ ░░░░░░ │
│   ██  ░ ░ ██   ░ ░  ██   ░ │  ← Data modules
│  ...encoded data...         │
│ ██  ██ ░ ░ ... format info  │  ← Bottom-left finder pattern
\`\`\`

Key features:
- **Finder patterns**: Three squares in corners for orientation detection
- **Timing patterns**: Alternating black/white stripes for alignment
- **Format information**: Error correction level and mask pattern
- **Data region**: Encoded payload

## Error Correction Levels

| Level | Recovery Capacity | Use Case |
|---|---|---|
| L (Low) | 7% | Clean environments |
| M (Medium) | 15% | General purpose |
| Q (Quartile) | 25% | Industrial use |
| H (High) | 30% | Logo overlay possible |

Higher error correction → larger QR code.

## What QR Codes Can Encode

| Type | Format | Example |
|---|---|---|
| URL | Plain URL | \`https://example.com\` |
| WiFi | \`WIFI:S:SSID;T:WPA;P:pass;;\` | Login to network |
| Contact | vCard or MeCard format | Business card |
| SMS | \`SMSTO:number:message\` | Pre-fill SMS |
| Email | \`mailto:user@example.com\` | Open mail client |
| Location | \`geo:lat,lon\` | Open in maps |
| Phone | \`tel:+1234567890\` | Initiate call |

## Generating QR Codes in Code

### JavaScript
\`\`\`javascript
import QRCode from 'qrcode';

// Generate as canvas
await QRCode.toCanvas(canvasElement, 'https://example.com', {
  errorCorrectionLevel: 'H',
  width: 256,
  color: { dark: '#000000', light: '#FFFFFF' }
});

// Generate as data URL
const dataUrl = await QRCode.toDataURL('https://example.com');

// Generate as SVG string
const svg = await QRCode.toString('Hello', { type: 'svg' });
\`\`\`

### Python
\`\`\`python
import qrcode
from qrcode.image.styledpil import StyledPilImage

qr = qrcode.QRCode(
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data('https://example.com')
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save("qrcode.png")
\`\`\`

## Best Practices

1. **Minimum size**: 2cm × 2cm for reliable scanning
2. **Quiet zone**: 4 modules of white space around the code
3. **Contrast**: Dark on light background (not reversed for most scanners)
4. **Test on devices**: Test with multiple cameras and lighting conditions
5. **Dynamic QR codes**: Use a redirect service to change destination without reprinting

→ Try the [QR Code Generator Tool](/qr-code-generator)`);

ARTICLES.set('svg-placeholder-guide', `## What Are SVG Placeholders?

SVG placeholders are lightweight, scalable image placeholders used during design and development. Unlike raster placeholders (PNG/JPG), SVG placeholders are infinitely scalable, tiny in file size, and can be customized with any text, color, or dimensions.

## SVG vs Raster Placeholders

| Feature | SVG Placeholder | PNG Placeholder |
|---|---|---|
| File size | ~200 bytes | 5-50 KB |
| Scalability | Infinite | Fixed resolution |
| Customizable | Fully | No |
| Inline in HTML | Yes | No (data URI) |
| Server required | No | Yes |

## Creating SVG Placeholders

### Minimal SVG
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="100%" height="100%" fill="#cccccc"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#666" font-size="24" font-family="sans-serif">
    400 × 300
  </text>
</svg>
\`\`\`

### Data URI for img src
\`\`\`javascript
function svgPlaceholder(width, height, text, bgColor = '#ccc', textColor = '#666') {
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="\${width}" height="\${height}">
  <rect width="100%" height="100%" fill="\${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    fill="\${textColor}" font-family="sans-serif" font-size="\${Math.min(width, height) / 8}">
    \${text || \`\${width}×\${height}\`}
  </text>
</svg>\`;
  return \`data:image/svg+xml,\${encodeURIComponent(svg)}\`;
}

// Usage
<img src={svgPlaceholder(400, 300)} alt="Placeholder" />
\`\`\`

## Lazy Loading with SVG Placeholders

\`\`\`html
<!-- Use tiny SVG as src, real image as data-src -->
<img
  src="data:image/svg+xml,..."
  data-src="/images/real-photo.jpg"
  class="lazy"
  alt="Product photo"
/>

<script>
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy').forEach(img => observer.observe(img));
</script>
\`\`\`

## Blur Placeholder Technique (LQIP)

Low-Quality Image Placeholder (LQIP) shows a blurry version while the full image loads:

\`\`\`javascript
// Generate tiny base64 placeholder (server-side)
const sharp = require('sharp');

async function generateLQIP(imagePath) {
  const buffer = await sharp(imagePath)
    .resize(20)        // Tiny 20px wide
    .blur(10)
    .toBuffer();
  return \`data:image/jpeg;base64,\${buffer.toString('base64')}\`;
}
\`\`\`

## CSS Skeleton Screens

An alternative to image placeholders:
\`\`\`css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
\`\`\`

→ Try the [SVG Placeholder Generator Tool](/svg-placeholder-generator)`);

ARTICLES.set('color-palette-generator-guide', `## What Is a Color Palette?

A color palette is a curated set of colors designed to work harmoniously together. In design, choosing the right palette is fundamental to brand identity, user experience, and visual appeal.

## Color Theory Basics

### The Color Wheel
Colors have relationships based on their position on the color wheel:

**Complementary** (opposite): Creates high contrast, vibrant look
\`\`\`
Blue (#0000FF) ↔ Orange (#FF7F00)
Red (#FF0000) ↔ Green (#00FF00)
\`\`\`

**Analogous** (adjacent): Creates harmonious, calm designs
\`\`\`
Blue → Blue-Green → Green
\`\`\`

**Triadic** (three equally spaced): Vibrant, balanced
\`\`\`
Red, Yellow, Blue
\`\`\`

**Split-complementary**: High contrast without tension
\`\`\`
Blue + Yellow-Orange + Red-Orange
\`\`\`

## Generating Palettes from a Base Color

\`\`\`javascript
// Given a hue, generate a 5-color palette using HSL
function generatePalette(hue) {
  return {
    primary:   \`hsl(\${hue}, 70%, 50%)\`,
    light:     \`hsl(\${hue}, 60%, 80%)\`,
    dark:      \`hsl(\${hue}, 70%, 30%)\`,
    accent:    \`hsl(\${(hue + 180) % 360}, 70%, 50%)\`,  // Complement
    neutral:   \`hsl(\${hue}, 10%, 90%)\`
  };
}

generatePalette(220)  // Blue-based palette
\`\`\`

## Accessibility: WCAG Color Contrast

Colors must meet contrast ratio requirements for accessibility:

| Ratio | Text Size | WCAG Level |
|---|---|---|
| 4.5:1 | Normal text | AA (required) |
| 3:1 | Large text (18pt+) | AA |
| 7:1 | Normal text | AAA |
| 3:1 | Large text | AAA |

\`\`\`javascript
function luminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const L1 = luminance(hex1);
  const L2 = luminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

contrastRatio('#FFFFFF', '#000000')  // 21:1 (maximum contrast)
contrastRatio('#FFFFFF', '#767676')  // 4.54:1 (passes AA)
\`\`\`

## Popular Color Systems

### Tailwind CSS Colors
Tailwind uses a systematic 50-900 shade scale:
\`\`\`
blue-50:  #EFF6FF  (nearly white)
blue-500: #3B82F6  (primary)
blue-900: #1E3A5F  (very dark)
\`\`\`

### Material Design
Google's Material Design uses "tonal palettes" with 13 tones (0-100):
\`\`\`
Primary: tone 40 (on light), tone 80 (on dark)
Surface: tone 98 (light), tone 6 (dark)
\`\`\`

## Tools and Resources

- **Adobe Color**: Color wheel and palette extraction from images
- **Coolors**: Fast palette generation with keyboard shortcuts
- **Paletton**: Advanced color scheme designer
- **Contrast Checker**: WCAG contrast verification

→ Try the [Color Palette Generator Tool](/color-palette-generator)`);

ARTICLES.set('ascii-art-generator-guide', `## What Is ASCII Art?

ASCII art uses printable characters from the ASCII standard to create visual images and designs. Developed in the 1960s when graphical displays didn't exist, ASCII art remains popular for terminal output, code comments, README files, and retro aesthetics.

## ASCII Art Types

### Block/Solid Characters
\`\`\`
█▓▒░ (solid to transparent)
╔═══════╗
║ Hello ║
╚═══════╝
\`\`\`

### Small Characters
\`\`\`
  /\\_/\\  
 ( o.o ) 
  > ^ <  
\`\`\`

### FIGlet-Style (Text to Art)
\`\`\`
 _   _      _ _       
| | | | ___| | | ___  
| |_| |/ _ \\ | |/ _ \\ 
|  _  |  __/ | | (_) |
|_| |_|\\___|_|_|\\___/ 
\`\`\`

## FIGlet Fonts

FIGlet is the standard tool for generating ASCII text art with various fonts:

\`\`\`bash
# Install
brew install figlet      # macOS
apt install figlet       # Ubuntu

# Use
figlet "Hello World"
figlet -f slant "Hello"
figlet -f big "ASCII"

# List fonts
showfigfonts
\`\`\`

Popular fonts: banner, big, block, bubble, digital, doom, lean, mini, script, shadow, slant, small, smscript

## Generating ASCII Art in Code

### JavaScript
\`\`\`javascript
import figlet from 'figlet';

figlet.text('Hello', { font: 'Big' }, (err, data) => {
  console.log(data);
});

// Promise version
const text = await new Promise((resolve, reject) => {
  figlet.text('Hello', { font: 'Doom' }, (err, data) => {
    err ? reject(err) : resolve(data);
  });
});
\`\`\`

### Python
\`\`\`python
import pyfiglet

ascii_banner = pyfiglet.figlet_format("Hello World", font="slant")
print(ascii_banner)
\`\`\`

## Image to ASCII Conversion

Convert images to ASCII by mapping pixel brightness to characters:

\`\`\`javascript
// Brightness to character mapping
const CHARS = ' .:-=+*#%@';

function pixelToChar(brightness) {
  const index = Math.floor((brightness / 255) * (CHARS.length - 1));
  return CHARS[index];
}

// Process image pixel by pixel
// Dark pixel → dense char (@)
// Light pixel → sparse char ( )
\`\`\`

## ASCII Art in Modern Development

- **README files**: GitHub renders ASCII art in monospace
- **CLI tools**: Tool names/banners in terminal output
- **Code comments**: Section dividers and visual markers
- **Loading screens**: Boot splash screens on embedded systems
- **Error messages**: Make error messages memorable

\`\`\`javascript
// Common in CLI tools
console.log(\`
  ╔═══════════════════╗
  ║   MyApp v1.0.0    ║
  ╚═══════════════════╝
\`);
\`\`\`

→ Try the [ASCII Art Generator Tool](/ascii-text-drawer)`);

// ══════════════════════════════════════════════════════
// MISC / UTILITY CATEGORY
// ══════════════════════════════════════════════════════

ARTICLES.set('chronometer-guide', `## What Is a Chronometer?

A chronometer is a precision timekeeping instrument used to measure elapsed time. In the digital context, a chronometer (or stopwatch) measures durations — from individual operations to long-running processes.

## Stopwatch vs Timer vs Chronometer

| Tool | Measures | Direction | Use Case |
|---|---|---|---|
| Stopwatch | Elapsed time | Up from 0 | Racing, activities |
| Timer | Countdown | Down from set time | Cooking, alarms |
| Chronometer | Precise elapsed time | Up from 0 | Scientific, precision |

## Implementing a Browser Stopwatch

\`\`\`javascript
class Stopwatch {
  #startTime = null;
  #elapsed = 0;
  #running = false;
  #laps = [];

  start() {
    if (!this.#running) {
      this.#startTime = performance.now() - this.#elapsed;
      this.#running = true;
    }
  }

  pause() {
    if (this.#running) {
      this.#elapsed = performance.now() - this.#startTime;
      this.#running = false;
    }
  }

  reset() {
    this.#startTime = null;
    this.#elapsed = 0;
    this.#running = false;
    this.#laps = [];
  }

  lap() {
    this.#laps.push(this.getTime());
    return this.#laps;
  }

  getTime() {
    if (!this.#running) return this.#elapsed;
    return performance.now() - this.#startTime;
  }

  format(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return \`\${String(h).padStart(2,'0')}:\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}.\${String(cs).padStart(2,'0')}\`;
  }
}
\`\`\`

## High-Resolution Timing in JavaScript

\`\`\`javascript
// performance.now() gives microsecond precision
const start = performance.now();
// ... do work ...
const end = performance.now();
console.log(\`Took \${(end - start).toFixed(3)}ms\`);

// For profiling functions
function bench(fn, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - start) / iterations;
}

const avg = bench(() => JSON.stringify(largeObj));
console.log(\`JSON.stringify avg: \${avg.toFixed(3)}ms\`);
\`\`\`

## Timing in Different Contexts

### Node.js
\`\`\`javascript
// High-resolution timer (nanoseconds)
const [s, ns] = process.hrtime();
// ... do work ...
const [ds, dns] = process.hrtime([s, ns]);
console.log(\`Elapsed: \${ds}s \${dns / 1e6}ms\`);

// Simpler with hrtime.bigint()
const start = process.hrtime.bigint();
const elapsed = process.hrtime.bigint() - start;
console.log(\`\${elapsed / BigInt(1e6)}ms\`);
\`\`\`

### Python
\`\`\`python
import time

start = time.perf_counter()
# ... do work ...
elapsed = time.perf_counter() - start
print(f"Elapsed: {elapsed*1000:.3f}ms")
\`\`\`

→ Try the [Chronometer Tool](/chronometer)`);

ARTICLES.set('benchmark-builder-guide', `## What Is Performance Benchmarking?

Benchmarking measures the execution speed of code to compare implementations, identify bottlenecks, and verify optimizations. Good benchmarks are repeatable, statistically significant, and account for JIT warmup.

## Writing Reliable Benchmarks

### The Problem with Naive Timing

\`\`\`javascript
// ❌ Unreliable - JIT hasn't warmed up, garbage collection may run
const start = Date.now();
myFunction();
console.log(Date.now() - start, 'ms');
\`\`\`

### Using Benchmark.js
\`\`\`javascript
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('JSON.stringify', () => JSON.stringify(obj))
  .add('Manual serialize', () => manualSerialize(obj))
  .on('cycle', event => console.log(String(event.target)))
  .on('complete', function() {
    console.log('Fastest: ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });

// Output:
// JSON.stringify x 1,234,567 ops/sec ±0.85% (92 runs sampled)
// Manual serialize x 987,654 ops/sec ±1.23% (90 runs sampled)
// Fastest: JSON.stringify
\`\`\`

## Key Benchmark Concepts

### Operations Per Second (ops/sec)
How many times the function runs per second. Higher is better.

### Margin of Error (±%)
Statistical variance. Less than 2% indicates reliable results.

### Samples
Number of timing runs. More samples = more confidence.

### Warmup Runs
JIT compilers optimize hot code. Discard early measurements.

## Micro vs Macro Benchmarks

| Type | Scope | Example | Risk |
|---|---|---|---|
| Micro | Single operation | String concatenation | JIT may optimize away |
| Macro | Real workload | Full request cycle | Many variables |
| End-to-end | System | Page load time | Most realistic |

## Common Benchmark Pitfalls

### Dead Code Elimination
JIT may remove code that has no visible side effects:
\`\`\`javascript
// ❌ JIT may eliminate this entirely
function bench() {
  const sum = a + b;  // Result never used → optimized away
}

// ✅ Force result to be "used"
let result;
function bench() {
  result = a + b;
}
\`\`\`

### Garbage Collection Timing
GC pauses skew timing. Run benchmarks multiple times.

### CPU Frequency Scaling
Modern CPUs throttle under low load. Force performance mode:
\`\`\`bash
# Linux: disable CPU frequency scaling
cpupower frequency-set -g performance
\`\`\`

## Node.js Benchmark Example

\`\`\`javascript
// Comparing array building approaches
const iterations = 1_000_000;

// Test 1: Push
console.time('push');
const arr1 = [];
for (let i = 0; i < iterations; i++) arr1.push(i);
console.timeEnd('push');

// Test 2: Preallocate
console.time('preallocate');
const arr2 = new Array(iterations);
for (let i = 0; i < iterations; i++) arr2[i] = i;
console.timeEnd('preallocate');

// Test 3: Fill
console.time('fill');
const arr3 = Array.from({ length: iterations }, (_, i) => i);
console.timeEnd('fill');
\`\`\`

→ Try the [Benchmark Builder Tool](/benchmark-builder)`);

ARTICLES.set('device-information-guide', `## What Information Does Your Browser Expose?

Web browsers expose a surprising amount of device and environment information through JavaScript APIs and HTTP headers. Understanding this helps with responsive design, debugging, and privacy awareness.

## Browser Detection (Navigator API)

\`\`\`javascript
// User agent string (can be spoofed)
navigator.userAgent
// "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) 
//  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

navigator.platform      // "MacIntel", "Win32", "Linux x86_64"
navigator.language      // "en-US"
navigator.languages     // ["en-US", "en", "fr"]
navigator.cookieEnabled // true/false
navigator.onLine        // true/false
\`\`\`

## Screen Information

\`\`\`javascript
screen.width        // Physical screen width in pixels
screen.height       // Physical screen height
screen.availWidth   // Available width (minus taskbar)
screen.availHeight  // Available height
screen.colorDepth   // Color depth (24 or 32)
screen.pixelDepth   // Pixel depth

window.innerWidth   // Viewport width
window.innerHeight  // Viewport height
window.devicePixelRatio  // 2 for Retina, 1 for regular
\`\`\`

## Hardware Information

\`\`\`javascript
navigator.hardwareConcurrency  // Logical CPU cores
navigator.deviceMemory         // Approximate RAM in GB (rounded)
// Returns: 0.25, 0.5, 1, 2, 4, 8 (never exact for privacy)
\`\`\`

## Network Information

\`\`\`javascript
const connection = navigator.connection;
connection.effectiveType  // "4g", "3g", "2g", "slow-2g"
connection.downlink       // Mbps (max 10, rounded)
connection.rtt            // Round-trip time in ms
connection.saveData       // User has data saver on
\`\`\`

## Battery Status

\`\`\`javascript
const battery = await navigator.getBattery();
battery.level           // 0.0 to 1.0
battery.charging        // true/false
battery.chargingTime    // Seconds to full charge
battery.dischargingTime // Seconds remaining
\`\`\`

Note: Battery API removed from Firefox and Safari due to privacy concerns (battery level can be used for fingerprinting).

## Geolocation

\`\`\`javascript
// Requires user permission
navigator.geolocation.getCurrentPosition(
  position => {
    const { latitude, longitude, accuracy } = position.coords;
  },
  error => console.error(error.message),
  { enableHighAccuracy: true, timeout: 5000 }
);
\`\`\`

## Browser Fingerprinting

Combining device info creates a unique "fingerprint":
- Screen resolution + device pixel ratio
- Installed fonts (Canvas API)
- WebGL renderer info
- Audio context fingerprint
- Timezone offset
- Navigator plugins

Use [AmIUnique.org](https://amiunique.org) to see your browser's uniqueness.

→ Try the [Device Information Tool](/device-information)`);

ARTICLES.set('mime-types-guide', `## What Are MIME Types?

MIME (Multipurpose Internet Mail Extensions) types identify the format of a file or data. Originally designed for email attachments, they now govern how browsers, servers, and applications handle files of all kinds.

## MIME Type Format

\`\`\`
type/subtype[; parameter=value]

Examples:
text/html; charset=utf-8
application/json
image/png
video/mp4
multipart/form-data; boundary=----WebKitFormBoundary
\`\`\`

## Common MIME Types

### Text
| MIME Type | Extension | Use |
|---|---|---|
| text/html | .html | Web pages |
| text/css | .css | Stylesheets |
| text/javascript | .js | JavaScript (legacy) |
| text/plain | .txt | Plain text |
| text/csv | .csv | Comma-separated values |

### Application
| MIME Type | Extension | Use |
|---|---|---|
| application/json | .json | JSON data |
| application/javascript | .js | JavaScript |
| application/xml | .xml | XML data |
| application/pdf | .pdf | PDF documents |
| application/zip | .zip | ZIP archives |
| application/octet-stream | .bin | Binary data |
| application/x-www-form-urlencoded | — | Form submission |
| multipart/form-data | — | File upload forms |

### Images
| MIME Type | Extension |
|---|---|
| image/jpeg | .jpg, .jpeg |
| image/png | .png |
| image/gif | .gif |
| image/webp | .webp |
| image/svg+xml | .svg |
| image/avif | .avif |

### Video/Audio
| MIME Type | Extension |
|---|---|
| video/mp4 | .mp4 |
| video/webm | .webm |
| audio/mpeg | .mp3 |
| audio/wav | .wav |
| audio/ogg | .ogg |

## Setting MIME Types in Servers

### nginx
\`\`\`nginx
# nginx includes mime.types by default
include /etc/nginx/mime.types;

# Add custom types
types {
    application/wasm wasm;
    font/woff2 woff2;
}
\`\`\`

### Express.js
\`\`\`javascript
// Express sets Content-Type automatically based on file extension
res.sendFile('file.pdf');  // → Content-Type: application/pdf

// Override manually
res.setHeader('Content-Type', 'application/json; charset=utf-8');

// Custom MIME type registration
import mime from 'mime-types';
mime.define({ 'application/x-my-type': ['mytype'] });
\`\`\`

## Security Considerations

### Content-Type Sniffing
Browsers may "sniff" MIME types if the header is wrong — a security risk:
\`\`\`http
X-Content-Type-Options: nosniff
\`\`\`

### File Upload Validation
Never trust client-provided MIME types:
\`\`\`javascript
// Don't just check: file.mimetype === 'image/jpeg'
// Also check magic bytes
const { fileTypeFromBuffer } = await import('file-type');
const type = await fileTypeFromBuffer(buffer);
if (type?.mime !== 'image/jpeg') throw new Error('Not a JPEG');
\`\`\`

→ Try the [MIME Types Tool](/mime-types)`);

ARTICLES.set('user-agent-parser-guide', `## What Is a User Agent String?

A User Agent (UA) string is a text identifier sent by browsers and HTTP clients in the User-Agent header. It tells servers what software is making the request — browser type, version, operating system, and device type.

## Anatomy of a User Agent String

\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36

Breaking it down:
Mozilla/5.0              → Legacy compatibility token
(Windows NT 10.0; ...)   → OS information
AppleWebKit/537.36       → Browser engine
(KHTML, like Gecko)      → Gecko compatibility marker
Chrome/120.0.0.0         → Actual browser + version
Safari/537.36            → Another compatibility token
\`\`\`

## Why UA Strings Are Messy

UA strings have decades of backward-compatibility baggage. Every browser claims to be multiple other browsers to avoid being excluded from content:
- All Chrome UAs contain "Safari"
- All modern browsers contain "Mozilla/5.0"
- "KHTML, like Gecko" appears even in non-Gecko browsers

## Common User Agent Examples

**Chrome on Windows:**
\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
\`\`\`

**Safari on iPhone:**
\`\`\`
Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1
\`\`\`

**Googlebot:**
\`\`\`
Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
\`\`\`

## Parsing User Agents in Code

### JavaScript (ua-parser-js)
\`\`\`javascript
import UAParser from 'ua-parser-js';

const parser = new UAParser(req.headers['user-agent']);
const result = parser.getResult();

result.browser.name     // "Chrome"
result.browser.version  // "120.0.0.0"
result.os.name          // "Windows"
result.os.version       // "10"
result.device.type      // "mobile" | "tablet" | undefined
result.device.vendor    // "Apple"
result.device.model     // "iPhone"
\`\`\`

### Python (user-agents)
\`\`\`python
from user_agents import parse

ua_string = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0..."
ua = parse(ua_string)

ua.browser.family    # 'Mobile Safari'
ua.os.family         # 'iOS'
ua.device.family     # 'iPhone'
ua.is_mobile         # True
ua.is_tablet         # False
ua.is_pc             # False
ua.is_bot            # False
\`\`\`

## User-Agent Client Hints (Modern Alternative)

Chrome introduced Client Hints to replace the opaque UA string:

\`\`\`http
Sec-CH-UA: "Google Chrome";v="120", "Not-A.Brand";v="99"
Sec-CH-UA-Mobile: ?0
Sec-CH-UA-Platform: "Windows"
\`\`\`

\`\`\`javascript
// JavaScript API
navigator.userAgentData.brands     // [{brand: "Chrome", version: "120"}]
navigator.userAgentData.mobile     // false
navigator.userAgentData.platform   // "Windows"
\`\`\`

→ Try the [User Agent Parser Tool](/user-agent-parser)`);

ARTICLES.set('keycode-info-guide', `## What Are JavaScript Key Codes?

Key codes (keycodes) are numeric values that identify keyboard keys in JavaScript events. Understanding key events is essential for building accessible interfaces, keyboard shortcuts, and games.

## Modern Key Events

### KeyboardEvent Properties
\`\`\`javascript
document.addEventListener('keydown', (event) => {
  event.key      // "Enter", "a", "ArrowLeft", "F1"
  event.code     // "Enter", "KeyA", "ArrowLeft", "F1"
  event.keyCode  // 13, 65, 37, 112 (deprecated)
  event.which    // Same as keyCode (deprecated)
  
  event.ctrlKey  // Ctrl held
  event.shiftKey // Shift held
  event.altKey   // Alt/Option held
  event.metaKey  // Cmd (Mac) / Win key
  
  event.repeat   // Key is being held down
});
\`\`\`

### key vs code

- **\`event.key\`**: What the user typed (layout-dependent). Shift+A → "A", not "a"
- **\`event.code\`**: Physical key location (layout-independent). Always "KeyA" for the A key

\`\`\`javascript
// Use event.key for semantic meaning (what was typed)
if (event.key === 'Enter') submitForm();

// Use event.code for physical key position (keyboard shortcuts)
if (event.code === 'KeyZ' && event.ctrlKey) undo();
\`\`\`

## Common Key Values

### Navigation Keys
| event.key | event.code | keyCode |
|---|---|---|
| ArrowLeft | ArrowLeft | 37 |
| ArrowRight | ArrowRight | 39 |
| ArrowUp | ArrowUp | 38 |
| ArrowDown | ArrowDown | 40 |
| Home | Home | 36 |
| End | End | 35 |
| PageUp | PageUp | 33 |
| PageDown | PageDown | 34 |

### Control Keys
| event.key | event.code | keyCode |
|---|---|---|
| Enter | Enter | 13 |
| Backspace | Backspace | 8 |
| Delete | Delete | 46 |
| Tab | Tab | 9 |
| Escape | Escape | 27 |
| Space | Space | 32 |

## Keyboard Shortcut Implementation

\`\`\`javascript
// Keyboard shortcut manager
class KeyboardShortcuts {
  #bindings = new Map();

  bind(combo, handler) {
    this.#bindings.set(this.#normalize(combo), handler);
  }

  #normalize(combo) {
    return combo.toLowerCase()
      .split('+')
      .sort()
      .join('+');
  }

  handle(event) {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    
    const combo = this.#normalize(parts.join('+'));
    const handler = this.#bindings.get(combo);
    
    if (handler) {
      event.preventDefault();
      handler(event);
    }
  }
}

const shortcuts = new KeyboardShortcuts();
shortcuts.bind('ctrl+s', () => save());
shortcuts.bind('ctrl+shift+z', () => redo());
document.addEventListener('keydown', e => shortcuts.handle(e));
\`\`\`

→ Try the [Keycode Info Tool](/keycode-info)`);

ARTICLES.set('slugify-string-guide', `## What Is a Slug?

A slug is a URL-friendly version of a string. It contains only lowercase letters, numbers, and hyphens — no spaces, special characters, or accented letters. Slugs are used in URLs to create readable, SEO-friendly addresses.

\`\`\`
"Hello World! This is an Article"
→ "hello-world-this-is-an-article"

"Cómo aprender JavaScript en 2024"
→ "como-aprender-javascript-en-2024"
\`\`\`

## Slug Generation Rules

1. Convert to lowercase
2. Transliterate accented characters (é→e, ñ→n, ü→u)
3. Replace spaces and punctuation with hyphens
4. Remove remaining non-alphanumeric characters
5. Collapse multiple hyphens into one
6. Remove leading/trailing hyphens

## Implementation

### JavaScript
\`\`\`javascript
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                    // Decompose accented chars
    .replace(/[\\u0300-\\u036f]/g, '')    // Remove combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')        // Remove non-alphanumeric
    .replace(/[\\s_-]+/g, '-')            // Spaces and underscores to hyphens
    .replace(/^-+|-+$/g, '');            // Trim hyphens
}

slugify('Hello World!')          // "hello-world"
slugify('Café & Restaurant')     // "cafe-restaurant"
slugify('C++ Programming Guide') // "c-programming-guide"
\`\`\`

### Advanced with Library
\`\`\`javascript
import slugify from 'slugify';

slugify('Hello World', {
  replacement: '-',
  remove: /[*+~.()'"!:@]/g,
  lower: true,
  strict: false,
  locale: 'de',          // German-specific rules
  trim: true
});
\`\`\`

### Python
\`\`\`python
import re
import unicodedata

def slugify(text):
    # Normalize and decompose unicode
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = text.lower().strip()
    text = re.sub(r'[^\\w\\s-]', '', text)
    text = re.sub(r'[\\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

# Or use python-slugify library
from slugify import slugify
slugify('Hello World!')          # 'hello-world'
slugify('Ñoño')                  # 'nono'
slugify('C++ Guide', separator='-')  # 'c-guide'
\`\`\`

## Database Considerations

\`\`\`sql
-- Ensure uniqueness
CREATE UNIQUE INDEX idx_articles_slug ON articles(slug);

-- Handle collisions by appending counter
INSERT INTO articles (title, slug)
VALUES ('My Post', 'my-post')
ON CONFLICT (slug) DO UPDATE
SET slug = EXCLUDED.slug || '-' || nextval('slug_seq');
\`\`\`

## SEO Best Practices

- Keep slugs short (3-5 words ideal)
- Include the primary keyword
- Use hyphens not underscores (Google treats underscores as joined words)
- Avoid stop words: a, the, and, or, but
- Never change slugs after publishing (301 redirect if you must)

→ Try the [Slugify String Tool](/slugify-string)`);

ARTICLES.set('html-entities-guide', `## What Are HTML Entities?

HTML entities are special codes used to represent characters that have special meaning in HTML or that can't be easily typed. They prevent the browser from interpreting characters as HTML code.

## Why HTML Entities Are Needed

Certain characters must be escaped because they have special meaning in HTML:

\`\`\`html
<!-- Wrong: the < would be treated as a tag start -->
<p>5 < 10</p>

<!-- Correct: entity reference -->
<p>5 &lt; 10</p>
\`\`\`

## Common HTML Entities

### Essential Entities

| Character | Entity Name | Entity Number | Use |
|---|---|---|---|
| \`<\` | \`&lt;\` | \`&#60;\` | Less than |
| \`>\` | \`&gt;\` | \`&#62;\` | Greater than |
| \`&\` | \`&amp;\` | \`&#38;\` | Ampersand |
| \`"\` | \`&quot;\` | \`&#34;\` | Double quote |
| \`'\` | \`&apos;\` | \`&#39;\` | Single quote |
| \` \` | \`&nbsp;\` | \`&#160;\` | Non-breaking space |

### Typography

| Character | Entity | |
|---|---|---|
| © | \`&copy;\` | Copyright |
| ® | \`&reg;\` | Registered |
| ™ | \`&trade;\` | Trademark |
| — | \`&mdash;\` | Em dash |
| – | \`&ndash;\` | En dash |
| … | \`&hellip;\` | Ellipsis |
| « | \`&laquo;\` | Left angle quote |
| » | \`&raquo;\` | Right angle quote |
| ← | \`&larr;\` | Left arrow |
| → | \`&rarr;\` | Right arrow |

### Math

| Character | Entity |
|---|---|
| × | \`&times;\` |
| ÷ | \`&divide;\` |
| ± | \`&plusmn;\` |
| ≈ | \`&asymp;\` |
| ≠ | \`&ne;\` |
| ≤ | \`&le;\` |
| ≥ | \`&ge;\` |
| ∑ | \`&sum;\` |
| ∞ | \`&infin;\` |

## Encoding in Code

### JavaScript
\`\`\`javascript
// Escape HTML (prevent XSS)
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Using DOMParser (browser only)
function unescapeHtml(str) {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent;
}

// Or use he library
import he from 'he';
he.encode('<script>alert("xss")</script>')
// "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
he.decode('&lt;b&gt;Hello&lt;/b&gt;')  // "<b>Hello</b>"
\`\`\`

### Python
\`\`\`python
import html

html.escape('<script>alert("xss")</script>')
# '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

html.unescape('&lt;b&gt;Hello&lt;/b&gt;')
# '<b>Hello</b>'
\`\`\`

## XSS Prevention

HTML entity encoding is a key defense against Cross-Site Scripting (XSS):

\`\`\`javascript
// ❌ Vulnerable - injects raw HTML
element.innerHTML = userInput;

// ✅ Safe - auto-escapes entities
element.textContent = userInput;
\`\`\`

→ Try the [HTML Entities Tool](/html-entities)`);

ARTICLES.set('basic-auth-generator-guide', `## What Is HTTP Basic Authentication?

HTTP Basic Authentication is the simplest form of HTTP authentication. The client sends a username and password encoded in Base64 in the Authorization header. It's built into HTTP and supported by all clients.

\`\`\`http
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`

Decoded: \`dXNlcm5hbWU6cGFzc3dvcmQ=\` → \`username:password\`

## How Basic Auth Works

1. Client requests protected resource
2. Server responds: \`401 Unauthorized\` with \`WWW-Authenticate: Basic realm="API"\`
3. Client sends credentials: \`Authorization: Basic base64(username:password)\`
4. Server validates and returns resource or 401

\`\`\`
Client → GET /api/data
Server ← 401 WWW-Authenticate: Basic realm="My API"
Client → GET /api/data Authorization: Basic dXNlcjpwYXNz
Server ← 200 OK {"data": ...}
\`\`\`

## Generating Basic Auth Headers

\`\`\`javascript
// Browser
const token = btoa('username:password');
const header = \`Basic \${token}\`;

// Node.js
const token = Buffer.from('username:password').toString('base64');
const header = \`Basic \${token}\`;

// Fetch with Basic Auth
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': \`Basic \${btoa('user:pass')}\`
  }
});
\`\`\`

\`\`\`python
import base64
import requests

credentials = base64.b64encode(b'username:password').decode('ascii')
headers = {'Authorization': f'Basic {credentials}'}

# Or use requests built-in
response = requests.get('https://api.example.com', auth=('user', 'pass'))
\`\`\`

## Using Basic Auth in curl

\`\`\`bash
# Let curl handle the encoding
curl -u username:password https://api.example.com/data

# Manual header
curl -H "Authorization: Basic dXNlcjpwYXNz" https://api.example.com/data

# Interactive password prompt (hides password from shell history)
curl -u username https://api.example.com/data
\`\`\`

## Server Implementation

### nginx
\`\`\`nginx
location /private/ {
  auth_basic "Restricted Area";
  auth_basic_user_file /etc/nginx/.htpasswd;
}
\`\`\`

Generate htpasswd:
\`\`\`bash
htpasswd -c /etc/nginx/.htpasswd username
\`\`\`

### Express.js
\`\`\`javascript
function basicAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Basic ')) return res.status(401).send('Unauthorized');
  
  const [user, pass] = Buffer.from(auth.slice(6), 'base64')
    .toString().split(':');
  
  // Use timing-safe comparison in production!
  if (user === process.env.API_USER && pass === process.env.API_PASS) {
    return next();
  }
  res.status(401).send('Unauthorized');
}
\`\`\`

## Security Considerations

1. **Always use HTTPS** — Base64 is encoding, not encryption; credentials are readable if intercepted
2. **Avoid in browser-facing apps** — Credentials may be cached
3. **Prefer API keys or tokens** — More easily rotated without changing passwords
4. **Rate limiting** — Protect against brute-force attacks

→ Try the [Basic Auth Generator Tool](/basic-auth-generator)`);

ARTICLES.set('safelink-decoder-guide', `## What Are Safelinks?

Safelinks are URL wrappers used by email security systems (primarily Microsoft 365/Outlook) to scan links for malicious content before redirecting users. They replace original URLs with tracking/scanning URLs.

## How Microsoft Safelinks Work

When you receive an email in Microsoft 365, links are rewritten:

\`\`\`
Original:   https://example.com/important-doc
Safelink:   https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fimportant-doc&data=05%7C...
\`\`\`

When clicked:
1. User's browser goes to Microsoft's safelinks server
2. Microsoft scans the URL in real-time for threats
3. If safe, user is redirected to original URL
4. Microsoft logs the click for security analytics

## Decoding Safelinks

The original URL is in the \`url\` query parameter (percent-encoded):

\`\`\`javascript
function decodeSafelink(safelinkUrl) {
  const url = new URL(safelinkUrl);
  const encoded = url.searchParams.get('url');
  if (!encoded) return null;
  return decodeURIComponent(encoded);
}

decodeSafelink('https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com&data=...')
// "https://example.com"
\`\`\`

## Other Safelink Providers

| Provider | Pattern |
|---|---|
| Microsoft 365 | \`safelinks.protection.outlook.com\` |
| Proofpoint | \`urldefense.proofpoint.com\` |
| Mimecast | \`protect-*.mimecast.com\` |
| Barracuda | \`linkprotect.cudasvc.com\` |

### Proofpoint URL Defense Pattern
\`\`\`
https://urldefense.proofpoint.com/v3/__https://example.com__;!encoding!
\`\`\`

## When to Decode Safelinks

- **Sharing URLs**: Recipients don't need your security scanning service
- **Automation**: Scripts following links need the real URL
- **Archiving**: Store original URLs, not security-service-dependent ones
- **Debugging**: Verify where a link actually goes

## Privacy Implications

Safelinks let the security service track:
- Which links you click
- When you click them
- Your IP address
- How many times a link was clicked

If you're concerned about tracking, decode the URL before clicking or use a privacy-focused browser extension.

→ Try the [Safelink Decoder Tool](/safelink-decoder)`);

ARTICLES.set('wifi-qr-code-guide', `## WiFi QR Codes

A WiFi QR code encodes your network credentials so devices can join your network by scanning — no typing required. It's perfect for home networks, offices, cafés, and events.

## WiFi QR Code Format

The encoded string follows this format:
\`\`\`
WIFI:T:<auth>;S:<ssid>;P:<password>;H:<hidden>;;

Parameters:
T = Authentication type: WPA, WEP, nopass
S = Network SSID (name)
P = Password
H = Hidden network: true or false
\`\`\`

### Examples

**WPA/WPA2 network:**
\`\`\`
WIFI:T:WPA;S:MyHomeNetwork;P:MySecretPassword123;;
\`\`\`

**Open network (no password):**
\`\`\`
WIFI:T:nopass;S:CoffeeShopGuest;;;
\`\`\`

**Hidden network:**
\`\`\`
WIFI:T:WPA;S:HiddenNetwork;P:password;H:true;;
\`\`\`

## Generating WiFi QR Codes

### JavaScript
\`\`\`javascript
import QRCode from 'qrcode';

function wifiQRCode(ssid, password, authType = 'WPA', hidden = false) {
  const wifiString = \`WIFI:T:\${authType};S:\${escapeWifi(ssid)};P:\${escapeWifi(password)};H:\${hidden};;\`;
  return QRCode.toDataURL(wifiString, { errorCorrectionLevel: 'M' });
}

function escapeWifi(str) {
  // Escape special characters
  return str.replace(/([;,:"\\\\])/g, '\\\\$1');
}

const dataUrl = await wifiQRCode('MyNetwork', 'mypassword123');
\`\`\`

### Special Character Escaping

Some characters need escaping in the WiFi format:
| Character | Escaped |
|---|---|
| \`\\\\\` | \`\\\\\\\\\` |
| \`;\` | \`\\\\;\` |
| \`,\` | \`\\\\,\` |
| \`"\` | \`\\\\"\` |
| \`:\` (in value only) | \`\\\\:\` |

## Security Considerations

1. **Use WPA3 or WPA2** — WEP is broken and easily cracked
2. **Strong passwords** — At least 12 characters with mixed types
3. **Guest network** — Create a separate guest network for shared QR codes
4. **Rotate regularly** — Change password (and regenerate QR) periodically
5. **Physical security** — Place QR codes where you can see who scans them

## Scanning WiFi QR Codes

- **iOS 11+**: Open Camera app, point at QR code
- **Android 10+**: Long-press the QR code in Camera, or use Google Lens
- **macOS**: Open Image Capture or use iPhone camera

→ Try the [WiFi QR Code Generator Tool](/wifi-qr-code-generator)`);

ARTICLES.set('camera-recorder-guide', `## Browser-Based Camera Recording

Modern browsers can access cameras and microphones through the MediaDevices API, enabling recording directly in the browser without installing software. This technology powers video conferencing, screen recording, and media capture tools.

## Accessing the Camera

\`\`\`javascript
// Request camera + microphone access
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1920, min: 640 },
    height: { ideal: 1080, min: 480 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
});

// Display in a video element
videoElement.srcObject = stream;
videoElement.play();
\`\`\`

## Listing Available Devices

\`\`\`javascript
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
const mics = devices.filter(d => d.kind === 'audioinput');

// Switch camera
const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId: cameras[1].deviceId }  // Use second camera
});
\`\`\`

## Recording with MediaRecorder

\`\`\`javascript
class CameraRecorder {
  #recorder;
  #chunks = [];
  
  async start(stream) {
    this.#chunks = [];
    this.#recorder = new MediaRecorder(stream, {
      mimeType: this.getSupportedMimeType()
    });
    
    this.#recorder.ondataavailable = e => {
      if (e.data.size > 0) this.#chunks.push(e.data);
    };
    
    this.#recorder.start(100); // Collect data every 100ms
  }
  
  stop() {
    return new Promise(resolve => {
      this.#recorder.onstop = () => {
        const blob = new Blob(this.#chunks, { type: this.#recorder.mimeType });
        resolve(blob);
      };
      this.#recorder.stop();
    });
  }
  
  getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4'
    ];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  }
}
\`\`\`

## Downloading the Recording

\`\`\`javascript
async function downloadRecording(recorder) {
  const blob = await recorder.stop();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`recording-\${Date.now()}.webm\`;
  a.click();
  URL.revokeObjectURL(url);
}
\`\`\`

## Taking Photos (Screenshots)

\`\`\`javascript
function captureFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  return canvas.toDataURL('image/png');  // Base64 PNG
}
\`\`\`

## Browser Support & Permissions

All major browsers support getUserMedia. Important notes:
- **HTTPS required**: Microphone/camera won't work on HTTP (except localhost)
- **Permission prompt**: Users must explicitly grant access
- **Permission persistence**: Browsers remember choices per origin

→ Try the [Camera Recorder Tool](/camera-recorder)`);

// ══════════════════════════════════════════════════════
// CONVERSION / DATA FORMAT CATEGORY  
// ══════════════════════════════════════════════════════

ARTICLES.set('yaml-to-json-guide', `## YAML to JSON Conversion

YAML and JSON are both data serialization formats that share the same data model: scalars, sequences (arrays), and mappings (objects). Converting between them is lossless for most practical data.

## Format Comparison

**Same data, different syntax:**

\`\`\`yaml
# YAML
server:
  host: localhost
  port: 8080
  features:
    - auth
    - logging
  debug: true
\`\`\`

\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "features": ["auth", "logging"],
    "debug": true
  }
}
\`\`\`

## YAML Features Without JSON Equivalents

Some YAML features don't exist in JSON:

\`\`\`yaml
# Comments (lost when converting to JSON)
name: Alice  # This is Alice

# Anchors and aliases (merged on conversion)
defaults: &defaults
  timeout: 30
  retries: 3

service:
  <<: *defaults  # Expands to timeout: 30, retries: 3
  name: my-service
\`\`\`

## Converting in Code

### JavaScript
\`\`\`javascript
import yaml from 'js-yaml';

// YAML string to JS object
const yamlStr = \`
name: Alice
age: 30
hobbies:
  - reading
  - coding
\`;

const obj = yaml.load(yamlStr);
const json = JSON.stringify(obj, null, 2);

// JSON to YAML
const backToYaml = yaml.dump(JSON.parse(jsonStr), {
  indent: 2,
  lineWidth: 80,
  noRefs: true
});
\`\`\`

### Python
\`\`\`python
import yaml
import json

# YAML to JSON
with open('config.yaml') as f:
    data = yaml.safe_load(f)

with open('config.json', 'w') as f:
    json.dump(data, f, indent=2)

# JSON to YAML
with open('data.json') as f:
    data = json.load(f)

yaml_str = yaml.dump(data, default_flow_style=False, allow_unicode=True)
\`\`\`

## YAML Pitfalls When Converting

\`\`\`yaml
# These YAML values become surprising JSON values:
norway: NO          # → false (not the string "NO")
score: 1.0e3        # → 1000 (scientific notation)
version: 1.10       # → 1.1 (trailing zero removed)
octal: 0755         # → 493 (parsed as octal number)
\`\`\`

Always use explicit types to be safe:
\`\`\`yaml
norway: "NO"        # Force string
version: "1.10"     # Force string
\`\`\`

→ Try the [YAML to JSON Converter Tool](/yaml-to-json-converter)`);

ARTICLES.set('toml-to-json-guide', `## What Is TOML?

TOML (Tom's Obvious Minimal Language) is a configuration file format designed to be easy to read and write. It was created by Tom Preston-Werner (co-founder of GitHub) as an alternative to YAML's complexity and JSON's lack of comments.

TOML is the default configuration format for Rust's Cargo, Python's Poetry, and many other modern tools.

## TOML Syntax

\`\`\`toml
# Comments are supported

[database]
host = "localhost"
port = 5432
name = "mydb"

[server]
host = "0.0.0.0"
port = 8080
debug = true

[server.tls]
enabled = true
cert = "/etc/certs/server.crt"

[[users]]
name = "Alice"
role = "admin"

[[users]]
name = "Bob"
role = "user"
\`\`\`

## TOML Data Types

| Type | Example |
|---|---|
| String | \`name = "Alice"\` |
| Integer | \`port = 8080\` |
| Float | \`ratio = 3.14\` |
| Boolean | \`debug = true\` |
| Datetime | \`created = 2024-01-15T10:30:00Z\` |
| Array | \`tags = ["web", "api"]\` |
| Table | \`[section]\` |
| Array of Tables | \`[[items]]\` |

## Equivalent JSON

\`\`\`json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "debug": true,
    "tls": {
      "enabled": true,
      "cert": "/etc/certs/server.crt"
    }
  },
  "users": [
    { "name": "Alice", "role": "admin" },
    { "name": "Bob", "role": "user" }
  ]
}
\`\`\`

## Converting TOML in Code

### JavaScript
\`\`\`javascript
import { parse, stringify } from 'smol-toml';

const config = parse(tomlString);
const json = JSON.stringify(config, null, 2);

// JSON to TOML
const toml = stringify(JSON.parse(jsonString));
\`\`\`

### Python
\`\`\`python
import tomllib  # Python 3.11+ built-in
import json

with open('config.toml', 'rb') as f:
    config = tomllib.load(f)

print(json.dumps(config, indent=2, default=str))  # default=str handles datetime

# Writing TOML (requires tomli-w)
import tomli_w
with open('output.toml', 'wb') as f:
    tomli_w.dump(config, f)
\`\`\`

### Rust (native)
\`\`\`rust
use serde::{Deserialize, Serialize};
use toml;

#[derive(Deserialize, Serialize)]
struct Config {
    database: DatabaseConfig,
}

let config: Config = toml::from_str(toml_str)?;
let json = serde_json::to_string_pretty(&config)?;
\`\`\`

→ Try the [TOML to JSON Converter Tool](/toml-to-json)`);

ARTICLES.set('json-minify-guide', `## What Is JSON Minification?

JSON minification removes all unnecessary whitespace, newlines, and formatting from a JSON document, reducing its size. This is valuable for API responses, configuration files sent over the network, and storage optimization.

## Before and After

**Formatted JSON (247 bytes):**
\`\`\`json
{
  "user": {
    "id": 42,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "roles": [
      "admin",
      "user"
    ],
    "active": true
  }
}
\`\`\`

**Minified JSON (105 bytes — 57% smaller):**
\`\`\`json
{"user":{"id":42,"name":"Alice Johnson","email":"alice@example.com","roles":["admin","user"],"active":true}}
\`\`\`

## Minification in Code

### JavaScript (single line)
\`\`\`javascript
// Parse then re-stringify without indentation
const minified = JSON.stringify(JSON.parse(jsonString));

// Keep valid JSON but remove extra whitespace more aggressively
const minified = JSON.stringify(JSON.parse(jsonString), null, 0);
\`\`\`

### Node.js Script
\`\`\`javascript
import { readFileSync, writeFileSync } from 'fs';

const input = readFileSync('data.json', 'utf-8');
const minified = JSON.stringify(JSON.parse(input));
writeFileSync('data.min.json', minified);

const savings = ((input.length - minified.length) / input.length * 100).toFixed(1);
console.log(\`Reduced by \${savings}%: \${input.length} → \${minified.length} bytes\`);
\`\`\`

### Python
\`\`\`python
import json

with open('data.json') as f:
    data = json.load(f)

minified = json.dumps(data, separators=(',', ':'))
# separators=(',', ':') removes spaces after , and :
\`\`\`

### Command Line
\`\`\`bash
# Using jq (highly recommended)
jq -c . input.json > output.min.json

# Using Python
python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)),end='')" < input.json

# Using Node.js
node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'))))" < input.json
\`\`\`

## When to Minify

| Scenario | Minify? | Why |
|---|---|---|
| API responses | ✅ Yes | Reduces bandwidth |
| Config files in VCS | ❌ No | Readability matters |
| localStorage/cookies | ✅ Yes | Size limits |
| Log files | ❌ No | Debugging readability |
| CDN-served files | ✅ Yes | Performance |
| Build artifacts | ✅ Yes | Bundle size |

## Gzip vs Minification

Both reduce size but work differently:

\`\`\`
Original:   247 bytes
Minified:   105 bytes (57% reduction)
Gzipped:    130 bytes (47% reduction)  
Both:        85 bytes (66% reduction)
\`\`\`

Minification and gzip are complementary — use both.

→ Try the [JSON Minify Tool](/json-minify)`);

ARTICLES.set('base64-file-converter-guide', `## Converting Files with Base64

Base64 encoding converts binary files (images, PDFs, audio) into ASCII text. This allows embedding binary content directly in text-based formats like HTML, CSS, JSON, or XML — without separate file downloads.

## How Base64 File Encoding Works

Every 3 bytes of binary data become 4 base64 characters:

\`\`\`
Binary:  01001000 01000101 01001100
Groups:  010010 000100 010001 001100
Base64:  S      E      R      M
Output:  "SERM"
\`\`\`

A 1KB binary file becomes ~1.37KB in base64 (33% larger).

## Encoding Files in JavaScript

\`\`\`javascript
// Browser: File → Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);  // "data:image/png;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract just the base64 data (without data URI prefix)
const dataUrl = await fileToBase64(file);
const base64 = dataUrl.split(',')[1];

// Decode Base64 → Blob → Download
function downloadBase64File(base64, mimeType, filename) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
\`\`\`

## Node.js File Encoding

\`\`\`javascript
import { readFileSync, writeFileSync } from 'fs';

// File to Base64
const imageBuffer = readFileSync('image.png');
const base64 = imageBuffer.toString('base64');

// Base64 to File
const decoded = Buffer.from(base64, 'base64');
writeFileSync('output.png', decoded);

// Create data URI
const dataUri = \`data:image/png;base64,\${base64}\`;
\`\`\`

## Using Data URIs

Data URIs embed files directly in HTML/CSS:

\`\`\`html
<!-- Embedded image (no HTTP request) -->
<img src="data:image/png;base64,iVBORw0KGgoAAAANS..." alt="Logo">

<!-- CSS background -->
<style>
.icon {
  background-image: url('data:image/svg+xml;base64,...');
}
</style>
\`\`\`

## Practical Applications

| Use Case | Example |
|---|---|
| Email attachments | Images in HTML email (MIME multipart) |
| JSON APIs | Sending images in API responses |
| Config files | Embedding certificates in YAML/JSON |
| Web Workers | Passing binary data as strings |
| CSS sprites | Inlining small icons |

## File Size Limits

- Data URIs in HTML: No hard limit, but >100KB impacts performance
- localStorage: ~5MB total per origin
- URL bar: ~2000 chars max (not suitable for files)
- JSON: Practical limit ~10MB for reasonable performance

→ Try the [Base64 File Converter Tool](/base64-file-converter)`);

ARTICLES.set('pdf-signature-checker-guide', `## What Is a PDF Digital Signature?

A PDF digital signature is a cryptographic mechanism that verifies both the authenticity (who signed it) and integrity (content unchanged) of a PDF document. It's the digital equivalent of a notarized signature.

## How PDF Signatures Work

1. **Signing process**:
   - Compute a hash (SHA-256) of the PDF content
   - Encrypt the hash with the signer's private key
   - Embed the encrypted hash + signer's certificate in the PDF

2. **Verification process**:
   - Decrypt the embedded hash using signer's public key (from certificate)
   - Recompute the hash of the current document
   - If hashes match: document is unchanged ✅

\`\`\`
PDF Content → SHA-256 → Hash
Private Key → Encrypt Hash → Signature
Certificate → Embed in PDF
\`\`\`

## Signature Validity Status

| Status | Meaning |
|---|---|
| Valid | Signature checks out; document unmodified |
| Invalid | Document was modified after signing |
| Unknown | Certificate issuer not trusted by your system |
| Expired | Signer's certificate has expired |
| Revoked | Certificate was revoked by issuer |

## Types of PDF Signatures

### Approval Signature
Standard signature indicating approval of the document content.

### Certification Signature
More restrictive — specifies what changes are allowed after signing (none, form filling, annotations only).

### Timestamp Signature
Proves the document existed at a specific time (via a Time Stamping Authority).

## Checking Signatures with Tools

### pdftk
\`\`\`bash
pdftk signed.pdf dump_data_fields | grep -i sign
\`\`\`

### OpenSSL
\`\`\`bash
# Extract PKCS#7 signature from PDF
openssl pkcs7 -in signature.p7 -print_certs -text
\`\`\`

### Python (pypdf)
\`\`\`python
from pypdf import PdfReader

reader = PdfReader("signed.pdf")
fields = reader.get_fields()

for name, field in fields.items():
    if field.get('/FT') == '/Sig':
        sig = field['/V']
        print(f"Signed by: {sig.get('/Name')}")
        print(f"Reason: {sig.get('/Reason')}")
        print(f"Location: {sig.get('/Location')}")
        print(f"Date: {sig.get('/M')}")
\`\`\`

## LTV (Long-Term Validation)

LTV signatures embed all certificates and revocation data needed for future validation, ensuring a signature can be verified even after certificates expire:

- Certificate chain embedded
- CRL (Certificate Revocation List) or OCSP responses embedded
- Timestamps from trusted TSA

## Electronic Signature vs Digital Signature

| Feature | E-Signature | Digital Signature |
|---|---|---|
| Technology | Image or click | Cryptographic |
| Authentication | Weak | Strong (PKI) |
| Tamper detection | None | Yes |
| Legal standing | Varies | Strong |
| Examples | DocuSign image | Adobe Acrobat, PKI |

→ Try the [PDF Signature Checker Tool](/pdf-signature-checker)`);

ARTICLES.set('random-port-generator-guide', `## What Are Network Ports?

A network port is a 16-bit number (0-65535) that identifies a specific process or service on a computer. IP addresses identify machines; ports identify specific services running on those machines.

\`\`\`
192.168.1.100:8080
      │         │
   IP address  port
  (machine)  (service)
\`\`\`

## Port Ranges

| Range | Name | Who Uses It |
|---|---|---|
| 0 – 1023 | Well-known ports | Standard protocols (requires root) |
| 1024 – 49151 | Registered ports | Application software |
| 49152 – 65535 | Dynamic/ephemeral | OS assigns for outbound connections |

## Well-Known Port Numbers

| Port | Protocol | Service |
|---|---|---|
| 21 | TCP | FTP |
| 22 | TCP | SSH |
| 25 | TCP | SMTP |
| 53 | TCP/UDP | DNS |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |
| 6379 | TCP | Redis |
| 27017 | TCP | MongoDB |
| 8080 | TCP | HTTP (alternative) |
| 9090 | TCP | Prometheus |

## Generating Random Ports

When starting development servers or running tests, you need an available port:

\`\`\`javascript
// Simple random port in dynamic range
function randomPort() {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
}

// Find an actually available port (Node.js)
import net from 'net';

function getAvailablePort(preferred = 0) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(preferred, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

const port = await getAvailablePort(3000);  // Uses 3000 if available, else random
\`\`\`

### Python
\`\`\`python
import socket

def get_available_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))        # Port 0 = OS assigns free port
        return s.getsockname()[1]

port = get_available_port()
print(f"Using port: {port}")
\`\`\`

## Checking Port Availability

\`\`\`bash
# Check if port is in use
lsof -i :8080                    # macOS/Linux
netstat -an | grep 8080          # All platforms

# Kill process on port
kill $(lsof -t -i:8080)          # macOS
fuser -k 8080/tcp                # Linux
\`\`\`

## Port Scanning

\`\`\`bash
# Scan open ports on a host
nmap -sT -p 1-1000 192.168.1.1   # TCP scan, ports 1-1000
nmap -sU -p 53,161 192.168.1.1   # UDP scan specific ports
\`\`\`

→ Try the [Random Port Generator Tool](/random-port-generator)`);

ARTICLES.set('json-viewer-guide', `## What Is a JSON Viewer?

A JSON viewer renders raw JSON data in a human-readable, interactive tree format. It allows exploring nested structures, expanding/collapsing nodes, and quickly navigating complex JSON documents.

## Why JSON Is Hard to Read Raw

\`\`\`json
{"users":[{"id":1,"name":"Alice","email":"alice@example.com","roles":["admin","user"],"address":{"street":"123 Main St","city":"Seattle"}},{"id":2,"name":"Bob","email":"bob@example.com","roles":["user"],"address":{"street":"456 Oak Ave","city":"Portland"}}]}
\`\`\`

A JSON viewer transforms this into an explorable tree:
\`\`\`
▾ Object {2 keys}
  ▾ users: Array[2]
    ▾ [0]: Object {5 keys}
        id: 1
        name: "Alice"
        email: "alice@example.com"
      ▾ roles: Array[2]
          [0]: "admin"
          [1]: "user"
      ▾ address: Object {2 keys}
          street: "123 Main St"
          city: "Seattle"
    ▾ [1]: Object
        ...
\`\`\`

## JSON Path Navigation

JSON viewers often support JSONPath queries:

\`\`\`
$.users[0].name                → "Alice"
$.users[*].email               → ["alice@...", "bob@..."]
$.users[?(@.roles[0]=="admin")] → [Alice's object]
$.users..city                  → ["Seattle", "Portland"]
\`\`\`

## Building a JSON Tree View

\`\`\`javascript
function renderJSON(data, key = 'root', depth = 0) {
  const indent = '  '.repeat(depth);
  const type = Array.isArray(data) ? 'array' : typeof data;
  
  if (data === null) return \`\${indent}\${key}: null\`;
  
  if (type !== 'object') {
    const value = typeof data === 'string' ? \`"\${data}"\` : data;
    return \`\${indent}\${key}: \${value}\`;
  }
  
  const entries = Object.entries(data);
  const children = entries.map(([k, v]) => renderJSON(v, k, depth + 1)).join('\\n');
  const bracket = Array.isArray(data) ? ['[', ']'] : ['{', '}'];
  
  return [\`\${indent}\${key}: \${bracket[0]}\`, children, \`\${indent}\${bracket[1]}\`].join('\\n');
}
\`\`\`

## JSON Schema Validation

JSON viewers often include schema validation:

\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "email"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0, "maximum": 150 }
  }
}
\`\`\`

\`\`\`javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);
if (!valid) console.error(validate.errors);
\`\`\`

## jq: Command-Line JSON Viewer

\`\`\`bash
# Pretty-print
cat data.json | jq .

# Extract specific fields
jq '.users[] | {name, email}' users.json

# Filter
jq '.users[] | select(.roles[] == "admin")' users.json

# Transform
jq '[.users[] | {id: .id, fullName: .name}]' users.json
\`\`\`

→ Try the [JSON Viewer Tool](/json-viewer)`);

ARTICLES.set('xml-to-json-guide', `## Converting XML to JSON

XML and JSON represent the same kinds of hierarchical data, but with different syntax. Converting between them is a common need in system integration, API modernization, and data processing.

## The Mapping Challenge

XML and JSON don't have a 1:1 mapping. XML has features JSON lacks:

| XML Feature | JSON Representation |
|---|---|
| Attributes | Object properties with \`@\` prefix (or merged) |
| Text nodes | \`#text\` property or direct value |
| Multiple tags with same name | Array |
| Namespaces | Usually stripped or prefixed |
| Comments | Typically discarded |
| CDATA | Treated as text |

## Conversion Examples

**Simple XML:**
\`\`\`xml
<user id="42">
  <name>Alice</name>
  <email>alice@example.com</email>
</user>
\`\`\`

**Resulting JSON (common approach):**
\`\`\`json
{
  "user": {
    "@id": "42",
    "name": "Alice",
    "email": "alice@example.com"
  }
}
\`\`\`

**XML with repeated elements:**
\`\`\`xml
<users>
  <user><name>Alice</name></user>
  <user><name>Bob</name></user>
</users>
\`\`\`

\`\`\`json
{
  "users": {
    "user": [
      { "name": "Alice" },
      { "name": "Bob" }
    ]
  }
}
\`\`\`

## Programmatic Conversion

### JavaScript
\`\`\`javascript
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true
});

const json = parser.parse(xmlString);

// Back to XML
const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});
const backToXml = builder.build(json);
\`\`\`

### Python
\`\`\`python
import xmltodict
import json

# XML to JSON
with open('data.xml') as f:
    data = xmltodict.parse(f.read())

json_str = json.dumps(data, indent=2)

# JSON to XML
with open('data.json') as f:
    data = json.load(f)

xml_str = xmltodict.unparse(data, pretty=True)
\`\`\`

### Command Line (using xq)
\`\`\`bash
# Install xq (XML companion to jq)
pip install yq

# Convert
cat data.xml | xq .

# Query XML with jq syntax
cat pom.xml | xq '.project.dependencies.dependency[] | .artifactId'
\`\`\`

## Handling SOAP Responses

SOAP APIs return XML. Converting to JSON simplifies processing:

\`\`\`xml
<soap:Envelope>
  <soap:Body>
    <GetUserResponse>
      <User>
        <Id>42</Id>
        <Name>Alice</Name>
      </User>
    </GetUserResponse>
  </soap:Body>
</soap:Envelope>
\`\`\`

\`\`\`javascript
// Extract the useful part
const result = xml2json(soapResponse);
const user = result['soap:Envelope']['soap:Body']['GetUserResponse']['User'];
\`\`\`

→ Try the [XML to JSON Converter Tool](/xml-to-json)`);

ARTICLES.set('json-to-csv-guide', `## Converting JSON to CSV

CSV (Comma-Separated Values) is the universal format for tabular data — supported by Excel, Google Sheets, databases, and virtually every data tool. Converting JSON arrays to CSV makes data accessible to non-developers.

## JSON vs CSV for Tabular Data

**JSON (nested, flexible):**
\`\`\`json
[
  {"id": 1, "name": "Alice", "city": "Seattle", "age": 30},
  {"id": 2, "name": "Bob", "city": "Portland", "age": 25}
]
\`\`\`

**CSV (flat, universal):**
\`\`\`csv
id,name,city,age
1,Alice,Seattle,30
2,Bob,Portland,25
\`\`\`

## Basic Conversion

\`\`\`javascript
function jsonToCSV(jsonArray) {
  if (!jsonArray.length) return '';
  
  // Get headers from first object
  const headers = Object.keys(jsonArray[0]);
  
  // Build CSV rows
  const rows = jsonArray.map(obj =>
    headers.map(h => {
      const value = obj[h] ?? '';
      // Escape values containing commas, quotes, or newlines
      if (typeof value === 'string' && /[,"\n\r]/.test(value)) {
        return \`"\${value.replace(/"/g, '""')}"\`;
      }
      return value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

const csv = jsonToCSV([
  { name: "Alice, Jr.", age: 30, note: 'She said "hi"' },
  { name: "Bob", age: 25, note: "Normal" }
]);
\`\`\`

## Handling Nested Objects

\`\`\`javascript
function flattenObject(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, fullKey));
    } else {
      acc[fullKey] = Array.isArray(value) ? value.join(';') : value;
    }
    return acc;
  }, {});
}

// Before flattening
{ "user": { "name": "Alice", "address": { "city": "Seattle" } } }

// After flattening
{ "user.name": "Alice", "user.address.city": "Seattle" }
\`\`\`

## CSV Escaping Rules (RFC 4180)

\`\`\`
1. Fields containing commas MUST be wrapped in double quotes
2. Fields containing double quotes MUST be wrapped in double quotes
3. Double quotes inside fields MUST be escaped as ""
4. Fields containing newlines MUST be wrapped in double quotes

Examples:
"Hello, World"   → Field contains comma → quoted: "Hello, World"
She said "hi"    → Contains quotes → "She said ""hi"""
Multi
line             → Contains newline → "Multi\nline"
\`\`\`

## Using Papa Parse (JavaScript)

\`\`\`javascript
import Papa from 'papaparse';

// JSON to CSV
const csv = Papa.unparse(jsonArray, {
  quotes: true,           // Force all fields to be quoted
  delimiter: ',',
  header: true,
  newline: '\r\n'         // RFC 4180 uses CRLF
});

// CSV to JSON
const result = Papa.parse(csvString, {
  header: true,
  dynamicTyping: true,    // Auto-convert numbers and booleans
  skipEmptyLines: true
});
\`\`\`

→ Try the [JSON to CSV Converter Tool](/json-to-csv)`);

ARTICLES.set('number-formatter-guide', `## Why Number Formatting Matters

The same number can look very different depending on locale and context:

\`\`\`
1234567.89

US English:    1,234,567.89     (comma thousands, period decimal)
German:        1.234.567,89     (period thousands, comma decimal)
French:        1 234 567,89     (space thousands, comma decimal)
Indian:        12,34,567.89     (Indian grouping system)
Swiss:         1'234'567.89     (apostrophe thousands)
\`\`\`

## JavaScript Intl.NumberFormat

The built-in \`Intl.NumberFormat\` API handles locale-specific formatting:

\`\`\`javascript
const num = 1234567.89;

// Currency
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(num)
// "$1,234,567.89"

new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
}).format(num)
// "1.234.567,89 €"

new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY'
}).format(num)
// "¥1,234,568"

// Percentage
new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1
}).format(0.1234)
// "12.3%"

// Compact notation
new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567)
// "1.2M"

// Scientific notation
new Intl.NumberFormat('en-US', {
  notation: 'scientific'
}).format(1234567)
// "1.235E6"
\`\`\`

## Precision Control

\`\`\`javascript
// Significant digits (total precision)
new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 4
}).format(1234567.89)    // "1,235,000"

// Fraction digits (decimal places)
new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(1.5)           // "1.50"
\`\`\`

## Financial Formatting

\`\`\`javascript
function formatCurrency(amount, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(amount);
}

formatCurrency(1234.5, 'USD', 'en-US')  // "$1,234.50"
formatCurrency(1234.5, 'GBP', 'en-GB')  // "£1,234.50"
formatCurrency(1234.5, 'CNY', 'zh-CN')  // "¥1,234.50"
\`\`\`

## Human-Readable File Sizes

\`\`\`javascript
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

formatBytes(1024)           // "1 KB"
formatBytes(1048576)        // "1 MB"
formatBytes(1073741824)     // "1 GB"
formatBytes(5242880, 1)     // "5 MB"
\`\`\`

→ Try the [Number Formatter Tool](/number-formatter)`);

ARTICLES.set('phone-formatter-guide', `## International Phone Number Formats

Phone numbers vary dramatically by country — different lengths, area code formats, country codes, and notation conventions. Proper phone number formatting and validation is essential for global applications.

## E.164 Format (The Standard)

The E.164 international standard defines the canonical format for phone numbers:

\`\`\`
+[country code][subscriber number]

+12125551234    US: +1, area code 212, number 5551234
+442071234567   UK: +44, area code 20, number 71234567
+81312345678    Japan: +81, area code 3, number 12345678
+8613912345678  China: +86, 139 12345678
\`\`\`

No spaces, dashes, or parentheses — just + and digits.

## Country-Specific Display Formats

| Country | E.164 | Local Display |
|---|---|---|
| US/Canada | +12125551234 | (212) 555-1234 |
| UK | +442071234567 | 020 7123 4567 |
| Germany | +4930123456 | 030 123456 |
| France | +33123456789 | 01 23 45 67 89 |
| Japan | +81312345678 | 03-1234-5678 |
| Brazil | +5511987654321 | (11) 98765-4321 |
| India | +919876543210 | 098765 43210 |

## Parsing with libphonenumber

The authoritative library for phone parsing is Google's libphonenumber:

\`\`\`javascript
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Parse with explicit country
const phone = parsePhoneNumber('(212) 555-1234', 'US');
phone.countryCallingCode  // "1"
phone.nationalNumber      // "2125551234"
phone.number              // "+12125551234" (E.164)
phone.country             // "US"

// Format
phone.format('NATIONAL')      // "(212) 555-1234"
phone.format('INTERNATIONAL') // "+1 212 555 1234"
phone.format('E.164')         // "+12125551234"
phone.format('RFC3966')       // "tel:+1-212-555-1234"

// Validate
isValidPhoneNumber('+12125551234')   // true
isValidPhoneNumber('+1212555')       // false (too short)
\`\`\`

### Python
\`\`\`python
import phonenumbers

phone = phonenumbers.parse("(212) 555-1234", "US")

phonenumbers.is_valid_number(phone)     # True
phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)
# "+12125551234"
phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.NATIONAL)
# "(212) 555-1234"
phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
# "+1 212-555-1234"

# Get carrier and location
from phonenumbers import carrier, geocoder
carrier.name_for_number(phone, "en")     # "Verizon"
geocoder.description_for_number(phone, "en")  # "New York"
\`\`\`

## Input Masking

For better UX, format phone numbers as users type:

\`\`\`javascript
function formatUSPhone(value) {
  const digits = value.replace(/\\D/g, '').substring(0, 10);
  if (digits.length >= 6) {
    return \`(\${digits.slice(0,3)}) \${digits.slice(3,6)}-\${digits.slice(6)}\`;
  } else if (digits.length >= 3) {
    return \`(\${digits.slice(0,3)}) \${digits.slice(3)}\`;
  }
  return digits;
}
\`\`\`

→ Try the [Phone Parser & Formatter Tool](/phone-parser-and-formatter)`);

ARTICLES.set('iban-validator-guide', `## What Is an IBAN?

IBAN (International Bank Account Number) is a standardized international numbering system for bank accounts. Developed by the European Committee for Banking Standards, it ensures accurate identification of accounts across borders, reducing transfer errors.

## IBAN Structure

\`\`\`
GB29 NWBK 6016 1331 9268 19

GB    29      NWBK 6016 1331 9268 19
│      │       │
│      │       └── Basic Bank Account Number (BBAN)
│      └────────── Check digits (2 digits)
└───────────────── Country code (2 letters)
\`\`\`

## IBAN Validation Algorithm

\`\`\`javascript
function validateIBAN(iban) {
  // 1. Remove spaces and convert to uppercase
  const clean = iban.replace(/\\s/g, '').toUpperCase();
  
  // 2. Move first 4 chars to end
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  
  // 3. Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numeric = rearranged.replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
  
  // 4. Compute MOD 97 — valid if result is 1
  let remainder = 0;
  for (const char of numeric) {
    remainder = (remainder * 10 + parseInt(char)) % 97;
  }
  
  return remainder === 1;
}

validateIBAN('GB29 NWBK 6016 1331 9268 19')  // true
validateIBAN('GB00 NWBK 6016 1331 9268 19')  // false
\`\`\`

## Country-Specific IBAN Formats

| Country | Length | Example |
|---|---|---|
| Germany (DE) | 22 | DE89 3704 0044 0532 0130 00 |
| UK (GB) | 22 | GB29 NWBK 6016 1331 9268 19 |
| France (FR) | 27 | FR76 3000 6000 0112 3456 7890 189 |
| Netherlands (NL) | 18 | NL91 ABNA 0417 1643 00 |
| Spain (ES) | 24 | ES91 2100 0418 4502 0005 1332 |
| Italy (IT) | 27 | IT60 X054 2811 1010 0000 0123 456 |
| Sweden (SE) | 24 | SE45 5000 0000 0583 9825 7466 |

IBANs are currently used in 79 countries and can be up to 34 characters long.

## SWIFT/BIC Codes

IBANs are often paired with SWIFT/BIC codes:

\`\`\`
DEUTDEDB

DEUT  DE  DB
│      │   │
│      │   └── Branch code (optional)
│      └────── Country code
└───────────── Bank code (4 chars)
\`\`\`

Full SWIFT code: 8 or 11 characters
\`\`\`
DEUTDEDBFRA  →  Deutsche Bank, Germany, Frankfurt branch
\`\`\`

## Using IBAN in Payments

\`\`\`javascript
const payment = {
  creditorIBAN: 'DE89370400440532013000',
  creditorBIC: 'COBADEFFXXX',
  amount: 1500.00,
  currency: 'EUR',
  reference: 'Invoice #2024-001',
  executionDate: '2024-01-15'
};
\`\`\`

→ Try the [IBAN Validator Tool](/iban-validator-and-parser)`);

// ══════════════════════════════════════════════════════
// MAIN EXECUTION LOGIC
// ══════════════════════════════════════════════════════

// Apply all article updates
let fileContent = fs.readFileSync(TARGET, 'utf-8');
let successCount = 0;
let failCount = 0;

for (const [slug, content] of ARTICLES.entries()) {
  const escaped = escapeForTS(content);
  
  // Find the article block by slug
  const slugPattern = new RegExp(
    `(\\{[^\\{]*?slug: '${slug}'[^\\}]*?content: \`)([\\s\\S]*?)(\`[^\\}]*?\\},)`,
    'g'
  );
  
  let replaced = false;
  fileContent = fileContent.replace(slugPattern, (match, before, oldContent, after) => {
    replaced = true;
    return before + escaped + after;
  });
  
  if (replaced) {
    console.log(`✅ Updated: ${slug}`);
    successCount++;
  } else {
    console.warn(`⚠️  Not found: ${slug}`);
    failCount++;
  }
}

fs.writeFileSync(TARGET, fileContent, 'utf-8');
console.log(`\n📝 Done! Updated ${successCount} articles, ${failCount} not found.`);
