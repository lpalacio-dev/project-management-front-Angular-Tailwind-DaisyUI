// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { LoginRequest, RegisterRequest, AuthResponse, TokenPayload } from '../models/auth.model';
import { StorageService, STORAGE_KEYS } from './storage.service';

/**
 * Servicio de autenticación HTTP
 * Maneja la comunicación con el backend para auth
 * NO maneja state (eso es responsabilidad de AuthSignalsService)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  /**
   * Realiza login en el backend
   * @param credentials Username y password
   * @returns Observable con la respuesta del backend
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
  }

  /**
   * Registra un nuevo usuario
   * @param data Datos de registro (username, email, password)
   * @returns Observable que completa cuando el registro es exitoso
   */
  register(data: RegisterRequest): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
  }

  /**
   * Obtiene el token almacenado en localStorage
   * @returns Token JWT o null si no existe
   */
  getStoredToken(): string | null {
    return this.storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Decodifica un JWT token sin validar firma
   * ADVERTENCIA: Solo para leer claims, NO para validar autenticidad
   * @param token JWT token
   * @returns Payload decodificado o null si es inválido
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      // JWT tiene 3 partes separadas por punto: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decodificar la segunda parte (payload)
      const payload = parts[1];
      
      // Reemplazar caracteres URL-safe
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decodificar base64
      const decoded = atob(base64);
      
      // Parsear JSON
      return JSON.parse(decoded) as TokenPayload;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verifica si un token JWT está expirado
   * @param token JWT token
   * @returns true si está expirado, false si aún es válido
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    
    if (!payload || !payload.exp) {
      return true; // Si no tiene exp, considerarlo expirado
    }

    // exp viene en segundos, Date.now() en milisegundos
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();

    return expirationDate <= now;
  }

  /**
   * Extrae el user ID del token
   * @param token JWT token
   * @returns User ID o null
   */
  getUserIdFromToken(token: string): string | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    // El backend usa el claim nameidentifier para el user ID
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
      || payload.sub 
      || null;
  }

  /**
   * Extrae el username del token
   * @param token JWT token
   * @returns Username o null
   */
  getUsernameFromToken(token: string): string | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    // El backend usa el claim name para el username
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
  }

  /**
   * Extrae los roles del token
   * @param token JWT token
   * @returns Array de roles o array vacío
   */
  getRolesFromToken(token: string): string[] {
    const payload = this.decodeToken(token);
    if (!payload) return [];

    const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    // Los roles pueden venir como string o array
    if (Array.isArray(roleClaim)) {
      return roleClaim;
    } else if (typeof roleClaim === 'string') {
      return [roleClaim];
    }
    
    return [];
  }

  /**
   * Calcula cuánto tiempo falta para que expire el token
   * @param token JWT token
   * @returns Milisegundos hasta expiración, o 0 si ya expiró
   */
  getTokenTimeToExpire(token: string): number {
    const payload = this.decodeToken(token);
    
    if (!payload || !payload.exp) {
      return 0;
    }

    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    const timeToExpire = expirationDate.getTime() - now.getTime();

    return Math.max(0, timeToExpire);
  }
}