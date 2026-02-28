// src/app/core/services/project.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../models/project.model';

/**
 * Servicio HTTP para gestión de proyectos
 * Comunicación con el backend para operaciones CRUD
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene todos los proyectos del usuario actual
   * El backend filtra automáticamente por proyectos donde el usuario es Owner o Member
   */
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(API_ENDPOINTS.PROJECTS.BASE);
  }

  /**
   * Obtiene un proyecto por ID
   * Requiere ser Owner, Member o Admin global
   * @param id ID del proyecto
   */
  getById(id: string): Observable<Project> {
    return this.http.get<Project>(API_ENDPOINTS.PROJECTS.BY_ID(id));
  }

  /**
   * Crea un nuevo proyecto
   * El usuario creador se convierte automáticamente en Owner
   * @param data Datos del proyecto a crear
   */
  create(data: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(API_ENDPOINTS.PROJECTS.CREATE, data);
  }

  /**
   * Actualiza un proyecto existente
   * Solo el Owner o Admin global pueden actualizar
   * @param id ID del proyecto
   * @param data Datos actualizados
   */
  update(id: string, data: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(API_ENDPOINTS.PROJECTS.UPDATE(id), data);
  }

  /**
   * Elimina un proyecto
   * Solo el Owner o Admin global pueden eliminar
   * @param id ID del proyecto
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.PROJECTS.DELETE(id));
  }

  /**
   * Busca proyectos por nombre (client-side helper)
   * El filtrado real se hace en el frontend con los proyectos ya cargados
   * @param projects Lista de proyectos
   * @param searchTerm Término de búsqueda
   */
  filterBySearch(projects: Project[], searchTerm: string): Project[] {
    if (!searchTerm) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.ownerName?.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra proyectos por estado (client-side helper)
   */
  filterByStatus(projects: Project[], status: string): Project[] {
    if (!status) return projects;
    return projects.filter(p => p.status === status);
  }

  /**
   * Ordena proyectos (client-side helper)
   */
  sortProjects(
    projects: Project[], 
    sortBy: 'name' | 'date' | 'members', 
    order: 'asc' | 'desc' = 'asc'
  ): Project[] {
    const sorted = [...projects].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
          break;
        case 'members':
          comparison = a.membersCount - b.membersCount;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }
}