# Context Management System

## 🎯 Vue d'ensemble

Un système simple pour gérer le contexte utilisateur/projet dans toute l'application.

## 🛠️ Composants

### `useProject()` Hook
```typescript
const { projectId, ownerId, isLoading, error } = useProject()
```

### `AuthGuard` Component
```tsx
<AuthGuard>
  <YourProtectedContent />
</AuthGuard>
```

### Actions Server
```typescript
// Plus besoin de passer projectId !
await createKeyword("SEO tools", ["seo", "marketing"])
await getKeywords() // Récupère automatiquement pour l'utilisateur connecté
```

## 🚀 Utilisation

### Dans une page protégée :
```tsx
import { AuthGuard } from '@/components/auth-guard'
import { useProject } from '@/hooks/use-project'

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageContent />
    </AuthGuard>
  )
}

function MyPageContent() {
  const { projectId, isLoading } = useProject()

  if (isLoading) return <div>Loading...</div>

  return <div>Project ID: {projectId}</div>
}
```

### Dans des actions server :
```typescript
'use server'

export async function myAction(data: any) {
  // Le contexte utilisateur est automatiquement récupéré
  await someDatabaseOperation()
}
```

## 🔒 Sécurité

- **Authentification** : Vérifiée automatiquement via Supabase
- **Autorisation** : Seuls les projets de l'utilisateur connecté sont accessibles
- **Validation** : Côté serveur avec vérification d'appartenance

## 🎉 Avantages

- ✅ **Simple** : Un seul hook pour tout
- ✅ **Sécurisé** : Auth et autorisation intégrées
- ✅ **Type-safe** : TypeScript complet
- ✅ **Centrale** : Un seul endroit pour la logique contexte





