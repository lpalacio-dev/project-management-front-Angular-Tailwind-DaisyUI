// src/app/core/models/member.model.ts

/**
 * Modelo de Miembro de Proyecto
 * Coincide con ProjectMemberDto del backend
 */
export interface ProjectMember {
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  email?: string;
  role: ProjectRole;
  joinedDate: Date;
}

/**
 * Roles en un proyecto
 * Coincide con los roles del backend (ProjectMember.Role)
 */
export enum ProjectRole {
  Owner = 'Owner',
  Admin = 'Admin',
  Member = 'Member'
}

/**
 * Request para agregar un miembro
 * Coincide con AddProjectMemberDto del backend
 */
export interface AddMemberRequest {
  userId: string;
  role: ProjectRole;
}

/**
 * Request para actualizar el rol de un miembro
 * Coincide con UpdateProjectMemberRoleDto del backend
 */
export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

/**
 * Resultado simplificado para búsqueda de usuarios
 * (para agregar como miembros)
 */
export interface MemberCandidate {
  userId: string;
  userName: string;
  email: string;
  isAlreadyMember: boolean;
}

/**
 * Helper class para trabajar con roles de proyecto
 */
export class ProjectRoleHelper {
  /**
   * Obtiene el label en español
   */
  static getLabel(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.Owner:
        return 'Propietario';
      case ProjectRole.Admin:
        return 'Administrador';
      case ProjectRole.Member:
        return 'Miembro';
    }
  }

  /**
   * Obtiene la clase CSS de badge
   */
  static getBadgeClass(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.Owner:
        return 'badge-primary';
      case ProjectRole.Admin:
        return 'badge-secondary';
      case ProjectRole.Member:
        return 'badge-accent';
    }
  }

  /**
   * Obtiene el icono SVG path
   */
  static getIcon(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.Owner:
        return 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'; // Estrella
      case ProjectRole.Admin:
        return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'; // Shield
      case ProjectRole.Member:
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'; // Usuario
    }
  }

  /**
   * Obtiene las opciones disponibles (sin Owner para select)
   */
  static getSelectableOptions(): Array<{ value: ProjectRole; label: string }> {
    return [
      { value: ProjectRole.Admin, label: this.getLabel(ProjectRole.Admin) },
      { value: ProjectRole.Member, label: this.getLabel(ProjectRole.Member) }
    ];
  }

  /**
   * Obtiene todas las opciones (incluyendo Owner)
   */
  static getAllOptions(): Array<{ value: ProjectRole; label: string }> {
    return [
      { value: ProjectRole.Owner, label: this.getLabel(ProjectRole.Owner) },
      { value: ProjectRole.Admin, label: this.getLabel(ProjectRole.Admin) },
      { value: ProjectRole.Member, label: this.getLabel(ProjectRole.Member) }
    ];
  }

  /**
   * Verifica si el rol puede gestionar miembros
   */
  static canManageMembers(role: ProjectRole): boolean {
    return role === ProjectRole.Owner || role === ProjectRole.Admin;
  }

  /**
   * Verifica si el rol puede editar el proyecto
   */
  static canEditProject(role: ProjectRole): boolean {
    return role === ProjectRole.Owner;
  }

  /**
   * Verifica si el rol puede gestionar tareas
   */
  static canManageTasks(role: ProjectRole): boolean {
    return true; // Todos los roles pueden gestionar tareas
  }

  /**
   * Verifica si el rol puede abandonar el proyecto
   */
  static canLeaveProject(role: ProjectRole): boolean {
    return role !== ProjectRole.Owner; // Owner no puede abandonar
  }

  /**
   * Obtiene el nivel jerárquico del rol (para ordenar)
   */
  static getHierarchyLevel(role: ProjectRole): number {
    switch (role) {
      case ProjectRole.Owner:
        return 3;
      case ProjectRole.Admin:
        return 2;
      case ProjectRole.Member:
        return 1;
    }
  }
}