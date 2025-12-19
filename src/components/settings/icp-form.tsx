"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ICPForm() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ideal Customer Profile (ICP)</CardTitle>
                    <CardDescription>
                        Define your ICP to tailor the ranking analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Persona Name (e.g. CTO)" />
                    <Textarea placeholder="Description of the persona..." />
                    <Button>Save Profile</Button>
                </CardContent>
            </Card>
        </div>
    )
}
