const pool = require('../config/db');
const Joi = require('joi');

// 1. Mengambil semua data pelanggan (GET)
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan di server', error: error.message });
  }
};

// 2. Menambah pelanggan baru (POST)
const createCustomer = async (req, res) => {
  // a. Membuat aturan validasi dengan Joi
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Nama tidak boleh kosong',
      'any.required': 'Nama wajib diisi'
    }),
    whatsapp_number: Joi.string().required().messages({
      'string.empty': 'Nomor WhatsApp tidak boleh kosong',
      'any.required': 'Nomor WhatsApp wajib diisi'
    }),
    member_type: Joi.string().allow('', null), // Boleh kosong
    preferences: Joi.string().allow('', null) // Boleh kosong
  });

  // b. Mengecek apakah data dari frontend sesuai aturan
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  // c. Jika lolos validasi, simpan ke PostgreSQL
  try {
    const { name, whatsapp_number, member_type, preferences } = req.body;
    const result = await pool.query(
      'INSERT INTO customers (name, whatsapp_number, member_type, preferences) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, whatsapp_number, member_type, preferences]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Pelanggan berhasil ditambahkan', 
      data: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambah pelanggan', error: error.message });
  }
};

module.exports = { getAllCustomers, createCustomer };