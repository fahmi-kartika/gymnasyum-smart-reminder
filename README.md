# Gymnasyum Smart Reminder
**Sistem Manajemen Reminder & Follow-up Pelanggan Berbasis Web**  
*Dicoding Capstone Project - ID: DB15-I020*

---

## Tentang Proyek
Gymnasyum Smart Reminder adalah platform berbasis web yang dirancang untuk mempermudah operasional pusat kebugaran (*gym/fitness center*). Sistem ini mengotomasi alur konfirmasi kehadiran member dan pengingat sesi kelas kebugaran melalui integrasi tautan pesan WhatsApp terstruktur, pelacakan kuota peserta secara *real-time*, serta manajemen data member dan jadwal kelas yang terpusat.

### Masalah yang Diselesaikan:
1. **Tingkat Ketidakhadiran Member (*No-Show Rate*)**: Member gym sering kali melewatkan jadwal latihan yang telah dipesan.
2. **Follow-up Manual yang Tidak Efisien**: Staf admin gym menghabiskan banyak waktu menyusun pesan pengingat satu per satu secara manual.
3. **Kelebihan Kapasitas Kelas (*Overbooked*)**: Kuota kelas latihan rawan terlampaui tanpa validasi kapasitas terintegrasi.
4. **Pencatatan yang Terfragmentasi**: Riwayat interaksi dan konfirmasi kehadiran pelanggan sering kali tidak terdokumentasi rapi.

---

## Fitur Utama

### 1. Autentikasi & Otorisasi Admin
- Login berbasis JSON Web Token (JWT).
- Rute halaman terproteksi (*Protected Routes*) di frontend untuk menjaga keamanan data.
- Sesi akun admin dan navigasi keluar (*logout*) terintegrasi pada sidebar.

### 2. Dashboard & Antrean Follow-up
- Ringkasan metrik status antrean: Total Antrean, Scheduled, Sent, Responded, dan Tidak Ada Respons.
- Pendaftaran (*booking*) member ke jadwal kelas dengan proteksi:
  - Filter otomatis untuk jam kelas yang telah terlewat hari ini.
  - Pencegahan pendaftaran ganda (*duplicate booking check*).
  - Validasi sisa kuota kapasitas secara *real-time*.
- Pembuatan pesan WhatsApp terstruktur yang mencakup nama member, nama kelas, tanggal, jam pelaksanaan, dan instruktur.
- Pembaruan status interaksi langsung melalui dropdown (*Scheduled*, *Sent*, *Responded*, *No Response*).

### 3. Manajemen Data Member
- Operasi CRUD (Create, Read, Update, Delete) data pelanggan.
- Validasi format nomor WhatsApp berbasis numerik.
- Pengelompokan tipe keanggotaan (VIP dan Regular) dengan tab filter cepat.
- Modal riwayat aktivitas pengingat per member lengkap dengan indikator status.

### 4. Manajemen Jadwal Kelas
- Operasi CRUD jadwal sesi latihan kebugaran.
- Pengaturan kapasitas kuota peserta per sesi kelas.
- Filter jadwal berdasarkan waktu pelaksanaan (Semua, Mendatang, Selesai).

### 5. Standar Antarmuka (UI/UX)
- Antarmuka berbasis komponen Shadcn UI dengan tema aksen Royal Blue (`#2563eb`).
- Pencegahan pergeseran tata letak (*anti-layout shift*) menggunakan `table-fixed` dan `scrollbar-gutter: stable`.
- Paginasi data yang konsisten di seluruh tabel.

### 6. Dokumentasi API
- Dokumentasi interaktif berbasis Swagger / OpenAPI 3.0 yang dapat diakses langsung pada endpoint `/api-docs`.

---

## Arsitektur & Teknologi

### Frontend:
- Framework: React 19 (Vite)
- Routing: React Router DOM
- Styling: Tailwind CSS v4
- Ikon: Lucide React
- Desain Komponen: Shadcn UI Pattern
- HTTP Client: Axios (dengan JWT Request Interceptor)

### Backend:
- Runtime & Framework: Node.js & Express.js
- Database: PostgreSQL (Driver `pg` dengan Connection Pool)
- Validasi Request: Joi Schema
- Keamanan: JWT (`jsonwebtoken`), CORS, Dotenv
- Dokumentasi: Swagger JSDoc & Swagger UI Express

---

## Skema Database

Sistem menggunakan database relasional PostgreSQL dengan tiga tabel utama:

```
[ customers ] 1 ──< [ reminders ] >── 1 [ schedules ]
```

1. **customers**: Menyimpan biodata pelanggan gym (`id`, `name`, `whatsapp_number`, `member_type`, `preferences`, `created_at`).
2. **schedules**: Menyimpan sesi kelas latihan (`id`, `class_name`, `class_time`, `instructor_name`, `quota`, `created_at`).
3. **reminders**: Menghubungkan member dan jadwal sesi latihan (`id`, `customer_id`, `schedule_id`, `priority`, `status`, `created_at`, `updated_at`). Menggunakan *foreign key cascade delete*.

---

## Panduan Instalasi Lokal

### 1. Prasyarat Sistem
- Node.js versi 18.x atau lebih baru
- PostgreSQL Server aktif
- Git

---

### 2. Konfigurasi Backend & Database
1. Buka terminal dan masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Buat database baru di PostgreSQL:
   ```sql
   CREATE DATABASE gymnasyum_db;
   ```

4. Buat file `.env` pada direktori `backend/` dengan konfigurasi berikut:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=password_database_anda
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gymnasyum_db

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   JWT_SECRET=super_secret_jwt_key_gymnasyum
   ```

5. Jalankan inisialisasi tabel:
   ```bash
   npm run db:init
   ```

6. Jalankan seeder data dummy (21 member, 21 jadwal, 21 antrean reminder):
   ```bash
   npm run db:seed
   ```

7. Jalankan server pengembang backend:
   ```bash
   npm run dev
   ```
   *Backend berjalan pada `http://localhost:5000` dan Swagger API pada `http://localhost:5000/api-docs`.*

---

### 3. Konfigurasi Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang frontend:
   ```bash
   npm run dev
   ```
   *Frontend dapat diakses pada `http://localhost:5173`.*

---

## Kredensial Administrator
- **Username**: `admin`
- **Password**: `admin123`

---

## Daftar Endpoint API

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :---: |
| POST | `/api/v1/auth/login` | Autentikasi admin dan penerbitan token JWT | Publik |
| GET | `/api/v1/customers` | Mengambil seluruh data member | Terproteksi |
| POST | `/api/v1/customers` | Mendaftarkan member baru | Terproteksi |
| PUT | `/api/v1/customers/:id` | Memperbarui data member | Terproteksi |
| DELETE | `/api/v1/customers/:id` | Menghapus data member | Terproteksi |
| GET | `/api/v1/schedules` | Mengambil seluruh jadwal kelas | Terproteksi |
| POST | `/api/v1/schedules` | Menambahkan jadwal kelas baru | Terproteksi |
| PUT | `/api/v1/schedules/:id` | Memperbarui data jadwal kelas | Terproteksi |
| DELETE | `/api/v1/schedules/:id` | Menghapus data jadwal kelas | Terproteksi |
| GET | `/api/v1/reminders` | Mengambil seluruh antrean reminder | Terproteksi |
| POST | `/api/v1/reminders` | Pendaftaran member ke jadwal kelas | Terproteksi |
| PATCH | `/api/v1/reminders/:id/status` | Memperbarui status interaksi reminder | Terproteksi |
| DELETE | `/api/v1/reminders/:id` | Menghapus reminder dari antrean | Terproteksi |
| GET | `/api/v1/reminders/customer/:id` | Riwayat reminder spesifik member | Terproteksi |

---

## Deployment (AWS)
Aplikasi disiapkan untuk deployment cloud pada infrastruktur Amazon Web Services (AWS):
- **Server Komputasi**: AWS EC2 (Ubuntu Server) dengan Node.js dan PM2.
- **Reverse Proxy & Web Server**: Nginx untuk melayani aset statis frontend dan meneruskan request API ke backend.
- **Basis Data**: AWS RDS PostgreSQL atau instance PostgreSQL pada EC2.
- **Keamanan Jaringan**: AWS Security Groups dan sertifikat SSL Let's Encrypt (Certbot).

---

## Lisensi
ISC License
