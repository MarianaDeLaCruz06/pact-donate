# Guía de Despliegue en Railway

Este documento contiene las instrucciones para desplegar **PACT Donate** en Railway.

## 📋 Requisitos Previos

- Una cuenta en [Railway](https://railway.app)
- Tu código subido a un repositorio Git (GitHub, GitLab, etc.)

## 🚀 Pasos para Desplegar

### 1. Crear un Proyecto en Railway

1. Inicia sesión en [Railway](https://railway.app)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### 2. Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente una base de datos y configurará la variable `DATABASE_URL`

### 3. Configurar Variables de Entorno

En la configuración de tu servicio principal (no la base de datos), agrega las siguientes variables de entorno:

```
PORT=3001
JWT_SECRET=tu-clave-secreta-super-segura-cambia-esto
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Importante:** Railway conecta automáticamente `DATABASE_URL` desde el servicio de PostgreSQL. Asegúrate de referenciar la variable correctamente.

### 4. Configurar el Build

Railway detectará automáticamente que es un proyecto Node.js. El archivo `railway.toml` ya está configurado con:

- **Build Command**: `npm run build:all` (instala dependencias y construye el frontend)
- **Start Command**: `npm run start` (inicia el servidor backend)

Si necesitas modificar estos comandos, edita el archivo `railway.toml`.

### 5. Ejecutar Migraciones de Base de Datos

Después del primer despliegue, necesitas ejecutar las migraciones:

**Opción A: Usando Railway CLI**
```bash
# Instala Railway CLI
npm i -g @railway/cli

# Inicia sesión
railway login

# Vincula tu proyecto
railway link

# Ejecuta las migraciones
railway run npm run migrate
```

**Opción B: Manualmente desde pgAdmin o similar**
1. Obtén las credenciales de la base de datos desde Railway
2. Conecta usando pgAdmin, DBeaver, o tu cliente PostgreSQL favorito
3. Ejecuta los archivos SQL en `server/migrations/` en orden:
   - `001_init.sql`
   - `002_new_features.sql`

### 6. Verificar el Despliegue

1. Railway generará una URL pública para tu aplicación
2. Visita la URL y verifica que la aplicación carga correctamente
3. Prueba el registro y login de usuarios
4. Verifica el endpoint de health: `https://tu-app.railway.app/api/health`

## 🔧 Configuración Adicional

### Dominio Personalizado

1. Ve a la configuración de tu servicio en Railway
2. En la sección "Settings", busca "Domains"
3. Haz clic en "Add Domain"
4. Ingresa tu dominio personalizado y sigue las instrucciones para configurar los registros DNS

### Variables de Entorno Importantes

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor (Railway lo asigna automáticamente) | No |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Sí |
| `DATABASE_URL` | URL de conexión a PostgreSQL | Sí (automática) |

### Logs y Monitoreo

- Los logs están disponibles en el dashboard de Railway
- Haz clic en tu servicio → "Deployments" → Selecciona un deployment → "View Logs"

## 🐛 Solución de Problemas

### Error: "Cannot find module 'path'"

Si ves este error, asegúrate de que `path` está importado en `server/index.js`:
```javascript
const path = require('path');
```

### Error: "Cannot GET /"

Si la ruta raíz no funciona:
1. Verifica que el frontend se haya construido correctamente (`npm run build`)
2. Asegúrate de que la carpeta `dist` existe
3. Verifica que el servidor esté sirviendo archivos estáticos correctamente

### Error de conexión a la base de datos

1. Verifica que el servicio de PostgreSQL esté corriendo
2. Verifica que la variable `DATABASE_URL` esté configurada correctamente
3. Asegúrate de que las migraciones se hayan ejecutado

### Build falla

Si el build falla en Railway:
1. Verifica que todas las dependencias estén en `package.json`
2. Ejecuta `npm run build:all` localmente para reproducir el error
3. Revisa los logs de build en Railway

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Comunidad de Railway](https://discord.gg/railway)

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Haz push de tus cambios al repositorio
2. Railway automáticamente detectará los cambios y redesplegará
3. Si hay nuevas migraciones, ejecútalas usando `railway run npm run migrate`

## 💡 Tips

- Usa variables de entorno diferentes para desarrollo y producción
- Considera configurar auto-backups para la base de datos
- Monitorea el uso de recursos en el dashboard de Railway
- Configura notificaciones para deployments fallidos

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

