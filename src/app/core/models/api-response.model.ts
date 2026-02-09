// src/app/core/models/api-response.model.ts

/**
 * Wrapper genérico para respuestas de la API
 * Útil para endpoints que retornan data estructurada
 */
export interface ApiResponse<T = unknown> {
  status: 'Success' | 'Error';
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Response específico para errores HTTP
 * Se usa en el error interceptor
 */
export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: string[];
  timestamp: Date;
}

/**
 * Helper para crear errores consistentes
 */
export class ApiErrorHelper {
  static createError(
    status: number,
    statusText: string,
    message: string,
    errors?: string[]
  ): ApiError {
    return {
      status,
      statusText,
      message,
      errors,
      timestamp: new Date()
    };
  }

  static getDefaultMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Solicitud inválida. Verifica los datos enviados.';
      case 401:
        return 'No estás autenticado. Por favor inicia sesión.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto con el estado actual del recurso.';
      case 500:
        return 'Error del servidor. Intenta nuevamente más tarde.';
      default:
        return 'Ha ocurrido un error. Intenta nuevamente.';
    }
  }
}