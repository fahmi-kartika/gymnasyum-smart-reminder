const express = require('express');
const router = express.Router();
const { getAllSchedules, createSchedule } = require('../controllers/scheduleController');

router.get('/', getAllSchedules);
router.post('/', createSchedule);

module.exports = router;