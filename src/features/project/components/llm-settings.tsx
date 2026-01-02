'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { updateEnabledLlmAction } from '@/features/project/actions'
import { LLM_SERVICES, type LlmService } from '@/backend/validators/project.validators'

const LLM_LABELS: Record<LlmService, { name: string; description: string }> = {
  chatgpt: { name: 'ChatGPT', description: 'OpenAI GPT-4 with web search' },
  perplexity: { name: 'Perplexity', description: 'Real-time web search AI' },
  grok: { name: 'Grok', description: 'xAI with live web access' },
  mistral: { name: 'Mistral', description: 'French AI with web search' },
  anthropic: { name: 'Claude', description: 'Anthropic Claude AI' },
  gemini: { name: 'Gemini', description: 'Google AI with grounding' },
}

interface LlmSettingsProps {
  projectId: string
  currentEnabledLlm: LlmService[]
  isOwner: boolean
}

export function LlmSettings({ projectId, currentEnabledLlm, isOwner }: LlmSettingsProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedLlms, setSelectedLlms] = useState<LlmService[]>(currentEnabledLlm)

  const hasChanges = JSON.stringify([...selectedLlms].sort()) !== JSON.stringify([...currentEnabledLlm].sort())

  const handleToggle = (llm: LlmService) => {
    setSelectedLlms(prev => {
      if (prev.includes(llm)) {
        return prev.filter(l => l !== llm)
      }
      return [...prev, llm]
    })
  }

  const handleSave = () => {
    if (selectedLlms.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one LLM must be enabled',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const result = await updateEnabledLlmAction(projectId, selectedLlms)
      if (result.success) {
        toast({
          title: 'Success',
          description: 'LLM configuration updated',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update configuration',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent px-8 py-8">
      <CardHeader className="px-0 pb-8">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          AI Scanning Configuration
        </CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
          Select which AI models will be used for brand mention scanning
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-8">
        <div className="grid gap-0 border border-dashed border-border/60">
          {LLM_SERVICES.map((llm) => (
            <label
              key={llm}
              className={`flex items-center justify-between p-6 border-b border-dashed border-border/60 last:border-b-0 cursor-pointer transition-colors ${
                isOwner ? 'hover:bg-muted/20' : ''
              } ${selectedLlms.includes(llm) ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-center gap-6">
                <Checkbox
                  checked={selectedLlms.includes(llm)}
                  onCheckedChange={() => handleToggle(llm)}
                  disabled={!isOwner || isPending}
                  className="h-5 w-5 border-dashed"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">
                    {LLM_LABELS[llm].name}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    {LLM_LABELS[llm].description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {isOwner && (
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isPending || !hasChanges || selectedLlms.length === 0}
              className="uppercase text-[10px] font-bold tracking-widest px-8 h-10"
            >
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
