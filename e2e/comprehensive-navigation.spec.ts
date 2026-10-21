import { test, expect } from '@playwright/test';

test.describe('Pemeriksaan Menyeluruh (Overall Inspection & Navigation)', () => {
  const routes = [
    { url: '/dashboard', titleMatch: /Dashboard/i },
    { url: '/santriwan', titleMatch: /Santriwan|Putra/i },
    { url: '/santriwati', titleMatch: /Santriwati|Putri/i },
    { url: '/tuition-arrears', titleMatch: /Tunggakan/i },
    { url: '/tuition-per-month', titleMatch: /SPP|Master/i },
    { url: '/payment', titleMatch: /Pembayaran|Payment|Transaksi/i },
    { url: '/category', titleMatch: /Kategori/i },
    { url: '/users', titleMatch: /Pengguna|User/i },
    { url: '/role', titleMatch: /Role|Peran/i },
    { url: '/alumni', titleMatch: /Alumni/i },
  ];

  test('User admin dapat menavigasi ke seluruh modul utama tanpa error 500 atau blank', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Login satu kali
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@dayah.test');
    await page.fill('input[type="password"], input[name="password"]', '00000000');
    await page.click('button:has-text("Masuk ke Dasbor"), button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Kunjungi seluruh halaman utama berurutan
    for (const r of routes) {
      const response = await page.goto(r.url);
      expect(response?.status(), `Gagal memuat ${r.url}`).toBeLessThan(400);

      // Verifikasi komponen utama ter-render
      const main = page.locator('main');
      await expect(main).toBeVisible();
      await expect(page).toHaveTitle(r.titleMatch);
    }
  });
});
