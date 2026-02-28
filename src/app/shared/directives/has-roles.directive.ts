// src/app/shared/directives/has-role.directive.ts

import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthSignalsService } from '../../core/signals/auth-signals.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según roles
 * 
 * Uso:
 * <div *appHasRole="'Admin'">Solo Admin puede ver esto</div>
 * <div *appHasRole="['Admin', 'ProjectManager']">Admin o PM pueden ver</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly authSignals = inject(AuthSignalsService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  
  private requiredRoles: string[] = [];
  private hasView = false;

  constructor() {
    // Effect para reaccionar a cambios en el usuario
    effect(() => {
      // Forzar re-evaluación cuando cambie el usuario
      this.authSignals.currentUser();
      this.updateView();
    });
  }

  @Input()
  set appHasRole(roles: string | string[]) {
    // Normalizar a array
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  /**
   * Actualiza la vista según los permisos
   */
  private updateView(): void {
    const hasRole = this.authSignals.hasAnyRole(this.requiredRoles);

    if (hasRole && !this.hasView) {
      // Mostrar elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      // Ocultar elemento
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}