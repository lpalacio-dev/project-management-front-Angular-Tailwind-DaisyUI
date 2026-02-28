// src/app/shared/components/profile-image-upload/profile-image-upload.component.ts

import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUtils } from '../../../core/utils/file.utils';
import { StringUtils } from '../../../core/utils/string.utils';

/**
 * Componente para subir y gestionar imagen de perfil
 * Soporta drag & drop y click para seleccionar
 */
@Component({
  selector: 'app-profile-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center gap-4">
      <!-- Avatar Preview -->
      <div class="relative group">
        <div class="avatar">
          <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            @if (currentImageUrl() || previewUrl()) {
              <img 
                [src]="previewUrl() || currentImageUrl()" 
                [alt]="userName() + ' avatar'"
                class="object-cover"
              />
            } @else {
              <!-- Avatar con iniciales -->
              <div 
                class="flex items-center justify-center w-full h-full text-4xl font-bold text-white"
                [style.background-color]="getColorFromName(userName())"
              >
                {{ getInitials(userName()) }}
              </div>
            }
          </div>
        </div>

        <!-- Overlay de hover -->
        <div 
          class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          (click)="fileInput.click()"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <!-- Loading overlay -->
        @if (uploading()) {
          <div class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        }
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2">
        <button 
          class="btn btn-primary btn-sm"
          (click)="fileInput.click()"
          [disabled]="uploading()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {{ currentImageUrl() ? 'Cambiar' : 'Subir' }}
        </button>

        @if (currentImageUrl() && !uploading()) {
          <button 
            class="btn btn-error btn-sm btn-outline"
            (click)="onDelete()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        }
      </div>

      <!-- Información y validaciones -->
      <div class="text-center text-sm text-base-content/70">
        <p>JPEG, PNG o GIF</p>
        <p>Máximo 5MB</p>
      </div>

      <!-- Input file oculto -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        class="hidden"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProfileImageUploadComponent {
  private readonly userService = inject(UserService);
  private readonly notifications = inject(NotificationService);

  // Inputs
  readonly currentImageUrl = input<string | null>(null);
  readonly userName = input.required<string>();

  // Outputs
  readonly imageUploaded = output<string>();
  readonly imageDeleted = output<void>();

  // State
  readonly uploading = signal(false);
  readonly previewUrl = signal<string | null>(null);

  /**
   * Maneja la selección de archivo
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar archivo
    const validation = await FileUtils.validateAndPrepareImage(file);
    
    if (!validation.valid) {
      this.notifications.error(validation.error!);
      input.value = ''; // Limpiar input
      return;
    }

    // Mostrar preview
    this.previewUrl.set(validation.preview!);

    // Subir archivo
    await this.uploadImage(file);

    // Limpiar input
    input.value = '';
  }

  /**
   * Sube la imagen al servidor
   */
  private async uploadImage(file: File): Promise<void> {
    this.uploading.set(true);

    try {
      const response = await this.userService.uploadProfileImage(file).toPromise();
      
      if (response?.imageUrl) {
        this.notifications.success('Imagen de perfil actualizada');
        this.imageUploaded.emit(response.imageUrl);
        this.previewUrl.set(null); // Limpiar preview
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMsg = error?.error?.message || error?.error?.Message || 'Error al subir la imagen';
      this.notifications.error(errorMsg);
      this.previewUrl.set(null); // Limpiar preview en caso de error
    } finally {
      this.uploading.set(false);
    }
  }

  /**
   * Elimina la imagen de perfil
   */
  async onDelete(): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar tu imagen de perfil?')) {
      return;
    }

    this.uploading.set(true);

    try {
      await this.userService.deleteProfileImage().toPromise();
      this.notifications.success('Imagen de perfil eliminada');
      this.imageDeleted.emit();
      this.previewUrl.set(null);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      const errorMsg = error?.error?.message || error?.error?.Message || 'Error al eliminar la imagen';
      this.notifications.error(errorMsg);
    } finally {
      this.uploading.set(false);
    }
  }

  /**
   * Obtiene las iniciales del nombre
   */
  protected getInitials(name: string): string {
    return StringUtils.getInitials(name, 2);
  }

  /**
   * Obtiene un color desde el nombre
   */
  protected getColorFromName(name: string): string {
    return StringUtils.stringToColor(name);
  }
}