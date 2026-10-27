const pool = require('../config/db');
const Joi = require('joi');

// 1. Mengambil semua data reminder beserta detail customer dan schedule (GET)
const getAllReminders = async (req, res) => {
  try {
    const query = `
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
      ORDER BY s.class_time ASC, r.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan di server', error: error.message });
  }
};

// 2. Membuat reminder baru (Menghubungkan Customer ke Jadwal) (POST)
const createReminder = async (req, res) => {
  const schema = Joi.object({
    customer_id: Joi.number().integer().required().messages({
      'number.base': 'ID pelanggan harus berupa angka',
      'any.required': 'ID pelanggan wajib diisi'
    }),
    schedule_id: Joi.number().integer().required().messages({
      'number.base': 'ID jadwal harus berupa angka',
      'any.required': 'ID jadwal wajib diisi'
    }),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { customer_id, schedule_id, priority } = req.body;

    // Pastikan customer dan schedule benar-benar ada di database
    const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [customer_id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
    }

    const scheduleCheck = await pool.query('SELECT id FROM schedules WHERE id = $1', [schedule_id]);
    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal kelas tidak ditemukan' });
    }

    const result = await pool.query(
      'INSERT INTO reminders (customer_id, schedule_id, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, schedule_id, priority || 'Medium', 'Scheduled']
    );

    res.status(201).json({
      success: true,
      message: 'Reminder berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat reminder', error: error.message });
  }
};

module.exports = { getAllReminders, createReminder };