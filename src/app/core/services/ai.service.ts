// src/app/core/services/ai.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { Project } from '@core/models/project.model';
import {
  GenerateProjectRequest,
  AiConfirmProjectRequest,
  AiGeneratedProject,
  AiGeneratedTask,
  AiRateLimitInfo,
} from '@core/models/ai.model';

/**
 * Resultado de generateProject.
 * Incluye la sugerencia y la info de rate limit extraída de los headers.
 */
export interface GenerateProjectResult {
  project: AiGeneratedProject;
  rateLimit: AiRateLimitInfo | null;
}

/**
 * Servicio HTTP para el módulo de IA.
 * Delgado por diseño: sin lógica de negocio ni estado.
 * El estado vive en AiSignalsService.
 *
 * Patrón idéntico a ProjectService y TaskService.
 */
@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);

  /**
   * Genera una sugerencia de proyecto a partir de una descripción en lenguaje natural.
   * NO persiste nada en la base de datos.
   *
   * Usa observe: 'response' para extraer los headers X-RateLimit-* que el
   * backend incluye en todas las respuestas del módulo de IA.
   */
  generateProject(req: GenerateProjectRequest): Observable<GenerateProjectResult> {
    return this.http
      .post<AiGeneratedProject>(
        API_ENDPOINTS.AI.GENERATE_PROJECT,
        req,
        { observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<AiGeneratedProject>) => ({
          project: response.body!,
          rateLimit: this.extractRateLimitHeaders(response),
        }))
      );
  }

  /**
   * Persiste el proyecto y las tareas confirmadas por el usuario.
   * El usuario actual se convierte en Owner automáticamente.
   * Retorna el ProjectDto completo del proyecto creado (HTTP 201).
   */
  confirmProject(req: AiConfirmProjectRequest): Observable<Project> {
    return this.http.post<Project>(API_ENDPOINTS.AI.CONFIRM_PROJECT, req);
  }

  /**
   * Sugiere tareas faltantes para un proyecto existente.
   * NO persiste nada — retorna una lista de sugerencias para que el usuario elija.
   * El campo `selected` se añade en AiSignalsService, no viene del backend.
   */
  suggestTasks(projectId: string): Observable<AiGeneratedTask[]> {
    return this.http.get<AiGeneratedTask[]>(
      API_ENDPOINTS.AI.SUGGEST_TASKS(projectId)
    );
  }

  // ─── Privados ───────────────────────────────────────────

  /**
   * Extrae los headers X-RateLimit-* de la respuesta HTTP.
   * Retorna null si los headers no están presentes (ej. en desarrollo sin el middleware).
   */
  private extractRateLimitHeaders(
    response: HttpResponse<unknown>
  ): AiRateLimitInfo | null {
    const limit     = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt   = response.headers.get('X-RateLimit-Reset');

    if (!limit || !remaining || !resetAt) return null;

    return {
      limit:     parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      resetAt,
    };
  }
}