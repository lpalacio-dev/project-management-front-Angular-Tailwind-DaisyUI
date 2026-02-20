# 📊 Gestión de Proyectos — Frontend

Interfaz web para el sistema de gestión de proyectos y tareas. Construida con Angular 20 usando Signals, TailwindCSS y DaisyUI, desplegada en Amazon S3.

> 🚧 **Proyecto en desarrollo activo.** La funcionalidad base está implementada y el despliegue en AWS está operativo.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración Local](#-configuración-local)
- [Despliegue en AWS](#-despliegue-en-aws)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Variables y Secrets](#-variables-y-secrets)
- [Convenciones](#-convenciones)
- [Roadmap](#-roadmap)

---

## 🎯 Descripción General

Frontend SPA (Single Page Application) que consume la REST API del backend de gestión de proyectos. Permite a los usuarios autenticarse, gestionar proyectos, colaborar en equipo con roles diferenciados y administrar tareas con prioridades y estados.

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
│       └── deploy-front-s3.yml      # Pipeline CI/CD
├── src/
│   ├── app/
│   │   ├── core/                    # Guards, interceptors, servicios globales
│   │   ├── features/                # Módulos por funcionalidad (lazy loaded)
│   │   │   ├── auth/                # Login y registro
│   │   │   ├── projects/            # Listado y detalle de proyectos
│   │   │   ├── tasks/               # Gestión de tareas
│   │   │   └── users/               # Perfil y administración
│   │   ├── shared/                  # Componentes, pipes y directivas reutilizables
│   │   └── app.routes.ts            # Rutas principales
│   ├── environments/
│   │   ├── environment.ts           # Desarrollo
│   │   └── environment.prod.ts      # Producción
│   └── styles.css                   # Estilos globales + Tailwind
├── package.json
└── tailwind.config.js
```

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

# 3. Configurar la URL del backend en los environments (ver sección siguiente)

# 4. Levantar servidor de desarrollo
npm start
```

La aplicación quedará disponible en `http://localhost:4200`.

### Environments

```typescript
// src/environments/environment.ts  (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// src/environments/environment.prod.ts  (producción)
export const environment = {
  production: true,
  apiUrl: 'https://tu-api.com/api'
};
```

### Comandos disponibles

```bash
npm start           # Servidor de desarrollo en localhost:4200
npm run build       # Build de producción (salida en dist/)
npm run watch       # Build en modo watch para desarrollo
npm test            # Ejecutar tests con Vitest
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

El pipeline está en `.github/workflows/deploy-front-s3.yml` y se activa automáticamente con cada push a `develop`. Los despliegues a `prod` están configurados para ejecución manual.

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
     │
     ▼
2. Setup Node.js 20 (con caché de npm)
     │
     ▼
3. npm install
     │
     ▼
4. npm run build
     │
     ▼
5. Configurar credenciales AWS
     │
     ▼
6. aws s3 sync → S3 Bucket
   (--delete limpia archivos obsoletos del bucket)
```

### Secrets requeridos en GitHub

Configurar en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key del usuario IAM de deploy |
| `AWS_SECRET_ACCESS_KEY` | Secret key del usuario IAM de deploy |

### Permisos IAM mínimos para el usuario de deploy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
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
    }
  ]
}
```

> Si se incorpora CloudFront, agregar `cloudfront:CreateInvalidation` al policy para invalidar caché en cada deploy.

---

## 🎨 Convenciones

El proyecto sigue las Angular best practices definidas para el equipo. Los puntos clave:

**Componentes**
- Standalone por defecto, sin NgModules
- `ChangeDetectionStrategy.OnPush` en todos los componentes
- `input()` y `output()` en lugar de `@Input` / `@Output`
- Templates con control flow nativo: `@if`, `@for`, `@switch`

**Estado**
- `signal()` para estado local reactivo
- `computed()` para valores derivados
- `inject()` en lugar de inyección por constructor

**Estilos**
- Clases de Tailwind directamente en templates
- Sin `ngClass` ni `ngStyle`
- Componentes visuales con DaisyUI

**Arquitectura**
- Lazy loading en todas las rutas de features
- Formularios reactivos (`ReactiveFormsModule`)
- Servicios con `providedIn: 'root'`

**Formateo** — el proyecto usa Prettier con la configuración en `package.json`:

```bash
npx prettier --write .
```

---

## 🗺️ Roadmap

| Estado | Funcionalidad |
|---|---|
| ⬜ | Módulo de autenticación (login / registro) |
| ⬜ | Dashboard principal con resumen de proyectos |
| ⬜ | Gestión de proyectos (CRUD + estados) |
| ⬜ | Gestión de miembros y roles por proyecto |
| ⬜ | Gestión de tareas con filtros y prioridades |
| ⬜ | Perfil de usuario con carga de foto (S3) |
| ⬜ | Panel de administración (solo Admin global) |
| ⬜ | Notificaciones en tiempo real |

---

## 🔗 Repositorios relacionados

- **Backend:** [`gestion-de-proyectos-backend`](../gestion-de-proyectos-backend) — ASP.NET Core 8, ECS Fargate
- **Lambdas:** [`gestion-proyectos-lambdas`](../gestion-proyectos-lambdas) — .NET 8, ImageProcessor + TaskNotifier

---

*Desarrollado con Angular 20 · TailwindCSS · DaisyUI · Desplegado en Amazon S3 · v0.0.0*