// src/app/shared/layouts/main-layout/main-layout.component.ts

import {
  Component, ChangeDetectionStrategy
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '@shared/components/topbar/topbar.component';

/**
 * Layout principal para todas las rutas autenticadas.
 *
 * Estructura:
 *   <app-topbar />          — barra fija top (h-16)
 *   <main class="pt-16">   — contenido desplazado para no quedar debajo del topbar
 *     <router-outlet />
 *   </main>
 *
 * Uso en app.routes.ts:
 *   {
 *     path: '',
 *     component: MainLayoutComponent,
 *     canActivate: [authGuard],
 *     children: [
 *       { path: 'dashboard', ... },
 *       { path: 'projects',  ... },
 *       { path: 'users/me',  ... },
 *     ]
 *   }
 *
 * Las rutas públicas (auth, 404, 403) NO pasan por este layout.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopbarComponent],
  template: `
    <!-- Topbar fija -->
    <app-topbar />

    <!-- Contenido — padding-top = altura del topbar (h-16 = 64px) -->
    <main class="min-h-screen bg-base-200 pt-16">
      <router-outlet />
    </main>
  `
})
export class MainLayoutComponent {}