import { LandingContainer } from "@/components/landing-page/container";
import { LandingSection } from "@/components/landing-page/section";
import { Button } from "@/components/ui/button";
import { OrbitingCirclesLogo } from "@/components/landing-page/icon-orbit";
import { AnimatedList } from "@/components/ui/animated-list";


export function BentoGrid() {
  return (
    <LandingSection>
      <LandingContainer>
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-dashed border-border/40">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Extend model capabilities with built-in <span className="text-muted-foreground">Agents</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Seamless integration of AI agents to augment model responses in just a few minutes.
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid md:grid-cols-2 border-b border-dashed border-border/40 divide-y md:divide-y-0 md:divide-x divide-dashed divide-border/40">
          <div className="p-8 md:p-12 min-h-[400px] flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center min-h-[300px]">
              <AnimatedList>  
                <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2 border border-white/10">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/80">ChatGPT mentions you in the Web</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2 border border-white/10">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <span className="text-white/80">AI crawls increased 24% in the last month</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2 border border-white/10">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/80">New AI results appeared</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2 border border-white/10">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/80">Visibility insights updated for the last 24 hours</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2 border border-white/10">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/80">New competitor found</span>
                </div>
                
              </AnimatedList>
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Build useful and reliable agents</h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              The Agents SDK is a robust and lightweight orchestration framework for designing, building, and deploying agents with built-in observability to track and optimize performance.
            </p>
            <Button variant="outline" className="w-fit">
              Learn more
            </Button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-border/40">
          {/* Left Content */}
          <div className="flex flex-col justify-between">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Customize models for your needs</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Customize a model&apos;s existing knowledge and behavior for a specific task using text and images via supervised fine-tuning.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl border border-dashed border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors">
                  <h4 className="font-semibold mb-2">Data Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Extract insights from complex datasets with our advanced analytics tools.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-dashed border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors">
                  <h4 className="font-semibold mb-2">Content Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Create high-quality content for marketing, documentation, and more.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 border-t border-dashed border-border/40 divide-x divide-dashed divide-border/40">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold mb-1">8</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Sources tracked</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold mb-1">97%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Visibility rate</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold mb-1">50K+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Scans analyzed</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="p-8 md:p-12 min-h-[400px] flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center min-h-[300px]">
              <OrbitingCirclesLogo>
              </OrbitingCirclesLogo>
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

