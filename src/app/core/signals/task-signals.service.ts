// src/app/core/signals/task-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaskService } from '@core/services/task.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { SKIP_LOADING } from '@core/services/user-search.service';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskStatus,
  TaskPriority
} from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskSignalsService {
  private readonly taskService   = inject(TaskService);
  private readonly authSignals   = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // ── Signals base ─────────────────────────────────────────
  readonly tasks            = signal<Task[]>([]);
  readonly selectedTask     = signal<Task | null>(null);
  readonly loading          = signal<boolean>(false);
  readonly error            = signal<string | null>(null);
  readonly filters          = signal<TaskFilters>({});
  readonly currentProjectId = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────

  readonly taskCount = computed(() => this.tasks().length);

  readonly filteredTasks = computed(() => {
    let result   = this.tasks();
    const f      = this.filters();
    const userId = this.authSignals.userId();

    if (f.search)
      result = this.taskService.filterBySearch(result, f.search);

    if (f.status && (f.status as string) !== 'all')
      result = this.taskService.filterByStatus(result, f.status);

    if (f.priority && (f.priority as string) !== 'all')
      result = this.taskService.filterByPriority(result, f.priority);

    if (f.assignedTo && f.assignedTo !== 'all' && userId)
      result = this.taskService.filterByAssignment(result, f.assignedTo, userId);

    return result;
  });

  readonly pendingTasks    = computed(() => this.tasks().filter(t => t.status === TaskStatus.Pending));
  readonly inProgressTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.InProgress));
  readonly completedTasks  = computed(() => this.tasks().filter(t => t.status === TaskStatus.Completed));
  readonly myTasks         = computed(() => {
    const userId = this.authSignals.userId();
    return this.tasks().filter(t => t.assignedToId === userId);
  });
  readonly unassignedTasks = computed(() => this.tasks().filter(t => !t.assignedToId));

  readonly stats = computed(() => ({
    total:        this.tasks().length,
    pending:      this.pendingTasks().length,
    inProgress:   this.inProgressTasks().length,
    completed:    this.completedTasks().length,
    myTasks:      this.myTasks().length,
    unassigned:   this.unassignedTasks().length,
    highPriority: this.tasks().filter(t => t.priority === TaskPriority.High).length,
  }));

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(
      f.search ||
      (f.status     && (f.status     as string) !== 'all') ||
      (f.priority   && (f.priority   as string) !== 'all') ||
      (f.assignedTo && f.assignedTo !== 'all')
    );
  });

  // ── Métodos públicos ─────────────────────────────────────

  async loadTasks(projectId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.currentProjectId.set(projectId);

    try {
      const tasks = await firstValueFrom(this.taskService.getAllByProject(projectId));
      this.tasks.set(tasks);
    } catch (err: any) {
      const msg = err?.error?.message || 'Error al cargar tareas';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async loadTask(projectId: string, taskId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const task = await firstValueFrom(this.taskService.getById(projectId, taskId));
      this.selectedTask.set(task);
      this.replaceInList(task);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar tarea');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const newTask = await firstValueFrom(this.taskService.create(projectId, data));
      // Nueva tarea al principio para verla inmediatamente
      this.tasks.update(tasks => [newTask, ...tasks]);
      this.notifications.success('Tarea creada');
      return newTask;
    } catch (err: any) {
      const msg = err?.error?.message || 'Error al crear tarea';
      this.error.set(msg);
      this.notifications.error(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * FIX: PUT retorna 204 — reconstruimos el objeto localmente con spread.
   * No dependemos de que el backend devuelva el Task actualizado.
   */
  async updateTask(projectId: string, taskId: string, data: UpdateTaskRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.taskService.update(projectId, taskId, data));

      // Reconstruir localmente: merge del objeto existente + los campos enviados
      const current = this.tasks().find(t => t.id === taskId);
      if (current) {
        const updated: Task = { ...current, ...data };
        this.replaceInList(updated);
        if (this.selectedTask()?.id === taskId) this.selectedTask.set(updated);
      }

      this.notifications.success('Tarea actualizada');
    } catch (err: any) {
      const msg = err?.error?.message || 'Error al actualizar tarea';
      this.error.set(msg);
      this.notifications.error(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.taskService.delete(projectId, taskId));
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      if (this.selectedTask()?.id === taskId) this.selectedTask.set(null);
      this.notifications.success('Tarea eliminada');
    } catch (err: any) {
      const msg = err?.error?.message || 'Error al eliminar tarea';
      this.error.set(msg);
      this.notifications.error(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * FIX: Optimistic update — actualiza la UI inmediatamente sin esperar el servidor.
   * Usa SKIP_LOADING para no activar la barra top (acción inline silenciosa).
   * Revierte el cambio local si el servidor falla.
   */
  async toggleCompleted(task: Task): Promise<void> {
    const projectId = this.currentProjectId();
    if (!projectId) return;

    const newStatus = task.status === TaskStatus.Completed
      ? TaskStatus.Pending
      : TaskStatus.Completed;

    // 1. Actualizar UI inmediatamente — sin loading, sin barra top
    const optimistic: Task = { ...task, status: newStatus };
    this.replaceInList(optimistic);

    const data: UpdateTaskRequest = {
      title:        task.title,
      description:  task.description,
      priority:     task.priority,
      status:       newStatus,
      dueDate:      task.dueDate,
      assignedToId: task.assignedToId,
    };

    try {
      // 2. Persistir en background — silencioso
      await firstValueFrom(
        this.taskService.update(
          projectId,
          task.id,
          data,
          new HttpContext().set(SKIP_LOADING, true)
        )
      );
    } catch {
      // 3. Revertir si falla — restaurar el estado original
      this.replaceInList(task);
      this.notifications.error('Error al actualizar tarea');
    }
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this.filters.update(current => ({ ...current, ...filters }));
  }

  clearFilters(): void { this.filters.set({}); }
  clearSelected(): void { this.selectedTask.set(null); }

  clear(): void {
    this.tasks.set([]);
    this.selectedTask.set(null);
    this.filters.set({});
    this.currentProjectId.set(null);
    this.error.set(null);
  }

  // ── Privados ─────────────────────────────────────────────
  private replaceInList(task: Task): void {
    this.tasks.update(tasks => tasks.map(t => t.id === task.id ? task : t));
  }
}