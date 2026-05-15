#!/usr/bin/env python3
"""
Batch 4: string-obfuscator, text-statistics, chronometer, benchmark-builder,
qr-code, svg-placeholder, color-palette, phone-formatter, iban-validator,
json-to-csv, number-formatter, device-information, mime-types, user-agent-parser,
keycode-info, slugify-string, html-entities, basic-auth-generator, safelink-decoder,
wifi-qr-code, camera-recorder
"""
import re

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

articles['string-obfuscator-guide'] = """## What Is String Obfuscation?

String obfuscation is the process of making text harder to read or understand while preserving its core meaning or functionality. Unlike encryption (which completely hides data), obfuscation obscures information in ways that are often still technically readable but practically confusing.

## Common Obfuscation Techniques

### Character Substitution
Replace characters with visually similar alternatives:
```
Original:    Hello World
Leet speak:  H3ll0 W0rld
Homoglyphs:  Неllo Wоrld  (using Cyrillic Н and о)
Upside down: ploM ollaH
Reversed:    dlroW olleH
```

### Caesar Cipher (ROT13)
Shift each letter by N positions in the alphabet:
```
ROT13: Hello -> Uryyb
ROT3:  Hello -> Khoor
```
ROT13 is its own inverse (apply twice to decode), making it popular for spoilers and puzzle answers.

### Base64 Encoding
Not encryption, but makes text unreadable at a glance:
```
Hello World -> SGVsbG8gV29ybGQ=
```

### Binary/Hex Representation
```
Hello -> 01001000 01100101 01101100 01101100 01101111
Hello -> 48 65 6C 6C 6F
```

### HTML Entity Encoding
```
Hello -> &#72;&#101;&#108;&#108;&#111;
```

## Purpose of String Obfuscation

### Code Obfuscation
JavaScript minifiers and obfuscators make code hard to reverse engineer:
```javascript
// Original
function calculateTotal(price, tax) {
  return price + (price * tax);
}

// Obfuscated
var _0x2d8f=['calculateTotal'];function _0x1a2b(_0x3c4d,_0x5e6f){return _0x3c4d+(_0x3c4d*_0x5e6f);}
```

Used by software vendors to protect intellectual property in client-side code.

### Anti-Spam
Email addresses on websites are often obfuscated to prevent scraping by bots:
```html
<!-- Obfuscated email -->
<span class="email">user [at] example [dot] com</span>

<!-- Or using HTML entities -->
&#117;&#115;&#101;&#114;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;
```

### Puzzle Design
Escape rooms, treasure hunts, and coding challenges use obfuscation as a puzzle element.

### Privacy Masking
Partially hiding sensitive information for display:
```
Credit card: **** **** **** 4242
Phone number: (555) ***-7890
Email: j***@example.com
SSN: ***-**-1234
```

## Obfuscation vs Encryption

| Property | Obfuscation | Encryption |
|---|---|---|
| Reversible | Often yes (no key needed) | Yes (with key) |
| Security | Low (security through obscurity) | High (mathematical) |
| Purpose | Confusion, code protection | Data confidentiality |
| Common tools | Base64, ROT13, minifiers | AES, RSA |

Obfuscation should never be used as a security measure. It's trivially reversible by anyone with technical knowledge.

## Practical Use Cases for This Tool

This tool provides various obfuscation transformations useful for:
- Creating puzzle content
- Obscuring email addresses from basic scrapers  
- Teaching about encoding and transformation
- Generating creative typographic variations
- Testing application handling of unusual characters

## Using This Tool

Enter your text and select an obfuscation method. The tool applies the transformation and shows the result. You can chain multiple transformations for more complex obfuscation.

-> Try the [String Obfuscator](/string-obfuscator)"""

articles['text-statistics-guide'] = """## What Are Text Statistics?

Text statistics provide quantitative measurements about a body of text: word count, character count, sentence count, reading time, readability scores, and frequency analysis. These metrics are valuable for writers, editors, students, SEO specialists, and anyone who needs to understand or report on text characteristics.

## Core Text Metrics

### Word Count
The most fundamental text metric. A "word" is typically defined as a sequence of characters separated by whitespace:

```
"Hello, world! This is a test."
Words: 6 (Hello, world, This, is, a, test)
```

Academic word count rules vary: some exclude articles (a, an, the), some count hyphenated words as one or two, some count contractions differently.

### Character Count

| Metric | Example | Count |
|---|---|---|
| Characters with spaces | "Hello World" | 11 |
| Characters without spaces | "Hello World" | 10 |
| Letters only | "Hello World!" | 10 |
| Unique characters | "Hello" | 4 (H,e,l,o) |

### Sentence Count
Sentences end with `.`, `!`, `?`, or `...`. Detecting sentence boundaries is harder than it appears:
- "Dr. Smith is a Ph.D." contains periods but only one sentence
- "What?! Really?" contains 2 sentences
- "etc." inside a sentence should not end it

### Paragraph Count
Paragraphs are typically separated by blank lines or indentation. This metric is useful for document structure analysis.

## Reading Time Estimation

The average adult reads 200-250 words per minute for standard prose:

```
Reading time (minutes) = Word count / Average reading speed

200 words / 200 wpm = 1 minute
1,500 words / 200 wpm = 7.5 minutes
3,000 words / 200 wpm = 15 minutes
```

Medium.com uses approximately 275 words per minute for their "X min read" estimates.

For code-heavy articles, reading speed is significantly lower (100-150 wpm) due to the need to mentally execute or verify code.

## Readability Scores

### Flesch Reading Ease
Scale from 0-100 (higher = easier to read):
```
RE = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
```

| Score | Difficulty | School Level |
|---|---|---|
| 90-100 | Very easy | 5th grade |
| 70-80 | Easy | 7th grade |
| 60-70 | Standard | 8th-9th grade |
| 50-60 | Fairly difficult | 10th-12th grade |
| 30-50 | Difficult | College |
| 0-30 | Very difficult | College graduate |

### Flesch-Kincaid Grade Level
Estimates the US school grade level required to understand the text:
```
Grade = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
```

### Gunning Fog Index
Focuses on complex words (3+ syllables):
```
Fog = 0.4 * (words/sentences + 100 * complex_words/words)
```

### SMOG Grade
Simple Measure of Gobbledygook - counts polysyllabic words:
```
SMOG Grade = 3 + sqrt(polysyllabic_count)
```

## Word Frequency Analysis

Counting how often each word appears reveals:
- Keyword density for SEO purposes
- The author's focus and emphasis
- Overused words and phrases
- Most common vocabulary

For meaningful frequency analysis, exclude stop words (the, a, an, is, are, etc.) which appear in all texts.

## Lexical Diversity (Type-Token Ratio)

Type-Token Ratio (TTR) = Unique words / Total words

A TTR of 1.0 means every word is unique (very diverse vocabulary). TTR of 0.1 means many repetitions. Academic writing typically aims for TTR of 0.5-0.7.

## Practical Applications

**SEO**: Search engines look for natural keyword distribution. Keyword density 1-3% for target keyword is typically ideal.

**Academic writing**: Many assignments have specific word count requirements (500-2000 words) and readability expectations.

**UX writing**: Short sentences (under 20 words) and high readability scores improve comprehension in interfaces.

**Legal documents**: Courts sometimes require readability assessments for consumer contracts.

## Using This Tool

Paste any text to instantly see word count, character count, sentence count, paragraph count, estimated reading time, and readability scores. The tool also shows the most frequent words and basic sentence length statistics.

-> Try the [Text Statistics Tool](/text-statistics)"""

articles['chronometer-guide'] = """## What Is a Chronometer?

A chronometer is a precision timekeeping device or a stopwatch used to measure elapsed time with high accuracy. The word comes from Greek: "chronos" (time) + "meter" (measure).

In web applications, a chronometer (or online stopwatch) is used for timing tasks, workouts, cooking, presentations, and any activity where precise elapsed time measurement matters.

## How Digital Timers Work

Browser-based timers use the `Date.now()` or `performance.now()` JavaScript APIs:

```javascript
// Simple stopwatch implementation
let startTime = null;
let elapsed = 0;
let running = false;

function start() {
  if (!running) {
    startTime = Date.now() - elapsed;
    running = true;
  }
}

function stop() {
  if (running) {
    elapsed = Date.now() - startTime;
    running = false;
  }
}

function reset() {
  elapsed = 0;
  running = false;
}

function getTime() {
  if (running) {
    return Date.now() - startTime;
  }
  return elapsed;
}
```

### performance.now() vs Date.now()

`performance.now()` is preferred for timers because:
- Higher precision (sub-millisecond)
- Monotonic (never goes backward, immune to system clock changes)
- Not affected by daylight saving adjustments

```javascript
// High-precision timer
const start = performance.now();
// ... do work ...
const elapsed = performance.now() - start;
console.log(`Operation took ${elapsed.toFixed(3)}ms`);
```

## Time Formatting

Displaying elapsed time in human-readable format:

```javascript
function formatTime(milliseconds) {
  const ms = milliseconds % 1000;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / 60000) % 60;
  const hours = Math.floor(milliseconds / 3600000);
  
  return hours > 0
    ? `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`
    : `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`;
}

formatTime(3725430) // "01:02:05.430"
```

## Lap Times

Lap recording captures intermediate times while the overall timer continues:

```javascript
const laps = [];

function recordLap() {
  const currentTime = getTime();
  const lapTime = laps.length > 0
    ? currentTime - laps[laps.length - 1].total
    : currentTime;
    
  laps.push({
    lapNumber: laps.length + 1,
    lapTime: lapTime,
    total: currentTime
  });
}
```

## Use Cases for a Chronometer

**Sports and fitness**: Timing running splits, swim laps, interval training, rest periods between sets.

**Cooking**: Timing multiple dishes simultaneously (boiling eggs: 7 minutes, pasta: 10 minutes).

**Presentations**: Staying within allotted speaking time.

**Development**: Measuring performance of code sections.

**Productivity**: Pomodoro technique (25-minute work periods with 5-minute breaks).

**Games and competitions**: Timing puzzle-solving, quiz rounds, speed challenges.

## Pomodoro Technique

The Pomodoro Technique uses a timer to break work into focused 25-minute intervals:
1. Choose a task
2. Set timer for 25 minutes (one "pomodoro")
3. Work without interruption until timer rings
4. Take a 5-minute break
5. After 4 pomodoros, take a longer 15-30 minute break

Studies show this technique improves focus and reduces mental fatigue.

## Precision Considerations

Browser timers are generally accurate to within a few milliseconds for user purposes. However, several factors affect precision:

- **Timer resolution**: Most browsers limit `setInterval`/`setTimeout` to 1ms minimum (some reduce to 4ms in background tabs)
- **CPU load**: Heavy CPU usage can delay timer callbacks
- **Background throttling**: Browsers throttle timers in inactive tabs
- **requestAnimationFrame**: Better for visual timers (tied to display refresh, 60fps = 16.67ms)

For applications requiring high precision (scientific measurement, audio synchronization), use the Web Audio API's `AudioContext.currentTime`.

## Using This Tool

Click Start to begin timing, Stop to pause, and Reset to return to zero. Use Lap to record intermediate times. The timer displays in HH:MM:SS.mmm format with millisecond precision.

-> Try the [Chronometer](/chronometer)"""

articles['benchmark-builder-guide'] = """## What Is Performance Benchmarking?

Performance benchmarking measures how fast code executes. By comparing the execution speed of different implementations, algorithms, or approaches, developers can make informed optimization decisions.

A JavaScript benchmark builder allows you to define multiple code snippets and test them head-to-head in your browser, measuring operations per second for each.

## Why Benchmark Code?

**Validate optimizations**: Before investing time in a complex optimization, benchmark to confirm the expected speedup.

**Compare algorithms**: When multiple approaches exist, benchmarks reveal which is fastest for your use case.

**Detect regressions**: Track performance over time to catch code changes that make things slower.

**Micro-optimization**: For performance-critical hot paths (game loops, data processing, animations), every millisecond matters.

## How Benchmarks Work

A benchmark runs the test function many times, measures total time, and calculates operations per second:

```javascript
function benchmark(fn, iterations = 100000) {
  // Warmup - JIT compiler needs a few runs to optimize
  for (let i = 0; i < 100; i++) fn();
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const end = performance.now();
  
  const totalMs = end - start;
  const opsPerSec = (iterations / totalMs) * 1000;
  return opsPerSec;
}
```

## Common Benchmark Patterns

### String Concatenation Methods
```javascript
// Test 1: + operator
const str1 = 'Hello' + ' ' + 'World';

// Test 2: Template literals
const str2 = `Hello ${'World'}`;

// Test 3: Array join
const str3 = ['Hello', 'World'].join(' ');

// Test 4: concat method
const str4 = 'Hello'.concat(' ', 'World');
```

### Array Methods
```javascript
// Test 1: for loop
let sum = 0;
for (let i = 0; i < arr.length; i++) sum += arr[i];

// Test 2: forEach
let sum2 = 0;
arr.forEach(n => sum2 += n);

// Test 3: reduce
const sum3 = arr.reduce((a, b) => a + b, 0);
```

### Object Creation
```javascript
// Test 1: Object literal
const obj1 = { x: 1, y: 2 };

// Test 2: Object.assign
const obj2 = Object.assign({}, { x: 1 }, { y: 2 });

// Test 3: Spread
const obj3 = { ...base, x: 1, y: 2 };
```

## Interpreting Results

Benchmarks report in **operations per second (ops/sec)**. Higher is faster.

```
Test 1: 45,231,098 ops/sec  (fastest)
Test 2: 32,156,743 ops/sec  (29% slower)
Test 3: 12,891,234 ops/sec  (71% slower)
```

Margin of error matters: if two results are within 5% of each other, they may be statistically equivalent.

## Common Benchmarking Pitfalls

### JIT Compiler Optimization
Modern JavaScript engines (V8, SpiderMonkey) use JIT (Just-In-Time) compilation to optimize code at runtime. This means:
- First execution is slow (interpreted)
- After sufficient runs, the JIT optimizes the hot code
- Always warm up with a few hundred iterations before measuring

### Dead Code Elimination
Clever compilers optimize away code that produces no visible side effects. A benchmark that calculates a value but never uses it may be faster than expected because the calculation was eliminated:
```javascript
// JIT might eliminate this if result isn't used
for (let i = 0; i < 1000000; i++) {
  Math.sin(i); // result never used - might be optimized away
}

// Force use of the result to prevent elimination
let x = 0;
for (let i = 0; i < 1000000; i++) {
  x += Math.sin(i); // result is accumulated
}
console.log(x); // prevent dead code elimination of the loop
```

### Browser Variability
Results vary across browsers (Chrome, Firefox, Safari) and hardware. V8 in Chrome often optimizes differently than SpiderMonkey in Firefox.

## When NOT to Over-Optimize

"Premature optimization is the root of all evil." — Donald Knuth

Profile before optimizing. Use browser DevTools to find actual bottlenecks. Often the perceived bottleneck is not the real one. Readable, maintainable code is usually more valuable than a 10% speed improvement.

## Using This Tool

Define two or more code snippets in the editor, add optional setup code (shared variables, data structures), and click Run to execute the benchmark. Results show operations per second, relative performance, and statistical margin of error.

-> Try the [Benchmark Builder](/benchmark-builder)"""

articles['qr-code-generator-guide'] = """## What Is a QR Code?

A QR code (Quick Response code) is a two-dimensional barcode that can store text, URLs, contact information, or other data. Created by Denso Wave in 1994 for tracking automotive parts, QR codes have become ubiquitous in marketing, payments, authentication, and information sharing.

Unlike traditional barcodes (which store data only horizontally), QR codes store data in both horizontal and vertical directions, allowing much more information in the same space. A QR code can hold up to 7,089 numeric characters or 4,296 alphanumeric characters.

## QR Code Structure

A QR code consists of:
- **Finder patterns**: Three square patterns in corners for orientation detection
- **Timing patterns**: Alternating black/white modules for module size determination
- **Alignment patterns**: Additional reference points for larger QR codes
- **Format information**: Error correction level and masking pattern
- **Data modules**: The actual encoded information
- **Quiet zone**: White border required for reliable scanning

## Error Correction Levels

QR codes include redundant data for error recovery:

| Level | Error Recovery | Use Case |
|---|---|---|
| L (Low) | ~7% | Clean printing environments |
| M (Medium) | ~15% | General use |
| Q (Quartile) | ~25% | Industrial use, some damage expected |
| H (High) | ~30% | Logos embedded in QR, dirty environments |

Higher error correction means larger QR codes but more reliable scanning.

## QR Code Data Types

### URL
```
https://example.com/page?utm_source=qr
```
The most common use: open a URL when scanned.

### Wi-Fi Credentials
```
WIFI:T:WPA;S:NetworkName;P:Password;;
```
Automatically connect to Wi-Fi network when scanned.

### Contact Card (vCard)
```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+15551234567
EMAIL:john@example.com
END:VCARD
```

### SMS
```
SMSTO:+15551234567:Your message here
```

### Email
```
mailto:address@example.com?subject=Subject&body=Body
```

### Calendar Event
```
BEGIN:VEVENT
SUMMARY:Meeting
DTSTART:20250615T140000Z
DTEND:20250615T150000Z
LOCATION:Conference Room A
END:VEVENT
```

### Plain Text
Any text content up to ~4,000 characters.

## Dynamic vs Static QR Codes

**Static QR codes** encode data directly. Changing the URL requires generating a new QR code.

**Dynamic QR codes** use a short redirect URL. The actual destination can be changed without updating the printed code. Dynamic codes enable tracking (scan counts, location, device type) and analytics.

## Best Practices for QR Code Design

**Size**: Minimum 2x2 cm (0.8 inches) for standard scanning distance. Larger for billboards and distant placement.

**Contrast**: Black on white is ideal. Maintain sufficient contrast for low-light scanning. Avoid patterned backgrounds.

**Quiet zone**: Always maintain at least 4 modules of white space around the QR code.

**Testing**: Always test with multiple apps and phones before printing.

**Logo embedding**: Can add a logo in the center by using High (H) error correction. Logo should cover no more than 30% of the QR code.

**Color**: Custom colors work if contrast is maintained, but exotic color combinations reduce scan reliability.

## QR Code in Payments and Authentication

Payment apps (Alipay, WeChat Pay, WhatsApp Pay) use QR codes for merchant payments. The merchant displays a QR code; the customer scans it to initiate payment.

Authentication apps use QR codes to set up TOTP (two-factor authentication). Scanning the QR code transfers the TOTP secret to the authenticator app.

## Using This Tool

Enter any text, URL, or structured data to instantly generate a QR code. Customize the error correction level, foreground/background colors, and size. Download the QR code as PNG, SVG, or other formats.

-> Try the [QR Code Generator](/qr-code-generator)"""

articles['svg-placeholder-guide'] = """## What Is an SVG Placeholder?

An SVG placeholder is a simple, lightweight image used during development to represent image dimensions and content before real images are available. SVG (Scalable Vector Graphics) is ideal for placeholders because it is:
- Scalable without quality loss at any resolution
- Editable with CSS and JavaScript
- Compact (minimal file size)
- Inline-embeddable in HTML

## Common Placeholder Patterns

### Simple Colored Rectangle
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="400" height="300" fill="#CCCCCC"/>
</svg>
```

### Rectangle with Dimensions Label
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="400" height="300" fill="#EEEEEE"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
    font-family="sans-serif" font-size="16" fill="#999999">
    400 x 300
  </text>
</svg>
```

### Image Placeholder with Icon
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#F5F5F5"/>
  <!-- Mountain/landscape icon -->
  <path d="M0,300 L133,100 L200,180 L266,120 L400,300Z" fill="#DEDEDE"/>
  <!-- Sun -->
  <circle cx="50" cy="50" r="30" fill="#FFD700" opacity="0.7"/>
</svg>
```

## Use Cases for Placeholders

### During Development
Before real images are ready, placeholders maintain layout structure and provide visual reference for image dimensions.

### Loading States
Show a placeholder while the real image loads asynchronously (lazy loading pattern):

```html
<img
  src="placeholder.svg"
  data-src="real-image.jpg"
  class="lazy-load"
  width="400"
  height="300"
  alt="Product photo"
/>
```

```javascript
// Intersection Observer for lazy loading
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy-load').forEach(img => observer.observe(img));
```

### Design Mockups and Wireframes
Use consistent placeholder sizes to communicate image placement in design presentations without creating actual images.

### Error States
Display a meaningful placeholder when an image fails to load:

```css
img::after {
  content: "Image not available";
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Data URI Approach

For truly inline placeholders (no separate HTTP request), use Base64-encoded SVG as a data URI:

```html
<img 
  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0i..." 
  width="300" 
  height="200"
  alt="placeholder"
/>
```

Or use URL-encoded SVG (smaller, no Base64 overhead):
```html
<img 
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23eee'/%3E%3C/svg%3E"
  alt="placeholder"
/>
```

## CSS Background Placeholders

Use SVG as CSS background images:

```css
.image-placeholder {
  width: 300px;
  height: 200px;
  background-color: #F0F0F0;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: center;
}
```

## Blur-Up Technique

Progressive image loading: show a tiny blurred version while the full image loads:

```javascript
// 1. Load tiny (40px wide) blurred version first
// 2. When full image loads, cross-fade from blurred to sharp
img.style.filter = 'blur(8px)';
const fullImage = new Image();
fullImage.onload = () => {
  img.src = fullImage.src;
  img.style.filter = 'none';
  img.style.transition = 'filter 0.3s';
};
fullImage.src = 'full-resolution.jpg';
```

## Placeholder Services

Several public services generate placeholder images on-demand by URL:
- `https://placehold.co/300x200` - Simple colored rectangles with text
- `https://picsum.photos/300/200` - Random photos (from Lorem Picsum)
- `https://dummyimage.com/300x200` - Customizable placeholders

## Using This Tool

Configure the width, height, background color, text color, text label, and font to generate a custom SVG placeholder. The tool provides the SVG code, data URI, and a direct download link.

-> Try the [SVG Placeholder Generator](/svg-placeholder-generator)"""

articles['color-palette-generator-guide'] = """## What Is a Color Palette?

A color palette is a set of colors chosen to work harmoniously together in a design. Good color palettes guide the viewer's attention, create mood, ensure accessibility, and maintain visual consistency across a product or brand.

## Color Theory Foundations

### The Color Wheel
The color wheel, developed by Isaac Newton in 1666, arranges colors in a circle based on their relationships. Primary colors (red, yellow, blue in traditional art theory; red, green, blue in light/digital) are evenly spaced; mixing adjacent primary colors creates secondary colors.

### Color Properties

**Hue**: The pure color itself (red, green, blue, etc.).

**Saturation**: The intensity or vividness of a color. High saturation = vivid; low saturation = gray/muted.

**Lightness/Value**: How light or dark a color is. Lightness 0% = black; 100% = white.

**Temperature**: Colors are perceived as warm (reds, oranges, yellows) or cool (blues, greens, purples).

## Color Harmony Types

### Complementary
Colors directly opposite on the color wheel:
```
Blue (210°) + Orange (30°)
Red (0°) + Cyan (180°)
Purple (270°) + Yellow (90°)
```
High contrast, energetic. Use one as dominant, other as accent.

### Analogous
Adjacent colors on the color wheel (within 30-60°):
```
Blue (210°), Blue-Green (180°), Cyan (150°)
```
Harmonious, cohesive, found in nature. Less contrast.

### Triadic
Three colors evenly spaced (120° apart):
```
Red + Yellow + Blue
Orange + Green + Violet
```
Vibrant, balanced. Use one dominant color, others as accents.

### Split-Complementary
One color plus two colors adjacent to its complement:
```
Blue (210°) + Yellow-Orange (45°) + Red-Orange (15°)
```
High contrast like complementary but less tension.

### Tetradic (Square/Rectangle)
Four colors forming a rectangle on the color wheel:
```
Red + Yellow-Green + Cyan + Blue-Violet
```
Rich palettes but challenging to balance. One color should dominate.

### Monochromatic
Single hue with varying saturation and lightness:
```
#1A237E (dark blue)
#3949AB (medium blue)
#7986CB (light blue)
#C5CAE9 (very light blue)
```
Elegant, sophisticated, easy to implement, limited contrast.

## Creating Accessible Color Palettes

### Contrast Ratio
WCAG 2.1 requires:
- Normal text: 4.5:1 contrast ratio (AA), 7:1 (AAA)
- Large text (18pt+ or 14pt+ bold): 3:1 (AA), 4.5:1 (AAA)
- UI components and graphics: 3:1 (AA)

Tools for checking: Colour Contrast Analyser, WCAG Color Contrast Checker.

### Color Blindness Considerations
About 8% of men and 0.5% of women have color vision deficiency. Types:
- Deuteranopia/Deuteranomaly: Red-green (most common)
- Protanopia/Protanomaly: Red-green (different type)
- Tritanopia: Blue-yellow (rare)

Design principles: Never use color as the only information channel. Add icons, patterns, or labels. Test with simulation tools (e.g., Colour Blindness Simulator).

## Design System Color Scales

Design systems typically define color scales with 10 shades per hue:

```
Blue:
50:  #EFF6FF  (lightest, backgrounds)
100: #DBEAFE
200: #BFDBFE
300: #93C5FD
400: #60A5FA
500: #3B82F6  (base color, primary actions)
600: #2563EB
700: #1D4ED8
800: #1E40AF
900: #1E3A8A  (darkest, dark mode)
```

This is the Tailwind CSS blue scale format, widely adopted in design systems.

## Using This Tool

Enter a base color or generate one randomly, then select a harmony type to instantly see a matching color palette. The tool provides hex codes for each color, a visual preview, and accessibility contrast information.

-> Try the [Color Palette Generator](/color-palette-generator)"""

articles['phone-formatter-guide'] = """## International Phone Number Formats

Phone numbers vary significantly across countries in their format, length, and dialing conventions. Understanding these differences is essential for applications that need to store, validate, display, or call phone numbers internationally.

## E.164: The International Standard

E.164 is the international standard for phone number formatting, used in APIs, databases, and telecommunications systems:

```
+[country code][subscriber number]

Examples:
+12025550100      US, Washington DC
+447700900100     UK, mobile
+8613800138000    China, mobile
+4930901820       Germany, Berlin landline
```

E.164 format:
- Starts with + (plus sign)
- Country code (1-3 digits)
- Subscriber number (national significant number)
- Maximum 15 digits total (excluding the +)

## Common Country Phone Formats

| Country | Code | Format | Example |
|---|---|---|---|
| United States | +1 | (XXX) XXX-XXXX | (202) 555-0100 |
| United Kingdom | +44 | 07XXX XXXXXX | 07700 900100 |
| Germany | +49 | 0XXX XXXXXXX | 030 901820 |
| France | +33 | 0X XX XX XX XX | 01 23 45 67 89 |
| Japan | +81 | 0X-XXXX-XXXX | 03-1234-5678 |
| China | +86 | 1XX XXXX XXXX | 138 0013 8000 |
| India | +91 | XXXXX XXXXX | 98765 43210 |
| Brazil | +55 | (XX) XXXXX-XXXX | (11) 98765-4321 |
| Australia | +61 | 0X XXXX XXXX | 02 1234 5678 |
| Russia | +7 | 8 (XXX) XXX-XX-XX | 8 (495) 123-45-67 |

## Phone Number Parsing

Phone number parsing (converting user input to E.164) is more complex than it appears. Libraries like `libphonenumber` (Google) handle:

- Extracting country code from various input formats
- Normalizing different separators (spaces, hyphens, dots, parentheses)
- Validating that the number is valid for the given country
- Determining number type (mobile, landline, toll-free, premium)

```javascript
// Using libphonenumber-js
import { parsePhoneNumber } from 'libphonenumber-js';

const phone = parsePhoneNumber('+12025550100');
console.log(phone.country);        // 'US'
console.log(phone.nationalNumber); // '2025550100'
console.log(phone.number);         // '+12025550100'
console.log(phone.formatNational()); // '(202) 555-0100'
console.log(phone.formatInternational()); // '+1 202 555 0100'
console.log(phone.isValid());      // true
```

## Display Formats

The same phone number can be displayed in multiple ways depending on context:

| Format | Example |
|---|---|
| E.164 (API/database) | +12025550100 |
| International display | +1 202 555 0100 |
| National (US context) | (202) 555-0100 |
| URI (tel: link) | tel:+12025550100 |

Always store phone numbers in E.164 format in databases. Display in national format based on the user's locale.

## Validation Considerations

Simple regex validation (e.g., 10 digits) is insufficient for international phone numbers. Proper validation requires country-specific rules:
- US numbers must be 10 digits with valid area code
- UK numbers have different lengths for different regions and types
- Some countries have number ranges reserved for specific uses

Always use a library like `libphonenumber` rather than regex for phone validation.

## Phone Numbers in HTML

Use the `tel:` URI scheme for clickable phone numbers (especially important on mobile):

```html
<a href="tel:+12025550100">(202) 555-0100</a>
```

For business contact pages, use structured data:
```html
<span itemprop="telephone">+1 (202) 555-0100</span>
```

## Using This Tool

Enter any phone number in any format and select the country to parse and format it. The tool shows the E.164 form, national format, international format, and validation status. Supports all countries with phone number data from the libphonenumber database.

-> Try the [Phone Parser & Formatter](/phone-parser-and-formatter)"""

articles['iban-validator-guide'] = """## What Is an IBAN?

IBAN (International Bank Account Number) is an internationally agreed standard for identifying bank accounts when processing international transfers. Originally created for EU countries to simplify cross-border payments, IBAN adoption has spread to over 80 countries.

## IBAN Structure

An IBAN consists of:
1. **Country code** (2 uppercase letters, ISO 3166-1 alpha-2)
2. **Check digits** (2 numeric digits)
3. **Basic Bank Account Number (BBAN)** (up to 30 alphanumeric characters, country-specific format)

```
GB82WEST12345698765432
│ │  │   │         └── Account number
│ │  │   └──────────── Sort code (UK)
│ │  └──────────────── Bank code (WEST)
│ └─────────────────── Check digits (82)
└───────────────────── Country code (GB)
```

## IBAN by Country

| Country | Code | Length | Format |
|---|---|---|---|
| Germany | DE | 22 | DE + 2 + 18 |
| UK | GB | 22 | GB + 2 + 4 letters + 14 digits |
| France | FR | 27 | FR + 2 + 23 |
| Spain | ES | 24 | ES + 2 + 20 |
| Netherlands | NL | 18 | NL + 2 + 4 letters + 10 digits |
| Italy | IT | 27 | IT + 2 + 1 letter + 10 digits + 12 digits |
| Switzerland | CH | 21 | CH + 2 + 19 |
| Poland | PL | 28 | PL + 2 + 24 |
| USA | N/A | N/A | USA does not use IBAN |

Note: The United States, Canada, Australia, New Zealand, and some other countries do not use IBAN for domestic transfers, though some US banks do issue IBANs for international transfers.

## IBAN Validation Algorithm

IBAN validation uses a specific checksum algorithm based on modulo 97:

1. Move the first 4 characters to the end:
   `GB82WEST12345698765432` → `WEST12345698765432GB82`

2. Replace letters with numbers (A=10, B=11, ..., Z=35):
   `W=32, E=14, S=28, T=29` → `3214282912345698765432211182`

3. Calculate modulo 97 of the resulting integer:
   `3214282912345698765432211182 mod 97 = 1`

4. If the result is 1, the IBAN is valid.

```javascript
function validateIBAN(iban) {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());
  
  // Modulo 97 for large numbers (process in chunks)
  let remainder = '';
  for (const char of numeric) {
    remainder = ((remainder + char) % 97).toString();
  }
  return parseInt(remainder) === 1;
}
```

## IBAN vs SWIFT/BIC

IBAN and SWIFT/BIC codes serve different purposes in international banking:

| | IBAN | SWIFT/BIC |
|---|---|---|
| Identifies | Bank account | Bank/branch |
| Length | 15-34 characters | 8 or 11 characters |
| Required for | Beneficiary account | Routing to correct bank |
| Used in | SEPA (Europe + others) | Global wire transfers |

For international transfers, you typically need both: the IBAN identifies the account, and the SWIFT/BIC code routes the transfer to the correct bank.

## SEPA: Single Euro Payments Area

Within the SEPA zone (EU + Iceland, Norway, Liechtenstein, Switzerland, UK), IBAN enables:
- **SEPA Credit Transfer**: One-time payment (settles in 1 business day)
- **SEPA Direct Debit**: Recurring payments (like standing orders)
- **SEPA Instant Credit Transfer**: Real-time payment (within 10 seconds, 24/7)

SEPA payments use IBAN only (no SWIFT/BIC required within the zone).

## Security and Fraud

While IBANs don't directly enable fraud (you need additional credentials to make transfers), sharing IBANs:
- Enables direct debit setup (others can pull money from your account)
- Reveals bank and country of residence

For receiving payments, sharing your IBAN is generally safe. For setting up direct debits, verify the merchant's legitimacy.

## Using This Tool

Enter any IBAN to validate it using the MOD 97 algorithm. The tool shows the country, check digits, bank account number components, and whether the IBAN is valid. Supports all countries in the IBAN registry.

-> Try the [IBAN Validator](/iban-validator-and-parser)"""

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
