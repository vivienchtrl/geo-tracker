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
import { Loader2, Plus } from "lucide-react"

const siteSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    url: z.string().url({ message: "Please enter a valid URL." }),
})

export function SitesKeywordsForm() {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof siteSchema>>({
        resolver: zodResolver(siteSchema),
        defaultValues: {
            name: "",
            url: "",
        },
    })

    async function onSubmit(values: z.infer<typeof siteSchema>) {
        setLoading(true)
        try {
            const response = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!response.ok) throw new Error('Failed to create site')

            toast.success("Site added successfully")
            form.reset()
        } catch (error) {
            toast.error("Failed to add site")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Site</CardTitle>
                    <CardDescription>
                        Add a website to track rankings for.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My Awesome Blog" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Site
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* List of sites would go here - Mock placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Sites</CardTitle>
                    <CardDescription>Manage keywords for your sites.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No sites added yet.</p>
                </CardContent>
            </Card>
        </div>
    )
}
