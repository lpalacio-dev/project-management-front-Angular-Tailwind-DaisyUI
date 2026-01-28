// src/app/features/auth/pages/register/register.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSignalsService } from '../../../../core/signals/auth.signal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { 
  passwordMatchValidator, 
  noWhitespaceValidator,
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText
} from '../../validators/password.validators';

/**
 * Componente de Registro
 * Formulario reactivo para crear nuevas cuentas
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo o Título -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-primary mb-2">
            Crear Cuenta
          </h1>
          <p class="text-base-content/70">
            Únete al sistema de gestión de proyectos
          </p>
        </div>

        <!-- Card de Registro -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <!-- <h2 class="card-title text-2xl mb-6">Registro</h2> -->

            <!-- Formulario -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              
              <!-- Campo: Username -->
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium">Usuario</span>
                </label>
                <input
                  type="text"
                  formControlName="username"
                  placeholder="Elige un nombre de usuario"
                  class="input input-bordered w-full"
                  [class.input-error]="isFieldInvalid('username')"
                  autocomplete="username"
                />
                
                <!-- Errores de Username -->
                @if (isFieldInvalid('username')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (registerForm.get('username')?.hasError('required')) {
                        El usuario es requerido
                      } @else if (registerForm.get('username')?.hasError('minlength')) {
                        Mínimo 3 caracteres
                      } @else if (registerForm.get('username')?.hasError('whitespace')) {
                        No se permiten espacios
                      }
                    </span>
                  </label>
                } @else {
                  <label class="label">
                    <span class="label-text-alt text-base-content/50">
                      3-20 caracteres, sin espacios
                    </span>
                  </label>
                }
              </div>

              <!-- Campo: Email -->
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium">Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="input input-bordered w-full"
                  [class.input-error]="isFieldInvalid('email')"
                  autocomplete="email"
                />
                
                <!-- Errores de Email -->
                @if (isFieldInvalid('email')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (registerForm.get('email')?.hasError('required')) {
                        El email es requerido
                      } @else if (registerForm.get('email')?.hasError('email')) {
                        Email inválido
                      }
                    </span>
                  </label>
                }
              </div>

              <!-- Campo: Password -->
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium">Contraseña</span>
                </label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Crea una contraseña segura"
                    class="input input-bordered w-full pr-12"
                    [class.input-error]="isFieldInvalid('password')"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm absolute right-0 top-0 h-full"
                    (click)="togglePasswordVisibility()"
                  >
                    @if (showPassword()) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
                
                <!-- Indicador de fortaleza -->
                @if (registerForm.get('password')?.value) {
                  <div class="mt-2">
                    <div class="flex items-center gap-2 mb-1">
                      <progress 
                        class="progress w-full"
                        [class.progress-error]="passwordStrength() === 'weak'"
                        [class.progress-warning]="passwordStrength() === 'medium'"
                        [class.progress-success]="passwordStrength() === 'strong'"
                        [value]="passwordStrengthValue()"
                        max="100"
                      ></progress>
                    </div>
                    <label class="label pt-0">
                      <span class="label-text-alt" [class.text-error]="passwordStrength() === 'weak'"
                            [class.text-warning]="passwordStrength() === 'medium'"
                            [class.text-success]="passwordStrength() === 'strong'">
                        Fortaleza: {{ passwordStrengthText() }}
                      </span>
                    </label>
                  </div>
                }
                
                <!-- Errores de Password -->
                @if (isFieldInvalid('password')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (registerForm.get('password')?.hasError('required')) {
                        La contraseña es requerida
                      } @else if (registerForm.get('password')?.hasError('minlength')) {
                        Mínimo 6 caracteres
                      }
                    </span>
                  </label>
                } @else {
                  <label class="label">
                    <span class="label-text-alt text-base-content/50">
                      Mínimo 6 caracteres
                    </span>
                  </label>
                }
              </div>

              <!-- Campo: Confirmar Password -->
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium">Confirmar Contraseña</span>
                </label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  class="input input-bordered w-full"
                  [class.input-error]="isFieldInvalid('confirmPassword')"
                  autocomplete="new-password"
                />
                
                <!-- Errores de Confirm Password -->
                @if (isFieldInvalid('confirmPassword')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (registerForm.get('confirmPassword')?.hasError('required')) {
                        Debes confirmar tu contraseña
                      } @else if (registerForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                        Las contraseñas no coinciden
                      }
                    </span>
                  </label>
                }
              </div>

              <!-- Checkbox: Términos -->
              <!-- <div class="form-control mb-6">
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    formControlName="acceptTerms"
                    class="checkbox checkbox-primary checkbox-sm"
                    [class.checkbox-error]="isFieldInvalid('acceptTerms')"
                  />
                  <span class="label-text">
                    Acepto los 
                    <a href="#" class="link link-primary">términos y condiciones</a>
                  </span>
                </label>
                @if (isFieldInvalid('acceptTerms')) {
                  <label class="label pt-0">
                    <span class="label-text-alt text-error">
                      Debes aceptar los términos
                    </span>
                  </label>
                }
              </div> -->

              <!-- Error general del backend -->
              @if (authSignals.error()) {
                <div class="alert alert-error mb-4">
                  <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ authSignals.error() }}</span>
                </div>
              }

              <!-- Botón Submit -->
              <button
                type="submit"
                class="btn btn-primary w-full"
                [disabled]="registerForm.invalid || authSignals.loading()"
              >
                @if (authSignals.loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Creando cuenta...
                } @else {
                  Crear Cuenta
                }
              </button>
            </form>

            <!-- Divider -->
            <div class="divider">O</div>

            <!-- Link a Login -->
            <div class="text-center">
              <p class="text-sm text-base-content/70">
                ¿Ya tienes cuenta?
                <a routerLink="/auth/login" class="link link-primary font-medium">
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <!-- <div class="text-center mt-8 text-sm text-base-content/50">
          <p>© 2024 Sistema de Gestión de Proyectos</p>
        </div> -->
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authSignals = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // Signal para mostrar/ocultar password
  protected readonly showPassword = signal(false);

  // FormGroup del registro
  protected registerForm!: FormGroup;

  // Computed signals para indicador de fortaleza
  protected readonly passwordStrength = computed(() => {
    const password = this.registerForm?.get('password')?.value || '';
    return getPasswordStrength(password);
  });

  protected readonly passwordStrengthText = computed(() => {
    return getPasswordStrengthText(this.passwordStrength());
  });

  protected readonly passwordStrengthValue = computed(() => {
    const strength = this.passwordStrength();
    switch (strength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
    }
  });

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        noWhitespaceValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      acceptTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
  }

  /**
   * Maneja el submit del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    const { username, email, password } = this.registerForm.value;

    try {
      await this.authSignals.register({ username, email, password });

      // Registro exitoso, navegar a login
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      // El error ya fue manejado por el error interceptor y AuthSignalsService
      console.error('Register error:', error);
    }
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Toggle para mostrar/ocultar password
   */
  protected togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }
}