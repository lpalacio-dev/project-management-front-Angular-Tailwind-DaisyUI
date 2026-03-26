// src/app/features/tasks/components/task-list/task-list.component.ts
//
// CAMBIOS RESPECTO AL ORIGINAL:
//   1. Import de SuggestTasksDialogComponent
//   2. viewChild suggestDialog
//   3. Botón "Sugerir tareas" en la fila 1 del toolbar (junto a "Nueva tarea")
//   4. <app-suggest-tasks-dialog> al final del template, junto a los otros dialogs
//   5. Método onOpenSuggest()
//
// Todo lo demás es idéntico al original.

import {
  Component, inject, input, signal,
  OnInit, viewChild, ChangeDetectionStrategy
} from '@angular/core';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { MemberSignalsService } from '@core/signals/member-signals.service';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import {
  Task, TaskStatus, TaskPriority,
  TaskStatusHelper, TaskPriorityHelper,
  CreateTaskRequest, UpdateTaskRequest
} from '@core/models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { TaskDeleteConfirmComponent } from '../task-delete-confirm/task-delete-confirm.component';
// ── NUEVO ────────────────────────────────────────────────────────────────────
import { SuggestTasksDialogComponent } from '@features/ai/components/suggest-tasks-dialog/suggest-tasks-dialog.component';
// ────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TaskItemComponent,
    TaskFormDialogComponent,
    TaskDeleteConfirmComponent,
    SuggestTasksDialogComponent, // ── NUEVO
  ],
  template: `
    <div class="space-y-5">

      <!-- ── Toolbar ──────────────────────────────────────── -->
      <div class="space-y-3">

        <!-- Fila 1: título + stats + botones -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold">Tareas</h2>
            <div class="flex items-center gap-1.5">
              <span class="badge badge-primary badge-sm font-semibold">
                {{ taskSignals.stats().total }}
              </span>
              @if (taskSignals.stats().highPriority > 0) {
                <span class="badge badge-error badge-sm" title="Alta prioridad">
                  {{ taskSignals.stats().highPriority }} ↑
                </span>
              }
            </div>
          </div>

          <!-- ── NUEVO: botones agrupados ───────────────────── -->
          <div class="flex items-center gap-2 flex-shrink-0">

            <!-- Sugerir tareas con IA -->
            <button
              class="btn btn-ghost btn-sm gap-1.5"
              title="Sugerir tareas con IA"
              [disabled]="taskSignals.loading()"
              (click)="onOpenSuggest()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                     00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                     5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                     4.5 0 00-3.09 3.09z" />
              </svg>
              <span class="hidden sm:inline">Sugerir con IA</span>
            </button>

            <!-- Nueva tarea (original) -->
            <button
              class="btn btn-primary btn-sm gap-2"
              [disabled]="taskSignals.loading()"
              (click)="onOpenCreate()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Nueva tarea</span>
            </button>

          </div>
          <!-- ── FIN NUEVO ─────────────────────────────────── -->
        </div>

        <!-- Fila 2: búsqueda + filtros (sin cambios) -->
        <div class="flex flex-wrap gap-2 items-center">

          <div class="relative flex-1 min-w-[160px]">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2
                        text-base-content/40 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tarea..."
              class="input input-bordered input-sm pl-9 w-full"
              [value]="taskSignals.filters().search ?? ''"
              (input)="onSearchChange($event)"
            />
          </div>

          <select
            class="select select-bordered select-sm w-auto"
            [value]="taskSignals.filters().status ?? 'all'"
            (change)="onStatusFilterChange($event)"
          >
            <option value="all">Todos los estados</option>
            @for (opt of statusOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>

          <select
            class="select select-bordered select-sm w-auto"
            [value]="taskSignals.filters().priority ?? 'all'"
            (change)="onPriorityFilterChange($event)"
          >
            <option value="all">Todas las prioridades</option>
            @for (opt of priorityOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>

          <select
            class="select select-bordered select-sm w-auto"
            [value]="taskSignals.filters().assignedTo ?? 'all'"
            (change)="onAssignedFilterChange($event)"
          >
            <option value="all">Todos</option>
            <option value="me">Mis tareas</option>
            <option value="unassigned">Sin asignar</option>
          </select>

          @if (taskSignals.hasActiveFilters()) {
            <button
              class="btn btn-ghost btn-sm gap-1 text-base-content/60"
              (click)="taskSignals.clearFilters()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          }
        </div>
      </div>

      <!-- ── Loading skeleton ─────────────────────────────── -->
      @if (taskSignals.loading() && taskSignals.tasks().length === 0) {
        <div class="space-y-2">
          @for (i of [1,2,3,4]; track i) {
            <div class="flex items-center gap-3 p-4 rounded-xl bg-base-200 animate-pulse">
              <div class="w-4 h-4 rounded bg-base-300 flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-base-300 rounded w-2/3"></div>
                <div class="h-3 bg-base-300 rounded w-1/3"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Error ─────────────────────────────────────────── -->
      @if (taskSignals.error() && !taskSignals.loading()) {
        <div class="alert alert-error">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ taskSignals.error() }}</span>
          <button class="btn btn-sm btn-ghost" (click)="reloadTasks()">Reintentar</button>
        </div>
      }

      <!-- ── Lista ─────────────────────────────────────────── -->
      @if (!taskSignals.loading() || taskSignals.tasks().length > 0) {
        @if (taskSignals.filteredTasks().length > 0) {
          <div class="space-y-2">
            @for (task of taskSignals.filteredTasks(); track task.id) {
              <app-task-item
                [task]="task"
                (toggle)="onToggle($event)"
                (edit)="onOpenEdit($event)"
                (delete)="onOpenDelete($event)"
              />
            }
          </div>

          @if (taskSignals.hasActiveFilters()) {
            <p class="text-xs text-center text-base-content/40 pt-1">
              Mostrando {{ taskSignals.filteredTasks().length }}
              de {{ taskSignals.stats().total }} tareas
            </p>
          }

        } @else if (taskSignals.tasks().length === 0 && !taskSignals.loading()) {
          <div class="flex flex-col items-center py-16 text-center">
            <div class="w-16 h-16 rounded-full bg-base-200 flex items-center
                        justify-center mb-4">
              <svg class="w-8 h-8 text-base-content/30" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
                     00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2
                     2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 class="font-semibold text-base-content/70 mb-1">No hay tareas aún</h3>
            <p class="text-sm text-base-content/40 mb-4">
              Crea la primera tarea o deja que la IA sugiera un plan de trabajo.
            </p>
            <!-- ── NUEVO: dos CTA en el empty state ───────── -->
            <div class="flex gap-2 flex-wrap justify-center">
              <button
                class="btn btn-ghost btn-sm gap-2"
                (click)="onOpenSuggest()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                       00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                       5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                       4.5 0 00-3.09 3.09z" />
                </svg>
                Sugerir con IA
              </button>
              <button class="btn btn-primary btn-sm gap-2" (click)="onOpenCreate()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v16m8-8H4" />
                </svg>
                Nueva tarea
              </button>
            </div>
            <!-- ── FIN NUEVO ─────────────────────────────── -->
          </div>

        } @else {
          <div class="flex flex-col items-center py-12 text-center">
            <svg class="w-10 h-10 text-base-content/20 mb-3" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-sm text-base-content/50">
              No hay tareas con los filtros aplicados
            </p>
            <button class="btn btn-ghost btn-xs mt-2"
                    (click)="taskSignals.clearFilters()">
              Limpiar filtros
            </button>
          </div>
        }
      }

      <!-- ── Stats bar ─────────────────────────────────────── -->
      @if (taskSignals.stats().total > 0) {
        <div class="flex items-center justify-center gap-4 pt-2 text-xs
                    text-base-content/50 flex-wrap">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-warning inline-block"></span>
            {{ taskSignals.stats().pending }} pendientes
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-info inline-block"></span>
            {{ taskSignals.stats().inProgress }} en progreso
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-success inline-block"></span>
            {{ taskSignals.stats().completed }} completadas
          </span>
        </div>
      }
    </div>

    <!-- ── Dialogs ────────────────────────────────────────── -->
    <app-task-form-dialog
      [members]="memberSignals.members()"
      [loading]="taskSignals.loading()"
      (createTask)="onCreateTask($event)"
      (updateTask)="onUpdateTask($event)"
      (cancelled)="taskToDelete.set(null)"
    />

    <app-task-delete-confirm
      [task]="taskToDelete()"
      [loading]="taskSignals.loading()"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="taskToDelete.set(null)"
    />

    <!-- ── NUEVO: dialog de sugerencias IA ───────────────── -->
    <app-suggest-tasks-dialog />
    <!-- ── FIN NUEVO ──────────────────────────────────────── -->
  `,
})
export class TaskListComponent implements OnInit {
  protected readonly taskSignals   = inject(TaskSignalsService);
  protected readonly memberSignals = inject(MemberSignalsService);
  // ── NUEVO: necesario para obtener el nombre del proyecto en openDialog() ──
  private readonly projectSignals = inject(ProjectSignalsService);
  // ──────────────────────────────────────────────────────────────────────────

  readonly projectId = input.required<string>();

  private readonly formDialog     = viewChild(TaskFormDialogComponent);
  private readonly deleteDialog   = viewChild(TaskDeleteConfirmComponent);
  // ── NUEVO ────────────────────────────────────────────────
  private readonly suggestDialog  = viewChild(SuggestTasksDialogComponent);
  // ────────────────────────────────────────────────────────

  protected readonly taskToDelete    = signal<Task | null>(null);
  protected readonly statusOptions   = TaskStatusHelper.getAllOptions();
  protected readonly priorityOptions = TaskPriorityHelper.getAllOptions();

  ngOnInit(): void {
    this.taskSignals.loadTasks(this.projectId());
  }

  // ── Toolbar ──────────────────────────────────────────────
  protected onSearchChange(event: Event): void {
    this.taskSignals.setFilters({
      search: (event.target as HTMLInputElement).value,
    });
  }

  protected onStatusFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.taskSignals.setFilters({
      status: val === 'all' ? undefined : val as TaskStatus,
    });
  }

  protected onPriorityFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.taskSignals.setFilters({
      priority: val === 'all' ? undefined : val as TaskPriority,
    });
  }

  protected onAssignedFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.taskSignals.setFilters({
      assignedTo: val === 'all' ? undefined : val,
    });
  }

  protected reloadTasks(): void {
    this.taskSignals.loadTasks(this.projectId());
  }

  // ── Dialog openers ────────────────────────────────────────
  protected onOpenCreate(): void {
    this.formDialog()?.openCreate();
  }

  protected onOpenEdit(task: Task): void {
    this.taskSignals.selectedTask.set(task);
    this.formDialog()?.openEdit(task);
  }

  protected onOpenDelete(task: Task): void {
    this.taskToDelete.set(task);
    this.deleteDialog()?.openDialog(task);
  }

  // ── NUEVO ────────────────────────────────────────────────
  protected onOpenSuggest(): void {
    const projectName = this.projectSignals.selectedProject()?.name ?? '';
    this.suggestDialog()?.openDialog(this.projectId(), projectName);
  }
  // ────────────────────────────────────────────────────────

  // ── Operaciones ──────────────────────────────────────────
  protected onToggle(task: Task): void {
    this.taskSignals.toggleCompleted(task);
  }

  protected async onCreateTask(request: CreateTaskRequest): Promise<void> {
    try {
      await this.taskSignals.createTask(this.projectId(), request);
      this.formDialog()?.afterSuccess();
    } catch { /* error ya notificado */ }
  }

  protected async onUpdateTask(
    event: { taskId: string; data: UpdateTaskRequest }
  ): Promise<void> {
    try {
      await this.taskSignals.updateTask(this.projectId(), event.taskId, event.data);
      this.formDialog()?.afterSuccess();
    } catch { /* error ya notificado */ }
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const task = this.taskToDelete();
    if (!task) return;
    try {
      await this.taskSignals.deleteTask(this.projectId(), task.id);
      this.taskToDelete.set(null);
      this.deleteDialog()?.closeDialog();
    } catch { /* error ya notificado */ }
  }
}