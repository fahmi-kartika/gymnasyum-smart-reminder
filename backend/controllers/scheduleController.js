const pool = require('../config/db');
const Joi = require('joi');

// 1. Mengambil semua jadwal kelas (GET)
const getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY class_time ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan di server', error: error.message });
  }
};

// 2. Menambah jadwal kelas baru (POST)
const createSchedule = async (req, res) => {
  // Aturan validasi
  const schema = Joi.object({
    class_name: Joi.string().required().messages({
      'string.empty': 'Nama kelas tidak boleh kosong',
      'any.required': 'Nama kelas wajib diisi'
    }),
    class_time: Joi.date().iso().required().messages({
      'date.base': 'Format tanggal dan jam tidak valid',
      'any.required': 'Waktu kelas wajib diisi'
    }),
    instructor_name: Joi.string().allow('', null),
    quota: Joi.number().integer().min(0).default(0)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { class_name, class_time, instructor_name, quota } = req.body;
    const result = await pool.query(
      'INSERT INTO schedules (class_name, class_time, instructor_name, quota) VALUES ($1, $2, $3, $4) RETURNING *',
      [class_name, class_time, instructor_name, quota || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Jadwal kelas berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat jadwal kelas', error: error.message });
  }
};

module.exports = { getAllSchedules, createSchedule };

// 3. Mengambil satu jadwal berdasarkan ID (GET /:id)
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal kelas tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan di server', error: error.message });
  }
};

// 4. Memperbarui jadwal kelas (PUT /:id)
const updateSchedule = async (req, res) => {
  const schema = Joi.object({
    class_name: Joi.string().required().messages({
      'string.empty': 'Nama kelas tidak boleh kosong',
      'any.required': 'Nama kelas wajib diisi'
    }),
    class_time: Joi.date().iso().required().messages({
      'date.base': 'Format tanggal dan jam tidak valid',
      'any.required': 'Waktu kelas wajib diisi'
    }),
    instructor_name: Joi.string().allow('', null),
    quota: Joi.number().integer().min(0).default(0)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const { class_name, class_time, instructor_name, quota } = req.body;

    const result = await pool.query(
      'UPDATE schedules SET class_name = $1, class_time = $2, instructor_name = $3, quota = $4 WHERE id = $5 RETURNING *',
      [class_name, class_time, instructor_name, quota || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal kelas tidak ditemukan' });
    }

    res.json({ success: true, message: 'Jadwal kelas berhasil diperbarui', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal kelas', error: error.message });
  }
};

// 5. Menghapus jadwal kelas (DELETE /:id)
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal kelas tidak ditemukan' });
    }

    res.json({ success: true, message: 'Jadwal kelas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal kelas', error: error.message });
  }
};

// Ekspor semua fungsi
module.exports = {
  getAllSchedules,
  createSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};