// Mock Ziggy implementation for standalone client-side demo

const ROUTE_MAP: Record<string, string> = {
    'home': '/',
    'dashboard': '/dashboard',
    'admin.dashboard': '/dashboard',
    'admin.users.index': '/users',
    
    // Santriwan
    'santriwan.kelas': '/santriwan',
    'santriwan.kenaikan': '/santriwan/kenaikan',
    'santriwan.kenaikan.proses': '/santriwan/kenaikan',
    'santriwan.detail': '/santriwan/class/{kelas}',
    'santriwan.show': '/santriwan/santri/{id}',

    // Santriwati
    'santriwati.kelas': '/santriwati',
    'santriwati.kenaikan': '/santriwati/kenaikan',
    'santriwati.kenaikan.proses': '/santriwati/kenaikan',
    'santriwati.detail': '/santriwati/class/{kelas}',
    'santriwati.show': '/santriwati/santri/{id}',

    // Tuition Arrears
    'tuition-arrears.index': '/tuition-arrears',
    'tuition-arrears.export-all': '/tuition-arrears/export-all',
    'tuition-arrears.export-month': '/tuition-arrears/export-month',
    'tuition-arrears.export-class': '/tuition-arrears/export-class',

    // SPP
    'spp.pengaturan': '/tuition-per-month',
    'spp.bulk_update': '/spp/bulk-update',
    'spp.generate_tahun': '/spp/generate-tahun',

    // Alumni
    'alumni.index': '/alumni',
    'alumni.detail': '/alumni/tahun/{year}',

    // Siswa
    'siswa.index': '/siswa',
    'siswa.create': '/siswa/create',
    'siswa.store': '/siswa',
    'siswa.import.create': '/siswa/import',
    'siswa.import.store': '/siswa/import',
    'siswa.import.template': '/template_import_siswa.xlsx',
    'siswa.export': '/siswa/export',
    'siswa.show': '/siswa/{id}',
    'siswa.edit': '/siswa/{id}/edit',
    'siswa.update': '/siswa/{id}',
    'siswa.destroy': '/siswa/{id}',
    'siswa.pay': '/siswa/{id}/pay',

    // Payment
    'payment.index': '/payment',
    'payment.create': '/payment/create',
    'payment.store': '/payment',
    'payment.edit': '/payment/{payment}/edit',
    'payment.update': '/payment/{payment}',
    'payment.destroy': '/payment/{payment}',
    'payment.print': '/payment/{payment}/print',

    // Transaction import/export
    'transaction.import.create': '/transaction/import',
    'transaction.import.store': '/transaction/import',
    'transaction.import.template': '/template_import_transaksi.xlsx',
    'transaction.export': '/transaction/export',

    // History
    'history': '/payment-history',

    // Category
    'category.index': '/category',
    'category.store': '/category',
    'category.update': '/category/{category}',
    'category.destroy': '/category/{category}',

    // Role
    'role.index': '/role',
    'role.create': '/role/create',
    'role.store': '/role',
    'role.show': '/role/{role}',
    'role.edit': '/role/{role}/edit',
    'role.update': '/role/{role}',
    'role.destroy': '/role/{role}',

    // Users
    'users.index': '/users',
    'users.create': '/users/create',
    'users.store': '/users',
    'users.show': '/users/{user}',
    'users.edit': '/users/{user}/edit',
    'users.update': '/users/{user}',
    'users.destroy': '/users/{user}',

    // Settings
    'profile.edit': '/settings/profile',
    'profile.update': '/settings/profile',
    'profile.destroy': '/settings/profile',
    'appearance': '/settings/appearance',
    'password.edit': '/settings/password',
    'password.update': '/settings/password',

    // Auth
    'login': '/login',
    'logout': '/login',
    'register': '/register',
    'password.request': '/forgot-password',
    'password.email': '/forgot-password',
    'password.reset': '/reset-password',
    'password.store': '/reset-password',
    'verification.notice': '/verify-email',
    'verification.verify': '/verify-email',
    'verification.send': '/verify-email',
    'password.confirm': '/confirm-password',
};

export function route(name?: string, params?: any): any {
    if (!name) {
        return {
            current: (checkName?: string) => {
                const currentPath = window.location.pathname;
                if (!checkName) return true;
                const pattern = ROUTE_MAP[checkName];
                if (!pattern) return false;
                return currentPath.startsWith(pattern.split('{')[0]);
            },
        };
    }

    let url = ROUTE_MAP[name];
    if (!url) {
        url = `/${name.replace(/\./g, '/')}`;
    }

    if (params !== undefined && params !== null) {
        if (typeof params === 'object' && !Array.isArray(params)) {
            // Replace keys like {kelas}, {id}, {payment}, {year}, {category}, {user}, {role}
            let remainingParams: Record<string, any> = { ...params };
            Object.keys(params).forEach((key) => {
                const placeholder = `{${key}}`;
                if (url.includes(placeholder)) {
                    url = url.replace(placeholder, encodeURIComponent(params[key]));
                    delete remainingParams[key];
                }
            });

            // Also check generic placeholders {id}, {payment}, etc. with single-key param
            const placeholders = url.match(/{[a-zA-Z0-9_]+}/g);
            if (placeholders && placeholders.length === 1 && Object.keys(remainingParams).length === 1) {
                const firstKey = Object.keys(remainingParams)[0];
                url = url.replace(placeholders[0], encodeURIComponent(remainingParams[firstKey]));
                delete remainingParams[firstKey];
            }

            // Append query string if any remaining
            const queryKeys = Object.keys(remainingParams);
            if (queryKeys.length > 0) {
                const qs = new URLSearchParams();
                queryKeys.forEach((k) => {
                    if (remainingParams[k] !== undefined && remainingParams[k] !== null && remainingParams[k] !== '') {
                        qs.append(k, String(remainingParams[k]));
                    }
                });
                const queryString = qs.toString();
                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            }
        } else {
            // Single primitive parameter: replace first {placeholder}
            url = url.replace(/{[a-zA-Z0-9_]+}/, encodeURIComponent(String(params)));
        }
    }

    return url;
}

// In case code imports { route } directly from 'ziggy-js'
(globalThis as any).route = route;
if (typeof window !== 'undefined') {
    (window as any).route = route;
}

export default route;
