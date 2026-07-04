# Panduan Deploy HPP Master Pro ke cPanel / Shared Hosting (Indonesia)

Aplikasi HPP Master Pro ini telah dirancang dengan arsitektur **Hybrid Dual-Engine**:
1. **Local Engine (Express + Node.js)**: Digunakan untuk pengerjaan & pengujian lokal di komputer Anda.
2. **Production Engine (HTML5 Static + PHP & JSON Database)**: Hasil kompilasi siap pakai untuk hosting murah/umum di Indonesia (cPanel, Niagahoster, DomaiNesia, IDCloudHost, dll) tanpa memerlukan Node.js atau VPS!

---

## 🚀 Langkah 1: Kompilasi Aplikasi (Build)
Sebelum diunggah ke cPanel, Anda perlu melakukan kompilasi file React menjadi bentuk statis yang dimengerti oleh browser dan hosting cPanel.

Di terminal lokal Anda, jalankan perintah:
```bash
npm run build
```
Perintah ini akan menghasilkan folder baru bernama `dist/` di dalam root project Anda. Di dalam folder `dist/` ini terdapat semua file web statis serta backend PHP (`api.php`) dan `.htaccess` yang telah kita buat.

---

## 📁 Langkah 2: Mempersiapkan File ZIP
1. Masuk ke file explorer di komputer Anda.
2. Buka folder `dist/`.
3. Pilih semua file di dalam folder `dist/` (pastikan file tersembunyi seperti `.htaccess` juga terpilih).
4. Klik kanan dan kompres/simpan menjadi file berformat `.zip` (misalnya: `hpp-deploy.zip`).

---

## ☁️ Langkah 3: Unggah ke cPanel Hosting Anda
1. Masuk ke **cPanel** hosting Anda.
2. Buka menu **File Manager** dan masuk ke folder `public_html` (atau folder subdomain Anda jika dipasang di subdomain).
3. Klik tombol **Upload** di bagian atas cPanel File Manager.
4. Pilih file `hpp-deploy.zip` yang telah Anda persiapkan pada langkah sebelumnya.
5. Setelah proses unggah selesai (bar berwarna hijau 100%), kembali ke File Manager cPanel.
6. Klik kanan pada file `hpp-deploy.zip` dan pilih **Extract** (Ekstrak ke folder `/public_html`).
7. Hapus file `hpp-deploy.zip` yang sudah diekstrak untuk menjaga kebersihan hosting.

Selesai! Sekarang buka domain Anda (contoh: `https://domainanda.com`) di HP atau browser apa pun. Aplikasi HPP Master Pro Anda sudah aktif sepenuhnya!

---

## 🛡️ Sistem Keamanan & Isolasi Database di cPanel
Kami merancang penyimpanan database menggunakan metode **Double-Layer Guard (Pelindung Berlapis)**:
1. **Layer 1 - PHP Execution Block (`db_store.json.php`)**:
   Database disimpan di file bernama `db_store.json.php`. Bagian paling atas file ini disisipkan kode PHP:
   `<?php http_response_code(403); exit('Akses ditolak.'); ?>`
   Jika ada orang iseng yang menebak nama database ini dan mencoba mengakses langsung via browser (contoh: `https://domainanda.com/db_store.json.php`), server cPanel akan langsung memicu error **403 Forbidden** dan mengeksekusi perintah keluar (exit) sehingga isi data JSON di bawahnya **tidak akan pernah bisa dibaca atau diunduh dari luar**.
   
2. **Layer 2 - Apache Block (`.htaccess`)**:
   File `.htaccess` yang kami sertakan secara otomatis melarang web server Apache untuk melayani file `db_store.json.php` ke publik.

---

## 💡 Keuntungan Metode Ini Untuk Penjualan Software Anda
- **Hemat Biaya**: Anda bisa membeli paket hosting termurah seharga Rp 15.000 - Rp 25.000 per bulan di Indonesia, dan itu sudah bisa menampung ratusan pengguna terdaftar dengan performa stabil.
- **Tanpa Firebase**: Bebas dari tagihan bulanan Firebase Firestore dan Authentication.
- **Multi-Device**: Pembeli Anda bisa mendaftar akun sendiri dari HP, tablet, maupun laptop mereka dan data mereka akan otomatis disinkronkan secara aman ke hosting cPanel Anda.
