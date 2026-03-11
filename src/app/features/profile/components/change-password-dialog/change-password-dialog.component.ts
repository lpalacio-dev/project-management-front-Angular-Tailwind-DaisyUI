// src/app/features/profile/components/change-password-dialog/change-password-dialog.component.ts

import {
  Component, inject, signal, computed,
  OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserSignalsService } from '@core/signals/user-signals.service';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
  noWhitespaceValidator,
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText
} from '@features/auth/validators/password.validators';

/**
 * Dialog de cambio de contraseña.
 *
 * Reutiliza las funciones de password.validators.ts del módulo auth.
 *
 * Manejo de errores:
 *  - Error 400 "contraseña actual incorrecta" → se muestra INLINE
 *    bajo el campo currentPassword, no como toast genérico.
 *  - Otros errores de validación → inline en el campo correspondiente.
 *
 * Apertura: el padre llama a openDialog().
 * Cierre tras éxito: automático.
 */
@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <dialog id="change-password-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-md">

        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg">Cambiar contraseña</h3>
            <p class="text-sm text-base-content/50">Por tu seguridad, necesitamos tu contraseña actual</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- ── Contraseña actual ───────────────────────── -->
          <div class="form-control mb-4">
            <label class="label py-1">
              <span class="label-text font-medium">Contraseña actual</span>
            </label>
            <div class="relative">
              <input
                [type]="showCurrent() ? 'text' : 'password'"
                formControlName="currentPassword"
                class="input input-bordered w-full pr-10"
                [class.input-error]="isInvalid('currentPassword') || !!currentPasswordError()"
                placeholder="Tu contraseña actual"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40
                       hover:text-base-content/70 transition-colors"
                (click)="showCurrent.set(!showCurrent())"
                tabindex="-1"
              >
                @if (showCurrent()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>
            <!-- Error inline del servidor — contraseña incorrecta -->
            @if (currentPasswordError()) {
              <label class="label py-1">
                <span class="label-text-alt text-error flex items-center gap-1">
                  <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                  {{ currentPasswordError() }}
                </span>
              </label>
            } @else if (isInvalid('currentPassword')) {
              <label class="label py-1">
                <span class="label-text-alt text-error">La contraseña actual es requerida</span>
              </label>
            }
          </div>

          <!-- ── Nueva contraseña ───────────────────────── -->
          <div class="form-control mb-2">
            <label class="label py-1">
              <span class="label-text font-medium">Nueva contraseña</span>
            </label>
            <div class="relative">
              <input
                [type]="showNew() ? 'text' : 'password'"
                formControlName="newPassword"
                class="input input-bordered w-full pr-10"
                [class.input-error]="isInvalid('newPassword')"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                (input)="onPasswordInput()"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40
                       hover:text-base-content/70 transition-colors"
                (click)="showNew.set(!showNew())"
                tabindex="-1"
              >
                @if (showNew()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>

            <!-- Indicador de fortaleza -->
            @if (newPasswordValue()) {
              <div class="mt-2 space-y-1.5">
                <!-- Barra de fortaleza -->
                <div class="flex gap-1">
                  @for (segment of [1,2,3]; track segment) {
                    <div
                      class="h-1.5 flex-1 rounded-full transition-all duration-300"
                      [class]="getSegmentClass(segment)"
                    ></div>
                  }
                </div>
                <!-- Texto + requisitos -->
                <div class="flex items-center justify-between">
                  <p class="text-xs" [class]="'text-' + strengthColor()">
                    Contraseña {{ strengthText() }}
                  </p>
                </div>
                <!-- Checklist de requisitos -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  @for (req of requirements(); track req.label) {
                    <div class="flex items-center gap-1.5 text-xs"
                      [class]="req.met ? 'text-success' : 'text-base-content/40'"
                    >
                      @if (req.met) {
                        <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                        </svg>
                      } @else {
                        <div class="w-3 h-3 rounded-full border border-current flex-shrink-0"></div>
                      }
                      {{ req.label }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- ── Confirmar nueva contraseña ─────────────── -->
          <div class="form-control mb-6">
            <label class="label py-1">
              <span class="label-text font-medium">Confirmar nueva contraseña</span>
            </label>
            <div class="relative">
              <input
                [type]="showConfirm() ? 'text' : 'password'"
                formControlName="confirmPassword"
                class="input input-bordered w-full pr-10"
                [class.input-error]="isInvalid('confirmPassword')"
                placeholder="Repite la nueva contraseña"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40
                       hover:text-base-content/70 transition-colors"
                (click)="showConfirm.set(!showConfirm())"
                tabindex="-1"
              >
                @if (showConfirm()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>
            @if (form.get('confirmPassword')?.hasError('passwordMismatch') &&
                 form.get('confirmPassword')?.touched) {
              <label class="label py-1">
                <span class="label-text-alt text-error">Las contraseñas no coinciden</span>
              </label>
            }
          </div>

          <!-- Acciones -->
          <div class="modal-action mt-0 gap-2">
            <button
              type="button"
              class="btn btn-ghost flex-1"
              (click)="onCancel()"
              [disabled]="userSignals.loading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1 gap-2"
              [disabled]="form.invalid || userSignals.loading()"
            >
              @if (userSignals.loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Actualizar contraseña
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
export class ChangePasswordDialogComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  protected readonly userSignals = inject(UserSignalsService);

  // ── Signals UI ───────────────────────────────────────────
  protected readonly showCurrent       = signal(false);
  protected readonly showNew           = signal(false);
  protected readonly showConfirm       = signal(false);
  protected readonly currentPasswordError = signal<string | null>(null);
  protected readonly newPasswordValue  = signal('');

  protected readonly form: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8),
         passwordStrengthValidator(), noWhitespaceValidator()]
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
  );

  private subs = new Subscription();

  // ── Computed — indicador de fortaleza ────────────────────

  protected readonly strengthLevel = computed(() =>
    getPasswordStrength(this.newPasswordValue())
  );

  protected readonly strengthColor = computed(() =>
    getPasswordStrengthColor(this.strengthLevel())
  );

  protected readonly strengthText = computed(() =>
    getPasswordStrengthText(this.strengthLevel())
  );

  protected readonly requirements = computed(() => {
    const val = this.newPasswordValue();
    return [
      { label: 'Mínimo 8 caracteres', met: val.length >= 8 },
      { label: 'Letra minúscula',     met: /[a-z]/.test(val) },
      { label: 'Letra mayúscula',     met: /[A-Z]/.test(val) },
      { label: 'Número',              met: /[0-9]/.test(val) },
    ];
  });

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ── Métodos públicos ─────────────────────────────────────

  openDialog(): void {
    this.form.reset();
    this.currentPasswordError.set(null);
    this.newPasswordValue.set('');
    this.showCurrent.set(false);
    this.showNew.set(false);
    this.showConfirm.set(false);
    const dialog = document.getElementById('change-password-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('change-password-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  // ── Handlers ─────────────────────────────────────────────

  /** Actualiza el signal de nueva contraseña para el indicador de fortaleza */
  protected onPasswordInput(): void {
    this.newPasswordValue.set(this.form.get('newPassword')?.value ?? '');
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.currentPasswordError.set(null);

    const raw = this.form.value;
    try {
      await this.userSignals.changePassword({
        currentPassword: raw.currentPassword,
        newPassword:     raw.newPassword,
        confirmPassword: raw.confirmPassword,
      });
      this.closeDialog();
    } catch (err: any) {
      // Mostrar el error del backend inline — no como toast
      const msg = err?.error?.Message ?? 'Error desconocido';
      // Si menciona la contraseña actual, mostrarlo en ese campo
      if (msg.toLowerCase().includes('contraseña') ||
          msg.toLowerCase().includes('password') ||
          msg.toLowerCase().includes('incorrect')) {
        this.currentPasswordError.set('La contraseña actual es incorrecta');
      } else {
        this.currentPasswordError.set(msg);
      }
      // Limpiar y hacer focus en el campo de contraseña actual
      this.form.get('currentPassword')?.setValue('');
      this.form.get('currentPassword')?.markAsTouched();
    }
  }

  protected onCancel(): void {
    this.closeDialog();
  }

  protected isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  /** Clase CSS para cada segmento de la barra de fortaleza */
  protected getSegmentClass(segment: number): string {
    const level = this.strengthLevel();
    const activeClass = level === 'weak'   ? 'bg-error' :
                        level === 'medium' ? 'bg-warning' : 'bg-success';
    const segmentActive =
      (level === 'weak'   && segment <= 1) ||
      (level === 'medium' && segment <= 2) ||
      (level === 'strong' && segment <= 3);
    return segmentActive ? activeClass : 'bg-base-200';
  }
}