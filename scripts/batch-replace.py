#!/usr/bin/env python3
"""Batch replace article contents using line-based approach."""
import sys

FILE_PATH = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_article_content_range(lines, slug):
    """Find the start and end line indices of an article's content."""
    slug_line = -1
    for i, line in enumerate(lines):
        if f"slug: '{slug}'" in line:
            slug_line = i
            break
    if slug_line == -1:
        return None, None

    # Find content: ` line
    content_start = -1
    for i in range(slug_line, min(slug_line + 20, len(lines))):
        if "content: `" in lines[i]:
            content_start = i
            break
    if content_start == -1:
        return None, None

    # Find end: line starting with `,` at the end of template literal
    content_end = -1
    for i in range(content_start + 1, len(lines)):
        stripped = lines[i].rstrip()
        # Check if this line ends the template literal: either ``, or  `,`
        if stripped.endswith("`,") and not "content: `" in lines[i]:
            content_end = i
            break

    return content_start, content_end


def replace_article_content(lines, slug, new_content_lines):
    """Replace article content in the lines array."""
    start, end = find_article_content_range(lines, slug)
    if start is None:
        print(f"ERROR: Could not find range for '{slug}'")
        return lines

    # Keep the 'content: `' prefix from the start line
    prefix = lines[start]
    indent = prefix[:len(prefix) - len(prefix.lstrip())]

    new_lines = []
    new_lines.append(f"{indent}content: `{new_content_lines[0]}\n")
    for content_line in new_content_lines[1:]:
        new_lines.append(content_line + '\n')
    new_lines.append(f"{indent}  `,\n")

    # Wait, we need to end with correct syntax
    # The original line at 'end' is like "    → Try the [...]\`,"
    # We need the new content to end with "`," 
    # Let me reconsider the structure

    # Build new block:
    result = lines[:start]
    result.append(f"{indent}content: `{new_content_lines[0]}\n")
    for content_line in new_content_lines[1:-1]:
        result.append(content_line + '\n')
    # Last line should end with `,
    last_line = new_content_lines[-1]
    result.append(last_line + '`,\n')
    result.extend(lines[end + 1:])

    print(f"✅ Replaced: {slug} (lines {start}-{end})")
    return result


# ─── Define all 16 article contents ──────────────────────────────────────────
articles = {}

articles['url-encoding-explained'] = """\
## Why URLs Need Encoding

Every URL travels through dozens of systems: DNS resolvers, proxies, load balancers, web servers, and application frameworks. Each was built around one assumption: **URLs are ASCII text**. The moment you include a space, a Chinese character, an ampersand, or an emoji, you risk breaking that chain.

URL encoding (formally called **percent-encoding**, defined in RFC 3986) converts unsafe characters into a safe, universally transferable format.

## The RFC 3986 Character Classification

**Unreserved characters** (never need encoding): Letters `A-Z`, `a-z`, digits `0-9`, and `-`, `_`, `.`, `~`

**Reserved characters** (encode when used as data): `:`, `/`, `?`, `#`, `[`, `]`, `@`, `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, `=`

**Everything else** must be percent-encoded.

### How Percent-Encoding Works

Each byte is represented as `%XX` where `XX` is the hexadecimal value:

| Character | UTF-8 Bytes | Encoded |
|---|---|---|
| space | `0x20` | `%20` |
| `&` | `0x26` | `%26` |
| `=` | `0x3D` | `%3D` |
| 中 (Chinese) | `0xE4 0xB8 0xAD` | `%E4%B8%AD` |
| 🚀 (emoji) | `0xF0 0x9F 0x9A 0x80` | `%F0%9F%9A%80` |

## encodeURI vs encodeURIComponent

### encodeURI — For Complete URLs

`encodeURI()` encodes a **full URL** while preserving structural characters:

```javascript
encodeURI('https://example.com/search?q=hello world&lang=中文')
// → 'https://example.com/search?q=hello%20world&lang=%E4%B8%AD%E6%96%87'
```

It does **not** encode: `A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #`

### encodeURIComponent — For Query Parameter Values

`encodeURIComponent()` encodes **individual values** embedded inside a URL:

```javascript
encodeURIComponent('hello world & more=stuff')
// → 'hello%20world%20%26%20more%3Dstuff'

const q = 'C++ programming & algorithms'
const url = `https://search.example.com?q=${encodeURIComponent(q)}`
// → 'https://search.example.com?q=C%2B%2B%20programming%20%26%20algorithms'
```

| Function | Encodes | Keeps |
|---|---|---|
| `encodeURI` | Spaces, Unicode, some symbols | `: / ? # [ ] @ ! $ & ' ( ) * + , ; =` |
| `encodeURIComponent` | Everything except unreserved chars | `A-Z a-z 0-9 - _ . ~` |

## The Double-Encoding Trap

One of the most common bugs is **double-encoding** — encoding an already-encoded URL:

```javascript
const encoded = 'hello%20world'
encodeURIComponent(encoded)
// → 'hello%2520world'  ← %25 is the encoded form of %
```

**Fix:** Decode first, then encode once:

```javascript
function safeEncode(value) {
  try {
    return encodeURIComponent(decodeURIComponent(value))
  } catch {
    return encodeURIComponent(value)
  }
}
```

## Chinese, Japanese, and Emoji Encoding

Modern URLs support Unicode through percent-encoding of UTF-8 bytes. Browsers display the decoded version in the address bar for readability, but HTTP requests use the encoded form.

```javascript
encodeURIComponent('北京')
// 北 = U+5317 → UTF-8: E5 8C 97 → %E5%8C%97
// 京 = U+4EAC → UTF-8: E4 BA AC → %E4%BA%AC
// Result: '%E5%8C%97%E4%BA%AC'
```

## Form Encoding: application/x-www-form-urlencoded

HTML forms encode **spaces as `+`** instead of `%20`. JavaScript's `URLSearchParams` handles this automatically:

```javascript
const params = new URLSearchParams({ q: 'hello world', filter: 'a&b' })
params.toString()
// → 'q=hello+world&filter=a%26b'
```

## Common Mistakes

```javascript
// ❌ Not encoding query values — & breaks query string
const url = `/search?q=${userInput}`

// ✅ Always encode values
const url = `/search?q=${encodeURIComponent(userInput)}`

// ❌ Using encodeURIComponent on entire URL — breaks structure
const url = encodeURIComponent('https://example.com/path?q=hello')

// ✅ Use encodeURI for full URLs
const url = encodeURI('https://example.com/path?q=hello world')
```

## Best Practice: Use the URL API

```javascript
const url = new URL('https://example.com/search')
url.searchParams.set('q', 'C++ & algorithms')
url.searchParams.set('lang', '中文')
console.log(url.toString())
// → 'https://example.com/search?q=C%2B%2B+%26+algorithms&lang=%E4%B8%AD%E6%96%87'
```

→ Try the [URL Encoder/Decoder](/url-encoder)"""

# Process all articles
print("Starting batch replacement...")
for slug, content in articles.items():
    content_lines = content.split('\n')
    lines = replace_article_content(lines, slug, content_lines)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done!")
