// src/app/core/signals/project-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../services/project.service';
import { NotificationService } from '../services/notification.service';
import { AuthSignalsService } from './auth-signals.service';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectFilters,
  ProjectStatus
} from '../models/project.model';

/**
 * Servicio de state management para proyectos usando Signals
 * Punto único de verdad para el estado de proyectos
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectSignalsService {
  private readonly projectService = inject(ProjectService);
  private readonly authSignals = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  // ==================== SIGNALS BASE ====================

  /**
   * Lista de proyectos cargados
   */
  readonly projects = signal<Project[]>([]);

  /**
   * Proyecto seleccionado actualmente
   */
  readonly selectedProject = signal<Project | null>(null);

  /**
   * Estado de carga
   */
  readonly loading = signal<boolean>(false);

  /**
   * Mensaje de error
   */
  readonly error = signal<string | null>(null);

  /**
   * Filtros aplicados
   */
  readonly filters = signal<ProjectFilters>({});

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Proyectos filtrados según los filtros activos
   */
  readonly filteredProjects = computed(() => {
    let filtered = this.projects();
    const currentFilters = this.filters();

    // Filtro por búsqueda
    if (currentFilters.search) {
      filtered = this.projectService.filterBySearch(filtered, currentFilters.search);
    }

    // Filtro por estado
    if (currentFilters.status) {
      filtered = this.projectService.filterByStatus(filtered, currentFilters.status);
    }

    // Filtro por rol del usuario
    if (currentFilters.role && currentFilters.role !== 'all') {
      const currentUserId = this.authSignals.userId();
      filtered = filtered.filter(p => {
        if (currentFilters.role === 'owner') {
          return p.ownerId === currentUserId;
        }
        // Para 'member' incluimos todos (owner también es miembro)
        return true;
      });
    }

    return filtered;
  });

  /**
   * Número total de proyectos
   */
  readonly projectsCount = computed(() => this.projects().length);

  /**
   * Proyectos donde soy Owner
   */
  readonly ownedProjects = computed(() => {
    const currentUserId = this.authSignals.userId();
    return this.projects().filter(p => p.ownerId === currentUserId);
  });

  /**
   * Proyectos activos (no archivados ni completados)
   */
  readonly activeProjects = computed(() => {
    return this.projects().filter(p => 
      p.status === ProjectStatus.InProgress || p.status === ProjectStatus.OnHold
    );
  });

  /**
   * Estadísticas de proyectos
   */
  readonly stats = computed(() => {
    const allProjects = this.projects();
    return {
      total: allProjects.length,
      owned: this.ownedProjects().length,
      active: this.activeProjects().length,
      completed: allProjects.filter(p => p.status === ProjectStatus.Completed).length,
      onHold: allProjects.filter(p => p.status === ProjectStatus.OnHold).length,
      archived: allProjects.filter(p => p.status === ProjectStatus.Archived).length
    };
  });

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Carga todos los proyectos del usuario
   */
  async loadProjects(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const projects = await firstValueFrom(this.projectService.getAll());
      this.projects.set(projects);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al cargar proyectos';
      this.error.set(errorMessage);
      console.error('Error loading projects:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Carga un proyecto específico
   */
  async loadProject(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const project = await firstValueFrom(this.projectService.getById(id));
      this.selectedProject.set(project);
      
      // Actualizar también en la lista si existe
      this.updateProjectInList(project);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al cargar proyecto';
      this.error.set(errorMessage);
      console.error('Error loading project:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crea un nuevo proyecto
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const newProject = await firstValueFrom(this.projectService.create(data));
      
      // Agregar a la lista
      this.projects.update(projects => [...projects, newProject]);
      
      this.notifications.success('Proyecto creado exitosamente');
      return newProject;
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al crear proyecto';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza un proyecto existente
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const updatedProject = await firstValueFrom(this.projectService.update(id, data));
      
      // Actualizar en la lista
      this.updateProjectInList(updatedProject);
      
      // Actualizar el seleccionado si es el mismo
      if (this.selectedProject()?.id === id) {
        this.selectedProject.set(updatedProject);
      }
      
      this.notifications.success('Proyecto actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al actualizar proyecto';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Elimina un proyecto
   */
  async deleteProject(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.projectService.delete(id));
      
      // Remover de la lista
      this.projects.update(projects => projects.filter(p => p.id !== id));
      
      // Limpiar seleccionado si es el mismo
      if (this.selectedProject()?.id === id) {
        this.selectedProject.set(null);
      }
      
      this.notifications.success('Proyecto eliminado exitosamente');
      this.router.navigate(['/projects']);
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al eliminar proyecto';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza los filtros
   */
  setFilters(filters: ProjectFilters): void {
    this.filters.set(filters);
  }

  /**
   * Limpia los filtros
   */
  clearFilters(): void {
    this.filters.set({});
  }

  /**
   * Limpia el proyecto seleccionado
   */
  clearSelected(): void {
    this.selectedProject.set(null);
  }

  /**
   * Recarga el proyecto seleccionado
   */
  async reloadSelected(): Promise<void> {
    const current = this.selectedProject();
    if (current) {
      await this.loadProject(current.id);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Actualiza un proyecto en la lista
   */
  private updateProjectInList(project: Project): void {
    this.projects.update(projects => 
      projects.map(p => p.id === project.id ? project : p)
    );
  }
}