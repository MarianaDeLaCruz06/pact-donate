# LifeLink - Sistema de Donación de Sangre

Sistema de gestión de donaciones de sangre construido con React, Express y PostgreSQL.

## Características

### Para Donantes
- Autenticación y gestión de perfil
- Gestión de historias clínicas
- Visualización de donaciones realizadas
- Sistema de notificaciones de solicitudes compatibles
- Preferencias de notificaciones (recibir todas o solo emergencias)

### Para Entidades Médicas
- Autenticación y gestión de perfil
- Gestión de historias clínicas de donantes
- Registro de donaciones (actualiza inventario automáticamente)
- Creación de solicitudes de sangre
- **Botón de emergencia** para solicitudes urgentes
- **Reportes de donaciones** con filtros por fecha, banco y tipo de sangre
- **Búsqueda avanzada de sangre** con filtros por tipo, ubicación y cantidad
- **Gestión de inventario** de sangre (agregar, despachar, actualizar)
- Visualización gráfica de reportes (gráficos de barras y pastel)
- Exportación de reportes a CSV y PDF

## Requisitos

- Node.js 18+
- PostgreSQL
- npm o yarn

## Configuración

### 1. Base de datos

La base de datos PostgreSQL debe estar configurada. La URL de conexión se proporciona en el archivo `.env` del servidor.

#### Ejecutar migraciones

Conéctate a tu base de datos PostgreSQL y ejecuta los scripts de migración en orden:

1. Migración inicial:
```bash
psql -h turntable.proxy.rlwy.net -p 33001 -U postgres -d railway -f server/migrations/001_init.sql
```

O usando la URL completa:

```bash
psql "postgresql://postgres:tgerjFFtMjEWUdzWDhVDOvKYWNGFCHvn@turntable.proxy.rlwy.net:33001/railway" -f server/migrations/001_init.sql
```

2. Migración de nuevas funcionalidades:
```bash
psql "postgresql://postgres:tgerjFFtMjEWUdzWDhVDOvKYWNGFCHvn@turntable.proxy.rlwy.net:33001/railway" -f server/migrations/002_new_features.sql
```

### 2. Backend (Servidor)

1. Navega a la carpeta del servidor:
```bash
cd server
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la carpeta `server/` con el siguiente contenido:
```env
DATABASE_URL=postgresql://postgres:tgerjFFtMjEWUdzWDhVDOvKYWNGFCHvn@turntable.proxy.rlwy.net:33001/railway
JWT_SECRET=tu-secret-key-segura-aqui
PORT=3001
NODE_ENV=development
```

4. Inicia el servidor:
```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El servidor estará corriendo en `http://localhost:3001`

### 3. Frontend

1. En la raíz del proyecto, instala las dependencias:
```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto con:
```env
VITE_API_URL=http://localhost:3001/api
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:8080`

## Estructura del Proyecto

```
.
├── server/                 # Backend API (Express)
│   ├── index.js           # Servidor principal
│   ├── migrations/        # Scripts de migración de BD
│   └── package.json       # Dependencias del backend
├── src/                   # Frontend (React)
│   ├── components/        # Componentes React
│   ├── lib/               # Utilidades y cliente API
│   ├── pages/             # Páginas principales
│   └── ...
└── package.json           # Dependencias del frontend
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener perfil del usuario actual

### Donantes
- `GET /api/donantes/:documento` - Obtener donante por documento
- `PATCH /api/donantes/:documento/tipo-sangre` - Actualizar tipo de sangre

### Historias Clínicas
- `GET /api/historias-clinicas` - Listar historias clínicas
- `GET /api/historias-clinicas/:documento` - Obtener historia por documento
- `POST /api/historias-clinicas` - Crear/actualizar historia clínica
- `PATCH /api/historias-clinicas/:id` - Actualizar estado de historia

### Donaciones
- `GET /api/donaciones` - Listar donaciones
- `POST /api/donaciones` - Crear donación (actualiza inventario automáticamente)

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes
- `POST /api/solicitudes` - Crear solicitud
- `POST /api/solicitudes/emergencia` - Crear solicitud de emergencia (envía notificaciones inmediatas)

### Reportes
- `GET /api/reportes/donaciones` - Obtener reporte de donaciones con filtros (fecha_inicio, fecha_fin, banco, tipo_sangre)

### Búsqueda de Sangre
- `GET /api/busqueda-sangre` - Buscar unidades de sangre disponibles con filtros (tipo_sangre, ciudad, departamento, cantidad_minima, entidad_id)

### Inventario
- `GET /api/inventario` - Obtener inventario de la entidad
- `PATCH /api/inventario/:id` - Actualizar inventario (agregar, despachar o actualizar)

### Notificaciones
- `GET /api/notificaciones` - Obtener notificaciones del donante
- `PATCH /api/notificaciones/:id/leer` - Marcar notificación como leída

### Preferencias de Notificaciones
- `GET /api/preferencias-notificaciones` - Obtener preferencias del donante
- `PUT /api/preferencias-notificaciones` - Actualizar preferencias de notificaciones

## Desarrollo

### Scripts disponibles

**Frontend:**
- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción

**Backend:**
- `npm start` - Inicia servidor de producción
- `npm run dev` - Inicia servidor con nodemon (auto-reload)

## Notas

- El JWT_SECRET debe ser cambiado en producción por una clave segura
- Las contraseñas se almacenan con hash usando bcrypt
- El backend valida la autenticación mediante JWT tokens
- Las consultas a la base de datos están protegidas según el tipo de usuario

## Solución de Problemas

### Error "Failed to fetch"
- Verifica que el servidor backend esté corriendo
- Verifica que la URL de la API en `.env` sea correcta
- Verifica que CORS esté configurado correctamente en el backend

### Error de conexión a la base de datos
- Verifica que la URL de conexión en `server/.env` sea correcta
- Verifica que las migraciones se hayan ejecutado correctamente
- Verifica que la base de datos esté accesible

### Error de autenticación
- Verifica que el JWT_SECRET esté configurado
- Limpia el localStorage del navegador si hay problemas con tokens
