#!/usr/bin/env python3
"""Script to update Web category articles 13-16."""

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    full_content = f.read()

# ─── Article 13: html-entities-guide ─────────────────────────────────────────
OLD_13 = """    content: `## Why HTML Encoding Matters

Unencoded special characters break HTML structure and enable **XSS (Cross-Site Scripting)** attacks.

## Essential HTML Entities

| Character | Entity Name | Entity Number |
|---|---|---|
| \\`<\\` | \\`&lt;\\` | \\`&#60;\\` |
| \\`>\\` | \\`&gt;\\` | \\`&#62;\\` |
| \\`&\\` | \\`&amp;\\` | \\`&#38;\\` |
| \\`"\\` | \\`&quot;\\` | \\`&#34;\\` |
| \\`'\\` | \\`&apos;\\` | \\`&#39;\\` |

## XSS Prevention

\\`\\`\\`javascript
// WRONG - XSS vulnerability!
element.innerHTML = userInput;

// CORRECT - safe encoding
element.textContent = userInput;
// or encode first:
element.innerHTML = userInput
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
\\`\\`\\`

→ Try the [HTML Entities Tool](/html-entities)`,"""

NEW_13 = """    content: `## Why HTML Encoding Matters

Every web developer eventually encounters a bug where user-supplied text breaks a page's layout, or worse, executes malicious JavaScript. Both problems share a root cause: **unescaped special characters in HTML output**. Understanding HTML entities is the foundation of safe web development.

When a browser parses HTML, it assigns special meaning to certain characters: \\`<\\` starts a tag, \\`>\\` ends one, \\`&\\` starts an entity reference, \\`"\\` delimits attribute values. If you insert user input containing these characters directly into HTML without escaping, you corrupt the document structure at best and enable XSS attacks at worst.

## The Five Characters That Must Always Be Escaped

These five characters have structural meaning in HTML and must be encoded whenever they appear as content (not markup):

| Character | Entity Name | Numeric Entity | When to Escape |
|---|---|---|---|
| \\`<\\` | \\`&lt;\\` | \\`&#60;\\` | Always — starts a tag |
| \\`>\\` | \\`&gt;\\` | \\`&#62;\\` | In content (technically optional but always good) |
| \\`&\\` | \\`&amp;\\` | \\`&#38;\\` | Always — starts entity reference |
| \\`"\\` | \\`&quot;\\` | \\`&#34;\\` | Inside double-quoted attributes |
| \\`'\\` | \\`&apos;\\` | \\`&#39;\\` | Inside single-quoted attributes |

**Order matters when encoding:** Always escape \\`&\\` first (before \\`<\\` and \\`>\\`), otherwise you'll double-encode:
\\`\\`\\`javascript
// ❌ Wrong order — double-encodes the & in &lt;
text.replace(/</g, '&lt;').replace(/&/g, '&amp;')
// "a&b<c" → "a&b&lt;c" → "a&amp;b&amp;lt;c"

// ✅ Correct order — & first
text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// "a&b<c" → "a&amp;b<c" → "a&amp;b&lt;c"
\\`\\`\\`

## XSS Attack Types and HTML Encoding as Defense

**Reflected XSS** — Malicious input in the URL is reflected back in the HTML response:
\\`\\`\\`html
<!-- URL: /search?q=<script>alert(1)</script> -->
<!-- Vulnerable code: -->
<p>Results for: <?= $_GET['q'] ?></p>
<!-- Output: <p>Results for: <script>alert(1)</script></p> → executes! -->

<!-- Fixed with HTML encoding: -->
<p>Results for: <?= htmlspecialchars($_GET['q'], ENT_QUOTES, 'UTF-8') ?></p>
<!-- Output: <p>Results for: &lt;script&gt;alert(1)&lt;/script&gt;</p> → safe -->
\\`\\`\\`

**Stored XSS** — Malicious content is saved to the database and served to other users. A forum post containing \\`<script>document.cookie\\` that is stored and displayed to all visitors.

**DOM-based XSS** — Occurs entirely in the browser when JavaScript reads from a source (URL, localStorage) and writes to the DOM unsafely.

## textContent vs innerHTML: The Critical Distinction

This is the single most important practical rule:

\\`\\`\\`javascript
const userInput = '<img src=x onerror="alert(\\'XSS\\')">'

// ❌ NEVER use innerHTML with user content
element.innerHTML = userInput
// → Creates an img element with onerror handler → executes alert

// ✅ ALWAYS use textContent for text content
element.textContent = userInput
// → Displays the literal string as text, no HTML parsing

// ✅ Or encode before using innerHTML
element.innerHTML = escapeHtml(userInput)
// → &lt;img src=x onerror="alert('XSS')"&gt; → displayed as text
\\`\\`\\`

\\`\\`\\`javascript
// A complete, correct HTML escaping function
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
\\`\\`\\`

## Framework Auto-Escaping

Modern frameworks escape HTML by default, which is why React, Vue, Angular, and similar tools dramatically reduce XSS risk:

\\`\\`\\`jsx
// React: JSX auto-escapes by default
const userInput = '<script>alert("xss")</script>'
return <div>{userInput}</div>
// Renders as: &lt;script&gt;alert("xss")&lt;/script&gt; — safe!

// ⚠️ dangerouslySetInnerHTML BYPASSES this protection
return <div dangerouslySetInnerHTML={{__html: userInput}} />
// → DANGEROUS! Only use with sanitized content
\\`\\`\\`

\\`\\`\\`html
<!-- Vue: {{ }} auto-escapes -->
<div>{{ userInput }}</div>  <!-- Safe -->

<!-- v-html bypasses escaping — use carefully -->
<div v-html="userInput"></div>  <!-- Dangerous with untrusted input -->
\\`\\`\\`

## DOMPurify: When You Need HTML from Users

Sometimes you legitimately need to accept HTML from users — rich text editors, comment systems with formatting, etc. In these cases, escape isn't enough. You need to **sanitize** — strip dangerous elements while keeping safe ones:

\\`\\`\\`javascript
// npm install dompurify
import DOMPurify from 'dompurify'

const dirty = '<p>Hello!</p><script>alert("xss")</script><img src=x onerror=alert(1)>'

// Clean: keeps safe tags, removes dangerous ones
const clean = DOMPurify.sanitize(dirty)
// → '<p>Hello!</p>'

// Strict: only allow specific tags
const strict = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'class']
})

// Set innerHTML safely
element.innerHTML = clean
\\`\\`\\`

## Common Named HTML Entities

Beyond the five critical ones, there are hundreds of named entities for symbols and special characters:

| Entity | Character | Use Case |
|---|---|---|
| \\`&nbsp;\\` | non-breaking space | Prevent line break between words |
| \\`&copy;\\` | © | Copyright symbol |
| \\`&reg;\\` | ® | Registered trademark |
| \\`&trade;\\` | ™ | Trademark |
| \\`&mdash;\\` | — | Em dash |
| \\`&ndash;\\` | – | En dash |
| \\`&hellip;\\` | … | Ellipsis |
| \\`&laquo;\\` | « | Left double angle quote |
| \\`&raquo;\\` | » | Right double angle quote |
| \\`&euro;\\` | € | Euro sign |

## Content Security Policy as an Additional Layer

HTML escaping prevents XSS, but a Content Security Policy (CSP) header provides defense-in-depth by restricting what scripts can execute even if escaping fails:

\\`\\`\\`http
# Strict CSP that blocks inline scripts and allows only trusted sources
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'; object-src 'none'
\\`\\`\\`

With a strict CSP, even if a \\`<script>\\` tag is injected into your HTML, the browser won't execute it because it's not from an allowed source.

→ Try the [HTML Entities Tool](/html-entities)`,"""

# ─── Article 14: basic-auth-generator-guide ──────────────────────────────────
OLD_14 = """    content: `## How Basic Auth Works

HTTP Basic Authentication encodes \\`username:password\\` in Base64 and sends it in the \\`Authorization\\` header:

\\`\\`\\`http
Authorization: Basic dXNlcjpwYXNzd29yZA==
\\`\\`\\`

Where \\`dXNlcjpwYXNzd29yZA==\\` = \\`base64("user:password")\\`

## When to Use Basic Auth

✅ **Internal APIs** protected by TLS
✅ **Development/testing** environments
✅ **Simple machine-to-machine** authentication

❌ **Public-facing user authentication** — use OAuth/JWT instead
❌ **Without HTTPS** — credentials are easily intercepted

## Curl Example

\\`\\`\\`bash
curl -u username:password https://api.example.com/data
# Equivalent to:
curl -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" https://api.example.com/data
\\`\\`\\`

→ Try the [Basic Auth Generator](/basic-auth-generator)`,"""

NEW_14 = """    content: `## How HTTP Basic Authentication Works

HTTP Basic Authentication is the simplest form of HTTP authentication, defined in RFC 7617. It works in three steps:

**Step 1: Concatenate credentials**
\\`\\`\\`
username:password
→ "admin:s3cr3t"
\\`\\`\\`

**Step 2: Base64 encode the concatenated string**
\\`\\`\\`javascript
btoa('admin:s3cr3t')
// → 'YWRtaW46czNjcjN0'
\\`\\`\\`

**Step 3: Send in the Authorization header**
\\`\\`\\`http
GET /api/resource HTTP/1.1
Host: api.example.com
Authorization: Basic YWRtaW46czNjcjN0
\\`\\`\\`

**Important:** Base64 is encoding, not encryption. The credentials are trivially reversible:
\\`\\`\\`javascript
atob('YWRtaW46czNjcjN0')
// → 'admin:s3cr3t'
\\`\\`\\`

This is why **Basic Auth is only safe over HTTPS**. Over plain HTTP, any network observer (or man-in-the-middle) can instantly decode the credentials.

## The Full Authentication Flow

When a server requires Basic Auth and receives an unauthenticated request, it responds with:
\\`\\`\\`http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="My API"
\\`\\`\\`

The client then resends with credentials:
\\`\\`\\`http
GET /api/resource HTTP/1.1
Authorization: Basic YWRtaW46czNjcjN0
\\`\\`\\`

Browser behavior: The \\`WWW-Authenticate\\` header triggers the browser's built-in login dialog. For APIs, clients must handle this programmatically.

## Generating the Header

\\`\\`\\`javascript
// Browser (modern)
function basicAuthHeader(username, password) {
  const credentials = btoa(\\`\\${username}:\\${password}\\`)
  return \\`Basic \\${credentials}\\`
}

// Node.js
function basicAuthHeader(username, password) {
  const credentials = Buffer.from(\\`\\${username}:\\${password}\\`).toString('base64')
  return \\`Basic \\${credentials}\\`
}

// Usage:
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': basicAuthHeader('admin', 's3cr3t')
  }
})
\\`\\`\\`

\\`\\`\\`bash
# curl: -u shorthand
curl -u admin:s3cr3t https://api.example.com/data

# curl: explicit header
curl -H "Authorization: Basic YWRtaW46czNjcjN0" https://api.example.com/data

# curl: prompt for password (more secure, avoids shell history)
curl -u admin https://api.example.com/data
\\`\\`\\`

## Basic Auth vs Bearer Token

| Feature | Basic Auth | Bearer Token (JWT/OAuth) |
|---|---|---|
| Credentials in request | Yes (every request) | No (token only) |
| Stateless | Yes | Yes |
| Revocation | Via password change | Token blacklist / short expiry |
| Rotation | Password rotation | Token expiry + refresh |
| User experience | Browser dialog or hardcoded | Login form |
| Suitable for | M2M, internal APIs | User auth, public APIs |

## Server-Side Implementation

### Apache
\\`\\`\\`apache
# Create password file
htpasswd -c /etc/apache2/.htpasswd username

# .htaccess
AuthType Basic
AuthName "Restricted Area"
AuthUserFile /etc/apache2/.htpasswd
Require valid-user
\\`\\`\\`

### Nginx
\\`\\`\\`nginx
server {
    location /protected/ {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
\\`\\`\\`

### Express.js (Node.js)
\\`\\`\\`javascript
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API"')
    return res.status(401).json({ error: 'Authentication required' })
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString()
  const [username, password] = credentials.split(':')
  
  // Use constant-time comparison to prevent timing attacks
  const validUser = timingSafeEqual(username, process.env.API_USER)
  const validPass = timingSafeEqual(password, process.env.API_PASS)
  
  if (!validUser || !validPass) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API"')
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  next()
}

// Use crypto.timingSafeEqual to prevent timing attacks
const { timingSafeEqual, createHash } = require('crypto')
function timingSafeEqual(a, b) {
  const bufA = Buffer.from(createHash('sha256').update(a).digest())
  const bufB = Buffer.from(createHash('sha256').update(b).digest())
  return timingSafeEqual(bufA, bufB)
}
\\`\\`\\`

## API Gateway Proxy Authentication

A common pattern is using Basic Auth at the API Gateway level, converting it to a token for upstream services:

\\`\\`\\`
Client → [Basic Auth: user:pass] → API Gateway → [Bearer token] → Upstream Service
\\`\\`\\`

AWS API Gateway, Kong, and Nginx can extract Basic Auth credentials and forward them as JWT tokens or API keys to backend services that don't implement their own auth.

## Security Limitations and Best Practices

1. **HTTPS is non-negotiable** — Never deploy Basic Auth without TLS. Period.

2. **No logout mechanism** — Browsers cache Basic Auth credentials for the session. The only way to "log out" is to send an invalid credential to force the browser to clear its cache.

3. **Vulnerable to brute force** — Implement rate limiting (e.g., allow 5 failed attempts before lockout) because HTTP doesn't provide built-in protection.

4. **Credentials in logs** — Ensure your server logs don't log the Authorization header, or they'll contain Base64-encoded credentials.

5. **Use strong passwords** — Since credentials are sent with every request, any compromise is immediately exploitable.

6. **Prefer token-based auth** for anything user-facing — Basic Auth's simplicity is its only advantage; Bearer tokens are superior in every other dimension.

→ Try the [Basic Auth Generator](/basic-auth-generator)`,"""

# ─── Article 15: safelink-decoder-guide ──────────────────────────────────────
OLD_15 = """    content: `## What Are Safelinks?

Email security gateways (Microsoft Defender ATP, Proofpoint, Mimecast) rewrite URLs in emails to proxy them through their scanning service.

**Original URL:** \\`https://example.com/resource\\`

**After wrapping:**
\\`\\`\\`
https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fresource&...
\\`\\`\\`

## Why Decode Them?

- Check where a link actually goes before clicking
- Share the clean original URL
- Debug email automation and link tracking

## Privacy Note

All decoding is done locally in your browser — no URLs are sent to any server.

→ Try the [Safelink Decoder](/safelink-decoder)`,"""

NEW_15 = """    content: `## What Are Email Safe Links?

Email security platforms don't just scan messages when they arrive — they also intercept every URL in an email and **rewrite it** to route through their scanning proxy. When a user clicks a link, the security gateway checks the destination in real time against threat intelligence databases before allowing or blocking access.

This technology is called different things by different vendors: Microsoft calls them "Safe Links," Proofpoint calls their system "URL Defense," Mimecast calls it "URL Protection." Despite the different branding, they all work on the same principle: wrap the original URL in a proxy URL.

The challenge: these wrapped URLs are long, unreadable, and leak information about your email security vendor when shared. Decoding them reveals the original destination.

## Vendor-Specific URL Formats

### Microsoft Defender for Office 365 (formerly ATP Safe Links)

Microsoft's wrapped URLs follow this pattern:
\\`\\`\\`
https://[region].safelinks.protection.outlook.com/?url=[encoded_url]&data=[metadata]&sdata=[signature]&reserved=0
\\`\\`\\`

Example:
\\`\\`\\`
https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgithub.com%2Fuser%2Frepo&data=05%7C02%7C...&sdata=abc123...&reserved=0
\\`\\`\\`

**Decoding:** Extract the \\`url\\` query parameter and URL-decode it:
\\`\\`\\`javascript
const wrapped = 'https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgithub.com%2Fuser%2Frepo&data=...'
const params = new URLSearchParams(new URL(wrapped).search)
const original = decodeURIComponent(params.get('url'))
// → 'https://github.com/user/repo'
\\`\\`\\`

### Proofpoint URL Defense (TAP)

Proofpoint uses a different encoding scheme with base64-like encoding:
\\`\\`\\`
https://urldefense.proofpoint.com/v2/url?u=[encoded]&d=[metadata]&e=[signature]
https://urldefense.com/v3/__[encoded]__[metadata]
\\`\\`\\`

The URL encoding uses a custom scheme where \\`-\\` and \\`_\\` replace \\`+\\` and \\`/\\`, and periods are replaced with underscores in domain names.

### Mimecast URL Protection

Mimecast redirects through:
\\`\\`\\`
https://protect-[region].mimecast.com/s/[hash]?domain=[domain]&s=[signature]
\\`\\`\\`

Mimecast's URLs don't embed the destination directly — they use a hash that's looked up on Mimecast's servers, so client-side decoding isn't possible without the hash lookup.

### Other Vendors

| Vendor | Domain Pattern |
|---|---|
| Microsoft ATP | \\`*.safelinks.protection.outlook.com\\` |
| Proofpoint | \\`urldefense.proofpoint.com\\`, \\`urldefense.com\\` |
| Mimecast | \\`protect-*.mimecast.com\\` |
| Barracuda | \\`linkprotect.cudasvc.com\\` |
| Symantec | \\`*.messagelabs.com\\` |
| Cisco Email Security | \\`*.senderbase.org\\` |

## The URL Decoding Algorithm

For Microsoft and similar vendors that embed the URL directly:

\\`\\`\\`javascript
function decodeSafeLink(wrappedUrl) {
  try {
    const url = new URL(wrappedUrl)
    
    // Microsoft Safe Links
    if (url.hostname.includes('safelinks.protection.outlook.com')) {
      return decodeURIComponent(url.searchParams.get('url') || '')
    }
    
    // Proofpoint v2
    if (url.hostname === 'urldefense.proofpoint.com') {
      const u = url.searchParams.get('u')
      if (u) {
        // Proofpoint uses - for + and _ for / in their encoding
        const fixed = u.replace(/-/g, '+').replace(/_/g, '/')
        return decodeURIComponent(atob(fixed))
      }
    }
    
    // Proofpoint v3 and generic - try extracting url param
    return decodeURIComponent(url.searchParams.get('url') || wrappedUrl)
  } catch {
    return wrappedUrl  // Return original if decoding fails
  }
}
\\`\\`\\`

## Why Organizations Enable Safe Links

Safe Links provide several security benefits:

1. **Real-time URL scanning** — Even if a URL was clean when the email was sent, Safe Links checks it again at click-time. Attackers use "time-of-click" deception: send a clean URL, wait for delivery, then change the destination.

2. **Phishing protection** — Scans URLs against Microsoft's (or vendor's) threat intelligence database.

3. **Click tracking** — Provides analytics on which links employees click, useful for security awareness training.

4. **Link neutralization** — Can block or warn users about dangerous links even after email delivery.

## Identifying Phishing Links Through Decoding

Safe link decoding is a legitimate security practice. When you receive a suspicious email, decoding the safe link lets you inspect the actual destination URL before visiting it:

**Red flags in decoded URLs:**
- IP addresses instead of domain names: \\`http://192.168.1.1/login\\`
- Misspelled domains: \\`paypa1.com\\`, \\`microsoft-secure.net\\`
- Long redirector chains: URL contains another URL contains another URL
- Unexpected TLDs: \\`google.com.phishing.xyz\\` (domain is \\`phishing.xyz\\`, not \\`google.com\\`)
- Shortened URLs: \\`bit.ly/xxxxx\\` (use a URL expander before visiting)

## Impact on Email Automation and Analytics

Safe links create challenges for legitimate email marketing and automation:

- **Click tracking conflicts:** Your ESP's click tracking + safe links = double redirect
- **Link preview tools break:** Tools that preview links see the safe link proxy, not the content
- **A/B testing URLs:** Safe link wrapping makes URL-based variants indistinguishable in analytics
- **Webhook callbacks:** URLs in automated workflows may need to be decoded before processing

→ Try the [Safelink Decoder](/safelink-decoder)`,"""

# ─── Article 16: html-wysiwyg-editor-guide ───────────────────────────────────
OLD_16 = """    content: `## What Is WYSIWYG?

**WYSIWYG** (What You See Is What You Get) editors let you format text visually — bold, italic, lists, headings — while the editor generates the underlying HTML.

## Use Cases

- Drafting email newsletter content
- Creating blog post HTML
- Prototyping rich text UI
- Non-technical content editing

## Generated HTML Example

Typing bold text and a list in the editor produces:
\\`\\`\\`html
<p><strong>Important note:</strong></p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
\\`\\`\\`

→ Try the [HTML WYSIWYG Editor](/html-wysiwyg-editor)`,"""

NEW_16 = """    content: `## What Is WYSIWYG?

**WYSIWYG** (What You See Is What You Get) is a paradigm for editing where you format content visually — bold, italic, headings, lists, tables — and the underlying HTML is generated automatically. The name originates from 1970s publishing software and remains relevant today for any tool where non-technical users need to produce structured content.

WYSIWYG editors are everywhere: blog post editors (WordPress, Ghost, Medium), email newsletter builders (Mailchimp, Substack), CMS rich text fields (Contentful, Strapi), documentation tools (Notion, Confluence), and form builders.

## The contentEditable API: The Browser Primitive

All browser-based WYSIWYG editors are ultimately built on the HTML \\`contenteditable\\` attribute, which turns any DOM element into an editable region:

\\`\\`\\`html
<div contenteditable="true" id="editor">
  <p>This text is editable!</p>
</div>
\\`\\`\\`

\\`\\`\\`javascript
// Reading the content
const content = document.getElementById('editor').innerHTML

// Basic formatting commands (see execCommand below)
document.execCommand('bold')    // Toggle bold on selection
document.execCommand('italic')  // Toggle italic on selection
\\`\\`\\`

The browser handles cursor positioning, text insertion, selection, and basic keyboard shortcuts (Ctrl+A, Ctrl+C, etc.) automatically.

## The execCommand Problem

Historically, \\`document.execCommand()\\` was the API for rich text editing commands. It could apply formatting, insert elements, change text direction, and more:

\\`\\`\\`javascript
document.execCommand('bold')
document.execCommand('insertUnorderedList')
document.execCommand('formatBlock', false, 'h2')
document.execCommand('createLink', false, 'https://example.com')
\\`\\`\\`

**The problem:** \\`execCommand\\` is now officially **deprecated** and no longer being standardized. It has:
- Inconsistent behavior across browsers
- No way to handle complex nested structures
- Produces different HTML in different browsers (\\`<b>\\` vs \\`<strong>\\`, \\`<i>\\` vs \\`<em>\\`)
- No proper undo/redo mechanism

Modern rich text editors build their own editing model on top of \\`contenteditable\\`, bypassing \\`execCommand\\` entirely.

## Major Rich Text Editor Libraries Compared

### ProseMirror
The low-level foundation that powers many other editors. Used by Atlassian (Confluence), The New York Times, and others.

\\`\\`\\`javascript
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'

const state = EditorState.create({ schema })
const view = new EditorView(document.body, {
  state,
  dispatchTransaction(transaction) {
    view.updateState(view.state.apply(transaction))
  }
})
\\`\\`\\`

**Pros:** Maximum control, excellent architecture, battle-tested
**Cons:** Steep learning curve, verbose API

### Tiptap
Built on ProseMirror with a friendlier API. The most popular choice for new projects.

\\`\\`\\`javascript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello World!</p>',
})

return <EditorContent editor={editor} />
\\`\\`\\`

**Pros:** Great DX, Vue/React integrations, large extension ecosystem, headless (bring your own UI)
**Cons:** Some advanced features are paid (Tiptap Pro)

### Quill
One of the first modern rich text editors. Mature and widely used.

\\`\\`\\`javascript
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [['bold', 'italic'], ['link', 'image'], [{ 'header': [1, 2, 3] }]]
  }
})

// Get delta (Quill's format)
const delta = quill.getContents()
// Get HTML
const html = quill.root.innerHTML
\\`\\`\\`

**Pros:** Mature, battle-tested, custom Delta format for conflict-free collaboration
**Cons:** Slower development velocity recently, Delta format is Quill-specific

### Slate.js
Highly customizable, schema-less. Favored for highly custom editors.

**Pros:** Extreme flexibility, React-native
**Cons:** Requires building almost everything yourself, breaking changes between versions

## HTML Sanitization: Critical for Security

WYSIWYG editors generate HTML, and that HTML must be sanitized before storage and before rendering in other users' browsers. Unsanitized rich text is a major XSS vector.

\\`\\`\\`javascript
// ❌ NEVER store or display rich text without sanitization
const content = editor.getHTML()
await db.posts.insert({ content })  // Stores potential XSS payload

// ✅ Always sanitize with DOMPurify before storage and display
import DOMPurify from 'dompurify'

const dirty = editor.getHTML()
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target'],
  // Force links to open in new tab with noopener
  ADD_ATTR: ['target'],
  FORCE_BODY: true,
  RETURN_DOM_FRAGMENT: false
})

await db.posts.insert({ content: clean })
\\`\\`\\`

**Sanitize on both sides:**
1. Before saving to database (prevent stored XSS)
2. Before rendering from database (defense-in-depth)

## Output Formats

Different editors produce different output formats:

\\`\\`\\`javascript
// HTML output (most common)
editor.getHTML()
// → '<p>Hello <strong>World</strong></p>'

// JSON/AST (Tiptap, ProseMirror)
editor.getJSON()
// → { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] }

// Markdown (some editors support this)
editor.storage.markdown.getMarkdown()
// → 'Hello **World**'

// Delta (Quill)
quill.getContents()
// → { ops: [{ insert: 'Hello ' }, { insert: 'World', attributes: { bold: true } }] }
\\`\\`\\`

JSON/AST formats are preferable for storage because they're:
- Easier to migrate when HTML semantics change
- Suitable for server-side rendering in multiple formats
- Compatible with collaborative editing (CRDT/OT)

## Accessibility Considerations

Rich text editors must be accessible to keyboard and screen reader users:

- Ensure the editor is reachable via Tab key
- All toolbar buttons should have descriptive \\`aria-label\\` attributes
- The editor should announce formatting changes to screen readers
- Provide keyboard shortcuts for all formatting operations
- Test with NVDA, JAWS, and VoiceOver

→ Try the [HTML WYSIWYG Editor](/html-wysiwyg-editor)`,"""

# Apply replacements
count13 = full_content.count(OLD_13)
count14 = full_content.count(OLD_14)
count15 = full_content.count(OLD_15)
count16 = full_content.count(OLD_16)
print(f"Found article 13: {count13}")
print(f"Found article 14: {count14}")
print(f"Found article 15: {count15}")
print(f"Found article 16: {count16}")

full_content = full_content.replace(OLD_13, NEW_13, 1)
full_content = full_content.replace(OLD_14, NEW_14, 1)
full_content = full_content.replace(OLD_15, NEW_15, 1)
full_content = full_content.replace(OLD_16, NEW_16, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Articles 13-16 updated successfully!")
