// src/app/core/services/user-search.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { UserSearchResult } from '@core/models/user.model';
import { ProjectMember } from '@core/models/member.model';

/**
 * Token de contexto HTTP para indicar al interceptor de loading
 * que esta request debe omitir el spinner global.
 * Uso: http.get(url, { context: new HttpContext().set(SKIP_LOADING, true) })
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Servicio para buscar usuarios del sistema.
 * Usado principalmente en el diálogo "Agregar Miembro".
 * Las requests usan SKIP_LOADING=true para no activar el spinner global.
 */
@Injectable({
  providedIn: 'root'
})
export class UserSearchService {
  private readonly http = inject(HttpClient);

  /**
   * Busca usuarios por username o email.
   * Requiere mínimo 2 caracteres.
   * Usa SKIP_LOADING para no activar el spinner global de la app.
   */
  search(query: string): Observable<UserSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params  = new HttpParams().set('q', query.trim());
    const context = new HttpContext().set(SKIP_LOADING, true);

    return this.http.get<UserSearchResult[]>(
      API_ENDPOINTS.USERS.SEARCH,
      { params, context }
    );
  }

  /**
   * Filtra resultados para excluir usuarios ya miembros del proyecto.
   */
  filterExistingMembers(
    results: UserSearchResult[],
    currentMembers: ProjectMember[]
  ): UserSearchResult[] {
    const memberIds = new Set(currentMembers.map(m => m.userId));
    return results.filter(r => !memberIds.has(r.id));
  }
}