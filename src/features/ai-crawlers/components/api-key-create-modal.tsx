"use client";

/**
 * API Key Create Modal
 *
 * Modal for creating a new API key
 * Shows the plain key ONCE after creation
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, AlertTriangle, Key } from "lucide-react";

interface ApiKeyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  newlyCreatedKey: string | null;
  isLoading?: boolean;
}

export function ApiKeyCreateModal({
  isOpen,
  onClose,
  onCreate,
  newlyCreatedKey,
  isLoading,
}: ApiKeyCreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
  };

  const handleCopy = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setCopied(false);
    onClose();
  };

  // Show success view with the key
  if (newlyCreatedKey) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center border border-dashed border-green-500/40 bg-green-500/10">
                <Key className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <DialogTitle className="uppercase tracking-tight">
                  API Key Created
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest">
                  Copy your key now - it won&apos;t be shown again
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-dashed border-amber-500/40 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-[10px] uppercase tracking-widest text-amber-600">
                This is the only time your API key will be displayed. Store it
                securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Your API Key
              </Label>
              <div className="flex gap-2">
                <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-3 border border-dashed break-all">
                  {newlyCreatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto px-3"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleClose}
              className="uppercase text-[10px] font-bold tracking-widest px-8"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show create form
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tight">
            Create API Key
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest">
            Create a new key for external integrations like Cloudflare Workers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="key-name"
              className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
            >
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key-name"
              placeholder="e.g., Production Cloudflare"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs border-dashed"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="key-description"
              className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
            >
              Description (optional)
            </Label>
            <Textarea
              id="key-description"
              placeholder="e.g., Used for tracking AI crawlers on production site"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs border-dashed resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="uppercase text-[10px] tracking-widest"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="uppercase text-[10px] font-bold tracking-widest px-8"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Creating..." : "Create Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
