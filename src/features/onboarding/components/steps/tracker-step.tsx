"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Copy, Loader2, RefreshCw, Terminal, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { checkTrackerSignalAction } from "@/features/integrations/actions"

interface TrackerStepProps {
  projectId: string
  onComplete: () => void
}

export function TrackerStep({ projectId, onComplete }: TrackerStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasSignal, setHasSignal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const trackerCode = `<script 
  src="${baseUrl}/tracker.js" 
  data-project-id="${projectId}"
  async
></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackerCode)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyConnection = async () => {
    setIsVerifying(true)
    try {
      const result = await checkTrackerSignalAction(projectId)
      if (result.hasSignal) {
        setHasSignal(true)
        toast.success("Connection verified! We've detected your website.")
      } else {
        toast.error("No signal detected yet. Make sure the code is added correctly.")
      }
    } catch {
      toast.error("Failed to verify connection. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Terminal className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Install your tracker
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Add this script to your website&apos;s <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> tag to start tracking AI crawler activity.
        </p>
      </div>

      {/* Code Snippet */}
      <Card className="relative group bg-slate-950 border-slate-800 overflow-hidden">
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed text-slate-300 overflow-x-auto">
          <pre>
            <code>{trackerCode}</code>
          </pre>
        </div>
      </Card>

      {/* Verification State */}
      <div className="flex flex-col items-center gap-4 py-4">
        {hasSignal ? (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
            <Check className="h-5 w-5" />
            <span className="font-medium">Connection Active</span>
          </div>
        ) : (
          <Button
            onClick={verifyConnection}
            disabled={isVerifying}
            variant="outline"
            className="w-full max-w-xs"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verify Connection
              </>
            )}
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-border/40">
        <Button
          onClick={onComplete}
          className="px-8 transition-all w-full max-w-xs"
        >
          {hasSignal ? "Continue" : "Verify later & Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        {!hasSignal && (
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            The tracker is optional. You can also install it later from your settings.
          </p>
        )}
      </div>
    </div>
  )
}

