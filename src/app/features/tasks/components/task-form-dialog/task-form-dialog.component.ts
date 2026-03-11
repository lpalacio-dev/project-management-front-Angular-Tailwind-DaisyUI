// src/app/features/tasks/components/task-form-dialog/task-form-dialog.component.ts

import {
  Component, inject, input, output, signal, computed,
  OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  Task, TaskPriority, TaskStatus,
  TaskPriorityHelper, TaskStatusHelper,
  CreateTaskRequest, UpdateTaskRequest
} from '@core/models/task.model';
import { ProjectMember } from '@core/models/member.model';
import { StringUtils } from '@core/utils/string.utils';
import { DateUtils } from '@core/utils/date.utils';

export type TaskFormMode = 'create' | 'edit';

/**
 * Dialog unificado crear/editar tareas.
 *
 * Modo CREATE:
 *   - Emite createTask(CreateTaskRequest)
 *   - Sin campo status visible (backend asigna Pending)
 *
 * Modo EDIT:
 *   - Emite updateTask({ taskId, data: UpdateTaskRequest })
 *   - Incluye campo status completo
 *   - Botón shortcut "Marcar como completada"
 *
 * Apertura: openCreate() / openEdit(task)
 * Cierre tras éxito: el padre llama a afterSuccess()
 */
@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog id="task-form-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-2xl">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-xl">
            {{ mode() === 'create' ? 'Nueva tarea' : 'Editar tarea' }}
          </h3>

          <!-- Shortcut completar (solo edit, solo si no está completada) -->
          @if (mode() === 'edit' && !isAlreadyCompleted()) {
            <button
              type="button"
              class="btn btn-success btn-sm gap-2"
              (click)="onMarkCompleted()"
              [disabled]="loading()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Marcar completada
            </button>
          }
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- ── Título ───────────────────────────────────── -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medium">Título</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              formControlName="title"
              placeholder="¿Qué hay que hacer?"
              class="input input-bordered w-full"
              [class.input-error]="isInvalid('title')"
              maxlength="255"
            />
            @if (isInvalid('title')) {
              <label class="label py-1">
                <span class="label-text-alt text-error">El título es requerido</span>
              </label>
            }
          </div>

          <!-- ── Descripción ─────────────────────────────── -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medium">Descripción</span>
              <span class="label-text-alt text-base-content/40">Opcional</span>
            </label>
            <textarea
              formControlName="description"
              placeholder="Agrega más detalles..."
              class="textarea textarea-bordered w-full h-24 resize-none"
              maxlength="2000"
            ></textarea>
            <label class="label py-1">
              <span class="label-text-alt text-base-content/40">
                {{ charCount() }}/2000
              </span>
            </label>
          </div>

          <!-- ── Prioridad + Fecha (grid) ───────────────── -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

            <!-- Prioridad — toggle visual -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Prioridad</span>
              </label>
              <div class="flex gap-2">
                @for (opt of priorityOptions; track opt.value) {
                  <button
                    type="button"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2
                           rounded-lg border-2 text-xs font-medium transition-all"
                    [class.border-primary]="selectedPriority() === opt.value"
                    [class.bg-primary/5]="selectedPriority() === opt.value"
                    [class.border-base-200]="selectedPriority() !== opt.value"
                    (click)="setPriority(opt.value)"
                  >
                    <span class="w-2 h-2 rounded-full" [class]="opt.dotClass"></span>
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Fecha límite -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Fecha límite</span>
                <span class="label-text-alt text-base-content/40">Opcional</span>
              </label>
              <input
                type="date"
                formControlName="dueDate"
                class="input input-bordered w-full"
                [min]="todayString"
              />
            </div>
          </div>

          <!-- ── Estado (solo en EDIT) ──────────────────── -->
          @if (mode() === 'edit') {
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text font-medium">Estado</span>
              </label>
              <div class="flex gap-2 flex-wrap">
                @for (opt of statusOptions; track opt.value) {
                  <button
                    type="button"
                    class="flex items-center gap-2 py-2 px-3 rounded-lg border-2
                           text-sm font-medium transition-all"
                    [class.border-primary]="selectedStatus() === opt.value"
                    [class.bg-primary/5]="selectedStatus() === opt.value"
                    [class.border-base-200]="selectedStatus() !== opt.value"
                    (click)="setStatus(opt.value)"
                  >
                    <span class="badge badge-xs" [class]="opt.badgeClass"></span>
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- ── Asignar a ───────────────────────────────── -->
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Asignar a</span>
              <span class="label-text-alt text-base-content/40">Opcional</span>
            </label>

            <select formControlName="assignedToId" class="select select-bordered w-full">
              <option value="">Sin asignar</option>
              @for (member of members(); track member.userId) {
                <option [value]="member.userId">
                  {{ member.userName }}
                  @if (member.role === 'Owner') { · Owner }
                  @else if (member.role === 'Admin') { · Admin }
                </option>
              }
            </select>

            <!-- Preview del asignado seleccionado -->
            @if (assignedMember()) {
              <div class="flex items-center gap-2 mt-2 px-1">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center
                         text-white text-[10px] font-bold flex-shrink-0"
                  [style.background-color]="assignedColor()"
                >
                  {{ assignedInitials() }}
                </div>
                <span class="text-sm text-base-content/70">{{ assignedMember()!.userName }}</span>
              </div>
            }
          </div>

          <!-- ── Acciones ────────────────────────────────── -->
          <div class="modal-action mt-0 gap-2">
            <button
              type="button"
              class="btn btn-ghost flex-1"
              (click)="onCancel()"
              [disabled]="loading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1 gap-2"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ mode() === 'create' ? 'Crear tarea' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button (click)="onCancel()">close</button>
      </form>
    </dialog>
  `
})
export class TaskFormDialogComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ───────────────────────────────────────────────
  readonly members = input<ProjectMember[]>([]);
  readonly loading = input<boolean>(false);

  // ── Outputs ──────────────────────────────────────────────
  readonly createTask = output<CreateTaskRequest>();
  readonly updateTask = output<{ taskId: string; data: UpdateTaskRequest }>();
  readonly cancelled  = output<void>();

  // ── State ────────────────────────────────────────────────
  protected readonly mode        = signal<TaskFormMode>('create');
  private readonly editingTask   = signal<Task | null>(null);

  /**
   * Signals propios para prioridad y estado — mismo patrón que change-role-dialog.
   * Los botones visuales no son radios reales; actualizan el signal Y el form value.
   */
  protected readonly selectedPriority = signal<TaskPriority>(TaskPriority.Medium);
  protected readonly selectedStatus   = signal<TaskStatus>(TaskStatus.Pending);

  protected readonly todayString = DateUtils.toInputDate(new Date());

  protected readonly form: FormGroup = this.fb.group({
    title:        ['', [Validators.required, Validators.maxLength(255)]],
    description:  ['', Validators.maxLength(2000)],
    priority:     [TaskPriority.Medium],
    dueDate:      [''],
    status:       [TaskStatus.Pending],
    assignedToId: [''],
  });

  protected readonly priorityOptions = TaskPriorityHelper.getAllOptions().map(o => ({
    ...o,
    dotClass: this.priorityDotClass(o.value)
  }));

  protected readonly statusOptions = TaskStatusHelper.getAllOptions().map(o => ({
    ...o,
    badgeClass: TaskStatusHelper.getBadgeClass(o.value)
  }));

  private subs = new Subscription();

  // ── Computed ─────────────────────────────────────────────
  protected readonly isAlreadyCompleted = computed(() =>
    this.editingTask()?.status === TaskStatus.Completed
  );

  protected readonly charCount = computed(() =>
    (this.form.get('description')?.value as string)?.length ?? 0
  );

  protected readonly assignedMember = computed(() => {
    const id = this.form.get('assignedToId')?.value as string;
    if (!id) return null;
    return this.members().find(m => m.userId === id) ?? null;
  });

  protected readonly assignedInitials = computed(() =>
    StringUtils.getInitials(this.assignedMember()?.userName ?? '')
  );

  protected readonly assignedColor = computed(() =>
    StringUtils.stringToColor(this.assignedMember()?.userName ?? '')
  );

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ── Métodos públicos ─────────────────────────────────────

  openCreate(): void {
    this.mode.set('create');
    this.editingTask.set(null);
    const defaultPriority = TaskPriority.Medium;
    const defaultStatus   = TaskStatus.Pending;
    this.selectedPriority.set(defaultPriority);
    this.selectedStatus.set(defaultStatus);
    this.form.reset({
      title: '', description: '', dueDate: '', assignedToId: '',
      priority: defaultPriority, status: defaultStatus,
    });
    this.openModal();
  }

  openEdit(task: Task): void {
    this.mode.set('edit');
    this.editingTask.set(task);
    const priority = task.priority ?? TaskPriority.Medium;
    const status   = task.status;
    this.selectedPriority.set(priority);
    this.selectedStatus.set(status);
    this.form.reset({
      title:        task.title,
      description:  task.description ?? '',
      priority,
      dueDate:      task.dueDate ? DateUtils.toInputDate(task.dueDate) : '',
      status,
      assignedToId: task.assignedToId ?? '',
    });
    this.openModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('task-form-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  /** El padre llama a esto tras operación exitosa */
  afterSuccess(): void { this.closeDialog(); }

  // ── Handlers ─────────────────────────────────────────────

  protected setPriority(value: TaskPriority): void {
    this.selectedPriority.set(value);
    this.form.patchValue({ priority: value });
  }

  protected setStatus(value: TaskStatus): void {
    this.selectedStatus.set(value);
    this.form.patchValue({ status: value });
  }

  protected onMarkCompleted(): void {
    this.setStatus(TaskStatus.Completed);
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw     = this.form.value;
    const dueDate = raw.dueDate ? new Date(raw.dueDate) : undefined;

    if (this.mode() === 'create') {
      const data: CreateTaskRequest = {
        title:        raw.title.trim(),
        description:  raw.description?.trim() || undefined,
        priority:     this.selectedPriority(),
        dueDate,
        assignedToId: raw.assignedToId || undefined,
        status:       TaskStatus.Pending,  // ignorado por backend, explícito para el tipo
      };
      this.createTask.emit(data);
    } else {
      const task = this.editingTask();
      if (!task) return;
      const data: UpdateTaskRequest = {
        title:        raw.title.trim(),
        description:  raw.description?.trim() || undefined,
        priority:     this.selectedPriority(),
        status:       this.selectedStatus(),
        dueDate,
        assignedToId: raw.assignedToId || undefined,
      };
      this.updateTask.emit({ taskId: task.id, data });
    }
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }

  protected isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  // ── Privados ─────────────────────────────────────────────

  private priorityDotClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.High:   return 'bg-error';
      case TaskPriority.Medium: return 'bg-warning';
      case TaskPriority.Low:    return 'bg-info';
    }
  }

  private openModal(): void {
    const dialog = document.getElementById('task-form-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }
}