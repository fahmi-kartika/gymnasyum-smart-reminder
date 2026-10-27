const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  createSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');

router.get('/', getAllSchedules);
router.post('/', createSchedule);
router.get('/:id', getScheduleById);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;