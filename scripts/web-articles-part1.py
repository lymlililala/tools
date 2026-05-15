#!/usr/bin/env python3
"""Replace Web category articles content - Part 1 of 2."""

WEB_ARTICLES = {}

WEB_ARTICLES['url-encoding-explained'] = r"""## What Is URL Encoding?

URL encoding (also called **percent-encoding**) is the process of converting characters into a format that can be safely transmitted in a URL. Every URL can only contain a limited set of ASCII characters. Characters outside this set — including spaces, Chinese text, `&`, `=`, `#`, and many others — must be encoded before they appear in a URL.

The mechanism is straightforward: each unsafe character is replaced by a `%` sign followed by two hexadecimal digits representing the character's UTF-8 byte value.

**Example:**
\`\`\`
Space → %20
© → %C2%A9
中文 → %E4%B8%AD%E6%96%87
\`\`\`

## Why URL Encoding Exists

URLs were defined by RFC 3986 and are restricted to a specific set of "unreserved" characters:
\`\`\`
A-Z  a-z  0-9  -  _  .  ~
\`\`\`

All other characters are either "reserved" (they carry special meaning in URLs, like `/` for path separators and `?` for query strings) or "unsafe" (they may be misinterpreted by browsers, servers, and proxies). URL encoding allows any character to appear in a URL while preserving the structural meaning of reserved characters.

**Reserved characters and their URL meaning:**

| Character | URL Meaning | Encoded Form |
|-----------|------------|--------------|
| `/` | Path separator | `%2F` |
| `?` | Start of query string | `%3F` |
| `&` | Query param separator | `%26` |
| `=` | Key=value separator | `%3D` |
| `#` | Fragment identifier | `%23` |
| `+` | Space (in query strings) | `%2B` |
| `@` | Userinfo separator | `%40` |

## Percent-Encoding Examples

| Original | Encoded |
|----------|---------|
| `Hello World` | `Hello%20World` |
| `user@example.com` | `user%40example.com` |
| `price=5&qty=2` | `price%3D5%26qty%3D2` |
| `中文` | `%E4%B8%AD%E6%96%87` |
| `1+1=2` | `1%2B1%3D2` |

## The `+` vs `%20` Distinction

This is a subtle but critical difference:

- **In query strings (form data)**: `+` means a space. `Hello+World` → `Hello World`.
- **In path segments**: `+` is a literal plus sign. A space in a path must be `%20`.

\`\`\`
Form data: q=Hello+World    → query value = "Hello World"
URL path:  /files/Hello+World → path = "/files/Hello+World" (literal plus!)
URL path:  /files/Hello%20World → path = "/files/Hello World"
\`\`\`

When in doubt, use `%20` — it works correctly in both contexts.

## JavaScript: `encodeURIComponent` vs `encodeURI`

JavaScript provides two built-in encoding functions:

\`\`\`javascript
// encodeURIComponent — encodes EVERYTHING except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
// Use for individual values being embedded in a URL
encodeURIComponent('Hello World');    // "Hello%20World"
encodeURIComponent('a=1&b=2');        // "a%3D1%26b%3D2"
encodeURIComponent('中文');           // "%E4%B8%AD%E6%96%87"
encodeURIComponent('http://x.com/'); // "http%3A%2F%2Fx.com%2F"

// encodeURI — encodes everything EXCEPT structural URL characters
// Use for encoding a full URL that already has structure
encodeURI('https://example.com/path with spaces?q=hello world');
// "https://example.com/path%20with%20spaces?q=hello%20world"
// Note: ://?= are NOT encoded — they're part of URL structure
\`\`\`

**Rule of thumb:**
- Building a URL with parameters? Use `encodeURIComponent` for each key and value.
- Encoding a complete URL string? Use `encodeURI`.
- Never use the deprecated `escape()` function — it handles Unicode incorrectly.

\`\`\`javascript
// ✅ Correct: build query string with encodeURIComponent
const params = new URLSearchParams({ q: 'hello world', filter: 'a&b=c' });
const url = `https://api.example.com/search?${params}`;
// https://api.example.com/search?q=hello+world&filter=a%26b%3Dc

// Even better: use the URL API
const url2 = new URL('https://api.example.com/search');
url2.searchParams.set('q', 'hello world');
url2.searchParams.set('filter', 'a&b=c');
console.log(url2.toString());
// https://api.example.com/search?q=hello+world&filter=a%26b%3Dc
\`\`\`

## Decoding URLs

Decoding reverses the process:

\`\`\`javascript
// Decode
decodeURIComponent('Hello%20World');  // "Hello World"
decodeURIComponent('%E4%B8%AD%E6%96%87'); // "中文"

// The URL API handles this automatically
const url = new URL('https://example.com/search?q=hello%20world');
url.searchParams.get('q'); // "hello world" — already decoded!
\`\`\`

\`\`\`python
from urllib.parse import quote, unquote, quote_plus, unquote_plus

# Encode
quote('Hello World')          # 'Hello%20World'
quote_plus('Hello World')     # 'Hello+World'  (for form data)
quote('中文', safe='')        # '%E4%B8%AD%E6%96%87'

# Decode
unquote('Hello%20World')      # 'Hello World'
unquote_plus('Hello+World')   # 'Hello World'
\`\`\`

## URL Encoding in HTTP Requests

When sending form data via POST with `application/x-www-form-urlencoded`, the browser encodes the body automatically. For JSON APIs, URL encoding isn't applied to the body (JSON is sent as-is), but query parameters still need encoding.

\`\`\`javascript
// Fetch with URL-encoded form data (browser/Node.js)
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ q: 'hello world', category: 'books & comics' })
});
// Body: q=hello+world&category=books+%26+comics
\`\`\`

## Common Mistakes

**Mistake 1: Double-encoding**

Encoding an already-encoded URL encodes the `%` signs again:
\`\`\`
Original:      Hello World
Encoded once:  Hello%20World
Encoded twice: Hello%2520World  ← WRONG (the % became %25)
\`\`\`

Always check whether a string is already encoded before encoding it again.

**Mistake 2: Encoding the entire URL at once**

\`\`\`javascript
// ❌ Wrong: encodes the colon and slashes too
encodeURIComponent('https://example.com/search?q=hello');
// "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello"

// ✅ Correct: only encode the parameter values
const q = encodeURIComponent('hello world');
const url = `https://example.com/search?q=${q}`;
\`\`\`

**Mistake 3: Forgetting to encode user input**

Any user-provided data placed in a URL must be encoded. Failure to do so can cause broken URLs or open redirect vulnerabilities.

## Safe Characters Reference (No Encoding Needed)

\`\`\`
Uppercase: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Lowercase: a b c d e f g h i j k l m n o p q r s t u v w x y z
Digits:    0 1 2 3 4 5 6 7 8 9
Special:   - _ . ~
\`\`\`

Everything else should be percent-encoded when used as data in a URL.

## Internationalized Domain Names (IDN)

Domain names with non-ASCII characters (e.g., `münchen.de`) use **Punycode** encoding, not percent-encoding:

\`\`\`
münchen.de → xn--mnchen-3ya.de
\`\`\`

Browsers display the Unicode form in the address bar but send the Punycode form over the network. The `URL` API in modern browsers handles this automatically.

→ Try the [URL Encoder / Decoder](/url-encoder)"""

WEB_ARTICLES['http-status-codes-complete-guide'] = r"""## What Are HTTP Status Codes?

Every HTTP response includes a three-digit **status code** that tells the client (browser, API consumer, mobile app) what happened with their request. Status codes are standardized by IANA and documented in RFC 9110. Understanding them is fundamental to web development, API design, and debugging.

Status codes are grouped into five classes based on the first digit:

| Class | Range | Meaning |
|-------|-------|---------|
| 1xx | 100–199 | Informational — request received, processing continues |
| 2xx | 200–299 | Success — request received, understood, and accepted |
| 3xx | 300–399 | Redirection — further action needed |
| 4xx | 400–499 | Client error — bad request |
| 5xx | 500–599 | Server error — server failed |

## 2xx: Success Codes

### 200 OK
The most common success code. The request succeeded, and the response body contains the requested data.

### 201 Created
The request succeeded and a new resource was created. Always include a `Location` header pointing to the new resource.

\`\`\`http
HTTP/1.1 201 Created
Location: /api/users/42
Content-Type: application/json

{"id": 42, "user": "alice"}
\`\`\`

Use 201 for POST requests that create new resources.

### 204 No Content
The request succeeded but there's nothing to return. Common for DELETE operations and updates where you don't need to return data.

### 206 Partial Content
Used with range requests for large files (videos, PDFs). The client requested only part of the resource via the `Range` header.

## 3xx: Redirection Codes

### 301 Moved Permanently
The resource has permanently moved to a new URL. Browsers and search engines cache this redirect and update their records.

**SEO note:** 301 passes link equity to the new URL. Use it when migrating content permanently.

### 302 Found (Temporary Redirect)
The resource temporarily lives at a different URL. Browsers follow it but don't cache it.

### 303 See Other
After a POST, redirect to a GET to show the result. This implements the **Post/Redirect/Get** pattern, preventing duplicate form submissions on page refresh.

\`\`\`
POST /checkout → 303 See Other → GET /order/123/confirmation
\`\`\`

### 304 Not Modified
The client's cached version is still valid; don't re-download the resource. Works with `ETag` and `Last-Modified` headers.

### 307 Temporary Redirect / 308 Permanent Redirect
Like 302/301 but **preserve the HTTP method**. A POST that gets a 307 will POST to the new URL.

| Code | Permanent? | Preserves method? |
|------|-----------|-------------------|
| 301 | ✅ | ❌ (POST → GET) |
| 302 | ❌ | ❌ (POST → GET) |
| 307 | ❌ | ✅ |
| 308 | ✅ | ✅ |

## 4xx: Client Error Codes

### 400 Bad Request
The request is malformed or the server cannot process it. Return detailed error information to help the client fix the request.

\`\`\`json
{
  "error": "validation_error",
  "message": "The 'email' field is required",
  "field": "email"
}
\`\`\`

### 401 Unauthorized
Despite the name, this means **unauthenticated** — the client is not logged in.

### 403 Forbidden
The client is **authenticated** but lacks **permission**. The difference from 401:
- 401: Who are you? Please authenticate.
- 403: I know who you are, but you can't do that.

### 404 Not Found
The requested resource doesn't exist. Also used intentionally to hide existence of resources (returning 404 instead of 403 so attackers don't know a resource exists).

### 405 Method Not Allowed
The HTTP method is not allowed for this endpoint. Must include an `Allow` header listing valid methods:

\`\`\`http
HTTP/1.1 405 Method Not Allowed
Allow: GET, POST
\`\`\`

### 409 Conflict
The request conflicts with the current state. Classic use: trying to create a user with an email that already exists.

\`\`\`json
{"error": "duplicate_email", "message": "This email is already registered"}
\`\`\`

### 410 Gone
Like 404, but the resource **existed** and was **permanently removed**. Search engines remove 410 pages from the index faster than 404 pages.

### 422 Unprocessable Entity
The request is syntactically valid but semantically invalid. Used by many REST APIs when validation fails:

\`\`\`json
{
  "errors": {
    "age": ["must be greater than 0"],
    "email": ["is not a valid email address"]
  }
}
\`\`\`

### 429 Too Many Requests
Rate limiting. Include `Retry-After` to tell the client when to try again:

\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
\`\`\`

## 5xx: Server Error Codes

### 500 Internal Server Error
A generic catch-all for unhandled server errors. Log the full error server-side; return a generic message to the client (never expose stack traces in production).

### 502 Bad Gateway
The server is acting as a proxy and received an invalid response from the upstream server. Common when Nginx/load balancer can't reach the app server.

### 503 Service Unavailable
The server is temporarily unable to handle requests — overloaded or in maintenance.

### 504 Gateway Timeout
The proxy server timed out waiting for the upstream server.

## REST API Design: Choosing the Right Code

| Scenario | Recommended Code |
|----------|-----------------|
| GET returns data | 200 |
| POST creates resource | 201 |
| DELETE or PATCH with no body | 204 |
| Not authenticated | 401 |
| Authenticated but unauthorized | 403 |
| Resource not found | 404 |
| Validation error | 422 |
| Conflict (duplicate) | 409 |
| Rate limit exceeded | 429 |
| Unhandled exception | 500 |

## Common Mistakes

**Returning 200 with an error body:**
\`\`\`json
HTTP/1.1 200 OK
{"success": false, "error": "User not found"}
\`\`\`
This is wrong. Use 404. The HTTP status code *is* the status.

**Using 401 when you mean 403:**
Remember: 401 = unauthenticated (no credentials), 403 = unauthorized (wrong permissions).

**Using 500 for client errors:**
If the client sent bad data and your code crashed, fix your validation to return 400/422 instead.

## Status Codes and SEO

Search engine crawlers use HTTP status codes to determine how to handle pages:

- **200**: Index normally
- **301**: Update the indexed URL to the new location
- **404/410**: Remove from index (410 is processed faster)
- **503 + Retry-After**: Crawler backs off temporarily, doesn't remove from index
- **noindex meta tag**: Takes precedence over status code, prevents indexing

Always return proper status codes for removed content (404 or 410) rather than showing a "page not found" message with a 200 status — search engines won't know the page is gone.

→ Try the [HTTP Status Code Reference](/http-status-codes)"""

WEB_ARTICLES['crontab-generator-guide'] = r"""## What Is Cron?

**Cron** is a time-based job scheduler in Unix-like operating systems. It runs commands (called "cron jobs") automatically at specified times and intervals. The cron daemon (`crond`) runs in the background and checks the **crontab** (cron table) every minute to see if any jobs are scheduled.

Cron is the backbone of automated server maintenance, report generation, database backups, cache clearing, API polling, and virtually every scheduled backend task.

## Cron Expression Syntax

A cron expression consists of **5 fields** followed by the command:

\`\`\`
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ ┌───────────── day of week (0-7 or SUN-SAT)
│ │ │ │ │
* * * * * command_to_execute
\`\`\`

### Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| `*` | Any value | `* * * * *` — every minute |
| `,` | List separator | `0,30 * * * *` — at :00 and :30 |
| `-` | Range | `0 9-17 * * *` — every hour 9am-5pm |
| `/` | Step | `*/15 * * * *` — every 15 minutes |

## Common Cron Patterns

\`\`\`bash
# Every minute
* * * * * /script.sh

# Every 5 minutes
*/5 * * * * /script.sh

# Every hour (at :00)
0 * * * * /script.sh

# Every day at midnight
0 0 * * * /script.sh

# Every day at 2:30 AM
30 2 * * * /script.sh

# Every Sunday at midnight
0 0 * * 0 /script.sh

# Every Monday at 8 AM
0 8 * * 1 /script.sh

# First day of every month at midnight
0 0 1 * * /script.sh

# Every weekday (Mon-Fri) at 9 AM
0 9 * * 1-5 /script.sh

# Every quarter at midnight
0 0 1 1,4,7,10 * /script.sh
\`\`\`

### @shortcuts

| Shortcut | Equivalent | When |
|----------|-----------|------|
| `@yearly` | `0 0 1 1 *` | Once a year, January 1 |
| `@monthly` | `0 0 1 * *` | First day of every month |
| `@weekly` | `0 0 * * 0` | Every Sunday at midnight |
| `@daily` | `0 0 * * *` | Every day at midnight |
| `@hourly` | `0 * * * *` | Every hour at :00 |
| `@reboot` | N/A | Once at system startup |

## Managing the Crontab

\`\`\`bash
# Edit your crontab (opens in $EDITOR)
crontab -e

# List your current crontab
crontab -l

# Remove your crontab entirely
crontab -r

# Edit another user's crontab (requires sudo)
sudo crontab -u www-data -e

# System-wide cron directories
/etc/cron.d/        # Custom cron files
/etc/cron.daily/    # Scripts run daily
/etc/cron.hourly/   # Scripts run hourly
/etc/cron.weekly/   # Scripts run weekly
/etc/cron.monthly/  # Scripts run monthly
\`\`\`

## Writing Reliable Cron Jobs

### 1. Always Use Absolute Paths

Cron runs with a minimal PATH. Scripts that work in your terminal may fail in cron.

\`\`\`bash
# ❌ May fail — 'cleanup.sh' not found
0 2 * * * cleanup.sh

# ✅ Always works
0 2 * * * /home/alice/scripts/cleanup.sh
\`\`\`

Inside scripts, use absolute paths for every command:
\`\`\`bash
#!/bin/bash
/usr/bin/find /var/log -name "*.log" -mtime +30 -delete
/usr/bin/gzip /var/backups/db.sql
\`\`\`

### 2. Set the PATH Explicitly in Crontab

\`\`\`bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

0 2 * * * /deploy.sh
\`\`\`

### 3. Handle Stdout and Stderr

By default, cron emails output to the system user. Redirect explicitly to files:

\`\`\`bash
# Log all output (stdout + stderr) to a file
0 2 * * * /backup.sh >> /var/log/backup.log 2>&1

# Log with timestamps
0 2 * * * echo "$(date): starting" >> /var/log/backup.log && /backup.sh >> /var/log/backup.log 2>&1
\`\`\`

### 4. Set MAILTO for Error Alerts

\`\`\`bash
MAILTO=ops@example.com

# Receive email if the job produces output (typically on error)
0 2 * * * /backup.sh >> /var/log/backup.log
\`\`\`

### 5. Prevent Overlapping Jobs

If a job takes longer than its interval, it may overlap with the next run. Use `flock`:

\`\`\`bash
# Skip if another instance is running
*/5 * * * * flock -n /tmp/myjob.lock /var/scripts/process.sh
\`\`\`

## Real-World Examples

\`\`\`bash
# Daily database backup at 3 AM
0 3 * * * /usr/bin/pg_dump mydb | gzip > /backups/db-$(date +%Y%m%d).sql.gz

# Clear temp files every 6 hours
0 */6 * * * /usr/bin/find /tmp -type f -mtime +1 -delete

# Renew SSL certificates on the 1st and 15th
0 0 1,15 * * /usr/bin/certbot renew --quiet

# Send weekly report every Monday at 8 AM
0 8 * * 1 /opt/reports/weekly.py | /usr/bin/mail -s "Weekly Report" team@example.com

# Sync files during business hours (Mon-Fri, 8 AM - 6 PM)
*/30 8-18 * * 1-5 /usr/bin/rsync -az /data/ user@backup.server:/data/

# Health check every minute, restart if down
* * * * * /usr/bin/curl -sf http://localhost:8080/health || systemctl restart myapp
\`\`\`

## Timezone Considerations

By default, cron uses the system timezone. To specify per-job:

\`\`\`bash
CRON_TZ=America/New_York
0 9 * * * /morning-report.sh

CRON_TZ=Europe/London
0 17 * * * /london-eod.sh
\`\`\`

For containerized environments, always set `TZ` explicitly:
\`\`\`dockerfile
ENV TZ=UTC
\`\`\`

## Cron vs Modern Alternatives

| Tool | Best For |
|------|---------|
| cron | Simple server-side scheduling |
| systemd timers | Linux systems (better logging, dependencies) |
| Kubernetes CronJob | Container workloads |
| Cloud Scheduler | Serverless / cloud-native |
| GitHub Actions schedule | CI/CD workflows |
| node-cron | Node.js in-process scheduling |
| APScheduler (Python) | Python in-process scheduling |

## Debugging Cron Jobs

When a cron job doesn't run as expected:

1. **Check cron is running:** `systemctl status cron`
2. **Check cron logs:** `grep CRON /var/log/syslog`
3. **Run as cron would:** `env -i HOME=/root /bin/bash -c '/your/script.sh'`
4. **Check permissions:** The script must be executable (`chmod +x script.sh`)
5. **Verify syntax:** Use an online cron expression validator

→ Try the [Crontab Generator](/crontab-generator)"""

WEB_ARTICLES['regex-tester-guide'] = r"""## What Is a Regular Expression?

A **regular expression** (regex or regexp) is a sequence of characters that defines a search pattern. Regex engines search text for matches to the pattern and can also replace, split, or validate text. Regular expressions are built into every major programming language and countless developer tools.

Regex syntax looks cryptic at first — `/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i` — but each character has a precise meaning. Once you understand the building blocks, regex becomes an extraordinarily powerful tool for text processing.

## Core Syntax Reference

### Literal Characters
Most characters match themselves: `cat` matches the string "cat" wherever it appears.

### The Dot `.`
Matches any single character except a newline (by default).
\`\`\`
c.t → matches: cat, cut, c3t, c!t
\`\`\`

### Character Classes `[...]`
Matches any one character from the set:
\`\`\`
[aeiou]   → any vowel
[a-z]     → any lowercase letter
[A-Z0-9]  → uppercase letter or digit
[^aeiou]  → any character that is NOT a vowel
\`\`\`

### Predefined Character Classes

| Shorthand | Equivalent | Meaning |
|-----------|-----------|---------|
| `\d` | `[0-9]` | Digit |
| `\D` | `[^0-9]` | Non-digit |
| `\w` | `[a-zA-Z0-9_]` | Word character |
| `\W` | `[^a-zA-Z0-9_]` | Non-word character |
| `\s` | `[ \t\n\r\f]` | Whitespace |
| `\S` | `[^ \t\n\r\f]` | Non-whitespace |

### Anchors
\`\`\`
^   Start of string (or start of line in multiline mode)
$   End of string (or end of line in multiline mode)
\b  Word boundary
\B  Non-word boundary
\`\`\`

### Quantifiers

| Quantifier | Meaning |
|------------|---------|
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 (optional) |
| `{n}` | Exactly n times |
| `{n,}` | n or more times |
| `{n,m}` | Between n and m times |

**Greedy vs Lazy:** Quantifiers are greedy by default — they match as much as possible. Add `?` to make them lazy:

\`\`\`
Input: <b>bold</b> and <i>italic</i>
Greedy  <.*>  → matches the ENTIRE string
Lazy    <.*?> → matches <b>, </b>, <i>, </i> separately
\`\`\`

### Groups and Alternation

\`\`\`
(abc)     → Capturing group
(?:abc)   → Non-capturing group
(cat|dog) → Alternation: "cat" or "dog"
\`\`\`

### Lookahead and Lookbehind

Zero-width assertions — they match a position, not characters:

\`\`\`
(?=...)   → Positive lookahead: followed by ...
(?!...)   → Negative lookahead: NOT followed by ...
(?<=...)  → Positive lookbehind: preceded by ...
(?<!...)  → Negative lookbehind: NOT preceded by ...

price(?=\s*USD)   → "price" only if followed by "USD"
\d+(?!px)         → number NOT followed by "px"
\`\`\`

## Flags (Modifiers)

| Flag | Meaning |
|------|---------|
| `i` | Case-insensitive |
| `g` | Global (find all matches) |
| `m` | Multiline (`^`/`$` match line boundaries) |
| `s` | Dotall (`.` matches newlines too) |
| `u` | Unicode mode |

## Practical Regex Patterns

### Email Validation (simplified)
\`\`\`
/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/
\`\`\`

### URL Matching
\`\`\`
/https?:\/\/[\w-]+(\.[\w-]+)+(\/[^\s]*)?/g
\`\`\`

### Phone Number (flexible)
\`\`\`
/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}[0-9]$/
\`\`\`

### Hex Color Code
\`\`\`
/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
\`\`\`

### Password Validation (min 8 chars, uppercase, lowercase, digit)
\`\`\`
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
\`\`\`

### Extract Links from HTML
\`\`\`javascript
const html = '<a href="https://example.com">Link</a>';
const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
// ['https://example.com']
\`\`\`

## JavaScript Regex Usage

\`\`\`javascript
// Test if string matches
/^\d{4}$/.test('2024')      // true
/^\d{4}$/.test('abc')       // false

// Find first match
'hello world'.match(/\w+/)  // ['hello']

// Find all matches
'hello world'.match(/\w+/g) // ['hello', 'world']

// Replace
'foo bar'.replace(/foo/, 'baz')  // 'baz bar'
'a1b2c3'.replace(/\d/g, '_')    // 'a_b_c_'

// Replace with function
'hello world'.replace(/(\w+)/g, w => w.toUpperCase())
// 'HELLO WORLD'

// Split
'one,two;;three'.split(/[,;]+/)  // ['one', 'two', 'three']

// Named groups (ES2018+)
const match = '2024-01-15'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
match.groups.year   // '2024'
match.groups.month  // '01'
match.groups.day    // '15'
\`\`\`

## Python Regex

\`\`\`python
import re

# Search (find first match anywhere in string)
match = re.search(r'\d+', 'abc 123 def')
match.group()  # '123'

# Match (only at beginning of string)
re.match(r'\d+', '123 abc')  # Match object
re.match(r'\d+', 'abc 123')  # None

# Find all
re.findall(r'\d+', 'a1b2c3')  # ['1', '2', '3']

# Substitute
re.sub(r'\d+', 'NUM', 'a1b2c3')  # 'aNUMbNUMcNUM'

# Split
re.split(r'[,;]+', 'one,two;;three')  # ['one', 'two', 'three']

# Compile for reuse
pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
pattern.match('2024-01-15')  # Match
\`\`\`

## Performance and Pitfalls

### Catastrophic Backtracking (ReDoS)

Some patterns cause exponential backtracking on certain inputs:

\`\`\`
/(a+)+$/
\`\`\`

Input `"aaaaaaaaaa!"` causes the engine to try countless combinations before failing (called **ReDoS** — Regular Expression Denial of Service). Avoid nested quantifiers with the same character class.

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `[a-Z]` | Invalid range | Use `[a-zA-Z]` |
| Forgetting `g` flag | Only first match | Add `g` |
| Not escaping `.` | Matches any char | Use `\.` for literal dot |
| Greedy inside HTML | Matches too much | Use lazy `.*?` |

## When NOT to Use Regex

- **Parsing HTML/XML**: Use a DOM parser. HTML is not regular; regex cannot reliably parse nested tags.
- **Parsing JSON**: Use `JSON.parse()`. Regex is error-prone and slower.
- **Complex date parsing**: Use a date library (dayjs, date-fns, Temporal).
- **Email validation in production**: Use a battle-tested library — email addresses have edge cases that simple regex misses.

→ Try the [Regex Tester](/regex-tester)"""

WEB_ARTICLES['jwt-parser-web-guide'] = r"""## What Is a JWT?

A **JSON Web Token** (JWT, pronounced "jot") is a compact, URL-safe means of representing claims between two parties. Defined in RFC 7519, JWTs are the most widely used format for authentication tokens and API authorization in modern web applications.

A JWT is a string of three Base64URL-encoded parts separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

The three parts: **Header** . **Payload** . **Signature**

## JWT Structure

### Part 1: Header

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

`alg` specifies the signing algorithm:
- `HS256` — HMAC-SHA256 (symmetric, shared secret)
- `RS256` — RSA-SHA256 (asymmetric, public/private key pair)
- `ES256` — ECDSA with P-256 and SHA-256
- `none` — No signature (**NEVER use in production**)

### Part 2: Payload (Claims)

\`\`\`json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622,
  "iss": "https://auth.example.com"
}
\`\`\`

**Standard registered claims:**

| Claim | Name | Description |
|-------|------|-------------|
| `iss` | Issuer | Who issued the token |
| `sub` | Subject | Whom the token is about (usually user ID) |
| `aud` | Audience | Who should accept this token |
| `exp` | Expiration | Unix timestamp when token expires |
| `nbf` | Not Before | Token valid from this time |
| `iat` | Issued At | When the token was issued |
| `jti` | JWT ID | Unique identifier (for revocation) |

### Part 3: Signature

For HS256:
\`\`\`
HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
\`\`\`

For RS256, the server signs with its **private key** and clients verify with the **public key**.

## How JWT Authentication Works

\`\`\`
1. User logs in: POST /login {username, password}
2. Server verifies credentials
3. Server creates JWT with user claims, signs it
4. Server returns JWT to client
5. Client stores JWT (localStorage, sessionStorage, or cookie)

For subsequent requests:
6. Client sends: Authorization: Bearer <jwt>
7. Server verifies signature
8. Server reads claims (NO database lookup needed!)
9. Server processes request
\`\`\`

The key advantage: **stateless**. The server doesn't query a database to validate the token.

## Decoding vs Verifying

**Decoding** is just Base64URL-decoding. Anyone can decode a JWT — it is NOT encrypted.

**Verifying** means checking the signature to ensure the token was issued by a trusted party and hasn't been modified.

\`\`\`javascript
// Decode without verification (read the payload, but don't trust it)
function decodeJwt(token) {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

// Verify using a library (ALWAYS do this before trusting claims)
import jwt from 'jsonwebtoken';

try {
  const claims = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256']  // Always specify allowed algorithms!
  });
  console.log(claims.sub);  // user ID
} catch (err) {
  return res.status(401).json({ error: 'Invalid token' });
}
\`\`\`

## Creating JWTs

\`\`\`javascript
// Node.js with jsonwebtoken
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h', issuer: 'https://auth.example.com' }
);
\`\`\`

\`\`\`python
import jwt
from datetime import datetime, timedelta

payload = {
    'sub': str(user.id),
    'email': user.email,
    'exp': datetime.utcnow() + timedelta(hours=1),
    'iat': datetime.utcnow(),
}
token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
\`\`\`

## JWT vs Session Tokens

| Aspect | JWT (Stateless) | Session (Stateful) |
|--------|-----------------|-------------------|
| Storage | Client-side | Server-side (DB/Redis) |
| Verification | Signature check only | Database lookup required |
| Revocation | Hard (until expiry) | Easy (delete session) |
| Scalability | Excellent | Requires shared session store |
| Data exposure | Payload is readable | No data exposed to client |

## Security Best Practices

### 1. Always Verify the Signature
Never trust a JWT without verifying its signature.

### 2. Validate All Claims
\`\`\`javascript
jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'https://auth.example.com',
  audience: 'https://api.example.com',
});
\`\`\`

### 3. Use Short Expiry Times
\`\`\`javascript
// Access tokens: short-lived
jwt.sign(payload, secret, { expiresIn: '15m' });

// Refresh tokens: longer-lived, stored securely
jwt.sign(refreshPayload, refreshSecret, { expiresIn: '7d' });
\`\`\`

### 4. Store JWTs in HttpOnly Cookies for Sensitive Apps

`localStorage` is accessible to JavaScript and vulnerable to XSS:

\`\`\`javascript
res.cookie('token', jwt, {
  httpOnly: true,      // not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 900_000,     // 15 minutes
});
\`\`\`

### 5. Beware the `alg: none` Attack

Always specify allowed algorithms explicitly:
\`\`\`javascript
// ❌ Dangerous: attacker can forge tokens with alg: none
jwt.verify(token, secret);

// ✅ Safe: only accept HS256
jwt.verify(token, secret, { algorithms: ['HS256'] });
\`\`\`

## JWT Revocation Strategies

Stateless JWTs can't be individually revoked before expiry. Options:

1. **Short expiry + refresh tokens**: Access tokens expire in 15 minutes; revoke refresh token to prevent renewal.
2. **Deny-list (blocklist)**: Store revoked `jti` values in Redis. Check on each request.
3. **Version number in claims**: Include a `version` claim; increment user version in DB to invalidate old tokens.

→ Try the [JWT Parser](/jwt-parser)"""

WEB_ARTICLES['url-parser-guide'] = r"""## What Is URL Parsing?

**URL parsing** is the process of decomposing a Uniform Resource Locator (URL) into its individual components — protocol, host, port, path, query string, and fragment. While a URL looks like a single string, it is actually a structured set of fields, each with specific syntax rules defined by RFC 3986.

## The Full URL Anatomy

\`\`\`
https://user:password@www.example.com:8080/path/to/page?key=value&foo=bar#section2
│      │              │               │    │             │                 │
│      │              │               │    │             │                 └── Fragment
│      │              │               │    │             └── Query String
│      │              │               │    └── Path
│      │              │               └── Port
│      │              └── Host (subdomain.domain.tld)
│      └── Userinfo (rarely used)
└── Scheme (Protocol)
\`\`\`

### Component Breakdown

| Component | Example | Description |
|-----------|---------|-------------|
| Scheme | `https` | Protocol identifier |
| Userinfo | `user:pass` | Credentials (deprecated; use Authorization header) |
| Host | `www.example.com` | Domain name or IP address |
| Port | `8080` | TCP port (default: 443 HTTPS, 80 HTTP) |
| Path | `/path/to/page` | Resource location |
| Query | `key=value&foo=bar` | Key-value parameters |
| Fragment | `section2` | Client-side anchor (never sent to server) |

## Parsing URLs in JavaScript

The modern `URL` class is the gold standard:

\`\`\`javascript
const url = new URL('https://www.example.com:8080/search?q=hello+world&page=2#results');

url.protocol   // "https:"
url.host       // "www.example.com:8080"
url.hostname   // "www.example.com"
url.port       // "8080"
url.pathname   // "/search"
url.search     // "?q=hello+world&page=2"
url.hash       // "#results"
url.origin     // "https://www.example.com:8080"

// Query parameters (automatically decoded)
url.searchParams.get('q')    // "hello world"
url.searchParams.get('page') // "2"

// Iterate all params
for (const [key, value] of url.searchParams) {
  console.log(key, value);
}
\`\`\`

## Constructing URLs

\`\`\`javascript
// Build URL from parts
const url = new URL('https://api.example.com');
url.pathname = '/v2/users';
url.searchParams.set('limit', '10');
url.searchParams.set('page', '1');
url.searchParams.set('filter', 'active');

console.log(url.toString());
// https://api.example.com/v2/users?limit=10&page=1&filter=active

// Modify existing URL
const base = new URL('https://example.com/products?sort=price');
base.searchParams.set('page', '2');
console.log(base.href);
// https://example.com/products?sort=price&page=2
\`\`\`

## Relative URLs

\`\`\`javascript
// Resolve relative URL against a base
new URL('/about', 'https://example.com').href
// "https://example.com/about"

new URL('./docs', 'https://example.com/api/').href
// "https://example.com/api/docs"

new URL('?tab=docs', 'https://example.com/page').href
// "https://example.com/page?tab=docs"
\`\`\`

## Parsing URLs in Python

\`\`\`python
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

url_str = 'https://www.example.com:8080/search?q=hello+world&page=2#results'
parsed = urlparse(url_str)

parsed.scheme    # 'https'
parsed.netloc    # 'www.example.com:8080'
parsed.hostname  # 'www.example.com'
parsed.port      # 8080
parsed.path      # '/search'
parsed.query     # 'q=hello+world&page=2'
parsed.fragment  # 'results'

# Parse query string
params = parse_qs(parsed.query)
params['q']     # ['hello world']  (already decoded)
params['page']  # ['2']

# Reconstruct URL
new_query = urlencode({'q': 'new search', 'page': 3})
new_url = urlunparse(parsed._replace(query=new_query, fragment=''))
\`\`\`

## URL Components in Depth

### The Fragment (`#anchor`)

The fragment is **client-only** — browsers never send it to the server. It's used for:
- Anchor navigation: `#section-2` scrolls to `id="section-2"`
- Single Page App routing: `#!/products/42`
- OAuth state return: `#access_token=...` (implicit flow)

\`\`\`javascript
// Fragment changes don't reload the page
location.hash = '#new-section';

// Detect fragment changes
window.addEventListener('hashchange', () => {
  console.log('Hash changed to:', location.hash);
});
\`\`\`

### Ports

Default ports (omitted when standard):
- HTTP: 80
- HTTPS: 443

\`\`\`javascript
new URL('https://example.com').port     // "" (default 443)
new URL('https://example.com:8443').port // "8443"
\`\`\`

### Multi-value Query Parameters

\`\`\`
?tag=javascript&tag=typescript&tag=nodejs

// JavaScript
url.searchParams.getAll('tag')  // ['javascript', 'typescript', 'nodejs']

// Python
parse_qs('tag=js&tag=ts')  # {'tag': ['js', 'ts']}
\`\`\`

## URL Normalization

Normalizing URLs ensures consistent comparisons and deduplication:

\`\`\`javascript
function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.hostname = url.hostname.toLowerCase();

  // Remove default ports
  if ((url.protocol === 'https:' && url.port === '443') ||
      (url.protocol === 'http:'  && url.port === '80')) {
    url.port = '';
  }

  // Remove trailing slash (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  url.searchParams.sort(); // deterministic parameter order
  url.hash = '';           // remove fragment
  return url.toString();
}

normalizeUrl('HTTPS://Example.COM:443/page/?b=2&a=1#section')
// 'https://example.com/page?a=1&b=2'
\`\`\`

## Security Considerations

### Open Redirect Validation

Always validate redirect URLs to prevent open redirect attacks:

\`\`\`javascript
function isSafeRedirect(redirectUrl, allowedHosts) {
  try {
    const url = new URL(redirectUrl, 'https://myapp.com');
    return allowedHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

isSafeRedirect('/dashboard', ['myapp.com']);        // true ✅
isSafeRedirect('https://evil.com/phish', ['myapp.com']); // false ❌
\`\`\`

### SSRF Prevention

\`\`\`javascript
function isPublicUrl(urlStr) {
  const url = new URL(urlStr);
  const hostname = url.hostname;
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blocked.includes(hostname)) return false;
  if (/^10\./.test(hostname)) return false;
  if (/^192\.168\./.test(hostname)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
  return true;
}
\`\`\`

→ Try the [URL Parser](/url-parser)"""

WEB_ARTICLES['meta-tag-generator-guide'] = r"""## What Are Meta Tags?

**Meta tags** are HTML elements placed in the `<head>` section of a web page. They provide metadata about the page — information not displayed to users but read by search engines, social media platforms, and browsers.

\`\`\`html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn how meta tags work for SEO.">
  <meta property="og:title" content="Complete Meta Tag Guide">
  <title>Complete Meta Tag Guide | MyWebsite</title>
</head>
\`\`\`

## Essential Meta Tags

### 1. Charset Declaration

\`\`\`html
<meta charset="UTF-8">
\`\`\`

Always the **first tag** in `<head>`. Declares character encoding. UTF-8 supports all languages. Without this, browsers may display garbled characters for non-ASCII content.

### 2. Viewport

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

Controls rendering on mobile devices. Without it, mobile browsers render at desktop width and zoom out. Never add `user-scalable=no` — it harms accessibility.

### 3. Description

\`\`\`html
<meta name="description" content="A concise, compelling description, ideally 150-160 characters.">
\`\`\`

Appears as the snippet in Google search results. A well-written description significantly improves click-through rates.

**Best practices:**
- Length: 150-160 characters
- Include primary keyword naturally
- Write like marketing copy — be compelling
- Make each page's description unique

### 4. Title Tag

\`\`\`html
<title>Primary Keyword - Secondary Info | Brand Name</title>
\`\`\`

Appears in search result headings, browser tab labels, and social shares.

- Length: 50-60 characters
- Put the most important keyword first
- Include brand name at the end
- Make each page title unique

## Open Graph (OG) Tags

Open Graph tags control how your content looks when shared on social media (Facebook, Twitter, LinkedIn, WhatsApp, Slack):

\`\`\`html
<!-- Required OG tags -->
<meta property="og:title" content="Complete Meta Tag Guide">
<meta property="og:description" content="Everything about meta tags for SEO and social sharing.">
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:url" content="https://example.com/meta-guide">
<meta property="og:type" content="website">

<!-- Recommended -->
<meta property="og:site_name" content="MyWebsite">
<meta property="og:locale" content="en_US">
\`\`\`

### OG Image Requirements

| Platform | Recommended Size | Aspect Ratio |
|----------|-----------------|--------------|
| Facebook | 1200×630 px | 1.91:1 |
| Twitter | 1200×628 px | ~1.91:1 |
| LinkedIn | 1200×627 px | ~1.91:1 |

**Best practices:** Use at least 1200×630 pixels, keep file size under 1MB, include legible text, host on a public CDN.

### OG Type Values

\`\`\`html
<meta property="og:type" content="website">
<meta property="og:type" content="article">

<!-- For articles, add these too: -->
<meta property="article:published_time" content="2024-01-15T09:00:00Z">
<meta property="article:author" content="https://example.com/authors/alice">
<meta property="article:tag" content="SEO">
\`\`\`

## Twitter Card Tags

\`\`\`html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@YourHandle">
<meta name="twitter:creator" content="@AuthorHandle">
<meta name="twitter:title" content="Complete Meta Tag Guide">
<meta name="twitter:description" content="Everything about meta tags.">
<meta name="twitter:image" content="https://example.com/og-image.jpg">
<meta name="twitter:image:alt" content="Diagram showing meta tag anatomy">
\`\`\`

**Card types:**
- `summary` — small square image with text
- `summary_large_image` — large rectangular image (recommended for most content)
- `app` — App Store links
- `player` — Embedded video/audio player

## SEO-Related Meta Tags

### Robots Meta Tag

\`\`\`html
<!-- Allow indexing and link following (default) -->
<meta name="robots" content="index, follow">

<!-- Prevent indexing -->
<meta name="robots" content="noindex">

<!-- Don't follow links on this page -->
<meta name="robots" content="nofollow">

<!-- Prevent snippet in search results -->
<meta name="robots" content="nosnippet">

<!-- Combined -->
<meta name="robots" content="noindex, nofollow">
\`\`\`

Use `noindex` for: duplicate content pages (pagination, print versions), admin pages, thank-you pages, staging environments.

### Canonical URL

Prevents duplicate content penalties when the same content is accessible via multiple URLs:

\`\`\`html
<link rel="canonical" href="https://example.com/the-definitive-url">
\`\`\`

Use when you have UTM tracking parameters, http/https variants, www/non-www variants, or paginated content.

## Complete Meta Tag Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Essential -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — 50-60 chars | Brand</title>
  <meta name="description" content="Compelling description, 150-160 chars.">

  <!-- Canonical -->
  <link rel="canonical" href="https://example.com/page-url">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description.">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/page-url">
  <meta property="og:site_name" content="Brand Name">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@handle">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Page description.">
  <meta name="twitter:image" content="https://example.com/og-image.jpg">

  <!-- SEO -->
  <meta name="robots" content="index, follow">
</head>
\`\`\`

## Testing Your Meta Tags

- **Facebook Sharing Debugger**: `developers.facebook.com/tools/debug/`
- **Twitter Card Validator**: `cards-dev.twitter.com/validator`
- **LinkedIn Post Inspector**: `linkedin.com/post-inspector/`
- **Google Rich Results Test**: `search.google.com/test/rich-results`

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Missing OG image | Ugly link previews | Add `og:image` with 1200×630px |
| Description > 160 chars | Truncated in results | Keep under 160 chars |
| Duplicate titles | SEO confusion | Write unique titles per page |
| Forgetting viewport meta | Bad mobile UX | Add viewport to every page |
| Wrong canonical URL | Duplicate content penalty | Point to the preferred URL |
| `noindex` in production | Invisible to search engines | Check before deploying |

→ Try the [Meta Tag Generator](/meta-tag-generator)"""


# --- Apply all replacements ---
import re

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    file_content = f.read()

original_length = len(file_content)
replaced_count = 0

for slug, new_content in WEB_ARTICLES.items():
    # Find the article block start
    slug_pattern = f"slug: '{slug}'"
    idx = file_content.find(slug_pattern)
    if idx == -1:
        print(f"❌ Slug not found: {slug}")
        continue

    # Find the content field start
    content_start_marker = "    content: `"
    content_start = file_content.find(content_start_marker, idx)
    if content_start == -1:
        print(f"❌ Content field not found for: {slug}")
        continue

    # Find the end of the content template literal
    # We need to find the closing backtick that's on its own (not inside a code block)
    pos = content_start + len(content_start_marker)
    while pos < len(file_content):
        if file_content[pos] == '`':
            # Check it's not followed by another backtick (which would make it ```)
            # and not preceded by backslash
            if (file_content[pos-1] != '\\' and
                (pos + 1 >= len(file_content) or file_content[pos+1] != '`')):
                content_end = pos
                break
        pos += 1
    else:
        print(f"❌ Content end not found for: {slug}")
        continue

    # Check what comes after
    suffix = file_content[content_end:content_end+5]
    if not (suffix.startswith('`') and (suffix[1] in (',', '\n', ' '))):
        print(f"⚠️  Unexpected suffix for {slug}: {repr(suffix)}")

    # Replace content between the backticks
    old_section = file_content[content_start:content_end+1]
    new_section = "    content: `" + new_content + "`"

    file_content = file_content[:content_start] + new_section + file_content[content_end+1:]
    replaced_count += 1
    new_words = len(new_content.split())
    print(f"✅ Replaced: {slug} ({new_words} words)")

with open('src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
    f.write(file_content)

print(f"\nDone. Replaced {replaced_count}/{len(WEB_ARTICLES)} articles.")
print(f"File size: {len(file_content)} chars (was {original_length})")
