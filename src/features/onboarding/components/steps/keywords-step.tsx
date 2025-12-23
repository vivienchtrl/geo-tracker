"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Search, Plus, X, Sparkles, Loader2 } from "lucide-react"
import type { KeywordsStepData, KeywordItem } from "../../types"
import { suggestQueryForKeywordAction } from "../../actions"
import { toast } from "sonner"
import { cn } from "@/utils/utils"

interface KeywordsStepProps {
  data: KeywordsStepData
  onNext: (data: KeywordsStepData) => void
  onBack: () => void
  suggestions?: string[]
}

export function KeywordsStep({ data, onNext, onBack, suggestions = [] }: KeywordsStepProps) {
  const [keywords, setKeywords] = useState<KeywordItem[]>(data.keywords)
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const finalSuggestions = suggestions.length > 0 ? suggestions : [
    "SEO Tracker",
    "AI Content Marketing",
    "Search Intent Analysis",
    "Competitor Monitoring",
    "Brand Awareness",
  ]

  async function addKeyword(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    
    if (trimmed.length < 2) {
      setError("Keyword must be at least 2 characters")
      return
    }

    if (keywords.some(k => k.term.toLowerCase() === trimmed.toLowerCase())) {
      setError("This keyword already exists")
      return
    }

    if (keywords.length >= 50) {
      setError("Maximum 50 keywords allowed")
      return
    }

    const newId = crypto.randomUUID()
    const newKeyword: KeywordItem = { id: newId, term: trimmed }
    setKeywords([...keywords, newKeyword])
    setInputValue("")
    setError(null)

    // Automatically generate AI term
    setIsGenerating(newId)
    try {
      const result = await suggestQueryForKeywordAction(trimmed)
      if (result.success && result.suggestion) {
        setKeywords(prev => prev.map(k => 
          k.id === newId ? { ...k, generatedTerm: result.suggestion } : k
        ))
      }
    } catch {
      // Fallback silently to the original term
    } finally {
      setIsGenerating(null)
    }
  }

  function removeKeyword(id: string) {
    setKeywords(keywords.filter(k => k.id !== id))
    setError(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(inputValue)
    }
  }

  function handleNext() {
    if (keywords.length === 0) {
      setError("Please add at least one keyword")
      return
    }
    onNext({ keywords })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Search className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          What queries matter to you?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Add keywords. Our AI will automatically transform them into natural search queries.
        </p>
      </div>

      {/* Keyword Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a keyword (e.g. SEO) and press Enter..."
            className="h-11 rounded-none border-dashed uppercase text-xs font-bold"
          />
          <Button
            type="button"
            onClick={() => addKeyword(inputValue)}
            className="h-11 px-6 rounded-none uppercase text-[10px] font-bold tracking-widest"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {error && (
          <p className="text-xs font-bold uppercase text-destructive tracking-tight">{error}</p>
        )}

        {/* Keywords List */}
        <div className="min-h-[150px] p-6 rounded-none border border-dashed border-border bg-muted/5">
          {keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-40">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Registry is empty</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {keywords.map((keyword) => (
                <div 
                  key={keyword.id}
                  className="flex flex-col gap-2 p-3 bg-background border border-dashed border-border hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="rounded-none border-dashed border-primary/40 text-primary bg-primary/5 uppercase text-[9px] font-black"
                    >
                      Vector: {keyword.term}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-start gap-2 pt-1">
                    <Sparkles className={cn(
                      "h-3 w-3 mt-1 text-primary/60 shrink-0",
                      isGenerating === keyword.id && "animate-pulse"
                    )} />
                    {isGenerating === keyword.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin opacity-40" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Generating AI Query...</span>
                      </div>
                    ) : (
                      <p className="text-[11px] font-mono leading-relaxed text-muted-foreground">
                        {keyword.generatedTerm || keyword.term}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
            <Sparkles className="h-3 w-3" />
            <span>Smart Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {finalSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addKeyword(suggestion)}
                className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-tight rounded-none bg-secondary/5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-dashed border-border hover:border-primary/40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          className="text-[10px] uppercase font-bold tracking-widest"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="px-10 h-11 rounded-none uppercase text-[10px] font-bold tracking-widest"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

