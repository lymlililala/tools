#!/usr/bin/env python3
"""
Batch 7: Re-do batch4 articles that failed + xml-to-json-guide
All content uses raw strings (r prefix) to avoid Python escape issues
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

articles['string-obfuscator-guide'] = r"""## What Is String Obfuscation?

String obfuscation is the process of making text harder to read or understand while preserving its core meaning or functionality. Unlike encryption (which completely hides data), obfuscation obscures information in ways that are often still technically readable but practically confusing. This technique has legitimate uses in privacy masking, code protection, puzzle design, and anti-spam measures.

## Common Obfuscation Techniques

### Character Substitution
Replace characters with visually similar alternatives. Leet speak replaces letters with numbers (H3ll0 W0rld). Homoglyphs use characters from other Unicode scripts that look identical to Latin letters but have different code points — a technique used both creatively and maliciously.

### Caesar Cipher and ROT13
Shift each letter by N positions in the alphabet. ROT13 shifts by 13 positions, making it its own inverse — applying it twice returns the original text. Popular for hiding puzzle spoilers and text that shouldn't be immediately readable.

### Base64 Encoding
Not encryption, but makes text unreadable at a glance. Converts binary data to a 64-character alphabet. A common misconception is that Base64 provides security — it provides no security whatsoever, only superficial obscurity.

### Binary and Hex Representation
Convert text to binary (01001000 for 'H') or hexadecimal (0x48 for 'H'). Used in technical contexts to represent text at the byte level, and sometimes in CTF (Capture the Flag) security challenges.

### HTML Entity Encoding
Convert characters to their HTML entity equivalents. Primarily used for preventing HTML injection, but can be used for obfuscation — an email address encoded as HTML entities is unreadable to naive scrapers.

## Purpose of String Obfuscation

### Code Obfuscation
JavaScript minifiers and obfuscators make code hard to reverse engineer. Software vendors use obfuscation to protect intellectual property in client-side code. Variable names become meaningless single characters, string literals are encoded, and control flow is artificially complicated.

### Anti-Spam Email Protection
Email addresses on websites are often obfuscated to prevent scraping by bots. Displaying "user [at] example [dot] com" or encoding the address as HTML entities makes it unreadable to simple text extractors while remaining understandable to human readers.

### Privacy Masking
Partially hiding sensitive information for display purposes:
- Credit cards: shown as **** **** **** 4242
- Phone numbers: (555) ***-7890
- Email addresses: j***@example.com
- Social Security Numbers: ***-**-1234

This is standard practice in customer service interfaces, receipts, and user account pages.

### Puzzle Design
Escape rooms, treasure hunts, ARGs (Alternate Reality Games), and coding challenges use obfuscation as a puzzle element. Participants must recognize and reverse the transformation to find the hidden message.

## Obfuscation vs Encryption

| Property | Obfuscation | Encryption |
|----------|-------------|------------|
| Reversible | Often yes (no key needed) | Yes (with key) |
| Security | Low — security through obscurity | High — mathematical foundation |
| Purpose | Confusion, code protection | Data confidentiality |
| Common tools | Base64, ROT13, minifiers | AES, RSA, bcrypt |

A critical principle: **obfuscation should never replace encryption for security purposes.** It's trivially reversible by anyone with technical knowledge. Using Base64 to "secure" sensitive data is not security — it's security theater.

## Detecting Obfuscated Text

Security analysts often need to identify and reverse obfuscation:
- Base64 strings typically end with `=` or `==` padding and use A-Z, a-z, 0-9, +, /
- ROT13 can be identified by unusual letter frequencies
- Hex strings contain only 0-9 and A-F
- HTML entity sequences start with `&` and end with `;`

## Using the String Obfuscator Tool

Enter your text and select an obfuscation method. The tool applies the transformation and shows the result. Options typically include ROT13, Base64, reversed text, leet speak, HTML entity encoding, and URL encoding. Use it for creating puzzles, hiding text from casual viewers, teaching about encoding techniques, or generating creative typographic variations.
"""

articles['text-statistics-guide'] = r"""## What Are Text Statistics?

Text statistics provide quantitative measurements about a body of text: word count, character count, sentence count, reading time, readability scores, and frequency analysis. These metrics are valuable for writers, editors, students, SEO specialists, and anyone who needs to understand or report on text characteristics.

## Core Text Metrics

### Word Count
The most fundamental text metric. A "word" is typically defined as a sequence of characters separated by whitespace. Academic and professional contexts vary in counting rules — some exclude articles, some count hyphenated compounds as one word, some handle contractions differently.

Content platforms often have word count requirements:
- Blog posts: typically 1,500-3,000 words for SEO value
- Academic papers: specified by institution or journal
- Novel manuscripts: typically 80,000-100,000 words
- Short stories: 1,000-15,000 words

### Character Count
Can be measured with or without spaces. Important for:
- Social media (Twitter's 280-character limit)
- SMS messages (160 characters before multi-part)
- Database column lengths
- Meta descriptions (155-160 characters for SEO)
- Title tags (50-60 characters for SEO)

### Sentence Count and Average Sentence Length
Longer sentences are harder to read. Recommended average sentence length varies by audience:
- General web content: 15-20 words
- Academic writing: up to 25-30 words
- Children's content: under 10 words

### Paragraph Count and Structure
Paragraph length affects readability, especially on screens. Web content typically benefits from shorter paragraphs (3-5 sentences) to create visual breathing room and support scanning.

## Readability Scores

### Flesch Reading Ease
Scale from 0-100, where higher scores indicate easier reading:
- 90-100: Very easy (4th grade)
- 70-80: Easy (6th grade)
- 60-70: Standard (8th-9th grade)
- 50-60: Fairly difficult (10th-12th grade)
- 0-30: Very difficult (college/professional)

### Flesch-Kincaid Grade Level
Translates readability to US school grade level. Calculated from average sentence length and average syllables per word.

### Gunning Fog Index
Emphasizes complex words (3+ syllables). Especially useful for business writing — many corporate documents score 15-20 when the recommendation is 12 or below.

### SMOG Grade
Simple Measure of Gobbledygook. Counts polysyllabic words to estimate the education needed to understand the text.

## Word Frequency Analysis

Analyzing which words appear most frequently reveals:
- **SEO keyword density**: Ensure target keywords appear naturally but not excessively (1-3% is typically appropriate)
- **Topic focus**: Most frequent content words should match the article's claimed topic
- **Style issues**: Overused words that could be varied for more interesting writing
- **Stop words**: Common words (the, and, is, in) that don't convey meaning and should typically be excluded from frequency analysis

## Reading Time Estimation

Average adult reading speeds:
- Silent reading: 200-250 words per minute
- Professional reading: 250-300 words per minute
- Speed reading: 400+ words per minute

Most reading time estimators use 200-250 words per minute. A 1,500-word article takes approximately 6-7 minutes to read.

## Practical Applications

### Content Marketing
SEO best practices recommend certain article lengths for competitive rankings. Text statistics help writers hit target word counts without padding.

### Academic Writing
Assignments specify minimum and maximum lengths. Statistics tools track progress without manually counting.

### Editing
Objective metrics identify sentences that are too long, paragraphs that run on, and readability issues that subjective editing might miss.

## Using the Text Statistics Tool

Our tool provides:
1. **Instant statistics** as you type or paste text
2. **Multiple readability scores** including Flesch, Gunning Fog, and SMOG
3. **Word frequency table** with the top most-common words
4. **Estimated reading time** based on configurable reading speed
5. **Character counts** with and without spaces and punctuation
6. **Paragraph and sentence breakdown** for structural analysis

Paste your draft to get an immediate readability assessment and identify areas that need simplification or expansion.
"""

articles['chronometer-guide'] = r"""## Chronometer, Stopwatch, and Timer: What's the Difference?

These three time-measurement tools serve related but distinct purposes:

- **Chronometer**: A precision timekeeping instrument. Measures elapsed time from a start point with high accuracy. Historically refers to marine chronometers used for celestial navigation.
- **Stopwatch**: Records elapsed time, can be paused and resumed, often includes lap functionality.
- **Timer**: Counts down from a set time to zero, often with an alarm. Used for time-boxing tasks.

Our chronometer functions as a high-precision stopwatch with lap recording capability.

## How Computer Timing Works

### The Performance API
Modern browsers provide the `Performance.now()` API for high-resolution timing:

```javascript
const start = performance.now();
// ... measured operation ...
const elapsed = performance.now() - start;
// elapsed is in milliseconds, with sub-millisecond precision
```

Unlike `Date.now()` (millisecond precision, affected by system clock changes), `performance.now()` is a monotonic clock with microsecond resolution, perfect for stopwatch applications.

### JavaScript Event Loop Limitations
JavaScript runs in a single-threaded event loop. Visual updates happen through `requestAnimationFrame` at 60fps (approximately 16.7ms intervals). For a smooth, accurate display, the chronometer updates visually every frame while tracking time with high-resolution timestamps.

## Lap and Split Times

Most professional stopwatches support two timing modes:

### Lap Mode
Records the time for each individual segment:
- Lap 1: 0:45.32
- Lap 2: 0:47.18 (this lap only)
- Lap 3: 0:44.95 (this lap only)

Used in athletics to track pace consistency across repetitions.

### Split Mode
Records cumulative time at each checkpoint:
- Split 1: 0:45.32
- Split 2: 1:32.50 (total elapsed at checkpoint 2)
- Split 3: 2:17.45 (total elapsed at checkpoint 3)

Used in races to track overall pace relative to goals.

## Practical Applications

### Sports Training
- Interval training: Time work and rest periods precisely
- Pace tracking: Measure lap times to ensure consistent pace
- Personal records: Accurately capture times for comparison

### Productivity and Time Management
- Pomodoro technique: 25-minute focused work intervals
- Time auditing: Measure how long specific tasks actually take
- Meeting time-boxing: Hold discussions to agreed durations

### Development and Testing
- Manual performance benchmarking
- Tracking time for code reviews or testing sessions
- Measuring user workflow completion times

### Cooking and Science
- Timing chemical reactions or cooking processes
- Measuring intervals between events in experiments

## Time Display Formats

Chronometers typically display in HH:MM:SS.ms format:
- Hours: Relevant for long runs or endurance events
- Minutes: The primary unit for most applications
- Seconds: Core precision unit
- Milliseconds: Important for athletics and precise measurement

For sub-second sports (swimming, sprinting), hundredths or thousandths of seconds determine race outcomes.

## Using the Chronometer Tool

Our tool provides:
1. **Start/Stop** — Begin and pause timing with a single button
2. **Lap recording** — Record lap or split times without stopping
3. **Reset** — Clear all measurements and return to zero
4. **Lap table** — View all recorded laps with individual and cumulative times
5. **Export** — Copy lap data as text for analysis
6. **Keyboard shortcuts** — Space to start/stop, L for lap, R for reset

The chronometer maintains accuracy even when the browser tab is backgrounded, using `performance.now()` for reliable timing regardless of display refresh rate.
"""

articles['benchmark-builder-guide'] = r"""## What Is Performance Benchmarking?

Performance benchmarking measures the execution speed of code to compare implementations, identify bottlenecks, and guide optimization decisions. A benchmark runs code repeatedly and reports statistical measures of execution time.

## Why Benchmark Code?

Micro-benchmarks help you:
- **Compare algorithm implementations**: Is quicksort or mergesort faster for your use case?
- **Choose between library functions**: Is `Array.map()` or a `for` loop faster for your data size?
- **Validate optimizations**: Did your "optimization" actually improve performance?
- **Understand scaling**: How does performance change as data size grows?
- **Set performance budgets**: Document expected performance characteristics

## The Benchmark Setup-Test-Teardown Pattern

A well-structured benchmark has three phases:

```javascript
// Setup: Prepare data and state (not measured)
const data = generateLargeArray(10000);

// Test: The measured code (run many times)
function testCase() {
  return data.filter(x => x > 500).map(x => x * 2);
}

// Teardown: Cleanup (not measured)
data = null;
```

The setup phase ensures the benchmark measures only the relevant code, not initialization costs.

## Statistical Considerations

### Why Run Multiple Iterations?
A single measurement is meaningless — JavaScript engines vary, garbage collection pauses occur, OS scheduling interrupts execution. Running thousands of iterations and calculating statistics gives reliable results.

### Key Statistical Measures
- **Mean**: Average execution time across all runs
- **Median**: Middle value — less affected by outliers than mean
- **Standard Deviation**: Measures variability — low SD means consistent results
- **Min/Max**: Fastest and slowest observed runs
- **Operations per Second (ops/sec)**: How many times the function can run per second

### Margin of Error
A benchmark that shows "Function A: 1.2M ops/sec ± 3%" means the true value is likely between 1.164M and 1.236M ops/sec. If two functions' ranges overlap, they're statistically equivalent.

## JavaScript Engine Optimizations

Modern JavaScript engines (V8, SpiderMonkey) have sophisticated optimization pipelines that complicate benchmarking:

### JIT Compilation
JavaScript is Just-In-Time compiled. The first runs of a function are slow (interpreted), then the engine profiles "hot" functions and compiles them to native machine code. Benchmark libraries handle this by warming up functions before measuring.

### Dead Code Elimination
If the engine detects a function's result is never used, it may optimize away the work entirely, giving misleadingly fast results. Always use the result of benchmarked code.

### Inline Caches
The engine caches type information to speed repeated operations. Benchmarks with consistent types may be unrealistically fast if production code uses mixed types.

## Popular JavaScript Benchmark Libraries

### Benchmark.js
The classic choice, used by jsPerf.com:
```javascript
var suite = new Benchmark.Suite;
suite
  .add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  .run({ async: true });
```

### tinybench
Lightweight modern alternative with async support and TypeScript types.

### Vitest bench
Built into Vitest for developers already using the Vitest testing framework.

## Macro vs. Micro Benchmarks

### Micro-Benchmarks
Test a single function or operation in isolation. Fast to run, easy to understand, but may not reflect production conditions due to JIT and cache warmup effects.

### Macro-Benchmarks
Test complete workflows or features in realistic conditions. Slower to run but more representative of real-world performance.

For most development decisions, micro-benchmarks on the specific operation you're optimizing are sufficient.

## Using the Benchmark Builder Tool

Our tool provides:
1. **Multiple test cases** — Add and compare several implementations simultaneously
2. **Setup/teardown code** — Initialize shared state without affecting measurements
3. **Iteration control** — Configure how many times each test runs
4. **Live results** — See operations per second and relative performance
5. **Statistical data** — View mean, median, and margin of error
6. **Copy results** — Share benchmark results as formatted text

Write your competing implementations, click Run, and get immediate, statistically valid performance comparisons.
"""

articles['qr-code-generator-guide'] = r"""## What Is a QR Code?

A **QR Code** (Quick Response Code) is a two-dimensional barcode that can store data — URLs, text, contact information, payment details — and be read by any smartphone camera. Invented in 1994 by Denso Wave (a Toyota subsidiary) for tracking automotive parts, QR codes have become universal communication bridges between physical and digital worlds.

## QR Code Structure

A QR code consists of several functional areas:

### Finder Patterns
The three square patterns in corners allow scanners to detect the code's position and orientation from any angle, at any distance.

### Alignment Patterns
Additional smaller patterns (in larger QR codes) allow accurate reading even when the code is slightly distorted or on a curved surface.

### Timing Patterns
Alternating black and white modules that help determine the coordinate system and size of the code.

### Data Modules
The remaining cells encode the actual data along with error correction information.

## Error Correction Levels

QR codes support four error correction levels, allowing codes to be read even when partially damaged:

| Level | Data Recovery | Use Case |
|-------|--------------|----------|
| L (Low) | 7% | Clean environments, maximize data capacity |
| M (Medium) | 15% | General purpose |
| Q (Quartile) | 25% | Industrial environments |
| H (High) | 30% | High damage risk, allows logo overlay |

Higher error correction means more redundant data but larger code size. For codes with logo overlays (which intentionally obscure part of the code), use Level H.

## QR Code Data Types

QR codes can encode different types of data optimized for efficiency:

### URL
The most common use — encode any web URL. Include the `https://` prefix for automatic opening in browsers.

### Wi-Fi Credentials
Format: `WIFI:T:WPA;S:NetworkName;P:Password;;`
Allows automatic network joining by scanning.

### Contact Information (vCard)
Shares complete contact details in a single scan, including name, phone, email, and address.

### Plain Text
Any text up to approximately 3KB (at low error correction) can be stored.

### Email and SMS
Pre-populates email compose or SMS with recipient and content.

### Geographic Coordinates
Opens maps application at specific latitude/longitude.

## QR Code Versions and Capacity

QR codes come in 40 versions, from 21x21 pixels (Version 1) to 177x177 pixels (Version 40). Larger versions store more data:

| Version | Grid Size | Numeric | Alphanumeric | Binary |
|---------|-----------|---------|-------------|--------|
| 1 | 21x21 | 41 | 25 | 17 |
| 5 | 37x37 | 154 | 93 | 64 |
| 10 | 57x57 | 440 | 267 | 174 |
| 40 | 177x177 | 7,089 | 4,296 | 2,953 |

For URL QR codes, keep URLs short for best scanning reliability.

## QR Code Design Best Practices

### Size
- Minimum: 2cm x 2cm for scanning at arm's length
- For print: At least 300 DPI
- Add quiet zone: White border equal to 4 module widths

### Color
- High contrast required: dark modules on light background
- Inverted (light on dark) works but less reliably
- Avoid low-contrast combinations like dark blue on black

### Logo Overlay
Logos can be added in the center (using H error correction) covering up to 30% of the code. A common branding technique on marketing materials.

### Testing
Always test with multiple devices and scanners before printing. Test at actual size, not just on screen.

## Common Use Cases

- **Marketing**: Link printed materials to digital content
- **Restaurant menus**: Contactless menu access (popularized during COVID-19)
- **Event tickets**: Digital ticketing and entry verification
- **Product authentication**: Anti-counterfeiting verification
- **Business cards**: Quick contact information sharing
- **Payments**: WeChat Pay, PayPal, bank payment codes
- **App store links**: Direct links to iOS App Store or Google Play

## Using the QR Code Generator

Our tool:
1. **Enter any URL or text** in the input field
2. **Choose error correction level** based on your use case
3. **Customize appearance** — adjust colors and add quiet zone
4. **Preview** the generated QR code instantly
5. **Download** as SVG (scalable) or PNG (for specific sizes)

The SVG format is ideal for print — it scales to any size without pixelation.
"""

articles['svg-placeholder-guide'] = r"""## What Is an SVG Placeholder?

An SVG placeholder is a lightweight vector image used as a temporary visual while the real image loads, as a default fallback when no image is available, or as a deliberately simple design element. SVG (Scalable Vector Graphics) placeholders are preferred over raster placeholders because they scale perfectly at any size and are typically just a few hundred bytes.

## Why Use SVG Placeholders?

### Image Loading Performance
Large images slow page loads. Techniques that improve perceived performance:

**LQIP (Low-Quality Image Placeholder)**: Show a tiny, blurred version of the actual image while the full version loads. Creates a smooth loading experience.

**Skeleton screens**: Show the layout structure with gray placeholder shapes before content arrives. Used extensively by Facebook, LinkedIn, and YouTube.

**Dominant color**: Extract the most prominent color from an image and use it as a solid-color placeholder, creating visual continuity.

### Development and Testing
When building UIs before real content exists, SVG placeholders:
- Show image dimensions without requiring real images
- Display dimensions, file type, or ID as text within the placeholder
- Use consistent visual language across development environments

### Error States
When an image fails to load, show a meaningful placeholder instead of a broken image icon:
```html
<img src="photo.jpg" 
     onerror="this.src='placeholder.svg'"
     alt="User photo" />
```

## SVG Placeholder Formats

### Solid Color with Text
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="100%" height="100%" fill="#CCCCCC"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" 
        font-family="sans-serif" fill="#666">400x300</text>
</svg>
```

### Gradient Background
More visually appealing placeholder that suggests depth and texture without additional weight.

### Icon-based
Common placeholder patterns include person silhouettes for avatar placeholders, landscape icons for photo placeholders, and document icons for file type indicators.

### Blur Hash
WASM-based technique that encodes a tiny perceptual hash of an image. The hash can be rendered as a blurred placeholder that matches the color palette of the eventual image.

## Using SVG Placeholders in CSS

### Background Image
```css
.product-image {
  background-image: url("data:image/svg+xml,...");
  background-size: cover;
  width: 300px;
  height: 200px;
}
```

### Lazy Loading with IntersectionObserver
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

## Aspect Ratio Preservation

A key challenge with image placeholders is preventing layout shift (CLS — Cumulative Layout Shift). The SVG viewBox attribute and CSS padding-bottom hack both solve this:

```css
/* Aspect ratio placeholder (16:9) */
.image-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  overflow: hidden;
}
.image-wrapper img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Common Placeholder Services

Several online services generate placeholder images on demand:
- **placeholder.com**: `https://via.placeholder.com/400x300`
- **placehold.co**: `https://placehold.co/400x300`
- **picsum.photos**: `https://picsum.photos/400/300` (random real photos)
- **dummyimage.com**: Customizable size, color, and text

## Using the SVG Placeholder Generator

Our tool:
1. **Set dimensions** — width and height in pixels
2. **Choose background color** — solid or gradient options
3. **Add text** — size label, custom message, or empty
4. **Select style** — plain, dotted, striped, or icon-based
5. **Get SVG code** — copy raw SVG for embedding
6. **Get data URL** — copy as base64 data URL for CSS/HTML

Generated placeholders are minimal and render instantly, making them ideal for development environments and production fallback states.
"""

articles['color-palette-generator-guide'] = r"""## Color Theory Fundamentals

A color palette is a curated set of colors that work harmoniously together. Understanding color theory principles helps create palettes that are visually pleasing, accessible, and appropriate for their context.

## Color Models

### RGB (Red, Green, Blue)
The additive color model used by screens. Colors are created by combining light:
- `rgb(255, 0, 0)` — Pure red
- `rgb(0, 0, 255)` — Pure blue
- `rgb(255, 255, 255)` — White (all colors combined)
- `rgb(0, 0, 0)` — Black (no light)

### HSL (Hue, Saturation, Lightness)
More intuitive for color manipulation:
- **Hue**: The color angle on the color wheel (0-360°, where 0=red, 120=green, 240=blue)
- **Saturation**: Color intensity (0% = gray, 100% = full color)
- **Lightness**: Brightness (0% = black, 50% = normal, 100% = white)

HSL is preferred for programmatically adjusting colors because changing saturation or lightness doesn't shift the hue.

### CMYK (Cyan, Magenta, Yellow, Key/Black)
The subtractive color model used in printing. Colors are created by absorbing light. Designs for print must be converted from RGB to CMYK, often with noticeable color shifts.

## Color Harmony Types

### Complementary Colors
Colors opposite each other on the color wheel. High contrast, vibrant combinations.
- Example: Blue (#0000FF) and Orange (#FF7F00)
- Best for: Call-to-action elements, sports teams, logos needing high visibility

### Analogous Colors
Adjacent colors on the wheel. Harmonious, natural-looking palettes.
- Example: Blue, Blue-Green, Green
- Best for: Nature themes, calm environments, professional services

### Triadic Colors
Three colors equally spaced on the wheel (120° apart).
- Example: Red, Yellow, Blue
- Best for: Vibrant, energetic designs; children's products; playful brands

### Split-Complementary
A base color plus two colors adjacent to its complement. Less tension than complementary, more contrast than analogous.

### Tetradic (Square/Rectangle)
Four colors forming a square or rectangle on the wheel. Rich palettes but challenging to balance.

### Monochromatic
Variations of a single hue through different tints (lighter), shades (darker), and tones (mixed with gray). Sophisticated, elegant, never clashes.

## Building a Practical UI Color Palette

A complete design system color palette includes:

### Primary Colors (Brand Colors)
1-3 core brand colors. Should work well on white and dark backgrounds.

### Neutral Colors
Grays for text, backgrounds, borders, and dividers. Typically 8-10 shades from near-white to near-black.

### Semantic Colors
- **Success**: Green variants
- **Warning**: Yellow/amber variants
- **Error**: Red variants
- **Info**: Blue variants

### Accent Colors
Optional accent colors for highlights, badges, and special UI elements.

## Accessibility: Color Contrast

WCAG 2.1 (Web Content Accessibility Guidelines) requires:
- Normal text: 4.5:1 contrast ratio minimum (AA standard)
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- Non-text UI components: 3:1 minimum
- AAA standard: 7:1 for normal text

Contrast ratio is calculated from the relative luminance of foreground and background colors. Tools like the WebAIM Contrast Checker verify compliance.

Never rely on color alone to convey meaning — always pair with icons, text, or patterns for color-blind accessibility.

## Color Psychology

Colors carry cultural and psychological associations:
- **Red**: Urgency, passion, danger, excitement
- **Blue**: Trust, calm, professionalism, technology
- **Green**: Nature, growth, health, money
- **Yellow**: Optimism, warmth, caution, energy
- **Purple**: Luxury, creativity, mystery
- **Orange**: Enthusiasm, creativity, warmth
- **White**: Cleanliness, simplicity, space
- **Black**: Sophistication, power, elegance

## Using the Color Palette Generator

Our tool:
1. **Input a base color** — hex, RGB, or HSL
2. **Choose harmony type** — complementary, analogous, triadic, etc.
3. **Generate the palette** — instantly creates matching colors
4. **View in context** — preview colors on sample UI components
5. **Adjust shades** — generate light/dark variants for each palette color
6. **Copy in any format** — hex, RGB, HSL, CSS variables, or design token JSON
7. **Check contrast** — validate all color pairs against WCAG standards

Use it to build consistent, accessible, and beautiful color systems for your projects.
"""

articles['phone-formatter-guide'] = r"""## International Phone Number Standards

Phone numbers vary enormously across countries in length, format, and routing. The **E.164 standard** (ITU-T recommendation) provides a universal format for international phone numbers used in telecommunications systems worldwide.

## E.164 Format

The E.164 international phone number format:
```
+[country code][area code][subscriber number]
```

Requirements:
- Starts with `+` (international prefix)
- Maximum 15 digits total (excluding the `+`)
- No spaces, dashes, or parentheses

Examples:
- US number: `+12125551234` (country code 1, area code 212)
- UK number: `+442071234567` (country code 44)
- Japan: `+81312345678` (country code 81)

E.164 is used by SMS gateways, VoIP systems, CRM platforms, and telephony APIs like Twilio.

## National vs. International Format

The same number can appear very differently in national vs. international format:

| Country | National Format | International (E.164) |
|---------|----------------|----------------------|
| USA | (800) 555-0100 | +18005550100 |
| UK | 020 7946 0958 | +442079460958 |
| Germany | 030 12345678 | +493012345678 |
| France | 01 23 45 67 89 | +33123456789 |
| Australia | (02) 1234 5678 | +61212345678 |
| Japan | 03-1234-5678 | +81312345678 |

Note: National formats often omit the country code and use local area code notation with various separators.

## Country Codes Reference

Common international dialing codes (country calling codes):
- +1: USA, Canada, and Caribbean countries
- +7: Russia and Kazakhstan
- +20: Egypt
- +27: South Africa
- +33: France
- +34: Spain
- +44: United Kingdom
- +49: Germany
- +55: Brazil
- +61: Australia
- +81: Japan
- +82: South Korea
- +86: China
- +91: India
- +971: United Arab Emirates

## Phone Number Validation

Validating phone numbers is more complex than it appears:

### Basic Format Validation
```javascript
// Simple regex for E.164 format
const e164Regex = /^\+[1-9]\d{1,14}$/;
e164Regex.test('+12125551234'); // true
```

### libphonenumber
Google's libphonenumber library provides comprehensive validation using country-specific rules:
```javascript
// Using libphonenumber-js
import { parsePhoneNumber } from 'libphonenumber-js';
const phone = parsePhoneNumber('+12125551234');
phone.isValid(); // true
phone.country; // 'US'
phone.formatInternational(); // '+1 212 555 1234'
phone.formatNational(); // '(212) 555-1234'
```

libphonenumber knows the valid number patterns for every country and validates not just format but whether the specific number could actually exist.

## Phone Number Types

- **Geographic**: Fixed-line numbers tied to a location
- **Mobile**: Cell phone numbers
- **Toll-free**: 800/888/877 in the US; free to call
- **Premium rate**: Revenue-sharing numbers
- **VoIP**: Internet-based phone numbers
- **Short code**: 5-6 digit numbers for SMS services

The type affects validation rules and expected length.

## Storing Phone Numbers in Databases

Best practices:
1. **Always store in E.164 format**: Canonical, unambiguous, searchable
2. **Store as VARCHAR/TEXT**: Not as integer (leading zeros, + sign)
3. **Store original input separately**: If you need to display as entered
4. **Normalize on input**: Validate and convert to E.164 at registration

```sql
-- Good: E.164 stored as text
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_e164 VARCHAR(16),  -- +12125551234
  phone_display VARCHAR(30) -- (212) 555-1234
);
```

## Using the Phone Parser and Formatter

Our tool:
1. **Parse any phone number format** — handles parentheses, dashes, spaces, dots
2. **Detect country** — identifies country from calling code
3. **Validate the number** — checks against country-specific rules
4. **Convert formats** — display in E.164, international, or national format
5. **Show number type** — geographic, mobile, toll-free, etc.
6. **Batch processing** — parse multiple numbers at once from a CSV

Use it for standardizing phone numbers before database import, validating user input, and reformatting contact lists.
"""

articles['iban-validator-guide'] = r"""## What Is an IBAN?

**IBAN** (International Bank Account Number) is a standardized international system for identifying bank accounts, developed by the European Committee for Banking Standards (ECBS) and adopted by ISO as ISO 13616. Originally created to simplify EU cross-border transfers, IBAN is now used by over 77 countries.

## IBAN Structure

An IBAN consists of up to 34 alphanumeric characters:

```
[Country Code (2)] [Check Digits (2)] [Basic Bank Account Number (BBAN, up to 30 chars)]
```

Example — German IBAN:
```
DE89 3704 0044 0532 0130 00
DE   = Country code (Germany)
89   = Check digits (validates the IBAN)
3704 0044 0532 0130 00 = BBAN (national account number)
```

Example — UK IBAN:
```
GB29 NWBK 6016 1331 9268 19
GB   = Country code (United Kingdom)
29   = Check digits
NWBK = Sort code prefix / bank identifier
6016 13 = Sort code
31926819 = Account number
```

## How IBAN Validation Works

### The MOD-97-10 Algorithm
IBAN validation uses modulo-97 arithmetic:

1. Move the first four characters to the end: `3704 0044 0532 0130 00 DE89` becomes `3704004405320130 00 DE89`
2. Replace letters with numbers: A=10, B=11, ..., Z=35. `D`=13, `E`=14 → `37040044053201300013148 9`
3. Compute the number mod 97
4. If the result equals 1, the IBAN is valid

### What Validation Proves
- The IBAN passes the check digit algorithm
- The country code is recognized
- The BBAN length matches the country's expected length

What validation does NOT prove:
- The account actually exists
- The account belongs to the named person
- The transfer will succeed

## IBAN Country Formats

Each country has a specific BBAN format and total IBAN length:

| Country | Length | Example |
|---------|--------|---------|
| Germany (DE) | 22 | DE89 3704 0044 0532 0130 00 |
| France (FR) | 27 | FR76 3000 6000 0112 3456 7890 189 |
| Netherlands (NL) | 18 | NL91 ABNA 0417 1643 00 |
| Spain (ES) | 24 | ES91 2100 0418 4502 0005 1332 |
| Italy (IT) | 27 | IT60 X054 2811 1010 0000 0123 456 |
| Switzerland (CH) | 21 | CH93 0076 2011 6238 5295 7 |
| UK (GB) | 22 | GB29 NWBK 6016 1331 9268 19 |
| UAE (AE) | 23 | AE07 0331 2345 6789 0123 456 |

## IBAN vs. SWIFT/BIC

IBAN identifies the **account**; SWIFT/BIC identifies the **bank**:

```
BIC/SWIFT: NWBKGB2L
  NWBK = Bank code (NatWest)
  GB   = Country code
  2L   = Location code
```

International transfers typically require both:
- **IBAN**: Where the money goes (account)
- **SWIFT/BIC**: How to route it (bank)

## SEPA Transfers

The Single Euro Payments Area (SEPA) covers 36 European countries. SEPA transfers:
- Use only IBAN (no SWIFT/BIC required within SEPA since 2016)
- Are processed within 1 business day (SEPA Credit Transfer)
- Include instant payments up to €100,000 (SEPA Instant)
- Are free or low-cost within the Eurozone

## Common IBAN Errors

### Wrong Check Digits
Manually typed IBANs often have transposition errors. The check digit catches most single-character errors.

### Incorrect Length
A German IBAN must be exactly 22 characters. Extra or missing digits cause immediate validation failure.

### Formatting Issues
IBANs are often displayed in groups of 4 for readability (`DE89 3704 0044`) but transmitted without spaces. Validation tools should accept both formats.

## Using the IBAN Validator

Our tool:
1. **Enter any IBAN** — accepts spaces and uppercase/lowercase
2. **Validates format** — checks country code, length, and check digits
3. **Parses structure** — shows bank code, branch code, account number
4. **Identifies country** — full country name from ISO code
5. **Explains errors** — clear messages for invalid IBANs

Use it before processing international payments to catch data entry errors and prevent failed transfers.
"""

articles['json-to-csv-guide'] = r"""## Why Convert JSON to CSV?

JSON is the de facto standard for web APIs and configuration, while CSV (Comma-Separated Values) is the universal format for spreadsheets, data analysis, and database imports. Converting between them is a fundamental data engineering task.

**When you need JSON-to-CSV:**
- Exporting API data to Excel or Google Sheets for analysis
- Loading web application data into database tables
- Creating reports from JSON-structured data sources
- Sharing structured data with non-technical stakeholders
- Feeding data into machine learning pipelines that expect tabular format

## JSON Structures and CSV Mapping

### Flat JSON Array (Simple Case)
```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]
```

Maps directly to CSV:
```csv
id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com
```

### Nested Objects (Challenge)
```json
[
  {
    "id": 1,
    "user": {"name": "Alice", "age": 28},
    "address": {"city": "NYC", "country": "US"}
  }
]
```

Options for handling nesting:
1. **Flatten**: `user.name`, `user.age`, `address.city`, `address.country`
2. **JSON stringify**: Keep nested objects as JSON strings in the CSV cell
3. **Ignore**: Omit nested objects

Flattening is usually preferred for analysis.

### Arrays Within Objects (Challenge)
```json
[
  {"id": 1, "name": "Alice", "tags": ["admin", "editor"]}
]
```

Options:
1. **Join**: `"admin,editor"` (pipe or comma separated in a single cell)
2. **One row per value**: Creates multiple CSV rows per JSON object
3. **Multiple columns**: `tag1`, `tag2`, etc.

## CSV Format Specification (RFC 4180)

### Basic Rules
- Fields separated by commas
- Records separated by newlines (CRLF in RFC 4180)
- Optional header row
- Fields may be quoted with double quotes
- Quoted fields may contain commas and newlines
- To include a double quote: `""` (escape by doubling)

### Common Variations
CSV isn't fully standardized. Variations include:
- **Delimiter**: tab (`\t`), semicolon (`;`), pipe (`|`) instead of comma
- **Quote character**: Single quotes or no quotes
- **Line endings**: LF (Unix) vs. CRLF (Windows)
- **Encoding**: UTF-8, UTF-8 with BOM, Latin-1

Microsoft Excel uses semicolons as the default delimiter in many European locales (where commas are decimal separators), causing countless CSV parsing headaches.

## Handling Special Cases

### Empty Values
```json
{"id": 1, "name": null, "email": ""}
```
Null and empty string are both represented as empty CSV cells but have different semantics.

### Boolean Values
`true` and `false` in JSON become the strings "true" and "false" in CSV unless explicitly converted.

### Numeric Precision
JSON numbers can represent arbitrary precision floats. CSV transmits them as strings. Be cautious of floating-point precision loss during the round-trip.

### Unicode and Special Characters
All Unicode characters should be preserved. Cells containing commas, quotes, or newlines must be properly quoted.

## Programmatic Conversion

### JavaScript
```javascript
function jsonToCsv(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(h => JSON.stringify(obj[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
```

### Python (pandas)
```python
import pandas as pd
import json

with open('data.json') as f:
    data = json.load(f)

df = pd.json_normalize(data)  # Handles nested objects
df.to_csv('output.csv', index=False)
```

### Command Line (jq)
```bash
jq -r '["id","name","email"], (.[] | [.id, .name, .email]) | @csv' data.json
```

## Using the JSON-to-CSV Converter

Our tool:
1. **Paste JSON data** — arrays of objects or single objects
2. **Configure options** — delimiter choice, quote handling, nested object strategy
3. **Preview the output** — see the CSV table before downloading
4. **Handle arrays** — choose how to represent array values
5. **Download CSV** — get the file ready for Excel or database import
6. **Copy to clipboard** — paste directly into spreadsheets

The tool handles edge cases automatically: proper quoting of fields containing commas, escaping double quotes, and consistent column ordering from potentially inconsistent JSON objects.
"""

articles['number-formatter-guide'] = r"""## Why Number Formatting Matters

The same number can be written in dozens of ways depending on locale, context, and convention. Formatting numbers correctly is essential for financial applications, data dashboards, internationalized software, and anywhere numbers are displayed to human users.

## Locale-Specific Number Formats

Numbers are formatted differently around the world:

| Locale | Example Number | Formatted |
|--------|---------------|-----------|
| en-US (English, USA) | 1234567.89 | 1,234,567.89 |
| de-DE (German, Germany) | 1234567.89 | 1.234.567,89 |
| fr-FR (French, France) | 1234567.89 | 1 234 567,89 |
| en-IN (English, India) | 1234567.89 | 12,34,567.89 |
| ja-JP (Japanese, Japan) | 1234567.89 | 1,234,567.89 |
| ar-SA (Arabic, Saudi Arabia) | 1234567.89 | ١٬٢٣٤٬٥٦٧٫٨٩ |

Key differences:
- **Decimal separator**: Period (.) in English-speaking countries, comma (,) in Europe
- **Thousands separator**: Comma, period, space, or apostrophe depending on locale
- **Grouping**: Most use groups of 3, India uses the lakh system (2,2,3 grouping)
- **Digit characters**: Arabic, Persian, and other scripts have their own digit symbols

## The Intl.NumberFormat API

Modern JavaScript provides `Intl.NumberFormat` for locale-aware number formatting:

```javascript
// Currency formatting
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(1234567.89);
// → "$1,234,567.89"

new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
}).format(1234567.89);
// → "1.234.567,89 €"

// Compact notation
new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567);
// → "1.2M"

// Percentage
new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1
}).format(0.1234);
// → "12.3%"
```

## Number Display Formats

### Standard Decimal
The default representation with decimal separator and optional grouping.

### Scientific Notation
Useful for very large or very small numbers:
- `1.23456 × 10⁹` (typographic)
- `1.23456e9` (programming notation)

### Compact/Abbreviation
Makes large numbers readable at a glance:
- 1,200 → "1.2K"
- 1,500,000 → "1.5M"
- 1,000,000,000 → "1B"

Compact notation is widely used in dashboards, social media follower counts, and financial summaries.

### Percentage
Convert decimal fractions to percentage format: 0.1234 → 12.34%

### Currency
Add currency symbol, code, or both:
- Symbol: $1,234.56
- Code: USD 1,234.56
- Name: 1,234.56 US dollars

### Ordinal
Number position: 1st, 2nd, 3rd, 4th... (varies by language)

## Precision and Rounding

### Significant Digits
The number of meaningful digits in a value:
- `1,234.5678` rounded to 4 significant digits = `1,235`
- `0.001234` rounded to 4 significant digits = `0.001234`

### Decimal Places
Fixed number of digits after the decimal:
- `1234.5` with 2 decimal places = `1234.50`
- `1234.5678` with 2 decimal places = `1234.57` (rounded)

### Rounding Modes
- **Round half up**: 2.5 → 3 (common in everyday use)
- **Round half to even (banker's rounding)**: 2.5 → 2, 3.5 → 4 (minimizes systematic bias)
- **Truncate**: 2.9 → 2 (drops the fractional part)

## Financial Number Formatting

Finance requires particular care:
- Always show exactly 2 decimal places for currencies with cents
- Some currencies have no cents (JPY, KRW) — never show decimal places
- Some currencies use 3 decimal places (KWD, BHD)
- Display negative values with parentheses in accounting: `(1,234.56)` instead of `-1,234.56`
- Show exact values, not compact notation, in financial statements

## Using the Number Formatter Tool

Our tool:
1. **Enter any number** — integers, decimals, large or small
2. **Choose locale** — see formatting for any regional standard
3. **Select format type** — decimal, currency, percentage, compact, scientific
4. **Configure precision** — decimal places or significant digits
5. **Choose currency** — for currency formatting, select from all ISO 4217 codes
6. **Copy formatted result** — ready to paste anywhere

Use it for localization work, financial applications, dashboard design, and understanding how numbers appear to users in different countries.
"""

articles['device-information-guide'] = r"""## What Information Does Your Browser Share?

Every time you visit a website, your browser automatically shares information about your device and configuration. This data is used for analytics, compatibility checks, security, and unfortunately, fingerprinting for tracking. Understanding what's exposed helps you make informed privacy decisions.

## Browser-Exposed Information

### User Agent String
The most basic device identifier:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

Contains:
- Operating system (Windows 10, macOS, Android, iOS)
- Browser and version (Chrome 120)
- CPU architecture (x64)
- Browser engine (WebKit, Gecko, Blink)

User-Agent is being phased out in favor of the more privacy-preserving User-Agent Client Hints API, where websites request specific attributes rather than receiving everything.

### Screen Information
Available via JavaScript's `screen` object:
- **Width/Height**: Total screen dimensions (e.g., 2560x1440)
- **Available Width/Height**: Usable area excluding taskbar
- **Color Depth**: Bits per channel (usually 24-bit)
- **Pixel Ratio**: Physical to logical pixel ratio (1x on standard, 2x+ on Retina/HiDPI)

### Viewport Information
The visible area of the browser window:
- **Inner Width/Height**: Visible content area size
- **Outer Width/Height**: Browser window total size including toolbars
- **Page Offset**: Scroll position

### Connection Information
The Network Information API exposes:
- Connection type (wifi, cellular, ethernet)
- Effective connection type (4g, 3g, 2g, slow-2g)
- Estimated bandwidth
- Estimated latency

Not available in all browsers (Firefox has disabled it for privacy reasons).

### Battery Status
The Battery API (deprecated in many browsers) could expose:
- Battery level percentage
- Charging/discharging state
- Time until charged/discharged

Multiple browsers removed this API due to fingerprinting concerns.

### Hardware Concurrency
`navigator.hardwareConcurrency` reports the number of logical CPU cores available. Useful for deciding how many Web Workers to create.

### Device Memory
`navigator.deviceMemory` returns approximate RAM in gigabytes (rounded to the nearest power of 2 for privacy): 0.25, 0.5, 1, 2, 4, 8.

### Language and Locale
`navigator.language` and `navigator.languages` expose:
- Primary browser language
- Ordered list of preferred languages

Used for serving content in the user's language without requiring explicit selection.

### Online Status
`navigator.onLine` indicates whether the browser believes it has internet connectivity. Used to show offline-mode UI.

## Browser Fingerprinting

Combining multiple browser attributes creates a **fingerprint** — a identifier that may be unique to your device even without cookies:

### Canvas Fingerprinting
Drawing text/graphics to an invisible canvas and hashing the result. Different GPU drivers, fonts, and OS settings produce slightly different renderings, creating a fingerprint.

### WebGL Fingerprinting
Querying the GPU's capabilities and renderer string reveals the specific GPU and driver version.

### Audio Fingerprinting
AudioContext processing produces slightly different results on different hardware.

### Font Fingerprinting
Checking which fonts are installed (via CSS font loading detection) reveals OS and installed application signatures.

### Combined Entropy
Each attribute provides partial entropy. Combined, they can uniquely identify a device with high confidence even across browser sessions.

## Privacy Implications

Understanding device information exposure matters for:
- **Users**: Know what data you're sharing and use privacy tools (Brave, Firefox with uBlock Origin, Tor Browser) if concerned
- **Developers**: Only collect device data you actually need; disclose data collection in privacy policies
- **Security professionals**: Device fingerprinting can detect bot traffic and account takeover attempts

## Using the Device Information Tool

Our tool displays:
1. **Browser details** — name, version, engine, and user agent string
2. **OS information** — operating system and version
3. **Screen specs** — dimensions, color depth, pixel ratio
4. **Hardware info** — CPU cores, RAM estimate
5. **Network details** — connection type and speed estimate
6. **Location data** — timezone and language preferences
7. **Feature support** — which Web APIs are available in your browser

All processing happens locally — no data is sent to any server.
"""

articles['mime-types-guide'] = r"""## What Is a MIME Type?

A **MIME type** (Multipurpose Internet Mail Extensions type, also called Media Type or Content Type) is a label that identifies the format of data. Originally created for email attachments, MIME types are now used everywhere data format identification is needed — HTTP responses, file uploads, data URLs, and HTML.

## MIME Type Syntax

MIME types follow this format:
```
type/subtype
type/subtype; parameter=value
```

Examples:
- `text/html` — HTML document
- `text/html; charset=UTF-8` — HTML with encoding parameter
- `application/json` — JSON data
- `image/png` — PNG image
- `multipart/form-data; boundary=something` — Form data with boundary

## MIME Type Categories

### text
Human-readable text content:
- `text/plain` — Plain text
- `text/html` — HTML markup
- `text/css` — CSS stylesheets
- `text/javascript` — JavaScript (though `application/javascript` is more accurate)
- `text/csv` — CSV data

### image
Visual content:
- `image/jpeg` — JPEG photos
- `image/png` — PNG with transparency
- `image/gif` — Animated GIFs
- `image/webp` — Modern efficient format
- `image/svg+xml` — SVG vector graphics
- `image/avif` — AV1 Image File Format (modern, high efficiency)

### audio
Sound content:
- `audio/mpeg` — MP3 audio
- `audio/ogg` — Ogg Vorbis
- `audio/wav` — Uncompressed audio
- `audio/aac` — AAC audio
- `audio/webm` — WebM audio

### video
Video content:
- `video/mp4` — MP4 video
- `video/webm` — WebM video
- `video/ogg` — Ogg Theora

### application
Non-text binary or structured data:
- `application/json` — JSON data
- `application/xml` — XML data
- `application/pdf` — PDF documents
- `application/zip` — ZIP archives
- `application/gzip` — Gzip compressed
- `application/octet-stream` — Unknown binary (generic binary)
- `application/x-www-form-urlencoded` — HTML form data

### multipart
Composite content with multiple parts:
- `multipart/form-data` — File upload forms
- `multipart/mixed` — Email with attachments

## MIME Types in HTTP

The `Content-Type` header tells the recipient what format the response body is in:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8

{"status": "ok"}
```

The `Accept` header tells the server what formats the client can handle:
```http
GET /api/users HTTP/1.1
Accept: application/json, text/plain, */*
```

## Content-Type in HTML Forms

HTML form encoding is controlled by the `enctype` attribute:
```html
<!-- URL-encoded (default) -->
<form method="post" enctype="application/x-www-form-urlencoded">

<!-- Required for file uploads -->
<form method="post" enctype="multipart/form-data">
```

## Common MIME Type Pitfalls

### `application/octet-stream`
The generic binary type. Browsers download rather than display files with this type. Use specific types for correct browser handling.

### `text/javascript` vs. `application/javascript`
Both are widely used; modern spec recommends `text/javascript`. In practice, both work in browsers.

### `application/x-www-form-urlencoded` vs. `multipart/form-data`
For API POST requests with JSON body, use `application/json`. Use `multipart/form-data` only when uploading actual binary files.

### MIME Sniffing
Some browsers ignore the declared Content-Type and "sniff" the actual content to determine the type. This can be a security risk. The `X-Content-Type-Options: nosniff` header prevents this behavior.

## File Extensions to MIME Types

Common mappings:
| Extension | MIME Type |
|-----------|-----------|
| .html | text/html |
| .css | text/css |
| .js | text/javascript |
| .json | application/json |
| .png | image/png |
| .jpg | image/jpeg |
| .pdf | application/pdf |
| .zip | application/zip |
| .mp4 | video/mp4 |
| .mp3 | audio/mpeg |

## Using the MIME Types Reference Tool

Our tool:
1. **Search by extension** — find the MIME type for any file extension
2. **Search by MIME type** — find the file extension for any MIME type
3. **Browse categories** — explore all types in a category
4. **Copy type** — one-click copy for use in code
5. **See browser support** — which types browsers handle natively

Essential reference for web developers setting Content-Type headers, handling file uploads, and configuring web servers.
"""

articles['user-agent-parser-guide'] = r"""## What Is a User Agent String?

A **user agent string** is a text identifier that web browsers and other HTTP clients send in the `User-Agent` request header. It tells servers what browser, operating system, and rendering engine is being used. Originally designed for content negotiation, user agent strings have grown into complex, legacy-filled identifiers that reflect decades of browser compatibility wars.

## Anatomy of a User Agent String

A modern Chrome user agent breaks down into:
- **Mozilla/5.0**: Historic Netscape compatibility token included by virtually every browser
- **Platform token**: OS information like `(Windows NT 10.0; Win64; x64)`
- **Engine token**: `AppleWebKit/537.36` — the rendering engine
- **Browser token**: `Chrome/120.0.0.0` — the actual browser and version
- **Compatibility tokens**: Additional claims for backward compatibility

The string is deliberately confusing due to decades of browser compatibility history.

## The User Agent String History

Early browsers sent simple strings like `Mosaic/0.9`. When Netscape (Mozilla) dominated, servers began serving enhanced content only to Mozilla browsers. Internet Explorer responded by starting its user agent with `Mozilla/`. Chrome, based on WebKit, included `AppleWebKit` to inherit Safari-optimized content. Every new browser added tokens to appear compatible with existing ones.

The result: virtually every browser's user agent starts with `Mozilla/5.0`, includes `WebKit`, and claims compatibility with multiple engines it doesn't use.

## Key User Agent Properties

### Browser Identification
- Browser family (Chrome, Firefox, Safari, Edge, Opera)
- Browser version and build number
- Browser engine (Blink, Gecko, WebKit)

### Operating System
- OS family (Windows, macOS, Linux, Android, iOS)
- OS version (Windows 10, macOS Ventura, Android 13)

### Device Type
- Desktop vs. Mobile vs. Tablet
- Device manufacturer and model (for mobile)

## User-Agent Client Hints (Modern Replacement)

Google is phasing out the information-rich user agent string in favor of **User-Agent Client Hints (UA-CH)**, where servers explicitly request only what they need:

```
Sec-CH-UA: "Google Chrome";v="120", "Chromium";v="120"
Sec-CH-UA-Platform: "Windows"
Sec-CH-UA-Mobile: ?0
```

Benefits: Privacy improvements, reduced fingerprinting, explicit data access.

## Bot Detection via User Agent

Many user agent strings belong to bots, crawlers, and automated tools:
- `Googlebot/2.1` — Google's web crawler
- `facebookexternalhit/1.1` — Facebook link preview fetcher
- `Python-requests/2.28.0` — Python requests library
- `curl/7.68.0` — curl command-line tool

Server logs contain significant bot traffic. Identifying bot user agents helps separate human from automated traffic in analytics.

## User Agent Spoofing

Users and tools frequently spoof user agents:
- Privacy-focused browsers randomize or minimize their UA
- Developers test how sites appear to different browsers
- Scrapers pretend to be regular browsers
- Mobile simulators override the UA to appear as mobile devices

This means user agent data should never be trusted for security decisions — only for statistical analysis and optional capability detection.

## Practical Parsing

Reliable UA parsing requires dedicated libraries that maintain databases of browser patterns:
- **ua-parser-js** (JavaScript): Most popular Node.js/browser library
- **user-agents** (Python): Google's UA database ported to Python
- **device-detector** (PHP/multilanguage): Comprehensive device detection
- **WhichBrowser** (PHP): Focus on mobile device detection

## Using the User Agent Parser Tool

Our tool:
1. **Auto-detects your UA** — shows your current browser and OS
2. **Parse any UA string** — paste any user agent for analysis
3. **Shows all components** — browser, version, OS, device, engine
4. **Identifies bots** — flags known crawler and tool user agents
5. **Database updated regularly** — recognizes recent browsers and devices

Use it for debugging user agent detection in web applications, analyzing server logs, and understanding what browsers your visitors use.
"""

# Main execution
def main():
    with open(ARTICLES_FILE, 'r') as f:
        content = f.read()

    updated_count = 0
    for slug, article_content in articles.items():
        content, success = update_article(content, slug, article_content)
        if success:
            updated_count += 1
            print(f'Updated: {slug}')
        else:
            print(f'NOT FOUND: {slug}')

    with open(ARTICLES_FILE, 'w') as f:
        f.write(content)

    print(f'\nTotal updated: {updated_count}/{len(articles)}')

if __name__ == '__main__':
    main()

A **user agent string** is a text identifier that web browsers and other HTTP clients send in the `User-Agent` request header. It tells servers what browser, operating system, and rendering engine is being used. Originally designed for content negotiation, user agent strings have grown into complex, legacy-filled identifiers with a fascinating history.

## Anatomy of a User Agent String

A modern Chrome user agent:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

Breaking it down:
| Component | Value | Meaning |
|-----------|-------|---------|
| `Mozilla/5.0` | Token | Historic Netscape compatibility token (virtually all browsers include this) |
| `(Windows NT 10.0; Win64; x64)` | Platform | OS: Windows 10, 64-bit |
| `AppleWebKit/537.36` | Engine | Blink rendering engine (based on WebKit) |
| `(KHTML, like Gecko)` | Compatibility | Gecko compatibility claim |
| `Chrome/120.0.0.0` | Browser | Chrome version 120 |
| `Safari/537.36` | Compatibility | Safari compatibility claim |

The string is deliberately confusing due to decades of browser compatibility wars.

## A Brief History of User Agent Chaos

### The Original Design (1990s)
Early browsers sent simple strings: `Mosaic/0.9`, `Mozilla/1.0`. Servers could serve different content based on browser capabilities.

### The Netscape Wars
When Netscape (Mozilla) dominated, servers began serving enhanced content only to `Mozilla/*` browsers. Microsoft's IE responded by beginning its user agent with `Mozilla/` even though it wasn't Mozilla.

### The WebKit/Gecko Era
New browsers added compatibility tokens to inherit content intended for older browsers. Chrome, based on WebKit, included `AppleWebKit`. Opera changed its UA to appear as Chrome. Everyone was pretending to be everyone else.

### The Modern Situation
Today, virtually every browser's user agent starts with `Mozilla/5.0`, includes `WebKit`, and claims to be compatible with multiple engines it doesn't use. The actual browser is hidden within the string.

## User Agent Client Hints (the Future)

Google is deprecating the information-rich user agent string in favor of **User-Agent Client Hints (UA-CH)**, where servers explicitly request only the information they need:

```http
Sec-CH-UA: "Google Chrome";v="120", "Chromium";v="120"
Sec-CH-UA-Platform: "Windows"
Sec-CH-UA-Mobile: ?0
```

Benefits:
- Privacy: Servers get only what they ask for
- Less fingerprinting: No giant string of capabilities
- Explicit: No parsing ambiguity

## Parsing User Agent Strings

Because UAs evolved organically, parsing them reliably requires dedicated libraries:

### ua-parser-js (JavaScript)
```javascript
const UAParser = require('ua-parser-js');
const parser = new UAParser();
const result = parser.setUA(navigator.userAgent).getResult();
console.log(result.browser.name);  // "Chrome"
console.log(result.os.name);       // "Windows"
console.log(result.device.type);   // "undefined" (desktop)
```

### ua-parser (Python)
```python
from user_agents import parse
ua = parse(user_agent_string)
ua.browser.family    # Chrome
ua.os.family         # Windows
ua.device.family     # Other (desktop)
ua.is_mobile         # False
ua.is_bot            # False
```

## Bot Detection

Many user agent strings belong to bots, crawlers, and automated tools:
- `Googlebot/2.1` — Google's web crawler
- `facebookexternalhit/1.1` — Facebook link preview fetcher
- `Python-requests/2.28.0` — Python requests library
- `curl/7.68.0` — curl command-line tool

Server logs contain significant bot traffic. Analyzing user agents helps distinguish human traffic from automated activity.

## Common Bot User Agents

| Bot | User Agent |
|-----|-----------|
| Google | `Googlebot/2.1 (+http://www.google.com/bot.html)` |
| Bing |