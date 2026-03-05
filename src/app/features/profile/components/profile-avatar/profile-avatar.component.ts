// src/app/features/profile/components/profile-avatar/profile-avatar.component.ts

import {
  Component, inject, input, output, signal, computed,
  ChangeDetectionStrategy, ViewChild, ElementRef
} from '@angular/core';
import { UserProfile } from '@core/models/user.model';
import { UserSignalsService } from '@core/signals/user-signals.service';

/**
 * Avatar del perfil con soporte de upload de imagen.
 *
 * - Sin imagen: círculo con iniciales + color derivado del username
 * - Con imagen: foto de S3
 * - Hover: overlay semitransparente con "Cambiar foto" / "Eliminar"
 * - Upload: input[type=file] oculto, validación de tipo/tamaño en frontend
 */
@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-4">

      <!-- Círculo avatar con hover overlay -->
      <div
        class="relative group w-28 h-28 cursor-pointer"
        (click)="onAvatarClick()"
        [title]="profile()?.profileImageUrl ? 'Cambiar foto' : 'Subir foto'"
      >
        <!-- Imagen o iniciales -->
        @if (profile()?.profileImageUrl) {
          <img
            [src]="profile()!.profileImageUrl"
            [alt]="profile()!.userName"
            class="w-28 h-28 rounded-full object-cover ring-4 ring-base-200"
          />
        } @else {
          <div
            class="w-28 h-28 rounded-full flex items-center justify-center
                   text-white text-3xl font-bold ring-4 ring-base-200"
            [style.background-color]="userSignals.avatarColor()"
          >
            {{ userSignals.initials() }}
          </div>
        }

        <!-- Overlay en hover -->
        <div
          class="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center
                 justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          @if (uploading()) {
            <span class="loading loading-spinner loading-sm text-white"></span>
          } @else {
            <svg class="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-white text-xs font-medium">
              {{ profile()?.profileImageUrl ? 'Cambiar' : 'Subir foto' }}
            </span>
          }
        </div>
      </div>

      <!-- Input file oculto -->
      <input
        #fileInput
        type="file"
        class="hidden"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        (change)="onFileSelected($event)"
      />

      <!-- Error de validación local -->
      @if (fileError()) {
        <p class="text-error text-xs text-center max-w-[160px]">{{ fileError() }}</p>
      }

      <!-- Botón eliminar foto (solo si hay imagen) -->
      @if (profile()?.profileImageUrl && !uploading()) {
        <button
          class="btn btn-ghost btn-xs text-error gap-1"
          (click)="onDeleteImage()"
          [disabled]="userSignals.loading()"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar foto
        </button>
      }
    </div>
  `
})
export class ProfileAvatarComponent {
  protected readonly userSignals = inject(UserSignalsService);

  readonly profile = input<UserProfile | null>(null);

  protected readonly uploading  = signal(false);
  protected readonly fileError  = signal<string | null>(null);

  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  protected onAvatarClick(): void {
    this.fileError.set(null);
    this.fileInput.nativeElement.click();
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validación frontend
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError.set('Solo se permiten imágenes JPEG, PNG o GIF');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      this.fileError.set('La imagen no debe superar los 5 MB');
      return;
    }

    this.uploading.set(true);
    try {
      await this.userSignals.uploadProfileImage(file);
    } catch {
      // error ya notificado en el service
    } finally {
      this.uploading.set(false);
      // Limpiar el input para permitir re-selección del mismo archivo
      this.fileInput.nativeElement.value = '';
    }
  }

  protected async onDeleteImage(): Promise<void> {
    await this.userSignals.deleteProfileImage();
  }
}