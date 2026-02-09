// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthSignalsService } from '../signals/auth.signal.service';

/**
 * Guard de autenticación (Functional)
 * Protege rutas que requieren usuario autenticado
 * 
 * Si el usuario NO está autenticado:
 * - Redirige a /auth/login
 * - Guarda la URL intentada en query param 'returnUrl'
 * 
 * Si el usuario SÍ está autenticado:
 * - Permite acceso a la ruta
 * 
 * Uso en rutas:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authSignals = inject(AuthSignalsService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authSignals.isAuthenticated()) {
    return true; // Permitir acceso
  }

  // Usuario no autenticado, guardar URL intentada y redirigir a login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};