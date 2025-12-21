# 🎯 Tracker Setup Examples

Quick examples for integrating the improved tracker into your website.

---

## 📋 Table of Contents
1. [Installation in React](#installation-in-react)
2. [Installation in HTML](#installation-in-html)
3. [Installation in Next.js](#installation-in-nextjs)
4. [Testing the Tracker](#testing-the-tracker)
5. [Monitoring Logs](#monitoring-logs)

---

## Installation in React

### Option 1: Using useEffect Hook

```typescript
// app/layout.tsx or pages/_app.tsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Generate and insert snippet dynamically
    const projectId = 'YOUR_PROJECT_UUID';
    const baseUrl = 'https://yourdomain.com';
    
    const snippet = `
      <!-- Layer 1: Pixel for pure crawlers (no JS required) -->
      <img 
        src="${baseUrl}/api/tracking/pixel?projectId=${projectId}&source=head-pixel&timestamp=\${Date.now()}"
        width="1" 
        height="1" 
        alt="" 
        style="position:absolute;left:-9999px;width:1px;height:1px;"
        loading="lazy"
      />

      <!-- Layer 2: tracker.js for JS-enabled visitors -->
      <script src="${baseUrl}/tracker.js" data-project-id="${projectId}" async defer></script>

      <!-- Layer 3: Pixel fallback for noscript -->
      <noscript>
        <img 
          src="${baseUrl}/api/tracking/pixel?projectId=${projectId}&source=noscript&timestamp=\${Date.now()}" 
          width="1" 
          height="1" 
          alt="" 
          style="position:absolute;left:-9999px;width:1px;height:1px;"
        />
      </noscript>
    `;
    
    // Inject into head
    document.head.insertAdjacentHTML('beforeend', snippet);
  }, []);

  return <YourApp />;
}
```

### Option 2: Using Next.js Script Component

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout() {
  const projectId = 'YOUR_PROJECT_UUID';
  const baseUrl = 'https://yourdomain.com';
  const pixelUrl = `${baseUrl}/api/tracking/pixel`;
  
  return (
    <html>
      <head>
        {/* Layer 1: Pixel for pure crawlers */}
        <img 
          src={`${pixelUrl}?projectId=${projectId}&source=head-pixel`}
          width="1" 
          height="1" 
          alt="" 
          style={{ position: 'absolute', left: '-9999px' }}
        />
        
        {/* Layer 2: tracker.js */}
        <Script 
          src={`${baseUrl}/tracker.js`}
          data-project-id={projectId}
          async
        />
        
        {/* Layer 3: Fallback pixel */}
        <noscript>
          <img 
            src={`${pixelUrl}?projectId=${projectId}&source=noscript`}
            width="1" 
            height="1" 
            alt="" 
          />
        </noscript>
      </head>
      <body>
        <YourApp />
      </body>
    </html>
  );
}
```

---

## Installation in HTML

### Simple Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
    
    <!-- Geo Tracker: Triple-Layer Setup -->
    
    <!-- Layer 1: Pixel for pure crawlers (no JS required) -->
    <img 
      src="https://yourdomain.com/api/tracking/pixel?projectId=YOUR_PROJECT_UUID&source=head-pixel"
      width="1" 
      height="1" 
      alt="" 
      style="position:absolute;left:-9999px;width:1px;height:1px;"
      loading="lazy"
    />

    <!-- Layer 2: tracker.js for JS-enabled visitors (humans + headless browsers) -->
    <script src="https://yourdomain.com/tracker.js" data-project-id="YOUR_PROJECT_UUID" async defer></script>

    <!-- Layer 3: Pixel fallback for noscript + early exit crawlers -->
    <noscript>
      <img 
        src="https://yourdomain.com/api/tracking/pixel?projectId=YOUR_PROJECT_UUID&source=noscript" 
        width="1" 
        height="1" 
        alt="" 
        style="position:absolute;left:-9999px;width:1px;height:1px;"
      />
    </noscript>
</head>
<body>
    <h1>Welcome to my website!</h1>
    <!-- Your content here -->
</body>
</html>
```

### With Debug Mode

```html
<head>
    <!-- Debug script for development -->
    <script>
      window.__GEO_TRACKER_DEBUG__ = {
        projectId: 'YOUR_PROJECT_UUID',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        log: function(msg) {
          console.log('[GeoTracker-Debug]', msg, this);
        }
      };
      window.__GEO_TRACKER_DEBUG__.log('Initialized');
    </script>

    <!-- Tracker setup as above -->
    <img src="https://yourdomain.com/api/tracking/pixel?projectId=YOUR_PROJECT_UUID&source=head-pixel&debug=true" width="1" height="1" alt="" />
    <script src="https://yourdomain.com/tracker.js" data-project-id="YOUR_PROJECT_UUID" async defer></script>
    <noscript>
      <img src="https://yourdomain.com/api/tracking/pixel?projectId=YOUR_PROJECT_UUID&source=noscript&debug=true" width="1" height="1" alt="" />
    </noscript>
</head>
```

---

## Installation in Next.js

### Using generateRobustSnippet (Recommended)

```typescript
// app/components/tracker-provider.tsx
import { generateRobustSnippet } from '@/features/tracking/utils/snippet-generator';

export function TrackerProvider() {
  const projectId = process.env.NEXT_PUBLIC_GEO_TRACKER_PROJECT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!projectId || !baseUrl) {
    console.warn('GeoTracker: Missing projectId or baseUrl');
    return null;
  }

  const snippet = generateRobustSnippet({ projectId, baseUrl });

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: snippet,
      }}
    />
  );
}
```

```typescript
// app/layout.tsx
import { TrackerProvider } from './components/tracker-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <TrackerProvider />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### With Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GEO_TRACKER_PROJECT_ID=xxxx-xxxx-xxxx-xxxx
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## Testing the Tracker

### 1. Verify Pixel Requests

```bash
# Open DevTools in your browser
# Go to Network tab
# Look for requests to /api/tracking/pixel

# You should see:
# ✅ Status: 200
# ✅ Response: 1x1 GIF image
# ✅ Type: image/gif
```

### 2. Test Specific Bot User-Agents

```bash
#!/bin/bash

# Function to test a bot
test_bot() {
  local name=$1
  local ua=$2
  local project_uuid=$3
  local base_url=$4
  
  echo "Testing: $name"
  curl -s \
    -H "User-Agent: $ua" \
    "$base_url/api/tracking/pixel?projectId=$project_uuid&source=test" \
    -o /dev/null \
    -w "Status: %{http_code}\n"
  echo "---"
}

# Configuration
PROJECT_UUID="YOUR_PROJECT_UUID"
BASE_URL="https://yourdomain.com"

# Test different bots
test_bot "ChatGPT Bot" \
  "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" \
  "$PROJECT_UUID" "$BASE_URL"

test_bot "Claude Web" \
  "Mozilla/5.0 (compatible; Claude-Web)" \
  "$PROJECT_UUID" "$BASE_URL"

test_bot "Perplexity Bot" \
  "Mozilla/5.0 (compatible; PerplexityBot/0.0; +https://www.perplexity.ai)" \
  "$PROJECT_UUID" "$BASE_URL"

test_bot "Googlebot Extended" \
  "Mozilla/5.0 (compatible; Googlebot-Extended; +http://www.google.com/bot.html)" \
  "$PROJECT_UUID" "$BASE_URL"

test_bot "Regular Chrome" \
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124" \
  "$PROJECT_UUID" "$BASE_URL"
```

### 3. Monitor Database

```sql
-- Check recent visits
SELECT 
  id,
  created_at,
  is_bot,
  bot_name,
  device_type,
  browser_name,
  country_code
FROM page_visits 
WHERE project_id = 'YOUR_PROJECT_UUID'
ORDER BY created_at DESC
LIMIT 20;

-- Count bot vs human
SELECT 
  CASE WHEN is_bot IS NULL THEN 'Human' ELSE is_bot END as visitor_type,
  COUNT(*) as count,
  COUNT(DISTINCT visitor_id) as unique_visitors
FROM page_visits 
WHERE project_id = 'YOUR_PROJECT_UUID'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1;

-- See all bot types
SELECT 
  is_bot,
  bot_name,
  COUNT(*) as visits,
  COUNT(DISTINCT visitor_id) as visitors
FROM page_visits 
WHERE project_id = 'YOUR_PROJECT_UUID'
  AND is_bot IS NOT NULL
GROUP BY 1, 2
ORDER BY visits DESC;
```

---

## Monitoring Logs

### View Pixel Logs

```bash
# Real-time log monitoring
tail -f logs | grep "\[PIXEL\]"

# Example output:
# [PIXEL] Request received { timestamp: "2025-12-22T10:30:45.123Z", projectId: "xxx", source: "head-pixel", botDetection: { type: "claude", name: "Claude Web", ... } }
# [PIXEL] ✅ Captured { timestamp: "2025-12-22T10:30:45.200Z", projectId: "xxx", duration: "77ms", botType: "claude", path: "/" }
```

### View Capture Logs

```bash
# Monitor JS capture endpoint
tail -f logs | grep "\[CAPTURE\]"

# Example output:
# [CAPTURE] Request received { timestamp: "2025-12-22T10:30:50.123Z", source: "javascript", botDetection: { type: null, ... } }
# [CAPTURE] ✅ Success { timestamp: "2025-12-22T10:30:50.200Z", visitId: "xxx", botType: null }
```

### Filter Logs by Bot Type

```bash
# See only bot activity
tail -f logs | grep "botType.*:.*[^null]"

# See only human activity
tail -f logs | grep "botType.*:.*null"

# See only AI bots
tail -f logs | grep "isAIProvider.*true"
```

---

## Configuration Reference

### Project UUID
Where to find your project UUID:
1. Go to dashboard
2. Select your project
3. Check project settings or URL
4. Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Base URL
Should match your domain where tracker.js is hosted:
- Development: `http://localhost:3000`
- Staging: `https://staging.yourdomain.com`
- Production: `https://yourdomain.com`

### Query Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `projectId` | Project identifier (required) | `uuid` |
| `source` | Tracking source for debugging | `head-pixel`, `noscript`, `javascript` |
| `debug` | Enable debug logging | `true` |
| `timestamp` | Request timestamp (optional) | `${Date.now()}` |

---

## Troubleshooting

### Issue: Tracker not capturing visits

**Debug steps:**
1. Check if pixel requests appear in Network tab
2. Verify projectId matches database
3. Check server logs for `[PIXEL]` messages
4. Test with curl command above

### Issue: Bot detection not working

**Debug steps:**
1. Log User-Agent: `console.log(navigator.userAgent)`
2. Test bot detection directly:
   ```typescript
   import { detectBot } from '@/features/tracking/utils/bot-detector';
   console.log(detectBot(userAgent));
   ```
3. Check if User-Agent pattern exists in bot-detector.ts
4. Add new pattern if needed

### Issue: Database empty

**Debug steps:**
1. Verify project exists: `SELECT id FROM project WHERE id = 'YOUR_PROJECT_UUID';`
2. Check if page_visits table has records
3. Verify API endpoint is responding (check logs)
4. Check for validation errors in capturePageVisitSchema

---

## Next Steps

1. ✅ Install tracker snippet in your website
2. ✅ Wait for bot visits to your site
3. ✅ Monitor logs for `[PIXEL]` and `[CAPTURE]` messages
4. ✅ Check database for captured visits
5. ✅ Create dashboard to visualize bot activity

**Happy tracking! 🎉**

