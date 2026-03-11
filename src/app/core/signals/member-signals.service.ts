// src/app/core/signals/member-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MemberService } from '@core/services/member.service';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { NotificationService } from '@core/services/notification.service';
import {
  ProjectMember,
  ProjectRole,
  ProjectRoleHelper,
  AddMemberRequest,
  UpdateMemberRoleRequest
} from '@core/models/member.model';

/**
 * Servicio de state management para miembros de proyecto usando Signals.
 * Punto único de verdad para el estado de miembros en el proyecto activo.
 */
@Injectable({
  providedIn: 'root'
})
export class MemberSignalsService {
  private readonly memberService = inject(MemberService);
  private readonly authSignals = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // ==================== SIGNALS BASE ====================

  /** Lista de miembros del proyecto activo */
  readonly members = signal<ProjectMember[]>([]);

  /** ID del proyecto activo cargado */
  readonly currentProjectId = signal<string | null>(null);

  /** Estado de carga */
  readonly loading = signal<boolean>(false);

  /** Mensaje de error */
  readonly error = signal<string | null>(null);

  /** Término de búsqueda (client-side) */
  readonly searchTerm = signal<string>('');

  /** Filtro de rol activo */
  readonly roleFilter = signal<ProjectRole | 'all'>('all');

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Rol del usuario actual en el proyecto cargado.
   * Se determina buscando al usuario en la lista de miembros.
   */
  readonly currentUserRole = computed<ProjectRole | null>(() => {
    const currentUserId = this.authSignals.userId();
    if (!currentUserId) return null;

    const member = this.members().find(m => m.userId === currentUserId);
    return member?.role ?? null;
  });

  /**
   * Indica si el usuario actual puede gestionar miembros
   * (agregar, remover, cambiar roles): Owner o Admin de proyecto.
   */
  readonly canManageMembers = computed<boolean>(() => {
    const role = this.currentUserRole();
    if (!role) return this.authSignals.isAdmin(); // Admin global siempre puede
    return ProjectRoleHelper.canManageMembers(role) || this.authSignals.isAdmin();
  });

  /**
   * Indica si el usuario actual puede abandonar el proyecto.
   * Owner NO puede abandonar.
   */
  readonly canLeaveProject = computed<boolean>(() => {
    const role = this.currentUserRole();
    if (!role) return false;
    return ProjectRoleHelper.canLeaveProject(role);
  });

  /**
   * Indica si el usuario actual puede editar el proyecto.
   * Solo Owner o Admin global.
   */
  readonly canEditProject = computed<boolean>(() => {
    const role = this.currentUserRole();
    if (!role) return false;
    return ProjectRoleHelper.canEditProject(role) || this.authSignals.isAdmin();
  });

  /** Total de miembros */
  readonly memberCount = computed<number>(() => this.members().length);

  /** Miembros filtrados por búsqueda y rol */
  readonly filteredMembers = computed<ProjectMember[]>(() => {
    let result = this.memberService.sortMembers(this.members());

    const search = this.searchTerm().trim();
    if (search) {
      result = this.memberService.filterBySearch(result, search);
    }

    const role = this.roleFilter();
    if (role !== 'all') {
      result = this.memberService.filterByRole(result, role);
    }

    return result;
  });

  /** Estadísticas de miembros */
  readonly stats = computed(() => this.memberService.getStats(this.members()));

  /** Owner del proyecto */
  readonly owner = computed<ProjectMember | undefined>(() =>
    this.memberService.getOwner(this.members())
  );

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Carga los miembros de un proyecto.
   * Si ya están cargados para el mismo proyecto, no recarga.
   */
  async loadMembers(projectId: string, force = false): Promise<void> {
    if (!force && this.currentProjectId() === projectId && this.members().length > 0) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const members = await firstValueFrom(this.memberService.getByProject(projectId));
      this.members.set(members);
      this.currentProjectId.set(projectId);
    } catch (error: any) {
      const msg = error?.error?.Message || error?.error?.message || 'Error al cargar miembros';
      this.error.set(msg);
      console.error('Error loading members:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Agrega un nuevo miembro al proyecto.
   * Actualiza la lista local optimistamente tras éxito.
   */
  async addMember(projectId: string, data: AddMemberRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const newMember = await firstValueFrom(this.memberService.add(projectId, data));
      this.members.update(members => [...members, newMember]);
      this.notifications.success(`${newMember.userName} agregado al proyecto`);
    } catch (error: any) {
      const msg = error?.error?.Message || error?.error?.message || 'Error al agregar miembro';
      this.error.set(msg);
      this.notifications.error(msg);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza el rol de un miembro.
   * Actualiza el badge en la lista local tras éxito.
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.memberService.updateRole(projectId, userId, data));

      // Actualizar localmente
      this.members.update(members =>
        members.map(m =>
          m.userId === userId ? { ...m, role: data.role } : m
        )
      );

      this.notifications.success('Rol actualizado correctamente');
    } catch (error: any) {
      const msg = error?.error?.Message || error?.error?.message || 'Error al actualizar rol';
      this.error.set(msg);
      this.notifications.error(msg);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Remueve un miembro del proyecto.
   * Lo elimina de la lista local tras éxito.
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const member = this.members().find(m => m.userId === userId);

    try {
      await firstValueFrom(this.memberService.remove(projectId, userId));

      this.members.update(members => members.filter(m => m.userId !== userId));
      this.notifications.success(`${member?.userName ?? 'Miembro'} removido del proyecto`);
    } catch (error: any) {
      const msg = error?.error?.Message || error?.error?.message || 'Error al remover miembro';
      this.error.set(msg);
      this.notifications.error(msg);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * El usuario actual abandona el proyecto.
   */
  async leaveProject(projectId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.memberService.leave(projectId));
      this.notifications.success('Has abandonado el proyecto');
    } catch (error: any) {
      const msg = error?.error?.Message || error?.error?.message || 'Error al abandonar el proyecto';
      this.error.set(msg);
      this.notifications.error(msg);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualiza el término de búsqueda.
   */
  setSearch(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Actualiza el filtro de rol.
   */
  setRoleFilter(role: ProjectRole | 'all'): void {
    this.roleFilter.set(role);
  }

  /**
   * Limpia el estado al salir del proyecto.
   */
  clear(): void {
    this.members.set([]);
    this.currentProjectId.set(null);
    this.error.set(null);
    this.searchTerm.set('');
    this.roleFilter.set('all');
  }
}