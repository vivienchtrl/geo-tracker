"use client";

/**
 * Integration Snippets Component
 *
 * Displays code snippets for integrating with various platforms
 * Supports: Cloudflare Workers, Vercel Middleware, WordPress Plugin
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Download } from "lucide-react";
import {
  ALL_INTEGRATIONS,
  type IntegrationSnippet,
} from "../integrations";

function IntegrationTab({ snippet }: { snippet: IntegrationSnippet }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-tight">
            {snippet.name}
          </h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {snippet.description}
          </p>
        </div>
        <div className="flex gap-2">
          {snippet.isPlugin && snippet.downloadUrl ? (
            <a href={snippet.downloadUrl} download>
              <Button
                size="sm"
                className="h-8 gap-2 text-[10px] uppercase tracking-widest"
              >
                <Download className="h-3 w-3" />
                Download Plugin
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-[10px] uppercase tracking-widest"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Code
                </>
              )}
            </Button>
          )}
          <a
            href={snippet.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-[10px] uppercase tracking-widest"
            >
              <ExternalLink className="h-3 w-3" />
              Docs
            </Button>
          </a>
        </div>
      </div>

      <div className="border border-dashed border-border/80 bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-dashed border-border/80 bg-muted/50">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            {snippet.isPlugin ? "Preview" : snippet.filename}
          </span>
          {snippet.isPlugin && (
            <Badge variant="outline" className="text-[8px] px-1.5 py-0">
              Plugin
            </Badge>
          )}
        </div>
        <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed">
          <code className="text-foreground/90">{snippet.code}</code>
        </pre>
      </div>

      <div className="border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
          Setup Instructions
        </h5>
        <ol className="space-y-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          {snippet.instructions.map((instruction, index) => (
            <li key={index} className="flex gap-2">
              <span className="font-bold text-amber-600">{index + 1}.</span>
              {instruction}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function IntegrationSnippets() {
  return (
    <Tabs defaultValue="cloudflare" className="w-full">
      <TabsList className="bg-transparent border-dashed border border-border/60 p-1 mb-4">
        {ALL_INTEGRATIONS.map((integration) => (
          <TabsTrigger
            key={integration.id}
            value={integration.id}
            className="uppercase text-[10px] tracking-widest font-bold px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!integration.available}
          >
            {integration.name}
            {!integration.available && (
              <Badge variant="outline" className="ml-2 text-[8px] px-1.5 py-0">
                Soon
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {ALL_INTEGRATIONS.map((integration) => (
        <TabsContent key={integration.id} value={integration.id} className="mt-0">
          {integration.available ? (
            <IntegrationTab snippet={integration} />
          ) : (
            <div className="border border-dashed border-border/80 bg-muted/30 p-8 text-center">
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                {integration.name} Coming Soon
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">
                We&apos;re working on this integration
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
