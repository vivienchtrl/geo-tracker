"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ArrowRight, User } from "lucide-react"
import { userStepSchema, type UserStepInput } from "../../validators"
import type { UserStepData } from "../../types"

interface UserInfoStepProps {
  data: UserStepData
  onNext: (data: UserStepData) => void
}

export function UserInfoStep({ data, onNext }: UserInfoStepProps) {
  const form = useForm<UserStepInput>({
    resolver: zodResolver(userStepSchema),
    defaultValues: data,
  })

  function handleSubmit(values: UserStepInput) {
    onNext(values)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Let&apos;s get to know you
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tell us a bit about yourself so we can personalize your experience
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Doe" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="px-8"
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

