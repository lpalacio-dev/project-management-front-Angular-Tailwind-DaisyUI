// src/app/features/ai/components/suggest-tasks-dialog/suggest-tasks-dialog.component.ts

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { AiSignalsService } from '@core/signals/ai-signals.service';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { AiGeneratedTask, AiTaskHelper } from '@core/models/ai.model';
import { TaskPriority, TaskPriorityHelper, TaskStatus } from '@core/models/task.model';
import { AiLoadingStateComponent } from '../ai-loading-state/ai-loading-state.component';

/**
 * Dialog para sugerir tareas faltantes en un proyecto existente.
 *
 * Contrato público (idéntico a TaskFormDialogComponent):
 *   openDialog(projectId, projectName?)  — abre el dialog y dispara la carga
 *   closeDialog()                        — cierra el dialog nativo
 *   afterSuccess()                       — cierra tras operación exitosa del padre
 *
 * El padre (task-list) lo referencia con viewChild y llama a openDialog().
 * Este componente nunca navega ni emite outputs — solo crea tareas y se cierra.
 *
 * Flujo interno:
 *   1. openDialog() → aiSignals.suggestTasks(projectId)
 *   2. Usuario revisa checkboxes, puede deseleccionar individualmente o todas
 *   3. "Agregar seleccionadas" → taskSignals.createTask() por cada tarea marcada
 *   4. Notificación de resumen → closeDialog()
 */
@Component({
  selector: 'app-suggest-tasks-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiLoadingStateComponent],
  template: `
    <dialog id="suggest-tasks-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-2xl flex flex-col gap-0 p-0 overflow-hidden">

        <!-- ── Header ──────────────────────────────────────── -->
        <div class="flex items-center justify-between px-6 py-4
                    border-b border-base-200 flex-shrink-0">
          <div class="flex items-center gap-3">
            <!-- Icono IA -->
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center
                        justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                     00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                     5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                     4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-base leading-tight">Sugerir tareas con IA</h3>
              @if (projectName()) {
                <p class="text-xs text-base-content/50 leading-tight">
                  {{ projectName() }}
                </p>
              }
            </div>
          </div>

          <!-- Cerrar -->
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-circle"
            (click)="onCancel()"
            [disabled]="isCreating()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- ── Body ────────────────────────────────────────── -->
        <div class="flex-1 overflow-y-auto">

          <!-- Loading: cargando sugerencias -->
          @if (aiSignals.loading()) {
            <div class="px-6 py-2">
              <app-ai-loading-state
                context="suggest"
                [projectName]="projectName()"
              />
            </div>
          }

          <!-- Error al cargar sugerencias -->
          @else if (aiSignals.error() && !aiSignals.hasSuggestions()) {
            <div class="px-6 py-8 flex flex-col items-center gap-4 text-center">
              <div class="w-12 h-12 rounded-full bg-error/10 flex items-center
                          justify-center">
                <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-base-content">No se pudieron cargar las sugerencias</p>
                <p class="text-sm text-base-content/60 mt-1">{{ aiSignals.error() }}</p>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm gap-2"
                (click)="onRetry()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11
                       11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            </div>
          }

          <!-- Sin sugerencias (proyecto ya completo) -->
          @else if (aiSignals.hasSuggestions() && aiSignals.suggestedTasks().length === 0) {
            <div class="px-6 py-12 flex flex-col items-center gap-3 text-center">
              <div class="w-12 h-12 rounded-full bg-success/10 flex items-center
                          justify-center">
                <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="font-medium text-base-content">El proyecto parece completo</p>
              <p class="text-sm text-base-content/50">
                La IA no encontró tareas faltantes para este proyecto.
              </p>
            </div>
          }

          <!-- Lista de sugerencias -->
          @else if (aiSignals.hasSuggestions()) {
            <!-- Toolbar de sugerencias -->
            <div class="flex items-center justify-between px-6 py-3
                        border-b border-base-200 bg-base-50">
              <div class="flex items-center gap-2">
                <span class="text-sm text-base-content/70">
                  {{ selectedCount() }} de {{ aiSignals.suggestedTasks().length }}
                  seleccionada{{ aiSignals.suggestedTasks().length !== 1 ? 's' : '' }}
                </span>
                @if (selectedCount() === 0) {
                  <span class="badge badge-warning badge-xs">
                    Selecciona al menos una
                  </span>
                }
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-xs text-base-content/60"
                (click)="onToggleAll()"
                [disabled]="isCreating()"
              >
                {{ allSelected() ? 'Deseleccionar todas' : 'Seleccionar todas' }}
              </button>
            </div>

            <!-- Items -->
            <ul class="divide-y divide-base-200">
              @for (task of aiSignals.suggestedTasks(); track task.orderIndex;
                    let i = $index) {
                <li
                  class="flex items-start gap-4 px-6 py-4 transition-colors
                         hover:bg-base-50"
                  [class.opacity-40]="!task.selected"
                >
                  <!-- Checkbox -->
                  <div class="pt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm"
                      [checked]="task.selected"
                      [disabled]="isCreating()"
                      (change)="onToggleTask(i)"
                    />
                  </div>

                  <!-- Contenido -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                      <p class="font-medium text-sm text-base-content leading-snug">
                        {{ task.title }}
                      </p>
                      <span
                        class="badge badge-xs flex-shrink-0"
                        [class]="priorityBadgeClass(task.priority)"
                      >
                        {{ priorityLabel(task.priority) }}
                      </span>
                    </div>

                    @if (task.description) {
                      <p class="text-xs text-base-content/55 leading-relaxed">
                        {{ task.description }}
                      </p>
                    }

                    @if (task.dueDateOffsetDays) {
                      <p class="text-xs text-base-content/40 mt-1">
                        Fecha estimada: en {{ task.dueDateOffsetDays }}
                        día{{ task.dueDateOffsetDays !== 1 ? 's' : '' }}
                      </p>
                    }
                  </div>
                </li>
              }
            </ul>
          }

        </div>

        <!-- ── Footer / Acciones ────────────────────────────── -->
        @if (!aiSignals.loading() && aiSignals.hasSuggestions()
             && aiSignals.suggestedTasks().length > 0) {

          <!-- Progress al crear tareas en batch -->
          @if (isCreating()) {
            <div class="px-6 py-3 border-t border-base-200 bg-base-50">
              <div class="flex items-center gap-3">
                <span class="loading loading-spinner loading-xs text-primary"></span>
                <span class="text-sm text-base-content/70">
                  Creando tarea {{ creatingIndex() + 1 }}
                  de {{ tasksToCreate().length }}…
                </span>
              </div>
              <progress
                class="progress progress-primary w-full mt-2 h-1"
                [value]="creatingIndex()"
                [max]="tasksToCreate().length"
              ></progress>
            </div>
          }

          <div class="modal-action px-6 py-4 border-t border-base-200 mt-0 gap-2
                      flex-shrink-0">
            <button
              type="button"
              class="btn btn-ghost flex-1"
              [disabled]="isCreating()"
              (click)="onCancel()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary flex-1 gap-2"
              [disabled]="selectedCount() === 0 || isCreating()"
              (click)="onAddSelected()"
            >
              @if (!isCreating()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v16m8-8H4" />
                </svg>
              }
              Agregar {{ selectedCount() > 0 ? selectedCount() : '' }}
              tarea{{ selectedCount() !== 1 ? 's' : '' }}
            </button>
          </div>
        }

      </div>

      <!-- Backdrop para cerrar -->
      <form method="dialog" class="modal-backdrop">
        <button type="button" (click)="onCancel()">close</button>
      </form>
    </dialog>
  `,
})
export class SuggestTasksDialogComponent implements OnDestroy {
  protected readonly aiSignals   = inject(AiSignalsService);
  protected readonly taskSignals = inject(TaskSignalsService);

  // ── State privado ────────────────────────────────────────

  /** ID del proyecto activo — se establece en openDialog() */
  private readonly _projectId   = signal<string>('');
  private readonly _projectName = signal<string>('');

  /** Estado de progreso del batch de creación */
  protected readonly isCreating    = signal<boolean>(false);
  protected readonly creatingIndex = signal<number>(0);
  protected readonly tasksToCreate = signal<AiGeneratedTask[]>([]);

  // ── Computed ─────────────────────────────────────────────

  /** Expuesto al template (readonly) */
  protected readonly projectName = this._projectName.asReadonly();

  protected readonly selectedCount = computed(
    () => this.aiSignals.suggestedTasks().filter(t => t.selected).length
  );

  protected readonly allSelected = computed(
    () => this.aiSignals.suggestedTasks().every(t => t.selected)
  );

  // ── Lifecycle ────────────────────────────────────────────

  ngOnDestroy(): void {
    this.aiSignals.clearSuggestions();
  }

  // ── API pública (contrato del padre via viewChild) ───────

  /**
   * Abre el dialog y dispara la carga de sugerencias.
   * Si ya hay sugerencias cargadas para el mismo proyecto, las reutiliza.
   * Usa `force = true` para refrescar explícitamente.
   */
  openDialog(projectId: string, projectName = '', force = false): void {
    this._projectId.set(projectId);
    this._projectName.set(projectName);
    this.isCreating.set(false);
    this.creatingIndex.set(0);
    this.showModal();
    // Carga lazy — no bloquea la apertura del dialog
    this.aiSignals.suggestTasks(projectId, force);
  }

  closeDialog(): void {
    const dialog = document.getElementById('suggest-tasks-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  /** El padre llama a esto si necesita cerrar tras una acción externa. */
  afterSuccess(): void {
    this.closeDialog();
  }

  // ── Handlers ─────────────────────────────────────────────

  protected onToggleTask(index: number): void {
    this.aiSignals.toggleSuggestedTask(index);
  }

  protected onToggleAll(): void {
    this.aiSignals.toggleAllSuggestedTasks(!this.allSelected());
  }

  protected onCancel(): void {
    if (this.isCreating()) return; // no permitir cerrar mientras crea en batch
    this.closeDialog();
  }

  protected onRetry(): void {
    const id = this._projectId();
    if (id) {
      this.aiSignals.suggestTasks(id, true);
    }
  }

  /**
   * Crea las tareas seleccionadas en secuencia, una a una.
   *
   * Por qué secuencial y no en paralelo (Promise.all):
   * - taskSignals.createTask() actualiza el signal `tasks` con `tasks.update()`
   *   prepending la nueva tarea. En paralelo las escrituras se pisarían entre sí.
   * - La barra de progreso tiene sentido con secuencia — el usuario ve avance real.
   * - El backend no tiene endpoint batch para tareas.
   *
   * Un fallo individual se loggea pero no detiene el resto del lote.
   * Al terminar muestra un resumen (X creadas, Y fallidas).
   */
  protected async onAddSelected(): Promise<void> {
    const projectId = this._projectId();
    if (!projectId) return;

    const selected = this.aiSignals.suggestedTasks().filter(t => t.selected);
    if (selected.length === 0) return;

    this.isCreating.set(true);
    this.creatingIndex.set(0);
    this.tasksToCreate.set(selected);

    let created = 0;
    let failed  = 0;

    for (let i = 0; i < selected.length; i++) {
      this.creatingIndex.set(i);
      const task = selected[i];

      try {
        await this.taskSignals.createTask(projectId, {
          title:        task.title,
          description:  task.description,
          priority:     task.priority ?? TaskPriority.Medium,
          status:       TaskStatus.Pending,
          dueDate:      AiTaskHelper.offsetToDate(task.dueDateOffsetDays),
          assignedToId: undefined,
        });
        created++;
      } catch {
        failed++;
        // Continuar con las demás aunque falle una
      }
    }

    this.isCreating.set(false);

    // Limpiar sugerencias usadas para no re-mostrarlas en la próxima apertura
    this.aiSignals.clearSuggestions();

    // Notificación de resumen — taskSignals.createTask ya notifica individualmente,
    // pero si hubo fallos el resumen es más útil que múltiples toasts
    if (failed > 0) {
      // La notificación individual de error ya fue emitida por taskSignals
      // Solo cerramos si al menos una tarea se creó
      if (created > 0) this.closeDialog();
    } else {
      this.closeDialog();
    }
  }

  // ── Helpers de presentación ──────────────────────────────

  protected priorityBadgeClass(priority: TaskPriority): string {
    return TaskPriorityHelper.getBadgeClass(priority);
  }

  protected priorityLabel(priority: TaskPriority): string {
    return TaskPriorityHelper.getLabel(priority);
  }

  // ── Privados ─────────────────────────────────────────────

  private showModal(): void {
    const dialog = document.getElementById('suggest-tasks-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }
}