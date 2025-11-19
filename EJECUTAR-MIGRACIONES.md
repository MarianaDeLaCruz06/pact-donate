# 🗄️ Cómo Ejecutar las Migraciones en Railway

## ⚠️ IMPORTANTE: Debes ejecutar este paso ANTES de usar la aplicación

Las tablas de la base de datos aún no existen. Sigue estos pasos:

---

## Método 1: Usando Railway CLI (Recomendado)

### Paso 1: Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Paso 2: Iniciar sesión

```bash
railway login
```

Se abrirá tu navegador para autenticarte.

### Paso 3: Vincular tu proyecto

En la carpeta del proyecto, ejecuta:

```bash
railway link
```

Selecciona tu proyecto "pact-donate-production" (o como se llame).

### Paso 4: Ejecutar las migraciones

```bash
railway run npm run setup:db
```

Este comando ejecutará el script que:
- ✅ Lee todos los archivos SQL de `server/migrations/`
- ✅ Los ejecuta en orden
- ✅ Verifica que las tablas se crearon correctamente

**Resultado esperado:**

```
=================================
🗄️  Configuración de Base de Datos
=================================

📋 Buscando migraciones en: /app/server/migrations
✅ Encontradas 2 migraciones:

   1. 001_init.sql
   2. 002_new_features.sql

🔄 Ejecutando: 001_init.sql...
✅ 001_init.sql ejecutado exitosamente

🔄 Ejecutando: 002_new_features.sql...
✅ 002_new_features.sql ejecutado exitosamente

🔍 Verificando tablas creadas...

✅ Tablas en la base de datos (10):

   - donaciones
   - donantes
   - entidades
   - historias_clinicas
   - inventario_sangre
   - notificaciones
   - preferencias_notificaciones
   - solicitudes
   - users
   - (y más...)

=================================
✅ Base de datos configurada correctamente
=================================
```

---

## Método 2: Usando el Dashboard de Railway

### Paso 1: Ir a Railway Dashboard

1. Ve a [railway.app](https://railway.app)
2. Abre tu proyecto
3. Click en tu servicio (backend)

### Paso 2: Abrir la terminal

1. Click en la pestaña **"Settings"**
2. Scroll down hasta **"Service Settings"**
3. NO hay terminal directo, así que usa el método 3

---

## Método 3: Ejecutar desde tu computadora local

Si tienes las credenciales de la base de datos, puedes ejecutar desde local:

### Paso 1: Crear archivo .env en la carpeta server

```bash
cd server
```

Crea un archivo `.env`:

```env
DATABASE_URL=postgresql://postgres:adjXlnHekwFJmmMoBGdSloGUlnKUpAbZ@crossover.proxy.rlwy.net:58917/railway
```

### Paso 2: Ejecutar el script

```bash
npm run setup:db
```

---

## Método 4: Usando psql directamente

Si tienes PostgreSQL instalado localmente con `psql`:

### Desde Windows (PowerShell o CMD):

```bash
cd server/migrations
```

```bash
# Ejecutar primera migración
psql "postgresql://postgres:adjXlnHekwFJmmMoBGdSloGUlnKUpAbZ@crossover.proxy.rlwy.net:58917/railway" -f 001_init.sql

# Ejecutar segunda migración
psql "postgresql://postgres:adjXlnHekwFJmmMoBGdSloGUlnKUpAbZ@crossover.proxy.rlwy.net:58917/railway" -f 002_new_features.sql
```

### Desde Linux/Mac:

```bash
cd server/migrations

psql "postgresql://postgres:adjXlnHekwFJmmMoBGdSloGUlnKUpAbZ@crossover.proxy.rlwy.net:58917/railway" -f 001_init.sql

psql "postgresql://postgres:adjXlnHekwFJmmMoBGdSloGUlnKUpAbZ@crossover.proxy.rlwy.net:58917/railway" -f 002_new_features.sql
```

---

## Verificar que las migraciones funcionaron

Después de ejecutar las migraciones, **vuelve a probar** en:

```
https://pact-donate-production.up.railway.app/test-api
```

Haz click en **"Test Register (Donante)"** de nuevo.

**Ahora debería funcionar** y crear el usuario correctamente.

---

## ❌ Si algo sale mal

### Error: "relation already exists"

Esto significa que las tablas ya existen. **Es normal y puedes ignorarlo**.

### Error: "could not connect to server"

Verifica que:
- ✅ La URL de la base de datos es correcta
- ✅ Tienes conexión a internet
- ✅ El servicio de PostgreSQL en Railway está corriendo

### Error: "password authentication failed"

La contraseña de la base de datos cambió. Obtén la nueva desde Railway:

1. Railway Dashboard → Tu proyecto
2. Click en el servicio de PostgreSQL (no el backend)
3. Click en **"Variables"**
4. Copia el valor de `DATABASE_URL`

---

## 🎉 Una vez que funcione

Después de ejecutar las migraciones:

1. ✅ Podrás crear cuentas desde la app
2. ✅ El login funcionará
3. ✅ Todas las funcionalidades estarán disponibles

---

## 💡 Tip para el futuro

Cada vez que agregues nuevas migraciones, solo ejecuta:

```bash
railway run npm run setup:db
```

El script automáticamente detectará y ejecutará todas las migraciones en orden.

