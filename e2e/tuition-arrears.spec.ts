import { test, expect } from '@playwright/test';

test.describe('Modul Tunggakan SPP & Pengecekan Tombol', () => {
  test.beforeEach(async ({ page }) => {
    // Login terlebih dahulu sebagai admin
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@dayah.test');
    await page.fill('input[type="password"], input[name="password"]', '00000000');
    await page.click('button:has-text("Masuk ke Dasbor"), button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Tunggakan SPP - expand/collapse rincian tagihan memiliki warna yang sesuai', async ({ page }) => {
    await page.goto('/tuition-arrears');
    await expect(page.locator('h1')).toContainText(/Tunggakan SPP/i);

    // Cari tombol "Lihat Rincian" atau "Lihat Rincian Tagihan"
    const lihatRincianBtn = page.locator('button:has-text("Lihat Rincian")').first();

    if (await lihatRincianBtn.isVisible()) {
      // 1. Klik Lihat Rincian
      await lihatRincianBtn.click();

      // 2. Tombol harus berubah menjadi "Tutup Rincian"
      const tutupRincianBtn = page.locator('button:has-text("Tutup Rincian")').first();
      await expect(tutupRincianBtn).toBeVisible();

      // 3. Verifikasi warna tombol: TIDAK boleh bg-slate-800 / gelap hitam pekat
      const className = await tutupRincianBtn.getAttribute('class');
      expect(className).not.toContain('bg-slate-800');
      // Harus menggunakan tema rose-50 atau amber-50 yang selaras dengan rincian
      expect(className).toMatch(/bg-(rose|amber)-50/);

      // 4. Verifikasi detail box muncul
      await expect(page.locator('text=Rincian Bulan Belum Dibayar, text=Rincian Belum Dibayar').first()).toBeVisible();

      // 5. Klik Tutup Rincian
      await tutupRincianBtn.click();
      await expect(page.locator('button:has-text("Lihat Rincian")').first()).toBeVisible();
    }
  });

  test('Modal Export Tunggakan memiliki tombol kategori dengan warna selaras', async ({ page }) => {
    await page.goto('/tuition-arrears');

    const exportBtn = page.locator('button:has-text("Export Data Tunggakan")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verifikasi modal terbuka
    await expect(page.locator('text=Export Data Tunggakan SPP')).toBeVisible();

    // Tombol aktif "Semua Siswa" harus memiliki border-primary dan bg-primary/10 (bukan broken bg-primary/5/80)
    const semuaSiswaBtn = page.locator('button:has-text("Semua Siswa")');
    await expect(semuaSiswaBtn).toBeVisible();
    const btnClass = await semuaSiswaBtn.getAttribute('class');
    expect(btnClass).not.toContain('bg-primary/5/80');
    expect(btnClass).toContain('border-primary');

    // Tutup modal
    await page.locator('button:has-text("Batal"), button:has(.lucide-x)').first().click();
  });
});
