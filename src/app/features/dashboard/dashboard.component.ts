// src/app/features/dashboard/pages/dashboard/dashboard.component.ts

import { Component, inject } from '@angular/core';
import { AuthSignalsService } from '../../core/signals/auth-signals.service';
import { RouterLink } from '@angular/router';

/**
 * Dashboard principal (Placeholder)
 * Página inicial después de login
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-base-200 p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-base-content mb-2">
          ¡Bienvenido, {{ authSignals.username() }}!
        </h1>
        <p class="text-base-content/70">
          Este es tu dashboard de gestión de proyectos
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Card 1 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-primary">Proyectos</h2>
            <p class="text-3xl font-bold">0</p>
            <p class="text-sm text-base-content/70">Total de proyectos</p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-secondary">Tareas</h2>
            <p class="text-3xl font-bold">0</p>
            <p class="text-sm text-base-content/70">Tareas pendientes</p>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-accent">Colaboradores</h2>
            <p class="text-3xl font-bold">0</p>
            <p class="text-sm text-base-content/70">Miembros activos</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title mb-4">Acciones Rápidas</h2>
          
          <div class="flex flex-wrap gap-4">
            <a routerLink="/projects/create" class="btn btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </a>

            <a routerLink="/projects" class="btn btn-outline">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Ver Proyectos
            </a>

            <a routerLink="/users/me" class="btn btn-outline">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </a>
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="mt-8 card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Información de Usuario</h2>
          <div class="space-y-2 text-sm">
            <p><strong>Usuario:</strong> {{ authSignals.username() }}</p>
            <p><strong>ID:</strong> {{ authSignals.userId() }}</p>
            <p><strong>Roles:</strong> {{ authSignals.userRoles().join(', ') }}</p>
            <p><strong>Es Admin:</strong> {{ authSignals.isAdmin() ? 'Sí' : 'No' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  protected readonly authSignals = inject(AuthSignalsService);
}