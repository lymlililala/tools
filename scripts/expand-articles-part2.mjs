/**
 * Part 2: Expand articles for Converter category (base64, json-to-yaml, css-unit, color, markdown, unix, date, temperature, case, roman, integer-base, url-encoding)
 */
import { readFileSync, writeFileSync } from 'fs';

function escapeForTS(content) {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

const newContents = new Map();

newContents.set('base64-encoding-explained', `## What Is Base64 Encoding?

Base64 is a binary-to-text encoding scheme that represents binary data using a set of 64 printable ASCII characters. The name "Base64" comes from the radix-64 representation. The 64 characters used are: A–Z (26), a–z (26), 0–9 (10), + and / (2), with = used as padding.

Base64 was designed to safely transmit binary data over channels designed to handle text — like email (SMTP) or embedding binary content in XML or JSON.

## How Base64 Encoding Works

Base64 takes 3 bytes (24 bits) of input at a time and produces 4 characters of output:

\`\`\`
Input bytes:    01001101  01100001  01101110
Group into 6:   010011  010110  000101  101110
Base64 index:   19      22      5       46
Base64 chars:   T       W       F       u
\`\`\`

The encoding increases size by approximately 33% (every 3 bytes becomes 4 characters). If the input isn't divisible by 3, = padding is added.

## Base64 Encoding Examples

\`\`\`
Input:    "Hello"
Binary:   01001000 01100101 01101100 01101100 01101111
Base64:   SGVsbG8=

Input:    "Man"
Binary:   01001101 01100001 01101110
Base64:   TWFu

Input:    "Ma"  (needs padding)
Binary:   01001101 01100001
Base64:   TWE=
\`\`\`

## Common Uses of Base64

### HTTP Basic Authentication
HTTP Basic Auth encodes credentials as \`username:password\` in Base64:

\`\`\`
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`

This encoding is trivially reversible — it provides no security. Basic Auth requires HTTPS to be safe.

### Data URIs
Embed images directly in HTML or CSS without separate HTTP requests:

\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
\`\`\`

This is useful for small icons, reducing HTTP requests, or making files self-contained.

### JWT Tokens
JSON Web Tokens encode their header and payload as Base64URL (a URL-safe variant):

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature
\`\`\`

### Email Attachments (MIME)
MIME encoding uses Base64 to attach binary files (images, PDFs, executables) to email messages. The binary data is Base64-encoded and included in the email body.

### SSH Public Keys
SSH public keys are stored and transmitted in Base64 format:

\`\`\`
ssh-rsa AAAAB3NzaC1yc2EAAA... user@host
\`\`\`

## Base64 vs Base64URL

Standard Base64 uses + and / which are special characters in URLs. **Base64URL** replaces these:
- \`+\` → \`-\`
- \`/\` → \`_\`
- Removes \`=\` padding

Use Base64URL whenever the encoded string will appear in URLs, filenames, or HTTP headers.

## Base64 Is NOT Encryption

This is the most common misconception. Base64 is trivially reversible without any key:

\`\`\`javascript
atob('SGVsbG8=') // "Hello"
\`\`\`

Anyone who sees Base64-encoded data can immediately decode it. Never use Base64 to "hide" passwords, API keys, or sensitive information. For security, use proper encryption (AES) or hashing (bcrypt).

## Size Overhead

Base64 encoding increases data size by ~33%:
- 100 bytes → ~136 Base64 characters
- 1 MB image → ~1.37 MB Base64 string

This overhead is usually acceptable for small data but significant for large files.

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

✅ Use Base64 when:
- Embedding binary data in text formats (HTML, CSS, JSON, XML)
- Transmitting binary over text protocols (email, older HTTP headers)
- Encoding binary data that must survive text transformations (line endings, character set conversion)

❌ Don't use Base64 when:
- You need security — it provides none
- Size efficiency matters — it adds 33% overhead
- The data is already text — unnecessary overhead

→ Try the [Base64 String Converter](/base64-string-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('json-to-yaml-complete-guide', `## Why Convert Between JSON and YAML?

JSON (JavaScript Object Notation) and YAML (YAML Ain't Markup Language) represent the same types of data structures — objects, arrays, strings, numbers, booleans, and null — but with very different syntax philosophies. Knowing when and how to convert between them is essential for modern development workflows.

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

**JSON strengths:**
- Universally supported in every programming language
- Strict syntax leaves no ambiguity
- Directly parseable in JavaScript
- Compact when minified

**JSON weaknesses:**
- No comments (a significant limitation for configuration files)
- More verbose with quotes around all keys
- Less readable for complex nested structures

## YAML: The Configuration Standard

YAML uses indentation and minimal punctuation to represent the same structures. It's the dominant format for configuration files in DevOps (Docker Compose, Kubernetes, GitHub Actions, Ansible).

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

**YAML strengths:**
- Supports comments (# comment)
- More human-readable for nested structures
- Multi-line strings are natural
- Less punctuation
- Supports references and anchors (DRY principle)

**YAML weaknesses:**
- Indentation-sensitive — tabs are illegal, inconsistent spaces cause errors
- Implicit type coercion leads to bugs
- Multiple valid representations (block vs flow style)
- Slower to parse

## Side-by-Side Comparison

| Feature | JSON | YAML |
|---|---|---|
| Comments | ❌ | ✅ # comment |
| Trailing commas | ❌ | N/A |
| Multiline strings | Awkward (\\n) | Natural |
| Anchors / references | ❌ | ✅ &anchor, *ref |
| Schema validation | JSON Schema | YAML Schema |
| Primary use | APIs, data exchange | Config files |
| File extensions | .json | .yaml, .yml |

## Common YAML Gotchas

### 1. Type Coercion
YAML automatically converts unquoted values to their "natural" types:

\`\`\`yaml
port: 8080       # Integer, not string!
enabled: yes     # Boolean true, not string!
version: 1.0     # Float!
zip: 01234       # Integer (drops leading zero)!
\`\`\`

To force strings, quote them:
\`\`\`yaml
port: "8080"
enabled: "yes"
zip: "01234"
\`\`\`

### 2. Norway Problem
In YAML 1.1, country codes \`NO\`, \`NO\`, \`ON\`, \`OFF\`, \`YES\`, \`NO\` are parsed as booleans. This famously broke code that used \`no\` as the country code for Norway. YAML 1.2 fixed this.

### 3. Tabs Are Illegal
YAML strictly requires spaces for indentation. Tabs cause parse errors. Most editors handle this automatically, but watch out when copying from sources that use tabs.

### 4. Duplicate Keys
YAML doesn't forbid duplicate keys — the last one wins silently. JSON parsers often reject duplicates.

## YAML Anchors and Aliases

YAML supports a DRY (Don't Repeat Yourself) mechanism using anchors (&) and aliases (*):

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

This is not available in JSON, making YAML more powerful for complex configuration files.

## Multi-line Strings

YAML offers two styles for multi-line strings:

\`\`\`yaml
# Literal block (|) - preserves newlines
description: |
  First line
  Second line
  Third line

# Folded block (>) - converts newlines to spaces
description: >
  This long sentence will
  be joined as one line.
\`\`\`

## JSON to YAML Conversion Rules

| JSON | YAML |
|---|---|
| \`{}\` object | Key-value pairs with indentation |
| \`[]\` array | Items prefixed with - |
| \`"string"\` | Unquoted (or quoted if needed) |
| \`123\` number | 123 |
| \`true\`/\`false\` | true/false |
| \`null\` | null or ~ |

→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('css-unit-converter-guide', `## The CSS Unit Landscape

CSS offers more than a dozen unit types, each suited to different contexts. Understanding when to use each unit is fundamental to building responsive, accessible, and maintainable stylesheets.

Units fall into two categories:
- **Absolute units** — Fixed size regardless of context (px, pt, cm, mm, in)
- **Relative units** — Size relative to something else (rem, em, %, vw, vh, ch, ex)

## Pixels (px): The Foundation

A CSS pixel (\`1px\`) was originally intended to represent one physical pixel on a screen. On modern high-DPI (Retina) displays, this is no longer true — a CSS pixel on a 2x display renders as 2 physical pixels. The CSS pixel is now defined as approximately 1/96 of an inch at arm's length.

**When to use px:**
- Borders (\`border: 1px solid\`)
- Box shadows
- Specific fixed-size elements (icons, logos with exact dimensions)
- When you explicitly don't want the size to scale with user preferences

## rem: The Accessibility Unit

\`rem\` (root em) is relative to the font size of the \`<html>\` element. The browser's default root font size is 16px. Unless the user or a stylesheet changes this, \`1rem = 16px\`.

\`\`\`css
html { font-size: 16px; } /* default */

h1 { font-size: 2rem; }   /* 32px */
p  { font-size: 1rem; }   /* 16px */
.small { font-size: 0.75rem; } /* 12px */
\`\`\`

**The accessibility advantage:** Users can set their preferred base font size in browser settings. Elements sized in \`rem\` respect this preference; elements sized in \`px\` do not. For accessibility compliance (WCAG), use \`rem\` for font sizes.

**The 62.5% trick:**
Many developers set \`html { font-size: 62.5%; }\` which makes \`1rem = 10px\`, easier for mental math:

\`\`\`css
html { font-size: 62.5%; }  /* 1rem = 10px */
body { font-size: 1.6rem; } /* 16px */
h1   { font-size: 3.2rem; } /* 32px */
\`\`\`

## em: The Contextual Unit

\`em\` is relative to the font size of the **current element** (not the root). This can cascade in unexpected ways:

\`\`\`css
.parent { font-size: 20px; }
.child  { font-size: 0.75em; }  /* 15px (0.75 × 20) */
.grandchild { font-size: 0.75em; } /* 11.25px (0.75 × 15) */
\`\`\`

**When em is useful:** Spacing (padding, margin) that should scale proportionally with the element's own text size:

\`\`\`css
button {
  font-size: 1rem;
  padding: 0.5em 1em; /* Scales with button's font size */
}
\`\`\`

**Prefer rem over em** for font sizes to avoid cascading complexity.

## Viewport Units: vw, vh, vmin, vmax

Viewport units are relative to the browser window size:

| Unit | Definition |
|---|---|
| \`1vw\` | 1% of viewport width |
| \`1vh\` | 1% of viewport height |
| \`1vmin\` | 1% of the smaller dimension |
| \`1vmax\` | 1% of the larger dimension |
| \`1svh\` | 1% of small viewport height (mobile) |
| \`1dvh\` | 1% of dynamic viewport height |

**Common uses:**
\`\`\`css
.hero { height: 100vh; }           /* Full-screen hero section */
.fluid-text { font-size: 4vw; }    /* Text scales with window */
.max-width { max-width: 90vw; }    /* 90% of viewport width */
\`\`\`

**The mobile 100vh problem:** On mobile browsers, \`100vh\` includes the browser chrome (address bar). Use \`100svh\` (small viewport height) for content that should fit without scrolling on mobile.

## Percentage (%): Parent-Relative

Percentage values are relative to the parent element's corresponding property:

\`\`\`css
.container { width: 800px; }
.child { width: 50%; }  /* 400px */
\`\`\`

For \`padding\` and \`margin\`, percentage values are relative to the **parent's width** (even for vertical padding/margin):

\`\`\`css
.aspect-ratio-box {
  padding-top: 56.25%; /* Creates 16:9 aspect ratio */
}
\`\`\`

## ch: Character-Based Width

\`1ch\` equals the width of the "0" character in the current font. Useful for sizing elements based on character count:

\`\`\`css
input { width: 20ch; }     /* Fits ~20 characters */
p { max-width: 65ch; }     /* Optimal reading line length */
\`\`\`

The optimal reading line length for body text is 45–75 characters (about 65ch in most fonts).

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
px to rem: rem = px ÷ root-font-size
rem to px: px = rem × root-font-size

px to vw:  vw  = (px ÷ viewport-width) × 100
px to em:  em  = px ÷ current-element-font-size
\`\`\`

## Using This Tool

Enter a value, select the source unit and target unit, and optionally specify the root font size (default 16px) and viewport width (default 1440px). The tool instantly converts between all CSS units.

→ Try the [CSS Unit Converter](/css-unit-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('color-converter-hex-rgb-hsl', `## Why Color Formats Matter

Web developers work with color in multiple formats depending on the context: hex codes from design tools like Figma, RGB values in CSS, HSL for programmatic color manipulation, and HSB (HSV) in image editors like Photoshop. Understanding these formats and knowing how to convert between them is essential for modern front-end development.

## HEX: The Design Standard

Hexadecimal color codes represent RGB values in base-16:

\`\`\`
#RRGGBB
#FF5733   → R=255, G=87, B=51
\`\`\`

Each channel (R, G, B) uses 2 hex digits (0–F, 0–255). Short hex (\`#RGB\`) expands to \`#RRGGBB\`:
- \`#F00\` → \`#FF0000\` (pure red)
- \`#FFF\` → \`#FFFFFF\` (white)

**With alpha (transparency):**
\`#RRGGBBAA\` — e.g., \`#FF573380\` is 50% transparent orange.

**Hex is best for:**
- Design handoffs (Figma, Sketch output hex)
- CSS/HTML color values
- Version control (compact, diff-friendly)

## RGB: The Screen Model

RGB (Red, Green, Blue) directly maps to how screens create colors by mixing light:

\`\`\`css
color: rgb(255, 87, 51);
color: rgba(255, 87, 51, 0.5); /* 50% transparent */
\`\`\`

Each channel ranges from 0–255. All zeros = black; all 255s = white.

**Modern CSS notation:**
\`\`\`css
color: rgb(255 87 51);           /* Space-separated (CSS Color Level 4) */
color: rgb(255 87 51 / 50%);    /* With alpha */
\`\`\`

**RGB is best for:**
- CSS color mixing and manipulation
- Canvas API drawing operations
- Programmatic color generation (gradients, charts)

## HSL: The Intuitive Model

HSL (Hue, Saturation, Lightness) maps more closely to how humans think about color:

\`\`\`css
color: hsl(11, 100%, 60%);  /* Orange */
color: hsla(11, 100%, 60%, 0.5); /* 50% transparent */
\`\`\`

- **Hue** (0–360°): Position on the color wheel — 0° red, 120° green, 240° blue
- **Saturation** (0–100%): Gray (0%) to vivid (100%)
- **Lightness** (0–100%): Black (0%) through color (50%) to white (100%)

**HSL is best for:**
- Programmatic color manipulation (darken/lighten by adjusting L)
- Creating color palettes (same H, vary S and L)
- CSS animations (smooth transitions through colors)

\`\`\`css
/* Create a button hover by adjusting lightness */
.button { background: hsl(220, 90%, 55%); }
.button:hover { background: hsl(220, 90%, 45%); }
\`\`\`

## HSB/HSV: The Photoshop Model

HSB (Hue, Saturation, Brightness) — also called HSV (Value) — is used by Adobe software and many color pickers:

- **Hue** (0–360°): Same as HSL
- **Saturation** (0–100%): White (0%) to pure color (100%)
- **Brightness/Value** (0–100%): Black (0%) to full color (100%)

HSB and HSL look similar but behave differently:
- HSL white = 0% saturation + 100% lightness
- HSB white = 0% saturation + 100% brightness

Neither format is supported natively in CSS — you need to convert to RGB or HSL first.

## OKLCH: The Modern Perceptual Model

CSS Color Level 4 introduced OKLCH (Lightness, Chroma, Hue in the OKLab color space):

\`\`\`css
color: oklch(60% 0.2 30);  /* Lightness, Chroma, Hue */
\`\`\`

OKLCH is perceptually uniform — equal numeric changes produce equal perceived color differences. This makes it ideal for:
- Accessible color palettes
- Color interpolation in gradients
- Theme color systems

## Conversion Formulas

**HEX to RGB:**
\`\`\`
R = parseInt(hex[1..2], 16)
G = parseInt(hex[3..4], 16)
B = parseInt(hex[5..6], 16)
\`\`\`

**RGB to HSL:**
\`\`\`
r' = r/255, g' = g/255, b' = b/255
max = max(r', g', b'), min = min(r', g', b')
L = (max + min) / 2
S = (max == min) ? 0 : (max - min) / (1 - |2L - 1|)
H = 60° × (segment based on which channel is max)
\`\`\`

## Contrast and Accessibility

Color contrast is crucial for accessibility (WCAG 2.1). The contrast ratio between text and background must be:
- **4.5:1** for normal text (Level AA)
- **3:1** for large text (Level AA)
- **7:1** for enhanced accessibility (Level AAA)

Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 and L2 are relative luminance values.

→ Try the [Color Converter](/color-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('markdown-to-html-guide', `## What Is Markdown?

**Markdown** is a lightweight markup language created by John Gruber in 2004. Its core philosophy is that formatting should be readable in source form — you should be able to read a Markdown document as plain text and still understand its structure.

Markdown has become the default format for developer documentation (GitHub README files, Confluence, GitLab), static site generators (Jekyll, Hugo, Eleventy), note-taking apps (Obsidian, Notion), and API documentation.

## Core Markdown Syntax

### Headings
\`\`\`markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
\`\`\`

### Text Formatting
\`\`\`markdown
**Bold text** or __also bold__
*Italic text* or _also italic_
***Bold and italic***
~~Strikethrough~~
\`\`\`

### Lists
\`\`\`markdown
Unordered:
- Item one
- Item two
  - Nested item (2 spaces indent)

Ordered:
1. First item
2. Second item
3. Third item
\`\`\`

### Links and Images
\`\`\`markdown
[Link text](https://example.com)
[Link with title](https://example.com "Tooltip text")

![Alt text](image.png)
![Alt text](image.png "Image title")
\`\`\`

### Code
\`\`\`markdown
Inline: \`const x = 5;\`

Block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`

### Tables
\`\`\`markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Left     | Center   | Right    |

# Column alignment:
| Left | Center | Right |
|:-----|:------:|------:|
\`\`\`

### Blockquotes
\`\`\`markdown
> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.
\`\`\`

### Horizontal Rules
\`\`\`markdown
---
***
___
\`\`\`

## How Markdown Converts to HTML

The Markdown to HTML conversion is straightforward:

| Markdown | HTML |
|---|---|
| \`# Title\` | \`<h1>Title</h1>\` |
| \`**bold**\` | \`<strong>bold</strong>\` |
| \`*italic*\` | \`<em>italic</em>\` |
| \`[text](url)\` | \`<a href="url">text</a>\` |
| \\\`\\\`\\\`code\\\`\\\`\\\` | \`<code>code</code>\` |
| \`\\n\\n\` | \`<p>...</p>\` |
| \`- item\` | \`<ul><li>item</li></ul>\` |

## Markdown Flavors

The original Markdown spec has gaps and ambiguities. Several extended specifications fill these gaps:

| Flavor | Used By | Extensions |
|---|---|---|
| **CommonMark** | Most parsers | Standardized core |
| **GitHub Flavored Markdown (GFM)** | GitHub | Tables, task lists, strikethrough |
| **MultiMarkdown** | Academic | Footnotes, citations |
| **Pandoc** | Document conversion | LaTeX math, custom attributes |

GitHub Flavored Markdown (GFM) adds:
- Task lists: \`- [x] Done\`, \`- [ ] Todo\`
- Autolinks: bare URLs become clickable
- Strikethrough: \`~~text~~\`
- Tables with alignment

## XSS Safety Considerations

When converting user-provided Markdown to HTML, always sanitize the output. Markdown allows raw HTML by default, meaning:

\`\`\`markdown
<script>alert('xss')</script>
\`\`\`

...would become a working script tag. Use a sanitizer like DOMPurify (browser) or sanitize-html (Node.js) to remove dangerous tags.

## Popular Markdown Libraries

| Library | Language | Notes |
|---|---|---|
| marked | JavaScript | Fast, widely used |
| remark | JavaScript | Unified ecosystem, plugins |
| markdown-it | JavaScript | Extensible, CommonMark |
| Python-Markdown | Python | Official Python impl |
| Goldmark | Go | Default for Hugo |
| pulldown-cmark | Rust | Fast, CommonMark |

## This Tool

Paste any Markdown text to see the rendered HTML output in real time. The tool shows both the rendered preview and the raw HTML source, making it useful for:
- Writing README files and checking rendering
- Learning Markdown syntax
- Converting Markdown content for use in systems that don't support Markdown natively
- Debugging Markdown rendering differences between flavors

→ Try the [Markdown to HTML Converter](/markdown-to-html)`);

// ─────────────────────────────────────────────────────────────

newContents.set('unix-timestamp-guide', `## What Is a Unix Timestamp?

A **Unix timestamp** (also called POSIX time or epoch time) is the number of seconds that have elapsed since **January 1, 1970, 00:00:00 UTC** — the "Unix epoch." It's a simple, universal, and timezone-independent way to represent a specific point in time.

\`\`\`
Current time (example):  2025-06-15 14:30:00 UTC
Unix timestamp:          1750000200
\`\`\`

The Unix timestamp is an integer — no timezone, no locale, no calendar system. It's the same number everywhere in the world at any given moment.

## Why Unix Time?

- **Timezone-agnostic:** The timestamp doesn't change depending on where you are. Converting to local time is a display concern.
- **Simple arithmetic:** Comparing times, calculating durations, and sorting records are all just integer operations.
- **Universal support:** Every programming language, database, and operating system understands Unix timestamps.
- **Compact storage:** A 32-bit integer (or 64-bit for post-2038 dates) stores any date/time efficiently.

## The Year 2038 Problem

32-bit signed integers can store values up to 2,147,483,647, which corresponds to **January 19, 2038, 03:14:07 UTC**. After this moment, 32-bit timestamps overflow to negative values, causing incorrect dates on systems that haven't migrated to 64-bit.

Modern 64-bit timestamps extend the range to approximately the year 292,277,026,596 — safely beyond any practical concern.

## Unix Time vs. Human-Readable Time

| Format | Example | Storage | Timezone |
|---|---|---|---|
| Unix timestamp | 1750000200 | Integer | Always UTC |
| ISO 8601 | 2025-06-15T14:30:00Z | String | UTC |
| RFC 2822 | Mon, 15 Jun 2025 14:30:00 +0000 | String | Specified |
| Local time | Jun 15, 2025 10:30 AM EDT | String | Local |

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
SELECT EXTRACT(EPOCH FROM NOW())::INTEGER;       -- Current timestamp
SELECT TO_TIMESTAMP(1750000200);                  -- Timestamp to datetime
SELECT EXTRACT(EPOCH FROM '2025-06-15'::DATE);   -- Date to timestamp
\`\`\`

## Unix Timestamps in Logs and APIs

Many systems log events as Unix timestamps:
- **Nginx/Apache logs:** \`[15/Jun/2025:14:30:00 +0000]\` (but timestamp files use epoch)
- **JWT \`exp\` claim:** \`{ "exp": 1750000200 }\`
- **AWS API responses:** \`{ "LastModified": 1750000200 }\`
- **Database columns:** \`created_at INTEGER DEFAULT (unixepoch())\`

When debugging, being able to quickly convert a timestamp to a human-readable date is essential.

## Milliseconds vs. Seconds

Different systems use different resolutions:
- **JavaScript \`Date.now()\`:** Milliseconds
- **Python \`time.time()\`:** Seconds (float)
- **Unix \`time\` command:** Seconds
- **Most databases:** Seconds
- **Java \`System.currentTimeMillis()\`:** Milliseconds

A common bug: using milliseconds where seconds are expected (or vice versa), producing dates in 1970 or 55,000 years in the future.

## How to Use This Tool

- **Timestamp → Date:** Enter a Unix timestamp (seconds or milliseconds) to see the corresponding UTC and local date/time.
- **Date → Timestamp:** Enter a date and time to get the Unix timestamp.
- **Current time:** Click "Now" to get the current timestamp instantly.

Supports both second-precision and millisecond-precision timestamps.

→ Try the [Unix Timestamp Converter](/unix-timestamp)`);

// ─────────────────────────────────────────────────────────────

newContents.set('date-time-converter-guide', `## Why Date and Time Conversion Is Complex

Working with dates and times is famously tricky in software development. The complexity stems from multiple overlapping systems: timezones, daylight saving time transitions, calendar reforms, leap years, and a proliferation of date formats across different cultures and systems.

A date/time converter bridges these systems, allowing developers, data analysts, and users to translate timestamps between formats, timezones, and representations.

## Major Date and Time Formats

### ISO 8601: The International Standard
\`\`\`
2025-06-15T14:30:00Z          (UTC)
2025-06-15T14:30:00+05:30     (IST, UTC+5:30)
2025-06-15                     (Date only)
14:30:00                       (Time only)
2025-W24-7                     (Week date: week 24, Sunday)
\`\`\`

ISO 8601 is the recommended format for data exchange. It sorts lexicographically in chronological order, which makes it database-friendly.

### RFC 2822 (Email/HTTP)
\`\`\`
Mon, 15 Jun 2025 14:30:00 +0000
\`\`\`

Used in HTTP headers (\`Last-Modified\`, \`Date\`), email headers, and RSS feeds.

### Unix Timestamp
\`\`\`
1750000200        (seconds since Jan 1, 1970)
1750000200000     (milliseconds)
\`\`\`

Timezone-independent, arithmetic-friendly.

### Locale-Specific Formats
\`\`\`
US:    06/15/2025      (MM/DD/YYYY)
EU:    15/06/2025      (DD/MM/YYYY)
ISO:   2025-06-15      (YYYY-MM-DD)
\`\`\`

The ambiguity of \`01/02/2025\` is a major source of data errors — is it January 2nd (US) or February 1st (EU)?

## Timezone Fundamentals

### UTC: The Reference Point
**UTC** (Coordinated Universal Time) is the global time standard. All other timezones are expressed as UTC offsets.

### UTC Offsets
\`\`\`
UTC+0:00   London (winter)
UTC+5:30   India
UTC-5:00   New York (winter/EST)
UTC-8:00   Los Angeles (winter/PST)
\`\`\`

### IANA Timezone Database
UTC offsets are not sufficient — they don't account for daylight saving time (DST) transitions. The IANA timezone database (\`America/New_York\`, \`Europe/London\`) encodes the complete history of UTC offsets and DST transitions for each timezone.

\`\`\`javascript
// JavaScript Intl API
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: '2-digit',
  timeZoneName: 'short'
});
\`\`\`

## DST: The Developer's Nightmare

Daylight Saving Time transitions cause clocks to jump forward 1 hour in spring and back 1 hour in fall. This creates:
- **Ambiguous times:** 1:30 AM can occur twice in fall (before and after DST end)
- **Non-existent times:** 2:30 AM doesn't exist in spring (clocks jump from 2:00 to 3:00)
- **Variable day length:** DST transition days are 23 or 25 hours long

**Best practices:**
- Store all times in UTC in your database
- Convert to local time only for display
- Never store or transmit times in local time for inter-system communication
- Use a timezone library (Luxon, date-fns-tz, Moment.js) rather than implementing DST logic yourself

## Date Arithmetic Pitfalls

### Adding Months
Adding 1 month to January 31 results in different answers depending on the library: February 28 (end of month) or an error (invalid date).

### Leap Years
Years divisible by 4 are leap years, except centuries (divisible by 100), except quad-centuries (divisible by 400). 2000 was a leap year; 1900 was not; 2100 will not be.

### Day Counts
"How many days until the event?" seems simple but involves counting correctly across DST transitions.

## Calendar Systems

The Gregorian calendar (used internationally) has historical complexities:
- The Julian calendar was used until the Gregorian reform in 1582
- Different countries switched to Gregorian at different times (Russia in 1918)
- The Orthodox church still uses the Julian calendar

Historical date conversion requires knowing which calendar was in use at the time.

## Date Formatting in Code

\`\`\`javascript
// JavaScript (Intl API — preferred)
const date = new Date(1750000200 * 1000);

new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
// "Sunday, June 15, 2025"

new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date);
// "15. Juni 2025"

// date-fns library
import { format } from 'date-fns';
format(date, 'yyyy-MM-dd HH:mm:ss');  // "2025-06-15 14:30:00"
\`\`\`

→ Try the [Date/Time Converter](/date-time-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('temperature-converter-guide', `## Temperature Scales: A Brief History

The three major temperature scales — Celsius, Fahrenheit, and Kelvin — were created at different times for different purposes. Understanding their origins helps explain their properties and relationships.

**Fahrenheit (°F)** was developed by German physicist Daniel Gabriel Fahrenheit in 1724. He set 0°F as the coldest temperature he could produce with an ice/salt mixture and 96°F as human body temperature (later adjusted to 98.6°F). Fahrenheit is still the primary scale in the United States for everyday use.

**Celsius (°C)**, originally "centigrade," was proposed by Swedish astronomer Anders Celsius in 1742. He set 0°C as the freezing point of water and 100°C as the boiling point (at sea level), creating a convenient 100-degree scale for scientific use. Now the standard in most of the world.

**Kelvin (K)** was defined by Lord Kelvin (William Thomson) in 1848. It starts at **absolute zero** — the theoretical temperature at which all thermal motion ceases. There are no negative Kelvin values. Kelvin is the SI base unit of temperature, essential for physics and chemistry.

## Conversion Formulas

### Celsius to Fahrenheit
\`\`\`
°F = (°C × 9/5) + 32
\`\`\`
Example: 100°C → (100 × 1.8) + 32 = **212°F**

### Fahrenheit to Celsius
\`\`\`
°C = (°F - 32) × 5/9
\`\`\`
Example: 98.6°F → (98.6 - 32) × 5/9 = **37°C**

### Celsius to Kelvin
\`\`\`
K = °C + 273.15
\`\`\`
Example: 0°C → **273.15 K**

### Kelvin to Celsius
\`\`\`
°C = K - 273.15
\`\`\`
Example: 373.15 K → **100°C**

### Fahrenheit to Kelvin
\`\`\`
K = (°F - 32) × 5/9 + 273.15
\`\`\`
Example: 32°F → (32 - 32) × 5/9 + 273.15 = **273.15 K**

## Quick Reference Table

| Celsius | Fahrenheit | Kelvin | Description |
|---|---|---|---|
| -273.15 | -459.67 | 0 | Absolute zero |
| -40 | -40 | 233.15 | Scales converge |
| 0 | 32 | 273.15 | Water freezes |
| 20 | 68 | 293.15 | Room temperature |
| 37 | 98.6 | 310.15 | Body temperature |
| 100 | 212 | 373.15 | Water boils |
| 1000 | 1832 | 1273.15 | Steel glows red |

## Rankine: The Forgotten Scale

**Rankine (°R)** is the Fahrenheit equivalent of Kelvin — an absolute scale where zero is absolute zero, but degrees are the same size as Fahrenheit degrees:

\`\`\`
°R = °F + 459.67
°R = K × 9/5
\`\`\`

Rankine is used in some American engineering applications.

## Temperature in Science and Engineering

### Absolute Zero and the Kelvin Scale
Absolute zero (0 K = -273.15°C) is the temperature at which a system has minimum thermodynamic energy. It's theoretically unachievable but scientists have cooled matter to within billionths of a degree above it.

### Gas Laws
The ideal gas law uses Kelvin because gas properties are proportional to absolute temperature:
\`\`\`
PV = nRT   (P = pressure, V = volume, n = moles, R = gas constant, T = Kelvin)
\`\`\`

### Everyday References
- **-40°** — The one temperature that's the same in °C and °F
- **0°C (32°F)** — Water freezes (at standard pressure)
- **20°C (68°F)** — Standard room temperature
- **37°C (98.6°F)** — Normal human body temperature
- **100°C (212°F)** — Water boils (at sea level; lower at altitude)
- **160°C (320°F)** — Safe internal temperature for poultry

## Temperature Sensing and Measurement

Modern temperature measurement uses several technologies:
- **Thermocouples** — Two dissimilar metals joined; measure voltage difference (wide range, industrial)
- **RTDs (Resistance Temperature Detectors)** — Resistance changes with temperature (accurate, scientific)
- **Thermistors** — Semiconductor devices; very sensitive in narrow ranges
- **IR Thermometers** — Measure emitted infrared radiation (contactless, medical)

## Climate Change Context

Global temperature anomaly is measured in Celsius (or Kelvin) relative to pre-industrial baseline. The Paris Agreement targets limiting warming to 1.5–2°C above pre-industrial levels — which translates to 2.7–3.6°F.

→ Try the [Temperature Converter](/temperature-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('case-converter-guide', `## What Is String Case?

**String case** refers to the capitalization style applied to words and letters in text. Different programming languages, frameworks, and naming conventions use specific case styles for identifiers, file names, database columns, CSS classes, and API responses.

Being able to quickly convert between case styles is essential when working across systems with different conventions.

## The Major Case Styles

### camelCase
Words joined without spaces; first word lowercase, subsequent words capitalized.
\`\`\`
camelCase
myVariableName
getUserById
\`\`\`
**Used in:** JavaScript variables/functions, Java methods, JSON keys, Swift properties.

### PascalCase (UpperCamelCase)
Like camelCase but the first word is also capitalized.
\`\`\`
PascalCase
MyClassName
UserProfileComponent
\`\`\`
**Used in:** Class names (most languages), TypeScript types, React components, C# identifiers, .NET namespaces.

### snake_case
Words separated by underscores, all lowercase.
\`\`\`
snake_case
my_variable_name
user_id
\`\`\`
**Used in:** Python variables/functions, Ruby, SQL column names, C variables, file names (Linux convention).

### SCREAMING_SNAKE_CASE (UPPER_SNAKE_CASE)
Like snake_case but all uppercase.
\`\`\`
SCREAMING_SNAKE_CASE
MAX_RETRY_COUNT
API_BASE_URL
\`\`\`
**Used in:** Constants in most languages, environment variables, C macros.

### kebab-case (dash-case)
Words separated by hyphens, all lowercase.
\`\`\`
kebab-case
my-css-class
my-component-name
\`\`\`
**Used in:** CSS class names, HTML attributes, URL slugs, file names (web convention), Vue component names.

### Title Case
Each word capitalized.
\`\`\`
Title Case
My Document Title
User Settings Page
\`\`\`
**Used in:** Page titles, headings, book titles, button labels.

### UPPER CASE
All letters capitalized, spaces preserved.
\`\`\`
UPPER CASE
ALL CAPS HEADING
\`\`\`
**Used in:** Acronyms, emphasis, some constants.

### lower case
All letters lowercase, spaces preserved.
\`\`\`
lower case
all lowercase
\`\`\`
**Used in:** URLs (domain names), some logging.

## Case Conventions by Language

| Language | Variables | Constants | Classes | Functions |
|---|---|---|---|---|
| JavaScript | camelCase | SCREAMING_SNAKE | PascalCase | camelCase |
| Python | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| Java | camelCase | SCREAMING_SNAKE | PascalCase | camelCase |
| C# | camelCase | PascalCase | PascalCase | PascalCase |
| Go | camelCase | camelCase | PascalCase | camelCase/PascalCase |
| Ruby | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| SQL | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| CSS | kebab-case | — | — | — |

## When Conversions Are Needed

### Cross-Language Data Exchange
An API might return \`user_first_name\` (snake_case) but your TypeScript code expects \`userFirstName\` (camelCase). Libraries like \`camelcase-keys\` handle this automatically.

### Database to Object Mapping
SQL columns use \`snake_case\` but ORM objects use \`camelCase\`. Most ORMs (Prisma, Sequelize, ActiveRecord) handle this mapping.

### Code Generation
When generating code from a schema or OpenAPI spec, you need to convert names to the target language's convention.

### Slugifying for URLs
Convert "My Blog Post Title" → "my-blog-post-title" for SEO-friendly URLs.

## Special Cases in Conversion

Converting between cases isn't always simple — edge cases include:
- **Acronyms:** Should "URL" become \`url\`, \`uRL\`, or \`URL\` in camelCase? (Different conventions exist)
- **Numbers:** Does \`address1\` become \`address-1\` or \`address1\` in kebab-case?
- **Multiple spaces/hyphens:** Input may contain inconsistent spacing or punctuation

## Code Examples

\`\`\`javascript
// Using 'change-case' npm package
import { camelCase, pascalCase, snakeCase, kebabCase } from 'change-case';

camelCase('foo bar')   // 'fooBar'
pascalCase('foo bar')  // 'FooBar'
snakeCase('fooBar')    // 'foo_bar'
kebabCase('fooBar')    // 'foo-bar'
\`\`\`

→ Try the [Case Converter](/case-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('roman-numeral-converter-guide', `## What Are Roman Numerals?

Roman numerals are a numeral system that originated in ancient Rome and were the dominant notation in Europe for centuries. They use Latin alphabet letters to represent values and combine them through addition and subtraction rules.

Despite being replaced by the Hindu-Arabic numeral system for everyday arithmetic, Roman numerals remain in common use today: clock faces, book chapter numbers, movie sequels, year designations, outlines, and Super Bowl numbers all use Roman numerals.

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

Roman numerals use a **subtractive notation** to avoid four identical symbols in a row:

| Roman | Value | Rule |
|---|---|---|
| IV | 4 | I before V = 5-1 |
| IX | 9 | I before X = 10-1 |
| XL | 40 | X before L = 50-10 |
| XC | 90 | X before C = 100-10 |
| CD | 400 | C before D = 500-100 |
| CM | 900 | C before M = 1000-100 |

Only these six subtractive combinations are standard. You would write 999 as CMXCIX, not IM (even though I < M).

## Roman Numeral Examples

| Arabic | Roman | Breakdown |
|---|---|---|
| 1 | I | 1 |
| 4 | IV | 5-1 |
| 9 | IX | 10-1 |
| 14 | XIV | 10+4 |
| 40 | XL | 50-10 |
| 49 | XLIX | 40+9 |
| 90 | XC | 100-10 |
| 399 | CCCXCIX | 300+90+9 |
| 1776 | MDCCLXXVI | 1000+700+70+6 |
| 2025 | MMXXV | 2000+20+5 |
| 3999 | MMMCMXCIX | 3000+900+90+9 |

## Conversion Algorithm

### Arabic to Roman:

\`\`\`javascript
function toRoman(num) {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}
toRoman(2025) // "MMXXV"
\`\`\`

### Roman to Arabic:

\`\`\`javascript
function fromRoman(str) {
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const curr = map[str[i]];
    const next = map[str[i+1]];
    if (next && curr < next) result -= curr;
    else result += curr;
  }
  return result;
}
fromRoman('MMXXV') // 2025
\`\`\`

## The Limits of Roman Numerals

The standard system covers 1–3,999. For numbers ≥ 4,000, historical texts used various extensions:
- **Vinculum (overline):** A bar over a symbol multiplies it by 1,000. V̄ = 5,000, M̄ = 1,000,000
- **Double vinculum:** Multiplies by 1,000,000
- **Parentheses:** Also used historically for large multipliers

These extensions are rarely needed today.

Zero has no Roman numeral — the concept of zero as a number wasn't part of ancient Roman mathematics.

## Roman Numerals in Modern Usage

**Clocks and watches:** Most analog clocks use Roman numerals, though controversially some use IIII instead of IV for the 4 (for visual balance and to mirror VIII on the other side).

**Outlines and lists:** Formal outlines use Roman numerals for top-level sections (I, II, III...) and Arabic numerals for sub-sections.

**Film and TV:** Sequel numbering (Star Wars Episode VII, Super Bowl LVIII). Copyright years in film credits are traditionally Roman.

**Royal and papal names:** King Charles III, Pope John Paul II.

**Architecture:** Year of construction on building cornerstones (MCMXCIX = 1999).

**Olympics:** Each edition is numbered (XXXIII Olympiad = Paris 2024).

→ Try the [Roman Numeral Converter](/roman-numeral-converter)`);

// ─────────────────────────────────────────────────────────────

newContents.set('integer-base-converter-guide', `## What Are Number Bases?

A **number base** (or radix) defines how many unique digits are available to represent numbers. Each position in a number represents a power of the base.

- **Base 10 (Decimal):** Digits 0–9. The everyday number system.
- **Base 2 (Binary):** Digits 0–1. The language of computers.
- **Base 16 (Hexadecimal):** Digits 0–9, A–F. Compact binary representation.
- **Base 8 (Octal):** Digits 0–7. Used in Unix file permissions.

The same value — 255 — is written differently in each base:
\`\`\`
Decimal:     255
Binary:      11111111
Hexadecimal: FF
Octal:       377
\`\`\`

## Why Different Bases?

### Binary (Base 2): The Hardware Reality
Digital circuits are fundamentally binary — a transistor is either on (1) or off (0). All computer data — integers, floats, text, images — is ultimately binary at the hardware level.

### Hexadecimal (Base 16): Compact Binary
Binary is verbose. 255 requires 8 binary digits but only 2 hex digits. Since 1 hex digit = exactly 4 binary bits (a "nibble"), hex is a convenient shorthand for binary:
\`\`\`
Binary:  1111 0100 1011 0101
Hex:     F    4    B    5     = F4B5
\`\`\`

Hexadecimal is ubiquitous in:
- Memory addresses (\`0x7FFE42A3\`)
- Color codes (\`#FF5733\`)
- SHA-256 hashes (\`2cf24dba...\`)
- IPv6 addresses (\`2001:0db8:...\`)
- Assembly language
- Byte representations in debugging

### Octal (Base 8): Unix Legacy
Unix file permissions use octal notation because each octal digit represents exactly 3 bits (one set of rwx permissions):
\`\`\`
chmod 755 → rwxr-xr-x
7 = 111 = rwx (owner)
5 = 101 = r-x (group)
5 = 101 = r-x (others)
\`\`\`

## Conversion Process

### Decimal to Binary
Repeatedly divide by 2, collect remainders (read bottom-to-top):
\`\`\`
42 ÷ 2 = 21 r 0
21 ÷ 2 = 10 r 1
10 ÷ 2 =  5 r 0
 5 ÷ 2 =  2 r 1
 2 ÷ 2 =  1 r 0
 1 ÷ 2 =  0 r 1
42 decimal = 101010 binary
\`\`\`

### Binary to Decimal
Multiply each bit by its positional value (powers of 2):
\`\`\`
101010 = 1×32 + 0×16 + 1×8 + 0×4 + 1×2 + 0×1
       = 32 + 8 + 2 = 42
\`\`\`

### Hexadecimal to Decimal
Multiply each digit by its positional value (powers of 16):
\`\`\`
2A hex = 2×16 + 10×1 = 32 + 10 = 42
\`\`\`

### Binary to Hex
Group bits in sets of 4 from right:
\`\`\`
101010 → 0010 1010 → 2A
\`\`\`

## Integer Representations in Code

\`\`\`javascript
// JavaScript
(255).toString(2)   // "11111111" (binary)
(255).toString(8)   // "377" (octal)
(255).toString(16)  // "ff" (hex)

parseInt("FF", 16)  // 255
parseInt("377", 8)  // 255
parseInt("11111111", 2) // 255

// Literals
0b11111111   // Binary literal (255)
0377         // Octal literal (255) — old style
0o377        // Octal literal (255) — ES6
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

Signed integers use one bit to indicate sign. In **two's complement** (the universal standard):

- The most significant bit (MSB) is the sign bit: 0 = positive, 1 = negative
- Negate: flip all bits and add 1

\`\`\`
+42 in 8-bit: 00101010
-42 in 8-bit: 11010110 (flip bits of 42, then +1)
\`\`\`

This is why an 8-bit signed integer ranges from -128 to 127 (not -127 to 127).

## Floating Point: A Different World

Integer bases don't apply directly to floating-point numbers. IEEE 754 (the float/double standard) stores numbers in a binary scientific notation:

\`\`\`
value = sign × mantissa × 2^exponent
\`\`\`

This is why 0.1 + 0.2 ≠ 0.3 in most languages — 0.1 and 0.2 don't have exact binary representations.

→ Try the [Integer Base Converter](/integer-base-converter)\`);

// ─── Now apply all changes ───────────────────────────────────

const filePath = 'src/pages/articles/articles.data.ts';
let fileContent = readFileSync(filePath, 'utf-8');

let updatedCount = 0;
let notFoundCount = 0;

for (const [slug, newContent] of newContents) {
  const escaped = escapeForTS(newContent);
  const safeSlug = slug.replace(/-/g, '\\-');
  const BT = '`';
  const patternStr = "(slug:\\s*'" + safeSlug + "'[\\s\\S]*?content:\\s*" + BT + ")([\\s\\S]*?)(" + BT + "\\s*,?\\s*\\})";
  const pattern = new RegExp(patternStr, '');
  const before = fileContent;
  fileContent = fileContent.replace(pattern, '$1' + escaped + '$3');
  if (fileContent !== before) {
    updatedCount++;
    console.log('✅ Updated: ' + slug);
  } else {
    notFoundCount++;
    console.log('❌ Not found: ' + slug);
  }
}

writeFileSync(filePath, fileContent, 'utf-8');
console.log('\nDone: ' + updatedCount + ' updated, ' + notFoundCount + ' not found');
