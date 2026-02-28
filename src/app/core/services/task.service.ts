// src/app/core/services/task.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../models/task.model';

/**
 * Servicio HTTP para gestión de tareas
 * Comunicación con el backend para operaciones CRUD de tareas
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene todas las tareas de un proyecto
   * Requiere ser miembro del proyecto
   * @param projectId ID del proyecto
   */
  getAllByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.BY_PROJECT(projectId));
  }

  /**
   * Obtiene una tarea específica
   * @param projectId ID del proyecto
   * @param taskId ID de la tarea
   */
  getById(projectId: string, taskId: string): Observable<Task> {
    return this.http.get<Task>(API_ENDPOINTS.TASKS.BY_ID(projectId, taskId));
  }

  /**
   * Crea una nueva tarea
   * Requiere ser miembro del proyecto
   * @param projectId ID del proyecto
   * @param data Datos de la tarea
   */
  create(projectId: string, data: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(API_ENDPOINTS.TASKS.CREATE(projectId), data);
  }

  /**
   * Actualiza una tarea existente
   * Requiere ser miembro del proyecto
   * @param projectId ID del proyecto
   * @param taskId ID de la tarea
   * @param data Datos actualizados
   */
  update(projectId: string, taskId: string, data: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(API_ENDPOINTS.TASKS.UPDATE(projectId, taskId), data);
  }

  /**
   * Elimina una tarea
   * Requiere ser miembro del proyecto
   * @param projectId ID del proyecto
   * @param taskId ID de la tarea
   */
  delete(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TASKS.DELETE(projectId, taskId));
  }

  /**
   * Toggle rápido de estado completado
   * Helper para cambiar entre Completada y su estado previo
   */
  toggleCompleted(
    projectId: string, 
    task: Task, 
    previousStatus: TaskStatus = TaskStatus.InProgress
  ): Observable<Task> {
    const newStatus = task.status === TaskStatus.Completed 
      ? previousStatus 
      : TaskStatus.Completed;

    const updateData: UpdateTaskRequest = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: newStatus,
      dueDate: task.dueDate,
      assignedToId: task.assignedToId
    };

    return this.update(projectId, task.id, updateData);
  }

  /**
   * Filtra tareas por búsqueda (client-side)
   */
  filterBySearch(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(t => 
      t.title.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.assignedToName?.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra tareas por estado (client-side)
   */
  filterByStatus(tasks: Task[], status: TaskStatus | 'all'): Task[] {
    if (!status || status === 'all') return tasks;
    return tasks.filter(t => t.status === status);
  }

  /**
   * Filtra tareas por prioridad (client-side)
   */
  filterByPriority(tasks: Task[], priority: string | 'all'): Task[] {
    if (!priority || priority === 'all') return tasks;
    return tasks.filter(t => t.priority === priority);
  }

  /**
   * Filtra tareas por asignación (client-side)
   */
  filterByAssignment(
    tasks: Task[], 
    filter: 'all' | 'me' | 'unassigned' | string,
    currentUserId: string
  ): Task[] {
    if (filter === 'all') return tasks;
    if (filter === 'unassigned') return tasks.filter(t => !t.assignedToId);
    if (filter === 'me') return tasks.filter(t => t.assignedToId === currentUserId);
    return tasks.filter(t => t.assignedToId === filter);
  }

  /**
   * Ordena tareas (client-side)
   */
  sortTasks(
    tasks: Task[], 
    sortBy: 'title' | 'priority' | 'dueDate' | 'status',
    order: 'asc' | 'desc' = 'asc'
  ): Task[] {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityValues = { High: 3, Medium: 2, Low: 1 };
          comparison = priorityValues[a.priority] - priorityValues[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'status':
          const statusValues = { Pending: 1, InProgress: 2, Completed: 3 };
          comparison = statusValues[a.status] - statusValues[b.status];
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

  /**
   * Agrupa tareas por un criterio (client-side)
   */
  groupBy(
    tasks: Task[], 
    groupBy: 'status' | 'priority' | 'assignedTo'
  ): Record<string, Task[]> {
    return tasks.reduce((groups, task) => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          key = task.status;
          break;
        case 'priority':
          key = task.priority;
          break;
        case 'assignedTo':
          key = task.assignedToName || 'Sin asignar';
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
      return groups;
    }, {} as Record<string, Task[]>);
  }
}