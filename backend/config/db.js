const { Pool } = require('pg');
require('dotenv').config(); // Membaca file .env

// Membuat koneksi ke database menggunakan data dari .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Mengetes apakah koneksi berhasil
pool.connect()
  .then(() => console.log('✅ Berhasil terhubung ke database PostgreSQL!'))
  .catch((err) => console.error('❌ Gagal terhubung ke database:', err.message));

// Mengekspor 'pool' agar nanti bisa dipakai di tempat lain untuk query CRUD
module.exports = pool;