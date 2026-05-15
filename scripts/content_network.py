# -*- coding: utf-8 -*-
"""
New article content for Network category (articles 1-6).
Each entry is a tuple: (slug, new_content_string)
"""

articles = [
    ("ipv4-subnet-calculator-guide", r"""## What Is a Subnet?

A **subnet** (subnetwork) is a logical subdivision of an IP network. Subnetting allows network engineers to divide a large network into smaller, more manageable segments, improving security, performance, and address efficiency.

Every IPv4 address is 32 bits long, written as four octets (e.g., `192.168.1.0`). A subnet mask tells you which part of the address identifies the **network** and which part identifies the **host**.

## CIDR Notation

**CIDR (Classless Inter-Domain Routing)** notation combines the IP address with the prefix length:

```
192.168.1.0/24
```

The `/24` means the first 24 bits are the network portion; the remaining 8 bits are the host portion.

| CIDR | Subnet Mask     | Hosts (usable) | Use Case             |
|------|-----------------|----------------|----------------------|
| /8   | 255.0.0.0       | 16,777,214     | Large ISP blocks     |
| /16  | 255.255.0.0     | 65,534         | Campus networks      |
| /24  | 255.255.255.0   | 254            | Typical LAN          |
| /28  | 255.255.255.240 | 14             | Small office segment |
| /30  | 255.255.255.252 | 2              | Point-to-point links |

## How Subnet Masks Work

A subnet mask is a 32-bit number where all **network bits** are 1 and all **host bits** are 0.

For `/24`:
```
11111111.11111111.11111111.00000000 = 255.255.255.0
```

To find the **network address**, apply a bitwise AND between the IP and the mask:
```
IP:   192.168.1.45  = 11000000.10101000.00000001.00101101
Mask: 255.255.255.0 = 11111111.11111111.11111111.00000000
AND:  192.168.1.0   = 11000000.10101000.00000001.00000000
```

## Key Addresses in a Subnet

For `192.168.1.0/24`:

| Address        | Value           | Purpose                    |
|----------------|-----------------|----------------------------|
| Network        | 192.168.1.0     | Identifies the subnet      |
| First usable   | 192.168.1.1     | First host address         |
| Last usable    | 192.168.1.254   | Last host address          |
| Broadcast      | 192.168.1.255   | Sent to all hosts          |
| Total hosts    | 256 - 2 = 254   | Excluding net + broadcast  |

## Subnetting Calculation Example

**Problem:** You have `10.0.0.0/8` and need subnets with at least 500 hosts each.

**Step 1:** How many host bits needed?
2^9 - 2 = 510 >= 500, so need 9 host bits.

**Step 2:** Prefix length = 32 - 9 = **/23**

**Step 3:** Each /23 subnet has 510 usable hosts and subnet mask 255.255.254.0.

**Step 4:** First few subnets of 10.0.0.0/8 split into /23:
```
10.0.0.0/23   -> hosts 10.0.0.1 - 10.0.1.254
10.0.2.0/23   -> hosts 10.0.2.1 - 10.0.3.254
10.0.4.0/23   -> hosts 10.0.4.1 - 10.0.5.254
```

## Variable Length Subnet Masking (VLSM)

VLSM lets you use different prefix lengths within the same address space, maximizing efficiency:

```
10.1.0.0/16 split as:
  10.1.0.0/24   <- 254 hosts for Sales dept
  10.1.1.0/25   <- 126 hosts for Engineering
  10.1.1.128/26 <-  62 hosts for Finance
  10.1.1.192/30 <-   2 hosts for router link
```

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

→ Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)"""),

    ("mac-address-guide", r"""## What Is a MAC Address?

A **MAC (Media Access Control) address** is a unique hardware identifier assigned to every network interface card (NIC). It operates at Layer 2 (the Data Link layer) of the OSI model and is used for communication within a local network segment.

While IP addresses route traffic across the internet, MAC addresses identify devices on the same local network — the Ethernet switch uses MAC tables to forward frames to the right port.

## MAC Address Format

A MAC address is **48 bits (6 bytes)** long, typically written in one of these formats:

```
AA:BB:CC:DD:EE:FF   (colon-separated, Linux/macOS)
AA-BB-CC-DD-EE-FF   (hyphen-separated, Windows)
AABB.CCDD.EEFF      (dot-separated, Cisco)
```

The first 3 bytes are the **OUI (Organizationally Unique Identifier)** assigned by the IEEE to manufacturers:
- `00:1A:2B` -> Cisco Systems
- `8C:85:90` -> Apple
- `3C:22:FB` -> Google

## Special Bits in the First Byte

### Bit 0 (LSB) — Unicast vs. Multicast
- `0` = **Unicast** (sent to one device)
- `1` = **Multicast** (sent to a group)

### Bit 1 — Globally vs. Locally Administered
- `0` = **Globally unique** (assigned by IEEE to the manufacturer)
- `1` = **Locally administered** (manually configured or randomly generated)

## Generating a Random MAC Address

```javascript
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
```

## ARP: How MAC Addresses Are Discovered

Before a host can send a frame, it needs the MAC address for the destination IP. **ARP (Address Resolution Protocol)** handles this:

1. Host A broadcasts: "Who has 192.168.1.10? Tell 192.168.1.1"
2. Host B (192.168.1.10) replies: "192.168.1.10 is at AA:BB:CC:DD:EE:FF"
3. Host A caches the mapping and sends the frame

View your ARP cache:
```bash
arp -a         # Windows/macOS/Linux
ip neigh show  # Linux (modern)
```

## Practical Use Cases

**1. Virtual Machines:** Hypervisors (VMware, VirtualBox) generate locally administered MAC addresses for virtual NICs to avoid conflicts with physical hardware.

**2. MAC Address Spoofing:** Changing your MAC can help with privacy on public Wi-Fi. iOS and Android use randomized MACs by default.

```bash
# Linux: temporarily change MAC address
sudo ip link set dev eth0 down
sudo ip link set dev eth0 address 02:42:ac:11:00:02
sudo ip link set dev eth0 up
```

**3. Network Access Control (NAC):** Corporate networks often whitelist MAC addresses to allow only authorized devices.

**4. DHCP Reservations:** Routers assign the same IP address to a device based on its MAC address, useful for servers and printers.

## Common Mistakes

1. **Confusing MAC with IP** — MAC is for local delivery; IP is for end-to-end routing across networks
2. **Assuming MAC is permanent** — software can change the MAC address (address spoofing is easy)
3. **Using multicast MACs for unicast** — setting bit 0 creates a multicast address that won't work for single-device communication
4. **Ignoring OUI registration** — using an unregistered OUI can cause ARP conflicts

## Best Practices

- For virtual environments, always use **locally administered** MAC addresses (bit 1 = 1)
- When testing, generate a fresh MAC to avoid collision with real hardware
- Use the **OUI lookup** feature to verify vendor ownership before deploying custom MAC values
- Track MAC addresses in your asset management system for security auditing

→ Try the [MAC Address Generator](/mac-address-generator)"""),

    ("ipv4-range-expander-guide", r"""## What Is an IPv4 Range?

An **IPv4 range** is a contiguous block of IP addresses. Ranges are most commonly expressed in **CIDR notation** (e.g., `192.168.1.0/24`) or as a **start-end pair** (e.g., `192.168.1.0 - 192.168.1.255`).

Knowing how to expand these ranges into individual addresses is essential for:
- Writing precise **firewall rules**
- **Auditing** which IPs are in scope for a security test
- Configuring **IP whitelists/blocklists**
- **DHCP pool** planning

## CIDR Range Boundaries

Given a CIDR block `A.B.C.D/N`:

1. **Network address** = IP with all host bits set to 0
2. **Broadcast address** = IP with all host bits set to 1
3. **Total addresses** = 2^(32-N)
4. **Usable hosts** = 2^(32-N) - 2 (excluding network and broadcast)

### Example: 10.0.0.0/29

```
Prefix length: /29 -> 32-29 = 3 host bits
Total addresses: 2^3 = 8
Network:   10.0.0.0
Hosts:     10.0.0.1 - 10.0.0.6
Broadcast: 10.0.0.7
```

## Expanding a CIDR in Code

### JavaScript

```javascript
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
```

### Python

```python
import ipaddress

network = ipaddress.IPv4Network('10.0.0.0/28', strict=False)
for ip in network:
    print(str(ip))
# 10.0.0.0 through 10.0.0.15
```

## Start-End Range to CIDR Conversion

Not all IP ranges are clean CIDR blocks. To convert a start-end range to CIDR:

```javascript
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
```

## Practical Scenarios

### Firewall Allowlist
When a vendor provides a list of their IP ranges, expand each CIDR and verify none overlap with internal addresses before adding firewall rules.

### Security Scanning Scope
Penetration testers define scope as CIDR blocks; expanding them gives the exact list of targets to scan.

### Cloud Provider IP Ranges
AWS, Azure, and GCP publish their IP ranges as JSON files with hundreds of CIDR blocks. Tools that check "is this IP from AWS?" must expand and cache these ranges.

### Network Inventory
Expand your assigned CIDR block and cross-reference with active DHCP leases to find unused IP addresses.

## Common Mistakes

1. **Including network and broadcast** as usable hosts — always exclude the first and last address
2. **Expanding /8 or /16 ranges** without pagination — `10.0.0.0/8` contains 16 million IPs; never load them all into memory at once
3. **Confusing overlapping ranges** — `192.168.0.0/24` and `192.168.0.128/25` overlap; the second is a subset of the first
4. **Not validating CIDR input** — reject prefix lengths > 32 and addresses with set host bits

## Best Practices

- For large ranges (/16 and above), **stream or paginate** results instead of materializing all IPs at once
- Store ranges as **(integer start, integer end)** pairs for fast range lookup and comparison
- Use **CIDR aggregation** to combine overlapping or adjacent ranges before storing them
- Always **validate CIDR input** — use `strict=True` in Python's ipaddress module

→ Try the [IPv4 Range Expander](/ipv4-range-expander)"""),

    ("ipv4-address-converter-guide", r"""## Why Convert IPv4 Addresses?

An IPv4 address is fundamentally a **32-bit unsigned integer**. The familiar dotted-decimal notation (`192.168.1.1`) is just a human-readable representation. Networking code, packet headers, databases, and low-level protocols often store or process IP addresses in other formats:

- **Binary** — shows the exact bit layout for masking and subnetting
- **Hexadecimal** — used in packet captures, memory dumps, and some APIs
- **32-bit integer** — efficient for storage, range comparisons, and bitwise operations

## The Four Representations

Take `192.168.10.5` as an example:

| Format          | Value                                   |
|-----------------|-----------------------------------------|
| Dotted-decimal  | 192.168.10.5                            |
| Binary          | 11000000.10101000.00001010.00000101     |
| Hexadecimal     | 0xC0A80A05                              |
| 32-bit integer  | 3232238085                              |

### Conversion Process

Each octet is an 8-bit value (0-255):
```
192 = 11000000 = 0xC0
168 = 10101000 = 0xA8
 10 = 00001010 = 0x0A
  5 = 00000101 = 0x05
```

Concatenated: `0xC0A80A05` = 3,232,238,085 in decimal.

## Code Examples

### JavaScript

```javascript
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
```

### Python

```python
import ipaddress

ip = ipaddress.IPv4Address('192.168.10.5')
print(int(ip))           # 3232238085
print(hex(int(ip)))      # 0xc0a80a05
print(format(int(ip), '032b'))  # 11000000101010000000101000000101
```

## Use Cases

### Database Storage
Storing IPs as integers enables **range queries** orders of magnitude faster than string comparisons:

```sql
-- Find all IPs in 192.168.1.0/24
SELECT * FROM access_logs
WHERE ip_int BETWEEN 3232235776 AND 3232236031;
```

### Packet Analysis
Tools like Wireshark display IPs in dotted-decimal, but the raw bytes in a captured Ethernet frame are in network byte order (big-endian hex).

### Subnet Masking
The bitwise AND operation that determines the network address works directly on integers:
```javascript
const ip   = ipToInt('192.168.1.45');  // 3232235817
const mask = ipToInt('255.255.255.0'); // 4294967040
const net  = (ip & mask) >>> 0;       // 3232235776 -> 192.168.1.0
```

### Geolocation Databases
MaxMind GeoIP and similar databases store IP ranges as integer pairs for efficient binary search lookups.

## Common Mistakes

1. **Signed integer overflow in JS** — use `>>> 0` to force unsigned 32-bit interpretation
2. **Byte order confusion** — network byte order is big-endian; some C APIs use host byte order (little-endian on x86)
3. **Leading zeros in octets** — `010` in some languages is octal (8), not decimal (10); always use parseInt(octet, 10)
4. **Treating IPv6 as IPv4** — IPv6 is 128 bits; these conversions don't apply directly

## Best Practices

- Store IPs as **unsigned 32-bit integers** in databases for efficient indexing and range queries
- Always use **big-endian (network byte order)** when encoding IPs for network transmission
- Validate input: each octet must be 0-255, and the address must have exactly 4 octets
- For applications needing IPv6 compatibility from the start, use Python's `ipaddress` module or equivalent

→ Try the [IPv4 Address Converter](/ipv4-address-converter)"""),

    ("ipv6-ula-generator-guide", r"""## What Is an IPv6 ULA?

A **Unique Local Address (ULA)** is an IPv6 address in the `fc00::/7` range, defined by RFC 4193. ULAs are the IPv6 equivalent of IPv4 private addresses (RFC 1918) — they are routable within a site or between sites, but are **not routable on the global internet**.

There are two sub-ranges:
- `fc00::/8` — centrally assigned (not yet in use)
- `fd00::/8` — **locally assigned** (what you generate yourself)

The vast majority of ULA deployments use the `fd00::/8` range.

## ULA Address Structure

A ULA address has the following 128-bit layout:

```
| 7 bits  | 1 bit | 40 bits    | 16 bits   | 64 bits      |
|---------|-------|------------|-----------|--------------|
| 1111110 | L=1   | Global ID  | Subnet ID | Interface ID |
```

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
5. Prepend `0xFD` to form the /48 prefix

```javascript
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
```

## Example ULA Deployment

Suppose you generated the prefix `fd3a:bc12:4e78::/48`. You can then subnet it:

```
fd3a:bc12:4e78:0001::/64  -> Office LAN (Subnet 1)
fd3a:bc12:4e78:0002::/64  -> Server VLAN (Subnet 2)
fd3a:bc12:4e78:0003::/64  -> IoT devices (Subnet 3)
fd3a:bc12:4e78:ffff::/64  -> Management network
```

## ULA vs. Link-Local vs. Global Unicast

| Type          | Prefix      | Scope                | Internet Routable |
|---------------|-------------|----------------------|-------------------|
| Link-local    | fe80::/10   | Single network link  | No                |
| ULA           | fc00::/7    | Site or organization | No                |
| Global unicast| 2000::/3    | Internet-wide        | Yes               |

**Key difference from link-local:** ULAs are routable between sites if you choose to route them; link-local addresses (`fe80::`) never leave a single network link.

## Practical Scenarios

**Home Lab:** Use ULAs for a stable internal IPv6 prefix that doesn't change when your ISP changes your delegated prefix.

**Multi-Site VPN:** Connect two offices over WireGuard or OpenVPN using ULAs. Since they're private, there's no risk of colliding with internet addresses.

**Docker / Kubernetes:** Assign ULA prefixes to container networks for predictable IPv6 routing inside the cluster.

**Development Environments:** Use ULAs for local service-to-service communication without depending on external routing.

## Address Assignment for Hosts

Within a `/64` subnet, hosts can get addresses via:
- **SLAAC (Stateless Address Autoconfiguration):** generates Interface ID from MAC (EUI-64) or randomly
- **DHCPv6:** explicit assignment from a server
- **Static assignment:** manually configured for servers

## Common Mistakes

1. **Using link-local instead of ULA** — `fe80::` addresses can't route between VLANs or subnets
2. **Reusing the same Global ID across sites** — if two sites share a Global ID, inter-site routing breaks
3. **Forgetting privacy extensions for servers** — servers should have stable interface IDs, not random ones
4. **Not documenting your ULA allocation** — treat it like an IP address plan; document which prefix belongs to which site

## Best Practices

- Generate a **new random Global ID for each distinct site** to minimize collision probability
- Use `/48` per site and `/64` per subnet (the standard IPv6 allocation model)
- Even for home labs, document the prefix in a README or wiki
- Test ULA reachability with `ping6 fd...` before relying on it in production services

→ Try the [IPv6 ULA Generator](/ipv6-ula-generator)"""),

    ("mac-address-lookup-guide", r"""## What Is OUI-Based MAC Lookup?

When you look up a MAC address to find its manufacturer, you are performing an **OUI lookup**. The IEEE (Institute of Electrical and Electronics Engineers) assigns blocks of MAC address prefixes to device manufacturers. The first 3 bytes (24 bits) of a MAC address form the **OUI (Organizationally Unique Identifier)**.

For example, the MAC address `3C:22:FB:AA:BB:CC`:
- OUI: `3C:22:FB`
- Lookup result: **Google LLC**

## The IEEE OUI Registry

The IEEE maintains a public registry at `standards-oui.ieee.org`. There are three assignment types:

| Block Type    | Size          | Use Case                      |
|---------------|---------------|-------------------------------|
| MA-L (OUI)    | 16 million    | Large manufacturers           |
| MA-M (OUI-28) | 1 million     | Mid-size companies            |
| MA-S (OUI-36) | 4,096         | Small companies / products    |

The registry is available as CSV/TXT downloads and updated weekly.

## How to Perform a Lookup

### Programmatic API Lookup

```javascript
async function lookupOUI(mac) {
  const normalized = mac.replace(/[:-]/g, '').toUpperCase();
  const oui = normalized.slice(0, 6);
  const response = await fetch('https://api.macvendors.com/' + oui);
  if (!response.ok) return 'Unknown';
  return await response.text();
}

lookupOUI('3C:22:FB:AA:BB:CC').then(console.log); // "Google LLC"
```

### Local Database Approach (for bulk lookups)

```python
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
```

## Real-World Use Cases

### Network Security Auditing
Scan your network and identify unexpected devices by their OUI:
```
MAC: 00:11:22:33:44:55 -> Unknown vendor -> investigate further
MAC: DC:A6:32:xx:xx:xx -> Raspberry Pi -> expected in lab
```

### Incident Response
When reviewing DHCP logs or ARP tables after an intrusion, the OUI can help narrow down which physical device made a suspicious request.

### IoT Device Inventory
In enterprise networks, categorizing devices by vendor helps identify unmanaged IoT devices that may pose security risks (smart TVs, IP cameras, etc.).

### Parental Controls
Home routers display friendly names like "Apple iPhone" and "Samsung Smart TV" using OUI lookup instead of raw MAC addresses.

## Checking for Locally Administered MACs

Before performing an OUI lookup, check if the MAC is locally administered (bit 1 of the first byte set to 1):

```javascript
function isLocallyAdministered(mac) {
  const firstByte = parseInt(mac.split(':')[0].replace('-', ''), 16);
  return (firstByte & 0x02) !== 0;
}

console.log(isLocallyAdministered('02:42:ac:11:00:02')); // true - Docker container
console.log(isLocallyAdministered('3C:22:FB:AA:BB:CC')); // false - globally unique
```

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

→ Try the [MAC Address Lookup](/mac-address-lookup)"""),
]
