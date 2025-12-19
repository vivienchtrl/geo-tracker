import { LandingContainer } from "@/components/landing-page/container";
import { LandingSection } from "@/components/landing-page/section";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/landing-page/hero";
import { BentoGrid } from "@/components/landing-page/bento-grid";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Nav would go here, possibly inside the container or fixed */}

      {/* Hero Section */}
      <LandingSection>
        <LandingContainer className="p-0 border-b-0">
          <Hero>
            <div className="px-6 md:px-12 lg:px-24">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  New: Track your AI indexability
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
                  Your Brand <br className="hidden md:inline" />
                  <span className="text-primary">AI Tracker</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                  Monitore your visibility on the web and find where AI is talking about you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    View Demo
                  </Button>
                </div>
              </div>
            </div>
          </Hero>
        </LandingContainer>
      </LandingSection>

      {/* Bento Grid */}
      <BentoGrid />

      {/* Features Grid */}
      <LandingSection>
        <LandingContainer>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-border/40">
            <div className="p-8 md:p-12 flex flex-col justify-center h-full border-b md:border-b-0 border-dashed border-border/40 md:border-none">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ultra-Detailed Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dive deep into your traffic data with granular reporting. Understand user behavior, conversion paths, and engagement metrics like never before.
              </p>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center h-full">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Copilot Strategy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Let our AI analyze your data and brainstorm actionable growth strategies. It&apos;s like having a dedicated SEO expert available 24/7.
              </p>
            </div>
          </div>
        </LandingContainer>
      </LandingSection>

      {/* Large Feature Section */}
      <LandingSection>
        <LandingContainer className="py-20">
          <div className="px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Global Indexability Tracking</h2>
              <p className="text-muted-foreground text-lg">
                Monitor your presence across search engines worldwide. Detect indexing issues instantly and ensure your content is always visible to your audience.
              </p>
              <ul className="space-y-3 pt-4">
                {[
                  "Real-time index status checks",
                  "Competitor visibility benchmarking",
                  "Geographic ranking breakdown",
                  "Automated SEO health alerts",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video rounded-xl border border-dashed border-border/40 bg-muted/30 overflow-hidden flex items-center justify-center">
              <p className="text-muted-foreground font-mono text-sm">Dashboard Preview UI</p>
            </div>
          </div>
        </LandingContainer>
      </LandingSection>

      {/* CTA Section */}
      <LandingSection noBorderBottom>
        <LandingContainer className="py-24">
          <div className="text-center space-y-6 px-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to scale your traffic?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of brands using GeoTracker to optimize their web presence.
            </p>
            <Button size="lg" className="mt-4">
              Get Started Now
            </Button>
          </div>
        </LandingContainer>
      </LandingSection>

      <div className="border-t border-dashed border-border/40 py-8 text-center text-sm text-muted-foreground">
        <LandingContainer className="border-none py-0">
          <div className="flex flex-col md:flex-row justify-between items-center px-6">
            <p>© 2024 GeoTracker. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground">
                Twitter
              </Link>
            </div>
          </div>
        </LandingContainer>
      </div>
    </div>
  );
}
