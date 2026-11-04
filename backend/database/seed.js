const pool = require('../config/db');

const seedData = async () => {
  try {
    console.log('⏳ Memulai pengisian data dummy Gymnasyum (21 item tiap tabel)...');

    // 1. Bersihkan data tabel dan reset sequence ID
    await pool.query('DELETE FROM reminders');
    await pool.query('DELETE FROM schedules');
    await pool.query('DELETE FROM customers');
    await pool.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE schedules_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE reminders_id_seq RESTART WITH 1');

    console.log('🧹 Data tabel lama berhasil dibersihkan.');

    // 2. Data Pelanggan (21 Customers)
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
      { name: 'Intan Permata', whatsapp_number: '082266778899', member_type: 'Regular', preferences: 'Senam aerobik dan pembakaran lemak' },
      { name: 'Hendra Wijaya', whatsapp_number: '081223344556', member_type: 'VIP', preferences: 'Hypertrophy program dan deadlift' },
      { name: 'Maya Anggraini', whatsapp_number: '085799881122', member_type: 'Regular', preferences: 'Pengencangan otot tubuh dan senam lantai' },
      { name: 'Rian Hidayat', whatsapp_number: '087788990011', member_type: 'Regular', preferences: 'Latihan kelincahan dan crossfit ringan' },
      { name: 'Tiara Kusuma', whatsapp_number: '081377665544', member_type: 'VIP', preferences: 'Core strength dan functional mobility' },
      { name: 'Gilang Ramadhan', whatsapp_number: '082133445566', member_type: 'Regular', preferences: 'Kebugaran umum dan stamina treadmill' },
      { name: 'Putri Wulandari', whatsapp_number: '089511223344', member_type: 'Regular', preferences: 'Senam irama dan kardio pemula' },
      { name: 'Agus Prasetyo', whatsapp_number: '081288776655', member_type: 'Regular', preferences: 'Pemulihan postur tubuh dan stretching' },
      { name: 'Ratna Sari', whatsapp_number: '085644332211', member_type: 'VIP', preferences: 'Pilates reformer dan relaksasi tulang belakang' },
      { name: 'Ilham Saputra', whatsapp_number: '087822334455', member_type: 'Regular', preferences: 'Circuit training dan kettlebell workout' },
      { name: 'Mega Utami', whatsapp_number: '081399001122', member_type: 'VIP', preferences: 'Body pump dan endurance training' },
      { name: 'Bayu Kurniawan', whatsapp_number: '082211998877', member_type: 'Regular', preferences: 'Powerlifting dan compound movement' }
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

    // 3. Data Jadwal Kelas (21 Schedules dengan tanggal dinamis)
    const today = new Date();
    const getDateOffset = (offsetDays) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const yesterdayStr = getDateOffset(-1);
    const todayStr = getDateOffset(0);
    const tomorrowStr = getDateOffset(1);
    const dayPlus2Str = getDateOffset(2);
    const dayPlus3Str = getDateOffset(3);
    const dayPlus4Str = getDateOffset(4);
    const dayPlus5Str = getDateOffset(5);

    const schedulesData = [
      // Selesai (Kemarin) - 4 Kelas
      { class_name: 'Aerobic Fat Loss', class_time: `${yesterdayStr} 16:00:00`, instructor_name: 'Coach Sarah', quota: 15 },
      { class_name: 'Evening Body Combat', class_time: `${yesterdayStr} 17:30:00`, instructor_name: 'Coach Rian', quota: 12 },
      { class_name: 'Sunset Yoga Flow', class_time: `${yesterdayStr} 19:00:00`, instructor_name: 'Coach Maya', quota: 10 },
      { class_name: 'Functional Core Night', class_time: `${yesterdayStr} 20:00:00`, instructor_name: 'Coach Dimas', quota: 10 },

      // Hari Ini - 6 Kelas
      { class_name: 'Power Yoga Pagi', class_time: `${todayStr} 07:00:00`, instructor_name: 'Coach Maya', quota: 15 },
      { class_name: 'Morning Spin & Cycle', class_time: `${todayStr} 08:30:00`, instructor_name: 'Coach Budi', quota: 15 },
      { class_name: 'Body Combat HIIT', class_time: `${todayStr} 11:00:00`, instructor_name: 'Coach Rian', quota: 12 },
      { class_name: 'Zumba Fitness Party', class_time: `${todayStr} 14:00:00`, instructor_name: 'Coach Sarah', quota: 20 },
      { class_name: 'Strength & Core Camp', class_time: `${todayStr} 16:30:00`, instructor_name: 'Coach Dimas', quota: 10 },
      { class_name: 'Pilates Mat Express', class_time: `${todayStr} 19:00:00`, instructor_name: 'Coach Lisa', quota: 12 },

      // Besok - 4 Kelas
      { class_name: 'Morning Pilates Balance', class_time: `${tomorrowStr} 08:00:00`, instructor_name: 'Coach Lisa', quota: 12 },
      { class_name: 'Spinning Cardio Burst', class_time: `${tomorrowStr} 10:30:00`, instructor_name: 'Coach Budi', quota: 15 },
      { class_name: 'Abs & Glutes Burner', class_time: `${tomorrowStr} 15:00:00`, instructor_name: 'Coach Sarah', quota: 15 },
      { class_name: 'Kettlebell Circuit Pro', class_time: `${tomorrowStr} 18:30:00`, instructor_name: 'Coach Kevin', quota: 10 },

      // Lusa (+2) - 4 Kelas
      { class_name: 'Functional Strength Training', class_time: `${dayPlus2Str} 09:00:00`, instructor_name: 'Coach Dimas', quota: 10 },
      { class_name: 'Crossfit Conditioning', class_time: `${dayPlus2Str} 13:30:00`, instructor_name: 'Coach Kevin', quota: 12 },
      { class_name: 'Dance Aerobic Cardio', class_time: `${dayPlus2Str} 16:00:00`, instructor_name: 'Coach Sarah', quota: 20 },
      { class_name: 'Barbell Masterclass', class_time: `${dayPlus2Str} 19:00:00`, instructor_name: 'Coach Dimas', quota: 8 },

      // Mendatang (+3 s/d +5) - 3 Kelas
      { class_name: 'Dynamic Flow Yoga', class_time: `${dayPlus3Str} 08:00:00`, instructor_name: 'Coach Maya', quota: 15 },
      { class_name: 'Total Body Shred', class_time: `${dayPlus4Str} 10:00:00`, instructor_name: 'Coach Rian', quota: 12 },
      { class_name: 'Weekend Bootcamp Special', class_time: `${dayPlus5Str} 07:30:00`, instructor_name: 'Coach Kevin', quota: 25 }
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

    // 4. Data Reminder (21 Reminders dengan variasi status & prioritas lengkap)
    const remindersData = [
      // Scheduled (5 items)
      { customer_id: insertedCustomerIds[0], schedule_id: insertedScheduleIds[4], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[3], schedule_id: insertedScheduleIds[6], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[8], schedule_id: insertedScheduleIds[8], priority: 'High', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[10], schedule_id: insertedScheduleIds[10], priority: 'Medium', status: 'Scheduled' },
      { customer_id: insertedCustomerIds[13], schedule_id: insertedScheduleIds[12], priority: 'Low', status: 'Scheduled' },

      // Sent (6 items)
      { customer_id: insertedCustomerIds[1], schedule_id: insertedScheduleIds[4], priority: 'Low', status: 'Sent' },
      { customer_id: insertedCustomerIds[6], schedule_id: insertedScheduleIds[7], priority: 'Medium', status: 'Sent' },
      { customer_id: insertedCustomerIds[11], schedule_id: insertedScheduleIds[9], priority: 'High', status: 'Sent' },
      { customer_id: insertedCustomerIds[14], schedule_id: insertedScheduleIds[11], priority: 'Medium', status: 'Sent' },
      { customer_id: insertedCustomerIds[16], schedule_id: insertedScheduleIds[14], priority: 'Low', status: 'Sent' },
      { customer_id: insertedCustomerIds[19], schedule_id: insertedScheduleIds[16], priority: 'High', status: 'Sent' },

      // Responded (5 items)
      { customer_id: insertedCustomerIds[2], schedule_id: insertedScheduleIds[4], priority: 'Medium', status: 'Responded' },
      { customer_id: insertedCustomerIds[5], schedule_id: insertedScheduleIds[7], priority: 'Low', status: 'Responded' },
      { customer_id: insertedCustomerIds[9], schedule_id: insertedScheduleIds[8], priority: 'Low', status: 'Responded' },
      { customer_id: insertedCustomerIds[17], schedule_id: insertedScheduleIds[15], priority: 'High', status: 'Responded' },
      { customer_id: insertedCustomerIds[20], schedule_id: insertedScheduleIds[17], priority: 'Medium', status: 'Responded' },

      // No Response (5 items)
      { customer_id: insertedCustomerIds[4], schedule_id: insertedScheduleIds[6], priority: 'Medium', status: 'No Response' },
      { customer_id: insertedCustomerIds[7], schedule_id: insertedScheduleIds[7], priority: 'High', status: 'No Response' },
      { customer_id: insertedCustomerIds[12], schedule_id: insertedScheduleIds[10], priority: 'Low', status: 'No Response' },
      { customer_id: insertedCustomerIds[15], schedule_id: insertedScheduleIds[13], priority: 'High', status: 'No Response' },
      { customer_id: insertedCustomerIds[18], schedule_id: insertedScheduleIds[15], priority: 'Medium', status: 'No Response' }
    ];

    const reminderInsertQuery = `
      INSERT INTO reminders (customer_id, schedule_id, priority, status)
      VALUES ($1, $2, $3, $4);
    `;

    for (const r of remindersData) {
      await pool.query(reminderInsertQuery, [r.customer_id, r.schedule_id, r.priority, r.status]);
    }
    console.log(`✅ Berhasil menambahkan ${remindersData.length} data antrean reminder.`);

    console.log('🎉 Seeder 21 data dummy selesai dijalankan dengan sukses!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menjalankan seeder data dummy:', error.message);
    process.exit(1);
  }
};

seedData();
