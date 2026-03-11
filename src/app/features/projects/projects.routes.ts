// src/app/features/projects/projects.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

/**
 * Rutas del módulo de proyectos
 * Todas las rutas requieren autenticación
 */
export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/project-list/project-list.component').then(m => m.ProjectListComponent),
    canActivate: [authGuard],
    title: 'Proyectos',
    data: {
      breadcrumb: 'Proyectos',
      animation: 'ProjectListPage'
    }
  },
  {
    path: 'create',
    loadComponent: () => 
      import('./pages/project-create/project-create.component').then(m => m.ProjectCreateComponent),
    canActivate: [authGuard],
    title: 'Nuevo Proyecto',
    data: {
      breadcrumb: 'Crear Proyecto',
      animation: 'ProjectCreatePage'
    }
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    canActivate: [authGuard],
    title: 'Detalle del Proyecto',
    data: {
      breadcrumb: 'Detalle',
      animation: 'ProjectDetailPage'
    }
  }
];