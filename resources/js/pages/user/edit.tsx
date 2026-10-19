import { UserForm } from '@/components/user-form';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

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
    [key: string]: any;
    user: User;
    roles: Role[];
}

export default function Edit() {
    const { user, roles } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title={`Edit ${user.name}`} />
            <UserForm
                roles={roles}
                initial={{ name: user.name, email: user.email, roles: user.roles.map((r) => r.id) }}
                title="Edit Pengguna"
                description="Perbarui data pengguna"
                submitLabel="Simpan"
                submitUrl={`/users/${user.id}`}
                submitMethod="put"
                passwordRequired={false}
            />
        </AppLayout>
    );
}
