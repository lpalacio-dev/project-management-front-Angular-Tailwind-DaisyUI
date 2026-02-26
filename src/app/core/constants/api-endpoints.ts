// src/app/core/constants/api-endpoints.ts
import { environment } from "../../../environments/environment";

/**
 * Base URL de la API
 * En producción esto debe venir de environment
 */
export const API_BASE_URL = environment.API_BASE_URL; // Ajusta según tu backend

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
    TASKS: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    TASK_BY_ID: (projectId: string, taskId: string) => 
      `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`,
    MEMBERS: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/members`,
    MEMBER_BY_ID: (projectId: string, userId: string) => 
      `${API_BASE_URL}/api/projects/${projectId}/members/${userId}`,
    LEAVE: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/members/leave`
  },

  /**
   * Endpoints de usuarios
   */
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    SEARCH: `${API_BASE_URL}/api/users/search`,
    ME: `${API_BASE_URL}/api/users/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/users/me/change-password`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    ROLES: (id: string) => `${API_BASE_URL}/api/users/${id}/roles`
  }
} as const;

/**
 * Timeout por defecto para requests HTTP (en ms)
 */
export const HTTP_TIMEOUT = 30000; // 30 segundos

/**
 * Headers comunes para requests
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: { 'Content-Type': 'application/json' },
  ACCEPT_JSON: { 'Accept': 'application/json' }
} as const;