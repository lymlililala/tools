#!/usr/bin/env python3
"""
Batch 8: keycode-info, slugify-string, html-entities, basic-auth-generator,
safelink-decoder, wifi-qr-code, camera-recorder, xml-to-json
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

articles['keycode-info-guide'] = r"""## Understanding JavaScript Keyboard Events

Keyboard events in JavaScript expose rich information about which key was pressed, in what context, and with which modifier keys. Understanding the distinction between the different key properties is essential for building accessible keyboard interfaces, games, and productivity tools.

## Key Event Properties

When a keyboard event fires, the event object contains several properties:

### event.key (Recommended)
Returns the semantic value of the key pressed:
- Letter keys: "a", "A", "z", "Z"
- Special keys: "Enter", "Backspace", "Tab", "Escape", "ArrowLeft"
- Modifier keys: "Shift", "Control", "Alt", "Meta"
- Function keys: "F1" through "F12"

This is the modern standard for identifying keys. The value is locale-aware (handles international keyboards correctly) and semantic (tells you what the key means, not its physical location).

### event.code (Physical Key Location)
Returns the physical key identifier on the keyboard, independent of the current keyboard layout:
- "KeyA", "KeyB", "KeyZ" for letter keys
- "Digit1", "Digit2" for number row digits
- "Numpad1", "Numpad2" for numpad digits
- "ArrowLeft", "ArrowUp" for arrow keys
- "ShiftLeft", "ShiftRight" distinguish which Shift key

Use event.code when physical key position matters (gaming WASD controls) and you want layout-independent behavior.

### event.keyCode (Deprecated)
The numeric code for the key pressed. This legacy property has browser inconsistencies and should not be used in new code. For example, "A" is 65, "Enter" is 13, "Escape" is 27, "Space" is 32.

### event.which (Deprecated)
Similar to keyCode but originally intended for mouse events. Also deprecated in favor of event.key.

## Modifier Keys

Keyboard events expose modifier key state through boolean properties:
- **event.shiftKey**: Shift is held
- **event.ctrlKey**: Control is held
- **event.altKey**: Alt (Option on Mac) is held
- **event.metaKey**: Meta key (Windows key on PC, Command on Mac) is held

Common keyboard shortcuts use these combinations:
- Ctrl+C / Cmd+C: Copy
- Ctrl+Z / Cmd+Z: Undo
- Ctrl+Shift+Z / Cmd+Shift+Z: Redo
- Alt+F4: Close window (Windows)

## Keyboard Event Types

Three main keyboard event types fire in sequence:

1. **keydown**: Fires when a key is pressed down. Repeats while held. Most keyboard shortcuts should listen here.
2. **keypress** (deprecated): Fired for printable characters only. Deprecated, use keydown instead.
3. **keyup**: Fires when a key is released. Never repeats.

For text input tracking, listen on keydown or use the input event on form elements.

## Practical Event Handling Patterns

### Detecting Keyboard Shortcuts
```javascript
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault(); // Prevent browser's save dialog
    saveDocument();
  }
});
```

### WASD Game Controls
```javascript
const keys = new Set();
document.addEventListener('keydown', (e) => keys.add(e.code));
document.addEventListener('keyup', (e) => keys.delete(e.code));

function gameLoop() {
  if (keys.has('KeyW')) moveUp();
  if (keys.has('KeyS')) moveDown();
  if (keys.has('KeyA')) moveLeft();
  if (keys.has('KeyD')) moveRight();
  requestAnimationFrame(gameLoop);
}
```

### Escape to Close Modal
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
```

## Key Codes Reference

Commonly used key codes in JavaScript:

| Key | event.key | event.code | keyCode |
|-----|-----------|------------|---------|
| Enter | "Enter" | "Enter" | 13 |
| Escape | "Escape" | "Escape" | 27 |
| Space | " " | "Space" | 32 |
| Arrow Left | "ArrowLeft" | "ArrowLeft" | 37 |
| Arrow Up | "ArrowUp" | "ArrowUp" | 38 |
| Arrow Right | "ArrowRight" | "ArrowRight" | 39 |
| Arrow Down | "ArrowDown" | "ArrowDown" | 40 |
| Backspace | "Backspace" | "Backspace" | 8 |
| Delete | "Delete" | "Delete" | 46 |
| Tab | "Tab" | "Tab" | 9 |

## Accessibility and Keyboard Navigation

WCAG 2.1 requires all functionality to be operable by keyboard. Key principles:
- All interactive elements must receive keyboard focus
- Focus must be visible (no removing outline without alternative)
- Tab order must be logical and follow visual layout
- Custom widgets must implement appropriate keyboard patterns (arrow keys for menus, Enter/Space for activation)
- Modal dialogs must trap focus within them while open
- Provide skip navigation links to bypass repeated content

ARIA patterns like menu, listbox, dialog, and tablist define expected keyboard behaviors for complex widgets.

## Using the Keycode Info Tool

Our tool:
1. **Press any key** — instantly shows all properties for that key event
2. **Displays all properties** — key, code, keyCode, which, charCode
3. **Shows modifier state** — which modifier keys are held
4. **Copy values** — one-click copy of any property value
5. **Key history** — track the last several key presses
6. **Comparison mode** — see how different keyboards report the same keys

Essential for debugging keyboard handling code, understanding browser differences, and implementing correct keyboard shortcuts.
"""

articles['slugify-string-guide'] = r"""## What Is a URL Slug?

A **slug** is the human-readable, URL-friendly part of a web address that identifies a specific page. The word "slug" comes from newspaper typography, where it referred to the short name given to a story in production.

Example URL with slug: `https://example.com/blog/how-to-bake-sourdough-bread`
The slug is: `how-to-bake-sourdough-bread`

Slugs appear in blog posts, product pages, news articles, user profiles, and anywhere URLs need to be descriptive and shareable.

## What Makes a Good Slug?

A well-formed slug:
- Uses only lowercase letters, numbers, and hyphens
- Has no spaces (replaced with hyphens)
- Has no special characters (removed or transliterated)
- Has no consecutive or trailing hyphens
- Is concise but descriptive (30-60 characters ideal)
- Contains the primary keyword for SEO

## Slugification Algorithm

Converting any text to a slug involves several steps:

1. **Unicode normalization**: Decompose characters (e.g., é → e + combining accent)
2. **Transliteration**: Convert non-ASCII to closest ASCII equivalent
3. **Lowercase**: Convert to all lowercase
4. **Remove special characters**: Keep only letters, numbers, and spaces
5. **Replace spaces with hyphens**: The hyphen is the standard word separator
6. **Remove consecutive hyphens**: Replace multiple hyphens with single
7. **Trim hyphens**: Remove leading and trailing hyphens

Example transformation:
```
Input:  "The World's Best Café & Restaurant!"
Step 1: "The World's Best Cafe & Restaurant!"  (café → cafe)
Step 3: "the world's best cafe & restaurant!"  (lowercase)
Step 4: "the worlds best cafe  restaurant"     (remove ' & !)
Step 5: "the-worlds-best-cafe--restaurant"     (spaces to hyphens)
Step 6: "the-worlds-best-cafe-restaurant"      (remove double --)
Output: "the-worlds-best-cafe-restaurant"
```

## Language-Specific Considerations

### German (Umlauts)
German umlauts have standard transliterations:
- ä → ae
- ö → oe
- ü → ue
- ß → ss

`"Schöne Grüße"` → `"schoene-gruesse"`

### French and Spanish Accents
Accented characters map to their base form:
- é, è, ê, ë → e
- à, â, ä → a
- ñ → n
- ç → c

### CJK Characters (Chinese, Japanese, Korean)
CJK characters cannot be transliterated to meaningful Latin slugs. Options:
- Use pinyin romanization for Chinese
- Use romaji for Japanese
- Use the English translation for the page title
- Use a hash or ID-based slug

### Arabic, Hebrew, Russian
Right-to-left scripts and Cyrillic often require locale-specific transliteration rules.

## SEO Best Practices for Slugs

### Use Keywords
The slug is a ranking factor in Google's algorithm. Include the primary keyword naturally:
- Good: `how-to-install-postgresql`
- Avoid: `post-1234` or `page-2024-01-15`

### Keep It Short
Shorter URLs are more shareable and cleaner:
- Good: `/blog/sourdough-bread-recipe`
- Avoid: `/blog/how-to-make-delicious-homemade-sourdough-bread-step-by-step-guide`

### Use Hyphens, Not Underscores
Google treats hyphens as word separators and underscores as word joiners:
- `bread-recipe` → "bread" and "recipe" are separate keywords
- `bread_recipe` → treated as single word "bread_recipe"

### Avoid Stop Words
Remove common words that don't add SEO value:
- `the`, `a`, `an`, `and`, `or`, `but`, `in`, `on`, `at`

`"how-to-bake-a-delicious-bread"` can become `"how-to-bake-delicious-bread"`

### Handle Duplicates
When creating slugs from user-generated content, implement uniqueness:
- `my-post` → already exists → `my-post-2` → exists → `my-post-3`
- Or use a random suffix: `my-post-a7b9`

## Slugs in Different Frameworks

### Next.js (Dynamic Routes)
File: `pages/blog/[slug].js`
```javascript
export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return { props: { post } };
}
```

### Express.js
```javascript
app.get('/posts/:slug', (req, res) => {
  const post = db.posts.findBySlug(req.params.slug);
  res.render('post', { post });
});
```

### Django
```python
from django.utils.text import slugify
slug = slugify("Hello World!")  # "hello-world"
```

## Using the Slugify Tool

Our tool:
1. **Enter any text** — titles, names, phrases in any language
2. **Instant slug output** — see the converted slug in real time
3. **Multiple options** — configure separator character, case, stop word removal
4. **Unicode handling** — proper transliteration of accented and special characters
5. **Copy slug** — one-click copy for immediate use

Use it for generating consistent slugs for blog posts, product names, category pages, and any URL that needs to be human-readable and SEO-friendly.
"""

articles['html-entities-guide'] = r"""## Why HTML Encoding Matters

HTML uses specific characters for its syntax: `<` and `>` for tags, `&` for entities, `"` for attribute values, and `'` for alternate attribute quoting. When these characters appear in content (not as HTML structure), they must be encoded as HTML entities to prevent browsers from misinterpreting them as HTML syntax.

Unencoded special characters cause two major problems:
1. **Broken HTML**: The page renders incorrectly as browsers parse characters as markup
2. **XSS vulnerabilities**: User input displayed without encoding can execute malicious scripts

## HTML Entity Syntax

HTML entities can be expressed in three forms:

### Named Entities
The most readable form using standard names:
- `&amp;` → &
- `&lt;` → <
- `&gt;` → >
- `&quot;` → "
- `&apos;` → '
- `&nbsp;` → non-breaking space
- `&copy;` → ©
- `&reg;` → ®
- `&trade;` → ™
- `&euro;` → €

### Decimal Numeric References
Using the Unicode code point in decimal:
- `&#60;` → < (60 decimal)
- `&#62;` → > (62 decimal)
- `&#169;` → © (169 decimal)
- `&#8364;` → € (8364 decimal)

### Hexadecimal Numeric References
Using the Unicode code point in hexadecimal (prefixed with x):
- `&#x3C;` → < (0x3C hex)
- `&#x3E;` → > (0x3E hex)
- `&#xA9;` → © (0xA9 hex)
- `&#x20AC;` → € (0x20AC hex)

## Essential HTML Entities to Know

### The Security-Critical Five
These five characters MUST be encoded when displaying user-generated content:

| Character | Entity | When to Encode |
|-----------|--------|----------------|
| & | `&amp;` | Always — start of entity syntax |
| < | `&lt;` | In text content and attribute values |
| > | `&gt;` | In text content |
| " | `&quot;` | In attribute values (double-quoted) |
| ' | `&#39;` or `&apos;` | In attribute values (single-quoted) |

### Typography Entities
Common typographic characters:
- `&mdash;` → — (em dash, longer)
- `&ndash;` → – (en dash, shorter)
- `&lsquo;` `&rsquo;` → ' ' (curly single quotes)
- `&ldquo;` `&rdquo;` → " " (curly double quotes)
- `&hellip;` → … (ellipsis)
- `&bull;` → • (bullet)
- `&middot;` → · (middle dot)

### Mathematical and Scientific
- `&times;` → × (multiplication sign)
- `&divide;` → ÷ (division sign)
- `&plusmn;` → ± (plus-minus)
- `&deg;` → ° (degree symbol)
- `&infin;` → ∞ (infinity)
- `&sum;` → ∑ (summation)
- `&pi;` → π (pi)

### Arrows
- `&larr;` → ← (left arrow)
- `&rarr;` → → (right arrow)
- `&uarr;` → ↑ (up arrow)
- `&darr;` → ↓ (down arrow)
- `&harr;` → ↔ (left-right arrow)

## XSS Prevention: HTML Encoding

Cross-Site Scripting (XSS) occurs when user input is displayed in HTML without encoding:

```html
<!-- Vulnerable: User input displayed directly -->
Hello, <?= $_GET['name'] ?>

<!-- If name = "><script>alert('xss')</script>< it becomes: -->
Hello, "><script>alert('xss')</script><

<!-- Safe: Encoded output -->
Hello, <?= htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8') ?>
```

Always encode output, not just on obvious display locations. Encoding must happen at the point of output, not at input time.

## Encoding in Different Languages

### JavaScript
```javascript
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### Python
```python
import html
safe = html.escape('<script>alert("xss")</script>')
# &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

### PHP
```php
$safe = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
```

## Using the HTML Entities Tool

Our tool:
1. **Encode text** — convert special characters to HTML entities
2. **Decode entities** — convert HTML entities back to characters
3. **Multiple formats** — choose named, decimal, or hex entities
4. **Character reference** — browse all named HTML entities
5. **Copy output** — one-click copy of encoded/decoded text

Essential for web developers working with user-generated content, building template systems, and testing XSS prevention.
"""

articles['basic-auth-generator-guide'] = r"""## What Is HTTP Basic Authentication?

**HTTP Basic Authentication** is the simplest form of HTTP authentication. A client sends a username and password with every request, encoded in Base64 and placed in the Authorization header. Despite its simplicity, it's widely used for API access, protecting development environments, and quick authentication needs.

## How Basic Auth Works

The authentication flow:

1. Client makes request without credentials
2. Server responds with `401 Unauthorized` and `WWW-Authenticate: Basic realm="Description"`
3. Client sends request with `Authorization: Basic [base64(username:password)]`
4. Server decodes and verifies credentials
5. If valid, request proceeds; if invalid, another 401 is returned

The Base64 encoding:
```
username: admin
password: secret123
Combined: admin:secret123
Base64:   YWRtaW46c2VjcmV0MTIz

Header:   Authorization: Basic YWRtaW46c2VjcmV0MTIz
```

## Security Considerations

### Base64 Is Not Encryption
Base64 encoding is trivially reversible — it provides zero security. Anyone who intercepts the Authorization header can decode it instantly. **Always use HTTPS with Basic Auth** to prevent credential interception.

Without HTTPS, Basic Auth credentials are sent in plaintext over the network. This is why Basic Auth over HTTP is considered insecure for anything beyond local development.

### Credential Exposure
The Authorization header is often logged by web servers, proxies, and CDNs. Ensure your logging configurations exclude sensitive headers or redact credential values.

### No Logout Mechanism
Basic Auth has no built-in logout. Browsers cache credentials for the session. Clearing browser cache or closing the browser is required to "log out."

### Credential Management
Since credentials are sent with every request, they must be stored and transmitted carefully:
- Store hashed versions server-side (bcrypt)
- Rotate credentials regularly
- Use per-client credentials (different passwords per API consumer)

## When to Use Basic Auth

**Appropriate uses:**
- Internal tools protected behind VPN or firewall
- Simple API authentication for internal services
- Development and staging environment access control
- Quick protection for low-sensitivity resources
- Machine-to-machine API access (service accounts)

**Not appropriate for:**
- End-user authentication in consumer applications
- Resources accessible without HTTPS
- High-security systems requiring more sophisticated auth
- Systems that need session management or SSO

## Basic Auth in Practice

### Nginx Configuration
```nginx
server {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

Generate htpasswd file:
```bash
htpasswd -c /etc/nginx/.htpasswd username
```

### Apache Configuration
```apache
<Directory "/var/www/html/admin">
    AuthType Basic
    AuthName "Admin Area"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Directory>
```

### Using curl
```bash
curl -u username:password https://api.example.com/endpoint
# or with explicit header
curl -H "Authorization: Basic $(echo -n 'user:pass' | base64)" https://api.example.com/endpoint
```

### JavaScript Fetch API
```javascript
const credentials = btoa('username:password');
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Basic ${credentials}`
  }
});
```

### Python requests
```python
import requests
response = requests.get(
  'https://api.example.com/data',
  auth=('username', 'password')
)
```

## Using the Basic Auth Generator

Our tool:
1. **Enter username and password**
2. **Generates the Base64 credential** automatically
3. **Shows the complete Authorization header** ready to copy
4. **Decode mode** — paste an existing Basic Auth header to see credentials
5. **curl command** — generates the complete curl command with authentication

Use it for quickly generating auth headers during API testing, debugging authentication issues, and generating credentials for documentation examples.
"""

articles['safelink-decoder-guide'] = r"""## What Are Safelinks and URL Wrappers?

Email security gateways and corporate email systems often rewrite URLs in emails by wrapping them in a tracking or scanning proxy URL. These "safe links" or "wrapped URLs" allow the security service to:
- Scan the destination URL for phishing or malware before allowing access
- Track which links users click for analytics and security monitoring
- Block access to known malicious sites in real time

While this provides security benefits, it makes URLs opaque and unreadable, which is why a safelink decoder is useful.

## Common URL Wrapping Services

### Microsoft Defender ATP Safelinks
Microsoft 365 email uses Safelinks to protect users from malicious URLs:
```
Original:   https://example.com/page
Wrapped:    https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fpage&data=...
```

### Proofpoint URL Defense
Enterprise email security wrapping:
```
https://urldefense.proofpoint.com/v2/url?u=https-3A__example.com_page&d=...
```

### Mimecast URL Protection
```
https://url.uk.m.mimecastprotect.com/s/...?domain=example.com
```

### Google Gmail Safety Check
Google sometimes rewrites links for malware scanning.

### HubSpot and Marketing Platform Tracking
Marketing platforms add tracking parameters:
```
https://hs-email.hubspot.com/redirect?email=...&url=https%3A%2F%2Fexample.com
```

## Why Decode Safelinks?

**Verification before clicking**: The actual destination is hidden by the wrapper. Decoding lets you verify where you're actually going before following the link.

**Sharing links**: When sharing a link from an email, the wrapped version is tied to your account or session. Sharing the decoded original URL is cleaner.

**Debugging**: Developers troubleshooting email links need to see the original URL.

**Archiving**: When documenting email content, you want the stable original URL, not a time-limited or session-specific wrapper.

**API and automation**: Programmatic processing of email content needs clean URLs.

## URL Encoding in Safelinks

Wrapped URLs typically use percent-encoding to embed the original URL as a parameter. The original URL characters are replaced with % followed by their hexadecimal code:
- Space → %20
- : → %3A
- / → %2F
- ? → %3F
- = → %3D
- & → %26
- # → %23

Decoding reverses this transformation, restoring the original URL.

## URL Parameters and Link Tracking

Beyond security wrapping, many links contain tracking parameters:
- `utm_source`, `utm_medium`, `utm_campaign`: Google Analytics tracking
- `fbclid`: Facebook click identifier
- `gclid`: Google Click ID
- `mc_eid`, `mc_cid`: Mailchimp tracking

Removing these parameters (while keeping the essential URL structure) gives you the clean destination URL.

## Identifying Malicious Wrapped URLs

Safelink decoders are also useful for security analysis. Red flags in the decoded URL:
- Homograph attacks: `paypa1.com` (numeral 1 instead of lowercase L)
- Typosquatting: `amaz0n.com`, `microsoft-update.com`
- URL shorteners hiding the real destination
- Suspicious TLDs or subdomains mimicking legitimate sites
- URL patterns common in phishing: `/secure/`, `/verify-account/`, `/login/`

Always verify decoded URLs from unexpected or suspicious emails before visiting.

## Using the Safelink Decoder Tool

Our tool:
1. **Paste any wrapped URL** — supports all major safelink formats
2. **Automatic detection** — identifies the wrapping service
3. **Extracts original URL** — URL-decodes the destination parameter
4. **Removes tracking parameters** — optionally strip UTM and tracking codes
5. **Copy clean URL** — one-click copy of the decoded destination
6. **Safety note** — always verify URLs before visiting, even after decoding

Use it for verifying email links, cleaning URLs for sharing, analyzing bulk email content, and debugging marketing email link issues.
"""

articles['wifi-qr-code-guide'] = r"""## What Is a WiFi QR Code?

A WiFi QR code encodes your network credentials in a standardized format that allows smartphones to automatically connect to your WiFi network by simply scanning the code. No more reading out complex passwords character by character — one scan connects instantly.

## WiFi QR Code Format

The WiFi QR code format (defined in the ZXing library specification):
```
WIFI:T:WPA;S:NetworkName;P:MyPassword;;
```

Parameters:
- **T**: Security type (WPA, WEP, or empty for open networks)
- **S**: SSID (network name)
- **P**: Password
- **H**: Optional hidden SSID flag (true or false)

Multiple values use semicolons as separators, and the string ends with `;;` (double semicolon).

## Special Character Escaping

If your SSID or password contains special characters, they must be escaped with a backslash:
- `\` (backslash) → `\\`
- `;` (semicolon) → `\;`
- `,` (comma) → `\,`
- `"` (double quote) → `\"`

Example with special characters:
```
SSID: My "Network" #1
Password: P@ss;word
Format: WIFI:T:WPA;S:My \"Network\" #1;P:P@ss\;word;;
```

## Security Types

| Type | String | Notes |
|------|--------|-------|
| WPA/WPA2/WPA3 Personal | `WPA` | Standard home/office WiFi |
| WEP (deprecated) | `WEP` | Insecure, avoid using |
| Open/No password | (empty T) | Public networks |

WPA3 uses the same QR format as WPA2 — the `WPA` type covers all WPA variants.

## Platform Support

### iOS
iPhone cameras (iOS 11+) natively scan WiFi QR codes. A notification appears offering to join the network.

### Android
Android 10+ supports WiFi QR codes in the native camera app. Earlier Android versions require a QR scanner app (like Google Lens).

### macOS
macOS cameras do not natively support WiFi QR codes (as of 2024). Requires a third-party app.

## Hidden SSIDs

For networks with hidden SSIDs (not broadcasting their name):
```
WIFI:T:WPA;S:HiddenNetworkName;P:MyPassword;H:true;;
```

The `H:true` parameter tells the device to connect to a hidden network with this exact SSID.

## WiFi QR Codes for Guest Networks

WiFi QR codes are especially valuable for:
- **Home**: Print and display for guests to easily connect
- **Offices**: Post at reception or in meeting rooms
- **Restaurants and cafes**: Display on tables or at the counter
- **Hotels**: Place in rooms and common areas
- **Events**: Display at registration or on event materials

A well-designed QR code with your network name and logo creates a professional impression while simplifying connectivity.

## Security Considerations

### Physical Security
Anyone who photographs your WiFi QR code gets your password. Place QR codes thoughtfully:
- Guest network QR codes in guest areas only
- Don't display your main network credentials publicly
- Consider separate guest networks with limited access

### Password Visibility
Unlike traditional password sharing (where the password is visible), QR codes allow sharing credentials without the password being legible to bystanders.

### Rotation
When you change your WiFi password, update your QR code. Use a QR code management service or reprint physical codes.

## Design Tips for Printed WiFi QR Codes

### Size
- Minimum 2cm × 2cm for typical scanning distances
- 5cm × 5cm or larger for posters

### Error Correction
Use H (High, 30% recovery) level to accommodate logo overlays and potential damage on printed materials.

### Include Text
Always accompany QR codes with:
- Your network name (SSID)
- A brief instruction ("Scan to connect to WiFi")
- Your brand/logo if appropriate

### Background and Colors
High contrast required — dark code on light background. Avoid red on green, blue on black, or other low-contrast combinations.

## Using the WiFi QR Code Generator

Our tool:
1. **Enter network name (SSID)**
2. **Select security type** (WPA/WPA2, WEP, or open)
3. **Enter password** (hidden for privacy)
4. **Toggle hidden network** option if applicable
5. **Generate QR code** instantly
6. **Download as PNG or SVG** for printing or digital display

The generated QR code works with both iOS and Android devices, allowing instant network connection without typing the password.
"""

articles['camera-recorder-guide'] = r"""## Browser-Based Video Recording

The browser's MediaRecorder API (part of the WebRTC specification) allows recording audio and video directly from the user's camera and microphone, with no plugins or additional software required. This capability enables a range of applications: video messaging, screen recording tools, remote interviews, and more.

## How MediaRecorder Works

The recording process involves several Web APIs working together:

### 1. Requesting Camera Access
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});
```

The browser prompts the user for permission. The returned MediaStream contains video and audio tracks.

### 2. Displaying Preview
```javascript
const videoElement = document.querySelector('video');
videoElement.srcObject = stream;
videoElement.play();
```

The live camera feed is attached directly to a video element for real-time preview.

### 3. Recording
```javascript
const chunks = [];
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9,opus'
});

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  downloadLink.href = url;
};

recorder.start(1000); // Collect data every 1 second
```

### 4. Stopping and Downloading
```javascript
recorder.stop();
stream.getTracks().forEach(track => track.stop()); // Release camera
```

## Video Formats and Codecs

MediaRecorder format support varies by browser:

| Format | Chrome | Firefox | Safari |
|--------|--------|---------|--------|
| video/webm | Yes | Yes | No |
| video/mp4 | Partial | No | Yes |
| video/ogg | No | Yes | No |

For maximum compatibility, check support and use the best available format:
```javascript
const mimeTypes = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4'
];
const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m));
```

## Video Resolution and Quality Settings

Camera constraints allow specifying preferred video quality:

```javascript
const constraints = {
  video: {
    width: { ideal: 1920, max: 3840 },  // 4K max, prefer 1080p
    height: { ideal: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user'  // Front camera on mobile
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
};
```

These are hints — the browser and hardware may not support all requested settings.

## Screen Recording

The `getDisplayMedia()` API enables recording the user's screen or a specific window:
```javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { mediaSource: 'screen' },
  audio: true  // System audio (not supported on all platforms)
});
```

Combining screen and microphone:
```javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true});
const micStream = await navigator.mediaDevices.getUserMedia({audio: true});

const combinedStream = new MediaStream([
  ...screenStream.getTracks(),
  ...micStream.getTracks()
]);
```

## Privacy and Permissions

### Permission States
Camera access can be:
- **Granted**: User previously approved
- **Denied**: User blocked access
- **Prompt**: Will ask the user

### Checking Permission Status
```javascript
const permission = await navigator.permissions.query({ name: 'camera' });
console.log(permission.state); // 'granted', 'denied', or 'prompt'
```

### Indicator Requirements
Most browsers show a recording indicator when camera/microphone is active. This cannot be suppressed.

### HTTPS Requirement
Camera and microphone access requires HTTPS or localhost. Insecure HTTP sites cannot access these APIs.

## Use Cases

- **Video messages**: Loom-style async video messages
- **Interview tools**: Browser-based video interviews
- **Content creation**: Quick video clips and social content
- **Support tools**: Record and share bug reproductions
- **Education**: Lecture capture and student submissions
- **Medical**: Telehealth symptom documentation

## Using the Camera Recorder Tool

Our tool provides:
1. **Camera selection** — choose front or back camera, or external cameras
2. **Resolution presets** — 480p, 720p, or 1080p
3. **Start/Stop recording** — with visual recording indicator and timer
4. **Pause and resume** — pause recording while keeping the session active
5. **Preview playback** — review recordings before downloading
6. **Download** — save recordings as WebM files
7. **Processing status** — clear feedback during encoding

All recording happens locally in your browser — no video data is uploaded to any server.
"""

articles['xml-to-json-guide'] = r"""## XML vs. JSON: When and Why to Convert

**XML** (Extensible Markup Language) and **JSON** (JavaScript Object Notation) are both text-based data interchange formats, but they serve different ecosystems. XML dominated enterprise and web services through the 2000s, while JSON has become the standard for modern REST APIs. Converting between them is a common task when integrating older systems with newer ones.

## Why Convert XML to JSON?

### Modern API Consumption
Most JavaScript frameworks and modern backends work natively with JSON. XML responses from older APIs need conversion before they can be easily processed.

### Performance
JSON is typically more compact than equivalent XML:
- XML has opening and closing tags for each field
- XML requires explicit type declarations
- JSON arrays map naturally to JavaScript arrays
- JSON parsing is generally faster in JavaScript engines

### Developer Experience
JSON is easier to read and write manually. The `JSON.parse()` and `JSON.stringify()` functions are built into every JavaScript runtime.

### Integration
Modern tools like Node.js, Python's requests library, and virtually all REST APIs use JSON natively.

## XML Structure vs. JSON Structure

### Simple XML
```xml
<user>
  <id>123</id>
  <name>Alice Smith</name>
  <email>alice@example.com</email>
  <active>true</active>
</user>
```

Equivalent JSON:
```json
{
  "user": {
    "id": "123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "active": "true"
  }
}
```

### XML with Attributes
```xml
<product id="456" category="electronics">
  <name>Laptop</name>
  <price currency="USD">999.99</price>
</product>
```

Common JSON representations for attributes:
```json
{
  "product": {
    "@id": "456",
    "@category": "electronics",
    "name": "Laptop",
    "price": {
      "@currency": "USD",
      "#text": "999.99"
    }
  }
}
```

Attributes create ambiguity in XML-to-JSON conversion — different libraries handle them differently.

### XML Arrays (Repeated Elements)
```xml
<users>
  <user><id>1</id><name>Alice</name></user>
  <user><id>2</id><name>Bob</name></user>
</users>
```

JSON conversion (array of objects):
```json
{
  "users": {
    "user": [
      {"id": "1", "name": "Alice"},
      {"id": "2", "name": "Bob"}
    ]
  }
}
```

## Common Challenges in XML-to-JSON Conversion

### Type Information
XML has no native type system — everything is text. In the example above, `id` became the string "123" rather than the number 123. Type coercion must be handled explicitly or by convention.

### Attributes vs. Elements
XML allows both `<tag attribute="value">content</tag>` and nested `<parent><child>value</child></parent>`. These need consistent handling in the JSON representation.

### Text Nodes with Attributes
When an XML element has both attributes and text content, the JSON must represent both, often using special keys like `#text` for the text content.

### Namespaces
XML supports XML namespaces (`xmlns:prefix="uri"`). These can complicate JSON representations significantly. Most converters strip namespaces or flatten them.

### CDATA Sections
`<![CDATA[... raw content ...]]>` sections contain text that should not be parsed as XML. These are typically converted to plain strings in JSON.

### Comments
XML comments (`<!-- comment -->`) are discarded during JSON conversion as JSON has no comment syntax.

## Popular Conversion Libraries

### JavaScript
- **xml2js**: Simple, widely used Node.js library
- **fast-xml-parser**: High-performance with customizable output
- **xml-js**: Handles attributes and elements consistently

### Python
- **xmltodict**: Converts XML to Python dicts (JSON-serializable)
- **lxml**: Comprehensive XML/HTML processing with ElementTree API

### Command Line
- **xq** (xq command from yq/xq tools): XPath queries with JSON output
- **python3 -c "import xmltodict, json, sys; print(json.dumps(xmltodict.parse(sys.stdin.read()), indent=2))"**: Quick one-liner

## XML Web Services (SOAP)

Many legacy enterprise systems use SOAP (Simple Object Access Protocol), which wraps business data in XML envelopes:

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUser>
      <userId>123</userId>
    </getUser>
  </soap:Body>
</soap:Envelope>
```

Converting SOAP responses to JSON typically requires stripping the envelope and extracting the relevant payload.

## Using the XML-to-JSON Converter

Our tool:
1. **Paste XML content** — accepts any well-formed XML
2. **Instant JSON output** — converts in real time
3. **Attribute handling** — choose how to represent XML attributes
4. **Array detection** — correctly identifies repeated elements as arrays
5. **Formatting options** — indented (readable) or compact output
6. **Copy JSON** — one-click copy of the result
7. **Download** — save the JSON file

Use it for converting API responses from legacy SOAP or XML services, transforming configuration files, and integrating XML data feeds into modern applications.
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
