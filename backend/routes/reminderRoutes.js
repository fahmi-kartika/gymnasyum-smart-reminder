const express = require('express');
const router = express.Router();
const {
  getAllReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder
} = require('../controllers/reminderController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       required:
 *         - customer_id
 *         - schedule_id
 *       properties:
 *         customer_id:
 *           type: integer
 *           description: ID pelanggan yang dihubungkan
 *           example: 1
 *         schedule_id:
 *           type: integer
 *           description: ID jadwal kelas yang dihubungkan
 *           example: 1
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           description: Tingkat prioritas follow-up
 *           example: "Medium"
 */

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: API untuk mengelola pengingat dan status follow-up
 */

/**
 * @swagger
 * /api/v1/reminders:
 *   get:
 *     summary: Mengambil semua data reminder beserta relasinya
 *     tags: [Reminders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, Sent, Responded, No Response]
 *         description: Filter berdasarkan status interaksi
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter berdasarkan tingkat prioritas
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter berdasarkan tanggal kelas (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar reminder
 */
router.get('/', getAllReminders);

/**
 * @swagger
 * /api/v1/reminders:
 *   post:
 *     summary: Membuat reminder baru
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       201:
 *         description: Reminder berhasil dibuat
 */
router.post('/', createReminder);

/**
 * @swagger
 * /api/v1/reminders/{id}/status:
 *   patch:
 *     summary: Memperbarui status interaksi reminder
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik reminder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Scheduled, Sent, Responded, No Response]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *     responses:
 *       200:
 *         description: Status berhasil diperbarui
 */
router.patch('/:id/status', updateReminderStatus);

/**
 * @swagger
 * /api/v1/reminders/{id}:
 *   delete:
 *     summary: Menghapus data reminder
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik reminder
 *     responses:
 *       200:
 *         description: Reminder berhasil dihapus
 */
router.delete('/:id', deleteReminder);

module.exports = router;