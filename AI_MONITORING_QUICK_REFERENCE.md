# ⚡ AI Monitoring - Quick Reference Card

## 🎯 Where Is It?

**Sidebar Navigation:**
```
Dashboard → [Select Project] → AI Monitoring (new link)
```

**URL:** `/dashboard/[projectId]/ai-monitoring`

---

## 📊 Dashboard Layout at a Glance

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER: "AI Intelligence Monitoring"                         │
├──────────────────────────────────────────────────────────────┤
│ FILTERS: Date | Keywords ▼ | Models ▼ | Competitors ▼ | Bot ▼
├──────────────────────────────────────────────────────────────┤
│ KPIs: [Scans] [Mentions] [Visibility] [Rank] [Bot] [Competitor]
├──────────────────────────────────────────────────────────────┤
│  CHARTS (60%)    │  MODELS (40%)                             │
│  Timeline        │  Distribution (Pie/Bar)                   │
├──────────────────────────────────────────────────────────────┤
│ KEYWORDS TABLE (Full width, sortable)                        │
├──────────────────────────────────────────────────────────────┤
│ COMPETITORS (50%)   │ CRAWLERS ACTIVITY (50%)               │
│ Grid view           │ Timeline + Bot table                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Filters Explained

| Filter | Options | Effect |
|--------|---------|--------|
| **Date** | 24h, 7d, 30d, 90d, all | Narrow down timeframe |
| **Keywords** | Your keywords | See specific keyword mentions |
| **Models** | GPT, Claude, Perplexity, etc. | See specific model family |
| **Competitors** | Competing domains | See when they're mentioned |
| **Bot Type** | gpt, claude, google, bing, other | Filter crawler activity |

**Key Point:** All filters apply **instantly** with zero page reload!

---

## 🧠 Model Grouping (IMPORTANT!)

### What is Aggregation?
All versions of a model are grouped into one:

```
Input (Raw Data)          →    Output (Aggregated)
GPT-4-Turbo                   
GPT-4                     →    "GPT" (all grouped)
GPT-3.5-Turbo                 
GPT (ICP: xyz)

Claude-3-Opus             
Claude-3.5-Sonnet         →    "Claude" (all grouped)
Claude-3-Haiku
```

### Why?
- Cleaner dashboard
- Answers real question: "Who's winning, GPT or Claude?"
- Not: "Who's winning, GPT-4-Turbo or Claude-3.5-Sonnet?"

---

## 📈 Reading the Data

### KPI Cards (Top Row)
```
┌─ Total Scans: 342
├─ Mentions: 127
├─ Visibility Rate: 37.1% (127/342)
├─ Average Rank: 2.3 (lower = better)
├─ Bot Activity: 1,245 visits
└─ Top Competitor: acme.com (89 mentions)
```

### Timeline Chart
```
Bars represent daily mentions:
│
│     ▮▮      ▮▮▮    ▮
│    ▮▮▮▮    ▮▮▮▮   ▮▮▮
│   ▮▮▮▮▮   ▮▮▮▮▮  ▮▮▮▮
└─────────────────────────
  Mon Tue Wed Thu Fri Sat
```
- Blue = Mentioned in LLM results
- Gray = Total scans (not mentioned)

### Keywords Table
```
AI Analytics | 45 scans | 31 mentions | 68.9% visibility | Rank 2.1
└─ Competitors: acme.com (12), rival.com (8), startup.ai (5)
```
**Click row to highlight & filter**

### Models Distribution
```
GPT:         ████████████████ 156 scans (81.5%)
Claude:      ██████████ 89 scans (73.0%)
Perplexity:  ██████ 45 scans (62.2%)
Gemini:      ███ 23 scans (45.0%)
```
**Click to filter by that model**

### Bot Activity
```
GPT Crawlers:      342 visits → 28 pages
Claude Crawlers:   189 visits → 19 pages
Google Bot:        445 visits → 67 pages
```
**Click bot type to filter**

---

## ⚡ Common Actions

### See All GPT Mentions
1. Filter: Models → GPT
2. See: Timeline, keywords, competitors relevant to GPT only

### Track Specific Keyword
1. Filter: Keywords → "AI Analytics"
2. See: Who mentions us with that keyword
3. See: Which competitors also rank for it

### Monitor Competitor Presence
1. Look at Competitors grid
2. See: When acme.com mentioned with you
3. Compare: Your mentions vs acme's

### Analyze Bot Behavior
1. Scroll to "Crawlers Activity"
2. See: Which pages GPT/Claude visit most
3. Insight: These are your most crawl-worthy pages

### Find Trend Spikes
1. Look at Timeline chart
2. Spot: Unusual spike (day with lots of mentions)
3. Filter: Zoom to that date
4. Identify: What keyword/model drove spike?

---

## 🎨 Visual Cheat Sheet

### Colors Mean
```
🟣 Purple = Primary/Important
🔵 Blue   = Secondary/Details  
🟠 Orange = Warnings/Tertiary
🟡 Gray   = Inactive/Low priority
```

### Icons Mean
```
📊 Chart = Visualization
📋 Table = Detailed data
📌 Pin   = Important item
↑ Up    = Increasing/Positive
↓ Down  = Decreasing/Negative
```

### Text Styles
```
UPPERCASE = Section headers
Bold      = Important metrics
Small     = Secondary info
Dashed    = Disabled/Placeholder
```

---

## 🔥 Pro Tips

### Tip 1: Export URLs with Filters
```
Share with team:
/dashboard/[id]/ai-monitoring?dateRange=7d&llmModel=GPT
```

### Tip 2: Monitor Daily
```
Best time: Morning (see overnight bot crawls)
Quick check: 2 minutes (scan KPIs + timeline)
```

### Tip 3: Competitive Analysis
```
1. Find your top competitor in grid
2. Click to filter by them
3. See which keywords trigger their mentions
4. Create content to compete
```

### Tip 4: Bot Crawl Optimization
```
1. See most-crawled pages (crawlers section)
2. Ensure they have valuable content
3. Rich text, images, metadata matter
```

### Tip 5: Trend Spotting
```
1. Compare week-to-week
2. If Claude mentions ↑ → Prepare Claude-friendly content
3. If competitor appears more → Up your game
```

---

## ❓ Quick FAQs

**Q: Why are all GPT models together?**
A: To see which model family mentions you most, not every version.

**Q: Can I export data?**
A: Not yet, but coming soon! Copy chart or use Dev Tools for now.

**Q: Are numbers real-time?**
A: Updated every 5 minutes for raw data, 1 hour for aggregates.

**Q: Can I share filtered view?**
A: Yes! Copy the URL with filters and share with teammates.

**Q: What's "Visibility Rate"?**
A: Percentage of scans where you're actually mentioned. (mentions / total scans)

**Q: What's "Avg Rank"?**
A: Average position in results. Lower = Better. (1 = top position)

**Q: Are competitors' names correct?**
A: Extracted automatically from LLM responses. May have variants.

**Q: Does this track human searches?**
A: No, only LLM/AI model searches. Use GA4 for human traffic.

---

## 🔗 Jump To

| Need | Location |
|------|----------|
| Detailed Usage | `AI_MONITORING_USAGE_GUIDE.md` |
| Model Grouping Details | `AI_MODEL_AGGREGATION_GUIDE.md` |
| Technical Details | `src/features/ai-monitoring/README.md` |
| Deployment Info | `AI_MONITORING_DEPLOYMENT.md` |
| Full Summary | `AI_MONITORING_IMPLEMENTATION_SUMMARY.md` |

---

## 📱 Mobile View

```
┌────────────────────────────┐
│ AI Intelligence Monitoring │
├────────────────────────────┤
│ Date [7d] | Kw [▼]         │
│ Model [▼] | Comp [▼]       │
├────────────────────────────┤
│  [KPI1] [KPI2] [KPI3]      │
│  [KPI4] [KPI5] [KPI6]      │
├────────────────────────────┤
│  Timeline (swipe to see) ──→
├────────────────────────────┤
│  Models (swipe to see) ──→
├────────────────────────────┤
│  Keywords Table ──→
├────────────────────────────┤
│  Competitors ──→
├────────────────────────────┤
│  Crawlers ──→
└────────────────────────────┘
```

All sections swipeable on mobile!

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

---

**Questions?** Check the full guides or contact dev team! 🚀


