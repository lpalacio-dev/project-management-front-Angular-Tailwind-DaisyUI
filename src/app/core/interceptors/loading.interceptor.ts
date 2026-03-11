// PARCHE PARA: src/app/core/interceptors/loading.interceptor.ts
//
// Agrega estas dos líneas de import al inicio del archivo:
//
//   import { HttpContext } from '@angular/common/http';
//   import { SKIP_LOADING } from '@core/services/user-search.service';
//
// Luego, dentro de la función interceptora, añade el guard al inicio
// (antes del loadingService.show()) para que las búsquedas silenciosas
// no activen el spinner global:
//
// ─────────────────────────────────────────────────────────────────
// ANTES (estructura típica del interceptor):
//
//   export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//     const loadingService = inject(LoadingService);
//     loadingService.show();
//     return next(req).pipe(
//       finalize(() => loadingService.hide())
//     );
//   };
//
// ─────────────────────────────────────────────────────────────────
// DESPUÉS (con el guard):
//
//   export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//     // Si la request lleva SKIP_LOADING=true, pasarla sin tocar el spinner
//     if (req.context.get(SKIP_LOADING)) {
//       return next(req);
//     }
//
//     const loadingService = inject(LoadingService);
//     loadingService.show();
//     return next(req).pipe(
//       finalize(() => loadingService.hide())
//     );
//   };
//
// ─────────────────────────────────────────────────────────────────
//
// Con esto, cualquier servicio puede silenciar el spinner global pasando:
//   context: new HttpContext().set(SKIP_LOADING, true)
// en las opciones de la request HTTP.

// ── Interceptor completo de referencia ───────────────────────────

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/services/loading.service';
import { SKIP_LOADING } from '@core/services/user-search.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Requests marcadas con SKIP_LOADING=true no activan el spinner global
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};