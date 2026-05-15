#!/usr/bin/env python3
"""
Batch 6: yaml-to-json, toml-to-json, json-minify, base64-file-converter,
pdf-signature-checker, income-tax-calculator, random-port-generator, json-viewer,
yaml-viewer, toml-to-yaml, json-to-toml, json-to-xml, xml-formatter
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

articles['yaml-to-json-guide'] = r"""## What Is YAML and Why Convert It to JSON?

**YAML** (YAML Ain't Markup Language) is a human-friendly data serialization format widely used for configuration files. **JSON** (JavaScript Object Notation) is the universal data interchange format for web APIs and applications. While both represent structured data, they have different strengths and are used in different contexts.

Converting YAML to JSON is a common need when:
- Processing configuration files in JavaScript/Node.js applications
- Sending data to REST APIs that expect JSON
- Integrating YAML-based tools with JSON-based systems
- Converting Kubernetes/Docker YAML configs for API consumption
- Debugging configuration by viewing it in a JSON viewer

## YAML Syntax Overview

YAML uses indentation and special characters instead of braces and brackets:

```yaml
# A YAML configuration example
server:
  host: localhost
  port: 8080
  ssl: true

database:
  url: postgresql://localhost:5432/mydb
  pool_size: 10

features:
  - authentication
  - caching
  - logging
```

Key YAML features:
- **Indentation** defines structure (2 or 4 spaces, never tabs)
- **Colons** separate keys and values
- **Dashes** indicate list items
- **Hash** symbols start comments
- **Quotes** are optional for most strings

## YAML Data Types

YAML automatically infers types:
- `true`/`false` → Boolean
- `42` → Integer
- `3.14` → Float
- `"hello"` → String
- `null` or `~` → Null
- Dates like `2024-01-15` → Date (in some parsers)

This auto-detection can cause surprises — Norwegian municipality codes like `NO` might be interpreted as boolean `false` in some YAML parsers.

## The Equivalent JSON

The YAML example above converts to:

```json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true
  },
  "database": {
    "url": "postgresql://localhost:5432/mydb",
    "pool_size": 10
  },
  "features": [
    "authentication",
    "caching",
    "logging"
  ]
}
```

## Key Differences Between YAML and JSON

| Feature | YAML | JSON |
|---------|------|------|
| Comments | Yes (`#`) | No |
| Readability | High | Medium |
| Verbosity | Low | Higher |
| Multi-line strings | Natural | Requires `\n` escaping |
| Trailing commas | N/A | Not allowed |
| Data types | Rich (dates, etc.) | Limited (string, number, bool, null, array, object) |
| Parsing complexity | High | Low |
| Security concerns | Higher (YAML bombs) | Lower |

## YAML Anchors and Aliases

YAML supports powerful features that have no JSON equivalent:

```yaml
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  host: prod.example.com

staging:
  <<: *defaults
  host: staging.example.com
```

When converting to JSON, anchors/aliases are resolved — the referenced values are inlined.

## Common YAML-to-JSON Use Cases

### Kubernetes Configuration
Kubernetes manifests are written in YAML but the API server processes JSON:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
```

### CI/CD Pipeline Files
GitHub Actions, GitLab CI, and CircleCI use YAML but many tools process their output as JSON.

### Docker Compose
Docker Compose files are YAML. Tools that inspect compose configurations often work with JSON representations.

## Using the YAML-to-JSON Converter

Our converter:
1. **Paste or type YAML** in the input panel
2. **Instant JSON output** — converts in real-time as you type
3. **Syntax validation** — highlights YAML errors before conversion
4. **Formatted output** — pretty-printed JSON with proper indentation
5. **Copy JSON** — one-click copy to clipboard
6. **Download** — save the converted JSON as a file

The tool handles all YAML features including anchors, multi-line strings, complex nesting, and edge cases around type inference.
"""

articles['toml-to-json-guide'] = r"""## What Is TOML?

**TOML** (Tom's Obvious, Minimal Language) is a configuration file format designed to be easy to read and write, with unambiguous semantics. It was created by Tom Preston-Werner (GitHub co-founder) as an alternative to INI files with support for richer data types.

TOML is widely used in:
- **Rust** projects (Cargo.toml)
- **Python** projects (pyproject.toml)
- **Hugo** static site generator
- **Gitea/Forgejo** configuration
- Many other developer tools

## TOML Syntax

TOML uses a clear, section-based structure:

```toml
# This is a TOML configuration file

[package]
name = "my-project"
version = "1.0.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = "1.0"

[server]
host = "0.0.0.0"
port = 8080
workers = 4

[[environments]]
name = "development"
debug = true

[[environments]]
name = "production"
debug = false
```

## TOML Data Types

TOML has explicit, strongly-typed values:

| Type | Example |
|------|---------|
| String | `"hello"` or `'literal'` |
| Integer | `42` or `0xFF` or `1_000_000` |
| Float | `3.14` or `6.022e23` |
| Boolean | `true` / `false` |
| Date-Time | `1979-05-27T07:32:00Z` |
| Local Date | `1979-05-27` |
| Local Time | `07:32:00` |
| Array | `[1, 2, 3]` |
| Inline Table | `{name = "Alice", age = 30}` |

TOML's explicit typing prevents the ambiguity that sometimes occurs in YAML (where `true` and `"true"` might be confused).

## The Equivalent JSON

Converting the TOML example above:

```json
{
  "package": {
    "name": "my-project",
    "version": "1.0.0",
    "edition": "2021"
  },
  "dependencies": {
    "serde": {
      "version": "1.0",
      "features": ["derive"]
    },
    "tokio": "1.0"
  },
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "workers": 4
  },
  "environments": [
    {"name": "development", "debug": true},
    {"name": "production", "debug": false}
  ]
}
```

Note: TOML's `[[environments]]` (array of tables) becomes a JSON array.

## TOML vs. JSON vs. YAML

| Feature | TOML | JSON | YAML |
|---------|------|------|------|
| Comments | Yes | No | Yes |
| Strong typing | Yes | Partial | No |
| Multi-line strings | Yes | No (use \n) | Yes |
| Human readability | High | Medium | High |
| Date/time support | Native | String only | Partial |
| Array of tables | Elegant | Verbose | Verbose |
| Anchors/aliases | No | No | Yes |
| Spec complexity | Low | Low | High |

## When to Use TOML vs. JSON

**Use TOML when:**
- Writing configuration files meant to be edited by humans
- Working in the Rust/Python ecosystem
- You need date/time type support
- Comments are important for documentation

**Use JSON when:**
- Communicating with web APIs
- Generating configuration programmatically
- Maximum parser compatibility is needed
- Working in JavaScript/Node.js environments

## Using the TOML-to-JSON Converter

Our converter:
1. **Paste TOML configuration** in the input
2. **Get instant JSON output** with proper formatting
3. **Handles all TOML types** including dates, times, and array-of-tables
4. **Syntax validation** with helpful error messages
5. **Copy or download** the resulting JSON

Useful for integrating TOML-configured tools with JSON-based APIs, debugging configurations, and understanding TOML structure by seeing the equivalent JSON representation.
"""

articles['json-minify-guide'] = r"""## What Is JSON Minification?

JSON minification removes all unnecessary whitespace — spaces, tabs, and newlines — from a JSON document without changing its data or structure. The result is functionally identical JSON that takes up significantly less space.

## Why Minify JSON?

### Network Performance
Every byte matters for web performance. A typical API response minified from 15KB to 8KB:
- Reduces transfer time over slow connections
- Decreases bandwidth costs on cloud platforms that charge per GB
- Improves Time to First Byte (TTFB) metrics
- Faster parsing since less data needs to be processed

### Storage Efficiency
When storing JSON in databases, files, or caches, minified JSON uses less space. At scale, this can translate to meaningful cost savings and performance improvements.

### Embedding in Code
When embedding JSON in HTML, JavaScript, or other files, minified JSON is more appropriate and less disruptive to the surrounding code.

## What Gets Removed During Minification

Minification removes:
- Spaces and tabs between tokens
- Newlines and carriage returns
- Unnecessary whitespace inside strings is preserved (spaces within string values are kept)

What is NOT removed:
- Spaces within string values
- Any actual data or structure
- Object keys and values
- Array elements

## Before and After Example

**Formatted JSON (198 bytes):**
```json
{
  "user": {
    "id": 12345,
    "name": "Alice Smith",
    "email": "alice@example.com",
    "active": true,
    "roles": [
      "admin",
      "editor"
    ]
  }
}
```

**Minified JSON (104 bytes — 47% smaller):**
```json
{"user":{"id":12345,"name":"Alice Smith","email":"alice@example.com","active":true,"roles":["admin","editor"]}}
```

## JSON Minification in Practice

### Node.js
```javascript
const data = require('./data.json');
const minified = JSON.stringify(data); // No spaces = minified
const formatted = JSON.stringify(data, null, 2); // 2-space indentation
```

### Python
```python
import json
with open('data.json') as f:
    data = json.load(f)
minified = json.dumps(data, separators=(',', ':'))
```

### Build Pipeline
Many build tools handle JSON minification automatically:
- Webpack minifies JSON imports in JavaScript bundles
- `jq` CLI tool: `jq -c . data.json` outputs compact JSON
- Online tools for quick one-off minification

## JSON Compression vs. Minification

Minification and compression serve different purposes:

**Minification**: Removes whitespace, reduces raw JSON size
**Compression**: Applies algorithms (gzip, Brotli) to compress binary representation

They complement each other. Minified JSON compresses better than formatted JSON because:
- Less redundant whitespace for the compressor to ignore
- More consistent patterns that compression algorithms exploit well

For web APIs, enabling gzip compression (`Content-Encoding: gzip`) on your server is often more impactful than manual minification.

## When to Minify vs. Format

**Minify when:**
- Serving JSON via HTTP API (handle with server compression)
- Storing in databases or files at scale
- Embedding JSON in web pages
- Distributing JSON as downloadable data

**Keep formatted when:**
- Writing configuration files
- Version-controlling JSON (readable diffs)
- Debugging and development
- Documentation examples

## Common JSON Minification Pitfalls

### Removing Comments
Standard JSON doesn't support comments, but some tools (VS Code settings, JSON5 format) do. Minification tools may strip non-standard comments, which is usually desired.

### String Escaping
Minification should preserve string content exactly, including whitespace inside string values. "hello world" with a space inside stays "hello world" — only structural whitespace is removed.

## Using the JSON Minify Tool

Our tool:
1. **Paste formatted JSON** — supports any valid JSON
2. **Instant minification** — removes all unnecessary whitespace
3. **Shows size reduction** — displays original and minified byte count
4. **Validates JSON** — highlights errors before minification
5. **Copy minified result** — one-click clipboard copy

Use it for optimizing API payloads, preparing JSON for production, and understanding the size impact of your JSON structures.
"""

articles['base64-file-converter-guide'] = r"""## What Is Base64 File Encoding?

Base64 encoding converts binary file data into ASCII text characters. This makes it possible to embed binary files (images, PDFs, fonts, audio) directly in text-based formats like HTML, CSS, JavaScript, JSON, and XML — where raw binary data would be invalid or cause parsing issues.

## Why Base64 for Files?

### Data URLs in HTML/CSS
Embed images directly without separate HTTP requests:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
```

```css
.icon {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxu...');
}
```

### Email Attachments (MIME)
Email uses Base64 to encode attachments in the MIME multipart format, since email protocols were originally designed for 7-bit ASCII text only.

### JSON API Payloads
Transmit file contents in JSON APIs without separate file upload endpoints:
```json
{
  "filename": "report.pdf",
  "content": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3Ro...",
  "encoding": "base64"
}
```

### Storing Binary in Databases
Some database fields store binary data as Base64-encoded strings in text columns, particularly when binary column types aren't available or practical.

## How Base64 Works

Base64 uses 64 characters: A-Z, a-z, 0-9, `+`, `/`, and `=` for padding.

The encoding process:
1. Take 3 bytes (24 bits) of binary data
2. Split into four 6-bit groups
3. Map each 6-bit value to a Base64 character
4. If input isn't divisible by 3, add `=` padding

Size impact: Base64 increases file size by approximately **33%** (4 characters for every 3 bytes of input, or 8 bits for every 6 bits of input).

## Base64 Variants

### Standard Base64
Uses `+` and `/` as characters 62 and 63. Padding with `=`.

### URL-Safe Base64
Replaces `+` with `-` and `/` with `_` to avoid URL encoding issues. Used in JWT tokens, URL parameters, and filenames.

### Base64 Without Padding
Some systems omit the trailing `=` padding. Node.js's `base64url` encoding does this.

## Common File Types and Data URLs

| File Type | MIME Type | Data URL Prefix |
|-----------|-----------|-----------------|
| PNG image | image/png | `data:image/png;base64,` |
| JPEG image | image/jpeg | `data:image/jpeg;base64,` |
| SVG image | image/svg+xml | `data:image/svg+xml;base64,` |
| PDF | application/pdf | `data:application/pdf;base64,` |
| Web font (WOFF) | font/woff | `data:font/woff;base64,` |
| Audio (MP3) | audio/mpeg | `data:audio/mpeg;base64,` |

## Performance Considerations

### Pros of Embedding with Data URLs
- Eliminates HTTP request for the embedded resource
- Useful for small images in critical rendering path
- Works offline/in local files without a server

### Cons of Embedding with Data URLs
- Increases HTML/CSS file size by 33% per embedded file
- Resources cannot be cached independently by the browser
- Larger payloads can slow initial page rendering
- Binary data in text files makes version control diffs harder

**Rule of thumb**: Use Base64 data URLs for small resources under 5KB. For larger files, keep them as separate assets.

## Encoding Files Programmatically

### Node.js
```javascript
const fs = require('fs');
const fileData = fs.readFileSync('image.png');
const base64 = fileData.toString('base64');
const dataUrl = `data:image/png;base64,${base64}`;
```

### Python
```python
import base64
with open('image.png', 'rb') as f:
    encoded = base64.b64encode(f.read()).decode('utf-8')
data_url = f'data:image/png;base64,{encoded}'
```

### Browser (FileReader API)
```javascript
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result); // data URL
reader.readAsDataURL(file);
```

## Using the Base64 File Converter Tool

Our tool provides:
1. **Drag-and-drop file upload** — accept any file type
2. **Instant Base64 encoding** — converts immediately on file selection
3. **Data URL generation** — automatically prepends the correct MIME type prefix
4. **Decoding support** — paste Base64 to download the original file
5. **Copy to clipboard** — one-click copy for both raw Base64 and full data URL
6. **File size comparison** — shows original vs. encoded size

Use it for embedding images in single-page HTML exports, preparing files for JSON API upload, generating CSS data URLs, and debugging Base64-encoded content in network requests.
"""

articles['pdf-signature-checker-guide'] = r"""## What Is PDF Digital Signature Verification?

A **digital signature** on a PDF document provides cryptographic proof of two things:
1. **Identity**: The document was signed by the claimed signer
2. **Integrity**: The document hasn't been modified since it was signed

Unlike a scanned handwritten signature (just an image), a digital signature is a mathematical construct based on public-key cryptography that provides strong, verifiable guarantees.

## How PDF Digital Signatures Work

### The Signing Process
1. A **hash** of the PDF content is computed (e.g., SHA-256)
2. The hash is **encrypted** using the signer's private key
3. The encrypted hash (the signature) is embedded in the PDF
4. The signer's **certificate** (containing their public key) is also stored in the PDF

### The Verification Process
1. Extract the signature and certificate from the PDF
2. Decrypt the signature using the **public key** from the certificate
3. Independently compute the hash of the current PDF content
4. Compare: if both hashes match, the signature is valid and the document hasn't changed

### Trust Chain
A certificate by itself doesn't prove identity — anyone could generate one. Trust is established through a **Certificate Authority (CA) chain**:
- Your certificate is signed by an intermediate CA
- The intermediate CA's certificate is signed by a root CA
- Root CAs are pre-installed in operating systems and browsers as trusted

## Types of PDF Signatures

### Approval Signature
Signs the document at a point in time. Additional signatures can be added afterward (each covers the content at the time of signing).

### Certification Signature (DocMDP)
Controls what changes are permitted to the document after signing:
- Level 1: No changes allowed
- Level 2: Only form filling and annotations allowed
- Level 3: Form filling, annotations, and page additions allowed

### Invisible Signature
Cryptographic signature without a visible graphical element in the document.

### Visible Signature
Includes both the cryptographic signature and a visible representation (often a signature image, name, date, and reason).

## PDF Signature Validation States

When verifying a PDF signature, the result can be:

### Valid
- Signature cryptographically verifies
- Certificate chain is trusted
- No modifications since signing

### Valid but with Issues
- Signature is mathematically valid
- Certificate may be expired, untrusted, or revoked
- Document may have been modified in allowed ways (approved changes)

### Invalid
- Document has been modified after signing
- The computed hash doesn't match the signature

### Unknown
- Cannot verify without internet access (for OCSP/CRL checks)
- Certificate chain leads to an untrusted root

## Long-Term Validation (LTV)

Standard signatures can become unverifiable over time as certificates expire. **Long-Term Validation (LTV)** embeds all verification information in the PDF itself:
- Certificate chain
- OCSP responses (certificate validity proof)
- Timestamps from trusted timestamping authorities

LTV-enabled PDFs can be verified years or decades after signing without internet access.

## PAdES, CAdES, and XAdES Standards

Different signature standards are used in different contexts:

- **PAdES** (PDF Advanced Electronic Signatures): European standard for PDF signatures, required for legal compliance in EU
- **CAdES**: For arbitrary data, not just PDFs
- **XAdES**: For XML documents

The EU's eIDAS regulation defines signature levels:
- **SES** (Simple): Basic digital signature
- **AdES** (Advanced): Signer identity linked to signature
- **QES** (Qualified): Highest legal value, equivalent to handwritten signature in EU law

## Common Signature Issues

### Self-Signed Certificates
Many PDF signing tools allow creating certificates without CA involvement. These are "self-signed" — the certificate is signed by its own private key. They provide integrity guarantees but no identity assurance.

### Expired Certificates
A signature made with a certificate that was valid at signing time remains valid if properly timestamped. LTV handles this correctly. Without LTV, expired certificates may cause false "invalid" warnings.

### Incremental Updates
PDFs can be modified by appending new data (incremental updates) without overwriting the original signed content. Partial signatures cover only the original content; understanding this is important when reviewing signed PDFs that were later modified.

## Using the PDF Signature Checker

Our tool:
1. **Upload a PDF** via drag-and-drop or file picker
2. **Extracts all signatures** from the document
3. **Verifies each signature** cryptographically
4. **Shows certificate details** — issuer, subject, validity period
5. **Indicates trust status** — trusted CA, self-signed, or unknown
6. **Reports modification status** — whether document was changed after signing
7. **Processes client-side** — your PDF is never uploaded to a server

Use it for verifying signed contracts, checking certificate-signed documents, auditing PDF integrity, and understanding what digital signatures actually prove about a document.
"""

articles['income-tax-calculator-guide'] = r"""## Understanding Income Tax Systems

Income tax is the primary source of government revenue in most countries. Understanding how it works — and how to calculate it accurately — is essential for financial planning, salary negotiations, and compliance.

## Progressive Tax Systems

Most developed countries use **progressive taxation**: higher income levels are taxed at higher rates. A critical concept is that higher rates only apply to income *above* each bracket threshold, not to your entire income.

### How Tax Brackets Work

Example (simplified US-style brackets):

| Income Range | Rate |
|-------------|------|
| $0 - $10,000 | 10% |
| $10,001 - $40,000 | 20% |
| $40,001 - $85,000 | 30% |
| Over $85,000 | 37% |

For someone earning $60,000:
- First $10,000 @ 10% = $1,000
- Next $30,000 @ 20% = $6,000
- Remaining $20,000 @ 30% = $6,000
- **Total tax: $13,000** (effective rate: 21.7%)

The **marginal rate** (30%) applies only to the last dollar earned. The **effective rate** (21.7%) represents total tax as a percentage of total income.

## Types of Income Tax

### Individual Income Tax
Tax on wages, salaries, tips, freelance income, and other personal earnings. Most countries require annual filing and may collect through payroll withholding.

### Self-Employment Tax
Self-employed individuals typically pay both the employee and employer portions of social security and Medicare taxes (in the US, this is 15.3% on net self-employment income).

### Capital Gains Tax
Tax on profits from selling investments:
- **Short-term** (held under 1 year): Often taxed as ordinary income
- **Long-term** (held over 1 year): Lower preferential rates in many countries

### Dividend Tax
Qualified dividends often receive favorable rates. Ordinary dividends are taxed as regular income.

## Tax Deductions vs. Tax Credits

### Deductions
Reduce your **taxable income** before calculating tax. Value depends on your marginal rate.

Example: A $1,000 deduction with a 30% marginal rate saves $300 in tax.

Common deductions:
- Mortgage interest
- Charitable contributions
- Business expenses
- Health insurance premiums (self-employed)
- Retirement account contributions (401k, IRA)

### Credits
Directly reduce your **tax liability** — dollar for dollar. More valuable than deductions of equal amount.

Example: A $1,000 tax credit reduces tax by $1,000 regardless of your bracket.

Common credits:
- Child tax credit
- Earned income tax credit
- Education credits
- Energy efficiency credits

## Standard Deduction vs. Itemizing

Most tax systems offer a choice:
- **Standard deduction**: Fixed amount anyone can take without documentation
- **Itemized deductions**: Sum of qualifying expenses (mortgage interest, donations, etc.)

Take whichever is larger. Recent US tax reform significantly increased the standard deduction, meaning fewer people benefit from itemizing.

## Payroll Taxes and Withholding

For employees, income taxes are typically withheld from each paycheck by employers. Additional payroll taxes (Social Security and Medicare in the US) are also withheld.

The withholding amount depends on:
- Income level
- Filing status (single, married, head of household)
- Claimed allowances or adjustments (W-4 form in the US)

Under-withholding results in taxes owed at filing; over-withholding results in a refund.

## Tax Planning Strategies

### Maximize Retirement Contributions
401(k), IRA, and pension contributions are often tax-deferred, reducing current taxable income while building retirement savings.

### Tax-Loss Harvesting
Selling investments at a loss to offset capital gains taxes. The loss can offset up to $3,000 of ordinary income after gains are netted.

### Bunching Deductions
Combining two years of charitable donations into a single year to exceed the standard deduction threshold, then taking the standard deduction the alternate year.

### Health Savings Accounts (HSA)
Triple tax advantage: contributions are deductible, growth is tax-free, and qualified medical withdrawals are tax-free.

## Using the Income Tax Calculator

Our calculator:
1. **Enter your gross income** — annual or monthly
2. **Select filing status** — single, married filing jointly, head of household
3. **Input deductions** — standard or itemized amounts
4. **Add other income** — capital gains, dividends, self-employment
5. **See breakdown** — taxable income, tax by bracket, and effective rates

The calculator provides estimates for planning purposes. Tax laws change annually, and individual situations vary. Always consult a tax professional for advice specific to your situation.
"""

articles['random-port-generator-guide'] = r"""## What Is a Network Port?

A **network port** is a virtual endpoint for network communication, identified by a number from 0 to 65535. Ports allow a single computer (with one IP address) to run multiple network services simultaneously. The combination of IP address + port number uniquely identifies a network socket.

When your browser connects to `https://example.com`, it's actually connecting to `example.com:443` — port 443 is the standard HTTPS port.

## Port Number Ranges

Port numbers are divided into three ranges by IANA (Internet Assigned Numbers Authority):

### Well-Known Ports (0-1023)
Reserved for system services and standard protocols. Require administrative/root privileges to bind on most operating systems.

Common well-known ports:
| Port | Protocol | Service |
|------|----------|---------|
| 20/21 | TCP | FTP |
| 22 | TCP | SSH |
| 25 | TCP | SMTP |
| 53 | UDP/TCP | DNS |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 |
| 143 | TCP | IMAP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL (note: not well-known range) |

### Registered Ports (1024-49151)
Registered with IANA for specific applications but don't require special privileges. Common services:
| Port | Service |
|------|---------|
| 1433 | Microsoft SQL Server |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8080 | HTTP alternative |
| 8443 | HTTPS alternative |
| 27017 | MongoDB |

### Dynamic/Ephemeral Ports (49152-65535)
Assigned temporarily by the OS for client-side connections. When your browser makes a connection, the OS assigns one of these ports as the source port. Also suitable for development servers and custom applications.

## Why Random Port Generation?

### Development and Testing
When building and testing multiple services locally, you need ports that:
- Don't conflict with each other
- Don't conflict with system services
- Are easy to remember or assign programmatically

A random port generator ensures you get a port in a suitable range that's unlikely to be already in use.

### Docker and Container Orchestration
When starting many containers, each needing an exposed port, random assignment prevents conflicts:
```bash
docker run -p $(random-port):80 my-app
```

### Penetration Testing
Security professionals test services across port ranges. Understanding standard vs. non-standard port usage is important for both offense and defense.

### Firewall Configuration
Generating lists of ports for firewall rules, testing port accessibility, and documenting allowed ports.

## Checking Port Availability

Before using a randomly generated port, verify it's available:

### Linux/macOS
```bash
# Check if port 8080 is in use
lsof -i :8080
# or
ss -tlnp | grep :8080
# or
netstat -an | grep 8080
```

### Windows
```cmd
netstat -an | findstr :8080
```

### Node.js
```javascript
const net = require('net');
function isPortFree(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => { server.close(); resolve(true); });
    server.listen(port);
  });
}
```

## Ports to Avoid

Some ports cause problems even if not currently in use:

- **Port 0**: Reserved, OS assigns an available port when used
- **Ports 1-1023**: Require root/admin privileges on Unix systems
- **Common dev ports**: 3000, 4000, 5000, 8080, 8000 — likely already in use
- **Chrome's blocked ports**: Browsers block requests to certain ports for security (e.g., 587, 25, 21)

## TCP vs. UDP Ports

Both TCP and UDP use port numbers, but they're independent:
- Port 53/TCP and port 53/UDP are separate endpoints
- DNS uses both (TCP for large responses, UDP for regular queries)
- A service can listen on both TCP and UDP simultaneously

## Using the Random Port Generator

Our tool:
1. **Generates random ports** in configurable ranges (1024-49151 or full 0-65535)
2. **Multiple ports at once** — generate a list for multi-service setups
3. **Avoid well-known ports** — option to skip the 0-1023 range
4. **Format options** — copy as comma-separated list, one per line, or JSON array
5. **Port information** — shows if a generated port matches a known service

Use it for development environment setup, container port mapping, testing port scanners, and generating port ranges for network documentation.
"""

articles['json-viewer-guide'] = r"""## What Is a JSON Viewer?

A JSON viewer is a tool that parses raw JSON text and displays it in a human-readable, interactive format. Raw JSON can be difficult to read — especially deeply nested structures or minified data — and a viewer transforms it into a navigable tree structure with syntax highlighting.

## Why JSON Viewing Matters

### Raw JSON Challenges
Unformatted JSON from an API response or log file looks like:
```
{"users":[{"id":1,"name":"Alice","roles":["admin","editor"],"profile":{"age":28,"city":"NYC"}},{"id":2,"name":"Bob","roles":["viewer"],"profile":{"age":35,"city":"LA"}}]}
```

This is technically valid but nearly impossible to read at a glance.

### Formatted View
The same data with proper indentation:
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "roles": ["admin", "editor"],
      "profile": {
        "age": 28,
        "city": "NYC"
      }
    },
    {
      "id": 2,
      "name": "Bob",
      "roles": ["viewer"],
      "profile": {
        "age": 35,
        "city": "LA"
      }
    }
  ]
}
```

### Tree View
An interactive tree view allows collapsing and expanding sections, searching for specific keys, and understanding the data hierarchy without scrolling through the entire document.

## JSON Viewer Features

### Syntax Highlighting
Color-coding by data type helps quickly identify:
- Strings (usually green)
- Numbers (blue or purple)
- Booleans (orange)
- Null values (gray)
- Keys (red or yellow)
- Brackets and braces (white/default)

### Path Navigation
When hovering or clicking on a value, showing its full JSON path:
- `$.users[0].profile.city` = "NYC"
- `$.users[1].roles[0]` = "viewer"

This is invaluable for writing JSONPath queries or understanding data access in code.

### Search and Filter
Find all occurrences of a key or value within large JSON documents. Essential when working with API responses containing hundreds of fields.

### Schema Detection
Some viewers detect patterns and suggest the implied schema — all users have the same fields, arrays contain objects of consistent types, etc.

## JSON Path Expressions

JSONPath is a query language for JSON (similar to XPath for XML):

```
$              Root element
.key           Access object property
[0]            Access array element by index
[*]            All elements
..key          Recursive descent (find key anywhere)
[?(@.age>18)]  Filter expression
```

Examples on our user data:
- `$.users[*].name` → ["Alice", "Bob"]
- `$.users[?(@.id==1)].profile.city` → "NYC"
- `$.users[*].roles[0]` → ["admin", "viewer"]

## JSON Schema Validation

JSON Schema defines the structure and constraints for JSON data:

```json
{
  "type": "object",
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": {"type": "integer"},
          "name": {"type": "string"}
        }
      }
    }
  }
}
```

Validating API responses against their schema catches integration bugs early.

## Common JSON Viewer Use Cases

### API Development
After calling an API endpoint, paste the response into a viewer to understand the data structure before writing code to consume it.

### Debugging
When a function receives unexpected data, copy the value to JSON viewer to see exactly what's there — null values, wrong types, missing fields.

### Configuration Review
Configuration files in JSON format (package.json, tsconfig.json, etc.) are easier to audit in a viewer that highlights structure.

### Log Analysis
Applications that log structured JSON (structured logging) produce viewable records that make debugging much cleaner than plain text logs.

## Using the JSON Viewer Tool

Our JSON viewer:
1. **Paste or type JSON** — accepts minified or formatted input
2. **Interactive tree view** — expand/collapse any node
3. **Syntax highlighting** — color-coded by value type
4. **Search** — find keys or values anywhere in the document
5. **Format/Minify toggle** — switch between readable and compact views
6. **JSON path** — shows path to the currently selected value
7. **Validation** — reports syntax errors with line numbers
8. **Download** — save formatted JSON as a file

The tool handles large JSON documents efficiently, making it suitable for API response inspection, log analysis, and configuration review in daily development work.
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
