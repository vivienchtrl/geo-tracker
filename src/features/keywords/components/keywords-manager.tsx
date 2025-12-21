'use client'

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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, X, Tag } from "lucide-react"
import { createKeywordAction, updateKeywordAction, deleteKeywordAction } from "../actions"
import type { Keyword } from "@/types/db"

const keywordsSchema = z.object({
    keywords: z.string().min(1, { message: "Please enter at least one keyword." }),
})

interface KeywordsManagerProps {
    initialKeywords: Keyword[]
}

export function KeywordsManager({ initialKeywords }: KeywordsManagerProps) {
    const [loading, setLoading] = useState(false)
    const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)

    const form = useForm<z.infer<typeof keywordsSchema>>({
        resolver: zodResolver(keywordsSchema),
        defaultValues: {
            keywords: "",
        },
    })

    const parseKeywords = (input: string): string[] => {
        return input
            .split(/[,\n]/)
            .map(k => k.trim())
            .filter(k => k.length > 0)
            .filter((k, index, arr) => arr.indexOf(k) === index)
    }

    const handleSubmit = async (values: z.infer<typeof keywordsSchema>) => {
        setLoading(true)
        try {
            const keywordTerms = parseKeywords(values.keywords)

            if (editingKeyword) {
                const res = await updateKeywordAction(editingKeyword.id, {
                    term: keywordTerms.join(', '),
                    tags: keywordTerms
                })
                if (res.error) throw new Error(res.error)
                toast.success("Keywords updated successfully")
                setEditingKeyword(null)
            } else {
                for (const term of keywordTerms) {
                    const res = await createKeywordAction(term, [term])
                    if (res.error) throw new Error(res.error)
                }
                toast.success(`${keywordTerms.length} keywords added successfully`)
            }

            form.reset()
        } catch (error) {
            toast.error(editingKeyword ? "Failed to update keywords" : "Failed to add keywords")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (keyword: Keyword) => {
        setEditingKeyword(keyword)
        form.setValue("keywords", keyword.tags?.join(', ') || keyword.term)
    }

    const handleDelete = async (keywordId: string) => {
        try {
            const res = await deleteKeywordAction(keywordId)
            if (res.error) throw new Error(res.error)
            toast.success("Keyword deleted successfully")
        } catch (error) {
            toast.error("Failed to delete keyword")
        }
    }

    const toggleKeywordStatus = async (keyword: Keyword) => {
        try {
            const res = await updateKeywordAction(keyword.id, { isActive: !keyword.isActive })
            if (res.error) throw new Error(res.error)
            toast.success(`Keyword ${!keyword.isActive ? 'activated' : 'deactivated'}`)
        } catch (error) {
            toast.error("Failed to update keyword status")
        }
    }

    return (
        <div className="flex flex-col gap-0 min-h-full">
            <Card variant="bento" className="border-0 bg-transparent px-8 py-10 border-b border-dashed border-border/80">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-3">
                        <Tag className="h-3.5 w-3.5" />
                        Keywords Intake
                    </CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Register keywords for AI-powered monitoring and intelligence collection
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                            {editingKeyword ? "Modify Existing Parameters" : "Input Vector Terms"}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="ENTER KEYWORDS SEPARATED BY COMMAS OR NEW LINES...
EXAMPLE: SEO TOOLS, MARKETING AUTOMATION, CONTENT MANAGEMENT"
                                                className="min-h-[120px] rounded-none border-dashed uppercase text-xs font-bold tracking-tight leading-relaxed"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
                                            Terms will be automatically normalized and deduplicated in the system.
                                            {field.value && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {parseKeywords(field.value).map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-[8px] h-4 uppercase font-black border-dashed border-primary/40 text-primary bg-primary/5">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </FormDescription>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4 border-t border-dashed border-border/80 pt-8">
                                <Button type="submit" disabled={loading} className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                                    {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    {editingKeyword ? "Sync Changes" : "Commit Keywords"}
                                </Button>
                                {editingKeyword && (
                                    <Button
                                        type="button"
                                        variant="dashed"
                                        className="uppercase text-[10px] font-bold tracking-widest px-8 h-10"
                                        onClick={() => {
                                            setEditingKeyword(null)
                                            form.reset()
                                        }}
                                    >
                                        Abort
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Active Terminology Registry</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Currently monitoring {initialKeywords.length} term(s) across global AI networks
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {initialKeywords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/60 bg-muted/5">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Registry is currently empty</p>
                        </div>
                    ) : (
                        <div className="grid gap-0 border border-dashed border-border/60">
                            {initialKeywords.map((keyword) => (
                                <div
                                    key={keyword.id}
                                    className="flex items-center justify-between p-6 border-b border-dashed border-border/60 last:border-b-0 hover:bg-primary/5 transition-all group/row bg-background/20"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Badge
                                                variant={keyword.isActive ? "default" : "secondary"}
                                                className="text-[8px] h-4 uppercase font-black tracking-widest"
                                            >
                                                {keyword.isActive ? "Online" : "Paused"}
                                            </Badge>
                                            {keyword.ranking !== null && (
                                                <Badge variant="outline" className="text-[8px] h-4 uppercase font-black tracking-widest border-dashed border-primary/40 text-primary">
                                                    Rank: #{keyword.ranking}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {keyword.tags?.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-[9px] h-5 px-2 uppercase font-bold tracking-tight border-dashed border-border/80 bg-background/50">
                                                    {tag}
                                                </Badge>
                                            )) || (
                                                <Badge variant="outline" className="text-[9px] h-5 px-2 uppercase font-bold tracking-tight border-dashed border-border/80 bg-background/50">
                                                    {keyword.term}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-6">
                                        <Button
                                            size="sm"
                                            variant="dashed"
                                            className="h-8 text-[9px] uppercase font-black tracking-tighter px-3"
                                            onClick={() => toggleKeywordStatus(keyword)}
                                        >
                                            {keyword.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="dashed"
                                            className="h-8 text-[9px] uppercase font-black tracking-tighter px-3"
                                            onClick={() => handleEdit(keyword)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(keyword.id)}
                                            className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-dashed hover:border-destructive/40"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

