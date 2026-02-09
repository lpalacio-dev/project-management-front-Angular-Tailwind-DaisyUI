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