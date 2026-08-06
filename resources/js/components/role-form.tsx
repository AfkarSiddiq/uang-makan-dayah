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
        <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
            <BackButton href="/role">Role</BackButton>

            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs sm:text-sm">Nama Role *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: bendahara"
                                className="h-11 sm:h-10 w-full"
                            />
                            {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display_name" className="text-xs sm:text-sm">Nama Tampilan *</Label>
                            <Input
                                id="display_name"
                                value={form.display_name}
                                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                                placeholder="Contoh: Bendahara"
                                className="h-11 sm:h-10 w-full"
                            />
                            {errors.display_name && <p className="text-sm text-rose-500">{errors.display_name}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs sm:text-sm">Deskripsi</Label>
                        <Input
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Deskripsi role (opsional)"
                            className="h-11 sm:h-10 w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                        <Switch
                            id="is_default"
                            checked={form.is_default}
                            onCheckedChange={(checked) => setForm({ ...form, is_default: checked })}
                        />
                        <Label htmlFor="is_default" className="text-xs sm:text-sm cursor-pointer select-none">Jadikan role default untuk pengguna baru</Label>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4 dark:border-slate-800">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold">Izin Akses</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pilih izin yang akan diberikan kepada role ini</p>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(permissions).map(([group, perms]) => (
                            <div key={group} className="space-y-3 rounded-lg border p-3.5 sm:p-4 bg-muted/20">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`group-${group}`}
                                        checked={perms.every((p) => form.permissions.includes(p.id))}
                                        onChange={() => toggleGroup(perms.map((p) => p.id))}
                                        className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                                    />
                                    <Label htmlFor={`group-${group}`} className="cursor-pointer font-semibold text-xs sm:text-sm text-foreground">
                                        {group}
                                    </Label>
                                </div>
                                <div className="grid grid-cols-1 gap-2 pl-6 sm:grid-cols-2">
                                    {perms.map((perm) => (
                                        <div key={perm.id} className="flex items-center space-x-2 py-0.5">
                                            <input
                                                type="checkbox"
                                                id={`perm-${perm.id}`}
                                                checked={form.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                                            />
                                            <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                                                {perm.display_name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2.5 pt-4 sm:flex-row sm:gap-3 border-t border-border dark:border-slate-800">
                    <Button type="button" variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-10">
                        <Link href="/role">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="w-full sm:w-auto h-11 sm:h-10">
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export { RoleForm };
