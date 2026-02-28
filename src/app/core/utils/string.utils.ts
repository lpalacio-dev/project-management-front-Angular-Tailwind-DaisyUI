// src/app/core/utils/string.utils.ts

/**
 * Utilidades para trabajar con strings
 */
export class StringUtils {
  /**
   * Trunca un texto a un número máximo de caracteres
   * Agrega "..." al final si se truncó
   */
  static truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Convierte la primera letra a mayúscula
   */
  static capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convierte un texto a Title Case
   * Ejemplo: "hola mundo" -> "Hola Mundo"
   */
  static toTitleCase(text: string): string {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Genera iniciales desde un nombre
   * Ejemplo: "Juan Pérez" -> "JP"
   */
  static getInitials(name: string, maxLength: number = 2): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    const initials = words
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    return initials.substring(0, maxLength);
  }

  /**
   * Verifica si un string es un email válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Genera un slug desde un texto
   * Ejemplo: "Mi Proyecto Nuevo" -> "mi-proyecto-nuevo"
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Escapa caracteres HTML
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, char => map[char]);
  }

  /**
   * Resalta términos de búsqueda en un texto
   * Retorna HTML con <mark> tags
   */
  static highlightSearch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning text-warning-content">$1</mark>');
  }

  /**
   * Pluraliza una palabra según cantidad
   */
  static pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  /**
   * Genera un ID único simple
   */
  static generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Compara dos strings ignorando case
   */
  static equalsIgnoreCase(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
  }

  /**
   * Verifica si un string contiene otro (case insensitive)
   */
  static containsIgnoreCase(text: string, search: string): boolean {
    return text.toLowerCase().includes(search.toLowerCase());
  }

  /**
   * Obtiene un color hex desde un string (para avatars)
   */
  static stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return '#' + '000000'.substring(0, 6 - color.length) + color;
  }
}