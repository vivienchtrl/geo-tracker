'use client';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Copy, Check } from "lucide-react";
import { getQueryDetailData } from "@/features/ai-monitoring/actions";

interface QueryDetails {
  id: string;
  query: string;
  response: string;
  model: string;
  rank: number | null;
  mentioned: boolean;
  date: Date | null;
  urls: { link: string; rank: number; title: string }[];
  competitors: string[];
}

interface QueryDetailSectionProps {
  projectId: string;
  queryId: string;
  onClose: () => void;
}

export function QueryDetailSection({
  projectId,
  queryId,
  onClose,
}: QueryDetailSectionProps) {
  const [queryDetails, setQueryDetails] = useState<QueryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getQueryDetailData(projectId, queryId);
        setQueryDetails(data as QueryDetails);
      } catch (error) {
        console.error("Error loading query details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [projectId, queryId]);

  return (
    <div className="border-t border-dashed pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Query Detail
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading query details...</div>
      ) : queryDetails ? (
        <QueryDetailContent queryDetails={queryDetails} />
      ) : (
        <div className="text-muted-foreground">No data found for this query</div>
      )}
    </div>
  );
}

function QueryDetailContent({
  queryDetails,
}: {
  queryDetails: QueryDetails;
}) {

  return (
    <div className="space-y-6">
      {/* Query Text */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="uppercase tracking-wider">Query</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{queryDetails.query}</p>
          <CopyButton text={queryDetails.query} label="Copy Query" />
        </CardContent>
      </Card>

      {/* Meta Info Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">Model</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{queryDetails.model}</Badge>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {queryDetails.rank ? `#${queryDetails.rank}` : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={queryDetails.mentioned ? "default" : "secondary"}>
              {queryDetails.mentioned ? "✓ Mentioned" : "Not mentioned"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {queryDetails.date
                ? new Date(queryDetails.date).toLocaleDateString()
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="uppercase tracking-wider">Response</CardTitle>
          <CardDescription>From {queryDetails.model}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg border border-dashed max-h-64 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {queryDetails.response}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* URLs and Competitors */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              URLs in Results ({queryDetails.urls.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2">
            {queryDetails.urls.map((url, idx) => (
              <div key={idx} className="border border-dashed rounded p-2 text-xs">
                <p className="font-semibold mb-1">#{url.rank}</p>
                <p className="font-mono truncate">{url.link}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Competitors ({queryDetails.competitors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2">
            {queryDetails.competitors.map((comp) => (
              <div key={comp} className="border border-dashed rounded p-2 flex items-center justify-between">
                <span className="text-xs font-mono">{comp}</span>
                <CopyButton text={comp} label="" small />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CopyButton({
  text,
  label,
  small = false,
}: {
  text: string;
  label: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size={small ? "sm" : "default"}
      className={small ? "" : "gap-2"}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {label && label}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label && label}
        </>
      )}
    </Button>
  );
}

