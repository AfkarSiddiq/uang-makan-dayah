import { test, expect } from '@playwright/test';

test.describe('Halaman Detail Siswa - Tampilan Kategori / Jenis Santri', () => {
  test.beforeEach(async ({ page }) => {
    // Login sebagai admin
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@dayah.test');
    await page.fill('input[type="password"], input[name="password"]', '00000000');
    await page.click('button:has-text("Masuk ke Dasbor"), button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Detail Siswa menampilkan Jenis / Kategori Santri pada profil', async ({ page }) => {
    // 1. Kunjungi halaman data siswa dan ambil link profil pertama
    await page.goto('/siswa');
    await page.waitForLoadState('networkidle');

    const profileLink = page.locator('a[title="Lihat Profil & Buku SPP"]').first();
    await expect(profileLink).toBeVisible();
    const href = await profileLink.getAttribute('href');
    expect(href).toBeTruthy();

    // 2. Kunjungi halaman detail profil siswa
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    // 3. Verifikasi judul "Informasi Siswa" tampil
    await expect(page.locator('h3:has-text("Informasi Siswa")')).toBeVisible();

    // 4. Verifikasi label Jenis / Kategori tampil di grid informasi
    const kategoriLabel = page.locator('p:has-text("Jenis / Kategori")');
    await expect(kategoriLabel).toBeVisible();

    // 5. Verifikasi badge kategori tampil di profil card dan grid
    const badgeCategory = page.locator('span:has-text("Umum"), span:has-text("Yatim"), span:has-text("Piatu"), span:has-text("Yatim Piatu")').first();
    await expect(badgeCategory).toBeVisible();
  });

  test('Detail Siswa di route /siswa/:id menampilkan Jenis / Kategori Siswa', async ({ page }) => {
    // Kunjungi langsung halaman show siswa
    await page.goto('/siswa/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3:has-text("Informasi Siswa")')).toBeVisible();
    await expect(page.locator('p:has-text("Jenis / Kategori Siswa")')).toBeVisible();
    await expect(page.locator('span:has-text("Umum"), span:has-text("Yatim")').first()).toBeVisible();
  });
});
