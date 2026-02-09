// src/app/core/constants/app-routes.constants.ts

/**
 * Constantes de rutas de la aplicación
 * Centraliza las rutas para evitar strings mágicos
 */
export const APP_ROUTES = {
  // Autenticación
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },

  // Dashboard
  DASHBOARD: '/dashboard',

  // Proyectos
  PROJECTS: {
    BASE: '/projects',
    CREATE: '/projects/create',
    DETAIL: (id: string) => `/projects/${id}`,
    EDIT: (id: string) => `/projects/${id}/edit`
  },

  // Usuarios
  USERS: {
    BASE: '/users',
    PROFILE: '/users/me',
    SEARCH: '/users/search',
    DETAIL: (id: string) => `/users/${id}`
  },

  // Páginas de error
  NOT_FOUND: '/404',
  FORBIDDEN: '/403'
} as const;

/**
 * Helper para construir rutas con parámetros
 */
export class RouteHelper {
  /**
   * Construye ruta de detalle de proyecto
   */
  static projectDetail(id: string): string {
    return APP_ROUTES.PROJECTS.DETAIL(id);
  }

  /**
   * Construye ruta de edición de proyecto
   */
  static projectEdit(id: string): string {
    return APP_ROUTES.PROJECTS.EDIT(id);
  }

  /**
   * Construye ruta de detalle de usuario
   */
  static userDetail(id: string): string {
    return APP_ROUTES.USERS.DETAIL(id);
  }

  /**
   * Construye login con returnUrl
   */
  static loginWithReturn(returnUrl: string): string {
    return `${APP_ROUTES.AUTH.LOGIN}?returnUrl=${encodeURIComponent(returnUrl)}`;
  }
}