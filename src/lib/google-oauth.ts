import { google } from 'googleapis';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback safe for server-side if variable is missing but usually it should be there
  return "http://localhost:3000";
};

export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${getBaseUrl()}/api/auth/google/callback`,
};

if (!googleConfig.clientId || !googleConfig.clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

export const oauth2Client = new google.auth.OAuth2(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectUri
);

// Scopes nécessaires pour GSC et GA4
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly', // Search Console
  'https://www.googleapis.com/auth/analytics.readonly',  // GA4
  'email',
  'profile'
];

export function getAuthUrl(projectId: string) {
  if (!googleConfig.clientId || !googleConfig.clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important pour avoir le refresh_token
    scope: GOOGLE_SCOPES,
    state: projectId, // On passe l'ID du projet dans le state pour le récupérer au callback
    prompt: 'consent', // Force le consentement pour avoir le refresh_token à chaque fois
    include_granted_scopes: true 
  });
}
