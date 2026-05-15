#!/usr/bin/env python3
"""
Expand all articles in articles.data.ts with full 800-1500 word content.
Uses Python string replacement to avoid JS template literal conflicts.
"""
import re
import sys

ARTICLES_FILE = 'src/pages/articles/articles.data.ts'

def escape_for_ts(content):
    """Escape content for use inside TypeScript template literals."""
    content = content.replace('\\', '\\\\')
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')
    return content

def update_article(file_content, slug, new_content):
    """Replace the content of an article with the given slug."""
    escaped = escape_for_ts(new_content)
    # Pattern: find the slug, then find content: `...`
    pattern = r"(slug:\s*'" + re.escape(slug) + r"'[\s\S]*?content:\s*`)([\s\S]*?)(`\s*,?\s*\})"
    replacement = r'\g<1>' + escaped.replace('\\', '\\\\').replace('\1', '\\1') + r'\g<3>'
    
    # Use a function-based replacement to avoid backreference issues
    def replacer(m):
        return m.group(1) + escaped + m.group(3)
    
    new_content_str, count = re.subn(pattern, replacer, file_content, count=1)
    return new_content_str, count > 0

# ─── Article Contents ──────────────────────────────────────────────────────

articles = {}

# Already handled by part1: what-is-token-generator, how-to-hash-text-online, 
# bcrypt-password-hashing-guide, uuid-vs-ulid-which-to-use, jwt-parser-explained,
# password-strength-guide, rsa-key-pair-explained, hmac-generator-guide,
# encryption-tool-guide, otp-authenticator-guide, bip39-mnemonic-guide

# Converter articles
articles['base64-encoding-explained'] = """## What Is Base64 Encoding?

Base64 is a binary-to-text encoding scheme that represents binary data using a set of 64 printable ASCII characters. The name "Base64" comes from the radix-64 representation. The 64 characters used are: A-Z (26), a-z (26), 0-9 (10), + and / (2), with = used as padding.

Base64 was designed to safely transmit binary data over channels designed to handle text, such as email (SMTP) or embedding binary content in XML or JSON.

## How Base64 Encoding Works

Base64 takes 3 bytes (24 bits) of input at a time and produces 4 characters of output. Each output character represents 6 bits of input data.

```
Input bytes:    01001101  01100001  01101110
Group into 6:   010011  010110  000101  101110
Base64 index:   19      22      5       46
Base64 chars:   T       W       F       u
```

The encoding increases size by approximately 33% (every 3 bytes becomes 4 characters). If the input isn't divisible by 3, `=` padding is added.

## Base64 Encoding Examples

```
Input:    "Hello"
Base64:   SGVsbG8=

Input:    "Man"
Base64:   TWFu

Input:    "Ma"  (needs padding)
Base64:   TWE=
```

## Common Uses of Base64

### HTTP Basic Authentication
HTTP Basic Auth encodes credentials as `username:password` in Base64:
```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```
This encoding is trivially reversible and provides no security without HTTPS.

### Data URIs
Embed images directly in HTML without separate HTTP requests:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
```

### JWT Tokens
JSON Web Tokens encode their header and payload as Base64URL (a URL-safe variant of Base64).

### Email Attachments (MIME)
MIME encoding uses Base64 to attach binary files (images, PDFs, executables) to email messages.

### SSH Public Keys
SSH public keys are stored and transmitted in Base64 format.

## Base64 vs Base64URL

Standard Base64 uses `+` and `/` which are special characters in URLs. **Base64URL** replaces these:
- `+` becomes `-`
- `/` becomes `_`
- `=` padding is removed

Use Base64URL whenever the encoded string will appear in URLs, filenames, or HTTP headers.

## Base64 Is NOT Encryption

This is the most common misconception. Base64 is trivially reversible without any key:

```javascript
atob('SGVsbG8=') // "Hello"
```

Anyone who sees Base64-encoded data can immediately decode it. Never use Base64 to hide passwords, API keys, or sensitive information.

## Size Overhead

Base64 encoding increases data size by approximately 33%:
- 100 bytes becomes approximately 136 Base64 characters
- 1 MB image becomes approximately 1.37 MB Base64 string

## Decoding Base64 in Code

```javascript
// Browser
const decoded = atob('SGVsbG8=');  // "Hello"
const encoded = btoa('Hello');     // "SGVsbG8="

// Node.js
Buffer.from('SGVsbG8=', 'base64').toString('utf8')  // "Hello"
Buffer.from('Hello').toString('base64')              // "SGVsbG8="
```

```python
import base64
base64.b64decode('SGVsbG8=').decode()   # "Hello"
base64.b64encode(b'Hello').decode()     # "SGVsbG8="
```

## When to Use Base64

Use Base64 when embedding binary data in text formats (HTML, CSS, JSON, XML), transmitting binary over text protocols, or encoding binary data that must survive text transformations.

Do not use Base64 when you need security (it provides none), when size efficiency matters (it adds 33% overhead), or when the data is already text.

-> Try the [Base64 String Converter](/base64-string-converter)"""

articles['json-to-yaml-complete-guide'] = """## Why Convert Between JSON and YAML?

JSON (JavaScript Object Notation) and YAML (YAML Ain't Markup Language) represent the same types of data structures but with very different syntax philosophies. Knowing when and how to convert between them is essential for modern development workflows.

## JSON: The API Standard

JSON was designed for machine-to-machine communication. Its syntax is strict, unambiguous, and directly maps to JavaScript objects.

```json
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
```

JSON strengths include universal support in every programming language, strict syntax that leaves no ambiguity, direct parseability in JavaScript, and compact size when minified.

JSON weaknesses include no support for comments (a significant limitation for configuration files) and more verbose syntax with quotes around all keys.

## YAML: The Configuration Standard

YAML uses indentation and minimal punctuation to represent the same structures. It is the dominant format for configuration files in DevOps (Docker Compose, Kubernetes, GitHub Actions, Ansible).

```yaml
name: John Doe
age: 30
active: true
address:
  city: New York
  country: US
hobbies:
  - reading
  - coding
```

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
```yaml
port: 8080       # Integer, not string!
enabled: yes     # Boolean true, not string!
version: 1.0     # Float!
zip: 01234       # Integer (drops leading zero)!
```

To force strings, quote them: `port: "8080"`, `zip: "01234"`.

### Norway Problem
In YAML 1.1, country codes NO, ON, OFF, YES, NO are parsed as booleans. YAML 1.2 fixed this.

### Tabs Are Illegal
YAML strictly requires spaces for indentation. Tabs cause parse errors.

## YAML Anchors and Aliases

YAML supports a DRY principle using anchors (&) and aliases (*):

```yaml
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
```

## Multi-line Strings in YAML

```yaml
# Literal block (|) - preserves newlines
description: |
  First line
  Second line

# Folded block (>) - converts newlines to spaces  
description: >
  This long sentence will
  be joined as one line.
```

## JSON to YAML Conversion Rules

| JSON | YAML |
|---|---|
| {} object | Key-value pairs with indentation |
| [] array | Items prefixed with - |
| "string" | Unquoted (or quoted if needed) |
| 123 number | 123 |
| true/false | true/false |
| null | null or ~ |

-> Try the [JSON to YAML Converter](/json-to-yaml-converter)"""

articles['css-unit-converter-guide'] = """## The CSS Unit Landscape

CSS offers more than a dozen unit types, each suited to different contexts. Understanding when to use each unit is fundamental to building responsive, accessible, and maintainable stylesheets.

Units fall into two categories: **Absolute units** which have a fixed size regardless of context (px, pt, cm, mm, in), and **Relative units** which have a size relative to something else (rem, em, %, vw, vh, ch, ex).

## Pixels (px): The Foundation

A CSS pixel (`1px`) was originally intended to represent one physical pixel on a screen. On modern high-DPI (Retina) displays, this is no longer true. The CSS pixel is now defined as approximately 1/96 of an inch at arm's length.

Use px for borders, box shadows, specific fixed-size elements like icons, and when you explicitly do not want the size to scale with user preferences.

## rem: The Accessibility Unit

`rem` (root em) is relative to the font size of the `html` element. The browser's default root font size is 16px, meaning `1rem = 16px` unless changed.

```css
html { font-size: 16px; } /* default */

h1 { font-size: 2rem; }        /* 32px */
p  { font-size: 1rem; }        /* 16px */
.small { font-size: 0.75rem; } /* 12px */
```

The accessibility advantage is that users can set their preferred base font size in browser settings. Elements sized in `rem` respect this preference; elements sized in `px` do not. For accessibility compliance (WCAG), use `rem` for font sizes.

## em: The Contextual Unit

`em` is relative to the font size of the current element. This can cascade in unexpected ways:

```css
.parent { font-size: 20px; }
.child  { font-size: 0.75em; }      /* 15px (0.75 x 20) */
.grandchild { font-size: 0.75em; }  /* 11.25px (0.75 x 15) */
```

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
```css
.hero { height: 100vh; }           /* Full-screen hero section */
.fluid-text { font-size: 4vw; }    /* Text scales with window */
.max-width { max-width: 90vw; }    /* 90% of viewport width */
```

On mobile browsers, `100vh` includes the browser chrome. Use `100svh` for content that should fit without scrolling on mobile.

## Percentage (%): Parent-Relative

Percentage values are relative to the parent element:
```css
.container { width: 800px; }
.child { width: 50%; }  /* 400px */
```

For padding and margin, percentage values are relative to the parent's width (even for vertical padding/margin):
```css
.aspect-ratio-box {
  padding-top: 56.25%; /* Creates 16:9 aspect ratio */
}
```

## ch: Character-Based Width

`1ch` equals the width of the "0" character in the current font:
```css
input { width: 20ch; }    /* Fits ~20 characters */
p { max-width: 65ch; }    /* Optimal reading line length */
```

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

```
px to rem: rem = px / root-font-size
rem to px: px = rem * root-font-size

px to vw:  vw  = (px / viewport-width) * 100
px to em:  em  = px / current-element-font-size
```

-> Try the [CSS Unit Converter](/css-unit-converter)"""

articles['color-converter-hex-rgb-hsl'] = """## Why Color Formats Matter

Web developers work with color in multiple formats depending on the context: hex codes from design tools like Figma, RGB values in CSS, HSL for programmatic color manipulation, and HSB (HSV) in image editors like Photoshop. Understanding these formats and how to convert between them is essential for modern front-end development.

## HEX: The Design Standard

Hexadecimal color codes represent RGB values in base-16:

```
#RRGGBB
#FF5733   -> R=255, G=87, B=51
```

Each channel (R, G, B) uses 2 hex digits (0-F, representing 0-255). Short hex (#RGB) expands to #RRGGBB:
- `#F00` -> `#FF0000` (pure red)
- `#FFF` -> `#FFFFFF` (white)

With alpha transparency: `#RRGGBBAA` - for example, `#FF573380` is 50% transparent orange.

Hex is best for design handoffs (Figma, Sketch output hex), CSS/HTML color values, and version control (compact, diff-friendly).

## RGB: The Screen Model

RGB (Red, Green, Blue) directly maps to how screens create colors by mixing light:

```css
color: rgb(255, 87, 51);
color: rgba(255, 87, 51, 0.5); /* 50% transparent */
```

Each channel ranges from 0-255. All zeros equals black; all 255s equals white.

Modern CSS notation uses space-separated values:
```css
color: rgb(255 87 51);           /* CSS Color Level 4 */
color: rgb(255 87 51 / 50%);    /* With alpha */
```

RGB is best for CSS color mixing, Canvas API drawing operations, and programmatic color generation.

## HSL: The Intuitive Model

HSL (Hue, Saturation, Lightness) maps more closely to how humans think about color:

```css
color: hsl(11, 100%, 60%);  /* Orange */
color: hsla(11, 100%, 60%, 0.5); /* 50% transparent */
```

- **Hue** (0-360 degrees): Position on the color wheel. 0 degrees is red, 120 degrees is green, 240 degrees is blue.
- **Saturation** (0-100%): Gray (0%) to vivid (100%)
- **Lightness** (0-100%): Black (0%) through color (50%) to white (100%)

HSL is ideal for programmatic color manipulation because you can darken or lighten by adjusting the L value, and create color palettes by keeping the same H while varying S and L.

```css
/* Create a button hover by adjusting lightness */
.button { background: hsl(220, 90%, 55%); }
.button:hover { background: hsl(220, 90%, 45%); }
```

## HSB/HSV: The Photoshop Model

HSB (Hue, Saturation, Brightness), also called HSV (Value), is used by Adobe software and many color pickers:
- **Hue** (0-360 degrees): Same as HSL
- **Saturation** (0-100%): White (0%) to pure color (100%)  
- **Brightness/Value** (0-100%): Black (0%) to full color (100%)

HSB and HSL look similar but behave differently. Neither is natively supported in CSS - you need to convert to RGB or HSL first.

## OKLCH: The Modern Perceptual Model

CSS Color Level 4 introduced OKLCH (Lightness, Chroma, Hue in the OKLab color space):

```css
color: oklch(60% 0.2 30);  /* Lightness, Chroma, Hue */
```

OKLCH is perceptually uniform, meaning equal numeric changes produce equal perceived color differences. This makes it ideal for accessible color palettes and theme color systems.

## Contrast and Accessibility

Color contrast is crucial for accessibility (WCAG 2.1). The contrast ratio between text and background must be at least 4.5:1 for normal text (Level AA), 3:1 for large text (Level AA), or 7:1 for enhanced accessibility (Level AAA).

Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 and L2 are relative luminance values.

-> Try the [Color Converter](/color-converter)"""

articles['markdown-to-html-guide'] = """## What Is Markdown?

Markdown is a lightweight markup language created by John Gruber in 2004. Its core philosophy is that formatting should be readable in source form - a Markdown document should be understandable as plain text without being rendered.

Markdown has become the default format for developer documentation (GitHub README files, Confluence, GitLab), static site generators (Jekyll, Hugo, Eleventy), note-taking apps (Obsidian, Notion), and API documentation.

## Core Markdown Syntax

### Headings
Create headings using # symbols:
```
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
```

### Text Formatting
```
**Bold text** or __also bold__
*Italic text* or _also italic_
***Bold and italic***
~~Strikethrough~~
```

### Lists
```
Unordered:
- Item one
- Item two
  - Nested item (2 spaces indent)

Ordered:
1. First item
2. Second item
3. Third item
```

### Links and Images
```
[Link text](https://example.com)
[Link with title](https://example.com "Tooltip text")

![Alt text](image.png)
```

### Code
Use single backticks for inline code and triple backticks for code blocks:
```
Inline: `const x = 5;`

Block with syntax highlighting:
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
```

### Tables
```
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |

Column alignment:
| Left | Center | Right |
|:-----|:------:|------:|
```

## How Markdown Converts to HTML

| Markdown | HTML Output |
|---|---|
| `# Title` | `<h1>Title</h1>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `[text](url)` | `<a href="url">text</a>` |
| backtick code backtick | `<code>code</code>` |
| blank line | `<p>...</p>` |
| `- item` | `<ul><li>item</li></ul>` |

## Markdown Flavors

The original Markdown spec has gaps and ambiguities. Several extended specifications fill these gaps:

| Flavor | Used By | Extensions |
|---|---|---|
| CommonMark | Most parsers | Standardized core |
| GitHub Flavored Markdown (GFM) | GitHub | Tables, task lists, strikethrough |
| MultiMarkdown | Academic | Footnotes, citations |
| Pandoc | Document conversion | LaTeX math, custom attributes |

GitHub Flavored Markdown (GFM) adds task lists (`- [x] Done`, `- [ ] Todo`), autolinks (bare URLs become clickable), strikethrough, and tables with alignment.

## XSS Safety Considerations

When converting user-provided Markdown to HTML, always sanitize the output. Markdown allows raw HTML by default, which can include script tags. Use a sanitizer like DOMPurify (browser) or sanitize-html (Node.js) to remove dangerous tags.

## Popular Markdown Libraries

| Library | Language | Notes |
|---|---|---|
| marked | JavaScript | Fast, widely used |
| remark | JavaScript | Unified ecosystem, plugins |
| markdown-it | JavaScript | Extensible, CommonMark |
| Python-Markdown | Python | Official Python implementation |
| Goldmark | Go | Default for Hugo |

-> Try the [Markdown to HTML Converter](/markdown-to-html)"""

articles['unix-timestamp-guide'] = """## What Is a Unix Timestamp?

A Unix timestamp (also called POSIX time or epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC - the "Unix epoch." It is a simple, universal, and timezone-independent way to represent a specific point in time.

```
Current time (example):  2025-06-15 14:30:00 UTC
Unix timestamp:          1750000200
```

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

```javascript
// JavaScript
const now = Date.now();                    // Milliseconds since epoch
const nowSeconds = Math.floor(Date.now() / 1000); // Seconds

// Convert timestamp to Date
const date = new Date(1750000200 * 1000); // Multiply by 1000 (ms)
console.log(date.toISOString());           // "2025-06-15T14:30:00.000Z"

// Convert Date to timestamp
const timestamp = Math.floor(new Date('2025-06-15T14:30:00Z').getTime() / 1000);
```

```python
# Python
import time
from datetime import datetime, timezone

now = int(time.time())  # Current timestamp

# Timestamp to datetime
dt = datetime.fromtimestamp(1750000200, tz=timezone.utc)

# Datetime to timestamp
timestamp = int(datetime(2025, 6, 15, 14, 30, tzinfo=timezone.utc).timestamp())
```

```sql
-- SQL (PostgreSQL)
SELECT EXTRACT(EPOCH FROM NOW())::INTEGER;     -- Current timestamp
SELECT TO_TIMESTAMP(1750000200);               -- Timestamp to datetime
```

## Unix Timestamps in Logs and APIs

Many systems use Unix timestamps for event logging and API responses:
- JWT `exp` claim: `{ "exp": 1750000200 }`
- AWS API responses: `{ "LastModified": 1750000200 }`
- Database columns: `created_at INTEGER DEFAULT (unixepoch())`

## Milliseconds vs. Seconds

Different systems use different resolutions. JavaScript `Date.now()` returns milliseconds, while Python `time.time()` returns seconds. A common bug is using milliseconds where seconds are expected, producing dates in 1970 or far in the future.

## How to Use This Tool

Enter a Unix timestamp (seconds or milliseconds) to see the corresponding UTC and local date/time, or enter a date and time to get the Unix timestamp. Click "Now" to get the current timestamp instantly.

-> Try the [Unix Timestamp Converter](/unix-timestamp)"""

articles['date-time-converter-guide'] = """## Why Date and Time Conversion Is Complex

Working with dates and times is famously tricky in software development. The complexity stems from multiple overlapping systems: timezones, daylight saving time (DST) transitions, calendar reforms, leap years, and a proliferation of date formats across different cultures and systems.

## Major Date and Time Formats

### ISO 8601: The International Standard
```
2025-06-15T14:30:00Z          (UTC)
2025-06-15T14:30:00+05:30     (IST, UTC+5:30)
2025-06-15                     (Date only)
14:30:00                       (Time only)
```

ISO 8601 is the recommended format for data exchange. It sorts lexicographically in chronological order, making it database-friendly.

### RFC 2822 (Email/HTTP)
```
Mon, 15 Jun 2025 14:30:00 +0000
```
Used in HTTP headers, email headers, and RSS feeds.

### Unix Timestamp
```
1750000200        (seconds since Jan 1, 1970)
1750000200000     (milliseconds)
```

### Locale-Specific Formats
```
US:    06/15/2025      (MM/DD/YYYY)
EU:    15/06/2025      (DD/MM/YYYY)
ISO:   2025-06-15      (YYYY-MM-DD)
```

The ambiguity of `01/02/2025` - is it January 2nd (US) or February 1st (EU)? - is a major source of data errors.

## Timezone Fundamentals

### UTC: The Reference Point
UTC (Coordinated Universal Time) is the global time standard. All other timezones are expressed as UTC offsets.

### UTC Offsets
```
UTC+0:00   London (winter)
UTC+5:30   India (does not observe DST)
UTC-5:00   New York (winter/EST)
UTC-8:00   Los Angeles (winter/PST)
```

### IANA Timezone Database
UTC offsets alone are insufficient because they do not account for daylight saving time transitions. The IANA timezone database (using identifiers like `America/New_York`, `Europe/London`) encodes the complete history of UTC offsets and DST transitions for each timezone.

## Daylight Saving Time (DST)

DST transitions cause clocks to jump forward 1 hour in spring and back 1 hour in fall. This creates ambiguous times (1:30 AM can occur twice in fall), non-existent times (2:30 AM does not exist in spring when clocks jump from 2:00 to 3:00), and variable day lengths (DST transition days are 23 or 25 hours long).

Best practices: store all times in UTC in your database, convert to local time only for display, and use a timezone library (Luxon, date-fns-tz) rather than implementing DST logic yourself.

## Date Arithmetic Pitfalls

Adding 1 month to January 31 can produce different results in different libraries. Leap years add complexity (years divisible by 4 are leap years, except centuries, except quad-centuries). "How many days until the event?" involves correctly counting across DST transitions.

## Date Formatting in Code

```javascript
// JavaScript Intl API (preferred)
const date = new Date(1750000200 * 1000);

new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
// "Sunday, June 15, 2025"

new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date);
// "15. Juni 2025"

// date-fns library
import { format } from 'date-fns';
format(date, 'yyyy-MM-dd HH:mm:ss');  // "2025-06-15 14:30:00"
```

-> Try the [Date/Time Converter](/date-time-converter)"""

articles['temperature-converter-guide'] = """## Temperature Scales: A Brief History

The three major temperature scales were created at different times for different purposes.

Fahrenheit (degrees F) was developed by German physicist Daniel Gabriel Fahrenheit in 1724. He set 0 degrees F as the coldest temperature he could produce with an ice-salt mixture and 96 degrees F as human body temperature (later adjusted to 98.6 degrees F). Fahrenheit remains the primary scale in the United States for everyday use.

Celsius (degrees C), originally called centigrade, was proposed by Swedish astronomer Anders Celsius in 1742. He defined 0 degrees C as the freezing point of water and 100 degrees C as the boiling point at sea level, creating a convenient 100-degree scale for scientific use. Now the standard in most of the world.

Kelvin (K) was defined by Lord Kelvin (William Thomson) in 1848. It starts at absolute zero - the theoretical temperature at which all thermal motion ceases. There are no negative Kelvin values. Kelvin is the SI base unit of temperature, essential for physics and chemistry.

## Conversion Formulas

### Celsius to Fahrenheit
```
°F = (°C * 9/5) + 32
Example: 100°C -> (100 * 1.8) + 32 = 212°F
```

### Fahrenheit to Celsius
```
°C = (°F - 32) * 5/9
Example: 98.6°F -> (98.6 - 32) * 5/9 = 37°C
```

### Celsius to Kelvin
```
K = °C + 273.15
Example: 0°C -> 273.15 K
```

### Kelvin to Celsius
```
°C = K - 273.15
Example: 373.15 K -> 100°C
```

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
```
PV = nRT   (P=pressure, V=volume, n=moles, R=gas constant, T=Kelvin)
```

You cannot substitute Celsius or Fahrenheit into this formula - only Kelvin works correctly because it starts from true zero.

## Rankine: The Fourth Scale

Rankine (degrees R) is the Fahrenheit equivalent of Kelvin - an absolute scale where zero is absolute zero, but degrees are the same size as Fahrenheit degrees:
```
°R = °F + 459.67
°R = K * 9/5
```
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

-> Try the [Temperature Converter](/temperature-converter)"""

articles['case-converter-guide'] = """## What Is String Case?

String case refers to the capitalization style applied to words and letters in text. Different programming languages, frameworks, and naming conventions use specific case styles for identifiers, file names, database columns, CSS classes, and API responses.

Being able to quickly convert between case styles is essential when working across systems with different conventions.

## The Major Case Styles

### camelCase
Words joined without spaces; first word lowercase, subsequent words capitalized.
```
camelCase
myVariableName
getUserById
```
Used in: JavaScript variables and functions, Java methods, JSON keys, Swift properties.

### PascalCase (UpperCamelCase)
Like camelCase but the first word is also capitalized.
```
PascalCase
MyClassName
UserProfileComponent
```
Used in: Class names in most languages, TypeScript types, React components, C# identifiers.

### snake_case
Words separated by underscores, all lowercase.
```
snake_case
my_variable_name
user_id
```
Used in: Python variables and functions, Ruby, SQL column names, C variables, Linux file names.

### SCREAMING_SNAKE_CASE
Like snake_case but all uppercase.
```
MAX_RETRY_COUNT
API_BASE_URL
DATABASE_CONNECTION_STRING
```
Used in: Constants in most languages, environment variables, C macros.

### kebab-case (dash-case)
Words separated by hyphens, all lowercase.
```
kebab-case
my-css-class
my-component-name
```
Used in: CSS class names, HTML attributes, URL slugs, web file names, Vue component names.

### Title Case
Each word capitalized.
```
My Document Title
User Settings Page
```
Used in: Page titles, headings, book titles, button labels.

## Case Conventions by Language

| Language | Variables | Constants | Classes | Functions |
|---|---|---|---|---|
| JavaScript | camelCase | SCREAMING_SNAKE | PascalCase | camelCase |
| Python | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| Java | camelCase | SCREAMING_SNAKE | PascalCase | camelCase |
| C# | camelCase | PascalCase | PascalCase | PascalCase |
| Go | camelCase | camelCase | PascalCase | camelCase or PascalCase |
| Ruby | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| SQL | snake_case | SCREAMING_SNAKE | PascalCase | snake_case |
| CSS | kebab-case | not applicable | not applicable | not applicable |

## When Conversions Are Needed

### Cross-Language Data Exchange
An API might return `user_first_name` (snake_case) but your TypeScript code expects `userFirstName` (camelCase). Libraries like `camelcase-keys` handle this automatically.

### Database to Object Mapping
SQL columns use snake_case but ORM objects use camelCase. Most ORMs (Prisma, Sequelize, ActiveRecord) handle this mapping automatically.

### Code Generation
When generating code from a schema or OpenAPI spec, you need to convert names to the target language's convention.

### URL Slugification
Convert "My Blog Post Title" to "my-blog-post-title" for SEO-friendly URLs.

## Special Cases in Conversion

Converting between cases has edge cases: acronyms (should URL become url, uRL, or URL in camelCase?), numbers (does address1 become address-1 or address1 in kebab-case?), and multiple spaces or hyphens in input.

## Code Examples

```javascript
// Using 'change-case' npm package
import { camelCase, pascalCase, snakeCase, kebabCase } from 'change-case';

camelCase('foo bar')   // 'fooBar'
pascalCase('foo bar')  // 'FooBar'
snakeCase('fooBar')    // 'foo_bar'
kebabCase('fooBar')    // 'foo-bar'
```

-> Try the [Case Converter](/case-converter)"""

articles['roman-numeral-converter-guide'] = """## What Are Roman Numerals?

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
```python
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
```

### Roman to Arabic:
```python
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
```

## Limits of Roman Numerals

The standard system covers 1-3,999. For numbers 4,000 and above, historical texts used a bar over a symbol (vinculum) to multiply it by 1,000, but these extensions are rarely used today. Zero has no Roman numeral - the concept of zero was not part of ancient Roman mathematics.

## Roman Numerals in Modern Usage

Roman numerals appear in many modern contexts. Clocks and watches traditionally use Roman numerals. Formal outlines use Roman numerals for top-level sections (I, II, III). Film and TV use them for sequel numbering (Star Wars Episode VII, Super Bowl LVIII). Royal and papal names use them (King Charles III, Pope John Paul II). Architecture commonly shows the year of construction in Roman numerals on building cornerstones. The Olympics numbers each edition (XXXIII Olympiad = Paris 2024).

-> Try the [Roman Numeral Converter](/roman-numeral-converter)"""

articles['integer-base-converter-guide'] = """## What Are Number Bases?

A number base (or radix) defines how many unique digits are available to represent numbers. Each position in a number represents a power of the base.

The four common bases in computing are: Base 10 (Decimal) using digits 0-9 which is the everyday number system; Base 2 (Binary) using digits 0-1 which is the language of computers; Base 16 (Hexadecimal) using digits 0-9 and A-F which provides a compact binary representation; and Base 8 (Octal) using digits 0-7 which is used in Unix file permissions.

The same value 255 is written differently in each base:
```
Decimal:     255
Binary:      11111111
Hexadecimal: FF
Octal:       377
```

## Why Different Bases?

### Binary (Base 2): The Hardware Reality
Digital circuits are fundamentally binary - a transistor is either on (1) or off (0). All computer data is ultimately binary at the hardware level.

### Hexadecimal (Base 16): Compact Binary
Binary is verbose. The number 255 requires 8 binary digits but only 2 hex digits. Since one hex digit equals exactly 4 binary bits, hex is a convenient shorthand for binary. One common pattern: `1111 0100 1011 0101` becomes `F4B5` in hex.

Hexadecimal is ubiquitous in memory addresses (0x7FFE42A3), color codes (#FF5733), SHA-256 hashes (2cf24dba...), IPv6 addresses (2001:0db8:...), assembly language, and byte representations in debugging.

### Octal (Base 8): Unix Legacy
Unix file permissions use octal notation because each octal digit represents exactly 3 bits (one set of read/write/execute permissions):
```
chmod 755 -> rwxr-xr-x
7 = 111 = rwx (owner)
5 = 101 = r-x (group)
5 = 101 = r-x (others)
```

## Conversion Process

### Decimal to Binary
Repeatedly divide by 2, collect remainders (read bottom-to-top):
```
42 / 2 = 21 remainder 0
21 / 2 = 10 remainder 1
10 / 2 =  5 remainder 0
 5 / 2 =  2 remainder 1
 2 / 2 =  1 remainder 0
 1 / 2 =  0 remainder 1
42 decimal = 101010 binary
```

### Binary to Decimal
Multiply each bit by its positional value (powers of 2):
```
101010 = 1x32 + 0x16 + 1x8 + 0x4 + 1x2 + 0x1
       = 32 + 8 + 2 = 42
```

### Binary to Hex
Group bits in sets of 4 from right:
```
101010 -> 0010 1010 -> 2A
```

## Integer Representations in Code

```javascript
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
```

```python
bin(255)   # '0b11111111'
oct(255)   # '0o377'
hex(255)   # '0xff'

int('ff', 16)       # 255
int('11111111', 2)  # 255
```

## Signed Integer Representation

Signed integers use two's complement encoding. The most significant bit (MSB) is the sign bit: 0 means positive, 1 means negative. To negate a number, flip all bits and add 1.

```
+42 in 8-bit: 00101010
-42 in 8-bit: 11010110 (flip bits of 42, then +1)
```

This is why an 8-bit signed integer ranges from -128 to 127, not -127 to 127.

## Floating Point: A Different World

Integer bases do not apply directly to floating-point numbers. IEEE 754 stores numbers in a binary scientific notation: `value = sign * mantissa * 2^exponent`. This is why 0.1 + 0.2 does not equal exactly 0.3 in most languages - 0.1 and 0.2 do not have exact binary representations.

-> Try the [Integer Base Converter](/integer-base-converter)"""

articles['url-encoding-explained'] = """## What Is URL Encoding?

URL encoding (also called percent encoding) converts characters that are not allowed in URLs into a format that can be safely transmitted over the internet. The process replaces unsafe characters with a percent sign (%) followed by two hexadecimal digits representing the character's ASCII or UTF-8 code.

Every URL must consist only of a defined set of safe characters. Anything outside that set must be encoded.

## Why URLs Have Restricted Characters

The URI specification (RFC 3986) divides characters into three categories:
1. **Reserved characters** that have special meaning in URIs: `: / ? # [ ] @ ! $ & ' ( ) * + , ; =`
2. **Unreserved characters** that are always safe: `A-Z a-z 0-9 - _ . ~`
3. **All others** that must be percent-encoded

If a reserved character appears in a query parameter value, it must be encoded. Otherwise, parsers misinterpret it as a structural separator.

## How Percent Encoding Works

```
Space = 0x20 -> %20
!     = 0x21 -> %21
#     = 0x23 -> %23
&     = 0x26 -> %26
+     = 0x2B -> %2B (literal plus)
=     = 0x3D -> %3D
?     = 0x3F -> %3F
@     = 0x40 -> %40
```

Multi-byte UTF-8 characters are encoded as multiple percent sequences:
```
e with accent = UTF-8 0xC3 0xA9 -> %C3%A9
Chinese character = UTF-8 0xE4 0xB8 0xAD -> %E4%B8%AD
```

## URL Encoding vs Form Encoding

There are two related but distinct encoding schemes. Percent-encoding (RFC 3986) converts spaces to `%20` and is used in path segments and strict URI conformance. Application/x-www-form-urlencoded converts spaces to `+` and is used in HTML form submissions. They have slightly different encoding rules.

```javascript
// Percent-encoding (standard)
encodeURIComponent('hello world') // 'hello%20world'

// Form encoding (spaces as +)
new URLSearchParams({ q: 'hello world' }).toString() // 'q=hello+world'
```

## JavaScript URL Encoding Functions

JavaScript has four functions for URL encoding and decoding:

| Function | Encodes | Use When |
|---|---|---|
| `encodeURI` | All except unreserved and structural chars | Encoding a full URL |
| `encodeURIComponent` | All except unreserved chars | Encoding query params, path segments |
| `decodeURI` | Reverses encodeURI | Decoding a full URL |
| `decodeURIComponent` | Reverses encodeURIComponent | Decoding URL components |

```javascript
// Encoding a full URL - preserves structural characters
encodeURI('https://example.com/path?q=hello world')
// 'https://example.com/path?q=hello%20world'

// Encoding a query parameter value
encodeURIComponent('hello world & more')
// 'hello%20world%20%26%20more'

// Decoding
decodeURIComponent('hello%20world')  // 'hello world'
```

## Common URL Encoding Examples

The most frequently encoded characters in web development are: space becomes %20, hash becomes %23 (use %23 inside query values since # is a fragment delimiter), ampersand becomes %26 (use %26 inside query values since & separates parameters), plus becomes %2B (for literal plus symbols), forward slash becomes %2F (for literal slashes in path segments), and equals becomes %3D (inside parameter values).

## URL Structure and Where Encoding Applies

```
https://example.com:8080/path?key=value&foo=bar#section
```

Each part has different encoding rules. Path segments should encode everything except unreserved characters and the slash separator. Query parameters should encode ampersands, equals signs, plus symbols, percent signs, and others. Fragments follow similar rules to query encoding.

## Internationalized URLs

Modern browsers display internationalized domain names and paths in their Unicode form but transmit them encoded. For example, a URL with Chinese characters in the path will be displayed nicely in the browser but transmitted as percent-encoded UTF-8 bytes. Domain names use Punycode (xn--) encoding for non-ASCII characters.

-> Try the [URL Encoder/Decoder](/url-encoder)"""

# ─── Apply changes ─────────────────────────────────────────────────────────

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
