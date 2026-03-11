// src/app/features/members/components/remove-member-dialog/remove-member-dialog.component.ts

import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ProjectMember } from '@core/models/member.model';
import { StringUtils } from '@core/utils/string.utils';

export type RemoveDialogMode = 'remove' | 'leave';

/**
 * Dialog de confirmación reutilizable para:
 *  - "remove": remover a otro miembro del proyecto (Owner/Admin lo hace)
 *  - "leave":  el usuario actual abandona el proyecto
 *
 * Se abre llamando a openDialog() desde el componente padre.
 */
@Component({
  selector: 'app-remove-member-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog id="remove-member-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">

        <!-- Ícono de advertencia -->
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 class="font-bold text-xl text-base-content">{{ title() }}</h3>
          <p class="text-base-content/60 mt-2 text-sm leading-relaxed">{{ subtitle() }}</p>
        </div>

        <!-- Info del miembro (solo en modo remove) -->
        @if (mode() === 'remove' && member()) {
          <div class="flex items-center gap-3 p-3 rounded-lg bg-base-200 mb-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              [style.background-color]="avatarColor()"
            >
              {{ initials() }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-sm truncate">{{ member()!.userName }}</p>
              @if (member()!.email) {
                <p class="text-xs text-base-content/50 truncate">{{ member()!.email }}</p>
              }
            </div>
          </div>
        }

        <!-- Advertencias -->
        <ul class="space-y-2 mb-6">
          @for (warning of warnings(); track warning) {
            <li class="flex items-start gap-2 text-sm text-base-content/70">
              <svg class="w-4 h-4 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ warning }}
            </li>
          }
        </ul>

        <!-- Acciones -->
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
            (click)="onConfirm()"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ confirmLabel() }}
          </button>
        </div>
      </div>

      <!-- Backdrop -->
      <form method="dialog" class="modal-backdrop">
        <button (click)="onCancel()">close</button>
      </form>
    </dialog>
  `
})
export class RemoveMemberDialogComponent {
  // ── Inputs ──────────────────────────────────────────────
  readonly mode    = input<RemoveDialogMode>('remove');
  readonly member  = input<ProjectMember | null>(null);
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // ── Computed ─────────────────────────────────────────────
  protected readonly initials = computed(() =>
    StringUtils.getInitials(this.member()?.userName ?? '')
  );

  protected readonly avatarColor = computed(() =>
    StringUtils.stringToColor(this.member()?.userName ?? '')
  );

  protected readonly title = computed(() =>
    this.mode() === 'leave'
      ? 'Abandonar proyecto'
      : `¿Remover a ${this.member()?.userName ?? 'este miembro'}?`
  );

  protected readonly subtitle = computed(() =>
    this.mode() === 'leave'
      ? 'Esta acción te quitará el acceso al proyecto.'
      : 'Esta acción no se puede deshacer.'
  );

  protected readonly confirmLabel = computed(() =>
    this.mode() === 'leave' ? 'Abandonar' : 'Remover'
  );

  protected readonly warnings = computed<string[]>(() => {
    if (this.mode() === 'leave') {
      return [
        'Perderás acceso a todas las tareas del proyecto.',
        'No podrás volver a entrar sin ser invitado nuevamente.',
      ];
    }
    return [
      'El miembro perderá acceso al proyecto.',
      'Sus tareas asignadas quedarán sin asignar.',
    ];
  });

  // ── Métodos públicos ─────────────────────────────────────
  openDialog(): void {
    const dialog = document.getElementById('remove-member-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('remove-member-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  // ── Handlers ─────────────────────────────────────────────
  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }
}