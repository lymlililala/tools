#!/usr/bin/env python3
"""
Batch 2: Expand articles - Web/Network/Developer Tools category
Covers: http-status-codes, crontab, regex-tester, jwt-parser-web, url-parser,
meta-tag-generator, json-prettify, chmod, docker-compose, sql-prettify,
git-memo, json-diff, xml-formatter, yaml-viewer, ipv4-subnet, mac-address,
percentage, bmi, mortgage, math-evaluator, eta
"""
import re
import sys

ARTICLES_FILE = 'src/pages/articles/articles.data.ts'

def escape_for_ts(content):
    content = content.replace('\\', '\\\\')
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')
    return content

def update_article(file_content, slug, new_content):
    escaped = escape_for_ts(new_content)
    pattern = r"(slug:\s*'" + re.escape(slug) + r"'[\s\S]*?content:\s*`)([\s\S]*?)(`\s*,?\s*\})"
    def replacer(m):
        return m.group(1) + escaped + m.group(3)
    new_file_content, count = re.subn(pattern, replacer, file_content, count=1)
    return new_file_content, count > 0

articles = {}

articles['http-status-codes-complete-guide'] = """## What Are HTTP Status Codes?

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

```
GET /users/123     -> 200 (found) or 404 (not found)
POST /users        -> 201 (created) or 400 (invalid input) or 409 (duplicate)
PUT /users/123     -> 200 (updated) or 404 (not found) or 422 (validation failed)
DELETE /users/123  -> 204 (deleted) or 404 (not found)
GET /protected     -> 401 (not authenticated) or 403 (not authorized)
```

## Debugging Tips

When debugging HTTP issues, check:
1. The status code class (4xx = your problem, 5xx = their problem)
2. The response body for error details (APIs usually include error messages)
3. Response headers (Location for redirects, WWW-Authenticate for auth, Retry-After for rate limits)
4. Network timing (slow 200s may indicate performance issues)

-> Try the [HTTP Status Codes Reference](/http-status-codes)"""

articles['crontab-generator-guide'] = """## What Is a Cron Job?

A cron job is a scheduled task that runs automatically at specified intervals on Unix-like operating systems. The name comes from "chronos" (Greek for time). Cron is the system service; crontab (cron table) is the file where scheduled tasks are defined.

Cron is used for: automated backups, database maintenance, sending scheduled emails, generating reports, cleaning temporary files, updating caches, and any repetitive task that needs to run without human intervention.

## The Crontab Syntax

A crontab entry has six fields:

```
* * * * * command_to_execute
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, where 0 and 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

## Special Characters

| Character | Meaning | Example |
|---|---|---|
| `*` | Any value (wildcard) | `* * * * *` runs every minute |
| `,` | Value list | `1,15,30` means at 1st, 15th, 30th |
| `-` | Range | `9-17` means 9am to 5pm |
| `/` | Step values | `*/15` means every 15 units |

## Common Cron Schedule Examples

```
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
```

## Special Predefined Schedules

Most cron implementations support shorthand keywords:

| Keyword | Equivalent | Description |
|---|---|---|
| `@reboot` | (none) | Once at startup |
| `@yearly` | `0 0 1 1 *` | Once a year (Jan 1 midnight) |
| `@annually` | `0 0 1 1 *` | Same as @yearly |
| `@monthly` | `0 0 1 * *` | Once a month (1st, midnight) |
| `@weekly` | `0 0 * * 0` | Once a week (Sunday midnight) |
| `@daily` | `0 0 * * *` | Once a day (midnight) |
| `@midnight` | `0 0 * * *` | Same as @daily |
| `@hourly` | `0 * * * *` | Once an hour |

## Managing Crontab

```bash
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
```

## Cron Environment and Common Pitfalls

Cron jobs run in a minimal environment - the PATH, HOME, and other variables you rely on in your shell may not be available.

**PATH issues**: Specify full paths to executables:
```
# Bad - 'python' may not be found
0 2 * * * python /opt/scripts/backup.py

# Good - use full path
0 2 * * * /usr/bin/python3 /opt/scripts/backup.py
```

**Output redirection**: By default, cron emails output to the system user. Redirect output to a log file:
```
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

**Timezone**: Cron uses the system timezone. If your server is in UTC but you want jobs at "local" times, account for the offset.

**Missed jobs**: If the server is down when a job should run, the job is skipped - it does not catch up when the server restarts (unless you use `anacron`).

## Using This Tool

Enter your desired schedule in plain English or fill in the time fields, and the tool generates the correct crontab expression. You can also paste a crontab expression to see a human-readable description.

-> Try the [Crontab Generator](/crontab-generator)"""

articles['regex-tester-guide'] = r"""## What Is a Regular Expression?

A regular expression (regex or regexp) is a sequence of characters that defines a search pattern. Regular expressions are used for searching, matching, validating, and transforming text. They are supported in virtually every programming language and many text editors.

Despite their cryptic appearance, regular expressions follow consistent rules. Once you learn the syntax, you can apply it across Python, JavaScript, Java, Perl, Ruby, and dozens of other languages.

## Basic Regex Syntax

### Literal Characters
Most characters match themselves: `cat` matches the string "cat".

### Metacharacters
Special characters have special meaning and must be escaped with backslash to match literally:
```
. ^ $ * + ? { } [ ] \\ | ( )
```

### The Dot: Any Character
`.` matches any single character except newline:
```
c.t  matches: cat, cot, cut, c4t, c.t
     doesn't match: cart (two chars between c and t)
```

### Character Classes
`[abc]` matches any single character a, b, or c:
```
[aeiou]     matches any vowel
[a-z]       matches any lowercase letter
[A-Za-z0-9] matches any alphanumeric character
[^aeiou]    matches any non-vowel (^ negates inside [])
```

### Quantifiers
Control how many times the preceding element must match:

| Quantifier | Meaning |
|---|---|
| `*` | Zero or more times |
| `+` | One or more times |
| `?` | Zero or one time (optional) |
| `{3}` | Exactly 3 times |
| `{2,5}` | Between 2 and 5 times |
| `{3,}` | 3 or more times |

### Shorthand Character Classes

| Shorthand | Equivalent | Meaning |
|---|---|---|
| `\d` | `[0-9]` | Any digit |
| `\D` | `[^0-9]` | Any non-digit |
| `\w` | `[a-zA-Z0-9_]` | Any word character |
| `\W` | `[^a-zA-Z0-9_]` | Any non-word character |
| `\s` | `[ \t\n\r\f\v]` | Any whitespace |
| `\S` | `[^ \t\n\r\f\v]` | Any non-whitespace |

### Anchors

| Anchor | Meaning |
|---|---|
| `^` | Start of string (or line with multiline flag) |
| `$` | End of string (or line with multiline flag) |
| `\b` | Word boundary |
| `\B` | Non-word boundary |

### Groups and Alternation

`(abc)` captures the matched text in a group:
```
(\d{4})-(\d{2})-(\d{2})  matches and captures a date like 2025-06-15
```

`|` provides alternation (OR):
```
cat|dog  matches "cat" or "dog"
(cat|dog)s  matches "cats" or "dogs"
```

## Practical Regex Examples

```
Email validation (simplified):
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}

URL detection:
https?://[^\s<>"{}|\\^`\[\]]+

IP address (basic):
\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b

Phone number (US):
\+?1?\s?(\d{3}[\s.-]?)?\d{3}[\s.-]?\d{4}

Date (YYYY-MM-DD):
\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])

Hex color code:
#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})

Password (8+ chars, uppercase, lowercase, digit):
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

## Lookahead and Lookbehind

**Lookahead** matches a position where a pattern follows (without including it):
```
\d+(?= dollars)  matches "100" in "100 dollars" but not "100 euros"
```

**Negative lookahead** matches where a pattern does NOT follow:
```
\b\w+\b(?! are)  matches words not followed by " are"
```

**Lookbehind** matches a position preceded by a pattern:
```
(?<=\$)\d+  matches "100" in "$100"
```

## Regex Flags

| Flag | JavaScript | Python | Meaning |
|---|---|---|---|
| Global | `g` | (not needed) | Find all matches, not just first |
| Case insensitive | `i` | `re.IGNORECASE` | Match regardless of case |
| Multiline | `m` | `re.MULTILINE` | ^ and $ match line boundaries |
| Dotall | `s` | `re.DOTALL` | . matches newlines too |

## Using This Tool

Enter your regular expression and test string to see which parts match, highlighted in real time. Supports JavaScript regex syntax with flags (g, i, m, s). Great for building and debugging patterns before using them in code.

-> Try the [Regex Tester](/regex-tester)"""

articles['jwt-parser-web-guide'] = """## Quick JWT Reference

JSON Web Tokens (JWT) are compact, self-contained tokens used for authentication and information exchange. This guide covers the essential reference information for working with JWTs.

## JWT Structure At A Glance

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│──────────────────────────────────────│──────────────────────────────────────────────────────│──────────────────────────────────────────────────│
               Header                                      Payload                                                Signature
```

Each section is Base64URL encoded and separated by dots.

## Standard JWT Claims

| Claim | Name | Type | Description |
|---|---|---|---|
| `iss` | Issuer | String | Who issued the token |
| `sub` | Subject | String | Token subject (usually user ID) |
| `aud` | Audience | String/Array | Who the token is for |
| `exp` | Expiration | Number | Unix timestamp when it expires |
| `nbf` | Not Before | Number | Unix timestamp before which it's invalid |
| `iat` | Issued At | Number | Unix timestamp when issued |
| `jti` | JWT ID | String | Unique token identifier |

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

```javascript
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
```

```python
# Python - using PyJWT
import jwt

decoded = jwt.decode(token, secret, algorithms=["HS256"])
```

## JWT Security Checklist

Always verify the signature on the server before trusting any claims. Check the `exp` claim and reject expired tokens. Specify allowed algorithms explicitly to prevent algorithm confusion attacks. Never store sensitive data in the payload since it is only Base64 encoded, not encrypted. Use short expiry times (15-60 minutes for access tokens) combined with refresh tokens. Implement token revocation via a blocklist if needed. Use HTTPS to prevent token interception. Store tokens in HttpOnly cookies or memory, not localStorage, to reduce XSS risk.

## Decoding Without Verification

Sometimes you need to read claims from a JWT without verifying (for example, to check expiry before making a network call to refresh):

```javascript
// WARNING: Do NOT use for security decisions
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload.exp);  // Unix timestamp
```

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

-> Try the [JWT Parser](/jwt-parser)"""

articles['url-parser-guide'] = """## What Is a URL?

A URL (Uniform Resource Locator) is a reference to a web resource that specifies its location and the mechanism for retrieving it. Every URL follows a standardized structure defined in RFC 3986.

Understanding URL structure is fundamental for web development, API design, security analysis, and debugging network issues.

## The Anatomy of a URL

```
https://user:password@www.example.com:8080/path/to/page?key=value&foo=bar#section
│─────││───────────────────────────││──││─────────────││────────────││──────│
scheme     authority (userinfo+host+port)    path         query      fragment
```

Breaking it down:

| Component | Example | Purpose |
|---|---|---|
| Scheme | `https` | Protocol to use (http, https, ftp, mailto, file) |
| User Info | `user:password` | Optional credentials (rarely used, insecure) |
| Host | `www.example.com` | Domain name or IP address |
| Port | `8080` | Network port (omit for defaults: 80=HTTP, 443=HTTPS) |
| Path | `/path/to/page` | Location of the resource on the server |
| Query | `key=value&foo=bar` | Additional parameters (key-value pairs) |
| Fragment | `#section` | Client-side anchor (never sent to server) |

## URL Schemes

| Scheme | Protocol | Example |
|---|---|---|
| `http` | Hypertext Transfer | `http://example.com` |
| `https` | Secure HTTP | `https://example.com` |
| `ftp` | File Transfer | `ftp://files.example.com` |
| `mailto` | Email | `mailto:user@example.com` |
| `file` | Local file | `file:///home/user/doc.txt` |
| `ws` | WebSocket | `ws://chat.example.com/socket` |
| `wss` | Secure WebSocket | `wss://chat.example.com/socket` |
| `data` | Inline data | `data:text/plain;base64,SGVsbG8=` |

## Absolute vs Relative URLs

**Absolute URLs** contain the full specification including scheme and host:
```
https://www.example.com/about
```

**Relative URLs** are resolved relative to a base URL:
```
/about              -> absolute path from root
../images/logo.png  -> relative to current directory
?page=2             -> same path, different query
#section-2          -> same page, different fragment
```

## Query String Parsing

Query strings encode key-value pairs after the `?`. Multiple pairs are separated by `&`. Special characters must be percent-encoded.

```javascript
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
```

## URL Normalization

The same resource can be referenced by multiple URL forms. Normalization converts URLs to a canonical form:

```
http://Example.COM/index.html    ->  http://example.com/index.html  (lowercase host)
http://example.com:80/page       ->  http://example.com/page        (remove default port)
http://example.com/a/../b/./c   ->  http://example.com/b/c         (resolve path)
http://example.com/page?b=2&a=1 ->  http://example.com/page?a=1&b=2 (sort params)
```

## URL Security Considerations

**Open redirects**: If your application uses a URL parameter to redirect users, validate it strictly. `https://yourapp.com/login?next=https://evil.com` can redirect to a phishing site.

**URL injection**: URLs in SQL queries or log files can contain payloads. Always validate and encode URLs from user input.

**Fragment-based attacks**: The URL fragment (`#hash`) is never sent to the server, making it invisible to server-side security controls. Be careful with client-side routing that uses fragments.

**Punycode homograph attacks**: `аpple.com` (Cyrillic `a`) looks identical to `apple.com` (Latin `a`) in some fonts. Always display decoded, normalized URLs to users.

## Using This Tool

Paste any URL to instantly parse and display each component separately: scheme, host, port, path, query parameters (displayed as a table), and fragment. Useful for debugging complex URLs, extracting query parameters, and understanding URL structure.

-> Try the [URL Parser](/url-parser)"""

articles['meta-tag-generator-guide'] = """## What Are HTML Meta Tags?

HTML meta tags are elements placed in the `<head>` section of a webpage that provide metadata about the page. This metadata is not displayed to visitors but is read by browsers, search engines, and social media platforms to understand and display the page correctly.

Meta tags significantly impact SEO (Search Engine Optimization), social sharing appearance, and browser behavior.

## Essential Meta Tags

### Charset
```html
<meta charset="UTF-8">
```
Declares the character encoding. UTF-8 supports virtually all characters and languages. This should always be the first element in `<head>`.

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Enables proper responsive design on mobile devices. Without this, mobile browsers render pages at desktop width and then scale down, making text tiny.

### Title (not a meta tag, but essential)
```html
<title>Page Title | Site Name</title>
```
The most important on-page SEO element. Appears in browser tabs, bookmarks, and search results. Recommended length: 50-60 characters.

### Description
```html
<meta name="description" content="A concise 150-160 character summary of the page content that appears in search engine results.">
```
Shown in search result snippets below the title. While not a direct ranking factor, a compelling description improves click-through rate.

### Keywords (largely obsolete)
```html
<meta name="keywords" content="keyword1, keyword2">
```
Google officially ignores this tag. Only included for compatibility with obscure search engines.

### Robots
```html
<meta name="robots" content="index, follow">
<meta name="robots" content="noindex, nofollow">
<meta name="robots" content="noindex, follow, noarchive">
```
Controls search engine crawler behavior. Common directives:
- `index` / `noindex`: Include or exclude from search results
- `follow` / `nofollow`: Follow or ignore links on the page
- `noarchive`: Don't show cached version in search results
- `nosnippet`: Don't show description snippet in results

## Open Graph Protocol (OG)

Open Graph tags control how pages appear when shared on Facebook, LinkedIn, Slack, and other platforms that support the protocol:

```html
<meta property="og:title" content="The Title for Social Sharing">
<meta property="og:description" content="Description shown in the social card (typically 1-2 sentences)">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/canonical-url">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Your Site Name">
```

OG image recommendations: 1200x630 pixels, under 5MB. The image is the most important visual element in social cards.

## Twitter Card Tags

Twitter uses its own meta tags (though it also reads OG tags as fallback):

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourtwitterhandle">
<meta name="twitter:title" content="Title for Twitter">
<meta name="twitter:description" content="Description for Twitter">
<meta name="twitter:image" content="https://example.com/twitter-image.jpg">
```

Twitter card types:
- `summary` - Small thumbnail image, title, description
- `summary_large_image` - Large image spanning the card width
- `app` - Mobile app download card
- `player` - Embedded audio/video player

## Canonical URL

```html
<link rel="canonical" href="https://example.com/the-definitive-url">
```

Tells search engines which URL is the authoritative version when the same content is accessible at multiple URLs (e.g., with and without trailing slash, HTTP vs HTTPS, different query parameters).

## Other Useful Meta Tags

```html
<!-- Author -->
<meta name="author" content="Author Name">

<!-- Theme color for mobile browsers -->
<meta name="theme-color" content="#4285f4">

<!-- Refresh/redirect after delay -->
<meta http-equiv="refresh" content="5;url=https://example.com/new-page">

<!-- Language -->
<meta http-equiv="content-language" content="en-US">
```

## Using This Tool

Fill in your page title, description, URL, image, and other details. The tool generates the complete meta tag HTML ready to paste into your page's `<head>` section, with proper Open Graph, Twitter Card, and SEO tags.

-> Try the [Meta Tag Generator](/meta-tag-generator)"""

articles['json-prettify-and-validate'] = r"""## What Is JSON?

JSON (JavaScript Object Notation) is a lightweight, human-readable data interchange format. Derived from JavaScript object literal syntax, JSON has become the universal standard for data exchange on the web, used in REST APIs, configuration files, and data storage.

JSON supports six data types: strings, numbers, booleans (true/false), null, arrays, and objects. Its simplicity and readability have made it the dominant alternative to XML.

## JSON Syntax Rules

JSON has strict syntax requirements that differ from JavaScript:

1. **Keys must be strings** in double quotes: `"key": "value"` (not `key: "value"`)
2. **Strings use double quotes only** - no single quotes
3. **No trailing commas**: `{"a": 1, "b": 2}` is valid but `{"a": 1, "b": 2,}` is not
4. **No comments**: JSON does not support `//` or `/* */` comments
5. **Numbers cannot have leading zeros**: `100` is valid, `0100` is not
6. **Special values**: `true`, `false`, `null` (lowercase)

## Common JSON Errors

### Syntax Error: Unexpected token
Usually means a trailing comma, missing comma, or unquoted key:
```
Bad:  {"name": "John", "age": 30,}  <- trailing comma
Good: {"name": "John", "age": 30}

Bad:  {name: "John"}  <- unquoted key
Good: {"name": "John"}
```

### Unexpected control character
Unescaped special characters inside strings:
```
Bad:  {"path": "C:\Users\name"}    <- backslash not escaped
Good: {"path": "C:\\Users\\name"}  <- escaped backslash

Bad:  {"text": "line 1
line 2"}                           <- unescaped newline
Good: {"text": "line 1\nline 2"}   <- escaped newline
```

### Unclosed bracket or brace
Missing closing `}` or `]`:
```
Bad:  [{"id": 1}, {"id": 2]  <- missing }
Good: [{"id": 1}, {"id": 2}]
```

## JSON Formatting Levels

**Minified JSON** (single line, no whitespace):
```json
{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}
```
Best for: API responses, data transmission (smaller size).

**Pretty-printed JSON** (indented, human-readable):
```json
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
```
Best for: Configuration files, debugging, documentation.

## JSON in Practice

### Parsing JSON in JavaScript
```javascript
// Parse (string to object)
const data = JSON.parse('{"name": "Alice", "age": 30}');
console.log(data.name);  // "Alice"

// Stringify (object to string)
const json = JSON.stringify({ name: "Alice", age: 30 });
// '{"name":"Alice","age":30}'

// Pretty print (2-space indent)
const pretty = JSON.stringify(data, null, 2);
```

### JSON Schema Validation
JSON Schema defines the expected structure, types, and constraints of JSON data:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0 }
  },
  "required": ["name"]
}
```

### Handling Large JSON Files
For large JSON files (>100MB), streaming parsers avoid loading the entire file into memory:
- Node.js: `stream-json` package
- Python: `ijson` package

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

-> Try the [JSON Formatter & Validator](/json-prettify)"""

articles['chmod-calculator-guide'] = r"""## What Are Unix File Permissions?

Unix file permissions control who can read, write, and execute files and directories. They are a fundamental part of Unix and Linux security, determining which users and groups can access each file.

Every file and directory has three sets of permissions for three categories of users: the owner (user), the group, and others (everyone else).

## The Permission Bits

Each category has three permission bits:

| Symbol | Value | Meaning for Files | Meaning for Directories |
|---|---|---|---|
| `r` | 4 | Read the file content | List directory contents |
| `w` | 2 | Modify the file | Create/delete files in directory |
| `x` | 1 | Execute as a program | Enter the directory (cd) |
| `-` | 0 | Permission denied | Permission denied |

## Reading the Permission String

The `ls -l` command shows permissions as a 10-character string:

```
-rwxr-xr--  owner group  filename
│└──┴──┴──
│  │  │  └── Others: r--, read only (4)
│  │  └───── Group:  r-x, read+execute (5)
│  └──────── Owner:  rwx, full access (7)
└─────────── File type: - (file), d (directory), l (symlink)
```

## The Octal Notation

Permissions are most commonly expressed as an octal (base-8) number where each digit represents one category (owner, group, others):

```
Permission  Binary  Octal
---         000     0
--x         001     1
-w-         010     2
-wx         011     3
r--         100     4
r-x         101     5
rw-         110     6
rwx         111     7
```

So `chmod 755` means:
```
7 = rwx (owner: full access)
5 = r-x (group: read and execute)
5 = r-x (others: read and execute)
```

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

```bash
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
```

## Special Permission Bits

Beyond the standard rwx bits, Unix has three special permission bits:

### Setuid (s on owner execute, octal 4000)
Executable runs with the owner's privileges, not the caller's:
```
chmod 4755 /usr/bin/sudo
-rwsr-xr-x  (s in owner's execute position)
```

### Setgid (s on group execute, octal 2000)
For executables: runs with group's privileges.
For directories: new files inherit the directory's group:
```
chmod 2775 /shared/project
drwxrwsr-x
```

### Sticky bit (t on others execute, octal 1000)
For directories: only the file owner can delete their own files:
```
chmod 1777 /tmp
drwxrwxrwt  (t = sticky bit)
```
This is why everyone can write to `/tmp` but cannot delete each other's files.

## Default Permissions with umask

The `umask` (user file creation mask) determines default permissions for new files. It subtracts from the maximum permissions:

```
Default max for files:       666 (rw-rw-rw-)
Default max for directories: 777 (rwxrwxrwx)
Typical umask:               022
Result for files:            644 (666 - 022)
Result for directories:      755 (777 - 022)
```

-> Try the [chmod Calculator](/chmod-calculator)"""

articles['docker-compose-from-run-command'] = """## From docker run to Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. Instead of running long `docker run` commands with many flags, you describe your services in a `docker-compose.yml` file and manage them all with simple commands.

This guide shows how to convert `docker run` commands to Docker Compose format.

## Basic Conversion Example

A typical `docker run` command:
```bash
docker run -d \\
  --name my-web-app \\
  -p 8080:80 \\
  -e NODE_ENV=production \\
  -e DATABASE_URL=postgres://localhost:5432/mydb \\
  -v /host/data:/app/data \\
  --restart unless-stopped \\
  my-web-app:latest
```

The equivalent `docker-compose.yml`:
```yaml
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
```

## Mapping docker run Flags to Compose

| docker run flag | Compose key | Example |
|---|---|---|
| `--name` | `container_name` | `container_name: myapp` |
| `-p 8080:80` | `ports` | `- "8080:80"` |
| `-e VAR=val` | `environment` | `- VAR=val` |
| `-v /host:/container` | `volumes` | `- /host:/container` |
| `--restart` | `restart` | `restart: unless-stopped` |
| `--network` | `networks` | `networks: [mynet]` |
| `--link` | `depends_on` | `depends_on: [db]` |
| `--memory 512m` | `mem_limit` | `mem_limit: 512m` |
| `--cpus 0.5` | `cpus` | `cpus: 0.5` |
| `--health-cmd` | `healthcheck.test` | `test: ["CMD", "curl", "-f", "http://localhost"]` |
| `--user` | `user` | `user: "1000:1000"` |
| `--entrypoint` | `entrypoint` | `entrypoint: /app/start.sh` |
| `--command` | `command` | `command: npm start` |

## Multi-Service Example: Web + Database

```yaml
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
```

## Docker Compose Commands

```bash
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
```

## Environment Variables in Compose

Use a `.env` file (automatically loaded by Compose) for secrets and environment-specific config:

```bash
# .env file
POSTGRES_PASSWORD=secretpassword
NODE_ENV=production
API_KEY=abc123
```

```yaml
# docker-compose.yml
services:
  web:
    environment:
      - NODE_ENV=${NODE_ENV}
      - API_KEY=${API_KEY}
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

The `.env` file should be in `.gitignore`. Share a `.env.example` file instead with placeholder values.

## Restart Policies

| Policy | Behavior |
|---|---|
| `no` | Never restart (default) |
| `always` | Always restart, including on Docker daemon restart |
| `on-failure` | Only restart on non-zero exit code |
| `unless-stopped` | Always restart unless manually stopped |

## Using This Tool

Paste a `docker run` command to instantly get the equivalent Docker Compose YAML. The tool parses all flags and options and generates a properly formatted Compose service definition.

-> Try the [Docker Run to Compose Converter](/docker-run-to-docker-compose-converter)"""

articles['sql-prettify-guide'] = """## What Is SQL Formatting?

SQL (Structured Query Language) formatting refers to consistently styling SQL code for readability and maintainability. Well-formatted SQL is easier to read, debug, and review in version control. Since SQL is whitespace-insensitive, the same query can be written in many ways - formatting is about human readability.

## SQL Formatting Conventions

### Keyword Case
SQL keywords are traditionally written in UPPERCASE, while identifiers (table names, column names) use lowercase or snake_case:

```sql
-- Recommended
SELECT user_id, first_name, last_name
FROM users
WHERE created_at > '2025-01-01'
ORDER BY last_name ASC;

-- Poor (harder to distinguish keywords from identifiers)
select user_id, first_name, last_name from users where created_at > '2025-01-01' order by last_name asc;
```

### Indentation
Each clause starts on a new line, with continuation lines indented:

```sql
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
```

### Column Alignment
Align columns after SELECT for readability in complex queries:

```sql
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
```

## Writing Readable JOINs

Express JOIN conditions clearly, showing the relationship between tables:

```sql
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
```

## SQL Query Optimization Tips

### Use Indexes Effectively
```sql
-- Check if column is indexed before filtering:
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Create an index for frequently filtered columns:
CREATE INDEX idx_users_email ON users(email);
```

### Avoid SELECT *
Always specify the columns you need. `SELECT *` transfers unnecessary data and breaks code when table schemas change:
```sql
-- Bad
SELECT * FROM products WHERE category_id = 5;

-- Good
SELECT product_id, product_name, price FROM products WHERE category_id = 5;
```

### Use EXISTS Instead of COUNT for Existence Checks
```sql
-- Bad (counts all matching rows)
SELECT * FROM users WHERE (SELECT COUNT(*) FROM orders WHERE user_id = users.id) > 0;

-- Good (stops at first match)
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE user_id = users.id);
```

## SQL Dialects

SQL comes in several dialects with syntax variations:

| Feature | Standard SQL | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|---|
| String concat | `||` | `||` | `CONCAT()` | `+` | `||` |
| Current time | `CURRENT_TIMESTAMP` | `NOW()` | `NOW()` | `GETDATE()` | `CURRENT_TIMESTAMP` |
| Limit rows | `FETCH FIRST n ROWS` | `LIMIT n` | `LIMIT n` | `TOP n` | `LIMIT n` |
| Auto-increment | `GENERATED ALWAYS AS IDENTITY` | `SERIAL` or `BIGSERIAL` | `AUTO_INCREMENT` | `IDENTITY` | `AUTOINCREMENT` |

This tool formats SQL for standard SQL, PostgreSQL, MySQL, and SQL Server dialects.

## Using This Tool

Paste any SQL query to instantly format it with proper indentation, keyword casing, and spacing. Supports all major SQL dialects and handles complex queries including subqueries, CTEs, window functions, and stored procedures.

-> Try the [SQL Prettify Tool](/sql-prettify)"""

articles['git-memo-common-commands'] = """## Essential Git Commands Reference

Git is the most widely used distributed version control system. This reference covers the most important commands with practical examples for daily development workflows.

## Configuration

```bash
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
```

## Repository Setup

```bash
# Initialize a new repository
git init
git init my-project

# Clone a remote repository
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git custom-folder

# Clone only specific branch
git clone -b develop https://github.com/user/repo.git
```

## Daily Workflow Commands

```bash
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
```

## Branching

```bash
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
```

## Remote Operations

```bash
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
```

## Merging and Rebasing

```bash
# Merge branch into current branch
git merge feature/login
git merge --no-ff feature/login  # Always create merge commit

# Rebase current branch onto main
git rebase main
git rebase -i HEAD~3  # Interactive rebase of last 3 commits

# Abort rebase if conflicts are too complex
git rebase --abort
```

## Stashing

```bash
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
```

## Undoing Changes

```bash
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
```

-> Try the [Git Memo Reference](/git-memo)"""

articles['json-diff-guide'] = """## What Is JSON Diffing?

JSON diffing is the process of comparing two JSON documents to identify what has changed between them. This is essential when debugging API responses, tracking configuration changes, reviewing data migrations, or investigating when and how data changed over time.

A good JSON diff tool goes beyond simple text comparison - it understands the JSON structure and shows meaningful semantic differences.

## Types of JSON Changes

When comparing two JSON documents, changes fall into four categories:

**Added**: Keys/values present in the new version but not the old:
```json
// Old:  { "name": "Alice" }
// New:  { "name": "Alice", "age": 30 }
// Diff: + "age": 30
```

**Removed**: Keys/values present in the old version but not the new:
```json
// Old:  { "name": "Alice", "status": "pending" }
// New:  { "name": "Alice" }
// Diff: - "status": "pending"
```

**Changed**: Values that exist in both but have different values:
```json
// Old:  { "count": 10 }
// New:  { "count": 15 }
// Diff: ~ "count": 10 -> 15
```

**Unchanged**: Keys/values identical in both versions (often hidden in diff views).

## Array Comparison Challenges

Arrays are more complex to diff than objects because items don't have inherent keys. Consider:

```json
// Old: [1, 2, 3, 4]
// New: [1, 3, 4, 5]
```

A naive comparison might say positions 1, 2, 3 all changed. A smarter diff recognizes that element `2` was deleted and element `5` was added.

For arrays of objects, the choice of what to use as a key for matching matters:
```json
// Old: [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
// New: [{"id": 2, "name": "Bobby"}, {"id": 3, "name": "Charlie"}]
```
Using `id` as the key: Alice(1) removed, Bob(2) renamed to Bobby, Charlie(3) added.

## JSON Diff Algorithms

The JSON Merge Patch (RFC 7396) format describes differences compactly:
```json
// Patch to transform old -> new
{
  "removed_field": null,    // null means delete
  "changed_field": "new_value",
  "new_field": "added_value"
  // absent fields are unchanged
}
```

The JSON Patch (RFC 6902) format describes differences as a sequence of operations:
```json
[
  { "op": "remove", "path": "/removed_field" },
  { "op": "replace", "path": "/changed_field", "value": "new_value" },
  { "op": "add", "path": "/new_field", "value": "added_value" }
]
```

JSON Patch supports these operations: `add`, `remove`, `replace`, `move`, `copy`, `test`.

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

-> Try the [JSON Diff Tool](/json-diff)"""

articles['xml-formatter-guide'] = """## What Is XML?

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

2. **Tags are case-sensitive**: `<Name>` and `<name>` are different elements.

3. **All tags must be closed**: Either `<tag></tag>` or self-closing `<tag />`.

4. **Proper nesting**: Tags must be properly nested (no overlapping):
   ```
   Bad:  <b><i>text</b></i>
   Good: <b><i>text</i></b>
   ```

5. **Attribute values must be quoted**: `<element attr="value">` or single quotes.

6. **Special characters must be escaped**:
   ```
   &  ->  &amp;
   <  ->  &lt;
   >  ->  &gt;
   "  ->  &quot;
   '  ->  &apos;
   ```

## Well-Formed vs Valid XML

**Well-formed** XML follows all syntax rules. Any XML parser will accept it.

**Valid** XML additionally conforms to a schema (DTD or XSD). Validity is optional but important for data exchange.

## XML Structure Example

```xml
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
```

## Namespaces

XML namespaces prevent name conflicts when combining XML from different sources:

```xml
<root
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:svg="http://www.w3.org/2000/svg">
  
  <html:div>HTML content</html:div>
  <svg:circle cx="50" cy="50" r="10"/>
</root>
```

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

```xpath
/library/book[@category='fiction']    # Select fiction books
/library/book/title                   # Select all titles
//book[price > 20]                    # Books costing over 20 (anywhere in document)
/library/book[last()]                 # Last book
count(/library/book)                  # Count all books
```

## Using This Tool

Paste any XML document to instantly format and prettify it with proper indentation and syntax highlighting. The tool also validates XML syntax and reports specific errors with line numbers.

-> Try the [XML Formatter](/xml-formatter)"""

# Apply all articles
def main():
    with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    updated = 0
    not_found = 0
    
    for slug, new_content in articles.items():
        new_file_content, success = update_article(content, slug, new_content)
        if success:
            content = new_file_content
            updated += 1
            print(f'✅ Updated: {slug}')
        else:
            not_found += 1
            print(f'❌ Not found: {slug}')
    
    with open(ARTICLES_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'\nDone: {updated} updated, {not_found} not found')

if __name__ == '__main__':
    main()
