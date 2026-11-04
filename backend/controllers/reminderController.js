const pool = require('../config/db');
const Joi = require('joi');

// 1. Mengambil data reminder dengan opsi filter status, priority, atau tanggal kelas (GET)
const getAllReminders = async (req, res) => {
  try {
    const { status, priority, date } = req.query;

    let query = `
      SELECT 
        r.id,
        r.status,
        r.priority,
        r.created_at,
        r.updated_at,
        c.id AS customer_id,
        c.name AS customer_name,
        c.whatsapp_number,
        c.preferences,
        s.id AS schedule_id,
        s.class_name,
        s.class_time,
        s.instructor_name
      FROM reminders r
      JOIN customers c ON r.customer_id = c.id
      JOIN schedules s ON r.schedule_id = s.id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`r.status = $${values.length}`);
    }

    if (priority) {
      values.push(priority);
      conditions.push(`r.priority = $${values.length}`);
    }

    if (date) {
      values.push(date);
      conditions.push(`DATE(s.class_time) = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY s.class_time ASC, r.created_at DESC`;

    const result = await pool.query(query, values);
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan di server', error: error.message });
  }
};

// 2. Membuat reminder baru (Otomatisasi Penentuan Prioritas) (POST)
const createReminder = async (req, res) => {
  // Validasi Joi HANYA mensyaratkan customer_id dan schedule_id (priority dihapus dari req.body)
  const schema = Joi.object({
    customer_id: Joi.number().integer().required().messages({
      'number.base': 'ID pelanggan harus berupa angka',
      'any.required': 'ID pelanggan wajib diisi'
    }),
    schedule_id: Joi.number().integer().required().messages({
      'number.base': 'ID jadwal harus berupa angka',
      'any.required': 'ID jadwal wajib diisi'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { customer_id, schedule_id } = req.body;
    let computedPriority = 'Medium'; // Default awal

    // Pastikan customer dan schedule benar-benar ada
    const customerCheck = await pool.query('SELECT id, member_type FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
    }

    const scheduleCheck = await pool.query('SELECT id FROM schedules WHERE id = $1', [schedule_id]);
    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal kelas tidak ditemukan' });
    }

    // LOGIKA USE CASE: AI/Rule-based Klasifikasi Prioritas Otomatis
    const customerData = customerCheck.rows[0];
    
    // Syarat 1: Jika member tipe VIP, otomatis High
    if (customerData.member_type && customerData.member_type.toUpperCase() === 'VIP') {
      computedPriority = 'High';
    } else {
      // Syarat 2: Cek histori 5 interaksi terakhir
      const historyQuery = await pool.query(
        'SELECT status FROM reminders WHERE customer_id = $1 AND status != $2 ORDER BY created_at DESC LIMIT 5',
        [customer_id, 'Scheduled']
      );
      
      const history = historyQuery.rows;
      if (history.length > 0) {
        const noResponseCount = history.filter(h => h.status === 'No Response').length;
        const respondedCount = history.filter(h => h.status === 'Responded').length;

        if (noResponseCount >= 2) {
           computedPriority = 'High'; // Berisiko churn, butuh prioritas tinggi
        } else if (respondedCount > noResponseCount) {
           computedPriority = 'Low'; // Member patuh & mandiri, prioritas diturunkan
        }
      }
    }

    // Insert ke tabel menggunakan priority hasil komputasi (bukan input user)
    const result = await pool.query(
      'INSERT INTO reminders (customer_id, schedule_id, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, schedule_id, computedPriority, 'Scheduled']
    );

    res.status(201).json({
      success: true,
      message: 'Reminder berhasil dibuat secara otomatis',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat reminder', error: error.message });
  }
};

// 3. Memperbarui status follow-up (PATCH /:id/status)
const updateReminderStatus = async (req, res) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('Scheduled', 'Sent', 'Responded', 'No Response')
      .required()
      .messages({
        'any.only': 'Status harus salah satu dari: Scheduled, Sent, Responded, atau No Response',
        'any.required': 'Status wajib diisi'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE reminders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data reminder tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Status reminder berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status reminder', error: error.message });
  }
};

// 4. Menghapus reminder (DELETE /:id)
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reminders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data reminder tidak ditemukan' });
    }

    res.json({ success: true, message: 'Reminder berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus reminder', error: error.message });
  }
};

// Ekspor semua fungsi
module.exports = {
  getAllReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder
};