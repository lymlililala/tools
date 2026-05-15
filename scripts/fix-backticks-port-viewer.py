#!/usr/bin/env python3
"""
Fix unescaped backticks in random-port-generator-guide and json-viewer-guide 
content within the articles.data.ts template literal.
"""
import re

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the random-port-generator-guide article
# The problematic line has `https://example.com` unescaped
old_port_line = r"""Every TCP and UDP connection is identified by a 4-tuple: (source IP, source port, destination IP, destination port). When you open a browser and visit `https://example.com`, your OS picks a random ephemeral source port (say, 54321) and connects to the destination port 443 (HTTPS)."""

new_port_line = r"""Every TCP and UDP connection is identified by a 4-tuple: (source IP, source port, destination IP, destination port). When you open a browser and visit \`https://example.com\`, your OS picks a random ephemeral source port (say, 54321) and connects to the destination port 443 (HTTPS)."""

if old_port_line in content:
    content = content.replace(old_port_line, new_port_line, 1)
    print("Fixed: unescaped backtick in random-port intro paragraph")
else:
    print("WARN: port intro line not found")

# Fix `0.0.0.0` backtick references in the random-port section
# These occur in prose text (not code blocks), not needing escaping since they're already strings
# Actually let's check: in template literals, backticks within prose need escaping
old_security = "binding databases (MySQL: 3306, PostgreSQL: 5432, MongoDB: 27017, Redis: 6379) to `0.0.0.0` — always bind to `127.0.0.1` unless remote access is explicitly required."
new_security = r"binding databases (MySQL: 3306, PostgreSQL: 5432, MongoDB: 27017, Redis: 6379) to \`0.0.0.0\` — always bind to \`127.0.0.1\` unless remote access is explicitly required."

if old_security in content:
    content = content.replace(old_security, new_security, 1)
    print("Fixed: unescaped backticks in security section")
else:
    print("WARN: security section line not found")

# Fix any other unescaped backticks within the port article
# Check for port like `react-window` and `@tanstack/virtual` in json-viewer
old_virtual = "Libraries like `react-window` and `@tanstack/virtual` implement this."
new_virtual = r"Libraries like \`react-window\` and \`@tanstack/virtual\` implement this."
if old_virtual in content:
    content = content.replace(old_virtual, new_virtual, 1)
    print("Fixed: unescaped backticks react-window")
else:
    print("INFO: react-window line not found (may already be escaped)")

# Fix json-viewer article - check for unescaped backticks
# "Format document": `Shift+Alt+F`
old_shift = 'VS Code has excellent built-in JSON support:\n\n**Format document**: `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (macOS)'
new_shift = r'VS Code has excellent built-in JSON support:\n\n**Format document**: \`Shift+Alt+F\` (Windows/Linux) or \`Shift+Option+F\` (macOS)'
if old_shift in content:
    content = content.replace(old_shift, new_shift, 1)
    print("Fixed: unescaped backticks in VS Code section")

# Fix `$schema` backtick
old_schema = 'Add a `$schema` property or configure in `settings.json`:'
new_schema = r'Add a \`$schema\` property or configure in \`settings.json\`:'
if old_schema in content:
    content = content.replace(old_schema, new_schema, 1)
    print("Fixed: unescaped backtick $schema")

# Fix `response.data.user.profile.avatar_url`
old_path = "// response.data.user.profile.avatar_url"
# This is inside a code block (triple backticks), so it's fine - just verify
# Also fix prose backticks in best practices section 
old_optional = "Always use optional chaining (`response?.data?.user?.id`) when accessing deeply nested JSON properties."
new_optional = r"Always use optional chaining (\`response?.data?.user?.id\`) when accessing deeply nested JSON properties."
if old_optional in content:
    content = content.replace(old_optional, new_optional, 1)
    print("Fixed: unescaped backtick optional chaining")

# Check for backtick in port article with `lsof`
old_lsof = "using `lsof`:"
new_lsof = r"using \`lsof\`:"
# Only fix in prose, not in code blocks
if old_lsof in content:
    content = content.replace(old_lsof, new_lsof, 1)
    print("Fixed: unescaped backtick lsof")

old_ss = "using `ss` (newer, faster than netstat):"
new_ss = r"using \`ss\` (newer, faster than netstat):"
if old_ss in content:
    content = content.replace(old_ss, new_ss, 1)
    print("Fixed: unescaped backtick ss")

old_netstat = "using `netstat`:"
new_netstat = r"using \`netstat\`:"
if old_netstat in content:
    content = content.replace(old_netstat, new_netstat, 1)
    print("Fixed: unescaped backtick netstat")

# Fix `jq` in json-viewer 
old_jq = r"`jq` is the Swiss Army knife"
new_jq = r"\`jq\` is the Swiss Army knife"
if old_jq in content:
    content = content.replace(old_jq, new_jq, 1)
    print("Fixed: unescaped backtick jq")

# Fix json-viewer virtual scrolling backtick
old_virt = "Only render the visible portion of the tree. If a JSON array has 10,000 elements, only the ~20 visible on screen are rendered as DOM nodes. Libraries like"
# Already handled above, skip

# Save
with open('src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("File saved.")
