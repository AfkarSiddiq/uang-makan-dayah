import { RoleForm } from '@/components/role-form';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    is_default: boolean;
    permissions: { id: number; name: string; display_name: string; group: string }[];
}

interface PageProps {
    [key: string]: any;
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function Edit() {
    const { role, permissions } = usePage<PageProps>().props;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Role', href: '/role' },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${role.display_name}`} />
            <RoleForm
                permissions={permissions}
                initial={{
                    name: role.name,
                    display_name: role.display_name,
                    description: role.description || '',
                    is_default: role.is_default,
                    permissions: role.permissions.map((p) => p.id),
                }}
                title="Edit Role"
                description="Perbarui role dan izin akses"
                submitLabel="Simpan"
                submitUrl={`/role/${role.id}`}
                submitMethod="put"
            />
        </AppLayout>
    );
}
