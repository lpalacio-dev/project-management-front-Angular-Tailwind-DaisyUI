// src/app/features/projects/components/project-list-toolbar/project-list-toolbar.component.ts
//
// CAMBIOS RESPECTO AL ORIGINAL:
//   1. Import de RouterLink ya existía — sin cambios
//   2. Botón "Crear con IA" añadido junto a "Nuevo Proyecto" en el lado derecho
//   Todo lo demás es idéntico al original.

import { Component, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectFilters, ProjectStatus, ProjectStatusHelper } from '@core/models/project.model';

/**
 * Barra de herramientas para lista de proyectos.
 * Búsqueda, filtros y toggle de vista.
 */
@Component({
  selector: 'app-project-list-toolbar',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center
                justify-between mb-6">

      <!-- Left side: Búsqueda y filtros -->
      <div class="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">

        <!-- Búsqueda -->
        <div class="form-control flex-1 w-full max-w-md">
          <label class="input input-bordered flex items-center gap-2 w-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 16 16" 
              fill="currentColor" 
              class="h-4 w-4 opacity-70">
              <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
            </svg>
            
            <input 
              type="text" 
              class="grow" 
              placeholder="Buscar proyectos..." 
              [value]="currentFilters().search || ''"
              (input)="onSearchChange($event)" />
          </label>
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
      <div class="flex gap-2 items-center w-full lg:w-auto
                  justify-between lg:justify-end">

        <!-- Toggle vista Grid/Lista -->
        <div class="btn-group">
          <button
            class="btn btn-sm"
            [class.btn-active]="currentView() === 'grid'"
            (click)="onViewChange('grid')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z
                   M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z
                   M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z
                   M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0
                   01-2-2v-2z" />
            </svg>
          </button>
          <button
            class="btn btn-sm"
            [class.btn-active]="currentView() === 'list'"
            (click)="onViewChange('list')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- ── NUEVO: botón Crear con IA ─────────────────── -->
        <a routerLink="/ai/generate" class="btn btn-ghost btn-sm gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0
                 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9
                 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5
                 4.5 0 00-3.09 3.09z" />
          </svg>
          <span class="hidden sm:inline">Crear con IA</span>
        </a>
        <!-- ── FIN NUEVO ──────────────────────────────────── -->

        <!-- Botón nuevo proyecto (original) -->
        <a routerLink="/projects/create" class="btn btn-primary btn-sm gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4v16m8-8H4" />
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
            <button class="btn btn-ghost btn-xs btn-circle"
                    (click)="clearSearch()">✕</button>
          </div>
        }

        @if (currentFilters().status) {
          <div class="badge badge-outline gap-2">
            Estado: {{ getStatusLabel(currentFilters().status!) }}
            <button class="btn btn-ghost btn-xs btn-circle"
                    (click)="clearStatus()">✕</button>
          </div>
        }

        @if (currentFilters().role && currentFilters().role !== 'all') {
          <div class="badge badge-outline gap-2">
            Rol: {{ getRoleLabel(currentFilters().role!) }}
            <button class="btn btn-ghost btn-xs btn-circle"
                    (click)="clearRole()">✕</button>
          </div>
        }

        <button class="btn btn-ghost btn-xs" (click)="clearAll()">
          Limpiar todos
        </button>
      </div>
    }
  `,
  styles: [':host { display: block; }'],
})
export class ProjectListToolbarComponent {
  readonly currentFilters = input<ProjectFilters>({});
  readonly currentView    = input<'grid' | 'list'>('grid');

  readonly filtersChange = output<ProjectFilters>();
  readonly viewChange    = output<'grid' | 'list'>();

  protected readonly statusOptions = ProjectStatusHelper.getAllOptions();

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.emitFilters({ search: value || undefined });
  }

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProjectStatus | '';
    this.emitFilters({ status: value || undefined });
  }

  protected onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | 'owner' | 'member';
    this.emitFilters({ role: value });
  }

  protected onViewChange(view: 'grid' | 'list'): void {
    this.viewChange.emit(view);
  }

  protected clearSearch(): void  { this.emitFilters({ search: undefined }); }
  protected clearStatus(): void  { this.emitFilters({ status: undefined }); }
  protected clearRole(): void    { this.emitFilters({ role: 'all' }); }
  protected clearAll(): void     { this.filtersChange.emit({}); }

  protected hasActiveFilters(): boolean {
    const f = this.currentFilters();
    return !!(f.search || f.status || (f.role && f.role !== 'all'));
  }

  protected getStatusLabel(status: ProjectStatus): string {
    return ProjectStatusHelper.getLabel(status);
  }

  protected getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      owner:  'Solo como Owner',
      member: 'Como miembro',
    };
    return labels[role] ?? role;
  }

  private emitFilters(partial: Partial<ProjectFilters>): void {
    this.filtersChange.emit({ ...this.currentFilters(), ...partial });
  }
}