"use client";

/**
 * API Key List Component
 *
 * Displays a table of API keys with actions:
 * - Copy prefix
 * - Revoke key
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, MoreVertical, Trash2, Check, Key } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
  scopes: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onRevoke: (keyId: string) => void;
  isLoading?: boolean;
}

export function ApiKeyList({ apiKeys, onRevoke, isLoading }: ApiKeyListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

  const handleCopy = (prefix: string, id: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeClick = (key: ApiKey) => {
    setKeyToRevoke(key);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = () => {
    if (keyToRevoke) {
      onRevoke(keyToRevoke.id);
      setRevokeDialogOpen(false);
      setKeyToRevoke(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (apiKeys.length === 0) {
    return (
      <div className="border border-dashed border-border/80 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 flex items-center justify-center border border-dashed border-muted-foreground/40 bg-muted/5">
            <Key className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
          No API keys created yet
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">
          Create a key to start integrating with your website
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-dashed border-border/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dashed border-border/80 bg-muted/30">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Key Prefix
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Last Used
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr
                key={key.id}
                className="border-b border-dashed border-border/80 last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">
                      {key.name}
                    </p>
                    {key.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {key.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono bg-muted/50 px-2 py-1 border border-dashed">
                      {key.prefix}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopy(key.prefix, key.id)}
                    >
                      {copiedId === key.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(key.lastUsedAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(key.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isLoading}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRevokeClick(key)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke Key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase tracking-tight">
              Revoke API Key
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] uppercase tracking-wider">
              Are you sure you want to revoke &quot;{keyToRevoke?.name}&quot;?
              This action cannot be undone and any integrations using this key
              will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="uppercase text-[10px] tracking-widest">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              className="uppercase text-[10px] tracking-widest bg-destructive hover:bg-destructive/90"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
