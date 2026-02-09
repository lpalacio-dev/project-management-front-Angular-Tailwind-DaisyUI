// src/app/core/services/navigation.service.ts

import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Servicio helper para navegación
 * Centraliza operaciones comunes de navegación
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * Navega a una ruta específica
   * @param path Ruta a la que navegar
   * @param extras Opciones adicionales de navegación
   */
  async navigateTo(path: string | string[], extras?: NavigationExtras): Promise<boolean> {
    const commands = Array.isArray(path) ? path : [path];
    return this.router.navigate(commands, extras);
  }

  /**
   * Navega al dashboard
   */
  async goToDashboard(): Promise<boolean> {
    return this.router.navigate(['/dashboard']);
  }

  /**
   * Navega al login con returnUrl opcional
   * @param returnUrl URL a la que regresar después del login
   */
  async goToLogin(returnUrl?: string): Promise<boolean> {
    const extras: NavigationExtras = returnUrl 
      ? { queryParams: { returnUrl } }
      : {};
    
    return this.router.navigate(['/auth/login'], extras);
  }

  /**
   * Navega al registro
   */
  async goToRegister(): Promise<boolean> {
    return this.router.navigate(['/auth/register']);
  }

  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Avanza a la siguiente página en el historial
   */
  goForward(): void {
    this.location.forward();
  }

  /**
   * Obtiene la URL actual
   */
  getCurrentUrl(): string {
    return this.router.url;
  }

  /**
   * Navega a la URL guardada en returnUrl (query param)
   * Si no existe, navega al dashboard
   */
  async navigateToReturnUrl(defaultPath: string = '/dashboard'): Promise<boolean> {
    const returnUrl = this.getReturnUrl();
    return this.router.navigateByUrl(returnUrl || defaultPath);
  }

  /**
   * Obtiene el returnUrl de los query params
   */
  private getReturnUrl(): string | null {
    const urlTree = this.router.parseUrl(this.router.url);
    return urlTree.queryParams['returnUrl'] || null;
  }

  /**
   * Reemplaza la URL actual sin agregar al historial
   * Útil para redirecciones
   */
  async replaceUrl(path: string | string[], extras?: NavigationExtras): Promise<boolean> {
    const commands = Array.isArray(path) ? path : [path];
    return this.router.navigate(commands, { 
      ...extras, 
      replaceUrl: true 
    });
  }

  /**
   * Verifica si una ruta está activa
   */
  isRouteActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}