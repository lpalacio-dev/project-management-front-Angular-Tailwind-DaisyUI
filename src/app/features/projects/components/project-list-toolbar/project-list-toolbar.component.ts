// src/app/features/projects/components/project-list-toolbar/project-list-toolbar.component.ts

import { Component, signal, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectFilters, ProjectStatus, ProjectStatusHelper } from '@core/models/project.model';

/**
 * Barra de herramientas para lista de proyectos
 * Búsqueda, filtros y toggle de vista
 */
@Component({
  selector: 'app-project-list-toolbar',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
      <!-- Left side: Búsqueda y filtros -->
      <div class="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
        <!-- Búsqueda -->
        <div class="form-control flex-1 max-w-md">
          <div class="input-group">
            <span class="bg-base-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar proyectos..."
              class="input input-bordered w-full"
              [value]="currentFilters().search || ''"
              (input)="onSearchChange($event)"
            />
          </div>
        </div>

        <!-- Filtro de estado -->
        <select
          class="select select-bordered w-full sm:w-auto"
          [value]="currentFilters().status || ''"
          (change)="onStatusChange($event)"
        >
          <option value="">Todos los estados</option>
          @for (option of statusOptions; track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>

        <!-- Filtro de rol -->
        <select
          class="select select-bordered w-full sm:w-auto"
          [value]="currentFilters().role || 'all'"
          (change)="onRoleChange($event)"
        >
          <option value="all">Todos mis proyectos</option>
          <option value="owner">Solo como Owner</option>
          <option value="member">Como miembro</option>
        </select>
      </div>

      <!-- Right side: Acciones -->
      <div class="flex gap-2 items-center w-full lg:w-auto justify-between lg:justify-end">
        <!-- Toggle vista Grid/Lista -->
        <div class="btn-group">
          <button
            class="btn btn-sm"
            [class.btn-active]="currentView() === 'grid'"
            (click)="onViewChange('grid')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            class="btn btn-sm"
            [class.btn-active]="currentView() === 'list'"
            (click)="onViewChange('list')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Botón nuevo proyecto -->
        <a routerLink="/projects/create" class="btn btn-primary btn-sm gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Nuevo Proyecto</span>
          <span class="sm:hidden">Nuevo</span>
        </a>
      </div>
    </div>

    <!-- Indicadores de filtros activos -->
    @if (hasActiveFilters()) {
      <div class="flex flex-wrap gap-2 items-center mb-4">
        <span class="text-sm text-base-content/70">Filtros activos:</span>
        
        @if (currentFilters().search) {
          <div class="badge badge-outline gap-2">
            Búsqueda: "{{ currentFilters().search }}"
            <button class="btn btn-ghost btn-xs btn-circle" (click)="clearSearch()">✕</button>
          </div>
        }

        @if (currentFilters().status) {
          <div class="badge badge-outline gap-2">
            Estado: {{ getStatusLabel(currentFilters().status!) }}
            <button class="btn btn-ghost btn-xs btn-circle" (click)="clearStatus()">✕</button>
          </div>
        }

        @if (currentFilters().role && currentFilters().role !== 'all') {
          <div class="badge badge-outline gap-2">
            Rol: {{ getRoleLabel(currentFilters().role!) }}
            <button class="btn btn-ghost btn-xs btn-circle" (click)="clearRole()">✕</button>
          </div>
        }

        <button class="btn btn-ghost btn-xs" (click)="clearAll()">
          Limpiar todos
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectListToolbarComponent {
  // Inputs
  readonly currentFilters = input<ProjectFilters>({});
  readonly currentView = input<'grid' | 'list'>('grid');

  // Outputs
  readonly filtersChange = output<ProjectFilters>();
  readonly viewChange = output<'grid' | 'list'>();

  // Opciones de estado
  protected readonly statusOptions = ProjectStatusHelper.getAllOptions();

  /**
   * Maneja cambio en búsqueda
   */
  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const search = input.value.trim();
    this.emitFilters({ search: search || undefined });
  }

  /**
   * Maneja cambio en filtro de estado
   */
  protected onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as ProjectStatus | '';
    this.emitFilters({ status: status || undefined });
  }

  /**
   * Maneja cambio en filtro de rol
   */
  protected onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const role = select.value as 'all' | 'owner' | 'member';
    this.emitFilters({ role });
  }

  /**
   * Maneja cambio de vista
   */
  protected onViewChange(view: 'grid' | 'list'): void {
    this.viewChange.emit(view);
  }

  /**
   * Limpia filtro de búsqueda
   */
  protected clearSearch(): void {
    this.emitFilters({ search: undefined });
  }

  /**
   * Limpia filtro de estado
   */
  protected clearStatus(): void {
    this.emitFilters({ status: undefined });
  }

  /**
   * Limpia filtro de rol
   */
  protected clearRole(): void {
    this.emitFilters({ role: 'all' });
  }

  /**
   * Limpia todos los filtros
   */
  protected clearAll(): void {
    this.filtersChange.emit({});
  }

  /**
   * Verifica si hay filtros activos
   */
  protected hasActiveFilters(): boolean {
    const filters = this.currentFilters();
    return !!(filters.search || filters.status || (filters.role && filters.role !== 'all'));
  }

  /**
   * Obtiene label de estado
   */
  protected getStatusLabel(status: ProjectStatus): string {
    return ProjectStatusHelper.getLabel(status);
  }

  /**
   * Obtiene label de rol
   */
  protected getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      owner: 'Solo como Owner',
      member: 'Como miembro'
    };
    return labels[role] || role;
  }

  /**
   * Emite nuevos filtros fusionados con los actuales
   */
  private emitFilters(partialFilters: Partial<ProjectFilters>): void {
    const newFilters = { ...this.currentFilters(), ...partialFilters };
    this.filtersChange.emit(newFilters);
  }
}