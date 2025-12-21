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
  const trackerSnippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/tracker.js" data-project-id="${projectId}" async defer></script>
<noscript>
  <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/tracking/pixel?projectId=${projectId}" style="position:absolute; left:-9999px;" alt="" />
</noscript>`;

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* --- WEBSITE TRACKER --- */}
      <Card className="border-l-4 border-l-emerald-500 md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-500" />
              Website Tracker
            </div>
            {status.tracker ? (
              <Badge className="bg-emerald-500 text-white">Active</Badge>
            ) : (
              <Badge variant="outline">Pending Setup</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Track visitors, bots, and AI crawlers on your website with our
            lightweight tracking script.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Installation Instructions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Installation</h4>
            <p className="text-sm text-muted-foreground">
              Add this code snippet to the <code className="bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> section of your website:
            </p>
          </div>

          {/* Code Snippet */}
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">
              <code>{trackerSnippet}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={copySnippet}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Status Check */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              {status.tracker ? (
                <p className="flex items-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Receiving signals
                  {status.lastSignal && (
                    <span className="text-muted-foreground ml-2">
                      (Last: {new Date(status.lastSignal).toLocaleString()})
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Waiting for first signal from your website...
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkTrackerSignal}
              disabled={isCheckingSignal}
            >
              {isCheckingSignal ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Check Status
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <span>Need help?</span>
            <a
              href="#"
              className="text-primary hover:underline flex items-center gap-1"
            >
              View documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* --- GOOGLE ANALYTICS 4 --- */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Google Analytics 4
            </div>
            {status.google ? (
              <Badge className="bg-emerald-500 text-white">Connected</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Import traffic data to correlate with AI mentions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-2">
            {status.google ? (
              <p className="flex items-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Ready to sync
              </p>
            ) : (
              <p>Connect your Google account to access GA4 properties.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {status.google ? (
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDisconnectGoogle}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="default"
              onClick={handleConnectGoogle}
            >
              Connect with Google
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* --- GOOGLE SEARCH CONSOLE --- */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Search Console
            </div>
            {status.google ? (
              <Badge className="bg-emerald-500 text-white">Connected</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Track clicks and impressions from Search & AI Overviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-2">
            {status.google ? (
              <p className="flex items-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Ready to sync
              </p>
            ) : (
              <p>Uses the same Google connection as Analytics.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {status.google ? (
            <Button className="w-full" variant="outline" disabled={true}>
              Connected via Google
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleConnectGoogle}
            >
              Connect with Google
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
