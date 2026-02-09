// src/app/shared/components/toast-container/toast-container.component.ts

import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Componente contenedor de notificaciones tipo toast
 * Renderiza las notificaciones activas del NotificationService
 * 
 * Uso: Agregar <app-toast-container /> en app.component.html
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast toast-top toast-end z-50">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          [class]="getAlertClass(notification.type)"
          role="alert"
          (click)="notificationService.remove(notification.id)"
          class="cursor-pointer shadow-lg"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 shrink-0 stroke-current" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              [attr.d]="getIcon(notification.type)"
            />
          </svg>
          <span>{{ notification.message }}</span>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            (click)="notificationService.remove(notification.id); $event.stopPropagation()"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ToastContainerComponent {
  protected readonly notificationService = inject(NotificationService);

  protected getAlertClass(type: string): string {
    return NotificationService.getAlertClass(type as any);
  }

  protected getIcon(type: string): string {
    return NotificationService.getIcon(type as any);
  }
}