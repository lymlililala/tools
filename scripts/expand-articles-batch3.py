#!/usr/bin/env python3
"""
Batch 3: yaml-viewer, ipv4-subnet, mac-address, percentage, bmi, mortgage,
math-evaluator, eta, lorem-ipsum, text-diff, emoji-picker, string-obfuscator,
text-statistics, chronometer, benchmark-builder, qr-code, svg-placeholder,
color-palette, phone-formatter, iban-validator
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

articles['yaml-viewer-guide'] = """## What Is YAML?

YAML (YAML Ain't Markup Language, a recursive acronym) is a human-friendly data serialization standard. Designed to be readable by both humans and machines, YAML uses indentation and minimal punctuation to express data structures.

YAML has become the dominant format for configuration files in modern infrastructure and DevOps: Docker Compose, Kubernetes manifests, GitHub Actions workflows, Ansible playbooks, and many application configuration frameworks all use YAML.

## YAML Data Types

YAML automatically infers data types based on the value:

```yaml
# Strings (no quotes needed unless value is ambiguous)
name: Alice
message: "This requires quotes: it has a colon"
long_string: 'Single quotes also work'

# Integers and floats
port: 8080
price: 19.99
negative: -5

# Booleans (careful - many values are truthy)
enabled: true     # or yes, on, True, TRUE
disabled: false   # or no, off, False, FALSE

# Null
optional: null    # or ~
empty:            # Also null

# Dates
birthday: 1990-01-15
created_at: 2025-06-15T14:30:00Z
```

## YAML Collections

### Mappings (Objects)
```yaml
user:
  id: 1
  name: Alice
  email: alice@example.com
  address:
    city: New York
    country: US

# Flow style (compact, like JSON)
user: {id: 1, name: Alice, email: alice@example.com}
```

### Sequences (Arrays)
```yaml
# Block style
tags:
  - python
  - javascript
  - docker

# Flow style
tags: [python, javascript, docker]

# Array of objects
users:
  - id: 1
    name: Alice
  - id: 2
    name: Bob
```

## YAML Anchors and Aliases

YAML's most powerful feature for avoiding repetition:

```yaml
# Define an anchor with &
default_config: &defaults
  database: postgres
  pool_size: 10
  timeout: 30
  retry: 3

# Reuse with *
production:
  <<: *defaults          # Merge all defaults
  pool_size: 50          # Override specific value
  environment: prod

staging:
  <<: *defaults
  environment: staging
```

## Multi-Line Strings

YAML handles multi-line strings elegantly:

```yaml
# Literal block (|) - preserves newlines and trailing newline
script: |
  #!/bin/bash
  set -e
  echo "Starting deployment"
  npm run build
  pm2 restart app

# Folded block (>) - joins lines with spaces
description: >
  This is a long description that
  will be joined into a single
  paragraph.

# Chomping indicators
text_trim: |-     # No trailing newline
  content
text_keep: |+     # Keep all trailing newlines
  content
```

## YAML Best Practices

### Use Consistent Indentation
YAML is indentation-sensitive. Choose 2 or 4 spaces and stick to it throughout the file. Never mix tabs.

### Quote Strings That Look Like Other Types
```yaml
# Without quotes, these become non-strings
version: "1.0"        # String, not float 1.0
zip: "01234"          # String, not int 1234 (loses leading zero)
active: "yes"         # String, not boolean true
```

### Use Descriptive Comments
```yaml
# Database connection settings
database:
  host: localhost      # Use 'db' in Docker Compose
  port: 5432           # Default PostgreSQL port
  name: myapp
```

## Common YAML Use Cases

**Kubernetes**: Every resource definition (Pod, Deployment, Service, ConfigMap) is a YAML file.

**GitHub Actions**: Workflow files defining CI/CD pipelines.

**Docker Compose**: Multi-container application definitions.

**Ansible**: Infrastructure automation playbooks and inventory files.

**Spring Boot**: Application configuration (application.yml).

**Ruby on Rails**: Database configuration (database.yml), environment configs.

## YAML Pitfalls

The Norway Problem: In YAML 1.1, the value `NO` (country code for Norway) is parsed as `false`. YAML 1.2 fixed this, but many parsers still use YAML 1.1 behavior. When in doubt, quote strings.

Tab prohibition: YAML 1.1 completely prohibits tab characters for indentation. Always use spaces.

Float parsing: Values like `1.0`, `1e5`, `.inf`, `.nan` are parsed as floats/special values in some parsers.

## Using This Tool

Paste any YAML document to instantly validate it, view the parsed structure as a tree, and see any syntax errors with line numbers. The tool highlights each data type with different colors for easy identification.

-> Try the [YAML Viewer](/yaml-viewer)"""

articles['ipv4-subnet-calculator-guide'] = """## What Is IP Subnetting?

IP subnetting is the practice of dividing a large network into smaller sub-networks (subnets). Each subnet is a logical subdivision of an IP network, allowing for better organization, security isolation, and efficient use of IP addresses.

Understanding subnetting is essential for network engineers, system administrators, DevOps professionals, and anyone working with cloud infrastructure (AWS VPCs, Azure VNets, GCP VPCs all use subnetting concepts).

## IPv4 Address Structure

An IPv4 address is a 32-bit number, typically written as four octets (bytes) in decimal, separated by dots:

```
192.168.1.100
│   │   │ └── Host portion
│   │   └──── Host portion
│   └──────── Network or host portion
└──────────── Network portion
```

Each octet ranges from 0 to 255 (8 bits). The boundary between the network and host portions is determined by the **subnet mask**.

## Subnet Masks

A subnet mask is a 32-bit number with consecutive 1s followed by consecutive 0s:

```
255.255.255.0 = 11111111.11111111.11111111.00000000
```

The 1-bits indicate the network portion; the 0-bits indicate the host portion.

**CIDR Notation** is a compact way to express subnet masks as a prefix length:
```
192.168.1.0/24  means 24 bits for network, 8 bits for hosts
192.168.0.0/16  means 16 bits for network, 16 bits for hosts
10.0.0.0/8      means 8 bits for network, 24 bits for hosts
```

## Common Subnet Sizes

| CIDR | Subnet Mask | Usable Hosts | Use Case |
|---|---|---|---|
| /30 | 255.255.255.252 | 2 | Point-to-point links |
| /29 | 255.255.255.248 | 6 | Small office segment |
| /28 | 255.255.255.240 | 14 | Small team subnet |
| /27 | 255.255.255.224 | 30 | Department subnet |
| /26 | 255.255.255.192 | 62 | Medium segment |
| /25 | 255.255.255.128 | 126 | Half of a /24 |
| /24 | 255.255.255.0 | 254 | Standard LAN |
| /23 | 255.255.254.0 | 510 | Two /24s combined |
| /22 | 255.255.252.0 | 1022 | Four /24s |
| /16 | 255.255.0.0 | 65,534 | Large enterprise |
| /8 | 255.0.0.0 | 16,777,214 | ISP allocation |

Formula: Usable hosts = 2^(32-prefix) - 2 (subtract network and broadcast addresses).

## Network, Broadcast, and Host Addresses

For any subnet, three special addresses exist:

**Network address**: All host bits are 0. Identifies the subnet itself.
**Broadcast address**: All host bits are 1. Sends to all hosts in subnet.
**Usable host range**: Everything between network and broadcast.

Example for 192.168.1.0/24:
```
Network:   192.168.1.0   (host bits = 00000000)
First host: 192.168.1.1
Last host:  192.168.1.254
Broadcast: 192.168.1.255  (host bits = 11111111)
```

## Private IP Address Ranges

RFC 1918 defines three ranges for private (non-routable) use:

| Range | CIDR | Addresses |
|---|---|---|
| 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | 16,777,216 |
| 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | 1,048,576 |
| 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | 65,536 |

These addresses are used in home networks, corporate intranets, and cloud VPCs. They cannot be directly routed on the public internet.

## Subnetting a Network

To divide 192.168.1.0/24 into 4 equal subnets:
- Need 2 bits for 4 subnets (2^2 = 4)
- New prefix: /24 + 2 = /26
- Each subnet has 2^6 - 2 = 62 usable hosts

```
Subnet 1: 192.168.1.0/26   (hosts: .1 - .62,   broadcast: .63)
Subnet 2: 192.168.1.64/26  (hosts: .65 - .126,  broadcast: .127)
Subnet 3: 192.168.1.128/26 (hosts: .129 - .190, broadcast: .191)
Subnet 4: 192.168.1.192/26 (hosts: .193 - .254, broadcast: .255)
```

## Cloud Networking (AWS/Azure/GCP)

In cloud environments, subnets define network segmentation within a VPC (Virtual Private Cloud):

- **Public subnets**: Have internet gateway access (for load balancers, NAT)
- **Private subnets**: No direct internet access (for application servers, databases)
- **VPC CIDR**: Typically 10.0.0.0/16 (65,534 addresses)
- **Subnet CIDR**: Typically /24 per availability zone (254 addresses)

## Using This Tool

Enter an IP address and CIDR notation (or subnet mask) to instantly see the network address, broadcast address, usable host range, number of hosts, subnet mask in all formats, and whether the IP is private or public.

-> Try the [IPv4 Subnet Calculator](/ipv4-subnet-calculator)"""

articles['mac-address-guide'] = """## What Is a MAC Address?

A MAC (Media Access Control) address is a unique hardware identifier assigned to every network interface card (NIC) at the factory. Unlike IP addresses (which are logical and can change), MAC addresses are burned into the hardware and are intended to be globally unique.

MAC addresses operate at Layer 2 (the Data Link Layer) of the OSI model. They are used to identify devices on a local network segment, enabling Ethernet switches and Wi-Fi access points to deliver frames to the correct device.

## MAC Address Format

A MAC address is 48 bits (6 bytes) long, typically written as 6 pairs of hexadecimal digits separated by colons, hyphens, or no separator:

```
AA:BB:CC:DD:EE:FF  (colon notation - most common)
AA-BB-CC-DD-EE-FF  (hyphen notation - Windows)
AABBCCDDEEFF       (no separator)
AAB.BCC.DDE.EFF    (Cisco dot notation)
```

## OUI: The Manufacturer Identifier

The first 3 bytes (24 bits) of a MAC address are the **Organizationally Unique Identifier (OUI)**, assigned by the IEEE to each manufacturer:

```
AA:BB:CC:DD:EE:FF
└──────┘└──────┘
  OUI     NIC-specific
(Manufacturer) (Device)
```

Common OUI examples:
- `00:50:56` - VMware virtual machines
- `00:0C:29` - VMware Workstation
- `3C:22:FB` - Apple, Inc.
- `00:14:22` - Dell Inc.
- `DC:A6:32` - Raspberry Pi Trading Ltd.
- `00:1A:2B` - Cisco Systems

## Special MAC Addresses

| Address | Meaning |
|---|---|
| `FF:FF:FF:FF:FF:FF` | Broadcast - sent to all devices on segment |
| `01:00:5E:xx:xx:xx` | IPv4 multicast |
| `33:33:xx:xx:xx:xx` | IPv6 multicast |
| `00:00:00:00:00:00` | Invalid/unset |

The least significant bit of the first byte indicates:
- `0`: Unicast (individual device address)
- `1`: Multicast (group address)

The second least significant bit of the first byte indicates:
- `0`: Globally administered (burned in by manufacturer)
- `1`: Locally administered (set by software/administrator)

## MAC vs IP Address

| Property | MAC Address | IP Address |
|---|---|---|
| Layer | Layer 2 (Data Link) | Layer 3 (Network) |
| Scope | Local network segment | Global or local |
| Uniqueness | Globally unique | Unique within scope |
| Assignment | Hardware (factory) | Software/DHCP |
| Changeability | Technically permanent | Frequently changes |
| Format | 48-bit hex | 32-bit (IPv4) or 128-bit (IPv6) |

## MAC Address Spoofing

Despite being "hardware" addresses, MAC addresses can be changed in software (MAC spoofing). This is used legitimately for:
- Network testing and troubleshooting
- Privacy (iOS, Android, Windows randomize MAC per network)
- Bypassing MAC-based access controls for testing

For security purposes, never rely solely on MAC address filtering for network access control.

## MAC Randomization for Privacy

Modern devices randomize their MAC address when scanning for networks and can use different MACs per network. iOS 14+, Android 10+, and Windows 10+ all implement this feature by default. The second least significant bit of the first byte is set to 1 for locally administered (randomized) addresses.

## Finding Your MAC Address

```bash
# Linux
ip link show
# or
ifconfig

# macOS
ifconfig en0 | grep ether

# Windows
ipconfig /all
# Look for "Physical Address"
```

## Using This Tool

Enter any MAC address to look up:
- Manufacturer name from the IEEE OUI database
- Device type (if identifiable)
- Whether the address is unicast/multicast and globally/locally administered
- Formatted versions in all common notations

-> Try the [MAC Address Generator](/mac-address-generator)"""

articles['percentage-calculator-guide'] = """## Understanding Percentage Calculations

Percentages are one of the most practical mathematical tools in everyday life. From calculating discounts to understanding statistics, tips, tax rates, and financial returns, percentages appear constantly. This guide explains the core percentage calculations and their real-world applications.

## What Is a Percentage?

A percentage (from Latin "per centum" meaning "per hundred") expresses a number as a fraction of 100. The symbol % means "out of 100":

```
50% = 50/100 = 0.5
25% = 25/100 = 0.25
150% = 150/100 = 1.5  (more than the whole)
```

## Core Percentage Formulas

### Formula 1: What is X% of Y?
```
Result = (X / 100) * Y

Example: What is 15% of 200?
Result = (15 / 100) * 200 = 30
```

### Formula 2: X is what percent of Y?
```
Percent = (X / Y) * 100

Example: 45 is what percent of 180?
Percent = (45 / 180) * 100 = 25%
```

### Formula 3: X is Y% of what number?
```
Total = X / (Y / 100) = X * (100 / Y)

Example: 30 is 15% of what number?
Total = 30 / (15 / 100) = 30 * (100/15) = 200
```

### Formula 4: Percentage Change
```
% Change = ((New - Old) / Old) * 100

Example: Price went from $80 to $100
% Change = ((100 - 80) / 80) * 100 = 25% increase

Example: Score went from 90 to 72
% Change = ((72 - 90) / 90) * 100 = -20% (decrease)
```

## Common Percentage Scenarios

### Discounts and Sales
```
Original price: $120
Discount: 30%
Sale price = $120 * (1 - 0.30) = $120 * 0.70 = $84
You save: $120 * 0.30 = $36
```

### Tax Calculation
```
Pretax amount: $50
Tax rate: 8.5%
Tax amount = $50 * 0.085 = $4.25
Total = $50 + $4.25 = $54.25
```

### Tips
```
Bill: $75
Tip: 18%
Tip amount = $75 * 0.18 = $13.50
Total with tip = $75 + $13.50 = $88.50
```

### Grade/Score Percentage
```
Points earned: 87
Points possible: 100
Percentage = (87 / 100) * 100 = 87%

Points earned: 42
Points possible: 60
Percentage = (42 / 60) * 100 = 70%
```

### Compound Interest
```
Principal: $1,000
Annual rate: 5%
After 3 years (compound):
Year 1: $1,000 * 1.05 = $1,050
Year 2: $1,050 * 1.05 = $1,102.50
Year 3: $1,102.50 * 1.05 = $1,157.63

Formula: A = P * (1 + r)^n
A = 1000 * (1.05)^3 = $1,157.63
```

## Percentage vs Percentage Points

This distinction matters in statistics and finance:

- **Percentage point**: An arithmetic difference between two percentages.
- **Percentage**: A relative change.

If approval rating goes from 40% to 44%:
- The increase is **4 percentage points** (arithmetic difference).
- The increase is **10%** (relative: 4/40 * 100 = 10%).

This distinction is crucial in financial reporting and political polling.

## Mental Math Shortcuts

- **10%**: Move decimal point one place left (500 * 10% = 50)
- **5%**: Half of 10% (500 * 5% = 25)
- **1%**: Move decimal point two places left (500 * 1% = 5)
- **20%**: Twice the 10% value (500 * 20% = 100)
- **25%**: Divide by 4 (500 * 25% = 125)
- **50%**: Divide by 2 (500 * 50% = 250)
- **75%**: 50% + 25% (500 * 75% = 375)

-> Try the [Percentage Calculator](/percentage-calculator)"""

articles['bmi-calculator-guide'] = """## What Is BMI?

BMI (Body Mass Index) is a numerical value calculated from a person's height and weight. It is a simple screening tool used by healthcare providers worldwide to categorize weight status and identify potential health risks. BMI was developed by Belgian mathematician Adolphe Quetelet in the 1830s and has been used clinically since the 1970s.

## The BMI Formula

```
BMI = weight (kg) / height (m)^2

Imperial formula:
BMI = (weight (lbs) / height (inches)^2) * 703
```

Examples:
```
Person: 70 kg, 1.75 m tall
BMI = 70 / (1.75)^2 = 70 / 3.0625 = 22.9

Person: 154 lbs, 5'9" (69 inches) tall
BMI = (154 / 69^2) * 703 = (154 / 4761) * 703 = 22.7
```

## BMI Categories (WHO)

| BMI Range | Category | Health Risk |
|---|---|---|
| Below 18.5 | Underweight | Possible nutritional deficiency, osteoporosis |
| 18.5 - 24.9 | Normal weight | Low health risk |
| 25.0 - 29.9 | Overweight | Moderate health risk |
| 30.0 - 34.9 | Obesity Class I | High health risk |
| 35.0 - 39.9 | Obesity Class II | Very high health risk |
| 40.0 and above | Obesity Class III | Extremely high health risk |

## BMI for Different Populations

### Adults (20+)
The standard WHO categories above apply. The same cutoffs apply to both men and women.

### Children and Teenagers (2-19)
BMI is interpreted differently for young people. Instead of fixed cutoffs, BMI percentile for age and sex is used:
- Below 5th percentile: Underweight
- 5th to below 85th percentile: Healthy weight
- 85th to below 95th percentile: Overweight
- 95th percentile and above: Obese

### Asian Populations
Research suggests that Asian populations have higher health risks at lower BMI values. Some health organizations use modified cutoffs:
- Overweight: BMI 23.0 and above
- Obese: BMI 27.5 and above

### Elderly (65+)
A slightly higher BMI (22-27) may be protective in older adults. Low BMI in elderly is associated with greater mortality risk than in younger adults.

## Limitations of BMI

BMI is a useful population-level screening tool but has significant limitations for individual assessment:

**Does not measure body fat directly**: A muscular athlete may have a high BMI (classified as overweight) while having low body fat. Conversely, a "normal" BMI person may have high body fat percentage.

**Doesn't account for fat distribution**: Visceral fat (around organs) is more dangerous than subcutaneous fat (under skin). Waist circumference is a better predictor of metabolic risk.

**Gender differences**: Women typically have more body fat than men at the same BMI.

**Ethnic variations**: Different ethnic groups have different relationships between BMI and health risks.

**Age variations**: Body composition changes with age even if BMI stays the same.

## Better Alternatives to BMI

For a more complete picture of health:

- **Waist circumference**: Risk threshold >88cm (35") for women, >102cm (40") for men
- **Waist-to-height ratio**: Waist circumference / Height. Values >0.5 indicate increased risk
- **Body fat percentage**: Measured by DEXA scan, hydrostatic weighing, or bioimpedance
- **Waist-to-hip ratio**: Measures fat distribution pattern

Despite its limitations, BMI remains the most widely used weight screening tool due to its simplicity and availability.

## Using This Tool

Enter your height and weight to instantly calculate your BMI and see where it falls in the standard categories. You can switch between metric (kg/cm) and imperial (lbs/inches) units.

-> Try the [BMI Calculator](/bmi-calculator)"""

articles['mortgage-calculator-guide'] = """## Understanding Mortgage Calculations

A mortgage is a loan used to purchase real estate, where the property itself serves as collateral. The borrower repays the loan in regular installments over a set term (typically 15-30 years). Understanding how mortgage payments are calculated helps borrowers make informed decisions about home purchases.

## The Mortgage Payment Formula

Monthly payment uses the amortization formula:

```
M = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
r = Monthly interest rate (annual rate / 12)
n = Total number of payments (years * 12)
```

Example: $300,000 loan at 7% annual rate for 30 years:
```
P = 300,000
r = 0.07 / 12 = 0.005833
n = 30 * 12 = 360

M = 300,000 * [0.005833 * (1.005833)^360] / [(1.005833)^360 - 1]
M = 300,000 * [0.005833 * 8.116] / [8.116 - 1]
M = 300,000 * [0.04734] / [7.116]
M = $1,996 per month
```

## Components of a Mortgage Payment (PITI)

Monthly mortgage payments typically include four components:

**Principal**: The portion that reduces your loan balance.

**Interest**: The cost of borrowing money. In early years, most of each payment is interest.

**Taxes**: Property taxes, usually collected by the lender and paid from an escrow account.

**Insurance**: Homeowner's insurance (and PMI if down payment is less than 20%).

## Amortization: How Payments Split Between Principal and Interest

In an amortizing mortgage, each payment's split between principal and interest changes over time:

```
$300,000 loan, 7% rate, 30 years, $1,996/month payment

Payment 1:   Interest = $1,750   Principal = $246    Balance = $299,754
Payment 12:  Interest = $1,738   Principal = $258    Balance = $296,893
Payment 60:  Interest = $1,667   Principal = $329    Balance = $285,720
Payment 180: Interest = $1,428   Principal = $568    Balance = $244,140
Payment 300: Interest = $741     Principal = $1,255  Balance = $125,952
Payment 360: Interest = $12      Principal = $1,984  Balance = $0
```

In the early years, the vast majority of your payment is interest. This is why building home equity is slow initially.

## Total Interest Paid

```
$300,000 loan at 7% for 30 years:
Total payments = $1,996 * 360 = $718,560
Total interest paid = $718,560 - $300,000 = $418,560

Same loan at 30 years vs 15 years:
30-year payment: $1,996/month  Total interest: $418,560
15-year payment: $2,696/month  Total interest: $185,280
Savings: $233,280 (by paying $700/month more)
```

## Key Factors Affecting Mortgage Cost

### Interest Rate
The single biggest factor. Even a small rate difference has large impact over 30 years:

| Rate | Monthly Payment | Total Interest (30yr, $300k) |
|---|---|---|
| 5.0% | $1,610 | $279,600 |
| 6.0% | $1,799 | $347,640 |
| 7.0% | $1,996 | $418,560 |
| 8.0% | $2,201 | $492,360 |

### Loan Term
Shorter terms mean higher monthly payments but much less total interest.

### Down Payment
Larger down payment means smaller loan, lower monthly payment, and avoidance of PMI (Private Mortgage Insurance, required when down payment is below 20%).

## Down Payment and PMI

PMI (Private Mortgage Insurance) protects the lender if you default. It typically costs 0.5%-1.5% of the loan amount annually (added to monthly payment) until you reach 20% equity.

Example: $300,000 home with 5% down:
- Loan: $285,000
- PMI rate: 0.8%/year
- Monthly PMI: $285,000 * 0.008 / 12 = $190/month extra

PMI is automatically removed once you reach 22% equity based on original value (in the US under the Homeowners Protection Act).

## Fixed vs. Adjustable Rate

**Fixed-rate mortgage**: Interest rate stays the same for the entire loan term. Predictable payments, protection against rising rates.

**Adjustable-rate mortgage (ARM)**: Rate is fixed for an initial period (5, 7, or 10 years), then adjusts annually based on a market index. Usually starts lower than fixed rates but carries rate risk.

## Using This Tool

Enter your loan amount, interest rate, and term to instantly see your monthly payment, total interest paid, and a complete amortization schedule showing how your balance decreases over time.

-> Try the [Mortgage Calculator](/mortgage-calculator)"""

articles['math-evaluator-guide'] = """## Online Math Expression Evaluator

A math expression evaluator allows you to calculate complex mathematical expressions directly in your browser without installing any software. This tool supports arithmetic operations, mathematical functions, constants, and variables.

## Supported Operations

### Basic Arithmetic
```
2 + 3 = 5
10 - 4 = 6
6 * 7 = 42
15 / 4 = 3.75
15 % 4 = 3     (modulo/remainder)
2 ^ 10 = 1024  (exponentiation)
2 ** 10 = 1024 (alternative exponentiation)
```

### Order of Operations
Standard mathematical order applies (PEMDAS/BODMAS):
```
2 + 3 * 4 = 14        (not 20 - multiplication first)
(2 + 3) * 4 = 20      (parentheses override)
2^3 + 1 = 9           (exponentiation before addition)
```

### Mathematical Functions
```
sqrt(16) = 4
sqrt(2) = 1.4142135...
cbrt(27) = 3           (cube root)
abs(-5) = 5            (absolute value)
ceil(3.2) = 4          (ceiling)
floor(3.8) = 3         (floor)
round(3.5) = 4         (rounding)
min(3, 1, 4) = 1
max(3, 1, 4) = 4
log(100) = 2           (log base 10)
log(1000) = 3
ln(e) = 1              (natural log)
exp(1) = e = 2.71828...
```

### Trigonometric Functions
```
sin(PI/6) = 0.5        (30 degrees in radians)
cos(0) = 1
tan(PI/4) = 1          (45 degrees)
asin(1) = PI/2         (inverse sine)
acos(1) = 0
atan(1) = PI/4
atan2(1, 1) = PI/4     (2-argument arctangent)
```

### Constants
```
PI = 3.14159265358979...
E = 2.71828182845904...
phi = 1.61803398875...   (golden ratio)
Infinity = Infinity
```

## Unit Conversion Expressions

Many math evaluators support unit-aware calculations:

```
5 feet in meters
60 mph in km/h
100 celsius in fahrenheit
1000 grams in pounds
```

## Practical Use Cases

### Engineering and Science
Quick calculations without opening a spreadsheet:
```
sqrt(3^2 + 4^2) = 5    (Pythagorean theorem)
2 * PI * 7 = 43.98     (circumference of circle r=7)
0.5 * 9.8 * 5^2 = 122.5 (kinetic energy: distance fallen in 5s)
```

### Finance and Statistics
```
1000 * (1.05)^10 = 1628.89   (compound interest)
log(1000) / log(2) = 9.97    (how many doublings to reach 1000)
```

### Programming
Verify calculations from code:
```
255 * 100 / 1000 = 25.5
(255 & 0xF0) = 240    (bitwise operations if supported)
```

## Handling Common Math Errors

Division by zero: The evaluator returns Infinity or an error message.

Square root of negative numbers: Returns NaN (Not a Number) in standard mode. Some evaluators support complex numbers.

Very large numbers: May switch to scientific notation. 10^100 is a googol.

Floating point precision: JavaScript uses 64-bit floating point, so 0.1 + 0.2 = 0.30000000000000004. This is normal behavior for floating-point arithmetic, not a bug.

## Using This Tool

Enter any mathematical expression and press Enter or click Calculate to see the result instantly. The evaluator supports all standard math functions, constants, and operators. Calculations happen locally in your browser - no server requests.

-> Try the [Math Evaluator](/math-evaluator)"""

articles['eta-calculator-guide'] = """## What Is an ETA Calculator?

ETA (Estimated Time of Arrival) refers to the predicted time when a person, vehicle, or process will arrive at a destination or complete a task. An ETA calculator computes this arrival time based on the current time, distance, and speed, or based on work completed and remaining.

## Travel ETA Calculation

The basic formula for travel time:

```
Travel Time = Distance / Speed
Arrival Time = Departure Time + Travel Time
```

Examples:
```
Distance: 250 miles, Speed: 65 mph
Travel time = 250 / 65 = 3.85 hours = 3 hours 51 minutes
If departure is 9:00 AM, ETA = 12:51 PM

Distance: 480 km, Speed: 120 km/h
Travel time = 480 / 120 = 4 hours
```

## Progress-Based ETA (Task Completion)

For ongoing tasks, ETA can be estimated from the completion rate:

```
Elapsed Time = Current Time - Start Time
Progress = Items Done / Total Items
Rate = Items Done / Elapsed Time
Remaining = Total Items - Items Done
Time Left = Remaining / Rate
ETA = Current Time + Time Left
```

Example:
```
Started: 2:00 PM
Current time: 2:30 PM (30 minutes elapsed)
Items done: 150 out of 500 total
Rate = 150 / 30 = 5 items per minute
Remaining = 500 - 150 = 350 items
Time left = 350 / 5 = 70 minutes
ETA = 2:30 PM + 70 min = 3:40 PM
```

## Progress Percentage and Remaining Time

```
Percent complete = (Items Done / Total) * 100
Percent remaining = 100 - Percent complete

Time for 1%: Elapsed Time / Percent Complete
Total time estimate: Time for 1% * 100
Time remaining: Total estimate - Elapsed time
```

## ETA in Software Development

In programming contexts, ETA calculators are used for:

**File downloads and uploads**: Show users how long a transfer will take based on current transfer rate.

**Data processing jobs**: Estimate when a database migration or data pipeline will complete.

**Build systems**: Show estimated completion time for CI/CD pipelines.

**Progress bars**: Display estimated time remaining alongside visual progress.

```javascript
// Simple ETA calculation in JavaScript
function calculateETA(total, done, startTime) {
  const now = Date.now();
  const elapsed = (now - startTime) / 1000; // seconds
  const rate = done / elapsed; // items per second
  const remaining = total - done;
  const timeLeft = remaining / rate; // seconds
  const eta = new Date(now + timeLeft * 1000);
  
  return {
    percentComplete: (done / total * 100).toFixed(1),
    timeRemainingSeconds: timeLeft,
    eta: eta.toLocaleTimeString()
  };
}
```

## Factors Affecting ETA Accuracy

### Variable Speed
Travel ETAs assume constant speed, but real travel involves acceleration, deceleration, traffic, stops, and rest breaks. Navigation apps use real-time traffic data to improve accuracy.

### Variable Processing Rate
Task ETAs assume constant processing rate, but rates can change over time (processing faster as caches warm up, slower as disk fills up, etc.). Exponential moving averages can smooth out rate fluctuations.

### Unknown Unknowns
Detours, accidents, task complications, and system failures are unpredictable. Build buffer time into ETAs for critical deadlines.

## Real-World ETA Applications

Navigation systems (Google Maps, Waze) combine historical traffic patterns, real-time data, and machine learning to predict travel time with reasonable accuracy.

Package tracking systems calculate estimated delivery based on the package's current location and standard transit times between facilities.

Construction and project management tools use earned value management (EVM) to project completion dates based on work performed versus planned.

## Using This Tool

Enter your departure time, distance, and average speed (or current progress and completion rate) to instantly calculate your estimated arrival or completion time. The tool handles unit conversions and time zone calculations automatically.

-> Try the [ETA Calculator](/eta-calculator)"""

articles['lorem-ipsum-guide'] = """## What Is Lorem Ipsum?

Lorem ipsum is placeholder text commonly used in graphic design, publishing, and web development to fill space before the final content is available. It allows designers and developers to focus on visual layout without being distracted by readable content.

The standard lorem ipsum text begins: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." and has been used as dummy text in typesetting since the 1500s.

## The Origin of Lorem Ipsum

Lorem ipsum comes from Cicero's philosophical work "De Finibus Bonorum et Malorum" (On the Ends of Good and Evil), written in 45 BC. The original Latin passage reads:

"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."

Translation: "Nor is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure some great pleasure..."

The lorem ipsum version is a scrambled, altered version of this text. Richard McClintock, a Latin professor at Hampden-Sydney College, traced the origin in 1994 and confirmed it dates back to Cicero. The text became popularized in the 1960s when Letraset published sheets of lorem ipsum for dry-transfer lettering.

## Why Use Lorem Ipsum?

### Prevents Content Distraction
Human brains are wired to read text, not analyze layout. When reviewing a design, readable content draws attention to what it says rather than how it looks. Lorem ipsum lets viewers evaluate typography, whitespace, and visual hierarchy without getting caught up in content.

### Provides Realistic Text Length
"This is placeholder text" doesn't approximate realistic paragraph lengths. Lorem ipsum generates natural-looking blocks of text that simulate real content density.

### Universal Convention
Lorem ipsum is universally recognized as placeholder text. Seeing it signals to stakeholders that content is not finalized, preventing premature feedback on wording.

## Alternative Placeholder Text Options

### Cupcake Ipsum
Food-themed placeholder text: "Cupcake ipsum dolor sit amet. Sesame snaps chocolate bar cake pastry..."
Good for food-related projects or when clients need something lighter than Latin.

### Corporate Ipsum
Business jargon filler: "Leverage agile frameworks to provide robust synopses for high level overviews..."
Useful for corporate and business applications.

### Hipster Ipsum  
Trendy placeholder text: "Artisan before they sold out vice, vinyl butcher brooklyn..."
For creative and lifestyle brands.

### Blind Text
Pure visual placeholder without the Latin appearance, useful when clients might be confused by Lorem ipsum.

### Actual Content
For user research and final design reviews, real content (even draft content) is always better than placeholder text.

## Generating Lorem Ipsum Programmatically

```python
# Using the lorem package in Python
import lorem

# Generate a paragraph
paragraph = lorem.paragraph()

# Generate a sentence
sentence = lorem.sentence()

# Generate n words
words = lorem.words(10)
```

```javascript
// Using lorem-ipsum npm package
const LoremIpsum = require('lorem-ipsum').LoremIpsum;
const lorem = new LoremIpsum({
  wordsPerSentence: { max: 16, min: 4 },
  sentencesPerParagraph: { max: 8, min: 4 }
});

const text = lorem.generateParagraphs(3);
```

## Standard Lorem Ipsum Paragraphs

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
```

## Using This Tool

Choose the number of paragraphs, sentences, or words you need. Select options like whether to start with "Lorem ipsum" and the language style (classical Latin, modern Lorem ipsum variants). Copy the generated text with one click.

-> Try the [Lorem Ipsum Generator](/lorem-ipsum-generator)"""

articles['text-diff-guide'] = """## What Is Text Diffing?

Text diffing (differencing) is the process of comparing two versions of text to identify what has changed between them. The term comes from the Unix `diff` command, which has been a fundamental developer tool since 1974.

Text diff is used in version control systems (git diff), code review tools, wiki pages, document collaboration, and any context where tracking changes over time matters.

## How Diff Algorithms Work

### The Longest Common Subsequence (LCS)

The foundation of most diff algorithms is finding the Longest Common Subsequence (LCS) - the longest sequence of elements that appear in both texts in the same relative order (but not necessarily contiguous).

For two strings "ABCDE" and "ACBDE":
- LCS is "ABDE" (length 4)
- The diff shows: A is same, C is inserted, B is same, C is deleted, D and E are same

### Myers Diff Algorithm

The Myers diff algorithm (1986), used by Git and many other tools, efficiently finds the shortest edit script (minimum number of insertions and deletions) to transform one text into another. It runs in O(ND) time where N is text length and D is the number of differences.

### Word-Level vs. Line-Level vs. Character-Level

Different granularities serve different purposes:

**Line-level diff**: Standard for source code (shows entire modified lines). Best for code review.

**Word-level diff**: Shows which specific words changed within a line. Better for prose editing.

**Character-level diff**: Shows exact characters that changed. Best for detecting typos or small modifications.

## Unified Diff Format

The standard unified diff format (used by `git diff`):

```diff
--- a/original.txt
+++ b/modified.txt
@@ -10,7 +10,8 @@
 Context line (unchanged)
 Context line (unchanged)
-Deleted line
+New replacement line
+Another added line
 Context line (unchanged)
```

Line indicators:
- ` ` (space): Unchanged context line
- `-`: Removed in new version
- `+`: Added in new version
- `@@`: Hunk header showing line numbers

## Three-Way Merge

When merging changes from two branches, a three-way merge compares:
1. The original base version
2. Version A (your changes)
3. Version B (their changes)

Changes are classified as:
- **Non-conflicting**: Only one side modified the text - automatically merged
- **Conflicting**: Both sides modified the same area - requires manual resolution

Git marks conflicts like:
```
<<<<<<< HEAD
Your version of the code
=======
Their version of the code
>>>>>>> feature-branch
```

## Practical Applications

### Code Review
Before merging a pull request, developers review the diff to understand what changed, why, and whether there are any issues.

### Documentation
Wikis and document management systems (Confluence, Google Docs revision history) show diffs between versions.

### Configuration Management
Infrastructure teams diff configuration files before deploying changes to production.

### Legal and Academic
Contract amendments and paper revisions track exactly what changed between versions.

## Using Diff Tools

**Command line:**
```bash
diff original.txt modified.txt
diff -u original.txt modified.txt  # Unified format
git diff HEAD~1                    # Changes since last commit
git diff main feature-branch       # Between branches
```

**Code editors:** VS Code, Sublime, IntelliJ all have built-in diff viewers.

**Online tools:** For quick comparisons without installing software.

## Using This Tool

Paste two versions of text in the left and right panels. The tool highlights additions (green), deletions (red), and unchanged text with configurable comparison modes (characters, words, or lines).

-> Try the [Text Diff Tool](/text-diff)"""

articles['emoji-picker-guide'] = """## What Are Emoji?

Emoji (from Japanese 絵文字: 絵 "picture" + 文字 "character") are pictographic symbols used in digital communication. What started as a set of 176 icons on Japanese mobile phones in 1999 has grown to over 3,700 emoji standardized by the Unicode Consortium.

Today, emoji appear in messaging apps, social media, emails, code comments, commit messages, documentation, and even programming language identifiers in some languages.

## Emoji in Unicode

Each emoji is one or more Unicode code points. Modern emoji use code points in the U+1F000-U+1FFFF range (Supplementary Multilingual Plane) and are often composed of multiple code points:

```
😀 = U+1F600 (GRINNING FACE)
👨‍💻 = U+1F468 + U+200D + U+1F4BB
      (MAN + ZERO WIDTH JOINER + PERSONAL COMPUTER)
```

The Zero Width Joiner (ZWJ, U+200D) combines emoji into sequences. This is how family emoji and profession emoji with different skin tones are created.

## Emoji Categories

**Smileys & Emotion**: 😀 😂 🥺 😍 😭 🤣 😊 😎
**People & Body**: 👋 👍 🤝 💪 🫶 👀 🙏
**Animals & Nature**: 🐈 🐕 🦊 🌈 🌸 🍀 🌙
**Food & Drink**: 🍕 🍣 🍎 🍺 ☕ 🎂
**Travel & Places**: 🏠 🌍 ✈️ 🗼 🌋
**Activities**: ⚽ 🎮 🎸 📚 🎨 🎯
**Objects**: 💻 📱 🔑 🎁 💡 🔒
**Symbols**: ❤️ ✅ ❌ ⚠️ 🔴 🟢 🔵
**Flags**: 🇺🇸 🇬🇧 🇯🇵 🇩🇪 🇨🇳

## Skin Tone Modifiers

Many human emoji support five skin tone modifiers (added after the base emoji):

```
👍 (default/yellow)
👍🏻 U+1F44D + U+1F3FB (light skin)
👍🏼 U+1F44D + U+1F3FC (medium-light skin)
👍🏽 U+1F44D + U+1F3FD (medium skin)
👍🏾 U+1F44D + U+1F3FE (medium-dark skin)
👍🏿 U+1F44D + U+1F3FF (dark skin)
```

## Emoji in Programming

### Commit Messages
Many teams use emoji prefixes in commit messages to categorize changes:
```
✨ feat: add user authentication
🐛 fix: correct null pointer exception
📝 docs: update README
🎨 style: format code with prettier
♻️ refactor: extract auth logic to service
⚡ perf: cache database queries
🧪 test: add unit tests for user service
🔧 chore: update dependencies
```

This convention (often called "gitmoji") makes commit history visually scannable.

### Variable Names (Some Languages)
Some programming languages allow emoji in identifiers:
```swift
// Swift allows emoji in variable names
let 🐱 = "cat"
var 💰 = 1000.0
```

### Text Content
Emoji appear in UI strings, database records, and API responses. Handle them carefully:

```javascript
// Emoji length in JavaScript (surrogate pairs!)
"😀".length    // 2 (not 1! - surrogate pair)
[..."😀"].length  // 1 (spread to get visual length)

// Python 3 handles emoji correctly
len("😀")  # 1
```

## Emoji vs Text: Rendering Differences

The visual appearance of emoji varies across platforms. Apple, Google, Microsoft, Samsung, Twitter, and Facebook all have different emoji designs for the same Unicode code points. The 😅 emoji looks slightly different on iOS vs Android, for example. This can affect how your intended message is perceived.

## Encoding Considerations

When working with emoji in databases and APIs:
- MySQL: Use `utf8mb4` character set (not `utf8`, which only supports 3-byte characters)
- PostgreSQL: Standard UTF-8 supports emoji natively
- URLs: Emoji must be percent-encoded (`%F0%9F%98%80`)
- JSON: Emoji work natively in JSON strings (they're valid Unicode)

## Using This Tool

Browse all emoji organized by category, search by name or keyword, and click any emoji to copy it to your clipboard. Filter by skin tone, view Unicode code points and names, and find recently added emoji from the latest Unicode releases.

-> Try the [Emoji Picker](/emoji-picker)"""

# Apply all articles
def main():
    with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    updated = 0
    not_found = 0
    
    for slug, new_content in articles.items():
        new_file_content, success = update_article(content, slug, new_content)
        if success:
            content = new_file_content
            updated += 1
            print(f'✅ Updated: {slug}')
        else:
            not_found += 1
            print(f'❌ Not found: {slug}')
    
    with open(ARTICLES_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'\nDone: {updated} updated, {not_found} not found')

if __name__ == '__main__':
    main()
