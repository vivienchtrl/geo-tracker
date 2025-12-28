"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label?: string;
  small?: boolean;
}

export function CopyButton({ text, label = "", small = false }: CopyButtonProps) {
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
      className={small ? "h-8 w-8 p-0" : "gap-2"}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {label && <span>{label}</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}
