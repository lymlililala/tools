#!/usr/bin/env python3
"""Script to update Web category articles 8-12 in articles.data.ts."""

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    full_content = f.read()

# ─── Article 8: device-information-guide ─────────────────────────────────────
OLD_8 = """    content: `## What Browsers Expose

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

→ Try the [Device Information Tool](/device-information)`,"""

NEW_8 = """    content: `## What Your Browser Reveals: The Complete Picture

Every time you load a website, your browser automatically broadcasts a remarkable amount of information — without any cookies, logins, or user action. Website operators, advertisers, and analytics platforms collect this data to understand their audiences, personalize content, and, in some cases, track users across the web.

Understanding exactly what's exposed is the first step toward making informed privacy decisions.

## The navigator API: Core Browser Properties

JavaScript's \\`navigator\\` object exposes a wealth of information:

\\`\\`\\`javascript
// Browser identity
navigator.userAgent     // Full UA string
navigator.vendor        // "Google Inc.", "Apple Computer, Inc."
navigator.language      // "en-US", "zh-CN"
navigator.languages     // ["en-US", "en", "fr"] (preferred languages in order)

// Platform
navigator.platform      // "Win32", "MacIntel", "Linux x86_64" (deprecated but still used)
navigator.hardwareConcurrency  // CPU logical cores: 8, 16, 32...
navigator.deviceMemory         // RAM in GB (rounded): 0.5, 1, 2, 4, 8

// Input capabilities
navigator.maxTouchPoints  // 0 (mouse), 5 or 10 (touchscreen)
navigator.cookieEnabled   // true/false
navigator.onLine          // true/false
\\`\\`\\`

## Screen and Display Information

\\`\\`\\`javascript
// Physical screen
screen.width        // 1920
screen.height       // 1080
screen.colorDepth   // 24
screen.pixelDepth   // 24

// Viewport (browser window, excluding UI chrome)
window.innerWidth   // 1440
window.innerHeight  // 900

// Device pixel ratio (1 = standard, 2 = HiDPI/Retina, 3 = some mobile)
window.devicePixelRatio  // 2.0

// Available screen (excluding taskbar)
screen.availWidth   // 1920
screen.availHeight  // 1040
\\`\\`\\`

## Time and Locale Signals

\\`\\`\\`javascript
// Timezone detection
Intl.DateTimeFormat().resolvedOptions().timeZone  // "America/New_York"
new Date().getTimezoneOffset()  // -300 (minutes from UTC)

// Locale
Intl.DateTimeFormat().resolvedOptions().locale   // "en-US"
\\`\\`\\`

## Canvas and WebGL Fingerprinting

Beyond the \\`navigator\\` API, advanced fingerprinting uses browser rendering differences to create highly unique identifiers:

### Canvas Fingerprinting
Different GPUs, drivers, and font rendering engines produce subtly different pixel outputs when drawing the same graphics:

\\`\\`\\`javascript
function canvasFingerprint() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Browser fingerprint test', 2, 2)
  // This data URL varies by GPU/OS/driver combination
  return canvas.toDataURL()
}
\\`\\`\\`

### WebGL Fingerprinting
WebGL exposes GPU vendor and renderer information:
\\`\\`\\`javascript
const gl = document.createElement('canvas').getContext('webgl')
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
// vendor: "NVIDIA Corporation"
// renderer: "NVIDIA GeForce RTX 3080/PCIe/SSE2"
\\`\\`\\`

## The Uniqueness Problem: AmIUnique Research

The EFF's Panopticlick study and the University of Rennes' AmIUnique project have quantified the privacy risk:

- **83%** of browsers are uniquely identifiable using just the user agent, screen resolution, timezone, and installed plugins (2010 study)
- **90%+** of browsers are uniquely identifiable with canvas fingerprinting added (2016 study)
- Modern fingerprinting using 100+ signals achieves near-100% uniqueness

**The key insight:** You don't need a static cookie to track someone. The combination of dozens of ordinary browser properties creates a fingerprint as unique as a snowflake. Even after clearing cookies, the same browser and device will produce the same fingerprint.

## Privacy Protection Measures

### Tor Browser
Tor Browser is the most aggressive anti-fingerprinting solution. It:
- Normalizes all screen sizes to a fixed window size
- Disables JavaScript APIs that expose device details
- Reports the same UA string for all users
- Blocks canvas fingerprinting by prompting for permission

### Firefox resistFingerprinting
Firefox's \\`privacy.resistFingerprinting\\` setting reduces fingerprinting by:
- Reporting fake screen resolution (always 1000px wide)
- Blocking high-resolution timers used for timing attacks
- Normalizing timezone to UTC
- Rounding \\`devicePixelRatio\\` to 1

\\`\\`\\`javascript
// With resistFingerprinting enabled:
screen.width        // Always 1000 (fake)
navigator.languages // ["en-US"] (always, regardless of real setting)
new Date().getTimezoneOffset() // Always 0 (UTC)
\\`\\`\\`

### Brave Browser
Brave uses "randomized fingerprinting" — adding small random noise to canvas, WebGL, AudioContext, and other APIs so your fingerprint changes each session without breaking functionality.

## What Doesn't Help

- **Incognito/Private mode** — Does NOT change any browser fingerprint signals. It only prevents local history storage.
- **VPN** — Hides your IP address, but ALL other fingerprint signals remain identical.
- **Browser extensions** — Many actually *increase* uniqueness since having a specific set of extensions is itself identifying.
- **JavaScript blocking** — Prevents canvas/WebGL fingerprinting but breaks most websites and is itself a strong signal.

## GDPR and Legal Implications

Under GDPR (EU) and CCPA (California), browser fingerprinting for cross-site tracking purposes requires explicit user consent. The "legitimate interest" basis is unlikely to apply to tracking fingerprinting. Using fingerprinting for first-party analytics on your own site is lower risk, but still requires disclosure in your privacy policy.

Key obligations:
- Disclose fingerprinting in your privacy policy
- Obtain opt-in consent before using fingerprints for advertising
- Provide a mechanism for users to opt out
- Honor "Do Not Track" signals as a best practice

→ Try the [Device Information Tool](/device-information)`,"""

# ─── Article 9: mime-types-guide ─────────────────────────────────────────────
OLD_9 = """    content: `## What Is a MIME Type?

A MIME type (Multipurpose Internet Mail Extensions type) tells browsers and servers what kind of content a file contains. Format: \\`type/subtype\\`

## Common MIME Types

| Extension | MIME Type |
|---|---|
| .html | \\`text/html\\` |
| .css | \\`text/css\\` |
| .js | \\`application/javascript\\` |
| .json | \\`application/json\\` |
| .png | \\`image/png\\` |
| .pdf | \\`application/pdf\\` |
| .zip | \\`application/zip\\` |
| .mp4 | \\`video/mp4\\` |

## In HTTP Headers

\\`\\`\\`http
Content-Type: application/json; charset=utf-8
Accept: text/html, application/json
\\`\\`\\`

## Why It Matters

Browsers use MIME types (not file extensions) to decide how to handle content. Serving a JavaScript file as \\`text/plain\\` will prevent it from executing.

→ Try the [MIME Types Reference](/mime-types)`,"""

NEW_9 = """    content: `## What Is a MIME Type?

A MIME type (Media Type, formerly Multipurpose Internet Mail Extensions) is a standardized string that identifies the nature and format of a document. Defined by IANA and formalized in RFC 6838, MIME types are how servers and browsers agree on what kind of data is being transferred and how to handle it.

The format is always: **\\`type/subtype\\`** with an optional **\\`; parameter\\`**

\\`\\`\\`
text/html; charset=utf-8
application/json
image/png
video/mp4
\\`\\`\\`

## The Type Hierarchy

IANA organizes MIME types into top-level type categories:

| Type | Description | Examples |
|---|---|---|
| \\`text\\` | Human-readable text | \\`text/html\\`, \\`text/css\\`, \\`text/csv\\` |
| \\`image\\` | Image formats | \\`image/png\\`, \\`image/jpeg\\`, \\`image/webp\\` |
| \\`audio\\` | Audio formats | \\`audio/mpeg\\`, \\`audio/ogg\\`, \\`audio/wav\\` |
| \\`video\\` | Video formats | \\`video/mp4\\`, \\`video/webm\\` |
| \\`application\\` | Binary/application data | \\`application/json\\`, \\`application/pdf\\` |
| \\`multipart\\` | Multi-part messages | \\`multipart/form-data\\`, \\`multipart/mixed\\` |
| \\`font\\` | Font files | \\`font/woff2\\`, \\`font/ttf\\` |

## Essential MIME Types for Web Development

\\`\\`\\`
# Web assets
text/html              → HTML documents
text/css               → CSS stylesheets
application/javascript → JavaScript (official)
text/javascript        → JavaScript (also accepted)
application/json       → JSON data

# Images
image/jpeg             → JPEG photos
image/png              → PNG images
image/gif              → GIF animations
image/svg+xml          → SVG vector graphics
image/webp             → WebP (modern, compressed)
image/avif             → AVIF (next-gen format)

# Documents
application/pdf        → PDF files
application/zip        → ZIP archives
application/gzip       → Gzip compressed

# Media
audio/mpeg             → MP3 audio
video/mp4              → MP4 video
video/webm             → WebM video

# Fonts
font/woff2             → WOFF2 font (preferred)

# Data transfer
application/x-www-form-urlencoded → HTML form POST
multipart/form-data               → File uploads
application/octet-stream          → Binary/unknown data
\\`\\`\\`

## MIME Sniffing and the nosniff Header

Browsers can "sniff" (guess) MIME types by inspecting actual content bytes — this is called **MIME sniffing** or **content sniffing**. While designed as a helpful fallback, it creates security vulnerabilities.

**The attack:** An attacker uploads a file with a \\`.jpg\\` extension but containing HTML/JavaScript. If the browser sniffs it as \\`text/html\\`, the script executes — a stored XSS attack.

**The defense:** The \\`X-Content-Type-Options: nosniff\\` header tells browsers to strictly trust the server's Content-Type declaration:

\\`\\`\\`http
HTTP/1.1 200 OK
Content-Type: image/jpeg
X-Content-Type-Options: nosniff
\\`\\`\\`

With this header, if the server says it's an image, the browser will NOT execute it as JavaScript even if the bytes look like a script. **Always send this header** for responses handling user-uploaded content.

## File Upload Validation: Server-Side MIME Checking

Never trust the browser-reported MIME type for uploads. Validate actual file content using "magic bytes" (file signatures):

\\`\\`\\`javascript
// Node.js: Check magic bytes instead of relying on extension or Content-Type header
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png':  [0x89, 0x50, 0x4E, 0x47],
  'image/gif':  [0x47, 0x49, 0x46, 0x38],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
}

function getActualMimeType(buffer) {
  for (const [mimeType, signature] of Object.entries(MAGIC_BYTES)) {
    if (signature.every((byte, i) => buffer[i] === byte)) {
      return mimeType
    }
  }
  return 'application/octet-stream'  // Unknown
}

// In Express upload handler:
app.post('/upload', upload.single('file'), (req, res) => {
  const buffer = fs.readFileSync(req.file.path)
  const actualType = getActualMimeType(buffer)
  
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(actualType)) {
    fs.unlinkSync(req.file.path)  // Delete the file
    return res.status(400).json({ error: 'Invalid file type' })
  }
  // Continue processing...
})
\\`\\`\\`

The **file-type** npm package handles this automatically for hundreds of formats.

## application/octet-stream: The Fallback Type

\\`application/octet-stream\\` means "arbitrary binary data." Browsers handle it by triggering a download dialog — it's the MIME equivalent of "I don't know what this is."

\\`\\`\\`javascript
// Force download of any file
res.setHeader('Content-Type', 'application/octet-stream')
res.setHeader('Content-Disposition', 'attachment; filename="data.bin"')
\\`\\`\\`

## Content-Disposition: Download vs Display

The \\`Content-Disposition\\` header controls whether content is shown inline or downloaded:

\\`\\`\\`http
# Display in browser (default for HTML, images, PDF)
Content-Disposition: inline

# Force download with suggested filename
Content-Disposition: attachment; filename="report-2025-06.pdf"

# Unicode filename (RFC 5987)
Content-Disposition: attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf
\\`\\`\\`

Use \\`filename*=UTF-8''...\\` for non-ASCII filenames. The \\`filename*\\` parameter takes priority over \\`filename\\`.

## Setting MIME Types in Web Servers

\\`\\`\\`nginx
# nginx: Add custom types in nginx.conf:
types {
    application/wasm  wasm;
    font/woff2        woff2;
    image/avif        avif;
}
\\`\\`\\`

\\`\\`\\`apache
# Apache .htaccess:
AddType application/wasm .wasm
AddType font/woff2 .woff2
AddType image/avif .avif
\\`\\`\\`

\\`\\`\\`javascript
// Express.js
res.type('application/json')  // Sets Content-Type header
res.type('.html')             // Also works with extension
\\`\\`\\`

## Common Pitfalls

**Serving WASM with wrong MIME type:** WebAssembly modules MUST be served as \\`application/wasm\\`. Serving as \\`application/octet-stream\\` prevents streaming compilation and may fail with MIME type errors.

**Font CORS:** Font files served from a CDN need both correct MIME type AND CORS headers (\\`Access-Control-Allow-Origin\\`) or browsers will silently reject them.

**CSV encoding:** Use \\`text/csv; charset=utf-8\\` for CSV files with international characters. Excel opens CSV files differently based on BOM and charset declarations.

→ Try the [MIME Types Reference](/mime-types)`,"""

# Apply replacements
full_content = full_content.replace(OLD_8, NEW_8, 1)
full_content = full_content.replace(OLD_9, NEW_9, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Articles 8-9 updated successfully!")
