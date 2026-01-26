// src/app/core/guards/role.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthSignalsService } from '../signals/auth.signal.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard de roles (Functional)
 * Protege rutas que requieren roles específicos
 * 
 * Uso en rutas con data:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['Admin'] }  // Roles permitidos
 * }
 * 
 * O con múltiples roles:
 * data: { roles: ['Admin', 'ProjectManager'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authSignals = inject(AuthSignalsService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  // Obtener roles requeridos de la ruta
  const requiredRoles = route.data['roles'] as string[] | undefined;

  // Si no hay roles especificados, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  if (authSignals.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Usuario no tiene los roles necesarios
  notifications.error('No tienes permisos para acceder a esta página.');
  
  // Redirigir a dashboard o página anterior
  return router.createUrlTree(['/dashboard']);
};