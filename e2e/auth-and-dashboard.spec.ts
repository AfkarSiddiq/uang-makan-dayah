import { test, expect } from '@playwright/test';

test.describe('Autentikasi & Dashboard', () => {
  test('User admin dapat login dan melihat dashboard utama', async ({ page }) => {
    // 1. Kunjungi halaman login
    await page.goto('/login');
    await expect(page).toHaveTitle(/Masuk|Login/i);

    // 2. Isi kredensial admin
    await page.fill('input[type="email"], input[name="email"]', 'admin@dayah.test');
    await page.fill('input[type="password"], input[name="password"]', '00000000');
    await page.click('button:has-text("Masuk ke Dasbor"), button[type="submit"]');

    // 3. Verifikasi masuk ke dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard Utama' })).toBeVisible();

    // 4. Verifikasi komponen kartu ringkasan atau tabel transaksi
    const mainContent = page.locator('main');
    await expect(mainContent).toContainText(/Transaksi|Pemasukan|Pengeluaran|Saldo/i);
  });
});
