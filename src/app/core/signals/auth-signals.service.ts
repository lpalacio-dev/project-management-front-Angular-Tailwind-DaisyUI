// src/app/core/signals/auth-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService, STORAGE_KEYS } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';
import { LoginRequest, RegisterRequest, LoginOptions } from '../models/auth.model';
import { User, UserRole } from '../models/user.model';

/**
 * Servicio de state management para autenticación usando Signals
 * Punto único de verdad para el estado de auth en toda la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class AuthSignalsService {
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  // ==================== SIGNALS BASE ====================

  /**
   * Usuario actualmente autenticado
   */
  readonly currentUser = signal<User | null>(null);

  /**
   * Token JWT actual
   */
  readonly token = signal<string | null>(null);

  /**
   * Estado de carga para operaciones async
   */
  readonly loading = signal<boolean>(false);

  /**
   * Mensaje de error actual
   */
  readonly error = signal<string | null>(null);

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Indica si hay un usuario autenticado
   */
  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    const tkn = this.token();
    return user !== null && tkn !== null;
  });

  /**
   * Indica si el usuario actual es Admin
   */
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.roles?.includes(UserRole.Admin) ?? false;
  });

  /**
   * Indica si el usuario actual tiene rol User
   */
  readonly isUser = computed(() => {
    const user = this.currentUser();
    return user?.roles?.includes(UserRole.User) ?? false;
  });

  /**
   * Obtiene los roles del usuario actual
   */
  readonly userRoles = computed(() => {
    return this.currentUser()?.roles ?? [];
  });

  /**
   * Obtiene el username del usuario actual
   */
  readonly username = computed(() => {
    return this.currentUser()?.username ?? null;
  });

  /**
   * Obtiene el ID del usuario actual
   */
  readonly userId = computed(() => {
    return this.currentUser()?.id ?? null;
  });

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Inicializa el servicio al arrancar la app
   * Intenta auto-login si hay token guardado
   */
  initialize(): void {
    const storedToken = this.authService.getStoredToken();

    if (!storedToken) {
      // No hay token guardado, estado limpio
      this.clearAuth();
      return;
    }

    // Verificar si el token está expirado
    if (this.authService.isTokenExpired(storedToken)) {
      // Token expirado, limpiar todo
      this.clearAuth();
      this.notifications.info('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Token válido, restaurar sesión
    try {
      this.token.set(storedToken);
      const user = this.buildUserFromToken(storedToken);
      this.currentUser.set(user);
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      this.clearAuth();
    }
  }

  /**
   * Realiza login de usuario
   * @param credentials Username y password
   * @param options Opciones de login (remember me, etc)
   */
  async login(credentials: LoginRequest, options?: LoginOptions): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Llamar al backend
      const response = await firstValueFrom(this.authService.login(credentials));

      // Guardar token
      this.token.set(response.token);
      this.storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);

      // Construir y guardar usuario
      const user: User = {
        id: response.userId,
        username: response.username,
        roles: response.roles,
        registrationDate: new Date() // El backend no lo retorna en login
      };

      this.currentUser.set(user);
      this.storage.setItem(STORAGE_KEYS.CURRENT_USER, user);

      // Guardar preferencia de "recordarme"
      if (options?.rememberMe) {
        this.storage.setItem(STORAGE_KEYS.REMEMBER_ME, true);
      }

      // Notificar éxito
      this.notifications.success(`¡Bienvenido, ${user.username}!`);

    } catch (error: any) {
      // El error será manejado por el error interceptor
      // Aquí solo actualizamos el estado local
      const errorMessage = error?.error?.message || 'Credenciales incorrectas';
      this.error.set(errorMessage);
      throw error; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Registra un nuevo usuario
   * @param data Datos de registro
   */
  async register(data: RegisterRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Llamar al backend
      await firstValueFrom(this.authService.register(data));

      // El registro NO hace login automático
      // El usuario debe hacer login después de registrarse
      this.notifications.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');

    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al crear la cuenta';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    this.clearAuth();
    this.notifications.info('Sesión cerrada correctamente');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   * @returns true si el usuario tiene el rol
   */
  hasRole(role: string): boolean {
    return this.currentUser()?.roles?.includes(role) ?? false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si el usuario tiene al menos uno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.currentUser()?.roles ?? [];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si el usuario tiene todos los roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.currentUser()?.roles ?? [];
    return roles.every(role => userRoles.includes(role));
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Limpia todo el estado de autenticación
   */
  private clearAuth(): void {
    this.currentUser.set(null);
    this.token.set(null);
    this.error.set(null);
    this.storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.storage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.storage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  /**
   * Construye un objeto User a partir de un token JWT
   * @param token Token JWT
   * @returns Objeto User
   */
  private buildUserFromToken(token: string): User {
    const userId = this.authService.getUserIdFromToken(token);
    const username = this.authService.getUsernameFromToken(token);
    const roles = this.authService.getRolesFromToken(token);

    if (!userId || !username) {
      throw new Error('Token inválido: falta información del usuario');
    }

    return {
      id: userId,
      username: username,
      roles: roles,
      registrationDate: new Date()
    };
  }
}