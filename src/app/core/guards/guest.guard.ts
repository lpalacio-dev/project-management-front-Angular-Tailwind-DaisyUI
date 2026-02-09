// src/app/core/guards/guest.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSignalsService } from '../signals/auth.signal.service';

/**
 * Guard de invitado (Functional)
 * Previene que usuarios autenticados accedan a páginas de auth (login/register)
 * 
 * Si el usuario SÍ está autenticado:
 * - Redirige a /dashboard
 * 
 * Si el usuario NO está autenticado:
 * - Permite acceso a la ruta (login/register)
 * 
 * Uso en rutas:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard: CanActivateFn = () => {
  const authSignals = inject(AuthSignalsService);
  const router = inject(Router);

  // Si el usuario está autenticado, redirigir a dashboard
  if (authSignals.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Usuario no autenticado, permitir acceso a login/register
  return true;
};