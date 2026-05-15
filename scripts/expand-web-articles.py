#!/usr/bin/env python3
"""Expand Web category articles to 800-1500 words each."""

WEB_ARTICLES = {

'url-encoding-explained': '''## What Is URL Encoding?

URL encoding (also called **percent-encoding**) is the process of converting characters into a format that can be safely transmitted in a URL. Every URL can only contain a limited set of ASCII characters. Characters outside this set — including spaces, punctuation, Unicode text like Chinese or Arabic, and special symbols — must be encoded before they appear in a URL.

The mechanism is straightforward: each unsafe character is replaced by a `%` sign followed by two hexadecimal digits representing the character's ASCII (or UTF-8) byte value.

**Example:**
```
Space → %20
© → %C2%A9
中文 → %E4%B8%AD%E6%96%87
```

## Why URL Encoding Exists

URLs were defined by RFC 3986 and are restricted to a specific set of "unreserved" characters:
```
A-Z  a-z  0-9  -  _  .  ~
```

All other characters are either "reserved" (they carry special meaning in URLs, like `/` for path separators and `?` for query strings) or "unsafe" (they may be misinterpreted by browsers, servers, and proxies). URL encoding allows you to include any character in a URL while preserving the structural meaning of the reserved characters.

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

If your data contains a literal `&` that is not a separator — say, a company name "Johnson & Johnson" — it must be encoded as `Johnson%20%26%20Johnson` in a URL query parameter.

## Percent-Encoding Examples

| Original | Encoded |
|----------|---------|
| `Hello World` | `Hello%20World` |
| `user@example.com` | `user%40example.com` |
| `price=5&qty=2` | `price%3D5%26qty%3D2` |
| `中文` | `%E4%B8%AD%E6%96%87` |
| `C:\\path\\file.txt` | `C%3A%5Cpath%5Cfile.txt` |
| `1+1=2` | `1%2B1%3D2` |

## URL Encoding vs HTML Entity Encoding

These are two different encoding systems that are often confused:

| Situation | Use | Example |
|-----------|-----|---------|
| Inside a URL | Percent-encoding | `%26` |
| Inside HTML markup | HTML entities | `&amp;` |
| Inside a URL that's also in HTML | Both | `href="search?q=a%26b"` → HTML: `href="search?q=a%26amp;b"` |

When building URLs that will be placed in HTML attributes, you need to apply URL encoding first, then HTML entity encoding.

## The `+` vs `%20` Distinction

This is a subtle but critical difference between two contexts:

- **In query strings (application/x-www-form-urlencoded)**: `+` means a space. This is the format used by HTML forms. `Hello+World` → `Hello World`.
- **In path segments**: `+` is a literal plus sign. A space in a path must be `%20`.

```
Form data: q=Hello+World    → query value = "Hello World"
URL path:  /files/Hello+World → path = "/files/Hello+World" (literal plus!)
URL path:  /files/Hello%20World → path = "/files/Hello World"
```

This difference trips up many developers. When in doubt, use `%20` — it works correctly in both contexts.

## JavaScript: `encodeURIComponent` vs `encodeURI`

JavaScript provides two built-in encoding functions with very different scopes:

```javascript
// encodeURIComponent — encodes EVERYTHING except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
// Use for individual values being embedded in a URL
encodeURIComponent('Hello World');    // "Hello%20World"
encodeURIComponent('a=1&b=2');        // "a%3D1%26b%3D2"
encodeURIComponent('中文');           // "%E4%B8%AD%E6%96%87"
encodeURIComponent('http://x.com/'); // "http%3A%2F%2Fx.com%2F"

// encodeURI — encodes everything EXCEPT the characters that are valid in complete URLs
// Use for encoding a full URL that already has structure
encodeURI('https://example.com/path with spaces?q=hello world');
// "https://example.com/path%20with%20spaces?q=hello%20world"
// Note: ://?= are NOT encoded — they're part of URL structure
```

**Rule of thumb:**
- Building a URL programmatically with parameters? Use `encodeURIComponent` for each key and value.
- Encoding a complete URL that you received from somewhere? Use `encodeURI`.
- Never use the old `escape()` function — it's deprecated and handles Unicode incorrectly.

```javascript
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
```

## Decoding URLs

Decoding reverses the process:

```javascript
// Decode
decodeURIComponent('Hello%20World');  // "Hello World"
decodeURIComponent('%E4%B8%AD%E6%96%87'); // "中文"

// The URL API handles this automatically
const url = new URL('https://example.com/search?q=hello%20world');
url.searchParams.get('q'); // "hello world" — already decoded!
```

```python
from urllib.parse import quote, unquote, quote_plus, unquote_plus

# Encode
quote('Hello World')          # 'Hello%20World'
quote_plus('Hello World')     # 'Hello+World'  (for form data)
quote('中文', safe='')        # '%E4%B8%AD%E6%96%87'

# Decode
unquote('Hello%20World')      # 'Hello World'
unquote_plus('Hello+World')   # 'Hello World'
```

## Common URL Encoding Mistakes

**Mistake 1: Double-encoding**

Encoding an already-encoded URL encodes the `%` signs again:
```
Original: Hello World
Encoded once:  Hello%20World
Encoded twice: Hello%2520World  ← WRONG (the % became %25)
```

Always check whether a string is already encoded before encoding again.

**Mistake 2: Not encoding file paths on Windows**

Windows paths use backslashes, which must be encoded:
```
C:\Users\Alice\file.txt → C%3A%5CUsers%5CAlice%5Cfile.txt
```

**Mistake 3: Forgetting to encode user input**

Any data that originates from user input must be encoded before being placed in a URL. Failure to do so can cause broken URLs or open redirect vulnerabilities.

**Mistake 4: Encoding the entire URL at once**

```javascript
// ❌ Wrong: encodes the colon and slashes too
encodeURIComponent('https://example.com/search?q=hello');
// "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello"

// ✅ Correct: only encode the parts that need it
const q = encodeURIComponent('hello world');
const url = `https://example.com/search?q=${q}`;
```

## Internationalized Domain Names (IDN)

Domain names with non-ASCII characters (e.g., `münchen.de`) are handled differently from URL paths. They use **Punycode** encoding, not percent-encoding:

```
münchen.de → xn--mnchen-3ya.de
```

Browsers display the Unicode form in the address bar but send the Punycode form over the network. The `URL` API in modern browsers handles this automatically.

## Quick Reference: Safe Characters (No Encoding Needed)

```
Uppercase: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Lowercase: a b c d e f g h i j k l m n o p q r s t u v w x y z
Digits:    0 1 2 3 4 5 6 7 8 9
Special:   - _ . ~
```

Everything else should be percent-encoded when used as data (not as structural URL characters).

→ Try the [URL Encoder / Decoder](/url-encoder)''',

'http-status-codes-complete-guide': '''## What Are HTTP Status Codes?

Every HTTP response includes a three-digit **status code** that tells the client (browser, API consumer, mobile app) what happened with their request. Status codes are standardized by IANA (Internet Assigned Numbers Authority) and documented in RFC 9110. Understanding them is fundamental to web development, API design, and debugging.

Status codes are grouped into five classes based on the first digit:

| Class | Range | Meaning |
|-------|-------|---------|
| 1xx | 100–199 | Informational — request received, processing continues |
| 2xx | 200–299 | Success — request received, understood, and accepted |
| 3xx | 300–399 | Redirection — further action needed to complete request |
| 4xx | 400–499 | Client error — request contains bad syntax or cannot be fulfilled |
| 5xx | 500–599 | Server error — server failed to fulfill an apparently valid request |

## 2xx: Success Codes

### 200 OK
The most common success code. The request succeeded, and the response body contains the requested data.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"user": "alice", "email": "alice@example.com"}
```

### 201 Created
The request succeeded and a new resource was created. Always include a `Location` header pointing to the new resource.

```http
HTTP/1.1 201 Created
Location: /api/users/42
Content-Type: application/json

{"id": 42, "user": "alice"}
```

Use 201 for POST requests that create new resources. This tells the client exactly where the new resource lives.

### 204 No Content
The request succeeded but there's nothing to return. Common for DELETE operations and updates where you don't need to return the updated resource.

```http
HTTP/1.1 204 No Content
```

### 206 Partial Content
Used with range requests for large files (videos, PDFs). The client requested only part of the resource via the `Range` header.

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/146515
```

## 3xx: Redirection Codes

### 301 Moved Permanently
The resource has permanently moved to a new URL. Browsers and search engines cache this redirect and update their records.

```http
HTTP/1.1 301 Moved Permanently
Location: https://www.example.com/new-page
```

**SEO note:** 301 passes ~90-99% of "link equity" to the new URL. Use it when migrating content.

### 302 Found (Temporary Redirect)
The resource temporarily lives at a different URL. Browsers follow it but don't cache it. Search engines don't update the old URL.

### 303 See Other
After a POST, redirect to a GET to show the result. This implements the **Post/Redirect/Get** pattern, preventing duplicate form submissions on page refresh.

```
POST /checkout → 303 See Other → GET /order/123/confirmation
```

### 304 Not Modified
The client's cached version is still valid; don't re-download the resource. Works with `ETag` and `Last-Modified` headers.

```http
GET /styles.css
If-None-Match: "etag-value-123"

→ HTTP/1.1 304 Not Modified
```

### 307 Temporary Redirect / 308 Permanent Redirect
Like 302/301 but **preserve the HTTP method**. A POST that gets a 307 will POST to the new URL. Use these instead of 301/302 when you need to maintain the original method.

| Code | Permanent? | Preserves method? |
|------|-----------|-------------------|
| 301 | ✅ | ❌ (POST → GET) |
| 302 | ❌ | ❌ (POST → GET) |
| 307 | ❌ | ✅ |
| 308 | ✅ | ✅ |

## 4xx: Client Error Codes

### 400 Bad Request
The request is malformed, has invalid syntax, or the server cannot process it. Return detailed error information to help the client fix the request.

```json
HTTP/1.1 400 Bad Request
{
  "error": "validation_error",
  "message": "The 'email' field is required",
  "field": "email"
}
```

### 401 Unauthorized
Despite the name, this means **unauthenticated** — the client is not logged in. Accompanied by a `WWW-Authenticate` header.

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
```

### 403 Forbidden
The client is **authenticated** but lacks **permission**. The difference from 401:
- 401: Who are you? Please authenticate.
- 403: I know who you are, but you can't do that.

### 404 Not Found
The requested resource doesn't exist. Also used intentionally to hide existence of resources (e.g., returning 404 instead of 403 so attackers don't know a resource exists).

### 405 Method Not Allowed
The HTTP method is not allowed for this endpoint. Must include an `Allow` header listing valid methods:

```http
HTTP/1.1 405 Method Not Allowed
Allow: GET, POST
```

### 409 Conflict
The request conflicts with the current state. Classic use: trying to create a user with an email that already exists.

```json
HTTP/1.1 409 Conflict
{"error": "duplicate_email", "message": "This email is already registered"}
```

### 410 Gone
Like 404, but the resource **existed** and was **permanently removed**. Useful for SEO — search engines remove 410 pages from the index faster than 404 pages.

### 422 Unprocessable Entity
The request is syntactically valid but semantically invalid. Used by many REST APIs when validation fails:

```json
HTTP/1.1 422 Unprocessable Entity
{
  "errors": {
    "age": ["must be greater than 0"],
    "email": ["is not a valid email address"]
  }
}
```

### 429 Too Many Requests
Rate limiting. The client has sent too many requests. Include `Retry-After` to tell the client when to try again:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
```

## 5xx: Server Error Codes

### 500 Internal Server Error
A generic catch-all for unhandled server errors. Log the full error on the server side; return a generic message to the client (never expose stack traces or internal details in production).

### 502 Bad Gateway
The server is acting as a proxy and received an invalid response from the upstream server. Common when your Nginx/load balancer can't reach the app server.

### 503 Service Unavailable
The server is temporarily unable to handle requests — overloaded or in maintenance. Include `Retry-After` if the downtime is expected to be brief.

### 504 Gateway Timeout
The proxy server timed out waiting for the upstream server. Distinct from 503: the upstream server was reachable but didn't respond in time.

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
```json
HTTP/1.1 200 OK
{"success": false, "error": "User not found"}
```
This is wrong. Use 404. The HTTP status code *is* the status — don't duplicate it in the body.

**Using 401 when you mean 403:**
Remember: 401 = unauthenticated (no credentials), 403 = unauthorized (wrong permissions).

**Using 500 for client errors:**
If the client sent bad data and your code crashed, fix your validation to return 400/422 instead.

→ Try the [HTTP Status Code Reference](/http-status-codes)''',

'crontab-generator-guide': '''## What Is Cron?

**Cron** is a time-based job scheduler in Unix-like operating systems. It runs commands (called "cron jobs") automatically at specified times and intervals — from "every minute" to "the second Tuesday of every third month." The cron daemon (`crond`) runs in the background and checks the **crontab** (cron table) file every minute to see if any jobs are scheduled to run.

Cron is the backbone of automated server maintenance, report generation, database backups, cache clearing, API polling, and virtually every scheduled task in backend infrastructure.

## Cron Expression Syntax

A cron expression consists of **5 fields** (plus the command):

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ ┌───────────── day of week (0-7 or SUN-SAT, 0 and 7 are both Sunday)
│ │ │ │ │
* * * * * command_to_execute
```

### Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| `*` | Any value | `* * * * *` — every minute |
| `,` | List separator | `0,30 * * * *` — at :00 and :30 |
| `-` | Range | `0 9-17 * * *` — every hour from 9am to 5pm |
| `/` | Step | `*/15 * * * *` — every 15 minutes |
| `@reboot` | At startup | `@reboot /start.sh` |

## Common Cron Patterns

### Time-Based Schedules

```bash
# Every minute
* * * * * /script.sh

# Every 5 minutes
*/5 * * * * /script.sh

# Every 15 minutes
*/15 * * * * /script.sh

# Every hour (at :00)
0 * * * * /script.sh

# Every 2 hours
0 */2 * * * /script.sh

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

# Every quarter (Jan 1, Apr 1, Jul 1, Oct 1) at midnight
0 0 1 1,4,7,10 * /script.sh

# Every weekday (Mon-Fri) at 9 AM
0 9 * * 1-5 /script.sh
```

### @shortcuts

Many cron implementations support `@` shortcuts:

| Shortcut | Equivalent | When |
|----------|-----------|------|
| `@yearly` | `0 0 1 1 *` | Once a year, January 1 at midnight |
| `@annually` | `0 0 1 1 *` | Same as @yearly |
| `@monthly` | `0 0 1 * *` | First day of every month at midnight |
| `@weekly` | `0 0 * * 0` | Every Sunday at midnight |
| `@daily` | `0 0 * * *` | Every day at midnight |
| `@midnight` | `0 0 * * *` | Same as @daily |
| `@hourly` | `0 * * * *` | Every hour at :00 |
| `@reboot` | N/A | Once at system startup |

## Managing the Crontab

```bash
# Edit your crontab (opens in $EDITOR)
crontab -e

# List your current crontab
crontab -l

# Remove your crontab entirely (destructive!)
crontab -r

# Edit another user's crontab (requires sudo)
sudo crontab -u www-data -e

# System-wide cron directories (no crontab command needed, just drop files in)
/etc/cron.d/         # Custom cron files
/etc/cron.daily/     # Scripts run daily
/etc/cron.hourly/    # Scripts run hourly
/etc/cron.weekly/    # Scripts run weekly
/etc/cron.monthly/   # Scripts run monthly
```

## Writing Reliable Cron Jobs

### 1. Always Use Absolute Paths

Cron runs with a minimal `PATH` (`/usr/bin:/bin`). Scripts that work in your terminal may fail in cron because they can't find commands.

```bash
# ❌ May fail in cron
0 2 * * * cleanup.sh

# ✅ Always works
0 2 * * * /home/alice/scripts/cleanup.sh
```

Inside your scripts, also use absolute paths for every command:
```bash
#!/bin/bash
/usr/bin/find /var/log -name "*.log" -mtime +30 -delete
/usr/bin/gzip /var/backups/db.sql
```

### 2. Set the PATH Explicitly in Crontab

```bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Now your cron commands can find executables normally
0 2 * * * /deploy.sh
```

### 3. Handle Stdout and Stderr

By default, cron emails output to the local system user. This often silently discards errors. Redirect explicitly:

```bash
# Discard all output (bad — you'll miss errors)
0 2 * * * /backup.sh > /dev/null 2>&1

# Better: log to a file
0 2 * * * /backup.sh >> /var/log/backup.log 2>&1

# Best: log with timestamps
0 2 * * * /backup.sh >> /var/log/backup.log 2>&1 && echo "$(date): backup succeeded" >> /var/log/backup.log
```

### 4. Set MAILTO for Error Alerts

```bash
MAILTO=ops@example.com

# Now you'll receive an email if the job produces output (typically on error)
0 2 * * * /backup.sh >> /var/log/backup.log
```

### 5. Prevent Overlapping Jobs

If a job takes longer than its interval, it may overlap with the next run. Use `flock` to prevent this:

```bash
# Only runs if no other instance is running; skips otherwise
*/5 * * * * flock -n /tmp/myjob.lock /var/scripts/process.sh
```

## Cron vs Modern Alternatives

| Tool | Best For |
|------|---------|
| cron | Simple server-side scheduling |
| systemd timers | Linux systems (better logging, dependencies) |
| Kubernetes CronJob | Container workloads |
| Cloud Scheduler | Serverless / cloud-native |
| GitHub Actions schedule | CI/CD workflows |
| APScheduler (Python) | In-process scheduling |
| node-cron | Node.js in-process scheduling |

## Real-World Examples

```bash
# Daily database backup at 3 AM
0 3 * * * /usr/bin/pg_dump mydb | gzip > /backups/db-$(date +%Y%m%d).sql.gz

# Clear temp files every 6 hours
0 */6 * * * /usr/bin/find /tmp -type f -mtime +1 -delete

# Renew SSL certificates on the 1st and 15th of each month
0 0 1,15 * * /usr/bin/certbot renew --quiet

# Send weekly report every Monday at 8 AM
0 8 * * 1 /opt/reports/weekly.py | /usr/bin/mail -s "Weekly Report" team@example.com

# Sync files every 30 minutes during business hours (Mon-Fri, 8 AM - 6 PM)
*/30 8-18 * * 1-5 /usr/bin/rsync -az /data/ user@backup.server:/data/

# Health check every minute, restart if down
* * * * * /usr/bin/curl -sf http://localhost:8080/health || systemctl restart myapp
```

## Timezone Considerations

By default, cron uses the system timezone. To specify a timezone per-job (on systems with GNU cron):

```bash
CRON_TZ=America/New_York
0 9 * * * /morning-report.sh

CRON_TZ=Europe/London
0 17 * * * /london-eod.sh
```

For containerized environments, always set `TZ` explicitly:
```dockerfile
ENV TZ=UTC
```

## Debugging Cron Jobs

When a cron job doesn't run as expected:

1. **Check cron is running:** `systemctl status cron`
2. **Check cron logs:** `grep CRON /var/log/syslog` or `journalctl -u cron`
3. **Run as cron would:** `env -i HOME=/root /bin/bash -c '/your/script.sh'`
4. **Check permissions:** The script must be executable (`chmod +x script.sh`)
5. **Verify syntax:** Use an online cron expression validator

→ Try the [Crontab Generator](/crontab-generator)''',

'regex-tester-guide': '''## What Is a Regular Expression?

A **regular expression** (regex or regexp) is a sequence of characters that defines a search pattern. Regex engines search text for matches to the pattern and can also replace, split, or validate text. Originating in theoretical computer science (formal language theory), regular expressions are now built into every major programming language and countless developer tools.

Regex syntax looks cryptic at first — `/^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$/i` — but each character has a precise meaning. Once you understand the building blocks, regex becomes an extraordinarily powerful tool for text processing.

## Core Syntax Reference

### Literal Characters
Most characters match themselves: `cat` matches the string "cat" wherever it appears in text.

### The Dot `.`
Matches any single character except a newline (by default).
```
c.t → matches: cat, cut, c3t, c!t
```

### Character Classes `[...]`
Matches any one character from the set:
```
[aeiou]   → any vowel
[a-z]     → any lowercase letter
[A-Z0-9]  → uppercase letter or digit
[^aeiou]  → any character that is NOT a vowel (^ inside [] means negation)
```

### Predefined Character Classes (Shorthand)

| Shorthand | Equivalent | Meaning |
|-----------|-----------|---------|
| `\\d` | `[0-9]` | Digit |
| `\\D` | `[^0-9]` | Non-digit |
| `\\w` | `[a-zA-Z0-9_]` | Word character |
| `\\W` | `[^a-zA-Z0-9_]` | Non-word character |
| `\\s` | `[ \\t\\n\\r\\f]` | Whitespace |
| `\\S` | `[^ \\t\\n\\r\\f]` | Non-whitespace |

### Anchors
```
^   Start of string (or start of line in multiline mode)
$   End of string (or end of line in multiline mode)
\\b  Word boundary (between \\w and \\W)
\\B  Non-word boundary
```

### Quantifiers

| Quantifier | Meaning |
|------------|---------|
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 (optional) |
| `{n}` | Exactly n times |
| `{n,}` | n or more times |
| `{n,m}` | Between n and m times |

**Greedy vs Lazy:** By default, quantifiers are **greedy** — they match as much as possible. Add `?` to make them **lazy** (match as little as possible):

```
Input: <b>bold</b> and <i>italic</i>
Greedy  <.*>  → matches the ENTIRE string (from first < to last >)
Lazy    <.*?> → matches <b>, </b>, <i>, </i> separately
```

### Groups and Alternation

```
(abc)     → Capturing group: captures "abc" for back-references
(?:abc)   → Non-capturing group: groups without capturing
(cat|dog) → Alternation: matches "cat" or "dog"
```

**Back-references:** Refer to captured groups in the pattern itself:
```
(\\w+) \\1  → matches a word followed by the same word again
              "hello hello" ✅  "hello world" ❌
```

### Lookahead and Lookbehind

Zero-width assertions: they match a position, not characters.

```
(?=...)   → Positive lookahead: followed by ...
(?!...)   → Negative lookahead: NOT followed by ...
(?<=...)  → Positive lookbehind: preceded by ...
(?<!...)  → Negative lookbehind: NOT preceded by ...

price(?=\\s*USD)   → "price" followed by optional space and "USD"
\\d+(?!px)         → number NOT followed by "px"
(?<=\\$)\\d+\\.\\d+  → number preceded by "$"
```

## Flags (Modifiers)

| Flag | Meaning |
|------|---------|
| `i` | Case-insensitive |
| `g` | Global (find all matches, not just first) |
| `m` | Multiline (`^` and `$` match line boundaries) |
| `s` | Dotall (`.` matches newlines too) |
| `u` | Unicode mode |
| `y` | Sticky (start matching at lastIndex) |

```javascript
// Without flags: only finds first match
'cat and CAT'.match(/cat/)     // ['cat']

// With g flag: finds all matches
'cat and CAT'.match(/cat/g)    // ['cat']

// With gi flags: case-insensitive and all matches
'cat and CAT'.match(/cat/gi)   // ['cat', 'CAT']
```

## Practical Regex Patterns

### Email Validation (simplified)
```
/^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$/
```

### URL Matching
```
/https?:\\/\\/[\\w-]+(\\.[\\w-]+)+(\\/[^\\s]*)?/g
```

### Phone Number (flexible)
```
/^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]{6,14}[0-9]$/
```

### IPv4 Address
```
/^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/
```

### Hex Color Code
```
/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
```

### Extract All Links from HTML
```javascript
const html = '<a href="https://example.com">Link</a>';
const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
// ['https://example.com']
```

### Password Validation (min 8 chars, uppercase, lowercase, digit)
```
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/
```

## JavaScript Regex Usage

```javascript
// Test if string matches
/^\\d{4}$/.test('2024')      // true
/^\\d{4}$/.test('abc')       // false

// Find first match
'hello world'.match(/\\w+/)  // ['hello']

// Find all matches
'hello world'.match(/\\w+/g) // ['hello', 'world']

// Replace
'foo bar'.replace(/foo/, 'baz')  // 'baz bar'
'a1b2c3'.replace(/\\d/g, '_')    // 'a_b_c_'

// Replace with function
'hello world'.replace(/(\\w+)/g, w => w.toUpperCase())
// 'HELLO WORLD'

// Split
'one,two;;three'.split(/[,;]+/)  // ['one', 'two', 'three']

// Named groups (modern JavaScript)
const match = '2024-01-15'.match(/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/);
match.groups.year   // '2024'
match.groups.month  // '01'
match.groups.day    // '15'
```

## Performance and Pitfalls

### Catastrophic Backtracking

Some regex patterns cause exponential backtracking on certain inputs, making the engine hang indefinitely (called **ReDoS** — Regular Expression Denial of Service):

```
/(a+)+$/
```

Input `"aaaaaaaaaa!"` causes the engine to try countless combinations before failing. Avoid nested quantifiers with the same character class.

**Safe alternatives:**
- Use possessive quantifiers (`++`) or atomic groups if your engine supports them
- Rewrite patterns to be more specific
- Set timeouts in production code

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `[a-Z]` | Invalid range | Use `[a-zA-Z]` |
| Forgetting `g` flag | Only first match | Add `g` |
| Not escaping `.` | `.` matches any char | Use `\\.` for literal dot |
| Greedy inside HTML | Matches too much | Use lazy `.*?` |

## When NOT to Use Regex

Regex is powerful but not always the right tool:

- **Parsing HTML/XML**: Use a DOM parser. HTML is not regular; regex cannot reliably parse nested tags.
- **Parsing JSON**: Use `JSON.parse()`. Regex is error-prone and slower.
- **Complex date parsing**: Use a date library (dayjs, date-fns).
- **Email validation in production**: Use a battle-tested library — email addresses have numerous edge cases that a simple regex misses.

→ Try the [Regex Tester](/regex-tester)''',

'jwt-parser-web-guide': '''## What Is a JWT?

A **JSON Web Token** (JWT, pronounced "jot") is a compact, URL-safe means of representing claims between two parties. Defined in RFC 7519, JWTs are the most widely used format for authentication tokens and API authorization in modern web applications.

A JWT is a string of three Base64URL-encoded parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

The three parts are:
1. **Header** — algorithm and token type
2. **Payload** — claims (data)
3. **Signature** — verification

## JWT Structure Deep Dive

### Part 1: Header

The header is a JSON object Base64URL-encoded:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

`alg` specifies the signing algorithm:
- `HS256` — HMAC-SHA256 (symmetric, shared secret)
- `RS256` — RSA-SHA256 (asymmetric, public/private key pair)
- `ES256` — ECDSA with P-256 and SHA-256 (asymmetric, elliptic curve)
- `none` — No signature (NEVER use in production — completely insecure)

### Part 2: Payload (Claims)

The payload contains **claims** — statements about the subject:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622,
  "iss": "https://auth.example.com"
}
```

**Registered claims** (standard field names, all optional but recommended):

| Claim | Name | Description |
|-------|------|-------------|
| `iss` | Issuer | Who issued the token |
| `sub` | Subject | Whom the token is about (usually user ID) |
| `aud` | Audience | Who should accept the token |
| `exp` | Expiration | Unix timestamp when the token expires |
| `nbf` | Not Before | Token is not valid before this time |
| `iat` | Issued At | When the token was issued |
| `jti` | JWT ID | Unique identifier (for revocation) |

### Part 3: Signature

The signature proves the token hasn't been tampered with. For HS256:

```
HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
```

For RS256, the server signs with its **private key** and clients verify with the server's **public key** — which can be published openly.

## How JWT Authentication Works

```
1. User logs in: POST /login {username, password}
2. Server verifies credentials
3. Server creates JWT with user claims, signs it
4. Server returns JWT to client
5. Client stores JWT (localStorage, sessionStorage, or cookie)

For subsequent requests:
6. Client sends: Authorization: Bearer <jwt>
7. Server extracts JWT, verifies signature
8. Server reads claims directly (NO database lookup needed!)
9. Server processes request
```

The key advantage: **stateless**. The server doesn't need to query a database to validate the token — all the needed information is in the token itself.

## Decoding vs Verifying

**Decoding** is just Base64URL-decoding. Anyone can decode a JWT — it's NOT encrypted by default.

**Verifying** means checking the signature to ensure the token was issued by a trusted party and hasn't been modified.

```javascript
// Decode without verification (inspect the payload, but don't trust it)
function decodeJwt(token) {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

// Verify using a library (ALWAYS do this before trusting claims)
import jwt from 'jsonwebtoken';

try {
  const claims = jwt.verify(token, process.env.JWT_SECRET);
  console.log(claims.sub);  // user ID
} catch (err) {
  // Invalid signature, expired, etc.
  return res.status(401).json({ error: 'Invalid token' });
}
```

## Creating JWTs

```javascript
// Node.js with jsonwebtoken
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h',          // expires in 1 hour
    issuer: 'https://auth.example.com',
    audience: 'https://api.example.com',
  }
);
```

```python
# Python with PyJWT
import jwt
from datetime import datetime, timedelta

payload = {
    'sub': str(user.id),
    'email': user.email,
    'exp': datetime.utcnow() + timedelta(hours=1),
    'iat': datetime.utcnow(),
}

token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
```

## JWT vs Session Tokens

| Aspect | JWT (Stateless) | Session (Stateful) |
|--------|-----------------|-------------------|
| Storage | Client-side | Server-side (DB/Redis) |
| Verification | Signature check only | Database lookup required |
| Revocation | Hard (until expiry) | Easy (delete session) |
| Scalability | Excellent (no shared state) | Requires shared session store |
| Size | Larger (~200-500 bytes) | Small (just a session ID) |
| Data exposure | Payload is readable | No data exposed to client |

## Security Best Practices

### 1. Always Verify the Signature

Never trust a JWT without verifying its signature. An unverified JWT is just an unverified claim.

### 2. Validate All Claims

```javascript
jwt.verify(token, secret, {
  issuer: 'https://auth.example.com',
  audience: 'https://api.example.com',
  // exp is checked automatically
});
```

### 3. Use Short Expiry Times

```javascript
// Access tokens: short-lived
jwt.sign(payload, secret, { expiresIn: '15m' });

// Refresh tokens: longer-lived, stored securely, rotated on use
jwt.sign(refreshPayload, refreshSecret, { expiresIn: '7d' });
```

### 4. Never Store JWTs in localStorage (for sensitive apps)

`localStorage` is accessible to any JavaScript on the page, making tokens vulnerable to XSS attacks. For high-security applications, use **HttpOnly cookies**:

```javascript
res.cookie('token', jwt, {
  httpOnly: true,    // not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 900_000,   // 15 minutes
});
```

### 5. Beware the `alg: none` Attack

Always specify the allowed algorithm explicitly:
```javascript
// ❌ Dangerous: an attacker can forge tokens with alg: none
jwt.verify(token, secret);

// ✅ Safe: only accept HS256 tokens
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

### 6. Rotate Secrets

If you suspect your signing secret is compromised, you must rotate it — which invalidates all existing tokens. Design your system to handle this gracefully (maintain two valid secrets during rotation).

## JWT Revocation Strategies

Stateless JWTs can't be individually revoked before expiry. Common workarounds:

1. **Short expiry + refresh tokens**: Access tokens expire in 15 minutes; revoke the refresh token to prevent renewal.
2. **Deny-list (blocklist)**: Store revoked `jti` values in a fast store (Redis). Check each token against the blocklist.
3. **Version number in claims**: Include a `version` claim; increment the user's version in the database to invalidate all old tokens.

→ Try the [JWT Parser](/jwt-parser)''',

'url-parser-guide': '''## What Is URL Parsing?

**URL parsing** is the process of decomposing a Uniform Resource Locator (URL) into its individual components — protocol, host, port, path, query string, and fragment. While a URL looks like a single string, it is actually a structured set of fields, each with specific syntax rules and semantics defined by RFC 3986.

Understanding URL structure is fundamental for:
- Building API clients that construct URLs programmatically
- Writing web scrapers that follow links correctly
- Implementing redirect logic in web servers
- Debugging network requests

## The Full URL Anatomy

```
https://user:password@www.example.com:8080/path/to/page?key=value&foo=bar#section2
│      │              │               │    │             │                 │
│      │              │               │    │             │                 └── Fragment
│      │              │               │    │             └── Query String
│      │              │               │    └── Path
│      │              │               └── Port
│      │              └── Host (subdomain.domain.tld)
│      └── Userinfo (rarely used)
└── Scheme (Protocol)
```

### Component Breakdown

| Component | Example | Description |
|-----------|---------|-------------|
| Scheme | `https` | Protocol identifier |
| Userinfo | `user:pass` | Credentials (deprecated for HTTP; use Authorization header) |
| Host | `www.example.com` | Domain name or IP address |
| Port | `8080` | TCP port (default: 443 for HTTPS, 80 for HTTP) |
| Path | `/path/to/page` | Resource location on the server |
| Query | `key=value&foo=bar` | Key-value parameters |
| Fragment | `section2` | Client-side anchor (never sent to server) |

## Parsing URLs in Code

### JavaScript: The URL API

The modern `URL` class (available in browsers and Node.js) is the gold standard for URL parsing:

```javascript
const url = new URL('https://www.example.com:8080/search?q=hello+world&page=2#results');

url.protocol   // "https:"
url.host       // "www.example.com:8080"
url.hostname   // "www.example.com"
url.port       // "8080"
url.pathname   // "/search"
url.search     // "?q=hello+world&page=2"
url.hash       // "#results"
url.origin     // "https://www.example.com:8080"
url.href       // full URL as string

// Query parameters
url.searchParams.get('q')      // "hello world" (automatically decoded!)
url.searchParams.get('page')   // "2"
url.searchParams.has('page')   // true
url.searchParams.getAll('tag') // [] (or ['a', 'b'] for multi-value params)

// Iterate all params
for (const [key, value] of url.searchParams) {
  console.log(key, value);
}
```

### Constructing URLs

```javascript
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
```

### Relative URLs

```javascript
// Resolve relative URL against a base
new URL('/about', 'https://example.com').href
// "https://example.com/about"

new URL('./docs', 'https://example.com/api/').href
// "https://example.com/api/docs"

new URL('?tab=docs', 'https://example.com/page').href
// "https://example.com/page?tab=docs"
```

### Python: urllib.parse

```python
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
# 'https://www.example.com:8080/search?q=new+search&page=3'
```

## URL Components in Depth

### The Fragment (`#anchor`)

The fragment is **client-only** — browsers never send it to the server. It's used for:
- Anchor navigation: `#section-2` scrolls to `id="section-2"`
- Single Page App routing: `#!/products/42`
- OAuth state return: `#access_token=...` (used by implicit flow)

```javascript
// Fragment changes don't reload the page
location.hash = '#new-section'; // scroll without request

// Detect fragment changes
window.addEventListener('hashchange', () => {
  console.log('Hash changed to:', location.hash);
});
```

### Ports

Default ports (omitted when standard):
- HTTP: 80
- HTTPS: 443
- FTP: 21
- SSH: 22

```javascript
new URL('https://example.com').port     // "" (default 443)
new URL('https://example.com:443').port // "443" (explicit)
new URL('https://example.com:8443').port // "8443" (non-standard)
```

### Query String Edge Cases

Multi-value parameters (same key repeated):
```
?tag=javascript&tag=typescript&tag=nodejs

// JavaScript
url.searchParams.getAll('tag')  // ['javascript', 'typescript', 'nodejs']

// Python
parse_qs('tag=js&tag=ts')  # {'tag': ['js', 'ts']}
```

## URL Normalization

Normalizing URLs ensures consistent comparisons and deduplication:

```javascript
function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  
  // Convert to lowercase
  url.hostname = url.hostname.toLowerCase();
  
  // Remove default port
  if ((url.protocol === 'https:' && url.port === '443') ||
      (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }
  
  // Remove trailing slash from path (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  
  // Sort query params for deterministic order
  url.searchParams.sort();
  
  // Remove fragment (server never sees it)
  url.hash = '';
  
  return url.toString();
}

normalizeUrl('HTTPS://Example.COM:443/page/?b=2&a=1#section')
// 'https://example.com/page?a=1&b=2'
```

## Security Considerations

### Open Redirect Validation

Always validate redirect URLs to prevent open redirect attacks:

```javascript
function isSafeRedirect(redirectUrl, allowedHosts) {
  try {
    const url = new URL(redirectUrl, 'https://myapp.com');
    return allowedHosts.includes(url.hostname);
  } catch {
    return false;  // Invalid URL
  }
}

// Only allow redirects to your own domain
isSafeRedirect('/dashboard', ['myapp.com']);        // true ✅
isSafeRedirect('https://myapp.com/login', ['myapp.com']); // true ✅
isSafeRedirect('https://evil.com/phish', ['myapp.com']);  // false ❌
```

### SSRF Prevention

Server-Side Request Forgery attacks exploit URLs that cause your server to make requests to internal services:

```javascript
function isPublicUrl(url) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  
  // Block private/internal addresses
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blocked.includes(hostname)) return false;
  
  // Block RFC 1918 private ranges (simplified)
  if (/^10\\./.test(hostname)) return false;
  if (/^192\\.168\\./.test(hostname)) return false;
  if (/^172\\.(1[6-9]|2\\d|3[01])\\./.test(hostname)) return false;
  
  return true;
}
```

→ Try the [URL Parser](/url-parser)''',

'meta-tag-generator-guide': '''## What Are Meta Tags?

**Meta tags** are HTML elements placed in the `<head>` section of a web page. They provide metadata about the page — information that isn't displayed to users but is read by search engines, social media platforms, browsers, and other web services. Meta tags are invisible to users but critically important for SEO, social sharing, and browser behavior.

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn how meta tags work and why they matter for SEO.">
  <meta property="og:title" content="Complete Meta Tag Guide">
  <title>Complete Meta Tag Guide | MyWebsite</title>
</head>
```

## Essential Meta Tags

### 1. Charset Declaration

```html
<meta charset="UTF-8">
```

Always the **first tag** in `<head>`. Declares the character encoding. UTF-8 supports all languages and is the universal standard. Without this, browsers may display garbled characters for non-ASCII content.

### 2. Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Controls how the page renders on mobile devices. Without this, mobile browsers render the page at desktop width and zoom out, making text tiny.

- `width=device-width` — sets the viewport to the device's screen width
- `initial-scale=1.0` — sets the initial zoom level to 100%

Never add `user-scalable=no` — it harms accessibility by preventing users from zooming.

### 3. Description

```html
<meta name="description" content="A concise, compelling description of the page content, ideally 150-160 characters.">
```

The description appears as the snippet under your title in Google search results. While Google doesn't always use it (it sometimes generates its own), a well-written description **significantly improves click-through rates**.

**Best practices:**
- Length: 150-160 characters (longer gets truncated)
- Include your primary keyword naturally
- Write it like marketing copy — make it compelling
- Make each page's description unique

### 4. Title Tag

Technically not a `<meta>` tag but equally important:

```html
<title>Primary Keyword - Secondary Info | Brand Name</title>
```

The title appears in:
- Google search result headings
- Browser tab labels
- Social media shares (when OG title isn't set)

**Best practices:**
- Length: 50-60 characters
- Put the most important keyword first
- Include brand name at the end
- Make each page title unique

## Open Graph (OG) Tags

Open Graph tags were created by Facebook and are now used by all major social platforms (Twitter/X, LinkedIn, WhatsApp, Slack) to create rich previews when URLs are shared.

```html
<!-- Required OG tags -->
<meta property="og:title" content="Complete Meta Tag Guide">
<meta property="og:description" content="Everything you need to know about meta tags for SEO and social sharing.">
<meta property="og:image" content="https://example.com/images/meta-guide-og.jpg">
<meta property="og:url" content="https://example.com/meta-guide">
<meta property="og:type" content="website">

<!-- Recommended OG tags -->
<meta property="og:site_name" content="MyWebsite">
<meta property="og:locale" content="en_US">
```

### OG Image Requirements

The OG image is the most impactful visual element in social shares. Platform requirements vary:

| Platform | Recommended Size | Aspect Ratio |
|----------|-----------------|--------------|
| Facebook | 1200×630 px | 1.91:1 |
| Twitter (summary_large_image) | 1200×628 px | ~1.91:1 |
| LinkedIn | 1200×627 px | ~1.91:1 |

**Best practices for OG images:**
- Use at least 1200×630 pixels for all platforms
- Keep file size under 1MB (PNG or JPEG)
- Include text that's legible at small sizes
- Don't put critical content near the edges (some platforms crop)
- Host images on a reliable CDN (the URL must be publicly accessible)

### OG Type Values

```html
<!-- Website (default) -->
<meta property="og:type" content="website">

<!-- Article (for blog posts, news) -->
<meta property="og:type" content="article">
<meta property="article:published_time" content="2024-01-15T09:00:00Z">
<meta property="article:author" content="https://example.com/authors/alice">
<meta property="article:tag" content="SEO">

<!-- Product (for e-commerce) -->
<meta property="og:type" content="product">
```

## Twitter Card Tags

Twitter (now X) uses its own card system, though it falls back to OG tags if Twitter tags aren't present:

```html
<!-- Summary card with large image -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@YourHandle">
<meta name="twitter:creator" content="@AuthorHandle">
<meta name="twitter:title" content="Complete Meta Tag Guide">
<meta name="twitter:description" content="Everything about meta tags.">
<meta name="twitter:image" content="https://example.com/images/og.jpg">
<meta name="twitter:image:alt" content="Diagram showing meta tag anatomy">
```

**Card types:**
- `summary` — small square image, text
- `summary_large_image` — large rectangular image (recommended for most content)
- `app` — App Store links with download buttons
- `player` — Embedded video/audio player

## SEO-Related Meta Tags

### Robots Meta Tag

Controls how search engines index and follow the page:

```html
<!-- Allow indexing and link following (default behavior) -->
<meta name="robots" content="index, follow">

<!-- Prevent indexing (don't show in search results) -->
<meta name="robots" content="noindex">

<!-- Don't follow links on this page -->
<meta name="robots" content="nofollow">

<!-- Don't show a snippet/description in results -->
<meta name="robots" content="nosnippet">

<!-- Don't cache the page in Google's cache -->
<meta name="robots" content="noarchive">

<!-- Combined -->
<meta name="robots" content="noindex, nofollow">
```

Common use cases for `noindex`:
- Duplicate content pages (pagination, print versions)
- Admin/dashboard pages
- Thank-you pages after form submission
- Staging environments

### Canonical URL

Prevents duplicate content penalties when the same content is accessible via multiple URLs:

```html
<link rel="canonical" href="https://example.com/the-definitive-url">
```

Use when you have:
- `?utm_source=...` tracking parameters creating duplicate URLs
- `http://` and `https://` versions
- `www.` and non-www versions
- Paginated content (page 1 is canonical)
- Syndicated content (point back to original)

## Complete Meta Tag Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Essential -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - 50-60 chars | Brand</title>
  <meta name="description" content="Compelling description 150-160 chars.">

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
```

## Testing Your Meta Tags

Before publishing, test with these tools:

- **Facebook Sharing Debugger**: `developers.facebook.com/tools/debug/` — shows exactly how Facebook renders your OG tags and lets you force a cache refresh
- **Twitter Card Validator**: `cards-dev.twitter.com/validator`
- **LinkedIn Post Inspector**: `linkedin.com/post-inspector/`
- **Google Rich Results Test**: `search.google.com/test/rich-results`

## Common Meta Tag Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Missing OG image | Ugly link previews | Add `og:image` with 1200×630px image |
| Description > 160 chars | Truncated in search results | Keep under 160 chars |
| Duplicate titles across pages | SEO confusion | Write unique titles per page |
| Forgetting viewport meta | Terrible mobile experience | Add viewport meta to every page |
| Wrong canonical URL | Duplicate content penalty | Ensure canonical points to the preferred version |
| `noindex` in production | Invisible to search engines | Check robots meta before deploying |

→ Try the [Meta Tag Generator](/meta-tag-generator)''',

'device-information-guide': '''## Why Device Information Matters for Web Developers

When building responsive web applications, knowing the precise capabilities and characteristics of the device running your code is essential. Device information includes the screen dimensions, pixel density, platform, browser, connection type, and hardware capabilities. This data drives everything from responsive design breakpoints to performance optimization decisions.

The browser provides this information through a collection of JavaScript APIs