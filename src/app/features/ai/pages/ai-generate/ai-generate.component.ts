// src/app/features/ai/pages/ai-generate/ai-generate.component.ts

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiSignalsService } from '@core/signals/ai-signals.service';
import { AiDetailLevel, AiGeneratedProject } from '@core/models/ai.model';
import { AiLoadingStateComponent } from '../../components/ai-loading-state/ai-loading-state.component';
import { AiResultPreviewComponent } from '../../components/ai-result-preview/ai-result-preview.component';

type PageStep = 'form' | 'preview';

/** Opciones del toggle detailLevel — patrón idéntico a priorityOptions en task-form-dialog */
const DETAIL_OPTIONS: Array<{ value: AiDetailLevel; label: string; description: string }> = [
  {
    value: 'brief',
    label: 'Conciso',
    description: 'Títulos cortos, sin descripciones largas',
  },
  {
    value: 'detailed',
    label: 'Detallado',
    description: 'Títulos + descripción por cada tarea',
  },
];

/** Opciones del selector de número de tareas */
const MAX_TASKS_OPTIONS = [5, 10, 15, 20] as const;

/**
 * Página principal del módulo de IA.
 *
 * Gestiona dos fases (steps) dentro del mismo componente para no perder
 * el estado entre navegaciones:
 *
 *   step 'form'    → formulario de descripción + opciones avanzadas
 *   step 'preview' → AiResultPreviewComponent con la sugerencia editable
 *
 * La fase cambia localmente con `step.set(...)`.
 * La navegación final (/projects/:id) la hace AiSignalsService tras confirmar.
 *
 * Al destruir el componente se limpia el estado de generación para que
 * volver a la página empiece desde cero.
 */
@Component({
  selector: 'app-ai-generate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AiLoadingStateComponent,
    AiResultPreviewComponent,
  ],
  template: `
    <div class="min-h-screen bg-base-200">
      <div class="container mx-auto px-4 py-8 max-w-3xl">

        <!-- ── Header ──────────────────────────────────────── -->
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-4">
            <a routerLink="/projects" class="btn btn-ghost btn-sm btn-circle">
              <svg class="w-5 h-5" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <div>
              <h1 class="text-2xl font-bold text-base-content leading-tight">
                Crear proyecto con IA
              </h1>
              <p class="text-sm text-base-content/60 mt-0.5">
                Describe tu proyecto y la IA generará una estructura completa
              </p>
            </div>
          </div>

          <!-- Steps indicator -->
          <div class="ml-14">
            <ul class="steps steps-horizontal text-xs">
              <li class="step"
                  [class.step-primary]="step() === 'form' || step() === 'preview'">
                Descripción
              </li>
              <li class="step"
                  [class.step-primary]="step() === 'preview'">
                Revisar y confirmar
              </li>
            </ul>
          </div>
        </div>

        <!-- ── Step FORM ────────────────────────────────────── -->
        @if (step() === 'form') {

          <!-- Loading state (cubre todo el step mientras genera) -->
          @if (aiSignals.loading()) {
            <app-ai-loading-state context="generate" />
          } @else {

            <form [formGroup]="aiForm" (ngSubmit)="onSubmit()">

              <!-- Card principal -->
              <div class="card bg-base-100 shadow-sm mb-4">
                <div class="card-body gap-5">

                  <!-- Descripción -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">
                        Describe tu proyecto
                      </span>
                      <span class="label-text-alt text-error">*</span>
                    </label>
                    <textarea
                      formControlName="description"
                      placeholder="Ej: Quiero crear una tienda online de ropa con carrito de compras,
pagos con Stripe y panel de administración para gestionar inventario."
                      class="textarea textarea-bordered w-full h-36 resize-none leading-relaxed"
                      [class.textarea-error]="isFieldInvalid('description')"
                      maxlength="2000"
                    ></textarea>

                    <!-- Contador + errores -->
                    <label class="label py-1">
                      @if (isFieldInvalid('description')) {
                        <span class="label-text-alt text-error">
                          @if (aiForm.get('description')?.hasError('required')) {
                            La descripción es requerida
                          } @else if (aiForm.get('description')?.hasError('minlength')) {
                            Mínimo 20 caracteres para que la IA entienda el contexto
                          } @else if (aiForm.get('description')?.hasError('maxlength')) {
                            Máximo 2000 caracteres
                          }
                        </span>
                      } @else {
                        <span class="label-text-alt text-base-content/40">
                          {{ descriptionLength() }}/2000
                        </span>
                      }

                      <!-- Indicador mínimo -->
                      @if (!isFieldInvalid('description') && descriptionLength() > 0
                           && descriptionLength() < 20) {
                        <span class="label-text-alt text-warning">
                          {{ 20 - descriptionLength() }} caracteres más para continuar
                        </span>
                      }
                    </label>
                  </div>

                  <!-- Opciones avanzadas (colapsable) -->
                  <div class="collapse collapse-arrow bg-base-200 rounded-xl">
                    <input type="checkbox" class="peer" />
                    <div class="collapse-title text-sm font-medium
                                text-base-content/70 peer-checked:text-base-content">
                      Opciones avanzadas
                    </div>
                    <div class="collapse-content">
                      <div class="pt-2 space-y-5">

                        <!-- Número de tareas -->
                        <div class="form-control">
                          <label class="label py-1">
                            <span class="label-text font-medium text-sm">
                              Número máximo de tareas
                            </span>
                            <span class="label-text-alt text-base-content/40">
                              {{ aiForm.get('maxTasks')?.value }} tareas
                            </span>
                          </label>
                          <div class="flex gap-2">
                            @for (n of maxTasksOptions; track n) {
                              <button
                                type="button"
                                class="flex-1 py-2 rounded-lg border-2 text-sm
                                       font-medium transition-all"
                                [class.border-primary]="selectedMaxTasks() === n"
                                [class.bg-primary/5]="selectedMaxTasks() === n"
                                [class.text-primary]="selectedMaxTasks() === n"
                                [class.border-base-200]="selectedMaxTasks() !== n"
                                [class.text-base-content]="selectedMaxTasks() !== n"
                                (click)="setMaxTasks(n)"
                              >
                                {{ n }}
                              </button>
                            }
                          </div>
                        </div>

                        <!-- Nivel de detalle — patrón toggle de task-form-dialog -->
                        <div class="form-control">
                          <label class="label py-1">
                            <span class="label-text font-medium text-sm">
                              Nivel de detalle de las tareas
                            </span>
                          </label>
                          <div class="flex gap-2">
                            @for (opt of detailOptions; track opt.value) {
                              <button
                                type="button"
                                class="flex-1 flex flex-col items-start gap-0.5
                                       py-2.5 px-3 rounded-lg border-2 text-sm
                                       font-medium transition-all"
                                [class.border-primary]="selectedDetail() === opt.value"
                                [class.bg-primary/5]="selectedDetail() === opt.value"
                                [class.border-base-200]="selectedDetail() !== opt.value"
                                (click)="setDetailLevel(opt.value)"
                              >
                                <span>{{ opt.label }}</span>
                                <span class="text-xs font-normal text-base-content/50
                                             leading-tight">
                                  {{ opt.description }}
                                </span>
                              </button>
                            }
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Info banner -->
              <div class="alert alert-info mb-6">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0
                       11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                  <p class="font-medium mb-0.5">La IA genera una sugerencia, tú decides</p>
                  <p class="text-base-content/70">
                    Podrás editar el nombre, la descripción y seleccionar qué tareas
                    incluir antes de guardar.
                  </p>
                </div>
              </div>

              <!-- Rate limit aviso (si queda poco cupo) -->
              @if (rateLimitLow()) {
                <div class="alert alert-warning mb-4">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                         1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
                         0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-sm">
                    Te quedan {{ aiSignals.rateLimitRemaining() }} generación{{ aiSignals.rateLimitRemaining() !== 1 ? 'es' : '' }}
                    disponible{{ aiSignals.rateLimitRemaining() !== 1 ? 's' : '' }} en esta hora.
                  </span>
                </div>
              }

              <!-- Error del último intento -->
              @if (aiSignals.error()) {
                <div class="alert alert-error mb-4">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0
                         11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm">{{ aiSignals.error() }}</span>
                </div>
              }

              <!-- Acciones -->
              <div class="flex gap-3 justify-end">
                <a routerLink="/projects" class="btn btn-ghost">
                  Cancelar
                </a>
                <button
                  type="submit"
                  class="btn btn-primary gap-2"
                  [disabled]="aiForm.invalid || aiSignals.loading()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                         00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                         5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                         4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generar con IA
                </button>
              </div>

            </form>
          }

        }

        <!-- ── Step PREVIEW ─────────────────────────────────── -->
        @if (step() === 'preview' && generatedProject()) {
          <app-ai-result-preview
            [project]="generatedProject()!"
            (back)="onBack()"
          />
        }

      </div>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class AiGenerateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  protected readonly aiSignals = inject(AiSignalsService);

  // ── State local ──────────────────────────────────────────

  protected readonly step = signal<PageStep>('form');

  /** Signal de los toggles — mismo patrón que selectedPriority en task-form-dialog */
  protected readonly selectedDetail  = signal<AiDetailLevel>('brief');
  protected readonly selectedMaxTasks = signal<number>(10);

  // ── Constantes de opciones ───────────────────────────────

  protected readonly detailOptions  = DETAIL_OPTIONS;
  protected readonly maxTasksOptions = MAX_TASKS_OPTIONS;

  // ── Formulario ───────────────────────────────────────────

  protected aiForm!: FormGroup;

  // ── Computed ─────────────────────────────────────────────

  protected readonly generatedProject = computed(
    () => this.aiSignals.generatedProject()
  );

  protected readonly descriptionLength = computed(
    () => (this.aiForm?.get('description')?.value as string)?.length ?? 0
  );

  /**
   * Avisa cuando quedan 2 o menos generaciones en la ventana de rate limit.
   * null significa que aún no tenemos datos de rate limit (primer uso).
   */
  protected readonly rateLimitLow = computed(() => {
    const remaining = this.aiSignals.rateLimitRemaining();
    return remaining !== null && remaining <= 2;
  });

  // ── Lifecycle ────────────────────────────────────────────

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    // Limpiar sugerencia al salir — volver a la página empieza desde cero
    this.aiSignals.clearGeneration();
  }

  // ── Handlers del formulario ──────────────────────────────

  protected setDetailLevel(value: AiDetailLevel): void {
    this.selectedDetail.set(value);
    this.aiForm.patchValue({ detailLevel: value });
  }

  protected setMaxTasks(value: number): void {
    this.selectedMaxTasks.set(value);
    this.aiForm.patchValue({ maxTasks: value });
  }

  protected async onSubmit(): Promise<void> {
    if (this.aiForm.invalid) {
      this.aiForm.markAllAsTouched();
      return;
    }

    try {
      await this.aiSignals.generateProject(this.aiForm.value);
      // Solo avanzamos al preview si la generación tuvo éxito
      this.step.set('preview');
    } catch {
      // El error ya fue notificado en AiSignalsService — permanecemos en 'form'
    }
  }

  // ── Handler del preview ──────────────────────────────────

  /** El usuario pulsó "Volver" en el preview — regresa al formulario sin limpiar nada */
  protected onBack(): void {
    this.step.set('form');
  }

  // ── Helpers de validación ────────────────────────────────

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.aiForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  // ── Privados ─────────────────────────────────────────────

  private initForm(): void {
    this.aiForm = this.fb.group({
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ],
      ],
      maxTasks:    [10],
      detailLevel: ['brief' as AiDetailLevel],
    });
  }
}