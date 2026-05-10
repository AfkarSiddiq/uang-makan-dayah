import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    flash?: { success?: string; error?: string };
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
        <div className="space-y-6">
            <Head title="Manajemen Role" />

            <div className="flex items-center justify-between">
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{role.display_name}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {role.name}
                                    </CardDescription>
                                </div>
                                {role.is_default && (
                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        Default
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {role.description || 'Tidak ada deskripsi'}
                            </p>

                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 5).map((perm) => (
                                    <span
                                        key={perm.id}
                                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                                    >
                                        {perm.display_name}
                                    </span>
                                ))}
                                {role.permissions.length > 5 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{role.permissions.length - 5} lainnya
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">
                                    {role.users_count} pengguna
                                </span>
                                <div className="flex gap-1">
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
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Role</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus role "{deleteDialog?.display_name}"?
                            Role ini tidak dapat dihapus karena masih digunakan oleh{' '}
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
    );
}
