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
    <div className="space-y-6">
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Inviter un membre</CardTitle>
            <CardDescription>Ajouter un nouvel utilisateur à votre projet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Select value={role} onValueChange={(value: "editor" | "viewer" | null) => setRole(value as "editor" | "viewer")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="viewer">Lecteur</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Inviter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente</CardTitle>
            <CardDescription>{invitations.length} invitation(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Invité le {new Date(invitation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{invitation.role}</Badge>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInvitationToCancel(invitation.id)}
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

      <Card>
        <CardHeader>
          <CardTitle>Membres</CardTitle>
          <CardDescription>{members.length} membre(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {(member.email ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.email}</p>
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
                {isOwner && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMemberToRemove(member.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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

