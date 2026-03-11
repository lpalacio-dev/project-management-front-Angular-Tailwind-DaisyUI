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
    // Admin endpoints
    ALL: `${API_BASE_URL}/api/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    MANAGE_ROLES: (id: string) => `${API_BASE_URL}/api/users/${id}/roles`,
    DELETE: (id: string) => `${API_BASE_URL}/api/users/${id}`
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