// src/app/features/projects/components/project-edit-dialog/project-edit-dialog.component.ts

import { Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Project, ProjectStatusHelper } from '@core/models/project.model';
import { ProjectSignalsService } from '@core/signals/project-signals.service';

/**
 * Dialog para editar un proyecto
 * Se puede usar como modal o como componente standalone
 */
@Component({
  selector: 'app-project-edit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Dialog modal (DaisyUI) -->
    <dialog [id]="dialogId()" class="modal">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-6">Editar Proyecto</h3>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
          <!-- Nombre -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medium">Nombre del proyecto</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="Nombre del proyecto"
              class="input input-bordered w-full"
              [class.input-error]="isFieldInvalid('name')"
              maxlength="255"
            />
            @if (isFieldInvalid('name')) {
              <label class="label">
                <span class="label-text-alt text-error">
                  @if (editForm.get('name')?.hasError('required')) {
                    El nombre es requerido
                  } @else if (editForm.get('name')?.hasError('minlength')) {
                    Mínimo 3 caracteres
                  }
                </span>
              </label>
            }
          </div>

          <!-- Descripción -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medium">Descripción</span>
            </label>
            <textarea
              formControlName="description"
              placeholder="Descripción del proyecto"
              class="textarea textarea-bordered w-full h-32"
              maxlength="2000"
            ></textarea>
            <label class="label">
              <span class="label-text-alt text-base-content/50">
                {{ editForm.get('description')?.value?.length || 0 }}/2000 caracteres
              </span>
            </label>
          </div>

          <!-- Estado -->
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Estado</span>
            </label>
            <select
              formControlName="status"
              class="select select-bordered w-full"
            >
              @for (option of statusOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>

          <!-- Botones -->
          <div class="modal-action">
            <button 
              type="button" 
              class="btn btn-ghost"
              (click)="onCancel()"
              [disabled]="projectSignals.loading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="editForm.invalid || projectSignals.loading()"
            >
              @if (projectSignals.loading()) {
                <span class="loading loading-spinner loading-sm"></span>
                Guardando...
              } @else {
                Guardar Cambios
              }
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly projectSignals = inject(ProjectSignalsService);

  // Inputs
  readonly project = input.required<Project>();
  readonly dialogId = input<string>('project-edit-dialog');

  // Outputs
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  // Form
  protected editForm!: FormGroup;
  protected readonly statusOptions = ProjectStatusHelper.getAllOptions();

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario con los datos del proyecto
   */
  private initForm(): void {
    const proj = this.project();
    this.editForm = this.fb.group({
      name: [proj.name, [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: [proj.description || '', [Validators.maxLength(2000)]],
      status: [proj.status, [Validators.required]]
    });
  }

  /**
   * Maneja el submit
   */
  async onSubmit(): Promise<void> {
    if (this.editForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    const projectId = this.project().id;
    if (!projectId) {
      console.error('Project ID is missing');
      return;
    }

    try {
      await this.projectSignals.updateProject(projectId, this.editForm.value);
      this.saved.emit();
      this.closeDialog();
    } catch (error) {
      console.error('Error updating project:', error);
      // El error ya fue manejado por el service (muestra notificación)
    }
  }

  /**
   * Maneja la cancelación
   */
  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }

  /**
   * Cierra el dialog
   */
  private closeDialog(): void {
    const dialog = document.getElementById(this.dialogId()) as HTMLDialogElement;
    dialog?.close();
  }

  /**
   * Abre el dialog
   */
  openDialog(): void {
    const dialog = document.getElementById(this.dialogId()) as HTMLDialogElement;
    dialog?.showModal();
  }

  /**
   * Verifica si un campo es inválido
   */
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como touched
   */
  private markFormAsTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }
}