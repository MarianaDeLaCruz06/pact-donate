# 🔧 Solución: Frontend no conecta pero /test-api funciona

## ✅ El problema está identificado

- `/test-api` funciona perfectamente ✅
- El backend recibe las peticiones correctamente ✅
- La base de datos funciona ✅
- **PERO** el frontend React no hace las peticiones ❌

## 🎯 La causa

El frontend está usando una versión cacheada/vieja del build. Necesitas forzar un rebuild completo.

---

## 🚀 Solución (Sigue estos pasos)

### Paso 1: Limpiar y rebuild el proyecto

#### En Windows (PowerShell o CMD):

```powershell
# Ejecuta el script de rebuild
.\rebuild-and-deploy.bat
```

O manualmente:

```powershell
# Limpiar
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force node_modules\.vite

# Instalar
npm install

# Build
npm run build
```

#### En Linux/Mac:

```bash
# Ejecuta el script de rebuild
chmod +x rebuild-and-deploy.sh
./rebuild-and-deploy.sh
```

O manualmente:

```bash
rm -rf dist
rm -rf node_modules/.vite
npm install
npm run build
```

### Paso 2: Commit y push a Railway

```bash
git add .
git commit -m "Rebuild frontend con logs mejorados y configuración actualizada"
git push
```

### Paso 3: Verificar el despliegue en Railway

1. Ve al dashboard de Railway
2. Espera a que el despliegue termine (aparecerá "Active")
3. Los logs mostrarán el proceso de build

### Paso 4: Limpiar cache del navegador

**MUY IMPORTANTE:** Después del despliegue, en tu navegador:

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Archivos en caché" o "Cached images and files"
3. Click en "Limpiar datos" o "Clear data"

O simplemente:
- Chrome/Edge: `Ctrl + Shift + R` (hard refresh)
- Firefox: `Ctrl + F5`
- Safari: `Cmd + Option + R`

### Paso 5: Probar de nuevo

Ahora vuelve a intentar crear una cuenta desde la aplicación normal.

---

## 🔍 Verificar que funcionó

Abre la consola del navegador (F12) y busca estos mensajes:

```
🔧 API Configuration:
   Mode: PRODUCTION
   API URL: /api
   Window location: https://pact-donate-production.up.railway.app
📡 API Client initialized with URL: /api
```

Cuando intentes registrarte, deberías ver:

```
🔐 auth.register llamado con: ...
🌐 API Request: POST https://pact-donate-production.up.railway.app/api/auth/register
📦 Request Body: ...
📨 Response Status: 201 Created
✅ Response Data: ...
```

---

## 📊 Verificar los logs del servidor

En Railway logs, cuando intentes registrarte ahora deberías ver:

```
[timestamp] POST /api/auth/register
Body: {
  "email": "tu@email.com",
  ...
}
📝 Iniciando proceso de registro...
```

Si ves esto, **funcionó correctamente**.

---

## ❌ Si sigue sin funcionar

### Opción 1: Verificar que el build se deployó

```bash
# Verifica que los archivos existen en Railway
railway run ls -la dist/

# Deberías ver archivos como:
# - index.html
# - assets/index-XXXXX.js
# - assets/index-XXXXX.css
```

### Opción 2: Verificar variables de entorno

En Railway Dashboard → Tu servicio → Variables:

Asegúrate de que **NO** tengas:
- `VITE_API_URL` configurada (déjala vacía o bórrala)

Si la tienes, bórrala y redespliega.

### Opción 3: Forzar rebuild en Railway

1. Railway Dashboard → Tu servicio
2. Click en "Settings"
3. Scroll down
4. Click en "Redeploy"

### Opción 4: Verificar que estás accediendo a la URL correcta

Asegúrate de que estás usando:
```
https://pact-donate-production.up.railway.app
```

Y NO:
```
http://localhost:3001
```

---

## 🎉 Cuando funcione

Una vez que funcione, deberías poder:

1. ✅ Crear cuentas de donante
2. ✅ Crear cuentas de entidad
3. ✅ Iniciar sesión
4. ✅ Usar todas las funcionalidades

---

## 💡 Para desarrollo local

Si quieres probar localmente:

### Terminal 1 (Backend):
```bash
cd server
npm install
npm run dev
```

### Terminal 2 (Frontend):
```bash
npm install
npm run dev
```

Luego abre: `http://localhost:8080`

En desarrollo local, el frontend automáticamente usará `http://localhost:3001/api` para el backend.

---

## 📝 Notas importantes

1. **Siempre** haz un hard refresh después de deployar
2. **Nunca** uses localhost en producción
3. **Verifica** los logs del navegador para debugging
4. **Los logs del servidor** también son tu amigo

---

## ¿Necesitas más ayuda?

Si sigues teniendo problemas después de estos pasos, comparte:

1. Logs de Railway (después de intentar registrarte)
2. Consola del navegador (screenshot o texto)
3. Pestaña Network del navegador (screenshot de la petición fallida)

