import AppLayout from '@/layouts/app-layout';
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

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface PageProps {
    user: User;
    roles: Role[];
}

export default function Edit() {
    const { user, roles } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles.map((r) => r.id),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(`/users/${user.id}`, form, {
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
        <AppLayout>
            <Head title={`Edit ${user.name}`} />

            <Button variant="ghost" asChild>
                <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Edit Pengguna</h1>
                <p className="text-muted-foreground">Perbarui data pengguna</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-md border bg-card p-6 space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password Baru</Label>
                    <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                    />
                    <p className="text-xs text-muted-foreground">
                        Minimal 8 karakter. Kosongkan jika tidak ingin mengubah password.
                    </p>
                    {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
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

                <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/users">Batal</Link>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}