// 1. Memanggil library yang dibutuhkan
const express = require('express');
const cors = require('cors');

// 2. Inisialisasi aplikasi Express
const app = express();
const port = 5000; // Pakai port 5000 untuk backend

// 3. Mengatur Middleware
app.use(cors()); // Mengizinkan frontend untuk mengakses API
app.use(express.json()); // Mengizinkan aplikasi membaca data berformat JSON

// 4. Membuat route pertama (Pintu masuk API)
app.get('/', (req, res) => {
  res.send('Halo! Backend Gymnasyum Smart Reminder sudah berjalan.');
});

// 5. Menyalakan server
app.listen(port, () => {
  console.log(`✅ Server Backend berjalan di http://localhost:${port}`);
});