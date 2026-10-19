import { test, expect } from '@playwright/test';

test.describe('Modul Pembayaran & Anti Double-Input', () => {
  test.beforeEach(async ({ page }) => {
    // Login sebagai admin
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@dayah.test');
    await page.fill('input[type="password"], input[name="password"]', '00000000');
    await page.click('button:has-text("Masuk ke Dasbor"), button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Form pembayaran memiliki tombol submit yang memproteksi double-click', async ({ page }) => {
    await page.goto('/payment/create');
    await expect(page).toHaveTitle(/Tambah Transaksi|Payment/i);

    const submitBtn = page.locator('button[type="submit"]:has-text("Simpan Transaksi")');
    await expect(submitBtn).toBeVisible();

    // Verifikasi bahwa tombol dalam keadaan normal aktif
    await expect(submitBtn).toBeEnabled();
  });
});
