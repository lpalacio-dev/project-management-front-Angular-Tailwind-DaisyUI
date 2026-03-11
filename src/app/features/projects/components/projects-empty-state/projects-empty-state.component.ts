// src/app/features/projects/components/projects-empty-state/projects-empty-state.component.ts

import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Empty state para lista de proyectos
 * Muestra mensajes cuando no hay proyectos o no hay resultados
 */
@Component({
  selector: 'app-projects-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <!-- Icon -->
      <div class="mb-6">
        @if (isFiltered()) {
          <!-- No results icon -->
          <svg class="w-24 h-24 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        } @else {
          <!-- Empty folder icon -->
          <svg class="w-24 h-24 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-base-content mb-2">
        @if (isFiltered()) {
          No se encontraron proyectos
        } @else {
          No tienes proyectos aún
        }
      </h3>

      <!-- Description -->
      <p class="text-base-content/70 text-center max-w-md mb-8">
        @if (isFiltered()) {
          No hay proyectos que coincidan con los filtros aplicados.
          Intenta ajustar tus criterios de búsqueda.
        } @else {
          Crea tu primer proyecto para empezar a organizar tus tareas
          y colaborar con tu equipo.
        }
      </p>

      <!-- Action button -->
      @if (!isFiltered()) {
        <a routerLink="/projects/create" class="btn btn-primary gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear mi primer proyecto
        </a>
      } @else {
        <button class="btn btn-outline" (click)="onClearFilters()">
          Limpiar filtros
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectsEmptyStateComponent {
  readonly isFiltered = input<boolean>(false);
  readonly onClearFilters = input<() => void>(() => {});
}