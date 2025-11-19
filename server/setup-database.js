// Script para configurar la base de datos ejecutando todas las migraciones
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('=================================');
console.log('🗄️  Configuración de Base de Datos');
console.log('=================================\n');

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations() {
  try {
    console.log('📋 Buscando migraciones en:', migrationsDir);
    
    // Leer todos los archivos SQL de la carpeta migrations
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente
    
    if (files.length === 0) {
      console.log('⚠️  No se encontraron archivos de migración');
      process.exit(1);
    }
    
    console.log(`✅ Encontradas ${files.length} migraciones:\n`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log('');
    
    // Ejecutar cada migración
    for (const file of files) {
      console.log(`🔄 Ejecutando: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ ${file} ejecutado exitosamente\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${file} - Las tablas ya existen (ignorando)\n`);
        } else {
          throw error;
        }
      }
    }
    
    // Verificar las tablas creadas
    console.log('🔍 Verificando tablas creadas...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n✅ Tablas en la base de datos (${result.rows.length}):\n`);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n=================================');
    console.log('✅ Base de datos configurada correctamente');
    console.log('=================================\n');
    
  } catch (error) {
    console.error('\n❌ ERROR al ejecutar migraciones:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('\nDetalles completos:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

