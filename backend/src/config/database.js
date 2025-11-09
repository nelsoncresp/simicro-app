import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración directa para XAMPP
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'simicro_db'
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a XAMPP MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error BD:', error.message);
  }
};

export default pool;