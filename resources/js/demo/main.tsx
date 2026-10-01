import React, { useEffect, useState, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/app.css';
import { route } from './mock-ziggy';
import { InertiaProvider, usePage, router } from './mock-inertia';
import { DemoBanner } from './DemoBanner';
import { ReceiptPrintView } from './ReceiptPrintView';
import { initializeTheme } from '../hooks/use-appearance';

// Ensure global route function is available
(globalThis as any).route = route;
if (typeof window !== 'undefined') {
    (window as any).route = route;
}

// Initialize theme on start
initializeTheme();

// Page modules map
const pages = import.meta.glob('../pages/**/*.tsx');

function PageRenderer() {
    const page = usePage();
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
    const [loading, setLoading] = useState(true);

    // If print view
    if (page.component === 'payment/Print') {
        return <ReceiptPrintView paymentId={page.props.paymentId} onBack={() => router.visit('/payment')} />;
    }

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const pageKey = `../pages/${page.component}.tsx`;
        const loader = pages[pageKey];

        if (loader) {
            loader()
                .then((mod: any) => {
                    if (isMounted) {
                        setComponent(() => mod.default || mod);
                        setLoading(false);
                    }
                })
                .catch((err) => {
                    console.error('Error loading page component:', pageKey, err);
                    if (isMounted) {
                        setLoading(false);
                    }
                });
        } else {
            console.warn(`Page component not found for key: ${pageKey}. Falling back to dashboard.`);
            const fallbackLoader = pages['../pages/dashboard.tsx'];
            if (fallbackLoader) {
                fallbackLoader().then((mod: any) => {
                    if (isMounted) {
                        setComponent(() => mod.default || mod);
                        setLoading(false);
                    }
                });
            }
        }

        return () => {
            isMounted = false;
        };
    }, [page.component]);

    if (loading || !Component) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Memuat halaman demo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <DemoBanner />
            <div className="flex-1">
                <Component {...page.props} />
            </div>
        </div>
    );
}

function App() {
    return (
        <InertiaProvider>
            <PageRenderer />
        </InertiaProvider>
    );
}

const rootEl = document.getElementById('app');
if (rootEl) {
    const root = createRoot(rootEl);
    root.render(<App />);
}
