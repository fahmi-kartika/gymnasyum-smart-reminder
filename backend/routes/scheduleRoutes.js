const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  createSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - class_name
 *         - class_time
 *       properties:
 *         class_name:
 *           type: string
 *           description: Nama kelas senam/gym
 *           example: "Yoga Pagi Lansia"
 *         class_time:
 *           type: string
 *           format: date-time
 *           description: Waktu pelaksanaan kelas (ISO 8601)
 *           example: "2026-10-28T08:30:00Z"
 *         instructor_name:
 *           type: string
 *           description: Nama instruktur yang mengajar
 *           example: "Coach Maya"
 *         quota:
 *           type: integer
 *           description: Kapasitas maksimal peserta kelas
 *           example: 10
 */

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API untuk mengelola jadwal kelas
 */

/**
 * @swagger
 * /api/v1/schedules:
 *   get:
 *     summary: Mengambil semua jadwal kelas
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar jadwal
 */
router.get('/', getAllSchedules);

/**
 * @swagger
 * /api/v1/schedules:
 *   post:
 *     summary: Membuat jadwal kelas baru
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       201:
 *         description: Jadwal berhasil dibuat
 */
router.post('/', createSchedule);

/**
 * @swagger
 * /api/v1/schedules/{id}:
 *   get:
 *     summary: Mengambil jadwal kelas berdasarkan ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik jadwal
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail jadwal
 */
router.get('/:id', getScheduleById);

/**
 * @swagger
 * /api/v1/schedules/{id}:
 *   put:
 *     summary: Memperbarui data jadwal kelas
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik jadwal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       200:
 *         description: Jadwal berhasil diperbarui
 */
router.put('/:id', updateSchedule);

/**
 * @swagger
 * /api/v1/schedules/{id}:
 *   delete:
 *     summary: Menghapus jadwal kelas
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID unik jadwal
 *     responses:
 *       200:
 *         description: Jadwal berhasil dihapus
 */
router.delete('/:id', deleteSchedule);

module.exports = router;