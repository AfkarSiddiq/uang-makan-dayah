import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface PageProps {
    roles: Role[];
    flash?: { success?: string; error?: string };
}

export default function Create() {
    const { roles } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/users', form, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Tambah Pengguna" />

            <Button variant="ghost" asChild>
                <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <div className="max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight">Tambah Pengguna</h1>
                <p className="text-muted-foreground">Buat akun pengguna baru</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="nama@email.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Minimal 8 karakter"
                        />
                        {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                            placeholder="Ulangi password"
                        />
                    </div>

                    <div>
                        <Label>Role</Label>
                        <div className="mt-2 space-y-2">
                            {roles.map((role) => (
                                <label key={role.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={form.roles.includes(role.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setForm({ ...form, roles: [...form.roles, role.id] });
                                            } else {
                                                setForm({
                                                    ...form,
                                                    roles: form.roles.filter((r) => r !== role.id),
                                                });
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm">{role.display_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/users">Batal</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}
