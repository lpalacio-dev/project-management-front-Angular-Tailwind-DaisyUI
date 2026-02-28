// src/app/core/services/member.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { 
  ProjectMember, 
  AddMemberRequest, 
  UpdateMemberRoleRequest,
  ProjectRole 
} from '../models/member.model';

/**
 * Servicio HTTP para gestión de miembros de proyecto
 * Comunicación con el backend para operaciones de equipo
 */
@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene todos los miembros de un proyecto
   * Requiere ser miembro del proyecto
   * @param projectId ID del proyecto
   */
  getByProject(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(API_ENDPOINTS.MEMBERS.BY_PROJECT(projectId));
  }

  /**
   * Agrega un nuevo miembro al proyecto
   * Requiere ser Owner o Admin del proyecto
   * @param projectId ID del proyecto
   * @param data Datos del miembro a agregar
   */
  add(projectId: string, data: AddMemberRequest): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(API_ENDPOINTS.MEMBERS.ADD(projectId), data);
  }

  /**
   * Actualiza el rol de un miembro
   * Requiere ser Owner o Admin del proyecto
   * No se puede cambiar el rol del Owner
   * @param projectId ID del proyecto
   * @param userId ID del usuario
   * @param data Nuevo rol
   */
  updateRole(
    projectId: string, 
    userId: string, 
    data: UpdateMemberRoleRequest
  ): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.MEMBERS.UPDATE_ROLE(projectId, userId), data);
  }

  /**
   * Remueve un miembro del proyecto
   * Requiere ser Owner o Admin del proyecto
   * No se puede remover al Owner
   * @param projectId ID del proyecto
   * @param userId ID del usuario a remover
   */
  remove(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.MEMBERS.REMOVE(projectId, userId));
  }

  /**
   * El usuario actual abandona el proyecto
   * Solo para Admin o Member (Owner no puede abandonar)
   * @param projectId ID del proyecto
   */
  leave(projectId: string): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.MEMBERS.LEAVE(projectId), {});
  }

  /**
   * Busca miembros por nombre (client-side)
   */
  filterBySearch(members: ProjectMember[], searchTerm: string): ProjectMember[] {
    if (!searchTerm) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(m => 
      m.userName.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra miembros por rol (client-side)
   */
  filterByRole(members: ProjectMember[], role: ProjectRole | 'all'): ProjectMember[] {
    if (!role || role === 'all') return members;
    return members.filter(m => m.role === role);
  }

  /**
   * Ordena miembros (client-side)
   * Owner siempre primero, luego por jerarquía de rol o nombre
   */
  sortMembers(
    members: ProjectMember[], 
    sortBy: 'role' | 'name' | 'date' = 'role'
  ): ProjectMember[] {
    return [...members].sort((a, b) => {
      // Owner siempre primero
      if (a.role === ProjectRole.Owner) return -1;
      if (b.role === ProjectRole.Owner) return 1;
      
      switch (sortBy) {
        case 'role':
          const roleValues = { Admin: 2, Member: 1 };
          return (roleValues[b.role as 'Admin' | 'Member'] || 0) - 
                 (roleValues[a.role as 'Admin' | 'Member'] || 0);
        case 'name':
          return a.userName.localeCompare(b.userName);
        case 'date':
          return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
        default:
          return 0;
      }
    });
  }

  /**
   * Obtiene el Owner del proyecto (client-side)
   */
  getOwner(members: ProjectMember[]): ProjectMember | undefined {
    return members.find(m => m.role === ProjectRole.Owner);
  }

  /**
   * Obtiene estadísticas de miembros (client-side)
   */
  getStats(members: ProjectMember[]): {
    total: number;
    owners: number;
    admins: number;
    members: number;
  } {
    return {
      total: members.length,
      owners: members.filter(m => m.role === ProjectRole.Owner).length,
      admins: members.filter(m => m.role === ProjectRole.Admin).length,
      members: members.filter(m => m.role === ProjectRole.Member).length
    };
  }
}