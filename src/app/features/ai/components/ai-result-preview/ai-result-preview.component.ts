// src/app/features/ai/components/ai-result-preview/ai-result-preview.component.ts

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiSignalsService } from '@core/signals/ai-signals.service';
import { AiGeneratedProject, AiGeneratedTask } from '@core/models/ai.model';
import { TaskPriority, TaskPriorityHelper } from '@core/models/task.model';
import { ProjectStatus, ProjectStatusHelper } from '@core/models/project.model';
import { AiLoadingStateComponent } from '../ai-loading-state/ai-loading-state.component';

/**
 * Preview editable de la sugerencia generada por la IA.
 *
 * Responsabilidades:
 *  - Mostrar nombre, descripción y estado del proyecto (editables inline)
 *  - Listar tareas con checkbox individual y toggle de seleccionar todas
 *  - Badge del proveedor LLM que respondió + aviso de fallback
 *  - Botones "Volver" (output back) y "Confirmar" (llama a aiSignals.confirmProject)
 *
 * El estado vive en AiSignalsService. Este componente solo lo lee y muta
 * a través de los métodos del servicio — nunca tiene su propia copia del proyecto.
 *
 * Apertura: el padre (ai-generate page) lo renderiza condicionalmente
 * cuando aiSignals.hasGeneration() === true.
 */
@Component({
  selector: 'app-ai-result-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AiLoadingStateComponent],
  template: `
    <div class="space-y-6">

      <!-- ── Estado de carga (confirmar) ──────────────────── -->
      @if (aiSignals.loading()) {
        <app-ai-loading-state context="confirm" [projectName]="project().name" />
      } @else {

        <!-- ── Header del preview ────────────────────────── -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm text-base-content/50 mb-1">Sugerencia generada</p>
            <h2 class="text-2xl font-bold text-base-content">
              Revisa y confirma tu proyecto
            </h2>
          </div>

          <!-- Badges de proveedor -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="badge badge-outline badge-sm gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                     00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                     5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                     4.5 0 00-3.09 3.09z" />
              </svg>
              {{ project().generatedByProvider }}
            </span>

            @if (project().usedFallback) {
              <span class="badge badge-warning badge-sm">Fallback activado</span>
            }
          </div>
        </div>

        <!-- ── Datos del proyecto (editables inline) ─────── -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">

            <h3 class="font-semibold text-base-content/70 text-sm uppercase tracking-wide">
              Datos del proyecto
            </h3>

            <!-- Nombre -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Nombre</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                type="text"
                [ngModel]="project().name"
                (ngModelChange)="onNameChange($event)"
                placeholder="Nombre del proyecto"
                class="input input-bordered w-full"
                [class.input-error]="nameEmpty()"
                maxlength="255"
              />
              @if (nameEmpty()) {
                <label class="label py-1">
                  <span class="label-text-alt text-error">El nombre es requerido</span>
                </label>
              }
            </div>

            <!-- Descripción -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Descripción</span>
                <span class="label-text-alt text-base-content/40">Editable</span>
              </label>
              <textarea
                [ngModel]="project().description"
                (ngModelChange)="onDescriptionChange($event)"
                placeholder="Descripción del proyecto…"
                class="textarea textarea-bordered w-full h-24 resize-none"
                maxlength="2000"
              ></textarea>
            </div>

            <!-- Estado inicial -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Estado inicial</span>
              </label>
              <div class="flex flex-wrap gap-2">
                @for (opt of statusOptions; track opt.value) {
                  <button
                    type="button"
                    class="flex items-center gap-2 py-2 px-3 rounded-lg border-2
                           text-sm font-medium transition-all"
                    [class.border-primary]="project().status === opt.value"
                    [class.bg-primary/5]="project().status === opt.value"
                    [class.border-base-200]="project().status !== opt.value"
                    (click)="onStatusChange(opt.value)"
                  >
                    <span class="badge badge-xs" [class]="opt.badgeClass"></span>
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>

          </div>
        </div>

        <!-- ── Lista de tareas ────────────────────────────── -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-0 p-0">

            <!-- Toolbar de tareas -->
            <div class="flex items-center justify-between px-5 py-4
                        border-b border-base-200">
              <div class="flex items-center gap-3">
                <h3 class="font-semibold text-base-content">Tareas sugeridas</h3>
                <span class="badge badge-primary badge-sm">
                  {{ aiSignals.selectedTasksCount() }}/{{ project().tasks.length }}
                  seleccionadas
                </span>
              </div>

              <!-- Toggle seleccionar todas -->
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                (click)="onToggleAll()"
              >
                {{ allSelected() ? 'Deseleccionar todas' : 'Seleccionar todas' }}
              </button>
            </div>

            <!-- Tareas vacías -->
            @if (project().tasks.length === 0) {
              <div class="py-10 text-center text-base-content/40 text-sm">
                La IA no generó tareas para este proyecto.
              </div>
            }

            <!-- Lista -->
            <ul class="divide-y divide-base-200">
              @for (task of project().tasks; track task.orderIndex; let i = $index) {
                <li
                  class="flex items-start gap-4 px-5 py-4 transition-colors"
                  [class.bg-base-200/40]="!task.selected"
                  [class.opacity-50]="!task.selected"
                >

                  <!-- Checkbox -->
                  <div class="pt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm"
                      [checked]="task.selected"
                      (change)="onToggleTask(i)"
                    />
                  </div>

                  <!-- Contenido -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <!-- Orden -->
                      <span class="text-xs text-base-content/30 font-mono flex-shrink-0">
                        #{{ task.orderIndex }}
                      </span>

                      <!-- Título -->
                      <p class="font-medium text-base-content text-sm leading-snug">
                        {{ task.title }}
                      </p>

                      <!-- Badge prioridad -->
                      <span class="badge badge-xs flex-shrink-0"
                            [class]="priorityBadgeClass(task.priority)">
                        {{ priorityLabel(task.priority) }}
                      </span>
                    </div>

                    @if (task.description) {
                      <p class="text-xs text-base-content/60 leading-relaxed">
                        {{ task.description }}
                      </p>
                    }

                    <!-- Fecha estimada -->
                    @if (task.dueDateOffsetDays) {
                      <p class="text-xs text-base-content/40 mt-1">
                        Fecha estimada: en {{ task.dueDateOffsetDays }} día{{ task.dueDateOffsetDays !== 1 ? 's' : '' }}
                      </p>
                    }
                  </div>

                </li>
              }
            </ul>

          </div>
        </div>

        <!-- ── Aviso sin tareas seleccionadas ─────────────── -->
        @if (aiSignals.selectedTasksCount() === 0) {
          <div class="alert alert-warning">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                   1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77
                   1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm">
              No hay tareas seleccionadas. El proyecto se creará sin tareas.
            </span>
          </div>
        }

        <!-- ── Acciones ────────────────────────────────────── -->
        <div class="flex gap-3 justify-end flex-wrap">
          <button
            type="button"
            class="btn btn-ghost"
            [disabled]="aiSignals.loading()"
            (click)="back.emit()"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver y editar descripción
          </button>

          <button
            type="button"
            class="btn btn-primary gap-2"
            [disabled]="nameEmpty() || aiSignals.loading()"
            (click)="onConfirm()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 13l4 4L19 7" />
            </svg>
            Crear proyecto
            @if (aiSignals.selectedTasksCount() > 0) {
              <span class="badge badge-primary-content badge-sm">
                + {{ aiSignals.selectedTasksCount() }} tarea{{ aiSignals.selectedTasksCount() !== 1 ? 's' : '' }}
              </span>
            }
          </button>
        </div>

      } <!-- /else loading -->

    </div>
  `,
})
export class AiResultPreviewComponent implements OnInit {
  protected readonly aiSignals = inject(AiSignalsService);

  // ── Inputs / Outputs ─────────────────────────────────────

  /**
   * El proyecto generado viene del padre (ai-generate page) como snapshot
   * del signal aiSignals.generatedProject(). Este componente lo usa como
   * referencia de lectura; las mutaciones van a través de aiSignals.
   */
  readonly project = input.required<AiGeneratedProject>();

  /** Emite cuando el usuario quiere volver al formulario de descripción. */
  readonly back = output<void>();

  // ── State local ──────────────────────────────────────────

  /** Validación inline del nombre — evita confirmar con nombre vacío. */
  protected readonly nameEmpty = computed(
    () => !this.project().name?.trim()
  );

  protected readonly allSelected = computed(
    () => this.project().tasks.every(t => t.selected)
  );

  // ── Opciones de status y prioridad ───────────────────────

  protected readonly statusOptions = ProjectStatusHelper.getAllOptions().map(o => ({
    ...o,
    badgeClass: ProjectStatusHelper.getBadgeClass(o.value),
  }));

  // ── Lifecycle ────────────────────────────────────────────

  ngOnInit(): void {
    // Nada que inicializar — el estado vive en AiSignalsService
  }

  // ── Handlers de edición inline ───────────────────────────

  protected onNameChange(value: string): void {
    this.aiSignals.updateGeneratedProject({ name: value });
  }

  protected onDescriptionChange(value: string): void {
    this.aiSignals.updateGeneratedProject({ description: value });
  }

  protected onStatusChange(status: ProjectStatus): void {
    this.aiSignals.updateGeneratedProject({ status });
  }

  protected onToggleTask(index: number): void {
    this.aiSignals.toggleGeneratedTask(index);
  }

  protected onToggleAll(): void {
    this.aiSignals.toggleAllGeneratedTasks(!this.allSelected());
  }

  protected async onConfirm(): Promise<void> {
    if (this.nameEmpty()) return;

    try {
      // confirmProject() persiste, notifica y navega a /projects/:id
      await this.aiSignals.confirmProject();
    } catch {
      // El error ya fue manejado y notificado en AiSignalsService
    }
  }

  // ── Helpers de presentación ──────────────────────────────

  protected priorityBadgeClass(priority: TaskPriority): string {
    return TaskPriorityHelper.getBadgeClass(priority);
  }

  protected priorityLabel(priority: TaskPriority): string {
    return TaskPriorityHelper.getLabel(priority);
  }
}