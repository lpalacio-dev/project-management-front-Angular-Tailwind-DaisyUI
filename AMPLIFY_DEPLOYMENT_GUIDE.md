# Guía de Despliegue del Frontend en AWS Amplify

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- ✅ Repositorio de GitHub con el código del frontend Angular
- ✅ Backend desplegado en ECS Fargate (URL del ALB)
- ✅ Base de datos RDS configurada
- ✅ Cuenta de AWS con permisos de administrador
- ✅ AWS CLI configurado (opcional, para comandos avanzados)

---

## 🚀 Paso 1: Preparar el Repositorio

### 1.1 Verificar archivos necesarios

Asegúrate de que estos archivos estén en tu repositorio:

```bash
# Archivos críticos para Amplify
amplify.yml                           # Configuración de build
scripts/replace-env.sh                # Script de variables de entorno
src/environments/environment.ts       # Config desarrollo
src/environments/environment.prod.ts  # Config producción
```

### 1.2 Subir cambios a GitHub

```bash
# Agregar archivos nuevos
git add amplify.yml scripts/ src/environments/

# Commit
git commit -m "feat: configurar despliegue en AWS Amplify"

# Push a main/master
git push origin main
```

---

## 🔧 Paso 2: Crear Aplicación en AWS Amplify

### 2.1 Acceder a AWS Amplify Console

1. Ir a: https://console.aws.amazon.com/amplify/
2. Click en **"Get Started"** (si es la primera vez)
3. Seleccionar **"Amplify Hosting"** > **"Get Started"**

### 2.2 Conectar Repositorio de GitHub

1. **Seleccionar proveedor de código:**
   - Elegir **"GitHub"**
   - Click en **"Continue"**

2. **Autorizar AWS Amplify:**
   - Click en **"Authorize AWS Amplify"**
   - Iniciar sesión en GitHub si es necesario
   - Autorizar la aplicación

3. **Seleccionar repositorio:**
   - Repository: `tu-usuario/gestion-proyectos-frontend`
   - Branch: `main` (o `master`)
   - Click en **"Next"**

### 2.3 Configurar Build Settings

1. **App name:**
   ```
   gestion-proyectos-frontend
   ```

2. **Environment name (opcional):**
   ```
   production
   ```

3. **Build and test settings:**
   
   AWS Amplify debería detectar automáticamente tu `amplify.yml`.
   
   ✅ **Verificar que muestra:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - echo "Installing dependencies..."
           - chmod +x scripts/replace-env.sh
       build:
         commands:
           - echo "Configuring environment variables..."
           - ./scripts/replace-env.sh
           - echo "Building Angular application..."
           - npm run build -- --configuration=production
     artifacts:
       baseDirectory: dist/gestion-proyectos-frontend/browser
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Advanced settings (Expandir):**
   
   - Click en **"Advanced settings"**
   - **Agregar variables de entorno**

### 2.4 Configurar Variables de Entorno

⚠️ **MUY IMPORTANTE:** Configurar la URL de tu backend

1. En **"Environment variables"**, agregar:

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `API_URL` | `http://gestion-proyectos-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com/api` | URL del backend (ALB) |

   > **Nota:** Reemplaza `XXXXXXXXX` con el DNS real de tu ALB de ECS.
   > 
   > **Cómo obtener la URL del ALB:**
   > ```bash
   > aws elbv2 describe-load-balancers \
   >   --query 'LoadBalancers[?contains(LoadBalancerName, `gestion-proyectos`)].DNSName' \
   >   --output text
   > ```

2. **Variables adicionales opcionales:**

   | Variable | Valor | Descripción |
   |----------|-------|-------------|
   | `NODE_VERSION` | `20` | Versión de Node.js |
   | `_CUSTOM_IMAGE` | `amplify:al2023` | Imagen base de Amplify |

3. Click en **"Next"**

### 2.5 Revisar y Confirmar

1. **Revisar configuración:**
   - ✅ Repository conectado correctamente
   - ✅ Branch seleccionado
   - ✅ Build settings correctos
   - ✅ Variables de entorno configuradas

2. Click en **"Save and deploy"**

---

## ⏱️ Paso 3: Primer Despliegue

### 3.1 Monitorear el Build

AWS Amplify ejecutará automáticamente:

1. **Provision** (1-2 min)
   - Crear ambiente de build
   - Clonar repositorio

2. **Build** (3-5 min)
   - Instalar dependencias (`npm ci`)
   - Ejecutar script de env variables
   - Build de Angular (`npm run build`)

3. **Deploy** (1-2 min)
   - Subir archivos a CloudFront CDN
   - Configurar dominio temporal

4. **Verify** (<1 min)
   - Verificar que el sitio funciona

**Tiempo total estimado:** 5-8 minutos

### 3.2 Verificar el Despliegue

1. Una vez completado, verás:
   - ✅ Estado: **"Deployed"** con check verde
   - 🌐 **URL temporal:** `https://main.d1234abcd.amplifyapp.com`

2. Click en la URL para verificar que el sitio carga

### 3.3 Troubleshooting del Primer Build

Si el build falla, revisar:

#### Error común #1: Node version incompatible
```
Solución:
- Agregar variable de entorno: NODE_VERSION = 20
```

#### Error común #2: baseDirectory incorrecto
```
Error: "Error: No artifacts found at: dist/gestion-proyectos-frontend/browser"

Solución:
1. Verificar el nombre de tu proyecto en angular.json
2. Actualizar baseDirectory en amplify.yml:
   
   artifacts:
     baseDirectory: dist/TU-NOMBRE-PROYECTO/browser
```

#### Error común #3: API_URL no definida
```
Error: "API_URL no está definida"

Solución:
- Verificar que agregaste la variable de entorno en Amplify Console
- App settings > Environment variables > API_URL
```

---

## 🌐 Paso 4: Configurar Dominio Custom (Opcional)

### 4.1 Agregar Dominio

1. En Amplify Console, ir a:
   ```
   App settings > Domain management > Add domain
   ```

2. **Si tienes un dominio en Route 53:**
   - Seleccionar el dominio
   - Click en **"Configure domain"**
   - Amplify configurará automáticamente los registros DNS

3. **Si tu dominio está en otro registrar:**
   - Ingresar nombre de dominio: `ejemplo.com`
   - Click en **"Configure domain"**
   - Copiar los registros CNAME que Amplify proporciona
   - Agregarlos en tu registrar de dominios

### 4.2 Configurar Subdominio

Configurar subdominios para diferentes ambientes:

- `app.ejemplo.com` → main branch (producción)
- `dev.ejemplo.com` → develop branch (desarrollo)
- `staging.ejemplo.com` → staging branch

### 4.3 Habilitar HTTPS

✅ **Automático:** Amplify provisiona certificados SSL/TLS gratis

---

## 🔄 Paso 5: Habilitar PR Previews

### 5.1 Configurar Web Previews

1. En Amplify Console, ir a:
   ```
   App settings > Previews
   ```

2. Click en **"Enable previews"**

3. Seleccionar:
   - ✅ **"Automatically deploy previews"**
   - Branch pattern: `feature/*` o `*` (todos los PRs)

### 5.2 Cómo Funciona

Cada vez que crees un Pull Request en GitHub:

1. Amplify detecta el PR automáticamente
2. Crea un build temporal del PR
3. Genera una URL única de preview
4. Comenta en el PR con el link
5. Actualiza automáticamente con cada commit

**Ejemplo:**
```
Pull Request #42: feature/nueva-funcionalidad
Preview URL: https://pr42.d1234abcd.amplifyapp.com
```

---

## ⚙️ Paso 6: Configuraciones Adicionales

### 6.1 Configurar Rewrites y Redirects

Para Angular (SPA) necesitamos redirigir todo a index.html:

1. En Amplify Console, ir a:
   ```
   App settings > Rewrites and redirects
   ```

2. Agregar esta regla:

   | Source address | Target address | Type |
   |---------------|---------------|------|
   | `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

   Esto asegura que todas las rutas de Angular funcionen correctamente.

### 6.2 Configurar Custom Headers

Para mejorar seguridad y performance:

1. En **"Custom headers"**, agregar:

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Frame-Options'
        value: 'SAMEORIGIN'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '/index.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
```

### 6.3 Configurar Notificaciones

Para recibir alertas de builds:

1. En **"Notifications"**, configurar:
   - Email notifications
   - Slack webhooks (opcional)
   - SNS topics (opcional)

---

## 🔐 Paso 7: Configurar CORS en Backend

⚠️ **CRÍTICO:** Tu backend ECS debe permitir requests desde Amplify

### 7.1 Actualizar CORS en tu API

En tu backend .NET, actualizar `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AmplifyFrontend", app =>
    {
        app.WithOrigins(
            "http://localhost:4200",                          // Desarrollo local
            "https://main.d1234abcd.amplifyapp.com",          // URL temporal Amplify
            "https://app.ejemplo.com"                         // Tu dominio custom (si aplica)
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// ...

app.UseCors("AmplifyFrontend");
```

### 7.2 Re-desplegar Backend

```bash
# Después de actualizar CORS
docker build -t gestion-proyectos-backend .
docker tag gestion-proyectos-backend:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest

# Forzar nuevo deployment en ECS
aws ecs update-service \
  --cluster gestion-proyectos-cluster \
  --service gestion-proyectos-service \
  --force-new-deployment
```

---

## 📊 Paso 8: Monitoreo y Logs

### 8.1 Ver Logs de Build

1. En Amplify Console:
   ```
   [Tu App] > [Branch main] > Build details
   ```

2. Ver logs en tiempo real durante builds

### 8.2 CloudWatch Logs

Amplify automáticamente envía logs a CloudWatch:

```
Log group: /aws/amplify/gestion-proyectos-frontend
```

### 8.3 Métricas Importantes

Monitorear:
- Build success rate
- Deploy frequency
- Build duration
- Traffic metrics

---

## 🧪 Paso 9: Testing

### 9.1 Verificar Funcionalidad

**Checklist de pruebas:**

- [ ] Login funciona correctamente
- [ ] Puede crear proyectos
- [ ] Puede crear tareas
- [ ] Puede agregar miembros
- [ ] APIs responden correctamente
- [ ] Imágenes y assets cargan
- [ ] Navegación entre rutas funciona
- [ ] Logout funciona
- [ ] Error handling funciona

### 9.2 Testing de Performance

Usar Lighthouse en Chrome DevTools:

```
Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90
```

### 9.3 Testing Cross-Browser

Probar en:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

## 🔄 Paso 10: CI/CD Automático

### 10.1 Workflow Automático

Una vez configurado, cada `git push` a `main`:

1. ✅ GitHub notifica a Amplify
2. ✅ Amplify inicia build automáticamente
3. ✅ Ejecuta tests (si están configurados)
4. ✅ Build de producción
5. ✅ Deploy a CDN
6. ✅ Invalida cache de CloudFront
7. ✅ Notifica resultado

**Tiempo típico:** 5-8 minutos

### 10.2 Rollback Automático

Si un deployment falla:

1. Amplify mantiene la versión anterior activa
2. No hay downtime
3. Puedes hacer rollback manual a cualquier versión anterior

### 10.3 Multiple Branches

Puedes configurar auto-deployment para múltiples branches:

- `main` → Producción
- `develop` → Desarrollo
- `staging` → Staging

Cada uno con su propia URL y variables de entorno.

---

## 💰 Paso 11: Costos y Optimización

### 11.1 Estimación de Costos

Para una app pequeña-mediana:

```
Build minutes: $0.01 USD/minuto
  - ~10 builds/día × 5 min = 50 min/día
  - 50 × 30 = 1,500 min/mes
  - Costo: ~$15/mes

Hosting: $0.15 USD/GB servido
  - App size: ~5 MB
  - Traffic: 1,000 usuarios/mes × 5 MB = 5 GB
  - Costo: ~$0.75/mes

Storage: $0.023 USD/GB-mes
  - ~500 MB almacenados
  - Costo: ~$0.01/mes

Total estimado: $15-20 USD/mes
```

### 11.2 Free Tier

AWS Amplify Free Tier incluye:
- 1,000 build minutes/mes
- 15 GB served/mes
- 5 GB storage

**Para desarrollo/proyectos pequeños: ¡Prácticamente gratis!**

### 11.3 Optimizaciones

**Reducir costos de build:**
- Habilitar cache de dependencias ✅
- Optimizar bundle size
- Lazy loading de módulos

**Reducir costos de hosting:**
- Comprimir assets
- Optimizar imágenes
- Configurar cache headers correctamente

---

## 🚨 Troubleshooting Común

### Problema 1: Build falla en producción pero funciona local

**Solución:**
```bash
# Probar build de producción localmente
npm run build -- --configuration=production

# Si falla, revisar errores en consola
# Típicamente: imports incorrectos, type errors
```

### Problema 2: "Failed to compile" - Template parse errors

**Solución:**
- Verificar sintaxis de templates
- Asegurar que todos los imports están correctos
- Revisar que componentes standalone declaran todas sus dependencias

### Problema 3: API calls fallan (CORS errors)

**Solución:**
1. Verificar URL de API en environment.prod.ts
2. Confirmar que backend permite origen de Amplify
3. Revisar logs de backend en CloudWatch

### Problema 4: Rutas de Angular retornan 404

**Solución:**
- Configurar redirects en Amplify (ver Paso 6.1)
- Todas las rutas deben redirigir a index.html

### Problema 5: Environment variables no se aplican

**Solución:**
```bash
# Verificar que el script replace-env.sh tiene permisos
chmod +x scripts/replace-env.sh

# Verificar que amplify.yml lo ejecuta
# Ver logs de build fase "Build"
```

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

### Configuración
- [ ] amplify.yml creado y commiteado
- [ ] Scripts de environment configurados
- [ ] Variables de entorno en Amplify Console
- [ ] Rewrites/redirects configurados
- [ ] Custom headers configurados (opcional)

### Seguridad
- [ ] CORS configurado en backend
- [ ] HTTPS habilitado (automático)
- [ ] Security headers configurados
- [ ] Variables sensibles NO en código

### Performance
- [ ] Build cache habilitado
- [ ] Lighthouse score > 90
- [ ] Lazy loading implementado
- [ ] Assets optimizados

### Monitoreo
- [ ] CloudWatch logs configurados
- [ ] Notificaciones de build configuradas
- [ ] Alertas configuradas (opcional)

### Testing
- [ ] Login/logout funciona
- [ ] CRUD de proyectos funciona
- [ ] CRUD de tareas funciona
- [ ] Gestión de miembros funciona
- [ ] Responsive design verificado
- [ ] Cross-browser testing completado

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Angular Production Build](https://angular.dev/tools/cli/deployment)
- [Amplify CLI Reference](https://docs.amplify.aws/cli/)

### Tutoriales
- [Deploying Angular to AWS Amplify](https://aws.amazon.com/blogs/mobile/deploy-angular-application-with-aws-amplify/)
- [Setting up CI/CD with Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)

### Comunidad
- [AWS Amplify GitHub](https://github.com/aws-amplify)
- [Stack Overflow - AWS Amplify](https://stackoverflow.com/questions/tagged/aws-amplify)

---

## 🎉 ¡Deployment Completado!

Tu aplicación Angular ahora está:

✅ Desplegada en AWS Amplify  
✅ Con CI/CD automático  
✅ Servida desde CloudFront CDN global  
✅ Con HTTPS habilitado  
✅ Conectada a tu backend en ECS  

**URL de Producción:** `https://main.d1234abcd.amplifyapp.com`  
**URL Custom (si configuraste):** `https://app.tu-dominio.com`

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs de build en Amplify Console
2. Consultar CloudWatch logs
3. Revisar esta guía (sección Troubleshooting)
4. Contactar soporte de AWS (si tienes plan de soporte)

**¡Felicitaciones! Tu stack completo está en producción en AWS! 🚀**

---

*Última actualización: Febrero 2026*
*Versión: 1.0*
