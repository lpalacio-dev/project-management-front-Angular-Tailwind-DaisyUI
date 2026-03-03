// src/app/features/projects/components/project-stats/project-stats.component.ts

import { Component, inject, input, computed, effect } from '@angular/core';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { ProjectSignalsService } from '@core/signals/project-signals.service';

/**
 * Cards de estadísticas del proyecto
 * Muestra métricas de miembros, tareas completadas y pendientes
 */
@Component({
  selector: 'app-project-stats',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Miembros -->
      <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
           (click)="onMembersClick()">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/70 mb-1">Miembros del equipo</p>
              <p class="text-3xl font-bold text-primary">
                {{ currentMembersCount() }}
              </p>
            </div>
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div class="text-xs text-base-content/60 mt-2">
            Click para ver miembros
          </div>
        </div>
      </div>

      <!-- Tareas completadas -->
      <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
           (click)="onTasksClick()">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/70 mb-1">Tareas completadas</p>
              <p class="text-3xl font-bold text-success">
                {{ taskStats().completed }}
              </p>
            </div>
            <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          @if (taskStats().total > 0) {
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-base-content/60 mb-1">
                <span>Progreso</span>
                <span>{{ completionPercentage() }}%</span>
              </div>
              <progress 
                class="progress progress-success w-full" 
                [value]="taskStats().completed" 
                [max]="taskStats().total"
              ></progress>
            </div>
          }
        </div>
      </div>

      <!-- Tareas pendientes -->
      <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
           (click)="onTasksClick()">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/70 mb-1">Tareas pendientes</p>
              <p class="text-3xl font-bold text-warning">
                {{ taskStats().pending + taskStats().inProgress }}
              </p>
            </div>
            <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex gap-3 text-xs text-base-content/60 mt-2">
            <span>Pendientes: <strong>{{ taskStats().pending }}</strong></span>
            <span>En progreso: <strong>{{ taskStats().inProgress }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectStatsComponent {
  private readonly taskSignals = inject(TaskSignalsService);
  private readonly projectSignals = inject(ProjectSignalsService);

  // Inputs
  readonly projectId = input.required<string>();

  // Computed para obtener el membersCount del proyecto actual
  protected readonly currentMembersCount = computed(() => {
    const project = this.projectSignals.selectedProject();
    return project?.membersCount || 0;
  });

  // Computed
  protected readonly taskStats = computed(() => this.taskSignals.stats());
  
  protected readonly completionPercentage = computed(() => {
    const stats = this.taskStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  });

  constructor() {
    // Effect para cargar tareas cuando cambie el projectId
    effect(() => {
      const id = this.projectId();
      if (id) {
        this.loadTasks(id);
      }
    });
  }

  /**
   * Carga las tareas del proyecto
   */
  private async loadTasks(projectId: string): Promise<void> {
    try {
      await this.taskSignals.loadTasks(projectId);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  /**
   * Handlers de clicks
   */
  protected onMembersClick(): void {
    // TODO: Activar tab de miembros
    console.log('Navigate to members tab');
  }

  protected onTasksClick(): void {
    // TODO: Activar tab de tareas
    console.log('Navigate to tasks tab');
  }
}