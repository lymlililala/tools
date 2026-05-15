/**
 * Part 1: Expand articles for Crypto category (slugs 1-11)
 * and Converter category (slugs 12-20)
 */
import { readFileSync, writeFileSync } from 'fs';

function escapeForTS(content) {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

const newContents = new Map();

// ─── Crypto articles ──────────────────────────────────────────

newContents.set('what-is-token-generator', `## What Is a Random Token Generator?

A **random token generator** creates unpredictable, high-entropy strings used as identifiers in modern software systems. Unlike passwords chosen by humans, tokens are machine-generated and designed to satisfy strict security requirements: they must be unique across all instances, sufficiently long to resist guessing, and statistically random so that no partial information about one token reveals anything about another.

Tokens power nearly every aspect of authenticated web communication. When you log into a website, the server mints a session token and stores it in a cookie. When a developer integrates a third-party API, the vendor issues an API key — a token. When a web form protects against cross-site request forgery (CSRF), it embeds a hidden token that the server verifies before processing the submission.

## Why Not Just Use a Password or UUID?

Passwords are designed to be memorized by humans, which means they're short and follow predictable patterns. A token, by contrast, can be 64 or 128 characters of pure randomness. UUIDs (version 4) are random, but only 122 bits of entropy and formatted with hyphens — adequate for identifiers but not ideal for secret tokens exposed in headers or URLs.

A purpose-built token generator lets you control length, character set, and entropy budget precisely.

## Common Token Use Cases

- **API Keys** — Authenticate third-party services without exposing user passwords. Typically 32–64 characters, often prefixed (e.g., \`sk_live_...\`) for easy identification.
- **Session Tokens** — Track authenticated users across HTTP requests. OWASP recommends at least 128 bits (22+ base64url characters).
- **CSRF Tokens** — Embedded in forms to prevent cross-site request forgery. Must be unique per session and verified server-side.
- **Password Reset Links** — One-time-use URLs emailed to users. Should expire within 15–60 minutes.
- **Webhook Secrets** — Sign and verify payloads between services. GitHub, Stripe, and Slack all use HMAC signatures with a shared secret token.
- **Invite Codes** — Short random tokens that grant access to a resource once.
- **Nonces** — "Number used once" values that prevent replay attacks in OAuth and cryptographic protocols.
- **Two-Factor Backup Codes** — Emergency codes stored by users in case they lose their authenticator device.

## How Does This Tool Generate Tokens?

This token generator uses the browser's built-in **Web Crypto API** (\`crypto.getRandomValues()\`) — the same standard used in professional security libraries. The values come from the operating system's entropy pool (hardware events, timing jitter, etc.), making them cryptographically secure.

You can configure:
- **Length** — from 8 to 512 characters
- **Character sets** — uppercase letters (A–Z), lowercase letters (a–z), digits (0–9), and symbols (!@#$%^&*)
- **Output format** — plain text, hex, base64, or base64url

## How Long Should Your Token Be?

| Use Case | Min Length | Recommended Character Set |
|---|---|---|
| CSRF token | 32 chars | alphanumeric |
| API key | 32 chars | alphanumeric + symbols |
| Session ID | 64 chars | hex or base64url |
| Password reset | 64 chars | hex or base64url |
| Webhook secret | 32 chars | alphanumeric |

The formula for entropy: **E = log₂(N^L)** where N is the number of possible characters and L is the length. A 32-character alphanumeric token has log₂(62³²) ≈ 190 bits of entropy — far beyond any brute-force reach.

## Best Practices for Token Security

1. **Never reuse tokens across services.** Each integration should have its own token.
2. **Store tokens hashed.** In your database, store \`sha256(token)\` — never the plain token. This way, a database breach doesn't expose live tokens.
3. **Set expiry times.** Short-lived tokens (minutes for password reset, hours for sessions) reduce the attack window.
4. **Use HTTPS exclusively.** Tokens in URLs or headers are plaintext and must be encrypted in transit.
5. **Rotate tokens after security incidents.** If you suspect a token was compromised, invalidate it immediately.
6. **Prefix tokens for type identification.** Stripe uses \`sk_live_\`, \`sk_test_\`, etc. This makes it easy to identify leaked tokens in logs or code repositories.
7. **Avoid tokens in URLs.** URL parameters end up in server logs, browser history, and referrer headers. Prefer Authorization headers or request bodies.

## Token Generation in Code

\`\`\`javascript
// Node.js — crypto module (built-in)
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex'); // 64 hex chars

// Browser — Web Crypto API
const bytes = new Uint8Array(32);
crypto.getRandomValues(bytes);
const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
\`\`\`

\`\`\`python
# Python
import secrets
token = secrets.token_hex(32)  # 64 hex chars
token_url = secrets.token_urlsafe(32)  # 43 base64url chars
\`\`\`

→ Try the [Token Generator](/token-generator)`);

// ─────────────────────────────────────────────────────────────

newContents.set('how-to-hash-text-online', `## What Is Hashing?

Hashing is a mathematical process that converts any input — a word, a file, a database record — into a fixed-length output called a **digest** or **hash**. The transformation is deterministic (same input always yields same output) but practically irreversible (you cannot reconstruct the input from the hash).

This one-way property distinguishes hashing from encryption. Encryption is reversible with the right key; hashing is not. This makes hashes ideal for verifying data integrity and storing credentials without exposing the originals.

## How Hash Functions Work

A good cryptographic hash function satisfies three properties:

1. **Deterministic** — The same input always produces the same hash.
2. **Avalanche Effect** — A tiny change in input (even one bit) completely changes the hash.
3. **Collision Resistant** — It should be computationally infeasible to find two different inputs with the same hash.

Example of the avalanche effect with SHA-256:

\`\`\`
Input: "hello"
SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

Input: "hellp"
SHA-256: ac3478d69a3c81fa62e60f5c3696165a4e5e6ac4b51d12bed36a0f21b3c3e1a8
\`\`\`

Despite differing by only one character, the hashes are completely different.

## Popular Hashing Algorithms Compared

| Algorithm | Output Size | Speed | Security Status |
|---|---|---|---|
| MD5 | 128 bits (32 hex) | Very fast | **Broken** — do not use for security |
| SHA-1 | 160 bits (40 hex) | Fast | **Deprecated** — collision attacks exist |
| SHA-256 | 256 bits (64 hex) | Fast | ✅ Widely used, recommended |
| SHA-512 | 512 bits (128 hex) | Moderate | ✅ Strong, good for file integrity |
| SHA-3 | Variable | Moderate | ✅ Modern standard, NIST approved |
| BLAKE2 | Variable | Very fast | ✅ Faster than SHA-256, highly secure |

MD5 and SHA-1 are no longer considered cryptographically secure for sensitive operations — researchers have demonstrated practical collision attacks. However, they're still used for non-security checksums (file deduplication, cache keys) where collision resistance isn't critical.

## Practical Uses of Hashing

### 1. File Integrity Verification
When you download software, the provider often publishes a SHA-256 checksum. After downloading, you compute the hash locally and compare. If they match, the file hasn't been tampered with in transit.

### 2. Password Storage
Modern systems never store passwords in plain text. Instead, they store a hash (ideally with bcrypt, Argon2, or scrypt rather than plain SHA). When a user logs in, the entered password is hashed and compared against the stored hash.

### 3. Digital Signatures
To sign a document digitally, you hash the document and then encrypt the hash with your private key. Recipients can decrypt the signature with your public key and verify it matches their locally computed hash.

### 4. Deduplication and Cache Keys
Content-addressable storage systems (like Git) identify objects by their hash. Two files with identical content have the same hash and are stored only once.

### 5. Data Structures
Hash tables use hashing to map keys to array indices, enabling O(1) average-case lookups.

## Hashing vs. Encryption vs. Encoding

| | Hashing | Encryption | Encoding |
|---|---|---|---|
| Reversible | ❌ | ✅ (with key) | ✅ (always) |
| Requires key | ❌ | ✅ | ❌ |
| Use for security | Integrity/passwords | Confidentiality | Data format |
| Example | SHA-256 | AES-256 | Base64 |

A common mistake is using Base64 "encoding" to hide sensitive data. Base64 is trivially reversible and provides zero security. Always use proper hashing or encryption for sensitive information.

## SHA-256 vs SHA-512: Which to Choose?

**SHA-256** is the safer general-purpose choice — widely supported, well-audited, and fast on 32-bit and 64-bit systems alike. **SHA-512** produces a longer hash and is marginally faster on 64-bit systems (it operates on 64-bit words). For most purposes, SHA-256 is sufficient.

## How to Hash Text in This Tool

1. Enter your text in the input field.
2. Select your desired algorithm (MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-3).
3. The hash is computed in real time in your browser using the Web Crypto API.
4. Copy the output and use it in your application.

Nothing is sent to any server — all computation happens locally.

→ Try the [Hash Text Tool](/hash-text)`);

// ─────────────────────────────────────────────────────────────

newContents.set('bcrypt-password-hashing-guide', `## Why Password Hashing Matters

When a service stores user passwords in plain text and suffers a data breach, every user's password is instantly exposed. If users reuse passwords across sites (most do), attackers can use those credentials to access email, banking, and social media accounts — a cascade of harm from a single breach.

The solution is **password hashing**: storing a one-way transformation of the password instead of the password itself. When a user logs in, the service hashes the entered password and compares it against the stored hash. If they match, access is granted — but the original password is never stored or transmitted.

## Why Not Just SHA-256?

Fast hash functions like SHA-256 are designed to be computed in nanoseconds. Modern GPUs can compute **billions** of SHA-256 hashes per second. An attacker with a leaked database can run dictionary attacks and brute-force attempts at extraordinary speed.

**Bcrypt is intentionally slow.** It's designed to take a configurable amount of time — typically 100ms–400ms — making brute-force attacks orders of magnitude harder.

## How Bcrypt Works

Bcrypt is based on the Blowfish cipher and was designed by Niels Provos and David Mazières in 1999. It incorporates three key features:

1. **Cost Factor (Work Factor)** — A parameter that controls how many iterations the algorithm runs. Higher = slower = harder to crack.
2. **Salt** — A random value added to the password before hashing, preventing precomputed rainbow table attacks.
3. **Salted Output** — The salt is stored alongside the hash, so the same password hashed twice produces different outputs.

## Anatomy of a Bcrypt Hash

\`\`\`
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
 │   │  │──────────────────│──────────────────────────────│
 │   │  └── 22 chars: salt  └── 31 chars: hash
 │   └── cost factor = 12 (2^12 = 4096 rounds)
 └── version ($2b = current)
\`\`\`

The hash encodes everything needed for verification: the version, cost factor, salt, and result. You only need to store this single string.

## Choosing the Right Cost Factor

| Cost | Rounds | Time on Modern CPU | Recommendation |
|---|---|---|---|
| 8 | 256 | ~1ms | Too fast — legacy only |
| 10 | 1,024 | ~100ms | Minimum acceptable |
| 12 | 4,096 | ~400ms | ✅ Recommended default |
| 14 | 16,384 | ~1.5s | High-security systems |
| 16 | 65,536 | ~6s | Maximum practical |

The OWASP recommendation is cost 12 or higher. Increase cost as hardware improves — the bcrypt specification supports up to cost 31.

## Using Bcrypt in Practice

\`\`\`javascript
// Node.js
const bcrypt = require('bcrypt');

// Hashing a password
const hash = await bcrypt.hash(password, 12); // cost = 12
// Store 'hash' in database

// Verifying at login
const isMatch = await bcrypt.compare(enteredPassword, storedHash);
// Returns true if password matches
\`\`\`

\`\`\`python
# Python
import bcrypt

# Hash
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# Verify
bcrypt.checkpw(password.encode(), hashed)  # Returns True/False
\`\`\`

## Bcrypt vs Argon2 vs scrypt

| Algorithm | Memory-Hard | Parallelism | Best For |
|---|---|---|---|
| Bcrypt | ❌ | ❌ | Most web apps |
| scrypt | ✅ | Limited | Cryptocurrency, PBKDF |
| Argon2 | ✅ | ✅ | New systems, recommended by OWASP |

While Argon2 (winner of the Password Hashing Competition in 2015) is technically superior, bcrypt remains the pragmatic choice due to its wide library support and proven track record. If you're building a new system, consider Argon2id.

## Common Mistakes to Avoid

1. **Using fast hashes (MD5, SHA-256) for passwords.** These are not password hashing functions — they're too fast.
2. **Storing the cost factor externally.** The hash string includes the cost factor; verification handles it automatically.
3. **Trimming long passwords.** Bcrypt internally truncates at 72 bytes — for very long passphrases, pre-hash with SHA-256 before bcrypt.
4. **Not rehashing on login.** When you increase the cost factor, update hashes on successful login (rehash with new cost, store the new hash).

## How to Use This Tool

Enter any text in the input field and select your cost factor. The tool computes the bcrypt hash in your browser. You can also enter a hash and original password to verify whether they match — useful for debugging authentication logic.

→ Try the [Bcrypt Tool](/bcrypt)`);

// ─────────────────────────────────────────────────────────────

newContents.set('uuid-vs-ulid-which-to-use', `## What Is a Unique Identifier?

Unique identifiers (UIDs) are strings or numbers that uniquely identify records in a database, distributed system, or communication protocol. The two most common formats in modern software are **UUID** (Universally Unique Identifier) and **ULID** (Universally Unique Lexicographically Sortable Identifier).

Choosing the wrong format can lead to poor database performance, difficult debugging, or compatibility issues. This guide explains both formats and helps you decide which to use.

## UUID: The Universal Standard

UUID is defined in RFC 4122 and consists of 128 bits displayed as 32 hexadecimal characters split by hyphens:

\`\`\`
550e8400-e29b-41d4-a716-446655440000
\`\`\`

**UUID version 4** (the most common) uses random bits for all fields. It has approximately 122 bits of randomness — about 5.3 × 10³⁶ possible values. The probability of collision when generating 1 billion UUIDs is about 1 in 10²⁰.

| UUID Version | Source | Use Case |
|---|---|---|
| v1 | MAC address + timestamp | Legacy, exposes device MAC |
| v3 | MD5 hash of namespace + name | Deterministic from name |
| v4 | Random | General purpose ✅ |
| v5 | SHA-1 hash of namespace + name | Deterministic from name |
| v7 | Unix timestamp + random | Sortable, modern ✅ |

## ULID: Sortable by Design

ULID encodes a 48-bit millisecond timestamp followed by 80 bits of randomness, displayed as 26 Crockford Base32 characters:

\`\`\`
01ARZ3NDEKTSV4RRFFQ69G5FAV
│──────────│──────────────│
  10 chars     16 chars
  (timestamp)  (random)
\`\`\`

Because the timestamp is the prefix, ULIDs sort lexicographically in chronological order. Records created at the same millisecond share a timestamp prefix but differ in the random suffix, preserving uniqueness.

## Head-to-Head Comparison

| Feature | UUID v4 | UUID v7 | ULID |
|---|---|---|---|
| Length (string) | 36 chars | 36 chars | 26 chars |
| Sortable | ❌ | ✅ | ✅ |
| URL-safe | Needs encoding | Needs encoding | ✅ |
| Contains timestamp | ❌ | ✅ | ✅ |
| Standardized | RFC 4122 | RFC 9562 (2024) | Community spec |
| Database index performance | Fragmented | Good | Good |
| Readability | Low | Low | Moderate |

## Database Performance: Why Sortability Matters

In B-tree indexes (PostgreSQL, MySQL), sequential inserts are far more efficient than random inserts. UUID v4's randomness causes **index fragmentation**: each new row is inserted at a random position in the index tree, causing frequent page splits and cache misses.

ULIDs and UUID v7 solve this by using monotonically increasing values (most of the time), which allows new records to be appended near the end of the index, dramatically reducing write overhead in high-throughput systems.

Benchmark data from various PostgreSQL experiments shows 3–5× better insert performance with sortable IDs on large tables (100M+ rows).

## When to Use UUID v4

- **Maximum compatibility** — Every database, language, and framework understands UUID.
- **No timestamp leakage** — If you don't want creation time embedded in IDs.
- **Simple integration** — Available in SQL (\`gen_random_uuid()\` in PostgreSQL 13+), Node.js (\`crypto.randomUUID()\`), Python (\`uuid.uuid4()\`).
- **Low-to-medium throughput** — Fine for most applications with under millions of daily records.

## When to Use ULID

- **High-write databases** — Event sourcing, logs, audit trails.
- **URL-safe IDs** — No hyphens or special characters.
- **Debugging** — You can extract creation time from the ULID itself.
- **Sorted lists** — Use as a cursor for pagination without storing \`created_at\` separately.

## When to Use UUID v7

UUID v7 (formalized in RFC 9562, April 2024) offers the best of both worlds: standard UUID format with embedded Unix timestamp for sortability. It's increasingly supported in databases (PostgreSQL 17+) and libraries. For new projects, UUID v7 is often the best choice.

## Practical Code Examples

\`\`\`javascript
// UUID v4 — Node.js built-in
const { randomUUID } = require('crypto');
const id = randomUUID(); // "550e8400-e29b-41d4-a716-446655440000"

// ULID — npm package
import { ulid } from 'ulid';
const id = ulid(); // "01ARZ3NDEKTSV4RRFFQ69G5FAV"
\`\`\`

\`\`\`sql
-- PostgreSQL UUID v4
SELECT gen_random_uuid();

-- PostgreSQL UUID v7 (pg 17+ or pgcrypto extension)
SELECT uuid_generate_v7();
\`\`\`

→ Try [UUID Generator](/uuid-generator) or [ULID Generator](/ulid-generator)`);

// ─────────────────────────────────────────────────────────────

newContents.set('jwt-parser-explained', `## What Is a JWT?

A **JSON Web Token (JWT)** is a compact, self-contained way to transmit information between parties as a signed JSON object. The information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret key (HMAC) or a public/private key pair (RSA, ECDSA).

JWTs are widely used for authentication (knowing who the user is) and authorization (knowing what the user can do) in modern web applications and APIs.

## The Three-Part Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

\`\`\`
xxxxx.yyyyy.zzzzz
header.payload.signature
\`\`\`

### Part 1: Header

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

The header declares the token type and the signing algorithm. Common algorithms:
- **HS256** — HMAC with SHA-256 (symmetric — same secret for signing and verification)
- **RS256** — RSA with SHA-256 (asymmetric — private key signs, public key verifies)
- **ES256** — ECDSA with P-256 (asymmetric — smaller keys than RSA)

### Part 2: Payload (Claims)

\`\`\`json
{
  "sub": "user_12345",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1716000000,
  "exp": 1716086400
}
\`\`\`

Claims are statements about an entity (user) and additional metadata.

**Registered Claims (RFC 7519):**

| Claim | Name | Description |
|---|---|---|
| \`iss\` | Issuer | Who issued the token (e.g., "https://auth.example.com") |
| \`sub\` | Subject | Token subject, usually user ID |
| \`aud\` | Audience | Who the token is intended for |
| \`exp\` | Expiration | Unix timestamp when token expires |
| \`iat\` | Issued At | Unix timestamp when token was issued |
| \`jti\` | JWT ID | Unique token identifier (for revocation) |

**Custom Claims:** You can add any claims you need (\`role\`, \`email\`, \`plan\`, etc.). Keep payload small — it's included in every request.

### Part 3: Signature

\`\`\`
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
\`\`\`

The signature ensures the token hasn't been tampered with. For HMAC-signed tokens, only parties with the secret can create valid signatures. For RSA-signed tokens, anyone with the public key can verify signatures, but only the private key holder can create them.

## How JWT Authentication Works

1. User logs in with credentials.
2. Server validates credentials, creates a JWT with user claims, signs it with secret key.
3. Server returns the JWT to the client.
4. Client stores the JWT (typically in memory or localStorage) and includes it in the \`Authorization\` header of subsequent requests: \`Authorization: Bearer <token>\`.
5. Server receives request, verifies JWT signature, checks \`exp\`, reads claims.
6. Server processes the request based on the claims.

No session state is required on the server — the JWT itself carries all necessary information.

## Security Pitfalls and How to Avoid Them

### 1. Algorithm Confusion Attack
Some JWT libraries accept "alg: none" (no signature), allowing attackers to forge tokens. **Always specify and validate the expected algorithm server-side.**

### 2. Trusting the Payload Without Verification
The payload is Base64-encoded — not encrypted. Anyone can decode it. **Never trust payload data without verifying the signature first.**

### 3. Weak Secrets
HMAC secrets that are too short or predictable can be cracked. Use at least 256 bits of random data for HS256 secrets.

### 4. Not Checking Expiry
Always validate the \`exp\` claim. A valid signature on an expired token should still be rejected.

### 5. Storing Sensitive Data in Payload
Since the payload is not encrypted, never store passwords, credit card numbers, or other secrets in JWT claims.

### 6. No Token Revocation
JWTs are stateless — once issued, they're valid until \`exp\`. To revoke tokens before expiry, maintain a blocklist (by \`jti\`) or use short-lived tokens (15 minutes) with refresh tokens.

## JWT vs Session Tokens

| | JWT | Server Sessions |
|---|---|---|
| Storage | Client | Server (DB/Redis) |
| Scalability | Excellent (stateless) | Requires shared state |
| Revocation | Hard | Easy |
| Payload visibility | Public (Base64) | Private |
| Best for | APIs, microservices | Monolithic web apps |

## Reading a JWT with This Tool

Paste any JWT into the parser to instantly see:
- Decoded header and payload formatted as JSON
- Expiry status (expired / valid / time remaining)
- Signing algorithm
- All claims with human-readable timestamps

All processing happens in your browser — your token is never sent to any server.

→ Try the [JWT Parser](/jwt-parser)`);

// ─────────────────────────────────────────────────────────────

newContents.set('password-strength-guide', `## What Makes a Password "Strong"?

Password strength is measured by **entropy** — the amount of unpredictability in a password. The more entropy, the longer it takes to crack. Entropy depends on two factors: the size of the character pool used (uppercase, lowercase, digits, symbols) and the length of the password.

Formula: **Entropy = L × log₂(N)**

Where L = password length and N = number of possible characters.

| Character Set | Pool Size | 12-char entropy |
|---|---|---|
| Digits only | 10 | 39.9 bits |
| Lowercase only | 26 | 56.4 bits |
| Alpha + digits | 62 | 71.5 bits |
| Full ASCII printable | 95 | 78.9 bits |

A 12-character password using the full ASCII set has ~79 bits of entropy — adequate for most purposes, assuming the hashing is done properly.

## Real-World Crack Times

Crack time depends on the hashing algorithm used to store the password and the attacker's hardware. Using bcrypt (cost 12) on a single GPU:

| Password | Entropy | Crack Time |
|---|---|---|
| \`password\` | Very low | Instant (dictionary) |
| \`P@ssw0rd\` | ~28 bits | Seconds |
| \`abc12345\` | ~38 bits | Minutes |
| \`mK7#vQ2p\` | ~52 bits | Years |
| \`Correct-Horse-Battery\` | ~51 bits | Centuries |
| \`X7#kLm$9pQr@2vN\` | ~97 bits | Billions of years |

These numbers assume offline cracking (the attacker has the hash database). Online attacks (guessing through a login form) are throttled by rate limiting — even weak passwords survive online attacks if the service implements account lockout.

## Common Attack Methods

### Dictionary Attacks
Attackers try known passwords from massive wordlists (RockYou, Have I Been Pwned) and their common mutations: \`password123\`, \`P@ssword\`, \`passw0rd\`. These cover the majority of real-world weak passwords.

### Brute Force
Try every possible combination. Practical only for short passwords — 8 characters or fewer with limited character sets.

### Credential Stuffing
Use username/password pairs leaked from other breaches. If you reuse passwords across sites, a breach at any one site compromises all your accounts.

### Rainbow Tables
Precomputed tables of hashes for common passwords. Defeated by salting (modern hashing libraries always salt).

### Password Spraying
Try a small set of common passwords across many accounts to avoid lockout thresholds.

## What This Tool Measures

This password strength analyzer evaluates:

- **Entropy calculation** — Based on character pool × length.
- **Pattern detection** — Keyboard walks (\`qwerty\`, \`12345\`), dates (\`19901231\`), repeated characters (\`aaabbb\`).
- **Dictionary check** — Tests against common password patterns and substitutions.
- **Estimated crack time** — Given different attack scenarios (online throttled, offline fast hash, offline bcrypt).
- **Compliance feedback** — Whether the password meets common requirements (8+ chars, uppercase, number, symbol).

## Best Practices for Strong Passwords

### Use a Password Manager
Applications like Bitwarden (open source), 1Password, or KeePass generate and store truly random passwords — you never have to remember them. This allows you to use a unique, long, random password for every account.

### Passphrases Are Underrated
Four random words ("correct horse battery staple") may be easier to remember than "X7#kLm$9" while actually providing more entropy. The key word is **random** — "sunshine puppy rainbow" doesn't count.

### Enable Two-Factor Authentication
Even a weak password is much safer with 2FA enabled. An attacker who somehow obtains your password still can't log in without your second factor.

### Never Reuse Passwords
Password reuse is the #1 reason breaches cascade. Use a unique password for every account — a password manager makes this trivially easy.

### Check If Your Password Has Been Breached
The [Have I Been Pwned](https://haveibeenpwned.com) service maintains a database of billions of leaked credentials. If your password appears in a breach, change it immediately.

## Corporate Password Policies: NIST Guidelines

The National Institute of Standards and Technology (NIST SP 800-63B) updated its password guidance in 2017 with evidence-based recommendations:

- **Minimum 8 characters** (prefer longer)
- **No mandatory complexity rules** (they don't improve security and frustrate users)
- **No mandatory periodic rotation** (unless there's evidence of compromise)
- **Check passwords against breach databases**
- **Allow pasting passwords** (it helps users use password managers)

Many organizations still enforce outdated policies (expire every 90 days, must include symbol, can't reuse last 12) that NIST now discourages.

→ Try the [Password Strength Analyser](/password-strength-analyser)`);

// ─────────────────────────────────────────────────────────────

newContents.set('rsa-key-pair-explained', `## What Is RSA?

RSA (named after Rivest, Shamir, and Adleman, who published the algorithm in 1977) is the world's most widely used **asymmetric encryption** algorithm. Unlike symmetric encryption (one key for both encryption and decryption), RSA uses a mathematically linked **key pair**: a public key and a private key.

The fundamental property: what one key encrypts, only the other key can decrypt. This asymmetry enables secure communication between parties who have never met and shared a secret.

## The Mathematics Behind RSA (Simplified)

RSA security is based on the **integer factorization problem**: multiplying two large prime numbers is computationally trivial, but factoring the result back into its prime factors is practically impossible for large enough numbers.

1. Choose two large random primes: p = 61, q = 53 (in practice, 1024+ digit numbers)
2. Compute n = p × q = 3233 (the modulus, shared publicly)
3. Compute φ(n) = (p-1)(q-1) = 3120 (Euler's totient)
4. Choose e such that gcd(e, φ(n)) = 1 — public exponent (commonly 65537)
5. Compute d = e⁻¹ mod φ(n) — private exponent
6. **Public key:** (e, n) = (17, 3233)
7. **Private key:** (d, n) = (2753, 3233)

The private key's d value requires knowing p and q, which cannot be efficiently recovered from n.

## Key Operations

### Encryption
Encrypt message M with public key: C = M^e mod n
Decrypt ciphertext C with private key: M = C^d mod n

### Digital Signatures
Sign data D with private key: S = D^d mod n (or hash(D)^d mod n)
Verify signature S with public key: D = S^e mod n

This means anyone can verify a signature using the public key, but only the private key holder could have created it.

## Key Sizes and Security

| Key Size | Security Level | Use Case |
|---|---|---|
| 512 bit | Broken | Do not use |
| 1024 bit | Weak | Legacy only |
| 2048 bit | ~112-bit security | ✅ Minimum recommended |
| 3072 bit | ~128-bit security | Good for 2030+ |
| 4096 bit | ~140-bit security | High-security systems |

NIST recommends 2048-bit RSA as the minimum through 2030, then 3072+ bit thereafter. The overhead of 4096-bit keys is significant — handshake latency increases measurably for web servers under load.

## Common RSA Applications

### SSH Authentication
Replace password-based login with key-based authentication:

\`\`\`bash
# Generate RSA key pair
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id user@server.com

# Connect without password
ssh user@server.com
\`\`\`

The public key is stored in \`~/.ssh/authorized_keys\` on the server. The private key never leaves your machine.

### HTTPS / TLS
Every HTTPS connection uses asymmetric cryptography (RSA or ECDSA) during the handshake to establish a shared symmetric session key. The website's RSA key pair is embedded in its TLS certificate.

### Code Signing
Software publishers sign releases with their private key. Users can verify the signature with the public key to confirm the software hasn't been modified.

### JWT (RS256 Algorithm)
JSON Web Tokens can be signed with an RSA private key (RS256). API consumers can verify signatures using the public key, enabling stateless authentication without sharing a secret.

## RSA vs ECDSA: The Modern Alternative

Elliptic Curve Cryptography (ECDSA/ECDH) provides equivalent security to RSA with much smaller key sizes:

| Algorithm | Key Size | Security Level |
|---|---|---|
| RSA | 3072 bit | 128-bit |
| ECDSA | 256 bit | 128-bit |

A 256-bit ECDSA key is as secure as a 3072-bit RSA key. For new systems, ECDSA (or Ed25519) is generally preferred due to smaller key sizes, faster computation, and smaller signature sizes.

## Public Key Infrastructure (PKI)

RSA keys are typically distributed via certificates following the X.509 standard. A Certificate Authority (CA) signs a certificate binding a public key to an identity (domain name, email address, or person). Browsers and operating systems maintain a list of trusted CAs.

## Generating RSA Keys with This Tool

This browser-based tool generates RSA key pairs locally — no keys are transmitted to any server. You can:
- Choose key size (1024, 2048, or 4096 bits)
- Generate a new key pair instantly
- Copy the public and private keys in PEM format for use in your applications

**Security note:** For production use, always generate private keys on secure, trusted hardware. Browser-generated keys are suitable for learning and testing.

→ Try the [RSA Key Pair Generator](/rsa-key-pair-generator)`);

// ─────────────────────────────────────────────────────────────

newContents.set('hmac-generator-guide', `## What Is HMAC?

**HMAC** (Hash-based Message Authentication Code) is a specific type of message authentication code involving a cryptographic hash function and a secret cryptographic key. It combines the power of a hash function (data integrity) with a shared secret key (authenticity), providing both in a single compact output.

HMAC was standardized in RFC 2104 and is used everywhere from AWS request signing to webhook verification on GitHub and Stripe.

## Why Not Just Hash the Message?

If you simply hash a message and send both together, an attacker can:
1. Intercept the message and hash.
2. Modify the message.
3. Compute a new hash of the modified message.
4. Replace both — the receiver has no way to detect tampering.

HMAC prevents this because computing a valid MAC requires the secret key. Without the key, an attacker cannot forge a valid MAC for a modified message.

## How HMAC Works

\`\`\`
HMAC(K, m) = H((K' ⊕ opad) || H((K' ⊕ ipad) || m))
\`\`\`

Where:
- H = hash function (SHA-256, SHA-512, etc.)
- K = secret key (padded to block size as K')
- m = message
- opad = outer padding (0x5c repeated)
- ipad = inner padding (0x36 repeated)

The key is processed twice: once mixed into the inner hash, and again into the outer hash. This double-keying structure prevents length-extension attacks that affect plain hashing.

## HMAC vs Plain Hashing

| Property | Plain Hash | HMAC |
|---|---|---|
| Key required | ❌ | ✅ |
| Integrity verification | ✅ | ✅ |
| Authenticity verification | ❌ | ✅ |
| Forgeable without key | ✅ | ❌ |
| Resistance to length extension | ❌ (SHA-2) | ✅ |

## Choosing a Hash Algorithm for HMAC

| HMAC Variant | Security | Common Use |
|---|---|---|
| HMAC-MD5 | Weak | Legacy only |
| HMAC-SHA1 | Acceptable | Git, older protocols |
| HMAC-SHA256 | ✅ Strong | AWS Signature V4, most APIs |
| HMAC-SHA512 | ✅ Very strong | High-security requirements |

HMAC-SHA256 is the modern standard for most applications.

## Real-World HMAC Applications

### Webhook Signature Verification
When GitHub, Stripe, or Shopify sends a webhook to your server, they include an HMAC signature in the request headers. You verify it by computing the HMAC of the request body with your secret key and comparing.

\`\`\`javascript
// Verify a GitHub webhook
const crypto = require('crypto');

function verifySignature(secret, payload, signature) {
  const computed = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}
\`\`\`

Note the use of \`timingSafeEqual\` — comparing MAC values character by character leaks timing information that attackers can exploit. Always use constant-time comparison.

### AWS Signature Version 4
Every AWS API request is signed with HMAC-SHA256 using a derivative of your secret access key:

\`\`\`
SigningKey = HMAC(HMAC(HMAC(HMAC("AWS4" + SecretKey, Date), Region), Service), "aws4_request")
Signature = HMAC(SigningKey, StringToSign)
\`\`\`

This multi-level derivation means even if one request's signing key is somehow exposed, it cannot be used to sign requests for other dates, regions, or services.

### JWT HS256 Signing
When a JWT uses the HS256 algorithm, it's signed with HMAC-SHA256:

\`\`\`javascript
const signature = HMAC_SHA256(secret, base64url(header) + '.' + base64url(payload));
\`\`\`

### Cookie and Session Integrity
Express.js and similar frameworks sign cookies with HMAC to prevent tampering:

\`\`\`javascript
// Express cookie-session uses HMAC internally
app.use(session({
  secret: 'your-secret-key',  // Used for HMAC signing
  resave: false,
  saveUninitialized: true
}));
\`\`\`

## Security Considerations

1. **Key length** — Use at least 32 bytes (256 bits) for HMAC-SHA256 keys.
2. **Key rotation** — Rotate HMAC keys periodically. When rotating, support a brief transition window where both old and new keys are valid.
3. **Constant-time comparison** — Always compare MACs in constant time to prevent timing attacks.
4. **Key storage** — Never hard-code HMAC secrets in source code. Use environment variables or a secrets manager.

## Using This Tool

Enter your message and secret key, select the hash algorithm (MD5, SHA-1, SHA-256, SHA-384, SHA-512), and the tool computes the HMAC in your browser. You can output the result in hex (default), Base64, or Base64URL format.

→ Try the [HMAC Generator](/hmac-generator)`);

// ─────────────────────────────────────────────────────────────

newContents.set('encryption-tool-guide', `## Symmetric vs. Asymmetric Encryption

**Symmetric encryption** uses the same key to both encrypt and decrypt data. It's fast, efficient, and ideal for encrypting large amounts of data. The challenge is key distribution — both parties need to share the secret key securely before communicating.

**Asymmetric encryption** (like RSA) uses a public/private key pair. It solves the key distribution problem but is much slower. In practice, most systems use both: asymmetric encryption to securely exchange a symmetric key, then symmetric encryption for the actual data transfer. This is exactly how HTTPS works.

## The AES Algorithm

**AES** (Advanced Encryption Standard) is the world's most widely used symmetric cipher, standardized by NIST in 2001. It replaced DES and 3DES and is used in virtually every modern security protocol — TLS, disk encryption, VPNs, and more.

AES operates on 128-bit blocks of data (16 bytes at a time) using key sizes of 128, 192, or 256 bits. It applies multiple rounds of substitution, permutation, and mixing transformations.

## AES Key Sizes

| Variant | Key Size | Rounds | Security |
|---|---|---|---|
| AES-128 | 128 bits (16 bytes) | 10 | ✅ Secure |
| AES-192 | 192 bits (24 bytes) | 12 | ✅ Secure |
| AES-256 | 256 bits (32 bytes) | 14 | ✅ Recommended |

There's no practical difference in security between AES-128 and AES-256 — both are immune to brute-force attacks with current and foreseeable technology. AES-256 provides a comfortable security margin against quantum computers (which theoretically halve the effective key length through Grover's algorithm).

## Block Cipher Modes

A block cipher like AES can only encrypt exactly one 128-bit block at a time. **Modes of operation** define how to apply a block cipher to arbitrary-length data.

### ECB (Electronic Codebook) — Never Use
Each block is encrypted independently. Identical plaintext blocks produce identical ciphertext blocks. This reveals patterns in structured data (the classic example is encrypting an image — shapes remain visible).

### CBC (Cipher Block Chaining)
Each block is XORed with the previous ciphertext block before encryption. Requires a random **Initialization Vector (IV)** for the first block. The IV must be unique per encryption but doesn't need to be secret.

\`\`\`
C₀ = IV
Cᵢ = Encrypt(K, Pᵢ ⊕ Cᵢ₋₁)
\`\`\`

Good for file encryption. Requires padding to handle non-block-sized data.

### GCM (Galois/Counter Mode) — Recommended
Combines counter mode (stream cipher) with a Galois Message Authentication Code (GMAC). Provides **authenticated encryption**: the output includes an authentication tag that detects any tampering.

AES-256-GCM is the gold standard for symmetric encryption — it's what TLS 1.3 uses for HTTPS.

### CTR (Counter Mode)
Encrypts sequential counter values and XORs with plaintext. Can be parallelized and doesn't require padding. No authentication.

## Algorithms Comparison

| Algorithm | Status | Key Size | Security |
|---|---|---|---|
| DES | 🔴 Broken | 56 bits | Cracked in 1999 |
| 3DES | 🟡 Deprecated | 112/168 bits | Slow, being retired |
| AES-128 | ✅ Secure | 128 bits | Standard |
| AES-256 | ✅ Recommended | 256 bits | Quantum-resistant margin |
| ChaCha20 | ✅ Modern | 256 bits | Fast on mobile/embedded |

3DES (Triple DES) is used in legacy systems — avoid it for new development. AES has completely superseded it.

## Key Derivation from Passwords

When encrypting with a password rather than a random key, you must use a **Key Derivation Function (KDF)** to transform the password into a proper encryption key. Never use a password directly as an AES key.

\`\`\`javascript
// Using PBKDF2 to derive a key from a password
const key = await crypto.subtle.importKey(...);
const derivedKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
);
\`\`\`

Common KDFs: PBKDF2, scrypt, Argon2. Use high iteration counts (100,000+ for PBKDF2) to slow down brute-force attacks.

## Practical Encryption Examples

\`\`\`javascript
// Web Crypto API (browser)
async function encryptText(plaintext, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { encrypted, salt, iv };
}
\`\`\`

→ Try the [Encryption Tool](/encryption)`);

// ─────────────────────────────────────────────────────────────

newContents.set('otp-authenticator-guide', `## What Is Two-Factor Authentication (2FA)?

**Two-Factor Authentication (2FA)** adds a second layer of verification beyond a password. Even if an attacker steals your password, they cannot log in without also possessing your second factor. The three categories of authentication factors are:

- **Something you know** — Password, PIN, security questions
- **Something you have** — Phone, hardware token, smart card
- **Something you are** — Fingerprint, face ID, voice

Most 2FA implementations combine a password (something you know) with a one-time code from a mobile app (something you have).

## How TOTP Works

**TOTP** (Time-based One-Time Password) is defined in RFC 6238. It generates a 6-digit code that changes every 30 seconds, synchronized between your app and the server without any network communication.

### Setup Process:
1. The server generates a random **secret key** (usually 20 bytes / 160 bits).
2. The server displays the secret as a QR code.
3. The user scans it with an authenticator app (Google Authenticator, Authy, etc.).
4. Both the server and app now share the same secret.

### Code Generation:
\`\`\`
counter = floor(currentUnixTime / 30)
HOTP = HMAC-SHA1(secret, counter)
TOTP = HOTP truncated to 6 digits
\`\`\`

Because both parties compute the TOTP from the same counter (current time ÷ 30) and the same secret, they always arrive at the same 6-digit code — no network required.

### Verification:
The server checks the submitted code against the current TOTP and usually the previous and next (to account for clock skew and network latency). A valid code is accepted once and invalidated to prevent replay attacks.

## HOTP: The Counter-Based Predecessor

**HOTP** (HMAC-based One-Time Password, RFC 4226) uses an incrementing counter instead of time. The counter advances each time a code is generated.

- **Advantage:** Works without clock synchronization, good for hardware tokens.
- **Disadvantage:** Counter can get out of sync if codes are generated without being used.

TOTP is generally preferred for software authenticators.

## Authenticator Apps

| App | Open Source | Multi-device | Backup |
|---|---|---|---|
| Google Authenticator | ❌ | iOS + Android | Cloud backup option |
| Authy | ❌ | Yes | Encrypted cloud backup |
| Microsoft Authenticator | ❌ | Yes | Cloud backup |
| Aegis | ✅ | Android | Encrypted file backup |
| Raivo | ✅ | iOS | iCloud backup |

For maximum security, Aegis (Android) and Raivo (iOS) are recommended — both are open source and support encrypted local/cloud backups.

## TOTP Security Properties

### Phishing Resistance
TOTP codes are valid for only 30 seconds. If a user is tricked into entering a code on a phishing site, the attacker must use it before it expires — and it can only be used once.

### Replay Prevention
Because each code is time-limited and single-use, replaying an intercepted code won't work.

### Brute Force Resistance
With 10^6 possible 6-digit codes and 30-second validity, an attacker can check 3 codes/second before the window expires. Lockout policies further limit attempts.

## Limitations of TOTP

- **SIM swapping** — SMS-based 2FA is vulnerable; TOTP (app-based) is not.
- **Real-time phishing** — Sophisticated attacks proxy credentials in real time, bypassing TOTP. Hardware keys (FIDO2/WebAuthn) prevent this.
- **Device loss** — Losing your phone without backup codes locks you out. Always save backup codes.
- **Account recovery** — Many services have weak account recovery that bypasses 2FA entirely.

## Implementing TOTP in Your Application

\`\`\`javascript
// Using 'otplib' (npm)
import { authenticator } from 'otplib';

// Generate secret (once, during user setup)
const secret = authenticator.generateSecret();

// Generate current TOTP
const token = authenticator.generate(secret);

// Verify user-submitted token
const isValid = authenticator.verify({ token, secret });
\`\`\`

\`\`\`python
# Using 'pyotp' (pip)
import pyotp

secret = pyotp.random_base32()
totp = pyotp.TOTP(secret)
token = totp.now()           # Current code
totp.verify(token)           # Returns True
\`\`\`

## Using This Tool

This OTP generator accepts a TOTP secret key (Base32 encoded) and displays the current code along with a countdown timer. You can also validate a code against a secret — useful for testing your TOTP implementation.

→ Try the [OTP Generator](/otp-generator)`);

// ─────────────────────────────────────────────────────────────

newContents.set('bip39-mnemonic-guide', `## What Is BIP39?

**BIP39** (Bitcoin Improvement Proposal 39) defines a standard for creating human-readable backup phrases for cryptocurrency wallets. These phrases — called **seed phrases**, **mnemonic phrases**, or **recovery phrases** — consist of 12, 18, or 24 common English words that encode the entropy used to derive all of a wallet's private keys.

BIP39 was authored by Marek Palatinus, Pavol Rusnak, Aaron Voisine, and Sean Bowe in 2013. Today it's the universal standard supported by virtually every hardware wallet (Ledger, Trezor), software wallet (MetaMask, Trust Wallet, Exodus), and exchange self-custody tool.

## Why Mnemonic Phrases?

Cryptocurrency private keys are 256-bit numbers — utterly unmemorizable by humans. BIP39 maps this entropy to a sequence of common words from a standardized 2048-word list, making the backup human-writable, human-readable, and robust to transcription errors.

Compare:
- **Raw private key:** \`e9873d79c6d87dc0fb6a5778633389f4453213303da61f20bd67fc233aa33262\`
- **BIP39 phrase:** \`witch collapse practice feed shame open despair creek road again ice least\`

Both represent the same entropy. The phrase is far more practical to write on paper, read aloud, or verify for typos.

## The BIP39 Process Step by Step

### 1. Generate Entropy
Create a cryptographically random byte sequence:
- **12 words:** 128 bits of entropy
- **18 words:** 192 bits of entropy
- **24 words:** 256 bits of entropy

### 2. Compute Checksum
Compute SHA-256 of the entropy. Take the first ENT/32 bits of the hash as a checksum.
- 128-bit entropy → 4-bit checksum → 132 total bits
- 256-bit entropy → 8-bit checksum → 264 total bits

### 3. Split Into 11-bit Groups
Concatenate entropy + checksum, then split into groups of 11 bits. Each group is an index (0–2047) into the BIP39 word list.

### 4. Map to Words
Replace each 11-bit index with the corresponding word from the 2048-word list.

\`\`\`
128 bits entropy + 4 bits checksum = 132 bits
132 bits / 11 bits per word = 12 words
\`\`\`

### 5. Derive Master Seed
The mnemonic phrase (with optional passphrase) is processed through PBKDF2-HMAC-SHA512 for 2048 iterations to produce a 512-bit master seed. From this seed, all wallet keys are derived following BIP32.

## Security of BIP39 Phrases

A 12-word phrase encodes 128 bits of entropy. The total number of possible 12-word phrases is:

\`\`\`
2^128 ≈ 3.4 × 10^38
\`\`\`

Even if an attacker could check one trillion (10^12) phrases per second, it would take 10^19 years to exhaust all 12-word phrases — longer than the age of the universe. 24-word phrases (256 bits) are effectively impossible to brute-force even with quantum computers.

## The BIP39 Word List

The English BIP39 word list contains exactly 2048 words, carefully chosen to be:
- **Distinct in the first 4 characters** — You can identify each word from its first 4 letters, reducing transcription ambiguity.
- **Short** — Most words are 3–8 characters.
- **Common** — Familiar English words, avoiding technical terms.

Other language word lists exist (Japanese, Spanish, Korean, French, Italian, Czech, Portuguese, Chinese) but English is the most universally supported.

## Passphrase (25th Word)

BIP39 supports an optional **passphrase** (sometimes called the "25th word") that's combined with the mnemonic to derive the seed. This provides two layers of security:
- The physical mnemonic phrase
- The memorized passphrase

Even if someone finds your physical backup, they can't access funds without the passphrase. This is particularly useful for hardware wallets.

**Warning:** If you forget the passphrase, the funds are permanently lost. There's no recovery mechanism.

## Storing Your Seed Phrase Safely

| Method | Security | Durability |
|---|---|---|
| Paper | Low (fire/water) | Poor |
| Metal plate (Cryptosteel) | High | Excellent |
| Digital (unencrypted) | Very low | Good |
| Password manager | Good | Good |
| Memory only | N/A | Poor (forget) |

Best practices:
- **Never photograph your seed phrase** — Photos back up to cloud storage you may not control.
- **Never type it into any website** — Including "recovery" sites (many are phishing).
- **Make multiple physical copies** — Store in different secure locations (home safe, safety deposit box, trusted family member).
- **Use a metal backup** — Paper burns and degrades; stainless steel survives house fires.
- **Never share with anyone** — Seed phrases are bearer instruments. Whoever has the words controls the funds.

## This Tool's Safety

This BIP39 generator runs entirely in your browser using the Web Crypto API for entropy. No seed phrases, private keys, or wallet data are transmitted to any server. For generating real wallet seed phrases, verify the tool is running locally with no network access.

→ Try the [BIP39 Generator](/bip39-generator)`);

// ─── Now apply all changes ───────────────────────────────────

const filePath = 'src/pages/articles/articles.data.ts';
let fileContent = readFileSync(filePath, 'utf-8');

let updatedCount = 0;
let notFoundCount = 0;

for (const [slug, newContent] of newContents) {
  const escaped = escapeForTS(newContent);
  // Match from slug declaration through content backtick
  const pattern = new RegExp(
    `(slug:\\s*'${slug.replace(/-/g, '\\-')}'[\\s\\S]*?content:\\s*\`)([\\s\\S]*?)(\`\\s*,?\\s*\\})`,
    ''
  );
  const before = fileContent;
  fileContent = fileContent.replace(pattern, `$1${escaped}$3`);
  if (fileContent !== before) {
    updatedCount++;
    console.log(`✅ Updated: ${slug}`);
  } else {
    notFoundCount++;
    console.log(`❌ Not found: ${slug}`);
  }
}

writeFileSync(filePath, fileContent, 'utf-8');
console.log(`\nDone: ${updatedCount} updated, ${notFoundCount} not found`);
