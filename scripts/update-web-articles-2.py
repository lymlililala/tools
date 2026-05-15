#!/usr/bin/env python3
"""Script to update Web category articles 4-16 in articles.data.ts with expanded content."""

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    full_content = f.read()

# ─── Article 4: regex-tester-guide ───────────────────────────────────────────
OLD_4 = r"""    content: `## Essential Regex Syntax

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

→ Try the [Regex Tester](/regex-tester)`,"""

NEW_4 = r"""    content: `## What Are Regular Expressions?

Regular expressions (regex) are patterns that describe sets of strings. They're built into every major programming language and are among the most powerful text-processing tools available. Whether you're validating email addresses, extracting data from logs, or transforming text, regex is indispensable.

But regex has a reputation for being hard to read and debug. Using an interactive regex tester that shows matches in real time transforms regex from a mystery into a manageable skill.

## The Complete Metacharacter Reference

### Character Classes

| Pattern | Matches |
|---|---|
| \`.\` | Any character except newline |
| \`\\d\` | Digit: \`[0-9]\` |
| \`\\D\` | Non-digit: \`[^0-9]\` |
| \`\\w\` | Word char: \`[a-zA-Z0-9_]\` |
| \`\\W\` | Non-word character |
| \`\\s\` | Whitespace (space, tab, newline) |
| \`\\S\` | Non-whitespace |
| \`[abc]\` | One of: a, b, or c |
| \`[^abc]\` | Not a, b, or c |
| \`[a-z]\` | Character range a to z |

### Anchors

| Pattern | Matches |
|---|---|
| \`^\` | Start of string (or line with \`m\` flag) |
| \`$\` | End of string (or line with \`m\` flag) |
| \`\\b\` | Word boundary |
| \`\\B\` | Non-word boundary |

### Quantifiers: Greedy vs Non-Greedy

Greedy quantifiers match as much as possible; non-greedy (lazy) quantifiers match as little as possible:

| Greedy | Lazy | Meaning |
|---|---|---|
| \`*\` | \`*?\` | 0 or more |
| \`+\` | \`+?\` | 1 or more |
| \`?\` | \`??\` | 0 or 1 |
| \`{n,m}\` | \`{n,m}?\` | n to m times |

\`\`\`javascript
const html = '<b>bold</b> and <i>italic</i>'

// Greedy — matches entire string from first < to last >
html.match(/<.+>/)    // ['<b>bold</b> and <i>italic</i>']

// Non-greedy — matches shortest possible
html.match(/<.+?>/g)  // ['<b>', '</b>', '<i>', '</i>']
\`\`\`

## Groups and Capturing

### Capturing Groups \`()\`
\`\`\`javascript
const date = '2025-06-15'
const match = date.match(/(\d{4})-(\d{2})-(\d{2})/)
// match[1] = '2025', match[2] = '06', match[3] = '15'
\`\`\`

### Named Capturing Groups \`(?<name>)\`
\`\`\`javascript
const match = '2025-06-15'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
// match.groups = { year: '2025', month: '06', day: '15' }
\`\`\`

### Non-Capturing Groups \`(?:)\`
Use when you need grouping for quantifiers but don't need to capture:
\`\`\`javascript
// Match "color" or "colour"
/colou?r/           // simple
/colo(?:u)?r/       // non-capturing group version
\`\`\`

### Alternation \`|\`
\`\`\`javascript
/cat|dog|bird/.test('I have a dog')  // true
/(cat|dog) food/.test('cat food')    // true
\`\`\`

## Lookahead and Lookbehind Assertions

These are zero-width assertions — they match a position, not characters:

| Pattern | Name | Meaning |
|---|---|---|
| \`(?=...)\` | Positive lookahead | Followed by... |
| \`(?!...)\` | Negative lookahead | NOT followed by... |
| \`(?<=...)\` | Positive lookbehind | Preceded by... |
| \`(?<!...)\` | Negative lookbehind | NOT preceded by... |

\`\`\`javascript
// Match a number only if followed by "px"
'16px 2em 8px'.match(/\d+(?=px)/g)    // ['16', '8']

// Match price numbers (preceded by $)
'$10 €20 $30'.match(/(?<=\$)\d+/g)    // ['10', '30']

// Password: must contain uppercase (without consuming it)
/(?=.*[A-Z])(?=.*\d).{8,}/.test('Password1')  // true
\`\`\`

## Essential Patterns for Real-World Use

### Email Validation
\`\`\`javascript
// Practical email regex (not RFC-perfect, but handles 99% of real emails)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
emailRegex.test('user@example.com')      // true
emailRegex.test('user+tag@sub.org')      // true
emailRegex.test('not-an-email')          // false
\`\`\`

### URL Detection
\`\`\`javascript
const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi
'Visit https://example.com for details'.match(urlRegex)
// → ['https://example.com']
\`\`\`

### Phone Numbers (US)
\`\`\`javascript
// Matches: (555) 123-4567, 555-123-4567, 5551234567
const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/
\`\`\`

### IP Address
\`\`\`javascript
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
\`\`\`

## Regex Flags

| Flag | Meaning |
|---|---|
| \`g\` | Global: find all matches, not just first |
| \`i\` | Case-insensitive |
| \`m\` | Multiline: \`^\` and \`$\` match line boundaries |
| \`s\` | Dotall: \`.\` matches newlines too |
| \`u\` | Unicode: enables full Unicode matching |

## Performance Traps: Catastrophic Backtracking

The biggest regex danger is **catastrophic backtracking** — a pattern that causes the engine to try exponentially many paths:

\`\`\`javascript
// ❌ DANGER: Nested quantifiers cause catastrophic backtracking
const evilRegex = /^(a+)+$/

// This takes seconds or crashes on "aaaaaaaaaaaaaaaaaaaX"
evilRegex.test('aaaaaaaaaaaaaaaaaaaX')  // hangs!
\`\`\`

**How to avoid it:**
1. Don't nest quantifiers: \`(a+)+\`, \`(a*)*\`, \`(a|aa)+\`
2. Use atomic groups or possessive quantifiers where available
3. Use specific character classes instead of \`.\`
4. Test with adversarial input before deploying

\`\`\`javascript
// ✅ Rewrite to be specific and non-backtracking
const safeRegex = /^a+$/
\`\`\`

## Regex in Different Languages

\`\`\`python
# Python
import re
match = re.search(r'(\d{4})-(\d{2})-(\d{2})', '2025-06-15')
\`\`\`

\`\`\`javascript
// JavaScript
const match = '2025-06-15'.match(/(\d{4})-(\d{2})-(\d{2})/)
\`\`\`

\`\`\`bash
# grep (POSIX extended regex)
echo '2025-06-15' | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}'
\`\`\`

→ Try the [Regex Tester](/regex-tester)`,"""

# ─── Article 5: jwt-parser-web-guide ─────────────────────────────────────────
OLD_5 = r"""    content: `## Quickly Decode Any JWT

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

→ Try the [JWT Parser](/jwt-parser)`,"""

NEW_5 = r"""    content: `## What Is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe token format defined in RFC 7519. It's the standard for transmitting authentication and authorization data between parties in modern web applications — you'll encounter JWTs in OAuth 2.0 flows, OpenID Connect, API authentication, and microservice communication.

A JWT looks like this:
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Those three Base64URL-encoded sections, separated by dots, are: **Header.Payload.Signature**.

## Decoding a JWT Step by Step

### Step 1: Split by dots
\`\`\`javascript
const [headerB64, payloadB64, signature] = token.split('.')
\`\`\`

### Step 2: Base64URL decode each part
Base64URL differs from standard Base64: \`+\` → \`-\`, \`/\` → \`_\`, and padding (\`=\`) is omitted.

\`\`\`javascript
function base64UrlDecode(str) {
  // Add padding back
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = str + '=='.substring(0, (4 - str.length % 4) % 4)
  return atob(padded)
}

const header = JSON.parse(base64UrlDecode(headerB64))
const payload = JSON.parse(base64UrlDecode(payloadB64))
\`\`\`

### Step 3: Read the claims
\`\`\`json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (standard claims)
{
  "sub": "1234567890",    // Subject (user ID)
  "name": "John Doe",     // Custom claim
  "iat": 1516239022,      // Issued at (Unix timestamp)
  "exp": 1516242622,      // Expiry (Unix timestamp)
  "aud": "my-api",        // Audience
  "iss": "auth.example.com"  // Issuer
}
\`\`\`

**Important:** Decoding a JWT does NOT verify its signature. Any Base64URL decoder can read the payload. **Never store sensitive data in JWT claims** — treat them as public.

## Standard Claims Reference

| Claim | Name | Description |
|---|---|---|
| \`iss\` | Issuer | Who created the token |
| \`sub\` | Subject | User/entity the token represents |
| \`aud\` | Audience | Intended recipient(s) |
| \`exp\` | Expiration | Unix timestamp when token expires |
| \`nbf\` | Not Before | Token not valid before this time |
| \`iat\` | Issued At | Unix timestamp when token was created |
| \`jti\` | JWT ID | Unique identifier (for revocation) |

## Checking Token Expiry

\`\`\`javascript
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split('.')[1]))
    if (!payload.exp) return false  // No expiry = never expires
    return Date.now() / 1000 > payload.exp
  } catch {
    return true  // Invalid token = treat as expired
  }
}

function getExpiryInfo(token) {
  const payload = JSON.parse(base64UrlDecode(token.split('.')[1]))
  const expDate = new Date(payload.exp * 1000)
  const issuedDate = new Date(payload.iat * 1000)
  const remaining = payload.exp - Date.now() / 1000

  return {
    issuedAt: issuedDate.toISOString(),
    expiresAt: expDate.toISOString(),
    isExpired: remaining < 0,
    remainingSeconds: Math.max(0, Math.floor(remaining))
  }
}
\`\`\`

## Debugging with Browser DevTools

When debugging authentication flows, use the Network tab:

1. Open DevTools → Network tab
2. Find the request with the \`Authorization\` header
3. Copy the token after \`Bearer \`
4. Paste into a JWT parser to inspect claims

**Common issues to diagnose:**
- \`exp\` in the past → token expired, refresh flow broken
- \`aud\` doesn't match your service → wrong token for this API
- \`iss\` unexpected → token from wrong auth server
- Missing \`sub\` → user not properly identified

## Cross-Origin (CORS) Issues with JWT

A common source of confusion: CORS errors on API requests using JWT don't mean your token is invalid — they mean the server's CORS configuration isn't allowing the cross-origin request.

\`\`\`javascript
// Client sending JWT in Authorization header
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
// This triggers a CORS preflight OPTIONS request
// The server must respond with:
// Access-Control-Allow-Headers: Authorization
// Access-Control-Allow-Origin: https://yourapp.com
\`\`\`

**Checklist when seeing CORS errors with JWT:**
1. Is `Authorization` in the server's `Access-Control-Allow-Headers`?
2. Is the correct origin in `Access-Control-Allow-Origin`?
3. Are credentials/cookies needed? → add `credentials: 'include'` on client and `Access-Control-Allow-Credentials: true` on server

## Security Considerations

**1. Algorithm confusion attack:** Always verify the algorithm on the server. If the server accepts both HS256 and RS256, an attacker could forge a token using the public key with HMAC.

**2. The "none" algorithm:** Never accept tokens with \`"alg": "none"\` in production.

**3. JWT storage:**
- \`localStorage\`: accessible to JavaScript, vulnerable to XSS
- \`sessionStorage\`: same as localStorage, cleared on tab close
- HTTP-only cookies: not accessible to JavaScript (preferred for sensitive apps)

**4. Short expiry + refresh tokens:** Use short-lived JWTs (15 min) combined with longer-lived refresh tokens stored in HTTP-only cookies.

## Debugging Third-Party JWT Issues

When integrating with an external identity provider (Auth0, Okta, Keycloak, Google):

1. Paste the JWT into your parser to see the exact claims
2. Check \`iss\` matches the provider's documented issuer URL
3. Verify \`aud\` matches your application's client ID
4. Compare \`exp\` and \`iat\` to detect clock skew (clocks off by >5 minutes will cause verification failures)

→ Try the [JWT Parser](/jwt-parser)`,"""

# ─── Article 6: url-parser-guide ─────────────────────────────────────────────
OLD_6 = r"""    content: `## URL Anatomy

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

→ Try the [URL Parser](/url-parser)`,"""

NEW_6 = r"""    content: `## The Anatomy of a URL

A URL (Uniform Resource Locator) is much more than just a web address — it's a structured identifier with up to 8 distinct components, each with its own syntax rules and encoding requirements.

\`\`\`
https://user:pass@example.com:8080/api/v1/users?search=hello&page=2#results
│─────│ │────────│ │──────────│ │──│ │─────────│ │─────────────────│ │─────│
scheme  userinfo   host        port  path         query string        fragment
\`\`\`

## Component Deep Dive

### 1. Scheme (Protocol)
The protocol defines how the resource should be accessed: \`https\`, \`http\`, \`ftp\`, \`ws\`, \`wss\`, \`mailto\`, \`data\`, etc.

\`\`\`javascript
new URL('https://example.com').protocol  // 'https:'
new URL('ftp://files.org').protocol      // 'ftp:'
\`\`\`

Note: The URL API always includes the trailing colon in \`protocol\`.

### 2. Authority (userinfo@host:port)
The authority consists of optional credentials, host, and port.

**Userinfo** (\`user:pass@\`) is used in database connection strings and FTP URLs. In HTTP, it's deprecated and security tools warn against it (credentials visible in logs and browser history).

**Host** can be:
- A domain name: \`example.com\`, \`sub.example.co.uk\`
- An IPv4 address: \`192.168.1.1\`
- An IPv6 address (bracket-enclosed): \`[::1]\`

**Port** is optional. Default ports by scheme: HTTP=80, HTTPS=443, FTP=21. When a URL uses the default port, \`url.port\` returns an empty string.

\`\`\`javascript
const url = new URL('https://example.com:443/path')
url.port      // '' (default HTTPS port, omitted)
url.hostname  // 'example.com'
url.host      // 'example.com' (no port since it's default)

const url2 = new URL('https://example.com:8443/path')
url2.port     // '8443'
url2.host     // 'example.com:8443'
\`\`\`

### 3. Path
The path identifies a specific resource on the host. Path segments are separated by \`/\` and may be empty. Paths can contain percent-encoded characters.

\`\`\`javascript
new URL('https://example.com/api/v1/users/123').pathname  // '/api/v1/users/123'
\`\`\`

### 4. Query String
The query string (\`?\` onwards) contains key-value pairs for filtering, searching, and parameterizing requests. The structure is flexible — the spec only mandates the \`?\` prefix; conventions like \`key=value&key2=value2\` are implementation-defined.

### 5. Fragment (Hash)
The fragment (\`#\` onwards) is processed entirely by the browser and is **never sent to the server**. It's used for:
- In-page navigation: \`#section-title\`
- Single-page app routing: \`#!/path\` (hash-bang, legacy)
- Client-side state: \`#access_token=xxx\` (OAuth implicit flow, now deprecated)

\`\`\`javascript
new URL('https://example.com/page#section-2').hash  // '#section-2'
\`\`\`

## URLSearchParams: The Right Way to Handle Query Strings

Never manually split query strings with string operations. The \`URLSearchParams\` API handles all edge cases correctly:

\`\`\`javascript
const url = new URL('https://api.example.com/search?q=hello+world&tags=a&tags=b&page=2')
const params = url.searchParams

// Get single value
params.get('q')         // 'hello world' (+ decoded to space)
params.get('page')      // '2'
params.get('missing')   // null

// Get all values for a key (array parameters)
params.getAll('tags')   // ['a', 'b']

// Check existence
params.has('q')         // true

// Iterate all parameters
for (const [key, value] of params) {
  console.log(key, value)
}
// q hello world
// tags a
// tags b
// page 2
\`\`\`

## Query String Parsing Traps

### Trap 1: Arrays in Query Strings
There's no standard for array parameters. Different frameworks handle them differently:

\`\`\`
PHP/Laravel: ?tags[]=a&tags[]=b
Ruby on Rails: ?tags[]=a&tags[]=b  (same)
Express.js: ?tags=a&tags=b
jQuery: ?tags%5B%5D=a&tags%5B%5D=b
\`\`\`

\`\`\`javascript
// URLSearchParams handles the common pattern (same key repeated)
const params = new URLSearchParams('tags=a&tags=b')
params.getAll('tags')  // ['a', 'b']
\`\`\`

### Trap 2: Plus Sign vs %20
In query strings, \`+\` traditionally means a space (application/x-www-form-urlencoded). \`URLSearchParams\` handles this automatically, but manual decoding often misses it.

### Trap 3: Nested Objects
\`URLSearchParams\` doesn't support nested objects (\`user[name]=John\`). Use a library like \`qs\` for PHP-style notation.

## Building URLs Safely

\`\`\`javascript
// ❌ String concatenation — injection risk
const url = \`https://api.com/search?q=\${userInput}&page=\${page}\`

// ✅ URL API — safe encoding
const url = new URL('https://api.com/search')
url.searchParams.set('q', userInput)
url.searchParams.set('page', String(page))
url.toString()
\`\`\`

## Origin vs href

The **origin** (\`scheme + host + port\`) is the fundamental unit of the browser's security model (Same-Origin Policy):

\`\`\`javascript
const url = new URL('https://example.com:8080/path?q=1#hash')
url.origin   // 'https://example.com:8080' (scheme + host + port)
url.href     // 'https://example.com:8080/path?q=1#hash' (full URL)
\`\`\`

Two URLs have the same origin only if scheme, host, AND port all match exactly. Subdomains are different origins.

→ Try the [URL Parser](/url-parser)`,"""

# ─── Article 7: meta-tag-generator-guide ─────────────────────────────────────
OLD_7 = r"""    content: `## What Are Open Graph Tags?

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

→ Try the [Meta Tag Generator](/og-meta-generator)`,"""

NEW_7 = r"""    content: `## Why Open Graph Matters

When someone shares your URL on Facebook, LinkedIn, Slack, WhatsApp, or Discord, those platforms don't display your URL — they display a rich preview card with a title, description, and image. That card is powered by **Open Graph meta tags** embedded in your HTML \`<head>\`.

Without proper Open Graph tags, platforms will guess — usually poorly. With them, you control exactly how your content appears, which directly impacts click-through rates and brand perception.

## The Open Graph Protocol

The Open Graph Protocol (OGP) was created by Facebook in 2010 and has since been adopted as a universal standard. It uses \`<meta property="...">\` tags with the \`og:\` prefix.

### The Four Required Tags

\`\`\`html
<!-- Every page should have these four at minimum -->
<meta property="og:title" content="How to Build a REST API" />
<meta property="og:type" content="article" />
<meta property="og:image" content="https://example.com/images/og-api-guide.jpg" />
<meta property="og:url" content="https://example.com/blog/how-to-build-rest-api" />
\`\`\`

### Recommended Additional Tags

\`\`\`html
<meta property="og:description" content="A complete guide to building REST APIs with Node.js and Express, covering routing, middleware, authentication, and deployment." />
<meta property="og:site_name" content="DevDocs" />
<meta property="og:locale" content="en_US" />

<!-- For articles specifically -->
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2025-06-15T09:00:00Z" />
<meta property="article:author" content="https://example.com/authors/jane" />
\`\`\`

## Image Specifications by Platform

The \`og:image\` is the most critical tag for social sharing — it's the first thing people see. Each platform has different requirements:

| Platform | Recommended Size | Min Size | Aspect Ratio | Max File Size |
|---|---|---|---|---|
| Facebook | 1200×630px | 600×315px | 1.91:1 | 8MB |
| Twitter/X | 1200×600px | 300×157px | 2:1 | 5MB |
| LinkedIn | 1200×627px | 200×200px | ~1.91:1 | 5MB |
| WhatsApp | 1200×630px | 300×300px | Flexible | 300KB |
| Slack | 1200×630px | — | 1.91:1 | — |

**Best practice:** Use 1200×630px (1.91:1 ratio) as your standard. It works well across all platforms and represents the visual sweet spot.

\`\`\`html
<!-- Always use absolute URLs, not relative paths -->
<!-- ❌ Wrong -->
<meta property="og:image" content="/images/preview.jpg" />

<!-- ✅ Correct -->
<meta property="og:image" content="https://example.com/images/preview.jpg" />
\`\`\`

## Twitter Card Tags

Twitter uses its own \`twitter:\` namespace, though it falls back to Open Graph if Twitter-specific tags are absent. There are four Twitter Card types:

\`\`\`html
<!-- Large image card (most impactful) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Build a REST API" />
<meta name="twitter:description" content="A complete guide..." />
<meta name="twitter:image" content="https://example.com/og-image.jpg" />
<meta name="twitter:image:alt" content="Diagram showing REST API architecture" />

<!-- App card (for app promotion) -->
<meta name="twitter:card" content="app" />
<meta name="twitter:app:id:iphone" content="307234931" />

<!-- Player card (for videos) -->
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content="https://example.com/embed/video" />
<meta name="twitter:player:width" content="1280" />
<meta name="twitter:player:height" content="720" />
\`\`\`

## Platform-Specific Differences

**Facebook** is the strictest about caching — once crawled, it caches aggressively. Use the Facebook Sharing Debugger to force a re-crawl after updating images.

**LinkedIn** has its own cache and scraper. It ignores some Open Graph properties; specifically, it uses \`og:image\` but may not use \`og:description\` for articles.

**Twitter/X** requires \`twitter:card\` to be set explicitly; without it, only a basic link is shown. It checks \`twitter:image\` first, then falls back to \`og:image\`.

**WhatsApp and Telegram** respect Open Graph tags but have size limitations. WhatsApp won't show images larger than 300KB.

**Slack** caches unfurl data. Use \`/unfurl\` in Slack API to invalidate the cache for specific URLs.

## Debugging Tools

Never guess — always verify your meta tags with official debuggers:

1. **Facebook Sharing Debugger** — [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug) — Shows exactly how Facebook renders your page and lets you force a cache refresh.

2. **Twitter Card Validator** — [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) — Preview your Twitter Card and debug issues.

3. **LinkedIn Post Inspector** — [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) — Check and refresh LinkedIn's cache.

4. **OpenGraph.xyz** — A third-party tool that shows how your URL looks across multiple platforms simultaneously.

## SEO Double Benefit

Open Graph tags provide a secondary SEO benefit: \`og:title\` and \`og:description\` influence how your page appears in social search results and Pinterest. Search engines like Google also read Open Graph data as signals for rich snippets and entity recognition.

Keep \`og:title\` aligned with but not identical to your HTML \`<title>\` tag — you can use a slightly more engaging/descriptive title for social sharing:

\`\`\`html
<!-- HTML title: concise, keyword-focused -->
<title>REST API Tutorial | DevDocs</title>

<!-- OG title: more descriptive for social context -->
<meta property="og:title" content="How to Build a REST API from Scratch — Complete 2025 Guide" />
\`\`\`

## Dynamic OG Images

For blogs and dynamic content, generate OG images programmatically:

\`\`\`javascript
// Using @vercel/og (Next.js)
// pages/api/og.tsx
import { ImageResponse } from '@vercel/og'

export default function handler(req) {
  const { title } = new URL(req.url).searchParams
  return new ImageResponse(
    <div style={{ background: '#1a1a2e', color: 'white', padding: 60 }}>
      <h1>{title}</h1>
      <p>MyBlog.com</p>
    </div>,
    { width: 1200, height: 630 }
  )
}

// Then in your page:
// <meta property="og:image" content={\`/api/og?title=\${encodeURIComponent(title)}\`} />
\`\`\`

→ Try the [Meta Tag Generator](/og-meta-generator)`,"""

# Apply all replacements
full_content = full_content.replace(OLD_4, NEW_4, 1)
full_content = full_content.replace(OLD_5, NEW_5, 1)
full_content = full_content.replace(OLD_6, NEW_6, 1)
full_content = full_content.replace(OLD_7, NEW_7, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Articles 4-7 updated successfully!")
