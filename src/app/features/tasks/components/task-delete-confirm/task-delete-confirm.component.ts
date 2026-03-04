// src/app/features/tasks/components/task-delete-confirm/task-delete-confirm.component.ts

import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { Task } from '@core/models/task.model';

/**
 * Dialog de confirmación para eliminar una tarea.
 * Se abre llamando a openDialog(task) desde el padre.
 */
@Component({
  selector: 'app-task-delete-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog id="task-delete-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-sm">

        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">¿Eliminar tarea?</h3>
          @if (task()) {
            <p class="text-base-content/60 text-sm mt-1 px-4 line-clamp-2">
              "{{ task()!.title }}"
            </p>
          }
          <p class="text-xs text-base-content/40 mt-3">Esta acción no se puede deshacer.</p>
        </div>

        <div class="modal-action mt-0 gap-2">
          <button
            class="btn btn-ghost flex-1"
            (click)="onCancel()"
            [disabled]="loading()"
          >
            Cancelar
          </button>
          <button
            class="btn btn-error flex-1 gap-2"
            (click)="confirmed.emit()"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            Eliminar
          </button>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button (click)="onCancel()">close</button>
      </form>
    </dialog>
  `
})
export class TaskDeleteConfirmComponent {
  readonly task    = input<Task | null>(null);
  readonly loading = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  openDialog(task: Task): void {
    const dialog = document.getElementById('task-delete-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('task-delete-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }
}