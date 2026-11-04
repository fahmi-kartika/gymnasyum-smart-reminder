# Gymnasyum Smart Reminder 🏋️‍♂️📲
**Sistem Manajemen Reminder & Follow-up Pelanggan Berbasis Web**  
*Dicoding Capstone Project - ID: DB15-I020*

---

## 📌 Tentang Proyek
**Gymnasyum Smart Reminder** adalah platform berbasis web yang dirancang khusus untuk memodernisasi operasional pusat kebugaran (*gym/fitness center*). Sistem ini mengotomasi alur konfirmasi kehadiran member dan pengingat sesi latihan kelas kebugaran melalui integrasi pesan WhatsApp terstruktur, pelacakan kuota peserta secara *real-time*, serta manajemen data pelanggan dan jadwal kelas yang terpusat.

### 🎯 Masalah yang Diselesaikan:
1. **Ketidakhadiran Member (*No-Show Rate*)**: Member gym sering lupa jadwal latihan yang telah dipesan.
2. **Follow-up Manual yang Memakan Waktu**: Staf admin gym menghabiskan banyak waktu menyusun pesan pengingat satu per satu secara manual.
3. **Kelebihan Kapasitas Kelas (*Overbooked*)**: Kuota kelas terbatas rawan terlampaui tanpa validasi sistematis.
4. **Pencatatan Terpisah**: Riwayat respon pelanggan dan status konfirmasi kehadiran tidak terdokumentasi dengan baik.

---

## 🚀 Fitur Utama

### 1. 🔐 Autentikasi & Otorisasi Admin
- Login aman berbasis token **JSON Web Token (JWT)**.
- Rute halaman terproteksi (*Protected Routes*) di frontend agar data tidak dapat diakses tanpa sesi aktif.
- Identitas akun admin dan tombol keluar (*logout*) yang mudah diakses pada navigasi sidebar.

### 2. 📊 Dashboard & Antrean Follow-up Cerdas
- **5 Kartu Metrik Ringkasan**: Memantau total antrean hari ini, *Scheduled*, *Sent*, *Responded*, dan *Tidak Ada Respons*.
- **Booking Peserta ke Jadwal Kelas**:
  - Filter otomatis jam kelas yang telah lampau.
  - **Pencegahan Booking Ganda**: Validasi agar member tidak dapat mendaftar dua kali pada kelas yang sama.
  - **Validasi Kuota Realtime**: Peringatan dan penonaktifan tombol booking jika kuota kelas telah penuh.
- **Generator Pesan WhatsApp Terstruktur**: Tombol aksi cepat yang langsung membuka WhatsApp Web/App (`wa.me`) dengan pesan dinamis mencakup nama member, nama kelas, hari/tanggal, jam pelaksanaan (WIB), dan nama instruktur.
- **Pembaruan Status Interaktif**: Dropdown instan untuk mengubah status respon member (*Scheduled* $\rightarrow$ *Sent* $\rightarrow$ *Responded* / *No Response*).

### 3. 👥 Manajemen Data Member
- Operasi CRUD lengkap (Tambah, Lihat, Edit, Hapus member) dengan modal konfirmasi aman.
- Validasi ketat nomor WhatsApp (hanya digit numerik).
- Klasifikasi tipe keanggotaan (**VIP** & **Regular**) dengan tab filter cepat.
- Modal popup **Riwayat Reminder**: Melacak histori seluruh pengingat kelas yang pernah dikirimkan ke pelanggan terkait beserta status responnya.

### 4. 📅 Manajemen Jadwal Kelas
- Operasi CRUD lengkap untuk seluruh jadwal sesi latihan gym.
- Informasi tanggal, waktu pelaksanaan, instruktur pelatih, dan batas kuota peserta.
- Tab filter status sesi latihan (**Semua**, **Mendatang**, dan **Selesai**).

### 5. 🎨 Standar UI/UX Profesional
- Desain antarmuka modern terinspirasi oleh **Shadcn UI** dengan aksen *Royal Blue* (`#2563eb`).
- **Anti-Layout Shift**: Tabel menggunakan `table-fixed` dengan persentase lebar terkunci dan kontainer utama menggunakan `scrollbar-gutter: stable`, sehingga layout tidak bergeser saat pagination maupun saat navigasi halaman.

### 6. 📖 Dokumentasi API Interaktif (Swagger / OpenAPI)
- Dokumentasi seluruh endpoint RESTful API terintegrasi langsung di `/api-docs`.

---

## 🛠️ Tech Stack & Arsitektur

### Frontend:
- **Framework**: React 19 (Vite)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS v4 & Lucide React Icons
- **Komponen UI**: Shadcn UI Pattern (Card, Table, Dialog, Select, Badge, Skeleton, Button, Input, Label)
- **HTTP Client**: Axios dengan JWT Request Interceptor

### Backend:
- **Runtime & Framework**: Node.js & Express.js
- **Database**: PostgreSQL (Driver `pg` dengan Connection Pooling)
- **Validasi Data**: Joi Schema Validation
- **Keamanan**: JWT (`jsonwebtoken`), CORS, Dotenv
- **Dokumentasi API**: Swagger JSDoc & Swagger UI Express

---

## 🗄️ Skema Database

Sistem menggunakan database relasional PostgreSQL dengan 3 tabel utama:

```
[ customers ] 1 ──< [ reminders ] >── 1 [ schedules ]
```

1. **`customers`**: Menyimpan biodata member gym (`id`, `name`, `whatsapp_number`, `member_type`, `preferences`, `created_at`).
2. **`schedules`**: Menyimpan sesi kelas latihan (`id`, `class_name`, `class_time`, `instructor_name`, `quota`, `created_at`).
3. **`reminders`**: Menghubungkan member dan jadwal sesi latihan (`id`, `customer_id`, `schedule_id`, `priority`, `status`, `created_at`, `updated_at`). Dilengkapi `ON DELETE CASCADE`.

---

## 💻 Panduan Instalasi & Menjalankan di Komputer Lokal

### 1. Prasyarat Sistem
- **Node.js**: Versi 18.x atau lebih baru ([Unduh Node.js](https://nodejs.org/))
- **PostgreSQL**: Server PostgreSQL aktif ([Unduh PostgreSQL](https://www.postgresql.org/))
- **Git**: Terinstal di sistem

---

### 2. Setup Database & Backend
1. Buka terminal dan masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Buat database di PostgreSQL bernama `gymnasyum_db`:
   ```sql
   CREATE DATABASE gymnasyum_db;
   ```

4. Konfigurasikan file `.env` di folder `backend/`:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=password_postgres_anda
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gymnasyum_db

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   JWT_SECRET=super_secret_jwt_key_gymnasyum
   ```

5. Inisialisasi tabel database:
   ```bash
   npm run db:init
   ```

6. *(Sangat Direkomendasikan)* Isi data dummy siap uji (21 member, 21 jadwal, 21 antrean reminder):
   ```bash
   npm run db:seed
   ```

7. Jalankan server backend:
   ```bash
   npm run dev
   ```
   *Server backend akan berjalan di `http://localhost:5000` dan Swagger API docs di `http://localhost:5000/api-docs`.*

---

### 3. Setup Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang frontend:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend akan terbuka di `http://localhost:5173`.*

---

## 🔑 Kredensial Login Default
Gunakan akun administrator berikut untuk masuk ke sistem:
- **Username**: `admin`
- **Password**: `admin123`

---

## 📡 Daftar Endpoint RESTful API

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/v1/auth/login` | Login admin & generate token JWT | Publik |
| **GET** | `/api/v1/customers` | Mengambil seluruh data member | Terproteksi |
| **POST** | `/api/v1/customers` | Menambahkan data member baru | Terproteksi |
| **PUT** | `/api/v1/customers/:id` | Memperbarui data member | Terproteksi |
| **DELETE** | `/api/v1/customers/:id` | Menghapus data member | Terproteksi |
| **GET** | `/api/v1/schedules` | Mengambil seluruh jadwal kelas | Terproteksi |
| **POST** | `/api/v1/schedules` | Menambahkan jadwal kelas baru | Terproteksi |
| **PUT** | `/api/v1/schedules/:id` | Memperbarui data jadwal kelas | Terproteksi |
| **DELETE** | `/api/v1/schedules/:id` | Menghapus data jadwal kelas | Terproteksi |
| **GET** | `/api/v1/reminders` | Mengambil seluruh antrean reminder | Terproteksi |
| **POST** | `/api/v1/reminders` | Booking / daftarkan member ke jadwal | Terproteksi |
| **PATCH** | `/api/v1/reminders/:id/status` | Update status respon interaksi reminder | Terproteksi |
| **DELETE** | `/api/v1/reminders/:id` | Menghapus reminder dari antrean | Terproteksi |
| **GET** | `/api/v1/reminders/customer/:id` | Riwayat aktivitas reminder member | Terproteksi |

---

## 🌐 Rencana Deployment (AWS)
Aplikasi ini dirancang *cloud-ready* untuk di-deploy ke **Amazon Web Services (AWS)**:
- **Compute Server**: AWS EC2 (Ubuntu Server) dengan Node.js runtime & PM2 process manager.
- **Web Server & Reverse Proxy**: Nginx untuk melayani *production build* frontend React serta *reverse proxy* request `/api` ke Express.
- **Database**: AWS RDS PostgreSQL (atau PostgreSQL terkelola di EC2).
- **Domain & SSL**: AWS Route 53 & Let's Encrypt (Certbot) untuk protokol HTTPS aman.

---

## 👨‍💻 Pengembang
Proyek ini dikembangkan sebagai pemenuhan **Capstone Project Dicoding**.
- **Peran**: Solo Full-Stack Web Developer
- **Lisensi**: ISC License

