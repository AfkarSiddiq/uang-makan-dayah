import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, WalletCards } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        // PERBAIKAN: Hapus 'hidden' dan 'md:grid'. Gunakan flex untuk mobile, dan lg:grid untuk desktop.
        <div className="relative flex min-h-screen flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Head title="Masuk Sistem" />

            {/* --- SISI KIRI: Branding & Visual --- */}
            {/* Hanya tampil di layar besar (lg:flex), sembunyi di HP (hidden) */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950" />
                
                <div className="relative z-20 flex items-center gap-3 text-lg font-bold tracking-tight">
                    <img src='/minhajussalam.png' className="h-8 w-8" />
                    <span className="text-emerald-100 tracking-wide">DAYAH PERBATASAN MINHAJUSSALAM</span>
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-amber-400/80 pl-4">
                        <p className="text-lg font-medium leading-relaxed text-emerald-50">
                            "Mengelola amanah dengan transparansi. Sistem ini dirancang untuk mempermudah pemantauan SPP, uang makan, dan administrasi santri secara akurat."
                        </p>
                        <footer className="text-sm text-amber-300/90 font-medium">Pusat Data & Informasi Dayah Perbatasan Minhajussalam</footer>
                    </blockquote>
                </div>
            </div>

            {/* --- SISI KANAN: Form Login --- */}
            {/* PERBAIKAN: Tambahkan padding untuk layar mobile (p-4 sm:p-8) dan w-full agar rata tengah */}
            <div className="flex w-full items-center justify-center p-4 sm:p-8 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    
                    {/* Header Form */}
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        {/* Munculkan logo di versi mobile karena sisi kiri hilang */}
                        <div className="mx-auto mb-4 flex items-center gap-2 text-lg font-bold tracking-tight lg:hidden">
                            <img src='/minhajussalam.png' className="h-8 w-8" />
                            <span className="text-emerald-800 dark:text-emerald-400 tracking-wide">MINHAJUSSALAM</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                            Selamat Datang Kembali
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan email dan kata sandi Anda untuk mengakses portal.
                        </p>
                    </div>

                    {status && (
                        <div className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-600 dark:bg-emerald-950/50">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-4">
                            
                            {/* Input Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@instansi.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Input Password */}
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                                <InputError message={errors.password} />
                            </div>
                        </div>

                        {/* Tombol Login */}
                        <Button disabled={processing} className="w-full h-11 text-base font-medium shadow-sm transition-all hover:shadow-md">
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {processing ? 'Memproses...' : 'Masuk ke Dasbor'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}