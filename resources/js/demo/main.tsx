import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/app.css';
import { route } from './mock-ziggy';
import { InertiaProvider, useInertia, router } from './mock-inertia';
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
const componentCache = new Map<string, React.ComponentType<any>>();

async function resolveComponent(componentName: string): Promise<React.ComponentType<any>> {
    if (componentCache.has(componentName)) {
        return componentCache.get(componentName)!;
    }

    if (componentName === 'payment/Print') {
        const PrintComponent = (props: any) => (
            <ReceiptPrintView paymentId={props.paymentId} onBack={() => router.visit('/payment')} />
        );
        componentCache.set(componentName, PrintComponent);
        return PrintComponent;
    }

    const pageKey = `../pages/${componentName}.tsx`;
    let loader = pages[pageKey];
    if (!loader) {
        console.warn(`Page component not found for key: ${pageKey}. Falling back to dashboard.`);
        loader = pages['../pages/dashboard.tsx'];
    }

    if (!loader) {
        throw new Error(`Component loader not found for: ${componentName}`);
    }

    const mod: any = await loader();
    const ResolvedComp = mod.default || mod;
    componentCache.set(componentName, ResolvedComp);
    return ResolvedComp;
}

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('UI Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 text-xl">
                            ⚠️
                        </div>
                        <h2 className="text-lg font-bold mb-2">Terjadi Kendala Tampilan</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Terjadi kendala saat memproses tampilan halaman. Silakan kembali ke dashboard atau muat ulang.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    router.visit('/dashboard');
                                }}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition"
                            >
                                Ke Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                Muat Ulang
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function PageRenderer() {
    const { Component, props, loading, url } = useInertia();

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
        <ErrorBoundary key={url}>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <DemoBanner />
                <div className="flex-1">
                    <Component {...props} />
                </div>
            </div>
        </ErrorBoundary>
    );
}

function App() {
    return (
        <InertiaProvider resolveComponent={resolveComponent}>
            <PageRenderer />
        </InertiaProvider>
    );
}

const rootEl = document.getElementById('app');
if (rootEl) {
    const root = createRoot(rootEl);
    root.render(<App />);
}
