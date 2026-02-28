// src/app/core/utils/date.utils.ts

/**
 * Utilidades para trabajar con fechas
 */
export class DateUtils {
  /**
   * Formatea una fecha en formato legible en español
   * Ejemplo: "15 de enero de 2024"
   */
  static formatLong(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  }

  /**
   * Formatea una fecha en formato corto
   * Ejemplo: "15/01/2024"
   */
  static formatShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  }

  /**
   * Formatea una fecha con hora
   * Ejemplo: "15/01/2024 14:30"
   */
  static formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  /**
   * Formatea una fecha de forma relativa
   * Ejemplo: "hace 2 horas", "hace 3 días"
   */
  static formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) {
      return 'hace un momento';
    } else if (diffMins < 60) {
      return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 30) {
      return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (diffMonths < 12) {
      return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    } else {
      return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
    }
  }

  /**
   * Obtiene el tiempo restante hasta una fecha
   * Ejemplo: "Vence en 2 días", "Vencida hace 3 horas"
   */
  static getTimeUntil(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);
    const diffSecs = Math.floor(absDiffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeStr = '';
    if (diffDays > 0) {
      timeStr = `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (diffHours > 0) {
      timeStr = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffMins > 0) {
      timeStr = `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else {
      timeStr = 'momentos';
    }

    return isPast ? `Vencida hace ${timeStr}` : `Vence en ${timeStr}`;
  }

  /**
   * Verifica si una fecha es hoy
   */
  static isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  /**
   * Verifica si una fecha es ayer
   */
  static isYesterday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }

  /**
   * Verifica si una fecha es en el futuro
   */
  static isFuture(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getTime() > new Date().getTime();
  }

  /**
   * Verifica si una fecha es en el pasado
   */
  static isPast(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getTime() < new Date().getTime();
  }

  /**
   * Convierte una fecha a formato ISO para inputs de tipo date
   */
  static toInputDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  /**
   * Calcula días entre dos fechas
   */
  static daysBetween(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el inicio del día (00:00:00)
   */
  static startOfDay(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /**
   * Obtiene el fin del día (23:59:59)
   */
  static endOfDay(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }
}