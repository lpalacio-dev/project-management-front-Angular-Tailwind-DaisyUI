// src/app/core/interceptors/loading.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor de loading (Functional)
 * Controla el spinner global de carga durante requests HTTP
 * 
 * NOTA: Este interceptor requiere LoadingService (lo crearemos a continuación)
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Incrementar contador de requests activas
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Decrementar contador cuando termine (éxito o error)
      loadingService.hide();
    })
  );
};