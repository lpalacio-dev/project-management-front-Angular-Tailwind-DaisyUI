// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Raíz ─────────────────────────────────────────────────
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // ── Rutas PÚBLICAS (sin topbar, sin authGuard) ────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    title: 'Autenticación'
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'Página No Encontrada'
  },
  {
    path: '403',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent),
    title: 'Acceso Denegado'
  },

  // ── Rutas AUTENTICADAS (con topbar, bajo MainLayoutComponent) ──
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
        title: 'Dashboard',
        data: { breadcrumb: 'Dashboard' }
      },

      // Proyectos
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes')
            .then(m => m.PROJECTS_ROUTES),
        title: 'Proyectos'
      },

      // Perfil de usuario
      {
        path: 'users/me',
        loadComponent: () =>
          import('./features/profile/pages/user-profile/user-profile.component')
            .then(m => m.UserProfileComponent),
        title: 'Mi Perfil'
      },

    ]
  },

  // ── Wildcard (siempre al final) ───────────────────────────
  {
    path: '**',
    redirectTo: '/404'
  }
];