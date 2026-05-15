#!/usr/bin/env python3
"""Patch random-port-generator-guide and json-viewer-guide in articles.data.ts"""

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# PATCH 1: random-port-generator-guide
# ============================================================
old_port = r"""    content: `## Port Number Ranges

| Range | Type | Examples |
|---|---|---|
| 0 – 1023 | Well-known (system) | 80 HTTP, 443 HTTPS, 22 SSH, 3306 MySQL |
| 1024 – 49151 | Registered | 3000 Node.js dev, 5432 PostgreSQL |
| 49152 – 65535 | Dynamic / ephemeral | OS-assigned temporary ports |

## Common Port Numbers

| Port | Service |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 27017 | MongoDB |
| 8080 | HTTP alt / dev servers |

## When You Need a Random Port

Starting a development server, proxy, or service and want to avoid conflicts with existing services.

→ Try the [Random Port Generator](/random-port-generator)`,
  },
  {
    slug: 'json-viewer-guide',"""

new_port = r"""    content: `## Understanding Network Ports

A **network port** is a 16-bit number (0–65535) that identifies a specific process or service on a computer. Think of an IP address as the street address and the port number as the apartment number — the IP address gets data to the right machine, and the port number gets it to the right application.

Every TCP and UDP connection is identified by a 4-tuple: (source IP, source port, destination IP, destination port). When you open a browser and visit `https://example.com`, your OS picks a random ephemeral source port (say, 54321) and connects to the destination port 443 (HTTPS).

## IANA Port Ranges

The Internet Assigned Numbers Authority (IANA) divides the 65536 available ports into three ranges:

| Range | Name | Description | Examples |
|---|---|---|---|
| 0 – 1023 | Well-known (system) | Reserved for standard protocols; requires root/admin to bind | 22 SSH, 80 HTTP, 443 HTTPS, 25 SMTP, 53 DNS |
| 1024 – 49151 | Registered | Registered by vendors; no root required; official assignments | 3306 MySQL, 5432 PostgreSQL, 6379 Redis, 8080 HTTP alt |
| 49152 – 65535 | Dynamic / ephemeral | Temporary ports assigned by the OS for outgoing connections | OS-assigned per connection |

## Well-Known Port Reference

The most important ports every developer should know:

| Port | Protocol | Service |
|---|---|---|
| 21 | TCP | FTP (file transfer) |
| 22 | TCP | SSH (secure shell) |
| 25 | TCP | SMTP (email sending) |
| 53 | TCP/UDP | DNS (domain name resolution) |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 (email retrieval) |
| 143 | TCP | IMAP (email) |
| 443 | TCP | HTTPS (HTTP over TLS) |
| 587 | TCP | SMTP submission (authenticated) |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |
| 6379 | TCP | Redis |
| 27017 | TCP | MongoDB |
| 8080 | TCP | HTTP alternative / reverse proxy |
| 8443 | TCP | HTTPS alternative |
| 9200 | TCP | Elasticsearch |

## Detecting Port Conflicts

Before starting a service on a given port, check if something is already using it.

**macOS / Linux — using \`lsof\`:**
\`\`\`bash
# Check if port 3000 is in use
lsof -i :3000

# Check all listening ports
lsof -i -P -n | grep LISTEN

# Find which process owns a port
lsof -i :8080 | awk 'NR>1 {print $1, $2}'
\`\`\`

**Linux — using \`ss\` (newer, faster than netstat):**
\`\`\`bash
# List all listening TCP ports
ss -tlnp

# Check a specific port
ss -tlnp | grep :3000
\`\`\`

**Windows — using \`netstat\`:**
\`\`\`cmd
netstat -ano | findstr :3000
tasklist /fi "PID eq <PID_NUMBER>"
\`\`\`

**Node.js — programmatic port availability check:**
\`\`\`javascript
const net = require('net');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

// Usage
const port = await findAvailablePort(3000);
console.log(\`Starting server on port \${port}\`);
\`\`\`

## Ephemeral Port Range Configuration

When your system makes outbound connections, the OS assigns a temporary (ephemeral) source port from the dynamic range. On high-traffic servers, you might exhaust this range.

**Check current ephemeral range:**
\`\`\`bash
# Linux
cat /proc/sys/net/ipv4/ip_local_port_range
# Default: 32768 60999

# macOS
sysctl net.inet.ip.portrange.first net.inet.ip.portrange.last
# Default: 49152 65535
\`\`\`

**Expand the range on Linux (temporary):**
\`\`\`bash
echo "1024 65535" > /proc/sys/net/ipv4/ip_local_port_range
\`\`\`

**Permanent via \`/etc/sysctl.conf\`:**
\`\`\`bash
net.ipv4.ip_local_port_range = 1024 65535
\`\`\`

## Docker Port Mapping

Docker containers run in their own network namespace. To expose a container port to the host:

\`\`\`bash
# Map host port 8080 to container port 80
docker run -p 8080:80 nginx

# Map to all interfaces (default) vs specific interface
docker run -p 0.0.0.0:8080:80 nginx   # All interfaces
docker run -p 127.0.0.1:8080:80 nginx # Localhost only (more secure)

# Publish all exposed ports to random host ports
docker run -P nginx
docker ps # Shows the assigned ports
\`\`\`

**Docker Compose port mapping:**
\`\`\`yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"        # host:container
      - "127.0.0.1:8443:443"  # bind to localhost only
\`\`\`

## Security Considerations

**Principle of least exposure**: Only expose ports that need to be publicly accessible.

\`\`\`bash
# Linux firewall (ufw) — allow only necessary ports
ufw default deny incoming
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Allow from specific IP only
ufw allow from 192.168.1.0/24 to any port 5432  # PostgreSQL from LAN only
\`\`\`

**Common security mistakes:**
- Binding databases (MySQL: 3306, PostgreSQL: 5432, MongoDB: 27017, Redis: 6379) to `0.0.0.0` — always bind to `127.0.0.1` unless remote access is explicitly required.
- Running services on default ports — changing default ports makes automated scanning harder (though not a substitute for real security).
- Forgetting to close ephemeral ports in firewalls — stateful firewalls (like iptables with conntrack) handle this automatically.

## Choosing a Development Port

When picking a port for your development server, avoid well-known ports and commonly used application ports. Safe choices in the registered range:

- **3000** — Node.js/Express convention
- **3001, 3002** — Alternatives when 3000 is taken
- **4000** — GraphQL (Hasura, Apollo Server convention)
- **5000** — Flask convention
- **8000** — Django convention, also Python \`http.server\`
- **8080** — Generic HTTP alternative
- **9000** — PHP-FPM, SonarQube

When in doubt, use a port checker tool or pick a number in the 49152–65535 range for development.

## Best Practices

1. **Never hardcode ports in production** — Use environment variables (\`PORT=8080 node server.js\`).
2. **Bind databases to 127.0.0.1** — Don't expose databases to public interfaces.
3. **Check before binding** — Verify port availability programmatically before starting services.
4. **Document your ports** — Add a ports table to your project README for team reference.
5. **Use standard ports in production** — 80/443 for web services; use a reverse proxy (Nginx, Traefik) to forward from standard to application ports.

→ Try the [Random Port Generator](/random-port-generator)`,
  },
  {
    slug: 'json-viewer-guide',"""

# ============================================================
# PATCH 2: json-viewer-guide
# ============================================================
old_viewer = r"""    content: `## Why Use a JSON Tree Viewer?

Large JSON responses from APIs can be thousands of lines deep. A tree viewer lets you:

- Expand/collapse nodes to focus on relevant data
- See the data hierarchy visually
- Click to copy specific values
- Navigate complex nested structures

## Example: API Response Structure

\`\`\`json
{
  "user": {
    "id": 1234,
    "profile": {
      "name": "Alice",
      "settings": { "theme": "dark" }
    },
    "orders": [ ... 50 items ... ]
  }
}
\`\`\`

With a tree viewer, you can collapse \`orders\` and focus on \`profile\` instantly.

→ Try the [JSON Viewer](/json-viewer)`,
  },
  {
    slug: 'xml-to-json-guide',"""

new_viewer = r"""    content: `## Why JSON Tree Viewers Exist

Modern APIs return complex, deeply nested JSON structures. A GitHub repository response, a Stripe payment object, a Kubernetes pod spec — these can be hundreds of lines deep, with nested arrays, objects, and mixed types. Reading this data as raw text is inefficient at best, impossible at worst.

A JSON tree viewer transforms flat text into an interactive hierarchy where you can:
- **Expand and collapse nodes** to focus on the data you care about
- **See data types at a glance** (string, number, boolean, null, array, object)
- **Click to copy** specific values or entire subtrees
- **Count children** of arrays and objects without counting manually
- **Navigate** without losing your place in a 10,000-line document

## Understanding JSON Path

Every value in a JSON document can be addressed by its **JSON Path** — a dot-notation string that describes the route from the root to the value.

\`\`\`json
{
  "store": {
    "books": [
      { "title": "JavaScript: The Good Parts", "price": 29.99 },
      { "title": "You Don't Know JS", "price": 35.00 }
    ],
    "manager": { "name": "Alice", "id": 1042 }
  }
}
\`\`\`

| Value | JSON Path |
|---|---|
| First book title | \`$.store.books[0].title\` |
| All book prices | \`$.store.books[*].price\` |
| Manager name | \`$.store.manager.name\` |
| All book objects | \`$.store.books[*]\` |

JSON Path is standardized by RFC 9535 (2024) and implemented in many languages:

\`\`\`javascript
// Using jsonpath-plus library
import { JSONPath } from 'jsonpath-plus';

const prices = JSONPath({ path: '$.store.books[*].price', json: data });
// [29.99, 35.00]

const cheapBooks = JSONPath({ path: '$.store.books[?(@.price < 30)]', json: data });
// [{ "title": "JavaScript: The Good Parts", "price": 29.99 }]
\`\`\`

\`\`\`python
# Python using jsonpath-ng
from jsonpath_ng import parse

expr = parse('$.store.books[*].title')
titles = [match.value for match in expr.find(data)]
# ['JavaScript: The Good Parts', 'You Don\'t Know JS']
\`\`\`

## Performance with Large JSON Files

Loading a 50MB JSON file into a browser DOM can freeze the tab. JSON viewers use several techniques to handle large files:

**Virtual scrolling**: Only render the visible portion of the tree. If a JSON array has 10,000 elements, only the ~20 visible on screen are rendered as DOM nodes. Libraries like `react-window` and `@tanstack/virtual` implement this.

**Lazy expansion**: Don't render children until a node is expanded. A deeply nested object with 1,000 children only renders its own node until the user clicks to expand.

**Web Workers**: Parse large JSON in a background thread to avoid blocking the main thread:

\`\`\`javascript
// worker.js
self.onmessage = (e) => {
  try {
    const parsed = JSON.parse(e.data);
    self.postMessage({ success: true, data: parsed });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};

// main.js
const worker = new Worker('worker.js');
worker.postMessage(largeJsonString);
worker.onmessage = (e) => {
  if (e.data.success) renderTree(e.data.data);
};
\`\`\`

**Streaming parsing**: For very large files, use a streaming JSON parser that emits events for each token rather than building the full object in memory:

\`\`\`javascript
// Using clarinet (streaming JSON parser)
const clarinet = require('clarinet');
const parser = clarinet.parser();

parser.onopenobject = (key) => console.log('Object start, first key:', key);
parser.onvalue = (value) => console.log('Value:', value);
parser.onend = () => console.log('Parsing complete');

fs.createReadStream('huge.json').pipe(parser);
\`\`\`

## API Debugging Workflow

JSON viewers are most valuable when debugging API responses. A typical workflow:

1. **Make the API call** in Postman, curl, or browser DevTools
2. **Copy the raw JSON response**
3. **Paste into a viewer** to explore the structure
4. **Find the path** to the data you need
5. **Use the path** in your application code

\`\`\`bash
# Curl with jq for command-line JSON exploration
curl -s https://api.github.com/repos/microsoft/vscode | jq '.'

# Find specific fields
curl -s https://api.github.com/repos/microsoft/vscode | jq '{name, stars: .stargazers_count, language}'

# Count array elements
curl -s https://api.github.com/users/octocat/repos | jq 'length'

# Filter array by condition
curl -s https://api.github.com/users/octocat/repos | jq '[.[] | select(.fork == false)] | length'
\`\`\`

## VS Code JSON Integration

VS Code has excellent built-in JSON support:

**Format document**: `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (macOS) — pretty-prints the current JSON file.

**JSON Schema validation**: Add a `$schema` property or configure in `settings.json`:

\`\`\`json
// .vscode/settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["appsettings*.json"],
      "url": "https://json.schemastore.org/appsettings.json"
    }
  ]
}
\`\`\`

**Breadcrumb navigation**: The breadcrumbs bar at the top of the editor shows your current path in the JSON hierarchy as you move your cursor.

**Folding**: Click the chevron icons in the gutter to collapse/expand objects and arrays.

**JSON in Thunder Client / REST Client**: Built-in VS Code API testing extensions display response JSON in a tree format automatically.

## Extracting Data with jq

\`jq\` is the Swiss Army knife for command-line JSON processing. It's available on all platforms:

\`\`\`bash
# Install
brew install jq          # macOS
apt-get install jq       # Debian/Ubuntu
choco install jq         # Windows

# Basic usage
echo '{"name":"Alice","age":30}' | jq '.name'
# "Alice"

# Array operations
echo '[1,2,3,4,5]' | jq 'map(. * 2)'
# [2,4,6,8,10]

# Extract specific fields from array of objects
cat users.json | jq '[.[] | {id, email}]'

# Filter and transform
cat orders.json | jq '[.[] | select(.status == "shipped") | {id: .order_id, total: .amount}]'

# Output as CSV
cat users.json | jq -r '.[] | [.id, .name, .email] | @csv'
\`\`\`

## Common JSON Exploration Patterns

**Find all keys in an object:**
\`\`\`javascript
Object.keys(jsonData)               // top-level keys
Object.keys(jsonData.nested.object) // nested keys
\`\`\`

**Recursively find all keys:**
\`\`\`javascript
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    keys.push(fullKey);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    }
  }
  return keys;
}
\`\`\`

**Find a value by key anywhere in the tree:**
\`\`\`javascript
function findByKey(obj, targetKey) {
  if (obj === null || typeof obj !== 'object') return [];
  const results = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === targetKey) results.push(value);
    if (typeof value === 'object') results.push(...findByKey(value, targetKey));
  }
  return results;
}
\`\`\`

## Best Practices

1. **Use a viewer for unfamiliar APIs** — Before writing code to consume a new API, explore the full response structure in a viewer.
2. **Document your JSON paths** — When you find the path to a field you need, document it in code comments: \`// response.data.user.profile.avatar_url\`.
3. **Use jq in CI/CD** — Parse JSON from CLI tools (Terraform output, AWS CLI) using jq in shell scripts instead of fragile string parsing.
4. **Validate schema first** — If you're processing user-supplied JSON, validate against a JSON Schema before navigating the structure.
5. **Handle null and missing keys** — Always use optional chaining (\`response?.data?.user?.id\`) when accessing deeply nested JSON properties.

→ Try the [JSON Viewer](/json-viewer)`,
  },
  {
    slug: 'xml-to-json-guide',"""

# Apply both patches
errors = []

if old_port in content:
    content = content.replace(old_port, new_port, 1)
    print("SUCCESS: random-port-generator-guide replaced")
else:
    errors.append("ERROR: random-port-generator-guide old content NOT found")

if old_viewer in content:
    content = content.replace(old_viewer, new_viewer, 1)
    print("SUCCESS: json-viewer-guide replaced")
else:
    errors.append("ERROR: json-viewer-guide old content NOT found")

if errors:
    for e in errors:
        print(e)
else:
    with open('src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("File written successfully")
