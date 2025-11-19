// Script de prueba para verificar la conexión a la base de datos
const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('=================================');
console.log('🧪 Probando conexión a la base de datos');
console.log('=================================\n');

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.log('Asegúrate de tener un archivo .env con DATABASE_URL');
  process.exit(1);
}

// Ocultar password en el log
try {
  const urlObj = new URL(DATABASE_URL);
  console.log('📋 Configuración de conexión:');
  console.log('  Host:', urlObj.hostname);
  console.log('  Port:', urlObj.port);
  console.log('  Database:', urlObj.pathname.substring(1));
  console.log('  User:', urlObj.username);
  console.log('  Password:', '***' + urlObj.password.slice(-4));
} catch (err) {
  console.error('❌ ERROR: DATABASE_URL tiene formato inválido');
  console.error('Formato esperado: postgresql://user:password@host:port/database');
  process.exit(1);
}

console.log('\n🔌 Intentando conectar...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test 1: Conexión básica
pool.query('SELECT NOW() as time, version() as version', (err, res) => {
  if (err) {
    console.error('\n❌ ERROR al conectar con la base de datos:');
    console.error('Código:', err.code);
    console.error('Mensaje:', err.message);
    console.error('\n💡 Posibles causas:');
    console.error('  - Credenciales incorrectas');
    console.error('  - Host o puerto incorrectos');
    console.error('  - Firewall bloqueando la conexión');
    console.error('  - Base de datos no existe');
    pool.end();
    process.exit(1);
  } else {
    console.log('✅ Conexión exitosa!');
    console.log('  Hora del servidor:', res.rows[0].time);
    console.log('  Versión de PostgreSQL:', res.rows[0].version.split(',')[0]);
    
    // Test 2: Verificar tablas
    console.log('\n🔍 Verificando tablas...');
    pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `, (err2, res2) => {
      if (err2) {
        console.error('❌ ERROR al consultar tablas:', err2.message);
      } else {
        if (res2.rows.length === 0) {
          console.log('⚠️  No se encontraron tablas');
          console.log('💡 Necesitas ejecutar las migraciones:');
          console.log('   npm run migrate');
        } else {
          console.log('✅ Tablas encontradas:');
          res2.rows.forEach(row => {
            console.log('   -', row.table_name);
          });
        }
      }
      
      pool.end();
      console.log('\n=================================');
      console.log('✅ Prueba completada');
      console.log('=================================');
    });
  }
});

