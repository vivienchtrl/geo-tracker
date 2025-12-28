# 🎯 AI Monitoring Dashboard Refactor - Complete Action Plan

## 📊 Current State Analysis

### What You Have Now
- **Single "flat" dashboard** with global filters
- Users can only filter data (by date, keyword, model, competitor, bot type)
- All data updates on the same page
- No deep drill-down capability
- Limited context when analyzing data

### What You Want
- **Hierarchical 360° views** with drill-down capability:
  1. **Pages View** → Click page → See which prompts/models visited it + detailed metrics
  2. **Models View** → Click model → See all pages it accessed + prompts that triggered it
  3. **Prompts/Queries View** → Click prompt → See which pages were mentioned + which models used it
  4. **Bot Activity View** → Click bot → See pages crawled + timing + patterns

### Data Available (From Your Tables)

#### `aiSearch` Table
```typescript
- id, projectId, keywordId, query
- response (the full LLM response)
- modelUsed (the model family name, e.g., "GPT-4")
- urlsFound (array of results returned by LLM)
- isMentioned (boolean - was our site mentioned?)
- rank (our position in results)
- createdAt
```

#### `pageVisits` Table
```typescript
- id, projectId, eventType
- path, title, url, hash (our page details)
- referrer, referrerDomain (where traffic came from)
- visitorId (bot fingerprint)
- isBot, botName, botType (bot classification)
- userAgent, deviceType, osName, browserName, browserEngine
- countryCode, country, region, city (geolocation)
- pageLoadTime (CRITICAL - performance metric)
- metadata (extensible JSON)
- createdAt, date
```

---

## 🏗️ Architecture Design

### Current Structure
```
AIMonitoringPage
  └─ AIMonitoringProvider (filters only)
      └─ AIMonitoringDashboard (overview + filtered views)
          ├─ Filters
          ├─ KPI Cards
          ├─ Timeline Chart
          ├─ Models Chart
          ├─ Keywords Table
          ├─ Competitors Grid
          └─ Crawlers Activity
```

### New Structure (Hierarchical)
```
AIMonitoringPage
  ├─ Route: /ai-monitoring → Overview Dashboard (main hub)
  ├─ Route: /ai-monitoring/pages → Pages View (list + drill-down)
  │   └─ Route: /ai-monitoring/pages/[pageId] → Page Details
  │       ├─ Page metrics (visits, load time, crawlers)
  │       ├─ Prompts mentioning this page
  │       ├─ Models that accessed it
  │       └─ Timeline of bot activity
  │
  ├─ Route: /ai-monitoring/models → Models View (distribution + details)
  │   └─ Route: /ai-monitoring/models/[modelName] → Model Details
  │       ├─ Model metrics (total scans, mention rate)
  │       ├─ Pages this model accessed
  │       ├─ Queries/Prompts that triggered mentions
  │       └─ Timeline of mentions
  │
  ├─ Route: /ai-monitoring/prompts → Prompts/Queries View
  │   └─ Route: /ai-monitoring/prompts/[queryId] → Query Details
  │       ├─ Query/response content
  │       ├─ Pages mentioned in results
  │       ├─ Model used
  │       ├─ Our ranking
  │       └─ Competitors mentioned
  │
  └─ Route: /ai-monitoring/crawlers → Bot Activity View
      └─ Route: /ai-monitoring/crawlers/[botType] → Bot Type Details
          ├─ Bot behavior patterns
          ├─ Most crawled pages
          ├─ Visit frequency timeline
          └─ Device/OS breakdown
```

---

## 📋 Implementation Roadmap

### PHASE 1: Data Layer Enhancement
**Goal:** Ensure all necessary queries are available

#### 1.1 Backend Services (`src/backend/services/ai-monitoring.service.ts`)
Create these new functions:

```typescript
// PAGES RELATED
- getPageVisitsDetailedByPath(projectId, path, filters)
  Returns: { pageMetrics, botVisits, prompts_mentioning_this }

- getPagesByVisitCount(projectId, filters)
  Returns: Pages sorted by crawler visits + performance metrics

- getPageLoadTimeAnalysis(projectId, filters)
  Returns: Avg load time, percentiles, trends

// MODELS RELATED  
- getModelDetailedMetrics(projectId, modelName, filters)
  Returns: { scans, mentions, pages_visited, queries_used }

- getModelPageAccessPattern(projectId, modelName, filters)
  Returns: Pages this model accessed + frequency

// PROMPTS/QUERIES RELATED
- getPromptDetails(projectId, queryId)
  Returns: Full query + response + mentioned_pages + model + rank

- getPromptsByModel(projectId, modelName, filters)
  Returns: All queries using this model

- getQueriesMentioningPage(projectId, pageId, filters)
  Returns: All prompts/queries that mentioned this page

// BOTS RELATED
- getBotDetailedBehavior(projectId, botType, filters)
  Returns: Crawl pattern, timing, pages visited, patterns

- getBotPageAccessPattern(projectId, botType, filters)
  Returns: Which pages bots access most + frequency

- getBotTimingAnalysis(projectId, botType, filters)
  Returns: When bots visit, frequency, patterns
```

---

### PHASE 2: Type System (`src/types/dashboard.ts`)
Add these types:

```typescript
// PAGE VIEW TYPES
type PageMetricDetail = {
  path: string;
  title: string;
  visits: number; // Total bot visits
  avgLoadTime: number;
  visibilityInLLM: number; // % of LLM scans mentioning it
  topModels: string[];
  topBots: string[];
  createdAt: Date;
  lastVisit: Date;
};

type PageQueryDetail = {
  query: string;
  model: string;
  rank: number;
  mentioned: boolean;
  date: Date;
};

// MODEL VIEW TYPES
type ModelDetailMetric = {
  name: string;
  totalScans: number;
  mentions: number;
  mentionRate: number;
  avgRank: number;
  pagesVisited: number;
  uniqueQueries: number;
  timeline: TimelineEntry[];
  topPages: PageRef[];
  topCompetitors: CompetitorRef[];
};

// PROMPT/QUERY VIEW TYPES
type PromptDetailFull = {
  id: string;
  query: string;
  response: string;
  model: string;
  rank: number;
  mentioned: boolean;
  competitorsMentioned: string[];
  pagesMentioned: string[];
  date: Date;
};

// BOT VIEW TYPES
type BotBehaviorDetail = {
  type: string;
  names: string[];
  totalVisits: number;
  uniquePages: number;
  avgTimeOnSite: number; // From page load time
  visitTimes: Date[];
  topPages: string[];
  deviceDistribution: Record<string, number>;
  osList: string[];
  timingPattern: TimelineEntry[];
};
```

---

### PHASE 3: UI Structure

#### 3.1 New Routes
Create folder structure:
```
/src/app/dashboard/[projectId]/ai-monitoring/
├── page.tsx → Overview (hub - links to all views)
├── layout.tsx (existing)
│
├── pages/
│   ├── page.tsx → Pages list view
│   └── [pageId]/
│       └── page.tsx → Page detail view
│
├── models/
│   ├── page.tsx → Models breakdown view
│   └── [modelName]/
│       └── page.tsx → Model detail view
│
├── prompts/
│   ├── page.tsx → Queries/prompts list view
│   └── [queryId]/
│       └── page.tsx → Query detail view
│
└── crawlers/
    ├── page.tsx → Bot activity overview
    └── [botType]/
        └── page.tsx → Bot type detail view
```

#### 3.2 Component Refactor
```
/src/features/ai-monitoring/components/
├── (existing overview components)
│   ├── ai-monitoring-dashboard.tsx
│   ├── ai-monitoring-filters.tsx
│   ├── ai-monitoring-metrics.tsx
│   └── ...
│
├── pages/
│   ├── pages-list.tsx → Table of pages with metrics
│   └── page-detail-view.tsx → Full page analysis
│
├── models/
│   ├── models-overview.tsx → Distribution + selection
│   └── model-detail-view.tsx → Model deep dive
│
├── prompts/
│   ├── prompts-list.tsx → Table of queries
│   └── prompt-detail-view.tsx → Query full context
│
├── crawlers/
│   ├── crawler-overview.tsx → Bot types breakdown
│   └── crawler-detail-view.tsx → Specific bot analysis
│
└── shared/
    ├── detail-header.tsx → Reusable header for detail views
    ├── breadcrumbs.tsx → Navigation context
    └── related-data-card.tsx → Links between entities
```

---

### PHASE 4: Key Features per View

#### **PAGES VIEW** (`/ai-monitoring/pages`)
**List View:**
- Table: Path | Title | Bot Visits | Avg Load Time | Top Models | Top Bots | Visibility %
- Sort by: visits, load time, visibility
- Filter by: date range
- Click row → Page Detail

**Detail View** (`/ai-monitoring/pages/[pageId]`):
- Header: Page path + title + metrics
- **Card 1: Page Metrics**
  - Total visits, avg load time, last visit
  - Load time trend (chart)
  
- **Card 2: Bot Activity**
  - Timeline of bot visits to this page
  - Bot types breakdown (pie)
  - Recent visits table
  
- **Card 3: LLM Mentions**
  - Which prompts mentioned this page?
  - Table: Query | Model | Rank | Date
  - Click query → Query detail view
  
- **Card 4: Model Access Pattern**
  - Which models visited this page?
  - Bar chart: Model | Visit count
  - Click model → Model detail view
  
- **Card 5: Performance Analysis**
  - Load time percentiles
  - Device type impact on load time
  - Geographic impact on load time

---

#### **MODELS VIEW** (`/ai-monitoring/models`)
**List View:**
- Cards: Model name | Total scans | Mentions | Mention rate | Avg rank | Pages visited
- Click card → Model Detail

**Detail View** (`/ai-monitoring/models/[modelName]`):
- Header: Model name + aggregation info
- **Card 1: Metrics**
  - Total scans, mention rate, avg rank
  - Trend (7d, 30d comparison)
  
- **Card 2: Timeline**
  - When mentions happen (line chart)
  - Mention rate over time
  
- **Card 3: Pages Accessed**
  - Table: Page | Visits | Avg Load Time | Visibility
  - Sort by: visits, load time
  - Click page → Page detail view
  
- **Card 4: Queries Using This Model**
  - Table: Query | Rank | Mentioned | Competitors
  - Search/filter queries
  - Click query → Query detail view
  
- **Card 5: Competitor Comparison**
  - Who else appears when GPT searches?
  - Bar chart: Competitor | Frequency
  - Click competitor → See competitive analysis

---

#### **PROMPTS/QUERIES VIEW** (`/ai-monitoring/prompts`)
**List View:**
- Table: Query (truncated) | Model | Our Rank | Mentioned | Date
- Search: Full-text query search
- Filter by: model, mentioned status, date range
- Click row → Query Detail

**Detail View** (`/ai-monitoring/prompts/[queryId]`):
- Header: Full query text
- **Card 1: Response Context**
  - Full LLM response (read-only)
  - Model used, date
  
- **Card 2: Our Presence**
  - Was we mentioned? (YES/NO badge)
  - Our rank position
  - Our page(s) in results
  
- **Card 3: Pages Mentioned**
  - Table: Page path | Rank in results | Load time
  - Click page → Page detail view
  
- **Card 4: Competitors in Results**
  - Which competitors also appeared?
  - Table: Domain | Rank | Our rank vs theirs
  - Click competitor → Competitive analysis
  
- **Card 5: Similar Queries**
  - Other queries using same model
  - Same keyword
  - Related keywords

---

#### **CRAWLERS VIEW** (`/ai-monitoring/crawlers`)
**Overview:**
- Bot types grid: Card per bot type
- Metrics: Visits | Pages | Avg Visit Time | Top Page
- Click card → Bot Detail

**Detail View** (`/ai-monitoring/crawlers/[botType]`):
- Header: Bot type name + examples
- **Card 1: Activity Timeline**
  - Line chart: Visits over time
  - Shows crawl frequency pattern
  
- **Card 2: Pages Crawled**
  - Table: Page | Visit count | Avg load time | Last visit
  - Heatmap: Load time by page
  - Click page → Page detail view
  
- **Card 3: Performance Impact**
  - Avg page load time when bot visits
  - Load time distribution (histogram)
  - Device/OS breakdown
  
- **Card 4: Timing Patterns**
  - What times does bot visit? (timezone-based)
  - Visit frequency (hourly)
  - Predictability score
  
- **Card 5: Geographic Origins**
  - World map: Bot origins
  - Country breakdown
  - Correlation with crawl intensity

---

### PHASE 5: Navigation & UX

#### Main Overview Page (`/ai-monitoring`)
Acts as **HUB** with:
- Quick stats (KPIs from current view)
- 4 big cards linking to each view:
  - **📄 PAGES** → /pages (Top pages by bot visits)
  - **🤖 MODELS** → /models (Model distribution)
  - **💬 PROMPTS** → /prompts (Recent queries)
  - **🕷️ CRAWLERS** → /crawlers (Bot activity)
- Recent activity feed (latest queries, bot visits)
- Filters apply to all views (sticky)

#### Cross-View Navigation
Each detail view has:
- **Breadcrumbs:** AI Monitoring > Model > GPT > Model detail
- **Related Items Cards:** 
  - "Prompts using this model" (clickable list)
  - "Pages visited by this bot" (clickable list)
  - "Competitors mentioned with this" (clickable list)

---

## 📝 Implementation Steps

### Step 1: Backend Services (NEW FUNCTIONS)
```bash
1. Open src/backend/services/ai-monitoring.service.ts
2. Add ~15 new exported functions
3. Each uses unstable_cache with appropriate revalidation
4. Test each function with Drizzle Studio
```

### Step 2: Types Update
```bash
1. Open src/types/dashboard.ts
2. Add all new types (copy from PHASE 2)
3. Ensure no type conflicts
4. Export from index
```

### Step 3: Routes & Pages
```bash
1. Create folder structure (Step 3.1 above)
2. Each page is a Server Component initially
3. Page fetches data via Server Actions
4. Renders appropriate detail component
```

### Step 4: Components
```bash
1. Create component folders (Step 3.2)
2. Keep overview components as-is (reuse)
3. Add new detail components
4. Add shared utility components
5. Ensure all are typed with extracted types
```

### Step 5: Testing & Polish
```bash
1. Test each route loads correctly
2. Test data relationship links (click page → see model → click model)
3. Test filters work across all views
4. Verify responsive design
5. Check linting & type safety
```

---

## 🎯 Quick Implementation Check

**Before you start coding, verify:**
- [ ] Do I understand the 3-level drill-down? (List → Detail → Related)
- [ ] Do I have all required data in tables? (YES - both tables have everything)
- [ ] Am I clear on the route structure? (7 main routes, each with children)
- [ ] Do I know how to extract model names consistently? (extractBaseModelName function exists)
- [ ] Am I ready to create 15+ service functions? (Should be ~50 lines each)

---

## 🚀 Estimated Effort

| Phase | Time | Complexity |
|-------|------|-----------|
| 1. Backend services | 4-6 hours | Medium (DB queries) |
| 2. Types | 1-2 hours | Low (just typing) |
| 3. Routes & pages | 3-4 hours | Medium (routing + layouts) |
| 4. Components | 8-10 hours | High (UI + interactions) |
| 5. Testing | 2-3 hours | Medium (QA) |
| **TOTAL** | **18-25 hours** | - |

---

## 🔑 Key Principles for Refactor

1. **Never break existing overview** → Keep current dashboard as fallback
2. **Reuse data queries** → Don't fetch twice
3. **Type everything** → No `any` types
4. **Performance first** → Cache aggressively
5. **Clear navigation** → Users know where they are
6. **Mobile responsive** → All detail views work on mobile
7. **Linked data** → Clicking between entities is seamless

---

**Ready to implement? Start with Phase 1 (Backend)!**

