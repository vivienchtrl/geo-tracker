"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LocationsForm() {
    return (
        <div className="grid gap-0 border border-dashed border-border/80">
            <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Add Geolocation Target</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Configure regional tracking parameters for AI search results
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">City / Region</label>
                            <Input 
                                placeholder="E.G. NEW YORK" 
                                className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Country Code</label>
                            <Input 
                                placeholder="E.G. US" 
                                className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-dashed border-border/80 pt-8">
                        <Button className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">Register Location</Button>
                    </div>
                </CardContent>
            </Card>

            <Card variant="bento" className="border-0 border-t border-dashed border-border/80 bg-muted/5 px-8 py-10">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Configured Locations</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Active regional monitoring targets</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/60 bg-background/20">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Global tracking active (no specific filters)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
