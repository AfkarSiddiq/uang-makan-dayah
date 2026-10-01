export interface DemoStudent {
    id: number;
    nisn: string;
    name: string;
    gender: 'L' | 'P';
    class: string | null;
    status: 'aktif' | 'lulus' | 'pindah' | 'berhenti';
    student_type: 'umum' | 'yatim' | 'piatu' | 'yatim_piatu';
    entry_month: number;
    entry_year: number;
    exit_month?: number | null;
    exit_year?: number | null;
}

export interface DemoCategory {
    id: number;
    name: string;
    type: 'in' | 'out' | 'both';
    is_active: boolean;
}

export interface DemoSppMonth {
    id: number;
    month: number;
    year: number;
    amount: number;
}

export interface DemoSppPayment {
    id: number;
    student_id: number;
    spp_month_id: number;
    paid_amount: number;
    status: 'paid' | 'unpaid' | 'partial';
    transaction_id?: number | null;
    created_at: string;
}

export interface DemoTransaction {
    id: number;
    transaction_id: string;
    student_id: number | null;
    type: 'in' | 'out';
    category: string;
    amount: number;
    note: string | null;
    transaction_date: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface DemoUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: { id: number; name: string; display_name: string }[];
}

export interface DemoRole {
    id: number;
    name: string;
    display_name: string;
    description: string;
    is_default: boolean;
    permissions: { id: number; name: string; display_name: string; group: string }[];
    users_count: number;
}

export const INITIAL_CATEGORIES: DemoCategory[] = [
    { id: 1, name: 'SPP Bulanan', type: 'in', is_active: true },
    { id: 2, name: 'Uang Makan', type: 'in', is_active: true },
    { id: 3, name: 'Infaq & Sedekah', type: 'in', is_active: true },
    { id: 4, name: 'Sumbangan Pembangunan', type: 'in', is_active: true },
    { id: 5, name: 'Uang Pangkal / Pendaftaran', type: 'in', is_active: true },
    { id: 6, name: 'Donasi Walisantri', type: 'in', is_active: true },
    { id: 7, name: 'Pemasukan Lainnya', type: 'in', is_active: true },
    { id: 8, name: 'Gaji Guru & Ustadz', type: 'out', is_active: true },
    { id: 9, name: 'Belanja Bahan Dapur & Sembako', type: 'out', is_active: true },
    { id: 10, name: 'Operasional & Konsumsi Dayah', type: 'out', is_active: true },
    { id: 11, name: 'Tagihan Listrik & Air', type: 'out', is_active: true },
    { id: 12, name: 'Pemeliharaan Gedung & Fasilitas', type: 'out', is_active: true },
    { id: 13, name: 'Inventaris Kitab & Buku', type: 'out', is_active: true },
    { id: 14, name: 'Pengeluaran Lainnya', type: 'out', is_active: true },
];

export const ALL_PERMISSIONS = [
    { id: 1, name: 'dashboard.view', display_name: 'Lihat Dashboard', group: 'Dashboard' },
    { id: 2, name: 'siswa.view', display_name: 'Lihat Data Siswa', group: 'Siswa' },
    { id: 3, name: 'siswa.create', display_name: 'Tambah Siswa', group: 'Siswa' },
    { id: 4, name: 'siswa.edit', display_name: 'Edit Siswa', group: 'Siswa' },
    { id: 5, name: 'siswa.delete', display_name: 'Hapus Siswa', group: 'Siswa' },
    { id: 6, name: 'siswa.import', display_name: 'Import Siswa', group: 'Siswa' },
    { id: 7, name: 'siswa.export', display_name: 'Export Siswa', group: 'Siswa' },
    { id: 8, name: 'kenaikan.view', display_name: 'Lihat Kenaikan Kelas', group: 'Kenaikan Kelas' },
    { id: 9, name: 'kenaikan.process', display_name: 'Proses Kenaikan Kelas', group: 'Kenaikan Kelas' },
    { id: 10, name: 'spp.view', display_name: 'Lihat Pengaturan SPP', group: 'SPP' },
    { id: 11, name: 'spp.create', display_name: 'Bayar SPP', group: 'SPP' },
    { id: 12, name: 'spp.edit', display_name: 'Kelola Tagihan SPP', group: 'SPP' },
    { id: 13, name: 'spp.tunggakan', display_name: 'Lihat Tunggakan SPP', group: 'SPP' },
    { id: 14, name: 'pembayaran.masuk.view', display_name: 'Lihat Transaksi Masuk', group: 'Transaksi' },
    { id: 15, name: 'pembayaran.masuk.create', display_name: 'Catat Transaksi Masuk', group: 'Transaksi' },
    { id: 16, name: 'pembayaran.keluar.view', display_name: 'Lihat Transaksi Keluar', group: 'Transaksi' },
    { id: 17, name: 'pembayaran.keluar.create', display_name: 'Catat Transaksi Keluar', group: 'Transaksi' },
    { id: 18, name: 'pembayaran.edit', display_name: 'Edit Transaksi', group: 'Transaksi' },
    { id: 19, name: 'pembayaran.delete', display_name: 'Hapus Transaksi', group: 'Transaksi' },
    { id: 20, name: 'pembayaran.print', display_name: 'Cetak Bukti Pembayaran', group: 'Transaksi' },
    { id: 21, name: 'pembayaran.import', display_name: 'Import Transaksi', group: 'Transaksi' },
    { id: 22, name: 'pembayaran.export', display_name: 'Export Transaksi', group: 'Transaksi' },
    { id: 23, name: 'kategori.view', display_name: 'Lihat Kategori', group: 'Kategori' },
    { id: 24, name: 'kategori.create', display_name: 'Tambah Kategori', group: 'Kategori' },
    { id: 25, name: 'kategori.edit', display_name: 'Edit Kategori', group: 'Kategori' },
    { id: 26, name: 'kategori.delete', display_name: 'Hapus Kategori', group: 'Kategori' },
    { id: 27, name: 'users.view', display_name: 'Kelola Pengguna', group: 'Pengguna' },
    { id: 28, name: 'users.roles', display_name: 'Kelola Role & Hak Akses', group: 'Pengguna' },
];

export const INITIAL_ROLES: DemoRole[] = [
    {
        id: 1,
        name: 'admin',
        display_name: 'Administrator Dayah',
        description: 'Akses penuh ke seluruh sistem dan konfigurasi',
        is_default: true,
        permissions: [...ALL_PERMISSIONS],
        users_count: 1,
    },
    {
        id: 2,
        name: 'bendahara',
        display_name: 'Bendahara Keuangan',
        description: 'Akses pengelolaan kas, pembayaran santri, dan laporan keuangan',
        is_default: false,
        permissions: ALL_PERMISSIONS.filter(p => !p.name.startsWith('users.')),
        users_count: 1,
    },
    {
        id: 3,
        name: 'staff',
        display_name: 'Staff Administrasi',
        description: 'Akses pencatatan santri dan input pembayaran dasar',
        is_default: false,
        permissions: ALL_PERMISSIONS.filter(p => ['dashboard.view', 'siswa.view', 'siswa.create', 'pembayaran.masuk.view', 'spp.tunggakan'].includes(p.name)),
        users_count: 1,
    },
];

export const INITIAL_USERS: DemoUser[] = [
    {
        id: 1,
        name: 'Admin Dayah',
        email: 'admin@dayah.test',
        avatar: '/minhajussalam.png',
        email_verified_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        roles: [{ id: 1, name: 'admin', display_name: 'Administrator Dayah' }],
    },
    {
        id: 2,
        name: 'Ustadz Ahmad Fauzi',
        email: 'bendahara@dayah.test',
        avatar: undefined,
        email_verified_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        roles: [{ id: 2, name: 'bendahara', display_name: 'Bendahara Keuangan' }],
    },
    {
        id: 3,
        name: 'Ustadzah Siti Aminah',
        email: 'staff@dayah.test',
        avatar: undefined,
        email_verified_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        roles: [{ id: 3, name: 'staff', display_name: 'Staff Administrasi' }],
    },
];

export const INITIAL_STUDENTS: DemoStudent[] = [
    // SANTRIWAN (PUTRA)
    { id: 1, nisn: '0081234501', name: 'Muhammad Al-Fatih', gender: 'L', class: '1', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2025 },
    { id: 2, nisn: '0081234502', name: 'Bilal Ramadhan', gender: 'L', class: '1', status: 'aktif', student_type: 'yatim', entry_month: 7, entry_year: 2025 },
    { id: 3, nisn: '0071234503', name: 'Fauzan Azzam', gender: 'L', class: '2', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2024 },
    { id: 4, nisn: '0071234504', name: 'Ziyad Khalid', gender: 'L', class: '2', status: 'aktif', student_type: 'piatu', entry_month: 7, entry_year: 2024 },
    { id: 5, nisn: '0061234505', name: 'Rayyan Hafizh', gender: 'L', class: '3', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2023 },
    { id: 6, nisn: '0061234506', name: 'Hamzah Al-Baqir', gender: 'L', class: '3', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2023 },
    { id: 7, nisn: '0051234507', name: 'Dzaki Mubarak', gender: 'L', class: '4', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2022 },
    { id: 8, nisn: '0051234508', name: 'Salman Al-Farisi', gender: 'L', class: '4', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2022 },
    { id: 9, nisn: '0041234509', name: 'Ammar Baihaqi', gender: 'L', class: '5', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2021 },
    { id: 10, nisn: '0041234510', name: 'Umar Faruq', gender: 'L', class: '5', status: 'aktif', student_type: 'yatim_piatu', entry_month: 7, entry_year: 2021 },
    { id: 11, nisn: '0031234511', name: 'Tariq Ziyad', gender: 'L', class: '6', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2020 },
    { id: 12, nisn: '0031234512', name: 'Hasan Basri', gender: 'L', class: '6', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2020 },
    
    // SANTRIWATI (PUTRI)
    { id: 13, nisn: '0082234513', name: 'Aisha Humaira', gender: 'P', class: '1', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2025 },
    { id: 14, nisn: '0082234514', name: 'Maryam Khadijah', gender: 'P', class: '1', status: 'aktif', student_type: 'yatim', entry_month: 7, entry_year: 2025 },
    { id: 15, nisn: '0072234515', name: 'Fatimah Azzahra', gender: 'P', class: '2', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2024 },
    { id: 16, nisn: '0072234516', name: 'Naila Syarifah', gender: 'P', class: '2', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2024 },
    { id: 17, nisn: '0062234517', name: 'Zahra Nur Haliza', gender: 'P', class: '3', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2023 },
    { id: 18, nisn: '0062234518', name: 'Syifa Kamila', gender: 'P', class: '3', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2023 },
    { id: 19, nisn: '0052234519', name: 'Hilya Annisa', gender: 'P', class: '4', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2022 },
    { id: 20, nisn: '0052234520', name: 'Rahma Maulida', gender: 'P', class: '4', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2022 },
    { id: 21, nisn: '0042234521', name: 'Safiyyah Zahid', gender: 'P', class: '5', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2021 },
    { id: 22, nisn: '0042234522', name: 'Yasmin Tsabita', gender: 'P', class: '5', status: 'aktif', student_type: 'yatim', entry_month: 7, entry_year: 2021 },
    { id: 23, nisn: '0032234523', name: 'Salma Nuha', gender: 'P', class: '6', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2020 },
    { id: 24, nisn: '0032234524', name: 'Najwa Shihabiah', gender: 'P', class: '6', status: 'aktif', student_type: 'umum', entry_month: 7, entry_year: 2020 },

    // ALUMNI & PINDAH
    { id: 25, nisn: '0021234591', name: 'Arif Rahman Hakim', gender: 'L', class: null, status: 'lulus', student_type: 'umum', entry_month: 7, entry_year: 2019, exit_month: 6, exit_year: 2025 },
    { id: 26, nisn: '0011234592', name: 'Ihsanuddin Robbani', gender: 'L', class: null, status: 'lulus', student_type: 'umum', entry_month: 7, entry_year: 2018, exit_month: 6, exit_year: 2024 },
    { id: 27, nisn: '0022234593', name: 'Siti Sarah Zahirah', gender: 'P', class: null, status: 'lulus', student_type: 'umum', entry_month: 7, entry_year: 2019, exit_month: 6, exit_year: 2025 },
    { id: 28, nisn: '0012234594', name: 'Nurul Huda Salsabila', gender: 'P', class: null, status: 'lulus', student_type: 'umum', entry_month: 7, entry_year: 2018, exit_month: 6, exit_year: 2024 },
    { id: 29, nisn: '0071234595', name: 'Bagas Pratama', gender: 'L', class: null, status: 'pindah', student_type: 'umum', entry_month: 7, entry_year: 2024, exit_month: 12, exit_year: 2024 },
    { id: 30, nisn: '0062234596', name: 'Rania Putri Andini', gender: 'P', class: null, status: 'berhenti', student_type: 'umum', entry_month: 7, entry_year: 2023, exit_month: 2, exit_year: 2024 },
];

export const INITIAL_SPP_MONTHS: DemoSppMonth[] = [
    // Tahun Ajaran 2024/2025 (Juli 2024 - Juni 2025)
    { id: 1, month: 7, year: 2024, amount: 450000 },
    { id: 2, month: 8, year: 2024, amount: 450000 },
    { id: 3, month: 9, year: 2024, amount: 450000 },
    { id: 4, month: 10, year: 2024, amount: 450000 },
    { id: 5, month: 11, year: 2024, amount: 450000 },
    { id: 6, month: 12, year: 2024, amount: 450000 },
    { id: 7, month: 1, year: 2025, amount: 450000 },
    { id: 8, month: 2, year: 2025, amount: 450000 },
    { id: 9, month: 3, year: 2025, amount: 450000 },
    { id: 10, month: 4, year: 2025, amount: 450000 },
    { id: 11, month: 5, year: 2025, amount: 450000 },
    { id: 12, month: 6, year: 2025, amount: 450000 },

    // Tahun Ajaran 2025/2026 (Juli 2025 - Juni 2026)
    { id: 13, month: 7, year: 2025, amount: 500000 },
    { id: 14, month: 8, year: 2025, amount: 500000 },
    { id: 15, month: 9, year: 2025, amount: 500000 },
    { id: 16, month: 10, year: 2025, amount: 500000 },
    { id: 17, month: 11, year: 2025, amount: 500000 },
    { id: 18, month: 12, year: 2025, amount: 500000 },
    { id: 19, month: 1, year: 2026, amount: 500000 },
    { id: 20, month: 2, year: 2026, amount: 500000 },
    { id: 21, month: 3, year: 2026, amount: 500000 },
    { id: 22, month: 4, year: 2026, amount: 500000 },
    { id: 23, month: 5, year: 2026, amount: 500000 },
    { id: 24, month: 6, year: 2026, amount: 500000 },
];

// Helper to seed initial payments
export const INITIAL_SPP_PAYMENTS: DemoSppPayment[] = (() => {
    const list: DemoSppPayment[] = [];
    let pid = 1;
    
    // For active students in classes 1 to 6
    INITIAL_STUDENTS.forEach((student) => {
        if (student.status !== 'aktif') return;
        
        // Months applicable for student based on entry
        INITIAL_SPP_MONTHS.forEach((m) => {
            const mScore = m.year * 12 + m.month;
            const entryScore = student.entry_year * 12 + student.entry_month;
            if (mScore < entryScore) return;

            // Make some students fully paid up to month 3/2026, and some have 1-2 months unpaid
            const currentScore = 2026 * 12 + 3; // Up to Maret 2026
            if (mScore <= currentScore) {
                // Odd IDs have paid everything, even IDs have 1-2 unpaid months
                const shouldPay = (student.id % 3 !== 0) || (mScore < currentScore - 1);
                if (shouldPay) {
                    list.push({
                        id: pid++,
                        student_id: student.id,
                        spp_month_id: m.id,
                        paid_amount: m.amount,
                        status: 'paid',
                        transaction_id: null,
                        created_at: `${m.year}-${String(m.month).padStart(2, '0')}-10 09:30:00`,
                    });
                }
            }
        });
    });

    return list;
})();

export const INITIAL_TRANSACTIONS: DemoTransaction[] = [
    {
        id: 1,
        transaction_id: 'TRX-20260301-0001',
        student_id: 1,
        type: 'in',
        category: 'SPP Bulanan',
        amount: 500000,
        note: 'Pembayaran SPP Bulan Maret 2026 (Muhammad Al-Fatih)',
        transaction_date: '2026-03-01',
        user_id: 1,
        created_at: '2026-03-01 08:30:00',
        updated_at: '2026-03-01 08:30:00',
    },
    {
        id: 2,
        transaction_id: 'TRX-20260301-0002',
        student_id: 1,
        type: 'in',
        category: 'Uang Makan',
        amount: 600000,
        note: 'Uang makan bulan Maret 2026',
        transaction_date: '2026-03-01',
        user_id: 1,
        created_at: '2026-03-01 08:35:00',
        updated_at: '2026-03-01 08:35:00',
    },
    {
        id: 3,
        transaction_id: 'TRX-20260302-0003',
        student_id: null,
        type: 'out',
        category: 'Belanja Bahan Dapur & Sembako',
        amount: 3850000,
        note: 'Pembelian 10 karung beras @50kg dan minyak goreng untuk konsumsi santri',
        transaction_date: '2026-03-02',
        user_id: 2,
        created_at: '2026-03-02 10:15:00',
        updated_at: '2026-03-02 10:15:00',
    },
    {
        id: 4,
        transaction_id: 'TRX-20260303-0004',
        student_id: 13,
        type: 'in',
        category: 'SPP Bulanan',
        amount: 500000,
        note: 'Pembayaran SPP Bulan Maret 2026 (Aisha Humaira)',
        transaction_date: '2026-03-03',
        user_id: 1,
        created_at: '2026-03-03 09:00:00',
        updated_at: '2026-03-03 09:00:00',
    },
    {
        id: 5,
        transaction_id: 'TRX-20260303-0005',
        student_id: 13,
        type: 'in',
        category: 'Uang Makan',
        amount: 600000,
        note: 'Uang makan santriwati bulan Maret',
        transaction_date: '2026-03-03',
        user_id: 1,
        created_at: '2026-03-03 09:05:00',
        updated_at: '2026-03-03 09:05:00',
    },
    {
        id: 6,
        transaction_id: 'TRX-20260305-0006',
        student_id: null,
        type: 'out',
        category: 'Tagihan Listrik & Air',
        amount: 1450000,
        note: 'Pembayaran token PLN asrama putra dan asrama putri',
        transaction_date: '2026-03-05',
        user_id: 2,
        created_at: '2026-03-05 11:20:00',
        updated_at: '2026-03-05 11:20:00',
    },
    {
        id: 7,
        transaction_id: 'TRX-20260307-0007',
        student_id: null,
        type: 'in',
        category: 'Infaq & Sedekah',
        amount: 2500000,
        note: 'Infaq dari H. Sulaiman untuk operasional buka puasa sunnah santri',
        transaction_date: '2026-03-07',
        user_id: 1,
        created_at: '2026-03-07 14:00:00',
        updated_at: '2026-03-07 14:00:00',
    },
    {
        id: 8,
        transaction_id: 'TRX-20260310-0008',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor & mukafaah para ustadz pengajar kitab kuning',
        transaction_date: '2026-03-10',
        user_id: 2,
        created_at: '2026-03-10 16:30:00',
        updated_at: '2026-03-10 16:30:00',
    },
    {
        id: 9,
        transaction_id: 'TRX-20260312-0009',
        student_id: 5,
        type: 'in',
        category: 'SPP Bulanan',
        amount: 500000,
        note: 'Pembayaran SPP Maret 2026 (Rayyan Hafizh)',
        transaction_date: '2026-03-12',
        user_id: 1,
        created_at: '2026-03-12 10:00:00',
        updated_at: '2026-03-12 10:00:00',
    },
    {
        id: 10,
        transaction_id: 'TRX-20260314-0010',
        student_id: null,
        type: 'out',
        category: 'Pemeliharaan Gedung & Fasilitas',
        amount: 750000,
        note: 'Perbaikan instalasi kran tempat wudhu masjid dayah',
        transaction_date: '2026-03-14',
        user_id: 2,
        created_at: '2026-03-14 13:45:00',
        updated_at: '2026-03-14 13:45:00',
    },
    {
        id: 11,
        transaction_id: 'TRX-20260315-0011',
        student_id: 17,
        type: 'in',
        category: 'SPP Bulanan',
        amount: 500000,
        note: 'Pembayaran SPP Maret (Zahra Nur Haliza)',
        transaction_date: '2026-03-15',
        user_id: 1,
        created_at: '2026-03-15 08:45:00',
        updated_at: '2026-03-15 08:45:00',
    },
    {
        id: 12,
        transaction_id: 'TRX-20260318-0012',
        student_id: null,
        type: 'in',
        category: 'Donasi Walisantri',
        amount: 3000000,
        note: 'Donasi pengadaan sound system kajian malam jum’at',
        transaction_date: '2026-03-18',
        user_id: 1,
        created_at: '2026-03-18 11:10:00',
        updated_at: '2026-03-18 11:10:00',
    },
    {
        id: 13,
        transaction_id: 'TRX-20260215-0013',
        student_id: null,
        type: 'out',
        category: 'Belanja Bahan Dapur & Sembako',
        amount: 4200000,
        note: 'Belanja lauk pauk (ayam, ikan, telur, sayur) dapur santri Februari',
        transaction_date: '2026-02-15',
        user_id: 2,
        created_at: '2026-02-15 09:30:00',
        updated_at: '2026-02-15 09:30:00',
    },
    {
        id: 14,
        transaction_id: 'TRX-20260210-0014',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor Ustadz & Pembina Asrama bulan Februari',
        transaction_date: '2026-02-10',
        user_id: 2,
        created_at: '2026-02-10 10:00:00',
        updated_at: '2026-02-10 10:00:00',
    },
    {
        id: 15,
        transaction_id: 'TRX-20260205-0015',
        student_id: 3,
        type: 'in',
        category: 'SPP Bulanan',
        amount: 500000,
        note: 'Pembayaran SPP Februari 2026 (Fauzan Azzam)',
        transaction_date: '2026-02-05',
        user_id: 1,
        created_at: '2026-02-05 14:20:00',
        updated_at: '2026-02-05 14:20:00',
    },
    {
        id: 16,
        transaction_id: 'TRX-20260115-0016',
        student_id: null,
        type: 'in',
        category: 'Infaq & Sedekah',
        amount: 5000000,
        note: 'Infaq pembangunan asrama baru dari alumni',
        transaction_date: '2026-01-15',
        user_id: 1,
        created_at: '2026-01-15 13:00:00',
        updated_at: '2026-01-15 13:00:00',
    },
    {
        id: 17,
        transaction_id: 'TRX-20260110-0017',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor ustadz bulan Januari',
        transaction_date: '2026-01-10',
        user_id: 2,
        created_at: '2026-01-10 11:00:00',
        updated_at: '2026-01-10 11:00:00',
    },
    {
        id: 18,
        transaction_id: 'TRX-20251220-0018',
        student_id: null,
        type: 'out',
        category: 'Inventaris Kitab & Buku',
        amount: 1800000,
        note: 'Pengadaan kitab Fathul Qorib dan Jurumiyah untuk santri baru semester genap',
        transaction_date: '2025-12-20',
        user_id: 2,
        created_at: '2025-12-20 15:10:00',
        updated_at: '2025-12-20 15:10:00',
    },
    {
        id: 19,
        transaction_id: 'TRX-20251210-0019',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor ustadz bulan Desember 2025',
        transaction_date: '2025-12-10',
        user_id: 2,
        created_at: '2025-12-10 10:00:00',
        updated_at: '2025-12-10 10:00:00',
    },
    {
        id: 20,
        transaction_id: 'TRX-20251110-0020',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor ustadz bulan November 2025',
        transaction_date: '2025-11-10',
        user_id: 2,
        created_at: '2025-11-10 10:00:00',
        updated_at: '2025-11-10 10:00:00',
    },
    {
        id: 21,
        transaction_id: 'TRX-20251010-0021',
        student_id: null,
        type: 'out',
        category: 'Gaji Guru & Ustadz',
        amount: 8500000,
        note: 'Honor ustadz bulan Oktober 2025',
        transaction_date: '2025-10-10',
        user_id: 2,
        created_at: '2025-10-10 10:00:00',
        updated_at: '2025-10-10 10:00:00',
    },
];
