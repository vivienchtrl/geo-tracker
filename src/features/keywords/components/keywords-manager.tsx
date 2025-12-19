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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Keywords Management
                    </CardTitle>
                    <CardDescription>
                        Add keywords for AI-powered searches. Separate multiple keywords with commas or new lines.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {editingKeyword ? "Edit Keywords" : "Add Keywords"}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter keywords separated by commas or new lines...
Example: SEO tools, marketing automation, content management"
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Keywords will be automatically parsed and deduplicated.
                                            {field.value && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {parseKeywords(field.value).map((tag, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingKeyword ? "Update Keywords" : "Add Keywords"}
                                </Button>
                                {editingKeyword && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingKeyword(null)
                                            form.reset()
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Keywords</CardTitle>
                    <CardDescription>
                        Manage your keywords for AI searches ({initialKeywords.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {initialKeywords.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No keywords added yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {initialKeywords.map((keyword) => (
                                <div
                                    key={keyword.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                variant={keyword.isActive ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {keyword.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            {keyword.ranking !== null && (
                                                <Badge variant="outline" className="text-xs">
                                                    Rank: {keyword.ranking}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {keyword.tags?.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            )) || (
                                                <Badge variant="outline" className="text-xs">
                                                    {keyword.term}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleKeywordStatus(keyword)}
                                        >
                                            {keyword.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(keyword)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(keyword.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
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

