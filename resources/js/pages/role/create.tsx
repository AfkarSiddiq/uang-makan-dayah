import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
}

interface PageProps {
    permissions: Record<string, Permission[]>;
}

export default function Create() {
    const { permissions } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        display_name: '',
        description: '',
        is_default: false,
        permissions: [] as number[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const togglePermission = (id: number) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter((p) => p !== id)
                : [...prev.permissions, id],
        }));
    };

    const toggleGroup = (permIds: number[]) => {
        setForm((prev) => {
            const allSelected = permIds.every((id) => prev.permissions.includes(id));
            if (allSelected) {
                return { ...prev, permissions: prev.permissions.filter((p) => !permIds.includes(p)) };
            }
            return { ...prev, permissions: [...new Set([...prev.permissions, ...permIds])] };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/role', form, {
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
            <Head title="Tambah Role" />

            <Button variant="ghost" asChild>
                <Link href="/role">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Tambah Role</h1>
                <p className="text-muted-foreground">Buat role baru dan atur izin aksesnya</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-md border bg-card p-6 space-y-6 max-w-2xl">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Role *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh:bendahara"
                            />
                            {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display_name">Nama Tampilan *</Label>
                            <Input
                                id="display_name"
                                value={form.display_name}
                                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                                placeholder="Contoh: Bendahara"
                            />
                            {errors.display_name && <p className="text-sm text-rose-500">{errors.display_name}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Input
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Deskripsi role (opsional)"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_default"
                            checked={form.is_default}
                            onCheckedChange={(checked) => setForm({ ...form, is_default: checked })}
                        />
                        <Label htmlFor="is_default">Jadikan role default untuk pengguna baru</Label>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Izin Akses</h2>
                    <p className="text-sm text-muted-foreground">Pilih izin yang akan diberikan kepada role ini</p>

                    <div className="space-y-4">
                        {Object.entries(permissions).map(([group, perms]) => (
                            <div key={group} className="rounded-md border p-4 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`group-${group}`}
                                        checked={perms.every((p) => form.permissions.includes(p.id))}
                                        onChange={() => toggleGroup(perms.map((p) => p.id))}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor={`group-${group}`} className="font-medium cursor-pointer">
                                        {group}
                                    </Label>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2 pl-6">
                                    {perms.map((perm) => (
                                        <div key={perm.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`perm-${perm.id}`}
                                                checked={form.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer">
                                                {perm.display_name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/role">Batal</Link>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}