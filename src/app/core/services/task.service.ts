// src/app/core/services/task.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  getAllByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(API_ENDPOINTS.TASKS.BY_PROJECT(projectId));
  }

  getById(projectId: string, taskId: string): Observable<Task> {
    return this.http.get<Task>(API_ENDPOINTS.TASKS.BY_ID(projectId, taskId));
  }

  create(projectId: string, data: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(API_ENDPOINTS.TASKS.CREATE(projectId), data);
  }

  /**
   * FIX: PUT retorna 204 No Content — tipado como void, no Task.
   * Acepta HttpContext opcional para operaciones silenciosas (SKIP_LOADING).
   */
  update(
    projectId: string,
    taskId: string,
    data: UpdateTaskRequest,
    context?: HttpContext
  ): Observable<void> {
    return this.http.put<void>(
      API_ENDPOINTS.TASKS.UPDATE(projectId, taskId),
      data,
      context ? { context } : {}
    );
  }

  delete(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TASKS.DELETE(projectId, taskId));
  }

  // ── Helpers client-side ──────────────────────────────────

  filterBySearch(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.assignedToName?.toLowerCase().includes(term)
    );
  }

  filterByStatus(tasks: Task[], status: TaskStatus | 'all'): Task[] {
    if (!status || status === 'all') return tasks;
    return tasks.filter(t => t.status === status);
  }

  filterByPriority(tasks: Task[], priority: TaskPriority | 'all'): Task[] {
    if (!priority || priority === 'all') return tasks;
    return tasks.filter(t => t.priority === priority);
  }

  filterByAssignment(
    tasks: Task[],
    filter: 'all' | 'me' | 'unassigned' | string,
    currentUserId: string
  ): Task[] {
    switch (filter) {
      case 'all':        return tasks;
      case 'unassigned': return tasks.filter(t => !t.assignedToId);
      case 'me':         return tasks.filter(t => t.assignedToId === currentUserId);
      default:           return tasks.filter(t => t.assignedToId === filter);
    }
  }

  sortTasks(
    tasks: Task[],
    sortBy: 'title' | 'priority' | 'dueDate' | 'status',
    order: 'asc' | 'desc' = 'asc'
  ): Task[] {
    const priorityVal: Record<string, number> = {
      [TaskPriority.High]: 3, [TaskPriority.Medium]: 2, [TaskPriority.Low]: 1
    };
    const statusVal: Record<string, number> = {
      [TaskStatus.Pending]: 1, [TaskStatus.InProgress]: 2, [TaskStatus.Completed]: 3
    };

    return [...tasks].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'title':
          cmp = a.title.localeCompare(b.title); break;
        case 'priority':
          cmp = (priorityVal[a.priority] ?? 0) - (priorityVal[b.priority] ?? 0); break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break;
        case 'status':
          cmp = (statusVal[a.status] ?? 0) - (statusVal[b.status] ?? 0); break;
      }
      return order === 'asc' ? cmp : -cmp;
    });
  }

  groupBy(
    tasks: Task[],
    groupBy: 'status' | 'priority' | 'assignedTo'
  ): Record<string, Task[]> {
    return tasks.reduce((groups, task) => {
      let key: string;
      switch (groupBy) {
        case 'status':     key = task.status; break;
        case 'priority':   key = task.priority; break;
        case 'assignedTo': key = task.assignedToName || 'Sin asignar'; break;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
      return groups;
    }, {} as Record<string, Task[]>);
  }
}