// src/app/features/members/components/member-card/member-card.component.ts

import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { ProjectMember, ProjectRole, ProjectRoleHelper } from '@core/models/member.model';
import { StringUtils } from '@core/utils/string.utils';
import { DateUtils } from '@core/utils/date.utils';

/**
 * Card individual de miembro del proyecto.
 * Muestra avatar con iniciales, nombre, badge de rol, fecha de ingreso
 * y un menú dropdown de acciones condicionado por permisos.
 */
@Component({
  selector: 'app-member-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4 p-4 rounded-xl bg-base-100 border border-base-200
                hover:border-primary/30 hover:shadow-md transition-all duration-200 group">

      <!-- Avatar con iniciales y color derivado del nombre -->
      <div
        class="avatar placeholder flex-shrink-0"
        [title]="member().userName"
      >
        <div
          class="rounded-full w-12 h-12 text-white font-bold text-base flex items-center justify-center select-none"
          [style.background-color]="avatarColor()"
        >
          {{ initials() }}
        </div>
      </div>

      <!-- Info del miembro -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-semibold text-base-content truncate">
            {{ member().userName }}
          </span>

          <!-- Badge de rol -->
          <span
            class="badge badge-sm font-medium gap-1"
            [class]="roleBadgeClass()"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                [attr.d]="roleIcon()" />
            </svg>
            {{ roleLabel() }}
          </span>
        </div>

        <!-- Email -->
        @if (member().email) {
          <p class="text-sm text-base-content/60 truncate mt-0.5">
            {{ member().email }}
          </p>
        }

        <!-- Fecha de ingreso -->
        <p class="text-xs text-base-content/40 mt-1">
          Miembro desde {{ joinedDateFormatted() }}
        </p>
      </div>

      <!-- Menú de acciones (solo si canManage o isCurrentUser para leave) -->
      @if (showActions()) {
        <div class="dropdown dropdown-end flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            tabindex="0"
            class="btn btn-ghost btn-sm btn-square"
            title="Acciones"
            aria-label="Opciones del miembro"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          <ul tabindex="0"
            class="dropdown-content z-[1] menu menu-sm shadow-lg bg-base-100 rounded-box w-48 border border-base-200 p-1">

            <!-- Cambiar rol: solo si canManage y el target no es Owner -->
            @if (canManage() && !isOwner()) {
              <li>
                <button
                  class="flex items-center gap-2 text-sm"
                  (click)="onChangeRole()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Cambiar rol
                </button>
              </li>
            }

            <!-- Remover: solo si canManage y el target no es Owner -->
            @if (canManage() && !isOwner()) {
              <li>
                <button
                  class="flex items-center gap-2 text-sm text-error hover:bg-error/10"
                  (click)="onRemove()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                  Remover del proyecto
                </button>
              </li>
            }

            <!-- Separador si hay ambos grupos -->
            @if (canManage() && !isOwner() && isCurrentUser()) {
              <li class="menu-title py-0">
                <hr class="border-base-200 my-1" />
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `
})
export class MemberCardComponent {
  // ── Inputs ──────────────────────────────────────────────
  readonly member     = input.required<ProjectMember>();
  readonly canManage  = input<boolean>(false);
  readonly isCurrentUser = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────
  readonly changeRole = output<ProjectMember>();
  readonly remove     = output<ProjectMember>();

  // ── Computed ─────────────────────────────────────────────
  protected readonly initials = computed(() =>
    StringUtils.getInitials(this.member().userName)
  );

  protected readonly avatarColor = computed(() =>
    StringUtils.stringToColor(this.member().userName)
  );

  protected readonly roleLabel = computed(() =>
    ProjectRoleHelper.getLabel(this.member().role)
  );

  protected readonly roleBadgeClass = computed(() =>
    'badge ' + ProjectRoleHelper.getBadgeClass(this.member().role)
  );

  protected readonly roleIcon = computed(() =>
    ProjectRoleHelper.getIcon(this.member().role)
  );

  protected readonly joinedDateFormatted = computed(() =>
    DateUtils.formatLong(this.member().joinedDate)
  );

  protected readonly isOwner = computed(() =>
    this.member().role === ProjectRole.Owner
  );

  /** Muestra el menú si puede gestionar (y target no es owner) o es el propio usuario */
  protected readonly showActions = computed(() =>
    (this.canManage() && !this.isOwner()) || this.isCurrentUser()
  );

  // ── Handlers ─────────────────────────────────────────────
  protected onChangeRole(): void {
    this.changeRole.emit(this.member());
  }

  protected onRemove(): void {
    this.remove.emit(this.member());
  }
}