#!/usr/bin/env python3
"""Script to update Web category articles 10-12."""

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    full_content = f.read()

# ─── Article 10: user-agent-parser-guide ─────────────────────────────────────
OLD_10 = """    content: `## User Agent String Format

\\`\\`\\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 
(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
\\`\\`\\`

All browsers include \\`Mozilla/5.0\\` for historical compatibility reasons.

## What to Extract

| Field | Example |
|---|---|
| Browser | Chrome 120.0 |
| OS | Windows 10 |
| Device type | Desktop |
| Engine | WebKit 537.36 |

## Server-Side Detection (Node.js)

\\`\\`\\`javascript
const ua = require('ua-parser-js');
const result = ua(req.headers['user-agent']);
// { browser: {name: 'Chrome', version: '120'}, os: {name: 'Windows'} }
\\`\\`\\`

## Warning: UA Spoofing

User agents can be easily spoofed. Use feature detection (not UA detection) for browser compatibility decisions.

→ Try the [User Agent Parser](/user-agent-parser)`,"""

NEW_10 = """    content: `## The Chaotic History of User Agent Strings

The User Agent (UA) string is one of the web's most bizarre artifacts — a string that is simultaneously essential and fundamentally broken. Understanding why requires a brief history lesson.

**1993 — NCSA Mosaic:** The first browser sends \\`Mosaic/1.0\\`. Clean, honest.

**1994 — Netscape Navigator:** Netscape identifies as \\`Mozilla/1.0\\` ("Mosaic Killer"). Mozilla becomes dominant and servers start serving enhanced content only to Mozilla agents.

**1996 — Internet Explorer 3:** Microsoft needs IE to access Mozilla-only content, so it sends \\`Mozilla/2.0 (compatible; MSIE 3.0; Windows 95)\\`. The forgery era begins.

**2003 — Safari:** Built on KHTML/WebKit, adds \\`(KHTML, like Gecko)\\` so Gecko-sniffing servers don't block it.

**2008 — Chrome:** Built on WebKit, includes both \\`AppleWebKit/xxx\\` AND \\`Safari/xxx\\` in its UA.

The result is the modern Chrome UA string:
\\`\\`\\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
\\`\\`\\`

This string claims to be Mozilla, uses WebKit, is like Gecko, and is Safari. It is none of these things. It is Chrome.

## Parsing the UA String

Despite its chaos, the UA string follows recognizable patterns:

\\`\\`\\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
│            │                                                                       │
│            └── OS platform tokens                                                  └── Browser identifier
└── Always "Mozilla/5.0" — ignore this
\\`\\`\\`

**OS detection from the platform token:**

| Token | OS |
|---|---|
| \\`Windows NT 10.0\\` | Windows 10/11 |
| \\`Windows NT 6.1\\` | Windows 7 |
| \\`Macintosh; Intel Mac OS X 10_15_7\\` | macOS Catalina |
| \\`iPhone; CPU iPhone OS 16_0\\` | iOS 16 |
| \\`Android 13; Pixel 7\\` | Android 13 |
| \\`Linux x86_64\\` | Linux |

**Browser detection priority:**
1. Contains \\`Edg/\\` → Microsoft Edge (Chromium)
2. Contains \\`OPR/\\` → Opera
3. Contains \\`Firefox/\\` → Firefox
4. Contains \\`Chrome/\\` → Chrome
5. Contains \\`Safari/\\` but NOT \\`Chrome\\` → Safari
6. Contains \\`CriOS/\\` → Chrome on iOS (distinct from desktop Chrome)

## Using ua-parser-js

The most popular JavaScript UA parsing library (npm install ua-parser-js):

\\`\\`\\`javascript
const UAParser = require('ua-parser-js')

const uaString = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'

const parser = new UAParser(uaString)
const result = parser.getResult()
/*
{
  browser: { name: 'Mobile Safari', version: '16.0' },
  engine:  { name: 'WebKit', version: '605.1.15' },
  os:      { name: 'iOS', version: '16.0' },
  device:  { vendor: 'Apple', model: 'iPhone', type: 'mobile' },
  cpu:     { architecture: undefined }
}
*/

// Server-side usage in Express
app.use((req, res, next) => {
  const parser = new UAParser(req.headers['user-agent'])
  req.ua = parser.getResult()
  next()
})

app.get('/page', (req, res) => {
  if (req.ua.device.type === 'mobile') {
    res.redirect('/mobile')
  }
})
\\`\\`\\`

## User-Agent Client Hints: The Modern Replacement

Google introduced **User-Agent Client Hints (UA-CH)** as a privacy-preserving replacement. Instead of broadcasting all device info upfront, UA-CH lets servers request only the specific hints they need.

\\`\\`\\`http
# Browser sends minimal default hints automatically
Sec-CH-UA: "Chromium";v="120", "Google Chrome";v="120"
Sec-CH-UA-Mobile: ?0
Sec-CH-UA-Platform: "Windows"

# Server can request additional high-entropy hints:
Accept-CH: Sec-CH-UA-Full-Version-List, Sec-CH-UA-Arch, Sec-CH-UA-Model
\\`\\`\\`

**Available Client Hints:**

| Hint | Example Value | Privacy Risk |
|---|---|---|
| \\`Sec-CH-UA\\` | Chrome brand list | Low |
| \\`Sec-CH-UA-Platform\\` | "Windows", "macOS" | Low |
| \\`Sec-CH-UA-Mobile\\` | ?0 or ?1 | Low |
| \\`Sec-CH-UA-Full-Version-List\\` | Full version numbers | Medium |
| \\`Sec-CH-UA-Arch\\` | "x86", "arm" | Medium |
| \\`Sec-CH-UA-Model\\` | "Pixel 7" | High |

## JavaScript Client Hints API

\\`\\`\\`javascript
// navigator.userAgentData (Chrome 90+, Edge)
const uaData = navigator.userAgentData
console.log(uaData.brands)    // [{ brand: 'Google Chrome', version: '120' }]
console.log(uaData.mobile)    // false
console.log(uaData.platform)  // 'Windows'

// Request high-entropy values (may show permission prompt for some)
const high = await uaData.getHighEntropyValues([
  'architecture', 'model', 'platformVersion', 'fullVersionList'
])
console.log(high.platformVersion)  // '15.0.0' on macOS 15
console.log(high.architecture)     // 'arm' on Apple Silicon
\\`\\`\\`

## Google's UA Freezing Plan

Google has been progressively "freezing" Chrome's UA string to prevent fingerprinting:

- **Chrome 101+ (2022):** Minor versions frozen: \\`Chrome/101.0.0.0\\` (always \\`0.0.0\\`)
- **Planned:** OS version and device model will be reduced to generic values

This means UA string-based OS version detection will become unreliable for Chrome users. Migrate to UA-CH for accurate detection.

## Best Practices: When (Not) to Use UA Detection

**Use UA detection for:**
- Analytics (understand your audience's browser/OS distribution)
- Sending appropriate media formats (checking WebP support)
- Debugging (log UA alongside errors)
- Bot detection (identifying crawlers and scrapers)

**Do NOT use UA detection for:**
- Feature flags — use feature detection (\\`typeof fetch !== 'undefined'\\`)
- Security decisions — never trust client-supplied data
- Layout/responsive decisions — use CSS media queries instead

\\`\\`\\`javascript
// ❌ Bad: UA detection for feature support
if (userAgent.includes('Chrome')) {
  useModernAPI()
}

// ✅ Good: Feature detection
if (typeof IntersectionObserver !== 'undefined') {
  useModernAPI()
}

// ✅ Good: CSS for responsive layout
@media (max-width: 768px) {
  .sidebar { display: none; }
}
\\`\\`\\`

→ Try the [User Agent Parser](/user-agent-parser)`,"""

# ─── Article 11: keycode-info-guide ──────────────────────────────────────────
OLD_11 = """    content: `## Key Event Properties

\\`\\`\\`javascript
document.addEventListener('keydown', (e) => {
  e.key     // "a", "Enter", "ArrowLeft" (semantic value)
  e.code    // "KeyA", "Enter", "ArrowLeft" (physical key)
  e.keyCode // 65, 13, 37 (deprecated but still widely used)
  e.which   // Same as keyCode (deprecated)
});
\\`\\`\\`

## key vs code

- **\\`e.key\\`** — What the key means (respects keyboard layout, caps lock, shift)
- **\\`e.code\\`** — Physical key position (layout-independent, e.g., "KeyA" always = A key regardless of layout)

## Common Key Codes

| Key | e.key | e.code | e.keyCode |
|---|---|---|---|
| Enter | "Enter" | "Enter" | 13 |
| Space | " " | "Space" | 32 |
| Escape | "Escape" | "Escape" | 27 |
| Left Arrow | "ArrowLeft" | "ArrowLeft" | 37 |
| A | "a"/"A" | "KeyA" | 65 |

→ Try the [Keycode Info Tool](/keycode-info)`,"""

NEW_11 = """    content: `## The Three Keyboard Events: keydown, keyup, keypress

JavaScript fires three types of keyboard events:

| Event | When | Auto-Repeats? | Use For |
|---|---|---|---|
| \\`keydown\\` | Key is pressed | Yes (held key auto-repeats) | Shortcuts, game controls |
| \\`keyup\\` | Key is released | No | Confirming completed key actions |
| \\`keypress\\` | **Deprecated** | Yes | Avoid — use keydown instead |

\\`keypress\\` was deprecated because it didn't fire for non-printable keys (Escape, Arrow keys, Function keys) and had inconsistent behavior. Always use \\`keydown\\` or \\`keyup\\`.

## The Four Key Properties: A Definitive Comparison

### e.key — The Semantic Value (Use This for Text)

Returns the string value of the key, accounting for modifier keys and keyboard layout:

\\`\\`\\`javascript
document.addEventListener('keydown', (e) => {
  // Pressing 'a' → "a"
  // Pressing Shift+'a' → "A"
  // Pressing Enter → "Enter"
  // Pressing Left Arrow → "ArrowLeft"
  // Pressing Ctrl → "Control"
  // Pressing Shift → "Shift"
  console.log(e.key)
})
\\`\\`\\`

### e.code — The Physical Key (Use for Layout-Independent Shortcuts)

Returns the physical key identifier, regardless of keyboard layout or modifier state:

\\`\\`\\`javascript
document.addEventListener('keydown', (e) => {
  // The 'A' position key → always "KeyA" even on AZERTY layout
  // Numpad 1 → "Numpad1" (vs top-row "Digit1")
  // Left Ctrl → "ControlLeft" (vs right Ctrl "ControlRight")
  console.log(e.code)
})
\\`\\`\\`

### e.keyCode (Deprecated — Avoid in New Code)

A legacy numeric code. You'll find it in older codebases; don't use in new code:

\\`\\`\\`javascript
// ❌ Deprecated
e.keyCode  // 65 for 'a', 13 for Enter, 27 for Escape
e.which    // Same as keyCode (even more deprecated)
\\`\\`\\`

### When to Use key vs code

| Use Case | Property | Reason |
|---|---|---|
| Text input (what character was typed?) | \\`e.key\\` | Respects shift/caps/layout |
| Keyboard shortcuts (ctrl+s, ctrl+z) | \\`e.code\\` | Physical position is consistent |
| Game WASD controls | \\`e.code\\` | Works on all keyboard layouts |
| Check for specific key like Enter | \\`e.key === 'Enter'\\` | Semantic is correct here |
| Detect left vs right modifier | \\`e.code\\` | \\`ControlLeft\\` vs \\`ControlRight\\` |

## Common Key Reference Table

| Key | e.key | e.code | Legacy e.keyCode |
|---|---|---|---|
| Enter | "Enter" | "Enter" | 13 |
| Tab | "Tab" | "Tab" | 9 |
| Escape | "Escape" | "Escape" | 27 |
| Space | " " | "Space" | 32 |
| Backspace | "Backspace" | "Backspace" | 8 |
| Delete | "Delete" | "Delete" | 46 |
| Left Arrow | "ArrowLeft" | "ArrowLeft" | 37 |
| Right Arrow | "ArrowRight" | "ArrowRight" | 39 |
| Up Arrow | "ArrowUp" | "ArrowUp" | 38 |
| Down Arrow | "ArrowDown" | "ArrowDown" | 40 |
| A | "a" / "A" | "KeyA" | 65 |
| 1 (top row) | "1" / "!" | "Digit1" | 49 |
| 1 (numpad) | "1" | "Numpad1" | 97 |
| F1 | "F1" | "F1" | 112 |
| Ctrl | "Control" | "ControlLeft" / "ControlRight" | 17 |
| Shift | "Shift" | "ShiftLeft" / "ShiftRight" | 16 |
| Alt | "Alt" | "AltLeft" / "AltRight" | 18 |
| Meta/Cmd | "Meta" | "MetaLeft" / "MetaRight" | 91 |

## Implementing Keyboard Shortcuts

\\`\\`\\`javascript
// Cross-platform save shortcut (Ctrl+S on Windows/Linux, Cmd+S on Mac)
document.addEventListener('keydown', (e) => {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const saveKey = isMac ? e.metaKey : e.ctrlKey
  
  if (saveKey && e.code === 'KeyS') {
    e.preventDefault()  // Prevent browser's save dialog
    saveDocument()
  }
  
  // Undo: Ctrl+Z / Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
    e.preventDefault()
    e.shiftKey ? redo() : undo()
  }
})

// Modal close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})
\\`\\`\\`

## International Keyboard Compatibility

This is where \\`e.code\\` vs \\`e.key\\` becomes critical. Consider a French AZERTY keyboard:

| Physical key | QWERTY e.key | AZERTY e.key | e.code (both) |
|---|---|---|---|
| Q position | "q" | "a" | "KeyQ" |
| A position | "a" | "q" | "KeyA" |
| W position | "w" | "z" | "KeyW" |

If you implement WASD game controls using \\`e.key === 'w'\\`, French players will struggle because their 'w' key is in the 'z' position. Use \\`e.code === 'KeyW'\\` instead.

\\`\\`\\`javascript
// ❌ Breaks for non-QWERTY layouts
document.addEventListener('keydown', (e) => {
  if (e.key === 'w') moveForward()
  if (e.key === 'a') moveLeft()
})

// ✅ Works for all layouts (physical position)
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') moveForward()
  if (e.code === 'KeyA') moveLeft()
})
\\`\\`\\`

## Composition Events for CJK Input

When users type Chinese, Japanese, or Korean using an IME (Input Method Editor), the keyboard events work differently. Characters are composed from multiple keystrokes before being committed:

\\`\\`\\`javascript
// During IME composition, keydown fires but the character isn't final yet
document.addEventListener('keydown', (e) => {
  if (e.isComposing) {
    return  // Ignore — user is still composing a CJK character
  }
  if (e.key === 'Enter') submitForm()
})

// Better: use compositionstart/compositionend events
let isComposing = false
input.addEventListener('compositionstart', () => isComposing = true)
input.addEventListener('compositionend', () => isComposing = false)
input.addEventListener('keydown', (e) => {
  if (!isComposing && e.key === 'Enter') submitForm()
})
\\`\\`\\`

This is a particularly important pattern for applications targeting East Asian users.

→ Try the [Keycode Info Tool](/keycode-info)`,"""

# ─── Article 12: slugify-string-guide ────────────────────────────────────────
OLD_12 = """    content: `## What Is a URL Slug?

A slug is the human-readable, URL-friendly part of a URL:

\\`\\`\\`
https://example.com/blog/how-to-create-seo-friendly-urls
                         ↑
                    this is the slug
\\`\\`\\`

## Slugification Rules

1. Convert to lowercase
2. Replace spaces and special chars with hyphens
3. Remove non-ASCII characters (or transliterate: é → e)
4. Remove duplicate hyphens
5. Trim leading/trailing hyphens

**Example:** "Hello, World! How Are You?" → \\`hello-world-how-are-you\\`

## SEO Best Practices for URLs

- Keep slugs short and descriptive (3–5 words)
- Include the main keyword
- Use hyphens (not underscores — Google treats underscores as word joiners)
- Avoid stop words (a, the, in, of) unless needed for readability

→ Try the [Slugify String Tool](/slugify-string)`,"""

NEW_12 = """    content: `## What Is a URL Slug?

A **slug** is the human-readable, URL-friendly identifier at the end of a web address. It's the part that describes the content in plain language:

\\`\\`\\`
https://example.com/blog/how-to-create-seo-friendly-urls
                         ↑──────────────────────────────
                              this is the slug
\\`\\`\\`

Slugs are critical for SEO, user experience, and link shareability. A well-crafted slug communicates content at a glance, survives being copied into emails or messages, and tells search engines what a page is about.

## The Slugification Algorithm

Converting arbitrary text to a valid slug requires a consistent pipeline:

\\`\\`\\`javascript
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')           // Decompose accented chars: é → e + combining accent
    .replace(/[\\u0300-\\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase()              // Convert to lowercase
    .trim()                     // Remove leading/trailing whitespace
    .replace(/[^\\w\\s-]/g, '')  // Remove non-word chars (keep letters, numbers, spaces, hyphens)
    .replace(/[\\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
}

slugify('Hello, World! How Are You?')  // → 'hello-world-how-are-you'
slugify('  C++ Programming & Algorithms  ')  // → 'c-programming-algorithms'
slugify('Héllo Wörld')  // → 'hello-world'
slugify('2025 Best Practices')  // → '2025-best-practices'
\\`\\`\\`

## Transliteration: Handling Non-Latin Scripts

NFD decomposition handles accented Latin characters (é, ñ, ü), but it doesn't help with scripts like Chinese, Arabic, or Japanese. For these, you need **transliteration** — converting to a phonetic Latin equivalent.

\\`\\`\\`javascript
// Using the 'transliteration' npm package
const { slugify: transliterateSlugify } = require('transliteration')

transliterateSlugify('北京 2025')     // → 'bei-jing-2025'
transliterateSlugify('Москва')        // → 'moskva'
transliterateSlugify('東京')          // → 'dong-jing'
transliterateSlugify('مرحبا')         // → 'mrhb' (Arabic)
\\`\\`\\`

However, many sites simply drop non-ASCII characters or keep them as-is (which works in modern browsers for Unicode URLs). The right approach depends on your audience:
- **International audience:** Keep Unicode characters in the slug (modern browsers handle them fine)
- **ASCII-only requirement:** Use transliteration library + fallback

## Hyphens vs Underscores: Google's Position

John Mueller from Google has confirmed: **use hyphens, not underscores**.

Google treats hyphens as word separators — \\`web-development\\` is indexed as two separate words "web" and "development." Underscores, however, are treated as word joiners — \\`web_development\\` is indexed as a single word "webdevelopment."

\\`\\`\\`
/blog/web-development  → indexed as: "web" + "development" ✅
/blog/web_development  → indexed as: "webdevelopment" ❌ (misses individual word searches)
\\`\\`\\`

This makes a real difference for search rankings on individual keywords.

## SEO URL Best Practices

**1. Keep slugs short and descriptive (3–5 words)**
\\`\\`\\`
❌ /blog/the-ultimate-comprehensive-guide-to-understanding-and-using-regular-expressions-in-javascript
✅ /blog/javascript-regex-guide
\\`\\`\\`

**2. Include your target keyword**
\\`\\`\\`
❌ /blog/post-1234
✅ /blog/http-status-codes-guide
\\`\\`\\`

**3. Omit dates unless necessary**
\\`\\`\\`
❌ /blog/2025/06/15/javascript-regex-guide  (will appear outdated)
✅ /blog/javascript-regex-guide             (timeless)
\\`\\`\\`

**4. Lowercase only**
\\`\\`\\`
❌ /blog/JavaScript-Regex-Guide  (uppercase creates duplicate URL issues)
✅ /blog/javascript-regex-guide
\\`\\`\\`

## Handling Duplicate Slugs

In a CMS or blog, the same title may appear multiple times. Always implement unique slug generation:

\\`\\`\\`javascript
async function generateUniqueSlug(title, db) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1
  
  while (await db.posts.findOne({ slug })) {
    slug = \\`\\${baseSlug}-\\${counter}\\`
    counter++
  }
  
  return slug
}

// Results:
// "My Post" → "my-post"
// "My Post" (duplicate) → "my-post-2"
// "My Post" (third) → "my-post-3"
\\`\\`\\`

## Using Established Libraries

For production use, leverage battle-tested libraries rather than rolling your own:

\\`\\`\\`javascript
// npm install slugify
const slugify = require('slugify')
slugify('My Blog Post!', { lower: true, strict: true })
// → 'my-blog-post'

// npm install @sindresorhus/slugify (ESM)
import slugify from '@sindresorhus/slugify'
slugify('I ♥ Dogs')  // → 'i-love-dogs'  (converts symbols)
\\`\\`\\`

## WordPress-Style Slugification

WordPress's \\`sanitize_title()\\` function is the reference implementation that many developers emulate. Key behaviors:
- Removes HTML tags
- Decodes HTML entities
- Converts to lowercase
- Replaces spaces with hyphens
- Removes characters not in \\`[a-z0-9-_]\\`
- URL-encodes remaining non-ASCII characters

## Changing Slugs: SEO Redirect Obligations

If you ever change an existing slug, always set up a **301 permanent redirect** from the old URL to the new one. Failing to do so means:
- Broken links in other sites pointing to yours
- Loss of accumulated SEO authority (PageRank)
- 404 errors for users who bookmarked the old URL

\\`\\`\\`nginx
# nginx redirect
rewrite ^/blog/old-slug$ /blog/new-slug permanent;
\\`\\`\\`

\\`\\`\\`javascript
// Express redirect
app.get('/blog/old-slug', (req, res) => {
  res.redirect(301, '/blog/new-slug')
})
\\`\\`\\`

→ Try the [Slugify String Tool](/slugify-string)`,"""

# Apply replacements
count10 = full_content.count(OLD_10)
count11 = full_content.count(OLD_11)
count12 = full_content.count(OLD_12)
print(f"Found article 10: {count10} times")
print(f"Found article 11: {count11} times")
print(f"Found article 12: {count12} times")

full_content = full_content.replace(OLD_10, NEW_10, 1)
full_content = full_content.replace(OLD_11, NEW_11, 1)
full_content = full_content.replace(OLD_12, NEW_12, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Articles 10-12 updated successfully!")
