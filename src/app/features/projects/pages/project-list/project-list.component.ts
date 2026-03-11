// src/app/features/projects/pages/project-list/project-list.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import { ProjectFilters, Project, ProjectStatusHelper } from '@core/models/project.model';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { ProjectListToolbarComponent } from '../../components/project-list-toolbar/project-list-toolbar.component';
import { ProjectSkeletonComponent } from '../../components/project-skeleton/project-skeleton.component';
import { ProjectsEmptyStateComponent } from '../../components/projects-empty-state/projects-empty-state.component';

/**
 * Página principal de lista de proyectos
 */
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    ProjectCardComponent,
    ProjectListToolbarComponent,
    ProjectSkeletonComponent,
    ProjectsEmptyStateComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-base-content mb-2">
          Mis Proyectos
        </h1>
        <p class="text-base-content/70">
          Gestiona y organiza todos tus proyectos en un solo lugar
        </p>
      </div>

      <!-- Toolbar -->
      <app-project-list-toolbar
        [currentFilters]="projectSignals.filters()"
        [currentView]="currentView()"
        (filtersChange)="onFiltersChange($event)"
        (viewChange)="onViewChange($event)"
      />

      <!-- Stats -->
      @if (!projectSignals.loading() && projectSignals.projects().length > 0) {
        <div class="stats shadow mb-6 w-full">
          <div class="stat">
            <div class="stat-title">Total</div>
            <div class="stat-value text-primary">{{ projectSignals.stats().total }}</div>
            <div class="stat-desc">proyectos</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Como Owner</div>
            <div class="stat-value text-secondary">{{ projectSignals.stats().owned }}</div>
            <div class="stat-desc">soy propietario</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Activos</div>
            <div class="stat-value text-accent">{{ projectSignals.stats().active }}</div>
            <div class="stat-desc">en progreso</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Completados</div>
            <div class="stat-value">{{ projectSignals.stats().completed }}</div>
            <div class="stat-desc">finalizados</div>
          </div>
        </div>
      }

      <!-- Content -->
      <div class="min-h-[400px]">
        @if (projectSignals.loading()) {
          <!-- Loading state -->
          <app-project-skeleton [view]="currentView()" [count]="8" />
        } @else if (displayedProjects().length === 0) {
          <!-- Empty state -->
          <app-projects-empty-state
            [isFiltered]="hasActiveFilters()"
            [onClearFilters]="clearFilters.bind(this)"
          />
        } @else {
          <!-- Projects grid -->
          @if (currentView() === 'grid') {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (project of displayedProjects(); track project.id) {
                <app-project-card
                  [project]="project"
                  (edit)="onEditProject($event)"
                  (delete)="onDeleteProject($event)"
                />
              }
            </div>
          } @else {
            <!-- Projects list -->
            <div class="space-y-4">
              @for (project of displayedProjects(); track project.id) {
                <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                  <div class="card-body">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <!-- Info -->
                      <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2">
                          <a 
                            [href]="'/projects/' + project.id"
                            class="hover:text-primary transition-colors"
                          >
                            {{ project.name }}
                          </a>
                        </h3>
                        <p class="text-sm text-base-content/70 mb-3">
                          {{ project.description || 'Sin descripción' }}
                        </p>
                        <div class="flex flex-wrap gap-3 text-sm">
                          <span [class]="'badge ' + getStatusBadgeClass(project.status)">
                            {{ getStatusLabel(project.status) }}
                          </span>
                          <span class="text-base-content/70">
                            <strong>{{ project.membersCount }}</strong> miembros
                          </span>
                          @if (project.ownerName) {
                            <span class="text-base-content/70">
                              Owner: <strong>{{ project.ownerName }}</strong>
                            </span>
                          }
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex gap-2">
                        <a 
                          [href]="'/projects/' + project.id"
                          class="btn btn-primary btn-sm"
                        >
                          Ver detalles
                        </a>
                        <button 
                          class="btn btn-ghost btn-sm"
                          (click)="onEditProject(project)"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Paginación (si hay muchos proyectos) -->
          @if (totalPages() > 1) {
            <div class="flex justify-center mt-8">
              <div class="join">
                <button 
                  class="join-item btn btn-sm"
                  [disabled]="currentPage() === 1"
                  (click)="previousPage()"
                >
                  «
                </button>
                
                @for (page of pageNumbers(); track page) {
                  <button 
                    class="join-item btn btn-sm"
                    [class.btn-active]="page === currentPage()"
                    (click)="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                }
                
                <button 
                  class="join-item btn btn-sm"
                  [disabled]="currentPage() === totalPages()"
                  (click)="nextPage()"
                >
                  »
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectListComponent implements OnInit {
  protected readonly projectSignals = inject(ProjectSignalsService);

  // View state
  protected readonly currentView = signal<'grid' | 'list'>('grid');
  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = 12;

  // Computed
  protected readonly displayedProjects = computed(() => {
    const filtered = this.projectSignals.filteredProjects();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  });

  protected readonly totalPages = computed(() => {
    const total = this.projectSignals.filteredProjects().length;
    return Math.ceil(total / this.itemsPerPage);
  });

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Mostrar máximo 5 páginas
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  });

  ngOnInit(): void {
    // Cargar proyectos al iniciar
    this.loadProjects();
  }

  /**
   * Carga los proyectos
   */
  private async loadProjects(): Promise<void> {
    try {
      await this.projectSignals.loadProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  /**
   * Maneja cambio de filtros
   */
  protected onFiltersChange(filters: ProjectFilters): void {
    this.projectSignals.setFilters(filters);
    this.currentPage.set(1); // Reset a primera página
  }

  /**
   * Maneja cambio de vista
   */
  protected onViewChange(view: 'grid' | 'list'): void {
    this.currentView.set(view);
  }

  /**
   * Limpia todos los filtros
   */
  protected clearFilters(): void {
    this.projectSignals.clearFilters();
  }

  /**
   * Verifica si hay filtros activos
   */
  protected hasActiveFilters(): boolean {
    const filters = this.projectSignals.filters();
    return !!(filters.search || filters.status || (filters.role && filters.role !== 'all'));
  }

  /**
   * Editar proyecto
   */
  protected onEditProject(project: Project): void {
    // TODO: Abrir dialog de edición
    console.log('Edit project:', project);
  }

  /**
   * Eliminar proyecto
   */
  protected async onDeleteProject(project: Project): Promise<void> {
    if (!confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?`)) {
      return;
    }

    try {
      await this.projectSignals.deleteProject(project.id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  /**
   * Helpers de paginación
   */
  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  /**
   * Helpers de UI
   */
  protected getStatusBadgeClass(status: string): string {
    return ProjectStatusHelper.getBadgeClass(status as any);
  }

  protected getStatusLabel(status: string): string {
    return ProjectStatusHelper.getLabel(status as any);
  }
}