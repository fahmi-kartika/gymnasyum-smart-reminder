const pool = require('../config/db');

const createTables = async () => {
  try {
    console.log('⏳ Memulai pembuatan tabel database...');

    // 1. Query untuk tabel Customers
    // Menyimpan data profil member dan preferensi/kondisi fisik mereka
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        member_type VARCHAR(50),
        preferences TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Query untuk tabel Schedules (Jadwal Kelas)
    // Menyimpan data kelas, jam mulai (class_time), dan instruktur
    const createSchedulesTable = `
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        class_name VARCHAR(100) NOT NULL,
        class_time TIMESTAMP NOT NULL,
        instructor_name VARCHAR(100),
        quota INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Query untuk tabel Reminders (Relasi Follow-up)
    // Menghubungkan Customer dan Schedule, serta melacak status (Scheduled, Sent, dll)
    const createRemindersTable = `
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
        customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'Scheduled',
        priority VARCHAR(20) DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Eksekusi query secara berurutan
    await pool.query(createCustomersTable);
    console.log('✅ Tabel "customers" berhasil disiapkan.');

    await pool.query(createSchedulesTable);
    console.log('✅ Tabel "schedules" berhasil disiapkan.');

    await pool.query(createRemindersTable);
    console.log('✅ Tabel "reminders" berhasil disiapkan.');

    console.log('🎉 Semua tabel database berhasil dibuat!');
    process.exit(0); // Matikan proses setelah selesai
  } catch (error) {
    console.error('❌ Gagal membuat tabel:', error.message);
    process.exit(1);
  }
};

// Jalankan fungsi
createTables();