// src/app/features/projects/components/project-tabs/project-tabs.component.ts

import { Component, input, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { MemberListComponent } from '@features/members/components/member-list/member-list.component';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { MemberSignalsService } from '@core/signals/member-signals.service';

/**
 * Sistema de tabs para el proyecto.
 * Tareas, Miembros y Actividad.
 * El tab de Miembros está completamente integrado con MemberListComponent.
 */
@Component({
  selector: 'app-project-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemberListComponent],
  template: `
    <div class="card bg-base-100 shadow-xl">
      <!-- Tabs header -->
      <div class="tabs tabs-boxed bg-base-200 p-2">

        <!-- Tab Tareas -->
        <button
          class="tab tab-lg gap-2"
          [class.tab-active]="activeTab() === 'tasks'"
          (click)="setActiveTab('tasks')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span class="hidden sm:inline">Tareas</span>
          <span [class]="'badge badge-sm ' + (activeTab() === 'tasks' ? 'badge-primary' : 'badge-ghost')">
            {{ taskCount() }}
          </span>
        </button>

        <!-- Tab Miembros -->
        <button
          class="tab tab-lg gap-2"
          [class.tab-active]="activeTab() === 'members'"
          (click)="setActiveTab('members')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="hidden sm:inline">Miembros</span>
          <span [class]="'badge badge-sm ' + (activeTab() === 'members' ? 'badge-primary' : 'badge-ghost')">
            {{ memberSignals.memberCount() }}
          </span>
        </button>

        <!-- Tab Actividad -->
        <button
          class="tab tab-lg gap-2"
          [class.tab-active]="activeTab() === 'activity'"
          (click)="setActiveTab('activity')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden sm:inline">Actividad</span>
        </button>
      </div>

      <!-- Tab content -->
      <div class="card-body min-h-[500px]">

        <!-- ── Tab: Tareas ──────────────────────────────── -->
        @if (activeTab() === 'tasks') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold">Tareas del Proyecto</h2>
              <button class="btn btn-primary btn-sm gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Tarea
              </button>
            </div>
            <div class="alert alert-info">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>El módulo de tareas se implementará próximamente</span>
            </div>
          </div>
        }

        <!-- ── Tab: Miembros ────────────────────────────── -->
        @if (activeTab() === 'members') {
          <app-member-list [projectId]="projectId()" />
        }

        <!-- ── Tab: Actividad ───────────────────────────── -->
        @if (activeTab() === 'activity') {
          <div class="space-y-4">
            <h2 class="text-2xl font-bold">Actividad Reciente</h2>
            <div class="alert alert-info">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>El timeline de actividad se implementará próximamente</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectTabsComponent {
  protected readonly taskSignals   = inject(TaskSignalsService);
  protected readonly memberSignals = inject(MemberSignalsService);
  readonly taskCount = input<number>(0);
  readonly memberCount = input<number>(0);
  readonly projectId   = input.required<string>();

  protected readonly activeTab = signal<'tasks' | 'members' | 'activity'>('tasks');

  protected setActiveTab(tab: 'tasks' | 'members' | 'activity'): void {
    this.activeTab.set(tab);
  }
}