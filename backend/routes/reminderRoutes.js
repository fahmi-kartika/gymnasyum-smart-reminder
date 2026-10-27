const express = require('express');
const router = express.Router();
const { getAllReminders, createReminder } = require('../controllers/reminderController');

router.get('/', getAllReminders);
router.post('/', createReminder);

module.exports = router;