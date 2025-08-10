import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'village_complaint_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Check if database tables exist
async function checkTables() {
  try {
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('complaints', 'complaint_categories', 'users', 'admin_users')
    `, [dbConfig.database]);
    
    return tables.length >= 4; // Should have at least 4 main tables
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Initialize database if needed
async function initializeDatabase() {
  try {
    const tablesExist = await checkTables();
    if (!tablesExist) {
      console.log('⚠️ Database tables not found. Please run the database initialization script:');
      console.log('mysql -u root -p village_complaint_db < config/init-db.sql');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export { pool, testConnection, checkTables, initializeDatabase };
export default pool; 