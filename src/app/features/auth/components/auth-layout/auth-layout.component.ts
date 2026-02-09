// src/app/features/auth/components/auth-layout/auth-layout.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Layout compartido para páginas de autenticación
 * Opcional: Wrapper común para login y register
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <!-- Pattern decorativo (opcional) -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <!-- Contenido -->
      <div class="relative">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .bg-grid-pattern {
      background-image: 
        linear-gradient(to right, currentColor 1px, transparent 1px),
        linear-gradient(to bottom, currentColor 1px, transparent 1px);
      background-size: 20px 20px;
    }
  `]
})
export class AuthLayoutComponent {}