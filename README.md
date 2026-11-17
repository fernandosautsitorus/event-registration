# Sistem & Portal Registrasi Event Lomba Berbasis Scan Barcode Realtime

Aplikasi web full-stack modern untuk registrasi peserta lomba dan sistem check-in barcode/QR code secara **real-time** antara meja registrasi (smartphone / barcode scanner) dan laptop admin.

---

## 🚀 Fitur Utama

1. **Dashboard Laptop Admin (Real-time Live Sync):**
   - Pop-up profil pemain otomatis muncul berukuran besar saat barcode berhasil dipindai di meja registrasi.
   - Efek suara chime gembira menggunakan Web Audio API saat scan berhasil, nada ganda untuk barcode ganda, dan nada buzz untuk barcode salah.
   - Statistik kehadiran interaktif (Total Peserta, Hadir, Belum Hadir, dan Persentase).
   - Filter data peserta berdasarkan status (Semua / Hadir / Belum Hadir) dan cabang lomba.
   - Live search instan berdasarkan nama, tim, atau barcode.
   - Tombol manual check-in toggle per peserta.
   - Ekspor rekapitulasi kehadiran peserta ke file Excel / CSV.

2. **Scanner Meja Registrasi (Fleksibel & Cepat):**
   - **Kamera HP / Webcam Laptop:** Pemindai kamera HTML5 langsung dari browser (QR Code & Barcode 1D Code128).
   - **Scanner Barcode USB / Laser:** Kompatibel dengan alat barcode scanner laser USB fisik (keyboard emulation).
   - Indikator status visual (Hijau = Hadir, Kuning = Sudah Scan, Merah = Barcode Asing).

3. **Portal Pendaftaran & E-Ticket Digital:**
   - Form pendaftaran mandiri untuk peserta atau panitia.
   - Pembuatan barcode Code 128 & QR Code otomatis.
   - Halaman **Name Tag / ID Card Lanyard** resmi yang siap dicetak ke kertas atau disimpan di HP peserta.

---

## 🛠️ Cara Menjalankan

### Cara 1: Menggunakan File Batch
Cukup klik ganda file `start.bat` di dalam folder ini.

### Cara 2: Melalui Terminal / PowerShell
```bash
node server.js
```

---

## 🌐 URL Akses

| Halaman | Deskripsi | URL |
| :--- | :--- | :--- |
| **Portal Utama** | Menu navigasi seluruh sistem | `http://localhost:3000/` |
| **Dashboard Admin** | Tampilan untuk Laptop Admin (Live Sync) | `http://localhost:3000/admin.html` |
| **Scanner Meja** | Pemindai untuk HP / Meja Registrasi | `http://localhost:3000/scanner.html` |
| **Form Registrasi** | Pendaftaran Peserta & Buat E-Ticket | `http://localhost:3000/register.html` |

> **💡 Tips Akses via Smartphone (Kamera HP):**  
> Pastikan laptop dan HP terhubung ke jaringan Wi-Fi atau hotspot yang sama. Buka browser di HP dan masukkan alamat IP lokal laptop Anda (contoh: `http://192.168.1.xxx:3000/scanner.html`). Alamat IP otomatis tertera di terminal saat server dijalankan.
