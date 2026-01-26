// src/app/core/services/loading.service.ts

import { Injectable, signal, computed } from '@angular/core';

/**
 * Servicio para controlar el estado de carga global
 * Usa un contador para manejar múltiples requests simultáneas
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Contador de requests HTTP activas
   * Privado para que solo este servicio lo modifique
   */
  private readonly requestCount = signal<number>(0);

  /**
   * Signal público que indica si hay loading activo
   * True si hay al menos una request en curso
   */
  readonly isLoading = computed(() => this.requestCount() > 0);

  /**
   * Incrementa el contador de requests activas
   * Llamado cuando inicia una request HTTP
   */
  show(): void {
    this.requestCount.update(count => count + 1);
  }

  /**
   * Decrementa el contador de requests activas
   * Llamado cuando termina una request HTTP
   */
  hide(): void {
    this.requestCount.update(count => Math.max(0, count - 1));
  }

  /**
   * Resetea el contador a 0
   * Útil para casos excepcionales o testing
   */
  reset(): void {
    this.requestCount.set(0);
  }

  /**
   * Obtiene el número actual de requests activas
   * Útil para debugging
   */
  getActiveRequestCount(): number {
    return this.requestCount();
  }
}