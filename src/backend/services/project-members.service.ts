import { db } from "@/backend/db/db";
import { projectMembers } from "@/backend/db/tables/project-members";
import { projectInvitations } from "@/backend/db/tables/project-invitations";
import { users } from "@/backend/db/tables/user";
import { eq, and, isNull } from "drizzle-orm";
import type {
  InviteMemberInput,
  UpdateMemberRoleInput,
  AcceptInvitationInput,
} from "@/backend/validators/project-members.validators";

// Generate secure token
function generateInvitationToken(): string {
  return crypto.randomUUID();
}

// Invite a member to a project
export async function inviteMember(projectId: string, data: InviteMemberInput) {
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Create or update invitation
  const result = await db
    .insert(projectInvitations)
    .values({
      projectId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: projectInvitations.email,
      set: {
        token,
        expiresAt,
        role: data.role,
      },
    })
    .returning();

  return result[0];
}

// Accept invitation
export async function acceptInvitation(
  userId: string,
  userEmail: string,
  data: AcceptInvitationInput
) {
  // Find and validate invitation
  const invitations = await db
    .select()
    .from(projectInvitations)
    .where(
      and(
        eq(projectInvitations.token, data.token),
        eq(projectInvitations.email, userEmail),
        isNull(projectInvitations.acceptedAt)
      )
    )
    .limit(1);

  const invitation = invitations[0];

  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }

  if (new Date() > invitation.expiresAt) {
    throw new Error("Invitation has expired");
  }

  // Add as member and mark invitation as accepted
  await db.transaction(async (tx) => {
    await tx.insert(projectMembers).values({
      projectId: invitation.projectId,
      userId,
      role: invitation.role,
    });

    await tx
      .update(projectInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(projectInvitations.id, invitation.id));
  });

  return { projectId: invitation.projectId, role: invitation.role };
}

// Get pending invitations for a project
export async function getPendingInvitations(projectId: string) {
  return await db
    .select()
    .from(projectInvitations)
    .where(
      and(eq(projectInvitations.projectId, projectId), isNull(projectInvitations.acceptedAt))
    );
}

// Get project members with their roles and user info
export async function getProjectMembers(projectId: string) {
  return await db
    .select({
      id: projectMembers.id,
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      role: projectMembers.role,
      createdAt: projectMembers.createdAt,
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId));
}

// Get user role in a project
export async function getUserProjectRole(projectId: string, userId: string) {
  const member = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);
    
  if (member.length > 0) return member[0].role;
  
  // Check if owner
  const project = await db.query.project.findFirst({
      where: (p, { eq }) => eq(p.id, projectId),
      columns: { ownerId: true }
  });
  
  if (project && project.ownerId === userId) return 'owner';
  
  return null;
}

// Update member role
export async function updateMemberRole(data: UpdateMemberRoleInput) {
  await db
    .update(projectMembers)
    .set({ role: data.role })
    .where(
      and(
        eq(projectMembers.projectId, data.projectId),
        eq(projectMembers.userId, data.userId)
      )
    );
}

// Remove member
export async function removeMember(projectId: string, userId: string) {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    );
}

// Cancel invitation
export async function cancelInvitation(invitationId: string) {
  await db
    .delete(projectInvitations)
    .where(eq(projectInvitations.id, invitationId));
}
