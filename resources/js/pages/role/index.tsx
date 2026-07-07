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

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manajemen Role</h1>
                        <p className="text-muted-foreground">Kelola role dan izin akses pengguna</p>
                    </div>
                    <Button asChild>
                        <Link href="/role/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Role
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
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
                                Apakah Anda yakin ingin menghapus role "{deleteDialog?.display_name}"?
                                Role tidak dapat dihapus karena masih digunakan oleh{' '}
                                {deleteDialog?.users_count} pengguna.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing}
                            >
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
