// src/app/core/models/user.model.ts

/**
 * Modelo de usuario autenticado
 * Representa al usuario actual en el sistema
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  registrationDate: Date;
}

/**
 * Perfil completo de usuario
 * Coincide con UserProfileDto del backend
 */
export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  registrationDate: Date;
  roles: string[];
  profileImageUrl?: string;
  // Estadísticas
  ownedProjectsCount: number;
  memberProjectsCount: number;
  assignedTasksCount: number;
}

/**
 * Resultado de búsqueda de usuarios
 * Coincide con UserSearchResultDto del backend
 */
export interface UserSearchResult {
  id: string;
  userName: string;
  email: string;
}

/**
 * DTO de usuario básico
 * Coincide con UserDto del backend
 */
export interface UserDto {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  registrationDate: Date;
}

/**
 * Request para actualizar perfil
 * Coincide con UpdateUserProfileDto del backend
 */
export interface UpdateProfileRequest {
  phoneNumber?: string;
}

/**
 * Request para cambiar contraseña
 * Coincide con ChangePasswordDto del backend
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Request para gestionar roles (Admin)
 * Coincide con ManageUserRolesDto del backend
 */
export interface ManageRolesRequest {
  roles: string[];
}

/**
 * Enum de roles del sistema
 * Coincide con los roles del backend
 */
export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

/**
 * Helper para verificar roles
 */
export class UserRoleHelper {
  static isAdmin(user: User | null): boolean {
    return user?.roles?.includes(UserRole.Admin) ?? false;
  }

  static isUser(user: User | null): boolean {
    return user?.roles?.includes(UserRole.User) ?? false;
  }

  static hasRole(user: User | null, role: string): boolean {
    return user?.roles?.includes(role) ?? false;
  }

  static hasAnyRole(user: User | null, roles: string[]): boolean {
    return roles.some(role => user?.roles?.includes(role)) ?? false;
  }
}