import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // ==================== RUTA RAÍZ ====================
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // ==================== AUTENTICACIÓN ====================
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    title: 'Autenticación'
  },

  // ==================== DASHBOARD ====================
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard',
    data: {
      breadcrumb: 'Dashboard',
      animation: 'DashboardPage'
    }
  },

  // ==================== PÁGINA NO ENCONTRADA ====================
  {
    path: '404',
    loadComponent: () => 
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'Página No Encontrada'
  },

  // ==================== PÁGINA SIN PERMISOS ====================
  {
    path: '403',
    loadComponent: () => 
      import('./shared/pages/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent),
    title: 'Acceso Denegado'
  },

  // ==================== WILDCARD (DEBE SER ÚLTIMO) ====================
  {
    path: '**',
    redirectTo: '/404'
  }
]
