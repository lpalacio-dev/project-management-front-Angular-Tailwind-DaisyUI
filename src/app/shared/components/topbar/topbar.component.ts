// src/app/shared/components/topbar/topbar.component.ts

import {
  Component, inject, ChangeDetectionStrategy
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { UserSignalsService } from '@core/signals/user-signals.service';

/**
 * Topbar global de la aplicación.
 * Montado una sola vez en MainLayoutComponent.
 *
 * Secciones:
 *  Izquierda  — Logo + nombre app → /dashboard
 *  Centro     — Nav principal (desktop): Dashboard / Proyectos
 *  Derecha    — Notificaciones (futuro) + avatar dropdown
 *
 * El avatar funciona con initials/color derivado del username del JWT
 * sin necesidad de que el perfil completo esté cargado.
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar bg-base-100 border-b border-base-200 h-16 px-4 lg:px-6
                   fixed top-0 left-0 right-0 z-40 shadow-sm">

      <!-- ── Izquierda: Logo ─────────────────────────────── -->
      <div class="navbar-start gap-3">
        <!-- Hamburger mobile (futuro sidebar) -->
        <label
          for="main-drawer"
          class="btn btn-ghost btn-square lg:hidden"
          aria-label="Menú"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>

        <!-- Logo -->
        <a
          routerLink="/dashboard"
          class="flex items-center gap-2.5 text-base-content hover:opacity-80 transition-opacity"
        >
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="font-bold text-base hidden sm:block">GestiónProyectos</span>
        </a>
      </div>

      <!-- ── Centro: Nav principal (desktop) ────────────── -->
      <div class="navbar-center hidden lg:flex">
        <nav class="flex items-center gap-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-base-200 text-base-content"
            [routerLinkActiveOptions]="{ exact: true }"
            class="btn btn-ghost btn-sm gap-2 text-base-content/70 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a
            routerLink="/projects"
            routerLinkActive="bg-base-200 text-base-content"
            class="btn btn-ghost btn-sm gap-2 text-base-content/70 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Proyectos
          </a>
        </nav>
      </div>

      <!-- ── Derecha: Notificaciones + Avatar ───────────── -->
      <div class="navbar-end gap-2">

        <!-- Notificaciones (badge futuro) -->
        <button
          class="btn btn-ghost btn-square btn-sm relative"
          aria-label="Notificaciones"
          title="Notificaciones (próximamente)"
        >
          <svg class="w-5 h-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <!-- Badge (descomentar cuando haya notificaciones reales)
          <span class="badge badge-error badge-xs absolute -top-0.5 -right-0.5">3</span>
          -->
        </button>

        <!-- Avatar dropdown -->
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            class="btn btn-ghost btn-square p-0 rounded-full"
            aria-label="Menú de usuario"
          >
            @if (userSignals.profileImageUrl()) {
              <img
                [src]="userSignals.profileImageUrl()"
                [alt]="userSignals.displayName()"
                class="w-9 h-9 rounded-full object-cover ring-2 ring-base-200"
              />
            } @else {
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center
                       text-white text-sm font-bold ring-2 ring-base-200"
                [style.background-color]="userSignals.avatarColor()"
                [title]="userSignals.displayName()"
              >
                {{ userSignals.initials() }}
              </div>
            }
          </button>

          <ul tabindex="0"
            class="dropdown-content z-50 menu menu-sm shadow-lg bg-base-100
                   rounded-box w-56 border border-base-200 p-2 mt-2">

            <!-- Header del dropdown -->
            <li class="menu-title px-2 py-1.5 mb-1">
              <div class="flex items-center gap-2.5">
                @if (userSignals.profileImageUrl()) {
                  <img
                    [src]="userSignals.profileImageUrl()"
                    [alt]="userSignals.displayName()"
                    class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                } @else {
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center
                           text-white text-xs font-bold flex-shrink-0"
                    [style.background-color]="userSignals.avatarColor()"
                  >
                    {{ userSignals.initials() }}
                  </div>
                }
                <div class="min-w-0">
                  <p class="font-semibold text-base-content text-sm truncate">
                    {{ userSignals.displayName() }}
                  </p>
                  @if (userSignals.isAdmin()) {
                    <span class="badge badge-primary badge-xs">Admin</span>
                  } @else {
                    <p class="text-xs text-base-content/50">Usuario</p>
                  }
                </div>
              </div>
            </li>

            <div class="divider my-1 h-px"></div>

            <li>
              <a routerLink="/users/me" class="gap-3 py-2.5">
                <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi perfil
              </a>
            </li>

            <li>
              <a routerLink="/dashboard" class="gap-3 py-2.5">
                <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
            </li>

            @if (userSignals.isAdmin()) {
              <div class="divider my-1 h-px"></div>
              <li>
                <a routerLink="/admin" class="gap-3 py-2.5">
                  <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Administración
                </a>
              </li>
            }

            <div class="divider my-1 h-px"></div>

            <li>
              <button
                class="gap-3 py-2.5 text-error hover:bg-error/10"
                (click)="onLogout()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  protected readonly authSignals = inject(AuthSignalsService);
  protected readonly userSignals = inject(UserSignalsService);
  private  readonly router       = inject(Router);

  protected onLogout(): void {
    this.authSignals.logout();
    this.userSignals.clear();
    this.router.navigate(['/auth/login']);
  }
}