// src/app/shared/pages/forbidden/forbidden.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página 403 - Acceso denegado
 * Se muestra cuando el usuario no tiene permisos para acceder a un recurso
 */
@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="text-center px-4">
        <!-- Número de error grande -->
        <h1 class="text-9xl font-bold text-error mb-4">403</h1>
        
        <!-- Mensaje principal -->
        <h2 class="text-3xl font-semibold text-base-content mb-4">
          Acceso Denegado
        </h2>
        
        <!-- Descripción -->
        <p class="text-lg text-base-content/70 mb-8 max-w-md mx-auto">
          No tienes los permisos necesarios para acceder a esta página.
          Si crees que esto es un error, contacta al administrador.
        </p>
        
        <!-- SVG ilustrativo -->
        <div class="mb-8">
          <svg 
            class="w-64 h-64 mx-auto text-error/20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1" 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            class="btn btn-error btn-lg"
            (click)="goBack()"
          >
            <svg 
              class="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Volver Atrás
          </button>
          
          <a 
            routerLink="/dashboard" 
            class="btn btn-outline btn-lg"
          >
            <svg 
              class="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            Ir al Dashboard
          </a>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 text-sm text-base-content/50">
          Si necesitas acceso a esta sección, contacta al administrador del sistema.
        </div>
      </div>
    </div>
  `
})
export class ForbiddenComponent {
  /**
   * Vuelve a la página anterior en el historial
   */
  goBack(): void {
    window.history.back();
  }
}