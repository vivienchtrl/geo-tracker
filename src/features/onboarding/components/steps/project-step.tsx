"use client"

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
import { ArrowLeft, ArrowRight, Globe } from "lucide-react"
import { projectStepSchema, type ProjectStepInput } from "../../validators"
import type { ProjectStepData } from "../../types"

interface ProjectStepProps {
  data: ProjectStepData
  onNext: (data: ProjectStepData) => void
  onBack: () => void
}

export function ProjectStep({ data, onNext, onBack }: ProjectStepProps) {
  const form = useForm<ProjectStepInput>({
    resolver: zodResolver(projectStepSchema),
    defaultValues: data,
  })

  function handleSubmit(values: ProjectStepInput) {
    onNext(values)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-4">
          <Globe className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Set up your first website
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Add the website you want to track and monitor for AI search visibility
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Project Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="My Awesome Website" 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-emerald-500/50 text-white placeholder:text-zinc-600"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-zinc-500">
                  Give your project a memorable name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    type="url"
                    className="bg-zinc-900/50 border-zinc-800 focus:border-emerald-500/50 text-white placeholder:text-zinc-600"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-zinc-500">
                  The main domain you want to track
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
              type="submit"
              className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 px-8"
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

