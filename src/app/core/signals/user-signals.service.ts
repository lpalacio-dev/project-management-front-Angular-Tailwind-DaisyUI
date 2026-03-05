// src/app/core/signals/user-signals.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthSignalsService } from '@core/signals/auth-signals.service';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@core/models/user.model';
import { StringUtils } from '@core/utils/string.utils';

@Injectable({ providedIn: 'root' })
export class UserSignalsService {
  private readonly userService   = inject(UserService);
  private readonly authSignals   = inject(AuthSignalsService);
  private readonly notifications = inject(NotificationService);

  // ── Signals ──────────────────────────────────────────────
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────

  /** Initials para el avatar — funciona con o sin perfil cargado */
  readonly initials = computed(() =>
    StringUtils.getInitials(
      this.profile()?.userName ?? this.authSignals.username() ?? ''
    )
  );

  readonly avatarColor = computed(() =>
    StringUtils.stringToColor(
      this.profile()?.userName ?? this.authSignals.username() ?? ''
    )
  );

  readonly displayName = computed(() =>
    this.profile()?.userName ?? this.authSignals.username() ?? ''
  );

  readonly profileImageUrl = computed(() => this.profile()?.profileImageUrl);

  readonly isAdmin = computed(() =>
    this.profile()?.roles.includes('Admin') ?? this.authSignals.isAdmin()
  );

  // ── Métodos ──────────────────────────────────────────────

  async loadProfile(): Promise<void> {
    if (this.profile()) return; // ya cargado — no hacer request innecesario
    await this._fetchProfile();
  }

  async reloadProfile(): Promise<void> {
    this.profile.set(null);
    await this._fetchProfile();
  }

  /**
   * PUT 204 — reconstruye el perfil localmente con spread.
   * Solo actualiza los campos enviados, preserva el resto del objeto.
   */
  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.userService.updateProfile(data));
      this.profile.update(p => p ? { ...p, ...data } : p);
      this.notifications.success('Perfil actualizado');
    } catch (err: any) {
      const msg = err?.error?.Message || 'Error al actualizar perfil';
      this.error.set(msg);
      this.notifications.error(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cambia la contraseña.
   * Re-lanza el error original para que el dialog lo muestre
   * de forma inline en el campo "Contraseña actual".
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.userService.changePassword(data));
      this.notifications.success('Contraseña actualizada');
    } catch (err: any) {
      // No ponemos toast aquí — el dialog lo mostrará inline
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async uploadProfileImage(file: File): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.userService.uploadProfileImage(file));
      this.profile.update(p => p ? { ...p, profileImageUrl: res.imageUrl } : p);
      this.notifications.success('Foto de perfil actualizada');
    } catch (err: any) {
      this.notifications.error(err?.error?.Message || 'Error al subir imagen');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteProfileImage(): Promise<void> {
    this.loading.set(true);
    try {
      await firstValueFrom(this.userService.deleteProfileImage());
      this.profile.update(p => p ? { ...p, profileImageUrl: undefined } : p);
      this.notifications.success('Foto de perfil eliminada');
    } catch {
      this.notifications.error('Error al eliminar imagen');
    } finally {
      this.loading.set(false);
    }
  }

  clear(): void {
    this.profile.set(null);
    this.error.set(null);
  }

  // ── Privados ─────────────────────────────────────────────

  private async _fetchProfile(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const p = await firstValueFrom(this.userService.getProfile());
      this.profile.set(p);
    } catch (err: any) {
      this.error.set(err?.error?.Message || 'Error al cargar perfil');
    } finally {
      this.loading.set(false);
    }
  }
}