# 🧪 AI Monitoring Refactor - Testing Guide

## 🚀 Quick Test

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Navigate to AI Monitoring
```
http://localhost:3000/dashboard/[YOUR_PROJECT_ID]/ai-monitoring
```

### 3. You Should See

#### Top Section: 4 Navigation Cards
- 📄 **Pages** - Click to see list of crawled pages
- 🤖 **Models** - Click to see AI models breakdown
- 💬 **Prompts** - Click to see LLM queries
- 🕷️ **Crawlers** - Click to see bot activity

#### Below: Original Dashboard
- KPI cards
- Timeline chart
- Model distribution
- Keywords table
- Competitors grid
- Crawlers section

---

## 📋 Full Test Scenario

### Test 1: Pages View
```
1. Click "📄 PAGES" card
2. You should see:
   ✓ Table with columns: Path | Visits | Avg Load Time | Top Bots
   ✓ Sorting buttons on headers
   ✓ Multiple rows (your crawled pages)
3. Click any row
4. You should see:
   ✓ Page detail view with path title
   ✓ 4-6 metric cards (visits, load time, LLM mentions, etc.)
   ✓ Table of "LLM Queries Mentioning This Page"
   ✓ List of top models
5. In the queries table:
   ✓ Click a query → Navigate to Query Detail
   ✓ Click a model badge → Navigate to Model Detail
6. Back button should work
```

### Test 2: Models View
```
1. Click "🤖 MODELS" card
2. You should see:
   ✓ Card grid (one per model)
   ✓ Cards show: Name | Total Scans | Mention Rate
   ✓ Progress bar for mention rate
3. Click any card
4. You should see:
   ✓ Model detail view with model name
   ✓ 4 metric cards (scans, mentions, rate, rank)
   ✓ Table of "Pages Accessed by [Model]"
   ✓ Table of "Queries Using [Model]"
5. In the pages table:
   ✓ Click page → Navigate to Page Detail
6. In the queries table:
   ✓ Click query → Navigate to Query Detail
7. Back button should work
```

### Test 3: Prompts View
```
1. Click "💬 PROMPTS" card
2. You should see:
   ✓ Search input
   ✓ Table with columns: Query | Model | Rank | Status | Date
   ✓ Type in search box → table filters instantly
3. Click any table row
4. You should see:
   ✓ Query detail view with full query text
   ✓ Copy button for query text
   ✓ Right panel: Model | Rank | Status | Date
   ✓ Full LLM response in box (scrollable)
   ✓ Two side-by-side tables:
     - "URLs in Results" with links
     - "Competitors Mentioned" with domains
5. Click on competitor domain:
   ✓ Copy button works (shows checkmark)
6. Back button should work
```

### Test 4: Crawlers View
```
1. Click "🕷️ CRAWLERS" card
2. You should see:
   ✓ Card grid (one per bot type)
   ✓ Cards show: Name | Total Visits | Pages Visited
   ✓ Progress bar for visits
   ✓ Top pages list on each card
3. Click any card
4. You should see:
   ✓ Bot detail view with bot type name
   ✓ Bot instance names below title
   ✓ 4 metric cards (visits, pages, load time, last visit)
   ✓ Bot names section with list
   ✓ Operating systems section with chart
   ✓ Geographic origins section
   ✓ Table of "Pages Accessed by [Bot]"
5. In the pages table:
   ✓ Click page → Navigate to Page Detail
6. Back button should work
```

### Test 5: Cross Navigation
```
From Page Detail:
1. Click model badge → Go to Model Detail ✓
2. Click query → Go to Query Detail ✓

From Model Detail:
1. Click page → Go to Page Detail ✓
2. Click query → Go to Query Detail ✓

From Query Detail:
1. Back button → Go to Prompts List ✓

From Bot Detail:
1. Click page → Go to Page Detail ✓
```

---

## 🎯 Expected Data

If your database has data, you should see:

### Pages Table Example
```
| Path              | Visits | Load Time | Bots         |
|-------------------|--------|-----------|--------------|
| /products         | 342    | 145ms     | gpt, claude  |
| /blog             | 234    | 98ms      | gpt, google  |
| /docs/api         | 156    | 234ms     | claude       |
```

### Models Cards Example
```
[GPT]              [Claude]           [Perplexity]
156 Scans          89 Scans           45 Scans
81% Mentioned      73% Mentioned      62% Mentioned
```

### Prompts Table Example
```
| Query                          | Model    | Rank | Status        | Date       |
|--------------------------------|----------|------|---------------|------------|
| best AI products on market     | GPT      | #2   | ✓ Mentioned   | 2025-01-22 |
| top AI tools for development   | Claude   | #1   | ✓ Mentioned   | 2025-01-21 |
```

### Bot Cards Example
```
[GPT]              [Claude]           [Google]
342 Visits         189 Visits         445 Visits
23 Pages           18 Pages           67 Pages
```

---

## 🐛 Troubleshooting

### Issue: Tables are empty
**Solution:** 
- Make sure your AI Monitoring dashboard has data
- Check date filters (default is 30d)
- Try "All" date range

### Issue: Page loads slowly
**Solution:**
- Clear browser cache
- Check Network tab → should be <500ms per request
- Refresh page once

### Issue: Links don't work
**Solution:**
- Make sure you're in correct project
- Check URL structure: `/dashboard/[id]/ai-monitoring/...`
- Refresh page

### Issue: Component styles weird
**Solution:**
- Clear CSS cache: `npm run build`
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

---

## 📱 Mobile Testing

### Phones (375px width)
- [ ] Tables scroll horizontally
- [ ] Cards stack vertically
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable (44px+ height)

### Tablets (768px width)
- [ ] 2-column grid layouts
- [ ] Tables show most important columns
- [ ] Modals fit screen

---

## ⚡ Performance Checks

### Load Times
- Page list: < 1s
- Page detail: < 1s
- Model list: < 1s
- Model detail: < 1s
- Prompts list: < 2s (200 items)
- Query detail: < 1s
- Crawlers list: < 1s
- Bot detail: < 1s

### Browser DevTools
- Network tab: Each request < 500ms
- Performance: Interaction < 100ms
- No console errors

---

## ✅ Sign-Off Checklist

After running all tests, verify:

- [ ] All 4 list views load data
- [ ] All 4 detail views work
- [ ] Cross-navigation works (pages → models → queries → bots)
- [ ] Sorting/filtering works
- [ ] Search works in prompts
- [ ] Back buttons work
- [ ] Mobile responsive
- [ ] Load times acceptable
- [ ] No console errors
- [ ] No linting errors

**Ready for production when all boxes ✓**

---

## 🎓 Common Tasks

### To test with new data:
1. Add new AI search entry
2. Add new page visit from bot
3. Go to dashboard → filter by today
4. Should see new data instantly

### To test filters:
1. Go to any list view
2. Change date range (if filter exists)
3. Data should update immediately
4. No page reload should happen

### To test performance:
1. Open DevTools Network tab
2. Navigate to each view
3. Check request time
4. Check payload size
5. Should be < 100KB per request

---

**Happy Testing! 🚀**

