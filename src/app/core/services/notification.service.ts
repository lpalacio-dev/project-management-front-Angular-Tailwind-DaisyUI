// src/app/core/services/notification.service.ts

import { Injectable, signal } from '@angular/core';

/**
 * Tipo de notificación
 * Corresponde a las clases de alerta de DaisyUI
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Interface para una notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

/**
 * Servicio para mostrar notificaciones tipo toast
 * Usa DaisyUI alerts y un sistema de signals para reactividad
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Signal que contiene las notificaciones activas
  private notificationsSignal = signal<Notification[]>([]);
  
  // Exposición pública readonly del signal
  readonly notifications = this.notificationsSignal.asReadonly();

  // Duración por defecto de las notificaciones (en ms)
  private readonly DEFAULT_DURATION = 3000;

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration = this.DEFAULT_DURATION): void {
    this.show('success', message, duration);
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration = this.DEFAULT_DURATION): void {
    this.show('error', message, duration);
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration = this.DEFAULT_DURATION): void {
    this.show('info', message, duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration = this.DEFAULT_DURATION): void {
    this.show('warning', message, duration);
  }

  /**
   * Método privado para mostrar notificaciones
   */
  private show(type: NotificationType, message: string, duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    // Añadir notificación al signal
    this.notificationsSignal.update(notifications => [...notifications, notification]);

    // Auto-remover después de la duración especificada
    setTimeout(() => {
      this.remove(notification.id);
    }, duration);
  }

  /**
   * Remueve una notificación específica
   */
  remove(id: string): void {
    this.notificationsSignal.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Remueve todas las notificaciones
   */
  clear(): void {
    this.notificationsSignal.set([]);
  }

  /**
   * Genera un ID único para la notificación
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Obtiene la clase CSS de DaisyUI según el tipo
   */
  static getAlertClass(type: NotificationType): string {
    const baseClass = 'alert';
    switch (type) {
      case 'success':
        return `${baseClass} alert-success`;
      case 'error':
        return `${baseClass} alert-error`;
      case 'info':
        return `${baseClass} alert-info`;
      case 'warning':
        return `${baseClass} alert-warning`;
      default:
        return baseClass;
    }
  }

  /**
   * Obtiene el icono SVG según el tipo
   * Compatible con DaisyUI icons
   */
  static getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      default:
        return '';
    }
  }
}