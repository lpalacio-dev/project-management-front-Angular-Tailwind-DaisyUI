// src/app/core/services/user-search.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { UserSearchResult } from '@core/models/user.model';
import { ProjectMember } from '@core/models/member.model';

/**
 * Servicio para buscar usuarios del sistema.
 * Usado principalmente en el diálogo "Agregar Miembro".
 * Implementa debounce para evitar peticiones excesivas.
 */
@Injectable({
  providedIn: 'root'
})
export class UserSearchService {
  private readonly http = inject(HttpClient);

  /** Signal con resultados de búsqueda */
  readonly results = signal<UserSearchResult[]>([]);

  /** Signal de estado de carga de búsqueda */
  readonly searching = signal<boolean>(false);

  /** Signal de error de búsqueda */
  readonly searchError = signal<string | null>(null);

  /**
   * Busca usuarios por username o email.
   * Requiere mínimo 2 caracteres.
   * @param query Término de búsqueda
   */
  search(query: string): Observable<UserSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('q', query.trim());
    return this.http.get<UserSearchResult[]>(API_ENDPOINTS.USERS.SEARCH, { params });
  }

  /**
   * Filtra resultados para excluir usuarios ya miembros del proyecto.
   * @param results Lista de resultados de búsqueda
   * @param currentMembers Miembros actuales del proyecto
   */
  filterExistingMembers(
    results: UserSearchResult[],
    currentMembers: ProjectMember[]
  ): UserSearchResult[] {
    const memberIds = new Set(currentMembers.map(m => m.userId));
    return results.filter(r => !memberIds.has(r.id));
  }
}