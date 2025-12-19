"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, BarChart3, Search, Code2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { disconnectIntegrationAction, generateApiKey } from "../actions";

interface IntegrationState {
  google: boolean;
  searchConsole: boolean;
  analytics: boolean;
  tracker: boolean; // Not used in backend logic yet but kept for UI
  apiKey?: string | null;
}

interface IntegrationsClientProps {
  initialStatus: IntegrationState;
  projectId: string;
}

export function IntegrationsClient({ initialStatus, projectId }: IntegrationsClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [apiKey, setApiKey] = useState(initialStatus.apiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnectGoogle = () => {
    // Redirect to the connect route
    window.location.href = `/api/auth/google/connect?projectId=${projectId}`;
  };

  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true);
    try {
      const result = await disconnectIntegrationAction(projectId, "google");
      if (result.success) {
        toast.success("Google integration disconnected");
        setStatus(prev => ({ ...prev, google: false, searchConsole: false, analytics: false }));
      } else {
        toast.error("Failed to disconnect");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleGenerateKey = async () => {
    setIsLoading(true);
    try {
        const newKey = await generateApiKey(projectId);
        setApiKey(newKey);
        toast.success("API Key generated successfully");
    } catch {
        toast.error("Failed to generate API Key");
    } finally {
        setIsLoading(false);
    }
  };

  const copySnippet = () => {
    if (!apiKey) return;
    const snippet = `<script src="${window.location.origin}/tracker.js" data-project-id="${apiKey}" async defer></script>`;
    navigator.clipboard.writeText(snippet);
    toast.success("Snippet copied to clipboard");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* --- GOOGLE ANALYTICS 4 --- */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Google Analytics 4
             </div>
             {status.google ? <Badge className="bg-emerald-500 text-white">Connected</Badge> : <Badge variant="outline">Inactive</Badge>}
          </CardTitle>
          <CardDescription>
            Import traffic data to correlate with AI mentions.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-sm text-muted-foreground mt-2">
               {status.google ? (
                   <p className="flex items-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mr-1"/> Ready to sync</p>
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
             {status.google ? <Badge className="bg-emerald-500 text-white">Connected</Badge> : <Badge variant="outline">Inactive</Badge>}
          </CardTitle>
           <CardDescription>
            Track clicks and impressions from Search & AI Overviews.
          </CardDescription>
        </CardHeader>
         <CardContent>
             <div className="text-sm text-muted-foreground mt-2">
               {status.google ? (
                   <p className="flex items-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mr-1"/> Ready to sync</p>
               ) : (
                   <p>Uses the same Google connection as Analytics.</p>
               )}
             </div>
        </CardContent>
        <CardFooter>
            {/* Same button action as GA4 since it's one connection */}
           {status.google ? (
            <Button 
                className="w-full" 
                variant="outline"
                disabled={true}
            >
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

