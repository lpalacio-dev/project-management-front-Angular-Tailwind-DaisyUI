// src/app/features/profile/components/profile-info-card/profile-info-card.component.ts

import {
  Component, inject, input, signal, computed,
  OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserProfile } from '@core/models/user.model';
import { UserSignalsService } from '@core/signals/user-signals.service';
import { DateUtils } from '@core/utils/date.utils';

/**
 * Tarjeta de información personal del perfil.
 *
 * Modo lectura: muestra todos los campos.
 * Modo edición (activado por el botón lápiz):
 *   - Email (editable, validación de formato)
 *   - Teléfono (editable, opcional)
 *   - Username y fecha de registro: siempre read-only
 *
 * PUT /api/users/me retorna 204 → el signals service reconstruye localmente.
 * Cualquier error de "email ya en uso" del backend se muestra inline bajo el campo.
 */
@Component({
  selector: 'app-profile-info-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="card bg-base-100 border border-base-200 shadow-sm">
      <div class="card-body gap-5">

        <!-- Header con botón editar/cancelar -->
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-base">Información personal</h2>
          @if (!editing()) {
            <button
              class="btn btn-ghost btn-sm gap-2"
              (click)="startEdit()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          } @else {
            <button
              class="btn btn-ghost btn-sm text-base-content/50"
              (click)="cancelEdit()"
              [disabled]="userSignals.loading()"
            >
              Cancelar
            </button>
          }
        </div>

        <!-- ── Modo lectura ──────────────────────────────── -->
        @if (!editing()) {
          <div class="space-y-4">

            <!-- Username -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span class="text-sm text-base-content/50 sm:w-36 font-medium flex-shrink-0">
                Usuario
              </span>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{{ profile()?.userName }}</span>
                <span class="badge badge-ghost badge-sm text-base-content/40">No editable</span>
              </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span class="text-sm text-base-content/50 sm:w-36 font-medium flex-shrink-0">
                Email
              </span>
              <div class="flex items-center gap-2 min-w-0">
                <span class="truncate">{{ profile()?.email }}</span>
                @if (profile()?.emailConfirmed) {
                  <span class="badge badge-success badge-xs flex-shrink-0">Verificado</span>
                } @else {
                  <span class="badge badge-warning badge-xs flex-shrink-0">Sin verificar</span>
                }
              </div>
            </div>

            <!-- Teléfono -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span class="text-sm text-base-content/50 sm:w-36 font-medium flex-shrink-0">
                Teléfono
              </span>
              @if (profile()?.phoneNumber) {
                <div class="flex items-center gap-2">
                  <span>{{ profile()!.phoneNumber }}</span>
                  @if (profile()?.phoneNumberConfirmed) {
                    <span class="badge badge-success badge-xs">Verificado</span>
                  } @else {
                    <span class="badge badge-warning badge-xs">Sin verificar</span>
                  }
                </div>
              } @else {
                <span class="text-base-content/30 italic text-sm">Sin teléfono registrado</span>
              }
            </div>

            <!-- Fecha de registro -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span class="text-sm text-base-content/50 sm:w-36 font-medium flex-shrink-0">
                Miembro desde
              </span>
              <span class="text-sm">{{ registrationFormatted() }}</span>
            </div>

            <!-- Roles -->
            <div class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
              <span class="text-sm text-base-content/50 sm:w-36 font-medium flex-shrink-0 pt-0.5">
                Roles
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (role of profile()?.roles; track role) {
                  <span
                    class="badge badge-sm font-medium"
                    [class]="role === 'Admin' ? 'badge-primary' : 'badge-ghost'"
                  >
                    {{ role }}
                  </span>
                }
              </div>
            </div>

          </div>
        }

        <!-- ── Modo edición ─────────────────────────────── -->
        @if (editing()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

            <!-- Username (read-only en edición también) -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Usuario</span>
                <span class="label-text-alt text-base-content/40">No editable</span>
              </label>
              <input
                type="text"
                [value]="profile()?.userName"
                class="input input-bordered w-full bg-base-200 cursor-not-allowed"
                disabled
              />
            </div>

            <!-- Email -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                formControlName="email"
                class="input input-bordered w-full"
                [class.input-error]="isInvalid('email')"
                placeholder="tu@email.com"
              />
              @if (isInvalid('email')) {
                <label class="label py-1">
                  <span class="label-text-alt text-error">
                    {{ form.get('email')?.hasError('required') ? 'El email es requerido' : 'Formato de email inválido' }}
                  </span>
                </label>
              }
              <!-- Error del servidor (ej: email ya en uso) -->
              @if (serverError()) {
                <label class="label py-1">
                  <span class="label-text-alt text-error">{{ serverError() }}</span>
                </label>
              }
            </div>

            <!-- Teléfono -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium">Teléfono</span>
                <span class="label-text-alt text-base-content/40">Opcional</span>
              </label>
              <input
                type="tel"
                formControlName="phoneNumber"
                class="input input-bordered w-full"
                placeholder="+52 55 1234 5678"
              />
              <label class="label py-1">
                <span class="label-text-alt text-base-content/40">
                  Déjalo vacío para eliminar el teléfono
                </span>
              </label>
            </div>

            <!-- Acciones -->
            <div class="flex gap-2 pt-2">
              <button
                type="button"
                class="btn btn-ghost flex-1"
                (click)="cancelEdit()"
                [disabled]="userSignals.loading()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary flex-1 gap-2"
                [disabled]="form.invalid || !hasChanges() || userSignals.loading()"
              >
                @if (userSignals.loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Guardar cambios
              </button>
            </div>
          </form>
        }

      </div>
    </div>
  `
})
export class ProfileInfoCardComponent implements OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  protected readonly userSignals = inject(UserSignalsService);

  readonly profile = input<UserProfile | null>(null);

  protected readonly editing     = signal(false);
  protected readonly serverError = signal<string | null>(null);

  /**
   * FIX: computed() no puede rastrear cambios en FormGroup.value —
   * FormGroup no es un signal. Solución: signal propio actualizado
   * mediante valueChanges (Observable → subscription).
   */
  private readonly formValue = signal<{ email: string; phoneNumber: string }>({
    email: '', phoneNumber: ''
  });
  private valueSub = new Subscription();

  protected readonly form: FormGroup = this.fb.group({
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
  });

  // ── Computed ─────────────────────────────────────────────

  protected readonly registrationFormatted = computed(() => {
    const date = this.profile()?.registrationDate;
    return date ? DateUtils.formatLong(date) : '—';
  });

  /** Ahora sí reactivo: compara el signal formValue con el perfil original */
  protected readonly hasChanges = computed(() => {
    const p = this.profile();
    if (!p) return false;
    const v = this.formValue();
    return v.email !== p.email || (v.phoneNumber ?? '') !== (p.phoneNumber ?? '');
  });

  // ── Lifecycle ────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.profile()) {
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.valueSub.unsubscribe();
  }

  // ── Handlers ─────────────────────────────────────────────

  protected startEdit(): void {
    this.resetForm();
    this.serverError.set(null);
    this.editing.set(true);

    // Suscribir valueChanges para mantener formValue signal actualizado
    this.valueSub.unsubscribe();
    this.valueSub = this.form.valueChanges.subscribe(v => {
      this.formValue.set({
        email:       v.email       ?? '',
        phoneNumber: v.phoneNumber ?? '',
      });
    });
  }

  protected cancelEdit(): void {
    this.valueSub.unsubscribe();
    this.editing.set(false);
    this.serverError.set(null);
    this.resetForm();
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.hasChanges()) return;
    this.serverError.set(null);

    const raw = this.form.value;
    try {
      await this.userSignals.updateProfile({
        email:       raw.email?.trim() || undefined,
        phoneNumber: raw.phoneNumber?.trim() || undefined,
      });
      this.valueSub.unsubscribe();
      this.editing.set(false);
    } catch (err: any) {
      // Mostrar error del servidor inline bajo el campo email
      this.serverError.set(err?.error?.Message || 'Error al actualizar perfil');
    }
  }

  protected isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  // ── Privados ─────────────────────────────────────────────

  private resetForm(): void {
    const p = this.profile();
    if (!p) return;
    this.form.reset({
      email:       p.email,
      phoneNumber: p.phoneNumber ?? '',
    });
    // Sincronizar el signal con el valor inicial del form
    this.formValue.set({
      email:       p.email,
      phoneNumber: p.phoneNumber ?? '',
    });
  }
}