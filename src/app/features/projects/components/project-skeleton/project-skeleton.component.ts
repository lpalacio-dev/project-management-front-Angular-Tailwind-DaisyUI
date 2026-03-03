// src/app/features/projects/components/project-skeleton/project-skeleton.component.ts

import { Component, input } from '@angular/core';

/**
 * Skeleton loader para proyectos
 * Muestra placeholders mientras cargan los datos
 */
@Component({
  selector: 'app-project-skeleton',
  standalone: true,
  template: `
    @if (view() === 'grid') {
      <!-- Grid skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (item of skeletonArray; track $index) {
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body animate-pulse">
              <!-- Title -->
              <div class="h-6 bg-base-300 rounded w-3/4 mb-4"></div>
              
              <!-- Badge -->
              <div class="h-6 bg-base-300 rounded w-20 mb-3"></div>
              
              <!-- Description lines -->
              <div class="space-y-2 mb-4">
                <div class="h-4 bg-base-300 rounded"></div>
                <div class="h-4 bg-base-300 rounded w-5/6"></div>
                <div class="h-4 bg-base-300 rounded w-4/6"></div>
              </div>
              
              <!-- Footer -->
              <div class="flex justify-between items-center pt-4 border-t border-base-300">
                <div class="flex gap-4">
                  <div class="h-4 bg-base-300 rounded w-16"></div>
                  <div class="h-4 bg-base-300 rounded w-20"></div>
                </div>
                <div class="h-4 bg-base-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- List skeleton -->
      <div class="space-y-4">
        @for (item of skeletonArray; track $index) {
          <div class="card bg-base-100 shadow animate-pulse">
            <div class="card-body">
              <div class="flex items-center gap-4">
                <div class="flex-1 space-y-2">
                  <div class="h-6 bg-base-300 rounded w-1/3"></div>
                  <div class="h-4 bg-base-300 rounded w-2/3"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-8 bg-base-300 rounded w-24"></div>
                  <div class="h-8 bg-base-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProjectSkeletonComponent {
  readonly view = input<'grid' | 'list'>('grid');
  readonly count = input<number>(8);

  protected get skeletonArray(): number[] {
    return Array(this.count()).fill(0);
  }
}