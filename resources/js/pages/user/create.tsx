import { UserForm } from '@/components/user-form';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface PageProps {
    [key: string]: any;
    roles: Role[];
}

export default function Create() {
    const { roles } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Tambah Pengguna" />
            <UserForm
                roles={roles}
                initial={{ name: '', email: '', roles: [] }}
                title="Tambah Pengguna"
                description="Buat akun pengguna baru"
                submitLabel="Simpan"
                submitUrl="/users"
                submitMethod="post"
                passwordRequired
            />
        </AppLayout>
    );
}
