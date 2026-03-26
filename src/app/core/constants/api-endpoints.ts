// src/app/core/constants/api-endpoints.ts
import { environment } from "../../../environments/environment";

/**
 * Base URL de la API
 * En producción esto debe venir de environment
 */
export const API_BASE_URL = environment.API_BASE_URL;

/**
 * Endpoints de la API organizados por dominio
 * Centraliza todas las URLs para facilitar mantenimiento
 */
export const API_ENDPOINTS = {
  /**
   * Endpoints de autenticación
   */
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`
  },

  /**
   * Endpoints de proyectos
   */
  PROJECTS: {
    BASE: `${API_BASE_URL}/api/projects`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
    CREATE: `${API_BASE_URL}/api/projects`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/projects/${id}`
  },

  TASKS: {
    BY_PROJECT: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    BY_ID: (projectId: string, taskId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`,
    CREATE: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    UPDATE: (projectId: string, taskId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`,
    DELETE: (projectId: string, taskId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`
  },

  MEMBERS: {
    BY_PROJECT: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/members`,
    BY_USER: (projectId: string, userId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/members/${userId}`,
    ADD: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/members`,
    UPDATE_ROLE: (projectId: string, userId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/members/${userId}`,
    REMOVE: (projectId: string, userId: string) =>
      `${API_BASE_URL}/api/projects/${projectId}/members/${userId}`,
    LEAVE: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/members/leave`
  },

  /**
   * Endpoints de usuarios
   */
  USERS: {
    SEARCH: `${API_BASE_URL}/api/users/search`,
    ME: `${API_BASE_URL}/api/users/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/users/me/change-password`,
    UPLOAD_PROFILE_IMAGE: `${API_BASE_URL}/api/users/me/profile-image`,
    DELETE_PROFILE_IMAGE: `${API_BASE_URL}/api/users/me/profile-image`,
    ALL: `${API_BASE_URL}/api/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    MANAGE_ROLES: (id: string) => `${API_BASE_URL}/api/users/${id}/roles`,
    DELETE: (id: string) => `${API_BASE_URL}/api/users/${id}`
  },

  /**
   * Endpoints del módulo de IA
   * Todos requieren JWT con rol User.
   * El backend aplica rate limiting: 10 req / 60 min por usuario.
   */
  AI: {
    /** POST — genera sugerencia. No persiste nada. */
    GENERATE_PROJECT: `${API_BASE_URL}/api/ai/generate-project`,
    /** POST — persiste el proyecto y las tareas confirmadas. Retorna ProjectDto. */
    CONFIRM_PROJECT: `${API_BASE_URL}/api/ai/confirm-project`,
    /** GET — sugiere tareas faltantes para un proyecto existente. No persiste nada. */
    SUGGEST_TASKS: (projectId: string) => `${API_BASE_URL}/api/ai/suggest-tasks/${projectId}`
  }

} as const;

/**
 * Timeout por defecto para requests HTTP (en ms)
 */
export const HTTP_TIMEOUT = 30000;

/**
 * Timeout extendido para requests al módulo de IA.
 * Los LLMs pueden tardar hasta 30-60 s según el proveedor.
 * El interceptor de loading NO se aplica al módulo de IA — usa su propio estado.
 */
export const AI_HTTP_TIMEOUT = 65000;

/**
 * Headers comunes para requests
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: { 'Content-Type': 'application/json' },
  ACCEPT_JSON: { 'Accept': 'application/json' }
} as const;