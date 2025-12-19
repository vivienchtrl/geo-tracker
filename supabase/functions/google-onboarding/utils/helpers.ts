// Helper pour formater la date (J-3 pour être sûr d'avoir des données dispos)
export function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 3); // On recule de 3 jours pour éviter la latence API Google
  return d.toISOString().split('T')[0];
}
