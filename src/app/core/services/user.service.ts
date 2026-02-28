// src/app/core/services/user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { 
  UserProfile, 
  UserSearchResult, 
  UserDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ManageRolesRequest
} from '../models/user.model';

/**
 * Servicio HTTP para gestión de usuarios
 * Comunicación con el backend para operaciones de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  // ==================== ENDPOINTS PÚBLICOS ====================

  /**
   * Busca usuarios por nombre o email
   * Útil para agregar miembros a proyectos
   * @param query Término de búsqueda (mínimo 2 caracteres)
   */
  search(query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSearchResult[]>(API_ENDPOINTS.USERS.SEARCH, { params });
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_ENDPOINTS.USERS.ME);
  }

  /**
   * Actualiza el perfil del usuario actual
   * @param data Datos a actualizar (ej: teléfono)
   */
  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  }

  /**
   * Cambia la contraseña del usuario actual
   * @param data Contraseña actual y nueva
   */
  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  }

  /**
   * Sube una imagen de perfil para el usuario actual
   * Acepta archivos JPEG, PNG, GIF (máximo 5MB)
   * @param file Archivo de imagen
   * @returns URL firmada de la imagen subida
   */
  uploadProfileImage(file: File): Observable<{ message: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ message: string; imageUrl: string }>(
      API_ENDPOINTS.USERS.UPLOAD_PROFILE_IMAGE, 
      formData
    );
  }

  /**
   * Elimina la imagen de perfil del usuario actual
   */
  deleteProfileImage(): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.DELETE_PROFILE_IMAGE);
  }

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Obtiene todos los usuarios del sistema
   * Solo para Admin
   */
  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(API_ENDPOINTS.USERS.ALL);
  }

  /**
   * Obtiene un usuario por ID
   * Solo para Admin
   * @param userId ID del usuario
   */
  getById(userId: string): Observable<UserDto> {
    return this.http.get<UserDto>(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  /**
   * Gestiona los roles de un usuario
   * Solo para Admin
   * @param userId ID del usuario
   * @param data Roles a asignar
   */
  manageRoles(userId: string, data: ManageRolesRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.USERS.MANAGE_ROLES(userId), data);
  }

  /**
   * Elimina un usuario del sistema
   * Solo para Admin
   * No puede eliminar usuarios que son Owners de proyectos
   * @param userId ID del usuario
   */
  delete(userId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.DELETE(userId));
  }

  // ==================== CLIENT-SIDE HELPERS ====================

  /**
   * Filtra usuarios por búsqueda (client-side)
   */
  filterBySearch(users: UserDto[], searchTerm: string): UserDto[] {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => 
      u.userName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra usuarios por rol (client-side)
   */
  filterByRole(users: UserDto[], role: 'all' | 'Admin' | 'User'): UserDto[] {
    if (role === 'all') return users;
    return users.filter(u => u.roles.includes(role));
  }

  /**
   * Ordena usuarios (client-side)
   */
  sortUsers(
    users: UserDto[], 
    sortBy: 'name' | 'email' | 'date',
    order: 'asc' | 'desc' = 'asc'
  ): UserDto[] {
    const sorted = [...users].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.userName.localeCompare(b.userName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'date':
          comparison = new Date(a.registrationDate).getTime() - 
                      new Date(b.registrationDate).getTime();
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

  /**
   * Verifica si un usuario es Admin (client-side)
   */
  isAdmin(user: UserDto | UserProfile): boolean {
    return user.roles.includes('Admin');
  }

  /**
   * Obtiene las estadísticas de usuarios (client-side)
   */
  getStats(users: UserDto[]): {
    total: number;
    admins: number;
    regularUsers: number;
  } {
    return {
      total: users.length,
      admins: users.filter(u => this.isAdmin(u)).length,
      regularUsers: users.filter(u => !this.isAdmin(u)).length
    };
  }
}