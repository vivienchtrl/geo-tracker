"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  BarChart3,
  Search,
  Code2,
  Copy,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { disconnectIntegrationAction, checkTrackerSignalAction } from "../actions";
import { generateRobustSnippet } from "@/features/tracking/utils/snippet-generator";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntegrationState {
  google: boolean;
  searchConsole: boolean;
  analytics: boolean;
  tracker: boolean;
  lastSignal?: string | null;
}

interface IntegrationsClientProps {
  initialStatus: IntegrationState;
  projectId: string;
}

export function IntegrationsClient({
  initialStatus,
  projectId,
}: IntegrationsClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingSignal, setIsCheckingSignal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate tracker script snippet
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const trackerSnippet = generateRobustSnippet({ projectId, baseUrl });

  const handleConnectGoogle = () => {
    window.location.href = `/api/auth/google/connect?projectId=${projectId}`;
  };

  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true);
    try {
      const result = await disconnectIntegrationAction(projectId, "google");
      if (result.success) {
        toast.success("Google integration disconnected");
        setStatus((prev) => ({
          ...prev,
          google: false,
          searchConsole: false,
          analytics: false,
        }));
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(trackerSnippet);
      setCopied(true);
      toast.success("Code snippet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const checkTrackerSignal = async () => {
    setIsCheckingSignal(true);
    try {
      const result = await checkTrackerSignalAction(projectId);
      if (result.hasSignal) {
        setStatus((prev) => ({
          ...prev,
          tracker: true,
          lastSignal: result.lastSignal,
        }));
        toast.success("Tracker is receiving signals!");
      } else {
        toast.info("No signals received yet. Make sure the tracker is installed correctly.");
      }
    } catch {
      toast.error("Failed to check tracker status");
    } finally {
      setIsCheckingSignal(false);
    }
  };

  // Check signal on mount if not already receiving
  useEffect(() => {
    if (!status.tracker) {
      checkTrackerSignal();
    }
  }, []);

  return (
    <div className="flex flex-col gap-0 min-h-full">
      {/* --- WEBSITE TRACKER --- */}
      <div className="border-b border-dashed border-border/80">
        <Card variant="bento" className="border-0 rounded-none shadow-none bg-transparent px-8 py-10">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-primary/60" />
                Website Tracker
              </div>
              {status.tracker ? (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Active</Badge>
              ) : (
                <Badge variant="outline" className="uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Pending Setup</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xl font-bold tracking-tighter text-foreground mt-4 max-w-2xl">
              Track visitors, bots, and AI crawlers on your website with our
              high-reliability tracking system.
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground ml-2 inline-block cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-[10px] leading-relaxed uppercase tracking-wider">
                    Our hybrid snippet captures both standard browsers and 
                    fast-moving AI bots (like ChatGPT) by using a combination 
                    of JS and an invisible beacon.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Installation Instructions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    Add this code snippet to the <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">&lt;head&gt;</code> section of your website:
                  </p>
                </div>

                {/* Code Snippet */}
                <div className="relative group">
                  <pre className="bg-muted/30 border border-dashed border-border/60 p-6 rounded-none text-xs overflow-x-auto font-mono leading-relaxed">
                    <code>{trackerSnippet}</code>
                  </pre>
                  <Button
                    variant="dashed"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={copySnippet}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Status Check & Info */}
              <div className="flex flex-col justify-between p-8 border border-dashed border-border/60 bg-muted/5">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connection Status</h4>
                  <div className="text-sm">
                    {status.tracker ? (
                      <div className="space-y-2">
                        <p className="flex items-center text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Receiving signals
                        </p>
                        {status.lastSignal && (
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Last pulse: {new Date(status.lastSignal).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Waiting for first signal from your website...
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Need help?</span>
                    <a
                      href="#"
                      className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Documentation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Button
                    variant="dashed"
                    size="sm"
                    className="uppercase text-[10px] font-bold tracking-widest px-6"
                    onClick={checkTrackerSignal}
                    disabled={isCheckingSignal}
                  >
                    {isCheckingSignal ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-2" />
                    )}
                    Check Status
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-0 md:grid-cols-2 border-b border-dashed border-border/80">
        {/* --- GOOGLE ANALYTICS 4 --- */}
        <Card variant="bento" className="border-0 border-r border-dashed border-border/80 rounded-none shadow-none bg-transparent px-8 py-10 h-full">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-orange-500/60" />
                Google Analytics 4
              </div>
              {status.google ? (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Connected</Badge>
              ) : (
                <Badge variant="outline" className="uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xl font-bold tracking-tighter text-foreground mt-4">
              Import traffic data to correlate with AI mentions.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-2">
              {status.google ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  Ready to sync
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  Connect account to access GA4 properties
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-0 mt-8">
            {status.google ? (
              <Button
                variant="dashed"
                className="uppercase text-[10px] font-bold tracking-widest px-8 border-red-500/30 text-red-600 hover:bg-red-50"
                onClick={handleDisconnectGoogle}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
              </Button>
            ) : (
              <Button
                variant="default"
                className="uppercase text-[10px] font-bold tracking-widest px-8 h-10"
                onClick={handleConnectGoogle}
              >
                Connect with Google
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* --- GOOGLE SEARCH CONSOLE --- */}
        <Card variant="bento" className="border-0 rounded-none shadow-none bg-transparent px-8 py-10 h-full">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-blue-500/60" />
                Search Console
              </div>
              {status.google ? (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Connected</Badge>
              ) : (
                <Badge variant="outline" className="uppercase text-[9px] tracking-widest px-2 py-0 rounded-none font-bold">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xl font-bold tracking-tighter text-foreground mt-4">
              Track clicks and impressions from Search & AI Overviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-2">
              {status.google ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  Ready to sync
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  Uses the same Google connection as Analytics
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-0 mt-8">
            {status.google ? (
              <Button variant="dashed" className="uppercase text-[10px] font-bold tracking-widest px-8 opacity-50 cursor-not-allowed" disabled={true}>
                Connected via Google
              </Button>
            ) : (
              <Button
                variant="dashed"
                className="uppercase text-[10px] font-bold tracking-widest px-8 h-10"
                onClick={handleConnectGoogle}
              >
                Connect with Google
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
