'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  acceptInvitationSchema,
  updateMemberRoleSchema,
} from "@/backend/validators/project-members.validators";
import {
  inviteMember,
  acceptInvitation,
  getPendingInvitations,
  getProjectMembers,
  updateMemberRole,
  removeMember,
  cancelInvitation,
} from "@/backend/services/project-members.service";

async function getSessionUser() {
  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function inviteMemberAction(
  projectId: string,
  email: string,
  role: "owner" | "editor" | "viewer"
) {
  try {
    // Create invitation
    const invitation = await inviteMember(
      projectId,
      { email, role, projectId: projectId }
    );

    // TODO: Send email with Resend
    // const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${invitation.token}`;
    // await resend.emails.send({ ... })

    revalidatePath(`/dashboard/settings`);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to invite member",
    };
  }
}

export async function acceptInvitationAction(token: string) {
  try {
    const user = await getSessionUser();

    // Validate input
    const validation = acceptInvitationSchema.safeParse({ token });

    if (!validation.success) {
      return {
        success: false,
        error: "Invalid token",
      };
    }

    // Accept invitation
    const result = await acceptInvitation(
      user.id,
      user.email!,
      validation.data
    );

    revalidatePath("/dashboard");
    return { success: true, projectId: result.projectId };
    } catch {
    return {
      success: false,
      error: "Failed to accept invitation",
    };
  }
}

export async function getPendingInvitationsAction(projectId: string) {
  try {
    await getSessionUser();

    return {
      success: true,
      data: await getPendingInvitations(projectId),
    };
  } catch {
    return {
      success: false,
      error: "Failed to get invitations",
    };
  }
}

export async function getProjectMembersAction(projectId: string) {
  try {
    const user = await getSessionUser();

    // Verify user has access
    const supabase = await createClient(cookies());
    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (project?.owner_id !== user.id) {
      throw new Error("Unauthorized");
    }

    return {
      success: true,
      data: await getProjectMembers(projectId),
    };
  } catch {
    return {
      success: false,
      error: "Failed to get members",
    };
  }
}

export async function updateMemberRoleAction(
  projectId: string,
  userId: string,
  role: "owner" | "editor" | "viewer"
) {
  try {
    const user = await getSessionUser();

    const validation = updateMemberRoleSchema.safeParse({
      projectId,
      userId,
      role,
    });

    if (!validation.success) {
      return {
        success: false,
        error: "Invalid data",
      };
    }

    // Verify user owns the project
    const supabase = await createClient(cookies());
    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (project?.owner_id !== user.id) {
      throw new Error("Unauthorized");
    }

    await updateMemberRole(validation.data);

    revalidatePath(`/dashboard/settings`);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update member role",
    };
  }
}

export async function removeMemberAction(projectId: string, userId: string) {
  try {
    const user = await getSessionUser();

    // Verify user owns the project
    const supabase = await createClient(cookies());
    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (project?.owner_id !== user.id) {
      throw new Error("Unauthorized");
    }

    await removeMember(projectId, userId);

    revalidatePath(`/dashboard/settings`);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to remove member",
    };
  }
}

export async function cancelInvitationAction(invitationId: string) {
  try {
    const user = await getSessionUser();

    // Verify user owns the project (need to fetch invitation first)
    const supabase = await createClient(cookies());
    const { data: invitation } = await supabase
      .from("project_invitations")
      .select("project_id")
      .eq("id", invitationId)
      .single();

    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", invitation?.project_id)
      .single();

    if (project?.owner_id !== user.id) {
      throw new Error("Unauthorized");
    }

    await cancelInvitation(invitationId);

    revalidatePath(`/dashboard/settings`);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to cancel invitation",
    };
  }
}

