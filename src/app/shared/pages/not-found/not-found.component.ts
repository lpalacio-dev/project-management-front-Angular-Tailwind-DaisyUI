// src/app/shared/pages/not-found/not-found.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página 404 - No encontrado
 * Se muestra cuando el usuario intenta acceder a una ruta que no existe
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="text-center px-4">
        <!-- Número de error grande -->
        <h1 class="text-9xl font-bold text-primary mb-4">404</h1>
        
        <!-- Mensaje principal -->
        <h2 class="text-3xl font-semibold text-base-content mb-4">
          Página no encontrada
        </h2>
        
        <!-- Descripción -->
        <p class="text-lg text-base-content/70 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <!-- SVG ilustrativo -->
        <div class="mb-8">
          <svg 
            class="w-64 h-64 mx-auto text-base-content/20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="1" 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            class="btn btn-primary btn-lg"
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
      </div>
    </div>
  `
})
export class NotFoundComponent {
  /**
   * Vuelve a la página anterior en el historial
   */
  goBack(): void {
    window.history.back();
  }
}