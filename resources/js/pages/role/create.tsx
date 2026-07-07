import { RoleForm } from '@/components/role-form';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Role', href: '/role' },
                { title: 'Tambah', href: '#' },
            ]}
        >
            <Head title="Tambah Role" />
            <RoleForm
                permissions={permissions}
                initial={{ name: '', display_name: '', description: '', is_default: false, permissions: [] }}
                title="Tambah Role"
                description="Buat role baru dan atur izin aksesnya"
                submitLabel="Simpan"
                submitUrl="/role"
                submitMethod="post"
            />
        </AppLayout>
    );
}
