import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

// Components
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { AITrafficTab } from "@/components/dashboard/tabs/ai-traffic-tab";
import { GeneralTrafficTab } from "@/components/dashboard/tabs/general-traffic-tab";

// Data
import { getDashboardData } from "./actions";
import { getDashboardAnalytics, getDashboardContext } from "@/backend/services/dashboard.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { TrafficSource } from "@/types/db";

// Constants for AI Source Filtering
const AI_SOURCES = [
  'chatgpt', 'openai', 
  'perplexity', 
  'google', // "AI overview of Google" - this might be tricky to distinguish from Search without specific 'medium' or 'source' details, assuming 'google' source with specific characteristics or just broad google for now if vague. 
            // However, usually "Google" is search. If the user means "SGE" / "AI Overviews", it might not be explicitly separated in standard referrer data yet.
            // For now, I will include 'google' only if the user explicitly wanted it, but typically 'google' is organic search.
            // The user said "AI overview of Google". If we don't have specific SGE tracking, we might settle for including 'google' traffic here OR just strictly known AI bots.
            // Let's stick to the high-confidence AI ones + 'google' (if requested, but 'google' is huge). 
            // Let's look at the implementation: filtering `traffic_sources`. 
            // If I include 'google', it will dwarf everything. I will include it if the source string contains 'ai' or is one of the specific ones. 
            // ACTUALLY, the user list was: "ChatGPT, Perplexity, AI overview of Google, Gemini, DeepSeek, Mistral, Claude".
            // I will try to match these strings in the source.
  'gemini', 'bard',
  'deepseek',
  'mistral',
  'claude', 'anthropic',
  'bing' // Bing Chat
];

export default async function DashboardPage() {
  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // 1. Fetch Context (User & Project)
  const context = await getDashboardContext(user.id);
  
  if (!context) {
    // Handle case where user has no project (redirect to onboarding)
    redirect("/auth/onboarding");
  }

  // 2. Fetch Data in Parallel
  const [aiMetrics, analyticsData] = await Promise.all([
    getDashboardData(), // Existing AI/SEO Action (Mentions, Competitors, Keywords)
    getDashboardAnalytics(context.project.id) // Analytics Service (GA4, GSC, Traffic Sources)
  ]);

  // 3. Filter Traffic for AI Tab
  // Naive filter: check if source string contains any of the known AI identifiers
  const aiTrafficData: TrafficSource[] = analyticsData.trafficSources.filter(ts => {
      const source = ts.source.toLowerCase();
      // Special handling for Google: Only count if it explicitly looks like AI (which is hard today) 
      // or if the user explicitly considers 'google' as a potential AI source.
      // Given the user request "AI overview of Google", standard 'google' referrers are usually Organic Search.
      // SGE doesn't have a distinct referrer yet. 
      // I'll check for 'google' AND some indication, otherwise strict match on others.
      // For now, let's include 'google' if it is requested, but maybe separate it or note it.
      // To be safe and useful: I will exclude generic 'google' to avoid polluting AI stats with SEO, 
      // UNLESS 'google' is combined with 'ai' or 'sge' or something.
      // But looking at the user list again: "AI overview of Google".
      // Let's strictly match known AI names.
      return AI_SOURCES.some(ai => {
          if (ai === 'google') return false; // Skip generic google here to avoid noise, unless we have specific 'google ai' source
          return source.includes(ai);
      });
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Geo AEO Tracking</h2>
          <p className="text-muted-foreground">
            Unified analytics for AI Engines, Google Search, and Web Traffic.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-tracking">AI Traffic</TabsTrigger>
          <TabsTrigger value="general-traffic">General Traffic</TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview">
           <OverviewTab data={aiMetrics} />
        </TabsContent>

        {/* --- AI TRAFFIC TAB --- */}
        <TabsContent value="ai-tracking">
            <AITrafficTab 
                aiTraffic={aiTrafficData} 
                aiMetrics={aiMetrics} 
            />
        </TabsContent>

        {/* --- GENERAL TRAFFIC TAB --- */}
        <TabsContent value="general-traffic">
            <GeneralTrafficTab 
                analyticsHistory={analyticsData.analyticsHistory}
                gscHistory={analyticsData.gscHistory}
            />
        </TabsContent>

      </Tabs>
    </div>
  );
}
