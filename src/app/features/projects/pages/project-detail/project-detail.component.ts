// src/app/features/projects/pages/project-detail/project-detail.component.ts

import { Component, inject, signal, computed, OnInit, OnDestroy, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { MemberSignalsService } from '@core/signals/member-signals.service';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { ProjectStatus } from '@core/models/project.model';
import { ProjectHeaderComponent } from '../../components/project-header/project-header.component';
import { ProjectStatsComponent } from '../../components/project-stats/project-stats.component';
import { ProjectTabsComponent } from '../../components/project-tabs/project-tabs.component';
import { ProjectEditDialogComponent } from '../../components/project-edit-dialog/project-edit-dialog.component';

/**
 * Página de detalle del proyecto.
 * Orquesta el header, stats, y el sistema de tabs (tareas/miembros/actividad).
 * Los permisos reales (canEdit, canManageMembers) ahora se derivan
 * de MemberSignalsService que conoce el rol exacto del usuario en el proyecto.
 */
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    RouterLink,
    ProjectHeaderComponent,
    ProjectStatsComponent,
    ProjectTabsComponent,
    ProjectEditDialogComponent
  ],
  template: `
    <div class="min-h-screen bg-base-200">

      @if (projectSignals.loading() && !project()) {
        <!-- Loading skeleton -->
        <div class="container mx-auto px-4 py-8">
          <div class="animate-pulse space-y-6">
            <div class="h-8 bg-base-300 rounded w-1/4"></div>
            <div class="h-32 bg-base-300 rounded"></div>
            <div class="grid grid-cols-3 gap-4">
              <div class="h-24 bg-base-300 rounded"></div>
              <div class="h-24 bg-base-300 rounded"></div>
              <div class="h-24 bg-base-300 rounded"></div>
            </div>
            <div class="h-96 bg-base-300 rounded"></div>
          </div>
        </div>

      } @else if (project()) {
        <!-- Header del proyecto -->
        <app-project-header
          [project]="project()!"
          [canEdit]="canEditProject()"
          [canManageMembers]="canManageMembers()"
          [canLeave]="canLeaveProject()"
          (edit)="onEditProject()"
          (delete)="onDeleteProject()"
          (leave)="onLeaveProject()"
          (statusChange)="onStatusChange($event)"
        />

        <!-- Stats cards -->
        <div class="container mx-auto px-4 -mt-8 mb-8">
          <app-project-stats [projectId]="projectId()" />
        </div>

        <!-- Tabs (Tareas, Miembros, Actividad) -->
        <div class="container mx-auto px-4 pb-8">
          <app-project-tabs [projectId]="projectId()" />
        </div>

        <!-- Edit Dialog -->
        <app-project-edit-dialog
          [project]="project()!"
          (saved)="onProjectSaved()"
        />

      } @else if (projectSignals.error()) {
        <!-- Error state -->
        <div class="container mx-auto px-4 py-16">
          <div class="alert alert-error">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Error al cargar proyecto</h3>
              <p>{{ projectSignals.error() }}</p>
            </div>
            <a routerLink="/projects" class="btn btn-sm">Volver a proyectos</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  protected readonly projectSignals = inject(ProjectSignalsService);
  protected readonly taskSignals    = inject(TaskSignalsService);
  protected readonly memberSignals  = inject(MemberSignalsService);
  protected readonly authSignals    = inject(AuthSignalsService);

  private readonly editDialog = viewChild(ProjectEditDialogComponent);

  protected readonly projectId = signal<string>('');
  protected readonly project   = computed(() => this.projectSignals.selectedProject());

  /**
   * canEditProject: se deriva del rol real en el proyecto (MemberSignalsService).
   * Fallback a ownerId si los miembros aún no cargaron.
   */
  protected readonly canEditProject = computed(() => {
    // Si ya tenemos rol real del miembro, usarlo
    if (this.memberSignals.members().length > 0) {
      return this.memberSignals.canEditProject();
    }
    // Fallback: comparar ownerId mientras cargan los miembros
    const proj = this.project();
    return proj?.ownerId === this.authSignals.userId() || this.authSignals.isAdmin();
  });

  protected readonly canManageMembers = computed(() => {
    if (this.memberSignals.members().length > 0) {
      return this.memberSignals.canManageMembers();
    }
    const proj = this.project();
    return proj?.ownerId === this.authSignals.userId() || this.authSignals.isAdmin();
  });

  protected readonly canLeaveProject = computed(() => {
    if (this.memberSignals.members().length > 0) {
      return this.memberSignals.canLeaveProject();
    }
    const proj = this.project();
    return proj?.ownerId !== this.authSignals.userId();
  });

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.projectId.set(id);
    this.loadProject(id);
  }

  ngOnDestroy(): void {
    this.projectSignals.clearSelected();
    this.taskSignals.clear();
    this.memberSignals.clear();
  }

  // ── Loaders ───────────────────────────────────────────────
  private async loadProject(id: string): Promise<void> {
    try {
      await this.projectSignals.loadProject(id);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }

  // ── Handlers ──────────────────────────────────────────────
  protected onEditProject(): void {
    this.editDialog()?.openDialog();
  }

  protected onProjectSaved(): void {
    // El signal service ya actualizó el estado — nada más que hacer
  }

  protected async onDeleteProject(): Promise<void> {
    const proj = this.project();
    if (!proj) return;

    if (!confirm(`¿Estás seguro de eliminar el proyecto "${proj.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await this.projectSignals.deleteProject(proj.id);
      // deleteProject navega a /projects automáticamente
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  /**
   * Abandonar proyecto: ahora delegado a MemberSignalsService.
   * Navega a /projects si tiene éxito.
   */
  protected async onLeaveProject(): Promise<void> {
    const proj = this.project();
    if (!proj) return;

    if (!confirm(`¿Estás seguro de abandonar "${proj.name}"?\n\nPerderás acceso a todas las tareas y datos del proyecto.`)) {
      return;
    }

    try {
      await this.memberSignals.leaveProject(proj.id);
      this.router.navigate(['/projects']);
    } catch (error) {
      console.error('Error leaving project:', error);
    }
  }

  protected async onStatusChange(newStatus: ProjectStatus): Promise<void> {
    const proj = this.project();
    if (!proj) return;

    try {
      await this.projectSignals.updateProject(proj.id, {
        name: proj.name,
        description: proj.description,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }
}