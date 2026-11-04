const pool = require('../config/db');

const seedData = async () => {
  try {
    console.log('⏳ Memulai pengisian data dummy Gymnasyum...');

    // 1. Bersihkan data lama jika ingin reset (opsional: matikan jika ingin mempertahankan)
    await pool.query('DELETE FROM reminders');
    await pool.query('DELETE FROM schedules');
    await pool.query('DELETE FROM customers');
    await pool.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE schedules_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE reminders_id_seq RESTART WITH 1');

    console.log('🧹 Data tabel berhasil dibersihkan.');

    // 2. Data Pelanggan (Customers)
    const customersData = [
      { name: 'Fahmi Nugroho', whatsapp_number: '081234567891', member_type: 'VIP', preferences: 'Fokus pembentukan massa otot dan strength training' },
      { name: 'Siti Rahmawati', whatsapp_number: '082198765432', member_type: 'Regular', preferences: 'Latihan kardio ringan, peregangan yoga' },
      { name: 'Budi Santoso', whatsapp_number: '085712345678', member_type: 'Regular', preferences: 'Program penurunan berat badan, HIIT' },
      { name: 'Dewi Lestari', whatsapp_number: '081387654321', member_type: 'VIP', preferences: 'Pilates dan latihan kelenturan tubuh' },
      { name: 'Reza Pratama', whatsapp_number: '087811223344', member_type: 'Regular', preferences: 'Calisthenics dan bodyweight workout' },
      { name: 'Anisa Putri', whatsapp_number: '089655443322', member_type: 'VIP', preferences: 'Zumba kebugaran dan kardio intensif' },
      { name: 'Dimas Anggara', whatsapp_number: '081299887766', member_type: 'Regular', preferences: 'Latihan beban dasar dan bench press' },
      { name: 'Nadia Safitri', whatsapp_number: '085611229988', member_type: 'Regular', preferences: 'Yoga relaksasi pasca kerja' },
      { name: 'Farhan Maulana', whatsapp_number: '081344556677', member_type: 'VIP', preferences: 'Persiapan marathon, ketahanan kardio' },
      { name: 'Intan Permata', whatsapp_number: '082266778899', member_type: 'Regular', preferences: 'Senam aerobik dan pembakaran lemak' }
    ];

    const customerInsertQuery = `
      INSERT INTO customers (name, whatsapp_number, member_type, preferences)
      VALUES ($1, $2, $3, $4) RETURNING id;
    `;

    const insertedCustomerIds = [];
    for (const c of customersData) {
      const res = await pool.query(customerInsertQuery, [c.name, c.whatsapp_number, c.member_type, c.preferences]);
      insertedCustomerIds.push(res.rows[0].id);
    }
    console.log(`✅ Berhasil menambahkan ${insertedCustomerIds.length} data member.`);

    // 3. Data Jadwal Kelas (Schedules)
    // Menghasilkan tanggal dinamis: Kemarin, Hari Ini, dan Hari Mendatang
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const schedulesData = [
      // Jadwal Hari Ini
      { class_name: 'Power Yoga Pagi', class_time: `${todayStr} 09:00:00`, instructor_name: 'Coach Maya', quota: 15 },
      { class_name: 'Body Combat HIIT', class_time: `${todayStr} 14:00:00`, instructor_name: 'Coach Rian', quota: 12 },
      { class_name: 'Zumba Fitness Party', class_time: `${todayStr} 16:30:00`, instructor_name: 'Coach Sarah', quota: 20 },
      { class_name: 'Strength & Core Camp', class_time: `${todayStr} 19:00:00`, instructor_name: 'Coach Dimas', quota: 10 },
      
      // Jadwal Besok
      { class_name: 'Morning Pilates Balance', class_time: `${tomorrowStr} 08:30:00`, instructor_name: 'Coach Maya', quota: 12 },
      { class_name: 'Spinning Cardio Burst', class_time: `${tomorrowStr} 17:00:00`, instructor_name: 'Coach Budi', quota: 15 },
      
      // Jadwal Lusa
      { class_name: 'Functional Strength Training', class_time: `${dayAfterTomorrowStr} 10:00:00`, instructor_name: 'Coach Dimas', quota: 10 },
      
      // Jadwal Kemarin (Untuk Riwayat)
      { class_name: 'Aerobic Fat Loss', class_time: `${yesterdayStr} 16:00:00`, instructor_name: 'Coach Sarah', quota: 15 }
    ];

    const scheduleInsertQuery = `
      INSERT INTO schedules (class_name, class_time, instructor_name, quota)
      VALUES ($1, $2, $3, $4) RETURNING id;
    `;

    const insertedScheduleIds = [];
    for (const s of schedulesData) {
      const res = await pool.query(scheduleInsertQuery, [s.class_name, s.class_time, s.instructor_name, s.quota]);
      insertedScheduleIds.push(res.rows[0].id);
    }
    console.log(`✅ Berhasil menambahkan ${insertedScheduleIds.length} data jadwal kelas.`);

    // 4. Data Reminder (Antrean Hari Ini dan Riwayat)
    // insertedScheduleIds: [0..3]=Hari Ini, [4..5]=Besok, [6]=Lusa, [7]=Kemarin
    const remindersData = [
      // Antrean Hari Ini
      { customer_id: insertedCustomerIds[0], schedule_id: insertedScheduleIds[0], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[1], schedule_id: insertedScheduleIds[0], priority: 'Low', status: 'Sent' },
      { customer_id: insertedCustomerIds[2], schedule_id: insertedScheduleIds[0], priority: 'Medium', status: 'Responded' },
      
      { customer_id: insertedCustomerIds[3], schedule_id: insertedScheduleIds[1], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[4], schedule_id: insertedScheduleIds[1], priority: 'Medium', status: 'No Response' },
      
      { customer_id: insertedCustomerIds[5], schedule_id: insertedScheduleIds[2], priority: 'Low', status: 'Responded' },
      { customer_id: insertedCustomerIds[6], schedule_id: insertedScheduleIds[2], priority: 'Medium', status: 'Sent' },
      { customer_id: insertedCustomerIds[7], schedule_id: insertedScheduleIds[2], priority: 'High', status: 'No Response' },
      
      { customer_id: insertedCustomerIds[8], schedule_id: insertedScheduleIds[3], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[9], schedule_id: insertedScheduleIds[3], priority: 'Low', status: 'Responded' },

      // Riwayat Reminder Sebelumnya (Kelas Kemarin)
      { customer_id: insertedCustomerIds[0], schedule_id: insertedScheduleIds[7], priority: 'Medium', status: 'Responded' },
      { customer_id: insertedCustomerIds[1], schedule_id: insertedScheduleIds[7], priority: 'Low', status: 'Responded' },
      { customer_id: insertedCustomerIds[4], schedule_id: insertedScheduleIds[7], priority: 'High', status: 'No Response' }
    ];

    const reminderInsertQuery = `
      INSERT INTO reminders (customer_id, schedule_id, priority, status)
      VALUES ($1, $2, $3, $4);
    `;

    for (const r of remindersData) {
      await pool.query(reminderInsertQuery, [r.customer_id, r.schedule_id, r.priority, r.status]);
    }
    console.log(`✅ Berhasil menambahkan ${remindersData.length} data antrean reminder.`);

    console.log('🎉 Seeder data dummy selesai dijalankan dengan sukses!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menjalankan seeder data dummy:', error.message);
    process.exit(1);
  }
};

seedData();
