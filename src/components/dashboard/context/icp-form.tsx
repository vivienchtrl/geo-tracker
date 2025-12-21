"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ICPForm() {
    return (
        <div className="grid gap-0 border border-dashed border-border/80">
            <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Ideal Customer Profile (ICP)</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Define your target persona to refine AI analysis parameters
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-8">
                    <div className="grid gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Persona Identity</label>
                            <Input 
                                placeholder="PERSONA NAME (E.G. CHIEF TECHNOLOGY OFFICER)" 
                                className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Persona Context & Behavior</label>
                            <Textarea 
                                placeholder="DESCRIBE THE CORE CHARACTERISTICS, CHALLENGES AND RESEARCH PATTERNS OF THIS PERSONA..." 
                                className="rounded-none border-dashed min-h-[150px] uppercase text-xs font-bold tracking-tight leading-relaxed"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-dashed border-border/80 pt-8">
                        <Button className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">Save Persona Profile</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
