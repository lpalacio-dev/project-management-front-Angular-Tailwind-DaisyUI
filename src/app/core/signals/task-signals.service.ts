// src/app/core/signals/task-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';
import { AuthSignalsService } from './auth-signals.service';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  TaskFilters,
  TaskStatus,
  TaskPriority
} from '../models/task.model';

/**
 * Servicio de state management para tareas usando Signals
 */
@Injectable({
  providedIn: 'root'
})
export class TaskSignalsService {
  private readonly taskService = inject(TaskService);
  private readonly authSignals = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // ==================== SIGNALS BASE ====================

  readonly tasks = signal<Task[]>([]);
  readonly selectedTask = signal<Task | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filters = signal<TaskFilters>({});
  readonly currentProjectId = signal<string | null>(null);

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Tareas filtradas
   */
  readonly filteredTasks = computed(() => {
    let filtered = this.tasks();
    const currentFilters = this.filters();
    const currentUserId = this.authSignals.userId();

    if (currentFilters.search) {
      filtered = this.taskService.filterBySearch(filtered, currentFilters.search);
    }

    if (currentFilters.status && currentFilters.status !== 'all' as any) {
      filtered = this.taskService.filterByStatus(filtered, currentFilters.status);
    }

    if (currentFilters.priority && currentFilters.priority !== 'all' as any) {
      filtered = this.taskService.filterByPriority(filtered, currentFilters.priority);
    }

    if (currentFilters.assignedTo && currentUserId) {
      filtered = this.taskService.filterByAssignment(
        filtered, 
        currentFilters.assignedTo, 
        currentUserId
      );
    }

    return filtered;
  });

  /**
   * Tareas pendientes
   */
  readonly pendingTasks = computed(() => 
    this.tasks().filter(t => t.status === TaskStatus.Pending)
  );

  /**
   * Tareas en progreso
   */
  readonly inProgressTasks = computed(() => 
    this.tasks().filter(t => t.status === TaskStatus.InProgress)
  );

  /**
   * Tareas completadas
   */
  readonly completedTasks = computed(() => 
    this.tasks().filter(t => t.status === TaskStatus.Completed)
  );

  /**
   * Mis tareas asignadas
   */
  readonly myTasks = computed(() => {
    const currentUserId = this.authSignals.userId();
    return this.tasks().filter(t => t.assignedToId === currentUserId);
  });

  /**
   * Tareas sin asignar
   */
  readonly unassignedTasks = computed(() => 
    this.tasks().filter(t => !t.assignedToId)
  );

  /**
   * Estadísticas de tareas
   */
  readonly stats = computed(() => {
    const all = this.tasks();
    return {
      total: all.length,
      pending: this.pendingTasks().length,
      inProgress: this.inProgressTasks().length,
      completed: this.completedTasks().length,
      myTasks: this.myTasks().length,
      unassigned: this.unassignedTasks().length,
      highPriority: all.filter(t => t.priority === TaskPriority.High).length
    };
  });

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Carga todas las tareas de un proyecto
   */
  async loadTasks(projectId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.currentProjectId.set(projectId);

    try {
      const tasks = await firstValueFrom(this.taskService.getAllByProject(projectId));
      this.tasks.set(tasks);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al cargar tareas';
      this.error.set(errorMessage);
      console.error('Error loading tasks:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Carga una tarea específica
   */
  async loadTask(projectId: string, taskId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const task = await firstValueFrom(this.taskService.getById(projectId, taskId));
      this.selectedTask.set(task);
      this.updateTaskInList(task);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al cargar tarea';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const newTask = await firstValueFrom(this.taskService.create(projectId, data));
      this.tasks.update(tasks => [...tasks, newTask]);
      this.notifications.success('Tarea creada exitosamente');
      return newTask;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al crear tarea';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza una tarea
   */
  async updateTask(projectId: string, taskId: string, data: UpdateTaskRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const updatedTask = await firstValueFrom(
        this.taskService.update(projectId, taskId, data)
      );
      
      this.updateTaskInList(updatedTask);
      
      if (this.selectedTask()?.id === taskId) {
        this.selectedTask.set(updatedTask);
      }
      
      this.notifications.success('Tarea actualizada exitosamente');
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al actualizar tarea';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.taskService.delete(projectId, taskId));
      
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      
      if (this.selectedTask()?.id === taskId) {
        this.selectedTask.set(null);
      }
      
      this.notifications.success('Tarea eliminada exitosamente');
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al eliminar tarea';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Toggle rápido de completado
   */
  async toggleCompleted(task: Task): Promise<void> {
    const projectId = this.currentProjectId();
    if (!projectId) return;

    this.loading.set(true);

    try {
      const updatedTask = await firstValueFrom(
        this.taskService.toggleCompleted(projectId, task)
      );
      
      this.updateTaskInList(updatedTask);
      
      const action = updatedTask.status === TaskStatus.Completed ? 'completada' : 'marcada como pendiente';
      this.notifications.success(`Tarea ${action}`);
    } catch (error: any) {
      this.notifications.error('Error al actualizar tarea');
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza los filtros
   */
  setFilters(filters: TaskFilters): void {
    this.filters.set(filters);
  }

  /**
   * Limpia los filtros
   */
  clearFilters(): void {
    this.filters.set({});
  }

  /**
   * Limpia la tarea seleccionada
   */
  clearSelected(): void {
    this.selectedTask.set(null);
  }

  /**
   * Limpia todas las tareas
   */
  clear(): void {
    this.tasks.set([]);
    this.selectedTask.set(null);
    this.filters.set({});
    this.currentProjectId.set(null);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private updateTaskInList(task: Task): void {
    this.tasks.update(tasks => 
      tasks.map(t => t.id === task.id ? task : t)
    );
  }
}