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
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface PageProps {
    users: User[];
}

export default function Index() {
    const { users } = usePage<PageProps>().props;
    const currentUser = (usePage().props as { auth?: { user?: { id: number } } }).auth?.user;
    const [deleteDialog, setDeleteDialog] = useState<User | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!deleteDialog) return;

        setProcessing(true);
        router.delete(`/users/${deleteDialog.id}`, {
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
        <AppLayout>
            <Head title="Manajemen Pengguna" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground">Kelola akun pengguna dan role mereka</p>
                </div>
                <Button asChild>
                    <Link href="/users/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left text-sm font-medium">Nama</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                                >
                                                    {role.display_name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Tidak ada role
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/users/${user.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteDialog(user)}
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        Belum ada pengguna
                    </div>
                )}
            </div>

            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus pengguna "{deleteDialog?.name}"?
                            Tindakan ini tidak dapat dibatalkan.
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
        </AppLayout>
    );
}