import React, { useState, useEffect } from 'react';
import { resetDb } from './demo-store';
import { RotateCcw, Sparkles, Check, ChevronUp, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoBanner() {
    const [collapsed, setCollapsed] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--demo-banner-height', collapsed ? '0px' : '40px');
        }
        return () => {
            if (typeof document !== 'undefined') {
                document.documentElement.style.setProperty('--demo-banner-height', '0px');
            }
        };
    }, [collapsed]);

    const handleReset = () => {
        if (confirm('Kembalikan seluruh data demo (santri, transaksi, tunggakan) ke pengaturan awal?')) {
            setResetting(true);
            setTimeout(() => {
                resetDb();
                setResetting(false);
                setResetSuccess(true);
                setTimeout(() => setResetSuccess(false), 3000);
                window.location.reload();
            }, 300);
        }
    };

    if (collapsed) {
        return (
            <div className="fixed bottom-3 right-3 z-50">
                <button
                    onClick={() => setCollapsed(false)}
                    className="flex items-center gap-1.5 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition"
                    title="Buka Info Demo"
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Demo Netlify</span>
                    <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="h-10 shrink-0 bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white px-3 sm:px-4 text-xs border-b border-white/10 shadow-sm sticky top-0 z-40 overflow-hidden flex items-center">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Netlify Live Demo
                    </span>
                    <span className="hidden lg:inline text-slate-300 truncate text-[11px]">
                        Aplikasi interaktif di browser. Semua fitur (transaksi, tunggakan, santri) dapat diuji coba.
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="hidden xl:flex items-center gap-1.5 text-slate-400 text-[11px] mr-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Login: <strong className="text-white">Admin Dayah</strong></span>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReset}
                        disabled={resetting}
                        className="h-7 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 transition px-2 sm:px-3"
                    >
                        {resetSuccess ? (
                            <>
                                <Check className="w-3 h-3 text-emerald-400 sm:mr-1" />
                                <span className="hidden sm:inline">Data Direset!</span>
                            </>
                        ) : (
                            <>
                                <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''} sm:mr-1`} />
                                <span className="hidden sm:inline">Reset Data Demo</span>
                                <span className="sm:hidden">Reset</span>
                            </>
                        )}
                    </Button>

                    <button
                        onClick={() => setCollapsed(true)}
                        className="text-slate-400 hover:text-white p-1 rounded transition"
                        title="Sembunyikan Banner"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
