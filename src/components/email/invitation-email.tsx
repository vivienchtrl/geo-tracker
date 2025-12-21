import React from "react";

interface InvitationEmailProps {
  invitedBy: string;
  projectName: string;
  role: string;
  invitationLink: string;
}

export const InvitationEmail: React.FC<InvitationEmailProps> = ({
  invitedBy,
  projectName,
  role,
  invitationLink,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px" }}>
    <h2>Vous avez été invité à rejoindre {projectName}</h2>
    <p>{invitedBy} vous a invité à rejoindre le projet &quot;{projectName}&quot; en tant que {role}.</p>

    <a
      href={invitationLink}
      style={{
        display: "inline-block",
        padding: "12px 24px",
        backgroundColor: "#3b82f6",
        color: "white",
        textDecoration: "none",
        borderRadius: "6px",
        marginTop: "20px",
      }}
    >
      Accepter l&apos;invitation
    </a>

    <p style={{ marginTop: "40px", fontSize: "12px", color: "#666" }}>
      Ce lien expire dans 7 jours.
    </p>
  </div>
);

