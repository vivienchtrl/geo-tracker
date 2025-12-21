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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
          <Search className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          What queries matter to you?
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
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
            className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500/50 text-white placeholder:text-zinc-600"
          />
          <Button
            type="button"
            onClick={() => addKeyword(inputValue)}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Keywords List */}
        <div className="min-h-[120px] p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
          {keywords.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              No keywords added yet. Add your first keyword above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-300 border border-amber-500/20 pl-3 pr-1 py-1.5 text-sm"
                >
                  {keyword.term}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword.id)}
                    className="ml-2 p-0.5 rounded-full hover:bg-amber-500/20 transition-colors"
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
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Sparkles className="h-4 w-4" />
            <span>Suggestions (click to add)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addKeyword(suggestion)}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors border border-zinc-700/50"
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
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 px-8"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

