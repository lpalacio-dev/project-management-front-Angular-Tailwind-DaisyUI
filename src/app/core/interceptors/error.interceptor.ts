// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSignalsService } from '../signals/auth.signal.service';
import { NotificationService } from '../services/notification.service';
import { ApiErrorHelper } from '../models/api-response.model';

/**
 * Interceptor de errores HTTP (Functional)
 * Maneja errores globalmente y muestra notificaciones apropiadas
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authSignals = inject(AuthSignalsService);
  const notifications = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // ==================== 401 UNAUTHORIZED ====================
      // Token inválido o expirado
      if (error.status === 401) {
        // Solo hacer logout automático si el usuario está autenticado
        if (authSignals.isAuthenticated()) {
          authSignals.logout();
          notifications.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          router.navigate(['/auth/login']);
        } else {
          // Si no está autenticado, solo mostrar mensaje
          notifications.error('Debes iniciar sesión para acceder a este recurso.');
        }
        
        return throwError(() => error);
      }

      // ==================== 403 FORBIDDEN ====================
      // Sin permisos para realizar la acción
      if (error.status === 403) {
        notifications.error('No tienes permisos para realizar esta acción.');
        return throwError(() => error);
      }

      // ==================== 404 NOT FOUND ====================
      // Recurso no encontrado
      if (error.status === 404) {
        notifications.error('El recurso solicitado no fue encontrado.');
        return throwError(() => error);
      }

      // ==================== 409 CONFLICT ====================
      // Conflicto (ej: username/email ya existe)
      if (error.status === 409) {
        const message = error.error?.message || error.error?.Message || 'Ya existe un recurso con esos datos.';
        notifications.error(message);
        return throwError(() => error);
      }

      // ==================== 400 BAD REQUEST ====================
      // Request inválido
      if (error.status === 400) {
        const message = error.error?.message || error.error?.Message || 'Datos inválidos. Verifica la información enviada.';
        notifications.error(message);
        return throwError(() => error);
      }

      // ==================== 500+ SERVER ERRORS ====================
      // Errores del servidor
      if (error.status >= 500) {
        notifications.error('Error del servidor. Por favor, intenta nuevamente más tarde.');
        return throwError(() => error);
      }

      // ==================== 0 - NETWORK ERROR ====================
      // Sin conexión o CORS error
      if (error.status === 0) {
        notifications.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        return throwError(() => error);
      }

      // ==================== OTROS ERRORES ====================
      // Error genérico
      const message = error.error?.message 
        || error.error?.Message 
        || ApiErrorHelper.getDefaultMessage(error.status);
      
      notifications.error(message);

      return throwError(() => error);
    })
  );
};