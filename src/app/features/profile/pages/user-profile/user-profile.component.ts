// src/app/features/profile/pages/user-profile/user-profile.component.ts

import {
  Component, inject, OnInit, viewChild, ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserSignalsService } from '@core/signals/user-signals.service';
import { ProfileAvatarComponent } from '@features/profile/components/profile-avatar/profile-avatar.component';
import { ProfileInfoCardComponent } from '@features/profile/components/profile-info-card/profile-info-card.component';
import { ProfileStatsCardComponent } from '@features/profile/components/profile-stats-card/profile-stats-card.component';
import { ChangePasswordDialogComponent } from '@features/profile/components/change-password-dialog/change-password-dialog.component';

/**
 * Página de perfil de usuario — /users/me
 *
 * Layout:
 *   ┌──────────────────────────────────────────┐
 *   │  Avatar + nombre + roles (columna izq)   │
 *   │  + botón "Cambiar contraseña"            │
 *   ├──────────────────────────────────────────┤
 *   │  ProfileInfoCard (edición inline)        │
 *   ├──────────────────────────────────────────┤
 *   │  ProfileStatsCard (3 métricas)           │
 *   └──────────────────────────────────────────┘
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ProfileAvatarComponent,
    ProfileInfoCardComponent,
    ProfileStatsCardComponent,
    ChangePasswordDialogComponent,
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8 lg:px-8 space-y-6">

      <!-- ── Breadcrumb ──────────────────────────────────── -->
      <nav class="text-sm breadcrumbs text-base-content/50">
        <ul>
          <li><a routerLink="/dashboard">Dashboard</a></li>
          <li class="text-base-content">Mi perfil</li>
        </ul>
      </nav>

      <!-- ── Loading skeleton ───────────────────────────── -->
      @if (userSignals.loading() && !userSignals.profile()) {
        <div class="space-y-4">
          <!-- Skeleton header -->
          <div class="card bg-base-100 border border-base-200">
            <div class="card-body">
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div class="w-28 h-28 rounded-full bg-base-200 animate-pulse flex-shrink-0"></div>
                <div class="flex-1 space-y-3 w-full">
                  <div class="h-6 bg-base-200 rounded animate-pulse w-1/2"></div>
                  <div class="h-4 bg-base-200 rounded animate-pulse w-1/3"></div>
                  <div class="flex gap-2">
                    <div class="h-5 w-14 bg-base-200 rounded-full animate-pulse"></div>
                    <div class="h-5 w-14 bg-base-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Skeleton cards -->
          @for (i of [1,2]; track i) {
            <div class="card bg-base-100 border border-base-200">
              <div class="card-body space-y-3">
                <div class="h-4 bg-base-200 rounded animate-pulse w-1/4"></div>
                <div class="h-10 bg-base-200 rounded animate-pulse"></div>
                <div class="h-10 bg-base-200 rounded animate-pulse w-4/5"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Error ─────────────────────────────────────── -->
      @if (userSignals.error() && !userSignals.loading()) {
        <div class="alert alert-error">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ userSignals.error() }}</span>
          <button class="btn btn-sm btn-ghost" (click)="userSignals.reloadProfile()">
            Reintentar
          </button>
        </div>
      }

      <!-- ── Contenido ──────────────────────────────────── -->
      @if (userSignals.profile(); as profile) {

        <!-- Header card: avatar + nombre + roles + seguridad -->
        <div class="card bg-base-100 border border-base-200 shadow-sm">
          <div class="card-body">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              <!-- Avatar con upload -->
              <app-profile-avatar [profile]="profile" />

              <!-- Info rápida -->
              <div class="flex-1 flex flex-col items-center sm:items-start gap-3">
                <div class="text-center sm:text-left">
                  <h1 class="text-2xl font-bold">{{ profile.userName }}</h1>
                  <p class="text-base-content/50 text-sm">{{ profile.email }}</p>
                </div>

                <!-- Roles -->
                <div class="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  @for (role of profile.roles; track role) {
                    <span
                      class="badge badge-sm font-medium"
                      [class]="role === 'Admin' ? 'badge-primary' : 'badge-ghost'"
                    >
                      {{ role === 'Admin' ? '⚡ Admin' : '👤 ' + role }}
                    </span>
                  }
                </div>

                <!-- Separador -->
                <div class="divider my-0 w-full hidden sm:flex"></div>

                <!-- Sección Seguridad -->
                <div class="w-full">
                  <p class="text-xs text-base-content/40 uppercase tracking-wider font-semibold mb-2">
                    Seguridad
                  </p>
                  <button
                    class="btn btn-outline btn-sm gap-2 w-full sm:w-auto"
                    (click)="openChangePassword()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info personal (edición inline) -->
        <app-profile-info-card [profile]="profile" />

        <!-- Estadísticas -->
        <app-profile-stats-card [profile]="profile" />

      }
    </div>

    <!-- Dialog cambio de contraseña -->
    <app-change-password-dialog />
  `
})
export class UserProfileComponent implements OnInit {
  protected readonly userSignals = inject(UserSignalsService);

  private readonly changePasswordDialog = viewChild(ChangePasswordDialogComponent);

  ngOnInit(): void {
    this.userSignals.loadProfile();
  }

  protected openChangePassword(): void {
    this.changePasswordDialog()?.openDialog();
  }
}