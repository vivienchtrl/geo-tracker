import { Suspense } from "react";
import { acceptInvitationAction } from "@/features/project/members-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

async function AcceptInvitationContent({ token }: { token: string }) {
  const result = await acceptInvitationAction(token);

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Erreur</p>
          <p className="text-sm text-destructive/80">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-900">Invitation acceptée !</p>
          <p className="text-sm text-green-800">Redirection en cours...</p>
        </div>
      </div>
      
      {typeof window !== "undefined" && (
        <script>
          {`setTimeout(() => window.location.href = '/dashboard', 2000)`}
        </script>
      )}
    </div>
  );
}

export default function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation invalide</CardTitle>
            <CardDescription>Le lien d&apos;invitation est manquant ou invalide.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <a href="/dashboard">Retour au tableau de bord</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceptation de l&apos;invitation</CardTitle>
          <CardDescription>Traitement de votre invitation...</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Chargement...</p>}>
            <AcceptInvitationContent token={token} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

