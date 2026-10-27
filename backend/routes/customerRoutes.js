const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - whatsapp_number
 *       properties:
 *         name:
 *           type: string
 *           description: Nama lengkap pelanggan
 *           example: "Ibu Ratna"
 *         whatsapp_number:
 *           type: string
 *           description: Nomor WhatsApp aktif
 *           example: "081234567890"
 *         member_type:
 *           type: string
 *           description: Kategori keanggotaan (VIP/Reguler)
 *           example: "VIP"
 *         preferences:
 *           type: string
 *           description: Catatan kondisi fisik atau preferensi latihan
 *           example: "Latihan cardio ringan"
 */

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API untuk mengelola data pelanggan
 */

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Mengambil semua data pelanggan
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar pelanggan
 */
router.get('/', getAllCustomers);

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Menambahkan data pelanggan baru
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Pelanggan berhasil ditambahkan
 *       400:
 *         description: Validasi input gagal
 */
router.post('/', createCustomer);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Mengambil data pelanggan berdasarkan ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik pelanggan
 *     responses:
 *       200:
 *         description: Berhasil mengambil data pelanggan
 *       404:
 *         description: Data pelanggan tidak ditemukan
 */
router.get('/:id', getCustomerById);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Memperbarui data pelanggan
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Data pelanggan berhasil diperbarui
 *       404:
 *         description: Data pelanggan tidak ditemukan
 */
router.put('/:id', updateCustomer);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Menghapus data pelanggan
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik pelanggan
 *     responses:
 *       200:
 *         description: Pelanggan berhasil dihapus
 *       404:
 *         description: Data pelanggan tidak ditemukan
 */
router.delete('/:id', deleteCustomer);

module.exports = router;