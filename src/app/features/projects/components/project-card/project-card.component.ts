// src/app/features/projects/components/project-card/project-card.component.ts

import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project, ProjectStatusHelper } from '@core/models/project.model';
import { DateUtils } from '@core/utils/date.utils';

/**
 * Card de proyecto para vista en grid
 */
@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow h-full">
      <div class="card-body">
        <!-- Header: Nombre y menú -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h2 class="card-title text-lg line-clamp-2 flex-1">
            <a 
              [routerLink]="['/projects', project().id]"
              class="hover:text-primary transition-colors"
            >
              {{ project().name }}
            </a>
          </h2>
          
          <!-- Menú de acciones -->
          <div class="dropdown dropdown-end">
            <button 
              tabindex="0" 
              class="btn btn-ghost btn-sm btn-circle"
              (click)="$event.stopPropagation()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              <li>
                <a [routerLink]="['/projects', project().id]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </a>
              </li>
              <li>
                <button (click)="onEdit()">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              </li>
              <li>
                <button (click)="onDelete()" class="text-error">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Badge de estado -->
        <div class="mb-3">
          <span [class]="'badge ' + getStatusBadgeClass()">
            {{ getStatusLabel() }}
          </span>
        </div>

        <!-- Descripción -->
        <p class="text-sm text-base-content/70 line-clamp-3 mb-4 min-h-[3.6em]">
          {{ project().description || 'Sin descripción' }}
        </p>

        <!-- Footer: Stats y fecha -->
        <div class="card-actions justify-between items-center mt-auto pt-4 border-t border-base-300">
          <!-- Stats -->
          <div class="flex gap-4 text-xs text-base-content/70">
            <!-- Miembros -->
            <div class="flex items-center gap-1 tooltip" data-tip="Miembros">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{{ project().membersCount }}</span>
            </div>

            <!-- Owner -->
            @if (project().ownerName) {
              <div class="flex items-center gap-1 tooltip" data-tip="Propietario">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span class="truncate max-w-[100px]">{{ project().ownerName }}</span>
              </div>
            }
          </div>

          <!-- Fecha -->
          <div class="text-xs text-base-content/50">
            {{ formatDate(project().creationDate) }}
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
export class ProjectCardComponent {
  // Inputs
  readonly project = input.required<Project>();

  // Outputs
  readonly edit = output<Project>();
  readonly delete = output<Project>();

  /**
   * Obtiene la clase del badge de estado
   */
  protected getStatusBadgeClass(): string {
    return ProjectStatusHelper.getBadgeClass(this.project().status);
  }

  /**
   * Obtiene el label del estado
   */
  protected getStatusLabel(): string {
    return ProjectStatusHelper.getLabel(this.project().status);
  }

  /**
   * Formatea la fecha de creación
   */
  protected formatDate(date: Date): string {
    return DateUtils.formatRelative(date);
  }

  /**
   * Emite evento de edición
   */
  protected onEdit(): void {
    this.edit.emit(this.project());
  }

  /**
   * Emite evento de eliminación
   */
  protected onDelete(): void {
    this.delete.emit(this.project());
  }
}