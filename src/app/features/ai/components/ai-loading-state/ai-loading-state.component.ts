// src/app/features/ai/components/ai-loading-state/ai-loading-state.component.ts

import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

export type AiLoadingContext = 'generate' | 'confirm' | 'suggest' | 'generic';

interface LoadingCopy {
  title: string;
  lines: string[];
}

/**
 * Estado de carga contextual para el módulo de IA.
 *
 * No usa el spinner global del loadingInterceptor porque las peticiones al LLM
 * pueden tardar 5–60 s y necesitan un mensaje explicativo, no solo un indicador.
 *
 * Uso:
 *   <app-ai-loading-state context="generate" />
 *   <app-ai-loading-state context="suggest" [projectName]="project().name" />
 */
@Component({
  selector: 'app-ai-loading-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">

      <!-- Icono animado -->
      <div class="relative mb-6">
        <!-- Anillo exterior pulsante -->
        <div class="w-20 h-20 rounded-full border-4 border-primary/20 animate-ping
                    absolute inset-0"></div>
        <!-- Spinner principal -->
        <div class="w-20 h-20 rounded-full border-4 border-base-300
                    border-t-primary animate-spin"></div>
        <!-- Icono centro -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor"
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25
                 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5
                 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25
                 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375
                 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
      </div>

      <!-- Título -->
      <h3 class="text-lg font-semibold text-base-content mb-2">
        {{ copy().title }}
      </h3>

      <!-- Líneas descriptivas -->
      <div class="space-y-1 mb-6">
        @for (line of copy().lines; track line) {
          <p class="text-sm text-base-content/60">{{ line }}</p>
        }
      </div>

      <!-- Barra de progreso indeterminada -->
      <div class="w-48">
        <progress class="progress progress-primary w-full"></progress>
      </div>

      <!-- Nota de tiempo estimado -->
      <p class="text-xs text-base-content/40 mt-4">
        {{ timeNote() }}
      </p>

    </div>
  `,
})
export class AiLoadingStateComponent {
  readonly context     = input<AiLoadingContext>('generic');
  readonly projectName = input<string>('');

  protected readonly copy = computed((): LoadingCopy => {
    const name = this.projectName();
    switch (this.context()) {
      case 'generate':
        return {
          title: 'Analizando tu descripción…',
          lines: [
            'La IA está estructurando el proyecto y sus tareas.',
            'El resultado se adapta a tu idioma y nivel de detalle.',
          ],
        };
      case 'confirm':
        return {
          title: 'Creando el proyecto…',
          lines: [
            'Guardando el proyecto y todas las tareas seleccionadas.',
            'Serás redirigido al detalle cuando termine.',
          ],
        };
      case 'suggest':
        return {
          title: name
            ? `Analizando "${name}"…`
            : 'Analizando el proyecto…',
          lines: [
            'La IA revisa las tareas existentes para no duplicar.',
            'Identificando huecos lógicos en el plan de trabajo.',
          ],
        };
      default:
        return {
          title: 'Procesando…',
          lines: ['Esto puede tardar unos segundos.'],
        };
    }
  });

  protected readonly timeNote = computed((): string => {
    switch (this.context()) {
      case 'generate':
      case 'suggest':
        return 'Puede tardar entre 5 y 30 segundos según la carga del servicio.';
      case 'confirm':
        return 'Normalmente menos de 5 segundos.';
      default:
        return '';
    }
  });
}