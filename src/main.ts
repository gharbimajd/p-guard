import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // Assurez-vous que le composant s'appelle bien 'App'

// Nettoyage du cache (C'est très bien, gardez-le)
if (!localStorage.getItem('isAuthenticated')) {
  localStorage.clear();
  sessionStorage.clear();
}

// --- SUPPRIMEZ TOUT LE BLOC QUI ÉTAIT ICI ---

// --- GARDEZ UNIQUEMENT CELUI-CI ---
// Il utilise 'appConfig' qui contient déjà le Router et le HttpClient
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));