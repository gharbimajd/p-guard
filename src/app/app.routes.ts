import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
    title: 'Login'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.Register),
    title: 'Register'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard],   // 🔒 protected
    title: 'Dashboard'
  },
  {
    path: 'status',
    loadComponent: () => import('./components/map/map').then(m => m.map),
    canActivate: [AuthGuard],   // 🔒 protected
    title: 'Status'
  },
  {
    path: 'roads',
    loadComponent: () => import('./components/selection-section/selection-section').then(m => m.Selection),
    canActivate: [AuthGuard],   // 🔒 protected
    title: 'Road Conditions'
  },
  {
    path: 'live',
    loadComponent: () => import('./components/live-feed/live-feed').then(m => m.LiveFeed),
    canActivate: [AuthGuard],   // 🔒 protected
    title: 'Live Feed'
  },
  // Default redirect (root path → login page)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Wildcard (unknown routes → login instead of dashboard)
  { path: '**', redirectTo: 'login' }
];
