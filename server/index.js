const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:tgerjFFtMjEWUdzWDhVDOvKYWNGFCHvn@turntable.proxy.rlwy.net:33001/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railway requiere SSL
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app (for production)
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, tipo, nombre, documento } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, tipo) VALUES ($1, $2, $3) RETURNING id, email, tipo',
      [email, hashedPassword, tipo]
    );

    const user = userResult.rows[0];

    // Create profile based on type
    if (tipo === 'donante') {
      if (!documento || !nombre) {
        // Delete user if profile creation fails
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
        return res.status(400).json({ error: 'Documento y nombre son requeridos para donantes' });
      }

      // Check if documento already exists
      const docCheck = await pool.query(
        'SELECT documento FROM donantes WHERE documento = $1',
        [documento]
      );

      if (docCheck.rows.length > 0) {
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
        return res.status(400).json({ error: 'El documento ya está registrado' });
      }

      await pool.query(
        'INSERT INTO donantes (documento, nombre, correo, user_id) VALUES ($1, $2, $3, $4)',
        [documento, nombre, email, user.id]
      );
    } else if (tipo === 'entidad') {
      if (!nombre) {
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
        return res.status(400).json({ error: 'Nombre es requerido para entidades' });
      }

      await pool.query(
        'INSERT INTO entidades (nombre, correo, user_id) VALUES ($1, $2, $3)',
        [nombre, email, user.id]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, email, password, tipo FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tipo = req.user.tipo;

    if (tipo === 'donante') {
      const result = await pool.query(
        'SELECT * FROM donantes WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Perfil de donante no encontrado' });
      }
      res.json(result.rows[0]);
    } else if (tipo === 'entidad') {
      const result = await pool.query(
        'SELECT * FROM entidades WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Perfil de entidad no encontrado' });
      }
      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Tipo de usuario inválido' });
    }
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Donantes Routes
app.get('/api/donantes/:documento', authenticateToken, async (req, res) => {
  try {
    const { documento } = req.params;
    const result = await pool.query(
      'SELECT nombre, tipo_sangre FROM donantes WHERE documento = $1',
      [documento]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo donante:', error);
    res.status(500).json({ error: 'Error al obtener donante' });
  }
});

app.patch('/api/donantes/:documento/tipo-sangre', authenticateToken, async (req, res) => {
  try {
    const { documento } = req.params;
    const { tipo_sangre } = req.body;
    const userId = req.user.id;

    // Verify user owns this donante
    const checkResult = await pool.query(
      'SELECT user_id FROM donantes WHERE documento = $1',
      [documento]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await pool.query(
      'UPDATE donantes SET tipo_sangre = $1 WHERE documento = $2',
      [tipo_sangre, documento]
    );

    res.json({ message: 'Tipo de sangre actualizado' });
  } catch (error) {
    console.error('Error actualizando tipo de sangre:', error);
    res.status(500).json({ error: 'Error al actualizar tipo de sangre' });
  }
});

// Historias Clínicas Routes
app.get('/api/historias-clinicas', authenticateToken, async (req, res) => {
  try {
    const tipo = req.user.tipo;

    if (tipo === 'entidad') {
      // Entidades can see all historias
      const result = await pool.query(
        `SELECT h.*, d.nombre as donante_nombre, d.documento as donante_documento 
         FROM historias_clinicas h
         JOIN donantes d ON h.documento_donante = d.documento
         ORDER BY h.fecha_envio DESC`
      );
      // Transform to include donante object
      const historias = result.rows.map(row => ({
        ...row,
        donantes: {
          nombre: row.donante_nombre,
          documento: row.donante_documento
        }
      }));
      res.json(historias);
    } else {
      // Donantes can only see their own historia
      const donanteResult = await pool.query(
        'SELECT documento FROM donantes WHERE user_id = $1',
        [req.user.id]
      );

      if (donanteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Donante no encontrado' });
      }

      const documento = donanteResult.rows[0].documento;
      const result = await pool.query(
        'SELECT * FROM historias_clinicas WHERE documento_donante = $1',
        [documento]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error obteniendo historias:', error);
    res.status(500).json({ error: 'Error al obtener historias clínicas' });
  }
});

app.get('/api/historias-clinicas/:documento', authenticateToken, async (req, res) => {
  try {
    const { documento } = req.params;
    const userId = req.user.id;

    // Verify user owns this historia
    const donanteResult = await pool.query(
      'SELECT user_id FROM donantes WHERE documento = $1',
      [documento]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    if (req.user.tipo === 'donante' && donanteResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const result = await pool.query(
      'SELECT * FROM historias_clinicas WHERE documento_donante = $1',
      [documento]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo historia:', error);
    res.status(500).json({ error: 'Error al obtener historia clínica' });
  }
});

app.post('/api/historias-clinicas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.tipo !== 'donante') {
      return res.status(403).json({ error: 'Solo los donantes pueden crear historias clínicas' });
    }

    // Get donante documento
    const donanteResult = await pool.query(
      'SELECT documento FROM donantes WHERE user_id = $1',
      [userId]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    const documento = donanteResult.rows[0].documento;
    const {
      edad, peso, altura, enfermedades, medicamentos,
      transfusiones_previas, habitos_personales, observaciones,
      fecha_ultima_donacion
    } = req.body;

    // Check if historia already exists
    const existingResult = await pool.query(
      'SELECT id FROM historias_clinicas WHERE documento_donante = $1',
      [documento]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE historias_clinicas SET
          edad = $1, peso = $2, altura = $3, enfermedades = $4,
          medicamentos = $5, transfusiones_previas = $6,
          habitos_personales = $7, observaciones = $8,
          fecha_ultima_donacion = $9, estado = 'Pendiente',
          fecha_envio = NOW()
         WHERE documento_donante = $10`,
        [
          edad, peso, altura, enfermedades, medicamentos,
          transfusiones_previas, habitos_personales, observaciones,
          fecha_ultima_donacion, documento
        ]
      );
    } else {
      // Create new
      await pool.query(
        `INSERT INTO historias_clinicas (
          documento_donante, edad, peso, altura, enfermedades,
          medicamentos, transfusiones_previas, habitos_personales,
          observaciones, fecha_ultima_donacion, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pendiente')`,
        [
          documento, edad, peso, altura, enfermedades,
          medicamentos, transfusiones_previas, habitos_personales,
          observaciones, fecha_ultima_donacion
        ]
      );
    }

    res.json({ message: 'Historia clínica guardada' });
  } catch (error) {
    console.error('Error guardando historia:', error);
    res.status(500).json({ error: 'Error al guardar historia clínica' });
  }
});

app.patch('/api/historias-clinicas/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden actualizar historias' });
    }

    const { id } = req.params;
    const { estado, observaciones_medicas } = req.body;

    await pool.query(
      `UPDATE historias_clinicas SET
        estado = $1, observaciones_medicas = $2,
        fecha_revision = NOW()
       WHERE id = $3`,
      [estado, observaciones_medicas, id]
    );

    res.json({ message: 'Historia clínica actualizada' });
  } catch (error) {
    console.error('Error actualizando historia:', error);
    res.status(500).json({ error: 'Error al actualizar historia clínica' });
  }
});

// Donaciones Routes
app.get('/api/donaciones', authenticateToken, async (req, res) => {
  try {
    const tipo = req.user.tipo;

    if (tipo === 'entidad') {
      // Entidades can see all donaciones with donante info
      const result = await pool.query(
        `SELECT d.*, don.nombre as donante_nombre, don.tipo_sangre as donante_tipo_sangre
         FROM donaciones d
         JOIN donantes don ON d.documento_donante = don.documento
         ORDER BY d.fecha_donacion DESC`
      );
      // Transform to include donante object
      const donaciones = result.rows.map(row => ({
        ...row,
        donantes: {
          nombre: row.donante_nombre,
          tipo_sangre: row.donante_tipo_sangre
        }
      }));
      res.json(donaciones);
    } else {
      // Donantes can only see their own donaciones
      const donanteResult = await pool.query(
        'SELECT documento FROM donantes WHERE user_id = $1',
        [req.user.id]
      );

      if (donanteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Donante no encontrado' });
      }

      const documento = donanteResult.rows[0].documento;
      const result = await pool.query(
        'SELECT * FROM donaciones WHERE documento_donante = $1 ORDER BY fecha_donacion DESC',
        [documento]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error obteniendo donaciones:', error);
    res.status(500).json({ error: 'Error al obtener donaciones' });
  }
});

app.post('/api/donaciones', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden crear donaciones' });
    }

    const {
      documento_donante,
      fecha_donacion,
      cantidad_ml,
      centro,
      observaciones
    } = req.body;

    await pool.query(
      `INSERT INTO donaciones (
        documento_donante, fecha_donacion, cantidad_ml, centro, observaciones
      ) VALUES ($1, $2, $3, $4, $5)`,
      [documento_donante, fecha_donacion, cantidad_ml, centro, observaciones]
    );

    // Update inventory automatically via trigger, but we'll also update it here explicitly
    const donanteResult = await pool.query(
      'SELECT tipo_sangre FROM donantes WHERE documento = $1',
      [documento_donante]
    );

    if (donanteResult.rows.length > 0 && donanteResult.rows[0].tipo_sangre) {
      const entidadResult = await pool.query(
        'SELECT id FROM entidades WHERE user_id = $1',
        [req.user.id]
      );

      if (entidadResult.rows.length > 0) {
        const entidadId = entidadResult.rows[0].id;
        const tipoSangre = donanteResult.rows[0].tipo_sangre;

        await pool.query(
          `INSERT INTO inventario_sangre (entidad_id, tipo_sangre, cantidad_ml, cantidad_unidades, centro)
           VALUES ($1, $2, $3, 1, $4)
           ON CONFLICT (entidad_id, tipo_sangre)
           DO UPDATE SET
             cantidad_ml = inventario_sangre.cantidad_ml + $3,
             cantidad_unidades = inventario_sangre.cantidad_unidades + 1,
             fecha_actualizacion = NOW()`,
          [entidadId, tipoSangre, cantidad_ml, centro || entidadResult.rows[0].nombre]
        );
      }
    }

    res.json({ message: 'Donación registrada' });
  } catch (error) {
    console.error('Error registrando donación:', error);
    res.status(500).json({ error: 'Error al registrar donación' });
  }
});

// Solicitudes Routes
app.get('/api/solicitudes', authenticateToken, async (req, res) => {
  try {
    const tipo = req.user.tipo;

    if (tipo === 'entidad') {
      // Entidades can only see their own solicitudes
      const entidadResult = await pool.query(
        'SELECT id FROM entidades WHERE user_id = $1',
        [req.user.id]
      );

      if (entidadResult.rows.length === 0) {
        return res.status(404).json({ error: 'Entidad no encontrada' });
      }

      const entidadId = entidadResult.rows[0].id;
      const result = await pool.query(
        'SELECT * FROM solicitudes WHERE entidad_id = $1 ORDER BY fecha_solicitud DESC',
        [entidadId]
      );
      res.json(result.rows);
    } else {
      // Donantes can see solicitudes matching their blood type
      const donanteResult = await pool.query(
        'SELECT tipo_sangre FROM donantes WHERE user_id = $1',
        [req.user.id]
      );

      if (donanteResult.rows.length === 0 || !donanteResult.rows[0].tipo_sangre) {
        return res.json([]);
      }

      const tipoSangre = donanteResult.rows[0].tipo_sangre;
      const result = await pool.query(
        'SELECT * FROM solicitudes WHERE tipo_sangre = $1 ORDER BY fecha_solicitud DESC LIMIT 3',
        [tipoSangre]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

app.post('/api/solicitudes', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden crear solicitudes' });
    }

    const entidadResult = await pool.query(
      'SELECT id, nombre, ubicacion FROM entidades WHERE user_id = $1',
      [req.user.id]
    );

    if (entidadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }

    const entidadId = entidadResult.rows[0].id;
    const {
      tipo_sangre,
      cantidad_ml,
      urgencia,
      fecha_requerida,
      observaciones,
      es_emergencia,
      ubicacion
    } = req.body;

    const solicitudResult = await pool.query(
      `INSERT INTO solicitudes (
        entidad_id, tipo_sangre, cantidad_ml, urgencia, fecha_requerida, observaciones, es_emergencia, ubicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [entidadId, tipo_sangre, cantidad_ml, urgencia, fecha_requerida, observaciones, es_emergencia || false, ubicacion || entidadResult.rows[0].ubicacion]
    );

    const solicitudId = solicitudResult.rows[0].id;

    // Send notifications to compatible donors if not emergency or if emergency
    if (es_emergencia || urgencia === 'Crítica' || urgencia === 'Alta') {
      // Get all compatible donors
      const isEmergency = es_emergencia || false;
      const compatibleDonors = await pool.query(
        `SELECT d.documento, d.nombre, p.recibir_notificaciones, p.solo_emergencias
         FROM donantes d
         LEFT JOIN preferencias_notificaciones p ON d.documento = p.documento_donante
         WHERE d.tipo_sangre = $1
         AND (p.recibir_notificaciones IS NULL OR p.recibir_notificaciones = true)
         AND ($2 = true OR p.solo_emergencias = false OR p.solo_emergencias IS NULL)`,
        [tipo_sangre, isEmergency]
      );

      // Create notifications
      for (const donor of compatibleDonors.rows) {
        const tipoNotificacion = es_emergencia ? 'emergencia' : 'solicitud';
        const titulo = es_emergencia 
          ? '🚨 EMERGENCIA: Solicitud urgente de sangre'
          : `Solicitud de sangre tipo ${tipo_sangre}`;
        const mensaje = `Se requiere ${cantidad_ml}ml de sangre tipo ${tipo_sangre}. ${ubicacion ? `Ubicación: ${ubicacion}` : ''} Urgencia: ${urgencia}`;

        await pool.query(
          `INSERT INTO notificaciones (documento_donante, solicitud_id, tipo, titulo, mensaje)
           VALUES ($1, $2, $3, $4, $5)`,
          [donor.documento, solicitudId, tipoNotificacion, titulo, mensaje]
        );
      }
    }

    res.json({ message: 'Solicitud creada', id: solicitudId });
  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});

// Reports Routes - Donaciones Reports
app.get('/api/reportes/donaciones', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden ver reportes' });
    }

    const { fecha_inicio, fecha_fin, banco, tipo_sangre } = req.query;

    let query = `
      SELECT 
        d.*,
        don.nombre as donante_nombre,
        don.tipo_sangre as donante_tipo_sangre,
        e.nombre as entidad_nombre
      FROM donaciones d
      JOIN donantes don ON d.documento_donante = don.documento
      JOIN entidades e ON d.centro = e.nombre
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (fecha_inicio) {
      query += ` AND d.fecha_donacion >= $${paramCount}`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND d.fecha_donacion <= $${paramCount}`;
      params.push(fecha_fin);
      paramCount++;
    }

    if (banco) {
      query += ` AND d.centro = $${paramCount}`;
      params.push(banco);
      paramCount++;
    }

    if (tipo_sangre) {
      query += ` AND don.tipo_sangre = $${paramCount}`;
      params.push(tipo_sangre);
      paramCount++;
    }

    query += ' ORDER BY d.fecha_donacion DESC';

    const result = await pool.query(query, params);

    // Group by type and calculate statistics
    const stats = {
      total_donaciones: result.rows.length,
      total_ml: result.rows.reduce((sum, d) => sum + (d.cantidad_ml || 0), 0),
      por_tipo_sangre: {},
      por_periodo: {},
      por_banco: {}
    };

    result.rows.forEach(donacion => {
      const tipo = donacion.donante_tipo_sangre || 'No especificado';
      const banco = donacion.centro || 'No especificado';
      const mes = new Date(donacion.fecha_donacion).toISOString().substring(0, 7);

      stats.por_tipo_sangre[tipo] = (stats.por_tipo_sangre[tipo] || 0) + 1;
      stats.por_banco[banco] = (stats.por_banco[banco] || 0) + 1;
      stats.por_periodo[mes] = (stats.por_periodo[mes] || 0) + 1;
    });

    res.json({
      donaciones: result.rows,
      estadisticas: stats
    });
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// Blood Search Routes
app.get('/api/busqueda-sangre', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden buscar sangre' });
    }

    const { tipo_sangre, ciudad, departamento, cantidad_minima, entidad_id } = req.query;

    let query = `
      SELECT 
        i.*,
        e.nombre as entidad_nombre,
        e.ubicacion,
        e.ciudad,
        e.departamento
      FROM inventario_sangre i
      JOIN entidades e ON i.entidad_id = e.id
      WHERE i.cantidad_ml > 0
    `;

    const params = [];
    let paramCount = 1;

    if (tipo_sangre) {
      query += ` AND i.tipo_sangre = $${paramCount}`;
      params.push(tipo_sangre);
      paramCount++;
    }

    if (ciudad) {
      query += ` AND e.ciudad ILIKE $${paramCount}`;
      params.push(`%${ciudad}%`);
      paramCount++;
    }

    if (departamento) {
      query += ` AND e.departamento ILIKE $${paramCount}`;
      params.push(`%${departamento}%`);
      paramCount++;
    }

    if (cantidad_minima) {
      query += ` AND i.cantidad_ml >= $${paramCount}`;
      params.push(parseInt(cantidad_minima));
      paramCount++;
    }

    if (entidad_id) {
      query += ` AND i.entidad_id = $${paramCount}`;
      params.push(entidad_id);
      paramCount++;
    }

    query += ' ORDER BY i.fecha_actualizacion DESC';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.json({ 
        resultados: [],
        mensaje: 'No hay unidades disponibles con los criterios especificados'
      });
    }

    res.json({
      resultados: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error en búsqueda de sangre:', error);
    res.status(500).json({ error: 'Error en búsqueda de sangre' });
  }
});

// Inventory Routes
app.get('/api/inventario', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden ver inventario' });
    }

    const entidadResult = await pool.query(
      'SELECT id FROM entidades WHERE user_id = $1',
      [req.user.id]
    );

    if (entidadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }

    const entidadId = entidadResult.rows[0].id;
    const result = await pool.query(
      'SELECT * FROM inventario_sangre WHERE entidad_id = $1 ORDER BY tipo_sangre',
      [entidadId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

app.patch('/api/inventario/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden actualizar inventario' });
    }

    const { id } = req.params;
    const { cantidad_ml, cantidad_unidades, tipo_operacion } = req.body;

    // Verify inventory belongs to user's entity
    const entidadResult = await pool.query(
      'SELECT id FROM entidades WHERE user_id = $1',
      [req.user.id]
    );

    if (entidadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }

    const entidadId = entidadResult.rows[0].id;
    const inventoryCheck = await pool.query(
      'SELECT * FROM inventario_sangre WHERE id = $1 AND entidad_id = $2',
      [id, entidadId]
    );

    if (inventoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Inventario no encontrado' });
    }

    const current = inventoryCheck.rows[0];
    let newCantidadMl = current.cantidad_ml;
    let newCantidadUnidades = current.cantidad_unidades;

    if (tipo_operacion === 'agregar') {
      newCantidadMl = current.cantidad_ml + (cantidad_ml || 0);
      newCantidadUnidades = current.cantidad_unidades + (cantidad_unidades || 1);
    } else if (tipo_operacion === 'despachar') {
      newCantidadMl = Math.max(0, current.cantidad_ml - (cantidad_ml || 0));
      newCantidadUnidades = Math.max(0, current.cantidad_unidades - (cantidad_unidades || 1));
    } else if (tipo_operacion === 'actualizar') {
      newCantidadMl = cantidad_ml !== undefined ? cantidad_ml : current.cantidad_ml;
      newCantidadUnidades = cantidad_unidades !== undefined ? cantidad_unidades : current.cantidad_unidades;
    }

    await pool.query(
      `UPDATE inventario_sangre 
       SET cantidad_ml = $1, cantidad_unidades = $2, fecha_actualizacion = NOW()
       WHERE id = $3`,
      [newCantidadMl, newCantidadUnidades, id]
    );

    res.json({ message: 'Inventario actualizado' });
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
});

// Notifications Routes
app.get('/api/notificaciones', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'donante') {
      return res.status(403).json({ error: 'Solo los donantes pueden ver notificaciones' });
    }

    const donanteResult = await pool.query(
      'SELECT documento FROM donantes WHERE user_id = $1',
      [req.user.id]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    const documento = donanteResult.rows[0].documento;
    const result = await pool.query(
      `SELECT n.*, s.tipo_sangre, s.urgencia, s.ubicacion
       FROM notificaciones n
       LEFT JOIN solicitudes s ON n.solicitud_id = s.id
       WHERE n.documento_donante = $1
       ORDER BY n.fecha_creacion DESC
       LIMIT 50`,
      [documento]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

app.patch('/api/notificaciones/:id/leer', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'donante') {
      return res.status(403).json({ error: 'Solo los donantes pueden marcar notificaciones' });
    }

    const { id } = req.params;
    const donanteResult = await pool.query(
      'SELECT documento FROM donantes WHERE user_id = $1',
      [req.user.id]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    const documento = donanteResult.rows[0].documento;
    await pool.query(
      `UPDATE notificaciones 
       SET leida = true, fecha_lectura = NOW()
       WHERE id = $1 AND documento_donante = $2`,
      [id, documento]
    );

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error marcando notificación:', error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
});

// Notification Preferences Routes
app.get('/api/preferencias-notificaciones', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'donante') {
      return res.status(403).json({ error: 'Solo los donantes pueden ver preferencias' });
    }

    const donanteResult = await pool.query(
      'SELECT documento FROM donantes WHERE user_id = $1',
      [req.user.id]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    const documento = donanteResult.rows[0].documento;
    const result = await pool.query(
      'SELECT * FROM preferencias_notificaciones WHERE documento_donante = $1',
      [documento]
    );

    if (result.rows.length === 0) {
      // Return default preferences
      res.json({
        documento_donante: documento,
        recibir_notificaciones: true,
        solo_emergencias: false
      });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    res.status(500).json({ error: 'Error al obtener preferencias' });
  }
});

app.put('/api/preferencias-notificaciones', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'donante') {
      return res.status(403).json({ error: 'Solo los donantes pueden actualizar preferencias' });
    }

    const donanteResult = await pool.query(
      'SELECT documento FROM donantes WHERE user_id = $1',
      [req.user.id]
    );

    if (donanteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donante no encontrado' });
    }

    const documento = donanteResult.rows[0].documento;
    const { recibir_notificaciones, solo_emergencias } = req.body;

    await pool.query(
      `INSERT INTO preferencias_notificaciones (documento_donante, recibir_notificaciones, solo_emergencias, fecha_actualizacion)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (documento_donante)
       DO UPDATE SET
         recibir_notificaciones = $2,
         solo_emergencias = $3,
         fecha_actualizacion = NOW()`,
      [documento, recibir_notificaciones !== false, solo_emergencias || false]
    );

    res.json({ message: 'Preferencias actualizadas' });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
});

// Emergency Button Route
app.post('/api/solicitudes/emergencia', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'entidad') {
      return res.status(403).json({ error: 'Solo las entidades pueden crear solicitudes de emergencia' });
    }

    const entidadResult = await pool.query(
      'SELECT id, nombre, ubicacion FROM entidades WHERE user_id = $1',
      [req.user.id]
    );

    if (entidadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }

    const entidadId = entidadResult.rows[0].id;
    const {
      tipo_sangre,
      cantidad_ml,
      observaciones,
      ubicacion
    } = req.body;

    // Create emergency request with highest urgency
    const fechaRequerida = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    const solicitudResult = await pool.query(
      `INSERT INTO solicitudes (
        entidad_id, tipo_sangre, cantidad_ml, urgencia, fecha_requerida, observaciones, es_emergencia, ubicacion
      ) VALUES ($1, $2, $3, 'Crítica', $4, $5, true, $6) RETURNING id`,
      [entidadId, tipo_sangre, cantidad_ml, fechaRequerida, observaciones || 'Solicitud de emergencia', ubicacion || entidadResult.rows[0].ubicacion]
    );

    const solicitudId = solicitudResult.rows[0].id;

    // Send notifications to ALL compatible donors immediately
    const compatibleDonors = await pool.query(
      `SELECT d.documento, d.nombre, p.recibir_notificaciones
       FROM donantes d
       LEFT JOIN preferencias_notificaciones p ON d.documento = p.documento_donante
       WHERE d.tipo_sangre = $1
       AND (p.recibir_notificaciones IS NULL OR p.recibir_notificaciones = true)`,
      [tipo_sangre]
    );

    // Create emergency notifications
    for (const donor of compatibleDonors.rows) {
      const titulo = '🚨 EMERGENCIA URGENTE: Solicitud inmediata de sangre';
      const mensaje = `EMERGENCIA: Se requiere ${cantidad_ml}ml de sangre tipo ${tipo_sangre} de manera URGENTE. ${ubicacion || entidadResult.rows[0].ubicacion ? `Ubicación: ${ubicacion || entidadResult.rows[0].ubicacion}` : ''}`;

      await pool.query(
        `INSERT INTO notificaciones (documento_donante, solicitud_id, tipo, titulo, mensaje)
         VALUES ($1, $2, 'emergencia', $3, $4)`,
        [donor.documento, solicitudId, titulo, mensaje]
      );
    }

    res.json({ 
      message: 'Alerta de emergencia enviada', 
      id: solicitudId,
      donantes_notificados: compatibleDonors.rows.length
    });
  } catch (error) {
    console.error('Error creando solicitud de emergencia:', error);
    res.status(500).json({ error: 'Error al crear solicitud de emergencia' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

