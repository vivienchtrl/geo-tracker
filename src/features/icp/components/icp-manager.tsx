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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, X, MapPin, Users } from "lucide-react"
import { createIcpProfileAction, updateIcpProfileAction, deleteIcpProfileAction } from "@/features/icp/actions"
import { createIcpProfileSchema } from "@/backend/validators/icp-profiles.validators"
import type { IcpProfile } from "@/types/db"

interface IcpManagerProps {
    initialIcpProfiles: IcpProfile[]
}

// Common countries, regions, and languages
// UPDATE: Store both Name and Code (ISO 3166-1 alpha-2)
const countries = [
    { name: "United States", code: "US" },
    { name: "Canada", code: "CA" },
    { name: "United Kingdom", code: "GB" },
    { name: "France", code: "FR" },
    { name: "Germany", code: "DE" },
    { name: "Spain", code: "ES" },
    { name: "Italy", code: "IT" },
    { name: "Australia", code: "AU" },
    { name: "Japan", code: "JP" },
    { name: "South Korea", code: "KR" },
    { name: "Brazil", code: "BR" },
    { name: "Mexico", code: "MX" },
    { name: "India", code: "IN" },
    { name: "China", code: "CN" },
    { name: "Singapore", code: "SG" }
]

const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "zh", name: "中文" },
    { code: "hi", name: "हिन्दी" },
]

// UPDATE: Map regions by Country CODE, not Name
const regionsByCountry: Record<string, string[]> = {
    "US": ["California", "New York", "Texas", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"],
    "CA": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan"],
    "GB": ["England", "Scotland", "Wales", "Northern Ireland"],
    "FR": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Occitanie", "Hauts-de-France"],
    "DE": ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse"],
    "ES": ["Catalonia", "Andalusia", "Madrid", "Valencia", "Galicia"],
    "IT": ["Lombardy", "Lazio", "Campania", "Sicily", "Veneto"],
    "AU": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia"],
    "JP": ["Tokyo", "Osaka", "Kanagawa", "Aichi", "Saitama"],
    "KR": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
    "BR": ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Rio Grande do Sul", "Bahia"],
    "MX": ["Mexico City", "Jalisco", "Nuevo León", "Puebla", "Guanajuato"],
    "IN": ["Maharashtra", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "Gujarat"],
    "CN": ["Beijing", "Shanghai", "Guangdong", "Shandong", "Jiangsu"],
    "SG": ["Singapore"]
}

export function IcpManager({ initialIcpProfiles }: IcpManagerProps) {
    const [loading, setLoading] = useState(false)
    const [editingIcp, setEditingIcp] = useState<IcpProfile | null>(null)
    const [selectedCountry, setSelectedCountry] = useState<string>("")

    const form = useForm<z.infer<typeof createIcpProfileSchema>>({
        resolver: zodResolver(createIcpProfileSchema),
        defaultValues: {
            name: "",
            description: "",
            country: "",
            region: "",
            city: "",
            language: "",
        },
    })

    const handleSubmit = async (values: z.infer<typeof createIcpProfileSchema>) => {
        setLoading(true)
        try {
            if (editingIcp) {
                const res = await updateIcpProfileAction(editingIcp.id, values)
                if (res.error) throw new Error(res.error)
                toast.success("ICP profile updated successfully")
                setEditingIcp(null)
            } else {
                const res = await createIcpProfileAction(values)
                if (res.error) throw new Error(res.error)
                toast.success("ICP profile created successfully")
            }

            form.reset()
            setSelectedCountry("")
        } catch {
            toast.error(editingIcp ? "Failed to update ICP profile" : "Failed to create ICP profile")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (icp: IcpProfile) => {
        setEditingIcp(icp)
        setSelectedCountry(icp.country)
        form.setValue("name", icp.name)
        form.setValue("description", icp.description || "")
        form.setValue("country", icp.country)
        form.setValue("region", icp.region)
        form.setValue("city", icp.city)
        form.setValue("language", icp.language)
    }

    const handleDelete = async (icpId: string) => {
        try {
            const res = await deleteIcpProfileAction(icpId)
            if (res.error) throw new Error(res.error)
            toast.success("ICP profile deleted successfully")
        } catch {
            toast.error("Failed to delete ICP profile")
        }
    }

    const handleCountryChange = (country: string | null) => {
        const countryValue = country || ""
        setSelectedCountry(countryValue)
        form.setValue("country", countryValue)
        // Reset region and city when country changes
        form.setValue("region", "")
        form.setValue("city", "")
    }

    const availableRegions = selectedCountry ? regionsByCountry[selectedCountry] || [] : []

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        ICP Profiles Management
                    </CardTitle>
                    <CardDescription>
                        Define your Ideal Customer Profiles for targeted AI searches.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profile Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Tech-savvy Small Business Owner" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your ideal customer profile..."
                                                className="resize-none"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select onValueChange={handleCountryChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={country.code} value={country.code}>
                                                            {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Region/State</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountry}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableRegions.map((region) => (
                                                        <SelectItem key={region} value={region}>
                                                            {region}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., San Francisco" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Language</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {languages.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code}>
                                                            {lang.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingIcp ? "Update Profile" : "Create Profile"}
                                </Button>
                                {editingIcp && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingIcp(null)
                                            form.reset()
                                            setSelectedCountry("")
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

            {/* ICP Profiles List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your ICP Profiles</CardTitle>
                    <CardDescription>
                        Manage your Ideal Customer Profiles ({initialIcpProfiles.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {initialIcpProfiles.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No ICP profiles created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {initialIcpProfiles.map((icp) => (
                                <div
                                    key={icp.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm mb-1">{icp.name}</h4>
                                        {icp.description && (
                                            <p className="text-sm text-muted-foreground mb-2">{icp.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{icp.city}, {icp.region}, {icp.country}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {languages.find(l => l.code === icp.language)?.name || icp.language}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(icp)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(icp.id)}
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



