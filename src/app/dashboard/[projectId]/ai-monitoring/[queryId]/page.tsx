/**
 * Prompt Detail Page
 *
 * Dynamic route that displays full details of an AI search query.
 * Shows: query, response, model, rank, status, URLs found, competitors
 *
 * Breadcrumb: AI Monitoring > Query Detail
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { getQueryDetailData } from "@/features/ai-monitoring/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "./copy-button";

interface PromptDetailPageProps {
  params: Promise<{ projectId: string; queryId: string }>;
}

export default async function PromptDetailPage({
  params,
}: PromptDetailPageProps) {
  const { projectId, queryId } = await params;

  const queryDetails = await getQueryDetailData(projectId, queryId);

  if (!queryDetails) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header with Breadcrumb */}
      <div className="px-8 py-6 border-b border-dashed border-border/80 bg-muted/5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href={`/dashboard/${projectId}/ai-monitoring`}
            className="hover:text-foreground transition-colors"
          >
            AI Monitoring
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Query Detail</span>
        </nav>

        <h1 className="text-2xl font-bold tracking-tight uppercase">
          Query Detail
        </h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-3xl line-clamp-2">
          {queryDetails.query}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Query Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Query / Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed mb-4">{queryDetails.query}</p>
            <CopyButton text={queryDetails.query} label="Copy Query" />
          </CardContent>
        </Card>

        {/* Meta Info Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {queryDetails.model}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {queryDetails.rank ? `#${queryDetails.rank}` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={queryDetails.mentioned ? "default" : "outline"}
                className="text-sm"
              >
                {queryDetails.mentioned ? "Mentioned" : "Not mentioned"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatDate(queryDetails.date)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Response */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              LLM Response
            </CardTitle>
            <CardDescription>Response from {queryDetails.model}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg border border-dashed max-h-96 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
                {queryDetails.response || "No response recorded"}
              </p>
            </div>
            {queryDetails.response && (
              <div className="mt-4">
                <CopyButton text={queryDetails.response} label="Copy Response" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* URLs and Competitors */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* URLs Found */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                URLs in Results ({queryDetails.urls?.length || 0})
              </CardTitle>
              <CardDescription>
                Links found in the LLM response
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              {queryDetails.urls && queryDetails.urls.length > 0 ? (
                <div className="space-y-2">
                  {queryDetails.urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="border border-dashed rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{url.rank || idx + 1}
                        </Badge>
                        <a
                          href={url.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {url.title && (
                        <p className="text-sm font-medium mb-1 line-clamp-1">
                          {url.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {url.link}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No URLs found in response
                </p>
              )}
            </CardContent>
          </Card>

          {/* Competitors */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Competitors ({queryDetails.competitors?.length || 0})
              </CardTitle>
              <CardDescription>
                Domains mentioned in the response
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              {queryDetails.competitors && queryDetails.competitors.length > 0 ? (
                <div className="space-y-2">
                  {queryDetails.competitors.map((comp) => (
                    <div
                      key={comp}
                      className="border border-dashed rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-mono">{comp}</span>
                      <CopyButton text={comp} label="" small />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No competitors found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
