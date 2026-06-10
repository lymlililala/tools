#!/usr/bin/env node
/**
 * expand-db-articles.mjs
 * Updates short articles that exist in DB but not in source code
 * These are extra articles from previous seeding sessions
 */
import { supabase } from './supabase-admin.mjs'

const articles = {

'sql-formatter-guide': `## What Is SQL Formatting?

SQL formatting (also called SQL beautification or SQL pretty-printing) is the process of restructuring SQL queries to follow consistent indentation, capitalization, and line-break conventions. Well-formatted SQL is dramatically easier to read, debug, and maintain.

## Why SQL Formatting Matters

Unformatted SQL queries can be nearly impossible to understand:
\`\`\`sql
SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u JOIN orders o ON u.id=o.user_id WHERE u.status='active' AND o.total>100 ORDER BY o.created_at DESC LIMIT 20;
\`\`\`

Formatted equivalent:
\`\`\`sql
SELECT
  u.id,
  u.name,
  u.email,
  o.total,
  o.created_at
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE
  u.status = 'active'
  AND o.total > 100
ORDER BY o.created_at DESC
LIMIT 20;
\`\`\`

The formatted version makes the query structure immediately clear.

## SQL Formatting Conventions

### Keyword Case
SQL keywords (SELECT, FROM, WHERE, JOIN, ORDER BY) are traditionally written in UPPERCASE to distinguish them from identifiers (table/column names). Some style guides prefer lowercase keywords for reduced visual noise.

### Indentation
Each major clause starts on a new line. Sub-clauses (conditions in WHERE, columns in SELECT) are indented. JOIN conditions are typically indented under the JOIN keyword.

### Comma Placement
Two common styles:
- **Trailing commas**: Column at end of line, comma before next item
- **Leading commas**: Comma at start of each line (makes it easier to comment out the last item)

### Aliases
Table aliases improve readability in complex queries. Short, meaningful aliases (u for users, o for orders) are preferred over arbitrary single letters for large queries.

## SQL Dialects

Different database systems have their own SQL variations:
- **PostgreSQL**: Extends SQL with arrays, JSONB, window functions, CTEs
- **MySQL/MariaDB**: Has non-standard features like GROUP BY without aggregation
- **SQLite**: Simplified, serverless database with some limitations
- **SQL Server (T-SQL)**: Microsoft's dialect with procedural extensions
- **Oracle (PL/SQL)**: Oracle's extended SQL with procedural programming

Formatters that understand dialects can preserve dialect-specific syntax correctly.

## Common SQL Query Patterns

### Common Table Expressions (CTEs)
\`\`\`sql
WITH active_users AS (
  SELECT id, name
  FROM users
  WHERE status = 'active'
),
high_value_orders AS (
  SELECT user_id, SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 1000
)
SELECT au.name, hvo.total_spent
FROM active_users au
JOIN high_value_orders hvo ON au.id = hvo.user_id;
\`\`\`

### Window Functions
\`\`\`sql
SELECT
  name,
  salary,
  department,
  RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
  ) AS salary_rank
FROM employees;
\`\`\`

### Subqueries
\`\`\`sql
SELECT name, email
FROM users
WHERE id IN (
  SELECT DISTINCT user_id
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days'
);
\`\`\`

## SQL Linting

Beyond formatting, SQL linters check for common mistakes:
- SELECT * in production code (retrieves unnecessary columns)
- Missing WHERE clause on UPDATE/DELETE (affects all rows)
- Implicit column references in JOINs (ambiguous)
- Functions in WHERE clauses that prevent index usage
- Non-ANSI SQL that reduces portability

## Using the SQL Formatter Tool

Our tool:
1. **Paste any SQL query** — handles SELECT, INSERT, UPDATE, DELETE, CREATE, and more
2. **Instant formatting** — applies consistent indentation and line breaks
3. **Dialect support** — optimizes for PostgreSQL, MySQL, SQL Server, or standard SQL
4. **Keyword case** — choose UPPERCASE, lowercase, or preserve original
5. **Indentation style** — 2 spaces, 4 spaces, or tabs
6. **Copy formatted SQL** — one-click copy for immediate use

Use it for improving readability of complex queries before committing to version control, formatting queries copied from logs or error messages, and standardizing SQL style across your team.`,

'docker-compose-converter-guide': `## What Is Docker Compose?

Docker Compose is a tool for defining and running multi-container Docker applications. Using a YAML configuration file (docker-compose.yml), you can configure all your application's services, networks, and volumes in one place, then start everything with a single command: \`docker compose up\`.

## docker run vs. docker-compose.yml

When working with Docker, you often start by building commands manually using \`docker run\`. As applications grow more complex, these commands become unwieldy. Docker Compose provides a declarative alternative.

### The docker run Command
\`\`\`bash
docker run -d \\
  --name postgres \\
  -e POSTGRES_USER=myuser \\
  -e POSTGRES_PASSWORD=mypassword \\
  -e POSTGRES_DB=mydb \\
  -p 5432:5432 \\
  -v postgres_data:/var/lib/postgresql/data \\
  --restart unless-stopped \\
  postgres:15
\`\`\`

### The Equivalent docker-compose.yml
\`\`\`yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
\`\`\`

## Key Docker Compose Concepts

### Services
Each container in your application is defined as a service. Services can depend on each other, share networks, and communicate by service name.

### Networks
By default, Compose creates a single network for your app. All services can communicate using service names as hostnames. You can define multiple networks to isolate services.

### Volumes
Named volumes persist data beyond container lifecycle. Bind mounts map host directories into containers for development.

### Environment Variables
Can be defined inline, loaded from .env files, or passed through the host environment.

## Multi-Service Application Example

A full web application stack:
\`\`\`yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  db_data:
\`\`\`

## Common docker run Flags and Their Compose Equivalents

| docker run flag | Compose key |
|----------------|-------------|
| -d | (background by default) |
| --name | container_name |
| -e VAR=val | environment: VAR: val |
| -p 80:80 | ports: - "80:80" |
| -v vol:/path | volumes: - vol:/path |
| --restart | restart: unless-stopped |
| --network | networks: |
| --link | depends_on: (use service names instead) |

## Docker Compose Commands

\`\`\`bash
docker compose up -d          # Start all services in background
docker compose down           # Stop and remove containers
docker compose logs -f        # Follow service logs
docker compose ps             # List running services
docker compose exec app bash  # Shell into a service
docker compose build          # Rebuild service images
docker compose pull           # Pull latest images
\`\`\`

## Using the Docker Run to Compose Converter

Our tool:
1. **Paste a docker run command** — handles all common flags
2. **Generate docker-compose.yml** — proper YAML structure
3. **Multi-command support** — convert multiple run commands to a complete compose file
4. **Network inference** — suggests network configurations based on linked containers
5. **Copy YAML** — ready to save as docker-compose.yml

Use it when migrating from manual Docker commands to a managed Compose workflow, documenting existing container configurations, or sharing service configurations with teammates.`,

'json-formatter-guide': `## What Is JSON Formatting?

JSON formatting transforms minified or poorly structured JSON into a human-readable form with proper indentation, line breaks, and consistent spacing. While computers work equally well with compact or formatted JSON, humans find indented JSON far easier to read and understand.

## Why JSON Needs Formatting

JSON from APIs, database queries, and log files often arrives minified or with inconsistent formatting:

**Minified (machine-readable, hard for humans):**
\`\`\`
{"user":{"id":1,"name":"Alice","roles":["admin","editor"],"settings":{"theme":"dark","notifications":true}}}
\`\`\`

**Formatted (human-readable):**
\`\`\`json
{
  "user": {
    "id": 1,
    "name": "Alice",
    "roles": [
      "admin",
      "editor"
    ],
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  }
}
\`\`\`

## JSON Formatting Options

### Indentation
- **2 spaces**: Most common for web projects (default in many formatters)
- **4 spaces**: Common in Python and some style guides
- **Tabs**: Consistent physical width, but renders differently in different editors

### Key Sorting
Sorting object keys alphabetically makes large JSON objects easier to navigate and produces stable diffs in version control.

### Array Formatting
Arrays can be formatted with one item per line (better readability) or compact (better for short arrays). Smart formatters apply different rules based on array content and length.

## JSON Validation

Formatting tools also validate JSON syntax. Common JSON errors:
- **Trailing commas**: JSON does not allow commas after the last array/object element (unlike JavaScript)
- **Unquoted keys**: JSON requires keys to be quoted with double quotes
- **Single quotes**: JSON uses double quotes only, not single quotes
- **Comments**: Standard JSON does not support comments (JSON5 and JSONC do)
- **Undefined/NaN/Infinity**: These JavaScript values are not valid JSON

## JSON in Different Contexts

### Configuration Files
Most configuration files (package.json, tsconfig.json, .eslintrc.json) use 2-space indentation by convention. Version-controlling these files benefits from consistent formatting for readable diffs.

### API Responses
APIs typically serve minified JSON over HTTP. Formatting is applied by developer tools (browser devtools, Postman, Insomnia) for display.

### Logs
Structured JSON logging produces minified output. Log analysis tools like Kibana, Splunk, and Datadog parse the raw JSON and format it for display.

### Database Storage
PostgreSQL's JSONB type stores JSON internally as binary. The \`json_pretty()\` function formats it for display when querying.

## JSON Schema

JSON Schema is a vocabulary for annotating and validating JSON documents:
\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {"type": "string", "minLength": 1},
    "email": {"type": "string", "format": "email"},
    "age": {"type": "integer", "minimum": 0}
  }
}
\`\`\`

Validators check JSON data against schemas, catching structure and type errors before they reach application code.

## Using the JSON Formatter Tool

Our tool:
1. **Paste JSON data** — accepts minified, partially-formatted, or malformed input
2. **Instant formatting** — applies consistent indentation and line breaks
3. **Syntax validation** — reports errors with line numbers for easy fixing
4. **Sort keys** — optionally alphabetize object properties
5. **Multiple indent options** — 2 spaces, 4 spaces, or tabs
6. **Minify toggle** — switch between formatted and compact views
7. **Copy formatted JSON** — one-click clipboard copy

Use it for reading API responses, debugging JSON data, formatting configuration files, and validating JSON syntax before using it in applications.`,

'git-cheat-sheet': `## Git: The Essential Version Control System

Git is the world's most widely used distributed version control system, created by Linus Torvalds in 2005 for Linux kernel development. Understanding Git's core commands and concepts is essential for every developer.

## Core Git Concepts

### Repository (Repo)
A Git repository is a directory that Git tracks. It contains all project files plus a hidden .git folder with the full version history.

### Working Tree, Staging Area, and Repository
Git has three areas where file changes live:
1. **Working tree**: Your actual files on disk
2. **Staging area (index)**: Files marked for the next commit
3. **Repository**: Committed history stored in .git

### Branches
A branch is a lightweight pointer to a specific commit. The default branch is usually called \`main\` (formerly \`master\`). Branching enables parallel development without affecting the main codebase.

### Commits
A commit is a snapshot of staged files at a point in time. Each commit has a unique SHA-1 hash, author, timestamp, and message.

## Essential Git Commands

### Setup
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git init                    # Initialize new repo
git clone <url>             # Clone existing repo
\`\`\`

### Daily Workflow
\`\`\`bash
git status                  # Check file status
git add .                   # Stage all changes
git add <file>              # Stage specific file
git commit -m "message"     # Commit with message
git push origin main        # Push to remote
git pull                    # Fetch and merge from remote
\`\`\`

### Branching
\`\`\`bash
git branch                  # List branches
git branch feature-name     # Create branch
git checkout feature-name   # Switch to branch
git checkout -b new-branch  # Create and switch
git merge feature-branch    # Merge into current
git branch -d feature-name  # Delete branch
\`\`\`

### History and Diffs
\`\`\`bash
git log --oneline           # Compact log
git log --graph --all       # Visual branch graph
git diff                    # Unstaged changes
git diff --staged           # Staged changes
git show <commit>           # Show commit details
\`\`\`

### Undoing Changes
\`\`\`bash
git restore <file>          # Discard working tree changes
git restore --staged <file> # Unstage file
git revert <commit>         # Create undo commit
git reset --soft HEAD~1     # Undo last commit, keep changes staged
git reset --hard HEAD~1     # Undo last commit, discard changes
\`\`\`

### Remote Operations
\`\`\`bash
git remote add origin <url>    # Add remote
git remote -v                  # List remotes
git fetch origin               # Download without merging
git push --set-upstream origin main  # First push
git pull --rebase              # Rebase instead of merge
\`\`\`

### Stashing
\`\`\`bash
git stash                   # Save uncommitted work
git stash list              # View saved stashes
git stash pop               # Apply and remove latest stash
git stash apply stash@{1}   # Apply specific stash
\`\`\`

## Git Workflow Strategies

### Feature Branch Workflow
Create a branch for each feature or bug fix:
1. \`git checkout -b feature/new-feature\`
2. Make commits
3. Open pull request
4. Review and merge to main

### Gitflow
More structured workflow with main, develop, feature, release, and hotfix branches. Suited for projects with scheduled releases.

### Trunk-Based Development
Short-lived feature branches merged to main frequently. Works well with CI/CD and feature flags.

## Useful Git Aliases

\`\`\`bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
\`\`\`

## Using the Git Memo Reference

Our Git memo tool provides an interactive reference for:
1. All common Git commands organized by category
2. Quick-reference cheat sheet for daily operations
3. Workflow diagrams for branching strategies
4. Explanation of Git concepts for beginners
5. Advanced commands for rebasing, cherry-picking, and bisecting

Keep it open while working for quick command lookups without leaving your terminal.`,

'color-converter-guide': `## Color Models and Why We Convert Between Them

Color can be represented in multiple mathematical models, each optimized for different use cases. Converting between models is essential for web development, graphic design, print production, and data visualization.

## The Main Color Models

### RGB (Red, Green, Blue)
The additive color model used by screens. Colors are created by mixing light:
- Range: Each channel 0-255 (8-bit) or 0-100%
- Used in: CSS, HTML, JavaScript, image files
- Example: rgb(255, 87, 51) = a vivid orange

RGB maps directly to how monitors work — each pixel has red, green, and blue subpixels whose intensities combine to create the perceived color.

### HEX (Hexadecimal)
A compact representation of RGB using base-16:
- Format: #RRGGBB where each pair is 00-FF
- Shorthand: #RGB when both digits are identical (#FF6600 = #F60)
- Used in: CSS, HTML, design tools, SVG
- Example: #FF5733 = rgb(255, 87, 51)

### HSL (Hue, Saturation, Lightness)
More intuitive for humans to work with:
- **Hue**: Color angle 0-360° (0=red, 120=green, 240=blue)
- **Saturation**: 0% (gray) to 100% (full color)
- **Lightness**: 0% (black) to 100% (white), 50% is "normal"
- Used in: CSS (natively supported), design systems, color pickers

HSL shines for programmatically generating color variations — changing only lightness creates tints and shades without color shift.

### HSV/HSB (Hue, Saturation, Value/Brightness)
Similar to HSL but used in most design software color pickers:
- **Value/Brightness**: 0% (black) to 100% (pure color)
- Used in: Photoshop, Illustrator, Figma color pickers

### CMYK (Cyan, Magenta, Yellow, Key/Black)
The subtractive color model for print:
- Range: Each component 0-100%
- Used in: Print design, professional publishing
- Note: RGB to CMYK conversion is not mathematically perfect — use ICC profiles for accurate print color

### Lab (L*a*b*)
Perceptually uniform color space:
- **L**: Lightness 0-100
- **a**: Green to red axis (-128 to 127)
- **b**: Blue to yellow axis (-128 to 127)
- Used in: Color science, image processing, perceptual color differences

## Conversion Formulas

### HEX to RGB
Split the hex string into pairs, convert each from hex to decimal:
- #FF5733 → R=255 (0xFF), G=87 (0x57), B=51 (0x33)

### RGB to HSL
Convert each RGB value to 0-1 range, then calculate:
- Find max and min values of R, G, B
- Lightness = (max + min) / 2
- Saturation depends on whether max equals min
- Hue depends on which channel is maximum

### RGB to CMYK
Convert RGB (0-255) to fractions (0-1), then:
- K (black) = 1 - max(R, G, B)
- C = (1 - R - K) / (1 - K)
- M = (1 - G - K) / (1 - K)
- Y = (1 - B - K) / (1 - K)

## Color Spaces and Profiles

Beyond color models, color spaces define how a color model maps to actual physical colors:
- **sRGB**: Standard for web and most consumer displays
- **Adobe RGB**: Wider gamut for professional photography
- **P3/DCI-P3**: Wide gamut for cinema and modern displays
- **CMYK profiles**: Varies by printer, ink, and paper type

When designs move between web (sRGB) and print (CMYK), colors can shift noticeably. Soft-proofing in design software helps preview how colors will appear in print.

## Using the Color Converter Tool

Our tool:
1. **Enter any color format** — HEX, RGB, HSL, HSV, or CMYK
2. **See all representations** — instantly converts to all other formats
3. **Visual color preview** — see the actual color
4. **Copy any format** — one-click copy in CSS-ready syntax
5. **Color picker integration** — visually select colors
6. **Accessibility check** — WCAG contrast ratios against white and black backgrounds

Use it for converting between design tool and CSS representations, preparing colors for print, and ensuring consistent color values across different parts of a project.`,

'url-encoder-guide': `## What Is URL Encoding?

URL encoding (also called percent-encoding) converts characters that are not allowed or that have special meaning in URLs into a format that can be safely transmitted. The encoded form uses a percent sign (%) followed by the two-digit hexadecimal representation of the character's byte value.

## Why URLs Need Encoding

URLs can only contain a limited set of characters from the ASCII character set. Characters outside this set, and certain reserved characters that have special meaning in URL syntax, must be encoded.

### Reserved Characters
Some characters are "reserved" because they have special meaning in URL structure:
- ?: Query string delimiter
- &: Parameter separator
- =: Key-value separator
- #: Fragment identifier
- /: Path separator
- +: Space (in query strings)
- @, :, !: Various protocol uses

When these characters appear as data (not as structural elements), they must be encoded.

### Unsafe Characters
Characters that are not safe to transmit without encoding:
- Spaces: Encoded as %20 (or + in query strings)
- Special characters: <, >, ", {, }, |, \\, ^, \`, [, ]
- Non-ASCII characters: Any character outside the 128 ASCII characters

## Encoding Examples

| Original | Encoded |
|----------|---------|
| Hello World | Hello%20World |
| user@example.com | user%40example.com |
| a+b=c | a%2Bb%3Dc |
| café | caf%C3%A9 |
| 你好 | %E4%BD%A0%E5%A5%BD |
| emoji 😀 | %F0%9F%98%80 |

## URL Components and Their Rules

Different parts of a URL have different encoding rules:

### Path Segments
Slashes (/) are path separators. Within a path segment, encode reserved characters but keep unreserved ones (letters, digits, -, _, ., ~).

### Query Parameters
The key=value pairs after the ? separator. Both keys and values should be encoded. Historically, spaces can be + in query strings (application/x-www-form-urlencoded format).

### Fragment Identifiers
The portion after #. Used for in-page navigation. Should be encoded but + does not represent space here.

## JavaScript URL Encoding Functions

JavaScript provides several related functions:

### encodeURIComponent()
Encodes a single URI component (query value, path segment). Encodes everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
\`\`\`javascript
encodeURIComponent('Hello World!')  // 'Hello%20World!'
encodeURIComponent('user@example.com')  // 'user%40example.com'
\`\`\`

### encodeURI()
Encodes a complete URI, preserving structural characters. Does NOT encode: ; , / ? : @ & = + \$ # A-Z a-z 0-9 - _ . ! ~ * ' ( )
\`\`\`javascript
encodeURI('https://example.com/path?q=hello world')
// 'https://example.com/path?q=hello%20world'
\`\`\`

### URLSearchParams
The modern API for query string handling:
\`\`\`javascript
const params = new URLSearchParams({
  query: 'hello world',
  filter: 'a+b=c'
});
console.log(params.toString());
// 'query=hello+world&filter=a%2Bb%3Dc'
\`\`\`

## IDN (Internationalized Domain Names)

Non-ASCII domain names (like münchen.de) are handled through Punycode encoding:
- münchen.de → xn--mnchen-3ya.de

This allows Unicode in domain names while maintaining backward compatibility with DNS infrastructure.

## Using the URL Encoder Tool

Our tool:
1. **Encode any text** — converts to percent-encoded URL-safe format
2. **Decode encoded URLs** — restore original text from encoded form
3. **Component vs. full URL mode** — apply appropriate encoding rules
4. **Query parameter builder** — build properly encoded query strings from key-value pairs
5. **Copy result** — one-click copy of encoded/decoded output

Use it for building API URLs with special characters, debugging URL encoding issues, encoding user input for URL parameters, and understanding what percent-encoded URLs actually contain.`,

'jwt-explained': `## What Is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe token format for representing claims (assertions) between two parties. Defined by RFC 7519, JWTs are the standard mechanism for authentication tokens, API authorization, and secure information exchange in modern web applications.

## JWT Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### Header
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`
Specifies the token type (JWT) and the signing algorithm (HS256 = HMAC-SHA256).

### Payload (Claims)
\`\`\`json
{
  "sub": "user123",
  "name": "Alice",
  "email": "alice@example.com",
  "iat": 1700000000,
  "exp": 1700003600
}
\`\`\`

### Signature
Created by signing the encoded header and payload with a secret key (or private key for RS256/ES256).

## Standard Claims

Reserved claim names with special meaning:
- **iss** (Issuer): Who created the token
- **sub** (Subject): Who the token is about (usually user ID)
- **aud** (Audience): Who the token is intended for
- **exp** (Expiration): When the token expires (Unix timestamp)
- **nbf** (Not Before): Token is invalid before this time
- **iat** (Issued At): When the token was created
- **jti** (JWT ID): Unique identifier for the token

## JWT Signing Algorithms

### Symmetric (Shared Secret)
- **HS256/HS384/HS512**: HMAC with SHA-256/384/512
- Same key used for signing and verification
- Simple but requires sharing the secret

### Asymmetric (Public/Private Key)
- **RS256/RS384/RS512**: RSA with SHA-256/384/512
- Private key signs, public key verifies
- Third parties can verify without the signing key

- **ES256/ES384/ES512**: ECDSA (more efficient than RSA)
- Smaller key sizes for same security level

## Security Considerations

### The "alg: none" Attack
Early JWT libraries accepted unsigned tokens when alg was set to "none". Always validate the algorithm header and reject unexpected algorithms.

### Secret Key Strength
For HS256, use at least 256 bits of random entropy. Never use weak secrets like "secret" or "password". Use \`crypto.randomBytes(32)\` in Node.js.

### Token Storage
- **localStorage**: Accessible to JavaScript, vulnerable to XSS
- **HttpOnly cookies**: Not accessible to JavaScript, protected from XSS, but require CSRF protection
- Recommended: HttpOnly, Secure, SameSite=Strict cookies

### Token Revocation Challenge
JWTs are stateless — servers don't track which tokens are valid. Once issued, a JWT is valid until it expires. Workarounds:
- Short expiration times (15 minutes)
- Token blacklist (defeats statelessness)
- Refresh token rotation

## JWTs in Authentication Flow

1. User logs in with credentials
2. Server validates credentials
3. Server creates JWT signed with secret key
4. JWT returned to client
5. Client sends JWT in Authorization header on subsequent requests
6. Server validates JWT signature and claims
7. If valid, processes the request

\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## Using the JWT Parser Tool

Our tool:
1. **Paste any JWT** — immediately decoded and displayed
2. **Shows all three parts** — header, payload, and signature separately
3. **Claim interpretation** — timestamps shown as human-readable dates
4. **Validation status** — checks token expiration
5. **Algorithm identification** — shows which signing algorithm was used
6. **Copy parts** — extract header or payload as JSON

Use it for debugging authentication issues, understanding JWT contents during development, and verifying token structure and claims.`,

'json-to-yaml-guide': `## JSON and YAML: Two Faces of Structured Data

JSON and YAML both represent the same types of structured data — objects (maps), arrays (lists), strings, numbers, booleans, and null values — but with very different syntaxes. Understanding when to use each format and how to convert between them is a key skill for developers and DevOps professionals.

## YAML's Advantages Over JSON

### Human Readability
YAML uses whitespace-based structure instead of braces and brackets:

**JSON:**
\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080
  },
  "features": ["auth", "logging", "cache"]
}
\`\`\`

**YAML:**
\`\`\`yaml
server:
  host: localhost
  port: 8080
features:
  - auth
  - logging
  - cache
\`\`\`

The YAML version has fewer special characters and reads more like plain English.

### Comments
YAML supports comments with #, which is essential for configuration files:
\`\`\`yaml
# Database connection settings
database:
  host: localhost  # Change for production
  port: 5432
  # Maximum connections in pool
  pool_size: 10
\`\`\`

JSON has no comment support.

### Multi-line Strings
YAML has elegant multi-line string syntax:
\`\`\`yaml
# Literal block (preserves newlines)
message: |
  Hello, World!
  This is a multi-line message.
  
# Folded block (collapses newlines to spaces)
description: >
  This long description will be
  joined into a single line.
\`\`\`

## JSON's Advantages Over YAML

- **Universal parser support**: Every language has a JSON parser built-in or trivially available
- **No indentation errors**: Braces/brackets are explicit — indentation doesn't matter
- **Simpler specification**: JSON spec is a single page; YAML spec is 80 pages
- **No type ambiguity**: Less prone to unintended type coercion
- **Better for APIs**: Native JavaScript/web format
- **Deterministic**: No anchors, aliases, or merge keys to confuse simple parsers

## Converting JSON to YAML

The conversion is straightforward for most data:
- JSON objects become YAML mappings
- JSON arrays become YAML sequences
- JSON strings become YAML scalars (often unquoted if simple)
- JSON numbers and booleans are preserved
- Null becomes \`~\` or \`null\`

## YAML Features Without JSON Equivalents

**Anchors and Aliases:**
\`\`\`yaml
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  host: prod.example.com
\`\`\`

When converting to JSON, anchors are resolved and values are inlined.

**Merge Keys:**
\`\`\`yaml
base: &base
  key: value

extended:
  <<: *base
  extra: more
\`\`\`

## Common Use Cases for JSON-to-YAML

- Converting API responses to Kubernetes manifests
- Transforming JSON config to docker-compose.yml
- Creating Ansible playbooks from JSON data
- Converting OpenAPI/Swagger specs to more readable YAML
- Generating Helm chart values from programmatic JSON

## Using the JSON-to-YAML Converter

Our tool:
1. **Paste JSON data** — accepts any valid JSON
2. **Instant YAML output** — converts in real time
3. **Format preservation** — maintains data structure and types
4. **Copy YAML** — one-click copy for immediate use
5. **Roundtrip validation** — verify the YAML converts back to equivalent JSON

Use it for configuration file conversion, API documentation formatting, and integrating JSON-based tools with YAML-based infrastructure.`,

'base64-string-guide': `## What Is Base64 Encoding?

Base64 is an encoding scheme that converts binary data to a text format using a 64-character alphabet (A-Z, a-z, 0-9, +, /). It's not encryption — it provides no security — but it's the universal solution for transmitting binary data through text-only channels.

## Why Base64 Exists

The original internet protocols (SMTP, HTTP/1.0, JSON) were designed for 7-bit ASCII text. Binary data — images, files, cryptographic keys — cannot be safely transmitted through these channels because:
- Certain byte values have special meaning (null bytes, newlines, control characters)
- Some systems strip or transform high-bit characters
- Binary data may contain sequences that resemble protocol commands

Base64 solves this by converting any binary data to a safe subset of printable ASCII characters.

## The Base64 Character Set

Standard Base64 uses 64 printable characters:
- A-Z (26 characters)
- a-z (26 characters)  
- 0-9 (10 characters)
- + and / (2 characters)
- = for padding

This 64-character set can be represented with 6 bits per character (2^6 = 64).

## How Base64 Encoding Works

Base64 converts 3 bytes (24 bits) to 4 characters (4 × 6 bits = 24 bits):

1. Take 3 bytes: 01001101 01100001 01101110 ("Man")
2. Group into 6-bit chunks: 010011 010110 000101 101110
3. Map to Base64 characters: T W F u
4. Result: "TWFu"

When the input isn't divisible by 3, = padding is added:
- 1 extra byte → 2 characters + "=="
- 2 extra bytes → 3 characters + "="

## Size Overhead

Base64 increases data size by approximately 33%:
- 3 bytes in → 4 bytes out (ratio = 1.333...)
- 1 MB file becomes ~1.37 MB as Base64

With line breaks (MIME requires 76-char lines), overhead increases to ~37%.

## Base64 Variants

### Standard Base64 (RFC 4648)
Uses + and /. Padding with =. Used in MIME email, data URIs.

### URL-Safe Base64 (RFC 4648 §5)
Replaces + with - and / with _ to avoid URL encoding conflicts. Used in JWT tokens, URL parameters, filenames.

### Base64 Without Padding
Some systems (like many JWT implementations) omit the = padding. The decoder must handle this.

### MIME Base64
Standard Base64 with 76-character line breaks (\r\n). Used in email attachments.

## Common Uses of Base64

### Data URLs (CSS/HTML)
Embed small images directly in CSS or HTML without separate files:
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." />
\`\`\`

### JWT Tokens
All three parts of a JWT (header, payload, signature) are Base64URL encoded.

### API Authentication
HTTP Basic Auth encodes credentials as Base64:
\`\`\`
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`

### Cryptographic Keys
PEM format (used for SSL certificates, SSH keys) wraps Base64-encoded DER binary:
\`\`\`
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
\`\`\`

### Email Attachments (MIME)
All email attachments are Base64 encoded in the MIME multipart format.

## Decoding in JavaScript and Python

\`\`\`javascript
// Encode
const encoded = btoa('Hello, World!');  // 'SGVsbG8sIFdvcmxkIQ=='
// Decode
const decoded = atob('SGVsbG8sIFdvcmxkIQ==');  // 'Hello, World!'
// For binary data, use Uint8Array approaches
\`\`\`

\`\`\`python
import base64
encoded = base64.b64encode(b'Hello, World!').decode()  # 'SGVsbG8sIFdvcmxkIQ=='
decoded = base64.b64decode('SGVsbG8sIFdvcmxkIQ==')  # b'Hello, World!'
\`\`\`

## Using the Base64 String Converter

Our tool:
1. **Encode text or data** — convert any string to Base64
2. **Decode Base64** — restore original content from encoded string
3. **Choose variant** — standard, URL-safe, or MIME (with line breaks)
4. **Unicode support** — properly handles non-ASCII text with UTF-8
5. **Copy result** — one-click copy of encoded/decoded output

Use it for generating data URLs, debugging JWT contents, encoding API credentials, and understanding Base64-encoded data in web applications.`,

'uuid-vs-ulid': `## UUID vs. ULID: Choosing the Right Unique Identifier

When building applications that need unique identifiers for records, two popular formats stand out: **UUID** (Universally Unique Identifier) and **ULID** (Universally Unique Lexicographically Sortable Identifier). Understanding their differences helps you choose the right one for your use case.

## What Is a UUID?

UUID is defined by RFC 4122. The most common variant, UUID v4, is 128 bits of essentially random data:

\`\`\`
550e8400-e29b-41d4-a716-446655440000
\`\`\`

Format: 8-4-4-4-12 hexadecimal characters separated by hyphens (36 chars total).

### UUID Versions
- **v1**: Timestamp + MAC address. Sortable but exposes hardware info
- **v4**: Random. Most widely used — no information exposed
- **v5**: Namespace + SHA-1 hash. Deterministic from input
- **v7** (2023): Unix timestamp + random. Sortable — the modern recommendation
- **v8**: Custom/application-defined layout

## What Is a ULID?

ULID is a 128-bit identifier designed to be both unique and naturally sortable:

\`\`\`
01ARZ3NDEKTSV4RRFFQ69G5FAV
\`\`\`

Structure: 26 characters using Crockford's Base32 (0-9 and A-Z excluding I, L, O, U for readability)
- First 10 characters: 48-bit Unix millisecond timestamp
- Last 16 characters: 80 bits of randomness

## Key Differences

| Property | UUID v4 | UUID v7 | ULID |
|----------|---------|---------|------|
| Length | 36 chars (with hyphens) | 36 chars | 26 chars |
| Sortable | No | Yes (by creation time) | Yes (by creation time) |
| Timestamp-based | No | Yes (ms precision) | Yes (ms precision) |
| Case-sensitive | No | No | No |
| URL-safe | No (hyphens) | No (hyphens) | Yes |
| Monotonic within ms | No | Optional | Yes (each ULID increments) |
| Bit size | 128 bits | 128 bits | 128 bits |

## Database Performance Implications

### The UUID v4 Index Problem
Random UUIDs cause poor database performance when used as primary keys because:
- New records insert randomly throughout the B-tree index
- Causes page splits and fragmentation
- Reduces cache effectiveness (each insert touches a different page)

### Sequential IDs Are Faster
ULIDs and UUID v7 insert in time order, meaning:
- New records are typically appended to the end of the index
- Better cache utilization (recent data is "hot")
- Fewer page splits
- Better range scan performance for time-based queries

For high-write workloads, the difference can be 2-10x in insertion performance.

## When to Use UUID v4

- When you need compatibility with existing systems using UUID v4
- When you must not leak timestamp information in the ID
- When random distribution is specifically desired
- For identifiers not used as database primary keys (session tokens, etc.)

## When to Use ULID or UUID v7

- As database primary keys in append-heavy tables
- When IDs should be roughly time-sortable
- When you want URL-safe IDs (ULID has no hyphens)
- For distributed systems where IDs are generated across multiple nodes

## Security Considerations

- UUID v4 and ULID are NOT cryptographically secure — don't use them as secret tokens or authentication keys
- UUID v1's MAC address embedding exposes hardware information (privacy concern)
- ULIDs/UUID v7 timestamp exposure: anyone with the ID can determine approximately when a record was created

For secret tokens (password reset, API keys, session IDs), use cryptographically secure random generators.

## Using the UUID and ULID Generators

Our tool provides:
1. **Generate UUIDs** — versions 1, 4, 5, and 7 supported
2. **Generate ULIDs** — time-sorted, URL-safe identifiers
3. **Bulk generation** — create multiple IDs at once
4. **Timestamp extraction** — for ULID and UUID v7, shows the encoded timestamp
5. **Copy to clipboard** — single or all generated IDs

Use it for testing, seeding databases, generating unique identifiers for mock data, and understanding the structure of different ID formats.`,

'http-status-codes-guide': `## Understanding HTTP Status Codes

HTTP status codes are three-digit numbers returned by web servers to indicate the result of an HTTP request. They are grouped into five categories and provide essential information about whether requests succeeded, failed, or require additional action.

## Status Code Categories

### 1xx Informational
Temporary responses indicating the server has received the request and is continuing to process it.
- **100 Continue**: Server has received headers, client should proceed with request body
- **101 Switching Protocols**: Server agrees to upgrade protocol (WebSocket handshake)
- **103 Early Hints**: Preload resources while the server prepares the response

### 2xx Success
The request was successfully received, understood, and accepted.
- **200 OK**: Standard success response for GET, POST
- **201 Created**: Resource created successfully (typically after POST)
- **204 No Content**: Success but no response body (DELETE operations)
- **206 Partial Content**: Server delivering part of a resource (range requests)

### 3xx Redirection
The client must take additional action to complete the request.
- **301 Moved Permanently**: Resource permanently moved; update your links/bookmarks
- **302 Found**: Temporary redirect; original URL may be used again
- **304 Not Modified**: Resource unchanged since last request; use cached version
- **307 Temporary Redirect**: Like 302 but preserves HTTP method
- **308 Permanent Redirect**: Like 301 but preserves HTTP method

### 4xx Client Errors
The request contains an error on the client side.
- **400 Bad Request**: Malformed request syntax or invalid parameters
- **401 Unauthorized**: Authentication required or credentials invalid
- **403 Forbidden**: Authenticated but not authorized for this resource
- **404 Not Found**: Resource doesn't exist at this URL
- **405 Method Not Allowed**: HTTP method not supported for this endpoint
- **409 Conflict**: State conflict (e.g., duplicate resource, version conflict)
- **410 Gone**: Resource permanently removed (unlike 404, confirms it existed)
- **422 Unprocessable Entity**: Request well-formed but semantically incorrect
- **429 Too Many Requests**: Rate limiting in effect

### 5xx Server Errors
The server failed to fulfill a valid request.
- **500 Internal Server Error**: Generic server-side error
- **501 Not Implemented**: Server doesn't support the request method
- **502 Bad Gateway**: Upstream server returned invalid response
- **503 Service Unavailable**: Server temporarily unavailable (maintenance, overload)
- **504 Gateway Timeout**: Upstream server didn't respond in time

## Status Codes in REST API Design

### Using Status Codes Semantically
Good APIs use status codes to communicate precisely:

\`\`\`
GET /users/123     → 200 OK (user found)
GET /users/999     → 404 Not Found (user doesn't exist)
POST /users        → 201 Created (user created)
DELETE /users/123  → 204 No Content (deleted, no body)
POST /login        → 401 Unauthorized (wrong password)
GET /admin/data    → 403 Forbidden (not an admin)
POST /users        → 409 Conflict (email already exists)
\`\`\`

### Common Mistakes
- Returning 200 with error details in the body ("200 OK" with {error: "User not found"})
- Using 403 for unauthenticated requests (should be 401)
- Using 500 for client validation errors (should be 400/422)
- Always returning 200 regardless of result

## Authentication vs. Authorization Confusion

**401 Unauthorized** is poorly named — it actually means "unauthenticated":
- You haven't proven who you are
- Sends WWW-Authenticate header indicating how to authenticate

**403 Forbidden** means "unauthorized" — you're identified but not allowed:
- Server knows who you are
- Your permissions don't include this resource

## Caching and Status Codes

Status codes affect HTTP caching behavior:
- **200**: Cacheable by default (with appropriate headers)
- **301**: Cached indefinitely by browsers
- **302**: Generally not cached
- **404**: Can be cached (configurable)
- **5xx**: Generally not cached

## Using the HTTP Status Codes Reference

Our tool provides:
1. **All status codes** organized by category with names and descriptions
2. **Common usage examples** for each code
3. **Search** — find codes by number or keyword
4. **RFC references** — link to official specifications
5. **Copy code** — quickly copy the status code number for use in code

Keep it handy as a reference when designing APIs, debugging HTTP responses, and understanding web server behavior.`,

'json-prettify-and-validate': `## JSON Pretty-Printing and Validation

Working with JSON in development involves two related but distinct needs: validating that JSON is syntactically correct, and formatting it for human readability. A combined pretty-printer and validator handles both in one step.

## What Is JSON Validation?

JSON validation checks whether a string is valid JSON according to RFC 8259. Valid JSON must:
- Be a single value (object, array, string, number, boolean, or null)
- Use double quotes for strings (single quotes are not valid JSON)
- Not have trailing commas after the last array or object element
- Use proper escape sequences in strings
- Have matched brackets and braces

### Common JSON Syntax Errors

**Trailing commas:**
\`\`\`json
{
  "name": "Alice",
  "age": 28,  ← Error: trailing comma
}
\`\`\`

**Single quotes:**
\`\`\`json
{
  'name': 'Alice'  ← Error: must use double quotes
}
\`\`\`

**Unquoted keys:**
\`\`\`json
{
  name: "Alice"  ← Error: keys must be quoted
}
\`\`\`

**Undefined values:**
\`\`\`json
{
  "value": undefined  ← Error: undefined is not a JSON value
}
\`\`\`

**Comments:**
\`\`\`json
{
  // This comment will cause a parse error
  "name": "Alice"
}
\`\`\`

## Pretty-Printing JSON

Pretty-printing transforms minified or poorly-formatted JSON into a human-readable form. The key elements are:
- **Indentation**: Typically 2 or 4 spaces per nesting level
- **Line breaks**: One property per line in objects, one element per line in arrays
- **Spacing**: Spaces after colons and commas

### Formatted Example
\`\`\`json
{
  "user": {
    "id": 42,
    "name": "Alice Smith",
    "roles": [
      "admin",
      "editor"
    ],
    "metadata": {
      "created": "2024-01-15T10:30:00Z",
      "active": true
    }
  }
}
\`\`\`

## JSON Schema Validation

Beyond syntax validation, JSON Schema validates the *structure and content* of JSON:

\`\`\`json
{
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    }
  },
  "additionalProperties": false
}
\`\`\`

This schema:
- Requires name and email fields
- Validates name length
- Validates email format
- Disallows unknown fields
- Optionally validates age as an integer in range

JSON Schema is used extensively in API documentation, form validation, and configuration file validation.

## JSONPath Queries

JSONPath is a query language for extracting data from JSON (analogous to XPath for XML):

\`\`\`
$.users[*].name          → All user names
$.users[0].address.city  → First user's city
$.users[?(@.age > 18)]   → Users over 18
$.store..price           → All prices anywhere in store
\`\`\`

JSONPath is supported in many languages and tools for extracting and transforming JSON data.

## JSON in Development Workflows

### Configuration Files
package.json, tsconfig.json, .prettierrc, and other configuration files are validated by their tools. Pretty formatting makes them readable in code review.

### API Testing
Testing tools (Postman, Insomnia, REST Client) display response JSON formatted and validated. Seeing "Invalid JSON" in the response body immediately flags a backend error.

### Log Analysis
Structured JSON logs need to be parseable. Validation during logging prevents unparseable log entries that break monitoring tools.

## Using the JSON Prettify and Validate Tool

Our tool:
1. **Validate JSON** — immediate syntax checking with error locations
2. **Pretty-print** — format with configurable indentation
3. **Minify** — remove whitespace for compact output
4. **Sort keys** — alphabetize object properties for stable output
5. **Error highlighting** — shows exactly where syntax errors occur
6. **Copy formatted JSON** — one-click copy

Use it for debugging API responses, validating configuration files, formatting JSON for code reviews, and understanding JSON errors in server logs.`,
}

async function main() {
  console.log('🚀 Updating short articles in Supabase...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const [slug, content] of Object.entries(articles)) {
    const wordCount = content.split(/\s+/).length
    
    const { error } = await supabase
      .from('tools_articles')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
    
    if (error) {
      console.error(`  ❌ Error updating ${slug}: ${error.message}`)
      errorCount++
    } else {
      console.log(`  ✅ Updated: ${slug} (${wordCount} words)`)
      successCount++
    }
  }
  
  console.log(`\n🎉 Done!`)
  console.log(`  ✅ Updated: ${successCount}`)
  console.log(`  ❌ Errors:  ${errorCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
