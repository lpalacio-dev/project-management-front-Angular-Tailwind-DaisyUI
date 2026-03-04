import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthSignalsService } from './core/signals/auth-signals.service';
import { LoadingService } from './core/services/loading.service';
import { TopLoadingBarComponent } from '@shared/components/top-loading-bar/top-loading-bar.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    TopLoadingBarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit  {
  private readonly authSignals = inject(AuthSignalsService);
  
  // Exponer loadingService al template
  protected readonly loadingService = inject(LoadingService);

  /**
   * Inicialización de la app
   * Intenta auto-login si hay token guardado
   */
  ngOnInit(): void {
    this.authSignals.initialize();
  }
}
