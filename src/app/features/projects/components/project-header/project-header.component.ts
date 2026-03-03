// src/app/features/projects/components/project-header/project-header.component.ts

import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project, ProjectStatus, ProjectStatusHelper } from '@core/models/project.model';
import { DateUtils } from '@core/utils/date.utils';

/**
 * Header del proyecto con nombre, descripción, estado y acciones
 */
@Component({
  selector: 'app-project-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="bg-gradient-to-r from-primary to-secondary text-primary-content">
      <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumb y acciones -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <!-- Breadcrumb -->
          <div class="breadcrumbs text-sm">
            <ul>
              <li>
                <a routerLink="/projects" class="hover:underline">Proyectos</a>
              </li>
              <li class="font-semibold">{{ project().name }}</li>
            </ul>
          </div>

          <!-- Menú de acciones -->
          <div class="dropdown dropdown-end">
            <button tabindex="0" class="btn btn-ghost btn-sm gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              Acciones
            </button>
            <ul tabindex="0" class="dropdown-content z-20 menu p-2 shadow-lg bg-base-100 text-base-content rounded-box w-56 border border-base-300">
              @if (canEdit()) {
                <li>
                  <button (click)="onEdit()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar proyecto
                  </button>
                </li>
                <li class="menu-title">
                  <span>Cambiar estado</span>
                </li>
                @for (status of statusOptions; track status.value) {
                  <li>
                    <button 
                      (click)="onStatusChange(status.value)"
                      [class.active]="status.value === project().status"
                    >
                      <span [class]="'badge badge-sm ' + getStatusBadgeClass(status.value)">
                        {{ status.label }}
                      </span>
                    </button>
                  </li>
                }
                <div class="divider my-1"></div>
              }
              @if (canLeave()) {
                <li>
                  <button (click)="onLeave()" class="text-warning">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Abandonar proyecto
                  </button>
                </li>
              }
              @if (canEdit()) {
                <li>
                  <button (click)="onDelete()" class="text-error">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar proyecto
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Nombre del proyecto y badge de estado -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
          <h1 class="text-4xl font-bold flex-1">
            {{ project().name }}
          </h1>
          <span [class]="'badge badge-lg ' + getStatusBadgeClass(project().status)">
            {{ getStatusLabel(project().status) }}
          </span>
        </div>

        <!-- Descripción -->
        <p class="text-lg opacity-90 mb-4 max-w-3xl">
          {{ project().description || 'Sin descripción' }}
        </p>

        <!-- Metadata -->
        <div class="flex flex-wrap gap-4 text-sm opacity-80">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Creado {{ formatDate(project().creationDate) }}</span>
          </div>
          @if (project().ownerName) {
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Owner: <strong>{{ project().ownerName }}</strong></span>
            </div>
          }
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span><strong>{{ project().membersCount }}</strong> miembros</span>
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
export class ProjectHeaderComponent {
  // Inputs
  readonly project = input.required<Project>();
  readonly canEdit = input<boolean>(false);
  readonly canManageMembers = input<boolean>(false);
  readonly canLeave = input<boolean>(false);

  // Outputs
  readonly edit = output<void>();
  readonly delete = output<void>();
  readonly leave = output<void>();
  readonly statusChange = output<ProjectStatus>();

  // Opciones de estado
  protected readonly statusOptions = ProjectStatusHelper.getAllOptions();

  /**
   * Obtiene la clase del badge de estado
   */
  protected getStatusBadgeClass(status: ProjectStatus): string {
    return ProjectStatusHelper.getBadgeClass(status);
  }

  /**
   * Obtiene el label del estado
   */
  protected getStatusLabel(status: ProjectStatus): string {
    return ProjectStatusHelper.getLabel(status);
  }

  /**
   * Formatea la fecha
   */
  protected formatDate(date: Date): string {
    return DateUtils.formatRelative(date);
  }

  /**
   * Handlers de eventos
   */
  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.delete.emit();
  }

  protected onLeave(): void {
    this.leave.emit();
  }

  protected onStatusChange(status: ProjectStatus): void {
    // Solo emitir si el estado es diferente al actual
    if (status !== this.project().status) {
      this.statusChange.emit(status);
    }
  }
}