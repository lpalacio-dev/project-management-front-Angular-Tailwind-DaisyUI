// src/app/features/tasks/components/task-item/task-item.component.ts

import {
  Component, input, output, computed, ChangeDetectionStrategy
} from '@angular/core';
import {
  Task, TaskStatus, TaskPriority,
  TaskPriorityHelper, TaskStatusHelper, TaskDueDateHelper
} from '@core/models/task.model';
import { StringUtils } from '@core/utils/string.utils';
import { DateUtils } from '@core/utils/date.utils';

/**
 * Fila individual de tarea.
 * Responsabilidades: checkbox toggle, título+descripción, badges,
 * avatar asignado, fecha vencimiento y menú contextual.
 *
 * El toggle emite el evento al padre — el padre llama a toggleCompleted()
 * en el signals service (optimistic, silencioso).
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-200
             hover:border-primary/20 hover:shadow-sm transition-all duration-150 group"
      [class.opacity-60]="isCompleted()"
    >
      <!-- Checkbox -->
      <div class="flex-shrink-0 pt-0.5">
        <input
          type="checkbox"
          class="checkbox checkbox-primary checkbox-sm cursor-pointer"
          [checked]="isCompleted()"
          (change)="toggle.emit(task())"
          [title]="isCompleted() ? 'Marcar como pendiente' : 'Marcar como completada'"
        />
      </div>

      <!-- Cuerpo — click abre edición -->
      <div class="flex-1 min-w-0 cursor-pointer" (click)="edit.emit(task())">

        <!-- Título -->
        <p
          class="font-medium text-sm leading-snug text-base-content"
          [class.line-through]="isCompleted()"
          [class.text-base-content/50]="isCompleted()"
        >
          {{ task().title }}
        </p>

        <!-- Descripción truncada -->
        @if (task().description) {
          <p class="text-xs text-base-content/50 mt-0.5 truncate">
            {{ task().description }}
          </p>
        }

        <!-- Meta: badges + asignado + fecha -->
        <div class="flex items-center gap-2 mt-2 flex-wrap">

          <!-- Prioridad -->
          @if (task().priority) {
            <span class="badge badge-xs font-semibold" [class]="priorityBadgeClass()">
              {{ priorityLabel() }}
            </span>
          }

          <!-- Estado (solo si no es el default Pending) -->
          @if (task().status !== 'Pending') {
            <span class="badge badge-xs" [class]="statusBadgeClass()">
              {{ statusLabel() }}
            </span>
          }

          <!-- Asignado -->
          @if (task().assignedToName) {
            <div class="flex items-center gap-1.5">
              <div
                class="w-4 h-4 rounded-full flex items-center justify-center
                       text-white text-[9px] font-bold flex-shrink-0"
                [style.background-color]="assigneeColor()"
                [title]="task().assignedToName!"
              >
                {{ assigneeInitials() }}
              </div>
              <span class="text-xs text-base-content/50 truncate max-w-[90px]">
                {{ task().assignedToName }}
              </span>
            </div>
          } @else {
            <span class="text-xs text-base-content/30 italic">Sin asignar</span>
          }

          <!-- Fecha de vencimiento -->
          @if (task().dueDate) {
            <span
              class="text-xs flex items-center gap-1 ml-auto flex-shrink-0"
              [class]="dueDateClass()"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ dueDateFormatted() }}
            </span>
          }
        </div>
      </div>

      <!-- Menú de acciones — visible en hover -->
      <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            class="btn btn-ghost btn-xs btn-square"
            aria-label="Opciones de tarea"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          <ul tabindex="0"
            class="dropdown-content z-[1] menu menu-sm shadow-lg bg-base-100
                   rounded-box w-44 border border-base-200 p-1">
            <li>
              <button class="text-sm gap-2" (click)="edit.emit(task())">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </li>
            <li>
              <button class="text-sm gap-2" (click)="toggle.emit(task())">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ isCompleted() ? 'Marcar pendiente' : 'Completar' }}
              </button>
            </li>
            <li>
              <button
                class="text-sm gap-2 text-error hover:bg-error/10"
                (click)="delete.emit(task())"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class TaskItemComponent {
  // ── Inputs ───────────────────────────────────────────────
  readonly task = input.required<Task>();

  // ── Outputs ──────────────────────────────────────────────
  readonly toggle = output<Task>();
  readonly edit   = output<Task>();
  readonly delete = output<Task>();

  // ── Computed ─────────────────────────────────────────────
  protected readonly isCompleted = computed(() =>
    this.task().status === TaskStatus.Completed
  );

  protected readonly priorityLabel = computed(() =>
    this.task().priority
      ? TaskPriorityHelper.getLabel(this.task().priority as TaskPriority)
      : ''
  );

  protected readonly priorityBadgeClass = computed(() =>
    this.task().priority
      ? TaskPriorityHelper.getBadgeClass(this.task().priority as TaskPriority)
      : ''
  );

  protected readonly statusLabel = computed(() =>
    TaskStatusHelper.getLabel(this.task().status)
  );

  protected readonly statusBadgeClass = computed(() =>
    TaskStatusHelper.getBadgeClass(this.task().status)
  );

  protected readonly assigneeInitials = computed(() =>
    StringUtils.getInitials(this.task().assignedToName ?? '')
  );

  protected readonly assigneeColor = computed(() =>
    StringUtils.stringToColor(this.task().assignedToName ?? '')
  );

  protected readonly dueDateFormatted = computed(() =>
    this.task().dueDate ? DateUtils.formatShort(this.task().dueDate!) : ''
  );

  protected readonly dueDateClass = computed(() =>
    TaskDueDateHelper.getDateClass(this.task().dueDate, this.task().status)
  );
}