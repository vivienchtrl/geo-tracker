import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["owner", "editor", "viewer"]),
  projectId: z.string().uuid("Project ID invalide"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  userId: z.string().uuid("User ID invalide"),
  projectId: z.string().uuid("Project ID invalide"),
  role: z.enum(["owner", "editor", "viewer"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token invalide"),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

