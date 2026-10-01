import * as XLSX from 'xlsx';
import {
    DemoCategory,
    DemoRole,
    DemoSppMonth,
    DemoSppPayment,
    DemoStudent,
    DemoTransaction,
    DemoUser,
    INITIAL_CATEGORIES,
    INITIAL_ROLES,
    INITIAL_SPP_MONTHS,
    INITIAL_SPP_PAYMENTS,
    INITIAL_STUDENTS,
    INITIAL_TRANSACTIONS,
    INITIAL_USERS,
    ALL_PERMISSIONS,
} from './mock-data';

export interface DayahDatabase {
    students: DemoStudent[];
    categories: DemoCategory[];
    sppMonths: DemoSppMonth[];
    sppPayments: DemoSppPayment[];
    transactions: DemoTransaction[];
    users: DemoUser[];
    roles: DemoRole[];
}

const STORAGE_KEY = 'DAYAH_DEMO_DB_V3';

export function getInitialDb(): DayahDatabase {
    return {
        students: JSON.parse(JSON.stringify(INITIAL_STUDENTS)),
        categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
        sppMonths: JSON.parse(JSON.stringify(INITIAL_SPP_MONTHS)),
        sppPayments: JSON.parse(JSON.stringify(INITIAL_SPP_PAYMENTS)),
        transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
        users: JSON.parse(JSON.stringify(INITIAL_USERS)),
        roles: JSON.parse(JSON.stringify(INITIAL_ROLES)),
    };
}

export function loadDb(): DayahDatabase {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            const initial = getInitialDb();
            saveDb(initial);
            return initial;
        }
        return JSON.parse(raw);
    } catch {
        const initial = getInitialDb();
        saveDb(initial);
        return initial;
    }
}

export function saveDb(db: DayahDatabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    listeners.forEach((listener) => listener());
}

export function resetDb(): DayahDatabase {
    const initial = getInitialDb();
    saveDb(initial);
    return initial;
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribeDb(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Helper: Pagination object generator
export function paginate<T>(items: T[], page = 1, perPage = 15, baseUrl = '') {
    const total = items.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(1, page), lastPage);
    const offset = (currentPage - 1) * perPage;
    const data = items.slice(offset, offset + perPage);

    const links = [];
    links.push({
        url: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
        label: '&laquo; Previous',
        active: false,
    });
    for (let p = 1; p <= lastPage; p++) {
        links.push({
            url: `${baseUrl}?page=${p}`,
            label: String(p),
            active: p === currentPage,
        });
    }
    links.push({
        url: currentPage < lastPage ? `${baseUrl}?page=${currentPage + 1}` : null,
        label: 'Next &raquo;',
        active: false,
    });

    return {
        data,
        current_page: currentPage,
        first_page_url: `${baseUrl}?page=1`,
        from: total === 0 ? null : offset + 1,
        last_page: lastPage,
        last_page_url: `${baseUrl}?page=${lastPage}`,
        links,
        next_page_url: currentPage < lastPage ? `${baseUrl}?page=${currentPage + 1}` : null,
        path: baseUrl,
        per_page: perPage,
        prev_page_url: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
        to: total === 0 ? null : Math.min(offset + perPage, total),
        total,
    };
}

export const MONTH_NAMES = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function getMonthName(monthNumber: number): string {
    return MONTH_NAMES[monthNumber] || '';
}

// Student virtual ledger calculation
export function calculateStudentVirtualLedger(student: DemoStudent, db: DayahDatabase) {
    const sppMonths = [...db.sppMonths].sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    const paymentsMap = new Map<number, DemoSppPayment>();
    db.sppPayments
        .filter((p) => p.student_id === student.id)
        .forEach((p) => paymentsMap.set(p.spp_month_id, p));

    const virtualLedger = sppMonths
        .filter((master) => {
            const masterScore = master.year * 12 + master.month;
            const entryScore = student.entry_year * 12 + student.entry_month;
            if (masterScore < entryScore) return false;

            if (student.exit_year && student.exit_month) {
                const exitScore = student.exit_year * 12 + student.exit_month;
                if (masterScore > exitScore) return false;
            }
            return true;
        })
        .map((master) => {
            const payment = paymentsMap.get(master.id);
            return {
                id: payment ? payment.id : `virtual-${master.id}`,
                spp_month_id: master.id,
                month: master.month,
                year: master.year,
                amount: master.amount,
                paid_amount: payment ? payment.paid_amount : 0,
                status: payment ? payment.status : 'unpaid',
            };
        });

    return {
        ...student,
        spp_payments: virtualLedger,
    };
}

// Arrears calculation for Tuition Arrears page (matching TuitionArrearsController.php & interface)
export function calculateArrears(db: DayahDatabase, selectedMonthId?: string | number | null) {
    const currentYear = 2026;
    const currentMonth = 3;
    const currentScore = currentYear * 12 + currentMonth;

    const result: any[] = [];

    db.students.forEach((student) => {
        const studentProfile = calculateStudentVirtualLedger(student, db);
        const unpaidMonths: any[] = [];
        let totalArrears = 0;

        studentProfile.spp_payments.forEach((ledgerItem: any) => {
            const itemScore = ledgerItem.year * 12 + ledgerItem.month;
            if (itemScore <= currentScore && ledgerItem.status !== 'paid') {
                if (selectedMonthId) {
                    if (String(ledgerItem.spp_month_id) === String(selectedMonthId)) {
                        const unpaidAmount = ledgerItem.amount - (ledgerItem.paid_amount || 0);
                        if (unpaidAmount > 0) {
                            totalArrears += unpaidAmount;
                            unpaidMonths.push({
                                id: ledgerItem.spp_month_id,
                                month: ledgerItem.month,
                                year: ledgerItem.year,
                                month_name: `${getMonthName(ledgerItem.month)} ${ledgerItem.year}`,
                                amount: unpaidAmount,
                            });
                        }
                    }
                } else {
                    const unpaidAmount = ledgerItem.amount - (ledgerItem.paid_amount || 0);
                    if (unpaidAmount > 0) {
                        totalArrears += unpaidAmount;
                        unpaidMonths.push({
                            id: ledgerItem.spp_month_id,
                            month: ledgerItem.month,
                            year: ledgerItem.year,
                            month_name: `${getMonthName(ledgerItem.month)} ${ledgerItem.year}`,
                            amount: unpaidAmount,
                        });
                    }
                }
            }
        });

        if (unpaidMonths.length > 0) {
            result.push({
                id: student.id,
                nisn: student.nisn,
                name: student.name,
                gender: student.gender,
                class: student.class || '-',
                status: student.status,
                student_type: student.student_type,
                entry_month: student.entry_month,
                entry_year: student.entry_year,
                arrears_count: unpaidMonths.length, // Matches interface Student.arrears_count!
                total_arrears: totalArrears,
                unpaid_months: unpaidMonths,
            });
        }
    });

    return result;
}

// Props Providers for Pages
export const DemoStore = {
    getCategoriesHelper(db: DayahDatabase) {
        const active = db.categories.filter((c) => c.is_active);
        return {
            in: active.filter((c) => c.type === 'in' || c.type === 'both').map((c) => c.name),
            out: active.filter((c) => c.type === 'out' || c.type === 'both').map((c) => c.name),
        };
    },

    getDashboardProps(params: Record<string, string> = {}) {
        const db = loadDb();
        const txList = [...db.transactions].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        const hydratedTx = txList.map((tx) => ({
            ...tx,
            student: tx.student_id ? db.students.find((s) => s.id === tx.student_id) : undefined,
            user: db.users.find((u) => u.id === tx.user_id),
        }));

        const totalIn = db.transactions.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
        const totalOut = db.transactions.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown
        const inMap: Record<string, number> = {};
        db.transactions.filter((t) => t.type === 'in').forEach((t) => {
            inMap[t.category] = (inMap[t.category] || 0) + t.amount;
        });
        const in_categories = Object.entries(inMap).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

        const outMap: Record<string, number> = {};
        db.transactions.filter((t) => t.type === 'out').forEach((t) => {
            outMap[t.category] = (outMap[t.category] || 0) + t.amount;
        });
        const out_categories = Object.entries(outMap).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

        // 6 Month Trend
        const monthly_trend: { year: number; month: number; in: number; out: number }[] = [
            { year: 2025, month: 10, in: 18500000, out: 14200000 },
            { year: 2025, month: 11, in: 21000000, out: 16800000 },
            { year: 2025, month: 12, in: 24500000, out: 19500000 },
            { year: 2026, month: 1, in: 27000000, out: 17800000 },
            { year: 2026, month: 2, in: 22000000, out: 18400000 },
            { year: 2026, month: 3, in: 29500000, out: 15300000 },
        ];

        const paginatedTx = paginate(hydratedTx, Number(params.page || 1), 15, '/dashboard');

        return {
            transactions: paginatedTx,
            latest_transactions: hydratedTx.slice(0, 5),
            chart_data: {
                in_categories,
                out_categories,
                monthly_trend,
            },
            summary: {
                total_in: totalIn,
                total_out: totalOut,
                balance: totalIn - totalOut,
            },
            student_stats: {
                total_aktif: db.students.filter((s) => s.status === 'aktif').length,
                santriwan_aktif: db.students.filter((s) => s.status === 'aktif' && s.gender === 'L').length,
                santriwati_aktif: db.students.filter((s) => s.status === 'aktif' && s.gender === 'P').length,
                total_non_aktif: db.students.filter((s) => s.status !== 'aktif').length,
            },
            filters: params,
            categories: this.getCategoriesHelper(db),
        };
    },

    getPaymentIndexProps(params: Record<string, string> = {}) {
        const db = loadDb();
        let list = [...db.transactions];

        if (params.type && (params.type === 'in' || params.type === 'out')) {
            list = list.filter((t) => t.type === params.type);
        }
        if (params.category) {
            list = list.filter((t) => t.category === params.category);
        }
        if (params.date_from) {
            list = list.filter((t) => t.transaction_date >= params.date_from);
        }
        if (params.date_to) {
            list = list.filter((t) => t.transaction_date <= params.date_to);
        }
        if (params.search) {
            const q = params.search.toLowerCase().trim();
            list = list.filter((t) => {
                const s = t.student_id ? db.students.find((std) => std.id === t.student_id) : null;
                return (
                    t.transaction_id.toLowerCase().includes(q) ||
                    (t.note && t.note.toLowerCase().includes(q)) ||
                    (s && (s.name.toLowerCase().includes(q) || s.nisn.includes(q)))
                );
            });
        }

        const sortBy = params.sort_by || 'transaction_date';
        const sortDir = params.sort_dir || 'desc';
        list.sort((a, b) => {
            let valA: any = a[sortBy as keyof DemoTransaction];
            let valB: any = b[sortBy as keyof DemoTransaction];
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        const hydrated = list.map((tx) => ({
            ...tx,
            student: tx.student_id ? db.students.find((s) => s.id === tx.student_id) : undefined,
            user: db.users.find((u) => u.id === tx.user_id),
        }));

        const totalIn = list.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
        const totalOut = list.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

        return {
            transactions: paginate(hydrated, Number(params.page || 1), Number(params.per_page || 15), '/payment'),
            summary: {
                total_in: totalIn,
                total_out: totalOut,
                balance: totalIn - totalOut,
            },
            filters: params,
            categories: this.getCategoriesHelper(db),
            allowedTypes: ['in', 'out'],
        };
    },

    getPaymentCreateProps() {
        const db = loadDb();
        const activeStudents = db.students.filter((s) => s.status === 'aktif');
        const classes = ['1', '2', '3', '4', '5', '6'];

        const studentsByGender: Record<string, Record<string, DemoStudent[]>> = {
            L: {},
            P: {},
        };

        classes.forEach((c) => {
            studentsByGender.L[c] = activeStudents.filter((s) => s.gender === 'L' && s.class === c);
            studentsByGender.P[c] = activeStudents.filter((s) => s.gender === 'P' && s.class === c);
        });

        return {
            studentsByGender,
            classes,
            categories: this.getCategoriesHelper(db),
            allowedCreateTypes: ['in', 'out'],
        };
    },

    getPaymentEditProps(id: number) {
        const db = loadDb();
        const payment = db.transactions.find((t) => t.id === Number(id)) || db.transactions[0];
        const activeStudents = db.students.filter((s) => s.status === 'aktif');
        const classes = ['1', '2', '3', '4', '5', '6'];

        const studentsByGender: Record<string, Record<string, DemoStudent[]>> = {
            L: {},
            P: {},
        };

        classes.forEach((c) => {
            studentsByGender.L[c] = activeStudents.filter((s) => s.gender === 'L' && s.class === c);
            studentsByGender.P[c] = activeStudents.filter((s) => s.gender === 'P' && s.class === c);
        });

        return {
            transaction: payment, // matches Edit({ transaction, students, categories })!
            payment,             // fallback
            students: activeStudents,
            studentsByGender,
            classes,
            categories: this.getCategoriesHelper(db),
            allowedTypes: ['in', 'out'],
        };
    },

    getSantriKelasProps(gender: 'L' | 'P') {
        const db = loadDb();
        const classes = ['1', '2', '3', '4', '5', '6'];
        const kelasData = classes.map((c) => ({
            class: c,
            total_siswa: db.students.filter((s) => s.gender === gender && s.class === c && s.status === 'aktif').length,
        }));

        return { kelasData };
    },

    getSantriDetailKelasProps(gender: 'L' | 'P', kelas: string) {
        const db = loadDb();
        const students = db.students
            .filter((s) => s.gender === gender && s.class === kelas)
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            namaKelas: kelas,
            students,
        };
    },

    getSantriProfilProps(id: number, gender?: 'L' | 'P') {
        const db = loadDb();
        const student = db.students.find((s) => s.id === Number(id)) || db.students[0];
        return {
            student: calculateStudentVirtualLedger(student, db),
        };
    },

    getSantriKenaikanProps(gender: 'L' | 'P') {
        const db = loadDb();
        const kelasAktif = ['1', '2', '3', '4', '5', '6']
            .filter((c) => db.students.some((s) => s.gender === gender && s.class === c && s.status === 'aktif'))
            .map((c) => ({ class: c }));

        return { kelasAktif };
    },

    getTuitionArrearsProps(params: Record<string, string> = {}) {
        const db = loadDb();
        const selectedMonth = params.month || null;
        const students = calculateArrears(db, selectedMonth);

        const currentYear = 2026;
        const currentMonth = 3;
        const currentScore = currentYear * 12 + currentMonth;

        const availableMonths = db.sppMonths
            .filter((m) => m.year * 12 + m.month <= currentScore)
            .sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month))
            .map((m) => ({
                id: m.id,
                month: m.month,
                year: m.year,
                label: `${getMonthName(m.month)} ${m.year}`,
            }));

        const totalStudents = students.length;
        const totalArrears = students.reduce((sum, s) => sum + s.total_arrears, 0);
        const activeCount = students.filter((s) => s.status === 'aktif').length;
        const inactiveCount = students.filter((s) => s.status !== 'aktif').length;

        return {
            students,
            summary: {
                total_students: totalStudents,
                total_arrears: totalArrears,
                active_students_count: activeCount,
                inactive_students_count: inactiveCount,
            },
            availableMonths,
            selectedMonth,
        };
    },

    getHistoryProps(params: Record<string, string> = {}) {
        const db = loadDb();
        let list = [...db.transactions];

        if (params.type && (params.type === 'in' || params.type === 'out')) {
            list = list.filter((t) => t.type === params.type);
        }
        if (params.category) {
            list = list.filter((t) => t.category === params.category);
        }
        if (params.date_from) {
            list = list.filter((t) => t.transaction_date >= params.date_from);
        }
        if (params.date_to) {
            list = list.filter((t) => t.transaction_date <= params.date_to);
        }
        if (params.search) {
            const q = params.search.toLowerCase().trim();
            list = list.filter((t) => {
                const s = t.student_id ? db.students.find((std) => std.id === t.student_id) : null;
                return (
                    t.transaction_id.toLowerCase().includes(q) ||
                    (t.note && t.note.toLowerCase().includes(q)) ||
                    (s && (s.name.toLowerCase().includes(q) || s.nisn.includes(q)))
                );
            });
        }

        const sortBy = params.sort_by || 'transaction_date';
        const sortDir = params.sort_dir || 'desc';
        list.sort((a, b) => {
            let valA: any = a[sortBy as keyof DemoTransaction];
            let valB: any = b[sortBy as keyof DemoTransaction];
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        const hydrated = list.map((tx) => ({
            ...tx,
            student: tx.student_id ? db.students.find((s) => s.id === tx.student_id) : undefined,
            user: db.users.find((u) => u.id === tx.user_id),
            logs: [
                {
                    id: 1,
                    action: 'Dibuat',
                    created_at: tx.created_at,
                    user: db.users.find((u) => u.id === tx.user_id),
                },
            ],
            sppPayments: [],
        }));

        const totalIn = list.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
        const totalOut = list.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

        return {
            transactions: paginate(hydrated, Number(params.page || 1), Number(params.per_page || 10), '/payment-history'),
            summary: {
                total_in: totalIn,
                total_out: totalOut,
                balance: totalIn - totalOut,
            },
            filters: params,
            categories: this.getCategoriesHelper(db),
            allowedTypes: ['in', 'out'],
        };
    },

    getSiswaIndexProps(params: Record<string, string> = {}) {
        const db = loadDb();
        let list = [...db.students];

        const statusFilter = params.status || 'aktif';
        if (statusFilter !== 'all' && statusFilter !== '') {
            list = list.filter((s) => s.status === statusFilter);
        }

        const classFilter = params.class || 'all';
        if (classFilter !== 'all' && classFilter !== '') {
            if (classFilter === 'none') {
                list = list.filter((s) => !s.class);
            } else {
                list = list.filter((s) => s.class === classFilter);
            }
        }

        const genderFilter = params.gender || 'all';
        if (genderFilter !== 'all' && genderFilter !== '') {
            list = list.filter((s) => s.gender === genderFilter);
        }

        const typeFilter = params.student_type || 'all';
        if (typeFilter !== 'all' && typeFilter !== '') {
            list = list.filter((s) => s.student_type === typeFilter);
        }

        if (params.search) {
            const q = params.search.toLowerCase().trim();
            list = list.filter((s) => s.name.toLowerCase().includes(q) || s.nisn.includes(q));
        }

        const sortBy = params.sort_by || 'name';
        const sortDir = params.sort_dir || 'asc';
        list.sort((a, b) => {
            let valA: any = a[sortBy as keyof DemoStudent];
            let valB: any = b[sortBy as keyof DemoStudent];
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        // Class breakdown counts
        let countBase = [...db.students];
        if (statusFilter !== 'all' && statusFilter !== '') countBase = countBase.filter((s) => s.status === statusFilter);
        if (genderFilter !== 'all' && genderFilter !== '') countBase = countBase.filter((s) => s.gender === genderFilter);
        if (typeFilter !== 'all' && typeFilter !== '') countBase = countBase.filter((s) => s.student_type === typeFilter);

        const classBreakdown = {
            all: countBase.length,
            '1': countBase.filter((s) => s.class === '1').length,
            '2': countBase.filter((s) => s.class === '2').length,
            '3': countBase.filter((s) => s.class === '3').length,
            '4': countBase.filter((s) => s.class === '4').length,
            '5': countBase.filter((s) => s.class === '5').length,
            '6': countBase.filter((s) => s.class === '6').length,
            none: countBase.filter((s) => !s.class).length,
        };

        const stats = {
            total_aktif: db.students.filter((s) => s.status === 'aktif').length,
            santriwan_aktif: db.students.filter((s) => s.status === 'aktif' && s.gender === 'L').length,
            santriwati_aktif: db.students.filter((s) => s.status === 'aktif' && s.gender === 'P').length,
            total_non_aktif: db.students.filter((s) => s.status !== 'aktif').length,
        };

        return {
            students: paginate(list, Number(params.page || 1), Number(params.per_page || 15), '/siswa'),
            stats,
            classBreakdown,
            filters: {
                search: params.search || '',
                class: classFilter,
                status: statusFilter,
                gender: genderFilter,
                student_type: typeFilter,
                per_page: params.per_page || '15',
                sort_by: sortBy,
                sort_dir: sortDir,
            },
        };
    },

    getSiswaShowProps(id: number) {
        const db = loadDb();
        const student = db.students.find((s) => s.id === Number(id)) || db.students[0];
        return {
            student: calculateStudentVirtualLedger(student, db),
        };
    },

    getSiswaEditProps(id: number) {
        const db = loadDb();
        const student = db.students.find((s) => s.id === Number(id)) || db.students[0];
        return {
            student,
        };
    },

    getAlumniIndexProps() {
        const db = loadDb();
        const graduates = db.students.filter((s) => s.status === 'lulus' && s.exit_year);
        const yearMap: Record<number, number> = {};
        graduates.forEach((s) => {
            const yr = s.exit_year!;
            yearMap[yr] = (yearMap[yr] || 0) + 1;
        });

        const tahunLulus = Object.entries(yearMap)
            .map(([exit_year, total_alumni]) => ({ exit_year: Number(exit_year), total_alumni }))
            .sort((a, b) => b.exit_year - a.exit_year);

        const siswaPindah = db.students
            .filter((s) => ['pindah', 'berhenti', 'keluar'].includes(s.status))
            .sort((a, b) => (b.exit_year || 0) - (a.exit_year || 0));

        return {
            tahunLulus,
            siswaPindah,
        };
    },

    getAlumniDetailProps(year: number | string) {
        const db = loadDb();
        const alumni = db.students
            .filter((s) => s.status === 'lulus' && String(s.exit_year) === String(year))
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            tahun: Number(year),
            alumni,
        };
    },

    getSppPengaturanProps() {
        const db = loadDb();
        const ringkasanSPP = db.sppMonths
            .map((item) => {
                const total_siswa = db.students.filter((s) => {
                    const mScore = item.year * 12 + item.month;
                    const entryScore = s.entry_year * 12 + s.entry_month;
                    if (mScore < entryScore) return false;
                    if (s.exit_year && s.exit_month && mScore > s.exit_year * 12 + s.exit_month) return false;
                    return true;
                }).length;

                return {
                    month: item.month,
                    year: item.year,
                    current_amount: item.amount,
                    total_siswa,
                };
            })
            .sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month));

        return {
            ringkasanSPP,
        };
    },

    getCategoryIndexProps() {
        const db = loadDb();
        const inCats = db.categories.filter((c) => c.is_active && c.type === 'in');
        const outCats = db.categories.filter((c) => c.is_active && c.type === 'out');
        const bothCats = db.categories.filter((c) => c.is_active && c.type === 'both');

        return {
            categories: {
                in: inCats,
                out: outCats,
                both: bothCats,
            },
        };
    },

    getUserIndexProps() {
        const db = loadDb();
        return {
            users: db.users,
        };
    },

    getUserCreateProps() {
        const db = loadDb();
        return {
            roles: db.roles,
        };
    },

    getUserEditProps(id: number) {
        const db = loadDb();
        const user = db.users.find((u) => u.id === Number(id)) || db.users[0];
        return {
            user,
            roles: db.roles,
        };
    },

    getRoleIndexProps() {
        const db = loadDb();
        return {
            roles: db.roles,
        };
    },

    getRoleCreateProps() {
        const grouped: Record<string, typeof ALL_PERMISSIONS> = {};
        ALL_PERMISSIONS.forEach((p) => {
            if (!grouped[p.group]) grouped[p.group] = [];
            grouped[p.group].push(p);
        });
        return {
            permissions: grouped,
        };
    },

    getRoleEditProps(id: number) {
        const db = loadDb();
        const role = db.roles.find((r) => r.id === Number(id)) || db.roles[0];
        const grouped: Record<string, typeof ALL_PERMISSIONS> = {};
        ALL_PERMISSIONS.forEach((p) => {
            if (!grouped[p.group]) grouped[p.group] = [];
            grouped[p.group].push(p);
        });
        return {
            role,
            permissions: grouped,
        };
    },

    // Mutations
    addTransaction(data: any) {
        const db = loadDb();
        const id = (Math.max(0, ...db.transactions.map((t) => t.id)) || 0) + 1;
        const now = new Date();
        const dateStr = data.transaction_date || now.toISOString().split('T')[0];
        const datePrefix = dateStr.replace(/-/g, '');
        const trxId = data.transaction_id || `TRX-${datePrefix}-${String(id).padStart(4, '0')}`;

        const newTx: DemoTransaction = {
            id,
            transaction_id: trxId,
            student_id: data.student_id ? Number(data.student_id) : null,
            type: (data.type as 'in' | 'out') || 'in',
            category: data.category || 'SPP Bulanan',
            amount: Number(data.amount) || 0,
            note: data.note || '',
            transaction_date: dateStr,
            user_id: 1,
            created_at: now.toISOString().replace('T', ' ').substring(0, 19),
            updated_at: now.toISOString().replace('T', ' ').substring(0, 19),
        };

        db.transactions.unshift(newTx);

        // If SPP payment for a student, allocate to virtual ledger
        if (newTx.type === 'in' && newTx.student_id && newTx.category.includes('SPP')) {
            this.waterfallSppAllocation(db, newTx.student_id, newTx.amount, newTx.id);
        }

        saveDb(db);
        return newTx;
    },

    updateTransaction(id: number, data: any) {
        const db = loadDb();
        const idx = db.transactions.findIndex((t) => t.id === Number(id));
        if (idx !== -1) {
            db.transactions[idx] = {
                ...db.transactions[idx],
                ...data,
                amount: data.amount ? Number(data.amount) : db.transactions[idx].amount,
                student_id: data.student_id !== undefined ? (data.student_id ? Number(data.student_id) : null) : db.transactions[idx].student_id,
                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };
            saveDb(db);
        }
    },

    deleteTransaction(id: number) {
        const db = loadDb();
        db.transactions = db.transactions.filter((t) => t.id !== Number(id));
        // Remove linked SPP payments if any
        db.sppPayments = db.sppPayments.filter((p) => p.transaction_id !== Number(id));
        saveDb(db);
    },

    addStudent(data: any) {
        const db = loadDb();
        const id = (Math.max(0, ...db.students.map((s) => s.id)) || 0) + 1;
        const newStudent: DemoStudent = {
            id,
            nisn: data.nisn || String(Date.now()).slice(-10),
            name: data.name || 'Santri Baru',
            gender: data.gender === 'P' ? 'P' : 'L',
            class: data.class && data.class !== 'none' ? data.class : null,
            status: data.status || 'aktif',
            student_type: data.student_type || 'umum',
            entry_month: Number(data.entry_month) || 7,
            entry_year: Number(data.entry_year) || 2025,
            exit_month: data.exit_month && data.exit_month !== 'none' ? Number(data.exit_month) : null,
            exit_year: data.exit_year && data.exit_year !== 'none' ? Number(data.exit_year) : null,
        };
        db.students.push(newStudent);
        saveDb(db);
        return newStudent;
    },

    updateStudent(id: number, data: any) {
        const db = loadDb();
        const idx = db.students.findIndex((s) => s.id === Number(id));
        if (idx !== -1) {
            db.students[idx] = {
                ...db.students[idx],
                ...data,
                class: data.class !== undefined ? (data.class === 'none' || !data.class ? null : data.class) : db.students[idx].class,
                entry_month: data.entry_month ? Number(data.entry_month) : db.students[idx].entry_month,
                entry_year: data.entry_year ? Number(data.entry_year) : db.students[idx].entry_year,
                exit_month: data.exit_month ? (data.exit_month === 'none' ? null : Number(data.exit_month)) : (data.status === 'aktif' ? null : db.students[idx].exit_month),
                exit_year: data.exit_year ? (data.exit_year === 'none' ? null : Number(data.exit_year)) : (data.status === 'aktif' ? null : db.students[idx].exit_year),
            };
            saveDb(db);
        }
    },

    deleteStudent(id: number) {
        const db = loadDb();
        db.students = db.students.filter((s) => s.id !== Number(id));
        db.sppPayments = db.sppPayments.filter((p) => p.student_id !== Number(id));
        saveDb(db);
    },

    // Waterfall allocation for SPP payment
    waterfallSppAllocation(db: DayahDatabase, studentId: number, totalAmount: number, txId?: number | null) {
        const student = db.students.find((s) => s.id === studentId);
        if (!student) return;

        const ledger = calculateStudentVirtualLedger(student, db);
        const unpaidMonths = ledger.spp_payments.filter((p: any) => p.status !== 'paid');

        let remainingMoney = totalAmount;

        for (const item of unpaidMonths) {
            if (remainingMoney <= 0) break;

            const existingPayment = db.sppPayments.find((p) => p.student_id === studentId && p.spp_month_id === item.spp_month_id);
            const needed = item.amount - (existingPayment ? existingPayment.paid_amount : 0);

            if (needed <= 0) continue;

            const payForThisMonth = Math.min(remainingMoney, needed);
            const newPaidTotal = (existingPayment ? existingPayment.paid_amount : 0) + payForThisMonth;
            const newStatus = newPaidTotal >= item.amount ? 'paid' : 'partial';

            if (existingPayment) {
                existingPayment.paid_amount = newPaidTotal;
                existingPayment.status = newStatus;
                if (txId) existingPayment.transaction_id = txId;
            } else {
                const paymentId = (Math.max(0, ...db.sppPayments.map((p) => p.id)) || 0) + 1;
                db.sppPayments.push({
                    id: paymentId,
                    student_id: studentId,
                    spp_month_id: item.spp_month_id,
                    paid_amount: newPaidTotal,
                    status: newStatus,
                    transaction_id: txId || null,
                    created_at: new Date().toISOString(),
                });
            }

            remainingMoney -= payForThisMonth;
        }
    },

    paySpp(studentId: number, arg2: any, arg3?: any) {
        const db = loadDb();
        const student = db.students.find((s) => s.id === Number(studentId));
        if (!student) return;

        let numAmount = 0;
        let targetMonthId: number | undefined = undefined;

        const val2 = Number(arg2);
        const val3 = Number(arg3);

        if (!isNaN(val2) && !isNaN(val3)) {
            if (val2 > 500) {
                numAmount = val2;
                targetMonthId = val3;
            } else {
                targetMonthId = val2;
                numAmount = val3;
            }
        } else if (!isNaN(val2)) {
            numAmount = val2;
            if (arg3) targetMonthId = Number(arg3);
        } else if (!isNaN(val3)) {
            numAmount = val3;
            if (arg2) targetMonthId = Number(arg2);
        }

        if (numAmount <= 0) return;

        const txId = (Math.max(0, ...db.transactions.map((t) => t.id)) || 0) + 1;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        // Create transaction
        db.transactions.unshift({
            id: txId,
            transaction_id: `TRX-${dateStr.replace(/-/g, '')}-${String(txId).padStart(4, '0')}`,
            student_id: student.id,
            type: 'in',
            category: 'SPP',
            amount: numAmount,
            note: `Pembayaran SPP (${student.name})`,
            transaction_date: dateStr,
            user_id: 1,
            created_at: now.toISOString().replace('T', ' ').substring(0, 19),
            updated_at: now.toISOString().replace('T', ' ').substring(0, 19),
        });

        if (targetMonthId) {
            const m = db.sppMonths.find((item) => item.id === Number(targetMonthId));
            const existing = db.sppPayments.find((p) => p.student_id === student.id && p.spp_month_id === Number(targetMonthId));
            if (existing) {
                existing.paid_amount += numAmount;
                existing.status = existing.paid_amount >= (m ? m.amount : 0) ? 'paid' : 'partial';
                existing.transaction_id = txId;
            } else {
                const pid = (Math.max(0, ...db.sppPayments.map((p) => p.id)) || 0) + 1;
                db.sppPayments.push({
                    id: pid,
                    student_id: student.id,
                    spp_month_id: Number(targetMonthId),
                    paid_amount: numAmount,
                    status: m && numAmount >= m.amount ? 'paid' : 'partial',
                    transaction_id: txId,
                    created_at: now.toISOString(),
                });
            }
        } else {
            // Waterfall allocation to all unpaid months
            this.waterfallSppAllocation(db, student.id, numAmount, txId);
        }

        saveDb(db);
    },

    processKenaikan(gender: 'L' | 'P', data: { old_class: string; is_graduating?: boolean; new_class?: string }) {
        const db = loadDb();
        const currentYear = new Date().getFullYear();
        db.students.forEach((s) => {
            if (s.gender === gender && s.class === data.old_class && s.status === 'aktif') {
                if (data.is_graduating) {
                    s.status = 'lulus';
                    s.class = null;
                    s.exit_month = 6;
                    s.exit_year = currentYear;
                } else if (data.new_class) {
                    s.class = data.new_class;
                }
            }
        });
        saveDb(db);
    },

    addCategory(data: any) {
        const db = loadDb();
        const id = (Math.max(0, ...db.categories.map((c) => c.id)) || 0) + 1;
        db.categories.push({
            id,
            name: data.name || 'Kategori Baru',
            type: data.type || 'in',
            is_active: true,
        });
        saveDb(db);
    },

    updateCategory(id: number, data: any) {
        const db = loadDb();
        const idx = db.categories.findIndex((c) => c.id === Number(id));
        if (idx !== -1) {
            db.categories[idx] = { ...db.categories[idx], ...data };
            saveDb(db);
        }
    },

    deleteCategory(id: number) {
        const db = loadDb();
        const idx = db.categories.findIndex((c) => c.id === Number(id));
        if (idx !== -1) {
            db.categories[idx].is_active = false;
            saveDb(db);
        }
    },

    addUser(data: any) {
        const db = loadDb();
        const id = (Math.max(0, ...db.users.map((u) => u.id)) || 0) + 1;
        const assignedRoles = db.roles.filter((r) => data.roles?.includes(r.id) || data.roles?.includes(String(r.id)));
        db.users.push({
            id,
            name: data.name,
            email: data.email,
            email_verified_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            roles: assignedRoles.map((r) => ({ id: r.id, name: r.name, display_name: r.display_name })),
        });
        saveDb(db);
    },

    updateUser(id: number, data: any) {
        const db = loadDb();
        const idx = db.users.findIndex((u) => u.id === Number(id));
        if (idx !== -1) {
            const assignedRoles = data.roles ? db.roles.filter((r) => data.roles.includes(r.id) || data.roles.includes(String(r.id))) : db.users[idx].roles;
            db.users[idx] = {
                ...db.users[idx],
                name: data.name || db.users[idx].name,
                email: data.email || db.users[idx].email,
                roles: assignedRoles.map((r) => ({ id: r.id, name: r.name, display_name: r.display_name })),
            };
            saveDb(db);
        }
    },

    deleteUser(id: number) {
        const db = loadDb();
        db.users = db.users.filter((u) => u.id !== Number(id));
        saveDb(db);
    },

    addRole(data: any) {
        const db = loadDb();
        const id = (Math.max(0, ...db.roles.map((r) => r.id)) || 0) + 1;
        const selectedPermissions = ALL_PERMISSIONS.filter((p) => data.permissions?.includes(p.id) || data.permissions?.includes(String(p.id)));
        db.roles.push({
            id,
            name: data.name,
            display_name: data.display_name,
            description: data.description || '',
            is_default: !!data.is_default,
            permissions: selectedPermissions,
            users_count: 0,
        });
        saveDb(db);
    },

    updateRole(id: number, data: any) {
        const db = loadDb();
        const idx = db.roles.findIndex((r) => r.id === Number(id));
        if (idx !== -1) {
            const selectedPermissions = data.permissions
                ? ALL_PERMISSIONS.filter((p) => data.permissions.includes(p.id) || data.permissions.includes(String(p.id)))
                : db.roles[idx].permissions;
            db.roles[idx] = {
                ...db.roles[idx],
                name: data.name || db.roles[idx].name,
                display_name: data.display_name || db.roles[idx].display_name,
                description: data.description !== undefined ? data.description : db.roles[idx].description,
                permissions: selectedPermissions,
            };
            saveDb(db);
        }
    },

    deleteRole(id: number) {
        const db = loadDb();
        db.roles = db.roles.filter((r) => r.id !== Number(id));
        saveDb(db);
    },

    bulkUpdateSpp(month: number, year: number, amount: number) {
        const db = loadDb();
        const existing = db.sppMonths.find((m) => m.month === Number(month) && m.year === Number(year));
        if (existing) {
            existing.amount = Number(amount);
        } else {
            const id = (Math.max(0, ...db.sppMonths.map((m) => m.id)) || 0) + 1;
            db.sppMonths.push({ id, month: Number(month), year: Number(year), amount: Number(amount) });
        }
        saveDb(db);
    },

    generateTahunAjaran(startYear: number, baseAmount: number) {
        const db = loadDb();
        const months = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        months.forEach((m) => {
            const year = m >= 7 ? Number(startYear) : Number(startYear) + 1;
            const existing = db.sppMonths.find((item) => item.month === m && item.year === year);
            if (existing) {
                existing.amount = Number(baseAmount);
            } else {
                const id = (Math.max(0, ...db.sppMonths.map((x) => x.id)) || 0) + 1;
                db.sppMonths.push({ id, month: m, year, amount: Number(baseAmount) });
            }
        });
        saveDb(db);
    },

    // Excel Export Utilities for Live Demo
    exportSiswaToExcel() {
        const db = loadDb();
        const data = db.students.map((s, idx) => ({
            'No': idx + 1,
            'NISN': s.nisn,
            'Nama Lengkap': s.name,
            'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
            'Kelas': s.class ? `Kelas ${s.class}` : 'Belum Ada',
            'Kategori': s.student_type,
            'Status': s.status,
            'Tahun Masuk': `${getMonthName(s.entry_month)} ${s.entry_year}`,
            'Tahun Keluar': s.exit_year ? `${getMonthName(s.exit_month || 6)} ${s.exit_year}` : '-',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
        XLSX.writeFile(wb, 'Data_Siswa_Dayah_Minhajussalam.xlsx');
    },

    exportTransaksiToExcel() {
        const db = loadDb();
        const data = db.transactions.map((t, idx) => {
            const student = t.student_id ? db.students.find((s) => s.id === t.student_id) : null;
            return {
                'No': idx + 1,
                'ID Transaksi': t.transaction_id,
                'Tanggal': t.transaction_date,
                'Tipe': t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
                'Kategori': t.category,
                'Nominal (Rp)': t.amount,
                'Nama Siswa': student ? student.name : '-',
                'Keterangan': t.note || '-',
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Transaksi');
        XLSX.writeFile(wb, 'Laporan_Transaksi_Dayah.xlsx');
    },

    exportTunggakanToExcel(classFilter = 'all', statusFilter = 'all', monthId?: string | number) {
        const db = loadDb();
        let arrears = calculateArrears(db, monthId);

        if (classFilter !== 'all') {
            arrears = arrears.filter((s) => String(s.class) === String(classFilter));
        }
        if (statusFilter === 'aktif' || statusFilter === 'active') {
            arrears = arrears.filter((s) => s.status === 'aktif');
        } else if (statusFilter === 'nonaktif' || statusFilter === 'inactive') {
            arrears = arrears.filter((s) => s.status !== 'aktif');
        }

        const data = arrears.map((s, idx) => ({
            'No': idx + 1,
            'NISN': s.nisn,
            'Nama Santri': s.name,
            'Kelas': s.class,
            'Gender': s.gender === 'L' ? 'Putra' : 'Putri',
            'Status': s.status,
            'Jumlah Bulan Tunggakan': s.arrears_count,
            'Rincian Bulan': s.unpaid_months.map((m: any) => m.month_name).join(', '),
            'Total Tunggakan (Rp)': s.total_arrears,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tunggakan SPP');
        XLSX.writeFile(wb, 'Data_Tunggakan_SPP_Dayah.xlsx');
    },
};
