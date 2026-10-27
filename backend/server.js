// 1. Memanggil Library (Dependencies)
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

// 2. Memanggil Konfigurasi dan Routes Internal
require('./config/db'); // Koneksi Database
const swaggerSpec = require('./config/swagger'); // Konfigurasi Swagger
const customerRoutes = require('./routes/customerRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

// 3. Inisialisasi Aplikasi Express
const app = express();
const port = 5000;

// 4. Mengatur Middleware Global
app.use(cors()); // Mengizinkan frontend mengakses API
app.use(express.json()); // Mengizinkan aplikasi membaca request body berformat JSON

// 5. Mendaftarkan Routes (Endpoint)
// Endpoint Dokumentasi API (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint API Utama
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/reminders', reminderRoutes);

// Route Dasar (Cek status server)
app.get('/', (req, res) => {
  res.send('Halo! Backend Gymnasyum Smart Reminder sudah berjalan.');
});

// 6. Menyalakan Server
app.listen(port, () => {
  console.log(`✅ Server Backend berjalan di http://localhost:${port}`);
});