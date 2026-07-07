import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
}

interface RoleFormProps {
    permissions: Record<string, Permission[]>;
    initial: {
        name: string;
        display_name: string;
        description: string;
        is_default: boolean;
        permissions: number[];
    };
    title: string;
    description: string;
    submitLabel: string;
    submitUrl: string;
    submitMethod: 'post' | 'put';
}

function RoleForm({ permissions, initial, title, description, submitLabel, submitUrl, submitMethod }: RoleFormProps) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState(initial);

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

        router[submitMethod](submitUrl, form, {
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
        <div className="mx-auto p-6">
            <BackButton href="/role">Role</BackButton>

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded-md border bg-card p-6">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Role *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: bendahara"
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
                            <div key={group} className="space-y-3 rounded-md border p-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`group-${group}`}
                                        checked={perms.every((p) => form.permissions.includes(p.id))}
                                        onChange={() => toggleGroup(perms.map((p) => p.id))}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor={`group-${group}`} className="cursor-pointer font-medium">
                                        {group}
                                    </Label>
                                </div>
                                <div className="grid gap-2 pl-6 md:grid-cols-2">
                                    {perms.map((perm) => (
                                        <div key={perm.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`perm-${perm.id}`}
                                                checked={form.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-sm">
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
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/role">Batal</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

export { RoleForm };
