// src/app/features/dashboard/dashboard.component.ts

import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { ProjectSignalsService } from '@core/signals/project-signals.service';
import { TaskSignalsService } from '@core/signals/task-signals.service';

/**
 * Dashboard principal.
 * El fondo y min-h-screen ya los provee MainLayoutComponent — no repetirlos aquí.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8 lg:px-8">

      <!-- Bienvenida -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-base-content">
          ¡Bienvenido, {{ authSignals.username() }}!
        </h1>
        <p class="text-base-content/60 mt-1">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <div class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/50 font-medium">Proyectos</p>
                <p class="text-3xl font-bold text-primary mt-1">—</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/50 font-medium">Tareas pendientes</p>
                <p class="text-3xl font-bold text-warning mt-1">—</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-base-content/50 font-medium">Colaboradores</p>
                <p class="text-3xl font-bold text-accent mt-1">—</p>
              </div>
              <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div class="card-body">
          <h2 class="card-title text-base mb-4">Acciones rápidas</h2>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/projects/create" class="btn btn-primary btn-sm gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo proyecto
            </a>
            <a routerLink="/projects" class="btn btn-outline btn-sm gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Ver proyectos
            </a>
            <a routerLink="/users/me" class="btn btn-outline btn-sm gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi perfil
            </a>
          </div>
        </div>
      </div>

      <!-- Info usuario (debug — quitar en producción) -->
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body">
          <h2 class="card-title text-base mb-3">Información de sesión</h2>
          <div class="space-y-1.5 text-sm text-base-content/70">
            <p><span class="font-medium text-base-content">Usuario:</span> {{ authSignals.username() }}</p>
            <p><span class="font-medium text-base-content">ID:</span> {{ authSignals.userId() }}</p>
            <p><span class="font-medium text-base-content">Roles:</span> {{ authSignals.userRoles().join(', ') }}</p>
            <p><span class="font-medium text-base-content">Admin:</span> {{ authSignals.isAdmin() ? 'Sí' : 'No' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  protected readonly authSignals = inject(AuthSignalsService);
}