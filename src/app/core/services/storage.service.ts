// src/app/core/services/storage.service.ts

import { Injectable } from '@angular/core';

/**
 * Servicio de abstracción para localStorage
 * Facilita testing y futuros cambios de storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage = window.localStorage;

  /**
   * Guarda un valor en localStorage
   * Serializa automáticamente a JSON
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error guardando en localStorage (${key}):`, error);
    }
  }

  /**
   * Obtiene un valor de localStorage
   * Deserializa automáticamente desde JSON
   * Retorna null si no existe o hay error
   */
  getItem<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error leyendo de localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Elimina un item específico de localStorage
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando de localStorage (${key}):`, error);
    }
  }

  /**
   * Limpia todo el localStorage
   * Usar con precaución
   */
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
  }

  /**
   * Verifica si existe una clave en localStorage
   */
  hasItem(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Obtiene todas las claves almacenadas
   * Útil para debugging
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
}

/**
 * Constantes para las claves de localStorage
 * Centraliza los nombres de claves para evitar typos
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;