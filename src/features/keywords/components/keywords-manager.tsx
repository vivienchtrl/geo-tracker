'use client'

import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, X, Tag, Sparkles } from "lucide-react"
import { createKeywordAction, updateKeywordAction, deleteKeywordAction, generateAIPromptAction } from "../actions"
import type { Keyword } from "@/types/db"
import { keywordsTagsEnum } from "@/backend/validators/keywords.validators"

const keywordsSchema = z.object({
    term: z.string().min(1, { message: "Please enter a sentence request." }),
    keywords: z.string().min(1, { message: "Please enter specific keywords." }),
    keywordsTags: z.enum(keywordsTagsEnum),
})

interface KeywordsManagerProps {
    initialKeywords: Keyword[]
}

export function KeywordsManager({ initialKeywords }: KeywordsManagerProps) {
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
    const [aiPrompt, setAiPrompt] = useState<string | null>(null)

    const form = useForm<z.infer<typeof keywordsSchema>>({
        resolver: zodResolver(keywordsSchema),
        defaultValues: {
            term: "",
            keywords: "",
            keywordsTags: "generic",
        },
    })

    const handleSubmit = async (values: z.infer<typeof keywordsSchema>) => {
        setLoading(true)
        try {
            if (editingKeyword) {
                const res = await updateKeywordAction(editingKeyword.id, values)
                if (res.error) throw new Error(res.error)
                toast.success("Keyword updated successfully")
                setEditingKeyword(null)
            } else {
                const res = await createKeywordAction({ ...values, isActive: true })
                if (res.error) throw new Error(res.error)
                toast.success("Keyword added to registry")
            }

            form.reset()
            setAiPrompt(null)
        } catch (error) {
            console.error(error)
            toast.error(editingKeyword ? "Failed to update keyword" : "Failed to add keyword")
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePrompt = async () => {
        const keywordsValue = form.getValues("keywords")
        const intentValue = form.getValues("keywordsTags")

        if (!keywordsValue) {
            toast.error("Please enter keywords first")
            return
        }

        setAiLoading(true)
        try {
            const res = await generateAIPromptAction(keywordsValue, intentValue)
            if (res.error) throw new Error(res.error)
            if (res.data) {
                setAiPrompt(res.data.suggestion)
                toast.success("AI Prompt generated with Mistral")
            }
        } catch {
            toast.error("Failed to generate AI prompt")
        } finally {
            setAiLoading(false)
        }
    }

    const handleEdit = (keyword: Keyword) => {
        setEditingKeyword(keyword)
        form.setValue("term", keyword.term)
        form.setValue("keywords", keyword.keywords || "")
        form.setValue("keywordsTags", keyword.keywordsTags as (typeof keywordsTagsEnum)[number] || "generic")
        setAiPrompt(null)
    }

    const handleDelete = async (keywordId: string) => {
        try {
            const res = await deleteKeywordAction(keywordId)
            if (res.error) throw new Error(res.error)
            toast.success("Keyword deleted successfully")
        } catch {
            toast.error("Failed to delete keyword")
        }
    }

    const toggleKeywordStatus = async (keyword: Keyword) => {
        try {
            const res = await updateKeywordAction(keyword.id, { isActive: !keyword.isActive })
            if (res.error) throw new Error(res.error)
            toast.success(`Keyword ${!keyword.isActive ? 'activated' : 'deactivated'}`)
        } catch {
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="term"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                    Sentence Request
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="HOW TO TRACK SEO RANKING..."
                                                        className="h-12 rounded-none border-dashed uppercase text-xs font-bold tracking-tight"
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
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                    Specific Keywords
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="SEO TRACKER, RANK TRACKING, SEARCH CONSOLE..."
                                                        className="min-h-[100px] rounded-none border-dashed uppercase text-xs font-bold tracking-tight leading-relaxed"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="keywordsTags"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                    Strategy Intent
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 rounded-none border-dashed uppercase text-xs font-bold tracking-tight">
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

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                Mistral AI Copilot
                                            </label>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={handleGeneratePrompt}
                                                disabled={aiLoading}
                                                className="h-6 text-[8px] uppercase font-black tracking-widest gap-2 hover:bg-primary/10"
                                            >
                                                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                Generate Strategy Prompt
                                            </Button>
                                        </div>
                                        <div className="min-h-[100px] p-4 border border-dashed border-primary/20 bg-primary/5 relative overflow-hidden group">
                                            {!aiPrompt && !aiLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Awaiting Input Parameters</p>
                                                </div>
                                            )}
                                            {aiLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                </div>
                                            )}
                                            {aiPrompt && (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <p className="text-[10px] font-mono leading-relaxed text-primary/80 whitespace-pre-wrap">{aiPrompt}</p>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-primary/20"
                                                        onClick={() => setAiPrompt(null)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 border-t border-dashed border-border/80 pt-8">
                                <Button type="submit" disabled={loading} className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                                    {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    {editingKeyword ? "Sync Changes" : "Commit to Registry"}
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
                                            <Badge variant="outline" className="text-[9px] h-5 px-2 uppercase font-bold tracking-tight border-dashed border-border/80 bg-background/50">
                                                {keyword.term}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[8px] h-4 px-1.5 font-black uppercase tracking-widest bg-muted/30">
                                                {keyword.keywordsTags || "generic"}
                                            </Badge>
                                        </div>
                                        {keyword.keywords && (
                                            <div className="mt-3 flex flex-wrap gap-1.5 opacity-60">
                                                {(typeof keyword.keywords === 'string' 
                                                    ? keyword.keywords.split(',') 
                                                    : Array.isArray(keyword.keywords) 
                                                        ? keyword.keywords 
                                                        : []
                                                ).map((k, i) => (
                                                    <span key={i} className="text-[8px] uppercase tracking-tighter font-bold bg-muted/20 px-1.5 py-0.5 border border-dashed border-border/40">
                                                        {String(k).trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
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

