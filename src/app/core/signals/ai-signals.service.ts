// src/app/core/signals/ai-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AiService } from '@core/services/ai.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import {
  GenerateProjectRequest,
  AiConfirmProjectRequest,
  AiConfirmTaskRequest,
  AiGeneratedProject,
  AiGeneratedTask,
  AiRateLimitInfo,
  AiErrorHelper,
  AiErrorType,
  AiTaskHelper,
} from '@core/models/ai.model';
import { Project } from '@core/models/project.model';

/**
 * Servicio de state management para el módulo de IA.
 * Punto único de verdad para el estado de generación/sugerencia con IA.
 *
 * Patrón idéntico a ProjectSignalsService y AuthSignalsService:
 * signals base + computed derivados + métodos async con firstValueFrom().
 */
@Injectable({ providedIn: 'root' })
export class AiSignalsService {
  private readonly aiService        = inject(AiService);
  private readonly notifications    = inject(NotificationService);
  private readonly projectSignals   = inject(ProjectSignalsService);
  private readonly router           = inject(Router);

  // ─── Signals base ───────────────────────────────────────

  /** Proyecto generado por la IA (sugerencia, no persistido). */
  readonly generatedProject = signal<AiGeneratedProject | null>(null);

  /** Tareas sugeridas para un proyecto existente. */
  readonly suggestedTasks = signal<AiGeneratedTask[]>([]);

  /** ID del proyecto para el que se cargaron las sugerencias. */
  readonly suggestedForProjectId = signal<string | null>(null);

  /** true mientras hay una petición HTTP activa al módulo de IA. */
  readonly loading = signal<boolean>(false);

  /** Mensaje de error del último fallo, null si no hay error. */
  readonly error = signal<string | null>(null);

  /** Info de rate limit del último request exitoso. */
  readonly rateLimitInfo = signal<AiRateLimitInfo | null>(null);

  // ─── Computed ───────────────────────────────────────────

  /** Número de tareas marcadas para confirmar. */
  readonly selectedTasksCount = computed(() =>
    this.generatedProject()?.tasks.filter(t => t.selected).length ?? 0
  );

  /** true si hay una sugerencia de proyecto lista para revisar. */
  readonly hasGeneration = computed(() => this.generatedProject() !== null);

  /** true si hay sugerencias de tareas disponibles. */
  readonly hasSuggestions = computed(() => this.suggestedTasks().length > 0);

  /** Solicitudes restantes según el rate limit. null si no hay info. */
  readonly rateLimitRemaining = computed(() => this.rateLimitInfo()?.remaining ?? null);

  // ─── Métodos públicos ────────────────────────────────────

  /**
   * Llama a POST /api/ai/generate-project.
   * Al terminar, el estado `generatedProject` contiene la sugerencia con
   * todas las tareas marcadas como `selected: true` por defecto.
   *
   * No navega — la página ai-generate gestiona el cambio de step.
   */
  async generateProject(req: GenerateProjectRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { project, rateLimit } = await firstValueFrom(
        this.aiService.generateProject(req)
      );

      // Marcar todas las tareas como seleccionadas por defecto
      const projectWithSelection: AiGeneratedProject = {
        ...project,
        tasks: project.tasks.map(t => ({ ...t, selected: true })),
      };

      this.generatedProject.set(projectWithSelection);
      this.rateLimitInfo.set(rateLimit);

    } catch (error: any) {
      this.handleAiError(error);
      throw error; // re-lanzar para que ai-generate pueda reaccionar
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Llama a POST /api/ai/confirm-project usando el estado actual de `generatedProject`.
   * Solo incluye las tareas con `selected: true`.
   *
   * Después de persistir, actualiza la lista de proyectos y navega al detalle.
   * Devuelve el Project creado para que el componente pueda reaccionar si necesita.
   */
  async confirmProject(): Promise<Project> {
    const generated = this.generatedProject();
    if (!generated) {
      throw new Error('No hay proyecto generado para confirmar.');
    }

    this.loading.set(true);
    this.error.set(null);

    const selectedTasks: AiConfirmTaskRequest[] = generated.tasks
      .filter(t => t.selected)
      .map(t => AiTaskHelper.toConfirmRequest(t));

    const req: AiConfirmProjectRequest = {
      name:          generated.name,
      description:   generated.description,
      status:        generated.status,
      selectedTasks,
    };

    try {
      const newProject = await firstValueFrom(this.aiService.confirmProject(req));

      // Sincronizar con ProjectSignalsService para que la lista esté al día
      this.projectSignals.projects.update(projects => [...projects, newProject]);

      this.notifications.success(`Proyecto "${newProject.name}" creado con ${selectedTasks.length} tarea${selectedTasks.length !== 1 ? 's' : ''}.`);

      // Limpiar estado de generación
      this.clearGeneration();

      // Navegar al detalle del proyecto recién creado
      await this.router.navigate(['/projects', newProject.id]);

      return newProject;

    } catch (error: any) {
      this.handleAiError(error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Llama a GET /api/ai/suggest-tasks/:projectId.
   * Solo hace la petición si no hay sugerencias cargadas para ese proyecto.
   * Usa `force: true` para ignorar la caché y refrescar.
   */
  async suggestTasks(projectId: string, force = false): Promise<void> {
    // Evitar petición duplicada si ya tenemos sugerencias para este proyecto
    if (!force && this.suggestedForProjectId() === projectId && this.hasSuggestions()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const tasks = await firstValueFrom(this.aiService.suggestTasks(projectId));

      // Marcar todas como seleccionadas por defecto
      const tasksWithSelection: AiGeneratedTask[] = tasks.map(t => ({
        ...t,
        selected: true,
      }));

      this.suggestedTasks.set(tasksWithSelection);
      this.suggestedForProjectId.set(projectId);

    } catch (error: any) {
      this.handleAiError(error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza el nombre, descripción o estado del proyecto generado
   * sin llamar al backend. El usuario edita la sugerencia antes de confirmar.
   */
  updateGeneratedProject(
    patch: Partial<Pick<AiGeneratedProject, 'name' | 'description' | 'status'>>
  ): void {
    this.generatedProject.update(current => {
      if (!current) return current;
      return { ...current, ...patch };
    });
  }

  /**
   * Marca o desmarca una tarea sugerida por índice.
   */
  toggleGeneratedTask(index: number): void {
    this.generatedProject.update(current => {
      if (!current) return current;
      const tasks = current.tasks.map((t, i) =>
        i === index ? { ...t, selected: !t.selected } : t
      );
      return { ...current, tasks };
    });
  }

  /**
   * Marca o desmarca una tarea sugerida (para proyecto existente) por índice.
   */
  toggleSuggestedTask(index: number): void {
    this.suggestedTasks.update(tasks =>
      tasks.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  }

  /**
   * Selecciona o deselecciona todas las tareas del proyecto generado.
   */
  toggleAllGeneratedTasks(selected: boolean): void {
    this.generatedProject.update(current => {
      if (!current) return current;
      return { ...current, tasks: current.tasks.map(t => ({ ...t, selected })) };
    });
  }

  /**
   * Selecciona o deselecciona todas las tareas sugeridas.
   */
  toggleAllSuggestedTasks(selected: boolean): void {
    this.suggestedTasks.update(tasks => tasks.map(t => ({ ...t, selected })));
  }

  /** Limpia la sugerencia de proyecto generado. */
  clearGeneration(): void {
    this.generatedProject.set(null);
    this.error.set(null);
  }

  /** Limpia las sugerencias de tareas. */
  clearSuggestions(): void {
    this.suggestedTasks.set([]);
    this.suggestedForProjectId.set(null);
    this.error.set(null);
  }

  // ─── Privados ────────────────────────────────────────────

  /**
   * Manejo centralizado de errores del módulo de IA.
   * Cada código HTTP tiene un mensaje específico que el backend documenta.
   * El Retry-After header solo lo envía el middleware de rate limit del backend.
   */
  private handleAiError(error: any): void {
    const status: number = error?.status ?? 0;
    const errorType = AiErrorHelper.fromStatus(status);

    // Extraer Retry-After si existe (solo en 429)
    const retryAfter: number | undefined =
      status === 429
        ? parseInt(error?.headers?.get?.('Retry-After') ?? '0', 10) || undefined
        : undefined;

    const message = AiErrorHelper.getMessage(errorType, retryAfter);
    this.error.set(message);

    // Errores de rate limit como warning (no son errores del sistema)
    // Resto como error
    if (errorType === AiErrorType.RateLimit) {
      this.notifications.warning(message, 6000);
    } else {
      this.notifications.error(message);
    }
  }
}