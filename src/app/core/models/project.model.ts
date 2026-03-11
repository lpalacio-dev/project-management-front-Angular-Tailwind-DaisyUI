// src/app/core/models/project.model.ts

/**
 * Modelo de Proyecto
 * Coincide con ProjectDto del backend
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  creationDate: Date;
  ownerId: string;
  ownerName?: string;
  membersCount: number;
}

/**
 * Estados posibles de un proyecto
 * Coincide con ProjectStatus enum del backend
 */
export enum ProjectStatus {
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Archived = 'Archived'
}

/**
 * Request para crear un proyecto
 * Coincide con CreateProjectDto del backend
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
}

/**
 * Request para actualizar un proyecto
 * Coincide con UpdateProjectDto del backend
 */
export interface UpdateProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
}

/**
 * Filtros para lista de proyectos
 * Para uso en el frontend
 */
export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  role?: 'all' | 'owner' | 'member';
}

/**
 * Helper class para trabajar con estados de proyectos
 */
export class ProjectStatusHelper {
  /**
   * Obtiene el label en español del estado
   */
  static getLabel(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.InProgress:
        return 'En Progreso';
      case ProjectStatus.OnHold:
        return 'En Pausa';
      case ProjectStatus.Completed:
        return 'Completado';
      case ProjectStatus.Archived:
        return 'Archivado';
    }
  }

  /**
   * Obtiene la clase CSS de DaisyUI para el badge
   */
  static getBadgeClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.InProgress:
        return 'badge-primary';
      case ProjectStatus.OnHold:
        return 'badge-warning';
      case ProjectStatus.Completed:
        return 'badge-success';
      case ProjectStatus.Archived:
        return 'badge-ghost';
    }
  }

  /**
   * Obtiene el icono SVG path para el estado
   */
  static getIcon(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.InProgress:
        return 'M13 10V3L4 14h7v7l9-11h-7z'; // Rayo
      case ProjectStatus.OnHold:
        return 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'; // Pausa
      case ProjectStatus.Completed:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Check
      case ProjectStatus.Archived:
        return 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'; // Archivo
    }
  }

  /**
   * Obtiene todas las opciones de estado
   */
  static getAllOptions(): Array<{ value: ProjectStatus; label: string }> {
    return [
      { value: ProjectStatus.InProgress, label: this.getLabel(ProjectStatus.InProgress) },
      { value: ProjectStatus.OnHold, label: this.getLabel(ProjectStatus.OnHold) },
      { value: ProjectStatus.Completed, label: this.getLabel(ProjectStatus.Completed) },
      { value: ProjectStatus.Archived, label: this.getLabel(ProjectStatus.Archived) }
    ];
  }

  /**
   * Verifica si un proyecto está activo (no archivado ni completado)
   */
  static isActive(status: ProjectStatus): boolean {
    return status === ProjectStatus.InProgress || status === ProjectStatus.OnHold;
  }
}