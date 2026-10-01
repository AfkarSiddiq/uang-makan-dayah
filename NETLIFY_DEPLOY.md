# Panduan Hosting Live Demo di Netlify

Branch ini (`live-demo`) telah dikonfigurasi secara khusus agar aplikasi **Sistem Keuangan & Uang Makan Dayah** dapat di-hosting secara langsung di **Netlify** sebagai Single Page Application (SPA) yang interaktif tanpa memerlukan server PHP atau database MySQL.

---

## 🌟 Fitur Live Demo yang Tersedia
- **Dashboard Interaktif**: Statistik santriwan & santriwati, grafik kategori pemasukan & pengeluaran (Recharts), tren kas 6 bulan terakhir, dan tabel 5 transaksi terbaru.
- **Transaksi & Kas**: Pencatatan kas masuk/keluar, filter kategori & tanggal, pencarian, cetak kuitansi resmi, edit, dan hapus transaksi.
- **Data Santri (Putra & Putri)**: Pemilihan kelas 1 s/d 6, daftar santri per kelas, profil santri lengkap dengan buku rekening virtual SPP per bulan, serta alur kenaikan kelas.
- **Tunggakan Santri**: Rekapitulasi tunggakan santri aktif & alumni, filter bulan tunggakan, serta rincian tagihan yang belum dibayar.
- **Pusat Data Siswa**: CRUD siswa lengkap (tambah, edit, detail, hapus) dengan filter kelas, gender, jenis (umum/yatim/piatu), dan status.
- **Arsip & Alumni**: Rekapitulasi lulusan berdasarkan tahun kelulusan dan daftar siswa pindah.
- **Pengaturan SPP & Kategori**: Konfigurasi tagihan bulanan dan kategori transaksi.
- **Manajemen User & Role**: Pengaturan pengguna dan izin hak akses (RBAC).
- **Mode Demo Interaktif**: Perubahan data (tambah/edit/hapus) tersimpan langsung di browser (`localStorage`), dan terdapat tombol **"Reset Data Demo"** untuk mengembalikan ke data awal kapan saja.

---

## 🚀 Cara 1: Deploy Otomatis via GitHub Integration di Netlify (Direkomendasikan)

Jika repository ini terhubung dengan akun GitHub Anda:

1. **Push branch `live-demo` ke GitHub Anda**:
   ```bash
   git push -u origin live-demo
   ```
   *(Pastikan **hanya push branch `live-demo`**, bukan ke branch `main`)*.

2. Buka dashboard [Netlify](https://app.netlify.com).
3. Klik tombol **"Add new site"** lalu pilih **"Import an existing project"**.
4. Pilih penyedia Git: **GitHub**, lalu pilih repository `uang_makan_dayah`.
5. Di bagian **Branch to deploy**:
   - Ganti pilihan branch dari `main` menjadi **`live-demo`**.
6. Konfigurasi build akan otomatis terdeteksi dari file `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Klik tombol **"Deploy site"**.
8. Dalam waktu sekitar 1-2 menit, situs live demo Anda akan aktif dengan alamat URL Netlify (misal: `https://uang-makan-dayah.netlify.app`).

---

## 📦 Cara 2: Deploy Cepat via Netlify Drop (Tanpa Push Git)

Jika Anda ingin langsung mencoba hosting tanpa menghubungkan Git:

1. Jalankan perintah build di terminal lokal:
   ```bash
   npm run build
   ```
2. Buka browser dan kunjungi [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag & drop folder `dist` dari komputer Anda ke halaman tersebut.
4. Situs Anda langsung online seketika!

---

## 💻 Cara 3: Menjalankan Demo Secara Lokal

Untuk menguji coba tampilan demo di komputer lokal sebelum di-deploy:

```bash
# Mode development server (Vite HMR)
npm run dev

# Atau build dan jalankan preview build produksi
npm run build
npm run preview
```
Buka browser di `http://localhost:5173` (untuk dev) atau `http://localhost:4173` (untuk preview).
