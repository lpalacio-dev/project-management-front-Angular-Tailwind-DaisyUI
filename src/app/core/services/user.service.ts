// src/app/core/services/user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import {
  UserProfile, UserSearchResult, UserDto,
  UpdateProfileRequest, ChangePasswordRequest, ManageRolesRequest
} from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  // ── Perfil propio ────────────────────────────────────────

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_ENDPOINTS.USERS.ME);
  }

  /**
   * FIX: PUT retorna 204 No Content — tipado como void.
   * El signals service reconstruye el objeto con spread localmente.
   */
  updateProfile(data: UpdateProfileRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  }

  uploadProfileImage(file: File): Observable<{ message: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; imageUrl: string }>(
      API_ENDPOINTS.USERS.UPLOAD_PROFILE_IMAGE, formData
    );
  }

  deleteProfileImage(): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.DELETE_PROFILE_IMAGE);
  }

  // ── Búsqueda / Admin ─────────────────────────────────────

  search(query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSearchResult[]>(API_ENDPOINTS.USERS.SEARCH, { params });
  }

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(API_ENDPOINTS.USERS.ALL);
  }

  getById(userId: string): Observable<UserDto> {
    return this.http.get<UserDto>(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  manageRoles(userId: string, data: ManageRolesRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.USERS.MANAGE_ROLES(userId), data);
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.DELETE(userId));
  }

  // ── Client-side helpers ──────────────────────────────────

  filterBySearch(users: UserDto[], term: string): UserDto[] {
    if (!term) return users;
    const t = term.toLowerCase();
    return users.filter(u =>
      u.userName.toLowerCase().includes(t) || u.email.toLowerCase().includes(t)
    );
  }

  filterByRole(users: UserDto[], role: 'all' | 'Admin' | 'User'): UserDto[] {
    if (role === 'all') return users;
    return users.filter(u => u.roles.includes(role));
  }

  isAdmin(user: UserDto | UserProfile): boolean {
    return user.roles.includes('Admin');
  }
}