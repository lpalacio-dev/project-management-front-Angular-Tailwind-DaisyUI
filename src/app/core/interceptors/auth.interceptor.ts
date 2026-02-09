// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSignalsService } from '../signals/auth.signal.service';

/**
 * Interceptor de autenticación (Functional)
 * Adjunta el token JWT a todas las requests salientes (excepto auth endpoints)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSignals = inject(AuthSignalsService);
  
  // Obtener token actual
  const token = authSignals.token();

  // Si no hay token, continuar sin modificar la request
  if (!token) {
    return next(req);
  }

  // No adjuntar token a endpoints de autenticación
  // Estos endpoints no requieren autenticación
  const isAuthEndpoint = req.url.includes('/api/auth/login') || 
                         req.url.includes('/api/auth/register');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Clonar la request y agregar header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Continuar con la request modificada
  return next(authReq);
};