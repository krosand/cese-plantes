// Configuration automatique du chemin de base
// Détecte automatiquement le chemin depuis l'URL actuelle

const APP_CONFIG = (() => {
  // Récupérer le chemin actuel
  const currentPath = window.location.pathname;

  // Extraire le chemin de base (tout sauf le fichier HTML)
  let basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));

  // Si on est sur un fichier racine (index.html, stats.html, admin.html)
  // basePath est le dossier parent
  if (!basePath || basePath === '') {
    basePath = '';
  }

  return {
    basePath: basePath,
    apiUrl: (endpoint) => `${basePath}${endpoint}`
  };
})();

// Helper pour les appels API
async function apiCall(endpoint, options = {}) {
  const url = APP_CONFIG.apiUrl(endpoint);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
