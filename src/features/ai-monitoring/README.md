# AI Monitoring Feature

**360° Dashboard for AI Mention Analysis & Web Crawler Monitoring**

## Overview

The AI Monitoring feature provides comprehensive insights into:
- **AI Mentions**: Track when your website is mentioned in LLM search results
- **Crawler Activity**: Monitor bot and web crawler visits
- **Competitive Intelligence**: Identify competitors mentioned in AI searches
- **Model Analytics**: Analyze which LLM models mention you most

## Architecture

### Directory Structure

```
src/features/ai-monitoring/
├── README.md                              # This file
├── types.ts                               # Feature-specific types
├── index.ts                               # Public API exports
├── actions.ts                             # Server Actions
├── hooks/
│   └── use-ai-monitoring.ts               # Custom hooks
├── providers/
│   └── ai-monitoring-provider.tsx         # React Context Provider
└── components/
    ├── index.ts                           # Component exports
    ├── ai-monitoring-dashboard.tsx        # Main shell
    ├── ai-monitoring-filters.tsx          # Filter controls
    ├── ai-monitoring-metrics.tsx          # KPI cards
    ├── ai-keywords-table.tsx              # Keyword analysis table
    ├── ai-competitors-insights.tsx        # Competitor grid
    ├── ai-crawlers-activity.tsx           # Bot monitoring
    └── charts/
        ├── ai-mention-timeline-chart.tsx  # Timeline visualization
        └── ai-models-breakdown-chart.tsx  # Model distribution
```

## Key Components

### AIMonitoringDashboard
Main shell component that assembles all sections. Handles layout and data distribution.

```tsx
<AIMonitoringDashboard
  projectId={projectId}
  keywords={keywords}
  initialMentions={mentions}
  initialBotVisits={botVisits}
  mentionTimeline={timeline}
  modelBreakdown={models}
  competitorInsights={competitors}
  botMetrics={bots}
  botTimeline={botTimeline}
  kpis={kpis}
/>
```

### AIMonitoringProvider
Context provider for managing filter state and drill-down selections.

```tsx
<AIMonitoringProvider
  projectId={projectId}
  initialData={{ mentions, botVisits }}
  initialFilters={filters}
>
  <AIMonitoringDashboard ... />
</AIMonitoringProvider>
```

### Custom Hooks

```tsx
// Main context hook
const { filters, selectedKeyword, updateFilters, selectKeyword } = useAIMonitoring();

// Shorthand hooks
const selected = useSelectedKeyword();
const isLoading = useAIMonitoringLoading();
```

## Data Flow

### Server-Side (Page Component)
1. Fetch all data in parallel via `getAIMonitoringData(projectId, filters)`
2. Pass to `AIMonitoringProvider` as initial state
3. Provider exposes context to all children

### Client-Side (Components)
1. Components use context via `useAIMonitoring()` hook
2. Filter changes trigger `updateFilters()`
3. Components re-render with filtered data
4. **No page reload** - smooth transitions via `useTransition()`

## Filtering Strategy

Filters work at two levels:

### 1. Server-Side Filters (URL params)
- Date range, keyword, model, competitor, bot type
- Applied when page loads
- Can be shared via URL

### 2. Client-Side Selections (Context)
- `selectedKeyword`, `selectedModel`, `selectedCompetitor`
- Used for drill-down
- Filtered data via `useFilteredMentions()` hook

## Performance Optimizations

### 1. Caching (Backend)
- `unstable_cache()` with 5-min/1-hour revalidation
- Separate cache keys per metric type
- Tags: 'ai-search', 'page-visits', 'ai-monitoring'

### 2. Data Loading (Frontend)
- Parallel fetches in `getAIMonitoringData()`
- Initial data preloaded from server
- Suspense boundaries for progressive rendering

### 3. Re-renders (Client)
- Context memoization to prevent unnecessary re-renders
- `useCallback()` for stable function references
- `useTransition()` for smooth loading states

## Usage Examples

### Basic Setup
```tsx
// In page.tsx
const data = await getAIMonitoringData(projectId, filters);

return (
  <AIMonitoringProvider projectId={projectId} initialData={data.mentions} initialFilters={filters}>
    <AIMonitoringDashboard {...data} />
  </AIMonitoringProvider>
);
```

### Drill-Down Selection
```tsx
// In component
const { selectKeyword, selectedKeyword } = useAIMonitoring();

return (
  <button onClick={() => selectKeyword(keywordId)}>
    {selectedKeyword === keywordId ? "Selected" : "Select"}
  </button>
);
```

### Filtered Data
```tsx
// In component
const { filters } = useAIMonitoring();
const filteredMentions = useFilteredMentions();

return (
  <div>
    Showing {filteredMentions.length} mentions
    {filters.keyword && ` for keyword "${filters.keyword}"`}
  </div>
);
```

## Types

All types are organized in `types.ts` (feature-specific) and `src/types/dashboard.ts` (shared):

```tsx
// Feature types
export type AIMonitoringContextType = { ... }
export type AIMonitoringTab = 'overview' | 'keywords' | 'models' | ...

// Shared dashboard types
export type AIMetricCard = { ... }
export type AIKeywordMetric = { ... }
```

## Server Actions

### `getAIMonitoringData(projectId, filters)`
Fetches all data for dashboard. Used on page load.

### `getKeywordMetrics(projectId, keywordId, filters)`
Gets keyword-specific metrics for drill-down.

### `getModelMetrics(projectId, modelName, filters)`
Gets model-specific metrics for drill-down.

## Styling

All components follow the design system:
- Bento card layout (`variant="bento"`)
- Dashed borders (`border-dashed border-border/80`)
- Responsive grid (12-col → 6-col → 4-col)
- Color-coded by metric type

## Testing

```bash
# Unit tests for hooks
npm test -- use-ai-monitoring.ts

# E2E tests for dashboard
npm test:e2e -- ai-monitoring.spec.ts
```

## Future Enhancements

- [ ] Export data to CSV/PDF
- [ ] Custom date range picker
- [ ] Alert on competitor mentions
- [ ] AI sentiment analysis
- [ ] Bot behavior patterns
- [ ] Historical trend analysis
- [ ] Custom dashboard widgets

## Related Documentation

- [Backend Services](../../backend/services/ai-monitoring.service.ts)
- [Database Schema](../../backend/db/tables/page-visits.ts)
- [Dashboard Types](../../types/dashboard.ts)


