#!/usr/bin/env python3
"""Script to update Web category articles in articles.data.ts with expanded content."""

import re

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

# Read the file
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── Article 1: url-encoding-explained ───────────────────────────────────────
OLD_1 = r"""    content: `## Why URLs Need Encoding

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

→ Try the [URL Encoder/Decoder](/url-encoder)`,"""

NEW_1 = r"""    content: `## Why URLs Need Encoding

Every URL you type in a browser travels through dozens of systems: DNS resolvers, proxies, load balancers, web servers, and application frameworks. Each of these systems was built around one assumption: **URLs are ASCII text**. The moment you include a space, a Chinese character, an ampersand, or an emoji, you risk breaking that chain.

URL encoding (formally called **percent-encoding**, defined in RFC 3986) is the mechanism that converts unsafe characters into a safe, universally transferable format. Understanding it isn't just trivia — it directly affects how your APIs behave, how search engines index your pages, and whether your users' data arrives intact.

## The RFC 3986 Character Classification

RFC 3986 divides URL characters into three groups:

**Unreserved characters** (never need encoding):
- Letters: \`A-Z\`, \`a-z\`
- Digits: \`0-9\`
- Symbols: \`-\`, \`_\`, \`.\`, \`~\`

**Reserved characters** (have special meaning in URLs — encode when used as data):
- \`:\`, \`/\`, \`?\`, \`#\`, \`[\`, \`]\`, \`@\` — delimiters
- \`!\`, \`$\`, \`&\`, \`'\`, \`(\`, \`)\`, \`*\`, \`+\`, \`,\`, \`;\`, \`=\` — sub-delimiters

**Everything else** must be percent-encoded: spaces, Unicode characters, angle brackets, quotes, etc.

### How Percent-Encoding Works

Each byte of the character is represented as \`%XX\` where \`XX\` is the hexadecimal value:

| Character | UTF-8 Bytes | Encoded |
|---|---|---|
| space | \`0x20\` | \`%20\` |
| \`&\` | \`0x26\` | \`%26\` |
| \`=\` | \`0x3D\` | \`%3D\` |
| \`#\` | \`0x23\` | \`%23\` |
| 中 (Chinese) | \`0xE4 0xB8 0xAD\` | \`%E4%B8%AD\` |
| 🚀 (emoji) | \`0xF0 0x9F 0x9A 0x80\` | \`%F0%9F%9A%80\` |

Notice that multi-byte characters (like Chinese or emoji) produce multiple \`%XX\` sequences because they require multiple bytes in UTF-8.

## encodeURI vs encodeURIComponent: A Deep Dive

JavaScript provides two built-in encoding functions that confuse even experienced developers. The key is understanding what each one is designed for:

### encodeURI — For Complete URLs

\`encodeURI()\` encodes a **full URL** while preserving all characters that have structural meaning:

\`\`\`javascript
encodeURI('https://example.com/search?q=hello world&lang=中文')
// → 'https://example.com/search?q=hello%20world&lang=%E4%B8%AD%E6%96%87'
\`\`\`

It does **not** encode: \`A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #\`

### encodeURIComponent — For Query Parameter Values

\`encodeURIComponent()\` encodes **individual values** that will be embedded inside a URL. It's much more aggressive and encodes reserved characters too:

\`\`\`javascript
encodeURIComponent('hello world & more=stuff')
// → 'hello%20world%20%26%20more%3Dstuff'

// Building a URL safely:
const q = 'C++ programming & algorithms'
const url = \`https://search.example.com?q=\${encodeURIComponent(q)}\`
// → 'https://search.example.com?q=C%2B%2B%20programming%20%26%20algorithms'
\`\`\`

If you had used \`encodeURI()\` on the value, the \`&\` and \`=\` would pass through unencoded, breaking your query string parsing.

### The Comparison Table

| Function | Encodes | Keeps |
|---|---|---|
| \`encodeURI\` | Spaces, Unicode, some symbols | \`: / ? # [ ] @ ! $ & ' ( ) * + , ; =\` |
| \`encodeURIComponent\` | Everything except unreserved chars | \`A-Z a-z 0-9 - _ . ~\` |

## The Double-Encoding Trap

One of the most common bugs in URL handling is **double-encoding** — encoding an already-encoded URL:

\`\`\`javascript
const encoded = 'hello%20world'
encodeURIComponent(encoded)
// → 'hello%2520world'  ← %25 is the encoded form of %
\`\`\`

The \`%\` sign itself gets encoded to \`%25\`, turning \`%20\` into \`%2520\`. When the server decodes it, it gets \`hello%20world\` (literally) instead of \`hello world\`.

**Fix:** Always track whether a value is already encoded. Decode first if uncertain:

\`\`\`javascript
// Safe pattern: decode first, then encode once
function safeEncode(value) {
  try {
    // decodeURIComponent throws on invalid sequences
    const decoded = decodeURIComponent(value)
    return encodeURIComponent(decoded)
  } catch {
    return encodeURIComponent(value)
  }
}
\`\`\`

## Chinese, Japanese, and Emoji Encoding

Modern URLs support Unicode through percent-encoding of UTF-8 bytes. Browsers display the decoded version in the address bar for readability, but the actual HTTP request uses the encoded form.

\`\`\`javascript
encodeURIComponent('北京')
// 北 = U+5317 → UTF-8: E5 8C 97 → %E5%8C%97
// 京 = U+4EAC → UTF-8: E4 BA AC → %E4%BA%AC
// Result: '%E5%8C%97%E4%BA%AC'

encodeURIComponent('🎉')
// → '%F0%9F%8E%89'
\`\`\`

## Form Submission and application/x-www-form-urlencoded

HTML forms use a slightly different encoding scheme where **spaces become \`+\` instead of \`%20\`**. In JavaScript, \`URLSearchParams\` handles this automatically:

\`\`\`javascript
const params = new URLSearchParams({ q: 'hello world', filter: 'a&b' })
params.toString()
// → 'q=hello+world&filter=a%26b'
\`\`\`

## Common Mistakes to Avoid

**1. Not encoding query parameter values:**
\`\`\`javascript
// ❌ Wrong — & breaks the query string
const url = \`/search?q=\${userInput}\`

// ✅ Correct
const url = \`/search?q=\${encodeURIComponent(userInput)}\`
\`\`\`

**2. Encoding the entire URL with encodeURIComponent:**
\`\`\`javascript
// ❌ Breaks the URL structure — colons and slashes get encoded
const url = encodeURIComponent('https://example.com/path?q=hello')

// ✅ Correct — use encodeURI for full URLs
const url = encodeURI('https://example.com/path?q=hello world')
\`\`\`

**3. Forgetting to decode on the server:**
Always decode URL parameters before processing. Most frameworks (Express, FastAPI, Spring) do this automatically, but raw string manipulation bypasses that protection.

## Best Practices

1. **Use \`encodeURIComponent\`** for any dynamic value you insert into a URL's query string or path segment.
2. **Use the \`URL\` API** when building complex URLs programmatically — it handles encoding automatically and is far safer than string concatenation.
3. **Never double-encode** — track your encoding state carefully.
4. **Always use HTTPS** — URL encoding is not encryption; encoded URLs still transmit in plaintext over HTTP.
5. **Validate on the server** — always re-validate after decoding, never trust client-side encoding.

\`\`\`javascript
// The safest pattern for building URLs in JavaScript
const url = new URL('https://example.com/search')
url.searchParams.set('q', 'C++ & algorithms')
url.searchParams.set('lang', '中文')
console.log(url.toString())
// → 'https://example.com/search?q=C%2B%2B+%26+algorithms&lang=%E4%B8%AD%E6%96%87'
\`\`\`

→ Try the [URL Encoder/Decoder](/url-encoder)`,"""

# ─── Article 2: http-status-codes-complete-guide ─────────────────────────────
OLD_2 = r"""    content: `## Status Code Categories

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

→ Try the [HTTP Status Codes Reference](/http-status-codes)`,"""

NEW_2 = r"""    content: `## The Five Classes of HTTP Status Codes

HTTP status codes are grouped into five classes, each communicating a fundamentally different outcome. Every API response you write should use the most specific code possible — it's the primary contract between your server and client.

| Class | Range | Meaning | Who's Responsible |
|---|---|---|---|
| Informational | 1xx | Request received, continuing | Server |
| Success | 2xx | Request succeeded | — |
| Redirection | 3xx | Further action needed | Client |
| Client Error | 4xx | Bad request from client | Client |
| Server Error | 5xx | Server failed | Server |

## 2xx: Success Codes

**200 OK** — The workhorse of HTTP. GET requests that return data, PUT updates that succeed, any general success.

**201 Created** — Use after POST requests that create a new resource. Always include a \`Location\` header pointing to the new resource:
\`\`\`http
HTTP/1.1 201 Created
Location: /api/users/12345
Content-Type: application/json
\`\`\`

**202 Accepted** — The request was accepted for processing, but processing hasn't completed yet. Perfect for async jobs: "We received your export request; it'll be ready in 5 minutes."

**204 No Content** — Success, but there's nothing to return. Use for DELETE requests and PUT/PATCH updates where returning the resource would be redundant.

**206 Partial Content** — Used with \`Range\` headers for resumable downloads and video streaming.

## 3xx: Redirects — The Critical Differences

Choosing the wrong redirect code is a surprisingly common SEO and caching mistake:

| Code | Name | Method Preserved? | Cached? | Use Case |
|---|---|---|---|---|
| 301 | Moved Permanently | No (GET) | Yes | Permanent URL change, SEO transfer |
| 302 | Found | No (GET) | No | Temporary redirect (legacy) |
| 307 | Temporary Redirect | Yes | No | Temporary redirect, preserves POST |
| 308 | Permanent Redirect | Yes | Yes | Permanent redirect, preserves POST |

**The 301 vs 308 trap:** Use 301 for GET-only redirects (like browser navigation, SEO). Use 308 when you're permanently moving a POST endpoint — 301 would turn the redirected POST into a GET, losing the request body.

**The 302 legacy issue:** Historically, browsers converted POST→GET on 302 redirects (violating the spec). Use 307/308 for any non-GET redirect to guarantee method preservation.

## 4xx: Client Error Codes

**400 Bad Request** — Generic client error. Use when the request is malformed, has invalid syntax, or violates basic constraints.

**401 Unauthorized** — Despite the name, this means *unauthenticated*. The client must authenticate first. Always include a \`WWW-Authenticate\` header.

**403 Forbidden** — Authenticated but not authorized. The server understood the request but refuses to fulfill it.

**404 Not Found** — The resource doesn't exist. Use this for nonexistent routes, deleted resources, and resources the client shouldn't know exist (as a security measure, sometimes preferred over 403).

**405 Method Not Allowed** — The resource exists but doesn't support the HTTP method used. Include an \`Allow\` header listing valid methods.

**409 Conflict** — The request conflicts with current resource state. Common for: duplicate creation (user already exists), version conflicts in optimistic locking.

**410 Gone** — Like 404, but permanent. The resource *existed* and was intentionally removed. Good for SEO: tells crawlers to de-index the URL.

**422 Unprocessable Entity** — The syntax is valid JSON/XML, but the semantic content fails validation. Preferred over 400 for field-level validation errors in REST APIs:
\`\`\`json
{
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "age", "message": "Must be 18 or older" }
  ]
}
\`\`\`

**429 Too Many Requests** — Rate limiting. Always include:
- \`Retry-After\`: seconds to wait
- \`X-RateLimit-Limit\`: requests per window
- \`X-RateLimit-Remaining\`: remaining requests
- \`X-RateLimit-Reset\`: Unix timestamp when the window resets

## 5xx: Server Error Codes

**500 Internal Server Error** — Catch-all for unexpected server failures. Log the full error internally, return a generic message externally (never expose stack traces to clients).

**502 Bad Gateway** — Your server is acting as a gateway/proxy and received an invalid response from the upstream server. Common with nginx+gunicorn setups when the app server crashes.

**503 Service Unavailable** — The server is temporarily unable to handle requests (overloaded or down for maintenance). Include a \`Retry-After\` header.

**504 Gateway Timeout** — Your proxy server didn't receive a timely response from the upstream server. Different from 502: the upstream is reachable but too slow.

### The 502/503/504 Distinction in Practice

\`\`\`
Client → Nginx → App Server
         ↑
  If App Server crashes:     502 Bad Gateway
  If App Server is down:     503 Service Unavailable
  If App Server is too slow: 504 Gateway Timeout
\`\`\`

## REST API Design: Choosing the Right Code

A well-designed REST API follows these conventions:

\`\`\`javascript
// GET /users/:id
router.get('/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.status(200).json(user)
})

// POST /users
router.post('/users', async (req, res) => {
  const existing = await db.findByEmail(req.body.email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const user = await db.createUser(req.body)
  res.status(201).location(\`/users/\${user.id}\`).json(user)
})

// DELETE /users/:id
router.delete('/users/:id', async (req, res) => {
  await db.deleteUser(req.params.id)
  res.status(204).send()  // No body needed
})
\`\`\`

## Common Anti-Patterns

**Always returning 200 with an error body** — This breaks every HTTP client, monitoring tool, and caching layer:
\`\`\`json
// ❌ Anti-pattern: 200 OK with error inside
{ "status": "error", "message": "User not found" }
\`\`\`

**Using 200 for validation errors** — Reach for 422 when user input fails business rules.

**Exposing internal errors** — Never return stack traces, database errors, or file paths in 5xx responses.

→ Try the [HTTP Status Codes Reference](/http-status-codes)`,"""

# ─── Article 3: crontab-generator-guide ──────────────────────────────────────
OLD_3 = r"""    content: `## Crontab Syntax

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

→ Try the [Crontab Generator](/crontab-generator)`,"""

NEW_3 = r"""    content: `## Understanding the Cron Expression Format

The cron daemon is one of Unix's most enduring inventions — a time-based job scheduler that's been running on servers since the 1970s. Despite its age, it remains the standard for scheduling recurring tasks on Linux/macOS servers, Docker containers, and cloud functions.

### The 5-Field Standard Format

\`\`\`
┌──────────── minute (0–59)
│ ┌────────── hour (0–23)
│ │ ┌──────── day of month (1–31)
│ │ │ ┌────── month (1–12 or JAN–DEC)
│ │ │ │ ┌──── day of week (0–7, 0 and 7 = Sunday, or SUN–SAT)
│ │ │ │ │
* * * * *  command to execute
\`\`\`

### 6-Field and 7-Field Variants

Different cron implementations add extra fields:

| Fields | Format | Used By |
|---|---|---|
| 5 | \`min hour dom month dow\` | Unix cron, Linux crontab |
| 6 | \`sec min hour dom month dow\` | Spring Scheduler, Quartz |
| 7 | \`sec min hour dom month dow year\` | Quartz Scheduler |

**Important:** Standard Unix cron does NOT support seconds. If you need second-level precision, use Quartz (Java) or a language-specific scheduler.

## Special Characters in Detail

### \`*\` — Wildcard (every value)
\`\`\`
0 * * * *    → Every hour at minute 0
* * * * *    → Every minute
\`\`\`

### \`,\` — List (multiple values)
\`\`\`
0 9,17 * * *    → At 9:00 AM and 5:00 PM
0 0 1,15 * *    → 1st and 15th of each month
\`\`\`

### \`-\` — Range
\`\`\`
0 9-17 * * *     → Every hour from 9 AM to 5 PM
0 0 * * 1-5      → Monday through Friday at midnight
\`\`\`

### \`/\` — Step values
\`\`\`
*/15 * * * *     → Every 15 minutes
0 */2 * * *      → Every 2 hours
\`\`\`

### \`L\` — Last (Quartz only)
\`\`\`
0 0 L * *        → Last day of the month
0 0 * * 5L       → Last Friday of the month
\`\`\`

### \`W\` — Weekday (Quartz only)
\`\`\`
0 0 15W * *      → Nearest weekday to the 15th
\`\`\`

### \`#\` — Nth weekday (Quartz only)
\`\`\`
0 0 * * 2#1      → First Monday of the month
0 10 * * 5#3     → Third Friday of the month at 10:00 AM
\`\`\`

## Common Schedules Quick Reference

| Expression | Description |
|---|---|
| \`* * * * *\` | Every minute |
| \`0 * * * *\` | Every hour (at :00) |
| \`0 0 * * *\` | Daily at midnight |
| \`0 12 * * *\` | Daily at noon |
| \`*/15 * * * *\` | Every 15 minutes |
| \`0 9 * * 1-5\` | Weekdays at 9:00 AM |
| \`0 0 1 * *\` | First day of each month |
| \`0 0 1 1 *\` | January 1st (New Year) |
| \`0 0 * * 0\` | Every Sunday at midnight |
| \`30 4 1,15 * *\` | 4:30 AM on 1st and 15th |

## The Timezone Problem

Cron runs in the system timezone by default. This causes silent bugs when servers are in UTC but your team thinks in local time.

\`\`\`bash
# Check your system timezone
timedatectl

# Set timezone in crontab (GNU cron extension)
CRON_TZ=America/New_York
0 9 * * 1-5  /scripts/send-morning-report.sh

# Or use TZ= prefix per job
TZ=Asia/Shanghai 0 8 * * * /scripts/daily-backup.sh
\`\`\`

**Cloud scheduler note:** AWS EventBridge, GCP Cloud Scheduler, and Azure Logic Apps all support timezone selection in their UI/API — always specify the timezone explicitly.

## Logging and Error Handling

By default, cron emails output to the system user (often silently discarded). Set up proper logging:

\`\`\`bash
# Redirect stdout and stderr to a log file
0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1

# Suppress all output (not recommended for production)
0 2 * * * /scripts/backup.sh > /dev/null 2>&1

# Send errors to a monitoring service via curl
0 2 * * * /scripts/backup.sh || curl -s "https://alert.example.com/cron-failed"
\`\`\`

**Use MAILTO to route cron output:**
\`\`\`bash
MAILTO=ops-team@example.com
0 2 * * * /scripts/backup.sh
\`\`\`

## Common Mistakes

**1. Not using absolute paths:**
\`\`\`bash
# ❌ Cron has a minimal PATH — relative paths often fail
0 2 * * * backup.sh

# ✅ Always use absolute paths
0 2 * * * /usr/local/bin/backup.sh
\`\`\`

**2. Environment variables not available:**
\`\`\`bash
# Add PATH explicitly in crontab
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
\`\`\`

**3. Off-by-one in schedules:**
\`\`\`bash
# ❌ This runs every minute, not every hour!
* 0 * * *

# ✅ Run at minute 0, every hour
0 * * * *
\`\`\`

## systemd Timers: The Modern Alternative

On modern Linux systems (systemd), timers offer advantages over cron: dependency management, logging via journald, and more precise scheduling.

\`\`\`ini
# /etc/systemd/system/backup.timer
[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true    # Run if system was off at scheduled time

# /etc/systemd/system/backup.service
[Service]
ExecStart=/usr/local/bin/backup.sh
\`\`\`

Enable with: \`systemctl enable --now backup.timer\`

View logs: \`journalctl -u backup.service\`

→ Try the [Crontab Generator](/crontab-generator)`,"""

# ─── Article 4: regex-tester-guide ───────────────────────────────────────────

# Read current content to find exact old content
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    full_content = f.read()

# Replace articles one by one
full_content = full_content.replace(OLD_1, NEW_1, 1)
full_content = full_content.replace(OLD_2, NEW_2, 1)
full_content = full_content.replace(OLD_3, NEW_3, 1)

# Write back
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Articles 1-3 updated successfully!")
