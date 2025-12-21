"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, MapPin, Loader2, Check } from "lucide-react"
import { z } from "zod"
import type { LocationStepData } from "../../types"

interface LocationStepProps {
  data: LocationStepData | null
  onComplete: (data: LocationStepData | null) => void
  onBack: () => void
  isSubmitting: boolean
}

const locationFormSchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  language: z.string().min(2, "Language is required"),
})

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
]

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
]

export function LocationStep({ data, onComplete, onBack, isSubmitting }: LocationStepProps) {
  const [enableLocation, setEnableLocation] = useState(data !== null)
  
  const form = useForm<z.infer<typeof locationFormSchema>>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: data || {
      country: "",
      region: "",
      city: "",
      language: "",
    },
  })

  function handleSubmit(values: z.infer<typeof locationFormSchema>) {
    if (enableLocation) {
      onComplete(values)
    } else {
      onComplete(null)
    }
  }

  function handleSkip() {
    onComplete(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
          <MapPin className="h-7 w-7 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Target location
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Set your target audience location for geo-specific tracking (optional)
        </p>
      </div>

      {/* Toggle Location */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-200">Enable location targeting</p>
          <p className="text-xs text-zinc-500">Track AI search results for a specific location</p>
        </div>
        <Switch
          checked={enableLocation}
          onCheckedChange={setEnableLocation}
          className="data-[state=checked]:bg-cyan-600"
        />
      </div>

      {/* Form */}
      {enableLocation && (
        <Form {...form}>
          <form id="location-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        list="countries-list"
                        placeholder="Select or type a country"
                        className="bg-zinc-900/50 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-600"
                      />
                    </FormControl>
                    <datalist id="countries-list">
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Language</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        list="languages-list"
                        placeholder="Select or type a language"
                        className="bg-zinc-900/50 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-600"
                      />
                    </FormControl>
                    <datalist id="languages-list">
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Region / State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., California, Île-de-France" 
                        className="bg-zinc-900/50 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-600"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., San Francisco, Paris" 
                        className="bg-zinc-900/50 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-600"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormDescription className="text-zinc-500 text-center">
              This helps us simulate AI search queries from your target market
            </FormDescription>
          </form>
        </Form>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex gap-3">
          {!enableLocation && (
            <Button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
          
          {enableLocation && (
            <Button
              type="submit"
              form="location-form"
              disabled={isSubmitting}
              className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
