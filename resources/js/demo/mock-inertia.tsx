import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { DemoStore, loadDb, subscribeDb } from './demo-store';
import { ALL_PERMISSIONS } from './mock-data';

interface RouterOptions {
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: any;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    onSuccess?: (page?: any) => void;
    onError?: (errors?: any) => void;
    onFinish?: () => void;
}

interface InertiaContextType {
    url: string;
    component: string;
    props: any;
    navigate: (url: string, options?: RouterOptions) => void;
}

const InertiaContext = createContext<InertiaContextType | null>(null);

let globalNavigate: ((url: string, options?: RouterOptions) => void) | null = null;

// Route matching and prop resolution
export function resolvePageForUrl(fullUrl: string) {
    const urlObj = new URL(fullUrl, 'http://localhost');
    const pathname = urlObj.pathname;
    const searchParams = Object.fromEntries(urlObj.searchParams.entries());

    const db = loadDb();
    const currentUser = db.users[0] || {
        id: 1,
        name: 'Admin Dayah',
        email: 'admin@dayah.test',
        roles: [{ id: 1, name: 'admin', display_name: 'Administrator' }],
    };

    const sharedProps = {
        auth: {
            user: currentUser,
            permissions: ALL_PERMISSIONS.map((p) => p.name),
        },
        flash: {
            success: null,
            error: null,
        },
        errors: {},
        name: 'Sistem Keuangan Dayah',
        quote: { message: 'Menuntut ilmu adalah kewajiban setiap muslim.', author: 'Hadits' },
    };

    // 1. Dashboard
    if (pathname === '/' || pathname === '/dashboard' || pathname === '/admin/dashboard') {
        return {
            component: 'dashboard',
            props: {
                ...sharedProps,
                ...DemoStore.getDashboardProps(searchParams),
            },
        };
    }

    // 2. Payments / Transaksi
    if (pathname === '/payment' || pathname === '/payment/') {
        return {
            component: 'payment/Index',
            props: {
                ...sharedProps,
                ...DemoStore.getPaymentIndexProps(searchParams),
            },
        };
    }

    if (pathname === '/payment/create') {
        return {
            component: 'payment/Create',
            props: {
                ...sharedProps,
                ...DemoStore.getPaymentCreateProps(),
            },
        };
    }

    const paymentEditMatch = pathname.match(/^\/payment\/(\d+)\/edit$/);
    if (paymentEditMatch) {
        return {
            component: 'payment/Edit',
            props: {
                ...sharedProps,
                ...DemoStore.getPaymentEditProps(Number(paymentEditMatch[1])),
            },
        };
    }

    const paymentPrintMatch = pathname.match(/^\/payment\/(\d+)\/print$/);
    if (paymentPrintMatch) {
        return {
            component: 'payment/Print',
            props: {
                ...sharedProps,
                paymentId: Number(paymentPrintMatch[1]),
            },
        };
    }

    // 3. Santriwan (Putra)
    if (pathname === '/santriwan') {
        return {
            component: 'santriwan/data-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriKelasProps('L'),
            },
        };
    }

    const santriwanDetailMatch = pathname.match(/^\/santriwan\/class\/([^/]+)$/);
    if (santriwanDetailMatch) {
        return {
            component: 'santriwan/detail-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriDetailKelasProps('L', decodeURIComponent(santriwanDetailMatch[1])),
            },
        };
    }

    const santriwanShowMatch = pathname.match(/^\/santriwan\/santri\/(\d+)$/);
    if (santriwanShowMatch) {
        return {
            component: 'santriwan/profil-siswa',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriProfilProps(Number(santriwanShowMatch[1]), 'L'),
            },
        };
    }

    if (pathname === '/santriwan/kenaikan') {
        return {
            component: 'santriwan/kenaikan-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriKenaikanProps('L'),
            },
        };
    }

    // 4. Santriwati (Putri)
    if (pathname === '/santriwati') {
        return {
            component: 'santriwati/data-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriKelasProps('P'),
            },
        };
    }

    const santriwatiDetailMatch = pathname.match(/^\/santriwati\/class\/([^/]+)$/);
    if (santriwatiDetailMatch) {
        return {
            component: 'santriwati/detail-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriDetailKelasProps('P', decodeURIComponent(santriwatiDetailMatch[1])),
            },
        };
    }

    const santriwatiShowMatch = pathname.match(/^\/santriwati\/santri\/(\d+)$/);
    if (santriwatiShowMatch) {
        return {
            component: 'santriwati/profil-siswa',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriProfilProps(Number(santriwatiShowMatch[1]), 'P'),
            },
        };
    }

    if (pathname === '/santriwati/kenaikan') {
        return {
            component: 'santriwati/kenaikan-kelas',
            props: {
                ...sharedProps,
                ...DemoStore.getSantriKenaikanProps('P'),
            },
        };
    }

    // 5. Tunggakan SPP
    if (pathname === '/tuition-arrears') {
        return {
            component: 'tuition-arrears/index',
            props: {
                ...sharedProps,
                ...DemoStore.getTuitionArrearsProps(searchParams),
            },
        };
    }

    // 6. Riwayat Transaksi
    if (pathname === '/payment-history') {
        return {
            component: 'history/history',
            props: {
                ...sharedProps,
                ...DemoStore.getHistoryProps(searchParams),
            },
        };
    }

    // 7. Siswa CRUD
    if (pathname === '/siswa') {
        return {
            component: 'siswa/index',
            props: {
                ...sharedProps,
                ...DemoStore.getSiswaIndexProps(searchParams),
            },
        };
    }

    if (pathname === '/siswa/create') {
        return {
            component: 'siswa/create',
            props: {
                ...sharedProps,
            },
        };
    }

    if (pathname === '/siswa/import') {
        return {
            component: 'siswa/import',
            props: {
                ...sharedProps,
            },
        };
    }

    const siswaEditMatch = pathname.match(/^\/siswa\/(\d+)\/edit$/);
    if (siswaEditMatch) {
        return {
            component: 'siswa/edit',
            props: {
                ...sharedProps,
                ...DemoStore.getSiswaEditProps(Number(siswaEditMatch[1])),
            },
        };
    }

    const siswaShowMatch = pathname.match(/^\/siswa\/(\d+)$/);
    if (siswaShowMatch) {
        return {
            component: 'siswa/show',
            props: {
                ...sharedProps,
                ...DemoStore.getSiswaShowProps(Number(siswaShowMatch[1])),
            },
        };
    }

    // 8. Alumni
    if (pathname === '/alumni') {
        return {
            component: 'alumni/index',
            props: {
                ...sharedProps,
                ...DemoStore.getAlumniIndexProps(),
            },
        };
    }

    const alumniDetailMatch = pathname.match(/^\/alumni\/tahun\/([^/]+)$/);
    if (alumniDetailMatch) {
        return {
            component: 'alumni/detail-tahun',
            props: {
                ...sharedProps,
                ...DemoStore.getAlumniDetailProps(alumniDetailMatch[1]),
            },
        };
    }

    // 9. SPP Pengaturan
    if (pathname === '/tuition-per-month') {
        return {
            component: 'spp/pengaturan',
            props: {
                ...sharedProps,
                ...DemoStore.getSppPengaturanProps(),
            },
        };
    }

    // 10. Kategori
    if (pathname === '/category') {
        return {
            component: 'category/index',
            props: {
                ...sharedProps,
                ...DemoStore.getCategoryIndexProps(),
            },
        };
    }

    // 11. Pengguna
    if (pathname === '/users' || pathname === '/admin/users') {
        return {
            component: 'user/index',
            props: {
                ...sharedProps,
                ...DemoStore.getUserIndexProps(),
            },
        };
    }

    if (pathname === '/users/create') {
        return {
            component: 'user/create',
            props: {
                ...sharedProps,
                ...DemoStore.getUserCreateProps(),
            },
        };
    }

    const userEditMatch = pathname.match(/^\/users\/(\d+)\/edit$/);
    if (userEditMatch) {
        return {
            component: 'user/edit',
            props: {
                ...sharedProps,
                ...DemoStore.getUserEditProps(Number(userEditMatch[1])),
            },
        };
    }

    // 12. Role
    if (pathname === '/role') {
        return {
            component: 'role/index',
            props: {
                ...sharedProps,
                ...DemoStore.getRoleIndexProps(),
            },
        };
    }

    if (pathname === '/role/create') {
        return {
            component: 'role/create',
            props: {
                ...sharedProps,
                ...DemoStore.getRoleCreateProps(),
            },
        };
    }

    const roleEditMatch = pathname.match(/^\/role\/(\d+)\/edit$/);
    if (roleEditMatch) {
        return {
            component: 'role/edit',
            props: {
                ...sharedProps,
                ...DemoStore.getRoleEditProps(Number(roleEditMatch[1])),
            },
        };
    }

    // 13. Settings
    if (pathname === '/settings/profile') {
        return {
            component: 'settings/profile',
            props: {
                ...sharedProps,
                mustVerifyEmail: false,
                status: null,
            },
        };
    }

    if (pathname === '/settings/appearance') {
        return {
            component: 'settings/appearance',
            props: {
                ...sharedProps,
            },
        };
    }

    if (pathname === '/settings/password') {
        return {
            component: 'settings/password',
            props: {
                ...sharedProps,
            },
        };
    }

    // 14. Transaction Import
    if (pathname === '/transaction/import') {
        return {
            component: 'transaction/import',
            props: {
                ...sharedProps,
            },
        };
    }

    // 15. Auth Login
    if (pathname === '/login') {
        return {
            component: 'auth/login',
            props: {
                ...sharedProps,
                canResetPassword: true,
                status: null,
            },
        };
    }

    // Fallback: Dashboard
    return {
        component: 'dashboard',
        props: {
            ...sharedProps,
            ...DemoStore.getDashboardProps(),
        },
    };
}

// Perform simulated mutations
function handleMutation(url: string, method: string, data: any): string | null {
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;

    // Payment store
    if (pathname === '/payment' && method === 'post') {
        DemoStore.addTransaction(data);
        return '/payment';
    }
    const paymentUpdateMatch = pathname.match(/^\/payment\/(\d+)$/);
    if (paymentUpdateMatch && (method === 'put' || method === 'patch')) {
        DemoStore.updateTransaction(Number(paymentUpdateMatch[1]), data);
        return '/payment';
    }
    const paymentDeleteMatch = pathname.match(/^\/payment\/(\d+)$/);
    if (paymentDeleteMatch && method === 'delete') {
        DemoStore.deleteTransaction(Number(paymentDeleteMatch[1]));
        return '/payment';
    }

    // Transaction Import
    if (pathname === '/transaction/import' && method === 'post') {
        return '/payment';
    }

    // Siswa store
    if (pathname === '/siswa' && method === 'post') {
        DemoStore.addStudent(data);
        return '/siswa';
    }
    const siswaPayMatch = pathname.match(/^\/siswa\/(\d+)\/pay$/);
    if (siswaPayMatch && method === 'post') {
        DemoStore.paySpp(Number(siswaPayMatch[1]), Number(data.amount), data.spp_month_id);
        return null;
    }
    const siswaUpdateMatch = pathname.match(/^\/siswa\/(\d+)$/);
    if (siswaUpdateMatch && (method === 'put' || method === 'patch')) {
        DemoStore.updateStudent(Number(siswaUpdateMatch[1]), data);
        return '/siswa';
    }
    const siswaDeleteMatch = pathname.match(/^\/siswa\/(\d+)$/);
    if (siswaDeleteMatch && method === 'delete') {
        DemoStore.deleteStudent(Number(siswaDeleteMatch[1]));
        return '/siswa';
    }

    // Siswa Import
    if (pathname === '/siswa/import' && method === 'post') {
        return '/siswa';
    }

    // Santriwan / Santriwati kenaikan
    if (pathname === '/santriwan/kenaikan' && method === 'post') {
        DemoStore.processKenaikan('L', data);
        return '/santriwan';
    }
    if (pathname === '/santriwati/kenaikan' && method === 'post') {
        DemoStore.processKenaikan('P', data);
        return '/santriwati';
    }

    // SPP bulk / generate
    if (pathname === '/spp/bulk-update' && method === 'post') {
        const amt = data.new_amount !== undefined ? data.new_amount : data.amount;
        DemoStore.bulkUpdateSpp(data.month, data.year, amt);
        return null;
    }
    if (pathname === '/spp/generate-tahun' && method === 'post') {
        DemoStore.generateTahunAjaran(data.start_year, data.base_amount);
        return null;
    }

    // Category store
    if (pathname === '/category' && method === 'post') {
        DemoStore.addCategory(data);
        return null;
    }
    const categoryUpdateMatch = pathname.match(/^\/category\/(\d+)$/);
    if (categoryUpdateMatch && (method === 'put' || method === 'patch')) {
        DemoStore.updateCategory(Number(categoryUpdateMatch[1]), data);
        return null;
    }
    const categoryDeleteMatch = pathname.match(/^\/category\/(\d+)$/);
    if (categoryDeleteMatch && method === 'delete') {
        DemoStore.deleteCategory(Number(categoryDeleteMatch[1]));
        return null;
    }

    // User store
    if (pathname === '/users' && method === 'post') {
        DemoStore.addUser(data);
        return '/users';
    }
    const userUpdateMatch = pathname.match(/^\/users\/(\d+)$/);
    if (userUpdateMatch && (method === 'put' || method === 'patch')) {
        DemoStore.updateUser(Number(userUpdateMatch[1]), data);
        return '/users';
    }
    const userDeleteMatch = pathname.match(/^\/users\/(\d+)$/);
    if (userDeleteMatch && method === 'delete') {
        DemoStore.deleteUser(Number(userDeleteMatch[1]));
        return '/users';
    }

    // Role store
    if (pathname === '/role' && method === 'post') {
        DemoStore.addRole(data);
        return '/role';
    }
    const roleUpdateMatch = pathname.match(/^\/role\/(\d+)$/);
    if (roleUpdateMatch && (method === 'put' || method === 'patch')) {
        DemoStore.updateRole(Number(roleUpdateMatch[1]), data);
        return '/role';
    }
    const roleDeleteMatch = pathname.match(/^\/role\/(\d+)$/);
    if (roleDeleteMatch && method === 'delete') {
        DemoStore.deleteRole(Number(roleDeleteMatch[1]));
        return '/role';
    }

    return null;
}

export function InertiaProvider({ children }: { children: ReactNode }) {
    const [currentLocation, setCurrentLocation] = useState(() => window.location.pathname + window.location.search);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentLocation(window.location.pathname + window.location.search);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        return subscribeDb(() => setTick((t) => t + 1));
    }, []);

    // Intercept native <a> clicks for client-side routing & Excel exports
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest('a');
            if (!target) return;
            const href = target.getAttribute('href');
            if (!href) return;

            // Handle Excel export triggers
            if (href.startsWith('/siswa/export')) {
                e.preventDefault();
                DemoStore.exportSiswaToExcel();
                return;
            }
            if (href.startsWith('/transaction/export')) {
                e.preventDefault();
                DemoStore.exportTransaksiToExcel();
                return;
            }

            // If it's a relative internal link without download and without target="_blank"
            if (href.startsWith('/') && !target.hasAttribute('download') && target.getAttribute('target') !== '_blank') {
                if (!href.match(/\.(xlsx|pdf|png|jpg|jpeg|svg|ico)$/i)) {
                    e.preventDefault();
                    router.visit(href);
                }
            }
        };

        // Intercept window.open for tuition-arrears export
        const originalOpen = window.open;
        window.open = function (url?: string | URL, target?: string, features?: string) {
            if (typeof url === 'string') {
                if (url.startsWith('/tuition-arrears/export')) {
                    const parsed = new URL(url, window.location.origin);
                    const classParam = parsed.searchParams.get('class') || 'all';
                    const statusParam = parsed.searchParams.get('status') || 'all';
                    const monthIdParam = parsed.searchParams.get('spp_month_id') || undefined;
                    DemoStore.exportTunggakanToExcel(classParam, statusParam, monthIdParam);
                    return null;
                }
                if (url.startsWith('/siswa/export')) {
                    DemoStore.exportSiswaToExcel();
                    return null;
                }
                if (url.startsWith('/transaction/export')) {
                    DemoStore.exportTransaksiToExcel();
                    return null;
                }
            }
            return originalOpen.call(window, url, target, features);
        };

        document.addEventListener('click', handleAnchorClick);
        return () => {
            document.removeEventListener('click', handleAnchorClick);
            window.open = originalOpen;
        };
    }, []);

    const pageData = useMemo(() => {
        return resolvePageForUrl(currentLocation);
    }, [currentLocation, tick]);

    const navigate = (url: string, options: RouterOptions = {}) => {
        const method = options.method || 'get';

        if (method !== 'get') {
            const redirectUrl = handleMutation(url, method, options.data);
            const targetUrl = redirectUrl || currentLocation;

            if (redirectUrl && redirectUrl !== currentLocation) {
                if (options.replace) {
                    window.history.replaceState({}, '', targetUrl);
                } else {
                    window.history.pushState({}, '', targetUrl);
                }
                setCurrentLocation(targetUrl);
                if (!options.preserveScroll) {
                    window.scrollTo(0, 0);
                }
            } else {
                setTick((t) => t + 1);
            }

            setTimeout(() => {
                const freshProps = resolvePageForUrl(targetUrl).props;
                options.onSuccess?.({ props: freshProps });
                options.onFinish?.();
            }, 60);
            return;
        }

        if (url !== currentLocation) {
            if (options.replace) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
            }
            setCurrentLocation(url);
            if (!options.preserveScroll) {
                window.scrollTo(0, 0);
            }
        } else {
            setTick((t) => t + 1);
        }

        setTimeout(() => {
            const freshProps = resolvePageForUrl(url).props;
            options.onSuccess?.({ props: freshProps });
            options.onFinish?.();
        }, 50);
    };

    globalNavigate = navigate;

    const contextValue = {
        url: currentLocation,
        component: pageData.component,
        props: pageData.props,
        navigate,
    };

    return <InertiaContext.Provider value={contextValue}>{children}</InertiaContext.Provider>;
}

// usePage Hook
export function usePage<T = any>(): { props: T; url: string; component: string; version?: string } {
    const ctx = useContext(InertiaContext);
    if (!ctx) {
        // Fallback for initial render before provider attaches
        const fallback = resolvePageForUrl(window.location.pathname + window.location.search);
        return {
            props: fallback.props as T,
            url: window.location.pathname + window.location.search,
            component: fallback.component,
        };
    }
    return {
        props: ctx.props as T,
        url: ctx.url,
        component: ctx.component,
    };
}

// Global router object
export const router = {
    visit: (url: string, options?: RouterOptions) => {
        if (globalNavigate) {
            globalNavigate(url, options);
        } else {
            window.location.href = url;
        }
    },
    get: (url: string, data?: any, options?: RouterOptions) => {
        let finalUrl = url;
        if (data && typeof data === 'object') {
            const qs = new URLSearchParams(data).toString();
            if (qs) finalUrl += (url.includes('?') ? '&' : '?') + qs;
        }
        router.visit(finalUrl, { ...options, method: 'get' });
    },
    post: (url: string, data?: any, options?: RouterOptions) => {
        router.visit(url, { ...options, method: 'post', data });
    },
    put: (url: string, data?: any, options?: RouterOptions) => {
        router.visit(url, { ...options, method: 'put', data });
    },
    patch: (url: string, data?: any, options?: RouterOptions) => {
        router.visit(url, { ...options, method: 'patch', data });
    },
    delete: (url: string, options?: RouterOptions) => {
        router.visit(url, { ...options, method: 'delete' });
    },
    reload: (options?: RouterOptions) => {
        if (globalNavigate) {
            globalNavigate(window.location.pathname + window.location.search, options);
        }
    },
    replace: (url: string, options?: RouterOptions) => {
        router.visit(url, { ...options, replace: true });
    },
    on: () => () => {},
};

// Link Component
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: any;
    as?: string;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    prefetch?: boolean;
    onClick?: React.MouseEventHandler<any>;
}

export const Link = React.forwardRef<any, LinkProps>(
    ({ href, method = 'get', data, as = 'a', preserveScroll, preserveState, replace, prefetch, onClick, children, ...rest }, ref) => {
        const handleClick = (e: React.MouseEvent) => {
            if (onClick) onClick(e);
            if (e.defaultPrevented) return;

            // Handle external links or anchor links
            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
                return;
            }

            e.preventDefault();
            router.visit(href, {
                method,
                data,
                preserveScroll,
                preserveState,
                replace,
            });
        };

        if (as === 'button') {
            return (
                <button type="button" ref={ref} onClick={handleClick} {...(rest as any)}>
                    {children}
                </button>
            );
        }

        return (
            <a href={href} ref={ref} onClick={handleClick} {...rest}>
                {children}
            </a>
        );
    }
);

Link.displayName = 'InertiaLink';

// useForm Hook
export function useForm<TForm extends Record<string, any>>(initialValues: TForm | (() => TForm) = {} as TForm) {
    const initial = typeof initialValues === 'function' ? initialValues() : initialValues;
    const [data, setDataState] = useState<TForm>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [wasSuccessful, setWasSuccessful] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const setData = (keyOrFn: any, maybeValue?: any) => {
        if (typeof keyOrFn === 'string') {
            setDataState((prev) => ({ ...prev, [keyOrFn]: maybeValue }));
        } else if (typeof keyOrFn === 'function') {
            setDataState((prev) => keyOrFn(prev));
        } else {
            setDataState(keyOrFn);
        }
    };

    const reset = (...fields: string[]) => {
        if (fields.length === 0) {
            setDataState(initial);
        } else {
            setDataState((prev) => {
                const next = { ...prev };
                fields.forEach((f) => {
                    (next as any)[f] = (initial as any)[f];
                });
                return next;
            });
        }
    };

    const clearErrors = (...fields: string[]) => {
        if (fields.length === 0) {
            setErrors({});
        } else {
            setErrors((prev) => {
                const next = { ...prev };
                fields.forEach((f) => delete next[f]);
                return next;
            });
        }
    };

    const setError = (keyOrErrors: any, maybeValue?: any) => {
        if (typeof keyOrErrors === 'string') {
            setErrors((prev) => ({ ...prev, [keyOrErrors]: maybeValue }));
        } else {
            setErrors(keyOrErrors);
        }
    };

    const submit = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options: RouterOptions = {}) => {
        setProcessing(true);
        router.visit(url, {
            ...options,
            method,
            data,
            onSuccess: (page) => {
                setProcessing(false);
                setWasSuccessful(true);
                setRecentlySuccessful(true);
                setTimeout(() => setRecentlySuccessful(false), 2000);
                options.onSuccess?.(page);
            },
            onError: (errs) => {
                setProcessing(false);
                setErrors(errs || {});
                options.onError?.(errs);
            },
            onFinish: () => {
                setProcessing(false);
                options.onFinish?.();
            },
        });
    };

    return {
        data,
        setData,
        errors,
        hasErrors: Object.keys(errors).length > 0,
        processing,
        progress: null,
        wasSuccessful,
        recentlySuccessful,
        transform: (cb: any) => cb(data),
        reset,
        clearErrors,
        setError,
        submit,
        get: (url: string, options?: RouterOptions) => submit('get', url, options),
        post: (url: string, options?: RouterOptions) => submit('post', url, options),
        put: (url: string, options?: RouterOptions) => submit('put', url, options),
        patch: (url: string, options?: RouterOptions) => submit('patch', url, options),
        delete: (url: string, options?: RouterOptions) => submit('delete', url, options),
    };
}

// Head Component
export function Head({ title, children }: { title?: string; children?: ReactNode }) {
    useEffect(() => {
        if (title) {
            document.title = `${title} - Sistem Keuangan Dayah`;
        }
    }, [title]);

    return null;
}

// createInertiaApp stub
export function createInertiaApp(config: any) {
    return config;
}

export default {
    usePage,
    router,
    Link,
    useForm,
    Head,
    createInertiaApp,
    InertiaProvider,
};
