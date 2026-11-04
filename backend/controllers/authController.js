const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Menangani proses login admin
const login = async (req, res) => {
  // Validasi format data input
  const schema = Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username tidak boleh kosong',
      'any.required': 'Username wajib diisi'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password tidak boleh kosong',
      'any.required': 'Password wajib diisi'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { username, password } = req.body;
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = process.env.JWT_SECRET || 'gymnasyum_secret_key';

  // Verifikasi kecocokan kredensial admin
  if (username !== validUsername || password !== validPassword) {
    return res.status(401).json({
      success: false,
      message: 'Username atau password salah'
    });
  }

  // Pembuatan token JWT dengan masa aktif 1 hari
  const token = jwt.sign(
    { role: 'admin', username: validUsername },
    jwtSecret,
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    message: 'Login berhasil',
    token,
    user: {
      username: validUsername,
      role: 'Administrator'
    }
  });
};

module.exports = { login };

