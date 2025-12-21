import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/backend/services/user-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Shield, Bell } from "lucide-react"

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/sign-in')

  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section - Endless Borders */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Account Settings</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Personal Identity & Security
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-12 space-y-12">
        {/* Profile Section */}
        <div className="grid gap-0 border border-dashed border-border/80">
          <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
            <CardHeader className="px-0 pb-8">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-3">
                <User className="h-3.5 w-3.5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                Personal identification and access credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-10">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center border border-dashed border-border/80 bg-background text-2xl font-black tracking-tighter">
                  {initials}
                </div>
                <div>
                  <p className="text-xl font-bold uppercase tracking-tight">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'No Identity Set'}
                  </p>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mt-1">{user.email}</p>
                </div>
              </div>

              <Separator className="border-dashed" />

              {/* Form Fields */}
              <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-4">
                  <Label htmlFor="firstName" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={user.firstName || ''}
                    placeholder="FIRST NAME"
                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="lastName" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={user.lastName || ''}
                    placeholder="LAST NAME"
                    className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email Address (Registry)</Label>
                <div className="flex">
                  <div className="flex items-center px-4 border border-r-0 border-dashed border-border/80 bg-muted/20 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="rounded-none border-dashed h-12 flex-1 uppercase text-xs font-bold tracking-tight"
                  />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  Registry records are immutable. Contact support for identity updates.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="uppercase text-[10px] font-bold tracking-widest px-8 h-10" disabled>Save Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <div className="grid gap-0 border border-dashed border-border/80 bg-muted/5">
          <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
            <CardHeader className="px-0 pb-8">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-3">
                <Shield className="h-3.5 w-3.5" />
                Security & Encryption
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-widest mt-1">
                Account protection and access security
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="flex items-center justify-between p-8 border border-dashed border-border/60 bg-background/40">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Access Password</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Update your security credentials.
                  </p>
                </div>
                <Button variant="dashed" className="uppercase text-[10px] font-bold tracking-widest px-8 h-10" disabled>
                  Rotate Key
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-8 border border-dashed border-border/60 bg-background/40">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Two-Factor Authentication</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Multi-layer identity verification.
                  </p>
                </div>
                <Button variant="dashed" className="uppercase text-[10px] font-bold tracking-widest px-8 h-10" disabled>
                  Activate MFA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

