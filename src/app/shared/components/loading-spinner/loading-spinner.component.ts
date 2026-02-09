// src/app/shared/components/loading-spinner/loading-spinner.component.ts

import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Componente de spinner de carga global
 * Muestra un overlay con spinner cuando hay requests HTTP activas
 * 
 * Uso alternativo al spinner en AppComponent:
 * Agregar <app-loading-spinner /> en app.component.html
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div 
        class="fixed inset-0 bg-base-300/50 backdrop-blur-sm z-50 flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Cargando"
      >
        <div class="flex flex-col items-center gap-4">
          <!-- Spinner de DaisyUI -->
          <span class="loading loading-spinner loading-lg text-primary"></span>
          
          <!-- Texto opcional -->
          <p class="text-base-content/70 font-medium">Cargando...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class LoadingSpinnerComponent {
  protected readonly loadingService = inject(LoadingService);
}