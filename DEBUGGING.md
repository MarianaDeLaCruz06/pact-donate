# 🐛 Guía de Debugging - PACT Donate

## Problema Actual: "Failed to fetch" en creación de cuenta

### Pasos para diagnosticar:

## 1. Verificar la Página de Test

Accede a la página de test en tu Railway deployment:

```
https://tu-dominio.railway.app/test-api
```

Esta página te permitirá:
- ✅ Verificar que el servidor está respondiendo
- ✅ Probar las rutas de API directamente
- ✅ Ver los errores exactos en el navegador

### Qué hacer:

1. Haz clic en **"Test Health Check"**
   - Debería responder con `{ "status": "ok", "timestamp": "..." }`
   - Si falla, el servidor no está sirviendo correctamente

2. Haz clic en **"Test Register (Donante)"**
   - Creará un usuario de prueba
   - Verás la respuesta completa
   - Si falla, el problema está en la ruta de registro

## 2. Verificar los Logs del Servidor en Railway

En Railway, ve a:
1. Tu proyecto → Tu servicio
2. Click en **"Deployments"**
3. Click en el deployment activo
4. Click en **"View Logs"**

### Qué buscar en los logs:

Cuando hagas clic en "Test Register", deberías ver:

```
[timestamp] POST /api/auth/register
Body: {
  "email": "...",
  "password": "...",
  ...
}
📝 Iniciando proceso de registro...
```

Si **NO ves esto**, significa que la petición no está llegando al servidor.

## 3. Abrir la Consola del Navegador

En la aplicación principal (no en /test-api):

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Intenta crear una cuenta
4. Busca mensajes de log:

```
🔧 API Configuration:
   Mode: PRODUCTION
   API URL: /api
   Window location: https://...
```

Si ves errores de **CORS** o **Network Error**, ese es el problema.

## 4. Verificar la Pestaña Network

En DevTools:

1. Ve a la pestaña **Network**
2. Filtra por **Fetch/XHR**
3. Intenta crear una cuenta
4. Busca una petición a `/api/auth/register`

### Casos posibles:

#### Caso A: No aparece ninguna petición
- El frontend tiene un error antes de hacer la petición
- Revisa la consola del navegador

#### Caso B: La petición aparece pero falla (status 404 o 0)
- El servidor no está recibiendo la petición
- Problema con el enrutamiento

#### Caso C: La petición aparece con status 500
- El servidor está recibiendo la petición pero hay un error
- Revisa los logs del servidor en Railway

## 5. Rebuild y Redeploy

Si acabas de hacer cambios al código:

### Opción A: Desde Railway (Automático)
```bash
git add .
git commit -m "Fix: Mejorar logs y configuración de API"
git push
```

Railway redesplegará automáticamente.

### Opción B: Manual en Railway Dashboard
1. Ve a tu proyecto en Railway
2. Click en **"Settings"**
3. Scroll down y click en **"Redeploy"**

## 6. Verificar Variables de Entorno en Railway

En Railway Dashboard:

1. Ve a tu servicio
2. Click en **"Variables"**
3. Verifica que estén configuradas:
   - `DATABASE_URL` (debe estar automáticamente si vinculaste PostgreSQL)
   - `JWT_SECRET` (tu clave secreta)
   - `PORT` (opcional, Railway lo asigna automáticamente)

## 7. Ejecutar el Script de Test de Base de Datos

En Railway CLI:

```bash
railway run node server/test-db.js
```

Esto verificará que la conexión a PostgreSQL funciona correctamente.

## Posibles Soluciones

### Solución 1: El problema es CORS

Si ves errores de CORS en la consola, ya está configurado en el servidor:

```javascript
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Solución 2: La URL de la API está mal

Si el frontend usa una URL incorrecta, puedes forzarla con una variable de entorno en Railway:

```bash
# En Railway Variables
VITE_API_URL=/api
```

Luego rebuild.

### Solución 3: El build del frontend está desactualizado

Fuerza un rebuild limpio:

```bash
# Localmente
rm -rf dist node_modules server/node_modules
npm install
npm run build
cd server && npm install && cd ..
```

Luego push a Railway.

### Solución 4: Las migraciones no se han ejecutado

```bash
railway run npm run migrate
```

O conéctate a la base de datos y ejecuta manualmente los archivos SQL en `server/migrations/`.

## Checklist Final

Antes de continuar debugging, asegúrate de que:

- [ ] El servidor inicia sin errores (revisa logs de Railway)
- [ ] La base de datos está conectada (logs muestran "✅ Conexión a base de datos exitosa")
- [ ] `/test-api` carga correctamente
- [ ] `/api/health` responde con status 200
- [ ] Las migraciones están ejecutadas
- [ ] El frontend ha sido rebuildeado después de los últimos cambios
- [ ] Las variables de entorno están configuradas
- [ ] CORS está configurado (ya lo está)

## Logs Útiles para Compartir

Si necesitas ayuda, comparte:

1. **Logs del servidor** (al intentar crear cuenta)
2. **Consola del navegador** (mensajes y errores)
3. **Pestaña Network** (screenshot de la petición fallida)
4. **Variables de entorno** configuradas en Railway (sin passwords)

## Contacto

Si después de seguir estos pasos aún tienes problemas, abre un issue con:
- Los logs mencionados arriba
- URL de tu deployment en Railway
- Pasos para reproducir el error

