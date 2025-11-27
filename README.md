# 💰 Family Expense Tracker API

Backend  untuk aplikasi pencatat pengeluaran keluarga. Dibangun dengan fokus pada **Kecepatan (Serverless Ready)**, **Keamanan (Best Practices)**, dan **Efisiensi Biaya**.

## 🚀 Fitur Utama

* **Smart OCR Scanning:** Mendeteksi total belanja dari struk foto menggunakan Google Vision API.
* **QRIS Support:** Mendukung pencatatan nominal dari scan QRIS.
* **Secure Auth:** Sistem login aman dengan Argon2 Hashing & JWT Token.
* **Global Categories:** Manajemen kategori yang tersentralisasi, dinamis, dan mudah dikelola.
* **High Performance:** Database query yang dioptimasi menggunakan Drizzle ORM (Low Cold Start).
* **Type Safe:** Validasi ketat end-to-end dengan TypeScript & Zod.

## 🛠 Tech Stack (State of the Art 2025)

* **Runtime:** Node.js (Express.js)
* **Language:** TypeScript
* **Database:** MySQL (via Hostinger)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - *Lightweight & Serverless friendly*.
* **Validation:** Zod
* **Security:** Helmet, HPP, Rate Limiting, Argon2
* **Deployment:** Vercel Serverless Functions

---

## 🏁 Cara Menjalankan (Local Development)

### 1. Prasyarat
* Node.js (v18+)
* Database MySQL (Local atau Remote Hostinger)

### 2. Instalasi
Clone repository dan install dependencies:
```bash
git clone <repo-url>
cd expense-tracker-api
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root folder dan isi sesuai kredensial Anda:
```ini
PORT=8000
NODE_ENV=development

# Database (Hostinger / Local)
DB_HOST=your_host_ip
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

# Security (Generate string acak panjang)
JWT_SECRET=rahasia_negara_12345
```

### 4. Setup Database
Push schema Drizzle ke database MySQL Anda:
```bash
# Push struktur tabel ke DB
npm run db:push

# (Opsional) Isi data kategori awal
npx tsx src/db/seed.ts
```

### 5. Jalankan Server
```bash
npm run dev
```
Server akan berjalan di `http://localhost:8000`.

---

## 📜 API Cheatsheet

### Auth
* `POST /api/auth/register` - Mendaftar user baru.
* `POST /api/auth/login` - Login dan mendapatkan JWT Token.

### Transactions
* `POST /api/transactions` - Input pengeluaran manual/scan.
* `POST /api/scan` - Upload gambar struk untuk OCR.

---

## 🛠 Scripts Penting

* `npm run dev`: Menjalankan mode development (Hot Reload).
* `npm run build`: Compile TypeScript ke JavaScript (folder `dist`).
* `npm run db:push`: Sinkronisasi schema kode ke database langsung.
* `npm run db:studio`: Membuka GUI visual untuk melihat isi database.

## ☁️ Deployment (Vercel)

Project ini sudah dikonfigurasi untuk **Zero Config Deployment** di Vercel.
1.  Push kode ke GitHub/GitLab.
2.  Import project di Dashboard Vercel.
3.  Masukkan Environment Variables (`DB_HOST`, `DB_USER`, dll) di setting Vercel.
4.  Deploy! 🚀

---

**Author:** Aldy Akbarrizky
