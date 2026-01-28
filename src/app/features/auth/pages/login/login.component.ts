// src/app/features/auth/pages/login/login.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthSignalsService } from '../../../../core/signals/auth.signal.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Componente de Login
 * Formulario reactivo para autenticación de usuarios
 */
@Component({
  selector: 'app-login',
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
            Gestión de Proyectos
          </h1>
          <p class="text-base-content/70">
            Inicia sesión para continuar
          </p>
        </div>

        <!-- Card de Login -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <!-- <h2 class="card-title text-2xl mb-6">Iniciar Sesión</h2> -->

            <!-- Formulario -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              
              <!-- Campo: Username -->
              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text font-medium">Usuario</span>
                </label>
                <input
                  type="text"
                  formControlName="username"
                  placeholder="Ingresa tu usuario"
                  class="input input-bordered w-full"
                  [class.input-error]="isFieldInvalid('username')"
                  autocomplete="username"
                />
                
                <!-- Errores de Username -->
                @if (isFieldInvalid('username')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (loginForm.get('username')?.hasError('required')) {
                        El usuario es requerido
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
                    placeholder="Ingresa tu contraseña"
                    class="input input-bordered w-full pr-12"
                    [class.input-error]="isFieldInvalid('password')"
                    autocomplete="current-password"
                  />
                  <!-- Toggle mostrar/ocultar password -->
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm absolute right-0 top-0 h-full"
                    (click)="togglePasswordVisibility()"
                  >
                    @if (showPassword()) {
                      <!-- Icono ojo cerrado -->
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    } @else {
                      <!-- Icono ojo abierto -->
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
                
                <!-- Errores de Password -->
                @if (isFieldInvalid('password')) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (loginForm.get('password')?.hasError('required')) {
                        La contraseña es requerida
                      }
                    </span>
                  </label>
                }
              </div>

              <!-- Checkbox: Recordarme -->
              <!-- <div class="form-control mb-6">
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    formControlName="rememberMe"
                    class="checkbox checkbox-primary checkbox-sm"
                  />
                  <span class="label-text">Recordarme</span>
                </label>
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
                [disabled]="loginForm.invalid || authSignals.loading()"
              >
                @if (authSignals.loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Iniciando sesión...
                } @else {
                  Iniciar Sesión
                }
              </button>
            </form>

            <!-- Divider -->
            <div class="divider">O</div>

            <!-- Link a Registro -->
            <div class="text-center">
              <p class="text-sm text-base-content/70">
                ¿No tienes cuenta?
                <a routerLink="/auth/register" class="link link-primary font-medium">
                  Regístrate aquí
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
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly authSignals = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // Signal para mostrar/ocultar password
  protected readonly showPassword = signal(false);

  // FormGroup del login
  protected loginForm!: FormGroup;

  // Return URL (para redirigir después del login)
  private returnUrl = '/dashboard';

  ngOnInit(): void {
    this.initForm();
    this.loadReturnUrl();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  /**
   * Lee el returnUrl de los query params
   */
  private loadReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Maneja el submit del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    const { username, password, rememberMe } = this.loginForm.value;

    try {
      await this.authSignals.login(
        { username, password },
        { rememberMe }
      );

      // Login exitoso, navegar a returnUrl
      await this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      // El error ya fue manejado por el error interceptor y AuthSignalsService
      // Solo necesitamos asegurar que el formulario no se deshabilite
      console.error('Login error:', error);
    }
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
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