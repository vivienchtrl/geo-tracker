(function() {
  // Configuration
  // TODO: Changer pour l'URL de production lors du déploiement
  const ENDPOINT = "/api/track"; 
  
  // Récupérer l'ID du projet depuis l'attribut du script
  // Usage: <script src="https://ton-app.com/tracker.js" data-project-id="123"></script>
  const script = document.currentScript;
  const projectId = script.getAttribute('data-project-id');

  if (!projectId) {
    console.warn("Geo Tracker: Project ID missing in script tag");
    return;
  }

  // Liste des domaines d'IA connus pour catégorisation facile côté client (optionnel, le serveur peut aussi le faire)
  const AI_DOMAINS = [
    'chatgpt.com',
    'openai.com',
    'perplexity.ai',
    'claude.ai',
    'gemini.google.com',
    'bard.google.com',
    'bing.com',
    'copilot.microsoft.com'
  ];

  function trackVisit() {
    const referrer = document.referrer;
    let source = 'direct';

    if (referrer) {
      try {
        const url = new URL(referrer);
        source = url.hostname;
      } catch (e) {
        source = 'unknown';
      }
    }

    const payload = {
      projectId,
      eventType: 'user_visit',
      source: source,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: referrer
    };

    // Utilisation de sendBeacon pour fiabilité lors de la navigation
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const sent = navigator.sendBeacon(ENDPOINT, blob);

    if (!sent) {
      // Fallback si sendBeacon échoue (rare)
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Déclencher au chargement
  if (document.readyState === 'complete') {
    trackVisit();
  } else {
    window.addEventListener('load', trackVisit);
  }
})();








