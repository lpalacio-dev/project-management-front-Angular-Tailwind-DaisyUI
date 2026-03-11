// src/app/features/profile/components/profile-stats-card/profile-stats-card.component.ts

import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfile } from '@core/models/user.model';

/**
 * Tarjeta de estadísticas del usuario.
 * Muestra métricas de proyectos y tareas derivadas de UserProfileDto.
 * Cada stat es clickeable y redirige a la sección correspondiente.
 */
@Component({
  selector: 'app-profile-stats-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="card bg-base-100 border border-base-200 shadow-sm">
      <div class="card-body gap-5">
        <h2 class="font-semibold text-base">Estadísticas</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <!-- Proyectos como Owner -->
          <a
            routerLink="/projects"
            [queryParams]="{ role: 'owner' }"
            class="group flex flex-col gap-2 p-4 rounded-xl bg-base-200
                   hover:bg-primary/10 hover:border-primary/20 border border-transparent
                   transition-all cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center
                          group-hover:bg-primary/20 transition-colors">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <svg class="w-4 h-4 text-base-content/20 group-hover:text-primary/40 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-base-content">
                {{ profile()?.ownedProjectsCount ?? '—' }}
              </p>
              <p class="text-xs text-base-content/50 font-medium mt-0.5">Proyectos como Owner</p>
            </div>
          </a>

          <!-- Proyectos como Miembro -->
          <a
            routerLink="/projects"
            [queryParams]="{ role: 'member' }"
            class="group flex flex-col gap-2 p-4 rounded-xl bg-base-200
                   hover:bg-secondary/10 hover:border-secondary/20 border border-transparent
                   transition-all cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center
                          group-hover:bg-secondary/20 transition-colors">
                <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <svg class="w-4 h-4 text-base-content/20 group-hover:text-secondary/40 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-base-content">
                {{ profile()?.memberProjectsCount ?? '—' }}
              </p>
              <p class="text-xs text-base-content/50 font-medium mt-0.5">Proyectos como Miembro</p>
            </div>
          </a>

          <!-- Tareas asignadas -->
          <div
            class="flex flex-col gap-2 p-4 rounded-xl bg-base-200 border border-transparent"
          >
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div>
              <p class="text-2xl font-bold text-base-content">
                {{ profile()?.assignedTasksCount ?? '—' }}
              </p>
              <p class="text-xs text-base-content/50 font-medium mt-0.5">Tareas asignadas</p>
            </div>
          </div>
        </div>

        <!-- Barra de resumen: total de proyectos -->
        @if (totalProjects() > 0) {
          <div class="pt-1">
            <div class="flex items-center justify-between text-xs text-base-content/50 mb-1.5">
              <span>Proyectos totales</span>
              <span class="font-semibold text-base-content">{{ totalProjects() }}</span>
            </div>
            <div class="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                [style.width.%]="ownerPercent()"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-base-content/40 mt-1">
              <span>{{ ownerPercent() }}% como Owner</span>
              <span>{{ 100 - ownerPercent() }}% como Miembro</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProfileStatsCardComponent {
  readonly profile = input<UserProfile | null>(null);

  protected readonly totalProjects = computed(() =>
    (this.profile()?.ownedProjectsCount ?? 0) + (this.profile()?.memberProjectsCount ?? 0)
  );

  protected readonly ownerPercent = computed(() => {
    const total = this.totalProjects();
    if (!total) return 0;
    return Math.round(((this.profile()?.ownedProjectsCount ?? 0) / total) * 100);
  });
}