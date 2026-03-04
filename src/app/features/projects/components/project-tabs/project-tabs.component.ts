// src/app/features/projects/components/project-tabs/project-tabs.component.ts

import { Component, input, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { TaskSignalsService } from '@core/signals/task-signals.service';
import { MemberSignalsService } from '@core/signals/member-signals.service';
import { TaskListComponent } from '@features/tasks/components/task-list/task-list.component';
import { MemberListComponent } from '@features/members/components/member-list/member-list.component';

@Component({
  selector: 'app-project-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskListComponent, MemberListComponent],
  template: `
    <div class="card bg-base-100 shadow-xl">
      <!-- Tabs header -->
      <div class="tabs tabs-boxed bg-base-200 p-2">

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
            {{ taskSignals.taskCount() }}
          </span>
        </button>

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

      <div class="card-body min-h-[500px]">

        @if (activeTab() === 'tasks') {
          <app-task-list [projectId]="projectId()" />
        }

        @if (activeTab() === 'members') {
          <app-member-list [projectId]="projectId()" />
        }

        @if (activeTab() === 'activity') {
          <div class="flex flex-col items-center py-16 text-center">
            <svg class="w-10 h-10 text-base-content/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-base-content/40">Timeline de actividad próximamente</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectTabsComponent {
  protected readonly taskSignals   = inject(TaskSignalsService);
  protected readonly memberSignals = inject(MemberSignalsService);

  readonly projectId = input.required<string>();
  protected readonly activeTab = signal<'tasks' | 'members' | 'activity'>('tasks');

  protected setActiveTab(tab: 'tasks' | 'members' | 'activity'): void {
    this.activeTab.set(tab);
  }
}