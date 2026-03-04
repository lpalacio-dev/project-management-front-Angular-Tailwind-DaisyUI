// src/app/shared/components/top-loading-bar/top-loading-bar.component.ts

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';

/**
 * Barra de progreso fina en la parte superior de la app.
 * Reemplaza cualquier overlay/spinner global.
 * Se monta una sola vez en AppComponent o en el layout principal.
 *
 * Uso en AppComponent:
 *   imports: [TopLoadingBarComponent]
 *   template: `<app-top-loading-bar /><router-outlet />`
 */
@Component({
  selector: 'app-top-loading-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading()) {
      <div
        class="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-base-300 overflow-hidden"
        role="progressbar"
        aria-label="Cargando..."
      >
        <div class="h-full bg-primary origin-left animate-[loading-bar_1.4s_ease-in-out_infinite]"></div>
      </div>
    }
  `,
  styles: [`
    @keyframes loading-bar {
      0%   { transform: translateX(-100%) scaleX(0.3); }
      40%  { transform: translateX(-20%) scaleX(0.6); }
      70%  { transform: translateX(10%)  scaleX(0.8); }
      100% { transform: translateX(100%) scaleX(0.3); }
    }
  `]
})
export class TopLoadingBarComponent {
  protected readonly isLoading = inject(LoadingService).isLoading;
}