// src/app/features/members/components/add-member-dialog/add-member-dialog.component.ts

import {
  Component, inject, input, output, signal, computed,
  OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { UserSearchService } from '@core/services/user-search.service';
import { ProjectMember, ProjectRole, ProjectRoleHelper, AddMemberRequest } from '@core/models/member.model';
import { UserSearchResult } from '@core/models/user.model';
import { StringUtils } from '@core/utils/string.utils';

/**
 * Dialog para agregar un nuevo miembro al proyecto.
 * - Búsqueda de usuarios con debounce 300ms
 * - Excluye automáticamente usuarios ya miembros
 * - Permite seleccionar rol (Admin / Member)
 */
@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog id="add-member-dialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-lg">

        <h3 class="font-bold text-xl mb-1">Agregar miembro</h3>
        <p class="text-sm text-base-content/60 mb-6">
          Busca un usuario y asígnale un rol en el proyecto.
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- ── Búsqueda de usuario ──────────────────── -->
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text font-medium">Buscar usuario</span>
              <span class="label-text-alt text-error">*</span>
            </label>

            <div class="relative">
              <!-- Ícono lupa -->
              <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                @if (searching()) {
                  <span class="loading loading-spinner loading-xs text-primary"></span>
                } @else {
                  <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              </div>

              <input
                type="text"
                formControlName="searchQuery"
                placeholder="Escribe username o email..."
                class="input input-bordered w-full pl-10"
                [class.input-error]="showSearchError()"
                autocomplete="off"
              />
            </div>

            <!-- Hint -->
            <label class="label py-1">
              <span class="label-text-alt text-base-content/40">Mínimo 2 caracteres</span>
            </label>
          </div>

          <!-- ── Resultados de búsqueda ──────────────── -->
          @if (searchResults().length > 0 && !selectedUser()) {
            <div class="border border-base-200 rounded-lg overflow-hidden mb-4 shadow-sm">
              @for (user of searchResults(); track user.id) {
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200
                         transition-colors text-left border-b border-base-200 last:border-0"
                  (click)="selectUser(user)"
                >
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    [style.background-color]="getAvatarColor(user.userName)"
                  >
                    {{ getInitials(user.userName) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-sm truncate">{{ user.userName }}</p>
                    <p class="text-xs text-base-content/50 truncate">{{ user.email }}</p>
                  </div>
                  <svg class="w-4 h-4 text-base-content/30 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }
            </div>
          }

          <!-- Sin resultados -->
          @if (showNoResults()) {
            <div class="flex items-center gap-2 text-sm text-base-content/50 px-1 mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No se encontraron usuarios con ese término
            </div>
          }

          <!-- ── Usuario seleccionado ────────────────── -->
          @if (selectedUser()) {
            <div class="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30 mb-4">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                [style.background-color]="getAvatarColor(selectedUser()!.userName)"
              >
                {{ getInitials(selectedUser()!.userName) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm">{{ selectedUser()!.userName }}</p>
                <p class="text-xs text-base-content/50">{{ selectedUser()!.email }}</p>
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square"
                title="Cambiar usuario"
                (click)="clearSelectedUser()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }

          <!-- ── Selección de rol ────────────────────── -->
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Rol en el proyecto</span>
            </label>

            <div class="grid grid-cols-2 gap-3">
              @for (option of roleOptions; track option.value) {
                <label
                  class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                  [class.border-primary]="form.get('role')?.value === option.value"
                  [class.bg-primary/5]="form.get('role')?.value === option.value"
                  [class.border-base-200]="form.get('role')?.value !== option.value"
                >
                  <input
                    type="radio"
                    name="role"
                    formControlName="role"
                    [value]="option.value"
                    class="radio radio-primary radio-sm"
                  />
                  <div>
                    <p class="font-medium text-sm">{{ option.label }}</p>
                    <p class="text-xs text-base-content/50">{{ option.description }}</p>
                  </div>
                </label>
              }
            </div>
          </div>

          <!-- Nota informativa -->
          <div class="alert alert-info py-2 px-3 text-sm mb-6">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tendrá acceso a todas las tareas. Podrás cambiar su rol después.</span>
          </div>

          <!-- ── Acciones ────────────────────────────── -->
          <div class="modal-action mt-0 gap-2">
            <button
              type="button"
              class="btn btn-ghost flex-1"
              (click)="onCancel()"
              [disabled]="loading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1 gap-2"
              [disabled]="!selectedUser() || form.invalid || loading()"
            >
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              Agregar miembro
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button (click)="onCancel()">close</button>
      </form>
    </dialog>
  `
})
export class AddMemberDialogComponent implements OnDestroy {
  private readonly fb             = inject(FormBuilder);
  private readonly userSearchSvc  = inject(UserSearchService);

  // ── Inputs ──────────────────────────────────────────────
  readonly currentMembers = input<ProjectMember[]>([]);
  readonly loading        = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────
  readonly memberAdded = output<AddMemberRequest>();
  readonly cancelled   = output<void>();

  // ── State ────────────────────────────────────────────────
  protected readonly searchResults  = signal<UserSearchResult[]>([]);
  protected readonly selectedUser   = signal<UserSearchResult | null>(null);
  protected readonly searching      = signal<boolean>(false);
  protected readonly hasSearched    = signal<boolean>(false);

  protected readonly form: FormGroup = this.fb.group({
    searchQuery: [''],
    role: [ProjectRole.Member, Validators.required]
  });

  protected readonly roleOptions = [
    {
      value: ProjectRole.Member,
      label: ProjectRoleHelper.getLabel(ProjectRole.Member),
      description: 'Gestiona tareas'
    },
    {
      value: ProjectRole.Admin,
      label: ProjectRoleHelper.getLabel(ProjectRole.Admin),
      description: 'Gestiona miembros y tareas'
    }
  ];

  private searchSub: Subscription;

  constructor() {
    // Suscripción con debounce al campo de búsqueda
    this.searchSub = this.form.get('searchQuery')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query || query.trim().length < 2) {
          this.searching.set(false);
          this.hasSearched.set(false);
          this.searchResults.set([]);
          return of([]);
        }
        this.searching.set(true);
        return this.userSearchSvc.search(query).pipe(
          catchError(() => {
            this.searching.set(false);
            return of([]);
          })
        );
      })
    ).subscribe((results: UserSearchResult[]) => {
      this.searching.set(false);
      this.hasSearched.set(true);
      // Excluir usuarios ya miembros
      const filtered = this.userSearchSvc.filterExistingMembers(results, this.currentMembers());
      this.searchResults.set(filtered);
    });
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
  }

  // ── Computed ─────────────────────────────────────────────
  protected readonly showSearchError = computed(() =>
    this.form.get('searchQuery')?.touched && !this.selectedUser()
  );

  protected readonly showNoResults = computed(() =>
    this.hasSearched() &&
    !this.searching() &&
    this.searchResults().length === 0 &&
    !this.selectedUser() &&
    (this.form.get('searchQuery')?.value?.length ?? 0) >= 2
  );

  // ── Helpers ──────────────────────────────────────────────
  protected getInitials(name: string): string {
    return StringUtils.getInitials(name);
  }

  protected getAvatarColor(name: string): string {
    return StringUtils.stringToColor(name);
  }

  // ── Métodos públicos ─────────────────────────────────────
  openDialog(): void {
    this.resetState();
    const dialog = document.getElementById('add-member-dialog') as HTMLDialogElement;
    dialog?.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('add-member-dialog') as HTMLDialogElement;
    dialog?.close();
  }

  // ── Handlers ─────────────────────────────────────────────
  protected selectUser(user: UserSearchResult): void {
    this.selectedUser.set(user);
    this.searchResults.set([]);
    this.form.get('searchQuery')?.setValue(user.userName, { emitEvent: false });
  }

  protected clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.hasSearched.set(false);
    this.searchResults.set([]);
    this.form.get('searchQuery')?.setValue('');
  }

  protected onSubmit(): void {
    const user = this.selectedUser();
    if (!user || this.form.invalid) return;

    this.memberAdded.emit({
      userIdentifier: user.id,
      role: this.form.get('role')!.value as ProjectRole
    });
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.closeDialog();
  }

  /** Cierra y limpia el dialog tras agregar exitosamente */
  afterSuccess(): void {
    this.closeDialog();
    this.resetState();
  }

  private resetState(): void {
    this.selectedUser.set(null);
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.form.reset({ searchQuery: '', role: ProjectRole.Member });
  }
}