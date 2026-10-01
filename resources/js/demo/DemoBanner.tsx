import React, { useState } from 'react';
import { resetDb } from './demo-store';
import { RotateCcw, Sparkles, Check, ChevronUp, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoBanner() {
    const [collapsed, setCollapsed] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

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
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white px-4 py-2 text-xs border-b border-white/10 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Netlify Live Demo
                    </span>
                    <span className="hidden sm:inline text-slate-300">
                        Aplikasi berjalan 100% interaktif di browser. Semua fitur (tambah transaksi, filter tunggakan, edit data santri) dapat diuji coba.
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px] mr-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Login sebagai: <strong className="text-white">Admin Dayah</strong></span>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReset}
                        disabled={resetting}
                        className="h-7 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 transition"
                    >
                        {resetSuccess ? (
                            <>
                                <Check className="w-3 h-3 text-emerald-400 mr-1" />
                                Data Direset!
                            </>
                        ) : (
                            <>
                                <RotateCcw className={`w-3 h-3 mr-1 ${resetting ? 'animate-spin' : ''}`} />
                                Reset Data Demo
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
