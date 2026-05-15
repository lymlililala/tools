#!/usr/bin/env python3
"""
Batch 5: meta-tag-generator, emoji-picker, ascii-art-generator, numeronym-generator,
random-decision-picker, ipv4-range-expander, ipv4-address-converter, ipv6-ula-generator,
mac-address-lookup, email-normalizer, html-wysiwyg-editor, text-to-binary,
text-to-nato, text-to-unicode
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

articles['meta-tag-generator-guide'] = r"""## What Are Meta Tags?

Meta tags are HTML elements that provide metadata about a webpage. They sit inside the `<head>` section and are invisible to visitors but critical for search engines, social platforms, and browsers. The right meta tags can dramatically improve click-through rates, social sharing appearance, and overall SEO performance.

## Why Meta Tags Matter for SEO

Search engines use meta tags to understand page content and display results. A compelling **title tag** and **meta description** directly influence whether users click your listing. Studies show that optimizing these two elements alone can increase click-through rates by 30% or more.

Social platforms like Facebook, Twitter, and LinkedIn use **Open Graph** and **Twitter Card** tags to control how links appear when shared, including the image, title, and description displayed in previews.

## Essential Meta Tags Explained

### Title Tag
The most important SEO element. Keep it under 60 characters, include your primary keyword near the beginning, and make it compelling for human readers.

### Meta Description
Appears below your title in search results. Aim for 150-160 characters, include a call to action, and naturally incorporate keywords. This doesn't directly affect rankings but strongly impacts click-through rates.

### Robots Meta Tag
Controls search engine crawler behavior. Use `noindex` for admin pages, thank-you pages, or duplicate content.

### Canonical URL
Prevents duplicate content penalties by telling search engines which URL is the "official" version of a page.

## Open Graph Tags (Facebook, LinkedIn)

Open Graph tags control social media link previews. Required fields:
- `og:title` — Title for social sharing
- `og:description` — Short description (150-200 chars)
- `og:image` — Preview image (recommended: 1200x630px)
- `og:url` — Canonical URL of the page
- `og:type` — Content type (article, website, product)

**Image specifications:**
- Recommended size: 1200 x 630 pixels
- Minimum size: 600 x 315 pixels
- File formats: JPG, PNG, GIF
- Maximum file size: 8MB

## Twitter Card Tags

Twitter Card types:
- `summary` — Small thumbnail with text
- `summary_large_image` — Large image preview (most common)
- `app` — App install card
- `player` — Video/audio player

Key tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`

## Structured Data with JSON-LD

Beyond meta tags, JSON-LD structured data helps search engines understand content context. Common schema types include `Article`, `Product`, `Recipe`, `FAQPage`, `LocalBusiness`, and `BreadcrumbList`.

Structured data can unlock **rich snippets** in search results — star ratings, recipe info, event dates, and FAQ dropdowns — dramatically increasing click-through rates.

## Meta Tag Best Practices

1. **Each page gets unique tags** — Never duplicate titles or descriptions across pages
2. **Match search intent** — Align your title and description with what searchers actually want
3. **Include primary keyword naturally** — Don't stuff keywords; write for humans first
4. **Test social previews** — Use Facebook Debugger and Twitter Card Validator
5. **Keep lengths optimal** — Title: 50-60 chars, Description: 150-160 chars
6. **Update OG images seasonally** — Fresh images can revitalize social sharing
7. **Use absolute URLs** — Always use full URLs in canonical and OG tags

## Common Mistakes to Avoid

- **Missing meta descriptions**: Pages without descriptions get auto-generated snippets which often look poor in search results
- **Wrong image dimensions**: Social platforms crop images to specific ratios; wrong sizes lead to ugly previews
- **Forgetting mobile viewport**: Without the viewport meta tag, mobile users see a desktop-scaled page
- **Duplicate titles site-wide**: Identical titles confuse search engines and waste ranking potential
- **Omitting canonical on paginated content**: Pagination creates duplicate content issues without canonicals

## Using the Meta Tag Generator

Our meta tag generator creates all the essential tags automatically:

1. Enter your page title and description
2. Add your page URL and author information
3. Select the appropriate content type
4. Upload or link your preview image
5. Copy the generated HTML to your `<head>` section

The generator produces properly formatted Open Graph, Twitter Card, and standard SEO meta tags — saving hours of manual configuration and ensuring you don't miss any important elements.

Invest time in meta tags — they're the first thing both search engines and human visitors encounter, and they directly impact your organic search performance and social sharing effectiveness.
"""

articles['emoji-picker-guide'] = r"""## The Universal Language of Emoji

Emoji have evolved from simple emoticons into a sophisticated visual communication system used by billions of people daily. With over 3,600 emoji in the Unicode standard as of 2024, finding the right one quickly requires a powerful picker tool.

## A Brief History of Emoji

The first emoji were created in 1999 by Shigetaka Kurita for NTT DoCoMo's mobile internet platform in Japan. The original set contained just 176 symbols in a 12x12 pixel grid. Apple included emoji support in iOS 2.2 in 2008, and the Unicode Consortium began standardizing them in 2010.

Today, emoji are officially part of Unicode, which means they work consistently across all modern operating systems, though rendering styles differ between platforms.

## How Emoji Work Technically

Emoji are Unicode characters represented as code points:
- Smiling face: U+1F600
- Red heart: U+2764 U+FE0F (with variation selector)
- Family emoji: Multiple code points joined by Zero Width Joiners (ZWJ)

### Skin Tone Modifiers
Five skin tone modifiers can be combined with many human emoji to represent different Fitzpatrick scale skin tones, enabling more inclusive representation.

### Multi-Person Emoji (ZWJ Sequences)
Family emoji like the family group are actually sequences of individual emoji joined by invisible Zero Width Joiner characters (U+200D), allowing flexible combinations of people and relationships.

## Emoji Categories

The Unicode standard organizes emoji into 10 groups: Smileys and People, Animals and Nature, Food and Drink, Travel and Places, Activities, Objects, Symbols, Flags, and additional extras. Each category is regularly expanded with new additions.

## Platform Rendering Differences

The same emoji can look very different across platforms:
- **Apple**: Detailed, three-dimensional style with shadows
- **Google/Android**: Flat, colorful, clean design
- **Microsoft**: Newer flat design (older versions had the "blob" style)
- **Twitter/X**: Custom designs that sometimes diverge significantly

This matters for cross-platform communication — emoji meaning can shift based on how they render for the recipient.

## Using Emoji Effectively

### Marketing and Social Media
- Posts with emoji get 25% more engagement on average
- Use emoji at the beginning of sentences to draw attention
- Include relevant emoji in email subject lines
- Don't overuse — one or two per sentence maximum

### Accessibility Considerations
Screen readers announce emoji by their Unicode name. Best practices:
- Avoid strings of multiple emoji
- Don't use emoji as the only way to convey meaning
- Add `aria-hidden="true"` when emoji are purely decorative

### In Code and Technical Writing
Use Unicode escape sequences or HTML entities when emoji might cause encoding issues:
- HTML: `&#x1F600;`
- JavaScript: `'\u{1F600}'`
- Python: `'\U0001F600'`
- CSS: `\1F600`

## Emoji in URLs and Databases

Emoji in URLs should be percent-encoded. When storing emoji in databases, ensure your character set supports 4-byte UTF-8 encoding (MySQL's `utf8mb4` charset, for example — the standard `utf8` encoding won't work for emoji).

## Using the Emoji Picker Tool

Our emoji picker provides:

1. **Search by name** — Type "heart," "fire," or any keyword to find emoji instantly
2. **Browse by category** — Navigate through organized groups
3. **Recent emoji** — Quick access to your most-used emoji
4. **Copy to clipboard** — One-click copying in various formats
5. **Copy as Unicode** — Get the U+XXXXX code point
6. **Copy as HTML entity** — Get the HTML entity form for HTML use

## New Emoji Additions

The Unicode Consortium reviews emoji proposals annually. New emoji are added each year, reflecting cultural moments, medical conditions, professions, and diversity more comprehensively.

Organizations and companies can submit emoji proposals at unicode.org. The approval process typically takes 2-3 years from submission to widespread device support.

Emoji continue to evolve as our communication needs change — from simple smiley faces to a rich visual vocabulary that transcends language barriers worldwide.
"""

articles['ascii-art-generator-guide'] = r"""## What Is ASCII Art?

ASCII art is a graphic design technique that creates images using printable characters from the ASCII (American Standard Code for Information Interchange) standard. Instead of pixels, images are composed from characters like letters, numbers, punctuation marks, and special symbols. It's both a technical craft and a digital art form with a rich history dating back to the earliest days of computing.

## A Brief History of ASCII Art

ASCII art predates the internet. Early practitioners created images in the 1960s and 1970s using typewriters, a form called "typewriter art." When teletype machines and early printers could only output characters, ASCII art was the only way to include "graphics" in computer output.

The form flourished in the 1980s-1990s on bulletin board systems (BBS), where users decorated profiles, created scene group headers, and built elaborate artwork using only text characters. The ANSI art scene used 256-color escape codes to create vibrant, detailed works.

## Types of ASCII Art

### Single-Line Emoticons
Horizontal emoticons and decorations used in everyday text communication.

### Multi-Line Block Art
Traditional ASCII art composed across multiple lines to depict animals, faces, or scenes using character density.

### Text-to-ASCII Art (Big Text)
Rendering text using ASCII characters as font pixels, creating large stylized lettering for banners and headers.

### Shaded Art
Using the visual density of different characters to create light and shadow effects, simulating grayscale images.

## ASCII Art Fonts

The most popular standard for big text ASCII art is **FIGlet** format. Common FIGlet fonts include:
- **Standard** — Classic serif-style ASCII letters
- **Banner** — Wide, bold block letters
- **Block** — Solid block characters
- **Bubble** — Rounded, soft-looking letters
- **Slant** — Italic-style diagonal characters
- **3D** — Three-dimensional extruded appearance
- **Doom** — Rough, aggressive style popular in the hacker scene
- **Big** — Large detailed letterforms
- **Script** — Cursive-style ASCII letters

## Character Density and Shading

For photo-to-ASCII conversion, characters are chosen based on their "visual density." From lightest to darkest, a typical character set progression:
`. : - = + * # % @`

Different sets suit different aesthetics — minimal sets create clean, sparse art, while extended sets enable finer gradients and more photorealistic results.

## ASCII Art in Programming

ASCII art appears throughout developer culture:

### Code Comments and Documentation
Many open source projects use ASCII art for README banners and section headers in large code files, creating visual landmarks in long documents.

### Easter Eggs in Terminals
Many command-line tools and programs hide ASCII art in their output. The classic `apt-get moo` in Debian displays a cow with a philosophical message.

### Network Diagrams
Network engineers use ASCII to document topologies in plain text files, which works beautifully in version-controlled documentation and Markdown files.

### Protocol Documentation
Visualizing packet structures and data formats using ASCII diagrams is a common pattern in RFCs and technical specifications.

## Using the ASCII Text Drawer

Our ASCII art generator offers:

1. **Custom text input** — Type any message and see it rendered in ASCII
2. **Font selection** — Choose from dozens of FIGlet-compatible fonts
3. **Width control** — Adjust maximum width to fit your terminal
4. **Character set** — Switch between standard ASCII and extended characters
5. **Copy to clipboard** — Instantly copy the generated art
6. **Export options** — Save as plain text or copy formatted for code comments

## Practical Uses

- **Terminal welcome messages** — Style your SSH login banners
- **Code headers** — Mark major sections in large files
- **README files** — Stand out on GitHub with a distinctive header
- **Email signatures** — Add retro flair in monospaced email clients
- **Game development** — Roguelike and text-adventure interface elements
- **Protocol documentation** — Visualize packet structures and formats

ASCII art combines technical constraints with artistic creativity — proving that limitations often inspire the most inventive solutions. The constraint of working only with printable characters has produced an enduring art form that continues to thrive in developer culture today.
"""

articles['numeronym-generator-guide'] = r"""## What Is a Numeronym?

A numeronym is a word where a number is used to form an abbreviation. The most common type replaces the middle letters of a word with a count of how many letters were omitted. This creates compact abbreviations that programmers, tech writers, and organizations use as shorthand.

## How Numeronyms Work

The basic pattern: **first letter + number of omitted letters + last letter**

Common examples:
- **i18n** — internationalization (18 letters between i and n)
- **a11y** — accessibility (11 letters between a and y)
- **l10n** — localization (10 letters between l and n)
- **K8s** — Kubernetes (8 letters between K and s)
- **g11n** — globalization
- **a12n** — authorization

## Famous Tech Numeronyms

### i18n (Internationalization)
The process of designing software so it can be adapted to different languages and regions. The term was shortened to i18n in the 1970s-80s. It covers date/time formatting, currency display, text direction (RTL/LTR), character encoding, and number formatting.

### a11y (Accessibility)
Making digital products usable by people with disabilities. Encompasses screen reader compatibility, keyboard navigation, color contrast ratios, alternative text for images, and ARIA attributes.

### l10n (Localization)
The process of adapting internationalized software for a specific locale, including translation, cultural adjustments, and compliance with local regulations.

### K8s (Kubernetes)
The container orchestration platform. The numeronym was popularized within Google and the Kubernetes community and is now the standard abbreviation in the container ecosystem.

## Other Types of Numeronyms

### Number Homophones
Words where numbers sound like the replaced letters:
- **Y2K** — Year 2000
- **W3C** — World Wide Web Consortium
- **L8R** — Later
- **B4** — Before
- **GR8** — Great

### Portmanteau Numeronyms
Company and product names incorporating numbers:
- **3M** — Minnesota Mining and Manufacturing
- **7-Eleven** — Named after original operating hours
- **A1** — Best quality grade

## Numeronyms in Software Development

Developers use numeronyms extensively in API documentation, configuration files, and package names. Examples:
- `vue-i18n` — Vue.js internationalization plugin
- `react-a11y` — React accessibility utilities
- `k8s-client` — Kubernetes API client libraries

Configuration files frequently reference these abbreviations in keys and comments, making them essential vocabulary for any developer working with internationalized or accessible software.

## Creating Your Own Numeronyms

Rules for creating a standard numeronym:
1. Take the first letter of the word
2. Count the letters between first and last
3. Take the last letter
4. Combine: `first + count + last`

For proper nouns, capitalize as appropriate — Kubernetes becomes K8s (capital K, lowercase s), while internationalization becomes i18n (all lowercase).

## Why Numeronyms Persist

In an age of autocomplete and copy-paste, why do numeronyms survive?

1. **Typing efficiency** — i18n is significantly faster to type than internationalization
2. **Visual compactness** — Better for column-constrained environments (code, spreadsheets, terminal output)
3. **Domain identification** — Marks familiarity with the tech community
4. **Memorability** — Paradoxically, the abbreviation often becomes more recognizable than the full word

The numeronym generator lets you instantly create numeronyms for any word — useful for creating consistent abbreviations in documentation, code comments, and technical writing. Simply enter a word and get its numeronym form, along with the ability to batch-process multiple terms at once.
"""

articles['random-decision-picker-guide'] = r"""## The Psychology of Decision Fatigue

Making decisions consumes mental energy. Research shows that after making many decisions throughout the day, decision quality deteriorates — a phenomenon called **decision fatigue**. This explains why judges make harsher rulings later in the day and why executives make poorer choices in afternoon meetings.

For low-stakes decisions where any choice is roughly equivalent, offloading the decision to a random picker eliminates cognitive drain and preserves mental resources for decisions that truly matter.

## When to Use a Random Decision Picker

### Low-Stakes Choices
- Where to eat lunch when all options are acceptable
- Which movie to watch when everyone is indifferent
- What activity to do when all choices sound equally fun
- Which work task to start when all have equal priority

### Fair Selection
- Choosing who presents first in a meeting
- Selecting a winner for a giveaway or raffle
- Deciding turn order in games
- Assigning tasks to team members equitably

### Breaking Deadlocks
- When a group is equally split between options
- Escaping the paradox of choice after thorough research
- Committing to action rather than endlessly deliberating

### Avoiding Unconscious Bias
Humans have unconscious biases in selection. Randomness removes them for sample selection in research, A/B test group assignment, and random code review assignment.

## How True Randomness Works

Computers struggle with true randomness — they're deterministic machines. To generate random numbers, they use two approaches:

### Pseudo-Random Number Generators (PRNGs)
Most `random()` functions use mathematical algorithms that produce sequences which appear random but are actually deterministic if you know the seed. Examples include the Mersenne Twister (widely used in Python and PHP) and Xorshift. These are fine for non-security applications like games and simulations.

### Cryptographically Secure PRNGs (CSPRNGs)
For security-sensitive randomness, hardware entropy sources (mouse movements, keyboard timing, hardware noise) are mixed into a cryptographic algorithm. Examples include `crypto.getRandomValues()` in browsers and `/dev/urandom` on Linux/macOS.

Our random decision picker uses `crypto.getRandomValues()` — ensuring each selection is genuinely unpredictable and fair.

## The Gambler's Fallacy

A common misconception: if heads came up 5 times in a row, tails is "due." This is the gambler's fallacy. Each coin flip is independent — past results don't influence future probabilities.

Similarly, in a random picker, if "Pizza" was selected 3 times in a row, it has exactly the same probability of being selected again. The probability of any option is always 1 divided by the number of options.

## Alternatives to Pure Random Selection

### Weighted Randomness
Give different probabilities to different options based on preferences or priorities while still introducing randomness within those preferences.

### Elimination Rounds
Remove options that have been recently selected to guarantee variety over time, preventing the same choice from appearing too frequently.

### Round-Robin with Randomization
Cycle through all options randomly, then reshuffle and repeat, guaranteeing each option appears equally often over many selections.

## Using the Random Decision Picker

Our tool is designed for simplicity and fairness:

1. **Add your options** — Enter each option on a new line or separated by commas
2. **Pick a winner** — Click the button for an animated random selection
3. **Re-roll** — Roll again if needed (but commit to the first pick for true fairness!)
4. **Adjust options** — Add, remove, or edit options at any time

The tool uses the Web Crypto API's `crypto.getRandomValues()` for genuine cryptographic randomness — not `Math.random()` which could theoretically be predicted.

## The "Coin Toss Revelation" Technique

A useful technique from behavioral economics: flip a coin (or use the random picker) and note your gut reaction to the result. If you feel disappointed by the outcome, that reveals your true preference. Use the random picker not as the final answer but as a mirror reflecting what you actually want.

Randomness isn't about avoiding responsibility — it's about channeling decision-making energy toward choices where it genuinely matters and eliminating decision fatigue on choices where any option is acceptable.
"""

articles['ipv4-range-expander-guide'] = r"""## Understanding IP Address Ranges

In networking, you often need to work with ranges of IP addresses — whether defining firewall rules, configuring subnets, allocating DHCP pools, or specifying access control lists. IP ranges can be expressed in multiple formats, each suited for different purposes.

## IP Range Notation Formats

### CIDR Notation
**Classless Inter-Domain Routing (CIDR)** is the standard format for modern networks. The number after the slash indicates how many bits are in the network portion.

Examples: `192.168.1.0/24`, `10.0.0.0/8`, `172.16.0.0/12`

### Range Notation
Direct start-to-end specification: `192.168.1.1 - 192.168.1.254`

### Wildcard Mask
Used in Cisco ACLs (Access Control Lists), a wildcard mask is the bitwise inverse of a subnet mask.

### Subnet Mask
Traditional notation still used in many network interfaces and older documentation.

## How CIDR Prefix Lengths Work

The prefix length determines how many addresses are in the range:

| CIDR | Addresses | Usable Hosts | Common Use |
|------|-----------|--------------|------------|
| /8 | 16,777,216 | 16,777,214 | Large enterprise, ISP |
| /16 | 65,536 | 65,534 | Medium organization |
| /24 | 256 | 254 | Small network segment |
| /26 | 64 | 62 | Small VLAN |
| /28 | 16 | 14 | Tiny segment |
| /30 | 4 | 2 | Point-to-point link |
| /32 | 1 | 1 | Host route |

Usable hosts equals total addresses minus 2 (network address and broadcast address).

## Converting Between Formats

### CIDR to Range
Given `192.168.10.0/25`:
- Prefix /25 means 7 host bits
- Total addresses: 128
- Range: 192.168.10.0 to 192.168.10.127
- Usable: 192.168.10.1 to 192.168.10.126

### Range to CIDR
Given range 192.168.1.64 to 192.168.1.127:
- Count: 64 addresses
- 64 = 2^6, so 6 host bits
- Prefix: 32 - 6 = /26
- CIDR: 192.168.1.64/26

## Private vs. Public IP Ranges

RFC 1918 defines three private IP ranges:
- `10.0.0.0/8` — Large private networks
- `172.16.0.0/12` — Medium private networks
- `192.168.0.0/16` — Home and small office networks

Additional special ranges include loopback (`127.0.0.0/8`), link-local (`169.254.0.0/16`), multicast (`224.0.0.0/4`), and reserved (`240.0.0.0/4`).

## Practical Use Cases

### Firewall Rules
IP range specifications control which networks can access services. Both CIDR notation and explicit ranges are used in firewalls, security groups, and ACLs.

### Cloud Security Groups (AWS/GCP/Azure)
Cloud platforms use CIDR notation in security group rules to specify allowed source and destination IP ranges for inbound and outbound traffic.

### Web Server IP Restrictions
Nginx and Apache support CIDR-based access control to restrict admin areas or APIs to specific IP ranges.

### DHCP Pool Configuration
DHCP servers define address pools using start and end IP addresses, which need to fall within the subnet range but exclude reserved addresses.

## Using the IPv4 Range Expander

Our tool helps you:
1. **Enter a CIDR block** and expand it to show all individual IP addresses
2. **Enter a range** (start-end) and convert to CIDR notation
3. **View network details** — network address, broadcast, mask, host count
4. **Copy expanded list** — Export all IPs for use in allow/deny lists
5. **Check if an IP** falls within a given range

The tool handles the binary math automatically, making IP range management accessible even without deep subnetting knowledge. It's ideal for network documentation, firewall rule creation, and subnet planning.
"""

articles['ipv4-address-converter-guide'] = r"""## Understanding IPv4 Address Representations

An IPv4 address is a 32-bit number. While humans read it in dotted-decimal notation (`192.168.1.1`), computers work with it as a single 32-bit integer. Different contexts require different representations, which is why IP address conversion tools are essential for network engineers, security professionals, and developers.

## IPv4 Address Formats

### Dotted-Decimal Notation
The most familiar format: four 8-bit octets separated by dots. Each octet ranges from 0 to 255, representing 8 binary bits.

### Binary Representation
Shows the underlying 32-bit structure, revealing the network/host boundary when combined with a subnet mask. Converting 192.168.1.1 to binary gives: `11000000.10101000.00000001.00000001`

### Hexadecimal Notation
Base-16 representation, common in programming and packet analysis. `192.168.1.1` becomes `0xC0A80101`. Each byte maps to two hex digits.

### 32-Bit Integer (Long Integer)
The raw numeric value of the IP address. `192.168.1.1` equals 3,232,235,777. Calculated by treating the dotted decimal as a 4-byte big-endian number.

### IPv4-Mapped IPv6
IPv4 addresses represented in IPv6 format: `192.168.1.1` becomes `::ffff:192.168.1.1` or `::ffff:c0a8:0101`

## Why Multiple Formats Matter

### Network Programming
Socket APIs often work with integer representations. Python's `socket.inet_aton()` and C's `inet_pton()` convert between string and binary forms. Storing IPs as integers in code enables efficient arithmetic comparisons and range checks.

### Database Storage
Storing IPs as integers is more efficient and enables range queries. Integer comparison is much faster than string comparison, and range queries for subnet membership become simple numeric comparisons.

### Packet Analysis
Wireshark and hex dump tools show packet data in hexadecimal. Network engineers need to convert between hex and dotted-decimal when analyzing packet captures and network traces.

### Regular Expressions and Pattern Matching
Understanding the binary structure helps write precise IP-matching patterns for security rules and log analysis scripts.

## IP Address Classes (Historical)

Before CIDR, IPv4 used classful addressing:

| Class | Range | Default Mask | Usage |
|-------|-------|--------------|-------|
| A | 0.0.0.0 - 127.255.255.255 | /8 | Large organizations |
| B | 128.0.0.0 - 191.255.255.255 | /16 | Medium organizations |
| C | 192.0.0.0 - 223.255.255.255 | /24 | Small networks |
| D | 224.0.0.0 - 239.255.255.255 | — | Multicast |
| E | 240.0.0.0 - 255.255.255.255 | — | Reserved |

Classes A, B, and C are for unicast. Classful addressing is largely obsolete (replaced by CIDR), but understanding it helps when reading older documentation and legacy network configurations.

## Special IPv4 Addresses

Key special address ranges:
- `0.0.0.0/8` — Unspecified/this network
- `127.0.0.0/8` — Loopback (localhost)
- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — Private (RFC 1918)
- `169.254.0.0/16` — Link-local (APIPA)
- `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` — Documentation/TEST-NET
- `224.0.0.0/4` — Multicast
- `255.255.255.255/32` — Limited broadcast

## Converting Between Formats

To convert dotted-decimal to integer:
1. Split by dots into four numbers
2. Multiply: `first * 16777216 + second * 65536 + third * 256 + fourth`
3. Result is the 32-bit integer

To convert integer to dotted-decimal:
1. Divide by 16777216 for first octet (take integer part, keep remainder)
2. Divide remainder by 65536 for second octet
3. Divide remainder by 256 for third octet
4. Remainder is the fourth octet

## Using the IPv4 Address Converter

Our converter tool handles:
1. **Input any format** — dotted-decimal, integer, hex, or binary
2. **See all representations** simultaneously in a clear layout
3. **Subnet information** — paste a CIDR address to see network details
4. **Copy any format** with one click
5. **Batch conversion** support for processing multiple addresses

Perfect for network documentation, programming projects that need IP arithmetic, and troubleshooting network configurations where different tools use different IP representations.
"""

articles['ipv6-ula-generator-guide'] = r"""## Understanding IPv6 Unique Local Addresses

IPv6 Unique Local Addresses (ULA) are the IPv6 equivalent of IPv4 private addresses (10.x.x.x, 172.16.x.x, 192.168.x.x). They are designed for use within private networks and organizations, without being routed on the global internet.

## ULA Address Structure

ULA addresses fall in the `fc00::/7` prefix range, specifically:
- `fd00::/8` — Locally assigned (most common)
- `fc00::/8` — Reserved for future centrally assigned use

A complete ULA address has this structure:
`fd | Global ID (40 bits) | Subnet ID (16 bits) | Interface ID (64 bits)`

The Global ID is randomly generated per organization, providing statistical uniqueness without central coordination.

## Why ULA Exists

IPv6 has 340 undecillion possible addresses, so why are private address ranges needed? ULA serves specific purposes:

### Stability
ULA addresses remain stable regardless of ISP or network changes. Unlike link-local addresses, ULA persists across reboots and network reconfigurations.

### Private Communication
Services that should never be publicly accessible (database servers, internal APIs, management interfaces) should bind to addresses that cannot be reached from the internet.

### Multi-Network Scenarios
Organizations with multiple sites can use ULA for inter-site VPN connectivity. A unique Global ID per organization prevents address conflicts when networks are merged.

## ULA vs. Other IPv6 Address Types

| Property | Link-Local | ULA | Global Unicast |
|----------|------------|-----|----------------|
| Scope | Single link only | Organization-wide | Global internet |
| Persistent | Yes | Yes | Yes |
| ISP assigned | No | No | Yes |
| Routable between subnets | No | Yes (within org) | Yes |
| Internet routable | No | No | Yes |

## Generating ULA Addresses

The RFC 4193 algorithm for generating ULA Global IDs:
1. Obtain current time as 64-bit NTP timestamp
2. Concatenate with the EUI-64 identifier of the generating system
3. Compute SHA-1 hash
4. Use the lowest 40 bits as the Global ID

This approach ensures statistical uniqueness without requiring central registry. The probability of two randomly generated 40-bit IDs colliding is extremely low — acceptable for any practical deployment.

## Practical IPv6 Network Setup

### Home/Small Office Network
A /48 ULA prefix provides 65,536 possible /64 subnets:
- Main network: first /64 subnet
- IoT devices: second /64 subnet
- Guest network: third /64 subnet

### Enterprise Multi-Site
Different subnet blocks can be allocated to different sites within the same /48, enabling clear addressing hierarchy while maintaining organizational cohesion.

## Configuring ULA on Common Platforms

ULA addresses can be statically configured on Linux via networkd or ifconfig, advertised via Router Advertisement daemon (radvd), used in Docker IPv6 networks, and set via PowerShell on Windows. Most modern operating systems and networking equipment fully support ULA addressing.

## ULA and IPv6 Philosophy

Unlike IPv4 NAT (which hides private addresses behind a public IP), IPv6 philosophy favors end-to-end connectivity with proper firewall policies. Most IPv6-capable devices are dual-stack (having both ULA and Global Unicast addresses), using the appropriate address based on destination.

ULA addresses are filtered at internet borders — packets with ULA source or destination addresses are dropped by properly configured routers, providing a security boundary similar to RFC 1918 in IPv4.

## Using the ULA Generator

Our ULA generator tool:
1. **Generates a cryptographically random Global ID** following RFC 4193
2. **Creates a full /48 prefix** ready for subnet allocation
3. **Shows individual /64 subnets** for your chosen number of subnets
4. **Generates full interface addresses** with random host portions
5. **Copies in standard notation** for direct use in configurations

Use ULA for stable, private IPv6 addressing in your networks, homelabs, and containerized environments.
"""

articles['mac-address-lookup-guide'] = r"""## What Is a MAC Address?

A **Media Access Control (MAC) address** is a unique hardware identifier assigned to every network interface card (NIC). It operates at Layer 2 (Data Link Layer) of the OSI model and is used for local network communication. While IP addresses identify devices logically and can change, MAC addresses are typically burned into hardware by the manufacturer.

## MAC Address Structure

A MAC address is 48 bits (6 bytes) long, displayed in hexadecimal:
- Colon-separated: `AA:BB:CC:DD:EE:FF`
- Dash-separated (Windows): `AA-BB-CC-DD-EE-FF`
- Cisco format: `AABB.CCDD.EEFF`

### OUI (Organizationally Unique Identifier)
The first 3 bytes (24 bits) are the **OUI** — assigned by IEEE to each manufacturer. By looking up the OUI, you can identify who made the network hardware:
- Apple, Inc.
- VMware (indicating virtualized hardware)
- Raspberry Pi Foundation
- Intel Corporate
- Cisco Systems

### Device Identifier
The last 3 bytes are assigned by the manufacturer to uniquely identify each device. Together, the full 48-bit address creates a globally unique identifier for the network interface.

## MAC Address Types

### Unicast vs. Multicast
- **Unicast** (LSB of first byte = 0): Identifies a single network interface
- **Multicast** (LSB of first byte = 1): Targets a group of devices
- **Broadcast** (FF:FF:FF:FF:FF:FF): Reaches all devices on the segment

Common multicast addresses include IPv4 and IPv6 multicast ranges.

### Universally Administered (UAA) vs. Locally Administered (LAA)
- **UAA** (second bit of first byte = 0): Manufacturer-assigned, globally unique
- **LAA** (second bit of first byte = 1): Locally assigned, may not be globally unique

### Random/Spoofed MAC Addresses
Modern devices randomize MAC addresses for privacy (iOS 14+, Android 10+, Windows 10+). These locally administered addresses prevent tracking across different networks and locations.

## Finding MAC Addresses

On different platforms:
- **Windows**: `ipconfig /all` or `getmac /v`
- **macOS/Linux**: `ifconfig` or `ip link show`
- **Network scan**: `arp -a` shows the ARP cache, mapping IPs to MACs on your local network

## MAC Address Security Considerations

### ARP Spoofing
Attackers can send fake ARP responses to associate their MAC address with another device's IP. This enables man-in-the-middle attacks and traffic interception. Defense: Dynamic ARP Inspection (DAI) on managed switches.

### MAC Flooding
Flooding a switch's MAC address table with fake addresses, causing it to behave like a hub and broadcast all traffic. Defense: port security limiting MAC addresses per port.

### MAC Filtering
Using MAC addresses as an access control mechanism has significant weaknesses — MAC addresses can be trivially spoofed, making MAC filtering an unreliable security measure on its own.

## Using the MAC Address Lookup Tool

Our MAC address lookup tool provides:

1. **OUI Identification** — Enter any MAC address to identify the manufacturer
2. **Bulk Lookup** — Process multiple MAC addresses at once
3. **Format Detection** — Accepts colons, dashes, dots, or no separators
4. **Company Details** — Full registered company name
5. **Device Classification** — Identify virtual adapters, IoT devices, phones, and PCs

Useful for network administrators investigating unknown devices on their network, security audits to identify unauthorized hardware, and network inventory documentation.

## MAC vs. IP Address Summary

| Feature | MAC Address | IP Address |
|---------|-------------|------------|
| Layer | Layer 2 (Data Link) | Layer 3 (Network) |
| Length | 48 bits | 32 bits (IPv4) / 128 bits (IPv6) |
| Assignment | Hardware (manufacturer) | Logical (manual or DHCP) |
| Scope | Local network segment | Global (internet) |
| Changes | Usually permanent (but can be spoofed) | Dynamic (DHCP) or static |
| Used for | Local frame delivery | Packet routing |

Understanding the relationship between MAC and IP addresses is fundamental to network troubleshooting and security analysis.
"""

articles['email-normalizer-guide'] = r"""## What Is Email Normalization?

Email normalization is the process of standardizing email addresses to their canonical form — removing variations that point to the same mailbox. Different email providers have different rules about what makes addresses equivalent, and normalization ensures you're treating identical addresses consistently in your systems.

## Why Email Normalization Matters

Without normalization, your system might register the same person multiple times using different address formats. This leads to duplicate accounts in your user database, wasted marketing emails to the same person, inaccurate analytics inflating unique user counts, and bypassed rate limiting using email variations.

## Provider-Specific Email Rules

### Gmail / Google Workspace
- **Dots are ignored**: `john.doe@gmail.com` equals `johndoe@gmail.com`
- **Plus aliases ignored**: `user+anything@gmail.com` becomes `user@gmail.com`
- **Case insensitive**: All addresses normalized to lowercase
- **Googlemail equals Gmail**: Both domains point to the same inbox

### Outlook / Hotmail / Live
- **Plus aliases supported**: `user+tag@outlook.com` becomes `user@outlook.com`
- **Case insensitive**: Normalized to lowercase
- **Dots are significant**: Unlike Gmail, dots matter in Outlook addresses
- **Domain aliases**: @hotmail.com, @live.com, and @outlook.com are different accounts

### Yahoo
- **Hyphens can be significant**: Check whether they affect the local part
- **Dots are significant**: Unlike Gmail, dots matter
- **Case insensitive**: Normalized to lowercase

## The Normalization Algorithm

A general-purpose normalization approach:
1. Lowercase the entire address and trim whitespace
2. Split into local part and domain
3. Remove plus aliases (split on `+`, take first part)
4. Apply provider-specific rules (Gmail dot removal)
5. Normalize known domain aliases

## Common Use Cases

### User Registration Deduplication
Before inserting a new user, normalize and check for existing records with the same normalized email. This prevents duplicate accounts from being created with slight variations of the same address.

### Marketing List Cleaning
Run your email list through normalization to identify and merge duplicate contacts, remove aliases before calculating unique reach, and standardize data for CRM import.

### Abuse Prevention
Users sometimes create multiple accounts using email variations to bypass free trial limits, create multiple voting accounts, or circumvent bans. Normalization catches these patterns at registration time.

### Analytics Accuracy
If tracking email-based user behavior, normalize first to ensure cross-session and cross-device behavior is attributed correctly to the same user.

## Email Validation vs. Normalization

These are distinct but complementary processes:

**Validation** checks if an email is properly formatted — ensuring it has an @ symbol, a domain with a TLD, and no invalid characters.

**Normalization** standardizes valid addresses — converting `User+Test@Gmail.com` to `user@gmail.com`.

Both should be applied: validate format first, then normalize to canonical form.

## A Comprehensive Email Processing Pipeline

1. Validate format (regex check)
2. Normalize to canonical form (provider-specific rules)
3. Check against disposable provider list (Mailinator, Guerrilla Mail, etc.)
4. Verify MX record exists (DNS lookup)
5. Store normalized form in database alongside original

## Using the Email Normalizer Tool

Our email normalizer:
1. **Detects the email provider** automatically
2. **Applies provider-specific rules** for Gmail, Outlook, Yahoo, and others
3. **Shows what was changed** — highlights removed dots, plus aliases, and case changes
4. **Batch processing** — normalize multiple emails at once
5. **Copy results** in CSV format for database import

Normalizing emails during registration and list import is one of the most cost-effective data quality improvements you can implement in a user-facing application.
"""

articles['html-wysiwyg-editor-guide'] = r"""## What Is a WYSIWYG Editor?

**WYSIWYG** stands for "What You See Is What You Get" — a content editing paradigm where the editor display matches the final rendered output. Users format content visually (like in a word processor) without writing HTML code.

WYSIWYG HTML editors are essential for CMS platforms, email marketing tools, documentation systems, and anywhere non-technical users need to create formatted content.

## How WYSIWYG Editors Work

Under the hood, WYSIWYG editors use the browser's `contenteditable` attribute, which enables direct text editing within any DOM element. The editor library then intercepts keyboard events and mouse selections, applies formatting commands, serializes the DOM to clean HTML, and sanitizes output to prevent XSS vulnerabilities.

Modern editors like Quill.js, Tiptap, and ProseMirror use a virtual document model for reliable cross-browser behavior.

## Common Formatting Features

### Inline Formatting
Bold, italic, underline, strikethrough, superscript, subscript, inline code — all mapped to standard HTML tags.

### Block Formatting
Headings (h1-h6), paragraphs, blockquotes, code blocks, ordered and unordered lists, horizontal rules.

### Rich Elements
Links with URL and target attributes, images with alt text, tables with row/column controls, and embedded media via iframes.

## Popular WYSIWYG Libraries

### TinyMCE
The most widely deployed WYSIWYG editor, used by WordPress and thousands of web applications. Features an extensive plugin ecosystem, strong accessibility support, and complex table handling.

### Quill.js
Modern, lightweight editor with a clean API. Popular for single-page applications and custom integrations.

### ProseMirror
Framework-level editor used as the foundation for Notion, Confluence, and others. Highly extensible but requires more setup.

### Tiptap
Built on ProseMirror with a friendlier API. Popular in Vue.js and React applications.

### CKEditor 5
Enterprise-grade editor with collaborative editing, comments, and track changes.

## HTML Sanitization: Critical Security Concern

WYSIWYG editors create a significant security risk: **Cross-Site Scripting (XSS)**. Users can inject malicious HTML through the editor if output is not sanitized before storage or rendering.

Always sanitize editor output before storing or displaying it. The DOMPurify library is the industry standard for client-side HTML sanitization. Server-side sanitization using libraries like sanitize-html in Node.js or the Bleach library in Python provides an additional layer of protection.

## The Markdown Alternative

For technical users, Markdown editors offer a simpler, more portable alternative. Many modern editors support both modes: WYSIWYG for non-technical users and raw Markdown for developers.

Comparison:
- WYSIWYG: Low learning curve, high visual fidelity, but produces HTML that's less portable
- Markdown: Medium learning curve, plain text that works excellently with version control and static site generators

## Using the HTML WYSIWYG Editor Tool

Our editor provides:
1. **Toolbar formatting** — Bold, italic, headings, lists, links, and more
2. **Live preview** — See rendered HTML alongside the editor
3. **HTML source view** — Toggle to edit raw HTML directly
4. **Copy HTML** — Export the full formatted HTML
5. **Paste from Word** — Cleans up Word-specific markup automatically

Perfect for quickly creating HTML content, testing formatting, or generating email HTML without setting up a full development environment. The tool is especially useful for content creators who need to produce clean, standards-compliant HTML without hand-coding it.
"""

articles['text-to-binary-guide'] = r"""## What Is Binary Encoding?

Binary encoding represents text characters as sequences of 0s and 1s — the fundamental language of computers. Every character you type, every image you see, every sound you hear is ultimately stored as binary data in computer memory and storage.

## How Text-to-Binary Conversion Works

Text is converted to binary through a two-step process:
1. Map each character to a numeric code point (using ASCII or Unicode)
2. Convert that number to its binary representation

### ASCII Encoding
For standard Latin text, **ASCII (American Standard Code for Information Interchange)** uses 7 bits per character. Common examples:
- 'A' = decimal 65 = binary 01000001
- 'a' = decimal 97 = binary 01100001
- '0' = decimal 48 = binary 00110000
- Space = decimal 32 = binary 00100000

Converting "Hello" to binary gives five 8-bit groups, one for each character.

### UTF-8 Encoding
Modern text uses **UTF-8**, a variable-width encoding that can represent all 1.1 million Unicode code points:
- ASCII characters (U+0000 to U+007F): 1 byte
- Latin extended, Greek, Cyrillic: 2 bytes
- Chinese, Japanese, Korean: 3 bytes
- Emoji, rare scripts: 4 bytes

## Why Binary Matters for Developers

### Memory Layout
Understanding binary helps predict how data is stored. Integer types occupy 1, 2, 4, or 8 bytes. The most significant bit often serves as a sign bit in signed integer types.

### Bitwise Operations
Efficient operations on binary flags are a fundamental programming technique:
- AND (`&`): Check if a bit is set
- OR (`|`): Set a bit
- XOR (`^`): Toggle a bit
- NOT (`~`): Flip all bits
- Left shift (`<<`): Multiply by powers of 2
- Right shift (`>>`): Divide by powers of 2

Example use: Unix file permissions store read, write, and execute as individual bits in a byte.

### Network Protocols
Network engineers and security researchers frequently work with binary representations when analyzing packet captures, implementing protocols, and debugging network issues.

### Data Compression
Compression algorithms work at the bit level. Understanding how text maps to binary is essential for implementing or understanding algorithms like Huffman coding and LZ77.

## Binary Number Systems

### Counting in Binary
Binary uses only digits 0 and 1. Each position represents a power of 2:
- Position 0 (rightmost): 2^0 = 1
- Position 1: 2^1 = 2
- Position 2: 2^2 = 4
- Position 3: 2^3 = 8

### Binary to Decimal Conversion
Sum the values of all positions where a 1 appears. For example, binary 1010 = 8 + 0 + 2 + 0 = 10 decimal.

### Decimal to Binary Conversion
Repeatedly divide by 2 and record remainders from bottom to top. The remainders form the binary number.

## Related Encodings

### Hexadecimal
Hex is base-16, using digits 0-9 and A-F. Each hex digit represents exactly 4 binary bits (a "nibble"), making hex a compact representation of binary data. A single byte (8 bits) maps to two hex digits.

### Octal
Base-8, where each octal digit represents 3 binary bits. Less common today but still used in Unix file permissions.

### Base64
Groups 6 bits together to create characters from a 64-character alphabet. Used extensively for encoding binary data in text contexts (email attachments, data URLs).

## Practical Text-to-Binary Examples

Binary is used in:
- **Debugging protocols**: Understanding raw packet data
- **Learning computer science**: Visualizing how computers represent data
- **Steganography**: Hiding messages in binary patterns
- **Hardware programming**: Sending bit patterns to microcontrollers
- **Educational contexts**: Teaching number systems and encoding

## Using the Text-to-Binary Tool

Our converter provides:
1. **Text to binary** — Convert any text to its binary representation
2. **Binary to text** — Decode binary back to readable text
3. **Encoding selection** — Choose ASCII, UTF-8, or UTF-16
4. **Space separator** — Toggle spaces between bytes for readability
5. **Copy result** — One-click copy of the binary output

The tool is useful for educational purposes, debugging encoding issues, and understanding how computers represent human-readable text at the lowest level.
"""

articles['text-to-nato-guide'] = r"""## What Is the NATO Phonetic Alphabet?

The NATO phonetic alphabet — officially called the **International Radiotelephony Spelling Alphabet** — is a standardized set of words used to clearly spell out letters over radio communications, telephone calls, and other voice channels. Each letter of the Latin alphabet is represented by a specific word chosen for its distinctiveness.

## The Complete NATO Alphabet

| Letter | NATO Word | Pronunciation |
|--------|-----------|---------------|
| A | Alpha | AL-fah |
| B | Bravo | BRAH-voh |
| C | Charlie | CHAR-lee |
| D | Delta | DEL-tah |
| E | Echo | EK-oh |
| F | Foxtrot | FOKS-trot |
| G | Golf | Golf |
| H | Hotel | HO-tel |
| I | India | IN-dee-ah |
| J | Juliett | JEW-lee-et |
| K | Kilo | KEY-loh |
| L | Lima | LEE-mah |
| M | Mike | Mike |
| N | November | No-VEM-ber |
| O | Oscar | OSS-car |
| P | Papa | PAH-pah |
| Q | Quebec | keh-BECK |
| R | Romeo | ROH-mee-oh |
| S | Sierra | See-AIR-rah |
| T | Tango | TANG-go |
| U | Uniform | YOU-ni-form |
| V | Victor | VIK-tor |
| W | Whiskey | WISS-key |
| X | X-ray | EKS-ray |
| Y | Yankee | YANG-key |
| Z | Zulu | ZOO-loo |

## History of the Phonetic Alphabet

### Early Attempts
Radio communication in World War I and II highlighted the need for standardized spelling alphabets. Early alphabets used words like "Ace, Beer, Cast" but lacked international consistency.

### ICAO Development (1956)
The International Civil Aviation Organization (ICAO) developed the current alphabet in 1956. It was specifically designed so that each word sounds distinctly different from all others, even through static, noise, and across different accents. The words were tested with speakers from various linguistic backgrounds to ensure clarity.

### NATO Adoption
NATO officially adopted the ICAO alphabet, which is why it's known as the NATO phonetic alphabet. The same alphabet is used by ICAO, NATO, the International Telecommunication Union (ITU), and military forces worldwide.

## When to Use the Phonetic Alphabet

### Spelling Critical Information
When accuracy is essential and mishearing is costly:
- Serial numbers and product codes
- Account numbers and passwords
- Medical record numbers
- License plate numbers
- Complex names in customer service calls

### Aviation
Pilots and air traffic controllers use the phonetic alphabet for callsigns, runway names, navigation fixes, and all alphanumeric communication. "Golf Whiskey Sierra three-four-zero" is unmistakably clear where "GWS340" might be misheard.

### Military Communications
Field communications over radio are often degraded by interference. The phonetic alphabet ensures orders and coordinates are understood correctly.

### Emergency Services
Police, fire, and ambulance services use phonetic alphabets (sometimes adapted from NATO) when relaying registration plates, names, and addresses.

## Digits in Radio Communication

NATO also defines standardized pronunciations for digits:
- 0 = Zero
- 1 = One (WUN)
- 2 = Two (TOO)
- 3 = Three (TREE)
- 4 = Four (FOW-er)
- 5 = Five (FIFE)
- 6 = Six
- 7 = Seven (SEV-en)
- 8 = Eight (AIT)
- 9 = Nine (NIN-er)

Note "niner" instead of nine — to avoid confusion with the German "nein" (no) in multinational operations.

## Alternative Phonetic Alphabets

Different regions and industries have their own spelling alphabets:
- **LAPD/Police**: Adam, Boy, Charles, David...
- **British Forces** (older): Ace, Beer, Charlie, Dog...
- **US Army WWII**: Able, Baker, Charlie, Dog...

The NATO alphabet has largely supplanted these in international contexts.

## Using the Text-to-NATO Tool

Our converter:
1. **Converts any text** — type letters, numbers, or mixed content
2. **Shows NATO words** for each character
3. **Formats for reading aloud** — suitable for copy-paste into scripts
4. **Handles numbers** with proper NATO digit pronunciation
5. **Supports special characters** — spaces and punctuation are handled gracefully

Use it when preparing customer service scripts, training materials, or any situation where you need to spell out alphanumeric codes over voice communication.
"""

articles['text-to-unicode-guide'] = r"""## What Is Unicode?

**Unicode** is the universal character encoding standard that assigns a unique number — called a **code point** — to every character in every writing system in the world. From Latin letters to Chinese hanzi, Arabic script to emoji, Unicode covers over 149,000 characters across 154 scripts.

Unicode solves a fundamental problem in computing: historically, different countries and companies created incompatible character encodings, making it impossible to reliably exchange text across systems.

## Unicode Code Points

A Unicode code point is written as `U+` followed by a hexadecimal number:
- `U+0041` = A (Latin capital letter A)
- `U+4E2D` = 中 (Chinese character for "middle")
- `U+1F600` = 😀 (Grinning Face emoji)
- `U+0021` = ! (Exclamation mark)

The code point range spans from `U+0000` to `U+10FFFF`, divided into 17 **planes** of 65,536 code points each.

## Unicode Planes

### Plane 0: Basic Multilingual Plane (BMP)
The most commonly used characters, including all modern scripts:
- Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari
- CJK (Chinese, Japanese, Korean) characters
- Most punctuation, symbols, and special characters

### Plane 1: Supplementary Multilingual Plane
- Historic scripts (Linear B, Egyptian hieroglyphs, Cuneiform)
- Musical symbols
- Mathematical symbols
- Many emoji

### Plane 2: Supplementary Ideographic Plane
- Additional CJK unified ideographs (rare characters)

### Planes 3-13: Reserved
Currently unassigned.

### Planes 14-16: Supplementary Special-Purpose Planes
- Tags and variation selectors

## Unicode Encodings

### UTF-8
The dominant encoding on the web (used by over 98% of websites):
- ASCII characters use 1 byte
- Most European characters use 2 bytes
- CJK characters use 3 bytes
- Emoji and supplementary characters use 4 bytes

UTF-8 is backward compatible with ASCII — any ASCII file is valid UTF-8.

### UTF-16
Used by Windows and Java internally:
- Most characters use 2 bytes
- Supplementary plane characters use 4 bytes (surrogate pairs)
- Not backward compatible with ASCII

### UTF-32
Fixed-width 4-byte encoding. Simple to index but memory-inefficient. Used internally by some programming languages.

## Unicode in Programming

### JavaScript
JavaScript strings are UTF-16 internally. Working with supplementary plane characters requires care:
```javascript
'A'.charCodeAt(0)      // 65 (code point)
'\u0041'               // 'A' (Unicode escape)
'\u{1F600}'            // '😀' (ES6 extended escape)
'😀'.length            // 2 (two UTF-16 code units!)
[...'😀'].length       // 1 (correct character count)
```

### Python
Python 3 strings are sequences of Unicode code points:
```python
ord('A')           # 65
chr(65)            # 'A'
'\u0041'           # 'A'
'\U0001F600'       # '😀'
len('😀')          # 1 (correct in Python 3)
```

### HTML
Unicode characters in HTML:
```html
&#65;       <!-- A (decimal) -->
&#x41;      <!-- A (hexadecimal) -->
&amp;       <!-- & (named entity) -->
```

## Unicode Normalization

The same visual character can sometimes be represented multiple ways:
- Precomposed: `é` = U+00E9 (single code point)
- Decomposed: `é` = U+0065 + U+0301 (e + combining accent)

Unicode defines normalization forms to standardize these representations:
- **NFC** (Canonical Decomposition, followed by Canonical Composition) — preferred for most uses
- **NFD** (Canonical Decomposition) — decomposed form
- **NFKC/NFKD** — compatibility normalization

Failing to normalize can cause string comparison bugs, search failures, and security issues.

## Special Unicode Characters

Some useful Unicode code points for developers:
- `U+FEFF` — Byte Order Mark (BOM) / Zero Width No-Break Space
- `U+200B` — Zero Width Space (invisible, affects word breaking)
- `U+200D` — Zero Width Joiner (used in emoji sequences)
- `U+FFFE` — Non-character (used for encoding detection)
- `U+202E` — Right-to-Left Override (can be used for spoofing)

## Using the Text-to-Unicode Tool

Our converter:
1. **Shows Unicode code points** for every character in your text
2. **Displays multiple formats** — U+ notation, decimal, hex, HTML entity
3. **Identifies script/block** — shows which Unicode block each character belongs to
4. **Converts back** — paste code points to decode to text
5. **Handles emoji** — correctly processes multi-codepoint sequences

Use it for debugging encoding issues, learning about Unicode, preparing documentation about special characters, and inspecting suspicious text that might contain invisible or look-alike characters.
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
