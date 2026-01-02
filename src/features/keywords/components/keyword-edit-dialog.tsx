'use client'

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updateKeywordAction } from "../actions"
import type { Keyword } from "@/types/db"
import { keywordsTagsEnum } from "@/backend/validators/keywords.validators"

const keywordsSchema = z.object({
    term: z.string().min(1, { message: "Please enter a sentence request." }),
    keywords: z.string().min(1, { message: "Please enter specific keywords." }),
    keywordsTags: z.enum(keywordsTagsEnum),
})

interface KeywordEditDialogProps {
    keyword: Keyword | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function KeywordEditDialog({ keyword, open, onOpenChange }: KeywordEditDialogProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof keywordsSchema>>({
        resolver: zodResolver(keywordsSchema),
        defaultValues: {
            term: "",
            keywords: "",
            keywordsTags: "generic",
        },
    })

    useEffect(() => {
        if (keyword && open) {
            form.setValue("term", keyword.term)
            form.setValue("keywords", keyword.keywords || "")
            form.setValue("keywordsTags", keyword.keywordsTags as (typeof keywordsTagsEnum)[number] || "generic")
        }
    }, [keyword, open, form])

    const handleSubmit = async (values: z.infer<typeof keywordsSchema>) => {
        if (!keyword) return

        setLoading(true)
        try {
            const res = await updateKeywordAction(keyword.id, values)
            if (res.error) throw new Error(res.error)
            toast.success("Keyword updated successfully")
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update keyword")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] rounded-none border-dashed">
                <DialogHeader>
                    <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                        Edit Keyword
                    </DialogTitle>
                    <DialogDescription className="text-[9px] uppercase tracking-widest">
                        Update keyword configuration and strategy
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="term"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                        Sentence Request
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="HOW TO TRACK SEO RANKING..."
                                            className="h-10 rounded-none border-dashed uppercase text-xs font-bold tracking-tight"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                        Specific Keywords
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="SEO TRACKER, RANK TRACKING, SEARCH CONSOLE..."
                                            className="min-h-[80px] rounded-none border-dashed uppercase text-xs font-bold tracking-tight leading-relaxed"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="keywordsTags"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                        Strategy Intent
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-none border-dashed uppercase text-xs font-bold tracking-tight">
                                                <SelectValue placeholder="Select intent" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-none border-dashed uppercase text-xs font-bold">
                                            {keywordsTagsEnum.map((tag) => (
                                                <SelectItem key={tag} value={tag}>
                                                    {tag}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 border-t border-dashed border-border/80">
                            <Button
                                type="button"
                                variant="dashed"
                                className="uppercase text-[10px] font-bold tracking-widest px-6 h-9"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="uppercase text-[10px] font-bold tracking-widest px-6 h-9"
                            >
                                {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
