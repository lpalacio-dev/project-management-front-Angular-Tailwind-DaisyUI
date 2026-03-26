// src/app/features/ai/ai.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

/**
 * Rutas del módulo de IA.
 * Todas requieren autenticación (rol User — verificado también en el backend).
 *
 * Escalabilidad: cuando se añadan chat contextual, detección de riesgos, etc.
 * solo hay que agregar entradas aquí sin tocar app.routes.ts.
 */
export const AI_ROUTES: Routes = [
  {
    path: 'generate',
    loadComponent: () =>
      import('./pages/ai-generate/ai-generate.component').then(
        m => m.AiGenerateComponent
      ),
    canActivate: [authGuard],
    title: 'Crear proyecto con IA',
    data: {
      breadcrumb: 'Crear con IA',
      animation: 'AiGeneratePage',
    },
  },
];