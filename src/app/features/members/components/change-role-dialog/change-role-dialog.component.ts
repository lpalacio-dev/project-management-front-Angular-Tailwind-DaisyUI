// src/app/features/members/components/change-role-dialog/change-role-dialog.component.ts

import {
  Component, inject, input, output, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectMember, ProjectRole, ProjectRoleHelper } from '@core/models/member.model';
import { StringUtils } from '@core/utils/string.utils';

/**
 * Dialog para cambiar el rol de un miembro (Admin ↔ Member).
 * No permite cambiar el rol del Owner.
 * Se abre llamando a openDialog(member) desde el padre.
 */
@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog id="change-role-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-sm">

        <h3 class="font-bold text-xl mb-1">Cambiar rol</h3>
        <p class="text-sm text-base-content/60 mb-6">
          Los cambios se aplican inmediatamente.
        </p>

        <!-- Info del miembro -->
        @if (targetMember()) {
          <div class="flex items-center gap-3 p-3 rounded-lg bg-base-200 mb-6">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              [style.background-color]="avatarColor()"
            >
              {{ initials() }}
            </div>
            <div>
              <p class="font-semibold text-sm">{{ targetMember()!.userName }}</p>
              <p class="text-xs text-base-content/50">Rol actual: {{ currentRoleLabel() }}</p>
            </div>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Radio buttons de rol -->
          <div class="space-y-3 mb-6">
            <p class="text-sm font-medium text-base-content">Nuevo rol:</p>

            @for (option of roleOptions; track option.value) {
              <label
                class="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-150"
                [class.border-primary]="selectedRole() === option.value"
                [class.bg-primary/5]="selectedRole() === option.value"
                [class.border-base-200]="selectedRole() !== option.value"
              >
                <input
                  type="radio"
                  name="role"
                  formControlName="role"
                  [value]="option.value"
                  class="radio radio-primary mt-0.5 flex-shrink-0"
                  (change)="onRoleRadioChange(option.value)"
                />
                <div>
                  <p class="font-medium text-sm">{{ option.label }}</p>
                  <p class="text-xs text-base-content/50 mt-0.5">{{ option.description }}</p>
                </div>
              </label>
            }
          </div>

          <!-- Acciones -->
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
              [disabled]="form.invalid || loading() || !hasChanged()"
            >
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Guardar cambios
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
export class ChangeRoleDialogComponent {
  private readonly fb = inject(FormBuilder);

  // ── Inputs / Outputs ─────────────────────────────────────
  readonly loading     = input<boolean>(false);
  readonly roleChanged = output<{ member: ProjectMember; newRole: ProjectRole }>();
  readonly cancelled   = output<void>();

  // ── State ────────────────────────────────────────────────
  protected readonly targetMember = signal<ProjectMember | null>(null);

  /**
   * FIX: Signal propio que refleja el radio seleccionado.
   * computed() no puede trackear FormGroup.value porque no es un signal.
   * Este signal actúa como puente: se actualiza en (change) del radio
   * y permite que hasChanged() se re-evalue reactivamente.
   */
  protected readonly selectedRole = signal<ProjectRole>(ProjectRole.Member);

  protected readonly form: FormGroup = this.fb.group({
    role: [ProjectRole.Member, Validators.required]
  });

  protected readonly roleOptions = [
    {
      value: ProjectRole.Admin,
      label: ProjectRoleHelper.getLabel(ProjectRole.Admin),
      description: 'Puede agregar/remover miembros y gestionar tareas'
    },
    {
      value: ProjectRole.Member,
      label: ProjectRoleHelper.getLabel(ProjectRole.Member),
      description: 'Puede ver y gestionar tareas del proyecto'
    }
  ];

  // ── Computed ─────────────────────────────────────────────
  protected readonly initials = computed(() =>
    StringUtils.getInitials(this.targetMember()?.userName ?? '')
  );

  protected readonly avatarColor = computed(() =>
    StringUtils.stringToColor(this.targetMember()?.userName ?? '')
  );

  protected readonly currentRoleLabel = computed(() =>
    ProjectRoleHelper.getLabel(this.targetMember()?.role ?? ProjectRole.Member)
  );

  /**
   * FIX: Ahora compara selectedRole() (signal) vs targetMember()?.role (signal).
   * Ambos son reactivos, por lo que computed() se re-evalúa correctamente
   * cada vez que el usuario hace click en un radio.
   */
  protected readonly hasChanged = computed(() =>
    this.selectedRole() !== this.targetMember()?.role
  );

  // ── Métodos públicos ─────────────────────────────────────
  openDialog(member: ProjectMember): void {
    this.targetMember.set(member);
    this.selectedRole.set(member.role);           // inicializar con el rol actual del miembro
    this.form.patchValue({ role: member.role });
    const dialog = document.getElementById('change-role-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('change-role-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  // ── Handlers ─────────────────────────────────────────────

  /** Sincroniza el signal cada vez que cambia el radio seleccionado */
  protected onRoleRadioChange(role: ProjectRole): void {
    this.selectedRole.set(role);
  }

  protected onSubmit(): void {
    const member = this.targetMember();
    if (this.form.invalid || !member) return;

    this.roleChanged.emit({
      member,
      newRole: this.selectedRole()    // usar el signal, no form.get('role').value
    });
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }
}