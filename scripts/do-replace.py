#!/usr/bin/env python3
"""
Precisely replace lines 1632-3473 (the 31 short articles) with detailed versions.
Keep lines 1-1631 (before the Network section) and lines 3474-end (after income-tax).
"""

ARTICLES_FILE = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

total = len(lines)
print(f'Total lines: {total}')

# 0-indexed: line 1632 = index 1631, line 3473 = index 3472
delete_start = 1631  # 0-indexed, inclusive (// ─── Network)
delete_end   = 3472  # 0-indexed, inclusive (last line of income-tax article: '  },')

print(f'Lines to delete (1-indexed): {delete_start+1} to {delete_end+1}')
print(f'First deleted line: {repr(lines[delete_start])}')
print(f'Last deleted line: {repr(lines[delete_end])}')
print(f'First kept-after line: {repr(lines[delete_end+1])}')

# Build new articles content (detailed versions of all 31 articles)
NEW_CONTENT = r"""
  // ─── Network ──────────────────────────────────────────────────
  {
    slug: 'ipv4-subnet-calculator-guide',
    toolPath: '/ipv4-subnet-calculator',
    title: 'IPv4 Subnetting Explained: CIDR, Subnet Masks, and Network Ranges',
    description: 'Master IPv4 subnetting with this in-depth guide covering CIDR notation, subnet masks, network ranges, and broadcast addresses.',
    keywords: ['subnet calculator', 'CIDR notation', 'IPv4 subnetting', 'subnet mask'],
    category: 'Network',
    publishedAt: '2025-07-20',
    content: `## What Is a Subnet?

A **subnet** (subnetwork) is a logical subdivision of an IP network. Subnetting allows network engineers to divide a large network into smaller, more manageable segments, improving security, performance, and address efficiency.

Every IPv4 address is 32 bits long, written as four octets (e.g., \`192.168.1.0\`). A subnet mask tells you which part of the address identifies the **network** and which part identifies the **host**.

## CIDR Notation

**CIDR (Classless Inter-Domain Routing)** notation combines the IP address with the prefix length:

\`\`\`
192.168.1.0/24
\`\`\`

The \`/24\` means the first 24 bits are the network portion; the remaining 8 bits are the host portion.

| CIDR | Subnet Mask     | Hosts (usable) | Use Case             |
|------|-----------------|----------------|----------------------|
| /8   | 255.0.0.0       | 16,777,214     | Large ISP blocks     |
| /16  | 255.255.0.0     | 65,534         | Campus networks      |
| /24  | 255.255.255.0   | 254            | Typical LAN          |
| /28  | 255.255.255.240 | 14             | Small office segment |
| /30  | 255.255.255.252 | 2              | Point-to-point links |

## How Subnet Masks Work

A subnet mask is a 32-bit number where all **network bits** are 1 and all **host bits** are 0.

For \`/24\`:
\`\`\`
11111111.11111111.11111111.00000000 = 255.255.255.0
\`\`\`

To find the **network address**, apply a bitwise AND between the IP and the mask:
\`\`\`
IP:   192.168.1.45  = 11000000.10101000.00000001.00101101
Mask: 255.255.255.0 = 11111111.11111111.11111111.00000000
AND:  192.168.1.0   = 11000000.10101000.00000001.00000000
\`\`\`

## Key Addresses in a Subnet

For \`192.168.1.0/24\`:

| Address        | Value           | Purpose                    |
|----------------|-----------------|----------------------------|
| Network        | 192.168.1.0     | Identifies the subnet      |
| First usable   | 192.168.1.1     | First host address         |
| Last usable    | 192.168.1.254   | Last host address          |
| Broadcast      | 192.168.1.255   | Sent to all hosts          |
| Total hosts    | 256 - 2 = 254   | Excluding net + broadcast  |

## Subnetting Calculation Example

**Problem:** You have \`10.0.0.0/8\` and need subnets with at least 500 hosts each.

**Step 1:** How many host bits needed?
2^9 - 2 = 510 >= 500, so we need 9 host bits.

**Step 2:** Prefix length = 32 - 9 = **/23**

**Step 3:** Each /23 subnet has 510 usable hosts and subnet mask 255.255.254.0.

**Step 4:** First few subnets of 10.0.0.0/8 split into /23:
\`\`\`
10.0.0.0/23   -> hosts 10.0.0.1 - 10.0.1.254
10.0.2.0/23   -> hosts 10.0.2.1 - 10.0.3.254
10.0.4.0/23   -> hosts 10.0.4.1 - 10.0.5.254
\`\`\`

## Variable Length Subnet Masking (VLSM)

VLSM lets you use different prefix lengths within the same address space, maximizing efficiency:

\`\`\`
10.1.0.0/16 split as:
  10.1.0.0/24   <- 254 hosts for Sales dept
  10.1.1.0/25   <- 126 hosts for Engineering
  10.1.1.128/26 <-  62 hosts for Finance
  10.1.1.192/30 <-   2 hosts for router link
\`\`\`

## Private Address Ranges (RFC 1918)

| Range                          | CIDR          | Common Use             |
|--------------------------------|---------------|------------------------|
| 10.0.0.0 - 10.255.255.255      | 10.0.0.0/8    | Enterprise networks    |
| 172.16.0.0 - 172.31.255.255    | 172.16.0.0/12 | Mid-size organizations |
| 192.168.0.0 - 192.168.255.255  | 192.168.0.0/16| Home/small office      |

## Common Mistakes

1. **Off-by-one on usable hosts** — always subtract 2 (network + broadcast) from total addresses
2. **Forgetting that /32 is a single host** — used for loopback or static routes
3. **Using /31 incorrectly** — RFC 3021 allows /31 for point-to-point links with no broadcast
4. **Overlapping subnets** — when creating VLSMs, verify ranges don't overlap

## Best Practices

- **Document every subnet** with its purpose, VLAN ID, and assigned gateway
- **Reserve the first few IPs** in each subnet for infrastructure (gateway, DNS, monitoring)
- **Plan for growth** — size subnets at 2x current needs
- **Use a /30 or /31** for router-to-router links to conserve addresses
- **Separate security zones** — put servers, clients, IoT on different subnets with firewall rules

→ Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)`,
  },
  {
    slug: 'mac-address-guide',
    toolPath: '/mac-address-generator',
    title: 'MAC Address Explained: Format, OUI, and How to Generate One',
    description: 'Understand MAC addresses: their 48-bit structure, OUI vendor prefixes, unicast vs multicast bits, and how to generate valid MAC addresses.',
    keywords: ['MAC address generator', 'MAC address lookup', 'OUI lookup'],
    category: 'Network',
    publishedAt: '2025-07-21',
    content: `## What Is a MAC Address?

A **MAC (Media Access Control) address** is a unique hardware identifier assigned to every network interface card (NIC). It operates at Layer 2 (the Data Link layer) of the OSI model and is used for communication within a local network segment.

While IP addresses route traffic across the internet, MAC addresses identify devices on the same local network — the Ethernet switch uses MAC tables to forward frames to the right port.

## MAC Address Format

A MAC address is **48 bits (6 bytes)** long, typically written in one of these formats:

\`\`\`
AA:BB:CC:DD:EE:FF   (colon-separated, Linux/macOS)
AA-BB-CC-DD-EE-FF   (hyphen-separated, Windows)
AABB.CCDD.EEFF      (dot-separated, Cisco)
\`\`\`

The first 3 bytes are the **OUI (Organizationally Unique Identifier)** assigned by the IEEE to manufacturers:
- \`00:1A:2B\` -> Cisco Systems
- \`8C:85:90\` -> Apple
- \`3C:22:FB\` -> Google

## Special Bits in the First Byte

### Bit 0 (LSB) — Unicast vs. Multicast
- \`0\` = **Unicast** (sent to one device)
- \`1\` = **Multicast** (sent to a group)

### Bit 1 — Globally vs. Locally Administered
- \`0\` = **Globally unique** (assigned by IEEE to the manufacturer)
- \`1\` = **Locally administered** (manually configured or randomly generated)

Example:
\`\`\`
First byte: 0x2E = 0010 1110
Bit 0 = 0 -> Unicast
Bit 1 = 1 -> Locally administered
\`\`\`

## Generating a Random MAC Address

\`\`\`javascript
function generateMAC(locallyAdministered = true) {
  const bytes = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
  );
  if (locallyAdministered) {
    bytes[0] = (bytes[0] & 0xFE) | 0x02; // unicast + locally administered
  } else {
    bytes[0] = bytes[0] & 0xFC; // globally unique unicast
  }
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(':');
}

console.log(generateMAC()); // e.g., "2e:4a:f1:3c:9b:07"
\`\`\`

## Practical Use Cases

**1. Virtual Machines:** Hypervisors (VMware, VirtualBox) generate locally administered MAC addresses for virtual NICs to avoid conflicts with physical hardware.

**2. MAC Address Spoofing:** Changing your MAC can help with privacy on public Wi-Fi. iOS and Android use randomized MACs by default.

\`\`\`bash
# Linux: temporarily change MAC address
sudo ip link set dev eth0 down
sudo ip link set dev eth0 address 02:42:ac:11:00:02
sudo ip link set dev eth0 up
\`\`\`

**3. Network Access Control (NAC):** Corporate networks often whitelist MAC addresses to allow only authorized devices.

**4. DHCP Reservations:** Routers assign the same IP address to a device based on its MAC address, useful for servers and printers.

## ARP: How MAC Addresses Are Discovered

Before a host can send a frame, it needs the MAC address for the destination IP. **ARP (Address Resolution Protocol)** handles this:

1. Host A broadcasts: "Who has 192.168.1.10? Tell 192.168.1.1"
2. Host B (192.168.1.10) replies: "192.168.1.10 is at AA:BB:CC:DD:EE:FF"
3. Host A caches the mapping and sends the frame

You can view your ARP cache with:
\`\`\`bash
arp -a         # Windows/macOS/Linux
ip neigh show  # Linux (modern)
\`\`\`

## Common Mistakes

1. **Confusing MAC with IP** — MAC is for local delivery; IP is for end-to-end routing across networks
2. **Assuming MAC is permanent** — software can change the MAC address (address spoofing is easy)
3. **Using multicast MACs for unicast** — setting bit 0 creates a multicast address that won't work for a single device
4. **Ignoring OUI registration** — using an unregistered OUI can cause ARP conflicts

## Best Practices

- For virtual environments, always use **locally administered** MAC addresses (bit 1 = 1)
- When testing, generate a fresh MAC to avoid collision with real hardware
- Use the **OUI lookup** feature to verify vendor ownership before deploying custom MAC values
- Track MAC addresses in your asset management system for security auditing

→ Try the [MAC Address Generator](/mac-address-generator)`,
  },
  {
    slug: 'ipv4-range-expander-guide',
    toolPath: '/ipv4-range-expander',
    title: 'IPv4 Range Expander: List All IPs in a CIDR Range',
    description: 'Learn how to expand a CIDR block into individual IP addresses, understand range boundaries, and use the expander for firewall rules and auditing.',
    keywords: ['IPv4 range', 'CIDR expander', 'list IP addresses'],
    category: 'Network',
    publishedAt: '2025-09-01',
    content: `## What Is an IPv4 Range?

An **IPv4 range** is a contiguous block of IP addresses. Ranges are most commonly expressed in **CIDR notation** (e.g., \`192.168.1.0/24\`) or as a **start-end pair** (e.g., \`192.168.1.0 - 192.168.1.255\`).

Knowing how to expand these ranges into individual addresses is essential for:
- Writing precise **firewall rules**
- **Auditing** which IPs are in scope for a security test
- Configuring **IP whitelists/blocklists**
- **DHCP pool** planning

## CIDR Range Boundaries

Given a CIDR block \`A.B.C.D/N\`:

1. **Network address** = IP with all host bits set to 0
2. **Broadcast address** = IP with all host bits set to 1
3. **Total addresses** = 2^(32-N)
4. **Usable hosts** = 2^(32-N) - 2 (excluding network and broadcast)

### Example: 10.0.0.0/29

\`\`\`
Prefix length: /29 -> 32-29 = 3 host bits
Total addresses: 2^3 = 8
Network:   10.0.0.0
Hosts:     10.0.0.1 - 10.0.0.6
Broadcast: 10.0.0.7
\`\`\`

## Expanding a CIDR in Code

### JavaScript

\`\`\`javascript
function ipToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function expandCIDR(cidr) {
  const [ip, prefix] = cidr.split('/');
  const prefixLen = parseInt(prefix);
  const mask = ~(0xFFFFFFFF >>> prefixLen) >>> 0;
  const network = ipToInt(ip) & mask;
  const broadcast = network | (~mask >>> 0);
  const ips = [];
  for (let i = network; i <= broadcast; i++) {
    ips.push(intToIp(i));
  }
  return ips;
}

console.log(expandCIDR('192.168.1.0/30'));
// ['192.168.1.0', '192.168.1.1', '192.168.1.2', '192.168.1.3']
\`\`\`

### Python

\`\`\`python
import ipaddress

network = ipaddress.IPv4Network('10.0.0.0/28', strict=False)
for ip in network:
    print(str(ip))
# 10.0.0.0 through 10.0.0.15
\`\`\`

## Start-End Range to CIDR Conversion

Not all IP ranges are clean CIDR blocks. To convert a start-end range:

\`\`\`javascript
function rangeToCIDR(startIP, endIP) {
  let start = ipToInt(startIP);
  const end = ipToInt(endIP);
  const cidrs = [];
  while (start <= end) {
    let maxSize = 32;
    while (maxSize > 0) {
      const mask = ~(0xFFFFFFFF >>> (maxSize - 1)) >>> 0;
      if ((start & mask) !== start) break;
      if (start + (1 << (32 - (maxSize - 1))) - 1 > end) break;
      maxSize--;
    }
    cidrs.push(intToIp(start) + '/' + maxSize);
    start += 1 << (32 - maxSize);
  }
  return cidrs;
}
\`\`\`

## Practical Scenarios

### Firewall Allowlist
When a vendor provides a list of their IP ranges, expand each CIDR and verify none overlap with internal addresses before adding firewall rules.

### Security Scanning Scope
Penetration testers define scope as CIDR blocks; expanding them gives the exact list of targets to scan.

### Cloud Provider IP Ranges
AWS, Azure, and GCP publish their IP ranges as JSON files with hundreds of CIDR blocks. Tools that check "is this IP from AWS?" must expand and cache these ranges.

### Network Inventory
Expand your assigned CIDR block and cross-reference with active DHCP leases to identify unused IP addresses.

## Common Mistakes

1. **Including network and broadcast** as usable hosts — always exclude the first and last address
2. **Expanding /8 or /16 ranges** without pagination — \`10.0.0.0/8\` contains 16 million IPs; never load them all into memory at once
3. **Confusing overlapping ranges** — \`192.168.0.0/24\` and \`192.168.0.128/25\` overlap; the second is a subset of the first
4. **Not validating CIDR input** — reject prefix lengths > 32 and addresses with set host bits

## Best Practices

- For large ranges (/16 and above), **stream or paginate** results instead of materializing all IPs at once
- Store ranges as **(integer start, integer end)** pairs for fast range lookup and comparison
- Use **CIDR aggregation** to combine overlapping or adjacent ranges before storing them
- Always **validate CIDR input** — use \`strict=True\` in Python's ipaddress module

→ Try the [IPv4 Range Expander](/ipv4-range-expander)`,
  },
  {
    slug: 'ipv4-address-converter-guide',
    toolPath: '/ipv4-address-converter',
    title: 'IPv4 Address Converter: Decimal, Binary, Hex, and Integer',
    description: 'Convert IPv4 addresses between dotted-decimal, binary, hexadecimal, and 32-bit integer formats. Understand the underlying bit structure.',
    keywords: ['IPv4 converter', 'IP address binary', 'IP to hex'],
    category: 'Network',
    publishedAt: '2025-09-02',
    content: `## Why Convert IPv4 Addresses?

An IPv4 address is fundamentally a **32-bit unsigned integer**. The familiar dotted-decimal notation (\`192.168.1.1\`) is just a human-readable representation. Networking code, packet headers, databases, and low-level protocols often store or process IP addresses in other formats:

- **Binary** — shows the exact bit layout for masking and subnetting
- **Hexadecimal** — used in packet captures, memory dumps, and some APIs
- **32-bit integer** — efficient for storage, range comparisons, and bitwise operations

## The Four Representations

Take \`192.168.10.5\` as an example:

| Format          | Value                                   |
|-----------------|-----------------------------------------|
| Dotted-decimal  | 192.168.10.5                            |
| Binary          | 11000000.10101000.00001010.00000101     |
| Hexadecimal     | 0xC0A80A05                              |
| 32-bit integer  | 3232238085                              |

### Conversion Process

Each octet is an 8-bit value (0-255):
\`\`\`
192 = 11000000 = 0xC0
168 = 10101000 = 0xA8
 10 = 00001010 = 0x0A
  5 = 00000101 = 0x05
\`\`\`

Concatenated: \`0xC0A80A05\` = 3,232,238,085 in decimal.

## Code Examples

### JavaScript

\`\`\`javascript
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet), 0) >>> 0;
}

function intToIp(n) {
  return [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF].join('.');
}

function ipToHex(ip) {
  return '0x' + ipToInt(ip).toString(16).toUpperCase().padStart(8, '0');
}

function ipToBin(ip) {
  return ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
}

console.log(ipToInt('192.168.10.5'));  // 3232238085
console.log(intToIp(3232238085));     // 192.168.10.5
console.log(ipToHex('192.168.10.5')); // 0xC0A80A05
console.log(ipToBin('192.168.10.5')); // 11000000.10101000.00001010.00000101
\`\`\`

### Python

\`\`\`python
import ipaddress

ip = ipaddress.IPv4Address('192.168.10.5')
print(int(ip))           # 3232238085
print(hex(int(ip)))      # 0xc0a80a05
print(format(int(ip), '032b'))  # 11000000101010000000101000000101
\`\`\`

## Use Cases

### Database Storage
Storing IPs as integers enables **range queries** orders of magnitude faster than string comparisons:

\`\`\`sql
-- Find all IPs in 192.168.1.0/24
SELECT * FROM access_logs
WHERE ip_int BETWEEN 3232235776 AND 3232236031;
\`\`\`

### Packet Analysis
Tools like Wireshark display IPs in dotted-decimal, but the raw bytes in a captured Ethernet frame are in network byte order (big-endian hex).

### Subnet Masking
The bitwise AND operation that determines the network address works directly on integers:
\`\`\`javascript
const ip   = ipToInt('192.168.1.45');  // 3232235817
const mask = ipToInt('255.255.255.0'); // 4294967040
const net  = (ip & mask) >>> 0;       // 3232235776 -> 192.168.1.0
\`\`\`

### Geolocation Databases
MaxMind GeoIP and similar databases store IP ranges as integer pairs for efficient binary search lookups.

## Common Mistakes

1. **Signed integer overflow in JS** — use \`>>> 0\` to force unsigned 32-bit interpretation
2. **Byte order confusion** — network byte order is big-endian; some C APIs use host byte order (little-endian on x86)
3. **Leading zeros in octets** — \`010\` in some languages is octal (8), not decimal (10); always use parseInt(octet, 10)
4. **Treating IPv6 as IPv4** — IPv6 is 128 bits; these conversions don't apply directly

## Best Practices

- Store IPs as **unsigned 32-bit integers** in databases for efficient indexing and range queries
- Always use **big-endian (network byte order)** when encoding IPs for network transmission
- Validate input: each octet must be 0-255, and the address must have exactly 4 octets
- For applications that need IPv6 compatibility from the start, use a library like Python's \`ipaddress\` module

→ Try the [IPv4 Address Converter](/ipv4-address-converter)`,
  },
  {
    slug: 'ipv6-ula-generator-guide',
    toolPath: '/ipv6-ula-generator',
    title: 'IPv6 ULA Generator: Create Unique Local Addresses for Private Networks',
    description: 'Understand IPv6 Unique Local Addresses (ULA), their fc00::/7 range, how they are generated, and when to use them for private networking.',
    keywords: ['IPv6 ULA', 'unique local address', 'IPv6 private'],
    category: 'Network',
    publishedAt: '2025-09-03',
    content: `## What Is an IPv6 ULA?

A **Unique Local Address (ULA)** is an IPv6 address in the \`fc00::/7\` range, defined by RFC 4193. ULAs are the IPv6 equivalent of IPv4 private addresses (RFC 1918) — they are routable within a site or between sites, but are **not routable on the global internet**.

There are two sub-ranges:
- \`fc00::/8\` — centrally assigned (not yet in use)
- \`fd00::/8\` — **locally assigned** (what you generate yourself)

The vast majority of ULA deployments use the \`fd00::/8\` range.

## ULA Address Structure

A ULA address has the following 128-bit layout:

\`\`\`
| 7 bits  | 1 bit | 40 bits    | 16 bits   | 64 bits      |
|---------|-------|------------|-----------|--------------|
| 1111110 | L=1   | Global ID  | Subnet ID | Interface ID |
\`\`\`

- **L bit = 1** for locally assigned (fd::/8)
- **Global ID:** 40 random bits, making your prefix unique across sites
- **Subnet ID:** 16 bits for up to 65,536 subnets within your site
- **Interface ID:** 64 bits identifying the host (often EUI-64 derived from MAC)

## How to Generate a ULA Prefix

The algorithm from RFC 4193:

1. Get the current time as a 64-bit NTP timestamp
2. Get the MAC address of a local interface
3. Concatenate them and compute **SHA-1**
4. Take the **last 40 bits** of the hash as the Global ID
5. Prepend \`0xFD\` to form the /48 prefix

\`\`\`javascript
import crypto from 'crypto';

function generateULAPrefix() {
  const timestamp = BigInt(Date.now()) * 1000000n;
  const mac = crypto.randomBytes(6).toString('hex');
  const input = timestamp.toString(16) + mac;
  const hash = crypto.createHash('sha1').update(input).digest('hex');
  const globalId = hash.slice(-10); // last 40 bits = 5 bytes
  return 'fd' + globalId.slice(0,2) + ':' + globalId.slice(2,6) + ':' + globalId.slice(6,10) + '::/48';
}

console.log(generateULAPrefix()); // e.g., fd3a:bc12:4e78::/48
\`\`\`

## Example ULA Deployment

Suppose you generated the prefix \`fd3a:bc12:4e78::/48\`. You can then subnet it:

\`\`\`
fd3a:bc12:4e78:0001::/64  -> Office LAN (Subnet 1)
fd3a:bc12:4e78:0002::/64  -> Server VLAN (Subnet 2)
fd3a:bc12:4e78:0003::/64  -> IoT devices (Subnet 3)
fd3a:bc12:4e78:ffff::/64  -> Management network
\`\`\`

## ULA vs. Link-Local vs. Global Unicast

| Type          | Prefix      | Scope                | Internet Routable |
|---------------|-------------|----------------------|-------------------|
| Link-local    | fe80::/10   | Single network link  | No                |
| ULA           | fc00::/7    | Site or organization | No                |
| Global unicast| 2000::/3    | Internet-wide        | Yes               |

**Key difference from link-local:** ULAs are routable between sites if you choose to route them; link-local addresses (\`fe80::\`) never leave a single network link.

## Practical Scenarios

**Home Lab:** Use ULAs for a stable internal IPv6 prefix that doesn't change when your ISP changes your delegated prefix.

**Multi-Site VPN:** Connect two offices over WireGuard or OpenVPN using ULAs. Since they're private, there's no risk of colliding with internet addresses.

**Docker / Kubernetes:** Assign ULA prefixes to container networks for predictable IPv6 routing inside the cluster.

**Development Environments:** Use ULAs for local service-to-service communication without depending on external routing.

## Address Assignment for Hosts

Within a \`/64\` subnet, hosts can get addresses via:
- **SLAAC (Stateless Address Autoconfiguration):** generates Interface ID from MAC (EUI-64) or randomly
- **DHCPv6:** explicit assignment from a server
- **Static assignment:** manually configured for servers

## Common Mistakes

1. **Using link-local instead of ULA** — \`fe80::\` addresses can't route between VLANs or subnets
2. **Reusing the same Global ID across sites** — if two sites share a Global ID, inter-site routing breaks
3. **Forgetting privacy extensions for servers** — servers should have stable interface IDs, not random ones
4. **Not documenting your ULA allocation** — treat it like an IP address plan; document which prefix belongs to which site

## Best Practices

- Generate a **new random Global ID for each distinct site** to minimize collision probability
- Use \`/48\` per site and \`/64\` per subnet (the standard IPv6 allocation model)
- Even for home labs, document the prefix in a README or wiki
- Test ULA reachability with \`ping6 fd...\` before relying on it in production services

→ Try the [IPv6 ULA Generator](/ipv6-ula-generator)`,
  },
  {
    slug: 'mac-address-lookup-guide',
    toolPath: '/mac-address-lookup',
    title: 'MAC Address Lookup: Find the Manufacturer from Any MAC Address',
    description: 'Use the OUI (Organizationally Unique Identifier) to identify the manufacturer of any network device by its MAC address prefix.',
    keywords: ['MAC address lookup', 'OUI lookup', 'MAC vendor lookup'],
    category: 'Network',
    publishedAt: '2025-09-04',
    content: `## What Is OUI-Based MAC Lookup?

When you look up a MAC address to find its manufacturer, you are performing an **OUI lookup**. The IEEE (Institute of Electrical and Electronics Engineers) assigns blocks of MAC address prefixes to device manufacturers. The first 3 bytes (24 bits) of a MAC address form the **OUI (Organizationally Unique Identifier)**.

For example, the MAC address \`3C:22:FB:AA:BB:CC\`:
- OUI: \`3C:22:FB\`
- Lookup result: **Google LLC**

## The IEEE OUI Registry

The IEEE maintains a public registry at \`standards-oui.ieee.org\`. There are three assignment types:

| Block Type    | Size          | Use Case                      |
|---------------|---------------|-------------------------------|
| MA-L (OUI)    | 16 million    | Large manufacturers           |
| MA-M (OUI-28) | 1 million     | Mid-size companies            |
| MA-S (OUI-36) | 4,096         | Small companies / products    |

The registry is available as CSV/TXT downloads and updated weekly.

## How to Perform a Lookup

### Programmatic API Lookup

\`\`\`javascript
async function lookupOUI(mac) {
  const normalized = mac.replace(/[:-]/g, '').toUpperCase();
  const oui = normalized.slice(0, 6);
  const response = await fetch('https://api.macvendors.com/' + oui);
  if (!response.ok) return 'Unknown';
  return await response.text();
}

lookupOUI('3C:22:FB:AA:BB:CC').then(console.log); // "Google LLC"
\`\`\`

### Local Database Approach (for bulk lookups)

\`\`\`python
import csv, re

def load_oui_database(filepath):
    db = {}
    with open(filepath, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            db[row['Assignment'].upper()] = row['Organization Name']
    return db

def lookup(mac, db):
    oui = re.sub(r'[^A-F0-9]', '', mac.upper())[:6]
    return db.get(oui, 'Unknown')

db = load_oui_database('oui.csv')
print(lookup('3C:22:FB:AA:BB:CC', db))  # Google LLC
\`\`\`

## Real-World Use Cases

### Network Security Auditing
Scan your network and identify unexpected devices by their OUI:
\`\`\`
MAC: 00:11:22:33:44:55 -> Unknown vendor -> investigate further
MAC: DC:A6:32:xx:xx:xx -> Raspberry Pi -> expected in lab
\`\`\`

### Incident Response
When reviewing DHCP logs or ARP tables after an intrusion, the OUI can help narrow down which physical device made a suspicious request.

### IoT Device Inventory
In enterprise networks, categorizing devices by vendor helps identify unmanaged IoT devices that may pose security risks (smart TVs, IP cameras, etc.).

### Parental Controls
Home routers display friendly names like "Apple iPhone" and "Samsung Smart TV" using OUI lookup instead of raw MAC addresses.

## Checking for Locally Administered MACs

Before performing an OUI lookup, check if the MAC is locally administered (bit 1 of the first byte set to 1):

\`\`\`javascript
function isLocallyAdministered(mac) {
  const firstByte = parseInt(mac.split(':')[0].replace('-', ''), 16);
  return (firstByte & 0x02) !== 0;
}

console.log(isLocallyAdministered('02:42:ac:11:00:02')); // true - Docker container
console.log(isLocallyAdministered('3C:22:FB:AA:BB:CC')); // false - globally unique
\`\`\`

## Limitations of OUI Lookup

1. **Locally administered MACs** — if bit 1 of byte 1 is set, there's no OUI; the address was locally generated
2. **MAC randomization** — modern mobile devices use randomized MACs for privacy; lookups return "unknown"
3. **OEM re-use** — large OEMs sometimes manufacture under other brands; OUI may show the component supplier
4. **Database staleness** — the IEEE database updates weekly; cached copies may be outdated

## Common Mistakes

1. **Looking up 6 bytes instead of 3** — OUI is always the first 3 bytes only
2. **Not normalizing MAC format** — strip separators and uppercase before lookup
3. **Assuming locally administered MACs have a vendor** — always check bit 1 of byte 1 first
4. **Using rate-limited APIs in bulk** — for large-scale scans, download and use a local OUI database

## Best Practices

- **Cache OUI results** locally to avoid repeated API calls during bulk analysis
- **Refresh your local OUI database** at least monthly since the IEEE releases weekly updates
- **Flag locally administered MACs** separately — they indicate VMs, containers, or privacy-mode clients
- Combine OUI lookup with **DNS reverse lookup** and **DHCP hostnames** for complete device identification

→ Try the [MAC Address Lookup](/mac-address-lookup)`,
  },

  // ─── Math ──────────────────────────────────────────────────────
  {
    slug: 'percentage-calculator-guide',
    toolPath: '/percentage-calculator',
    title: 'Percentage Calculations: Formulas, Examples, and a Free Calculator',
    description: 'Master all percentage formulas: find percentage of a number, percentage change, percentage difference, and reverse percentage calculations.',
    keywords: ['percentage calculator', 'how to calculate percentage', 'percentage change'],
    category: 'Math',
    publishedAt: '2025-07-25',
    content: `## Understanding Percentages

A **percentage** is a ratio expressed as a fraction of 100. The word comes from the Latin *per centum* ("by the hundred"). Percentages are ubiquitous in everyday life: discounts, interest rates, tax rates, statistics, and more.

The fundamental relationship:
\`\`\`
percentage = (part / whole) * 100
\`\`\`

## The Six Core Percentage Formulas

### 1. What is X% of Y?
\`\`\`
result = (X / 100) * Y
\`\`\`
Example: What is 15% of 200? = (15/100) * 200 = **30**

### 2. X is what percent of Y?
\`\`\`
percentage = (X / Y) * 100
\`\`\`
Example: 45 is what percent of 180? = (45/180) * 100 = **25%**

### 3. X is Y% of what?
\`\`\`
whole = X * (100 / Y)
\`\`\`
Example: 30 is 20% of what? = 30 * (100/20) = **150**

### 4. Percentage Change
\`\`\`
% change = ((new - old) / |old|) * 100
\`\`\`
Example: Price went from $80 to $100 = ((100-80)/80) * 100 = **+25%**

### 5. Percentage Difference
\`\`\`
% difference = |A - B| / ((A + B) / 2) * 100
\`\`\`
Used when there is no clear "reference" value between two numbers.

### 6. Adding/Removing a Percentage
\`\`\`
after increase: result = original * (1 + rate/100)
after decrease: result = original * (1 - rate/100)
\`\`\`
Example: $200 after a 15% discount = 200 * 0.85 = **$170**

## Code Examples

\`\`\`javascript
const pct = {
  of: (x, y) => (x / 100) * y,
  whatPercent: (x, y) => (x / y) * 100,
  ofWhat: (x, y) => x * (100 / y),
  change: (oldVal, newVal) => ((newVal - oldVal) / Math.abs(oldVal)) * 100,
  difference: (a, b) => (Math.abs(a - b) / ((a + b) / 2)) * 100,
  increase: (val, rate) => val * (1 + rate / 100),
  decrease: (val, rate) => val * (1 - rate / 100),
};

console.log(pct.of(15, 200));           // 30
console.log(pct.whatPercent(45, 180));  // 25
console.log(pct.change(80, 100));       // 25
console.log(pct.decrease(200, 15));     // 170
console.log(pct.increase(1000, 7.5));   // 1075
\`\`\`

## Practical Scenarios

### Sales Discounts
A jacket costs $120 with a 30% discount:
Final price = 120 * (1 - 0.30) = **$84**

### Investment Returns
Invested $5,000, grew to $6,200:
Return = ((6200 - 5000) / 5000) * 100 = **+24%**

### Grade Calculation
You scored 73 out of 85 on an exam:
Grade = (73 / 85) * 100 = **85.9%**

### VAT / Tax Calculation
Product costs $50 before 20% VAT:
With VAT: 50 * 1.20 = **$60**
Removing VAT from $60: 60 / 1.20 = **$50 (ex-VAT)**

### Tip Calculation
Bill is $45, you want to leave 18% tip:
Tip = (18/100) * 45 = **$8.10**
Total = 45 + 8.10 = **$53.10**

## Common Mistakes

1. **Percentage vs. percentage points** — from 4% to 6% is a 2 percentage-point increase, but a 50% relative increase
2. **Symmetric fallacy** — a 50% increase followed by a 50% decrease does NOT return to the original: 100 -> 150 -> 75
3. **Dividing by zero** — percentage change is undefined when the old value is 0
4. **Rounding too early** — in multi-step calculations, keep full precision until the final result
5. **Confusing "off" with final price** — "20% off $100" means the price is $80, not that you pay $20

## Best Practices

- Always clarify whether you mean **absolute** or **relative** change when discussing percentages
- For financial calculations, use **Decimal/BigDecimal** types, not floating-point, to avoid rounding errors
- When expressing percentage changes, state the **base value** clearly (e.g., "20% more than last year's $50,000")
- For statistics, prefer **percentage difference** over **percentage change** when neither value is the reference

→ Try the [Percentage Calculator](/percentage-calculator)`,
  },
  {
    slug: 'bmi-calculator-guide',
    toolPath: '/bmi-calculator',
    title: 'BMI Calculator: What Your Body Mass Index Means',
    description: 'Calculate and understand BMI. Learn the formula, WHO categories, limitations of BMI, and healthier ways to assess body composition.',
    keywords: ['BMI calculator', 'body mass index', 'healthy weight'],
    category: 'Math',
    publishedAt: '2025-07-26',
    content: `## What Is BMI?

**Body Mass Index (BMI)** is a numerical value derived from a person's weight and height. Introduced by Belgian statistician Adolphe Quetelet in the 1830s as the "Quetelet Index," it was later renamed BMI and adopted by the World Health Organization as a screening tool for weight categories.

BMI is not a direct measure of body fat — it's a proxy that correlates with body fat percentage at the population level, though it can be misleading for individuals.

## The BMI Formula

**Metric (kg/m):**
\`\`\`
BMI = weight (kg) / height^2 (m^2)
\`\`\`

**Imperial (lbs/inches):**
\`\`\`
BMI = (weight (lbs) * 703) / height^2 (inches^2)
\`\`\`

Example (metric):
Weight = 70 kg, Height = 1.75 m
BMI = 70 / (1.75 * 1.75) = 70 / 3.0625 = **22.9**

Example (imperial):
Weight = 154 lbs, Height = 69 inches (5'9")
BMI = (154 * 703) / (69 * 69) = 108,262 / 4,761 = **22.7**

## WHO BMI Categories (Adults)

| BMI Range   | Category           | Health Risk      |
|-------------|-------------------|------------------|
| < 18.5      | Underweight        | Moderate         |
| 18.5 - 24.9 | Normal weight      | Minimal          |
| 25.0 - 29.9 | Overweight         | Increased        |
| 30.0 - 34.9 | Obese (Class I)    | High             |
| 35.0 - 39.9 | Obese (Class II)   | Very High        |
| >= 40.0     | Obese (Class III)  | Extremely High   |

**For Asian populations**, the WHO suggests lower thresholds (overweight >= 23, obese >= 27.5) due to higher health risks at lower BMIs.

## Code Example

\`\`\`javascript
function calculateBMI(weight, height, unit = 'metric') {
  let bmi;
  if (unit === 'metric') {
    bmi = weight / (height * height);
  } else {
    // Imperial: weight in lbs, height in inches
    bmi = (weight * 703) / (height * height);
  }
  return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal weight';
  if (bmi < 30)   return 'Overweight';
  if (bmi < 35)   return 'Obese (Class I)';
  if (bmi < 40)   return 'Obese (Class II)';
  return 'Obese (Class III)';
}

const bmi = calculateBMI(70, 1.75);
console.log(bmi, getBMICategory(bmi)); // 22.9 "Normal weight"

// BMI for children uses percentiles
function getBMIPercentile(bmi, age, sex) {
  // Requires age/sex-specific CDC growth charts
  // This is a placeholder - real implementation needs lookup tables
  return 'Use CDC growth charts for children under 20';
}
\`\`\`

## Limitations of BMI

BMI is a blunt instrument with well-known limitations:

1. **Doesn't distinguish fat from muscle** — a muscular athlete may have a "obese" BMI despite low body fat
2. **Doesn't account for fat distribution** — abdominal visceral fat is more metabolically harmful than subcutaneous fat, but BMI doesn't differentiate
3. **Age and sex differences** — older adults may have more fat at the same BMI; women typically have more body fat than men at the same BMI
4. **Ethnic variation** — health risks vary by ethnicity at the same BMI value
5. **Height-squared approximation** — the true scaling relationship between body mass and height is approximately height^2.5, not height^2

## Better Measures of Health

| Measure                    | Normal Range                     | Notes                                |
|---------------------------|----------------------------------|--------------------------------------|
| Waist circumference        | <35" women, <40" men             | Better predictor of cardiovascular risk |
| Waist-to-hip ratio         | <0.85 women, <0.9 men            | Indicator of abdominal obesity       |
| Waist-to-height ratio      | <0.5 for all                     | Simple, effective across ethnicities |
| Body fat percentage        | 18-28% women, 10-20% men         | DEXA scan is gold standard           |
| Visceral fat rating        | 1-12 (healthy range)             | Measurable by bio-impedance scales   |

## Practical Uses of BMI

Despite limitations, BMI remains valuable for:
- **Population-level screening** in public health studies
- **Tracking individual changes** over time (even if absolute value is misleading)
- **Insurance and clinical risk assessment** where more precise measurements are impractical
- **Initial screening** for conditions like sleep apnea, type 2 diabetes, and joint problems

## Common Mistakes

1. **Using BMI as a sole diagnostic tool** — it is a screening indicator, not a diagnosis
2. **Applying adult BMI charts to children** — children under 20 use age- and sex-specific percentile charts
3. **Confusing BMI with body fat percentage** — they are correlated but not identical
4. **Not accounting for ethnicity** — especially important in Asian and South Asian populations where risks begin at lower BMIs

→ Try the [BMI Calculator](/bmi-calculator)`,
  },
  {
    slug: 'mortgage-calculator-guide',
    toolPath: '/mortgage-calculator',
    title: 'Mortgage Calculator: Understand Your Home Loan Payments',
    description: 'Calculate monthly mortgage payments, total interest, and amortization schedules. Understand how interest rate, loan term, and down payment affect your payments.',
    keywords: ['mortgage calculator', 'home loan', 'interest rate', 'amortization'],
    category: 'Math',
    publishedAt: '2025-07-27',
    content: `## How Mortgage Payments Work

A **mortgage** is a loan secured by real property. When you borrow money to buy a home, the lender charges interest and you repay both principal and interest over a fixed term (typically 15 or 30 years) through equal monthly payments.

Understanding the math behind mortgage payments helps you make informed decisions about loan amounts, terms, and refinancing.

## The PMT Formula

The monthly payment amount is calculated using the **Present Value of an Annuity** formula:

\`\`\`
M = P * [r(1+r)^n] / [(1+r)^n - 1]
\`\`\`

Where:
- **M** = monthly payment
- **P** = principal (loan amount)
- **r** = monthly interest rate (annual rate / 12)
- **n** = number of payments (loan term in years * 12)

### Example Calculation

Loan amount: $300,000, 6% annual interest, 30-year term:

\`\`\`
r = 6% / 12 = 0.5% = 0.005
n = 30 * 12 = 360 payments
M = 300000 * [0.005 * (1.005)^360] / [(1.005)^360 - 1]
M = 300000 * [0.005 * 6.0226] / [6.0226 - 1]
M = 300000 * 0.030113 / 5.0226
M = 300000 * 0.005996
M = $1,798.65/month
\`\`\`

## JavaScript Implementation

\`\`\`javascript
function calculateMortgage(principal, annualRate, termYears) {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) {
    return {
      monthly: principal / numPayments,
      totalPayment: principal,
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + monthlyRate, numPayments);
  const monthly = principal * (monthlyRate * factor) / (factor - 1);
  const totalPayment = monthly * numPayments;
  const totalInterest = totalPayment - principal;

  return {
    monthly: Math.round(monthly * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

// Generate amortization schedule
function amortizationSchedule(principal, annualRate, termYears) {
  const { monthly } = calculateMortgage(principal, annualRate, termYears);
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= termYears * 12; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthly - interest;
    balance -= principalPaid;
    schedule.push({
      month,
      payment: monthly,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(Math.max(0, balance) * 100) / 100,
    });
  }
  return schedule;
}

const result = calculateMortgage(300000, 6, 30);
console.log(result);
// { monthly: 1798.65, totalPayment: 647514, totalInterest: 347514 }
\`\`\`

## The Real Cost of a Mortgage

A $300,000 loan at 6% for 30 years:
- Monthly payment: **$1,798.65**
- Total payments: **$647,514**
- Total interest paid: **$347,514** (more than the original loan!)

Choosing a 15-year term instead:
- Monthly payment: **$2,531.57** (+$733/month)
- Total interest: **$155,683** (saves $191,831!)

## Impact of Interest Rate

For a $300,000 loan over 30 years:

| Rate | Monthly Payment | Total Interest |
|------|----------------|----------------|
| 4%   | $1,432         | $215,608       |
| 5%   | $1,610         | $279,767       |
| 6%   | $1,799         | $347,515       |
| 7%   | $1,996         | $418,527       |
| 8%   | $2,201         | $492,392       |

A 1% rate difference on a $300,000 loan costs about $68,000 over 30 years.

## Down Payment and PMI

Most lenders require **Private Mortgage Insurance (PMI)** if your down payment is less than 20% of the home's value:
- PMI typically costs 0.5%–1.5% of the loan amount annually
- On a $300,000 loan, PMI could add $125–$375/month to your payment
- PMI can be cancelled once you reach 20% equity

## Extra Payments

Making extra principal payments dramatically reduces total interest:

\`\`\`javascript
function withExtraPayment(principal, annualRate, termYears, extraMonthly) {
  const monthlyRate = annualRate / 100 / 12;
  const baseMonthly = calculateMortgage(principal, annualRate, termYears).monthly;
  const totalMonthly = baseMonthly + extraMonthly;
  let balance = principal;
  let months = 0;
  let totalInterest = 0;

  while (balance > 0) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(totalMonthly - interest, balance);
    balance -= principalPaid;
    totalInterest += interest;
    months++;
    if (months > termYears * 12 * 2) break; // safety limit
  }

  return { months, totalInterest: Math.round(totalInterest) };
}
\`\`\`

## Common Mistakes

1. **Ignoring closing costs** — typically 2-5% of the loan amount (appraisal, title insurance, origination fees)
2. **Forgetting property tax and insurance** — the actual monthly payment is often PITI (Principal, Interest, Tax, Insurance)
3. **Not accounting for PMI** — if down payment is < 20%, add PMI to your monthly budget
4. **Comparing rates without comparing APR** — APR includes fees and gives a better true cost comparison

## Best Practices

- **Get pre-approved** before house hunting — know your maximum budget
- **Compare 15 vs. 30 year terms** — the interest savings on a 15-year can be enormous
- **Make extra principal payments** even if small — $100/month extra on a 30-year $300K loan saves about $24,000 and cuts 4 years off the term
- **Refinance when rates drop** significantly (generally 0.75%+ lower), but factor in closing costs

→ Try the [Mortgage Calculator](/mortgage-calculator)`,
  },
  {
    slug: 'math-evaluator-guide',
    toolPath: '/math-evaluator',
    title: 'Math Expression Evaluator: Calculate Complex Formulas Online',
    description: 'Evaluate mathematical expressions, functions, and formulas online. Understand operator precedence, supported functions, and safe evaluation techniques.',
    keywords: ['math evaluator', 'math calculator', 'expression calculator'],
    category: 'Math',
    publishedAt: '2025-07-28',
    content: `## What Is a Math Expression Evaluator?

A **math expression evaluator** parses and computes the result of a mathematical expression written as a string, such as \`sin(pi/6) + sqrt(3)\` or \`(2^10 - 1) / 3\`. Unlike a simple calculator with buttons, an expression evaluator lets you type formulas directly in a natural mathematical notation.

## Operator Precedence

Standard mathematical precedence (PEMDAS/BODMAS) applies:

1. **Parentheses** — evaluated first: \`(2 + 3) * 4 = 20\`
2. **Exponentiation** — right-associative: \`2^3^2 = 2^9 = 512\`
3. **Multiplication/Division** — left to right
4. **Addition/Subtraction** — left to right

\`\`\`
2 + 3 * 4     = 14   (multiplication before addition)
(2 + 3) * 4   = 20   (parentheses first)
2^3^2         = 512  (right-assoc: 3^2=9 first, then 2^9)
-3^2          = -9   (unary minus applies after exponentiation)
\`\`\`

## Supported Functions and Constants

Most math evaluators support:

| Category    | Examples                                  |
|-------------|-------------------------------------------|
| Trig        | sin, cos, tan, asin, acos, atan, atan2    |
| Hyperbolic  | sinh, cosh, tanh, asinh, acosh, atanh     |
| Exponential | exp, log, log2, log10, ln, pow, sqrt      |
| Rounding    | floor, ceil, round, trunc, abs, sign      |
| Constants   | pi, e, phi (golden ratio), tau (= 2*pi)  |
| Statistical | min, max, mean, sum, factorial            |

## How Evaluators Work

### Step 1: Lexing (Tokenization)
Convert the input string into a list of tokens:
\`\`\`
"sin(pi/6) + 2" -> [sin, (, pi, /, 6, ), +, 2]
\`\`\`

### Step 2: Parsing — Shunting-Yard Algorithm
Edsger Dijkstra's algorithm converts infix notation to postfix (RPN):
\`\`\`
Input:  sin(pi/6) + 2
Output: [pi, 6, /, sin, 2, +]   (Reverse Polish Notation)
\`\`\`

### Step 3: Evaluation
Process the RPN queue with a stack:
\`\`\`
pi -> push 3.14159...
6  -> push 6
/  -> pop two, compute pi/6 = 0.5236, push
sin-> pop one, compute sin(0.5236) = 0.5, push
2  -> push 2
+  -> pop two, compute 0.5 + 2 = 2.5, push
Result: 2.5
\`\`\`

## Code Example Using math.js

\`\`\`javascript
import { evaluate, format } from 'mathjs';

const examples = [
  'sqrt(2) + sqrt(3)',
  'log(100, 10)',
  '2^8 - 1',
  'sin(pi/6)^2 + cos(pi/6)^2',
  '(1 + 1/1000)^1000',
  '5!',
  'gcd(12, 8)',
];

for (const expr of examples) {
  try {
    const result = evaluate(expr);
    console.log(expr + ' = ' + format(result, { precision: 10 }));
  } catch (e) {
    console.error('Error in "' + expr + '": ' + e.message);
  }
}

// Output:
// sqrt(2) + sqrt(3) = 3.146264370
// log(100, 10) = 2
// 2^8 - 1 = 255
// sin(pi/6)^2 + cos(pi/6)^2 = 1
// (1 + 1/1000)^1000 = 2.716923932  (approaches e)
// 5! = 120
// gcd(12, 8) = 4
\`\`\`

## Practical Scenarios

### Engineering Calculations
\`\`\`
Ohm's Law: V = I * R
Power: P = V^2 / R = 110^2 / 220 = 55 watts

Decibels: dB = 20 * log10(V_out / V_in)
         = 20 * log10(0.5) = -6.02 dB
\`\`\`

### Financial Formulas
\`\`\`
Future Value: FV = PV * (1 + r)^n
             = 1000 * (1 + 0.05)^10 = 1628.89

Monthly payment: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
\`\`\`

### Statistical Formulas
\`\`\`
Z-score: z = (x - mean) / stddev
         = (75 - 70) / 10 = 0.5

Normal distribution PDF:
f(x) = (1/sqrt(