'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  inviteMemberAction,
  removeMemberAction,
  cancelInvitationAction,
} from '@/features/project/members-actions';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

interface Invitation {
  id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  createdAt: string;
}

interface MembersTabProps {
  projectId: string;
  members: Member[];
  invitations: Invitation[];
  currentUserRole: 'owner' | 'editor' | 'viewer';
}

export function MembersTab({
  projectId,
  members,
  invitations,
  currentUserRole,
}: MembersTabProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(null);

  const isOwner = currentUserRole === 'owner';

  const handleInvite = async () => {
    if (!email) {
      toast({ title: "Erreur", description: "Entrez une adresse email", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await inviteMemberAction(projectId, email, role);
      if (result.success) {
        toast({ title: "Succès", description: "Invitation envoyée" });
        setEmail("");
        setRole("editor");
      } else {
        toast({ title: "Erreur", description: result.error || "Une erreur est survenue", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const result = await removeMemberAction(projectId, memberToRemove);
      if (result.success) {
        toast({ title: "Succès", description: "Membre supprimé" });
        setMemberToRemove(null);
      } else {
        toast({ title: "Erreur", description: result.error || "Une erreur est survenue", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Failed to remove member", variant: "destructive" });
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;

    try {
      const result = await cancelInvitationAction(invitationToCancel);
      if (result.success) {
        toast({ title: "Succès", description: "Invitation annulée" });
        setInvitationToCancel(null);
      } else {
            toast({ title: "Erreur", description: result.error || "Une erreur est survenue", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Failed to cancel invitation", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-0 min-h-full">
      {isOwner && (
        <Card variant="bento" className="border-0 bg-transparent px-8 py-10 border-b border-dashed border-border/80">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Invite New Collaborator</CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Grant access to your project command center</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Registry Email</label>
                <Input
                  type="email"
                  placeholder="EMAIL@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="rounded-none border-dashed h-12 uppercase text-xs font-bold tracking-tight"
                />
              </div>
              <div className="w-full sm:w-48 space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Access Level</label>
                <Select value={role} onValueChange={(value: "editor" | "viewer" | null) => setRole(value as "editor" | "viewer")}>
                  <SelectTrigger className="w-full rounded-none border-dashed h-12 uppercase text-[10px] font-bold tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor" className="text-[10px] uppercase font-bold tracking-widest">Editor</SelectItem>
                    <SelectItem value="viewer" className="text-[10px] uppercase font-bold tracking-widest">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleInvite} disabled={isLoading} className="uppercase text-[10px] font-bold tracking-widest px-8 h-12 w-full sm:w-auto">
                  {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Dispatch Invitation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && (
        <Card variant="bento" className="border-0 bg-muted/5 px-8 py-10 border-b border-dashed border-border/80">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Pending Authorizations</CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest mt-1">{invitations.length} invitation(s) awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid gap-0 border border-dashed border-border/60">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-6 border-b border-dashed border-border/60 last:border-b-0 bg-background/20 group/row">
                  <div className="flex items-center gap-6">
                    <div className="flex h-10 w-10 items-center justify-center border border-dashed border-border/80 bg-background text-muted-foreground/40">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">{invitation.email}</p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        Dispatched {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4 uppercase font-black tracking-widest border-dashed border-primary/40 text-primary">
                      {invitation.role}
                    </Badge>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInvitationToCancel(invitation.id)}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors border border-transparent hover:border-dashed hover:border-destructive/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bento" className="border-0 bg-transparent px-8 py-10">
        <CardHeader className="px-0 pb-8">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Project Registry Members</CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest mt-1">{members.length} authorized operator(s)</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid gap-0 border border-dashed border-border/60">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-6 border-b border-dashed border-border/60 last:border-b-0 group/row">
                <div className="flex items-center gap-6">
                  <div className="flex h-10 w-10 items-center justify-center border border-dashed border-border/80 bg-background text-xs font-black tracking-tighter uppercase text-muted-foreground/60">
                    {(member.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">{member.email}</p>
                  </div>
                  <Badge 
                    variant={member.role === 'owner' ? 'default' : 'secondary'}
                    className="text-[8px] h-4 uppercase font-black tracking-widest"
                  >
                    {member.role}
                  </Badge>
                </div>
                {isOwner && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMemberToRemove(member.id)}
                    className="hover:bg-destructive/10 hover:text-destructive transition-colors border border-transparent hover:border-dashed hover:border-destructive/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer le membre</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera le membre du projet. Cette action ne peut pas être annulée.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Annuler l&apos;invitation</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr ? L&apos;utilisateur n&apos;aura plus accès au lien d&apos;invitation.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvitation} className="bg-destructive">
              Annuler l&apos;invitation
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

