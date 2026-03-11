// src/app/core/models/user.model.ts

export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  registrationDate: Date;
}

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
  ownedProjectsCount: number;
  memberProjectsCount: number;
  assignedTasksCount: number;
}

export interface UserSearchResult {
  id: string;
  userName: string;
  email: string;
}

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  registrationDate: Date;
}

/**
 * FIX: Agregado email? — el backend UpdateUserProfileDto acepta email y phoneNumber
 */
export interface UpdateProfileRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;  // FIX: backend requiere confirmPassword también
}

export interface ManageRolesRequest {
  roles: string[];
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

export class UserRoleHelper {
  static isAdmin(user: User | null): boolean {
    return user?.roles?.includes(UserRole.Admin) ?? false;
  }
  static hasRole(user: User | null, role: string): boolean {
    return user?.roles?.includes(role) ?? false;
  }
}