const express = require('express');
const router = express.Router();
const { getAllCustomers, createCustomer } = require('../controllers/customerController');

// Mengatur rute API (Endpoint)
router.get('/', getAllCustomers); // Untuk mengambil data
router.post('/', createCustomer); // Untuk menyimpan data

module.exports = router;