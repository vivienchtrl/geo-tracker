'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { X, Pencil } from "lucide-react"
import { updateKeywordAction, deleteKeywordAction } from "../actions"
import { KeywordEditDialog } from "./keyword-edit-dialog"
import type { Keyword } from "@/types/db"

interface KeywordsManagerProps {
    initialKeywords: Keyword[]
}

export function KeywordsManager({ initialKeywords }: KeywordsManagerProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
    const [togglingKeywordId, setTogglingKeywordId] = useState<string | null>(null)

    const handleEdit = (keyword: Keyword) => {
        setEditingKeyword(keyword)
        setEditDialogOpen(true)
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
        setTogglingKeywordId(keyword.id)
        try {
            const res = await updateKeywordAction(keyword.id, { isActive: !keyword.isActive })
            if (res.error) throw new Error(res.error)
            toast.success(`Keyword ${!keyword.isActive ? 'activated' : 'deactivated'}`)
        } catch {
            toast.error("Failed to update keyword status")
        } finally {
            setTogglingKeywordId(null)
        }
    }

return (
    <div>
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
                                    <div className="flex items-center gap-4 ml-6">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={keyword.isActive ?? false}
                                                onCheckedChange={() => toggleKeywordStatus(keyword)}
                                                disabled={togglingKeywordId === keyword.id}
                                                size="sm"
                                            />
                                            <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground w-12">
                                                {keyword.isActive ? "On" : "Off"}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="dashed"
                                            className="h-8 text-[9px] uppercase font-black tracking-tighter px-3 gap-1.5"
                                            onClick={() => handleEdit(keyword)}
                                        >
                                            <Pencil className="h-3 w-3" />
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

            <KeywordEditDialog
                keyword={editingKeyword}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </div>
    )
}

