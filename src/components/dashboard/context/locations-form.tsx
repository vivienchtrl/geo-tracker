"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LocationsForm() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Location</CardTitle>
                    <CardDescription>
                        Target specific locations for your ranking checks.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input placeholder="City Name (e.g. New York)" />
                        <Input placeholder="Country Code (e.g. US)" />
                    </div>
                    <Button className="mt-4">Add Location</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No locations added yet.</p>
                </CardContent>
            </Card>
        </div>
    )
}
