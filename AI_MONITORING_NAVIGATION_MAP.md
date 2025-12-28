# 🗺️ AI Monitoring Navigation Map - Visual Guide

## User Journey: Deep Dive Example

### Scenario: "Why is my /products page getting crawled?"

```
User starts here:
┌─────────────────────────────────────────┐
│  AI Intelligence Monitoring (Overview)  │
│                                         │
│  ┌────────────┬────────────┬──────────┐ │
│  │   PAGES    │   MODELS   │ PROMPTS  │ │
│  │   📄       │   🤖       │   💬     │ │
│  └────────────┴────────────┴──────────┘ │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Recent Activity Feed            │   │
│  │  - GPT visited /products (2h)    │   │
│  │  - Claude mentioned us in query  │   │
│  │  - Perplexity accessed /blog     │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
        User clicks: PAGES card
                    ↓
┌────────────────────────────────────────────┐
│  Pages List View                           │
│                                            │
│  Path              │ Visits │ Load Time   │
│  ─────────────────────────────────────── │
│  /products         │  342   │   145ms     │ ← User clicks row
│  /blog             │  234   │    98ms     │
│  /docs/api         │  156   │   234ms     │
│  /pricing          │   89   │    76ms     │
│  /about            │   45   │    55ms     │
└────────────────────────────────────────────┘
                    ↓
        Page Detail View: /products
                    ↓
┌────────────────────────────────────────────┐
│ /products                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Page Metrics                         │  │
│ │ • Total bot visits: 342              │  │
│ │ • Avg load time: 145ms               │  │
│ │ • Last visit: 2 hours ago            │  │
│ │ • Visibility in LLM: 67%             │  │
│ │ • Top bots: GPT (156), Claude (98)   │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Bots Visiting This Page (Timeline)  │  │
│ │                                      │  │
│ │ GPT:     ━━━━━━━━━━━━━━━━━ 156 hits │  │
│ │ Claude:  ━━━━━━━━━━ 98 hits         │  │
│ │ Google:  ━━━━━━━━ 78 hits           │  │
│ │ Bing:    ━━━━ 42 hits               │  │
│ │ Apple:   ━━ 18 hits                 │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ LLM Queries Mentioning /products     │  │
│ │ (Related prompts)                    │  │
│ │                                      │  │
│ │ "best AI products on market"         │  │
│ │  → Model: GPT-4 | Rank: #2 | ✓ Us    │ ← Click to see query
│ │                                      │  │
│ │ "top AI tools for development"       │  │
│ │  → Model: Claude | Rank: #1 | ✓ Us   │  │
│ │                                      │  │
│ │ "AI SaaS platforms comparison"       │  │
│ │  → Model: Perplexity | Rank: #3 | ✓ │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Models Accessing This Page           │  │
│ │ (With link to model detail)          │  │
│ │                                      │  │
│ │ GPT      ████████████ 156 visits     │ ← Click model
│ │ Claude   ███████ 98 visits           │
│ │ Perp.    █████ 45 visits             │  │
│ │ Gemini   ███ 23 visits               │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Performance Analysis                 │  │
│ │ Load Time Trend (7d)                 │  │
│ │                                      │  │
│ │   150ms ┤     ╱╲     ╱╲              │  │
│ │   120ms ├ ╱╲ ╱  ╲   ╱  ╲             │  │
│ │    90ms ├╱  ╲    ╲╱    ╲             │  │
│ │         └──────────────────           │  │
│ │           Mon Tue Wed Thu Fri        │  │
│ └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## Cross-Entity Navigation

### From Page → Query Detail
```
In page detail, user sees:
┌─────────────────────────────────────┐
│ LLM Query: "best AI products"        │
│ → Model: GPT-4 | Rank: #2 | ✓       │
└─────────────────────────────────────┘
           (User clicks)
                 ↓
    /prompts/[query-id]
                 ↓
┌──────────────────────────────────────┐
│ Query Detail View                    │
│                                      │
│ "best AI products on the market"     │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Response (from GPT)              │ │
│ │ ───────────────────────────────  │ │
│ │ "Based on latest trends, the     │ │
│ │  top products are:               │ │
│ │  1. Your Company (#2) - Best     │ │
│ │  2. Competitor A (#1)            │ │
│ │  3. Competitor B (#3)"           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Our Ranking                      │ │
│ │ ✓ We are mentioned!              │ │
│ │ Position: #2                     │ │
│ │ Page: /products                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Competitors in Results           │ │
│ │ #1 competitor-a.com             │ │
│ │ #3 competitor-b.com             │ │
│ │ #4 startup-c.io                 │ │
│ │ ↓ Click to see competitive info  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### From Query → Model Detail
```
User clicks: "Model: GPT-4"
                 ↓
    /models/GPT
                 ↓
┌──────────────────────────────────────┐
│ Model: GPT                           │
│ (All GPT versions aggregated)        │
│                                      │
│ Metrics:                             │
│ • Total scans: 1,234                 │
│ • Our mentions: 823 (66.7%)          │
│ • Avg rank: 2.3                      │
│ • Pages it visited: 23               │
│ • Unique queries: 156                │
│                                      │
│ Timeline (7 days):                   │
│ Mon: 145 scans | 96 mentions         │
│ Tue: 156 scans | 104 mentions        │
│ Wed: 142 scans | 95 mentions         │
│ Thu: 178 scans | 118 mentions ↑      │
│ Fri: 165 scans | 110 mentions        │
│                                      │
│ Pages GPT Visited:                   │
│ /products     (156 visits)           │
│ /blog         (98 visits)            │ ← Click to see page detail
│ /docs/api     (67 visits)            │
│ /pricing      (34 visits)            │
│ /about        (21 visits)            │
│                                      │
│ Recent Queries:                      │
│ "best AI products" (Rank #2) ✓       │
│ "AI SaaS comparison" (Rank #1) ✓     │ ← Click to see query
│ "top AI tools" (Rank #3) ✓           │
│ "AI development platforms" (#2) ✓    │
└──────────────────────────────────────┘
```

---

## Bot-Centric Analysis

### From Overview → Crawlers

```
┌─────────────────────────────────────┐
│  Crawlers (Overview)                │
│                                     │
│  ┌──────────────┐  ┌──────────────┐ │
│  │  GPT         │  │  Claude      │ │
│  │  342 visits  │  │  189 visits  │ │
│  │  23 pages    │  │  18 pages    │ │
│  │  Click →     │  │  Click →     │ │
│  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐ │
│  │  Google      │  │  Bing        │ │
│  │  445 visits  │  │  234 visits  │ │
│  │  67 pages    │  │  45 pages    │ │
│  │  Click →     │  │  Click →     │ │
│  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
           ↓ Click GPT
           ↓
┌──────────────────────────────────────┐
│ Bot: GPT Crawler                     │
│ (Also GPTBot, Claude-Web, etc.)      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Crawler Stats                    │ │
│ │ Total visits: 342                │ │
│ │ Unique pages: 23                 │ │
│ │ Avg page load: 145ms             │ │
│ │ Last visit: 2 hours ago          │ │
│ │ Most active time: 2-4 PM EST     │ │
│ │ Geographic origin: US (78%)      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Visit Timeline (7d)              │ │
│ │  Mon: ████████ 42 visits         │ │
│ │  Tue: ███████████ 58 visits      │ │
│ │  Wed: █████████ 48 visits        │ │
│ │  Thu: ██████████████ 72 visits ↑ │ │
│ │  Fri: ███████████ 55 visits      │ │
│ │  Sat: ██████ 34 visits           │ │
│ │  Sun: ███ 21 visits              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Pages This Bot Accesses          │ │
│ │ (Heatmap: darker = more visits)  │ │
│ │                                  │ │
│ │ 🔴 /products     (156 visits)    │ │
│ │ 🟠 /blog         (98 visits)     │ │
│ │ 🟠 /docs/api     (67 visits)     │ │
│ │ 🟡 /pricing      (15 visits)     │ │
│ │ 🟡 /about        (6 visits)      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Performance Impact               │ │
│ │ When bot visits:  145ms avg      │ │
│ │ Normal traffic:   98ms avg       │ │
│ │ Performance delta: +47ms ⚠       │ │
│ │ (Consider optimization!)         │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Data Relationships Visualized

```
                    AI Search Record
                    ┌──────────────────────────────┐
                    │ Query: "best AI tools"       │
                    │ Model: GPT-4-Turbo           │
                    │ Rank: #2                     │
                    │ Mentioned: YES               │
                    │ Date: 2025-12-22             │
                    └──────────────────────────────┘
                     /      |       \        \
                    /       |        \        \
        (Page Mentioned)   |    (Competitors)  (Bot Accessed)
                  /        |           \           \
                 /         |            \           \
                ↓          ↓             ↓            ↓
        ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
        │/products   │  │ Model    │  │Competitors│  │PageVisit   │
        │(our page)  │  │ GPT      │  │acme.com   │  │from GPT    │
        │            │  │ (67 uses)│  │(mentioned)│  │(341 visits)│
        └────────────┘  └──────────┘  └──────────┘  └────────────┘
              ↓                ↓            ↓             ↓
        Show: Load time   Show: All     Show: Ranking  Show: Pages
              Crawlers    queries from  Position       crawled,
              visiting    GPT                         timing,
              this page                               patterns
```

---

## Filter Flow (Global Across Views)

```
All views share these filters:
┌────────────────────────────────────────┐
│ 📅 Date Range: [7d ▼]                  │
│ 🔑 Keyword: [All ▼]                    │
│ 🤖 Model: [All ▼]                      │
│ 🏢 Competitor: [All ▼]                 │
│ 🕷️ Bot Type: [All ▼]                   │
│ [Clear All Filters]                    │
└────────────────────────────────────────┘
           Applied to:
   ┌────────────────────────┐
   │ • Pages view (filters list)
   │ • Models view (changes metrics)
   │ • Prompts view (filters queries)
   │ • Crawlers view (filters bots)
   │ • Overview (changes KPIs)
   └────────────────────────┘
```

---

## Mobile Navigation

```
┌──────────────────────────────┐
│ ≡ Menu                       │
│ AI Intelligence Monitoring   │
├──────────────────────────────┤
│                              │
│ [Overview]                   │
│                              │
│ Quick Links:                 │
│ ┌────────────────────────────┐
│ │📄 Pages (15 pages)         │
│ └────────────────────────────┘
│ ┌────────────────────────────┐
│ │🤖 Models (5 families)      │
│ └────────────────────────────┘
│ ┌────────────────────────────┐
│ │💬 Prompts (342 queries)    │
│ └────────────────────────────┘
│ ┌────────────────────────────┐
│ │🕷️ Crawlers (6 types)       │
│ └────────────────────────────┘
│                              │
│ Filters (Collapsible):       │
│ ▶ Date Range                 │
│ ▶ Keyword                    │
│ ▶ Model                      │
│                              │
└──────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────┐
│ AI Search + Page Visit Tables   │
└──────────────────────────────────┘
                ↓
     (Parallel Server Actions)
     ↙         ↓        ↘         ↘
    /          /          \         \
   /          /            \         \
  ↓          ↓              ↓         ↓
[Get Pages] [Get Models]  [Get Queries] [Get Bots]
   │          │             │         │
   │ (Sort)   │ (Aggregate) │(Filter) │ (Classify)
   │          │             │         │
   ↓          ↓              ↓         ↓
 List View  List View    List View   List View
   │          │             │         │
   └──────────┴─────────────┴─────────┘
              (Each clickable)
              ↓
         Detail Component
              ↓
    Shows related entities
    (Links back to other views)
```

---

**Key Insight:** Every view is interconnected. Clicking an item in one view navigates to its detail, which shows related items from other views as clickable links!

