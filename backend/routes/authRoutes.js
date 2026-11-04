const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username akun admin
 *           example: "admin"
 *         password:
 *           type: string
 *           description: Password akun admin
 *           example: "admin123"
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk autentikasi admin
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Melakukan login admin dan mendapatkan token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil dan token diterbitkan
 *       400:
 *         description: Format input tidak valid
 *       401:
 *         description: Kredensial tidak cocok
 */
router.post('/login', login);

module.exports = router;

