// src/app/features/projects/pages/project-create/project-create.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import { ProjectStatus, ProjectStatusHelper } from '@core/models/project.model';

/**
 * Página de creación de proyecto
 */
@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <a routerLink="/projects" class="btn btn-ghost btn-sm btn-circle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <h1 class="text-3xl font-bold text-base-content">
            Crear Nuevo Proyecto
          </h1>
        </div>
        <p class="text-base-content/70 ml-14">
          Completa la información para crear tu proyecto
        </p>
      </div>

      <!-- Form Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            
            <!-- Nombre del proyecto -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text font-medium">Nombre del proyecto</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="Ej: Sistema de gestión de ventas"
                class="input input-bordered w-full"
                [class.input-error]="isFieldInvalid('name')"
                maxlength="255"
              />
              
              @if (isFieldInvalid('name')) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (projectForm.get('name')?.hasError('required')) {
                      El nombre es requerido
                    } @else if (projectForm.get('name')?.hasError('minlength')) {
                      Mínimo 3 caracteres
                    }
                  </span>
                </label>
              } @else {
                <label class="label">
                  <span class="label-text-alt text-base-content/50">
                    {{ projectForm.get('name')?.value?.length || 0 }}/255 caracteres
                  </span>
                </label>
              }
            </div>

            <!-- Descripción -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text font-medium">Descripción</span>
                <span class="label-text-alt">Opcional</span>
              </label>
              <textarea
                formControlName="description"
                placeholder="Describe brevemente el propósito y objetivos del proyecto..."
                class="textarea textarea-bordered w-full h-32"
                [class.input-error]="isFieldInvalid('description')"
                maxlength="2000"
              ></textarea>
              
              @if (isFieldInvalid('description')) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (projectForm.get('description')?.hasError('maxlength')) {
                      Máximo 2000 caracteres
                    }
                  </span>
                </label>
              } @else {
                <label class="label">
                  <span class="label-text-alt text-base-content/50">
                    {{ projectForm.get('description')?.value?.length || 0 }}/2000 caracteres
                  </span>
                </label>
              }
            </div>

            <!-- Estado inicial -->
            <div class="form-control mb-6">
              <label class="label">
                <span class="label-text font-medium">Estado inicial</span>
              </label>
              <select
                formControlName="status"
                class="select select-bordered w-full"
              >
                @for (option of statusOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
              <label class="label">
                <span class="label-text-alt text-base-content/50">
                  Puedes cambiar el estado después de crear el proyecto
                </span>
              </label>
            </div>

            <!-- Info box -->
            <div class="alert alert-info mb-6">
              <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Nota:</strong> Serás agregado automáticamente como propietario (Owner) del proyecto.
                Podrás invitar miembros después de crearlo.
              </span>
            </div>

            <!-- Botones -->
            <div class="card-actions justify-end gap-2">
              <a routerLink="/projects" class="btn btn-ghost">
                Cancelar
              </a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="projectForm.invalid || projectSignals.loading()"
              >
                @if (projectSignals.loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Creando...
                } @else {
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Proyecto
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tips -->
      <div class="mt-8 space-y-4">
        <h3 class="text-lg font-semibold text-base-content">Consejos para tu proyecto</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold flex items-center gap-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nombre claro
              </h4>
              <p class="text-sm text-base-content/70">
                Usa un nombre descriptivo que identifique fácilmente el proyecto
              </p>
            </div>
          </div>

          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold flex items-center gap-2">
                <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Descripción útil
              </h4>
              <p class="text-sm text-base-content/70">
                Incluye objetivos y alcance para que tu equipo entienda el propósito
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly projectSignals = inject(ProjectSignalsService);

  protected projectForm!: FormGroup;
  protected readonly statusOptions = ProjectStatusHelper.getAllOptions();

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(2000)]],
      status: [ProjectStatus.OnHold, [Validators.required]]
    });
  }

  /**
   * Maneja el submit del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    try {
      const newProject = await this.projectSignals.createProject(this.projectForm.value);
      
      // Navegar al detalle del proyecto recién creado
      await this.router.navigate(['/projects', newProject.id]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  /**
   * Verifica si un campo es inválido
   */
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como touched
   */
  private markFormAsTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      control?.markAsTouched();
    });
  }
}