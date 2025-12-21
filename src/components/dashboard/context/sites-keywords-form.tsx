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
        <div className="grid gap-0 border border-dashed border-border/80 min-h-[400px]">
            <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Add New Site</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Configure a new target website for AI tracking
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-12">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Site Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="MY AWESOME BLOG" 
                                                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Website URL</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="HTTPS://EXAMPLE.COM" 
                                                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end border-t border-dashed border-border/80 pt-8">
                                <Button type="submit" disabled={loading} className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                                    {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                                    Register Site
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card variant="bento" className="border-0 border-t border-dashed border-border/80 bg-muted/5 px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Active Sites</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Manage search parameters for your registered domains</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/60 bg-background/20">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">No sites registered in the database</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
