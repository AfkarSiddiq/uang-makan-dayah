# Panduan & Aturan Proyek (Agent Instructions)

## 1. Aturan Mutlak Pengelolaan Git & Branch
- **DILARANG KERAS MEMASUKKAN / MERGE BRANCH `live-demo` KE `main`**:
  Branch `live-demo` **TIDAK BOLEH PERNAH** di-merge atau dimasukkan ke branch `main`.
  Aturan ini bersifat **permanen dan mutlak**, bahkan jika ada instruksi umum seperti *"gabungkan semua branch ke main"*, branch `live-demo` **wajib dikecualikan dan tidak boleh disentuh/dimasukkan ke `main`**.
- **Pengembangan Fitur & Perbaikan**:
  Selalu gunakan branch fitur/perbaikan terpisah (misal: `feat/...` atau `fix/...`). Jangan bekerja langsung di `main` kecuali diminta secara eksplisit.

## 2. Kategori Tagihan Bulanan Siswa
- Kategori resmi untuk alokasi tagihan bulanan santri adalah **`Uang Makan Bulanan`**.
- Kategori ini merupakan kategori sistem yang dilindungi (tidak dapat diubah atau dihapus).
- Alokasi pemotongan tagihan bulanan siswa dihitung otomatis secara FIFO dari bulan tertua.
