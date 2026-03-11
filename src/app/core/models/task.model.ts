// src/app/core/models/task.model.ts

/**
 * Modelo de Tarea
 * Coincide con TaskDto del backend
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  assignedToId?: string;
  assignedToName?: string;
  createdById: string;
  createdByName?: string;
  createdDate: Date;
}

/**
 * Prioridades de tareas
 * Coincide con TaskPriority enum del backend
 */
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

/**
 * Estados de tareas
 * Coincide con TaskStatus enum del backend
 */
export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed'
}

/**
 * Request para crear una tarea
 * Coincide con CreateTaskDto del backend
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  assignedToId?: string;
}

/**
 * Request para actualizar una tarea
 * Coincide con UpdateTaskDto del backend
 */
export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  assignedToId?: string;
}

/**
 * Filtros para lista de tareas
 */
export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: 'all' | 'me' | 'unassigned' | string;
}

/**
 * Helper class para trabajar con prioridades de tareas
 */
export class TaskPriorityHelper {
  /**
   * Obtiene el label en español
   */
  static getLabel(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'Baja';
      case TaskPriority.Medium:
        return 'Media';
      case TaskPriority.High:
        return 'Alta';
    }
  }

  /**
   * Obtiene la clase CSS de badge
   */
  static getBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'badge-info';
      case TaskPriority.Medium:
        return 'badge-warning';
      case TaskPriority.High:
        return 'badge-error';
    }
  }

  /**
   * Obtiene el valor numérico para ordenar
   */
  static getSortValue(priority: TaskPriority): number {
    switch (priority) {
      case TaskPriority.High:
        return 3;
      case TaskPriority.Medium:
        return 2;
      case TaskPriority.Low:
        return 1;
    }
  }

  /**
   * Obtiene todas las opciones
   */
  static getAllOptions(): Array<{ value: TaskPriority; label: string }> {
    return [
      { value: TaskPriority.High, label: this.getLabel(TaskPriority.High) },
      { value: TaskPriority.Medium, label: this.getLabel(TaskPriority.Medium) },
      { value: TaskPriority.Low, label: this.getLabel(TaskPriority.Low) }
    ];
  }
}

/**
 * Helper class para trabajar con estados de tareas
 */
export class TaskStatusHelper {
  /**
   * Obtiene el label en español
   */
  static getLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'Pendiente';
      case TaskStatus.InProgress:
        return 'En Progreso';
      case TaskStatus.Completed:
        return 'Completada';
    }
  }

  /**
   * Obtiene la clase CSS de badge
   */
  static getBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'badge-warning';
      case TaskStatus.InProgress:
        return 'badge-info';
      case TaskStatus.Completed:
        return 'badge-success';
    }
  }

  /**
   * Obtiene el icono SVG path
   */
  static getIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'; // Reloj
      case TaskStatus.InProgress:
        return 'M13 10V3L4 14h7v7l9-11h-7z'; // Rayo
      case TaskStatus.Completed:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Check
    }
  }

  /**
   * Obtiene todas las opciones
   */
  static getAllOptions(): Array<{ value: TaskStatus; label: string }> {
    return [
      { value: TaskStatus.Pending, label: this.getLabel(TaskStatus.Pending) },
      { value: TaskStatus.InProgress, label: this.getLabel(TaskStatus.InProgress) },
      { value: TaskStatus.Completed, label: this.getLabel(TaskStatus.Completed) }
    ];
  }

  /**
   * Verifica si la tarea está completada
   */
  static isCompleted(status: TaskStatus): boolean {
    return status === TaskStatus.Completed;
  }

  /**
   * Verifica si la tarea está activa
   */
  static isActive(status: TaskStatus): boolean {
    return status !== TaskStatus.Completed;
  }
}

/**
 * Helper para trabajar con fechas de vencimiento
 */
export class TaskDueDateHelper {
  /**
   * Verifica si la tarea está vencida
   */
  static isOverdue(dueDate: Date | undefined, status: TaskStatus): boolean {
    if (!dueDate || TaskStatusHelper.isCompleted(status)) {
      return false;
    }
    return new Date(dueDate) < new Date();
  }

  /**
   * Verifica si la tarea vence pronto (próximos 3 días)
   */
  static isDueSoon(dueDate: Date | undefined, status: TaskStatus): boolean {
    if (!dueDate || TaskStatusHelper.isCompleted(status)) {
      return false;
    }
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const due = new Date(dueDate);
    return due <= threeDaysFromNow && due >= new Date();
  }

  /**
   * Obtiene la clase CSS según el estado de vencimiento
   */
  static getDateClass(dueDate: Date | undefined, status: TaskStatus): string {
    if (this.isOverdue(dueDate, status)) {
      return 'text-error font-semibold';
    }
    if (this.isDueSoon(dueDate, status)) {
      return 'text-warning font-semibold';
    }
    return 'text-base-content/70';
  }
}