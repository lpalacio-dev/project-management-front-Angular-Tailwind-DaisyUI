// src/app/features/auth/auth.routes.ts

import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

/**
 * Rutas del módulo de autenticación
 * Todas las rutas usan guestGuard para prevenir acceso si ya autenticado
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión',
    data: {
      animation: 'LoginPage'
    }
  },
  {
    path: 'register',
    loadComponent: () => 
      import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Crear Cuenta',
    data: {
      animation: 'RegisterPage'
    }
  }
];