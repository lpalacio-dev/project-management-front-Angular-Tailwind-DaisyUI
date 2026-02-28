// src/app/core/utils/file.utils.ts

/**
 * Utilidades para trabajar con archivos
 */
export class FileUtils {
  /**
   * Tipos MIME permitidos para imágenes de perfil
   */
  static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  /**
   * Extensiones permitidas para imágenes
   */
  static readonly ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

  /**
   * Tamaño máximo de imagen (5MB en bytes)
   */
  static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Valida si un archivo es una imagen permitida
   * @param file Archivo a validar
   * @returns true si es válido
   */
  static isValidImage(file: File): boolean {
    return this.isValidImageType(file) && this.isValidImageSize(file);
  }

  /**
   * Valida el tipo MIME del archivo
   */
  static isValidImageType(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
  }

  /**
   * Valida el tamaño del archivo
   */
  static isValidImageSize(file: File): boolean {
    return file.size <= this.MAX_IMAGE_SIZE;
  }

  /**
   * Obtiene el mensaje de error de validación
   */
  static getImageValidationError(file: File): string | null {
    if (!this.isValidImageType(file)) {
      return 'Solo se permiten archivos de imagen (JPEG, PNG, GIF)';
    }
    if (!this.isValidImageSize(file)) {
      return `La imagen no debe superar los ${this.formatFileSize(this.MAX_IMAGE_SIZE)}`;
    }
    return null;
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   * @param bytes Tamaño en bytes
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Lee un archivo como Data URL (base64)
   * Útil para preview de imágenes
   */
  static readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime una imagen (opcional, para optimización futura)
   * Por ahora solo valida, pero puede extenderse
   */
  static async validateAndPrepareImage(file: File): Promise<{
    valid: boolean;
    error?: string;
    preview?: string;
  }> {
    const error = this.getImageValidationError(file);
    
    if (error) {
      return { valid: false, error };
    }

    try {
      const preview = await this.readAsDataURL(file);
      return { valid: true, preview };
    } catch {
      return { valid: false, error: 'Error al leer la imagen' };
    }
  }

  /**
   * Extrae la extensión de un archivo
   */
  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Verifica si una extensión es válida para imágenes
   */
  static isValidImageExtension(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return this.ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  }

  /**
   * Genera un nombre de archivo único
   */
  static generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = this.getFileExtension(originalFilename);
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Crea un objeto File desde una URL de data
   */
  static dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Obtiene información básica de un archivo
   */
  static getFileInfo(file: File): {
    name: string;
    size: string;
    type: string;
    lastModified: Date;
  } {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified)
    };
  }
}