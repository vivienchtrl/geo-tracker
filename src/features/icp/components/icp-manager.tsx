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
        form.setValue("region", icp.region || "")
        form.setValue("city", icp.city || "")
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
        <div className="flex flex-col gap-0 min-h-full">
            <Card variant="bento" className="border-0 bg-transparent px-8 py-10 border-b border-dashed border-border/80">
                <CardHeader className="px-0 pb-8">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-3">
                        <Users className="h-3.5 w-3.5" />
                        ICP Specification
                    </CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Define Ideal Customer Profiles for high-precision AI search targeting
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                            <div className="grid gap-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Profile Identifier</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="E.G., TECH-SAVVY SMALL BUSINESS OWNER" 
                                                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Contextual Metadata</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="DESCRIBE THE CORE BEHAVIORS, PAIN POINTS, AND RESEARCH PATTERNS..."
                                                    className="min-h-[120px] rounded-none border-dashed uppercase text-xs font-bold tracking-tight leading-relaxed"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dashed border-border/80 pt-8">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Geopolitical Zone</FormLabel>
                                            <Select onValueChange={handleCountryChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full rounded-none border-dashed h-12 uppercase text-[10px] font-bold tracking-widest">
                                                        <SelectValue placeholder="SELECT COUNTRY" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={country.code} value={country.code} className="text-[10px] uppercase font-bold tracking-widest">
                                                            {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sub-Region / State</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountry}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full rounded-none border-dashed h-12 uppercase text-[10px] font-bold tracking-widest">
                                                        <SelectValue placeholder="SELECT REGION" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableRegions.map((region) => (
                                                        <SelectItem key={region} value={region} className="text-[10px] uppercase font-bold tracking-widest">
                                                            {region}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Urban Center (City)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="E.G., SAN FRANCISCO" 
                                                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Linguistic Parameter</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full rounded-none border-dashed h-12 uppercase text-[10px] font-bold tracking-widest">
                                                        <SelectValue placeholder="SELECT LANGUAGE" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {languages.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code} className="text-[10px] uppercase font-bold tracking-widest">
                                                            {lang.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-4 border-t border-dashed border-border/80 pt-8">
                                <Button type="submit" disabled={loading} className="uppercase text-[10px] font-bold tracking-widest px-8 h-10">
                                    {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    {editingIcp ? "Sync Profile" : "Initialize Profile"}
                                </Button>
                                {editingIcp && (
                                    <Button
                                        type="button"
                                        variant="dashed"
                                        className="uppercase text-[10px] font-bold tracking-widest px-8 h-10"
                                        onClick={() => {
                                            setEditingIcp(null)
                                            form.reset()
                                            setSelectedCountry("")
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
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Active ICP Registry</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                        Currently utilized profiles for AI result filtering ({initialIcpProfiles.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {initialIcpProfiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/60 bg-muted/5">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">No profiles initialized in the registry</p>
                        </div>
                    ) : (
                        <div className="grid gap-0 border border-dashed border-border/60">
                            {initialIcpProfiles.map((icp) => (
                                <div
                                    key={icp.id}
                                    className="flex items-start justify-between p-6 border-b border-dashed border-border/60 last:border-b-0 hover:bg-primary/5 transition-all group/row bg-background/20"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold uppercase tracking-tight mb-2">{icp.name}</h4>
                                        {icp.description && (
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{icp.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-[9px] uppercase font-black tracking-widest">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <MapPin className="h-3 w-3" />
                                                <span>{icp.city || 'GLOBAL'}, {icp.region || 'ALL'}, {icp.country}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] h-4 border-dashed border-border/80 bg-background/50">
                                                {languages.find(l => l.code === icp.language)?.name || icp.language}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-6">
                                        <Button
                                            size="sm"
                                            variant="dashed"
                                            className="h-8 text-[9px] uppercase font-black tracking-tighter px-3"
                                            onClick={() => handleEdit(icp)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(icp.id)}
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



