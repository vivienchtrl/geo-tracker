"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Search, Plus, X, Sparkles } from "lucide-react"
import type { KeywordsStepData, KeywordItem } from "../../types"

interface KeywordsStepProps {
  data: KeywordsStepData
  onNext: (data: KeywordsStepData) => void
  onBack: () => void
}

const SUGGESTED_KEYWORDS = [
  "What is [your brand]",
  "Best [your product/service]",
  "[your brand] reviews",
  "[your brand] vs competitors",
  "How to use [your product]",
]

export function KeywordsStep({ data, onNext, onBack }: KeywordsStepProps) {
  const [keywords, setKeywords] = useState<KeywordItem[]>(data.keywords)
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function addKeyword(term: string) {
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

    setKeywords([...keywords, { id: crypto.randomUUID(), term: trimmed }])
    setInputValue("")
    setError(null)
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
        <p className="text-muted-foreground max-w-md mx-auto">
          Add keywords and search queries you want to track across AI search engines
        </p>
      </div>

      {/* Keyword Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a keyword and press Enter..."
          />
          <Button
            type="button"
            onClick={() => addKeyword(inputValue)}
            className="px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Keywords List */}
        <div className="min-h-[120px] p-4 rounded-xl bg-muted/30 border border-border">
          {keywords.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No keywords added yet. Add your first keyword above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="pl-3 pr-1 py-1.5 text-sm"
                >
                  {keyword.term}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword.id)}
                    className="ml-2 p-0.5 rounded-full hover:bg-background/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Suggestions (click to add)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addKeyword(suggestion)}
                className="px-3 py-1.5 text-sm rounded-lg bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-colors border border-secondary/20"
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
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="px-8"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

