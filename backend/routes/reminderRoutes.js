const express = require('express');
const router = express.Router();
const {
  getAllReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder
} = require('../controllers/reminderController');

router.get('/', getAllReminders);
router.post('/', createReminder);
router.patch('/:id/status', updateReminderStatus);
router.delete('/:id', deleteReminder);

module.exports = router;