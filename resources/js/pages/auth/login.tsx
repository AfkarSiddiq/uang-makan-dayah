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
        <div className="container relative hidden min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Head title="Masuk Sistem" />

            {/* --- SISI KIRI: Branding & Visual --- */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {/* Background Image / Warna */}
                <div className="absolute inset-0 bg-zinc-900" />
                
                {/* Logo Instansi */}
                <div className="relative z-20 flex items-center gap-2 text-lg font-bold tracking-tight">
                    <WalletCards className="h-6 w-6" />
                    Sistem Keuangan Terpadu
                </div>

                {/* Kutipan / Visi Misi */}
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            "Mengelola amanah dengan transparansi. Sistem ini dirancang untuk mempermudah pemantauan SPP, uang makan, dan administrasi santri secara akurat."
                        </p>
                        <footer className="text-sm text-zinc-400">Pusat Data & Informasi</footer>
                    </blockquote>
                </div>
            </div>

            {/* --- SISI KANAN: Form Login --- */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    
                    {/* Header Form */}
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Selamat Datang Kembali
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan email dan kata sandi Anda untuk mengakses portal.
                        </p>
                    </div>

                    {/* Alert Status (Jika ada pesan dari server) */}
                    {status && (
                        <div className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-600 dark:bg-emerald-950/50">
                            {status}
                        </div>
                    )}

                    {/* Form Utama */}
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
                                {/* <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div> */}
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

                            {/* Remember Me */}
                            {/* <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                >
                                    Ingat sesi saya
                                </Label>
                            </div> */}
                        </div>

                        {/* Tombol Login */}
                        <Button disabled={processing} className="w-full h-11 text-base font-medium shadow-sm transition-all hover:shadow-md">
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {processing ? 'Memproses...' : 'Masuk ke Dasbor'}
                        </Button>
                    </form>

                    {/* Footer / Info tambahan */}
                    {/* <p className="px-8 text-center text-sm text-muted-foreground">
                        Sistem dilindungi oleh enkripsi tingkat lanjut.{' '}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Ketentuan Layanan
                        </Link>
                    </p> */}
                </div>
            </div>
        </div>
    );
}