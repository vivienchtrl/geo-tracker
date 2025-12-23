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
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Globe, Sparkles, Loader2 } from "lucide-react"
import { projectStepSchema, type ProjectStepInput } from "../../validators"
import type { ProjectStepData } from "../../types"
import { analyzeWebsiteAction } from "../../actions"
import { toast } from "sonner"

interface ProjectStepProps {
  data: ProjectStepData
  onNext: (data: ProjectStepData) => void
  onBack: () => void
}

export function ProjectStep({ data, onNext, onBack }: ProjectStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const form = useForm<ProjectStepInput>({
    resolver: zodResolver(projectStepSchema),
    defaultValues: data,
  })

  async function handleAnalyze() {
    let url = form.getValues("projectUrl")
    if (!url) {
      toast.error("Please enter a domain or URL first")
      return
    }

    // Normalize URL if it's just a domain
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeWebsiteAction(url)
      if (result.success && result.metadata) {
        form.setValue("title", result.metadata.title)
        form.setValue("description", result.metadata.description)
        form.setValue("suggestedKeywords", result.metadata.suggestedKeywords || [])
        if (!form.getValues("projectName")) {
          form.setValue("projectName", result.metadata.title)
        }
        toast.success("AI Analysis complete! Please review the details below.")
      } else {
        toast.error(result.error || "Failed to analyze website")
      }
    } catch {
      toast.error("Something went wrong during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleSubmit(values: ProjectStepInput) {
    onNext(values)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Globe className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Set up your first website
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Add your website URL and let our AI discover your business services and offers.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex gap-2 items-end">
            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="google.com"
                      type="text"
                      className="h-11 rounded-none border-dashed uppercase text-xs font-bold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="h-11 rounded-none border-dashed border-primary/40 text-primary hover:bg-primary/5 px-6 uppercase text-[10px] font-bold tracking-widest"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analyze with AI
            </Button>
          </div>

          <div className={form.getValues("title") || isAnalyzing ? "space-y-6 animate-in fade-in slide-in-from-top-2 duration-500" : "hidden"}>
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Internal name for your project" 
                      className="h-11 rounded-none border-dashed uppercase text-xs font-bold"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-primary flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Business Title (AI Generated)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="The main title of your business" 
                      className="h-11 rounded-none border-dashed text-xs font-medium bg-primary/5 border-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-primary flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Services & Offers (AI Generated)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what your business does, its services and special offers..." 
                      className="min-h-[120px] rounded-none border-dashed text-xs leading-relaxed bg-primary/5 border-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

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
              type="submit"
              className="px-10 h-11 rounded-none uppercase text-[10px] font-bold tracking-widest"
              disabled={isAnalyzing || !form.getValues("description")}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

