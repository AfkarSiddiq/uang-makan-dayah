import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    is_default: boolean;
    users_count: number;
    permissions: { id: number; name: string; display_name: string; group: string }[];
}

interface PageProps {
    roles: Role[];
}

export default function Index() {
    const { roles } = usePage<PageProps>().props;
    const [deleteDialog, setDeleteDialog] = useState<Role | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!deleteDialog) return;

        setProcessing(true);
        router.delete(`/role/${deleteDialog.id}`, {
            onSuccess: () => {
                setDeleteDialog(null);
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Role', href: '/role' }]}>
            <Head title="Manajemen Role" />

            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Manajemen Role</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Kelola role dan izin akses pengguna</p>
                    </div>
                    <Button asChild className="w-full sm:w-auto h-11 sm:h-10 justify-center">
                        <Link href="/role/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Role
                        </Link>
                    </Button>
                </div>

                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-lg border bg-card p-4 space-y-3 shadow-xs">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">{role.display_name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                        <Link href={`/role/${role.id}/edit`}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setDeleteDialog(role)}
                                        disabled={role.users_count > 0}
                                    >
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                    </Button>
                                </div>
                            </div>

                            {role.description && (
                                <p className="text-xs text-muted-foreground">{role.description}</p>
                            )}

                            <div className="flex items-center justify-between border-t pt-2 dark:border-slate-800 text-xs">
                                <span className="text-muted-foreground">Pengguna: <strong className="text-foreground">{role.users_count}</strong></span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {role.permissions.slice(0, 2).map((perm) => (
                                        <span
                                            key={perm.id}
                                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px]"
                                        >
                                            {perm.display_name}
                                        </span>
                                    ))}
                                    {role.permissions.length > 2 && (
                                        <span className="text-[10px] text-muted-foreground">
                                            +{role.permissions.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground rounded-lg border bg-card">
                            Belum ada role
                        </div>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Nama Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Deskripsi</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Izin</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Pengguna</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.id} className="border-b">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{role.display_name}</div>
                                            <div className="text-sm text-muted-foreground">{role.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {role.description || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 3).map((perm) => (
                                                    <span
                                                        key={perm.id}
                                                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                                                    >
                                                        {perm.display_name}
                                                    </span>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +{role.permissions.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{role.users_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/role/${role.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteDialog(role)}
                                                    disabled={role.users_count > 0}
                                                >
                                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {roles.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            Belum ada role
                        </div>
                    )}
                </div>

                <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Role</DialogTitle>
                            <DialogDescription>
                                {(deleteDialog?.users_count ?? 0) > 0 ? (
                                    <span className="text-rose-500 font-medium">
                                        Role "{deleteDialog?.display_name}" tidak dapat dihapus karena masih digunakan oleh {deleteDialog?.users_count} pengguna.
                                    </span>
                                ) : (
                                    <span>
                                        Apakah Anda yakin ingin menghapus role "{deleteDialog?.display_name}"? Tindakan ini akan menghapus role secara permanen dan tidak dapat dibatalkan.
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing || (deleteDialog?.users_count ?? 0) > 0}
                            >
                                {processing ? 'Menghapus...' : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
