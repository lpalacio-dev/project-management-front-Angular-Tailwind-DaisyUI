// src/app/core/models/ai.model.ts

import { ProjectStatus } from './project.model';
import { TaskPriority } from './task.model';

// ─────────────────────────────────────────────
// Request DTOs (frontend → backend)
// ─────────────────────────────────────────────

/**
 * Cuerpo de POST /api/ai/generate-project
 * La descripción debe tener entre 20 y 2000 caracteres (validado en backend y frontend).
 */
export interface GenerateProjectRequest {
  description: string;
  language?: 'es' | 'en';
  maxTasks?: number;
  detailLevel?: AiDetailLevel;
}

/**
 * Cuerpo de POST /api/ai/confirm-project
 * El usuario puede editar nombre, descripción y estado antes de confirmar.
 * selectedTasks contiene solo las tareas que el usuario marcó.
 */
export interface AiConfirmProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
  selectedTasks: AiConfirmTaskRequest[];
}

export interface AiConfirmTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDateOffsetDays?: number;
}

// ─────────────────────────────────────────────
// Response DTOs (backend → frontend)
// ─────────────────────────────────────────────

/**
 * Respuesta de POST /api/ai/generate-project
 * No persiste nada — solo es una sugerencia para que el usuario revise.
 * El campo `tasks` incluye `selected: true` por defecto (campo local, no viene del backend).
 */
export interface AiGeneratedProject {
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: AiGeneratedTask[];
  generatedByProvider: string;
  usedFallback: boolean;
  generatedAt: string;
}

/**
 * Tarea sugerida por la IA.
 * `selected` es un campo local del frontend (checkbox de confirmación).
 * `dueDateOffsetDays` es días relativos desde hoy — se convierte a fecha absoluta al confirmar.
 */
export interface AiGeneratedTask {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDateOffsetDays?: number;
  orderIndex: number;
  selected: boolean;
}

// ─────────────────────────────────────────────
// Rate limit (headers de respuesta)
// ─────────────────────────────────────────────

/**
 * Información de rate limit extraída de los headers X-RateLimit-*.
 * El backend envía estos headers en todas las respuestas de /api/ai/*.
 */
export interface AiRateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}

// ─────────────────────────────────────────────
// Enums y tipos locales
// ─────────────────────────────────────────────

export type AiDetailLevel = 'brief' | 'detailed';

/**
 * Tipos de error específicos del módulo de IA.
 * Permite que los componentes reaccionen a cada caso sin comparar strings.
 */
export enum AiErrorType {
  RateLimit      = 'RateLimit',       // HTTP 429 — límite de usuario superado
  LlmUnavailable = 'LlmUnavailable',  // HTTP 503 — todos los providers fallaron
  ParseError     = 'ParseError',      // HTTP 502 — el LLM devolvió JSON inválido
  Unauthorized   = 'Unauthorized',    // HTTP 401 — token expirado o inválido
  Unknown        = 'Unknown',         // Cualquier otro error
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export class AiErrorHelper {
  /**
   * Convierte un código HTTP en AiErrorType.
   * Usado en AiSignalsService para mostrar mensajes de error específicos.
   */
  static fromStatus(status: number): AiErrorType {
    switch (status) {
      case 429: return AiErrorType.RateLimit;
      case 503: return AiErrorType.LlmUnavailable;
      case 502: return AiErrorType.ParseError;
      case 401: return AiErrorType.Unauthorized;
      default:  return AiErrorType.Unknown;
    }
  }

  /**
   * Devuelve el mensaje de notificación apropiado para cada tipo de error.
   * Los mensajes están en español para coincidir con el resto de la app.
   */
  static getMessage(type: AiErrorType, retryAfterSeconds?: number): string {
    switch (type) {
      case AiErrorType.RateLimit: {
        if (retryAfterSeconds && retryAfterSeconds > 0) {
          const minutes = Math.ceil(retryAfterSeconds / 60);
          return `Has alcanzado el límite de generaciones con IA. Intenta de nuevo en ${minutes} minuto${minutes !== 1 ? 's' : ''}.`;
        }
        return 'Has alcanzado el límite de generaciones con IA. Intenta más tarde.';
      }
      case AiErrorType.LlmUnavailable:
        return 'El servicio de IA no está disponible en este momento. Intenta en unos minutos.';
      case AiErrorType.ParseError:
        return 'La IA devolvió una respuesta inesperada. Intenta de nuevo.';
      case AiErrorType.Unauthorized:
        return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
      default:
        return 'Ocurrió un error al conectar con la IA. Intenta de nuevo.';
    }
  }
}

export class AiTaskHelper {
  /**
   * Convierte dueDateOffsetDays (días relativos desde hoy) a Date absoluta.
   * Retorna undefined si el offset es undefined o <= 0.
   */
  static offsetToDate(offsetDays?: number): Date | undefined {
    if (!offsetDays || offsetDays <= 0) return undefined;
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date;
  }

  /**
   * Construye un AiConfirmTaskRequest a partir de un AiGeneratedTask.
   * Solo incluye los campos que el backend espera.
   */
  static toConfirmRequest(task: AiGeneratedTask): AiConfirmTaskRequest {
    return {
      title:             task.title,
      description:       task.description,
      priority:          task.priority,
      dueDateOffsetDays: task.dueDateOffsetDays,
    };
  }
}