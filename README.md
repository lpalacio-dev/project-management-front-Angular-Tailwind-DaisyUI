# 📊 Gestión de Proyectos — Frontend

Interfaz web para el sistema de gestión de proyectos y tareas. Construida con Angular 20 usando Signals, TailwindCSS y DaisyUI, desplegada en Amazon S3.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulo de IA](#-módulo-de-ia)
- [Configuración Local](#-configuración-local)
- [Despliegue en AWS](#-despliegue-en-aws)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Variables y Secrets](#-variables-y-secrets)
- [Convenciones](#-convenciones)
- [Roadmap](#-roadmap)

---

## 🎯 Descripción General

Frontend SPA (Single Page Application) que consume la REST API del backend de gestión de proyectos. Permite a los usuarios autenticarse, gestionar proyectos, colaborar en equipo con roles diferenciados, administrar tareas con prioridades y estados, y generar proyectos completos con tareas usando IA generativa.

**Backend relacionado:** [`gestion-de-proyectos-backend`](../gestion-de-proyectos-backend) · ASP.NET Core 8 · desplegado en AWS ECS Fargate.

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 20 | Framework principal |
| TypeScript | ~5.9 | Lenguaje de desarrollo |
| Angular Signals | (built-in) | Gestión de estado reactivo |
| TailwindCSS | ^4.1 | Estilos utilitarios |
| DaisyUI | ^5.5 | Componentes UI sobre Tailwind |
| RxJS | ~7.8 | Manejo de streams y HTTP |
| Vitest | ^4.0 | Testing unitario |
| Prettier | (config incluida) | Formateo de código |
| Amazon S3 | — | Hosting del build estático |
| GitHub Actions | — | CI/CD pipeline |

---

## 📁 Estructura del Proyecto

```
project-management-front/
├── .github/
│   └── workflows/
│       └── deploy-front-s3.yml
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── constants/
│   │   │   │   ├── api-endpoints.ts      # URLs de la API (incluye sección AI)
│   │   │   │   └── app-routes.constants.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── guest.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── ai.model.ts           # DTOs e interfaces del módulo de IA
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── member.model.ts
│   │   │   │   ├── project.model.ts
│   │   │   │   ├── task.model.ts
│   │   │   │   └── user.model.ts
│   │   │   ├── services/
│   │   │   │   ├── ai.service.ts         # HTTP delgado para /api/ai/*
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── loading.service.ts
│   │   │   │   ├── member.service.ts
│   │   │   │   ├── navigation.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── storage.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   ├── user-search.service.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── signals/
│   │   │   │   ├── ai-signals.service.ts # Estado reactivo del módulo de IA
│   │   │   │   ├── auth-signals.service.ts
│   │   │   │   ├── member-signals.service.ts
│   │   │   │   ├── project-signals.service.ts
│   │   │   │   ├── task-signals.service.ts
│   │   │   │   └── user-signals.service.ts
│   │   │   └── utils/
│   │   │       ├── date.utils.ts
│   │   │       ├── file.utils.ts
│   │   │       └── string.utils.ts
│   │   ├── features/
│   │   │   ├── ai/                       # Módulo de IA (nuevo)
│   │   │   │   ├── ai.routes.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── ai-loading-state/ # Spinner contextual para operaciones IA
│   │   │   │   │   ├── ai-result-preview/# Preview editable de sugerencia generada
│   │   │   │   │   └── suggest-tasks-dialog/ # Dialog para sugerir tareas en proyecto
│   │   │   │   └── pages/
│   │   │   │       └── ai-generate/      # Página principal (form → preview)
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── profile/
│   │   │   ├── projects/
│   │   │   └── tasks/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── layouts/
│   │   │   └── pages/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   └── styles.css
├── package.json
└── tailwind.config.js
```

---

## 🤖 Módulo de IA

El módulo de IA permite generar proyectos completos con tareas a partir de una descripción en lenguaje natural, y sugerir tareas faltantes para proyectos existentes.

### Flujos disponibles

**Flujo 1 — Crear proyecto con IA**

Accesible desde el botón "Crear con IA" en la barra de herramientas de la lista de proyectos, o navegando directamente a `/ai/generate`.

1. El usuario describe el proyecto en texto libre (20–2000 caracteres)
2. La IA genera una sugerencia: nombre, descripción, estado y lista de tareas ordenadas por dependencia lógica
3. El usuario revisa el preview, edita lo que quiera (nombre, descripción, estado, selección de tareas)
4. Al confirmar, el proyecto y las tareas seleccionadas se persisten y el usuario es redirigido al detalle

**Flujo 2 — Sugerir tareas para proyecto existente**

Accesible desde el botón "Sugerir con IA" en la barra de herramientas del tab de Tareas dentro de cualquier proyecto.

1. La IA analiza las tareas existentes para no duplicar
2. Sugiere tareas faltantes con prioridad y fecha estimada
3. El usuario selecciona cuáles agregar y se crean en el proyecto

### Arquitectura del módulo

```
features/ai/pages/ai-generate          ← Página principal (2 steps)
features/ai/components/
  ai-loading-state                     ← Spinner con mensaje contextual
  ai-result-preview                    ← Preview editable + checkboxes
  suggest-tasks-dialog                 ← Dialog DaisyUI nativo
        │
        ▼
core/signals/ai-signals.service.ts     ← Estado reactivo (signals)
        │
        ▼
core/services/ai.service.ts            ← HTTP delgado (Observable)
        │
        ▼
Backend /api/ai/*                      ← 3 endpoints REST
```

### Endpoints consumidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/ai/generate-project` | Genera sugerencia. No persiste. |
| `POST` | `/api/ai/confirm-project` | Persiste proyecto y tareas. |
| `GET`  | `/api/ai/suggest-tasks/:id` | Sugiere tareas para proyecto existente. |

### Manejo de errores específicos

| Código | Causa | Mensaje al usuario |
|--------|-------|--------------------|
| `429` | Rate limit superado (10 req/hora) | Aviso con minutos restantes |
| `503` | Todos los proveedores LLM caídos | "Servicio no disponible, intenta en unos minutos" |
| `502` | JSON inválido del LLM | "Respuesta inesperada, intenta de nuevo" |

### Archivos nuevos y modificados

| Archivo | Cambio |
|---------|--------|
| `core/models/ai.model.ts` | Nuevo — interfaces, enums y helpers |
| `core/services/ai.service.ts` | Nuevo — 3 métodos HTTP |
| `core/signals/ai-signals.service.ts` | Nuevo — estado reactivo |
| `core/constants/api-endpoints.ts` | +sección `AI` + constante `AI_HTTP_TIMEOUT` |
| `app.routes.ts` | +ruta lazy `ai/` |
| `features/ai/` | Nuevo — feature completo |
| `features/projects/components/project-list-toolbar/` | +botón "Crear con IA" |
| `features/tasks/components/task-list/` | +botón "Sugerir con IA" + `SuggestTasksDialogComponent` |

---

## 🔧 Configuración Local

### Pre-requisitos

- [Node.js 20+](https://nodejs.org/)
- [npm 10.9+](https://www.npmjs.com/)
- [Angular CLI 21](https://angular.dev/tools/cli)

```bash
npm install -g @angular/cli
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd project-management-front

# 2. Instalar dependencias
npm install

# 3. Configurar environments (ver sección siguiente)

# 4. Levantar servidor de desarrollo
npm start
```

La aplicación quedará disponible en `http://localhost:4200`.

### Environments

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  API_BASE_URL: 'http://localhost:5000'
};

// src/environments/environment.ts  (producción)
export const environment = {
  production: true,
  API_BASE_URL: 'https://tu-api.com'
};
```

### Comandos disponibles

```bash
npm start           # Servidor de desarrollo en localhost:4200
npm run build       # Build de producción (salida en dist/)
npm run watch       # Build en modo watch para desarrollo
npm test            # Tests con Vitest
```

---

## ☁️ Despliegue en AWS

El frontend se sirve como sitio web estático desde **Amazon S3**.

### Arquitectura

```
GitHub Actions
     │
     ▼
npm install + build
     │
     ▼
dist/project-management-front/browser/
     │
     ▼
aws s3 sync ──► S3 Bucket (gestion-proyectos-front)
                      │
                      ▼
               Sitio web estático
```

### Configuración del bucket S3

```bash
# Crear el bucket
aws s3 mb s3://gestion-proyectos-front --region us-east-2

# Habilitar hosting de sitio web estático
aws s3 website s3://gestion-proyectos-front \
  --index-document index.html \
  --error-document index.html

# Deshabilitar bloqueo de acceso público
aws s3api put-public-access-block \
  --bucket gestion-proyectos-front \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Aplicar política de lectura pública
aws s3api put-bucket-policy \
  --bucket gestion-proyectos-front \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gestion-proyectos-front/*"
    }]
  }'
```

> 💡 **Próximo paso recomendado:** agregar **CloudFront** como CDN delante del bucket para habilitar HTTPS, caché global y dominio personalizado.

---

## 🔄 CI/CD Pipeline

El pipeline está en `.github/workflows/deploy-front-s3.yml` y se activa automáticamente con cada push a `develop`.

### Ramas y ambientes

| Rama | Ambiente | Despliegue |
|---|---|---|
| `develop` | Desarrollo | Automático en cada push |
| `prod` | Producción | Manual (`workflow_dispatch`) |

### Flujo

```
push → develop  /  ejecución manual en prod
     │
     ▼
1. Checkout del código
2. Setup Node.js 20 (con caché de npm)
3. npm install
4. npm run build
5. Configurar credenciales AWS
6. aws s3 sync → S3 Bucket (--delete limpia archivos obsoletos)
```

### Secrets requeridos en GitHub

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key del usuario IAM de deploy |
| `AWS_SECRET_ACCESS_KEY` | Secret key del usuario IAM de deploy |

### Permisos IAM mínimos para el usuario de deploy

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::gestion-proyectos-front",
      "arn:aws:s3:::gestion-proyectos-front/*"
    ]
  }]
}
```

> Si se incorpora CloudFront, agregar `cloudfront:CreateInvalidation` para invalidar caché en cada deploy.

---

## 🔑 Variables y Secrets

| Variable | Archivo | Descripción |
|----------|---------|-------------|
| `API_BASE_URL` | `environment.*.ts` | URL base del backend (sin `/api`) |

No hay variables de entorno en el frontend relacionadas con la IA — las API keys de los LLM viven exclusivamente en el backend.

---

## 🎨 Convenciones

**Componentes**
- Standalone por defecto, sin NgModules
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- `input()` y `output()` en lugar de `@Input` / `@Output`
- Templates con control flow nativo: `@if`, `@for`, `@switch`
- `NOT` usar `standalone: true` en el decorador (es el default en Angular 20)

**Estado**
- `signal()` para estado local reactivo
- `computed()` para valores derivados
- `inject()` en lugar de inyección por constructor
- Servicios de signals (`*-signals.service.ts`) como única fuente de verdad
- Servicios HTTP (`*.service.ts`) delgados — sin lógica de negocio ni estado

**Formularios**
- `ReactiveFormsModule` para formularios complejos
- `FormsModule` solo para bindings simples (`[ngModel]`)
- `NOT` usar `ngClass` ni `ngStyle` — usar bindings de clase/estilo directos

**Dialogs**
- `<dialog>` nativo de DaisyUI con `showModal()` / `close()`
- Contrato estándar: `openDialog()` / `closeDialog()` / `afterSuccess()`
- El padre referencia el dialog con `viewChild` y llama a los métodos públicos

**Estilos**
- Clases Tailwind directamente en templates
- Componentes visuales con DaisyUI
- Sin archivos CSS por componente salvo `:host { display: block; }`

**Arquitectura**
- Lazy loading en todas las rutas de features
- Servicios con `providedIn: 'root'`
- Path aliases configurados: `@core`, `@features`, `@shared`

**Formateo** — Prettier con la configuración en `package.json`:

```bash
npx prettier --write .
```

---

## 🗺️ Roadmap

| Estado | Funcionalidad |
|--------|---------------|
| ✅ | Autenticación JWT (login / registro / auto-login) |
| ✅ | Dashboard principal con resumen de proyectos |
| ✅ | Gestión de proyectos (CRUD + estados + filtros) |
| ✅ | Gestión de miembros y roles por proyecto |
| ✅ | Gestión de tareas (CRUD + filtros + optimistic updates) |
| ✅ | Perfil de usuario con carga de foto (S3) |
| ⬜ | Panel de administración (solo Admin global) |
| ✅ | Módulo de IA — generación de proyectos con LLM |
| ✅ | Módulo de IA — sugerencia de tareas para proyectos existentes |
| ⬜ | Módulo de IA — resumen ejecutivo de proyecto |
| ⬜ | Módulo de IA — detección de riesgos |
| ⬜ | Módulo de IA — chat contextual del proyecto |
| ⬜ | Notificaciones en tiempo real (WebSockets) |
| ⬜ | CloudFront + dominio personalizado |

---

*Desarrollado con Angular 20 · TailwindCSS · DaisyUI · Desplegado en Amazon S3 · v1.1.0*