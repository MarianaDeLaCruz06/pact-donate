const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Usar la URL de conexión directamente si no está en .env
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:tgerjFFtMjEWUdzWDhVDOvKYWNGFCHvn@turntable.proxy.rlwy.net:33001/railway';

console.log('DATABASE_URL:', DATABASE_URL ? 'Configurada' : 'No configurada');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railway requiere SSL
});

async function runMigration() {
  try {
    console.log('Conectando a la base de datos...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '001_init.sql'),
      'utf8'
    );

    console.log('Ejecutando migración...');
    await pool.query(migrationSQL);
    
    console.log('✅ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

