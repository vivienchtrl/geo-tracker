"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, User, Globe, ArrowRight } from "lucide-react"
import { completeOnboarding } from "@/app/auth/onboarding/actions"

const onboardingSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
    projectName: z.string().min(2, { message: "Project name must be at least 2 characters." }),
    projectUrl: z.string().url({ message: "Please enter a valid URL." }),
})

export function OnboardingForm() {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof onboardingSchema>>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            projectName: "",
            projectUrl: "",
        },
    })

    async function onSubmit(values: z.infer<typeof onboardingSchema>) {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('firstName', values.firstName)
            formData.append('lastName', values.lastName)
            formData.append('projectName', values.projectName)
            formData.append('projectUrl', values.projectUrl)

            await completeOnboarding(formData)

            toast.success("Welcome! Your account has been set up successfully.")
        } catch (error) {
            toast.error("Failed to complete onboarding. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Welcome to Geo Tracker! 🎉
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-2">
                        Let's set up your account and first project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
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
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Project Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="h-5 w-5 text-green-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Your First Project</h3>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="projectName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="My Awesome Website" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Give your project a descriptive name
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
                                            <FormLabel>Website URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com"
                                                    type="url"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The main domain you want to track
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-lg py-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Setting up your account...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}





