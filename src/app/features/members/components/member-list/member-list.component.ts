// src/app/features/members/components/member-list/member-list.component.ts

import {
  Component, inject, input, signal, computed,
  OnInit, viewChild, ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { MemberSignalsService } from '@core/signals/member-signals.service';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { ProjectMember, ProjectRole, ProjectRoleHelper, AddMemberRequest } from '@core/models/member.model';
import { MemberCardComponent } from '../member-card/member-card.component';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { ChangeRoleDialogComponent } from '../change-role-dialog/change-role-dialog.component';
import { RemoveMemberDialogComponent } from '../remove-member-dialog/remove-member-dialog.component';

/**
 * Componente orquestador del tab de miembros.
 * Maneja: carga, búsqueda, filtros y apertura de diálogos.
 * Se integra dentro de project-tabs.component.
 */
@Component({
  selector: 'app-member-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MemberCardComponent,
    AddMemberDialogComponent,
    ChangeRoleDialogComponent,
    RemoveMemberDialogComponent
  ],
  template: `
    <div class="space-y-5">

      <!-- ── Toolbar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

        <!-- Título + contadores -->
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-base-content">Equipo</h2>
          <div class="flex items-center gap-1.5">
            <span class="badge badge-primary badge-sm font-semibold">
              {{ memberSignals.memberCount() }}
            </span>
            @if (memberSignals.stats().admins > 0) {
              <span class="badge badge-secondary badge-sm">
                {{ memberSignals.stats().admins }} admin{{ memberSignals.stats().admins > 1 ? 's' : '' }}
              </span>
            }
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Búsqueda -->
          <div class="relative flex-1 sm:flex-none">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar miembro..."
              class="input input-bordered input-sm pl-9 w-full sm:w-48"
              [value]="memberSignals.searchTerm()"
              (input)="onSearchChange($event)"
            />
          </div>

          <!-- Filtro por rol -->
          <select
            class="select select-bordered select-sm w-auto"
            [value]="memberSignals.roleFilter()"
            (change)="onRoleFilterChange($event)"
          >
            <option value="all">Todos los roles</option>
            @for (opt of roleFilterOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>

          <!-- Botón agregar (solo si canManage) -->
          @if (memberSignals.canManageMembers()) {
            <button
              class="btn btn-primary btn-sm gap-2 flex-shrink-0"
              (click)="onOpenAddDialog()"
              [disabled]="memberSignals.loading()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span class="hidden sm:inline">Agregar</span>
            </button>
          }
        </div>
      </div>

      <!-- ── Loading skeleton ──────────────────────────────── -->
      @if (memberSignals.loading() && memberSignals.members().length === 0) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="flex items-center gap-4 p-4 rounded-xl bg-base-200 animate-pulse">
              <div class="w-12 h-12 rounded-full bg-base-300 flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-base-300 rounded w-1/3"></div>
                <div class="h-3 bg-base-300 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Error ─────────────────────────────────────────── -->
      @if (memberSignals.error() && !memberSignals.loading()) {
        <div class="alert alert-error">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ memberSignals.error() }}</span>
          <button class="btn btn-sm btn-ghost" (click)="reloadMembers()">Reintentar</button>
        </div>
      }

      <!-- ── Lista de miembros ──────────────────────────────── -->
      @if (!memberSignals.loading() || memberSignals.members().length > 0) {
        @if (memberSignals.filteredMembers().length > 0) {
          <div class="space-y-2">
            @for (member of memberSignals.filteredMembers(); track member.userId) {
              <app-member-card
                [member]="member"
                [canManage]="memberSignals.canManageMembers()"
                [isCurrentUser]="isCurrentUser(member)"
                (changeRole)="onOpenChangeRoleDialog($event)"
                (remove)="onOpenRemoveDialog($event)"
              />
            }
          </div>

          <!-- Contador de resultados filtrados -->
          @if (memberSignals.searchTerm() || memberSignals.roleFilter() !== 'all') {
            <p class="text-xs text-center text-base-content/40 pt-2">
              Mostrando {{ memberSignals.filteredMembers().length }}
              de {{ memberSignals.memberCount() }} miembros
            </p>
          }
        } @else if (memberSignals.members().length === 0 && !memberSignals.loading()) {
          <!-- Empty state: solo está el owner -->
          <div class="flex flex-col items-center py-16 text-center">
            <div class="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-base-content/70 mb-1">Solo tú eres miembro</h3>
            <p class="text-sm text-base-content/40 mb-4">
              Agrega colaboradores para trabajar juntos en este proyecto.
            </p>
            @if (memberSignals.canManageMembers()) {
              <button class="btn btn-primary btn-sm gap-2" (click)="onOpenAddDialog()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Agregar primer miembro
              </button>
            }
          </div>
        } @else {
          <!-- Empty state: sin resultados de búsqueda -->
          <div class="flex flex-col items-center py-12 text-center">
            <svg class="w-10 h-10 text-base-content/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-sm text-base-content/50">
              No se encontraron miembros con los filtros aplicados
            </p>
            <button
              class="btn btn-ghost btn-xs mt-2"
              (click)="clearFilters()"
            >
              Limpiar filtros
            </button>
          </div>
        }
      }

      <!-- ── Botón abandonar proyecto ──────────────────────── -->
      @if (memberSignals.canLeaveProject()) {
        <div class="border-t border-base-200 pt-4 mt-2">
          <button
            class="btn btn-ghost btn-sm text-error gap-2 hover:bg-error/10"
            (click)="onOpenLeaveDialog()"
            [disabled]="memberSignals.loading()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Abandonar proyecto
          </button>
        </div>
      }
    </div>

    <!-- ── Dialogs ────────────────────────────────────────── -->
    <app-add-member-dialog
      [currentMembers]="memberSignals.members()"
      [loading]="memberSignals.loading()"
      (memberAdded)="onAddMember($event)"
      (cancelled)="onDialogCancelled()"
    />

    <app-change-role-dialog
      [loading]="memberSignals.loading()"
      (roleChanged)="onRoleChanged($event)"
      (cancelled)="onDialogCancelled()"
    />

    <app-remove-member-dialog
      [mode]="removeDialogMode()"
      [member]="memberToRemove()"
      [loading]="memberSignals.loading()"
      (confirmed)="onRemoveConfirmed()"
      (cancelled)="onDialogCancelled()"
    />
  `
})
export class MemberListComponent implements OnInit {
  protected readonly memberSignals = inject(MemberSignalsService);
  private readonly authSignals     = inject(AuthSignalsService);
  private readonly router          = inject(Router);

  // ── Input ────────────────────────────────────────────────
  readonly projectId = input.required<string>();

  // ── ViewChild dialogs ────────────────────────────────────
  private readonly addDialog        = viewChild(AddMemberDialogComponent);
  private readonly changeRoleDialog = viewChild(ChangeRoleDialogComponent);
  private readonly removeDialog     = viewChild(RemoveMemberDialogComponent);

  // ── State local (contexto de diálogos) ──────────────────
  protected readonly memberToRemove    = signal<ProjectMember | null>(null);
  protected readonly removeDialogMode  = signal<'remove' | 'leave'>('remove');

  protected readonly roleFilterOptions = ProjectRoleHelper.getAllOptions();

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    this.memberSignals.loadMembers(this.projectId());
  }

  // ── Helpers ──────────────────────────────────────────────
  protected isCurrentUser(member: ProjectMember): boolean {
    return member.userId === this.authSignals.userId();
  }

  // ── Toolbar handlers ─────────────────────────────────────
  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.memberSignals.setSearch(value);
  }

  protected onRoleFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProjectRole | 'all';
    this.memberSignals.setRoleFilter(value);
  }

  protected clearFilters(): void {
    this.memberSignals.setSearch('');
    this.memberSignals.setRoleFilter('all');
  }

  protected reloadMembers(): void {
    this.memberSignals.loadMembers(this.projectId(), true);
  }

  // ── Dialog openers ────────────────────────────────────────
  protected onOpenAddDialog(): void {
    this.addDialog()?.openDialog();
  }

  protected onOpenChangeRoleDialog(member: ProjectMember): void {
    this.changeRoleDialog()?.openDialog(member);
  }

  protected onOpenRemoveDialog(member: ProjectMember): void {
    this.memberToRemove.set(member);
    this.removeDialogMode.set('remove');
    this.removeDialog()?.openDialog();
  }

  protected onOpenLeaveDialog(): void {
    this.memberToRemove.set(null);
    this.removeDialogMode.set('leave');
    this.removeDialog()?.openDialog();
  }

  protected onDialogCancelled(): void {
    this.memberToRemove.set(null);
  }

  // ── Operaciones ──────────────────────────────────────────
  protected async onAddMember(request: AddMemberRequest): Promise<void> {
    try {
      await this.memberSignals.addMember(this.projectId(), request);
      this.addDialog()?.afterSuccess();
    } catch {
      // Error ya notificado por el service
    }
  }

  protected async onRoleChanged(event: { member: ProjectMember; newRole: ProjectRole }): Promise<void> {
    try {
      await this.memberSignals.updateMemberRole(
        this.projectId(),
        event.member.userId,
        { role: event.newRole }
      );
      this.changeRoleDialog()?.closeDialog();
    } catch {
      // Error ya notificado por el service
    }
  }

  protected async onRemoveConfirmed(): Promise<void> {
    const mode = this.removeDialogMode();

    try {
      if (mode === 'leave') {
        await this.memberSignals.leaveProject(this.projectId());
        this.removeDialog()?.closeDialog();
        this.router.navigate(['/projects']);
      } else {
        const member = this.memberToRemove();
        if (!member) return;
        await this.memberSignals.removeMember(this.projectId(), member.userId);
        this.memberToRemove.set(null);
        this.removeDialog()?.closeDialog();
      }
    } catch {
      // Error ya notificado por el service
    }
  }
}