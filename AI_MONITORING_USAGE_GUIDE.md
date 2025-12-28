# 🚀 AI Monitoring Dashboard - Usage Guide

## Quick Start

### **Access the Dashboard**
1. Open Geo Tracker dashboard
2. Select a project
3. Click **"AI Monitoring"** in the left sidebar (new link added between Overview and AI Copilot)
4. ✨ Dashboard loads with instant data!

---

## 📊 Dashboard Sections

### **1. KPI Metrics** (Top Bar)
Six key performance indicators updating in real-time:

```
┌──────────┬──────────┬────────────┬───────────┬──────────────┬────────────┐
│  Scans   │ Mentions │ Visibility │ Avg Rank  │ Bot Activity │ Top Competitor
│  Total   │ Count    │ Rate (%)   │ Position  │ Count        │ Domain
└──────────┴──────────┴────────────┴───────────┴──────────────┴────────────┘
```

**Example**: 342 scans | 127 mentions | 37.1% visibility | Rank 2.3 | 1,245 bot visits | acme.com (89)

### **2. Filters** (Second Row)
Control what data you see - **instant updates, no page reload!**

```
Date Range | Keywords ▼ | Models ▼ | Competitors ▼ | Bot Type ▼ | [Clear Filters]
```

**Examples:**
- Select **"7 days"** → Data updates instantly
- Select keyword **"AI Analytics"** → See only mentions for that keyword
- Select model **"GPT"** → See all GPT mentions (3.5, 4.0, 4-Turbo grouped together!)
- Select bot **"Claude"** → See Claude crawler activity

### **3. Mention Timeline** (Main Chart - 60% width)
Visual timeline of when your site is mentioned in LLM searches.

**Visual Elements:**
- Blue bars = Mentioned times
- Gray bars = Total scans (including non-mentions)
- Hover for exact numbers

**Use Cases:**
- "Why did mentions spike on Tuesday?"
- "Which keywords drive the most LLM mentions?"

### **4. Models Distribution** (20% width - toggle Pie/Bar)
Shows which AI models mention you most frequently.

**Key Insight:** All GPT models (3.5, 4.0, 4-Turbo) = grouped as "GPT"

```
Models:
- GPT: 156 total scans (81.5% mention rate)
- Claude: 89 total scans (73.0% mention rate)
- Perplexity: 45 total scans (62.2% mention rate)
```

**Action:** Click a model → See its specific mentions

### **5. Keywords Analysis Table** (Full width)
Detailed breakdown of how each keyword performs in AI searches.

| Keyword | Scans | Mentions | Visibility | Avg Rank | Top Competitors |
|---------|-------|----------|------------|----------|-----------------|
| AI Analytics | 45 | 31 | 68.9% | 2.1 | acme.com (12), rival.com (8) |
| LLM Monitoring | 23 | 14 | 60.9% | 3.5 | acme.com (7) |

**Features:**
- ✅ Click any row → Highlight selection (blue background)
- ✅ Sort by: Term, Scans, Mentions, Visibility, Rank
- ✅ See top 3 competitors per keyword

### **6. Competitors Insights** (50% width - Grid)
Shows which competitor domains appear alongside your mentions.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ acme.com        │ │ rival.com       │ │ newstartup.ai   │
│ 89 mentions     │ │ 67 mentions     │ │ 34 mentions     │
│ Rank: 1.2       │ │ Rank: 2.8       │ │ Rank: 3.5       │
│ 📌 GPT, Claude, │ │ 📌 GPT, Claude  │ │ 📌 Perplexity   │
│    Perplexity   │ │    Perplexity   │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Color Coding:**
- 🟣 Purple dots = GPT models
- 🔵 Blue dots = Claude models
- 🟠 Orange dots = Perplexity
- 🟡 Yellow dots = Other bots

### **7. Crawlers Activity** (50% width - Timeline + Table)
Monitors bot activity on your website - when crawlers visit, what they access.

**Activity Timeline:**
Shows when bots visit your site throughout the date range.

**Bot Breakdown by Type:**
```
┌─ GPT (Scapy, GPTBot)          ┐
│  Visits: 342                   │
│  Pages: 28                     │
└────────────────────────────────┘

┌─ Claude (AnthropicBot)         ┐
│  Visits: 189                   │
│  Pages: 19                     │
└────────────────────────────────┘
```

**Recent Bot Visits Table:**
| Bot | Page | Time |
|-----|------|------|
| GPTBot | /docs/api | 14:32 |
| AnthropicBot | /blog/ai-trends | 14:15 |
| Googlebot | /products | 14:05 |

---

## 🎯 Common Use Cases

### **Scenario 1: Track a Specific Keyword**
1. Select keyword "AI Chatbot" from filter
2. See: Mentions timeline, competitors mentioned with that keyword
3. Notice: Which models mention it most?
4. Action: Optimize content around top-ranking competitors

### **Scenario 2: Monitor Competitor Mentions**
1. Select competitor "acme.com" from filter
2. See: When acme appears, what keywords trigger it
3. Compare: How often you're mentioned vs acme
4. Action: Feature comparison content to fight for ranking

### **Scenario 3: Analyze Bot Crawler Patterns**
1. Switch to "Crawlers Activity" section
2. Select bot type "GPT" from filter
3. See: Which pages GPT bots access most
4. Insight: These pages are crawled most frequently
5. Action: Ensure they're rich with valuable content

### **Scenario 4: Track LLM Model Popularity**
1. Look at "Models Distribution" chart
2. Compare GPT vs Claude vs Perplexity mention rates
3. If GPT dominates: Optimize for ChatGPT queries
4. If Claude rising: Prepare Claude-optimized content

### **Scenario 5: Monitor Sudden Spike**
1. See spike in mentions on specific date
2. Check which keywords + models drove it
3. Hover over spike for exact numbers
4. Filter to that date range for details
5. Identify: New product launch? News coverage? Competitor action?

---

## 🔄 Filter Combinations

**Powerful combinations for deeper insights:**

| Goal | Filters | Result |
|------|---------|--------|
| GPT mentions this month | Model: GPT + Date: 30d | See only GPT mentions |
| Competitors beating us on "AI" | Keyword: AI + Competitor: acme.com | See when acme wins with AI keyword |
| Claude bot crawl pattern | Bot Type: Claude | See where Claude bots focus |
| Recent breakthrough moments | Date: 24h | See what's trending NOW |

---

## 📱 Mobile Experience

Dashboard is fully responsive:
- **Desktop**: 12-column grid layout
- **Tablet**: 6-column grid layout
- **Mobile**: 4-column grid layout + horizontal scroll tables

All charts and tables auto-adjust!

---

## ⚡ Performance Features

✅ **Zero Loading Delays**
- Data pre-loaded from server
- Filter changes = instant (no API calls)
- Charts re-render in <100ms

✅ **Smart Caching**
- Filters cache for 5 minutes
- KPI metrics cache for 1 hour
- Crawler logs cache for 1 hour

✅ **Smooth Transitions**
- No full page reloads
- Suspense boundaries for progressive rendering
- Skeleton loaders while data loads

---

## 🎨 Visual Indicators

### **Color Coding**
- 🟣 **Purple**: GPT models (ranking, importance)
- 🔵 **Blue**: Claude models
- 🟠 **Orange**: Google bots
- 🔷 **Cyan**: Bing/other

### **Trend Indicators** (Planned)
- ↑ Green = Increasing
- ↓ Red = Decreasing
- → Gray = Stable

### **Bar Chart Fills**
- Full bar = Highest mention count
- Partial bar = Relative percentage

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not updating? | Refresh the page or wait 5-60s depending on metric |
| Can't find a keyword? | Click "All Keywords" in filter to verify it exists |
| Filter not working? | Try clearing all filters and re-applying one at a time |
| Numbers seem off? | Verify date range - default is last 30 days |
| Models not grouped? | Clear cache in browser DevTools → reload |

---

## 📊 Exporting Data (Coming Soon)

Future versions will support:
- Download table as CSV
- Export charts as PNG
- Generate PDF reports
- Share filtered views via URL

---

## 🔗 Links & Resources

- **Full Documentation**: See `src/features/ai-monitoring/README.md`
- **API Reference**: See `src/backend/services/ai-monitoring.service.ts`
- **Component Props**: Check individual component files
- **Type Definitions**: `src/types/dashboard.ts`

---

## 💡 Pro Tips

1. **Bookmark filtered views** - Copy URL with filters, share with team
2. **Monitor daily** - Check morning for overnight crawler activity
3. **Compare periods** - Switch date ranges to spot trends
4. **Competitor analysis** - Focus on top 3 competitors mentioned
5. **Content gaps** - Identify keywords mentioned but you're never featured

---

**Happy tracking! 🚀**

*Questions? Check the Implementation Summary or reach out to the dev team.*


