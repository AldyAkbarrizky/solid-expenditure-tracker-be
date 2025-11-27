# 💰 Family Expense Tracker API

Backend berkinerja tinggi ("Dahsyat") untuk aplikasi pencatat pengeluaran keluarga. Dibangun dengan fokus pada **Kecepatan (Serverless Ready)**, **Keamanan (Best Practices)**, dan **Efisiensi Biaya**.

## 🚀 Fitur Utama

* **Smart OCR Scanning:** Mendeteksi total belanja dari struk foto menggunakan Google Vision API.
* **Cloud Storage:** Upload dan optimasi gambar struk otomatis via Cloudinary.
* **Dashboard Analytics:** Endpoint khusus untuk grafik pengeluaran bulanan, harian, dan per kategori.
* **Secure Auth:** Sistem login aman dengan Argon2 Hashing & JWT Token.
* **Global Categories:** Manajemen kategori yang tersentralisasi dan dinamis.
* **High Performance:** Database query yang dioptimasi untuk Shared Hosting (MariaDB/MySQL) menggunakan Drizzle ORM.

## 🛠 Tech Stack (State of the Art 2025)

* **Runtime:** Node.js (Express.js)
* **Language:** TypeScript
* **Database:** MySQL (via Hostinger)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Storage:** Cloudinary (Free Tier)
* **Validation:** Zod
* **Security:** Helmet, HPP, Rate Limiting, Argon2

---

## 🏁 Cara Menjalankan (Local Development)

### 1. Prasyarat
* Node.js (v18+)
* Database MySQL
* Akun Google Cloud (Vision API) & Cloudinary

### 2. Instalasi
```bash
git clone <repo-url>
cd expense-tracker-api
npm install
```

### 3. Konfigurasi Environment (.env)
Buat file `.env` di root folder:
```ini
PORT=8000
NODE_ENV=development

# Database
DB_HOST=your_hostinger_ip
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

# Security
JWT_SECRET=rahasia_super_panjang_dan_acak

# Google Cloud Vision (JSON String satu baris)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":...}

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=nama_cloud
CLOUDINARY_API_KEY=123456...
CLOUDINARY_API_SECRET=abcdef...
```

### 4. Setup Database
```bash
# Push schema ke DB
npm run db:push

# Isi kategori awal
npx tsx src/db/seed.ts
```

### 5. Jalankan Server
```bash
npm run dev
```

---

## 📜 API Cheatsheet

### Auth
* `POST /api/auth/register` - Daftar user.
* `POST /api/auth/login` - Login.

### Dashboard & Stats (New)
* `GET /api/stats/dashboard` - Data grafik (Pie chart kategori, Line chart harian).
* `GET /api/transactions/recent` - 5 Transaksi terakhir (Preview).

### Transactions
* `POST /api/transactions` - Input baru (mendukung upload `image`).
* `GET /api/transactions` - History lengkap.
    * *Query Params:* `?startDate=2025-10-01&endDate=2025-10-31&limit=50`
* `POST /api/scan` - OCR Struk belanja.

---

## ☁️ Deployment (Vercel)

1.  Push kode ke GitHub/GitLab.
2.  Import project di Dashboard Vercel.
3.  Masukkan semua Environment Variables (`DB_HOST`, `GOOGLE_CREDENTIALS`, dll) di Settings Vercel.
4.  Deploy! 🚀

---

**Author:** Aldy Akbarrizky
