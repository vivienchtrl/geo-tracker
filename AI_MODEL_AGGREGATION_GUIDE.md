# 🧬 AI Model Aggregation Strategy

## Overview

The AI Monitoring dashboard **groups all versions of a model family together**. This gives you a cleaner, more actionable view of which AI systems mention your content.

---

## The Problem

Without aggregation, you'd see confusing model names:
```
- GPT-3.5-Turbo (ICP: xyz)
- GPT-4 (ICP: abc)
- GPT-4-Turbo (ICP: def)
- GPT-4-Turbo-Vision (ICP: ghi)
- Claude-3-Opus (ICP: jkl)
- Claude-3.5-Sonnet (ICP: mno)
- Claude-3-Haiku (ICP: pqr)
```

**This is messy and doesn't answer the real question: "Are GPT models or Claude models mentioning me more?"**

---

## The Solution: Base Model Names

All versions of a model are grouped into a simple base name:

### **GPT Family**
```
GPT-3.5-Turbo          ┐
GPT-4                  │
GPT-4-Turbo            ├─→ "GPT"
GPT-4-Turbo-Vision     │
gpt-4-turbo-preview    │
GPT-4 (ICP: xyz)       ┘
```

### **Claude Family**
```
Claude-3-Opus          ┐
Claude-3.5-Sonnet      ├─→ "Claude"
Claude-3-Haiku         │
Claude-3-Opus (ICP)    ┘
```

### **Perplexity Family**
```
Perplexity             ┐
Perplexity Pro         ├─→ "Perplexity"
Perplexity Online      ┘
```

### **Other Models**
```
Gemini
Mistral
Anthropic (Claude fallback)
etc.
```

---

## How Aggregation Works

### **Extraction Logic**

The system applies these transformations:

1. **Remove ICP suffix**
   ```
   "Claude-3-Opus (ICP: xyz)" → "Claude-3-Opus"
   ```

2. **Remove version numbers**
   ```
   "GPT-4.0" → "GPT-"
   "Claude-3.5-Sonnet" → "Claude--Sonnet"
   ```

3. **Remove variant names**
   ```
   "GPT-4-Turbo" → "GPT-4-"
   "Claude-3-Opus" → "Claude-3-"
   "Sonnet-3.5" → "Sonnet-3."
   ```

4. **Trim whitespace**
   ```
   "GPT-" → "GPT"
   "Claude-" → "Claude"
   ```

### **Helper Function**

```typescript
function extractBaseModelName(modelUsed: string | null): string {
  if (!modelUsed) return "Unknown";

  return modelUsed
    .split("(")[0]                              // Remove (ICP: xyz)
    .trim()
    .replace(/[-_\s]?\d+(\.\d+)?/g, "")        // Remove 3, 4, 3.5, etc.
    .replace(/[-_](Turbo|Opus|Sonnet|Haiku|Pro|Ultra)/gi, "")  // Remove variants
    .trim() || modelUsed;
}
```

---

## Real-World Examples

| Original Model | Aggregated Name | Why |
|---|---|---|
| GPT-4 (ICP: default-icp) | GPT | Remove ICP, remove 4 |
| GPT-3.5-Turbo | GPT | Remove 3.5, remove Turbo |
| Claude-3.5-Sonnet (ICP: custom) | Claude | Remove ICP, remove 3.5, remove Sonnet |
| Claude-3-Opus | Claude | Remove 3, remove Opus |
| Perplexity-Pro | Perplexity | Remove Pro |
| Gemini-Pro | Gemini | Remove Pro |
| mistral-large | mistral | Just lowercase |

---

## Usage in Dashboard

### **Model Filter**
When you select a model from the dropdown:

```
Models ▼
├─ GPT (156 scans)
├─ Claude (89 scans)
├─ Perplexity (45 scans)
└─ Gemini (23 scans)
```

Clicking "GPT" shows **all mentions from any GPT model version**.

### **Timeline & Charts**
Both aggregated by base model name:

```
Timeline:
- GPT: 45 mentions on Jan 15
- Claude: 23 mentions on Jan 15

Distribution:
- GPT: 156 total (81.5% mention rate)
- Claude: 89 total (73.0% mention rate)
```

### **Model Selection for Filtering**
When you filter by a model, you get all versions:

```
Filter: Model = "GPT"

Returns:
✓ GPT-4 mentions
✓ GPT-3.5-Turbo mentions
✓ GPT-4-Turbo mentions
✓ GPT (any other version)
```

---

## Why This Matters

### **Before Aggregation** (Confusing)
❌ You see 47 different model variations
❌ Hard to spot trends
❌ Can't answer: "How many GPT mentions?"
❌ UI cluttered with similar models

### **After Aggregation** (Clear)
✅ See 5-10 major model families
✅ Easy to spot winners
✅ Quick answer: "GPT dominates with 156 mentions"
✅ Clean, actionable dashboard

---

## Technical Implementation

### **Where It Happens**

1. **In Service Layer** (`ai-monitoring.service.ts`)
   - `getAIModelBreakdown()` - Aggregates all models
   - `getAIMetricsByModel()` - Filters by aggregated name
   - `getAIMentions()` - Post-filters by model family

2. **In Database Query**
   - Raw data stores full model name
   - Aggregation happens in-memory
   - Allows flexibility for future model naming changes

3. **In Components**
   - Receive already-aggregated data
   - Display base model names
   - No need to know extraction logic

---

## Future Flexibility

If LLM naming changes (e.g., "GPT-5-Ultra-Vision"), the aggregation logic:
- ✅ Automatically groups it with "GPT"
- ✅ No database migration needed
- ✅ No UI changes required
- ✅ Existing queries still work

Just update the regex patterns in `extractBaseModelName()`:

```typescript
.replace(/[-_](Turbo|Opus|Sonnet|Haiku|Pro|Ultra|Vision)/gi, "")
//                                                    ^^^^^^
//                        Add new variant name here
```

---

## Glossary

| Term | Meaning | Example |
|------|---------|---------|
| **Base Model** | Core model family name | GPT, Claude, Perplexity |
| **Version** | Model iteration number | 3.5, 4.0, 4-Turbo |
| **Variant** | Special model edition | Opus, Sonnet, Turbo, Vision |
| **ICP Suffix** | Custom instruction set tag | (ICP: default-icp) |
| **Original Model String** | Full model name as stored | GPT-4-Turbo (ICP: custom) |
| **Aggregated Name** | Simplified group name | GPT |

---

## Configuration

If you want to change aggregation behavior, edit this function:

```typescript
// File: src/backend/services/ai-monitoring.service.ts
function extractBaseModelName(modelUsed: string | null): string {
  // Modify logic here
  // Re-deploy
  // Automatic retroactive aggregation on queries
}
```

**No data migration needed!** ✨

---

## Monitoring Model Trends

With aggregation, you can now track:

```
Weekly Model Trends:
┌────────┬───────┬──────────┐
│ Model  │ Week1 │ Week2    │
├────────┼───────┼──────────┤
│ GPT    │ 156   │ 189 ↑    │
│ Claude │ 89    │ 101 ↑    │
│ Perp.  │ 45    │ 43  ↓    │
└────────┴───────┴──────────┘
```

Answer questions like:
- Is Claude adoption increasing?
- Are GPT mentions still dominant?
- Which model family is emerging?

---

## API Contract

When consuming model data from the backend:

```typescript
// You receive:
{
  name: "GPT",  // Always aggregated
  total: 156,
  mentioned: 127,
  mentionRate: 81.5
}

// NOT:
{
  name: "GPT-4-Turbo",  // ❌ Never individual versions
  total: 45,
  mentioned: 38,
  mentionRate: 84.4
}
```

This ensures consistency across all components and queries.

---

**Need to adjust aggregation?** Edit `extractBaseModelName()` and redeploy! 🚀


